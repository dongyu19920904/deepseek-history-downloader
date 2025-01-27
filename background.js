// 清理文件名，移除不合法字符
function sanitizeFileName(fileName) {
  return fileName.replace(/[<>:"/\\|?*]/g, '').trim();
}

// 生成下载文件名
async function generateFileName(tab) {
  // 获取当前日期
  const date = new Date().toISOString().split('T')[0];
  
  try {
    // 从内容脚本获取对话标题
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getChatTitle' });
    const title = response.title;
    
    // 如果有标题，使用标题+日期作为文件名
    if (title) {
      const sanitizedTitle = sanitizeFileName(title);
      return `${sanitizedTitle} (${date}).md`;
    }
  } catch (error) {
    console.error('获取标题失败:', error);
  }
  
  // 如果获取标题失败，使用默认格式
  return `deepseek-chat-${date}.md`;
}

// 修改下载处理函数
async function handleDownload(tab) {
  // ... existing code ...
  
  const fileName = await generateFileName(tab);
  
  chrome.downloads.download({
    url: URL.createObjectURL(new Blob([content], {type: 'text/markdown'})),
    filename: fileName,
    saveAs: false
  });
  
  // ... existing code ...
} 