chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extract_content') {
    try {
      const title = document.title;
      const url = window.location.href;
      
      let textContent = '';
      const article = document.querySelector('article');
      if (article) {
        textContent = article.innerText;
      } else {
        const paragraphs = Array.from(document.querySelectorAll('p'));
        textContent = paragraphs.map(p => p.innerText).join('\n\n');
      }

      if (textContent.length > 5000) {
        textContent = textContent.substring(0, 5000) + '...';
      }

      sendResponse({
        success: true,
        data: { title, url, text: textContent }
      });
    } catch (e) {
      console.error('Error extracting content:', e);
      sendResponse({ success: false, error: e.toString() });
    }
  }
  return true;
});

// Auto-fill prompt if we are on VidForge AI generate page
if (window.location.href.includes('vidforge-ai.duckdns.org/')) {
  chrome.storage.local.get(['extractedContent'], function(result) {
    if (result.extractedContent && result.extractedContent.text) {
      // Small delay to ensure the React app has rendered the textarea
      setTimeout(() => {
        const textarea = document.querySelector('textarea');
        if (textarea) {
          // Add text and dispatch input event for React to pick it up
          textarea.value = result.extractedContent.text;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          textarea.dispatchEvent(new Event('change', { bubbles: true }));
          
          // Clear it after using
          chrome.storage.local.remove('extractedContent');
        }
      }, 1500);
    }
  });
}
