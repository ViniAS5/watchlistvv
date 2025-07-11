const express = require('express');
const router = express.Router();
const { run, get } = require('../database');
const { generateToken, hashPassword, verifyPassword } = require('../auth');

// Rota de registro
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validações básicas
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
    }

    // Verificar se o email já existe
    const existingUser = await get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Este email já está cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Inserir usuário
    const result = await run(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    );

    // Buscar usuário criado
    const newUser = await get('SELECT id, email, name FROM users WHERE id = ?', [result.id]);

    // Gerar token
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Usuário criado com sucesso!',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      },
      token
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validações básicas
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Verificar senha
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Gerar token
    const token = generateToken(user);

    res.json({
      message: 'Login realizado com sucesso!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para verificar token (opcional)
router.get('/verify', (req, res) => {
  res.json({ message: 'Token válido' });
});

module.exports = router; 