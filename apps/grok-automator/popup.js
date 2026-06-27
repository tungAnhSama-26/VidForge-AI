document.getElementById('start-btn').addEventListener('click', async () => {
  const promptText = document.getElementById('prompt').value.trim();
  if (!promptText) {
    alert("Vui lòng nhập chủ đề!");
    return;
  }
  
  const statusEl = document.getElementById('status');
  statusEl.style.display = 'block';
  statusEl.innerText = "Đang mở tab Grok.com...";
  
  const fullPrompt = `Viết cho tôi một kịch bản video ngắn (TikTok/Shorts) về chủ đề: "${promptText}". 
Yêu cầu:
- Bao gồm cột hình ảnh (prompt miêu tả) và cột giọng đọc (voiceover).
- Văn phong hấp dẫn, giữ chân người xem.`;

  // Gửi lệnh cho background script
  chrome.runtime.sendMessage({
    action: "START_GROK_WORKFLOW",
    prompt: fullPrompt
  });
});
