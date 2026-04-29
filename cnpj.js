// Utilitários compartilhados de CNPJ.
// Carregado tanto pelo content script quanto pelo popup.

const CNPJ_MASK_REGEX = /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g;

function onlyDigits(str) {
  return String(str).replace(/\D+/g, "");
}

function formatCnpj(digits) {
  const d = onlyDigits(digits).padStart(14, "0").slice(-14);
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
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
    for (let i = 0; i < base.length; i++) {
      sum += Number(base[i]) * weights[i];
    }
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };

  const base = cnpj.slice(0, 12);
  const d1 = calc(base);
  const d2 = calc(base + d1);
  return cnpj.endsWith(`${d1}${d2}`);
}

function findValidCnpjsInText(text) {
  if (!text) return [];
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
  return valid;
}

if (typeof module !== "undefined") {
  module.exports = { onlyDigits, formatCnpj, isValidCnpj, findValidCnpjsInText, CNPJ_MASK_REGEX };
}
