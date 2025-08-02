(function() {
  console.log('🚀 [Prompt Optimizer] loaded for Gemini');

  // --- Track first keypress/click to avoid clearing typed text ---
  let userInteracted = false;
  const markInteracted = () => { userInteracted = true; };
  window.addEventListener('keydown',  markInteracted, { once: true, capture: true });
  window.addEventListener('mousedown', markInteracted, { once: true, capture: true });

  // --- Selectors and state ---
  const SEND_BTN_SELECTOR = '.send-button-container';
  const INPUT_SELECTOR     = '.ql-editor.textarea.new-input-ui';
  const OPT_BTN_ID         = 'gemini-optimizer-btn';
  let promptEl    = null;
  let clearedOnce = false;

  // --- Call proxy to optimize prompt ---
  async function optimize(promptText) {
    console.log('🚀 [Prompt Optimizer]', 'Sending prompt to proxy:', promptText);
    const res = await fetch(
      'https://flask-proxy-mcp-and-prompt-optimizer.onrender.com/optimize',
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
      console.error('🚀 [Prompt Optimizer]', 'Input not found');
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

  // --- Wait for Send button and inject Optimize button ---
  const checker = setInterval(() => {
    const sendBtn = document.querySelector(SEND_BTN_SELECTOR);
    if (!sendBtn) return;
    clearInterval(checker);

    promptEl = document.querySelector(INPUT_SELECTOR);
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
      Object.assign(btn.style, {
        marginRight:  '8px',
        padding:      '0 12px',
        border:       '1px solid var(--color-border-primary)',
        borderRadius: '4px',
        background:   'var(--color-bg-secondary)',
        color:        'var(--color-text-primary)',
        fontSize:     '14px',
        cursor:       'pointer'
      });
      sendBtn.parentNode.insertBefore(btn, sendBtn);
      btn.addEventListener('click', onOptimize);
    }
  }, 300);
})();
