#include <ESP8266WiFi.h>
#include <WiFiClient.h>

// Replace with your network credentials
const char* ssid = "realme";
const char* password = "suyash613";

// Server details
const char* host = "www.google.com";
const int httpPort = 80; // HTTP port

void setup() {
  Serial.begin(115200);
  delay(10);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");
}

void loop() {
  
}

