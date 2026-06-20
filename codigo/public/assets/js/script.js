// Callback chamado pelo auth.js após login bem-sucedido
function onLoginSucesso(usuario) {
  mostrarToast(`Bem-vindo, ${usuario.nome.split(" ")[0]}!`);
  carregarDados();
}

function mostrarToast(msg) {
  const toast = document.getElementById("toastFeedback");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("visivel");
  setTimeout(() => toast.classList.remove("visivel"), 2500);
}

const ICONE_FAV_VAZIO = `<i class="bi bi-bookmark icone-fav"></i>`;
const ICONE_FAV_CHEIO = `<i class="bi bi-bookmark-fill icone-fav"></i>`;
const BADGE_FAV       = `<span class="badge-fav"><i class="bi bi-bookmark-fill me-1"></i>Favorito</span>`;

// PÁGINA: INDEX — cards com favoritar
async function carregarCards() {
  const cardsContainer = document.getElementById("cards-container");
  if (!cardsContainer) return;

  const resposta = await fetch("/carreira");
  const carreira = await resposta.json();

  if (typeof montarBotaoAdicionar === "function") montarBotaoAdicionar();

  const pesquisa = document.getElementById("pesquisa");

  function mostrarCards(lista) {
    const usuario = getUsuarioLogado();
    cardsContainer.innerHTML = "";

    lista.forEach((item) => {
      const favoritado = usuario ? isFavorito(usuario.id, item.id) : false;
      const cardClass = favoritado
        ? "card h-100 rounded-4 overflow-hidden card-favoritado"
        : "card h-100 rounded-4 overflow-hidden";

      cardsContainer.innerHTML += `
        <div class="col-md-4 mb-4">
          <div class="${cardClass}" id="card-${item.id}">
            <div class="position-relative">
              <img src="${item.imagem}" class="card-img-top">
              ${favoritado ? BADGE_FAV : ""}
            </div>
            <div class="card-body d-flex flex-column">
              <div class="d-flex justify-content-between align-items-start mb-1">
                <h3 class="mb-0">${item.clube}</h3>
                <button
                  class="btn-favorito ${favoritado ? "favoritado" : ""}"
                  data-id="${item.id}"
                  title="${favoritado ? "Remover dos favoritos" : "Adicionar aos favoritos"}"
                >
                  ${favoritado ? ICONE_FAV_CHEIO : ICONE_FAV_VAZIO}
                </button>
              </div>
              <p><strong>Período:</strong> ${item.periodo}</p>
              <p><strong>Gols:</strong> ${item.gols}</p>
              <p>${item.descricao.substring(0, 80)}...</p>
              <a href="detalhes.html?id=${item.id}" class="btn btn-dark mt-auto">Ver detalhes</a>
            </div>
          </div>
        </div>
      `;
    });

    cardsContainer.querySelectorAll(".btn-favorito").forEach((btn) => {
      btn.addEventListener("click", () => {
        const usuario = getUsuarioLogado();
        const id = Number(btn.dataset.id);

        if (!usuario) {
          mostrarToast("Faça login para favoritar.");
          abrirModal();
          return;
        }

        const favs = toggleFavorito(usuario.id, id);
        const agora = favs.includes(id);

        const card = document.getElementById(`card-${id}`);
        btn.classList.toggle("favoritado", agora);
        btn.innerHTML = agora ? ICONE_FAV_CHEIO : ICONE_FAV_VAZIO;
        btn.title = agora ? "Remover dos favoritos" : "Adicionar aos favoritos";
        card.classList.toggle("card-favoritado", agora);

        const imgWrapper = card.querySelector(".position-relative");
        let badge = imgWrapper.querySelector(".badge-fav");
        if (agora && !badge) {
          imgWrapper.insertAdjacentHTML("beforeend", BADGE_FAV);
        } else if (!agora && badge) {
          badge.remove();
        }

        mostrarToast(agora ? "Adicionado aos favoritos." : "Removido dos favoritos.");
      });
    });
  }

  mostrarCards(carreira);

  if (pesquisa) {
    pesquisa.addEventListener("input", () => {
      const texto = pesquisa.value.toLowerCase();
      mostrarCards(carreira.filter((item) =>
        item.clube.toLowerCase().includes(texto)
      ));
    });
  }
}

