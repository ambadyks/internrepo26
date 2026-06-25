#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

// Wi-Fi Credentials
#define WIFI_SSID "ambaddie"
#define WIFI_PASSWORD "goatthoma"

// Firebase Database URL
const char* firebase_url =
    "https://bulbcontroliot-default-rtdb.firebaseio.com/led_state.json";

// LED Pin
const int LED_PIN = 4;

// Polling Variables
unsigned long lastExecutionTime = 0;
const unsigned long pollingInterval = 1500;

void initWiFi() {
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    Serial.print("Connecting to Wi-Fi");

    while (WiFi.status() != WL_CONNECTED) {
        Serial.print(".");
        delay(500);
    }

    Serial.println();
    Serial.println("Wi-Fi connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
}

void setup() {

    Serial.begin(115200);

    pinMode(LED_PIN, OUTPUT);
    digitalWrite(LED_PIN, LOW);

    initWiFi();

    Serial.println("HTTPS Polling Started");
}

void loop() {

    if (millis() - lastExecutionTime >= pollingInterval) {

        lastExecutionTime = millis();

        if (WiFi.status() == WL_CONNECTED) {

            WiFiClientSecure client;
            client.setInsecure();

            HTTPClient http;

            if (http.begin(client, firebase_url)) {

                int httpCode = http.GET();

                if (httpCode == HTTP_CODE_OK) {

                    String payload = http.getString();
                    payload.trim();

                    Serial.print("Firebase Value: ");
                    Serial.println(payload);

                    if (payload == "1") {
                        digitalWrite(LED_PIN, HIGH);
                    }
                    else if (payload == "0") {
                        digitalWrite(LED_PIN, LOW);
                    }

                }
                else {

                    Serial.print("HTTP Error: ");
                    Serial.println(httpCode);

                    if (httpCode == HTTP_CODE_MOVED_PERMANENTLY) {
                        Serial.println("Redirect Location:");
                        Serial.println(http.header("Location"));
                    }
                }

                http.end();
            }
            else {
                Serial.println("Connection to Firebase failed.");
            }

        }
        else {

            Serial.println("WiFi Lost! Reconnecting...");

            WiFi.disconnect();
            WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
        }
    }
}