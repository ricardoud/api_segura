require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const db = require('./database/database'); // Conexión SQLite
const authRoutes = require('./routes/auth'); // Rutas de autenticación
const { verifyToken } = require('./middleware/authMiddleware'); // Middleware JWT

const app = express();
const PORT = process.env.PORT || 3000;

// ============================
// Middleware global
// ============================
app.use(cors({
  origin: 'http://localhost:3000', // Cambiar según el front-end
  credentials: true               // Permite cookies en CORS
}));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// ============================
// Rutas de prueba
// ============================
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando correctamente.' });
});

// ============================
// Rutas públicas
// ============================
// Autenticación
app.use('/auth', authRoutes);

// ============================
// Rutas protegidas (requieren login)
// ============================

// Listar usuarios (sin contraseñas)
app.get('/users', verifyToken, (req, res) => {
  const sql = "SELECT id, username, role FROM users";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ users: rows });
  });
});

// Listar productos
app.get('/products', verifyToken, (req, res) => {
  const sql = "SELECT * FROM products";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ products: rows });
  });
});

// Ruta de ejemplo que usa el payload del JWT
app.get('/profile', verifyToken, (req, res) => {
  res.json({ message: 'Datos del perfil', user: req.user });
});

// ============================
// Iniciar servidor
// ============================
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
