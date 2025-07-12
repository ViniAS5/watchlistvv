// 🔑 Cole sua chave da YouTube Data API v3 aqui:
const API_KEY = "AIzaSyA9dJltKZbDF-pGPtMPDNHEtCKq8K2-zjU";

// Configurações da API
const API_BASE_URL = 'https://listo.watch/api';

// Estado da aplicação
let currentUser = null;
let authToken = null;
let playlist = [];
let biblioteca = [];
let currentIndex = 0;
let player;

// ===== FUNÇÕES DE AUTENTICAÇÃO =====

// Verificar se há token salvo
function checkAuth() {
  const savedToken = localStorage.getItem('authToken');
  const savedUser = localStorage.getItem('user');
  
  if (savedToken && savedUser) {
    authToken = savedToken;
    currentUser = JSON.parse(savedUser);
    showMainInterface();
    loadUserData();
  } else {
    showAuthInterface();
  }
}

// Mostrar interface de autenticação
function showAuthInterface() {
  document.getElementById('auth-container').style.display = 'flex';
  document.getElementById('main-interface').style.display = 'none';
}

// Mostrar interface principal
function showMainInterface() {
  document.getElementById('auth-container').style.display = 'none';
  document.getElementById('main-interface').style.display = 'block';
  document.getElementById('user-name').textContent = currentUser.name;
}

// Fazer login
async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro no login');
    }

    // Salvar dados do usuário
    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('user', JSON.stringify(currentUser));

    showMainInterface();
    loadUserData();
    showMessage('Login realizado com sucesso!', 'success');

  } catch (error) {
    showMessage(error.message, 'error');
  }
}

// Registrar usuário
async function register(name, email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro no registro');
    }

    // Salvar dados do usuário
    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('user', JSON.stringify(currentUser));

    showMainInterface();
    loadUserData();
    showMessage('Conta criada com sucesso!', 'success');

  } catch (error) {
    showMessage(error.message, 'error');
  }
}

// Fazer logout
function logout() {
  authToken = null;
  currentUser = null;
  playlist = [];
  biblioteca = [];
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  showAuthInterface();
}

// Mostrar mensagens
function showMessage(message, type) {
  const errorDiv = document.getElementById('error-message');
  const successDiv = document.getElementById('success-message');

  if (type === 'error') {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    successDiv.style.display = 'none';
  } else {
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    errorDiv.style.display = 'none';
  }

  setTimeout(() => {
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
  }, 5000);
}

// ===== FUNÇÕES DE CARREGAMENTO DE DADOS =====

// Carregar dados do usuário
async function loadUserData() {
  await Promise.all([
    loadPlaylist(),
    loadBiblioteca()
  ]);
}

// Carregar playlist do usuário
async function loadPlaylist() {
  try {
    const response = await fetch(`${API_BASE_URL}/playlist`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.ok) {
      playlist = await response.json();
      atualizarInterface();
    }
  } catch (error) {
    console.error('Erro ao carregar playlist:', error);
  }
}

// Carregar biblioteca do usuário
async function loadBiblioteca() {
  try {
    const response = await fetch(`${API_BASE_URL}/library`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.ok) {
      biblioteca = await response.json();
      atualizarBiblioteca();
    }
  } catch (error) {
    console.error('Erro ao carregar biblioteca:', error);
  }
}

// ===== FUNÇÕES DO YOUTUBE PLAYER =====

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
     height: '100%',
    width: '100%',
    videoId: '',
    events: {
      'onReady': () => {
        document.getElementById("play-button").addEventListener("click", () => {
          if (playlist.length > 0) {
            document.getElementById("player-cover").style.display = "none";
            player.loadVideoById(playlist[0].video_id);
          }
        });
      },
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    currentIndex++;
    if (currentIndex < playlist.length) {
      player.loadVideoById(playlist[currentIndex].video_id);
    }
  }
}

// ===== FUNÇÕES DA BIBLIOTECA =====

