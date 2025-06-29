
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode-terminal');

const app = express();
const PORT = process.env.PORT || 3020;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://your-app-domain.com'],
  credentials: true
}));
app.use(express.json());

// Supabase configuration
const supabaseUrl = 'https://mqojlcooxwmdrygmoczi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb2psY29veHdtZHJ5Z21vY3ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjcxNjIsImV4cCI6MjA2NTkwMzE2Mn0.czN8Mvo_CVfQzhIftbT-qJpRce7W-NakaoG8djy76cY';
const supabase = createClient(supabaseUrl, supabaseKey);

// WhatsApp client configuration
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './whatsapp-session'
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

// Global state
let isInitialized = false;
let isConnected = false;
let currentQrCode = null;
let connectionState = 'disconnected';
let sessionData = null;

// Initialize WhatsApp client
async function initializeWhatsApp() {
    if (isInitialized) return;
    
    console.log('Initializing WhatsApp client...');
    isInitialized = true;

    client.on('qr', async (qr) => {
        console.log('QR Code received');
        currentQrCode = qr;
        connectionState = 'connecting';
        
        // Generate QR code as base64
        const qrCodeBase64 = await require('qrcode').toDataURL(qr);
        const base64Data = qrCodeBase64.replace(/^data:image\/png;base64,/, '');
        
        // Update database with QR code
        await updateSessionInDatabase({
            qr_code: base64Data,
            connection_state: 'connecting',
            is_connected: false
        });
        
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', async () => {
        console.log('WhatsApp client is ready!');
        isConnected = true;
        connectionState = 'ready';
        currentQrCode = null;
        
        const info = client.info;
        sessionData = {
            phone: info.wid.user,
            name: info.pushname,
            features: ['message_sending', 'qr_authentication', 'session_persistence']
        };
        
        // Update database
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
        console.log('WhatsApp authenticated');
        connectionState = 'connected';
        
        await updateSessionInDatabase({
            connection_state: 'connected',
            is_connected: true
        });
    });

    client.on('auth_failure', async (msg) => {
        console.error('Authentication failure:', msg);
        connectionState = 'disconnected';
        isConnected = false;
        
        await updateSessionInDatabase({
            connection_state: 'disconnected',
            is_connected: false
        });
    });

    client.on('disconnected', async (reason) => {
        console.log('WhatsApp disconnected:', reason);
        isConnected = false;
        connectionState = 'disconnected';
        
        await updateSessionInDatabase({
            connection_state: 'disconnected',
            is_connected: false,
            last_seen: new Date().toISOString()
        });
    });

    client.on('message_create', async (message) => {
        // Log outgoing messages
        if (message.fromMe) {
            await logMessage({
                recipient_phone: message.to,
                message_content: message.body,
                status: 'sent',
                whatsapp_message_id: message.id.id
            });
        }
    });

    await client.initialize();
}

// Database helper functions
async function updateSessionInDatabase(updates) {
    try {
        const { data, error } = await supabase
            .from('whatsapp_sessions')
            .upsert({
                salon_id: 'default-salon', // You'll need to pass this from frontend
                ...updates,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'salon_id'
            });
        
        if (error) {
            console.error('Database update error:', error);
        }
    } catch (err) {
        console.error('Database connection error:', err);
    }
}

async function logMessage(messageData) {
    try {
        const { data, error } = await supabase
            .from('whatsapp_messages')
            .insert({
                salon_id: 'default-salon', // You'll need to pass this from frontend
                ...messageData,
                created_at: new Date().toISOString()
            });
        
        if (error) {
            console.error('Message log error:', error);
        }
    } catch (err) {
        console.error('Message log connection error:', err);
    }
}

// API Routes

// Get current status
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
    } catch (error) {
        console.error('Status error:', error);
        res.status(500).json({ error: 'Failed to get status' });
    }
});

// Connect WhatsApp
app.post('/connect', async (req, res) => {
    try {
        if (!isInitialized) {
            await initializeWhatsApp();
        }
        
        res.json({ 
            success: true, 
            message: 'WhatsApp connection initiated',
            connection_state: connectionState 
        });
    } catch (error) {
        console.error('Connect error:', error);
        res.status(500).json({ error: 'Failed to connect WhatsApp' });
    }
});

// Disconnect WhatsApp
app.post('/disconnect', async (req, res) => {
    try {
        if (client) {
            await client.destroy();
        }
        
        isConnected = false;
        connectionState = 'disconnected';
        currentQrCode = null;
        sessionData = null;
        isInitialized = false;
        
        await updateSessionInDatabase({
            connection_state: 'disconnected',
            is_connected: false,
            qr_code: null,
            last_seen: new Date().toISOString()
        });
        
        res.json({ success: true, message: 'WhatsApp disconnected' });
    } catch (error) {
        console.error('Disconnect error:', error);
        res.status(500).json({ error: 'Failed to disconnect WhatsApp' });
    }
});

