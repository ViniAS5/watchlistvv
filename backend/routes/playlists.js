const express = require('express');
const router = express.Router();
const { run, get, all } = require('../database');
const { authenticateToken } = require('../auth');

// ===== ROTAS DA BIBLIOTECA =====

// Buscar biblioteca do usuário
router.get('/library', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const videos = await all(
      'SELECT * FROM libraries WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    // Converter tags de string para array
    const videosComTags = videos.map(video => ({
      ...video,
      tags: JSON.parse(video.tags || '[]')
    }));

    res.json(videosComTags);
  } catch (error) {
    console.error('Erro ao buscar biblioteca:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Adicionar vídeo à biblioteca
router.post('/library', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { video_id, title, duration, tags, comment } = req.body;

    if (!video_id || !title || !duration || !tags) {
      return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
    }

    // Verificar se o vídeo já existe na biblioteca
    const existingVideo = await get(
      'SELECT id FROM libraries WHERE user_id = ? AND video_id = ?',
      [userId, video_id]
    );

    if (existingVideo) {
      return res.status(400).json({ error: 'Este vídeo já está na sua biblioteca' });
    }

    // Inserir vídeo na biblioteca
    const result = await run(
      'INSERT INTO libraries (user_id, video_id, title, duration, tags, comment) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, video_id, title, duration, JSON.stringify(tags), comment || '']
    );

    res.status(201).json({ 
      message: 'Vídeo adicionado à biblioteca',
      id: result.id 
    });

  } catch (error) {
    console.error('Erro ao adicionar à biblioteca:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar vídeo da biblioteca
router.put('/library/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const libraryId = req.params.id;
    const { title, tags, comment } = req.body;

    // Verificar se o vídeo pertence ao usuário
    const video = await get(
      'SELECT * FROM libraries WHERE id = ? AND user_id = ?',
      [libraryId, userId]
    );

    if (!video) {
      return res.status(404).json({ error: 'Vídeo não encontrado' });
    }

    // Atualizar vídeo
    await run(
      'UPDATE libraries SET title = ?, tags = ?, comment = ? WHERE id = ?',
      [title, JSON.stringify(tags), comment || '', libraryId]
    );

    res.json({ message: 'Vídeo atualizado com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar vídeo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Remover vídeo da biblioteca
router.delete('/library/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const libraryId = req.params.id;

    // Verificar se o vídeo pertence ao usuário
    const video = await get(
      'SELECT video_id FROM libraries WHERE id = ? AND user_id = ?',
      [libraryId, userId]
    );

    if (!video) {
      return res.status(404).json({ error: 'Vídeo não encontrado' });
    }

    // Remover da biblioteca
    await run('DELETE FROM libraries WHERE id = ?', [libraryId]);

    // Remover da playlist se estiver lá
    await run(
      'DELETE FROM playlists WHERE user_id = ? AND video_id = ?',
      [userId, video.video_id]
    );

    res.json({ message: 'Vídeo removido com sucesso' });

  } catch (error) {
    console.error('Erro ao remover vídeo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===== ROTAS DA PLAYLIST =====

// Buscar playlist do usuário
router.get('/playlist', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const videos = await all(
      'SELECT * FROM playlists WHERE user_id = ? ORDER BY position ASC',
      [userId]
    );

    res.json(videos);
  } catch (error) {
    console.error('Erro ao buscar playlist:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Adicionar vídeo à playlist
router.post('/playlist', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { video_id, title, duration } = req.body;

    if (!video_id || !title || !duration) {
      return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
    }

    // Verificar se o vídeo já está na playlist
    const existingVideo = await get(
      'SELECT id FROM playlists WHERE user_id = ? AND video_id = ?',
      [userId, video_id]
    );

    if (existingVideo) {
      return res.status(400).json({ error: 'Este vídeo já está na playlist' });
    }

    // Pegar a próxima posição
    const lastPosition = await get(
      'SELECT MAX(position) as maxPos FROM playlists WHERE user_id = ?',
      [userId]
    );
    const nextPosition = (lastPosition?.maxPos || 0) + 1;

    // Inserir vídeo na playlist
    const result = await run(
      'INSERT INTO playlists (user_id, video_id, title, duration, position) VALUES (?, ?, ?, ?, ?)',
      [userId, video_id, title, duration, nextPosition]
    );

    res.status(201).json({ 
      message: 'Vídeo adicionado à playlist',
      id: result.id 
    });

  } catch (error) {
    console.error('Erro ao adicionar à playlist:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Remover vídeo da playlist
router.delete('/playlist/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const playlistId = req.params.id;

    // Verificar se o vídeo pertence ao usuário
    const video = await get(
      'SELECT position FROM playlists WHERE id = ? AND user_id = ?',
      [playlistId, userId]
    );

    if (!video) {
      return res.status(404).json({ error: 'Vídeo não encontrado' });
    }

    // Remover da playlist
    await run('DELETE FROM playlists WHERE id = ?', [playlistId]);

    // Reorganizar posições
    await run(
      'UPDATE playlists SET position = position - 1 WHERE user_id = ? AND position > ?',
      [userId, video.position]
    );

    res.json({ message: 'Vídeo removido da playlist' });

  } catch (error) {
    console.error('Erro ao remover da playlist:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Limpar playlist
router.delete('/playlist', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await run('DELETE FROM playlists WHERE user_id = ?', [userId]);

    res.json({ message: 'Playlist limpa com sucesso' });

  } catch (error) {
    console.error('Erro ao limpar playlist:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 