import * as React from 'react';
import { useState, useEffect } from 'react';
import { CATEGORIES } from './constants';
import { generateLateralIdeas } from './services/geminiService';
import { GenerationResponse, ApiConfig } from './types';
import { ThinkingAnimation } from './components/ThinkingAnimation';
import { 
  Brain, 
  ChevronRight, 
  Sparkles, 
  ArrowLeft, 
  Box,
  Heart,
  Briefcase,
  Megaphone,
  MessageCircle,
  HelpCircle,
  Download,
  Settings,
  X,
  Save,
  FileText,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';

// Icon mapping for dynamic rendering
const IconMap: Record<string, any> = {
  Brain, Box, Heart, Briefcase, Megaphone, MessageCircle, 
  Lightbulb, HelpCircle
};

// Default configuration (Example for DeepSeek)
const DEFAULT_CONFIG: ApiConfig = {
  apiKey: '',
  baseUrl: 'https://api.deepseek.com',
  model: 'deepseek-chat'
};

const App: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [problem, setProblem] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [responseResult, setResponseResult] = useState<GenerationResponse | null>(null);
  const [pdfGenerating, setPdfGenerating] = useState<boolean>(false);
  
  // Settings State
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig>(DEFAULT_CONFIG);
  const [tempConfig, setTempConfig] = useState<ApiConfig>(DEFAULT_CONFIG);

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('lateral_app_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setApiConfig(parsed);
        setTempConfig(parsed);
      } catch (e) {
        console.error("Failed to parse config", e);
      }
    } else {
        // If no config found, show settings on first load if key is empty
        // Optional: remove this if you don't want to force settings open
    }
  }, []);

  const selectedCategory = CATEGORIES.find(c => c.id === selectedCatId);
  const selectedSubCategory = selectedCategory?.subcategories.find(s => s.id === selectedSubId);

  const handleSaveSettings = () => {
    if (!tempConfig.apiKey.trim()) {
      alert("请输入 API Key");
      return;
    }
    setApiConfig(tempConfig);
    localStorage.setItem('lateral_app_config', JSON.stringify(tempConfig));
    setShowSettings(false);
  };

  const handleGenerate = async () => {
    if (!apiConfig.apiKey) {
      setShowSettings(true);
      return;
    }
    
    if (!selectedCategory || !selectedSubCategory || !problem.trim()) return;
    
    setLoading(true);
    setResponseResult(null);
    
    try {
      const data = await generateLateralIdeas(
        selectedCategory.label,
        selectedSubCategory.label,
        problem,
        apiConfig
      );
      setResponseResult(data);
      setStep(4);
    } catch (error: any) {
      console.error(error);
      alert(`生成失败: ${error.message || "请检查网络或 API 配置"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('pdf-results');
    if (!element) return;
    
    setPdfGenerating(true);
    window.scrollTo(0, 0);

    const opt = {
      margin: [10, 10, 10, 10], 
      filename: '水平思维深度创意报告.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        scrollY: 0, 
        windowWidth: document.documentElement.offsetWidth, 
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // @ts-ignore
    if (window.html2pdf) {
      // @ts-ignore
      window.html2pdf().set(opt).from(element).save().then(() => {
        setPdfGenerating(false);
      }).catch((err: any) => {
         console.error(err);
         setPdfGenerating(false);
         alert("PDF 生成失败，请重试");
      });
    } else {
      alert("PDF 组件未加载，请刷新页面重试");
      setPdfGenerating(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSelectedCatId(null);
    setSelectedSubId(null);
    setProblem('');
    setResponseResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={reset}>
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Brain className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 hidden sm:inline-block">
              水平思维 · 创意引擎
            </span>
            <span className="text-xl font-bold text-indigo-600 sm:hidden">创意引擎</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex space-x-2 text-sm text-slate-500 font-medium items-center mr-4">
              <span className={step >= 1 ? 'text-indigo-600' : ''}>1. 领域</span>
              <ChevronRight size={14} />
              <span className={step >= 2 ? 'text-indigo-600' : ''}>2. 场景</span>
              <ChevronRight size={14} />
              <span className={step >= 3 ? 'text-indigo-600' : ''}>3. 输入</span>
              <ChevronRight size={14} />
              <span className={step >= 4 ? 'text-indigo-600' : ''}>4. 创意</span>
            </div>

            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="API 设置"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Settings size={18} />
                模型接口配置
              </h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">API Key <span className="text-red-500">*</span></label>
                <input 
                  type="password" 
                  value={tempConfig.apiKey}
                  onChange={(e) => setTempConfig({...tempConfig, apiKey: e.target.value})}
                  placeholder="sk-..."
                  className="w-full p-3 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
                <p className="text-xs text-slate-500">
                  Key 仅存储在本地浏览器中，直连大模型 API。
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Base URL</label>
                <input 
                  type="text" 
                  value={tempConfig.baseUrl}
                  onChange={(e) => setTempConfig({...tempConfig, baseUrl: e.target.value})}
                  placeholder="https://api.deepseek.com"
                  className="w-full p-3 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
                <p className="text-xs text-slate-500">
                  兼容 OpenAI 格式的接口地址 (如 DeepSeek, Moonshot 等)
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Model Name</label>
                <input 
                  type="text" 
                  value={tempConfig.model}
                  onChange={(e) => setTempConfig({...tempConfig, model: e.target.value})}
                  placeholder="deepseek-chat"
                  className="w-full p-3 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
              >
                <Save size={18} />
                保存配置
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-12">
        
        {loading ? (
          <ThinkingAnimation />
        ) : (
          <div className="space-y-8">
            
            {/* Step 1: Category Selection */}
            {step === 1 && (
              <div className="fade-in space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-slate-900">选择您的挑战领域</h1>
                  <p className="text-slate-500">选择您需要寻求突破的主要方向。</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CATEGORIES.map((cat) => {
                    const Icon = IconMap[cat.icon] || Box;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCatId(cat.id);
                          setStep(2);
                        }}
                        className="group flex flex-col items-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200"
                      >
                        <div className="p-4 rounded-full bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors mb-4">
                          <Icon size={32} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 group-hover:text-indigo-700">
                          {cat.label}
                        </h3>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Subcategory Selection */}
            {step === 2 && selectedCategory && (
              <div className="fade-in space-y-6">
                <button 
                  onClick={() => setStep(1)}
                  className="flex items-center text-sm text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <ArrowLeft size={16} className="mr-1" /> 返回领域选择
                </button>
                
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900">深入细分：{selectedCategory.label}</h2>
                  <p className="text-slate-500">场景越具体，生成的水平创意越精准。</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCategory.subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setSelectedSubId(sub.id);
                        setStep(3);
                      }}
                      className="text-left p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all group"
                    >
                      <h3 className="font-semibold text-lg text-slate-800 group-hover:text-indigo-700 mb-2">
                        {sub.label}
                      </h3>
                      <div className="space-y-1">
                        {sub.prompts.map((p, idx) => (
                          <p key={idx} className="text-sm text-slate-400 italic">"{p}"</p>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Input Problem */}
            {step === 3 && selectedSubCategory && (
              <div className="fade-in max-w-2xl mx-auto space-y-8">
                <button 
                  onClick={() => setStep(2)}
                  className="flex items-center text-sm text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <ArrowLeft size={16} className="mr-1" /> 返回场景选择
                </button>

                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-slate-900">定义核心难题</h2>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                    <p className="font-semibold mb-1">💡 水平思维提示：</p>
                    <p>不要只描述症状，试着描述您想摆脱的现状或惯性思维。例如，与其说“我需要更多销售额”，不如说“我们目前主要依赖陌生拜访，但几乎没人接电话”。</p>
                  </div>
                  
                  <div className="relative">
                    <textarea
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      placeholder="请描述您面临的具体挑战、瓶颈，或者您想要打破的常规做法..."
                      className="w-full h-40 p-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 outline-none text-lg resize-none transition-colors"
                    />
                    <div className="absolute bottom-4 right-4 text-xs text-slate-400">
                      {problem.length} 字
                    </div>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={!problem.trim()}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                  >
                    <Sparkles size={20} />
                    <span>生成水平思维全案报告 (30+ 创意)</span>
                  </button>
                  
                  {/* Hint for setting API Key if missing */}
                  {!apiConfig.apiKey && (
                    <div className="text-center">
                      <p className="text-sm text-amber-600 bg-amber-50 inline-block px-4 py-2 rounded-full border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors" onClick={() => setShowSettings(true)}>
                        ⚠️ 需要配置 API Key 才能生成创意，点击这里设置
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Results (Structured Report) */}
            {step === 4 && responseResult && (
              <div className="fade-in space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">创意报告</h2>
                  <button 
                    onClick={reset}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline"
                  >
                    重新开始
                  </button>
                </div>

                {/* PDF Content Wrapper */}
                <div id="pdf-results" className="bg-white p-8 md:p-12 shadow-sm border border-slate-200 rounded-xl">
                  {/* Report Header */}
                  <div className="border-b border-slate-200 pb-8 mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">水平思维创意解决方案报告</h1>
                    <div className="flex flex-col space-y-2 text-slate-500 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-slate-700 shrink-0">挑战领域:</span>
                        <span>{selectedCategory?.label} - {selectedSubCategory?.label}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-slate-700 shrink-0">核心难题:</span>
                        <span>{problem}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-slate-700 shrink-0">生成时间:</span>
                        <span>{new Date().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sections */}
                  <div className="space-y-10">
                    {responseResult.sections.map((section, idx) => (
                      <div key={idx} className="break-inside-avoid">
                        <div className="mb-4">
                          <h2 className="text-xl font-bold text-indigo-700 flex items-center gap-2 mb-2">
                            <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                              {idx + 1}
                            </span>
                            {section.methodName.replace(/^\d+\.\s*/, '')}
                          </h2>
                          <div className="bg-slate-50 border-l-4 border-indigo-200 p-3 text-sm text-slate-600 italic rounded-r-lg">
                            <span className="font-semibold not-italic text-slate-700">方法原理：</span>
                            {section.methodSummary}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 pl-4">
                          {section.ideas.map((idea, ideaIdx) => (
                            <div key={ideaIdx} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                              <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                                {idea.title}
                              </h3>
                              <p className="text-slate-600 text-sm leading-relaxed pl-6">
                                {idea.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Footer */}
                  <div className="mt-12 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm">
                     Generated by Lateral Thinking Creative Engine
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-4">
                  <button 
                    onClick={handleDownloadPDF}
                    disabled={pdfGenerating}
                    className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-wait"
                  >
                    {pdfGenerating ? (
                      <span className="animate-pulse">正在生成深度报告 PDF...</span>
                    ) : (
                      <>
                        <Download size={20} />
                        <span>下载完整 PDF 报告 (30+ 方案)</span>
                      </>
                    )}
                  </button>

                  <div className="bg-indigo-50 p-6 rounded-xl text-center space-y-3 border border-indigo-100">
                    <h4 className="font-semibold text-indigo-900">结果如何？</h4>
                    <p className="text-sm text-indigo-700">
                      如果您发现某个创意特别有潜力，可以提取它作为新的“难题”再次输入，进行第二轮水平迭代。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;