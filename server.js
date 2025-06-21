
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS for frontend communication

const PORT = process.env.PORT || 3000;

// In-memory data stores
let clients = [];
let appointments = [];
let staff = [];
let inventory = [];

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to Aura Salon CRM backend!');
});

// CLIENT ENDPOINTS

// Get all clients with optional search
app.get('/clients', (req, res) => {
  const { search } = req.query;
  
  if (search) {
    const filteredClients = clients.filter(client => 
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase()) ||
      (client.phone && client.phone.includes(search))
    );
    return res.json(filteredClients);
  }
  
  res.json(clients);
});

// Get single client
app.get('/clients/:id', (req, res) => {
  const client = clients.find(c => c.id === parseInt(req.params.id));
  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }
  res.json(client);
});

// Add a new client with validation
app.post('/clients', (req, res) => {
  const { name, email, phone, status, assignedStaff, notes, tags, preferredStylist } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Name, email, and phone are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  const client = {
    id: clients.length + 1,
    name,
    email,
    phone,
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

  clients.push(client);
  res.status(201).json(client);
});

// Update client
app.put('/clients/:id', (req, res) => {
  const clientIndex = clients.findIndex(c => c.id === parseInt(req.params.id));
  if (clientIndex === -1) {
    return res.status(404).json({ error: 'Client not found' });
  }

  const updatedClient = { ...clients[clientIndex], ...req.body };
  clients[clientIndex] = updatedClient;
  res.json(updatedClient);
});

// Delete client
app.delete('/clients/:id', (req, res) => {
  const clientIndex = clients.findIndex(c => c.id === parseInt(req.params.id));
  if (clientIndex === -1) {
    return res.status(404).json({ error: 'Client not found' });
  }

  clients.splice(clientIndex, 1);
  res.status(204).send();
});

// APPOINTMENT ENDPOINTS

// Get all appointments with optional filters
app.get('/appointments', (req, res) => {
  const { clientId, staffId } = req.query;
  let filteredAppointments = appointments;

  if (clientId) {
    filteredAppointments = filteredAppointments.filter(apt => apt.clientId === clientId);
  }

  if (staffId) {
    filteredAppointments = filteredAppointments.filter(apt => apt.staffId === staffId);
  }

  // Add client name and phone to appointments for display
  const enrichedAppointments = filteredAppointments.map(apt => {
    const client = clients.find(c => c.id === parseInt(apt.clientId));
    return {
      ...apt,
      clientName: client ? client.name : 'Unknown Client',
      clientPhone: client ? client.phone : ''
    };
  });

  res.json(enrichedAppointments);
});

// Add a new appointment with validation
app.post('/appointments', (req, res) => {
  const { clientId, staffId, service, startTime, endTime, status, notes, price, duration } = req.body;

  if (!clientId || !staffId || !service || !startTime || !endTime) {
    return res.status(400).json({ error: 'clientId, staffId, service, startTime, and endTime are required.' });
  }

  const clientExists = clients.some(client => client.id === parseInt(clientId));
  if (!clientExists) {
    return res.status(400).json({ error: 'Client not found.' });
  }

  if (isNaN(Date.parse(startTime)) || isNaN(Date.parse(endTime))) {
    return res.status(400).json({ error: 'Invalid date format.' });
  }

  const appointment = {
    id: appointments.length + 1,
    clientId,
    staffId,
    service,
    startTime,
    endTime,
    status: status || 'Scheduled',
    notes: notes || '',
    price: price || 0,
    duration: duration || 60,
    createdAt: new Date().toISOString()
  };

  appointments.push(appointment);
  res.status(201).json(appointment);
});

// Update appointment
app.put('/appointments/:id', (req, res) => {
  const appointmentIndex = appointments.findIndex(a => a.id === parseInt(req.params.id));
  if (appointmentIndex === -1) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  const updatedAppointment = { ...appointments[appointmentIndex], ...req.body };
  appointments[appointmentIndex] = updatedAppointment;
  res.json(updatedAppointment);
});

// Delete appointment
app.delete('/appointments/:id', (req, res) => {
  const appointmentIndex = appointments.findIndex(a => a.id === parseInt(req.params.id));
  if (appointmentIndex === -1) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  appointments.splice(appointmentIndex, 1);
  res.status(204).send();
});

// STAFF ENDPOINTS

// Get all staff
app.get('/staff', (req, res) => {
  res.json(staff);
});

// Add new staff
app.post('/staff', (req, res) => {
  const { name, role, email, phone } = req.body;

  if (!name || !role) {
    return res.status(400).json({ error: 'Name and role are required.' });
  }

  const staffMember = {
    id: staff.length + 1,
    name,
    role,
    email: email || '',
    phone: phone || '',
    createdAt: new Date().toISOString()
  };

  staff.push(staffMember);
  res.status(201).json(staffMember);
});

// Update staff
app.put('/staff/:id', (req, res) => {
  const staffIndex = staff.findIndex(s => s.id === parseInt(req.params.id));
  if (staffIndex === -1) {
    return res.status(404).json({ error: 'Staff member not found' });
  }

  const updatedStaff = { ...staff[staffIndex], ...req.body };
  staff[staffIndex] = updatedStaff;
  res.json(updatedStaff);
});

// Delete staff
app.delete('/staff/:id', (req, res) => {
  const staffIndex = staff.findIndex(s => s.id === parseInt(req.params.id));
  if (staffIndex === -1) {
    return res.status(404).json({ error: 'Staff member not found' });
  }

  staff.splice(staffIndex, 1);
  res.status(204).send();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
