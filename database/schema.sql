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
INSERT INTO admins (id, username, password, full_name, role) VALUES
(1, 'admin', '$2b$10$xcK9VfPEUPSSNQcFXGiOueHQjXT.tZR/oPJiy6RHb/iWUpBntndbG', 'Administrator', 'admin')
ON DUPLICATE KEY UPDATE password = VALUES(password);

INSERT IGNORE INTO categories (name, description) VALUES
('Makanan', 'Hidangan utama dan lauk pauk'),
('Minuman', 'Minuman dingin dan panas'),
('Snack', 'Camilan dan makanan ringan');

INSERT IGNORE INTO bank_accounts (bank_name, account_number, account_holder, is_active) VALUES
('BCA', '1234567890', 'Nama Pemilik Restoran', TRUE);

INSERT IGNORE INTO menus (id, category_id, name, description, price, image_url, is_available) VALUES
(1, 1, 'Nasi Goreng Spesial Resto', 'Nasi goreng khas resto dengan telor mata sapi, sate ayam, kerupuk, dan acar segar.', 35000.00, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80', TRUE),
(2, 1, 'Mie Goreng Seafood', 'Mie goreng telur dengan udang segar, cumi, bakso ikan, dan sayuran segar.', 38000.00, 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80', TRUE),
(3, 1, 'Ayam Bakar Madu', 'Ayam bakar dengan olesan bumbu madu gurih manis, disajikan dengan nasi hangat dan sambal terasi.', 42000.00, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80', TRUE),
(4, 1, 'Soto Ayam Lamongan', 'Soto ayam kuah kuning gurih dengan koya renyah, telor rebus, dan bihun.', 28000.00, 'https://images.unsplash.com/photo-1572656631137-7935297eff55?w=600&auto=format&fit=crop&q=80', TRUE),
(5, 1, 'Beef Blackpepper Steak', 'Daging sapi tenderloin dengan saus lada hitam pedas gurih, kentang goreng & kentang rebus.', 75000.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', TRUE),
(6, 2, 'Es Teh Manis', 'Teh melati segar disajikan dengan es batu dan gula asli.', 8000.00, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80', TRUE),
(7, 2, 'Es Jeruk Peras Segar', 'Perasan jeruk segar murni kaya vitamin C dengan es batu.', 12000.00, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80', TRUE),
(8, 2, 'Iced Matcha Latte', 'Matcha Uji Jepang asli dipadu dengan susu segar manis creamy.', 25000.00, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80', TRUE),
(9, 2, 'Alpukat Kocok Milo', 'Alpukat mentega kocok dengan topping bubuk Milo renyah dan susu kental manis.', 22000.00, 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80', TRUE),
(10, 3, 'French Fries Cheese Sauce', 'Kentang goreng renyah disiram saus keju gurih melimpah.', 20000.00, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80', TRUE),
(11, 3, 'Cireng Bumbu Rujak', 'Cireng garing di luar kenyal di dalam disajikan dengan bumbu rujak pedas manis.', 18000.00, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80', TRUE),
(12, 3, 'Pisang Goreng Keju Cokelat', 'Pisang goreng manis dengan parutan keju cheddar melimpah dan taburan susu cokelat.', 22000.00, 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=80', TRUE);

