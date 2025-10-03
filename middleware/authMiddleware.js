const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar que el usuario esté autenticado mediante JWT.
 * Extrae el token de la cookie HttpOnly, lo verifica y adjunta la información
 * del usuario al objeto req para usarla en rutas protegidas.
 */
const verifyToken = (req, res, next) => {
  // Obtener token de la cookie 'token'
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
  }

  try {
    // Verificar token usando la clave secreta del .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Agregar payload del token a la solicitud
    req.user = decoded;

    // Continuar con la siguiente función/middleware
    next();
  } catch (error) {
    return res.status(400).json({ error: 'Token inválido.' });
  }
};

module.exports = { verifyToken };
