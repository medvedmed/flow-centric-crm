
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Allow cross-origin from frontend

const PORT = process.env.PORT || 3000;

// In-memory data stores with sample data
let clients = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    status: "VIP",
    assignedStaff: "Emma Wilson",
    notes: "Prefers morning appointments",
    tags: "VIP, Regular",
    preferredStylist: "Emma Wilson",
    createdAt: new Date().toISOString(),
    lastVisit: "2024-01-15",
    totalSpent: 450,
    visits: 12
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael.chen@email.com",
    phone: "+1 (555) 234-5678",
    status: "Regular",
    assignedStaff: "Sophia Davis",
    notes: "Allergic to certain hair products",
    tags: "Regular",
    preferredStylist: "Sophia Davis",
    createdAt: new Date().toISOString(),
    lastVisit: "2024-01-10",
    totalSpent: 320,
    visits: 8
  }
];

let appointments = [];
let staff = [
  { id: 1, name: "Emma Wilson", role: "Senior Stylist", email: "emma@salon.com", phone: "+1 (555) 111-1111", createdAt: new Date().toISOString() },
  { id: 2, name: "Sophia Davis", role: "Hair Colorist", email: "sophia@salon.com", phone: "+1 (555) 222-2222", createdAt: new Date().toISOString() }
];
let inventory = [];

// Root
app.get('/', (req, res) => {
  res.send('Welcome to Aura Salon CRM backend!');
});

// ── CLIENTS ────────────────────────────────────────────────────────────

// List + search
app.get('/clients', (req, res) => {
  const { search } = req.query;
  if (search) {
    const q = search.toLowerCase();
    return res.json(clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
    ));
  }
  res.json(clients);
});

// Get one
app.get('/clients/:id', (req, res) => {
  const c = clients.find(c => c.id === +req.params.id);
  if (!c) return res.status(404).json({ error: 'Client not found' });
  res.json(c);
});

// Create
app.post('/clients', (req, res) => {
  const { name, email, phone, status, assignedStaff, notes, tags, preferredStylist } = req.body;
  if (!name || !email || !phone)
    return res.status(400).json({ error: 'Name, email, and phone are required.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Invalid email format.' });

  const newClient = {
    id: Math.max(...clients.map(c => c.id), 0) + 1,
    name, email, phone,
    status: status || 'New',
    assignedStaff: assignedStaff || '',
    notes: notes || '',
    tags: tags || '',
    preferredStylist: preferredStylist || '',
    createdAt: new Date().toISOString(),
    lastVisit: null,
    totalSpent: 0,
    visits: 0
  };
  clients.push(newClient);
  res.status(201).json(newClient);
});

