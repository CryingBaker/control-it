#include< Arduino.h>
#if defined(ESP32) || defined(ARDUINO_RASPBERRY_PI_PICO_W)
#include <WiFi.h>
#elif defined(ESP8266)
#include <ESP8266WiFi.h>
#endif

#include <FirebaseClient.h>
#include <WiFiClientSecure.h>

#define WIFI_SSID "WIFI_AP"
#define WIFI_PASSWORD "WIFI_PASSWORD"

#define DATABASE_SECRET "DATABASE_SECRET"
#define DATABASE_URL "URL"

WiFiClientSecure ssl;
DefaultNetwork network;
AsyncClientClass client(ssl, getNetwork(network));

FirebaseApp app;
RealtimeDatabase Database;
AsyncResult result;
LegacyToken dbSecret(DATABASE_SECRET);

void printError(int code, const String &msg)
{
    Firebase.printf("Error, msg: %s, code: %d\n", msg.c_str(), code);
}

void setup()
{

    Serial.begin(115200);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    Serial.print("Connecting to Wi-Fi");
    while (WiFi.status() != WL_CONNECTED)
    {
        Serial.print(".");
        delay(300);
    }
    Serial.println();
    Serial.print("Connected with IP: ");
    Serial.println(WiFi.localIP());
    Serial.println();

    Firebase.printf("Firebase Client v%s\n", FIREBASE_CLIENT_VERSION);

    ssl.setInsecure();
#if defined(ESP8266)
    ssl.setBufferSizes(1024, 1024);
#endif

    // Initialize the authentication handler.
    initializeApp(client, app, getAuth(dbSecret));

    // Binding the authentication handler with your Database class object.
    app.getApp<RealtimeDatabase>(Database);

    // Set your database URL
    Database.url(DATABASE_URL);

    // In sync functions, we have to set the operating result for the client that works with the function.
    client.setAsyncResult(result);

    // Set, push and get integer value

    Serial.print("Set int... ");
    bool status = Database.set<int>(client, "/test/int", 12345);
    if (status)
        Serial.println("ok");
    else
        printError(client.lastError().code(), client.lastError().message());

    Serial.print("Push int... ");
    String name = Database.push<int>(client, "/test/push", 12345);
    if (client.lastError().code() == 0)
        Firebase.printf("ok, name: %s\n", name.c_str());
    else
        printError(client.lastError().code(), client.lastError().message());

    Serial.print("Get int... ");
    int v1 = Database.get<int>(client, "/test/int");
    if (client.lastError().code() == 0)
        Serial.println(v1);
    else
        printError(client.lastError().code(), client.lastError().message());

    // Set, push and get Boolean value

}

void loop()
{
    // We don't need to poll the async task using Database.loop(); as in the Stream examples because 
    // only blocking (sync) functions were used in this example.

    // We don't have to poll authentication handler task using app.loop() as seen in other examples
    // because the database secret is the priviledge access key that never expired.
}
