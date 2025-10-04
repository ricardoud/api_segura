// Archivo: backend/routes/users.js

const express = require('express');
const router = express.Router();
const db = require('../database/database');
const { verifyToken } = require('../middleware/authMiddleware');

// Endpoint para eliminar un usuario (¡vulnerable!)
router.delete('/:id', verifyToken, (req, res) => {
  const userIdToDelete = req.params.id;

  // ¡VULNERABILIDAD! Solo verifica que el usuario esté autenticado,
  // pero no se comprueba su rol. Cualquier usuario puede eliminar a otro.
  const sql = 'DELETE FROM users WHERE id = ?';
  db.run(sql, [userIdToDelete], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json({ message: `Usuario con ID ${userIdToDelete} eliminado con éxito.` });
  });
});

module.exports = router;
