// ===== CRUD DE CLUBES (entidade "carreira") via JSONServer =====
// Operações restritas ao usuário admin (ver auth.js -> isAdmin())

const API_CARREIRA = "/carreira";

// ---------- Requisições à API ----------

async function apiCriarClube(dados) {
  const resposta = await fetch(API_CARREIRA, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!resposta.ok) throw new Error(`Erro ao criar (HTTP ${resposta.status})`);
  return resposta.json();
}

async function apiAtualizarClube(id, dados) {
  const resposta = await fetch(`${API_CARREIRA}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!resposta.ok)
    throw new Error(`Erro ao atualizar (HTTP ${resposta.status})`);
  return resposta.json();
}

async function apiExcluirClube(id) {
  const resposta = await fetch(`${API_CARREIRA}/${id}`, { method: "DELETE" });
  if (!resposta.ok)
    throw new Error(`Erro ao excluir (HTTP ${resposta.status})`);
  return true;
}

// ---------- Modal de criar/editar (usado no index.html) ----------

function criarModalClube() {
  if (document.getElementById("modalClube")) return;

  const modal = document.createElement("div");
  modal.id = "modalClube";
  modal.innerHTML = `
    <div class="modal-overlay" id="modalClubeOverlay">
      <div class="modal-box modal-box-lg">
        <button class="modal-close" id="btnFecharModalClube">&times;</button>
        <h4 class="mb-3" id="tituloModalClube">Adicionar Clube</h4>
        <div id="clubeErro" class="alert alert-danger d-none"></div>

        <input type="hidden" id="clubeId" />

        <div class="row">
          <div class="col-md-8 mb-3">
            <label class="form-label">Clube</label>
            <input type="text" id="clubeNome" class="form-control" placeholder="Ex: Santos" />
          </div>
          <div class="col-md-4 mb-3">
            <label class="form-label">Período</label>
            <input type="text" id="clubePeriodo" class="form-control" placeholder="Ex: 2009 - 2013" />
          </div>
        </div>

        <div class="row">
          <div class="col-3 mb-3">
            <label class="form-label">Jogos</label>
            <input type="number" id="clubeJogos" class="form-control" min="0" />
          </div>
          <div class="col-3 mb-3">
            <label class="form-label">Gols</label>
            <input type="number" id="clubeGols" class="form-control" min="0" />
          </div>
          <div class="col-3 mb-3">
            <label class="form-label">Assist.</label>
            <input type="number" id="clubeAssistencias" class="form-control" min="0" />
          </div>
          <div class="col-3 mb-3">
            <label class="form-label">Títulos</label>
            <input type="number" id="clubeTitulos" class="form-control" min="0" />
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Imagem (caminho)</label>
          <input type="text" id="clubeImagem" class="form-control" placeholder="assets/img/exemplo.jpg" />
        </div>

        <div class="mb-3">
          <label class="form-label">Descrição</label>
          <textarea id="clubeDescricao" class="form-control" rows="3"></textarea>
        </div>

        <button class="btn btn-dark w-100" id="btnSalvarClube">Salvar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document
    .getElementById("btnFecharModalClube")
    .addEventListener("click", fecharModalClube);
  document
    .getElementById("modalClubeOverlay")
    .addEventListener("click", (e) => {
      if (e.target === document.getElementById("modalClubeOverlay"))
        fecharModalClube();
    });
  document
    .getElementById("btnSalvarClube")
    .addEventListener("click", salvarClube);
}

function abrirModalClube(item = null) {
  criarModalClube();

  document.getElementById("tituloModalClube").textContent = item
    ? "Editar Clube"
    : "Adicionar Clube";
  document.getElementById("clubeErro").classList.add("d-none");

  document.getElementById("clubeId").value = item ? item.id : "";
  document.getElementById("clubeNome").value = item ? item.clube : "";
  document.getElementById("clubePeriodo").value = item ? item.periodo : "";
  document.getElementById("clubeJogos").value = item ? item.jogos : "";
  document.getElementById("clubeGols").value = item ? item.gols : "";
  document.getElementById("clubeAssistencias").value = item
    ? item.assistencias
    : "";
  document.getElementById("clubeTitulos").value = item ? item.titulos : "";
  document.getElementById("clubeImagem").value = item ? item.imagem : "";
  document.getElementById("clubeDescricao").value = item ? item.descricao : "";

  document.getElementById("modalClubeOverlay").style.display = "flex";
}

function fecharModalClube() {
  const overlay = document.getElementById("modalClubeOverlay");
  if (overlay) overlay.style.display = "none";
}

async function salvarClube() {
  const erroBox = document.getElementById("clubeErro");
  erroBox.classList.add("d-none");

  const id = document.getElementById("clubeId").value;
  const dados = {
    clube: document.getElementById("clubeNome").value.trim(),
    periodo: document.getElementById("clubePeriodo").value.trim(),
    jogos: Number(document.getElementById("clubeJogos").value) || 0,
    gols: Number(document.getElementById("clubeGols").value) || 0,
    assistencias:
      Number(document.getElementById("clubeAssistencias").value) || 0,
    titulos: Number(document.getElementById("clubeTitulos").value) || 0,
    imagem:
      document.getElementById("clubeImagem").value.trim() ||
      "assets/img/placeholder.jpg",
    descricao: document.getElementById("clubeDescricao").value.trim(),
  };

  if (!dados.clube || !dados.periodo) {
    erroBox.textContent = "Preencha ao menos o nome do clube e o período.";
    erroBox.classList.remove("d-none");
    return;
  }

  try {
    if (id) {
      await apiAtualizarClube(id, { ...dados, id: Number(id) });
      mostrarToast("Clube atualizado com sucesso.");
    } else {
      await apiCriarClube(dados);
      mostrarToast("Clube adicionado com sucesso.");
    }
    fecharModalClube();
    if (typeof carregarCards === "function") carregarCards();
    if (typeof carregarDetalhes === "function") carregarDetalhes();
  } catch (erro) {
    erroBox.textContent =
      "Não foi possível salvar. Verifique se o JSONServer está rodando.";
    erroBox.classList.remove("d-none");
    console.error(erro);
  }
}

// ---------- Botão "Adicionar Clube" no index.html (qualquer usuário logado) ----------

function montarBotaoAdicionar() {
  const container = document.getElementById("acoesAdminCards");
  if (!container) return;

  if (isAdmin()) {
    container.innerHTML = `
      <button class="btn btn-dark mb-3" id="btnAdicionarClube">
        <i class="bi bi-plus-lg me-1"></i>Adicionar Clube
      </button>
    `;
    document
      .getElementById("btnAdicionarClube")
      .addEventListener("click", () => abrirModalClube());
  } else {
    container.innerHTML = "";
  }
}

// ---------- Ações de editar/excluir na página de detalhes.html (qualquer usuário logado) ----------

function montarAcoesDetalhes(item) {
  const container = document.getElementById("acoesAdminDetalhes");
  if (!container) return;

  if (!isAdmin()) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div class="acoes-admin">
      <button class="btn btn-outline-dark" id="btnEditarClube">
        <i class="bi bi-pencil me-1"></i>Editar
      </button>
      <button class="btn btn-outline-danger" id="btnExcluirClube">
        <i class="bi bi-trash me-1"></i>Excluir
      </button>
    </div>
  `;

  document.getElementById("btnEditarClube").addEventListener("click", () => {
    abrirModalClube(item);
  });

  document
    .getElementById("btnExcluirClube")
    .addEventListener("click", async () => {
      const confirmar = confirm(
        `Tem certeza que deseja excluir "${item.clube}"? Essa ação não pode ser desfeita.`,
      );
      if (!confirmar) return;

      try {
        await apiExcluirClube(item.id);
        mostrarToast("Clube excluído com sucesso.");
        window.location.href = "index.html#cards";
      } catch (erro) {
        mostrarToast("Erro ao excluir. Verifique o JSONServer.");
        console.error(erro);
      }
    });
}

// Após salvar uma edição feita a partir da página de detalhes, recarrega os dados
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("modalClubeOverlay");
  if (overlay) return; // evita duplicar listener se já existir
});
