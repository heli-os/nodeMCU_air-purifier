#include <WiFi.h>
#include <Adafruit_NeoPixel.h>
#include <SoftwareSerial.h>
#include <PMS.h>
#include <ArduinoHttpClient.h>
#include <ArduinoJson.h>

char deviceID[15]; //Create a Unique AP from MAC address

const char* ssid     = "JupiterFlow";
const char* password = "cf4c9zukj7irr";
//const char* ssid     = "olleh_WiFi_BBCC";
//const char* ssid = "olleh_GiGA_WiFi_BBCC";
//const char* password = "0000001840 ";

#define PIN 25
#define NUM_LEDS 8
Adafruit_NeoPixel strip = Adafruit_NeoPixel(NUM_LEDS, PIN, NEO_GRB + NEO_KHZ800);
const uint32_t colorStep[8] = {
  strip.Color(28, 117, 211), // 최고 좋음
  strip.Color(1, 156, 228),  // 좋음
  strip.Color(0, 173, 196),  // 양호
  strip.Color(0, 255, 0),  // 보통
  strip.Color(251, 140, 0),  // 나쁨
  strip.Color(230, 74, 25),  // 상당히 나쁨
  strip.Color(213, 47, 47),  // 매우 나쁨
  strip.Color(33, 33, 33)   // 최악
};

#define DEBUG_OUT Serial

// 소프트웨어시리얼 포트를 설정하고 PMS7003센서 통신용으로 연결
#define SoftRX 3
#define SoftTX 1
SoftwareSerial mySerial(SoftRX, SoftTX);
PMS pms(mySerial);

// 측정 간격 설정
// :::|------|------|------|::::::::::|------|------|------|:::::::::::
//     ↑      ↑      ↑            ↑               ↑
//    요청   측정    측정    다음요청시까지_대기   측정간격(차수내)
static const uint32_t PMS_READ_DELAY = 30000; // 센서 부팅후 대기시간 (30 sec)
static uint32_t PMS_READ_GAP = 5000; // 측정간격 (5 sec)

short pm10_0_value = 0;
short pm10_0_step = 0;
short pm2_5_value = 0;
short pm2_5_step = 0;
short pm1_0_value = 0;
short pm1_0_step = 0;

short modeLED = 0;
short modePower = 0;


// 전역변수 선언
bool PMS_POWER = false; // PMS7003센서의 동작상태

char serverAddress[] = "genie.jupiterflow.com";  // server address
int port = 80;

WiFiClient wifi;
HttpClient client = HttpClient(wifi, serverAddress, port);
void setup()
{
  DEBUG_OUT.begin(115200); // 디버깅용
  mySerial.begin(PMS::BAUD_RATE);

  pinMode(2, OUTPUT);
  pinMode(26, OUTPUT);


  delay(10);

  createDeviceID();

  // We start by connecting to a WiFi network
  DEBUG_OUT.println();
  DEBUG_OUT.println();
  DEBUG_OUT.print("Connecting to ");
  DEBUG_OUT.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(2, HIGH);
    delay(500);
    DEBUG_OUT.print(".");
    digitalWrite(2, LOW);
    delay(500);
  }

  DEBUG_OUT.println("");
  DEBUG_OUT.println("WiFi connected.");
  DEBUG_OUT.println("IP address: ");
  DEBUG_OUT.println(WiFi.localIP());

  strip.begin();
  strip.show();

  // 패시브모드로 변경 후 센서 대기상태로 설정
  pms.passiveMode();
  pms.sleep();
}

