const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Chave secreta para JWT (em produção, use uma variável de ambiente)
const JWT_SECRET = 'sua_chave_secreta_muito_segura_aqui_2024';

// Middleware para verificar token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso necessário' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado' });
    }
    req.user = user;
    next();
  });
}

// Gerar token JWT
function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      name: user.name 
    }, 
    JWT_SECRET, 
    { expiresIn: '7d' }
  );
}

// Hash de senha
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Verificar senha
async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

module.exports = {
  authenticateToken,
  generateToken,
  hashPassword,
  verifyPassword,
  JWT_SECRET
}; 