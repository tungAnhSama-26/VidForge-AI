document.getElementById('start-btn').addEventListener('click', async () => {
  const statusEl = document.getElementById('status');
  statusEl.style.display = 'block';
  statusEl.innerText = "Đang lấy kịch bản từ web...";

  // Lấy tab hiện tại (chính là trang web vidforge-ai của user)
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Tiêm một đoạn script nhỏ để lấy chữ đang bôi đen trên web
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getSelectionText,
  }, (injectionResults) => {
    if (!injectionResults || !injectionResults[0]) return;
    
    const selectedText = injectionResults[0].result;
    
    if (!selectedText || selectedText.trim() === "") {
      statusEl.innerText = "Lỗi: Bạn chưa bôi đen kịch bản nào trên web cả!";
      statusEl.style.color = "red";
      return;
    }

    statusEl.innerText = "Đã lấy được kịch bản! Đang mở Grok...";
    statusEl.style.color = "green";

    const grokPrompt = `Hãy tạo cho tôi các prompt chi tiết để làm video (hình ảnh và âm thanh) từ kịch bản sau:\n\n${selectedText}`;

    // Gửi kịch bản về background để mở Grok
    chrome.runtime.sendMessage({
      action: "START_GROK_WORKFLOW",
      prompt: grokPrompt
    });
  });
});

// Hàm này sẽ được chạy trực tiếp trên trang web vidforge-ai.duckdns.org
function getSelectionText() {
  return window.getSelection().toString();
}
