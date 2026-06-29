document.getElementById('start-btn').addEventListener('click', async () => {
  const statusEl = document.getElementById('status');
  statusEl.style.display = 'block';
  statusEl.innerText = "Đang tìm kịch bản mới nhất...";

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getLatestScript,
  }, (injectionResults) => {
    if (chrome.runtime.lastError) {
      statusEl.innerText = "Lỗi: Không thể đọc trang này (Có thể do trang bị hạn chế hoặc bạn đang ở trang trắng).";
      statusEl.style.color = "red";
      return;
    }

    if (!injectionResults || !injectionResults[0]) {
      statusEl.innerText = "Lỗi: Lỗi hệ thống khi tìm kịch bản.";
      statusEl.style.color = "red";
      return;
    }
    
    const scriptText = injectionResults[0].result;
    
    if (!scriptText || scriptText.trim() === "") {
      statusEl.innerText = "Lỗi: Trang này không có chữ nào (Hoặc bạn hãy thử bôi đen chữ cần lấy rồi bấm lại).";
      statusEl.style.color = "orange";
      return;
    }

    statusEl.innerText = "Đã lấy được kịch bản! Đang mở Grok...";
    statusEl.style.color = "green";

    const grokPrompt = `Hãy tạo cho tôi các prompt chi tiết để làm video (hình ảnh và âm thanh) từ kịch bản sau:\n\n${scriptText}`;

    chrome.runtime.sendMessage({
      action: "START_GROK_WORKFLOW",
      prompt: grokPrompt
    });
  });
});

// Hàm này chạy trên trang web vidforge-ai (hoặc bất kỳ web nào) để tìm kịch bản
function getLatestScript() {
  // 1. Ưu tiên cao nhất: Lấy chữ mà người dùng đang bôi đen
  const selectedText = window.getSelection().toString();
  if (selectedText.trim()) return selectedText.trim();

  // 2. Tìm thẻ pre (nếu kịch bản được định dạng trong đó)
  const preElements = document.querySelectorAll('pre');
  if (preElements.length > 0 && preElements[preElements.length - 1].innerText.trim()) {
    return preElements[preElements.length - 1].innerText.trim();
  }
  
  // 3. Tìm các khung chat (prose, markdown, text-white, message)
  const aiMessages = document.querySelectorAll('.prose, .markdown, .whitespace-pre-wrap, .message, article');
  if (aiMessages.length > 0) {
    // Lấy tin nhắn cuối cùng
    const lastMsg = aiMessages[aiMessages.length - 1].innerText.trim();
    if (lastMsg.length > 20) return lastMsg;
  }

  // 4. Lấy các đoạn văn dài
  const paragraphs = Array.from(document.querySelectorAll('p')).filter(p => p.innerText.length > 30);
  if (paragraphs.length > 0) {
    return paragraphs.map(p => p.innerText).join('\n\n');
  }

  // 5. Dự phòng cuối: Lấy toàn bộ text
  return document.body.innerText.trim();
}
