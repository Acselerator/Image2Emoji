# 🎨 Image2Emoji 转换器

[👉 点击这里在线体验完整功能 (Live Demo) 👈](https://<你的GitHub用户名>.github.io/Image2Emoji/)
*(注意：请将上面的链接替换为你自己的 GitHub Pages 链接)*

## 📖 项目简介
**Image2Emoji** 是一个轻量级、纯前端的 Web 应用。通过它可以将你上传的任何图片（支持 PNG、JPG、WebP 以及透明背景）转换成由 Emoji 拼贴而成的“像素画”。

由于完全在浏览器本地（Client-side）通过 HTML5 Canvas 进行图像解析，该应用拥有**绝对的隐私安全性**，全程没有后端服务器通信。

## ✨ 核心特性
- ⚡ **毫秒级防抖渲染**：修改各种参数（亮度、输出列数）停手即刻生图，无需手动点击“转换”，丝滑跟手。
- 🎨 **自选风格画笔（Thematic Palettes）**：不仅提供“大杂烩”超全调色板进行高准度色彩映射，更提供**吃货专用、大自然、纯几何图形**等多种特定语义的 Emoji 字典集供“艺术创作”。
- 🧠 **符合人眼感知的色彩算法**：摒弃粗糙的 RGB 欧氏距离，采用业内公认的 **CIELAB 色彩空间** 算法进行 Emoji 色彩最佳匹配，让生成的画面更精准自然。
- 🎛️ **内置图像后处理滤镜**：支持亮度、对比度、饱和处理，以及解决有些环境下 Emoji “非正方形”导致的纵向形变拉伸修补。
- 📦 **快捷一键导出**：一键将结果“复制纯文本”，或一键导出“超高分辨率的无损 PNG 图像”（自动计算宽高画布，透明底）。

## 📂 项目结构
项目采用原生的模块化架构（HTML5 + CSS3 + Vanilla JavaScript），没有复杂的打包工具依赖：

```text
├── index.html        # 主应用骨架与入口
├── css/
│   └── style.css     # CSS Grid/Flexbox 响应式控制台样式
└── js/
    ├── color.js      # RGB 转 CIELAB 色彩空间和色差计算数学模块
    ├── emojis.js     # Emoji 字典库、解析引擎与最邻近色匹配算法
    └── main.js       # DOM 交互、滑块联动、防抖、Canvas 绘图与导出逻辑
```

## 🚀 本地运行
没有任何依赖，开箱即用：
1. 克隆或下载本仓库到本地。
2. 双击打开 `index.html` 或者将其拖入任意现代浏览器（Chrome、Edge、Firefox、Safari）。
3. 上传图片即可开始游玩。

## 🛠️ 技术栈
- **UI/UX交互**: Vanilla JS、CSS Grid
- **图像处理**: HTML5 Canvas 2D API (`drawImage`, `getImageData`, `filter`)
- **色彩科学**: CIE76 (`delta E`) 算法、`OffscreenCanvas` (后台异步色彩提取) 

---
*Made with ❤️ & JavaScript*