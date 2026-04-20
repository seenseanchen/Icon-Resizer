/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import { Upload, Download, Image as ImageIcon, Check, X, ChevronRight, Layers, Smartphone, Chrome, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface IconSize {
  name: string;
  width: number;
  height: number;
  label?: string;
  format?: 'png' | 'jpeg';
  noAlpha?: boolean;
}

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  sizes: IconSize[];
}

const PLATFORMS: Platform[] = [
  {
    id: 'chrome',
    name: 'Chrome Extension',
    icon: <Chrome className="w-5 h-5" />,
    sizes: [
      { name: 'icon16.png', width: 16, height: 16 },
      { name: 'icon32.png', width: 32, height: 32 },
      { name: 'icon48.png', width: 48, height: 48 },
      { name: 'icon128.png', width: 128, height: 128 },
    ],
  },
  {
    id: 'chrome_screenshots',
    name: 'Chrome Screenshots',
    icon: <ImageIcon className="w-5 h-5" />,
    sizes: [
      { name: 'screenshot-1280x800.jpg', width: 1280, height: 800, label: 'Large Screenshot', format: 'jpeg', noAlpha: true },
      { name: 'screenshot-640x400.jpg', width: 640, height: 400, label: 'Small Screenshot', format: 'jpeg', noAlpha: true },
    ],
  },
  {
    id: 'ios',
    name: 'iOS App Store',
    icon: <Smartphone className="w-5 h-5" />,
    sizes: [
      { name: 'AppIcon-20x20@2x.png', width: 40, height: 40, label: 'Notification (iPhone) @2x' },
      { name: 'AppIcon-20x20@3x.png', width: 60, height: 60, label: 'Notification (iPhone) @3x' },
      { name: 'AppIcon-29x29@2x.png', width: 58, height: 58, label: 'Settings (iPhone) @2x' },
      { name: 'AppIcon-29x29@3x.png', width: 87, height: 87, label: 'Settings (iPhone) @3x' },
      { name: 'AppIcon-40x40@2x.png', width: 80, height: 80, label: 'Spotlight (iPhone) @2x' },
      { name: 'AppIcon-40x40@3x.png', width: 120, height: 120, label: 'Spotlight (iPhone) @3x' },
      { name: 'AppIcon-60x60@2x.png', width: 120, height: 120, label: 'App Icon (iPhone) @2x' },
      { name: 'AppIcon-60x60@3x.png', width: 180, height: 180, label: 'App Icon (iPhone) @3x' },
      { name: 'AppIcon-76x76@2x.png', width: 152, height: 152, label: 'App Icon (iPad) @2x' },
      { name: 'AppIcon-83.5x83.5@2x.png', width: 167, height: 167, label: 'App Icon (iPad Pro) @2x' },
      { name: 'AppIcon-1024x1024.png', width: 1024, height: 1024, label: 'App Store' },
    ],
  },
  {
    id: 'android',
    name: 'Android',
    icon: <Layers className="w-5 h-5" />,
    sizes: [
      { name: 'mdpi.png', width: 48, height: 48, label: 'mdpi' },
      { name: 'hdpi.png', width: 72, height: 72, label: 'hdpi' },
      { name: 'xhdpi.png', width: 96, height: 96, label: 'xhdpi' },
      { name: 'xxhdpi.png', width: 144, height: 144, label: 'xxhdpi' },
      { name: 'xxxhdpi.png', width: 192, height: 192, label: 'xxxhdpi' },
      { name: 'playstore.png', width: 512, height: 512, label: 'Play Store' },
    ],
  },
  {
    id: 'web',
    name: 'Web / Favicon',
    icon: <Globe className="w-5 h-5" />,
    sizes: [
      { name: 'favicon-16x16.png', width: 16, height: 16 },
      { name: 'favicon-32x32.png', width: 32, height: 32 },
      { name: 'apple-touch-icon.png', width: 180, height: 180 },
      { name: 'android-chrome-192x192.png', width: 192, height: 192 },
      { name: 'android-chrome-512x512.png', width: 512, height: 512 },
    ],
  },
];

