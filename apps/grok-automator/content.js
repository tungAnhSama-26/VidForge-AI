// Hàm giả lập gõ phím cho các web app dùng React/Vue/Svelte
function setNativeValue(element, value) {
    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
    
    if (valueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value);
    } else {
        valueSetter.call(element, value);
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
}

// Chờ Element xuất hiện trên DOM
function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }
        const observer = new MutationObserver(() => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => { observer.disconnect(); resolve(null); }, timeout);
    });
}

async function runGrokAutomation() {
    chrome.storage.local.get(['currentPrompt', 'workflowStep'], async (data) => {
        if (data.workflowStep !== "GROK_GENERATING" || !data.currentPrompt) return;
        
        console.log("VidForge: Đang tự động hóa Grok...");
        
        // 1. Tìm ô nhập liệu của Grok
        const textarea = await waitForElement("textarea"); 
        if (!textarea) {
            console.error("VidForge: Không tìm thấy ô nhập chữ trên Grok.");
            return;
        }

        // 2. Điền Prompt
        setNativeValue(textarea, data.currentPrompt);
        
        // 3. Giả lập bấm phím Enter để Gửi
        setTimeout(async () => {
            // Thử trigger phím Enter
            textarea.dispatchEvent(new KeyboardEvent('keydown', { 
                key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true 
            }));
            
            // Tìm nút Send (thường nằm cạnh textarea) và click vào nếu có
            const submitBtn = textarea.parentElement.parentElement.querySelector('button');
            if (submitBtn) submitBtn.click();
            
            chrome.storage.local.set({ workflowStep: "GROK_WAITING_RESULT" });
            
            // 4. Chờ Grok trả lời và thu thập kết quả
            waitForResponse();
        }, 1000);
    });
}

async function waitForResponse() {
    console.log("VidForge: Đang chờ Grok tạo câu trả lời...");
    
    let lastLength = 0;
    let unchangedTime = 0;
    
    // Quét liên tục mỗi giây để xem Grok đã gõ xong chưa
    const checkInterval = setInterval(() => {
        // Trên Grok/X, nội dung chat thường nằm trong các thẻ div có dir="auto" hoặc class prose
        const messageElements = document.querySelectorAll('.prose, [dir="auto"]');
        
        if (messageElements.length > 0) {
            const currentText = Array.from(messageElements).map(el => el.innerText).join('\n');
            
            // Nếu text không đổi trong 4 giây liên tiếp -> Grok đã viết xong
            if (currentText.length > 50 && currentText.length === lastLength) {
                unchangedTime += 1000;
                if (unchangedTime >= 4000) {
                    clearInterval(checkInterval);
                    finishGrok();
                }
            } else {
                lastLength = currentText.length;
                unchangedTime = 0;
            }
        }
    }, 1000);
}

function finishGrok() {
    // Lấy câu trả lời mới nhất (câu cuối cùng trong khung chat)
    const blocks = document.querySelectorAll('.prose, [dir="auto"]');
    if (blocks.length === 0) return;
    
    // Grok trả về nhiều block, ta lấy block của AI (thường là block cuối cùng chứa nội dung dài)
    const finalScript = blocks[blocks.length - 1].innerText;
    
    console.log("VidForge: Lấy được kịch bản từ Grok:\n", finalScript);
    chrome.runtime.sendMessage({ action: "GROK_FINISHED", result: finalScript });
    alert("VidForge: Đã tạo xong kịch bản tự động trên Grok! Sẵn sàng sang bước tạo Video.");
}

// Bắt đầu khi load trang
runGrokAutomation();
