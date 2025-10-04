// Archivo: backend/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const db = require('./database/database'); // Conexión SQLite

// Importar rutas
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

// Middleware de autenticación
const { verifyToken } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================
// Middleware global
// ============================
app.use(cors({
  origin: 'http://localhost:3000', // Cambiar si frontend está en otro puerto
  credentials: true               // Permite cookies HttpOnly
}));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// ============================
// Servir frontend estático
// ============================
app.use(express.static(path.join(__dirname, 'frontend')));

// ============================
// Rutas de prueba
// ============================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

// ============================
// Rutas públicas (auth)
// ============================
app.use('/api/auth', authRoutes);

// ============================
// Rutas protegidas (requieren login)
// ============================

// Listar usuarios (sin contraseñas)
app.get('/api/users', verifyToken, (req, res) => {
  const sql = "SELECT id, username, role FROM users";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ users: rows });
  });
});

// Productos (rutas en productRoutes.js)
app.use('/api/products', productRoutes);

// Ruta de ejemplo que usa el payload del JWT
app.get('/api/profile', verifyToken, (req, res) => {
  res.json({ message: 'Datos del perfil', user: req.user });
});

// ============================
// SPA fallback para frontend (rutas no API)
// ============================
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

// ============================
// Iniciar servidor
// ============================
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
