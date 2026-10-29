// ===== Configuração =====
// Endereço da sua API (ex.: rota do Laravel que retorna os relógios do banco)
const WATCHES_API_URL = "/api/watches";

// Os relógios vêm do banco de dados; começam vazios e são preenchidos pela API.
// Campos esperados em cada item:
// { id, name, type, price, gender: "male" | "female", face, rim, hand, tick }
let watches = [];
let activeFilter = "all";
let cartItems = [];

const productGrid = document.getElementById("productGrid");

const formatPrice = (value) =>
  Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

// ===== Busca no banco (via API) =====
async function loadWatches() {
  showStatus("Carregando relógios...");
  try {
    const response = await fetch(WATCHES_API_URL, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    watches = await response.json();
    renderProducts();
  } catch (error) {
    console.error("Erro ao carregar relógios:", error);
    showStatus("Não foi possível carregar os relógios. Tente novamente em instantes.");
  }
}

function showStatus(message) {
  productGrid.innerHTML = `<p class="status">${message}</p>`;
}

// Evita injetar HTML vindo do banco na página
const escapeHtml = (text) =>
  String(text ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

// ===== Vitrine =====
function renderProducts() {
  const visibleWatches = activeFilter === "all"
    ? watches
    : watches.filter((item) => item.gender === activeFilter);

  if (visibleWatches.length === 0) {
    showStatus("Nenhum relógio encontrado nesta categoria.");
    return;
  }

  productGrid.innerHTML = visibleWatches.map((item) => `
    <article class="product">
      <div class="dial" style="--face:${escapeHtml(item.face)};--rim:${escapeHtml(item.rim)};--hand:${escapeHtml(item.hand)};--tick:${escapeHtml(item.tick)}" role="img" aria-label="${escapeHtml(item.name)}">
        <div class="hand h" style="transform:rotate(305deg)"></div>
        <div class="hand m" style="transform:rotate(60deg)"></div>
        <div class="pin"></div>
      </div>
      <h3>${escapeHtml(item.name)}</h3>
      <p class="meta">${escapeHtml(item.type)}</p>
      <div class="buy">
        <span class="price">${formatPrice(item.price)}</span>
        <button class="add" type="button" data-id="${escapeHtml(item.id)}">Adicionar</button>
      </div>
    </article>`).join("");
}

// ===== Filtros (botões, menu e hero) =====
function setFilter(filter) {
  activeFilter = filter;
  document.querySelectorAll(".filter").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === filter);
  });
  renderProducts();
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-filter]");
  if (trigger) setFilter(trigger.dataset.filter);
});

// ===== Carrinho (em memória) =====
function updateCart() {
  document.getElementById("cartCount").textContent = cartItems.length;
}

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".add");
  if (!button) return;
  const watch = watches.find((item) => String(item.id) === button.dataset.id);
  if (watch) cartItems.push(watch);
  button.textContent = "Adicionado";
  setTimeout(() => { button.textContent = "Adicionar"; }, 1200);
  updateCart();
});

// ===== Marcadores e números do mostrador =====
function renderDialMarkers() {
  const dial = document.getElementById("heroDial");
  const numberRadius = 26; // distância dos números ao centro, em % do mostrador
  let markup = "";
  for (let hour = 1; hour <= 12; hour++) {
    const degrees = hour * 30;
    const radians = (degrees * Math.PI) / 180;
    const left = 50 + numberRadius * Math.sin(radians);
    const top = 50 - numberRadius * Math.cos(radians);
    const quarterClass = hour % 3 === 0 ? " is-quarter" : "";
    markup += `<span class="baton${quarterClass}" style="--angle:${degrees}deg" aria-hidden="true"></span>`;
    markup += `<span class="dial-number" style="left:${left.toFixed(2)}%;top:${top.toFixed(2)}%" aria-hidden="true">${hour}</span>`;
  }
  // Entram antes dos ponteiros para ficar por baixo deles
  dial.insertAdjacentHTML("afterbegin", markup);
}

// ===== Relógio ao vivo (horário de Brasília) =====
const CLOCK_TIME_ZONE = "America/Sao_Paulo";

// Formata a hora sempre no fuso de Brasília, não importa onde o visitante esteja
const brazilTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: CLOCK_TIME_ZONE,
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hourCycle: "h23"
});

function getBrazilTime() {
  const now = new Date();
  const parts = brazilTimeFormatter.formatToParts(now);
  const read = (type) => Number(parts.find((part) => part.type === type).value);
  return {
    hours: read("hour"),
    minutes: read("minute"),
    seconds: read("second") + now.getMilliseconds() / 1000
  };
}

function tickClock() {
  const time = getBrazilTime();
  const minutes = time.minutes + time.seconds / 60;
  const hours = (time.hours % 12) + minutes / 60;
  document.getElementById("secondHand").style.transform = `rotate(${time.seconds * 6}deg)`;
  document.getElementById("minuteHand").style.transform = `rotate(${minutes * 6}deg)`;
  document.getElementById("hourHand").style.transform = `rotate(${hours * 30}deg)`;
}
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
tickClock();
setInterval(tickClock, reduceMotion ? 1000 : 100);

renderDialMarkers();
loadWatches();