// Claude optimizer content script (lean, single-purpose)
// Injects an "Optimize" button next to Claude's Tools menu and optimizes the prompt via external proxy.

(function() {
  console.log('Claude optimizer loaded');

  // Track first user interaction to avoid clearing typed text
  let userInteracted = false;
  const markInteracted = () => { userInteracted = true; };
  window.addEventListener('keydown', markInteracted, { once: true, capture: true });
  window.addEventListener('mousedown', markInteracted, { once: true, capture: true });

  // Selectors
  const TOOLS_BTN_SELECTOR = 'button#input-tools-menu-trigger, button[data-testid="input-menu-tools"]';
  const PROMPT_SELECTORS = [
    '.ProseMirror[contenteditable="true"]',
    'div[aria-label="Write your prompt to Claude"] .ProseMirror',
    'div[role="textbox"].ProseMirror'
  ];
  const OPT_BTN_ID = 'claude-optimizer-btn';
  let clearedOnce = false;

  // Helper: find the prompt editor element
  function getPromptElement() {
    for (const sel of PROMPT_SELECTORS) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    throw new Error('Prompt input not found');
  }

  // Dispatch input to update ProseMirror
  function dispatchInput(el) {
    const ev = new InputEvent('input', { bubbles: true });
    el.dispatchEvent(ev);
  }

  // Call proxy to optimize prompt
  async function optimizePrompt(text) {
    const res = await fetch('https://flask-proxy-mcp-and-prompt-optimizer.onrender.com/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: text })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = await res.json();
    if (!j.optimized_prompt) throw new Error('No optimized_prompt in response');
    return j.optimized_prompt;
  }

  // Handler for Optimize button
  async function onOptimize() {
    const btn = document.getElementById(OPT_BTN_ID);
    btn.disabled = true;
    const origText = promptEl.textContent.trim();
    btn.textContent = 'Optimizing...';

    try {
      const optimized = await optimizePrompt(origText);
      promptEl.textContent = optimized;
      dispatchInput(promptEl);
      btn.textContent = 'Optimize';
    } catch (err) {
      console.error(err);
      btn.textContent = 'Error';
      setTimeout(() => { btn.textContent = 'Optimize'; }, 2000);
    } finally {
      btn.disabled = false;
    }
  }

  let promptEl;

  // Poll for Tools button, then inject
  const interval = setInterval(() => {
    const toolsBtn = document.querySelector(TOOLS_BTN_SELECTOR);
    if (!toolsBtn) return;
    clearInterval(interval);

    // Remove interaction listeners
    window.removeEventListener('keydown', markInteracted, true);
    window.removeEventListener('mousedown', markInteracted, true);

    // Locate prompt editor and clear prefill if needed
    try {
      promptEl = getPromptElement();
      if (!userInteracted && promptEl.textContent.trim() && !clearedOnce) {
        promptEl.textContent = '';
        dispatchInput(promptEl);
        clearedOnce = true;
      }
    } catch (e) {
      console.warn(e.message);
    }

    // Inject Optimize button
    if (!document.getElementById(OPT_BTN_ID)) {
      const optBtn = document.createElement('button');
      optBtn.id = OPT_BTN_ID;
      optBtn.textContent = 'Optimize';
      // Copy styling from Tools button
      optBtn.className = toolsBtn.className;
      optBtn.style.marginRight = '8px';
      optBtn.addEventListener('click', onOptimize);

      // Insert before the Tools button
      toolsBtn.parentNode.insertBefore(optBtn, toolsBtn);
    }
  }, 300);
})();
