#include <WiFi.h>
#include <Adafruit_NeoPixel.h>
#include <SoftwareSerial.h>
#include <PMS.h>
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
static const uint32_t PMS_READ_GAP = 3000; // 측정간격 (1 sec)

// 전역변수 선언
uint8_t cycles = 0; // 반복측정 횟수
bool PMS_POWER = false; // PMS7003센서의 동작상태

void setup()
{
  DEBUG_OUT.begin(115200); // 디버깅용
  mySerial.begin(PMS::BAUD_RATE);

  pinMode(2, OUTPUT);
  pinMode(26, OUTPUT);

  delay(10);

  // We start by connecting to a WiFi network

  //  Serial.println();
  //  Serial.println();
  //  Serial.print("Connecting to ");
  //  Serial.println(ssid);
  //
  //  WiFi.begin(ssid, password);
  //
  //  while (WiFi.status() != WL_CONNECTED) {
  //    delay(500);
  //    Serial.print(".");
  //  }
  //
  //  Serial.println("");
  //  Serial.println("WiFi connected.");
  //  Serial.println("IP address: ");
  //  Serial.println(WiFi.localIP());
  //  strip.begin();
  //  strip.show();
  //
  // 패시브모드로 변경 후 센서 대기상태로 설정
  pms.passiveMode();
  pms.sleep();
  DEBUG_OUT.println("반복측정 횟수를 입력하세요.");
}

void loop() {
  //  digitalWrite(2, HIGH);
  //  digitalWrite(26, HIGH);
  //  colorWipe(strip.Color(255, 0, 0), 50); //빨간색 출력
  //  colorWipe(strip.Color(0, 255, 0), 50); //녹색 출력
  //  colorWipe(strip.Color(0, 0, 255), 50); //파란색 출력
  //  delay(5000);
  //  digitalWrite(2, LOW);
  //  digitalWrite(26, LOW);
  //  delay(5000);

  // 센서동작여부를 판단에 사용할 타이머 변수
  static uint32_t timerLast = 0; // 센서부팅시작시간 (값이 유지되도록 정적변수 사용)
  static uint32_t timerBefore = 0; // 직전측정시간

  // 시리얼모니터로 값을 입력받아 입력받은 값을 cycles 변수에 할당
//  if (DEBUG_OUT.available()) {
//
//  }
  cycles = 100;
  DEBUG_OUT.print(cycles);
  // 측정요청이 있으면 센서를 깨우고 깨운 시간을 기억
  if (!PMS_POWER && cycles > 0) {
    DEBUG_OUT.println("Waking up.");
    pms.wakeUp();
    timerLast = millis();
    PMS_POWER = true;
  }
  // 입력받은 cycles 수만큼 측정
  // 센서가 깨어나고나서 최소대기상태를 지났을 때만 측정간격을 두고 측정 실시
  while (cycles > 0) {
    uint32_t timerNow = millis();
    if (timerNow - timerLast >= PMS_READ_DELAY) {
      if (timerNow - timerBefore >= PMS_READ_GAP) {
        timerBefore = timerNow;
        readData();
        cycles--;
      }
    }
  }
  // 측정이 끝나면 cycles 변수는 0이되었기 때문에 센서를 대기모드로 바꾸고 다음 측정요청을 대기
  if (PMS_POWER && cycles == 0) {
    DEBUG_OUT.println("Going to sleep.");
    DEBUG_OUT.println("반복측정 횟수를 입력하세요.");
    pms.sleep();
    PMS_POWER = false;
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
    delay(2000);
    digitalWrite(2, LOW);
    delay(2000);
    DEBUG_OUT.println();
    DEBUG_OUT.print("PM 1.0 (ug/m3): ");
    DEBUG_OUT.println(data.PM_AE_UG_1_0);

    DEBUG_OUT.print("PM 2.5 (ug/m3): ");
    DEBUG_OUT.println(data.PM_AE_UG_2_5);

    DEBUG_OUT.print("PM 10.0 (ug/m3): ");
    DEBUG_OUT.println(data.PM_AE_UG_10_0);

    DEBUG_OUT.println();
  } else {
    DEBUG_OUT.println("No data.");
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