// PÁGINA: DETALHES
async function carregarDetalhes() {
  const detalhes = document.getElementById("detalhes");
  if (!detalhes) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const [respostaCarreira, respostaFotos] = await Promise.all([
    fetch(`/carreira/${id}`),
    fetch(`/fotos?carreiraId=${id}`)
  ]);

  if (!respostaCarreira.ok) {
    detalhes.innerHTML = `<div class="alert alert-danger">Item não encontrado.</div>`;
    return;
  }

  const item = await respostaCarreira.json();
  const fotos = await respostaFotos.json();

  detalhes.innerHTML = `
    <div class="row align-items-center">
      <div class="col-md-6 mb-4">
        <img src="${item.imagem}" class="img-fluid rounded-4 shadow">
      </div>
      <div class="col-md-6">
        <h1 class="mb-4">${item.clube}</h1>
        <p><strong>Período:</strong> ${item.periodo}</p>
        <p><strong>Jogos:</strong> ${item.jogos}</p>
        <p><strong>Gols:</strong> ${item.gols}</p>
        <p><strong>Assistências:</strong> ${item.assistencias}</p>
        <p><strong>Títulos:</strong> ${item.titulos}</p>
        <p>${item.descricao}</p>
        <div id="acoesAdminDetalhes"></div>
      </div>
    </div>
    <hr class="my-5">
    <h2 class="mb-4">Fotos Relacionadas</h2>
    <div class="row">
      ${fotos.map((foto) => `
        <div class="col-md-4 mb-4">
          <div class="card rounded-4 overflow-hidden h-100">
            <img src="${foto.imagem}" class="card-img-top">
            <div class="card-body"><h5>${foto.titulo}</h5></div>
          </div>
        </div>
      `).join("")}
    </div>
  `;

  if (typeof montarAcoesDetalhes === "function") montarAcoesDetalhes(item);
}

// PÁGINA: FAVORITOS
async function carregarFavoritos() {
  const favContainer = document.getElementById("favoritos-container");
  if (!favContainer) return;

  const tituloFav = document.getElementById("tituloFavoritos");
  const usuario = getUsuarioLogado();

  if (!usuario) {
    favContainer.innerHTML = `
      <div class="col-12">
        <div class="alert alert-warning">
          Você precisa estar logado para ver seus favoritos.
          <a href="#" class="alert-link" id="linkLoginFav">Entrar</a>
        </div>
      </div>`;
    document.getElementById("linkLoginFav")?.addEventListener("click", (e) => {
      e.preventDefault();
      abrirModal();
    });
    return;
  }

  const favIds = getFavoritos(usuario.id);

  if (favIds.length === 0) {
    if (tituloFav) tituloFav.textContent = "Meus Favoritos (0)";
    favContainer.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info">
          Você ainda não tem favoritos. <a href="index.html#cards" class="alert-link">Explore os clubes</a> e favorite os que mais gostar!
        </div>
      </div>`;
    return;
  }

  // Busca apenas os itens favoritados usando os ids
  const respostas = await Promise.all(favIds.map((id) => fetch(`/carreira/${id}`)));
  const itensFav = await Promise.all(respostas.map((r) => r.json()));

  if (tituloFav) tituloFav.textContent = `Meus Favoritos (${itensFav.length})`;

  favContainer.innerHTML = itensFav.map((item) => `
    <div class="col-md-4 mb-4">
      <div class="card h-100 rounded-4 overflow-hidden card-favoritado" id="favcard-${item.id}">
        <div class="position-relative">
          <img src="${item.imagem}" class="card-img-top">
          ${BADGE_FAV}
        </div>
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start mb-1">
            <h3 class="mb-0">${item.clube}</h3>
            <button class="btn-favorito favoritado btn-remover-fav" data-id="${item.id}" title="Remover dos favoritos">
              ${ICONE_FAV_CHEIO}
            </button>
          </div>
          <p><strong>Período:</strong> ${item.periodo}</p>
          <p><strong>Gols:</strong> ${item.gols}</p>
          <p>${item.descricao.substring(0, 80)}...</p>
          <a href="detalhes.html?id=${item.id}" class="btn btn-dark mt-auto">Ver detalhes</a>
        </div>
      </div>
    </div>
  `).join("");

  favContainer.querySelectorAll(".btn-remover-fav").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      toggleFavorito(usuario.id, id);
      document.getElementById(`favcard-${id}`)?.closest(".col-md-4")?.remove();
      const restantes = favContainer.querySelectorAll(".col-md-4").length;
      if (tituloFav) tituloFav.textContent = `Meus Favoritos (${restantes})`;
      if (restantes === 0) {
        favContainer.innerHTML = `
          <div class="col-12">
            <div class="alert alert-info">
              Você ainda não tem favoritos. <a href="index.html#cards" class="alert-link">Explore os clubes</a>!
            </div>
          </div>`;
      }
      mostrarToast("Removido dos favoritos.");
    });
  });
}

// INICIALIZAÇÃO — cada função verifica se está na página certa
function carregarDados() {
  carregarCards();
  carregarDetalhes();
  carregarFavoritos();
}

carregarDados();