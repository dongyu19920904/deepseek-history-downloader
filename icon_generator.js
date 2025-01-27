// 创建canvas元素
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// 定义尺寸数组
const sizes = [16, 48, 128];

// 为每个尺寸生成图标
sizes.forEach(size => {
    canvas.width = size;
    canvas.height = size;
    
    // 清空画布
    ctx.clearRect(0, 0, size, size);
    
    // 创建渐变
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#2196F3');
    gradient.addColorStop(1, '#1976D2');
    
    // 绘制圆角矩形（聊天气泡）
    const padding = size * 0.1;
    const radius = size * 0.2;
    
    ctx.beginPath();
    ctx.moveTo(padding + radius, padding);
    ctx.lineTo(size - padding - radius, padding);
    ctx.arcTo(size - padding, padding, size - padding, padding + radius, radius);
    ctx.lineTo(size - padding, size - padding - radius);
    ctx.arcTo(size - padding, size - padding, size - padding - radius, size - padding, radius);
    ctx.lineTo(padding + radius, size - padding);
    ctx.arcTo(padding, size - padding, padding, size - padding - radius, radius);
    ctx.lineTo(padding, padding + radius);
    ctx.arcTo(padding, padding, padding + radius, padding, radius);
    ctx.closePath();
    
    // 填充渐变色
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // 绘制下载箭头
    ctx.beginPath();
    ctx.moveTo(size/2, size * 0.3);
    ctx.lineTo(size/2, size * 0.7);
    ctx.moveTo(size * 0.3, size * 0.5);
    ctx.lineTo(size/2, size * 0.7);
    ctx.lineTo(size * 0.7, size * 0.5);
    
    // 设置箭头样式
    ctx.strokeStyle = 'white';
    ctx.lineWidth = size * 0.1;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    // 导出图片
    const link = document.createElement('a');
    link.download = `icon${size}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}); 