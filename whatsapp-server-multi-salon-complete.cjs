
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const qrcode = require('qrcode-terminal');

const app = express();
const PORT = 3020;

// Supabase configuration
const supabaseUrl = 'https://mqojlcooxwmdrygmoczi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb2psY29veHdtZHJ5Z21vY3ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjcxNjIsImV4cCI6MjA2NTkwMzE2Mn0.czN8Mvo_CVfQzhIftbT-qJpRce7W-NakaoG8djy76cY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Store multiple WhatsApp clients (one per salon)
const salonClients = new Map();
const salonSessions = new Map();

app.use(cors({
  origin: ['http://localhost:5173', 'https://mqojlcooxwmdrygmoczi.supabase.co'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-Salon-ID']
}));

app.use(express.json());

// Middleware to extract salon ID
const getSalonId = (req, res, next) => {
  const salonId = req.headers['x-salon-id'] || req.body.salon_id;
  if (!salonId) {
    return res.status(400).json({ error: 'Salon ID is required' });
  }
  req.salonId = salonId;
  next();
};

// Initialize WhatsApp client for a specific salon
const initializeClient = async (salonId) => {
  if (salonClients.has(salonId)) {
    return salonClients.get(salonId);
  }

  console.log(`Initializing WhatsApp client for salon: ${salonId}`);

  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: `salon_${salonId}`,
      dataPath: `./sessions/salon_${salonId}`
    }),
    puppeteer: {
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

  // Store client
  salonClients.set(salonId, client);

  // Initialize session data
  salonSessions.set(salonId, {
    isConnected: false,
    connectionState: 'disconnected',
    phoneNumber: null,
    qrCode: null,
    lastConnectedAt: null,
    clientInfo: null
  });

  // Event handlers
  client.on('qr', async (qr) => {
    console.log(`QR Code generated for salon ${salonId}`);
    
    // Update session in database
    await updateSalonSession(salonId, {
      qr_code: qr,
      connection_state: 'connecting'
    });

    salonSessions.set(salonId, {
      ...salonSessions.get(salonId),
      qrCode: qr,
      connectionState: 'connecting'
    });
  });

  client.on('ready', async () => {
    console.log(`WhatsApp client ready for salon: ${salonId}`);
    
    const clientInfo = client.info;
    const phoneNumber = clientInfo.wid.user;

    await updateSalonSession(salonId, {
      is_connected: true,
      connection_state: 'ready',
      phone_number: phoneNumber,
      last_connected_at: new Date().toISOString(),
      client_info: clientInfo,
      qr_code: null
    });

    salonSessions.set(salonId, {
      ...salonSessions.get(salonId),
      isConnected: true,
      connectionState: 'ready',
      phoneNumber,
      lastConnectedAt: new Date().toISOString(),
      clientInfo,
      qrCode: null
    });
  });

  client.on('authenticated', async () => {
    console.log(`WhatsApp authenticated for salon: ${salonId}`);
    
    await updateSalonSession(salonId, {
      connection_state: 'connected'
    });

    salonSessions.set(salonId, {
      ...salonSessions.get(salonId),
      connectionState: 'connected'
    });
  });

  client.on('disconnected', async (reason) => {
    console.log(`WhatsApp disconnected for salon ${salonId}:`, reason);
    
    await updateSalonSession(salonId, {
      is_connected: false,
      connection_state: 'disconnected',
      qr_code: null
    });

    salonSessions.set(salonId, {
      ...salonSessions.get(salonId),
      isConnected: false,
      connectionState: 'disconnected',
      qrCode: null
    });
  });

  client.on('message', async (message) => {
    console.log(`Message received for salon ${salonId}:`, message.body);
    
    // Log incoming message
    await logMessage(salonId, {
      recipient_phone: message.from,
      message_content: message.body,
      status: 'received',
      whatsapp_message_id: message.id.id
    });
  });

  return client;
};

