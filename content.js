// 获取对话标题
function getChatTitle() {
  // 尝试从页面中获取标题元素
  const titleElement = document.querySelector('[class*="ConversationTitle"]');
  if (titleElement) {
    return titleElement.textContent.trim();
  }
  return ''; // 如果没找到标题则返回空字符串
}

// 监听来自扩展的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getChatTitle') {
    sendResponse({ title: getChatTitle() });
  }
}); 