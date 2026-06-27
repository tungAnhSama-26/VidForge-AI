chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "START_GROK_WORKFLOW") {
    // 1. Lưu prompt vào storage và đánh dấu trạng thái đang chạy Grok
    chrome.storage.local.set({ 
        currentPrompt: request.prompt, 
        workflowStep: "GROK_GENERATING" 
    }, () => {
      // 2. Mở tab Grok
      chrome.tabs.create({ url: "https://grok.com/" });
    });
  }
  
  if (request.action === "GROK_FINISHED") {
    const script = request.result;
    console.log("Kịch bản thu được từ Grok:", script);
    
    // Lưu kịch bản vào storage và chuyển sang bước tiếp theo
    chrome.storage.local.set({ 
        generatedScript: script, 
        workflowStep: "WAITING_VOICE_GEN" 
    });
    
    // TODO: Ở các version tiếp theo, chỗ này sẽ mở tab ElevenLabs hoặc Vbee
    // chrome.tabs.create({ url: "https://elevenlabs.io/app/speech-synthesis" });
  }
});
