const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const DBSOURCE = "database.db";

const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error("No se puede abrir la base de datos:", err.message);
    throw err;
  } else {
    console.log("Conectado a la base de datos SQLite.");

    db.serialize(() => {
      db.run('PRAGMA foreign_keys = ON;');

      // =========================
      // Crear tabla de usuarios
      // =========================
      db.run(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('user','admin')) DEFAULT 'user'
        )`,
        (err) => {
          if (err) console.error("Error al crear tabla users:", err.message);
        }
      );

      // =========================
      // Crear tabla de productos
      // =========================
      db.run(
        `CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          owner_id INTEGER NOT NULL,
          FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE
        )`,
        (err) => {
          if (err) console.error("Error al crear tabla products:", err.message);
        }
      );

      // =========================
      // Sembrado de datos iniciales
      // =========================
      const saltRounds = 10;
      const adminPassword = 'admin_password_123';
      const userPassword = 'user_password_123';

      // Insertar admin
      bcrypt.hash(adminPassword, saltRounds, (err, adminHash) => {
        if (err) return console.error("Error hash admin:", err);

        const sqlAdmin = 'INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?,?,?)';
        db.run(sqlAdmin, ['admin', adminHash, 'admin']);
      });

      // Insertar user y productos
      bcrypt.hash(userPassword, saltRounds, (err, userHash) => {
        if (err) return console.error("Error hash user:", err);

        const sqlUser = 'INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?,?,?)';
        db.run(sqlUser, ['user', userHash, 'user'], function(err) {
          if (err) return console.error(err.message);

          // Obtener el ID real del usuario, incluso si ya existía
          db.get('SELECT id FROM users WHERE username = ?', ['user'], (err, row) => {
            if (err) return console.error(err.message);

            const userId = row.id;

            // Insertar productos para este usuario
            const sqlProduct = 'INSERT OR IGNORE INTO products (name, description, owner_id) VALUES (?,?,?)';
            db.run(sqlProduct, ['Producto 1', 'Descripción 1', userId]);
            db.run(sqlProduct, ['Producto 2', 'Descripción 2', userId]);
            db.run(sqlProduct, ['Producto 3', 'Descripción 3', userId]);
          });
        });
      });

    }); // fin serialize
  }
});

module.exports = db;
