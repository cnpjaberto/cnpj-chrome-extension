// Popup: lê os CNPJs detectados pela aba ativa, busca dados básicos
// na Minha Receita e expõe ações para abrir no cnpjaberto.com.br e reportar bug.

const CNPJABERTO_URL = "https://cnpjaberto.com.br/cnpj/";
const MINHARECEITA_URL = "https://minhareceita.org/";

const $ = (id) => document.getElementById(id);

function onlyDigits(s) { return String(s).replace(/\D+/g, ""); }

function formatCnpj(d) {
  const x = onlyDigits(d).padStart(14, "0").slice(-14);
  return `${x.slice(0, 2)}.${x.slice(2, 5)}.${x.slice(5, 8)}/${x.slice(8, 12)}-${x.slice(12, 14)}`;
}

function formatDateBR(iso) {
  if (!iso) return "—";
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

function showToast(text) {
  const el = $("toast");
  el.textContent = text;
  el.classList.remove("hidden");
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.classList.add("hidden"), 200);
  }, 2000);
}

function setState({ empty, list }) {
  $("empty").classList.toggle("hidden", !empty);
  $("list").classList.toggle("hidden", !list);
}

async function getActiveTabId() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab && tab.id;
}

async function loadCnpjsForTab(tabId) {
  const key = `tab:${tabId}`;
  const data = await chrome.storage.session.get(key);
  return data && data[key] ? data[key].cnpjs || [] : [];
}

async function fetchCnpjData(digits) {
  const resp = await fetch(MINHARECEITA_URL + digits, { headers: { Accept: "application/json" } });
  if (!resp.ok) {
    let msg = `HTTP ${resp.status}`;
    try { const j = await resp.json(); if (j && j.message) msg = j.message; } catch (_) {}
    throw new Error(msg);
  }
  return resp.json();
}

function renderData(d) {
  $("f-razao").textContent = d.razao_social || "—";
  $("f-fantasia").textContent = d.nome_fantasia || "—";
  $("f-cnpj").textContent = formatCnpj(d.cnpj || "");
  $("f-situacao").textContent = d.descricao_situacao_cadastral || "—";
  $("f-abertura").textContent = formatDateBR(d.data_inicio_atividade);
  const cnae = d.cnae_fiscal_descricao || "—";
  $("f-cnae").textContent = d.cnae_fiscal ? `${d.cnae_fiscal} — ${cnae}` : cnae;
  const mun = d.municipio || "—";
  const uf = d.uf || "";
  $("f-municipio").textContent = uf ? `${mun}/${uf}` : mun;
}

async function selectCnpj(digits) {
  $("loading").classList.remove("hidden");
  $("error").classList.add("hidden");
  $("data").classList.add("hidden");
  $("btn-open").disabled = false;
  $("btn-open").dataset.cnpj = digits;

  try {
    const d = await fetchCnpjData(digits);
    renderData(d);
    $("data").classList.remove("hidden");
  } catch (e) {
    $("error").textContent = `Não foi possível carregar os dados (${e.message}).`;
    $("error").classList.remove("hidden");
  } finally {
    $("loading").classList.add("hidden");
  }
}

function populateSelect(cnpjs) {
  const sel = $("cnpj-select");
  sel.innerHTML = "";
  for (const c of cnpjs) {
    const opt = document.createElement("option");
    opt.value = c.digits;
    opt.textContent = c.formatted;
    sel.appendChild(opt);
  }
}

async function init() {
  const tabId = await getActiveTabId();
  const cnpjs = tabId != null ? await loadCnpjsForTab(tabId) : [];

  if (!cnpjs.length) {
    setState({ empty: true, list: false });
    return;
  }

  setState({ empty: false, list: true });
  populateSelect(cnpjs);

  $("cnpj-select").addEventListener("change", (e) => selectCnpj(e.target.value));
  $("btn-open").addEventListener("click", () => {
    const digits = $("btn-open").dataset.cnpj;
    if (!digits) return;
    chrome.tabs.create({ url: CNPJABERTO_URL + digits });
  });
  $("btn-bug").addEventListener("click", () => showToast("Obrigado! Feedback recebido"));

  await selectCnpj(cnpjs[0].digits);
}

document.addEventListener("DOMContentLoaded", init);
