#include <WiFi.h>
#include <Adafruit_NeoPixel.h>
#include <SoftwareSerial.h>

const char* ssid     = "Jinssssun";
const char* password = "cf4c9zukj7irr";

#define PIN 25

#define NUM_LEDS 8
Adafruit_NeoPixel strip = Adafruit_NeoPixel(NUM_LEDS, PIN, NEO_GRB + NEO_KHZ800);
//int i = 0;

//SoftwareSerial mySerial(12, 13);

void setup()
{
  Serial.begin(115200);
  pinMode(2, OUTPUT);
  pinMode(26, OUTPUT);

  //  mySerial.begin(9600);

  delay(10);

  // We start by connecting to a WiFi network

  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected.");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  strip.begin();
  strip.show();
}

void loop() {
  digitalWrite(2, HIGH);
  digitalWrite(26, HIGH);
  colorWipe(strip.Color(255, 0, 0), 50); //빨간색 출력
  colorWipe(strip.Color(0, 255, 0), 50); //녹색 출력
  colorWipe(strip.Color(0, 0, 255), 50); //파란색 출력
  delay(5000);
  digitalWrite(2, LOW);
  digitalWrite(26, LOW);
  delay(5000);



  //  static int CheckFirst = 0;
  //  static int pm_add[3][5] = {0,};
  //  static int pm_old[3] = {0,};
  //  int chksum = 0, res = 0;;
  //  unsigned char pms[32] = {0,};
  //
  //
  //  if (mySerial.available() >= 32) {
  //
  //    for (int j = 0; j < 32 ; j++) {
  //      pms[j] = mySerial.read();
  //      if (j < 30)
  //        chksum += pms[j];
  //    }
  //
  //    if (pms[30] != (unsigned char)(chksum >> 8)
  //        || pms[31] != (unsigned char)(chksum) ) {
  //      Serial.print(res);
  //    }
  //    if (pms[0] != 0x42 || pms[1] != 0x4d )
  //      Serial.print(res);
  //
  //    Serial.print("Dust raw data debugging :  ");
  //    Serial.print("1.0ug/m3:");
  //    Serial.print(pms[10]);
  //    Serial.print(pms[11]);
  //    Serial.print("  ");
  //    Serial.print("2.5ug/m3:");
  //    Serial.print(pms[12]);
  //    Serial.print(pms[13]);
  //    Serial.print("  ");
  //    Serial.print("2.5ug/m3:");
  //    Serial.print(pms[14]);
  //    Serial.println(pms[15]);
  //
  //  }
}

//NeoPixel에 달린 LED를 각각 주어진 인자값 색으로 채워나가는 함수
void colorWipe(uint32_t c, uint8_t wait) {
  for (uint16_t i = 0; i < strip.numPixels(); i++) {
    strip.setPixelColor(i, c);
    strip.show();
    delay(wait);
  }
}
