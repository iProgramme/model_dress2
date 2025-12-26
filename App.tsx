import React, { useState } from 'react';
import { UploadedImage, GenerationSettings, AppStatus, GeneratedImage, ModelType, Resolution } from './types';
import ImageUploader from './components/ImageUploader';
import { generateFashionImages } from './services/geminiService';
import { Sparkles, Download, Image as ImageIcon, Loader2, AlertCircle, Key, User, ExternalLink } from 'lucide-react';

const App: React.FC = () => {
  // Inputs
  const [apiKey, setApiKey] = useState<string>('');
  const [productImage, setProductImage] = useState<UploadedImage | null>(null);
  const [customModelImage, setCustomModelImage] = useState<UploadedImage | null>(null);
  const [sceneImage, setSceneImage] = useState<UploadedImage | null>(null);
  
  // Settings
  const [imageCount, setImageCount] = useState<number>(1);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [modelType, setModelType] = useState<ModelType>('fast');
  const [resolution, setResolution] = useState<Resolution>('1K');
  
  // State
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleGenerate = async () => {
    if (!productImage) {
      setErrorMsg("请先上传主商品图");
      return;
    }

    if (!customModelImage) {
      setErrorMsg("请上传您的模特图片");
      return;
    }
    
    // Check key only if environment key is missing
    if (!apiKey && !process.env.API_KEY) {
       setErrorMsg("请输入 API Key");
       return;
    }

    setStatus(AppStatus.GENERATING);
    setErrorMsg('');
    setResults([]);

    const settings: GenerationSettings = {
      apiKey,
      productImage,
      customModelImage,
      sceneImage,
      prompt: customPrompt,
      imageCount,
      modelType,
      resolution,
    };

    try {
      const images = await generateFashionImages(settings);
      if (images.length === 0) {
        throw new Error("生成失败，未能获取到有效图片。");
      }
      setResults(images);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "生成过程中发生了未知错误");
      setStatus(AppStatus.ERROR);
    }
  };

  const downloadImage = (url: string, id: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `efashion-ai-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-pink-500 to-rose-400 p-2 rounded-lg text-white">
              <Sparkles size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              电商AI换模 <span className="text-xs font-normal text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 ml-2">Studio</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <a 
               href="https://guojianapi.com" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-xs text-gray-500 hover:text-pink-600 transition-colors flex items-center gap-1 hover:underline"
             >
               购买 Key <ExternalLink size={10} />
             </a>
             <div className="relative group">
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 focus-within:border-pink-300 focus-within:ring-2 focus-within:ring-pink-100 transition-all">
                  <Key size={14} className="text-gray-400" />
                  <input 
                    type="password" 
                    placeholder="输入 Gemini API Key" 
                    className="bg-transparent border-none outline-none text-xs w-32 md:w-48 text-gray-600 placeholder-gray-400"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
                {!process.env.API_KEY && !apiKey && (
                  <div className="absolute top-10 right-0 bg-red-50 text-red-500 text-xs p-2 rounded shadow-md whitespace-nowrap z-50 border border-red-100">
                    需要 API Key 才能运行
                  </div>
                )}
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Controls */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            
            {/* 1. Upload Section */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-2 text-gray-800 font-semibold border-b border-gray-50 pb-3">
                <div className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs">1</div>
                商品与模特
              </div>
              
              <ImageUploader 
                label="① 服装/商品图 (必选)" 
                subLabel="包含您想展示的服装"
                image={productImage} 
                onImageChange={setProductImage}
                required
              />

              <ImageUploader 
                label="② 您的模特图 (必选)" 
                subLabel="包含完整身材的真人模特"
                image={customModelImage} 
                onImageChange={setCustomModelImage}
                required
              />

              <div className="pt-2 border-t border-gray-50">
                 <ImageUploader 
                  label="③ 指定场景 (可选)" 
                  subLabel="自定义背景环境"
                  image={sceneImage} 
                  onImageChange={setSceneImage}
                />
              </div>
            </div>

            {/* 2. Settings Section */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-5">
              <div className="flex items-center gap-2 text-gray-800 font-semibold border-b border-gray-50 pb-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">2</div>
                生成配置
              </div>

              {/* Model & Quality Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">模型版本</label>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setModelType('fast')}
                    className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                      modelType === 'fast'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Nano Banana
                    <div className="text-[10px] opacity-70 font-normal">快速/创意</div>
                  </button>
                  <button
                    onClick={() => setModelType('pro')}
                    className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                      modelType === 'pro'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Nano Banana Pro
                    <div className="text-[10px] opacity-70 font-normal">高画质/可控</div>
                  </button>
                </div>
                
                {modelType === 'pro' && (
                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <span className="text-xs text-gray-500 pl-1">分辨率:</span>
                    <div className="flex gap-1 flex-1">
                       {(['1K', '2K', '4K'] as Resolution[]).map(res => (
                         <button
                           key={res}
                           onClick={() => setResolution(res)}
                           className={`flex-1 py-1 text-xs rounded shadow-sm transition-all ${
                             resolution === res ? 'bg-white text-indigo-600 font-bold' : 'text-gray-400 hover:text-gray-600'
                           }`}
                         >
                           {res}
                         </button>
                       ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">生成数量</label>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  {[1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      onClick={() => setImageCount(num)}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                        imageCount === num 
                          ? 'bg-white text-pink-600 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  补充描述 (可选)
                </label>
                <textarea
                  className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none resize-none h-20 bg-gray-50"
                  placeholder="例：街拍风格，自然光，回眸一笑..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                />
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={status === AppStatus.GENERATING || !productImage || !customModelImage}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-white font-bold text-lg shadow-lg transition-all transform active:scale-95
                ${status === AppStatus.GENERATING || !productImage || !customModelImage
                  ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                  : 'bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 shadow-pink-200'
                }`}
            >
              {status === AppStatus.GENERATING ? (
                <>
                  <Loader2 className="animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="fill-current" />
                  立即生成
                </>
              )}
            </button>
            
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2 border border-red-100">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                {errorMsg}
              </div>
            )}
          </div>

          {/* Right Panel: Results */}
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[600px] flex flex-col">
              <div className="p-5 border-b border-gray-50 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <ImageIcon size={18} className="text-gray-400" />
                  生成结果 (9:16)
                </h2>
                {results.length > 0 && (
                   <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">
                     成功 {results.length} 张
                   </span>
                )}
              </div>
              
              <div className="flex-1 p-6">
                {results.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((img) => (
                      <div key={img.id} className="group relative rounded-xl overflow-hidden bg-gray-100 shadow-md aspect-[9/16]">
                        <img 
                          src={img.url} 
                          alt="Generated" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6">
                          <button
                            onClick={() => downloadImage(img.url, img.id)}
                            className="bg-white/90 hover:bg-white text-gray-900 font-medium py-2 px-6 rounded-full shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                          >
                            <Download size={18} />
                            保存
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                    {status === AppStatus.GENERATING ? (
                      <div className="space-y-4">
                        <div className="relative w-24 h-24 mx-auto">
                          <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-pink-500 rounded-full border-t-transparent animate-spin"></div>
                          <Sparkles className="absolute inset-0 m-auto text-pink-500 animate-pulse" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">AI 设计师正在工作中...</h3>
                        <p className="text-gray-500 text-sm">
                          正在将服装图 1 穿戴到模特图 2 上...<br/>
                          并融合到场景中。约需 40-50 秒。
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 opacity-60">
                         <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                           <User size={48} className="text-gray-300" />
                         </div>
                         <h3 className="text-lg font-medium text-gray-900">准备就绪</h3>
                         <p className="text-gray-500 text-sm">
                           步骤: 1.上传衣服 2.上传模特 <br/> AI 将自动为该模特换装。
                         </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default App;