export default function App() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>(PLATFORMS[0].id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSourceImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = () => {
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const resizeImage = (img: HTMLImageElement, width: number, height: number, format: 'png' | 'jpeg' = 'png', noAlpha: boolean = false): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Fill background with white if no alpha is requested or format is jpeg
      if (noAlpha || format === 'jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
      }

      // Use better scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Calculate aspect ratio to fit/cover
      const imgAspect = img.width / img.height;
      const canvasAspect = width / height;
      
      let drawWidth = width;
      let drawHeight = height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgAspect > canvasAspect) {
        // Image is wider than canvas
        drawHeight = width / imgAspect;
        offsetY = (height - drawHeight) / 2;
      } else {
        // Image is taller than canvas
        drawWidth = height * imgAspect;
        offsetX = (width - drawWidth) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      }, `image/${format}`, format === 'jpeg' ? 0.9 : undefined);
    });
  };

  const handleDownloadAll = async () => {
    if (!sourceImage) return;
    setIsProcessing(true);

    try {
      const platform = PLATFORMS.find(p => p.id === selectedPlatform);
      if (!platform) return;

      const zip = new JSZip();
      const img = new Image();
      img.src = sourceImage;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const folder = zip.folder(platform.name);
      
      for (const size of platform.sizes) {
        const blob = await resizeImage(img, size.width, size.height, size.format || 'png', size.noAlpha || false);
        folder?.file(size.name, blob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${platform.name.toLowerCase().replace(/\s+/g, '-')}-assets.zip`);
    } catch (error) {
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPlatform = PLATFORMS.find(p => p.id === selectedPlatform);

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Icon Resizer Pro</h1>
          </div>
          <div className="text-sm text-gray-500 font-medium">
            Fast, secure, browser-based conversion
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Upload & Preview */}
          <div className="lg:col-span-7 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-6">1. Upload Source Image</h2>
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative group cursor-pointer
                  border-2 border-dashed rounded-3xl p-12
                  transition-all duration-300 ease-in-out
                  flex flex-col items-center justify-center gap-4
                  ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50'}
                  ${sourceImage ? 'py-8' : 'py-24'}
                `}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                  accept="image/*"
                  className="hidden"
                />
                
                {sourceImage ? (
                  <div className="relative w-full max-w-xs aspect-square rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5">
                    <img src={sourceImage} alt="Source" className="w-full h-full object-contain bg-white" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSourceImage(null);
                      }}
                      className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold">Click or drag to upload</p>
                      <p className="text-sm text-gray-500 mt-1">High resolution PNG or JPG recommended (1024x1024+)</p>
                    </div>
                  </>
                )}
              </div>
            </section>

            {sourceImage && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl font-bold mb-6">2. Select Platform</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {PLATFORMS.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => setSelectedPlatform(platform.id)}
                      className={`
                        p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-3
                        ${selectedPlatform === platform.id 
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' 
                          : 'border-white bg-white hover:border-gray-200 text-gray-600 shadow-sm'}
                      `}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedPlatform === platform.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {platform.icon}
                      </div>
                      <span className="font-semibold text-sm">{platform.name}</span>
                    </button>
                  ))}
                </div>
              </motion.section>
            )}
          </div>

          {/* Right Column: Results & Download */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              {sourceImage ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden sticky top-24"
                >
                  <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold">Generated Assets</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">
                        {currentPlatform?.sizes.length} Files
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Previewing sizes for {currentPlatform?.name}</p>
                  </div>

                  <div className="max-h-[500px] overflow-y-auto p-8 space-y-4">
                    {currentPlatform?.sizes.map((size, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                          <img src={sourceImage} alt={size.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{size.name}</p>
                          <p className="text-xs text-gray-400">
                            {size.width} × {size.height}px {size.label && `• ${size.label}`}
                          </p>
                        </div>
                        <div className="text-green-500">
                          <Check className="w-5 h-5" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-8 bg-white border-t border-gray-100">
                    <button
                      onClick={handleDownloadAll}
                      disabled={isProcessing}
                      className={`
                        w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all
                        ${isProcessing 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-lg shadow-blue-200'}
                      `}
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Download className="w-6 h-6" />
                          Download All Assets (.zip)
                        </>
                      )}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4">
                      All processing happens locally in your browser.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full min-h-[400px] border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center text-gray-400"
                >
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Download className="w-10 h-10" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600">Ready to convert</h3>
                  <p className="text-sm max-w-[240px] mt-2">Upload an image to see the generated sizes and download your assets.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-gray-200 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <ImageIcon className="w-5 h-5" />
            <span className="font-bold">Icon Resizer Pro</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Help</a>
          </div>
          <div className="text-sm text-gray-400">
            © 2026 Icon Resizer Pro. No images are uploaded to any server.
          </div>
        </div>
      </footer>
    </div>
  );
}