async function adicionarABiblioteca() {
  const url = document.getElementById("library-url").value.trim();
  const tags = document.getElementById("library-tags").value.trim();
  const id = extrairVideoID(url);
  
  if (!id) {
    showMessage("URL inválida", 'error');
    return;
  }
  
  if (!tags) {
    showMessage("Por favor, adicione pelo menos uma tag", 'error');
    return;
  }

  try {
    // Buscar informações do vídeo
    const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${id}&part=snippet,contentDetails&key=${API_KEY}`);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      showMessage("Vídeo não encontrado", 'error');
      return;
    }

    const info = data.items[0];
    const titulo = info.snippet.title;
    const duracaoISO = info.contentDetails.duration;
    const duracaoSegundos = converterISODurationParaSegundos(duracaoISO);

    // Adicionar à biblioteca via API
    const libraryResponse = await fetch(`${API_BASE_URL}/library`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        video_id: id,
        title: titulo,
        duration: duracaoSegundos,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        comment: ""
      })
    });

    if (libraryResponse.ok) {
      await loadBiblioteca();
      document.getElementById("library-url").value = "";
      document.getElementById("library-tags").value = "";
      showMessage("Vídeo adicionado à biblioteca!", 'success');
    } else {
      const errorData = await libraryResponse.json();
      showMessage(errorData.error || "Erro ao adicionar vídeo", 'error');
    }

  } catch (error) {
    showMessage("Erro ao adicionar vídeo", 'error');
  }
}

async function atualizarBiblioteca() {
  const bibliotecaDiv = document.getElementById("biblioteca");
  const filterSelect = document.getElementById("filter-tags");
  const filtroAtual = filterSelect.value;
  
  // Atualizar opções do filtro
  const todasTags = new Set();
  biblioteca.forEach(video => {
    video.tags.forEach(tag => todasTags.add(tag));
  });
  
  filterSelect.innerHTML = '<option value="">Todas as categorias</option>';
  Array.from(todasTags).sort().forEach(tag => {
    filterSelect.innerHTML += `<option value="${tag}">${tag}</option>`;
  });
  filterSelect.value = filtroAtual;
  
  // Filtrar vídeos
  const videosFiltrados = filtroAtual 
    ? biblioteca.filter(video => video.tags.includes(filtroAtual))
    : biblioteca;
  
  bibliotecaDiv.innerHTML = "";
  
  if (videosFiltrados.length === 0) {
    bibliotecaDiv.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">Nenhum vídeo encontrado</p>';
    return;
  }
  
  videosFiltrados.forEach((video, index) => {
    const videoIndex = biblioteca.findIndex(v => v.id === video.id);
    const item = document.createElement("div");
    item.className = "library-item";
    
    item.innerHTML = `
      <div class="library-item-content">
        <img src="https://img.youtube.com/vi/${video.video_id}/0.jpg" class="library-thumb" />
        <div class="library-info">
          <div class="library-title">${video.title}</div>
          <div class="library-duration">${formatarTempo(video.duration)}</div>
          <div class="library-tags">
            ${video.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
          ${video.comment ? `<div class="library-comment">💬 ${video.comment}</div>` : ''}
        </div>
      </div>
      <button onclick="toggleMenu(this)" class="menu-btn">⋮</button>
      <div class="menu">
        <button onclick="editarVideo(${videoIndex})">✏️ Editar</button>
        <button onclick="adicionarAFila(${videoIndex})">+ Adicionar à Fila</button>
        <button onclick="marcarBibliotecaComoAssistido(${videoIndex})">✅ Marcar Assistido</button>
        <button onclick="removerDaBiblioteca(${videoIndex})">🗑️ Remover</button>
      </div>
    `;
    
    bibliotecaDiv.appendChild(item);
  });
}

async function adicionarAFila(index) {
  const video = biblioteca[index];
  
  try {
    const response = await fetch(`${API_BASE_URL}/playlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        video_id: video.video_id,
        title: video.title,
        duration: video.duration
      })
    });

    if (response.ok) {
      await loadPlaylist();
      showMessage("Vídeo adicionado à fila!", 'success');
    } else {
      const errorData = await response.json();
      showMessage(errorData.error || "Erro ao adicionar à fila", 'error');
    }
  } catch (error) {
    showMessage("Erro ao adicionar à fila", 'error');
  }
}

