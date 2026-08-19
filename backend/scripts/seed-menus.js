/**
 * Script untuk menambah data sampel menu & meja ke database
 * Jalankan: node scripts/seed-menus.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../src/db');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const sampleMenus = [
    // Makanan (category_id: 1)
    {
        category_id: 1,
        name: 'Nasi Goreng Spesial Resto',
        description: 'Nasi goreng khas resto dengan telor mata sapi, sate ayam, kerupuk, dan acar segar.',
        price: 35000,
        image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80',
        is_available: 1
    },
    {
        category_id: 1,
        name: 'Mie Goreng Seafood',
        description: 'Mie goreng telur dengan udang segar, cumi, bakso ikan, dan sayuran segar.',
        price: 38000,
        image_url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80',
        is_available: 1
    },
    {
        category_id: 1,
        name: 'Ayam Bakar Madu',
        description: 'Ayam bakar dengan olesan bumbu madu gurih manis, disajikan dengan nasi hangat dan sambal terasi.',
        price: 42000,
        image_url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80',
        is_available: 1
    },
    {
        category_id: 1,
        name: 'Soto Ayam Lamongan',
        description: 'Soto ayam kuah kuning gurih dengan koya renyah, telor rebus, dan bihun.',
        price: 28000,
        image_url: 'https://images.unsplash.com/photo-1572656631137-7935297eff55?w=600&auto=format&fit=crop&q=80',
        is_available: 1
    },
    {
        category_id: 1,
        name: 'Beef Blackpepper Steak',
        description: 'Daging sapi tenderloin dengan saus lada hitam pedas gurih, kentang goreng & kentang rebus.',
        price: 75000,
        image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        is_available: 1
    },

    // Minuman (category_id: 2)
    {
        category_id: 2,
        name: 'Es Teh Manis',
        description: 'Teh melati segar disajikan dengan es batu dan gula asli.',
        price: 8000,
        image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80',
        is_available: 1
    },
    {
        category_id: 2,
        name: 'Es Jeruk Peras Segar',
        description: 'Perasan jeruk segar murni kaya vitamin C dengan es batu.',
        price: 12000,
        image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80',
        is_available: 1
    },
    {
        category_id: 2,
        name: 'Iced Matcha Latte',
        description: 'Matcha Uji Jepang asli dipadu dengan susu segar manis creamy.',
        price: 25000,
        image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80',
        is_available: 1
    },
    {
        category_id: 2,
        name: 'Alpukat Kocok Milo',
        description: 'Alpukat mentega kocok dengan topping bubuk Milo renyah dan susu kental manis.',
        price: 22000,
        image_url: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80',
        is_available: 1
    },

    // Snack (category_id: 3)
    {
        category_id: 3,
        name: 'French Fries Cheese Sauce',
        description: 'Kentang goreng renyah disiram saus keju gurih melimpah.',
        price: 20000,
        image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
        is_available: 1
    },
    {
        category_id: 3,
        name: 'Cireng Bumbu Rujak',
        description: 'Cireng garing di luar kenyal di dalam disajikan dengan bumbu rujak pedas manis.',
        price: 18000,
        image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
        is_available: 1
    },
    {
        category_id: 3,
        name: 'Pisang Goreng Keju Cokelat',
        description: 'Pisang goreng manis dengan parutan keju cheddar melimpah dan taburan susu cokelat.',
        price: 22000,
        image_url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=80',
        is_available: 1
    }
];

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

async function seedData() {
    try {
        console.log('⏳ Memulai seeding data menu & meja...');

        // 1. Insert Menus
        for (const menu of sampleMenus) {
            const [existing] = await db.query('SELECT id FROM menus WHERE name = ?', [menu.name]);
            if (existing.length === 0) {
                await db.query(
                    'INSERT INTO menus (category_id, name, description, price, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?)',
                    [menu.category_id, menu.name, menu.description, menu.price, menu.image_url, menu.is_available]
                );
                console.log(`  ➕ Menu ditambahkan: ${menu.name}`);
            } else {
                console.log(`  ℹ️ Menu sudah ada: ${menu.name}`);
            }
        }

        // 2. Insert Tables 1 s/d 5
        const qrDir = path.join(__dirname, '../uploads/qr');
        if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

        for (let i = 1; i <= 5; i++) {
            const tableNumber = `${i}`;
            const [existing] = await db.query('SELECT id FROM `tables` WHERE table_number = ?', [tableNumber]);
            if (existing.length === 0) {
                const token = uuidv4();
                const [result] = await db.query(
                    'INSERT INTO `tables` (table_number, table_token) VALUES (?, ?)',
                    [tableNumber, token]
                );
                const tableId = result.insertId;
                const qrUrl = `${BASE_URL}/order?table=${tableId}&token=${token}`;
                const qrFileName = `table_${tableId}.png`;
                const qrFilePath = path.join(qrDir, qrFileName);

                await QRCode.toFile(qrFilePath, qrUrl, { width: 300 });
                const qrCodeUrl = `/uploads/qr/${qrFileName}`;
                await db.query('UPDATE `tables` SET qr_code_url = ? WHERE id = ?', [qrCodeUrl, tableId]);

                console.log(`  📱 Meja ${tableNumber} ditambahkan (ID: ${tableId}) -> ${qrUrl}`);
            } else {
                console.log(`  ℹ️ Meja ${tableNumber} sudah ada.`);
            }
        }

        console.log('\n🎉 Seeding menu makanan & meja berhasil diselesaikan!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding:', err);
        process.exit(1);
    }
}

seedData();
