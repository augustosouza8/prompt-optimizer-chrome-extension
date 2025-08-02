console.log('🚀 [Prompt Optimizer] loaded');

// --- Track first keypress/click to avoid clearing typed text ---
let userInteracted = false;
const markInteracted = () => {
  userInteracted = true;
  window.removeEventListener('keydown', markInteracted, true);
  window.removeEventListener('mousedown', markInteracted, true);
};
window.addEventListener('keydown', markInteracted, { once: true, capture: true });
window.addEventListener('mousedown', markInteracted, { once: true, capture: true });

// --- Selectors and state ---
const SEND_BTN = 'button[data-testid="send-button"]';
const INPUT_DIV = 'div[contenteditable="true"]';
const OPT_BTN_ID = 'prompt-optimizer-btn';
let clearedOnce = false;

// --- Wait for Send button, then inject Optimize button ---
const checker = setInterval(() => {
  const send = document.querySelector(SEND_BTN);
  if (!send) return;
  clearInterval(checker);
  window.removeEventListener('keydown', markInteracted, true);
  window.removeEventListener('mousedown', markInteracted, true);

  const input = document.querySelector(INPUT_DIV);
  if (!userInteracted && !clearedOnce && input && input.innerText.trim()) {
    console.log('🚀 [Prompt Optimizer] Clearing pre-filled text');
    input.innerText = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    clearedOnce = true;
  }

  if (!document.getElementById(OPT_BTN_ID)) {
    console.log('🚀 [Prompt Optimizer] Injecting Optimize button');
    const btn = document.createElement('button');
    btn.id = OPT_BTN_ID;
    btn.type = 'button';
    btn.innerText = 'Optimize';
    Object.assign(btn.style, {
      marginRight: '8px', padding: '0 12px', border: '1px solid var(--color-border-primary)',
      borderRadius: '4px', background: 'var(--color-bg-secondary)',
      color: 'var(--color-text-primary)', fontSize: '14px', cursor: 'pointer'
    });
    send.parentNode.insertBefore(btn, send);
    btn.addEventListener('click', onOptimize);
  }
}, 300);

// --- Call proxy to optimize prompt ---
async function optimize(promptText) {
  console.log('🚀 [Prompt Optimizer] Sending the following prompt to the proxy that calls the MCP optimization tool:', promptText);
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
  btn.disabled = true;
  btn.innerText = 'Optimizing…';

  const input = document.querySelector(INPUT_DIV);
  if (!input) {
    console.error('🚀 [Prompt Optimizer] Input not found');
    btn.innerText = 'Error';
    setTimeout(() => { btn.innerText = 'Optimize'; btn.disabled = false; }, 2000);
    return;
  }

  const original = input.innerText.trim();
  console.log('🚀 [Prompt Optimizer] Original:', original);

  try {
    const optimized = await optimize(original);
    console.log('🚀 [Prompt Optimizer] Optimized:', optimized);
    input.innerText = optimized;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  } catch (error) {
    console.error('🚀 [Prompt Optimizer] Failed:', error);
    btn.innerText = 'Error';
    setTimeout(() => btn.innerText = 'Optimize', 2000);
  } finally {
    btn.disabled = false;
    btn.innerText = 'Optimize';
  }
}