async function removerDaBiblioteca(index) {
  const video = biblioteca[index];
  
  if (confirm('Tem certeza que deseja remover este vídeo da biblioteca?')) {
    try {
      const response = await fetch(`${API_BASE_URL}/library/${video.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        await loadBiblioteca();
        await loadPlaylist(); // Recarregar playlist caso o vídeo tenha sido removido dela
        showMessage("Vídeo removido da biblioteca", 'success');
      } else {
        showMessage("Erro ao remover vídeo", 'error');
      }
    } catch (error) {
      showMessage("Erro ao remover vídeo", 'error');
    }
  }
}

async function marcarBibliotecaComoAssistido(index) {
  const video = biblioteca[index];
  
  if (!video.tags.includes('assistido')) {
    try {
      const response = await fetch(`${API_BASE_URL}/library/${video.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: video.title,
          tags: [...video.tags, 'assistido'],
          comment: video.comment || ''
        })
      });

      if (response.ok) {
        await loadBiblioteca();
        showMessage("Vídeo marcado como assistido", 'success');
      } else {
        showMessage("Erro ao marcar vídeo", 'error');
      }
    } catch (error) {
      showMessage("Erro ao marcar vídeo", 'error');
    }
  }
}

// ===== FUNÇÕES DA PLAYLIST =====

async function atualizarInterface() {
  document.getElementById("video-info").innerText = `${playlist.length} vídeo${playlist.length !== 1 ? 's' : ''} na lista`;
  const totalSegundos = playlist.reduce((acc, v) => acc + v.duration, 0);
  document.getElementById("total-time").innerText = "Duração total: " + formatarTempo(totalSegundos);

  const lista = document.getElementById("playlist");
  lista.innerHTML = "";
  
  playlist.forEach((video, index) => {
    const item = document.createElement("div");
    item.className = "video-card";
    
    item.innerHTML = `
      <button onclick="toggleMenu(this)" class="menu-btn">⋮</button>
      <div class="menu">
        <button onclick="marcarComoAssistido(${index})">✅ Marcar como Visto</button>
        <button onclick="removerDaFila(${index})">🗑️ Remover da Fila</button>
      </div>
      <img src="https://img.youtube.com/vi/${video.video_id}/0.jpg" class="video-thumb" onclick="tocarVideo(${index})" />
      <div class="video-title">${video.title}</div>
    `;
    
    lista.appendChild(item);
  });
}

async function tocarVideo(index) {
  currentIndex = index;
  document.getElementById("player-cover").style.display = "none";
  player.loadVideoById(playlist[index].video_id);
}

async function removerDaFila(index) {
  const video = playlist[index];
  
  try {
    const response = await fetch(`${API_BASE_URL}/playlist/${video.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.ok) {
      await loadPlaylist();
      showMessage("Vídeo removido da fila", 'success');
    } else {
      showMessage("Erro ao remover vídeo", 'error');
    }
  } catch (error) {
    showMessage("Erro ao remover vídeo", 'error');
  }
}

async function marcarComoAssistido(index) {
  const video = playlist[index];
  
  // Marcar como assistido na biblioteca
  const videoNaBiblioteca = biblioteca.find(v => v.video_id === video.video_id);
  if (videoNaBiblioteca && !videoNaBiblioteca.tags.includes('assistido')) {
    try {
      const response = await fetch(`${API_BASE_URL}/library/${videoNaBiblioteca.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: videoNaBiblioteca.title,
          tags: [...videoNaBiblioteca.tags, 'assistido'],
          comment: videoNaBiblioteca.comment || ''
        })
      });

      if (response.ok) {
        await loadBiblioteca();
      }
    } catch (error) {
      console.error('Erro ao marcar como assistido:', error);
    }
  }
  
  // Remover da playlist
  await removerDaFila(index);
}

async function limparPlaylist() {
  if (confirm('Tem certeza que deseja limpar toda a playlist?')) {
    try {
      const response = await fetch(`${API_BASE_URL}/playlist`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        await loadPlaylist();
        showMessage("Playlist limpa com sucesso", 'success');
      } else {
        showMessage("Erro ao limpar playlist", 'error');
      }
    } catch (error) {
      showMessage("Erro ao limpar playlist", 'error');
    }
  }
}

// ===== FUNÇÕES AUXILIARES =====

function extrairVideoID(url) {
  const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[1].length === 11 ? match[1] : null;
}

function converterISODurationParaSegundos(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const horas = parseInt(match[1]) || 0;
  const minutos = parseInt(match[2]) || 0;
  const segundos = parseInt(match[3]) || 0;
  return horas * 3600 + minutos * 60 + segundos;
}

