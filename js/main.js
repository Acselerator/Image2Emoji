document.addEventListener('DOMContentLoaded', () => {
    // 1. 获取所有 DOM 节点
    const imageInput = document.getElementById('imageInput');
    const widthScale = document.getElementById('widthScale');
    const widthValue = document.getElementById('widthValue');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const output = document.getElementById('output');
    const previewWrapper = document.getElementById('previewWrapper');
    const copyBtn = document.getElementById('copyBtn');
    const exportBtn = document.getElementById('exportBtn');
    const fontSizeScale = document.getElementById('fontSizeScale');
    
    const brightnessScale = document.getElementById('brightnessScale');
    const brightValue = document.getElementById('brightValue');
    const contrastScale = document.getElementById('contrastScale');
    const contrastValue = document.getElementById('contrastValue');
    const saturateScale = document.getElementById('saturateScale');
    const saturateValue = document.getElementById('saturateValue');
    const stretchYScale = document.getElementById('stretchYScale');
    const stretchYValue = document.getElementById('stretchYValue');
    const resetBtn = document.getElementById('resetBtn');
    const paletteSelect = document.getElementById('paletteSelect');

    let currentImage = null;

    // 2. 初始化环境
    initEmojiDictionary(paletteSelect.value);

    // 3. UI 事件监听
    // 主题切换: 重新加载字典并尝试自动换画
    paletteSelect.addEventListener('change', (e) => {
        initEmojiDictionary(e.target.value);
        if (currentImage && output.textContent.length > 50 && !output.textContent.includes("等待上传")) { 
            // 稍作延迟等字典初始化完
            setTimeout(() => generateEmojiArt(), 50);
        }
    });

    // 重置图片参数
    function resetImageSettings() {
        brightnessScale.value = 100; brightValue.textContent = '100';
        contrastScale.value = 100; contrastValue.textContent = '100';
        saturateScale.value = 100; saturateValue.textContent = '100';
        stretchYScale.value = 1.0; stretchYValue.textContent = '1.0';
        // 输出列宽度通常不重置，保护用户设定的分辨率
        if (currentImage) drawImageToCanvas();
    }
    
    resetBtn.addEventListener('click', resetImageSettings);

    // 绑定滑块与标签的联动包装函数
    function attachSlider(slider, label, callback, isFloat = false) {
        slider.addEventListener('input', (e) => {
            label.textContent = isFloat ? Number(e.target.value).toFixed(1) : e.target.value;
            if (callback) callback();
        });
    }

    attachSlider(widthScale, widthValue, drawImageToCanvas);
    attachSlider(brightnessScale, brightValue, drawImageToCanvas);
    attachSlider(contrastScale, contrastValue, drawImageToCanvas);
    attachSlider(saturateScale, saturateValue, drawImageToCanvas);
    attachSlider(stretchYScale, stretchYValue, drawImageToCanvas, true);

    // 显示缩放单独处理，不需要重绘
    fontSizeScale.addEventListener('input', (e) => {
        output.style.fontSize = e.target.value + 'px';
    });

    // 4. 图片核心加载与处理
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                currentImage = img;
                resetImageSettings(); 
                drawImageToCanvas();
                output.textContent = "图片已就绪，正在等待解析...";
                generateEmojiArt(); // 自动生成
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    // 绘制至 Canvas 并应用所有滤镜
    let convertTimeout;
    function drawImageToCanvas() {
        if (!currentImage) return;
        const targetWidth = parseInt(widthScale.value, 10);
        const stretchY = parseFloat(stretchYScale.value);
        
        const scale = targetWidth / currentImage.width;
        const targetHeight = Math.max(1, Math.floor(currentImage.height * scale * stretchY));

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        ctx.filter = `brightness(${brightnessScale.value}%) contrast(${contrastScale.value}%) saturate(${saturateScale.value}%)`;
        ctx.drawImage(currentImage, 0, 0, targetWidth, targetHeight);
        ctx.filter = 'none';

        previewWrapper.style.display = 'flex';

        // 逻辑优化：在滑块拖动或状态变化时，添加防抖自动转换
        clearTimeout(convertTimeout);
        convertTimeout = setTimeout(() => {
            generateEmojiArt();
        }, 150);
    }

    // 5. 核心转换函数
    function generateEmojiArt() {
        if (!currentImage) return;

        // 获取当前已被 drawImageToCanvas 准备好的图像数据
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        let resultString = "";

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const i = (y * canvas.width + x) * 4;
                const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];

                if (a < 128) {
                    resultString += '　'; 
                } else {
                    resultString += findClosestEmoji(r, g, b);
                }
            }
            resultString += '\n'; 
        }
        output.textContent = resultString;
    }

    // 6. 辅助工具组 (复制与导出)
    copyBtn.addEventListener('click', () => {
        const textToCopy = output.textContent;
        if (!textToCopy || textToCopy.includes("等待上传") || textToCopy.includes("就绪")) return;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ 已复制!';
            copyBtn.style.backgroundColor = '#1e7e34';
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.backgroundColor = '';
            }, 2000);
        }).catch(err => {
            console.error("复制失败:", err);
            alert("复制失败，请手动框选复制。");
        });
    });

    exportBtn.addEventListener('click', () => {
        const textToExport = output.textContent;
        if (!textToExport || textToExport.includes("等待上传") || textToExport.includes("就绪")) {
            alert("请先生成 Emoji 画后再导出！");
            return;
        }

        const lines = textToExport.trimEnd().split('\n');
        if (lines.length === 0) return;

        // 动态计算字体大小，防止 Canvas 超长崩溃
        const colCount = canvas.width || 1;
        const MAX_CANVAS_WIDTH = 4000;
        
        // 🚨很多系统/字体下 Emoji 的实际渲染宽度往往超过纯字号（比如 1.35x 字号），所以需要容错折算
        let exportFontSize = Math.floor(MAX_CANVAS_WIDTH / (colCount * 1.35));
        if (exportFontSize > 32) exportFontSize = 32; 
        if (exportFontSize < 8) exportFontSize = 8;   

        const exportLineHeight = Math.floor(exportFontSize * 1.15); 

        const exportCanvas = document.createElement('canvas');
        const exportCtx = exportCanvas.getContext('2d');
        
        // 【核心修复步骤 1】必须先指定好字体，才能利用 measureText 拿来精确获取渲染下的真实像素宽度
        exportCtx.font = `${exportFontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
        
        let actualMaxWidth = 0;
        for (let i = 0; i < lines.length; i++) {
            const w = exportCtx.measureText(lines[i]).width;
            if (w > actualMaxWidth) actualMaxWidth = w;
        }
        
        // 动态定宽：这样就能自适应任何宽度的 Emoji 组合了
        exportCanvas.width = Math.max(1, Math.ceil(actualMaxWidth) + 10); // 留一点冗余
        exportCanvas.height = Math.max(1, lines.length * exportLineHeight);

        // 【核心修复步骤 2】设置 Canvas 的宽高会彻底清空 ctx 内置状态，必须再次声明字体参数！
        exportCtx.font = `${exportFontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
        exportCtx.textBaseline = "top";
        
        lines.forEach((line, index) => {
            exportCtx.fillText(line, 0, index * exportLineHeight);
        });
        
        const dataUrl = exportCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `EmojiArt_${new Date().getTime()}.png`;
        link.href = dataUrl;
        link.click();
    });
});