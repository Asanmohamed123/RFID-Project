const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const itemRoutes = require('./routes/items');
const rfidRoutes = require('./routes/rfid');

const app = express();
const PORT = 3306;

// =============================================
// 1. SERVE FRONTEND STATIC FILES
// =============================================

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'muhammadkhansa',
    database: 'rfid_warehouse'
});

db.connect((err) => {
    if (err) {
        console.error('MySQL connection error:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Make db accessible to routes
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Routes
app.use('/api/items', itemRoutes);
app.use('/api/rfid', rfidRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({
        message: 'RFID Warehouse API',
        version: '1.0.0',
        endpoints: {
            items: '/api/items',
            rfid: '/api/rfid'
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log('Server running on http://localhost:${PORT}');

});
