/**
 * 知情同意书系统脚本
 */

// 全局变量
let currentConsentType = '';
let currentSignatureType = '';
let clientSignatureCanvas = null;
let landscapeCanvas = null;
let clientCtx = null;
let landscapeCtx = null;
let isDrawing = { client: false, landscape: false };
let lastPos = { client: { x: 0, y: 0 }, landscape: { x: 0, y: 0 } };
let isExporting = false;

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');
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
    
    // 初始化横屏签名画布
    landscapeCanvas = document.getElementById('landscape-canvas');
    if (landscapeCanvas) {
        landscapeCtx = landscapeCanvas.getContext('2d');
        resizeCanvas(landscapeCanvas);
        setupCanvasEvents(landscapeCanvas, 'landscape');
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
    let canvas;
    if (type === 'client') {
        canvas = clientSignatureCanvas;
    } else if (type === 'landscape') {
        canvas = landscapeCanvas;
    }
    const rect = canvas.getBoundingClientRect();
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
    
    let canvas, ctx;
    if (type === 'client') {
        canvas = clientSignatureCanvas;
        ctx = clientCtx;
    } else if (type === 'landscape') {
        canvas = landscapeCanvas;
        ctx = landscapeCtx;
    }
    
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
    if (type === 'client') {
        const canvas = clientSignatureCanvas;
        const ctx = clientCtx;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 恢复画布样式
        canvas.style.borderColor = '#e0e0e0';
        canvas.style.boxShadow = 'none';
    }
}

/**
 * 清除所有签名
 */
function clearAllSignatures() {
    clearSignature('client');
}

/**
 * 打开横屏签名模态框
 */
function openSignatureModal(type) {
    currentSignatureType = type;
    
    // 显示模态框
    const modal = document.getElementById('signature-modal');
    modal.classList.add('show');
    
    // 重新初始化横屏画布
    setTimeout(() => {
        // 获取横屏画布元素
        landscapeCanvas = document.getElementById('landscape-canvas');
        if (landscapeCanvas) {
            // 初始化上下文
            landscapeCtx = landscapeCanvas.getContext('2d');
            // 调整大小
            resizeCanvas(landscapeCanvas);
            // 重新设置事件监听器
            setupCanvasEvents(landscapeCanvas, 'landscape');
            // 清除画布
            landscapeCtx.clearRect(0, 0, landscapeCanvas.width, landscapeCanvas.height);
        }
    }, 200);
}

/**
 * 关闭横屏签名模态框
 */
function closeSignatureModal() {
    const modal = document.getElementById('signature-modal');
    modal.classList.remove('show');
    currentSignatureType = '';
}

/**
 * 清除横屏签名
 */
function clearLandscapeSignature() {
    if (landscapeCtx) {
        landscapeCtx.clearRect(0, 0, landscapeCanvas.width, landscapeCanvas.height);
    }
}

/**
 * 确认横屏签名
 */
function confirmLandscapeSignature() {
    if (!currentSignatureType) return;
    
    // 获取目标画布和上下文
    const targetCanvas = currentSignatureType === 'client' ? clientSignatureCanvas : counselorSignatureCanvas;
    const targetCtx = currentSignatureType === 'client' ? clientCtx : counselorCtx;
    
    // 清除目标画布
    targetCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
    
    // 将横屏画布内容绘制到目标画布
    const scaleX = targetCanvas.width / landscapeCanvas.width;
    const scaleY = targetCanvas.height / landscapeCanvas.height;
    targetCtx.scale(scaleX, scaleY);
    targetCtx.drawImage(landscapeCanvas, 0, 0);
    targetCtx.setTransform(1, 0, 0, 1, 0, 0);
    
    // 更新目标画布样式
    targetCanvas.style.borderColor = '#27ae60';
    targetCanvas.style.boxShadow = '0 0 0 2px rgba(39, 174, 96, 0.2)';
    
    // 关闭模态框
    closeSignatureModal();
}

/**
 * 确认签名
 */
