/*
  TRACK VISION — ESP32 DevKit V1 + four LDR laser receivers

  ANALOG INPUTS (ADC1 pins; safe to use while Wi-Fi is enabled):
    CP1 GPIO32, CP2 GPIO33, CP3 GPIO34, CP4 GPIO35
  Each LDR must be wired as a 3.3V voltage divider, with its midpoint
  connected to the corresponding ADC pin. Do not feed 5V into ESP32 pins.

  IMPORTANT:
  - Tune the thresholds using Serial Monitor before the event.
  - Set BEAM_BROKEN_WHEN_BELOW to match your divider orientation.
  - Laser emitters must be powered separately; never drive a laser diode from a GPIO.
  - Set API_URL and DEVICE_SECRET to match your deployed Track Vision server.
*/
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* API_BASE = "https://YOUR-TRACK-VISION-DOMAIN";
const char* DEVICE_SECRET = "PASTE_THE_SAME_LONG_SECRET_AS_SERVER";
const char* DEVICE_ID = "track-vision-track-01";

const uint8_t SENSOR_PINS[4] = {32, 33, 34, 35};
const int THRESHOLD[4] = {1800, 1800, 1800, 1800}; // Calibrate each gate.
const bool BEAM_BROKEN_WHEN_BELOW = true; // Flip if your LDR divider behaves opposite.
const uint16_t SAMPLE_INTERVAL_MS = 10;
const uint16_t DEBOUNCE_MS = 80;
const uint32_t STATE_POLL_MS = 700;

String activeRunId = "";
bool checkpointSent[4] = {false, false, false, false};
bool candidateState[4] = {false, false, false, false};
bool stableState[4] = {false, false, false, false};
uint32_t candidateSince[4] = {0,0,0,0};
bool pendingEvent[4] = {false, false, false, false};
uint32_t lastPostAttempt[4] = {0,0,0,0};
uint32_t lastSample = 0;
uint32_t lastStatePoll = 0;

bool isBeamBroken(int raw, int threshold) {
  return BEAM_BROKEN_WHEN_BELOW ? raw < threshold : raw > threshold;
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  uint32_t started = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - started < 20000) {
    delay(350); Serial.print(".");
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Wi-Fi connected. IP: "); Serial.println(WiFi.localIP());
  } else {
    Serial.println("Wi-Fi not connected; will retry.");
  }
}

void resetForRun(const String& newRunId) {
  activeRunId = newRunId;
  for (int i=0; i<4; i++) {
    checkpointSent[i] = false;
    candidateState[i] = false;
    stableState[i] = false;
    candidateSince[i] = millis();
    pendingEvent[i] = false;
    lastPostAttempt[i] = 0;
  }
  Serial.print("Active run changed: "); Serial.println(activeRunId);
}

bool pollActiveRun() {
  if (WiFi.status() != WL_CONNECTED) return false;
  HTTPClient http;
  http.setTimeout(2500);
  http.begin(String(API_BASE) + "/api/device/state");
  http.addHeader("x-device-secret", DEVICE_SECRET);
  int code = http.GET();
  if (code != 200) {
    Serial.printf("State poll failed: HTTP %d\n", code);
    http.end();
    return false;
  }
  String response = http.getString();
  http.end();
  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, response);
  if (err) {
    Serial.println("Could not parse device state.");
    return false;
  }
  if (doc["active_run"].isNull()) {
    if (activeRunId.length()) resetForRun("");
    return true;
  }
  String newId = doc["active_run"]["id"] | "";
  if (newId.length() && newId != activeRunId) resetForRun(newId);
  return true;
}

bool postCheckpoint(uint8_t cpNo) {
  if (!activeRunId.length()) return false;
  connectWiFi();
  if (WiFi.status() != WL_CONNECTED) return false;

  HTTPClient http;
  http.setTimeout(3500);
  http.begin(String(API_BASE) + "/api/checkpoint");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-secret", DEVICE_SECRET);

  JsonDocument doc;
  doc["checkpoint_no"] = cpNo;
  doc["run_id"] = activeRunId;
  doc["device_id"] = DEVICE_ID;
  String payload;
  serializeJson(doc, payload);

  int code = http.POST(payload);
  String response = http.getString();
  http.end();
  Serial.printf("CP%u => HTTP %d | %s\n", cpNo, code, response.c_str());
  return code >= 200 && code < 300;
}

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);
  for (int i=0; i<4; i++) {
    analogSetPinAttenuation(SENSOR_PINS[i], ADC_11db);
  }
  connectWiFi();
  pollActiveRun();
  Serial.println("Track Vision sensor controller ready.");
  Serial.println("Open Serial Monitor to calibrate the four LDR readings.");
}

void loop() {
  uint32_t now = millis();
  if (now - lastStatePoll >= STATE_POLL_MS) {
    lastStatePoll = now;
    if (WiFi.status() != WL_CONNECTED) connectWiFi();
    pollActiveRun();
  }

  if (now - lastSample >= SAMPLE_INTERVAL_MS) {
    lastSample = now;
    for (int i=0; i<4; i++) {
      int raw = analogRead(SENSOR_PINS[i]);
      bool detected = isBeamBroken(raw, THRESHOLD[i]);

      if (detected != candidateState[i]) {
        candidateState[i] = detected;
        candidateSince[i] = now;
      }
      if (candidateState[i] != stableState[i] && now - candidateSince[i] >= DEBOUNCE_MS) {
        stableState[i] = candidateState[i];
        if (stableState[i] && !checkpointSent[i] && activeRunId.length()) {
          pendingEvent[i] = true; // Keep event pending if the beam clears or Wi-Fi drops.
          Serial.printf("Laser beam interrupted at CP%d (ADC=%d)\\n", i+1, raw);
        }
      }
      if (pendingEvent[i] && !checkpointSent[i] && activeRunId.length() &&
          (lastPostAttempt[i] == 0 || now - lastPostAttempt[i] >= 1000)) {
        lastPostAttempt[i] = now;
        if (postCheckpoint(i+1)) {
          checkpointSent[i] = true;
          pendingEvent[i] = false;
        } else {
          Serial.printf("CP%d send failed; queued event will retry.\\n", i+1);
        }
      }
      // Uncomment for threshold tuning; observe values with beam aligned/broken.
      // Serial.printf("CP%d=%d ", i+1, raw);
    }
  }
}
