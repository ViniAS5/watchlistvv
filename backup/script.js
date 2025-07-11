
// 🔑 Cole sua chave da YouTube Data API v3 aqui:
const API_KEY = "AIzaSyA9dJltKZbDF-pGPtMPDNHEtCKq8K2-zjU";

let playlist = [];
let biblioteca = [];
let currentIndex = 0;
let player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    videoId: '',
    events: {
      'onReady': () => {
        document.getElementById("play-button").addEventListener("click", () => {
          if (playlist.length > 0) {
            document.getElementById("player-cover").style.display = "none";
            player.loadVideoById(playlist[0].id);
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
      player.loadVideoById(playlist[currentIndex].id);
    }
  }
}

function adicionarVideo() {
  const url = document.getElementById("video-url").value.trim();
  const id = extrairVideoID(url);
  if (!id) {
    alert("URL inválida");
    return;
  }

  fetch(`https://www.googleapis.com/youtube/v3/videos?id=${id}&part=snippet,contentDetails&key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      if (!data.items || data.items.length === 0) {
        alert("Vídeo não encontrado");
        return;
      }

      const info = data.items[0];
      const titulo = info.snippet.title;
      const duracaoISO = info.contentDetails.duration;
      const duracaoSegundos = converterISODurationParaSegundos(duracaoISO);

      const video = { id, titulo, duracao: duracaoSegundos };
      playlist.push(video);
      atualizarInterface();
      document.getElementById("video-url").value = "";
    });
}

function atualizarInterface() {
  localStorage.setItem("playlist", JSON.stringify(playlist));

  document.getElementById("video-info").innerText = `${playlist.length} vídeo${playlist.length !== 1 ? 's' : ''} na lista`;
  const totalSegundos = playlist.reduce((acc, v) => acc + v.duracao, 0);
  document.getElementById("total-time").innerText = "Duração total: " + formatarTempo(totalSegundos);

  const lista = document.getElementById("playlist");
  lista.innerHTML = "";
  playlist.forEach((video, index) => {
    const item = document.createElement("div");
    item.innerHTML = `
      <div style="
        position: relative; 
        width: 140px; 
        background: white; 
        border-radius: 12px; 
        padding: 10px; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        margin-bottom: 15px;
      ">
        <div style="position: absolute; top: -5px; right: -5px; z-index: 10;">
          <button onclick="toggleMenu(this)" style="
            background: #333; 
            border: none; 
            font-size: 16px; 
            cursor: pointer; 
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">⋮</button>
          <div class="menu" style="display:none; position:fixed; background:white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border-radius: 8px; z-index:99999; min-width: 120px; border: 1px solid #ddd;">
            <button onclick="marcarComoAssistido(${index})" style="display:block; padding: 8px 12px; width: 100%; border: none; background: white; cursor: pointer; border-radius: 8px 8px 0 0; text-align: left; color: #333;">✅ Marcar como Visto</button>
            <button onclick="removerDaFila(${index})" style="display:block; padding: 8px 12px; width: 100%; border: none; background: white; cursor: pointer; border-radius: 0 0 8px 8px; text-align: left; color: #333;">🗑️ Remover da Fila</button>
          </div>
        </div>
        <img src="https://img.youtube.com/vi/${video.id}/0.jpg" style="width: 120px; border-radius: 8px; cursor: pointer;" onclick="tocarVideo(${index})" />
        <div style="text-align: center; font-size: 12px; margin-top: 8px; color: #333; font-weight: 500; line-height: 1.3;">${video.titulo}</div>
      </div>
    `;
    lista.appendChild(item);
  });
}

function tocarVideo(index) {
  currentIndex = index;
  document.getElementById("player-cover").style.display = "none";
  player.loadVideoById(playlist[index].id);
}

function removerVideo(index) {
  playlist.splice(index, 1);
  atualizarInterface();
}

function removerDaFila(index) {
  playlist.splice(index, 1);
  localStorage.setItem("playlist", JSON.stringify(playlist));
  atualizarInterface();
}

function marcarComoAssistido(index) {
  const video = playlist[index];
  
  // Adicionar tag "assistido" ao vídeo na biblioteca
  const videoNaBiblioteca = biblioteca.find(v => v.id === video.id);
  if (videoNaBiblioteca && !videoNaBiblioteca.tags.includes('assistido')) {
    videoNaBiblioteca.tags.push('assistido');
    localStorage.setItem("biblioteca", JSON.stringify(biblioteca));
    atualizarBiblioteca();
  }
  
  // Remover da playlist
  playlist.splice(index, 1);
  localStorage.setItem("playlist", JSON.stringify(playlist));
  atualizarInterface();
}

function limparPlaylist() {
  playlist = [];
  localStorage.removeItem("playlist");
  atualizarInterface();
}

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
  const min = Math.floor(segundos / 60);
  const sec = segundos % 60;
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

window.addEventListener("DOMContentLoaded", () => {
  const dadosSalvos = localStorage.getItem("playlist");
  const dadosBiblioteca = localStorage.getItem("biblioteca");
  if (dadosSalvos) playlist = JSON.parse(dadosSalvos);
  if (dadosBiblioteca) biblioteca = JSON.parse(dadosBiblioteca);
  atualizarInterface();
  atualizarBiblioteca();
});


function toggleMenu(btn) {
  // Fechar todos os menus primeiro
  const allMenus = document.querySelectorAll('.menu');
  allMenus.forEach(m => m.style.display = 'none');
  
  // Encontrar o menu deste botão
  const menu = btn.nextElementSibling;
  
  if (menu && menu.classList.contains('menu')) {
    // Alternar visibilidade
    if (menu.style.display === 'none' || menu.style.display === '') {
      // Calcular posição do botão
      const btnRect = btn.getBoundingClientRect();
      
      // Verificar se é menu da playlist (tem botão "Remover da Fila")
      const isPlaylistMenu = menu.innerHTML.includes('Remover da Fila');
      
      if (isPlaylistMenu) {
        // Menu da playlist: posicionar ao lado direito
        menu.style.left = (btnRect.right + 10) + 'px';
      } else {
        // Menu da biblioteca: posicionar ao lado esquerdo
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

document.addEventListener("click", () => {
  document.querySelectorAll(".menu").forEach(m => m.style.display = "none");
});

function adicionarABiblioteca() {
  const url = document.getElementById("library-url").value.trim();
  const tags = document.getElementById("library-tags").value.trim();
  const id = extrairVideoID(url);
  
  if (!id) {
    alert("URL inválida");
    return;
  }
  
  if (!tags) {
    alert("Por favor, adicione pelo menos uma tag");
    return;
  }

  fetch(`https://www.googleapis.com/youtube/v3/videos?id=${id}&part=snippet,contentDetails&key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      if (!data.items || data.items.length === 0) {
        alert("Vídeo não encontrado");
        return;
      }

      const info = data.items[0];
      const titulo = info.snippet.title;
      const duracaoISO = info.contentDetails.duration;
      const duracaoSegundos = converterISODurationParaSegundos(duracaoISO);

      const video = { 
        id, 
        titulo, 
        duracao: duracaoSegundos, 
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        comentario: ""
      };
      
      biblioteca.push(video);
      localStorage.setItem("biblioteca", JSON.stringify(biblioteca));
      atualizarBiblioteca();
      
      document.getElementById("library-url").value = "";
      document.getElementById("library-tags").value = "";
    });
}