void loop() {
  // 센서동작여부를 판단에 사용할 타이머 변수
  static uint32_t timerLast = 0; // 센서부팅시작시간 (값이 유지되도록 정적변수 사용)
  static uint32_t timerBefore = 0; // 직전측정시간

  // 측정요청이 있으면 센서를 깨우고 깨운 시간을 기억
  if (!PMS_POWER) {
    DEBUG_OUT.println("Waking up.");
    pms.wakeUp();
    timerLast = millis();
    PMS_POWER = true;
  }

  // 센서가 깨어나고나서 최소대기상태를 지났을 때만 측정간격을 두고 측정 실시
  uint32_t timerNow = millis();
  if (timerNow - timerLast >= PMS_READ_DELAY) {
    readSetting();
    if (timerNow - timerBefore >= PMS_READ_GAP) {
      timerBefore = timerNow;
      readData();
      convertValueToStep();
      renderData();
      uploadData();
      if (modePower == 0) {
        turnOnLED();
        digitalWrite(26, HIGH);
      } else if (modePower == 1) {
        setColor(strip.Color(0, 0, 0));
        digitalWrite(26, HIGH);
      } else if (modePower == 2) {
        setColor(strip.Color(0, 0, 0));
        digitalWrite(26, LOW);
      }
    }
  }
}

void turnOnLED() {
  short stepLED = 0;
  switch (modeLED) {
    case 0:
      stepLED = (pm10_0_step + pm2_5_step + pm1_0_step) / 3;
      break;
    case 1:
      stepLED = pm10_0_step;
      break;
    case 2:
      stepLED = pm2_5_step;
      break;
    case 3:
      stepLED = pm1_0_step;
      break;
  }
  DEBUG_OUT.printf("stepLED:%d\r\n", stepLED);
  setColor(colorStep[stepLED]);
}

void createDeviceID() {
  uint64_t chipid = ESP.getEfuseMac(); //The chip ID is essentially its MAC address(length: 6 bytes).
  uint16_t chip = (uint16_t)(chipid >> 32);
  snprintf(deviceID, 15, "LoRaHam-%04X", chip);
}

void convertValueToStep() {
  // PM10.0(미세먼지)
  if (pm10_0_value <= 15) {
    pm10_0_step = 0;
  } else if (pm10_0_value <= 30) {
    pm10_0_step = 1;
  } else if (pm10_0_value <= 40) {
    pm10_0_step = 2;
  } else if (pm10_0_value <= 50) {
    pm10_0_step = 3;
  } else if (pm10_0_value <= 75) {
    pm10_0_step = 4;
  } else if (pm10_0_value <= 100) {
    pm10_0_step = 5;
  } else if (pm10_0_value <= 150) {
    pm10_0_step = 6;
  } else {
    pm10_0_step = 7;
  }

  // PM2.5(초미세먼지)
  if (pm2_5_value <= 8) {
    pm2_5_step = 0;
  } else if (pm2_5_value <= 15) {
    pm2_5_step = 1;
  } else if (pm2_5_value <= 20) {
    pm2_5_step = 2;
  } else if (pm2_5_value <= 25) {
    pm2_5_step = 3;
  } else if (pm2_5_value <= 37) {
    pm2_5_step = 4;
  } else if (pm2_5_value <= 50) {
    pm2_5_step = 5;
  } else if (pm2_5_value <= 75) {
    pm2_5_step = 6;
  } else {
    pm2_5_step = 7;
  }


  // PM1.0(극미세먼지)
  if (pm1_0_value <= 4) {
    pm1_0_step = 0;
  } else if (pm1_0_value <= 8) {
    pm1_0_step = 1;
  } else if (pm1_0_value <= 12) {
    pm1_0_step = 2;
  } else if (pm1_0_value <= 17) {
    pm1_0_step = 3;
  } else if (pm1_0_value <= 22) {
    pm1_0_step = 4;
  } else if (pm1_0_value <= 30) {
    pm1_0_step = 5;
  } else if (pm1_0_value <= 50) {
    pm1_0_step = 6;
  } else {
    pm1_0_step = 7;
  }
}

