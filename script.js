// QuickLearn Extension - Main functionality
let settings = {
  theme: 'dark',
  apiKey: 'AIzaSyDLUjUDsypJh6KjNfwh6jxswANof_hMaY4', // Default key
  model: 'gemini-1.5-flash',
  saveHistory: true
};

let searchHistory = [];

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const output = document.getElementById('output');
const copyBtn = document.getElementById('copy-btn');
const saveBtn = document.getElementById('save-btn');
const historyList = document.getElementById('history-list');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Theme elements
const themeSelect = document.getElementById('theme-select');
const apiKeyInput = document.getElementById('api-key');
const modelSelect = document.getElementById('model-select');
const saveHistoryCheckbox = document.getElementById('save-history');
const saveSettingsBtn = document.getElementById('save-settings');
const clearDataBtn = document.getElementById('clear-data');

// Initialize extension
document.addEventListener('DOMContentLoaded', initializeExtension);

function initializeExtension() {
  loadSettings();
  loadHistory();
  setupEventListeners();
  applyTheme();
}

// Load settings from storage
function loadSettings() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get('quickLearnSettings', (data) => {
        if (data && data.quickLearnSettings) {
          settings = {...settings, ...data.quickLearnSettings};
          
          // Apply loaded settings to UI
          applyUISettings();
        }
      });
    } else {
      console.log('Chrome storage API not available, using default settings');
      // Just use the default settings
      applyUISettings();
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Helper function to apply UI settings
function applyUISettings() {
  if (themeSelect) themeSelect.value = settings.theme;
  if (apiKeyInput && settings.apiKey && settings.apiKey !== 'AIzaSyDLUjUDsypJh6KjNfwh6jxswANof_hMaY4') {
    apiKeyInput.value = settings.apiKey;
  }
  if (modelSelect) modelSelect.value = settings.model;
  if (saveHistoryCheckbox) saveHistoryCheckbox.checked = settings.saveHistory;
}

// Load search history from storage
function loadHistory() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get('quickLearnHistory', (data) => {
        if (data && data.quickLearnHistory) {
          searchHistory = data.quickLearnHistory;
          renderHistory();
        }
      });
    } else {
      console.log('Chrome storage API not available, using empty history');
      // History will remain empty
      renderHistory();
    }
  } catch (error) {
    console.error('Error loading history:', error);
  }
}

// Setup all event listeners
function setupEventListeners() {
  // Search functionality
  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });
  
  // Tab navigation
  tabButtons.forEach(button => {
    button.addEventListener('click', () => switchTab(button.getAttribute('data-tab')));
  });
  
  // Copy functionality
  copyBtn.addEventListener('click', copyToClipboard);
  
  // Save to history
  saveBtn.addEventListener('click', manualSaveToHistory);
  
  // Settings
  saveSettingsBtn.addEventListener('click', saveSettings);
  clearDataBtn.addEventListener('click', clearAllData);
  themeSelect.addEventListener('change', () => {
    applyTheme(themeSelect.value);
  });
  
  // History item clicks
  historyList.addEventListener('click', (e) => {
    const historyItem = e.target.closest('.history-item');
    if (historyItem) {
      const query = historyItem.getAttribute('data-query');
      const response = historyItem.getAttribute('data-response');
      searchInput.value = query;
      switchTab('search');
      
      // First, clear the output
      output.innerHTML = '';
      
      // Add the user query
      addMessage(query, true);
      
      // Add the saved response
      addMessage(response, false);
    }
  });
}

// Switch between tabs
function switchTab(tabName) {
  // Update active states
  tabButtons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
  });
  
  tabContents.forEach(content => {
    const isActive = content.id === `${tabName}-tab`;
    content.classList.toggle('active', isActive);
  });
}

// Apply theme settings
function applyTheme(theme = settings.theme) {
  if (theme === 'light') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
}

// Perform AI search
async function performSearch() {
  const query = searchInput.value.trim();
  if (!query) {
    showToast('Please enter a search query', 'error');
    return;
  }
  
  // Add user message
  addMessage(query, true);
  
  // Add loading indicator
  const loadingId = addLoadingIndicator();
  
  try {
    const response = await fetchAIResponse(query);
    
    // Remove loading indicator and add AI response
    removeLoadingIndicator(loadingId);
    addMessage(response, false);
    
    // Save to history if enabled
    if (settings.saveHistory) {
      saveToHistory(query, response);
    }
  } catch (error) {
    removeLoadingIndicator(loadingId);
    addMessage(`Error: ${error.message || 'Failed to get response'}`, false, true);
  }
}

// Fetch response from AI API
async function fetchAIResponse(query) {
  const apiKey = settings.apiKey;
  const model = settings.model;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: query }],
          },
        ],
      }),
    });
    
    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from AI service');
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to get response from AI service');
  }
}

// Add message to chat
function addMessage(content, isUser = false, isError = false) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');
  
  if (isUser) {
    messageDiv.classList.add('user-message');
  } else {
    messageDiv.classList.add('bot-message');
    if (isError) {
      messageDiv.style.color = 'var(--error-color)';
    }
  }
  
  messageDiv.innerHTML = isUser ? content : formatMessage(content);
  output.appendChild(messageDiv);
  
  // Scroll to bottom
  output.scrollTop = output.scrollHeight;
  
  return messageDiv.id;
}

