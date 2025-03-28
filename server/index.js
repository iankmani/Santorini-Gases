require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const mpesaRoutes = require('./routes/mpesaRoutes');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Test database connection
prisma.$connect()
  .then(() => console.log('Connected to PostgreSQL via Prisma'))
  .catch(err => console.error('Prisma connection error:', err));

// Routes
app.use('/api/mpesa', mpesaRoutes);

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});