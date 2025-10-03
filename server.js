require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const db = require('./database/database'); // Conexión a SQLite

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de la aplicación segura funcionando correctamente.' });
});

// Ejemplo de ruta para listar usuarios
app.get('/users', (req, res) => {
  const sql = "SELECT id, username, role FROM users";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ users: rows });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
