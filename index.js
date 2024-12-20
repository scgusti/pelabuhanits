require('dotenv').config(); // Membaca file .env
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');

// Inisialisasi Express
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Untuk melayani file statis (HTML)

// Konfigurasi PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Endpoint untuk halaman login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Endpoint untuk memverifikasi login
app.post('/login', async (req, res) => {
    const { username, email } = req.body;

    try {
        // Query untuk mencari pengguna berdasarkan username dan email
        const result = await pool.query('SELECT * FROM users WHERE username = $1 AND email = $2', [username, email]);
        
        if (result.rows.length > 0) {
            // Login berhasil, lanjutkan ke aplikasi utama
            res.send('Login berhasil! Selamat datang, ' + username);
            // Anda dapat mengarahkan pengguna ke halaman lain atau memulai server utama di sini.
        } else {
            // Login gagal
            res.status(401).send('Username atau email salah!');
        }
    } catch (error) {
        console.error('Error saat memverifikasi login:', error);
        res.status(500).send('Terjadi kesalahan saat verifikasi login!');
    }
});

// Jalankan server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});

// mengakses viewplates.html dengan address http://localhost:3000/view-plates
app.get('/dashboard', (req, res) => {
    res.sendFile(__dirname + '/public/dashboard.html');
});

// mengakses viewplates.html dengan address http://localhost:3000/view-plates
app.get('/view-plates', (req, res) => {
    res.sendFile(__dirname + '/public/viewplates.html');
});

// mengakses tambah plat
app.get('/input-plate', (req, res) => {
    res.sendFile(__dirname + '/public/inputplat.html');
});

// Endpoint untuk menangani form
app.post('/add-plate', async (req, res) => {
    const { numberplate } = req.body;
    try {
        // Masukkan data ke tabel
        const query = 'INSERT INTO platnomor (numberplate) VALUES ($1)';
        await pool.query(query, [numberplate]);

        // Menampilkan pesan berhasil dan menyediakan tombol untuk navigasi
        res.send(`
            <h3>Plat nomor berhasil dimasukkan!</h3>
            <button onclick="window.location.href='/input-plate'">Input Lagi</button>
            <button onclick="window.location.href='/view-plates'">Lihat Data</button>
        `);
    } catch (error) {
        console.error('Error saat memasukkan data:', error);
        res.status(500).send(`
            <h3>Plat nomor berhasil dimasukkan!</h3>
            <button onclick="window.location.href='/input-plate'">Input Lagi</button>
            <button onclick="window.location.href='/view-plates'">Lihat Data</button>
        `);
    }
});



// Endpoint untuk mengambil data plat nomor
app.get('/get-plates', async (req, res) => {
    try {
        // Query untuk mengambil semua data dari tabel platnomor
        const result = await pool.query('SELECT * FROM platnomor');
        res.json(result.rows); // Mengirimkan data sebagai JSON
    } catch (error) {
        console.error('Error saat mengambil data:', error);
        res.status(500).send('Terjadi kesalahan saat mengambil data!');
    }
});

