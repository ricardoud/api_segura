// Cargar variables de entorno
require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

// Conexión a la base de datos (se creará después)
const db = require('./database/database'); 

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

// Levantar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
const sqlite3 = require('sqlite3').verbose();
const DBSOURCE = "database.db";

const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  } else {
    console.log('Conectado a la base de datos SQLite.');
    db.serialize(() => {
      db.run('PRAGMA foreign_keys = ON;');

      // Tabla de usuarios
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user','admin')) DEFAULT 'user'
      )`, (err) => {
        if (err) console.error("Error al crear la tabla de usuarios:", err.message);
      });

      // Tabla de productos
      db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        owner_id INTEGER NOT NULL,
        FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE
      )`, (err) => {
        if (err) console.error("Error al crear la tabla de productos:", err.message);
      });
    });
  }
});

module.exports = db;
