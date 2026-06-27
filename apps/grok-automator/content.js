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
    // Kiểm tra xem có đang ở bước làm việc với Grok không
    chrome.storage.local.get(['currentPrompt', 'workflowStep'], async (data) => {
        if (data.workflowStep !== "GROK_GENERATING" || !data.currentPrompt) return;
        
        console.log("VidForge: Đang tự động hóa Grok...");
        
        // 1. Tìm ô nhập liệu của Grok
        // Grok hiện tại dùng thẻ textarea để nhập
        const textarea = await waitForElement("textarea"); 
        if (!textarea) {
            console.error("VidForge: Không tìm thấy ô nhập chữ trên Grok.");
            return;
        }

        // 2. Điền Prompt
        setNativeValue(textarea, data.currentPrompt);
        
        // 3. Giả lập bấm phím Enter để Gửi
        setTimeout(async () => {
            textarea.dispatchEvent(new KeyboardEvent('keydown', { 
                key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true 
            }));
            
            // Cập nhật trạng thái để khỏi gõ lặp đi lặp lại
            chrome.storage.local.set({ workflowStep: "GROK_WAITING_RESULT" });
            
            // 4. Chờ Grok trả lời và thu thập kết quả
            waitForResponse();
        }, 1000);
    });
}

async function waitForResponse() {
    console.log("VidForge: Đang chờ Grok tạo câu trả lời...");
    
    // Ghi chú: Logic chờ thực tế sẽ dùng MutationObserver để biết khi nào nút "Stop" hoặc icon "Copy" xuất hiện.
    // Ở bản Demo này, chúng ta cho nó đợi 15 giây rồi quét nội dung.
    setTimeout(() => {
        // Hầu hết các chatbot dùng class như 'prose' cho phần text markdown
        // hoặc chúng ta có thể quét các đoạn văn bản (p) trong khu vực chat
        const messageElements = document.querySelectorAll('.prose, p'); 
        
        if (messageElements.length > 0) {
            // Lấy đoạn văn bản mới nhất (cuối cùng)
            const resultText = Array.from(messageElements).slice(-5).map(el => el.innerText).join('\\n');
            console.log("VidForge: Lấy được kịch bản:\\n", resultText);
            
            // Gửi dữ liệu về Background Script
            chrome.runtime.sendMessage({ action: "GROK_FINISHED", result: resultText });
            
            alert("VidForge: Đã tạo xong kịch bản tự động! Xem console để biết thêm chi tiết.");
        } else {
            console.warn("VidForge: Chưa tìm thấy kết quả từ Grok.");
        }
    }, 15000);
}

// Bắt đầu khi load trang
runGrokAutomation();