void readSetting() {
  if (WiFi.status() == WL_CONNECTED) { //Check WiFi connection status
    String contentType = "application/x-www-form-urlencoded";
    char bodyData[50] = {0,};
    sprintf(bodyData, "device=%s", deviceID);

    DEBUG_OUT.printf("readSetting() => bodyData:%s\r\n", bodyData);
    client.post("/device/setting/download", contentType, bodyData);
    DEBUG_OUT.println("post success");

    // read the status code and body of the response
    int statusCode = client.responseStatusCode();
    DEBUG_OUT.println(statusCode);
    String responseBody = client.responseBody();
    DEBUG_OUT.println(responseBody);
    
    StaticJsonDocument<200> doc;

    DeserializationError error = deserializeJson(doc, responseBody);
    if (error) {
      DEBUG_OUT.print(F("deserializeJson() failed: "));
      DEBUG_OUT.println(error.c_str());
      return;
    }

    modeLED = doc["data"]["modeLED"];
    modePower = doc["data"]["modePower"];
    PMS_READ_GAP = doc["data"]["delayUpload"];

    DEBUG_OUT.printf("modeLED:%d, modePower:%d, delay:%d\r\n", modeLED, modePower, PMS_READ_GAP);


  } else {
    DEBUG_OUT.println("Error in WiFi connection");
  }
}

// PMS7003센서에 측정요청을 하고 데이터를 읽어와서 시리얼 화면에 표시하는 함수
void readData() {
  PMS::DATA data;
  // Clear buffer (removes potentially old data) before read. Some data could have been also sent before switching to passive mode.
  while (DEBUG_OUT.available()) {
    DEBUG_OUT.read();
  }
  DEBUG_OUT.println("Send read request...");
  pms.requestRead();
  DEBUG_OUT.println("Reading data...");
  if (pms.readUntil(data)) {
    digitalWrite(2, HIGH);
    delay(500);
    digitalWrite(2, LOW);
    delay(500);
    pm1_0_value = data.PM_AE_UG_1_0;
    pm2_5_value = data.PM_AE_UG_2_5;
    pm10_0_value = data.PM_AE_UG_10_0;
  } else {
    DEBUG_OUT.println("No data.");
  }
}
void renderData() {
  DEBUG_OUT.println();

  DEBUG_OUT.printf("PM 1.0 (ug/m3): %d - %d\r\n", pm1_0_value, pm1_0_step);
  DEBUG_OUT.printf("PM 2.5 (ug/m3): %d - %d\r\n", pm2_5_value, pm2_5_step);
  DEBUG_OUT.printf("PM 10.0 (ug/m3): %d - %d\r\n", pm10_0_value, pm10_0_step);

  DEBUG_OUT.println();
}

//https://genie.jupiterflow.com/device/data/upload
void uploadData() {

  if (WiFi.status() == WL_CONNECTED) { //Check WiFi connection status
    String contentType = "application/x-www-form-urlencoded";
    char bodyData[150] = {0,};
    sprintf(bodyData, "device=%s&pm1_0_value=%d&pm1_0_step=%d&pm2_5_value=%d&pm2_5_step=%d&pm10_0_value=%d&pm10_0_step=%d", deviceID, pm1_0_value, pm1_0_step, pm2_5_value, pm2_5_step, pm10_0_value, pm10_0_step);

    DEBUG_OUT.printf("uploadData()=> bodyData:%s\r\n", bodyData);
    client.post("/device/data/upload", contentType, bodyData);
    DEBUG_OUT.println("post success");

    // read the status code and body of the response
    int statusCode = client.responseStatusCode();
    DEBUG_OUT.println(statusCode);
    String responseBody = client.responseBody();
    DEBUG_OUT.println(responseBody);

    if (statusCode != 200) {
      delay(5000);
      uploadData();
    }
  } else {
    DEBUG_OUT.println("Error in WiFi connection");
  }
}

void setColor(uint32_t c) {
  for (uint16_t i = 0; i < strip.numPixels(); i++) {
    strip.setPixelColor(i, c);
  }
  strip.show();
}
