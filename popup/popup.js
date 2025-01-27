document.getElementById('downloadBtn').addEventListener('click', async () => {
  const statusEl = document.getElementById('status');
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('chat.deepseek.com')) {
      statusEl.textContent = '请在 Deepseek Chat 页面使用此扩展';
      return;
    }

    statusEl.textContent = '正在获取对话内容...';
    
    const format = document.getElementById('formatSelect').value;
    const response = await chrome.tabs.sendMessage(tab.id, { 
      action: 'downloadChat',
      format: format
    });
    
    if (response && response.success) {
      statusEl.textContent = '下载成功！';
    } else {
      statusEl.textContent = response?.error || '下载失败，请重试';
    }
  } catch (error) {
    console.error('Error:', error);
    statusEl.textContent = '发生错误，请刷新页面后重试';
  }
}); 