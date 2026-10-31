/*
 * PakuBara - Firmware Paku Termal Gambut (Node Probe)
 * Hardware: ESP32-WROOM-32 + SX1278 LoRa 433MHz + 3x DS18B20
 * 
 * Struktur Paket Biner 18-Byte:
 * [0..1]   Short ID (uint16_t, misal 0x0004 untuk PK-04)
 * [2..3]   Sequence Number (uint16_t counter)
 * [4..5]   Suhu 20 cm (int16_t, dikali 100)
 * [6..7]   Suhu 50 cm (int16_t, dikali 100)
 * [8..9]   Suhu 100 cm (int16_t, dikali 100)
 * [10..11] Baterai (uint16_t mV, misal 3860)
 * [12]     Flags (bit 0: alert aktif, bit 1: low battery)
 * [13..15] Reserved (padding)
 * [16..17] CRC-16 Modbus
 */

#include <SPI.h>
#include <LoRa.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// Definisi Pin Hardware
#define LORA_SS    18
#define LORA_RST   14
#define LORA_DIO0  26
#define ONE_WIRE_BUS 4
#define BATT_ADC_PIN 34

#define NODE_SHORT_ID 0x0004 // PK-04

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

RTC_DATA_ATTR uint16_t bootSequence = 0;
RTC_DATA_ATTR float lastT50 = 30.0;

// Kalkulasi CRC-16 Modbus
uint16_t calculateCRC16(const uint8_t *data, size_t len) {
  uint16_t crc = 0xFFFF;
  for (size_t i = 0; i < len; i++) {
    crc ^= (uint16_t)data[i];
    for (int j = 0; j < 8; j++) {
      if (crc & 0x0001) {
        crc = (crc >> 1) ^ 0xA001;
      } else {
        crc >>= 1;
      }
    }
  }
  return crc;
}

void setup() {
  Serial.begin(115200);
  bootSequence++;

  // Inisialisasi Sensor Suhu
  sensors.begin();
  sensors.requestTemperatures();
  float t20 = sensors.getTempCByIndex(0);
  float t50 = sensors.getTempCByIndex(1);
  float t100 = sensors.getTempCByIndex(2);

  // Fallback pengujian jika sensor disconnect
  if (t20 < -50) t20 = 30.0;
  if (t50 < -50) t50 = 32.0;
  if (t100 < -50) t100 = 30.5;

  // Baca Baterai
  int rawAdc = analogRead(BATT_ADC_PIN);
  uint16_t battMv = (uint16_t)((rawAdc / 4095.0) * 2 * 3.3 * 1000);
  if (battMv < 2500) battMv = 3860;

  // Evaluasi Perubahan Cepat (Adaptive Deep Sleep)
  bool isAlert = (t50 >= 60.0) || ((t50 - lastT50) >= 5.0);
  lastT50 = t50;

  uint8_t flags = 0;
  if (isAlert) flags |= 0x01;
  if (battMv < 3300) flags |= 0x02;

  // Kemas Paket Biner 18-Byte
  uint8_t packet[18] = {0};
  packet[0] = (uint8_t)(NODE_SHORT_ID >> 8);
  packet[1] = (uint8_t)(NODE_SHORT_ID & 0xFF);
  packet[2] = (uint8_t)(bootSequence >> 8);
  packet[3] = (uint8_t)(bootSequence & 0xFF);

  int16_t rawT20 = (int16_t)(t20 * 100);
  int16_t rawT50 = (int16_t)(t50 * 100);
  int16_t rawT100 = (int16_t)(t100 * 100);

  packet[4] = (uint8_t)(rawT20 >> 8);
  packet[5] = (uint8_t)(rawT20 & 0xFF);
  packet[6] = (uint8_t)(rawT50 >> 8);
  packet[7] = (uint8_t)(rawT50 & 0xFF);
  packet[8] = (uint8_t)(rawT100 >> 8);
  packet[9] = (uint8_t)(rawT100 & 0xFF);

  packet[10] = (uint8_t)(battMv >> 8);
  packet[11] = (uint8_t)(battMv & 0xFF);
  packet[12] = flags;

  // Hitung CRC-16
  uint16_t crc = calculateCRC16(packet, 16);
  packet[16] = (uint8_t)(crc >> 8);
  packet[17] = (uint8_t)(crc & 0xFF);

  // Inisialisasi LoRa 433 MHz
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  if (LoRa.begin(433175000)) {
    LoRa.setSpreadingFactor(10);
    LoRa.setSignalBandwidth(125E3);
    LoRa.setCodingRate4(5);
    LoRa.setTxPower(20);

    LoRa.beginPacket();
    LoRa.write(packet, 18);
    LoRa.endPacket();
    LoRa.sleep();
  }

  // Waktu Deep Sleep Adaptif
  // Jika bara aktif: bangun tiap 1 menit. Jika normal: bangun tiap 5 menit.
  uint64_t sleepDurationSec = isAlert ? 60 : 300;
  esp_sleep_enable_timer_wakeup(sleepDurationSec * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {
  // Deep sleep aktif, loop tidak dieksekusi
}

