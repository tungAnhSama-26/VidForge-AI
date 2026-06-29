document.getElementById('start-btn').addEventListener('click', async () => {
  const statusEl = document.getElementById('status');
  const resultContainer = document.getElementById('result-container');
  const scriptPreview = document.getElementById('script-preview');
  
  statusEl.style.display = 'block';
  statusEl.innerText = "Đang tìm kịch bản mới nhất...";
  resultContainer.style.display = 'none';

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

    statusEl.innerText = "Đã lấy được kịch bản thành công!";
    statusEl.style.color = "green";
    
    // Hiển thị kịch bản lên UI
    scriptPreview.value = scriptText;
    resultContainer.style.display = 'block';

    const grokPrompt = `Hãy tạo cho tôi các prompt chi tiết để làm video (hình ảnh và âm thanh) từ kịch bản sau:\n\n${scriptText}`;

    // Gắn sự kiện cho nút Mở Grok
    document.getElementById('grok-btn').onclick = () => {
      document.getElementById('grok-btn').innerText = "Đang mở Grok...";
      chrome.runtime.sendMessage({
        action: "START_GROK_WORKFLOW",
        prompt: grokPrompt
      });
    };
  });
});

// Hàm này chạy trên trang web vidforge-ai (hoặc bất kỳ web nào) để tìm kịch bản
function getLatestScript() {
  // 0. Ưu tiên cao nhất: Lấy chữ mà người dùng đang bôi đen
  const selectedText = window.getSelection().toString();
  if (selectedText.trim()) return selectedText.trim();

  // 1. CHUẨN VIDFORGE: Tìm khung kịch bản (Detailed Script) mới nhất
  const vfScripts = document.querySelectorAll('pre.whitespace-pre-wrap');
  if (vfScripts.length > 0 && vfScripts[vfScripts.length - 1].innerText.trim()) {
    return vfScripts[vfScripts.length - 1].innerText.trim();
  }

  // 2. CHUẨN VIDFORGE: Tìm tin nhắn chat của AI mới nhất (trường hợp không có khung kịch bản)
  const vfAiMessages = document.querySelectorAll('.bg-transparent.text-white');
  if (vfAiMessages.length > 0) {
    const lastMsg = vfAiMessages[vfAiMessages.length - 1].innerText.trim();
    if (lastMsg.length > 10) return lastMsg;
  }

  // 3. DỰ PHÒNG CÁC WEB KHÁC: Tìm thẻ pre chung
  const preElements = document.querySelectorAll('pre');
  if (preElements.length > 0 && preElements[preElements.length - 1].innerText.trim()) {
    return preElements[preElements.length - 1].innerText.trim();
  }
  
  // 4. DỰ PHÒNG CÁC WEB KHÁC: Tìm các khung chat phổ biến
  const aiMessages = document.querySelectorAll('.prose, .markdown, .message, article');
  if (aiMessages.length > 0) {
    const lastMsg = aiMessages[aiMessages.length - 1].innerText.trim();
    if (lastMsg.length > 10) return lastMsg;
  }

  // 5. Dự phòng cuối cùng: Lấy đoạn văn cuối cùng trên trang thay vì gom toàn bộ
  const paragraphs = Array.from(document.querySelectorAll('p')).filter(p => p.innerText.length > 30);
  if (paragraphs.length > 0) {
    return paragraphs[paragraphs.length - 1].innerText.trim();
  }

  return document.body.innerText.trim();
}