function formatarTempo(segundos) {
  const horas = Math.floor(segundos / 3600);
  const min = Math.floor((segundos % 3600) / 60);
  const sec = segundos % 60;
  
  if (horas > 0) {
    return `${horas}:${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
  }
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function toggleMenu(btn) {
  // Fechar todos os menus primeiro
  const allMenus = document.querySelectorAll('.menu');
  allMenus.forEach(m => m.style.display = 'none');
  
  // Encontrar o menu deste botão
  const menu = btn.nextElementSibling;
  
  if (menu && menu.classList.contains('menu')) {
    if (menu.style.display === 'none' || menu.style.display === '') {
      const btnRect = btn.getBoundingClientRect();
      const isPlaylistMenu = menu.innerHTML.includes('Remover da Fila');
      
      if (isPlaylistMenu) {
        menu.style.left = (btnRect.right + 10) + 'px';
      } else {
        menu.style.left = (btnRect.left - menu.offsetWidth - 10) + 'px';
      }
      
      menu.style.top = btnRect.top + 'px';
      menu.style.display = 'block';
    } else {
      menu.style.display = 'none';
    }
  }
  
  event.stopPropagation();
}

function filtrarPorTag() {
  atualizarBiblioteca();
}

// ===== FUNÇÕES DE EDIÇÃO =====

function editarVideo(index) {
  const video = biblioteca[index];
  
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      border-radius: 12px;
      padding: 25px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    ">
      <h3 style="margin-top: 0; color: #333; display: flex; align-items: center; gap: 10px;">
        <span>✏️</span> Editar Vídeo
      </h3>
      
      <div style="display: flex; gap: 15px; margin-bottom: 20px;">
        <img src="https://img.youtube.com/vi/${video.video_id}/0.jpg" style="width: 120px; height: 90px; border-radius: 8px; object-fit: cover;" />
        <div style="flex: 1;">
          <div style="font-weight: bold; margin-bottom: 8px;">Título:</div>
          <input id="edit-titulo" type="text" value="${video.title}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 10px;" />
          
          <div style="font-weight: bold; margin-bottom: 8px;">Tags:</div>
          <input id="edit-tags" type="text" value="${video.tags.join(', ')}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 10px;" />
          
          <div style="font-weight: bold; margin-bottom: 8px;">Comentário:</div>
          <textarea id="edit-comentario" placeholder="Adicione um comentário sobre o vídeo..." style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; height: 60px; resize: vertical;">${video.comment || ''}</textarea>
        </div>
      </div>
      
      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button onclick="fecharModal()" style="
          padding: 10px 20px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        ">Cancelar</button>
        <button onclick="salvarEdicao(${index})" style="
          padding: 10px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        ">Salvar</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      fecharModal();
    }
  });
}

function fecharModal() {
  const modal = document.querySelector('div[style*="position: fixed"]');
  if (modal) {
    modal.remove();
  }
}

async function salvarEdicao(index) {
  const titulo = document.getElementById('edit-titulo').value.trim();
  const tags = document.getElementById('edit-tags').value.trim();
  const comentario = document.getElementById('edit-comentario').value.trim();
  
  if (!titulo) {
    showMessage('Por favor, insira um título', 'error');
    return;
  }
  
  if (!tags) {
    showMessage('Por favor, insira pelo menos uma tag', 'error');
    return;
  }
  
  const video = biblioteca[index];
  
  try {
    const response = await fetch(`${API_BASE_URL}/library/${video.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        title: titulo,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        comment: comentario
      })
    });

    if (response.ok) {
      await loadBiblioteca();
      fecharModal();
      showMessage("Vídeo atualizado com sucesso", 'success');
    } else {
      showMessage("Erro ao atualizar vídeo", 'error');
    }
  } catch (error) {
    showMessage("Erro ao atualizar vídeo", 'error');
  }
}

// ===== EVENT LISTENERS =====

document.addEventListener("click", () => {
  document.querySelectorAll(".menu").forEach(m => m.style.display = "none");
});

// Event listeners para autenticação
document.getElementById('show-register').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'flex';
  document.getElementById('register-switch').style.display = 'block';
  document.querySelector('.auth-switch').style.display = 'none';
});

document.getElementById('show-login').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('register-switch').style.display = 'none';
  document.getElementById('login-form').style.display = 'flex';
  document.querySelector('.auth-switch').style.display = 'block';
});

document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  login(email, password);
});

document.getElementById('register-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  register(name, email, password);
});

// Inicializar aplicação
window.addEventListener("DOMContentLoaded", () => {
  checkAuth();
}); 