// Update
app.put('/clients/:id', (req, res) => {
  const idx = clients.findIndex(c => c.id === +req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Client not found' });
  clients[idx] = { ...clients[idx], ...req.body };
  res.json(clients[idx]);
});

// Delete
app.delete('/clients/:id', (req, res) => {
  const idx = clients.findIndex(c => c.id === +req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Client not found' });
  clients.splice(idx, 1);
  res.sendStatus(204);
});

// ── APPOINTMENTS ────────────────────────────────────────────────────────

// List with optional filters
app.get('/appointments', (req, res) => {
  let list = [...appointments];
  if (req.query.clientId) list = list.filter(a => a.clientId === +req.query.clientId);
  if (req.query.staffId)  list = list.filter(a => a.staffId === +req.query.staffId);

  // enrich with client data
  list = list.map(a => {
    const c = clients.find(x => x.id === a.clientId);
    return {
      ...a,
      clientName: c?.name || 'Unknown',
      clientPhone: c?.phone || ''
    };
  });
  res.json(list);
});

// Create
app.post('/appointments', (req, res) => {
  const { clientId, staffId, service, startTime, endTime, status, notes, price, duration, clientName, clientPhone } = req.body;
  
  console.log('Received appointment data:', req.body);
  
  if (!clientId || !staffId || !service || !startTime || !endTime)
    return res.status(400).json({ error: 'clientId, staffId, service, startTime, endTime are required.' });

  // Convert IDs to numbers
  const numericClientId = +clientId;
  const numericStaffId = +staffId;

  // Check if client exists, if not and we have client info, create them
  if (!clients.some(c => c.id === numericClientId)) {
    if (clientName && clientPhone) {
      // Create new client
      const newClient = {
        id: numericClientId > 0 ? numericClientId : Math.max(...clients.map(c => c.id), 0) + 1,
        name: clientName,
        email: clientPhone + '@temp.com', // temporary email
        phone: clientPhone,
        status: 'New',
        assignedStaff: '',
        notes: '',
        tags: '',
        preferredStylist: '',
        createdAt: new Date().toISOString(),
        lastVisit: null,
        totalSpent: 0,
        visits: 0
      };
      clients.push(newClient);
      console.log('Created new client:', newClient);
    } else {
      return res.status(400).json({ error: 'Client not found and insufficient client info provided.' });
    }
  }

  // Validate staff exists
  if (!staff.some(s => s.id === numericStaffId)) {
    return res.status(400).json({ error: 'Staff member not found.' });
  }

  const timeRx = /^\d{2}:\d{2}$/;
  if (!timeRx.test(startTime) || !timeRx.test(endTime))
    return res.status(400).json({ error: 'Time must be HH:MM format.' });

  const newApt = {
    id: Math.max(...appointments.map(a => a.id), 0) + 1,
    clientId: numericClientId,
    staffId: numericStaffId,
    service,
    startTime,
    endTime,
    status: status || 'Scheduled',
    notes: notes || '',
    price: price || 0,
    duration: duration || 60,
    createdAt: new Date().toISOString()
  };
  
  appointments.push(newApt);
  console.log('Created appointment:', newApt);
  
  // Return enriched appointment
  const client = clients.find(c => c.id === numericClientId);
  const enrichedApt = {
    ...newApt,
    clientName: client?.name || 'Unknown',
    clientPhone: client?.phone || ''
  };
  
  res.status(201).json(enrichedApt);
});

// Update
app.put('/appointments/:id', (req, res) => {
  const idx = appointments.findIndex(a => a.id === +req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Appointment not found' });
  
  // Convert staffId to number if provided
  const updates = { ...req.body };
  if (updates.staffId) updates.staffId = +updates.staffId;
  if (updates.clientId) updates.clientId = +updates.clientId;
  
  appointments[idx] = { ...appointments[idx], ...updates };
  
  // Return enriched appointment
  const client = clients.find(c => c.id === appointments[idx].clientId);
  const enrichedApt = {
    ...appointments[idx],
    clientName: client?.name || 'Unknown',
    clientPhone: client?.phone || ''
  };
  
  res.json(enrichedApt);
});

// Delete
app.delete('/appointments/:id', (req, res) => {
  const idx = appointments.findIndex(a => a.id === +req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Appointment not found' });
  appointments.splice(idx, 1);
  res.sendStatus(204);
});

// ── STAFF ───────────────────────────────────────────────────────────────

// List
app.get('/staff', (req, res) => res.json(staff));

// Create
app.post('/staff', (req, res) => {
  const { name, role, email, phone } = req.body;
  if (!name || !role) return res.status(400).json({ error: 'Name and role required.' });
  const newS = { id: Math.max(...staff.map(s => s.id), 0) + 1, name, role, email: email||'', phone: phone||'', createdAt: new Date().toISOString() };
  staff.push(newS);
  res.status(201).json(newS);
});

// Update
app.put('/staff/:id', (req, res) => {
  const idx = staff.findIndex(s => s.id === +req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Staff not found' });
  staff[idx] = { ...staff[idx], ...req.body };
  res.json(staff[idx]);
});

// Delete
app.delete('/staff/:id', (req, res) => {
  const idx = staff.findIndex(s => s.id === +req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Staff not found' });
  staff.splice(idx, 1);
  res.sendStatus(204);
});

// ── INVENTORY ──────────────────────────────────────────────────────────

// List
app.get('/inventory', (req, res) => res.json(inventory));

// Create
app.post('/inventory', (req, res) => {
  const { name, sku, quantity, price, supplier } = req.body;
  if (!name||!sku||quantity==null||price==null||!supplier)
    return res.status(400).json({ error: 'Name, SKU, quantity, price, supplier required.' });
  if (quantity<0||price<0)
    return res.status(400).json({ error: 'Quantity/price must be ≥ 0.' });
  const newItem = { id: Math.max(...inventory.map(i => i.id), 0) + 1, name, sku, quantity, price, supplier };
  inventory.push(newItem);
  res.status(201).json(newItem);
});

// Update
app.put('/inventory/:id', (req, res) => {
  const idx = inventory.findIndex(i => i.id === +req.params.id);
  if (idx===-1) return res.status(404).json({ error: 'Item not found' });
  inventory[idx] = { ...inventory[idx], ...req.body };
  res.json(inventory[idx]);
});

// Delete
app.delete('/inventory/:id', (req, res) => {
  const idx = inventory.findIndex(i => i.id === +req.params.id);
  if (idx===-1) return res.status(404).json({ error: 'Item not found' });
  inventory.splice(idx,1);
  res.sendStatus(204);
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

// Start
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
