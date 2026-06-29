function setNativeValue(element, value) {
    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
        const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
        
        if (valueSetter && valueSetter !== prototypeValueSetter) {
            prototypeValueSetter.call(element, value);
        } else if (valueSetter) {
            valueSetter.call(element, value);
        } else {
            element.value = value;
        }
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
        // Dành cho contenteditable
        element.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, value);
        element.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

// Tìm ô nhập liệu xuyên qua Shadow DOM
function findInputInShadowDOM(root = document) {
    const candidates = root.querySelectorAll('textarea, [contenteditable="true"], [role="textbox"]');
    for (let el of candidates) {
        if (el.offsetParent !== null && !el.disabled) {
            return el;
        }
    }
    
    const allElements = root.querySelectorAll('*');
    for (let el of allElements) {
        if (el.shadowRoot) {
            const found = findInputInShadowDOM(el.shadowRoot);
            if (found) return found;
        }
    }
    return null;
}

// Tìm nút gửi xuyên qua Shadow DOM
function findSubmitButtonInShadowDOM(root = document) {
    const candidates = root.querySelectorAll('button, [role="button"], [aria-label*="Send"], [aria-label*="Gửi"], [aria-label*="Create"]');
    for (let el of candidates) {
        const text = el.innerText?.toLowerCase() || '';
        const ariaLabel = el.getAttribute('aria-label')?.toLowerCase() || '';
        if (el.innerHTML.includes('svg') || text.includes('send') || text.includes('gửi') || text.includes('create') || ariaLabel.includes('send') || ariaLabel.includes('create') || ariaLabel.includes('gửi')) {
            if (el.offsetParent !== null && !el.disabled) {
                return el;
            }
        }
    }
    
    const allElements = root.querySelectorAll('*');
    for (let el of allElements) {
        if (el.shadowRoot) {
            const found = findSubmitButtonInShadowDOM(el.shadowRoot);
            if (found) return found;
        }
    }
    return null;
}

// Chờ ô nhập liệu xuất hiện
function waitForInputDeep(timeout = 20000) {
    return new Promise((resolve) => {
        const check = () => {
            const found = findInputInShadowDOM(document);
            if (found) {
                resolve(found);
                return true;
            }
            return false;
        };
        if (check()) return;
        
        const interval = setInterval(() => {
            if (check()) {
                clearInterval(interval);
            }
        }, 1000);
        
        setTimeout(() => {
            clearInterval(interval);
            resolve(null);
        }, timeout);
    });
}

async function runGoogleFlowAutomation() {
    chrome.storage.local.get(['currentPrompt', 'workflowStep'], async (data) => {
        if (data.workflowStep !== "GOOGLE_FLOW_GENERATING" || !data.currentPrompt) return;
        
        console.log("VidForge: Đang tự động hóa Google Flow...");
        
        try {
            navigator.clipboard.writeText(data.currentPrompt);
            console.log("VidForge: Đã copy sẵn prompt vào clipboard dự phòng.");
        } catch(e) {}

        // 1. Tìm ô nhập liệu của Google Flow (hỗ trợ Shadow DOM)
        const inputElement = await waitForInputDeep(20000); 
        if (!inputElement) {
            console.error("VidForge: Không tìm thấy ô nhập chữ trên Google Flow.");
            alert("VidForge: Lỗi - Không tìm thấy ô chat của Google Flow. Kịch bản đã được COPY, bạn chỉ cần bấm Ctrl+V vào ô chat là xong!");
            return;
        }

        // 2. Điền Prompt
        setNativeValue(inputElement, data.currentPrompt);
        
        // 3. Giả lập bấm phím Enter để Gửi
        setTimeout(async () => {
            inputElement.focus();
            
            // Dispatch phím Enter
            inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
            inputElement.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
            inputElement.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
            
            // Thử tìm nút Gửi trong Shadow DOM và click
            setTimeout(() => {
                const submitBtn = findSubmitButtonInShadowDOM(document);
                if (submitBtn) {
                    console.log("VidForge: Đã tìm thấy nút gửi, đang click...", submitBtn);
                    submitBtn.click();
                }
            }, 500);
            
            chrome.storage.local.set({ workflowStep: "GOOGLE_FLOW_WAITING_RESULT" });
            waitForResponse();
        }, 1500);
    });
}

async function waitForResponse() {
    console.log("VidForge: Đang chờ Google Flow tạo kết quả...");
    
    let lastLength = 0;
    let unchangedTime = 0;
    
    const checkInterval = setInterval(() => {
        // Trên Google Flow, kết quả có thể nằm sâu trong Shadow DOM, ta sẽ quét toàn bộ text trên trang thay đổi
        // Lấy tất cả text đang hiển thị
        const allText = document.body.innerText;
        
        if (allText.length > 500) {
            if (allText.length === lastLength) {
                unchangedTime += 1000;
                if (unchangedTime >= 5000) {
                    clearInterval(checkInterval);
                    finishGoogleFlow();
                }
            } else {
                lastLength = allText.length;
                unchangedTime = 0;
            }
        }
    }, 1000);
}

function finishGoogleFlow() {
    console.log("VidForge: Google Flow đã tạo xong!");
    chrome.runtime.sendMessage({ action: "GOOGLE_FLOW_FINISHED", result: "Hoàn tất" });
    alert("VidForge: Đã gửi kịch bản thành công và Google Flow đang thực hiện/đã hoàn tất!");
}

// Bắt đầu khi load trang
runGoogleFlowAutomation();
