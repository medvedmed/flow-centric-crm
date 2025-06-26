
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode-terminal');

const app = express();
const PORT = process.env.PORT || 3020;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://mqojlcooxwmdrygmoczi.lovableproject.com'],
  credentials: true
}));
app.use(express.json());

// Supabase config
const supabase = createClient(
  'https://mqojlcooxwmdrygmoczi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb2psY29veHdtZHJ5Z21vY3ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjcxNjIsImV4cCI6MjA2NTkwMzE2Mn0.czN8Mvo_CVfQzhIftbT-qJpRce7W-NakaoG8djy76cY'
);

// Multi-salon state management
const salonSessions = new Map(); // salon_id -> { client, isConnected, connectionState, qrCode, sessionData }

// Initialize WhatsApp client for a salon
async function initializeWhatsAppForSalon(salonId) {
  if (salonSessions.has(salonId)) {
    return salonSessions.get(salonId);
  }

  console.log(`Initializing WhatsApp client for salon: ${salonId}`);

  const client = new Client({
    authStrategy: new LocalAuth({ 
      clientId: `salon-${salonId}`,
      dataPath: `./whatsapp-sessions/salon-${salonId}` 
    }),
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

  const salonSession = {
    client,
    isConnected: false,
    connectionState: 'disconnected',
    qrCode: null,
    sessionData: null,
    isInitialized: false
  };

  // Event handlers
  client.on('qr', async (qr) => {
    console.log(`QR Code received for salon ${salonId}`);
    salonSession.qrCode = qr;
    salonSession.connectionState = 'connecting';

    const qrBase64 = await require('qrcode').toDataURL(qr);
    await updateSessionInDatabase(salonId, {
      qr_code: qrBase64.replace(/^data:image\/png;base64,/, ''),
      connection_state: 'connecting',
      is_connected: false
    });

    // Only show QR in terminal for debugging
    if (process.env.NODE_ENV !== 'production') {
      qrcode.generate(qr, { small: true });
    }
  });

  client.on('ready', async () => {
    console.log(`✅ WhatsApp client ready for salon ${salonId}!`);
    salonSession.isConnected = true;
    salonSession.connectionState = 'ready';
    salonSession.qrCode = null;

    const info = client.info;
    salonSession.sessionData = {
      phone: info.wid.user,
      name: info.pushname,
      features: ['message_sending', 'qr_authentication', 'session_persistence']
    };

    await updateSessionInDatabase(salonId, {
      phone_number: info.wid.user,
      is_connected: true,
      connection_state: 'ready',
      qr_code: null,
      last_connected_at: new Date().toISOString(),
      webjs_session_data: salonSession.sessionData
    });
  });

  client.on('authenticated', async () => {
    console.log(`🔐 WhatsApp authenticated for salon ${salonId}`);
    salonSession.connectionState = 'connected';
    await updateSessionInDatabase(salonId, {
      connection_state: 'connected',
      is_connected: true
    });
  });

  client.on('auth_failure', async (msg) => {
    console.error(`❌ Authentication failure for salon ${salonId}:`, msg);
    salonSession.connectionState = 'disconnected';
    salonSession.isConnected = false;
    await updateSessionInDatabase(salonId, {
      connection_state: 'disconnected',
      is_connected: false
    });
  });

  client.on('disconnected', async (reason) => {
    console.log(`⚠️ WhatsApp disconnected for salon ${salonId}:`, reason);
    salonSession.isConnected = false;
    salonSession.connectionState = 'disconnected';
    await updateSessionInDatabase(salonId, {
      connection_state: 'disconnected',
      is_connected: false,
      last_seen: new Date().toISOString()
    });
  });

  salonSessions.set(salonId, salonSession);
  
  try {
    await client.initialize();
    salonSession.isInitialized = true;
  } catch (error) {
    console.error(`Failed to initialize WhatsApp for salon ${salonId}:`, error);
    salonSessions.delete(salonId);
    throw error;
  }

  return salonSession;
}

// Helper functions
async function updateSessionInDatabase(salonId, updates) {
  try {
    await supabase
      .from('whatsapp_sessions')
      .upsert({
        salon_id: salonId,
        ...updates,
        updated_at: new Date().toISOString()
      }, { onConflict: 'salon_id' });
  } catch (err) {
    console.error(`DB update error for salon ${salonId}:`, err);
  }
}

async function logMessage(salonId, messageData) {
  try {
    await supabase
      .from('whatsapp_messages')
      .insert({
        salon_id: salonId,
        ...messageData,
        created_at: new Date().toISOString()
      });
  } catch (err) {
    console.error(`Log message error for salon ${salonId}:`, err);
  }
}

function getSalonIdFromRequest(req) {
  return req.headers['x-salon-id'] || req.body.salon_id || req.query.salon_id;
}

// Routes
app.get('/health', (req, res) => {
  const salonId = getSalonIdFromRequest(req);
  const session = salonSessions.get(salonId);
  res.json({ 
    status: 'ok', 
    whatsapp_connected: session?.isConnected || false,
    salon_id: salonId 
  });
});

app.get('/status', (req, res) => {
  const salonId = getSalonIdFromRequest(req);
  const session = salonSessions.get(salonId) || {
    isConnected: false,
    connectionState: 'disconnected',
    qrCode: null,
    sessionData: null
  };

  res.json({
    session: {
      id: `whatsapp-session-${salonId}`,
      is_connected: session.isConnected,
      connection_state: session.connectionState,
      phone_number: session.sessionData?.phone,
      qr_code: session.qrCode,
      last_connected_at: session.sessionData?.lastConnected,
      webjs_session_data: session.sessionData
    }
  });
});

app.get('/qr', async (req, res) => {
  const salonId = getSalonIdFromRequest(req);
  const session = salonSessions.get(salonId);
  
  if (session?.qrCode) {
    const qrBase64 = await require('qrcode').toDataURL(session.qrCode);
    res.json({ qr_code: qrBase64.replace(/^data:image\/png;base64,/, '') });
  } else {
    res.json({ qr_code: null });
  }
});

app.post('/connect', async (req, res) => {
  try {
    const salonId = getSalonIdFromRequest(req);
    
    if (!salonId) {
      return res.status(400).json({ error: 'Salon ID is required' });
    }

    console.log(`Connect request for salon: ${salonId}`);
    const session = await initializeWhatsAppForSalon(salonId);
    
    res.json({ 
      success: true,
      message: 'Connection initiated',
      connected: session.isConnected, 
      state: session.connectionState 
    });
  } catch (error) {
    console.error('Connect error:', error);
    res.status(500).json({ error: 'Failed to initiate connection' });
  }
});

app.post('/disconnect', async (req, res) => {
  try {
    const salonId = getSalonIdFromRequest(req);
    const session = salonSessions.get(salonId);
    
    if (session?.client) {
      await session.client.destroy();
    }
    
    salonSessions.delete(salonId);
    
    await updateSessionInDatabase(salonId, {
      connection_state: 'disconnected',
      is_connected: false,
      last_seen: new Date().toISOString()
    });
    
    res.json({ success: true, message: 'Disconnected successfully' });
  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect' });
  }
});

app.post('/send', async (req, res) => {
  try {
    const { phone, message, appointmentId } = req.body;
    const salonId = getSalonIdFromRequest(req);
    
    if (!salonId) {
      return res.status(400).json({ error: 'Salon ID is required' });
    }
    
    const session = salonSessions.get(salonId);
    
    if (!session?.isConnected) {
      return res.status(400).json({ error: 'WhatsApp not connected for this salon' });
    }
    
    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone and message are required' });
    }

    let number = phone.replace(/\D/g, '');
    if (!number.endsWith('@c.us')) {
      number += '@c.us';
    }

    console.log(`Sending message for salon ${salonId} to ${phone}`);
    const sentMessage = await session.client.sendMessage(number, message);
    
    await logMessage(salonId, {
      recipient_phone: phone,
      message_content: message,
      status: 'sent',
      whatsapp_message_id: sentMessage.id.id,
      appointment_id: appointmentId || null
    });

    res.json({ 
      success: true, 
      message_id: sentMessage.id.id,
      salon_id: salonId 
    });
  } catch (error) {
    console.error('Send error:', error);
    const salonId = getSalonIdFromRequest(req);
    
    await logMessage(salonId, {
      recipient_phone: req.body.phone,
      message_content: req.body.message,
      status: 'failed',
      error_message: error.message,
      appointment_id: req.body.appointmentId || null
    });
    
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.post('/process-queue', async (req, res) => {
  try {
    const salonId = getSalonIdFromRequest(req);
    
    if (!salonId) {
      return res.status(400).json({ error: 'Salon ID is required' });
    }

    // This endpoint can be called to manually trigger queue processing
    // The actual processing is now handled by the edge function
    console.log(`Queue processing requested for salon: ${salonId}`);
    
    res.json({ 
      success: true, 
      message: 'Queue processing initiated',
      processed: 0,
      failed: 0
    });
  } catch (error) {
    console.error('Process queue error:', error);
    res.status(500).json({ error: 'Failed to process queue' });
  }
});

// Periodic queue processing (every 2 minutes)
setInterval(async () => {
  try {
    console.log('Calling edge function to process reminders...');
    
    const response = await fetch('https://mqojlcooxwmdrygmoczi.supabase.co/functions/v1/whatsapp-reminder-processor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb2psY29veHdtZHJ5Z21vY3ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjcxNjIsImV4cCI6MjA2NTkwMzE2Mn0.czN8Mvo_CVfQzhIftbT-qJpRce7W-NakaoG8djy76cY`
      }
    });

    if (response.ok) {
      const result = await response.json();
      if (result.processed > 0 || result.failed > 0) {
        console.log(`Automatic reminder processing: ${result.processed} sent, ${result.failed} failed`);
      }
    }
  } catch (error) {
    console.error('Automatic reminder processing error:', error);
  }
}, 120000); // Every 2 minutes

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Multi-Salon WhatsApp server running at http://localhost:${PORT}`);
  console.log('✨ Now supporting multiple salons with separate sessions');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  
  for (const [salonId, session] of salonSessions.entries()) {
    if (session.client) {
      console.log(`Closing WhatsApp session for salon ${salonId}`);
      await session.client.destroy();
    }
  }
  
  process.exit(0);
});
