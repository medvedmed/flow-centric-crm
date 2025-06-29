const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode-terminal');

const app = express();
const PORT = process.env.PORT || 3020;

// ✅ Updated CORS to include ngrok & Lovable domains
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://0ead72f8-81b0-4cdc-a1b2-a7d93ae983f1.lovableproject.com',
    'https://id-preview--0ead72f8-81b0-4cdc-a1b2-a7d93ae983f1.lovable.app',
    'https://e7d6-37-186-32-24.ngrok-free.app' // ✅ <-- your ngrok HTTPS
  ],
  credentials: true
}));
app.use(express.json());

// Supabase setup
const supabase = createClient(
  'https://mqojlcooxwmdrygmoczi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb2psY29veHdtZHJ5Z21vY3ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjcxNjIsImV4cCI6MjA2NTkwMzE2Mn0.czN8Mvo_CVfQzhIftbT-qJpRce7W-NakaoG8djy76cY'
);

// 🟢 WhatsApp client config
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './whatsapp-session' }),
  puppeteer: {
    executablePath: puppeteer.executablePath(),
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  }
});

// 🔄 State
let isInitialized = false;
let isConnected = false;
let currentQrCode = null;
let connectionState = 'disconnected';
let sessionData = null;

// 🔁 Init WhatsApp
async function initializeWhatsApp() {
  if (isInitialized) return;
  isInitialized = true;
  console.log('Initializing WhatsApp client...');

  client.on('qr', async (qr) => {
    console.log('QR Code received');
    currentQrCode = qr;
    connectionState = 'connecting';
    const qrBase64 = await require('qrcode').toDataURL(qr);
    await updateSessionInDatabase({
      qr_code: qrBase64.replace(/^data:image\/png;base64,/, ''),
      connection_state: 'connecting',
      is_connected: false
    });
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', async () => {
    console.log('✅ WhatsApp client is ready!');
    isConnected = true;
    connectionState = 'ready';
    currentQrCode = null;
    const info = client.info;
    sessionData = {
      phone: info.wid.user,
      name: info.pushname,
      features: ['message_sending', 'qr_authentication', 'session_persistence']
    };
    await updateSessionInDatabase({
      phone_number: info.wid.user,
      is_connected: true,
      connection_state: 'ready',
      qr_code: null,
      last_connected_at: new Date().toISOString(),
      webjs_session_data: sessionData
    });
  });

  client.on('authenticated', async () => {
    console.log('🔐 WhatsApp authenticated');
    connectionState = 'connected';
    await updateSessionInDatabase({
      connection_state: 'connected',
      is_connected: true
    });
  });

  client.on('auth_failure', async (msg) => {
    console.error('❌ Auth failed:', msg);
    connectionState = 'disconnected';
    isConnected = false;
    await updateSessionInDatabase({
      connection_state: 'disconnected',
      is_connected: false
    });
  });

  client.on('disconnected', async (reason) => {
    console.log('⚠️ Disconnected:', reason);
    isConnected = false;
    connectionState = 'disconnected';
    await updateSessionInDatabase({
      connection_state: 'disconnected',
      is_connected: false,
      last_seen: new Date().toISOString()
    });
  });

  await client.initialize();
}

// 📦 Supabase helpers
async function updateSessionInDatabase(updates) {
  try {
    await supabase.from('whatsapp_sessions').upsert({
      salon_id: 'default-salon',
      ...updates,
      updated_at: new Date().toISOString()
    }, { onConflict: 'salon_id' });
  } catch (err) {
    console.error('DB update error:', err);
  }
}

async function logMessage(messageData) {
  try {
    await supabase.from('whatsapp_messages').insert({
      salon_id: 'default-salon',
      ...messageData,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Message log error:', err);
  }
}

// 🧪 Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', whatsapp_connected: isConnected });
});

app.get('/status', async (req, res) => {
  try {
    const session = {
      id: 'whatsapp-session',
      is_connected: isConnected,
      connection_state: connectionState,
      phone_number: sessionData?.phone || null,
      qr_code: currentQrCode ? await require('qrcode').toDataURL(currentQrCode).then(qr => qr.replace(/^data:image\/png;base64,/, '')) : null,
      last_connected_at: isConnected ? new Date().toISOString() : null,
      webjs_session_data: sessionData
    };
    res.json({ session });
  } catch (err) {
    console.error('Status error:', err);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

app.get('/qr', async (req, res) => {
  if (currentQrCode) {
    const qrBase64 = await require('qrcode').toDataURL(currentQrCode);
    res.json({ qr_code: qrBase64 });
  } else {
    res.json({ qr_code: null });
  }
});

app.post('/connect', async (req, res) => {
  try {
    if (!isInitialized) await initializeWhatsApp();
    res.json({ success: true, message: 'WhatsApp connection initiated', connection_state: connectionState });
  } catch (err) {
    console.error('Connect error:', err);
    res.status(500).json({ error: 'Failed to connect WhatsApp' });
  }
});

app.post('/disconnect', async (req, res) => {
  try {
    if (client) await client.destroy();
    isConnected = false;
    connectionState = 'disconnected';
    currentQrCode = null;
    sessionData = null;
    isInitialized = false;
    await updateSessionInDatabase({
      connection_state: 'disconnected',
      is_connected: false,
      last_seen: new Date().toISOString()
    });
    res.json({ success: true, message: 'WhatsApp disconnected' });
  } catch (err) {
    console.error('Disconnect error:', err);
    res.status(500).json({ error: 'Failed to disconnect WhatsApp' });
  }
});

app.post('/send', async (req, res) => {
  const { phone, message, appointmentId } = req.body;
  if (!isConnected) return res.status(400).json({ error: 'Not connected' });
  if (!phone || !message) return res.status(400).json({ error: 'Missing phone or message' });

  let number = phone.replace(/\D/g, '');
  if (!number.endsWith('@c.us')) number += '@c.us';

  try {
    const sentMessage = await client.sendMessage(number, message);
    await logMessage({
      recipient_phone: phone,
      message_content: message,
      status: 'sent',
      whatsapp_message_id: sentMessage.id.id,
      appointment_id: appointmentId || null
    });
    res.json({ success: true, message_id: sentMessage.id.id });
  } catch (error) {
    await logMessage({
      recipient_phone: phone,
      message_content: message,
      status: 'failed',
      error_message: error.message,
      appointment_id: appointmentId || null
    });
    res.status(500).json({ error: 'Send failed' });
  }
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`✅ WhatsApp server running on http://localhost:${PORT}`);
  console.log(`🌐 Accessible at https://e7d6-37-186-32-24.ngrok-free.app`);
  setTimeout(() => initializeWhatsApp(), 1500);
});
