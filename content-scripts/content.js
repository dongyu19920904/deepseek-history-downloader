// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadChat') {
    downloadChatHistory(request).then(result => {
      sendResponse(result);
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});

// 等待元素加载的辅助函数
function waitForElement(selector, maxAttempts = 20) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      console.log(`尝试查找元素 ${selector} (第 ${attempts} 次)`);
      const element = document.querySelector(selector);
      if (element) {
        console.log('找到元素:', element);
        resolve(element);
      } else if (attempts >= maxAttempts) {
        reject(new Error('元素加载超时'));
      } else {
        setTimeout(check, 500); // 缩短检查间隔
      }
    };
    check();
  });
}

// 转换为Markdown格式
function convertToMarkdown(messages) {
  let markdown = '# Deepseek Chat 对话记录\n\n';
  markdown += `时间: ${new Date().toLocaleString()}\n\n`;
  
  messages.forEach(msg => {
    const role = msg.role === 'user' ? '👤 用户' : '🤖 Assistant';
    markdown += `### ${role}\n\n${msg.content}\n\n---\n\n`;
  });
  
  return markdown;
}

// 转换为纯文本格式
function convertToTxt(messages) {
  let txt = 'Deepseek Chat 对话记录\n\n';
  txt += `时间: ${new Date().toLocaleString()}\n\n`;
  
  messages.forEach(msg => {
    const role = msg.role === 'user' ? '用户' : 'Assistant';
    txt += `${role}:\n${msg.content}\n\n`;
  });
  
  return txt;
}

// 转换为HTML格式
function convertToHtml(messages) {
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Deepseek Chat 对话记录</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .message { margin-bottom: 20px; padding: 10px; border-radius: 5px; }
    .user { background-color: #f0f0f0; }
    .assistant { background-color: #f8f8f8; }
    .role { font-weight: bold; margin-bottom: 5px; }
    pre { background-color: #f5f5f5; padding: 10px; border-radius: 3px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>Deepseek Chat 对话记录</h1>
  <p>时间: ${new Date().toLocaleString()}</p>
`;

  messages.forEach(msg => {
    const role = msg.role === 'user' ? '用户' : 'Assistant';
    html += `
  <div class="message ${msg.role}">
    <div class="role">${role}</div>
    <div class="content">${msg.content.replace(/\n/g, '<br>')}</div>
  </div>`;
  });

  html += `
</body>
</html>`;

  return html;
}

// 下载聊天历史
async function downloadChatHistory(request) {
  try {
    console.log('开始获取对话内容...');
    
    // 等待页面加载完成
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 尝试查找消息容器
    console.log('正在查找消息容器...');
    
    // 获取所有可能包含消息的元素
    const messageElements = Array.from(document.querySelectorAll('div'))
      .filter(el => {
        // 查找包含实际对话内容的div
        const text = el.textContent.trim();
        const hasContent = text.length > 0;
        const isMessageContainer = 
          (el.className && el.className.includes('markdown')) || 
          (el.className && el.className.includes('message')) ||
          el.querySelector('pre') !== null;
        return hasContent && isMessageContainer;
      });

    console.log('找到潜在消息元素:', messageElements.length);
    
    if (messageElements.length === 0) {
      // 输出页面结构以帮助调试
      console.log('页面结构:', document.body.innerHTML);
      throw new Error('未找到任何消息内容');
    }

    // 获取所有消息
    const messages = [];
    messageElements.forEach((element, index) => {
      // 查找最近的父元素来确定角色
      let currentElement = element;
      let isUser = false;
      
      // 向上查找5层父元素
      for (let i = 0; i < 5; i++) {
        if (!currentElement) break;
        
        // 检查是否包含表示用户消息的特征
        if (
          currentElement.className && (
            currentElement.className.includes('user') ||
            currentElement.className.includes('human') ||
            currentElement.className.includes('bg-blue')
          )
        ) {
          isUser = true;
          break;
        }
        currentElement = currentElement.parentElement;
      }

      const role = isUser ? 'user' : 'assistant';
      const content = element.textContent.trim();
      
      if (content) {
        console.log(`处理第 ${index + 1} 条消息:`, { 
          role, 
          contentLength: content.length,
          className: element.className
        });
        messages.push({ role, content });
      }
    });

    if (messages.length === 0) {
      throw new Error('无法提取消息内容');
    }

    console.log(`成功提取 ${messages.length} 条消息`);

    // 根据格式处理内容
    let content, filename, type;
    const format = request.format || 'json';
    const timestamp = new Date().toISOString().slice(0,10);

    switch (format) {
      case 'markdown':
        content = convertToMarkdown(messages);
        filename = `deepseek-chat-${timestamp}.md`;
        type = 'text/markdown';
        break;
      case 'txt':
        content = convertToTxt(messages);
        filename = `deepseek-chat-${timestamp}.txt`;
        type = 'text/plain';
        break;
      case 'html':
        content = convertToHtml(messages);
        filename = `deepseek-chat-${timestamp}.html`;
        type = 'text/html';
        break;
      default:
        content = JSON.stringify({
          title: document.title || 'Deepseek Chat 对话',
          url: window.location.href,
          timestamp: new Date().toISOString(),
          messages: messages
        }, null, 2);
        filename = `deepseek-chat-${timestamp}.json`;
        type = 'application/json';
    }

    // 下载文件
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true };

  } catch (error) {
    console.error('下载失败:', error);
    throw new Error(`下载失败: ${error.message}`);
  }
} 