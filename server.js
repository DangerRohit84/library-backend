
/*
  server.js - Backend for LibBook
  
  Dependencies:
  npm install express mongoose cors
  
  Run:
  node server.js
*/

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
// Use process.env.PORT for Render deployment, fallback to 3001 for local
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
// Use process.env.MONGO_URI for production security, fallback to demo DB for local
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://admin:LoginDemo1@library.omey7op.mongodb.net/library?retryWrites=true&w=majority&appName=Library";

// Connection with retry logic or just simple connect
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas');
    await seedData();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('Server will continue running, but DB operations will fail.');
  });

// --- Schemas & Models ---

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  email: String,
  password: String, // Note: In production, hash passwords!
  role: String,
  studentId: String,
  department: String,
  yearSection: String,
  mobile: String,
  isBlocked: { type: Boolean, default: false }
});

const seatSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  label: String,
  type: String,
  isMaintenance: { type: Boolean, default: false },
  x: Number,
  y: Number,
  rotation: Number
});

const bookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  seatId: String,
  userId: String,
  userName: String,
  date: String,
  startTime: String,
  endTime: String,
  timestamp: Number,
  status: String
});

const User = mongoose.model('User', userSchema);
const Seat = mongoose.model('Seat', seatSchema);
const Booking = mongoose.model('Booking', bookingSchema);

// --- Initial Data Seeding ---

const INITIAL_SEATS = [
  // Lounge
  { id: 's-l1', label: 'L1', type: 'Standard', isMaintenance: false, x: 1, y: 1, rotation: 180 },
  { id: 's-l2', label: 'L2', type: 'Standard', isMaintenance: false, x: 2, y: 1, rotation: 180 },
  { id: 's-l3', label: 'L3', type: 'Standard', isMaintenance: false, x: 3, y: 1, rotation: 180 },
  // PC
  { id: 's-pc1', label: 'PC1', type: 'PC Station', isMaintenance: false, x: 9, y: 0, rotation: 180 },
  { id: 's-pc2', label: 'PC2', type: 'PC Station', isMaintenance: false, x: 10, y: 0, rotation: 180 },
  { id: 's-pc3', label: 'PC3', type: 'PC Station', isMaintenance: false, x: 11, y: 0, rotation: 180 },
  { id: 's-pc4', label: 'PC4', type: 'PC Station', isMaintenance: false, x: 13, y: 1, rotation: 225 },
  // Group 1
  { id: 's-t1-1', label: 'T1-A', type: 'Quiet Zone', isMaintenance: false, x: 11, y: 3, rotation: 180 },
  { id: 's-t1-2', label: 'T1-B', type: 'Quiet Zone', isMaintenance: false, x: 11, y: 5, rotation: 0 },
  { id: 's-t1-3', label: 'T1-C', type: 'Quiet Zone', isMaintenance: false, x: 10, y: 4, rotation: 90 },
  { id: 's-t1-4', label: 'T1-D', type: 'Quiet Zone', isMaintenance: false, x: 12, y: 4, rotation: 270 },
  // Group 2
  { id: 's-t2-1', label: 'T2-A', type: 'Quiet Zone', isMaintenance: false, x: 11, y: 7, rotation: 180 },
  { id: 's-t2-2', label: 'T2-B', type: 'Quiet Zone', isMaintenance: false, x: 11, y: 9, rotation: 0 },
  { id: 's-t2-3', label: 'T2-C', type: 'Quiet Zone', isMaintenance: false, x: 10, y: 8, rotation: 90 },
  { id: 's-t2-4', label: 'T2-D', type: 'Quiet Zone', isMaintenance: false, x: 12, y: 8, rotation: 270 },
  // Carrels
  { id: 's-c1', label: 'C1', type: 'Standard', isMaintenance: false, x: 1, y: 4, rotation: 90 },
  { id: 's-c2', label: 'C2', type: 'Standard', isMaintenance: false, x: 2, y: 4, rotation: 90 },
  { id: 's-c3', label: 'C3', type: 'Standard', isMaintenance: false, x: 3, y: 4, rotation: 90 },
  { id: 's-c4', label: 'C4', type: 'Standard', isMaintenance: false, x: 4, y: 4, rotation: 90 },
  { id: 's-c5', label: 'C5', type: 'Standard', isMaintenance: false, x: 1, y: 6, rotation: 90 },
  { id: 's-c6', label: 'C6', type: 'Standard', isMaintenance: false, x: 2, y: 6, rotation: 90 },
  { id: 's-c7', label: 'C7', type: 'Standard', isMaintenance: false, x: 3, y: 6, rotation: 90 },
  { id: 's-c8', label: 'C8', type: 'Standard', isMaintenance: false, x: 4, y: 6, rotation: 90 },
  { id: 's-c9', label: 'C9', type: 'Standard', isMaintenance: false, x: 1, y: 8, rotation: 90 },
  { id: 's-c10', label: 'C10', type: 'Standard', isMaintenance: false, x: 2, y: 8, rotation: 90 },
  { id: 's-c11', label: 'C11', type: 'Standard', isMaintenance: false, x: 3, y: 8, rotation: 90 },
  { id: 's-c12', label: 'C12', type: 'Standard', isMaintenance: false, x: 4, y: 8, rotation: 90 },
];

const ADMIN_USER = {
  id: 'admin-1',
  name: 'Library Admin',
  email: 'admin@library.edu',
  password: 'admin',
  role: 'ADMIN',
  isBlocked: false
};

const DEMO_STUDENT = {
  id: 'student-1',
  name: 'John Doe',
  email: 'john@student.edu',
  password: 'pass',
  role: 'STUDENT',
  studentId: 'CS2024001',
  department: 'Computer Science',
  yearSection: '3-A',
  mobile: '5550123456',
  isBlocked: false
};

async function seedData() {
  try {
    const seatCount = await Seat.countDocuments();
    if (seatCount === 0) {
      console.log('Seeding Seats...');
      await Seat.insertMany(INITIAL_SEATS);
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding Users...');
      await User.insertMany([ADMIN_USER, DEMO_STUDENT]);
    }
  } catch (e) {
    console.error("Seeding error:", e);
  }
}

// --- API Routes ---

// USERS
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// SEATS
app.get('/api/seats', async (req, res) => {
  try {
    const seats = await Seat.find({});
    res.json(seats);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/seats', async (req, res) => {
  try {
    const seats = req.body;
    const incomingIds = seats.map(s => s.id);
    await Seat.deleteMany({ id: { $nin: incomingIds } });
    for (const seat of seats) {
      await Seat.findOneAndUpdate({ id: seat.id }, seat, { upsert: true });
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/seats/toggle-maintenance/:id', async (req, res) => {
  try {
    const seat = await Seat.findOne({ id: req.params.id });
    if (seat) {
      seat.isMaintenance = !seat.isMaintenance;
      await seat.save();
      res.json(seat);
    } else {
      res.status(404).json({ error: 'Seat not found' });
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// BOOKINGS
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({});
    res.json(bookings);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const newBooking = req.body;
    const existing = await Booking.findOne({
      seatId: newBooking.seatId,
      date: newBooking.date,
      startTime: newBooking.startTime,
      status: 'ACTIVE'
    });

    if (existing) {
      return res.status(409).json({ error: 'Seat already booked' });
    }

    const booking = new Booking(newBooking);
    await booking.save();
    res.status(201).json(booking);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/bookings/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { id: req.params.id }, 
      { status: 'CANCELLED' },
      { new: true }
    );
    res.json(booking);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
