/**
 * Firmware PakuBara Node Probe (ESP32 + 3x DS18B20 + LoRa SX1278 433 MHz)
 * Mengacu pada PRD Seksi 4.1 & 4.2:
 * Paket biner 18-byte little-endian dengan cek CRC-16/CCITT.
 */

#include <Arduino.h>

#pragma pack(push, 1)
struct LoRaProbePacket {
  uint8_t  ver;       // Offset 0: Versi protokol (1)
  uint16_t node_id;   // Offset 1: Short ID perangkat (1 - 65535)
  uint16_t seq;       // Offset 3: Nomor urut paket
  int16_t  t20;       // Offset 5: Suhu 20cm x 10 (contoh: 340 = 34.0 C)
  int16_t  t50;       // Offset 7: Suhu 50cm x 10 (contoh: 5420 = 542.0 C)
  int16_t  t100;      // Offset 9: Suhu 100cm x 10 (contoh: 680 = 68.0 C)
  uint16_t co;        // Offset 11: 0xFFFF untuk node paku suhu
  uint16_t batt_mv;   // Offset 13: Tegangan baterai dalam mV
  uint8_t  flags;     // Offset 15: bit0=mode_siaga, bit1=sensor_err, bit2=low_batt
  uint16_t crc16;     // Offset 16: CRC-16/CCITT dari byte 0..15
};
#pragma pack(pop)

uint16_t computeCrc16Ccitt(const uint8_t* data, size_t length) {
  uint16_t crc = 0xFFFF;
  for (size_t i = 0; i < length; i++) {
    crc ^= (uint16_t)data[i] << 8;
    for (uint8_t bit = 0; bit < 8; bit++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
  }
  return crc;
}

void setup() {
  Serial.begin(115200);
}

void loop() {
  delay(60000);
}
