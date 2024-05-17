#include <Arduino.h>
#include <WebServer.h>
#include <WiFi.h>
#include <esp32cam.h>
#define led1 14
#define led2 15
#define lock 13

const char* WIFI_SSID = "Vux";
const char* WIFI_PASS = "opal1234";


WebServer server(80);

static auto loRes = esp32cam::Resolution::find(320, 240);
static auto midRes = esp32cam::Resolution::find(350, 530);
static auto hiRes = esp32cam::Resolution::find(800, 600);

void serveJpg()
{
  auto frame = esp32cam::capture();
  if (frame == nullptr) {
    Serial.println("CAPTURE FAIL");
    server.send(503, "", "");
    return;
  }
  Serial.printf("CAPTURE OK %dx%d %db\n", frame->getWidth(), frame->getHeight(),
                static_cast<int>(frame->size()));

  server.setContentLength(frame->size());
  server.send(200, "image/jpeg");
  WiFiClient client = server.client();
  frame->writeTo(client);
}

void handleJpgLo()
{
  if (!esp32cam::Camera.changeResolution(loRes)) {
    Serial.println("SET-LO-RES FAIL");
  }
  serveJpg();
}

void handleJpgHi()
{
  if (!esp32cam::Camera.changeResolution(hiRes)) {
    Serial.println("SET-HI-RES FAIL");
  }
  serveJpg();
}

void handleJpgMid()
{
  if (!esp32cam::Camera.changeResolution(midRes)) {
    Serial.println("SET-MID-RES FAIL");
  }
  serveJpg();
}

void handleSignal() {
  // Handle the signal received from the Python script
  String signal = server.arg("plain");  
  // Convert the received string to an integer
  int signalValue = signal.toInt();
  Serial.println("Received Signal: " + signal);

 if(signalValue == 1)
 {
  Serial.println("Ino received 1 - Intruder!");
  digitalWrite(lock, HIGH);
  digitalWrite(led1, HIGH);
  digitalWrite(led2, LOW);
  delay(5000);
  digitalWrite(lock, HIGH);
 }
 else if(signalValue == 0)
 {
  Serial.println("Ino received 0 - User!");
  digitalWrite(lock, LOW);
   digitalWrite(led1, LOW);
  digitalWrite(led2, HIGH);
  delay(5000);   
  digitalWrite(led2, LOW);
  digitalWrite(led1,HIGH);
 if(signalValue == 1)
 {
  Serial.println("Ino received 1 - Intruder!");
  digitalWrite(lock, HIGH);
  digitalWrite(led1, HIGH);
  digitalWrite(led2, LOW);
  delay(5000);
  digitalWrite(lock, HIGH);
  digitalWrite(led1,HIGH);
 }
 }
}

void setup()
{
  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);
  pinMode(lock, OUTPUT);
  Serial.begin(115200);
  
  {
    using namespace esp32cam;
    Config cfg;
    cfg.setPins(pins::AiThinker);
    cfg.setResolution(hiRes);
    cfg.setBufferCount(2);
    cfg.setJpeg(80);

    bool ok = Camera.begin(cfg);
    Serial.println(ok ? "CAMERA OK" : "CAMERA FAIL");
  }
  WiFi.persistent(false);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
  Serial.print("http://");
  Serial.println(WiFi.localIP());
  Serial.println("  /cam-lo.jpg");
  Serial.println("  /cam-hi.jpg");
  Serial.println("  /cam-mid.jpg");

  server.on("/cam-lo.jpg", handleJpgLo);
  server.on("/cam-hi.jpg", handleJpgHi);
  server.on("/cam-mid.jpg", handleJpgMid);
  server.on("/signal", HTTP_POST, handleSignal); // Handle signal reception
  server.begin();
}

void loop()
{
    digitalWrite(lock, HIGH);
  server.handleClient();
}
