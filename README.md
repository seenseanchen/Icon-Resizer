# Icon Resizer Pro 🚀

Icon Resizer Pro 是一個完全在瀏覽器中運行的圖片轉換工具，旨在幫助開發者快速將單張圖片轉換為各大平台所需的圖示與截圖規格。

## 🌟 主要功能

- **多平台支援**：預設提供了 Google Chrome Extension, iOS App Store, Android 以及 Web (Favicon) 的標準規格。
- **Chrome 截圖處理**：支援轉換為 Chrome 線上應用程式商店所需的 1280x800 與 640x400 格式，自動轉換為無透明層的 JPEG。
- **一鍵打包下載**：自動生成所有尺寸並打包成 `.zip` 壓縮檔，方便下載與管理。
- **隱私安全**：所有圖片處理均在本地瀏覽器完成，圖片不會上傳到任何伺服器。
- **智慧縮放**：針對不同比例的轉換需求提供自動置中處理，確保圖片不變形。

## 🛠️ 支援規格

### Google Chrome Extension
- **Icons**: 16x16, 32x32, 48x48, 128x128 (PNG)
- **Screenshots**: 1280x800, 640x400 (JPEG, 無透明層)

### iOS App Store
- 包含 iPhone, iPad 的各種倍率圖 (@2x, @3x)
- 1024x1024 App Store 商店圖

### Android
- mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi
- 512x512 Google Play 商店圖

### Web / Favicon
- 16x16, 32x32 Favicons
- Apple Touch Icon (180x180)
- Android Chrome Manifest Icons

## 🚀 如何使用

1. **上傳圖片**：選擇或拖放一張高解析度的原始圖檔（建議 1024x1024 以上）。
2. **選擇平台**：點擊你想要轉換的目標平台圖示。
3. **下載成果**：預覽生成的檔案清單後，點擊 "Download All Assets (.zip)"。

## ⚙️ 技術堆疊

- **React 19** + **TypeScript**
- **Tailwind CSS** (UI 設計)
- **Vite** (開發與建置工具)
- **Lucide React** (圖示庫)
- **JSZip** & **FileSaver** (檔案打包與下載)
- **Motion** (流暢的介面動畫)

---
© 2026 Icon Resizer Pro. 全權所有。
