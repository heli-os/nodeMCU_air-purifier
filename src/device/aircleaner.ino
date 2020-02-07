#include <WiFi.h>
#include <Adafruit_NeoPixel.h>
#include <SoftwareSerial.h>
#include <PMS.h>
#include <ArduinoHttpClient.h>

char deviceID[15]; //Create a Unique AP from MAC address

const char* ssid     = "Jinssssun";
const char* password = "cf4c9zukj7irr";

#define PIN 25
#define NUM_LEDS 8
Adafruit_NeoPixel strip = Adafruit_NeoPixel(NUM_LEDS, PIN, NEO_GRB + NEO_KHZ800);

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

unsigned int value_pm1_0;
unsigned int value_pm2_5;
unsigned int value_pm10_0;

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

  //  strip.begin();
  //  strip.show();

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
      if (timerNow - timerBefore >= PMS_READ_GAP) {
        timerBefore = timerNow;
        readData();
        renderData();
        uploadData();
      }
    }

}

void createDeviceID() {
  uint64_t chipid = ESP.getEfuseMac(); //The chip ID is essentially its MAC address(length: 6 bytes).
  uint16_t chip = (uint16_t)(chipid >> 32);
  snprintf(deviceID, 15, "LoRaHam-%04X", chip);
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
    delay(2000);
    digitalWrite(2, LOW);
    delay(2000);
    value_pm1_0 = data.PM_AE_UG_1_0;
    value_pm2_5 = data.PM_AE_UG_2_5;
    value_pm10_0 = data.PM_AE_UG_10_0;
  } else {
    DEBUG_OUT.println("No data.");
  }
}
void renderData() {
  DEBUG_OUT.println();
  DEBUG_OUT.print("PM 1.0 (ug/m3): ");
  DEBUG_OUT.println(value_pm1_0);

  DEBUG_OUT.print("PM 2.5 (ug/m3): ");
  DEBUG_OUT.println(value_pm2_5);

  DEBUG_OUT.print("PM 10.0 (ug/m3): ");
  DEBUG_OUT.println(value_pm10_0);

  DEBUG_OUT.println();
}

//https://genie.jupiterflow.com/device/data/upload
void uploadData() {

  if (WiFi.status() == WL_CONNECTED) { //Check WiFi connection status
    char bodyData[100] = {0,};
    sprintf(bodyData, "device=%s&pm1_0=%d&pm2_5=%d&pm10_0=%d", deviceID, value_pm1_0, value_pm2_5, value_pm10_0);
    //sprintf(bodyData, "{\"device\":\"%s\",\"pm1_0\":\"%d\",\"pm2_5\":\"%d\",\"pm10_0\":\"%d\"}", deviceID, value_pm1_0, value_pm2_5, value_pm10_0);

    DEBUG_OUT.printf("bodyData:%s\r\n",bodyData);
    client.post("/device/data/upload","application/x-www-form-urlencoded",bodyData);
    DEBUG_OUT.println("post success");

    // read the status code and body of the response
    int statusCode = client.responseStatusCode();
    DEBUG_OUT.println(statusCode);
    String response = client.responseBody();

    DEBUG_OUT.print("Status code: ");
    DEBUG_OUT.println(statusCode);
    DEBUG_OUT.print("Response: ");
    DEBUG_OUT.println(response);


//    DEBUG_OUT.println("Wait five seconds");
//    delay(5000);
  } else {
    DEBUG_OUT.println("Error in WiFi connection");
  }
}
//NeoPixel에 달린 LED를 각각 주어진 인자값 색으로 채워나가는 함수
void colorWipe(uint32_t c, uint8_t wait) {
  for (uint16_t i = 0; i < strip.numPixels(); i++) {
    strip.setPixelColor(i, c);
    strip.show();
    delay(wait);
  }
}
