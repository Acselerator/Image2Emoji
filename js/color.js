// --- CIELAB 色彩空间算法核心 ---

// 先将 RGB 转为 XYZ 空间，再转化为 CIELAB 空间 (基于 D65 标准光源)
function rgbToLab(r, g, b) {
    let r_n = r / 255, g_n = g / 255, b_n = b / 255;
    r_n = r_n > 0.04045 ? Math.pow((r_n + 0.055) / 1.055, 2.4) : r_n / 12.92;
    g_n = g_n > 0.04045 ? Math.pow((g_n + 0.055) / 1.055, 2.4) : g_n / 12.92;
    b_n = b_n > 0.04045 ? Math.pow((b_n + 0.055) / 1.055, 2.4) : b_n / 12.92;
    r_n *= 100; g_n *= 100; b_n *= 100;
    
    let x = r_n * 0.4124564 + g_n * 0.3575761 + b_n * 0.1804375;
    let y = r_n * 0.2126729 + g_n * 0.7151522 + b_n * 0.0721750;
    let z = r_n * 0.0193339 + g_n * 0.1191920 + b_n * 0.9503041;
    
    x /= 95.047; y /= 100.000; z /= 108.883;
    
    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16/116);
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16/116);
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16/116);
    
    return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)];
}

// 使用 LAB 色彩空间计算色差 (CIE76 欧几里得距离)
function colorDistanceLabSq(lab1, lab2) {
    return Math.pow(lab1[0] - lab2[0], 2) +
           Math.pow(lab1[1] - lab2[1], 2) +
           Math.pow(lab1[2] - lab2[2], 2);
}