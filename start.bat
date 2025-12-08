@echo off
echo ========================================
echo STARTING RFID WAREHOUSE API - EMERGENCY
echo ========================================

REM Create package.json if missing
if not exist "package.json" (
    echo Creating package.json...
    echo { "name": "rfid-api", "version": "1.0.0", "main": "server.js" } > package.json
)

REM Create simple server.js
echo Creating server.js...
echo const express = require^('express'^); > server.js
echo const app = express^(^); >> server.js
echo const PORT = 3306; >> server.js
echo app.use^(express.json^(^)^); >> server.js
echo app.get^('/', ^(req, res^) => { res.json^({message: 'API WORKING'}^)^}^); >> server.js
echo app.post^('/items', ^(req, res^) => { res.status^(201^).json^({success: true}^)^}^); >> server.js
echo app.listen^(PORT, ^(^) => { console.log^('Server running on port ' + PORT^)^}^); >> server.js

REM Install express
echo Installing dependencies...
call npm install express --no-save

REM Start server
echo ========================================
echo 🚀 STARTING SERVER...
echo 🌐 Open: http://localhost:3306
echo ========================================
node server.js