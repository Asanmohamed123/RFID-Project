const express = require('express');
const router = express.Router();

// Create item
router.post('/', (req, res) => {
    const { item_code, item_name, description, category, unit_price } = req.body;
    
    const query = `INSERT INTO items (item_code, item_name, description, category, unit_price) 
                   VALUES (?, ?, ?, ?, ?)`;
    
    req.db.execute(query, [item_code, item_name, description, category, unit_price], 
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({
                message: 'Item created successfully',
                itemId: result.insertId
            });
        });
});

// Get all items
router.get('/', (req, res) => {
    const query = 'SELECT * FROM items ORDER BY created_at DESC';
    req.db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Get single item
router.get('/:item_code', (req, res) => {
    const query = 'SELECT * FROM items WHERE item_code = ?';
    req.db.query(query, [req.params.item_code], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(results[0]);
    });
});

module.exports = router;