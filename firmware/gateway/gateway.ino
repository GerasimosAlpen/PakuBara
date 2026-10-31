/*
 * PakuBara - Firmware Gateway LoRa Posko Lapangan
 * Hardware: ESP32 + LoRa SX1278 433 MHz Receiver
 * Fungsi:
 * - Mendengarkan paket biner dari paku suhu & tiang gas
 * - Memvalidasi integritas CRC-16
 * - Mencatat RSSI (dBm) dan SNR (dB)
 * - Mengirimkan JSON terstruktur ke port Serial (115200 baud) untuk diserap skrip Bridge
 */

#include <SPI.h>
#include <LoRa.h>

#define LORA_SS    18
#define LORA_RST   14
#define LORA_DIO0  26

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
  Serial.begin(115200);
  while (!Serial);

  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  if (!LoRa.begin(433175000)) {
    Serial.println("{\"error\":\"LoRa init failed\"}");
    while (1);
  }

  LoRa.setSpreadingFactor(10);
  LoRa.setSignalBandwidth(125E3);
  LoRa.setCodingRate4(5);
  LoRa.setSyncWord(0x34);

  Serial.println("{\"status\":\"GATEWAY_READY\",\"frequency_mhz\":433.175}");
}

void loop() {
  int packetSize = LoRa.parsePacket();
  if (packetSize > 0) {
    uint8_t buffer[64];
    int len = 0;
    while (LoRa.available() && len < 64) {
      buffer[len++] = LoRa.read();
    }

    int rssi = LoRa.packetRssi();
    float snr = LoRa.packetSnr();

    // 1. Paket Probe Suhu (18 Byte)
    if (len == 18) {
      uint16_t rxCrc = ((uint16_t)buffer[16] << 8) | buffer[17];
      uint16_t calcCrc = calculateCRC16(buffer, 16);

      if (rxCrc == calcCrc) {
        uint16_t shortId = ((uint16_t)buffer[0] << 8) | buffer[1];
        uint16_t seq = ((uint16_t)buffer[2] << 8) | buffer[3];
        int16_t rawT20 = (int16_t)(((uint16_t)buffer[4] << 8) | buffer[5]);
        int16_t rawT50 = (int16_t)(((uint16_t)buffer[6] << 8) | buffer[7]);
        int16_t rawT100 = (int16_t)(((uint16_t)buffer[8] << 8) | buffer[9]);
        uint16_t battMv = ((uint16_t)buffer[10] << 8) | buffer[11];
        uint8_t flags = buffer[12];

        char nodeId[10];
        snprintf(nodeId, sizeof(nodeId), "PK-%02d", shortId);

        Serial.printf(
          "{\"node_id\":\"%s\",\"seq\":%d,\"t20\":%.2f,\"t50\":%.2f,\"t100\":%.2f,\"batt_mv\":%d,\"flags\":%d,\"rssi\":%d,\"snr\":%.1f}\n",
          nodeId, seq, rawT20 / 100.0, rawT50 / 100.0, rawT100 / 100.0, battMv, flags, rssi, snr
        );
      }
    }
    // 2. Paket Sensor Gas (12 Byte)
    else if (len == 12) {
      uint16_t rxCrc = ((uint16_t)buffer[10] << 8) | buffer[11];
      uint16_t calcCrc = calculateCRC16(buffer, 10);

      if (rxCrc == calcCrc) {
        uint16_t shortId = ((uint16_t)buffer[0] << 8) | buffer[1];
        uint16_t seq = ((uint16_t)buffer[2] << 8) | buffer[3];
        uint16_t rawCo = ((uint16_t)buffer[4] << 8) | buffer[5];
        uint16_t battMv = ((uint16_t)buffer[6] << 8) | buffer[7];

        char nodeId[10];
        snprintf(nodeId, sizeof(nodeId), "GS-%02d", shortId - 100);

        Serial.printf(
          "{\"node_id\":\"%s\",\"seq\":%d,\"co_ppm\":%.1f,\"batt_mv\":%d,\"rssi\":%d,\"snr\":%.1f}\n",
          nodeId, seq, rawCo / 10.0, battMv, rssi, snr
        );
      }
    }
  }
}

