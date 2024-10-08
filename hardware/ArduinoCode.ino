#include <SoftwareSerial.h>
#include <DHT.h>

#define DHTPIN 7
#define DHTTYPE DHT22

DHT dht(DHTPIN,DHTTYPE);
SoftwareSerial espSerial(2, 3); // RX, TX

void setup() {
    Serial.begin(9600);        // Serial monitor
    espSerial.begin(9600); 
    dht.begin();    // ESP8266 serial communication
}

void loop() {
    // Check for incoming data from ESP8266
    if (Serial.available()) {
        String receivedData = Serial.readStringUntil("/n");
        Serial.println("Received from ESP8266: " + receivedData);
        
    }else{
      Serial.println("no data recieved");
    }
  float temperature = dht.readTemperature();
  
  // Check if any reads failed and exit early (to try again).
  if (isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }
  Serial.println(temperature, 2);
  delay(2000);// Send data every 2 seconds
}
