require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
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
// Iniciar servidor
// ============================
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
