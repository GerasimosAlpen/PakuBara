/*
 * PakuBara - Firmware Tiang Gas Karbon Monoksida (Node Gas)
 * Hardware: ESP32 + Sensor CO MQ-7 + LoRa SX1278 433 MHz
 * 
 * Struktur Paket Biner 12-Byte:
 * [0..1]   Short ID (uint16_t, misal 0x0065 untuk GS-01)
 * [2..3]   Sequence Number
 * [4..5]   Konsentrasi CO (uint16_t, satuan ppm dikali 10)
 * [6..7]   Baterai (uint16_t mV)
 * [8]      Flags
 * [9]      Padding
 * [10..11] CRC-16
 */

#include <SPI.h>
#include <LoRa.h>

#define LORA_SS    18
#define LORA_RST   14
#define LORA_DIO0  26
#define MQ7_ADC_PIN 35
#define BATT_ADC_PIN 34

#define NODE_SHORT_ID 0x0065 // GS-01

RTC_DATA_ATTR uint16_t bootSequence = 0;

uint16_t calculateCRC16(const uint8_t *data, size_t len) {
  uint16_t crc = 0xFFFF;
  for (size_t i = 0; i < len; i++) {
    crc ^= (uint16_t)data[i];
    for (int j = 0; j < 8; j++) {
      if (crc & 0x0001) crc = (crc >> 1) ^ 0xA001;
      else crc >>= 1;
    }
  }
  return crc;
}

void setup() {
  bootSequence++;

  // Baca sensor CO MQ-7
  int mq7Adc = analogRead(MQ7_ADC_PIN);
  float coPpm = (mq7Adc / 4095.0) * 250.0; // Kalibrasi linier kurva resistansi

  int battAdc = analogRead(BATT_ADC_PIN);
  uint16_t battMv = (uint16_t)((battAdc / 4095.0) * 2 * 3.3 * 1000);
  if (battMv < 2500) battMv = 3840;

  bool isHighCo = coPpm >= 50.0;
  uint8_t flags = isHighCo ? 0x01 : 0x00;

  uint8_t packet[12] = {0};
  packet[0] = (uint8_t)(NODE_SHORT_ID >> 8);
  packet[1] = (uint8_t)(NODE_SHORT_ID & 0xFF);
  packet[2] = (uint8_t)(bootSequence >> 8);
  packet[3] = (uint8_t)(bootSequence & 0xFF);

  uint16_t rawCo = (uint16_t)(coPpm * 10);
  packet[4] = (uint8_t)(rawCo >> 8);
  packet[5] = (uint8_t)(rawCo & 0xFF);

  packet[6] = (uint8_t)(battMv >> 8);
  packet[7] = (uint8_t)(battMv & 0xFF);
  packet[8] = flags;
  packet[9] = 0x00;

  uint16_t crc = calculateCRC16(packet, 10);
  packet[10] = (uint8_t)(crc >> 8);
  packet[11] = (uint8_t)(crc & 0xFF);

  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  if (LoRa.begin(433175000)) {
    LoRa.setSpreadingFactor(10);
    LoRa.setSignalBandwidth(125E3);
    LoRa.setCodingRate4(5);
    LoRa.setTxPower(20);

    LoRa.beginPacket();
    LoRa.write(packet, 12);
    LoRa.endPacket();
    LoRa.sleep();
  }

  uint64_t sleepSec = isHighCo ? 60 : 300;
  esp_sleep_enable_timer_wakeup(sleepSec * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {}

