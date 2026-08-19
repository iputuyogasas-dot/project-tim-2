/**
 * Script setup: Generate hash password admin dan update ke database
 * Jalankan: node scripts/setup-admin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const db = require('../src/db');

async function setupAdmin() {
    try {
        const password = 'admin123';
        const hash = await bcrypt.hash(password, 10);
        console.log('🔑 Hash generated:', hash);

        // Update semua admin dengan password baru
        await db.query('UPDATE admins SET password = ? WHERE username = ?', [hash, 'admin']);
        console.log('✅ Password admin berhasil diupdate ke: admin123');

        // Cek apakah admin ada, kalau tidak ada, insert baru
        const [rows] = await db.query('SELECT id FROM admins WHERE username = ?', ['admin']);
        if (rows.length === 0) {
            await db.query(
                'INSERT INTO admins (username, password, full_name, role) VALUES (?, ?, ?, ?)',
                ['admin', hash, 'Administrator', 'admin']
            );
            console.log('✅ Akun admin baru dibuat.');
        }

        console.log('\n🎉 Setup selesai! Login dengan:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

setupAdmin();
