// Gemini optimizer content script (lean, single-purpose)
// Injects an "Optimize" button next to Gemini's Send button and optimizes the prompt via external proxy.

(function() {
  console.log('Gemini optimizer loaded');

  // Track first user interaction to avoid clearing typed text
  let userInteracted = false;
  const markInteracted = () => { userInteracted = true; };
  window.addEventListener('keydown', markInteracted, { once: true, capture: true });
  window.addEventListener('mousedown', markInteracted, { once: true, capture: true });

  // Selectors
  const SEND_BTN_SELECTOR = '.send-button-container';
  const INPUT_SELECTOR = '.ql-editor.textarea.new-input-ui';
  const OPT_BTN_ID = 'gemini-optimizer-btn';
  let clearedOnce = false;

  // Helper: find the prompt editor element
  function getPromptElement() {
    const el = document.querySelector(INPUT_SELECTOR);
    if (el) return el;
    throw new Error('Prompt input not found');
  }

  // Dispatch input to update editor
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
    const orig = promptEl.textContent.trim();
    btn.textContent = 'Optimizing...';

    try {
      const optimized = await optimizePrompt(orig);
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

  // Poll for Send button, then inject
  const interval = setInterval(() => {
    const sendBtn = document.querySelector(SEND_BTN_SELECTOR);
    if (!sendBtn) return;
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
      // Copy styling from Send button container
      // optBtn.className = sendBtn.className;
      // optBtn.style.marginRight = '8px';

      // override more properties directly
      optBtn.style.margin = '0 8px';         // top/bottom 0, left/right 8px
      optBtn.style.backgroundColor = 'transparent';
      optBtn.style.border = 'none';
      optBtn.style.color = '#111827';
      // optBtn.style.borderRadius = '6px';



      optBtn.addEventListener('click', onOptimize);

      // Insert before the Send button container
      sendBtn.parentNode.insertBefore(optBtn, sendBtn);
    }
  }, 300);
})();