// Send message
app.post('/send', async (req, res) => {
    try {
        const { phone, message, appointmentId } = req.body;
        
        if (!isConnected) {
            return res.status(400).json({ error: 'WhatsApp not connected' });
        }
        
        if (!phone || !message) {
            return res.status(400).json({ error: 'Phone and message are required' });
        }
        
        // Format phone number
        let formattedPhone = phone.replace(/\D/g, '');
        if (!formattedPhone.startsWith('1') && formattedPhone.length === 10) {
            formattedPhone = '1' + formattedPhone;
        }
        formattedPhone += '@c.us';
        
        // Send message
        const sentMessage = await client.sendMessage(formattedPhone, message);
        
        // Log message
        await logMessage({
            recipient_phone: phone,
            message_content: message,
            status: 'sent',
            whatsapp_message_id: sentMessage.id.id,
            appointment_id: appointmentId || null
        });
        
        res.json({ 
            success: true, 
            message_id: sentMessage.id.id,
            message: 'Message sent successfully' 
        });
    } catch (error) {
        console.error('Send message error:', error);
        
        // Log failed message
        await logMessage({
            recipient_phone: req.body.phone,
            message_content: req.body.message,
            status: 'failed',
            error_message: error.message,
            appointment_id: req.body.appointmentId || null
        });
        
        res.status(500).json({ error: 'Failed to send message: ' + error.message });
    }
});

// Process reminder queue
app.post('/process-queue', async (req, res) => {
    try {
        if (!isConnected) {
            return res.status(400).json({ error: 'WhatsApp not connected' });
        }
        
        // Get pending reminders
        const { data: reminders, error } = await supabase
            .from('whatsapp_reminder_queue')
            .select('*')
            .eq('status', 'pending')
            .lte('scheduled_time', new Date().toISOString())
            .limit(10);
        
        if (error) {
            throw error;
        }
        
        let processed = 0;
        let failed = 0;
        
        for (const reminder of reminders || []) {
            try {
                // Format phone number
                let formattedPhone = reminder.client_phone.replace(/\D/g, '');
                if (!formattedPhone.startsWith('1') && formattedPhone.length === 10) {
                    formattedPhone = '1' + formattedPhone;
                }
                formattedPhone += '@c.us';
                
                // Send message
                const sentMessage = await client.sendMessage(formattedPhone, reminder.message_content);
                
                // Update reminder status
                await supabase
                    .from('whatsapp_reminder_queue')
                    .update({
                        status: 'sent',
                        sent_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', reminder.id);
                
                // Log message
                await logMessage({
                    recipient_phone: reminder.client_phone,
                    recipient_name: reminder.client_name,
                    message_content: reminder.message_content,
                    status: 'sent',
                    whatsapp_message_id: sentMessage.id.id,
                    appointment_id: reminder.appointment_id
                });
                
                processed++;
            } catch (error) {
                console.error(`Failed to send reminder ${reminder.id}:`, error);
                
                // Update reminder with error
                await supabase
                    .from('whatsapp_reminder_queue')
                    .update({
                        status: 'failed',
                        error_message: error.message,
                        attempts: reminder.attempts + 1,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', reminder.id);
                
                failed++;
            }
        }
        
        res.json({ 
            success: true, 
            processed, 
            failed,
            total: reminders?.length || 0
        });
    } catch (error) {
        console.error('Process queue error:', error);
        res.status(500).json({ error: 'Failed to process queue: ' + error.message });
    }
});

// Get QR code
app.get('/qr', async (req, res) => {
    try {
        if (currentQrCode) {
            const qrCodeBase64 = await require('qrcode').toDataURL(currentQrCode);
            res.json({ qr_code: qrCodeBase64 });
        } else {
            res.json({ qr_code: null });
        }
    } catch (error) {
        console.error('QR code error:', error);
        res.status(500).json({ error: 'Failed to get QR code' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        whatsapp_connected: isConnected,
        connection_state: connectionState,
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`WhatsApp server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    
    // Auto-initialize WhatsApp client
    setTimeout(() => {
        initializeWhatsApp().catch(console.error);
    }, 2000);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    if (client) {
        await client.destroy();
    }
    process.exit(0);
});

// Process reminder queue every 30 seconds
setInterval(async () => {
    if (isConnected) {
        try {
            const response = await fetch(`http://localhost:${PORT}/process-queue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();
            if (result.total > 0) {
                console.log(`Processed ${result.processed} reminders, ${result.failed} failed`);
            }
        } catch (error) {
            console.error('Auto queue processing error:', error);
        }
    }
}, 30000);
