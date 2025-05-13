// background.js - Handles background processes for the QuickLearn extension

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('QuickLearn AI Search Extension installed');
    
    // Initialize default settings if needed
    chrome.storage.sync.get('quickLearnSettings', (data) => {
      if (!data.quickLearnSettings) {
        // Set default settings
        const defaultSettings = {
          theme: 'dark',
          apiKey: 'AIzaSyDLUjUDsypJh6KjNfwh6jxswANof_hMaY4',
          model: 'gemini-1.5-flash',
          saveHistory: true
        };
        
        chrome.storage.sync.set({ 'quickLearnSettings': defaultSettings });
      }
    });
  });