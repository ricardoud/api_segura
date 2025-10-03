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