function atualizarBiblioteca() {
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
    item.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    `;
    
    item.innerHTML = `
      <div style="display: flex; gap: 10px; align-items: center;">
        <img src="https://img.youtube.com/vi/${video.id}/0.jpg" style="width: 60px; height: 45px; border-radius: 4px; object-fit: cover;" />
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 12px; font-weight: bold; color: #333; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${video.titulo}</div>
          <div style="font-size: 10px; color: #666; margin-bottom: 4px;">${formatarTempo(video.duracao)}</div>
          <div style="font-size: 10px; color: #007bff;">
            ${video.tags.map(tag => `<span style="background: #e3f2fd; padding: 2px 6px; border-radius: 10px; margin-right: 4px;">${tag}</span>`).join('')}
          </div>
          ${video.comentario ? `<div style="font-size: 10px; color: #666; font-style: italic; margin-top: 2px;">💬 ${video.comentario}</div>` : ''}
        </div>
        <div style="position: relative;">
          <button onclick="toggleMenu(this)" style="
            background: #333; 
            border: none; 
            font-size: 12px; 
            cursor: pointer; 
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          ">⋮</button>
          <div class="menu" style="display:none; position:fixed; background:white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border-radius: 6px; z-index:99999; min-width: 120px; border: 1px solid #ddd;">
            <button onclick="editarVideo(${videoIndex})" style="display:block; padding: 8px 12px; width: 100%; border: none; background: white; cursor: pointer; border-radius: 6px 6px 0 0; text-align: left; font-size: 12px; color: #333;">✏️ Editar</button>
            <button onclick="adicionarAFila(${videoIndex})" style="display:block; padding: 8px 12px; width: 100%; border: none; background: white; cursor: pointer; text-align: left; font-size: 12px; color: #333;">+ Adicionar à Fila</button>
            <button onclick="marcarBibliotecaComoAssistido(${videoIndex})" style="display:block; padding: 8px 12px; width: 100%; border: none; background: white; cursor: pointer; text-align: left; font-size: 12px; color: #333;">✅ Marcar Assistido</button>
            <button onclick="removerDaBiblioteca(${videoIndex})" style="display:block; padding: 8px 12px; width: 100%; border: none; background: white; cursor: pointer; border-radius: 0 0 6px 6px; text-align: left; font-size: 12px; color: #333;">🗑️ Remover</button>
          </div>
        </div>
      </div>
    `;
    
    bibliotecaDiv.appendChild(item);
  });
}

function adicionarAFila(index) {
  const video = biblioteca[index];
  
  // Verificar se o vídeo já está na playlist
  const jaNaPlaylist = playlist.find(v => v.id === video.id);
  if (jaNaPlaylist) {
    alert('Este vídeo já está na playlist!');
    return;
  }
  
  playlist.push({
    id: video.id,
    titulo: video.titulo,
    duracao: video.duracao
  });
  atualizarInterface();
}

function filtrarPorTag() {
  atualizarBiblioteca();
}

function editarVideo(index) {
  const video = biblioteca[index];
  
  // Criar modal de edição
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
        <img src="https://img.youtube.com/vi/${video.id}/0.jpg" style="width: 120px; height: 90px; border-radius: 8px; object-fit: cover;" />
        <div style="flex: 1;">
          <div style="font-weight: bold; margin-bottom: 8px;">Título:</div>
          <input id="edit-titulo" type="text" value="${video.titulo}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 10px;" />
          
          <div style="font-weight: bold; margin-bottom: 8px;">Tags:</div>
          <input id="edit-tags" type="text" value="${video.tags.join(', ')}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 10px;" />
          
          <div style="font-weight: bold; margin-bottom: 8px;">Comentário:</div>
          <textarea id="edit-comentario" placeholder="Adicione um comentário sobre o vídeo..." style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; height: 60px; resize: vertical;">${video.comentario || ''}</textarea>
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
  
  // Fechar modal ao clicar fora
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

function salvarEdicao(index) {
  const titulo = document.getElementById('edit-titulo').value.trim();
  const tags = document.getElementById('edit-tags').value.trim();
  const comentario = document.getElementById('edit-comentario').value.trim();
  
  if (!titulo) {
    alert('Por favor, insira um título');
    return;
  }
  
  if (!tags) {
    alert('Por favor, insira pelo menos uma tag');
    return;
  }
  
  biblioteca[index] = {
    ...biblioteca[index],
    titulo: titulo,
    tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
    comentario: comentario
  };
  
  localStorage.setItem("biblioteca", JSON.stringify(biblioteca));
  atualizarBiblioteca();
  fecharModal();
}

function removerDaBiblioteca(index) {
  if (confirm('Tem certeza que deseja remover este vídeo da biblioteca?')) {
    const video = biblioteca[index];
    
    // Remover da biblioteca
    biblioteca.splice(index, 1);
    localStorage.setItem("biblioteca", JSON.stringify(biblioteca));
    
    // Remover da playlist se estiver lá
    const indexNaPlaylist = playlist.findIndex(v => v.id === video.id);
    if (indexNaPlaylist !== -1) {
      playlist.splice(indexNaPlaylist, 1);
      localStorage.setItem("playlist", JSON.stringify(playlist));
      atualizarInterface();
    }
    
    atualizarBiblioteca();
  }
}

function marcarBibliotecaComoAssistido(index) {
  const video = biblioteca[index];
  
  // Adicionar tag "assistido" se não existir
  if (!video.tags.includes('assistido')) {
    video.tags.push('assistido');
    localStorage.setItem("biblioteca", JSON.stringify(biblioteca));
    atualizarBiblioteca();
  }
}
