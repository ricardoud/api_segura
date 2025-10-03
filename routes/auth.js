const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/database');

// ============================
// Endpoint: Registro de usuario
// ============================
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Se requieren nombre de usuario y contraseña.' });
  }

  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) return res.status(500).json({ error: 'Error al hashear la contraseña.' });

    const sql = 'INSERT INTO users (username, password_hash) VALUES (?,?)';
    const params = [username, hash];

    db.run(sql, params, function(err) {
      if (err) {
        return res.status(400).json({ error: 'El nombre de usuario ya existe.' });
      }
      res.status(201).json({
        message: 'Usuario registrado con éxito.',
        userId: this.lastID
      });
    });
  });
});

// ============================
// Endpoint: Login de usuario
// ============================
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Se requieren nombre de usuario y contraseña.' });
  }

  const sql = 'SELECT * FROM users WHERE username = ?';
  db.get(sql, [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado.' });

    // Comparar contraseña
    bcrypt.compare(password, user.password_hash, (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al verificar la contraseña.' });
      if (!result) return res.status(401).json({ error: 'Contraseña incorrecta.' });

      // Generar token JWT
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({
        message: 'Login exitoso.',
        token
      });
    });
  });
});

module.exports = router;
