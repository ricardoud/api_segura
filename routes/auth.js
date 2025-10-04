// Archivo: backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/database');

// ============================
// Registro de usuario
// ============================
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Se requieren nombre de usuario y contraseña.' });
  }

  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: 'Error al hashear la contraseña.' });
    }

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
// Inicio de sesión
// ============================
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Se requieren nombre de usuario y contraseña.' });
  }

  const sql = 'SELECT * FROM users WHERE username = ?';
  db.get(sql, [username], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    bcrypt.compare(password, user.password_hash, (err, result) => {
      if (err || !result) {
        return res.status(401).json({ error: 'Credenciales inválidas.' });
      }

      // Credenciales válidas, generar JWT
      const payload = { id: user.id, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      res.status(200).json({ message: 'Inicio de sesión exitoso.' });
    });
  });
});

// ============================
// Logout
// ============================
router.post('/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0)
  });
  res.status(200).json({ message: 'Sesión cerrada con éxito.' });
});

module.exports = router;
