/**
 * 知情同意书系统脚本
 */

// 全局变量
let currentConsentType = '';
let clientSignatureCanvas = null;
let counselorSignatureCanvas = null;
let clientCtx = null;
let counselorCtx = null;
let isDrawing = { client: false, counselor: false };
let lastPos = { client: { x: 0, y: 0 }, counselor: { x: 0, y: 0 } };
let isExporting = false;

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', function() {
    // 隐藏所有非活动页面
    document.querySelectorAll('.page').forEach(page => {
        if (!page.classList.contains('active')) {
            page.style.display = 'none';
        }
    });
    
    // 初始化签名画布
    initSignatureCanvases();
    
    // 添加页面加载完成提示
    console.log('知情同意书系统加载完成');
});

/**
 * 初始化签名画布
 */
function initSignatureCanvases() {
    // 初始化来访签名画布
    clientSignatureCanvas = document.getElementById('client-signature');
    if (clientSignatureCanvas) {
        clientCtx = clientSignatureCanvas.getContext('2d');
        resizeCanvas(clientSignatureCanvas);
        setupCanvasEvents(clientSignatureCanvas, 'client');
    }
    
    // 初始化咨询师签名画布
    counselorSignatureCanvas = document.getElementById('counselor-signature');
    if (counselorSignatureCanvas) {
        counselorCtx = counselorSignatureCanvas.getContext('2d');
        resizeCanvas(counselorSignatureCanvas);
        setupCanvasEvents(counselorSignatureCanvas, 'counselor');
    }
}

/**
 * 调整画布大小
 */
function resizeCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}

/**
 * 设置画布事件
 */
function setupCanvasEvents(canvas, type) {
    // 鼠标事件
    canvas.addEventListener('mousedown', function(e) {
        startDrawing(e, type);
    });
    
    canvas.addEventListener('mousemove', function(e) {
        draw(e, type);
    });
    
    canvas.addEventListener('mouseup', function() {
        stopDrawing(type);
    });
    
    canvas.addEventListener('mouseout', function() {
        stopDrawing(type);
    });
    
    // 触摸事件
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        startDrawing(e.touches[0], type);
    });
    
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        draw(e.touches[0], type);
    });
    
    canvas.addEventListener('touchend', function() {
        stopDrawing(type);
    });
}

/**
 * 开始绘制
 */
