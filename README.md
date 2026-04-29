# CNPJ Aberto — Extensão Chrome

Extensão para o Chrome que detecta automaticamente CNPJs (no formato com máscara `00.000.000/0000-00`) na página que o usuário está visitando, mostra um badge de notificação no ícone da extensão e exibe dados básicos da empresa em um popup.

## Funcionalidades

- 🔍 **Detecção automática** de CNPJs com máscara em qualquer página.
- ✅ Validação dos dígitos verificadores (descarta números no formato de CNPJ que não são válidos).
- 🔔 **Badge** no ícone da extensão com a quantidade de CNPJs encontrados.
- 📇 **Popup com dados básicos** (razão social, nome fantasia, situação cadastral, data de abertura, CNAE, município/UF) consumidos da API pública [BrasilAPI](https://brasilapi.com.br/).
- 🌐 Botão **"Ver no cnpjaberto.com"** que redireciona para `https://cnpjaberto.com/cnpj/<id>`.
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
- `host_permissions: https://brasilapi.com.br/*` — chamada à API pública de CNPJ.

## Privacidade

Nada é enviado a servidores próprios. A extensão consulta exclusivamente a [BrasilAPI](https://brasilapi.com.br/) e o destino do botão é o site público [cnpjaberto.com](https://cnpjaberto.com/).
