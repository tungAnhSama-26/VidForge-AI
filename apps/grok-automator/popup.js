document.getElementById('start-btn').addEventListener('click', async () => {
  const statusEl = document.getElementById('status');
  statusEl.style.display = 'block';
  statusEl.innerText = "Đang quét kịch bản mới nhất...";

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getLatestScript,
  }, (injectionResults) => {
    if (!injectionResults || !injectionResults[0]) return;
    
    const scriptText = injectionResults[0].result;
    
    if (!scriptText || scriptText.trim() === "") {
      statusEl.innerText = "Lỗi: Không tìm thấy kịch bản nào trên trang này!";
      statusEl.style.color = "red";
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

// Hàm này chạy trên trang web vidforge-ai để tìm thẻ <pre> chứa kịch bản mới nhất
function getLatestScript() {
  const preElements = document.querySelectorAll('pre');
  if (preElements.length > 0) {
    // Lấy thẻ pre cuối cùng (chứa kịch bản mới nhất)
    return preElements[preElements.length - 1].innerText;
  }
  return null;
}