// Format AI messages with markdown-like syntax
function formatMessage(text) {
  // Convert code blocks
  text = text.replace(/```([\s\S]*?)```/g, '<pre class="code-block">$1</pre>');
  
  // Bold text
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Italic text
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert line breaks
  text = text.replace(/\n/g, '<br>');
  
  return text;
}

// Add loading indicator
function addLoadingIndicator() {
  const loadingDiv = document.createElement('div');
  loadingDiv.classList.add('message', 'bot-message');
  loadingDiv.id = `loading-${Date.now()}`;
  
  const typingIndicator = document.createElement('div');
  typingIndicator.classList.add('typing-indicator');
  typingIndicator.innerHTML = '<span></span><span></span><span></span>';
  
  loadingDiv.appendChild(typingIndicator);
  output.appendChild(loadingDiv);
  
  // Scroll to bottom
  output.scrollTop = output.scrollHeight;
  
  return loadingDiv.id;
}

// Remove loading indicator
function removeLoadingIndicator(id) {
  const loadingElement = document.getElementById(id);
  if (loadingElement) {
    loadingElement.remove();
  }
}

// Copy to clipboard
function copyToClipboard() {
  // Find the last bot message
  const botMessages = document.querySelectorAll('.bot-message');
  if (botMessages.length === 0) {
    showToast('No content to copy', 'error');
    return;
  }
  
  const lastMessage = botMessages[botMessages.length - 1];
  const textToCopy = lastMessage.innerText;
  
  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      showToast('Copied to clipboard', 'success');
    })
    .catch(() => {
      showToast('Failed to copy', 'error');
    });
}

// Save current search to history
function manualSaveToHistory() {
  const userMessages = document.querySelectorAll('.user-message');
  const botMessages = document.querySelectorAll('.bot-message');
  
  if (userMessages.length === 0 || botMessages.length === 0) {
    showToast('No conversation to save', 'error');
    return;
  }
  
  const query = userMessages[userMessages.length - 1].innerText;
  const response = botMessages[botMessages.length - 1].innerText;
  
  saveToHistory(query, response);
  showToast('Saved to history', 'success');
}

// Save to history with storage
function saveToHistory(query, response) {
  const historyItem = {
    id: Date.now(),
    query,
    response,
    timestamp: new Date().toISOString()
  };
  
  // Add to beginning of array (newest first)
  searchHistory.unshift(historyItem);
  
  // Limit history to 50 items
  if (searchHistory.length > 50) {
    searchHistory = searchHistory.slice(0, 50);
  }
  
  // Save to storage if available
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ 'quickLearnHistory': searchHistory }, () => {
        renderHistory();
      });
    } else {
      renderHistory();
    }
  } catch (error) {
    console.error('Error saving history:', error);
    renderHistory();
  }
}

// Render history items
function renderHistory() {
  if (!historyList) return;
  
  if (searchHistory.length === 0) {
    historyList.innerHTML = '<div class="empty-state">Your search history will appear here</div>';
    return;
  }
  
  historyList.innerHTML = '';
  searchHistory.forEach(item => {
    const historyItemDiv = document.createElement('div');
    historyItemDiv.classList.add('history-item');
    historyItemDiv.setAttribute('data-query', item.query);
    historyItemDiv.setAttribute('data-response', item.response);
    
    const formattedDate = new Date(item.timestamp).toLocaleString();
    
    historyItemDiv.innerHTML = `
      <div class="history-query">${item.query}</div>
      <div class="history-date">${formattedDate}</div>
    `;
    
    historyList.appendChild(historyItemDiv);
  });
}

// Save settings to storage
function saveSettings() {
  settings = {
    theme: themeSelect.value,
    apiKey: apiKeyInput.value || settings.apiKey,
    model: modelSelect.value,
    saveHistory: saveHistoryCheckbox.checked
  };
  
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ 'quickLearnSettings': settings }, () => {
        showToast('Settings saved', 'success');
        applyTheme();
      });
    } else {
      showToast('Settings saved (locally)', 'success');
      applyTheme();
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    showToast('Settings applied (not saved)', 'success');
    applyTheme();
  }
}

// Clear all data
function clearAllData() {
  if (confirm('Are you sure you want to clear all data? This will remove all settings and history.')) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        if (chrome.storage.local) chrome.storage.local.remove('quickLearnHistory');
        if (chrome.storage.sync) chrome.storage.sync.remove('quickLearnSettings');
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
    
    searchHistory = [];
    settings = {
      theme: 'dark',
      apiKey: 'AIzaSyDLUjUDsypJh6KjNfwh6jxswANof_hMaY4',
      model: 'gemini-1.5-flash',
      saveHistory: true
    };
    
    renderHistory();
    
    // Reset UI
    themeSelect.value = settings.theme;
    apiKeyInput.value = '';
    modelSelect.value = settings.model;
    saveHistoryCheckbox.checked = settings.saveHistory;
    
    showToast('All data cleared', 'success');
  }
}

// Show toast notification
function showToast(message, type = 'success') {
  // Remove any existing toasts
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.classList.add('toast', type);
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}