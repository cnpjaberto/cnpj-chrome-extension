// Content script: varre o texto visível da página em busca de CNPJs com máscara.
// Quando encontra, envia ao background, que atualiza o badge da extensão.

(function () {
  const CNPJ_MASK_REGEX = /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g;

  function onlyDigits(s) {
    return String(s).replace(/\D+/g, "");
  }

  function formatCnpj(d) {
    const x = onlyDigits(d).padStart(14, "0").slice(-14);
    return `${x.slice(0, 2)}.${x.slice(2, 5)}.${x.slice(5, 8)}/${x.slice(8, 12)}-${x.slice(12, 14)}`;
  }

  function isValidCnpj(input) {
    const cnpj = onlyDigits(input);
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false;
    const calc = (base) => {
      const weights = base.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      let sum = 0;
      for (let i = 0; i < base.length; i++) sum += Number(base[i]) * weights[i];
      const r = sum % 11;
      return r < 2 ? 0 : 11 - r;
    };
    const base = cnpj.slice(0, 12);
    const d1 = calc(base);
    const d2 = calc(base + d1);
    return cnpj.endsWith(`${d1}${d2}`);
  }

  function getVisibleText() {
    return document.body ? document.body.innerText || "" : "";
  }

  function scan() {
    const text = getVisibleText();
    const matches = text.match(CNPJ_MASK_REGEX) || [];
    const seen = new Set();
    const valid = [];
    for (const m of matches) {
      const digits = onlyDigits(m);
      if (seen.has(digits)) continue;
      seen.add(digits);
      if (isValidCnpj(digits)) {
        valid.push({ digits, formatted: formatCnpj(digits) });
      }
    }
    chrome.runtime.sendMessage({
      type: "CNPJS_FOUND",
      payload: { cnpjs: valid, url: location.href }
    });
  }

  let scheduled = false;
  function scheduleScan() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      try { scan(); } catch (_) {}
    }, 600);
  }

  scheduleScan();

  const observer = new MutationObserver(scheduleScan);
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  } else {
    window.addEventListener("DOMContentLoaded", () => {
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
      scheduleScan();
    });
  }
})();
