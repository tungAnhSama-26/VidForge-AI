document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = "https://vidforge-ai.duckdns.org";
  // Nếu bạn đang chạy server local, bạn có thể comment dòng trên và bật dòng dưới
  // const API_BASE = "http://localhost:3000";
  
  const loadingState = document.getElementById('loading-state');
  const unauthState = document.getElementById('unauth-state');
  const authState = document.getElementById('auth-state');
  
  const btnLogin = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');
  const btnExtract = document.getElementById('btn-extract');
  const btnDashboard = document.getElementById('btn-dashboard');
  
  const userNameEl = document.getElementById('user-name');
  const userEmailEl = document.getElementById('user-email');
  const userAvatarPlaceholder = document.getElementById('user-avatar-placeholder');

  // Kiểm tra trạng thái đăng nhập
  async function checkAuth() {
    try {
      const response = await fetch(`${API_BASE}/api/auth/session`, {
        method: 'GET',
        // 'include' để Chrome gửi kèm Cookie xác thực lên server khác domain
        credentials: 'include', 
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const session = await response.json();
        
        if (session && session.user && Object.keys(session.user).length > 0) {
          showAuthState(session.user);
        } else {
          showUnauthState();
        }
      } else {
        showUnauthState();
      }
    } catch (error) {
      console.error("Lỗi khi fetch session:", error);
      showUnauthState();
    }
  }

  function showAuthState(user) {
    loadingState.classList.add('hidden');
    
    unauthState.classList.add('hidden');
    unauthState.classList.remove('flex');
    
    authState.classList.remove('hidden');
    authState.classList.add('flex');
    
    userNameEl.textContent = user.name || "Người dùng";
    userEmailEl.textContent = user.email || "";
    userAvatarPlaceholder.textContent = (user.name || "U").charAt(0).toUpperCase();
  }

  function showUnauthState() {
    loadingState.classList.add('hidden');
    
    authState.classList.add('hidden');
    authState.classList.remove('flex');
    
    unauthState.classList.remove('hidden');
    unauthState.classList.add('flex');
  }

  // Chuyển hướng tab
  btnLogin.addEventListener('click', () => {
    chrome.tabs.create({ url: `${API_BASE}/login` });
  });

  btnDashboard.addEventListener('click', () => {
    chrome.tabs.create({ url: `${API_BASE}/dashboard` });
  });

  btnLogout.addEventListener('click', () => {
    chrome.tabs.create({ url: `${API_BASE}/api/auth/signout` });
  });

  // Chức năng phân tích trang hiện tại
  btnExtract.addEventListener('click', async () => {
    try {
      // Đổi text thành đang tải
      const originalText = btnExtract.innerHTML;
      btnExtract.innerHTML = '<span class="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full block mx-auto my-3"></span>';
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        alert("Không tìm thấy tab hiện tại!");
        btnExtract.innerHTML = originalText;
        return;
      }

      // Không thể chạy content script trên các trang chrome:// hoặc edge://
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) {
        alert("Không thể phân tích trang nội bộ của trình duyệt.");
        btnExtract.innerHTML = originalText;
        return;
      }
      
      // Inject script để lấy nội dung text
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          // Xóa một số tag không cần thiết
          const clone = document.body.cloneNode(true);
          const elementsToRemove = clone.querySelectorAll('script, style, nav, footer, iframe, noscript');
          elementsToRemove.forEach(el => el.remove());
          
          let text = clone.innerText || "";
          
          // Nén nội dung, loại bỏ khoảng trắng thừa
          text = text.replace(/\s+/g, ' ').trim();
          
          return {
            title: document.title,
            content: text.substring(0, 5000) // Lấy tối đa 5000 ký tự đầu tiên
          };
        }
      }, (injectionResults) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          alert("Không thể lấy nội dung từ trang này.");
          btnExtract.innerHTML = originalText;
          return;
        }

        if (injectionResults && injectionResults[0] && injectionResults[0].result) {
          const pageData = injectionResults[0].result;
          const promptText = `Hãy tóm tắt bài viết sau thành một kịch bản video:\nTiêu đề: ${pageData.title}\nNội dung: ${pageData.content}`;
          
          // Mở tab Dashboard với tham số truyền qua URL (prompt)
          // encodeURIComponent giúp mã hóa chuỗi truyền đi an toàn
          chrome.tabs.create({ url: `${API_BASE}/dashboard?prompt=${encodeURIComponent(promptText)}` });
        }
        
        btnExtract.innerHTML = originalText;
      });
      
    } catch (error) {
      console.error(error);
      alert("Đã xảy ra lỗi.");
      btnExtract.innerHTML = originalText;
    }
  });

  // Gọi check auth ngay khi popup tải lên
  checkAuth();
});
