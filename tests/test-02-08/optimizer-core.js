// Shared utilities for Prompt Optimizer

const PREFIX = '🚀 [Prompt Optimizer]';

export function logDebug(...args) {
  console.debug(PREFIX, ...args);
}
export function logInfo(...args) {
  console.info(PREFIX, ...args);
}
export function logWarn(...args) {
  console.warn(PREFIX, ...args);
}
export function logError(...args) {
  console.error(PREFIX, ...args);
}

/** Waits for an element matching selector to appear. */
export function waitFor(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      const el = document.querySelector(selector);
      if (el) {
        logDebug(`Found ${selector}`);
        return resolve(el);
      }
      if (Date.now() - start > timeout) {
        return reject(new Error(`Timeout waiting for ${selector}`));
      }
      requestAnimationFrame(tick);
    };
    tick();
  });
}

/** Inserts a styled Optimize button if not already present. */
export function injectButton(containerEl, { id, label, onClick }) {
  if (containerEl.querySelector(`#${id}`)) return;
  const btn = document.createElement('button');
  btn.id = id;
  btn.type = 'button';
  btn.innerText = label;
  btn.classList.add('opt-btn');
  btn.addEventListener('click', onClick);
  containerEl.parentNode.insertBefore(btn, containerEl);
  logDebug(`Injected button ${id}`);
  return btn;
}

/** Dispatches an input event so frameworks pick up text changes. */
export function dispatchInput(el) {
  const ev = typeof InputEvent === 'function'
    ? new InputEvent('input', { bubbles: true })
    : new Event('input', { bubbles: true });
  el.dispatchEvent(ev);
  logDebug('Dispatched input event');
}

/** Calls your proxy to optimize the prompt text. */
export async function callOptimizeAPI(prompt, endpoint) {
  logInfo('Calling optimize API at', endpoint);
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  if (!resp.ok) {
    const msg = `HTTP ${resp.status}`;
    logError('Optimize API error:', msg);
    throw new Error(msg);
  }
  const json = await resp.json();
  // your proxy returns { optimized_prompt: "..." }
  if (!json.optimized_prompt) {
    throw new Error('optimized_prompt missing');
  }
  return json.optimized_prompt;
}