function confirmSignatures() {
    console.log('confirmSignatures called');
    // 验证签名
    const clientHasSignature = isCanvasEmpty(clientSignatureCanvas);
    console.log('clientHasSignature in confirmSignatures:', clientHasSignature);
    
    if (!clientHasSignature) {
        alert('请来者完成签名后再确认');
        return;
    }
    
    // 显示预览页面
    console.log('calling showPreviewPage from confirmSignatures');
    showPreviewPage();
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
    console.log('showConsentPage called with type:', type);
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
}

/**
 * 处理同意/不同意
 */
function handleConsent(agreed) {
    if (agreed) {
        showSignaturePage();
    } else {
        showMainPage();
    }
}

/**
 * 显示签字页面
 */
function showSignaturePage() {
    // 显示页面
    hideAllPages();
    showPage('signature-page');
    
    // 重新初始化签名画布
    setTimeout(() => {
        initSignatureCanvases();
    }, 100);
}

/**
 * 显示预览页面
 */
function showPreviewPage() {
    console.log('显示预览页面');
    // 简化版本，直接显示预览页面
    hideAllPages();
    const previewPage = document.getElementById('preview-page');
    if (previewPage) {
        previewPage.style.display = 'block';
        previewPage.classList.add('active');
    }
    
    // 生成完整的预览内容
    const previewContent = document.getElementById('preview-content');
    if (previewContent) {
        console.log('开始生成预览内容');
        // 获取完整的同意书内容
        const consentContent = currentConsentType === 'counseling' 
            ? document.getElementById('counseling-content').innerHTML
            : document.getElementById('recording-content').innerHTML;
        
        console.log('获取同意书内容成功');
        // 处理录音录像知情同意书的签名占位符
        let processedContent = consentContent;
        if (currentConsentType === 'recording') {
            const clientSignature = clientSignatureCanvas.toDataURL();
            processedContent = processedContent.replace(/<span class="signature-placeholder">[\s\S]*?<\/span>/g, 
                `<img src="${clientSignature}" style="max-width: 150px; vertical-align: middle; border: 1px solid #e0e0e0; padding: 5px; border-radius: 4px; background: #f9f9f9;">`
            );
        }
        
        // 删除原始HTML中的签名和日期行
        processedContent = processedContent.replace(/<p>来访者：[\s\u00A0]*咨询师：<\/p>/g, '');
        processedContent = processedContent.replace(/<p>年[\s\u00A0]+月[\s\u00A0]+日[\s\u00A0]*年[\s\u00A0]+月[\s\u00A0]+日<\/p>/g, '');
        processedContent = processedContent.replace(/<p>&nbsp;<\/p>/g, '');
        processedContent = processedContent.replace(/<p>\s*<\/p>/g, '');
        processedContent = processedContent.replace(/\s+<\/div>$/, '</div>');
        
        // 创建完整的预览HTML，确保签名图片大小相同且对齐
        const clientSignature = clientSignatureCanvas.toDataURL();
        
        // 直接使用img标签加载SVG文件，避免CORS问题
        const html = `
            <div class="preview-document" style="background: white; padding: 50px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 900px; margin: 0 auto;">
                <style>
                    h3 { text-align: center !important; margin-top: 30px !important; }
                    .header-logos { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-wrap: wrap; }
                    .header-logos img { max-height: 60px; max-width: 45%; height: auto; width: auto; }
                </style>
                <div class="header-logos">
                    <img src="logo1.png" alt="Logo 1">
                    <img src="logo2.png" alt="Logo 2">
                </div>
                ${processedContent}
                
                <div style="margin-top: 60px; display: flex; justify-content: space-between;">
                    <div style="text-align: center; width: 45%;">
                        <p style="margin-bottom: 15px; font-weight: 500;">来访者签名</p>
                        <img src="${clientSignature}" style="max-width: 100%; border: 1px solid #e0e0e0; padding: 15px; border-radius: 4px; background: #f9f9f9; height: 120px; object-fit: contain;">
                        <p style="margin-top: 15px; color: #7f8c8d;">日期：${new Date().toLocaleDateString()}</p>
                    </div>
                    
                    <div style="text-align: center; width: 45%;">
                        <p style="margin-bottom: 15px; font-weight: 500;">咨询师签名</p>
                        <div style="max-width: 100%; border: 1px solid #e0e0e0; padding: 15px; border-radius: 4px; background: #f9f9f9; height: 120px; display: flex; justify-content: center; align-items: center;">
                            <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 739 420" preserveAspectRatio="xMidYMid meet">
                                <g transform="translate(0.000000,420.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
                                    <path d="M6434 3963 c-9 -21 -28 -78 -44 -126 -37 -113 -125 -249 -251 -385 -24 -26 -89 -96 -144 -157 -55 -60 -144 -153 -197 -208 -140 -141 -208 -230 -208 -272 0 -22 54 -45 107 -45 58 0 236 28 378 60 81 18 232 30 277 22 l43 -8 -2 -48 c-2 -78 -24 -113 -180 -285 -131 -145 -209 -220 -300 -289 -80 -61 -83 -64 -83 -104 l0 -41 77 7 c42 4 102 14 132 22 106 30 126 34 206 49 122 22 225 19 225 -7 0 -39 -188 -206 -411 -366 -63 -45 -163 -118 -224 -162 -177 -129 -293 -208 -400 -273 -138 -83 -153 -91 -208 -112 -46 -17 -48 -19 -45 -54 3 -35 4 -36 38 -33 39 4 140 30 270 69 87 26 311 77 410 93 264 42 587 67 625 48 52 -27 55 -35 55 -152 1 -185 29 -848 39 -901 5 -27 12 -58 16 -67 8 -21 44 -23 69 -5 17 12 18 28 12 193 -3 98 -9 347 -12 551 l-6 373 23 9 c13 5 49 12 79 16 188 24 289 67 317 132 22 55 17 173 -13 250 -49 130 -106 309 -139 438 -127 498 -161 575 -250 575 -28 0 -34 -5 -52 -47 -26 -59 -43 -150 -43 -229 -1 -32 -5 -90 -10 -128 -12 -97 -25 -106 -150 -103 -52 1 -139 0 -192 -2 -53 -1 -102 0 -108 4 -9 5 35 58 194 230 89 97 146 210 146 293 0 83 -16 119 -63 145 -38 20 -55 22 -182 21 -105 -1 -160 -6 -220 -21 -167 -43 -210 -48 -235 -30 l-24 17 130 132 c72 73 149 153 171 178 22 25 69 77 104 116 85 94 224 272 254 326 23 41 75 230 75 273 0 21 -31 55 -50 55 -5 0 -17 -17 -26 -37z m334 -1470 c5 -10 19 -58 32 -108 62 -249 130 -458 204 -623 38 -84 46 -113 46 -162 0 -53 -3 -61 -28 -79 -44 -31 -108 -42 -217 -39 l-100 3 1 320 c1 317 16 673 28 694 10 16 24 13 34 -6z m-183 -506 c-2 -412 -5 -477 -23 -495 -16 -16 -43 -20 -198 -25 -169 -7 -342 -23 -485 -46 -35 -6 -72 -11 -81 -11 -40 0 -12 33 85 101 102 72 131 93 282 205 134 99 248 198 321 278 38 42 76 75 84 74 12 -3 15 -20 15 -81z"/>
                                    <path d="M5694 3933 c-31 -31 -8 -280 37 -393 23 -61 89 -59 89 3 0 18 -7 52 -16 77 -9 25 -20 88 -25 140 -14 136 -18 158 -35 175 -20 19 -29 19 -50 -2z"/>
                                    <path d="M1635 3726 c-24 -32 -25 -38 -25 -183 0 -83 -5 -165 -11 -184 -20 -60 -20 -60 -294 -141 -38 -11 -122 -38 -185 -58 -115 -38 -158 -49 -260 -71 -113 -23 -265 -87 -309 -129 -23 -22 -23 -24 -5 -37 28 -20 53 -16 160 28 54 22 160 54 234 71 74 16 180 45 235 63 202 67 360 115 376 115 37 0 44 -28 44 -169 l0 -136 -33 -17 c-18 -9 -42 -24 -53 -34 -20 -18 -26 -54 -9 -54 5 0 28 -16 50 -36 40 -36 40 -37 40 -108 0 -39 -5 -118 -10 -176 -6 -58 -15 -152 -21 -210 -22 -226 -30 -259 -64 -286 -24 -18 -44 -24 -82 -24 -93 0 -374 -113 -436 -174 -17 -18 -11 -66 9 -66 7 0 48 14 91 31 78 31 191 68 270 89 36 9 52 7 105 -11 59 -20 74 -20 154 -4 27 6 33 2 57 -32 24 -34 27 -49 27 -119 0 -71 -16 -174 -35 -229 -20 -59 -144 -324 -173 -370 -14 -22 -41 -60 -62 -85 -76 -94 -111 -183 -130 -333 -20 -161 22 -277 117 -326 64 -33 249 -21 397 26 194 61 387 194 429 296 26 60 30 112 13 145 -40 78 -126 95 -446 90 -145 -2 -223 1 -230 8 -37 37 61 152 175 205 81 38 214 59 366 59 130 0 179 11 179 41 0 9 -8 23 -18 32 -16 15 -44 17 -188 16 -93 0 -191 -4 -219 -9 -113 -21 -154 -23 -160 -8 -3 8 10 54 29 104 69 179 89 368 51 471 -14 41 -34 66 -88 114 l-69 62 6 51 c4 28 11 76 15 106 5 30 16 129 25 220 32 315 35 342 41 348 10 10 91 -35 156 -89 35 -29 116 -103 179 -165 161 -157 301 -279 406 -352 71 -49 207 -122 285 -152 131 -51 224 -41 200 23 -8 19 -21 29 -53 37 -107 27 -274 117 -429 231 -48 35 -169 143 -270 240 -239 229 -300 282 -379 329 -107 63 -105 59 -105 245 0 219 -11 205 232 284 219 72 346 121 373 146 11 10 20 31 20 47 0 34 -6 37 -140 68 -122 28 -173 44 -293 92 -54 21 -129 47 -167 57 l-70 20 -25 -33z m170 -102 c73 -31 174 -67 235 -84 76 -20 92 -29 88 -47 -2 -12 -52 -33 -183 -75 -190 -61 -229 -68 -239 -42 -9 24 -20 240 -13 258 9 23 42 20 112 -10z m-308 -2836 c18 -7 134 -14 330 -17 265 -5 304 -8 319 -23 53 -53 -105 -186 -326 -276 -92 -37 -139 -50 -266 -72 -65 -11 -116 1 -143 34 -22 26 -25 127 -7 231 24 139 31 149 93 123z"/>
                                    <path d="M1232 2764 c-51 -26 -116 -89 -168 -162 -26 -37 -72 -101 -103 -142 -30 -41 -71 -97 -91 -125 -177 -242 -459 -662 -585 -870 -43 -71 -99 -161 -125 -200 -59 -89 -77 -132 -61 -148 7 -7 19 -8 38 -1 29 10 51 39 178 239 97 153 495 745 558 830 29 39 108 149 177 245 68 96 140 188 159 205 117 103 115 100 100 123 -16 26 -33 27 -77 6z"/>
                                    <path d="M4702 2698 c-27 -27 -12 -47 60 -85 67 -35 117 -77 191 -161 33 -37 47 -40 73 -11 18 20 18 21 -5 65 -34 64 -111 131 -196 170 -79 36 -104 41 -123 22z"/>
                                    <path d="M4750 1983 c-59 -21 -80 -37 -80 -58 0 -14 7 -26 18 -29 9 -3 81 -5 159 -4 107 1 148 5 163 15 32 22 22 56 -20 70 -35 12 -212 16 -240 6z"/>
                                    <path d="M5165 1683 c-14 -21 -58 -87 -97 -148 -72 -112 -92 -139 -157 -210 -132 -147 -201 -242 -201 -278 0 -30 23 -52 44 -40 37 20 330 342 384 421 63 92 132 220 132 245 0 20 -33 47 -58 47 -14 0 -31 -13 -47 -37z"/>
                                </g>
                            </svg>
                        </div>
                        <p style="margin-top: 15px; color: #7f8c8d;">日期：${new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        `;
        
        console.log('生成HTML成功，开始设置预览内容');
        previewContent.innerHTML = html;
        console.log('设置预览内容成功');
    }
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
    console.log('generatePreviewContent called');
    const previewContent = document.getElementById('preview-content');
    console.log('previewContent:', previewContent);
    if (!previewContent) {
        console.error('previewContent not found');
        return;
    }
    
    // 获取同意书内容
    console.log('currentConsentType:', currentConsentType);
    let consentContent = currentConsentType === 'counseling' 
        ? document.getElementById('counseling-content').innerHTML
        : document.getElementById('recording-content').innerHTML;
    console.log('consentContent obtained');
    
    // 处理录音录像知情同意书的签名占位符
    if (currentConsentType === 'recording') {
        console.log('processing recording consent content');
        // 将签名占位符替换为实际签名
        const clientSignature = clientSignatureCanvas.toDataURL();
        consentContent = consentContent.replace(/<span class="signature-placeholder">[\s\S]*?<\/span>/g, 
            `<img src="${clientSignature}" style="max-width: 150px; vertical-align: middle; border: 1px solid #e0e0e0; padding: 5px; border-radius: 4px; background: #f9f9f9;">`
        );
        console.log('recording consent content processed');
    }
    
    // 删除原始HTML中的签名和日期行
    consentContent = consentContent.replace(/<p>来访者：[\s\u00A0]*咨询师：<\/p>/g, '');
    consentContent = consentContent.replace(/<p>年[\s\u00A0]+月[\s\u00A0]+日[\s\u00A0]*年[\s\u00A0]+月[\s\u00A0]+日<\/p>/g, '');
    consentContent = consentContent.replace(/<p>&nbsp;<\/p>/g, '');
    consentContent = consentContent.replace(/<p>\s*<\/p>/g, '');
    consentContent = consentContent.replace(/\s+<\/div>$/, '</div>');
    console.log('consentContent cleaned');
    
    try {
        // 创建预览HTML，添加内联样式确保标题居中
        let html = `
            <div class="preview-document" style="background: white; padding: 50px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 900px; margin: 0 auto;">
                <style>
                    h3 { text-align: center !important; margin-top: 30px !important; }
                    .header-logos { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-wrap: wrap; }
                    .header-logos img { max-height: 60px; max-width: 45%; height: auto; width: auto; }
                </style>
                <div class="header-logos">
                    <img src="logo1.png" alt="Logo 1">
                    <img src="logo2.png" alt="Logo 2">
                </div>
                ${consentContent}
                
                <div style="margin-top: 60px; display: flex; justify-content: space-between;">
                    <div style="text-align: center; width: 45%;">
                        <p style="margin-bottom: 15px; font-weight: 500;">来访者签名</p>
                        <img src="${clientSignatureCanvas.toDataURL()}" style="max-width: 100%; border: 1px solid #e0e0e0; padding: 15px; border-radius: 4px; background: #f9f9f9; height: 120px; object-fit: contain;">
                        <p style="margin-top: 15px; color: #7f8c8d;">日期：${new Date().toLocaleDateString()}</p>
                    </div>
                    
                    <div style="text-align: center; width: 45%;">
                        <p style="margin-bottom: 15px; font-weight: 500;">咨询师签名</p>
                        <div style="max-width: 100%; border: 1px solid #e0e0e0; padding: 15px; border-radius: 4px; background: #f9f9f9; height: 120px; display: flex; justify-content: center; align-items: center;">
                            <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 739 420" preserveAspectRatio="xMidYMid meet">
                                <g transform="translate(0.000000,420.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
                                    <path d="M6434 3963 c-9 -21 -28 -78 -44 -126 -37 -113 -125 -249 -251 -385 -24 -26 -89 -96 -144 -157 -55 -60 -144 -153 -197 -208 -140 -141 -208 -230 -208 -272 0 -22 54 -45 107 -45 58 0 236 28 378 60 81 18 232 30 277 22 l43 -8 -2 -48 c-2 -78 -24 -113 -180 -285 -131 -145 -209 -220 -300 -289 -80 -61 -83 -64 -83 -104 l0 -41 77 7 c42 4 102 14 132 22 106 30 126 34 206 49 122 22 225 19 225 -7 0 -39 -188 -206 -411 -366 -63 -45 -163 -118 -224 -162 -177 -129 -293 -208 -400 -273 -138 -83 -153 -91 -208 -112 -46 -17 -48 -19 -45 -54 3 -35 4 -36 38 -33 39 4 140 30 270 69 87 26 311 77 410 93 264 42 587 67 625 48 52 -27 55 -35 55 -152 1 -185 29 -848 39 -901 5 -27 12 -58 16 -67 8 -21 44 -23 69 -5 17 12 18 28 12 193 -3 98 -9 347 -12 551 l-6 373 23 9 c13 5 49 12 79 16 188 24 289 67 317 132 22 55 17 173 -13 250 -49 130 -106 309 -139 438 -127 498 -161 575 -250 575 -28 0 -34 -5 -52 -47 -26 -59 -43 -150 -43 -229 -1 -32 -5 -90 -10 -128 -12 -97 -25 -106 -150 -103 -52 1 -139 0 -192 -2 -53 -1 -102 0 -108 4 -9 5 35 58 194 230 89 97 146 210 146 293 0 83 -16 119 -63 145 -38 20 -55 22 -182 21 -105 -1 -160 -6 -220 -21 -167 -43 -210 -48 -235 -30 l-24 17 130 132 c72 73 149 153 171 178 22 25 69 77 104 116 85 94 224 272 254 326 23 41 75 230 75 273 0 21 -31 55 -50 55 -5 0 -17 -17 -26 -37z m334 -1470 c5 -10 19 -58 32 -108 62 -249 130 -458 204 -623 38 -84 46 -113 46 -162 0 -53 -3 -61 -28 -79 -44 -31 -108 -42 -217 -39 l-100 3 1 320 c1 317 16 673 28 694 10 16 24 13 34 -6z m-183 -506 c-2 -412 -5 -477 -23 -495 -16 -16 -43 -20 -198 -25 -169 -7 -342 -23 -485 -46 -35 -6 -72 -11 -81 -11 -40 0 -12 33 85 101 102 72 131 93 282 205 134 99 248 198 321 278 38 42 76 75 84 74 12 -3 15 -20 15 -81z"/>
                                    <path d="M5694 3933 c-31 -31 -8 -280 37 -393 23 -61 89 -59 89 3 0 18 -7 52 -16 77 -9 25 -20 88 -25 140 -14 136 -18 158 -35 175 -20 19 -29 19 -50 -2z"/>
                                    <path d="M1635 3726 c-24 -32 -25 -38 -25 -183 0 -83 -5 -165 -11 -184 -20 -60 -20 -60 -294 -141 -38 -11 -122 -38 -185 -58 -115 -38 -158 -49 -260 -71 -113 -23 -265 -87 -309 -129 -23 -22 -23 -24 -5 -37 28 -20 53 -16 160 28 54 22 160 54 234 71 74 16 180 45 235 63 202 67 360 115 376 115 37 0 44 -28 44 -169 l0 -136 -33 -17 c-18 -9 -42 -24 -53 -34 -20 -18 -26 -54 -9 -54 5 0 28 -16 50 -36 40 -36 40 -37 40 -108 0 -39 -5 -118 -10 -176 -6 -58 -15 -152 -21 -210 -22 -226 -30 -259 -64 -286 -24 -18 -44 -24 -82 -24 -93 0 -374 -113 -436 -174 -17 -18 -11 -66 9 -66 7 0 48 14 91 31 78 31 191 68 270 89 36 9 52 7 105 -11 59 -20 74 -20 154 -4 27 6 33 2 57 -32 24 -34 27 -49 27 -119 0 -71 -16 -174 -35 -229 -20 -59 -144 -324 -173 -370 -14 -22 -41 -60 -62 -85 -76 -94 -111 -183 -130 -333 -20 -161 22 -277 117 -326 64 -33 249 -21 397 26 194 61 387 194 429 296 26 60 30 112 13 145 -40 78 -126 95 -446 90 -145 -2 -223 1 -230 8 -37 37 61 152 175 205 81 38 214 59 366 59 130 0 179 11 179 41 0 9 -8 23 -18 32 -16 15 -44 17 -188 16 -93 0 -191 -4 -219 -9 -113 -21 -154 -23 -160 -8 -3 8 10 54 29 104 69 179 89 368 51 471 -14 41 -34 66 -88 114 l-69 62 6 51 c4 28 11 76 15 106 5 30 16 129 25 220 32 315 35 342 41 348 10 10 91 -35 156 -89 35 -29 116 -103 179 -165 161 -157 301 -279 406 -352 71 -49 207 -122 285 -152 131 -51 224 -41 200 23 -8 19 -21 29 -53 37 -107 27 -274 117 -429 231 -48 35 -169 143 -270 240 -239 229 -300 282 -379 329 -107 63 -105 59 -105 245 0 219 -11 205 232 284 219 72 346 121 373 146 11 10 20 31 20 47 0 34 -6 37 -140 68 -122 28 -173 44 -293 92 -54 21 -129 47 -167 57 l-70 20 -25 -33z m170 -102 c73 -31 174 -67 235 -84 76 -20 92 -29 88 -47 -2 -12 -52 -33 -183 -75 -190 -61 -229 -68 -239 -42 -9 24 -20 240 -13 258 9 23 42 20 112 -10z m-308 -2836 c18 -7 134 -14 330 -17 265 -5 304 -8 319 -23 53 -53 -105 -186 -326 -276 -92 -37 -139 -50 -266 -72 -65 -11 -116 1 -143 34 -22 26 -25 127 -7 231 24 139 31 149 93 123z"/>
                                    <path d="M1232 2764 c-51 -26 -116 -89 -168 -162 -26 -37 -72 -101 -103 -142 -30 -41 -71 -97 -91 -125 -177 -242 -459 -662 -585 -870 -43 -71 -99 -161 -125 -200 -59 -89 -77 -132 -61 -148 7 -7 19 -8 38 -1 29 10 51 39 178 239 97 153 495 745 558 830 29 39 108 149 177 245 68 96 140 188 159 205 117 103 115 100 100 123 -16 26 -33 27 -77 6z"/>
                                    <path d="M4702 2698 c-27 -27 -12 -47 60 -85 67 -35 117 -77 191 -161 33 -37 47 -40 73 -11 18 20 18 21 -5 65 -34 64 -111 131 -196 170 -79 36 -104 41 -123 22z"/>
                                    <path d="M4750 1983 c-59 -21 -80 -37 -80 -58 0 -14 7 -26 18 -29 9 -3 81 -5 159 -4 107 1 148 5 163 15 32 22 22 56 -20 70 -35 12 -212 16 -240 6z"/>
                                    <path d="M5165 1683 c-14 -21 -58 -87 -97 -148 -72 -112 -92 -139 -157 -210 -132 -147 -201 -242 -201 -278 0 -30 23 -52 44 -40 37 20 330 342 384 421 63 92 132 220 132 245 0 20 -33 47 -58 47 -14 0 -31 -13 -47 -37z"/>
                                </g>
                            </svg>
                        </div>
                        <p style="margin-top: 15px; color: #7f8c8d;">日期：${new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        `;
        
        console.log('HTML generated, setting to previewContent');
        previewContent.innerHTML = html;
        console.log('Preview content updated');
    } catch (error) {
        console.error('Error generating preview HTML:', error);
        throw error;
    }
}

