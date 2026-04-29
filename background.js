// Service worker: recebe CNPJs detectados pelo content script,
// guarda por aba e atualiza o badge do ícone com a quantidade encontrada.

const BADGE_COLOR = "#2E7D32";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.type !== "CNPJS_FOUND") return;
  const tabId = sender.tab && sender.tab.id;
  if (typeof tabId !== "number") return;

  const cnpjs = Array.isArray(message.payload?.cnpjs) ? message.payload.cnpjs : [];
  const url = message.payload?.url || "";

  const key = `tab:${tabId}`;
  chrome.storage.session.set({ [key]: { cnpjs, url, ts: Date.now() } }).catch(() => {});

  const count = cnpjs.length;
  const badgeText = count > 0 ? (count > 99 ? "99+" : String(count)) : "";

  chrome.action.setBadgeBackgroundColor({ color: BADGE_COLOR, tabId }).catch(() => {});
  chrome.action.setBadgeText({ text: badgeText, tabId }).catch(() => {});
  chrome.action.setTitle({
    tabId,
    title: count > 0
      ? `CNPJ Aberto — ${count} CNPJ${count > 1 ? "s" : ""} detectado${count > 1 ? "s" : ""}`
      : "CNPJ Aberto"
  }).catch(() => {});
});

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.session.remove(`tab:${tabId}`).catch(() => {});
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") {
    chrome.storage.session.remove(`tab:${tabId}`).catch(() => {});
    chrome.action.setBadgeText({ text: "", tabId }).catch(() => {});
  }
});
