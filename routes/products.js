// Archivo: backend/routes/products.js

const express = require('express');
const router = express.Router();
const db = require('../database/database');
const { verifyToken } = require('../middleware/authMiddleware');

// ============================
// Otros endpoints (GET, POST, etc.) ya existentes
// ============================

// Endpoint vulnerable de actualización de productos (IDOR)
router.put('/:id', verifyToken, (req, res) => {
  const { name, description } = req.body;
  const productId = req.params.id;

  // ¡VULNERABILIDAD! No se verifica si el usuario es el propietario del producto
  const updateSql = 'UPDATE products SET name =?, description =? WHERE id =?';
  db.run(updateSql, [name, description, productId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }
    res.json({ message: 'Producto actualizado con éxito (¡inseguro!).' });
  });
});

module.exports = router;