/**
 * 导出为图片
 */
function exportAsImage() {
    console.log('开始导出图片');
    if (isExporting) {
        console.log('正在导出中，跳过');
        return;
    }
    
    const previewElement = document.querySelector('.preview-document');
    if (!previewElement) {
        console.error('未找到预览元素');
        alert('导出失败：未找到预览内容');
        return;
    }
    
    isExporting = true;
    
    // 添加加载提示
    const exportButtons = document.querySelectorAll('.export-btn');
    exportButtons.forEach(btn => {
        // 保存原始按钮文本
        btn.dataset.originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = '导出中...';
    });
    
    console.log('开始使用html2canvas转换预览元素');
    
    // 确保预览元素可见且完整
    const originalStyles = {
        position: previewElement.style.position,
        zIndex: previewElement.style.zIndex,
        display: previewElement.style.display,
        height: previewElement.style.height,
        overflow: previewElement.style.overflow
    };
    
    // 临时调整样式
    previewElement.style.position = 'relative';
    previewElement.style.zIndex = '9999';
    previewElement.style.display = 'block';
    previewElement.style.height = 'auto';
    previewElement.style.overflow = 'visible';
    
    // 强制重排
    previewElement.offsetHeight;
    
    // 使用更简单的html2canvas配置，确保能正确捕获内容
    html2canvas(previewElement, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        // 禁用foreignObjectRendering，避免可能的兼容性问题
        foreignObjectRendering: false,
        // 确保捕获完整内容
        width: previewElement.scrollWidth,
        height: previewElement.scrollHeight
    }).then(canvas => {
        console.log('html2canvas转换成功，canvas尺寸:', canvas.width, 'x', canvas.height);
        const imgData = canvas.toDataURL('image/png');
        console.log('生成图片数据URL成功');
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
        console.error('错误堆栈:', error.stack);
        alert('导出图片失败，请重试。错误信息：' + error.message);
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
 * 导出为PDF
 */
function exportAsPDF() {
    console.log('开始导出PDF');
    if (isExporting) {
        console.log('正在导出中，跳过');
        return;
    }
    
    const previewElement = document.querySelector('.preview-document');
    if (!previewElement) {
        console.error('未找到预览元素');
        alert('导出失败：未找到预览内容');
        return;
    }
    
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
        zIndex: previewElement.style.zIndex,
        display: previewElement.style.display
    };
    
    // 临时调整样式
    previewElement.style.position = 'relative';
    previewElement.style.zIndex = '9999';
    previewElement.style.display = 'block';
    previewElement.style.height = 'auto';
    previewElement.style.overflow = 'visible';
    
    // 强制重排
    previewElement.offsetHeight;
    
    // 计算实际高度，确保包含签名部分
    const actualHeight = previewElement.scrollHeight;
    const actualWidth = previewElement.scrollWidth;
    console.log('预览元素实际尺寸:', actualWidth, 'x', actualHeight);
    
    console.log('开始使用html2canvas转换预览元素');
    
    // 使用更简单的html2canvas配置，确保能正确捕获内容
    html2canvas(previewElement, {
        scale: 2,
        logging: true,
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
        // 禁用foreignObjectRendering，避免可能的兼容性问题
        foreignObjectRendering: false,
        // 增加捕获超时时间
        timeout: 10000
    }).then(canvas => {
        console.log('html2canvas转换成功，canvas尺寸:', canvas.width, 'x', canvas.height);
        
        // 检查jspdf是否可用
        if (!window.jspdf) {
            throw new Error('jspdf库未加载');
        }
        
        const { jsPDF } = window.jspdf;
        
        // 计算PDF尺寸
        const imgWidth = 210; // A4宽度
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        console.log('PDF尺寸:', imgWidth, 'x', imgHeight);
        
        // 创建PDF文档
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // 确保图片质量
        const imgData = canvas.toDataURL('image/png', 1.0);
        console.log('生成图片数据URL成功');
        
        // 使用jsPDF的自动分页功能
        const pageHeight = 297; // A4高度
        let heightLeft = imgHeight;
        let position = 0;
        
        // 处理长内容分页
        if (imgHeight > pageHeight) {
            // 计算需要的页数
            const pages = Math.ceil(imgHeight / pageHeight);
            console.log('需要分页，共', pages, '页');
            
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
            console.log('单页显示');
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        }
        
        console.log('PDF生成成功，准备保存');
        pdf.save(`${currentConsentType === 'counseling' ? '心理咨询' : '录音录像'}知情同意书_${new Date().toISOString().slice(0, 10)}.pdf`);
        
        // 导出完成提示
        setTimeout(() => {
            alert('PDF导出成功！');
        }, 500);
    }).catch(error => {
        console.error('导出PDF失败:', error);
        console.error('错误堆栈:', error.stack);
        alert('导出PDF失败，请重试。错误信息：' + error.message);
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
    } else {
        console.error('Page not found:', pageId);
    }
}

/**
 * 页面大小改变时调整画布
 */
window.addEventListener('resize', function() {
    if (clientSignatureCanvas) {
        resizeCanvas(clientSignatureCanvas);
    }
    if (landscapeCanvas) {
        resizeCanvas(landscapeCanvas);
    }
});

/**
 * 阻止默认触摸行为
 */
window.addEventListener('touchmove', function(e) {
    if (isDrawing.client) {
        e.preventDefault();
    }
}, { passive: false });
