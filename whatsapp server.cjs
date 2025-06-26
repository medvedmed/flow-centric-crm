const { createClient } = require('@supabase/supabase-js');
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');

const app = express();
app.use(cors());

const SUPABASE_URL = 'https://mqojlcooxwmdrygmoczi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb2psY29veHdtZHJ5Z21vY3ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjcxNjIsImV4cCI6MjA2NTkwMzE2Mn0.czN8Mvo_CVfQzhIftbT-qJpRce7W-NakaoG8djy76cY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const sessions = {};

app.get('/qr', async (req, res) => {
  const salonId = req.query.salon_id;
  if (!salonId) return res.status(400).send('❌ salon_id is required');
  const session = sessions[salonId];
  if (!session || !session.qrCodeBase64) return res.status(404).send('QR not ready');
  const base64Data = session.qrCodeBase64.replace(/^data:image\/png;base64,/, '');
  const imgBuffer = Buffer.from(base64Data, 'base64');
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': imgBuffer.length,
  });
  res.end(imgBuffer);
});

app.get('/start', async (req, res) => {
  const salonId = req.query.salon_id;
  if (!salonId) return res.send('❌ salon_id is required in query');

  const { data: sessionRow } = await supabase
    .from('whatsapp_sessions')
    .select('session_data')
    .eq('salon_id', salonId)
    .single();

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: salonId }),
    puppeteer: { headless: true, args: ['--no-sandbox'] },
    session: sessionRow?.session_data || undefined,
  });

  sessions[salonId] = { client, qrCodeBase64: null, isReady: false };

  client.on('qr', async (qr) => {
    const qrCodeBase64 = await qrcode.toDataURL(qr);
    sessions[salonId].qrCodeBase64 = qrCodeBase64;
    sessions[salonId].isReady = false;
    console.log(`📸 QR Code received for salon ${salonId}`);
  });

  client.on('authenticated', async (session) => {
    console.log(`🔒 Authenticated for salon ${salonId}`);
    await supabase
      .from('whatsapp_sessions')
      .upsert({
        salon_id: salonId,
        session_data: session,
        is_connected: true,
        last_connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
  });

  client.on('ready', async () => {
    console.log(`✅ WhatsApp is ready for salon ${salonId}`);
    sessions[salonId].isReady = true;
    const info = await client.getMe();
    await supabase
      .from('whatsapp_sessions')
      .update({
        is_connected: true,
        phone_number: info?.id?.user || null,
        connection_state: 'ready',
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('salon_id', salonId);
  });

  client.on('disconnected', async () => {
    console.log(`🔴 Disconnected for salon ${salonId}`);
    sessions[salonId].isReady = false;
    await supabase
      .from('whatsapp_sessions')
      .update({
        is_connected: false,
        connection_state: 'disconnected',
        updated_at: new Date().toISOString(),
      })
      .eq('salon_id', salonId);
  });

  client.initialize();
  res.send(`📱 WhatsApp client initialized for salon_id: ${salonId}`);
});

app.listen(3020, () => {
  console.log('🚀 WhatsApp Web JS server running at http://localhost:3020');
});
