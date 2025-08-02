// Per-site configuration for selectors and proxy endpoints.

export const targets = {
  chatgpt: {
    inputSelector: 'div[contenteditable="true"]',
    sendBtnSelector: 'button[data-testid="send-button"]',
    optBtnId: 'prompt-optimizer-btn',
    endpoint: 'https://flask-proxy-mcp-and-prompt-optimizer.onrender.com/'
  },
  claude: {
    toolsBtnSelector: 'button#input-tools-menu-trigger, button[data-testid="input-menu-tools"]',
    promptSelectors: [
      '.ProseMirror[contenteditable="true"]',
      'div[aria-label="Write your prompt to Claude"] .ProseMirror',
      'div[role="textbox"].ProseMirror'
    ],
    optBtnId: 'claude-optimizer-btn',
    endpoint: 'https://flask-proxy-mcp-and-prompt-optimizer.onrender.com/'
  },
  gemini: {
    sendBtnSelector: '.send-button-container',
    inputSelector: '.ql-editor.textarea.new-input-ui',
    optBtnId: 'gemini-optimizer-btn',
    endpoint: 'https://flask-proxy-mcp-and-prompt-optimizer.onrender.com/'
  }
};
