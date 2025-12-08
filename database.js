const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',      
    user: process.env.DB_USER || 'root',           
    password: process.env.DB_PASSWORD || 'muhammadkhansa',   
    database: process.env.DB_NAME || 'rfid_warehouse',  
    waitForConnections: true,
    connectionLimit: 10,     
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

module.exports = pool;

// Try to connect
db.connect((err) => {
    if (err) {
        console.error('❌ Cannot connect to database:', err.message);
        console.log('💡 TIP: Check if MySQL is running and password is correct');
        return;
    }
    console.log('✅ Connected to MySQL database successfully!');
});

// Make db available to other files

module.exports = db;


