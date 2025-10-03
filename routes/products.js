const express = require('express');
const router = express.Router();
const db = require('../database/database');
const { verifyToken } = require('../middleware/authMiddleware');

// ============================
// Obtener todos los productos (público)
// ============================
router.get('/', (req, res) => {
  const sql = `
    SELECT p.id, p.name, p.description, u.username AS owner
    FROM products p
    JOIN users u ON p.owner_id = u.id
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ products: rows });
  });
});

// ============================
// Obtener productos del usuario autenticado
// ============================
router.get('/my', verifyToken, (req, res) => {
  const sql = "SELECT * FROM products WHERE owner_id = ?";
  db.all(sql, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ myProducts: rows });
  });
});

// ============================
// Crear un nuevo producto
// ============================
router.post('/', verifyToken, (req, res) => {
  const { name, description } = req.body;
  const owner_id = req.user.id;

  if (!name) return res.status(400).json({ error: "El nombre del producto es requerido." });

  const sql = 'INSERT INTO products (name, description, owner_id) VALUES (?, ?, ?)';
  db.run(sql, [name, description, owner_id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, name, description, owner_id });
  });
});

// ============================
// Actualizar un producto
// ============================
router.put('/:id', verifyToken, (req, res) => {
  const { name, description } = req.body;
  const productId = req.params.id;
  const userId = req.user.id;

  const checkOwnerSql = 'SELECT owner_id FROM products WHERE id = ?';
  db.get(checkOwnerSql, [productId], (err, product) => {
    if (err || !product) return res.status(404).json({ error: 'Producto no encontrado.' });
    if (product.owner_id !== userId) return res.status(403).json({ error: 'No autorizado para modificar este producto.' });

    const updateSql = 'UPDATE products SET name = ?, description = ? WHERE id = ?';
    db.run(updateSql, [name, description, productId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Producto actualizado con éxito.', changes: this.changes });
    });
  });
});

// ============================
// Eliminar un producto
// ============================
router.delete('/:id', verifyToken, (req, res) => {
  const productId = req.params.id;
  const userId = req.user.id;

  const checkOwnerSql = 'SELECT owner_id FROM products WHERE id = ?';
  db.get(checkOwnerSql, [productId], (err, product) => {
    if (err || !product) return res.status(404).json({ error: 'Producto no encontrado.' });
    if (product.owner_id !== userId) return res.status(403).json({ error: 'No autorizado para eliminar este producto.' });

    const deleteSql = 'DELETE FROM products WHERE id = ?';
    db.run(deleteSql, [productId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Producto eliminado con éxito.', changes: this.changes });
    });
  });
});

module.exports = router;
