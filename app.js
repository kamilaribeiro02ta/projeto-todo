const STORAGE_KEY = "cinecrud_filmes";

const filmesIniciais = [
  {
    id: "filme-1",
    titulo: "Interestelar",
    genero: "Ficção científica",
    ano: 2014,
    nota: 8.7,
    poster: "",
    sinopse: "Exploradores viajam por um buraco de minhoca em busca de um novo lar para a humanidade."
  },
  {
    id: "filme-2",
    titulo: "Homem-Aranha no Aranhaverso",
    genero: "Animação",
    ano: 2018,
    nota: 8.4,
    poster: "",
    sinopse: "Miles Morales descobre que não é o único Homem-Aranha e precisa aprender a assumir seu papel."
  }
];

function gerarId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return "filme-" + Date.now();
}

function lerFilmes() {
  const dados = localStorage.getItem(STORAGE_KEY);

  if (!dados) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filmesIniciais));
    return filmesIniciais;
  }

  try {
    return JSON.parse(dados);
  } catch {
    return [];
  }
}

function salvarFilmes(filmes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filmes));
}

function escapar(texto = "") {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function mostrarToast(mensagem) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = mensagem;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

function renderizarLista(filtro = "") {
  const lista = document.querySelector("#listaFilmes");
  if (!lista) return;

  const filmes = lerFilmes();
  const termo = filtro.trim().toLowerCase();
  const filtrados = filmes.filter((filme) =>
    filme.titulo.toLowerCase().includes(termo)
  );

  document.querySelector("#totalFilmes").textContent = filmes.length;

  const vazio = document.querySelector("#estadoVazio");
  vazio.hidden = filtrados.length > 0;

  lista.innerHTML = filtrados.map((filme) => {
    const poster = filme.poster
      ? '<img class="poster" src="' + escapar(filme.poster) + '" alt="Pôster de ' + escapar(filme.titulo) + '">'
      : '<div class="poster-fallback">Sem pôster</div>';

    return `
      <article class="movie-card">
        ${poster}
        <div class="movie-body">
          <div class="movie-meta">
            <span>${escapar(filme.genero)}</span>
            <span>•</span>
            <span>${filme.ano}</span>
            <span class="score">★ ${Number(filme.nota).toFixed(1)}</span>
          </div>
          <h3>${escapar(filme.titulo)}</h3>
          <p>${escapar(filme.sinopse)}</p>

          <div class="card-actions">
            <a class="btn btn-secondary" href="editar.html?id=${filme.id}">Editar</a>
            <button class="btn btn-danger" data-apagar="${filme.id}">Apagar</button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  lista.querySelectorAll("[data-apagar]").forEach((botao) => {
    botao.addEventListener("click", () => apagarFilme(botao.dataset.apagar));
  });
}

function apagarFilme(id) {
  const filmes = lerFilmes();
  const filme = filmes.find((item) => item.id === id);
  if (!filme) return;

  const confirmou = confirm('Deseja realmente apagar "' + filme.titulo + '"?');
  if (!confirmou) return;

  salvarFilmes(filmes.filter((item) => item.id !== id));
  renderizarLista(document.querySelector("#busca")?.value || "");
  mostrarToast("Filme apagado com sucesso.");
}

function coletarFormulario() {
  return {
    titulo: document.querySelector("#titulo").value.trim(),
    genero: document.querySelector("#genero").value.trim(),
    ano: Number(document.querySelector("#ano").value),
    nota: Number(document.querySelector("#nota").value),
    poster: document.querySelector("#poster").value.trim(),
    sinopse: document.querySelector("#sinopse").value.trim()
  };
}

function iniciarCadastro() {
  const form = document.querySelector("#formCadastro");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const filmes = lerFilmes();
    filmes.push({
      id: gerarId(),
      ...coletarFormulario()
    });

    salvarFilmes(filmes);
    window.location.href = "index.html";
  });
}

function iniciarEdicao() {
  const form = document.querySelector("#formEdicao");
  if (!form) return;

  const id = new URLSearchParams(window.location.search).get("id");
  const filmes = lerFilmes();
  const filme = filmes.find((item) => item.id === id);

  if (!filme) {
    alert("Filme não encontrado.");
    window.location.href = "index.html";
    return;
  }

  document.querySelector("#titulo").value = filme.titulo;
  document.querySelector("#genero").value = filme.genero;
  document.querySelector("#ano").value = filme.ano;
  document.querySelector("#nota").value = filme.nota;
  document.querySelector("#poster").value = filme.poster || "";
  document.querySelector("#sinopse").value = filme.sinopse;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const atualizados = filmes.map((item) =>
      item.id === id ? { ...item, ...coletarFormulario() } : item
    );

    salvarFilmes(atualizados);
    window.location.href = "index.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderizarLista();
  iniciarCadastro();
  iniciarEdicao();

  const busca = document.querySelector("#busca");
  if (busca) {
    busca.addEventListener("input", () => renderizarLista(busca.value));
  }
});