// ===== LOGIN MODULE =====

// Usuários carregados do JSON (cache em memória)
let _usuarios = null;

async function carregarUsuarios() {
  if (_usuarios) return _usuarios;
  try {
    const resposta = await fetch("/usuarios");
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    _usuarios = await resposta.json();
  } catch (erro) {
    console.error("Erro ao carregar /usuarios:", erro);
    _usuarios = [];
  }
  return _usuarios;
}

function getUsuarioLogado() {
  const dados = sessionStorage.getItem("usuarioLogado");
  return dados ? JSON.parse(dados) : null;
}

async function login(email, senha) {
  const usuarios = await carregarUsuarios();
  const usuario = usuarios.find((u) => u.email === email && u.senha === senha);
  if (usuario) {
    sessionStorage.setItem("usuarioLogado", JSON.stringify(usuario));
    return usuario;
  }
  return null;
}

function logout() {
  sessionStorage.removeItem("usuarioLogado");
  atualizarBarraLogin();
}

// Qualquer usuário logado pode realizar o CRUD de clubes
function isAdmin() {
  return !!getUsuarioLogado();
}

// ===== FAVORITOS =====

function getFavoritosKey(usuarioId) {
  return `favoritos_${usuarioId}`;
}

function getFavoritos(usuarioId) {
  const dados = localStorage.getItem(getFavoritosKey(usuarioId));
  return dados ? JSON.parse(dados).map(Number) : [];
}

function toggleFavorito(usuarioId, itemId) {
  const id = Number(itemId);
  const favs = getFavoritos(usuarioId);
  const idx = favs.indexOf(id);
  if (idx === -1) {
    favs.push(id);
  } else {
    favs.splice(idx, 1);
  }
  localStorage.setItem(getFavoritosKey(usuarioId), JSON.stringify(favs));
  return favs;
}

function isFavorito(usuarioId, itemId) {
  return getFavoritos(usuarioId).includes(Number(itemId));
}

// ===== MODAL DE LOGIN =====

function criarModalLogin() {
  if (document.getElementById("modalLogin")) return;

  const modal = document.createElement("div");
  modal.id = "modalLogin";
  modal.innerHTML = `
    <div class="modal-overlay" id="modalOverlay">
      <div class="modal-box">
        <button class="modal-close" id="btnFecharModal">&times;</button>
        <h4 class="mb-3">Entrar</h4>
        <div id="loginErro" class="alert alert-danger d-none">E-mail ou senha incorretos.</div>
        <div class="mb-3">
          <label class="form-label">E-mail</label>
          <input type="email" id="loginEmail" class="form-control" placeholder="seu@email.com" />
        </div>
        <div class="mb-3">
          <label class="form-label">Senha</label>
          <input type="password" id="loginSenha" class="form-control" placeholder="Senha" />
        </div>
        <button class="btn btn-dark w-100" id="btnConfirmarLogin">Entrar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document
    .getElementById("btnFecharModal")
    .addEventListener("click", fecharModal);
  document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("modalOverlay")) fecharModal();
  });
  document
    .getElementById("btnConfirmarLogin")
    .addEventListener("click", async () => {
      const email = document.getElementById("loginEmail").value.trim();
      const senha = document.getElementById("loginSenha").value.trim();
      const usuario = await login(email, senha);
      if (usuario) {
        fecharModal();
        atualizarBarraLogin();
        if (typeof onLoginSucesso === "function") onLoginSucesso(usuario);
      } else {
        document.getElementById("loginErro").classList.remove("d-none");
      }
    });
  document.getElementById("loginSenha").addEventListener("keypress", (e) => {
    if (e.key === "Enter") document.getElementById("btnConfirmarLogin").click();
  });
}

function abrirModal() {
  criarModalLogin();
  document.getElementById("modalOverlay").style.display = "flex";
}

function fecharModal() {
  const overlay = document.getElementById("modalOverlay");
  if (overlay) overlay.style.display = "none";
  const erro = document.getElementById("loginErro");
  if (erro) erro.classList.add("d-none");
}

// ===== BARRA DE LOGIN NA NAVBAR =====

function atualizarBarraLogin() {
  const container = document.getElementById("loginArea");
  if (!container) return;
  const usuario = getUsuarioLogado();
  if (usuario) {
    container.innerHTML = `
      <span class="nav-link text-white">Olá, <strong>${usuario.nome.split(" ")[0]}</strong></span>
      <a href="favoritos.html" class="nav-link"><i class="bi bi-bookmark me-1"></i>Meus Favoritos</a>
      <a href="#" class="nav-link" id="btnLogout">Sair</a>
    `;
    document.getElementById("btnLogout").addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  } else {
    container.innerHTML = `<a href="#" class="nav-link" id="btnEntrar">Entrar</a>`;
    document.getElementById("btnEntrar").addEventListener("click", (e) => {
      e.preventDefault();
      abrirModal();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  atualizarBarraLogin();
});
