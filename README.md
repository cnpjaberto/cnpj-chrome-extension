# CNPJ Aberto — Extensão Chrome

Extensão para o Chrome que detecta automaticamente CNPJs (no formato com máscara `00.000.000/0000-00`) na página que o usuário está visitando, mostra um badge de notificação no ícone da extensão e exibe dados básicos da empresa em um popup.

## Funcionalidades

- 🔍 **Detecção automática** de CNPJs com máscara em qualquer página.
- ✅ Validação dos dígitos verificadores (descarta números no formato de CNPJ que não são válidos).
- 🔔 **Badge** no ícone da extensão com a quantidade de CNPJs encontrados.
- 📇 **Popup com dados básicos** (razão social, nome fantasia, situação cadastral, data de abertura, CNAE, município/UF).
- 🌐 Botão **"Ver no cnpjaberto.com.br"** que redireciona para `https://cnpjaberto.com.br/cnpj/<id>`.
- 🐞 Botão **"Reportar bug"** que mostra a confirmação `Obrigado! Feedback recebido`.

## Instalação (modo desenvolvedor)

1. Acesse `chrome://extensions/`.
2. Ative o **Modo do desenvolvedor** (canto superior direito).
3. Clique em **Carregar sem compactação** e selecione esta pasta.
4. A extensão estará ativa. Visite uma página com um CNPJ válido (ex.: a página de uma empresa) e veja o badge aparecer no ícone.

## Estrutura

| Arquivo | Função |
| --- | --- |
| `manifest.json` | Manifesto MV3 da extensão |
| `content.js` | Varre o texto da página, valida CNPJs e envia ao background |
| `background.js` | Service worker; mantém estado por aba e atualiza o badge |
| `popup.html` / `popup.css` / `popup.js` | UI do popup com dados e botões |
| `cnpj.js` | Utilitários compartilhados (validação, formatação) |
| `icons/` | Ícones 16/32/48/128 px |

## Permissões

- `storage` — guardar CNPJs detectados por aba (`storage.session`).
- `activeTab`, `tabs` — descobrir a aba ativa para o popup.
- `host_permissions` — chamada à API pública usada para buscar os dados de CNPJ.

## Privacidade

Nada é enviado a servidores próprios. A extensão consulta apenas uma API pública de dados de CNPJ e o destino do botão é o site público [cnpjaberto.com.br](https://cnpjaberto.com.br/).

## Empacotar para a Chrome Web Store

```bash
zip -r cnpjaberto-extension.zip . -x "*.git*" "scripts/*" "*.zip" "*.md" "LICENSE"
```

O arquivo `.zip` resultante pode ser enviado ao [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

## Licença

[MIT](LICENSE).