function startDrawing(e, type) {
    isDrawing[type] = true;
    const rect = (type === 'client' ? clientSignatureCanvas : counselorSignatureCanvas).getBoundingClientRect();
    lastPos[type] = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

/**
 * 绘制
 */
function draw(e, type) {
    if (!isDrawing[type]) return;
    
    const canvas = type === 'client' ? clientSignatureCanvas : counselorSignatureCanvas;
    const ctx = type === 'client' ? clientCtx : counselorCtx;
    const rect = canvas.getBoundingClientRect();
    const currentPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
    
    ctx.beginPath();
    ctx.moveTo(lastPos[type].x, lastPos[type].y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    lastPos[type] = currentPos;
    
    // 添加签名时的视觉反馈
    canvas.style.borderColor = '#27ae60';
    canvas.style.boxShadow = '0 0 0 2px rgba(39, 174, 96, 0.2)';
}

/**
 * 停止绘制
 */
function stopDrawing(type) {
    isDrawing[type] = false;
}

/**
 * 清除签名
 */
function clearSignature(type) {
    const canvas = type === 'client' ? clientSignatureCanvas : counselorSignatureCanvas;
    const ctx = type === 'client' ? clientCtx : counselorCtx;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 恢复画布样式
    canvas.style.borderColor = '#e0e0e0';
    canvas.style.boxShadow = 'none';
}

/**
 * 显示主页面
 */
function showMainPage() {
    hideAllPages();
    showPage('main-page');
    currentConsentType = '';
}

/**
 * 显示同意书页面
 */
function showConsentPage(type) {
    currentConsentType = type;
    
    // 更新标题
    const titleElement = document.getElementById('consent-title');
    if (titleElement) {
        titleElement.textContent = type === 'counseling' ? '心理咨询知情同意书' : '录音录像知情同意书';
    }
    
    // 显示对应内容
    document.getElementById('counseling-content').style.display = type === 'counseling' ? 'block' : 'none';
    document.getElementById('recording-content').style.display = type === 'recording' ? 'block' : 'none';
    
    // 显示页面
    hideAllPages();
    showPage('consent-page');
    
    // 重新调整画布大小
    setTimeout(() => {
        resizeCanvas(clientSignatureCanvas);
        resizeCanvas(counselorSignatureCanvas);
    }, 100);
}

/**
 * 显示预览页面
 */
function showPreviewPage() {
    // 验证签名
    const clientHasSignature = isCanvasEmpty(clientSignatureCanvas);
    const counselorHasSignature = isCanvasEmpty(counselorSignatureCanvas);
    
    if (!clientHasSignature || !counselorHasSignature) {
        alert('请完成双方签名后再预览');
        return;
    }
    
    // 生成预览内容
    generatePreviewContent();
    
    // 显示页面
    hideAllPages();
    showPage('preview-page');
}

/**
 * 检查画布是否为空
 */
function isCanvasEmpty(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        if (data[i] !== 0 || data[i + 1] !== 0 || data[i + 2] !== 0 || data[i + 3] !== 0) {
            return true;
        }
    }
    
    return false;
}

/**
 * 生成预览内容
 */
function generatePreviewContent() {
    const previewContent = document.getElementById('preview-content');
    if (!previewContent) return;
    
    // 获取同意书内容
    let consentContent = currentConsentType === 'counseling' 
        ? document.getElementById('counseling-content').innerHTML
        : document.getElementById('recording-content').innerHTML;
    
    // 删除原始HTML中的签名和日期行
    consentContent = consentContent.replace(/<p>来访者：[\s\u00A0]*咨询师：<\/p>/g, '');
    consentContent = consentContent.replace(/<p>年[\s\u00A0]+月[\s\u00A0]+日[\s\u00A0]*年[\s\u00A0]+月[\s\u00A0]+日<\/p>/g, '');
    consentContent = consentContent.replace(/<p>&nbsp;<\/p>/g, '');
    consentContent = consentContent.replace(/<p>\s*<\/p>/g, '');
    consentContent = consentContent.replace(/\s+<\/div>$/, '</div>');
    
    // 创建预览HTML，添加内联样式确保标题居中
    let html = `
        <div class="preview-document" style="background: white; padding: 50px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 900px; margin: 0 auto;">
            <style>
                h3 { text-align: center !important; margin-top: 30px !important; }
            </style>
            ${consentContent}
            
            <div style="margin-top: 60px; display: flex; justify-content: space-between;">
                <div style="text-align: center; width: 45%;">
                    <p style="margin-bottom: 15px; font-weight: 500;">来访者签名</p>
                    <img src="${clientSignatureCanvas.toDataURL()}" style="max-width: 100%; border: 1px solid #e0e0e0; padding: 15px; border-radius: 4px; background: #f9f9f9;">
                    <p style="margin-top: 15px; color: #7f8c8d;">日期：${new Date().toLocaleDateString()}</p>
                </div>
                
                <div style="text-align: center; width: 45%;">
                    <p style="margin-bottom: 15px; font-weight: 500;">咨询师签名</p>
                    <img src="${counselorSignatureCanvas.toDataURL()}" style="max-width: 100%; border: 1px solid #e0e0e0; padding: 15px; border-radius: 4px; background: #f9f9f9;">
                    <p style="margin-top: 15px; color: #7f8c8d;">日期：${new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    `;
    
    previewContent.innerHTML = html;
}

/**
 * 导出为图片
 */
function exportAsImage() {
    if (isExporting) return;
    
    const previewElement = document.querySelector('.preview-document');
    if (!previewElement) return;
    
    isExporting = true;
    
    // 添加加载提示
    const exportButtons = document.querySelectorAll('.export-btn');
    exportButtons.forEach(btn => {
        // 保存原始按钮文本
        btn.dataset.originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = '导出中...';
    });
    
    html2canvas(previewElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${currentConsentType === 'counseling' ? '心理咨询' : '录音录像'}知情同意书_${new Date().toISOString().slice(0, 10)}.png`;
        link.href = imgData;
        link.click();
        
        // 导出完成提示
        setTimeout(() => {
            alert('图片导出成功！');
        }, 500);
    }).catch(error => {
        console.error('导出图片失败:', error);
        alert('导出图片失败，请重试');
    }).finally(() => {
        // 恢复按钮状态
        setTimeout(() => {
            isExporting = false;
            exportButtons.forEach(btn => {
                btn.disabled = false;
                btn.textContent = btn.dataset.originalText || btn.textContent;
            });
        }, 1000);
    });
}

/**
 * 导出为PDF
 */
function exportAsPDF() {
    if (isExporting) return;
    
    const previewElement = document.querySelector('.preview-document');
    if (!previewElement) return;
    
    isExporting = true;
    
    // 添加加载提示
    const exportButtons = document.querySelectorAll('.export-btn');
    exportButtons.forEach(btn => {
        // 保存原始按钮文本
        btn.dataset.originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = '导出中...';
    });
    
    // 确保预览元素完全展开
    const originalStyles = {
        height: previewElement.style.height,
        overflow: previewElement.style.overflow,
        position: previewElement.style.position,
        zIndex: previewElement.style.zIndex
    };
    
    // 临时调整样式，确保所有内容可见
    previewElement.style.height = 'auto';
    previewElement.style.overflow = 'visible';
    previewElement.style.position = 'relative';
    previewElement.style.zIndex = '9999';
    
    // 强制重排
    previewElement.offsetHeight;
    
    // 计算实际高度，确保包含签名部分
    const actualHeight = previewElement.scrollHeight;
    const actualWidth = previewElement.scrollWidth;
    
    html2canvas(previewElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        // 确保捕获完整内容，包括签名部分
        height: actualHeight,
        width: actualWidth,
        // 禁用滚动以确保捕获完整内容
        scrollX: 0,
        scrollY: 0,
        // 确保捕获所有元素
        allowTaint: true,
        useCORS: true,
        // 增加捕获超时时间
        timeout: 10000
    }).then(canvas => {
        const { jsPDF } = window.jspdf;
        
        // 计算PDF尺寸
        const imgWidth = 210; // A4宽度
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // 创建PDF文档
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // 确保图片质量
        const imgData = canvas.toDataURL('image/png', 1.0);
        
        // 使用jsPDF的自动分页功能
        const pageHeight = 297; // A4高度
        let heightLeft = imgHeight;
        let position = 0;
        
        // 处理长内容分页
        if (imgHeight > pageHeight) {
            // 计算需要的页数
            const pages = Math.ceil(imgHeight / pageHeight);
            
            for (let i = 0; i < pages; i++) {
                // 添加新页面（第一页不需要）
                if (i > 0) {
                    pdf.addPage();
                }
                
                // 计算当前页的位置
                position = i * pageHeight;
                
                // 绘制当前页的内容
                pdf.addImage(
                    imgData, 
                    'PNG', 
                    0, 
                    -position, 
                    imgWidth, 
                    imgHeight
                );
                
                heightLeft -= pageHeight;
            }
        } else {
            // 单页显示
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        }
        
        pdf.save(`${currentConsentType === 'counseling' ? '心理咨询' : '录音录像'}知情同意书_${new Date().toISOString().slice(0, 10)}.pdf`);
        
        // 导出完成提示
        setTimeout(() => {
            alert('PDF导出成功！');
        }, 500);
    }).catch(error => {
        console.error('导出PDF失败:', error);
        alert('导出PDF失败，请重试');
    }).finally(() => {
        // 恢复预览元素样式
        Object.assign(previewElement.style, originalStyles);
        
        // 恢复按钮状态
        setTimeout(() => {
            isExporting = false;
            exportButtons.forEach(btn => {
                btn.disabled = false;
                btn.textContent = btn.dataset.originalText || btn.textContent;
            });
        }, 1000);
    });
}

/**
 * 隐藏所有页面
 */
function hideAllPages() {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });
}

/**
 * 显示指定页面
 */
function showPage(pageId) {
    const page = document.getElementById(pageId);
    if (page) {
        page.style.display = 'block';
        setTimeout(() => {
            page.classList.add('active');
        }, 10);
    }
}

/**
 * 页面大小改变时调整画布
 */
window.addEventListener('resize', function() {
    if (clientSignatureCanvas) {
        resizeCanvas(clientSignatureCanvas);
    }
    if (counselorSignatureCanvas) {
        resizeCanvas(counselorSignatureCanvas);
    }
});

/**
 * 阻止默认触摸行为
 */
window.addEventListener('touchmove', function(e) {
    if (isDrawing.client || isDrawing.counselor) {
        e.preventDefault();
    }
}, { passive: false });
