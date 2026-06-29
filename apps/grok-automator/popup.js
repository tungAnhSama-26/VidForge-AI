document.getElementById('start-btn').addEventListener('click', async () => {
  const statusEl = document.getElementById('status');
  const resultContainer = document.getElementById('result-container');
  const scriptPreview = document.getElementById('script-preview');
  
  statusEl.style.display = 'block';
  statusEl.innerText = "Đang tìm kịch bản mới nhất...";
  resultContainer.style.display = 'none';

  // Tìm tất cả các tab đang mở
  let tabs = await chrome.tabs.query({});
  
  // Ưu tiên tìm tab có chứa chữ vidforge hoặc localhost
  let tab = tabs.find(t => t.url && (t.url.includes('vidforge') || t.url.includes('localhost')));
  
  // Nếu không thấy, lấy tab đang active hiện tại
  if (!tab) {
    let activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
    tab = activeTabs[0];
  }

  if (!tab || !tab.id) {
    statusEl.innerText = "Không tìm thấy tab nào hợp lệ.";
    return;
  }

  // Bắt lỗi nếu tab hiện tại là các trang cấm của trình duyệt
  if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:'))) {
    statusEl.innerHTML = "❌ Extension không thể lấy kịch bản từ trang này.<br><br>👉 <b>Mẹo:</b> Hãy vào trang chứa kịch bản (ví dụ <a href='#' id='open-vidforge' style='color:blue;text-decoration:underline;'>VidForge AI</a>) trước nhé!";
    statusEl.style.color = "#d32f2f";
    
    // Đợi 1 chút để DOM cập nhật rồi mới gán event
    setTimeout(() => {
      const link = document.getElementById('open-vidforge');
      if (link) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          chrome.tabs.create({ url: "https://vidforge-ai.duckdns.org/" });
        });
      }
    }, 50);
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getLatestScript,
  }, (injectionResults) => {
    if (chrome.runtime.lastError) {
      const errMsg = chrome.runtime.lastError.message || "Không rõ nguyên nhân";
      statusEl.innerHTML = `❌ Trình duyệt chặn quyền truy cập trang này.<br>Chi tiết: ${errMsg}<br><br>👉 Hãy thử F5 tải lại trang hoặc mở trang VidForge nhé!`;
      statusEl.style.color = "#d32f2f";
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

    // Gắn sự kiện cho nút Tạo Video
    document.getElementById('grok-btn').onclick = () => {
      document.getElementById('grok-btn').innerText = "Đang chuyển sang Google Flow...";
      chrome.runtime.sendMessage({
        action: "START_GOOGLE_FLOW_WORKFLOW",
        prompt: grokPrompt
      });
    };
  });
});

function getLatestScript() {
  // 0. Ưu tiên cao nhất: Lấy chữ mà người dùng đang bôi đen
  const selectedText = window.getSelection().toString();
  if (selectedText.trim()) return selectedText.trim();

  // 1. CHUẨN VIDFORGE: Tìm khung kịch bản (Detailed Script) mới nhất
  const vfScripts = document.querySelectorAll('pre.whitespace-pre-wrap');
  if (vfScripts.length > 0 && vfScripts[vfScripts.length - 1].innerText.trim()) {
    return vfScripts[vfScripts.length - 1].innerText.trim();
  }

  // 2. CHUẨN VIDFORGE: Tìm tin nhắn chat của AI mới nhất (nền trong suốt)
  const vfAiMessages = document.querySelectorAll('.bg-transparent.text-white, .p-4.rounded-3xl');
  if (vfAiMessages.length > 0) {
    for (let i = vfAiMessages.length - 1; i >= 0; i--) {
      const el = vfAiMessages[i];
      if (!el.className.includes('bg-white/10')) {
        const text = el.innerText.trim();
        if (text.length > 20 && !text.toLowerCase().includes('cookie')) {
           return text;
        }
      }
    }
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
    if (lastMsg.length > 10 && !lastMsg.toLowerCase().includes('cookie')) return lastMsg;
  }

  // 5. Dự phòng cuối cùng: Lấy đoạn văn dài nhất
  const paragraphs = Array.from(document.querySelectorAll('p, div'))
    .filter(p => p.innerText.length > 50 && !p.innerText.toLowerCase().includes('cookies allow us'));
  
  if (paragraphs.length > 0) {
    return paragraphs[paragraphs.length - 1].innerText.trim();
  }

  const fallbackText = document.body.innerText.trim();
  if (fallbackText === "VidForge AI" || fallbackText.length < 20) {
    return "[LỖI]: Không tìm thấy kịch bản nào trên màn hình!\n\nHướng dẫn: Bạn hãy dùng chuột BÔI ĐEN (highlight) đoạn chữ bạn muốn lấy, sau đó bấm lại nút 'Lấy Kịch Bản' nhé.";
  }
  return fallbackText;
}
