console.log("🚀 [StubOptimizer] content_v1.js loaded");

// --- New Logic: Detect user interaction ---
let userHasInteracted = false;
const setUserInteracted = () => {
  userHasInteracted = true;
  // Clean up listeners once we know the user is active
  window.removeEventListener('keydown', setUserInteracted, true);
  window.removeEventListener('mousedown', setUserInteracted, true);
};

// Listen for the first key press or mouse click as a sign of user activity
window.addEventListener('keydown', setUserInteracted, { once: true, capture: true });
window.addEventListener('mousedown', setUserInteracted, { once: true, capture: true });


// A flag to ensure we only clear the input once per page load
let hasClearedOnLoad = false;

// Selectors & IDs
const SEND_BTN_SELECTOR   = 'button[data-testid="send-button"]';
const INPUT_DIV_SELECTOR  = 'div[contenteditable="true"]';
const BTN_ID              = 'stub-optimizer-btn';

const poll = setInterval(() => {
  const sendBtn = document.querySelector(SEND_BTN_SELECTOR);
  if (!sendBtn) return;

  // We found the button, so stop checking and clean up listeners
  clearInterval(poll);
  window.removeEventListener('keydown', setUserInteracted, true);
  window.removeEventListener('mousedown', setUserInteracted, true);


  const inputDiv = document.querySelector(INPUT_DIV_SELECTOR);

  // 1) Clear pre-existing text ONLY if the user has NOT interacted with the page
  if (!userHasInteracted && !hasClearedOnLoad && inputDiv && inputDiv.innerText.trim() !== "") {
    console.log("🚀 [StubOptimizer] No user interaction detected. Clearing stale input.");
    inputDiv.innerText = "";
    inputDiv.dispatchEvent(new Event("input", { bubbles: true }));
    hasClearedOnLoad = true;
  }

  // 2) Inject our Optimize button (if it's not already there)
  if (!document.getElementById(BTN_ID)) {
    console.log("🚀 [StubOptimizer] Found send-button – injecting Optimize button");
    const btn = document.createElement("button");
    btn.id = BTN_ID;
    btn.type = "button";
    btn.innerText = "Optimize";
    Object.assign(btn.style, {
      marginRight: "8px",
      padding: "0 12px",
      border: "1px solid var(--color-border-primary)",
      borderRadius: "4px",
      background: "var(--color-bg-secondary)",
      color: "var(--color-text-primary)",
      fontSize: "14px",
      cursor: "pointer"
    });
    sendBtn.parentNode.insertBefore(btn, sendBtn);
    btn.addEventListener("click", onOptimizeClick);
  }
}, 300);


// Replace stubOptimize with a real fetch to your proxy
async function stubOptimize(promptText) {
  console.log("🚀 [StubOptimizer] Calling the proxy to access the MCP prompt optimizer tool with:", promptText);
  const res = await fetch("https://flask-proxy-mcp-and-prompt-optimizer.onrender.com/optimize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: promptText })
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Proxy error ${res.status}: ${txt}`);
  }
  const { optimized_prompt } = await res.json();
  if (!optimized_prompt) {
    throw new Error("Invalid proxy response");
  }
  return optimized_prompt;
}


// Click handler: grab prompt, run optimizer, swap in optimized text
async function onOptimizeClick() {
  const btn = document.getElementById(BTN_ID);
  btn.disabled = true;
  btn.innerText = "Optimizing…";

  // Grab the current prompt text
  const inputDiv = document.querySelector(INPUT_DIV_SELECTOR);
  if (!inputDiv) {
    console.error("🚀 [StubOptimizer] ❌ input div not found");
    btn.innerText = "Error";
    setTimeout(() => (btn.innerText = "Optimize"), 2000);
    btn.disabled = false;
    return;
  }
  const originalPrompt = inputDiv.innerText.trim();
  console.log("🚀 [StubOptimizer] Original prompt:", originalPrompt);

  try {
    const optimized = await stubOptimize(originalPrompt);
    console.log("🚀 [StubOptimizer] Proxy returned:", optimized);
    // Replace the contentEditable’s text
    inputDiv.innerText = optimized;
    // Dispatch an input event so React notices
    inputDiv.dispatchEvent(new Event("input", { bubbles: true }));
  } catch (err) {
    console.error("🚀 [StubOptimizer] Optimization failed:", err);
    btn.innerText = "Error";
    setTimeout(() => (btn.innerText = "Optimize"), 2000);
  } finally {
    btn.disabled = false;
    btn.innerText = "Optimize";
  }
}