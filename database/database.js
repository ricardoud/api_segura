const sqlite3 = require('sqlite3').verbose(); // Importa SQLite

// Archivo de base de datos
const DBSOURCE = "database.db";

// Crear la conexión a la base de datos
const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error("No se puede abrir la base de datos:", err.message);
    throw err; // Detiene la ejecución si hay error
  } else {
    console.log("Conectado a la base de datos SQLite.");

    // Ejecutar en serie para asegurar orden
    db.serialize(() => {
      // Activar claves foráneas
      db.run('PRAGMA foreign_keys = ON;');

      // Crear tabla de usuarios si no existe
      db.run(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('user','admin')) DEFAULT 'user'
        )`,
        (err) => {
          if (err) {
            console.error("Error al crear la tabla de usuarios:", err.message);
          }
        }
      );

      // Crear tabla de productos si no existe
      db.run(
        `CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          owner_id INTEGER NOT NULL,
          FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE
        )`,
        (err) => {
          if (err) {
            console.error("Error al crear la tabla de productos:", err.message);
          }
        }
      );
    });
  }
});

// Exportar la conexión para usar en otros módulos
module.exports = db;
