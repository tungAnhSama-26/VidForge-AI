chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "START_GOOGLE_FLOW_WORKFLOW") {
    // 1. Lưu prompt vào storage và đánh dấu trạng thái đang chạy Google Flow
    chrome.storage.local.set({ 
        currentPrompt: request.prompt, 
        workflowStep: "GOOGLE_FLOW_GENERATING" 
    }, () => {
      // 2. Mở tab Google Flow
      chrome.tabs.create({ url: "https://labs.google/fx/tools/flow" });
    });
  }
  
  if (request.action === "GOOGLE_FLOW_FINISHED") {
    const script = request.result;
    console.log("Kịch bản thu được từ Google Flow:", script);
    
    // Lưu kịch bản vào storage và chuyển sang bước tiếp theo
    chrome.storage.local.set({ 
        generatedScript: script, 
        workflowStep: "WAITING_VOICE_GEN" 
    });
    
    // TODO: Ở các version tiếp theo, chỗ này sẽ mở tab ElevenLabs hoặc Vbee
    // chrome.tabs.create({ url: "https://elevenlabs.io/app/speech-synthesis" });
  }
});
