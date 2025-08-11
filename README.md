# Prompt Optimizer — Chrome Extension

Adds an **Optimize** button on popular AI chat sites (ChatGPT, Claude, Gemini) to rewrite your prompt for clarity and effectiveness **before** you hit Send.

---

## Features

* **One‑click optimization:** Replaces the text in the chat input with an improved version.
* **Native placement:** Button appears next to the site’s own controls (Send/Tools) for a seamless UI.
* **Safe UX:** Avoids clearing anything you’ve typed after your first interaction.
* **Fast & lightweight:** Plain content scripts—no background service worker required.

## Supported sites

* **ChatGPT** — `chatgpt.com`
* **Claude** — `claude.ai`
* **Gemini** — `gemini.google.com`

## How it works

1. The extension injects a small **Optimize** button into each site’s composer area.
2. When clicked, it reads your current prompt from the editor.
3. It calls your optimization endpoint (`/optimize`) with `{ "prompt": "..." }`.
4. It replaces the editor’s content with the returned `optimized_prompt`.

> Default endpoint (you can change it in the code): `https://prompt-optimizer-web-app.onrender.com/optimize`

## Install

### From the Chrome Web Store (recommended)

* Search the store for **“Prompt Optimizer”** and click **Add to Chrome**.

### Manual (developer) install

1. Clone or download this repo.
2. Visit `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select the project folder.

## Permissions (from `manifest.json`)

* **Host permissions:**

  * `*://chatgpt.com/*`
  * `*://claude.ai/*`
  * `*://gemini.google.com/*`
  * `https://prompt-optimizer-web-app.onrender.com/*`
* **Content scripts:** One script per site runs on `document_idle`.

## Project structure

```
prompt-optimizer-chrome-extension/
├── chatgpt-optimizer-content.js    # Inject button, capture/replace prompt
├── claude-optimizer-content.js     # Inject button, capture/replace prompt
├── gemini-optimizer-content.js     # Inject button, capture/replace prompt
├── manifest.json                   # MV3 config (version, matches, permissions)
├── privacy.html                    # Extension privacy policy
└── assets/                         # Icons referenced in manifest (16/48/128)
```

## Development notes

* Update the optimization endpoint in each `*-optimizer-content.js` if you host your own server.
* Scripts dispatch proper input events after replacement so the site detects changes.
* Buttons either copy the site’s native styling (Claude) or use minimal inline styles (ChatGPT/Gemini).

## Troubleshooting

* **Button not showing?** Wait a second after page load; the script polls for the site’s controls. If still missing, refresh the page.
* **Prompt didn’t update?** Some UIs virtualize the editor. Ensure the selector in the relevant `*-content.js` matches the site’s current DOM.
* **Network errors?** Confirm your endpoint returns JSON: `{ "optimized_prompt": "..." }` and isn’t blocked by CORS.

## Privacy

This extension does **not** collect, store, or sell personal data. When you click **Optimize**, only your prompt text is sent to your chosen endpoint to generate the improved version. See `privacy.html` for details.

## Version & license

* **Current version:** 1.0.3 (see `manifest.json`)
* **License:** MIT (see `LICENSE`)
