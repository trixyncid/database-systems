-- ============================================================
-- Database Systems · Pertemuan 06 · Praktik SQL & Tools
-- Toko Oleh-Oleh Kak Rina: hasil normalisasi (3NF) pertemuan 05
-- Jalankan seluruh file ini di MySQL Workbench atau phpMyAdmin.
-- ============================================================

DROP DATABASE IF EXISTS toko_kak_rina;
CREATE DATABASE toko_kak_rina;
USE toko_kak_rina;

-- 1. Tabel induk dulu: pelanggan dan produk
CREATE TABLE pelanggan (
  kode_plg  VARCHAR(5)   PRIMARY KEY,
  nama      VARCHAR(100) NOT NULL,
  no_hp     VARCHAR(15),
  kota      VARCHAR(50)
);

CREATE TABLE produk (
  kode_produk  VARCHAR(5)   PRIMARY KEY,
  nama_produk  VARCHAR(100) NOT NULL,
  harga        INT          NOT NULL
);

-- 2. Baru tabel anak: pesanan dan detail_pesanan
CREATE TABLE pesanan (
  no_pesanan  VARCHAR(10) PRIMARY KEY,
  tanggal     DATE        NOT NULL,
  kode_plg    VARCHAR(5)  NOT NULL,
  FOREIGN KEY (kode_plg) REFERENCES pelanggan (kode_plg)
);

CREATE TABLE detail_pesanan (
  no_pesanan   VARCHAR(10),
  kode_produk  VARCHAR(5),
  jumlah       INT NOT NULL,
  harga_jual   INT NOT NULL,
  PRIMARY KEY (no_pesanan, kode_produk),
  FOREIGN KEY (no_pesanan)  REFERENCES pesanan (no_pesanan),
  FOREIGN KEY (kode_produk) REFERENCES produk (kode_produk)
);

-- 3. Isi data
INSERT INTO pelanggan (kode_plg, nama, no_hp, kota) VALUES
  ('C01', 'Dewi Anggraini',   '0812-1111', 'Medan'),
  ('C02', 'Rudi Simanjuntak', '0813-2222', 'Binjai'),
  ('C03', 'Sinta Halim',      '0857-3333', 'Siantar');

INSERT INTO produk (kode_produk, nama_produk, harga) VALUES
  ('P01', 'Bika Ambon',      85000),
  ('P02', 'Sirup Markisa',   40000),
  ('P03', 'Kopi Sidikalang', 60000),
  ('P04', 'Teri Medan',      75000);

INSERT INTO pesanan (no_pesanan, tanggal, kode_plg) VALUES
  ('INV-001', '2026-10-02', 'C01'),
  ('INV-002', '2026-10-02', 'C02'),
  ('INV-003', '2026-10-03', 'C01'),
  ('INV-004', '2026-10-05', 'C03');

INSERT INTO detail_pesanan (no_pesanan, kode_produk, jumlah, harga_jual) VALUES
  ('INV-001', 'P01', 2, 85000),
  ('INV-001', 'P02', 1, 40000),
  ('INV-002', 'P03', 3, 60000),
  ('INV-003', 'P04', 1, 75000),
  ('INV-003', 'P01', 1, 85000),
  ('INV-004', 'P02', 4, 40000);

-- 4. Cek hasilnya
SELECT * FROM pelanggan;
SELECT * FROM detail_pesanan;
