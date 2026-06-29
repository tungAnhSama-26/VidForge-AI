chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extract_content') {
    try {
      const title = document.title;
      const url = window.location.href;
      
      let textContent = '';
      const article = document.querySelector('article');
      const main = document.querySelector('main');
      
      if (article && article.innerText.length > 100) {
        textContent = article.innerText;
      } else if (main && main.innerText.length > 100) {
        textContent = main.innerText;
      } else {
        // Lấy các thẻ chứa chữ trong các web chat AI (Grok, ChatGPT, AI Studio...)
        const chatElements = Array.from(document.querySelectorAll('p, [dir="auto"], .message'));
        if (chatElements.length > 0) {
          textContent = chatElements.map(el => el.innerText).join('\n\n');
        }
        
        // Fallback: Lấy toàn bộ text trên trang nếu vẫn không tìm thấy
        if (!textContent || textContent.trim().length < 50) {
          textContent = document.body.innerText;
        }
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
