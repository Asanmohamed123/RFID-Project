router.post('/items', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { item_code, name, description } = req.body;
    
    // Insert with parameterized query
    const [result] = await connection.execute(
      'INSERT INTO items (item_code, name, description) VALUES (?, ?, ?)',
      [item_code, name, description]
    );
    
    await connection.commit();
    
    res.status(201).json({
      id: result.insertId,
      item_code,
      name,
      message: 'Item created successfully'
    });
    
  } catch (error) {
    await connection.rollback();
    
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Item code already exists' });
    } else {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Failed to create item' });
    }
  } finally {
    connection.release();
  }
});