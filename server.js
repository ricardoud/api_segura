require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const db = require('./database/database'); // Conexión SQLite
const authRoutes = require('./routes/auth'); // Rutas de autenticación

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Rutas de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando correctamente.' });
});

app.get('/users', (req, res) => {
  const sql = "SELECT id, username, role FROM users";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ users: rows });
  });
});

app.get('/products', (req, res) => {
  const sql = "SELECT * FROM products";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ products: rows });
  });
});

// ============================
// Rutas de autenticación
// ============================
app.use('/auth', authRoutes);

// ============================
// Iniciar servidor
// ============================
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
