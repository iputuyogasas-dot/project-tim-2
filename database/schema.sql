-- =========================================================
-- Database Schema: Sistem Pemesanan Menu Berbasis Barcode Meja
-- =========================================================

CREATE DATABASE IF NOT EXISTS barcode_order_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE barcode_order_db;

-- ---------------------------------------------------------
-- DB-01: Table admins
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'kasir') NOT NULL DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- DB-02: Table categories
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(255) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- DB-03: Table menus
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS menus (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(255) NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- ---------------------------------------------------------
-- DB-04: Table tables
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tables` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  table_number VARCHAR(10) NOT NULL UNIQUE,
  table_token VARCHAR(100) NOT NULL UNIQUE,
  qr_code_url VARCHAR(255) NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- DB-05: Table orders
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  table_id INT NOT NULL,
  customer_name VARCHAR(100) NULL,
  status ENUM(
    'pending_payment',
    'waiting_verification',
    'confirmed',
    'rejected',
    'processing',
    'completed',
    'cancelled'
  ) NOT NULL DEFAULT 'pending_payment',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (table_id) REFERENCES `tables`(id) ON DELETE RESTRICT,
  INDEX idx_orders_table_id (table_id),
  INDEX idx_orders_status (status)
);

-- ---------------------------------------------------------
-- DB-06: Table order_items
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  menu_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price_at_order DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  note VARCHAR(255) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE RESTRICT
);

-- ---------------------------------------------------------
-- DB-07: Table bank_accounts
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS bank_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bank_name VARCHAR(50) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  account_holder VARCHAR(100) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- DB-08: Table payments
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  bank_account_id INT NOT NULL,
  amount_transferred DECIMAL(10,2) NOT NULL,
  proof_image_url VARCHAR(255) NOT NULL,
  status ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
  verified_by INT NULL,
  verified_at DATETIME NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE RESTRICT,
  FOREIGN KEY (verified_by) REFERENCES admins(id) ON DELETE SET NULL,
  INDEX idx_payments_status (status)
);

-- ---------------------------------------------------------
-- DB-09: Seed data awal
-- ---------------------------------------------------------
-- Password untuk admin123 (bcrypt hash)
INSERT IGNORE INTO admins (username, password, full_name, role) VALUES
('admin', '$2b$10$Nqx.6v8v9z4V7C1e2YfQnO8RBwwNaEKJ7pY7G3EkFAoMx0wCM8xXu', 'Administrator', 'admin');

INSERT IGNORE INTO categories (name, description) VALUES
('Makanan', 'Hidangan utama dan lauk pauk'),
('Minuman', 'Minuman dingin dan panas'),
('Snack', 'Camilan dan makanan ringan');

INSERT IGNORE INTO bank_accounts (bank_name, account_number, account_holder, is_active) VALUES
('BCA', '1234567890', 'Nama Pemilik Restoran', TRUE);
