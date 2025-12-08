const express = require('express');
const router = express.Router();

// Register RFID tag
router.post('/register', (req, res) => {
    const { tag_uid, item_code, batch_no, expiry_date } = req.body;
    
    // Check if item exists
    req.db.query('SELECT * FROM items WHERE item_code = ?', [item_code], 
        (err, items) => {
            if (err) return res.status(500).json({ error: err.message });
            if (items.length === 0) {
                return res.status(404).json({ error: 'Item not found' });
            }
            
            // Register tag
            const query = `INSERT INTO rfid_tags (tag_uid, item_code, batch_no, expiry_date) 
                          VALUES (?, ?, ?, ?)`;
            req.db.execute(query, [tag_uid, item_code, batch_no, expiry_date], 
                (err, result) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({
                        message: 'RFID tag registered successfully',
                        tagId: result.insertId
                    });
                });
        });
});

// Receive item
router.post('/receive', (req, res) => {
    const { tag_uid, to_location, quantity } = req.body;
    
    // Check if tag exists
    req.db.query('SELECT * FROM rfid_tags WHERE tag_uid = ?', [tag_uid], 
        (err, tags) => {
            if (err) return res.status(500).json({ error: err.message });
            if (tags.length === 0) {
                return res.status(404).json({ error: 'RFID tag not found' });
            }
            
            // Create receiving movement
            const query = `INSERT INTO tag_movements 
                          (tag_uid, to_location, movement_type, quantity) 
                          VALUES (?, ?, 'RECEIVING', ?)`;
            
            req.db.execute(query, [tag_uid, to_location, quantity], 
                (err, result) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({
                        message: 'Item received successfully',
                        movementId: result.insertId
                    });
                });
        });
});

// Move item
router.post('/move', (req, res) => {
    const { tag_uid, to_location, movement_type, quantity } = req.body;
    
    // Get current location
    req.db.query(`SELECT to_location FROM tag_movements 
                 WHERE tag_uid = ? ORDER BY movement_time DESC LIMIT 1`, 
                 [tag_uid], (err, movements) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const from_location = movements.length > 0 ? movements[0].to_location : null;
        
        // Create movement
        const query = `INSERT INTO tag_movements 
                      (tag_uid, from_location, to_location, movement_type, quantity) 
                      VALUES (?, ?, ?, ?, ?)`;
        
        req.db.execute(query, [tag_uid, from_location, to_location, movement_type || 'MOVE', quantity], 
            (err, result) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({
                    message: 'Item moved successfully',
                    movementId: result.insertId
                });
            });
    });
});

// Search by item code
router.get('/search', (req, res) => {
    const { item_code } = req.query;
    
    const query = `
        SELECT t.*, i.item_name, i.category,
               (SELECT to_location FROM tag_movements 
                WHERE tag_uid = t.tag_uid 
                ORDER BY movement_time DESC LIMIT 1) as current_location
        FROM rfid_tags t
        JOIN items i ON t.item_code = i.item_code
        WHERE t.item_code = ?
    `;
    
    req.db.query(query, [item_code], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Locate by tag UID
router.get('/locate', (req, res) => {
    const { tag_uid } = req.query;
    
    // Get tag details
    req.db.query(`SELECT t., i. FROM rfid_tags t
                 JOIN items i ON t.item_code = i.item_code
                 WHERE t.tag_uid = ?`, [tag_uid], (err, tags) => {
        if (err) return res.status(500).json({ error: err.message });
        if (tags.length === 0) {
            return res.status(404).json({ error: 'Tag not found' });
        }
        
        // Get movement history
        req.db.query(`SELECT * FROM tag_movements 
                     WHERE tag_uid = ? 
                     ORDER BY movement_time DESC`, [tag_uid], 
                     (err, movements) => {
            if (err) return res.status(500).json({ error: err.message });
            
            res.json({
                tag: tags[0],
                current_location: movements.length > 0 ? movements[0].to_location : null,
                movement_history: movements
            });
        });
    });
});

// Get all tags
router.get('/tags', (req, res) => {
    req.db.query('SELECT * FROM rfid_tags', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

module.exports = router;