#include <Arduino.h>
#if defined(ESP32) || defined(ARDUINO_RASPBERRY_PI_PICO_W)
#include <WiFi.h>
#elif defined(ESP8266)
#include <ESP8266WiFi.h>
#endif

#include <FirebaseClient.h>
#include <WiFiClientSecure.h>

#define WIFI_SSID "ssid"
#define WIFI_PASSWORD "password"
#define DATABASE_SECRET "your_api_key"
#define DATABASE_URL "firebase_url"

WiFiClientSecure ssl;
DefaultNetwork network;
AsyncClientClass client(ssl, getNetwork(network));

FirebaseApp app;
RealtimeDatabase Database;
AsyncResult result;
LegacyToken dbSecret(DATABASE_SECRET);

void printError(int code, const String &msg) {
    Serial.printf("Error, msg: %s, code: %d\n", msg.c_str(), code);
}

void connectToWiFi() {
    Serial.println("Connecting to Wi-Fi...");
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    unsigned long startAttemptTime = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 15000) {
        Serial.print(".");
        yield(); // Allow watchdog timer to reset
    }
    
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("Failed to connect to Wi-Fi");
        return;
    }
    
    Serial.println();
    Serial.print("Connected with IP: ");
    Serial.println(WiFi.localIP());
}

void setup() {
    Serial.begin(9600);
    connectToWiFi();

    ssl.setInsecure();
    Serial.println("Initializing Firebase...");
    initializeApp(client, app, getAuth(dbSecret));

    if (client.lastError().code() != 0) {
        Serial.print("Firebase Initialization Error: ");
        printError(client.lastError().code(), client.lastError().message());
        return;
    }

    Serial.println("Firebase Initialized Successfully");
    app.getApp<RealtimeDatabase>(Database);
    Database.url(DATABASE_URL);
    client.setAsyncResult(result);
}

void loop() {
    // Check for incoming serial data from Arduino
    if (Serial.available()) {
        String receivedData = Serial.readStringUntil('\n');
        float temperature = receivedData.toFloat(); // Convert string to float
        String path = "/temperature"; // Path where the temperature will be stored

        // Send temperature to Firebase
        if (Database.set<float>(client, path, temperature)) {
            Serial.printf("Temperature sent: %f\n", temperature);
        } else {
            printError(client.lastError().code(), client.lastError().message());
        }
    } else {
        Serial.print("..."); // Optional: print dots to indicate waiting for data
    }

    // Retrieve the status from Firebase
    if (Database.get<int>(client, "/status")) {
        int status = result.value<int>();
        Serial.printf("Status: %d\n", status);
    } else {
        printError(client.lastError().code(), client.lastError().message());
    }

    delay(1000); // Delay for a second before checking again
}