// Update salon session in database
const updateSalonSession = async (salonId, updates) => {
  try {
    const { error } = await supabase
      .from('whatsapp_sessions')
      .upsert({
        salon_id: salonId,
        ...updates,
        updated_at: new Date().toISOString()
      }, { onConflict: 'salon_id' });

    if (error) {
      console.error('Error updating salon session:', error);
    }
  } catch (error) {
    console.error('Error updating salon session:', error);
  }
};

// Log message to database
const logMessage = async (salonId, messageData) => {
  try {
    const { error } = await supabase
      .from('whatsapp_messages')
      .insert({
        salon_id: salonId,
        ...messageData,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging message:', error);
    }
  } catch (error) {
    console.error('Error logging message:', error);
  }
};

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    active_salons: salonClients.size 
  });
});

// Get status for specific salon
app.get('/status', getSalonId, async (req, res) => {
  try {
    const { salonId } = req;
    const session = salonSessions.get(salonId) || {
      isConnected: false,
      connectionState: 'disconnected',
      phoneNumber: null,
      qrCode: null
    };

    res.json({ 
      session: {
        id: salonId,
        is_connected: session.isConnected,
        connection_state: session.connectionState,
        phone_number: session.phoneNumber,
        qr_code: session.qrCode,
        last_connected_at: session.lastConnectedAt
      }
    });
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// Connect WhatsApp for specific salon
app.post('/connect', getSalonId, async (req, res) => {
  try {
    const { salonId } = req;
    console.log(`Connecting WhatsApp for salon: ${salonId}`);

    const client = await initializeClient(salonId);
    
    if (!client.isReady) {
      await client.initialize();
    }

    res.json({ 
      success: true, 
      message: `WhatsApp connection initiated for salon ${salonId}` 
    });
  } catch (error) {
    console.error('Error connecting WhatsApp:', error);
    res.status(500).json({ error: 'Failed to connect WhatsApp' });
  }
});

// Disconnect WhatsApp for specific salon
app.post('/disconnect', getSalonId, async (req, res) => {
  try {
    const { salonId } = req;
    console.log(`Disconnecting WhatsApp for salon: ${salonId}`);

    const client = salonClients.get(salonId);
    if (client) {
      await client.destroy();
      salonClients.delete(salonId);
      salonSessions.delete(salonId);
    }

    await updateSalonSession(salonId, {
      is_connected: false,
      connection_state: 'disconnected',
      qr_code: null
    });

    res.json({ 
      success: true, 
      message: `WhatsApp disconnected for salon ${salonId}` 
    });
  } catch (error) {
    console.error('Error disconnecting WhatsApp:', error);
    res.status(500).json({ error: 'Failed to disconnect WhatsApp' });
  }
});

// Get QR code for specific salon
app.get('/qr', getSalonId, async (req, res) => {
  try {
    const { salonId } = req;
    const session = salonSessions.get(salonId);
    
    res.json({ 
      qr_code: session?.qrCode || null 
    });
  } catch (error) {
    console.error('Error getting QR code:', error);
    res.status(500).json({ error: 'Failed to get QR code' });
  }
});

// Send message from specific salon
app.post('/send', getSalonId, async (req, res) => {
  try {
    const { salonId } = req;
    const { phone, message, appointmentId } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone and message are required' });
    }

    const client = salonClients.get(salonId);
    if (!client || !client.isReady) {
      return res.status(400).json({ error: 'WhatsApp client not ready for this salon' });
    }

    // Format phone number
    const formattedPhone = phone.replace(/\D/g, '');
    const chatId = `${formattedPhone}@c.us`;

    // Send message
    const sentMessage = await client.sendMessage(chatId, message);

    // Log message
    await logMessage(salonId, {
      recipient_phone: formattedPhone,
      message_content: message,
      status: 'sent',
      whatsapp_message_id: sentMessage.id.id,
      appointment_id: appointmentId || null,
      sent_at: new Date().toISOString()
    });

    res.json({ 
      success: true, 
      message_id: sentMessage.id.id 
    });
  } catch (error) {
    console.error('Error sending message:', error);
    
    // Log failed message
    if (req.salonId) {
      await logMessage(req.salonId, {
        recipient_phone: req.body.phone?.replace(/\D/g, '') || 'unknown',
        message_content: req.body.message || '',
        status: 'failed',
        error_message: error.message,
        appointment_id: req.body.appointmentId || null
      });
    }

    res.status(500).json({ error: error.message });
  }
});

// Process reminder queue for specific salon
app.post('/process-queue', getSalonId, async (req, res) => {
  try {
    const { salonId } = req;
    
    // Get pending reminders for this salon
    const { data: reminders, error } = await supabase
      .from('whatsapp_reminder_queue')
      .select('*')
      .eq('salon_id', salonId)
      .eq('status', 'pending')
      .lte('scheduled_time', new Date().toISOString())
      .lt('attempts', 3)
      .order('scheduled_time', { ascending: true })
      .limit(10);

    if (error) {
      throw error;
    }

    if (!reminders || reminders.length === 0) {
      return res.json({ success: true, processed: 0, failed: 0 });
    }

    const client = salonClients.get(salonId);
    if (!client || !client.isReady) {
      return res.status(400).json({ error: 'WhatsApp client not ready for this salon' });
    }

    let processed = 0;
    let failed = 0;

    for (const reminder of reminders) {
      try {
        // Update status to processing
        await supabase
          .from('whatsapp_reminder_queue')
          .update({ 
            status: 'processing', 
            attempts: reminder.attempts + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', reminder.id);

        // Format phone number and send message
        const formattedPhone = reminder.client_phone.replace(/\D/g, '');
        const chatId = `${formattedPhone}@c.us`;
        
        const sentMessage = await client.sendMessage(chatId, reminder.message_content);

        // Update reminder status to sent
        await supabase
          .from('whatsapp_reminder_queue')
          .update({ 
            status: 'sent', 
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', reminder.id);

        // Log the sent message
        await logMessage(salonId, {
          recipient_phone: formattedPhone,
          recipient_name: reminder.client_name,
          message_content: reminder.message_content,
          status: 'sent',
          whatsapp_message_id: sentMessage.id.id,
          appointment_id: reminder.appointment_id,
          sent_at: new Date().toISOString()
        });

        processed++;
        console.log(`Reminder sent for salon ${salonId}: ${reminder.client_name}`);

        // Add delay between messages
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Failed to send reminder for salon ${salonId}:`, error);
        
        // Update reminder status to failed
        await supabase
          .from('whatsapp_reminder_queue')
          .update({ 
            status: 'failed', 
            error_message: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', reminder.id);

        failed++;
      }
    }

    res.json({ success: true, processed, failed });
  } catch (error) {
    console.error('Error processing queue:', error);
    res.status(500).json({ error: 'Failed to process queue' });
  }
});

// Auto-process reminders every 2 minutes for all salons
setInterval(async () => {
  console.log('Auto-processing reminders for all salons...');
  
  try {
    // Get all unique salon IDs with pending reminders
    const { data: salonIds, error } = await supabase
      .from('whatsapp_reminder_queue')
      .select('salon_id')
      .eq('status', 'pending')
      .lte('scheduled_time', new Date().toISOString())
      .lt('attempts', 3);

    if (error || !salonIds) {
      console.error('Error getting salon IDs:', error);
      return;
    }

    const uniqueSalonIds = [...new Set(salonIds.map(row => row.salon_id))];
    
    for (const salonId of uniqueSalonIds) {
      const client = salonClients.get(salonId);
      if (client && client.isReady) {
        try {
          // Process queue for this salon
          await fetch(`http://localhost:${PORT}/process-queue`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Salon-ID': salonId
            },
            body: JSON.stringify({})
          });
        } catch (error) {
          console.error(`Error auto-processing for salon ${salonId}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error in auto-process interval:', error);
  }
}, 2 * 60 * 1000); // Every 2 minutes

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down WhatsApp clients...');
  
  for (const [salonId, client] of salonClients) {
    try {
      await client.destroy();
      console.log(`Client destroyed for salon: ${salonId}`);
    } catch (error) {
      console.error(`Error destroying client for salon ${salonId}:`, error);
    }
  }
  
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Multi-Salon WhatsApp Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
