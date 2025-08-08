(function() {
  console.log('🚀 [Prompt Optimizer] loaded for Claude');

  // --- Track first keypress/click to avoid clearing typed text ---
  let userInteracted = false;
  const markInteracted = () => { userInteracted = true; };
  window.addEventListener('keydown',  markInteracted, { once: true, capture: true });
  window.addEventListener('mousedown', markInteracted, { once: true, capture: true });

  // --- Selectors and state ---
  const TOOLS_BTN_SELECTOR = 'button#input-tools-menu-trigger, button[data-testid="input-menu-tools"]';
  const PROMPT_SELECTORS   = [
    '.ProseMirror[contenteditable="true"]',
    'div[aria-label="Write your prompt to Claude"] .ProseMirror',
    'div[role="textbox"].ProseMirror'
  ];
  const OPT_BTN_ID = 'claude-optimizer-btn';
  let promptEl    = null;
  let clearedOnce = false;

  // --- Call proxy to optimize prompt ---
  async function optimize(promptText) {
    console.log('🚀 [Prompt Optimizer]', 'Sending prompt to proxy:', promptText);
    const res = await fetch(
      'https://prompt-optimizer-web-app.onrender.com/optimize',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText })
      }
    );
    if (!res.ok) throw new Error(`Proxy error ${res.status}`);
    const data = await res.json();
    if (!data.optimized_prompt) throw new Error('Missing optimized_prompt');
    return data.optimized_prompt;
  }

  // --- Handle Optimize button click ---
  async function onOptimize() {
    const btn = document.getElementById(OPT_BTN_ID);
    btn.disabled  = true;
    btn.innerText = 'Optimizing…';

    if (!promptEl) {
      console.error('🚀 [Prompt Optimizer]', 'Prompt element not found');
      btn.innerText = 'Error';
      setTimeout(() => {
        btn.innerText = 'Optimize';
        btn.disabled = false;
      }, 2000);
      return;
    }

    const original = promptEl.textContent.trim();
    console.log('🚀 [Prompt Optimizer]', 'Original:', original);

    try {
      const optimized = await optimize(original);
      console.log('🚀 [Prompt Optimizer]', 'Optimized:', optimized);
      promptEl.textContent = optimized;
      promptEl.dispatchEvent(new InputEvent('input', { bubbles: true }));
    } catch (error) {
      console.error('🚀 [Prompt Optimizer]', 'Failed:', error);
      btn.innerText = 'Error';
      setTimeout(() => { btn.innerText = 'Optimize'; }, 2000);
    } finally {
      btn.disabled  = false;
      btn.innerText = 'Optimize';
    }
  }

  // --- Wait for Tools button and inject Optimize button ---
  const checker = setInterval(() => {
    const toolsBtn = document.querySelector(TOOLS_BTN_SELECTOR);
    if (!toolsBtn) return;
    clearInterval(checker);

    // locate prompt editor
    for (const sel of PROMPT_SELECTORS) {
      const el = document.querySelector(sel);
      if (el) {
        promptEl = el;
        break;
      }
    }
    if (promptEl && !userInteracted && !clearedOnce && promptEl.textContent.trim()) {
      console.log('🚀 [Prompt Optimizer]', 'Clearing pre-filled text');
      promptEl.textContent = '';
      promptEl.dispatchEvent(new InputEvent('input', { bubbles: true }));
      clearedOnce = true;
    }

    if (!document.getElementById(OPT_BTN_ID)) {
      console.log('🚀 [Prompt Optimizer]', 'Injecting Optimize button');
      const btn = document.createElement('button');
      btn.id        = OPT_BTN_ID;
      btn.type      = 'button';
      btn.innerText = 'Optimize';

      // Copy styling from Tools button
      btn.className = toolsBtn.className;
      btn.style.marginRight = '8px';

      toolsBtn.parentNode.insertBefore(btn, toolsBtn);
      btn.addEventListener('click', onOptimize);
    }
  }, 300);
})();
