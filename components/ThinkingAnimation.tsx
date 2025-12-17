import * as React from 'react';
import { useEffect, useState } from 'react';
import { BrainCircuit, Shuffle, Zap, Split, RefreshCw, Layers, PenTool, Lightbulb } from 'lucide-react';

const steps = [
  { text: "正在分析垂直思维定势...", icon: BrainCircuit, color: "text-blue-500" },
  { text: "正在挑战核心假设...", icon: Split, color: "text-red-500" },
  { text: "正在进行随机刺激联想...", icon: Shuffle, color: "text-purple-500" },
  { text: "正在构建 '新词 PO'...", icon: Zap, color: "text-yellow-500" },
  { text: "正在执行概念抽象与反转...", icon: RefreshCw, color: "text-green-500" },
  { text: "正在分解与混搭重组...", icon: Layers, color: "text-orange-500" },
  { text: "正在生成 30+ 个水平创意...", icon: Lightbulb, color: "text-indigo-600" }
];

export const ThinkingAnimation: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 1500); // Slower interval for deeper thinking feel
    return () => clearInterval(interval);
  }, []);

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-8 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-xl max-w-md mx-auto">
      <div className={`relative p-8 rounded-full bg-slate-50 ${steps[currentStep].color} animate-pulse shadow-inner`}>
        <StepIcon size={56} strokeWidth={1.5} />
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-xl font-medium text-slate-800 font-mono tracking-tight min-h-[1.75rem]">
          {steps[currentStep].text}
        </h3>
        <p className="text-sm text-slate-400">AI 正在进行深度水平跳跃...</p>
      </div>

      <div className="flex space-x-1.5">
        {steps.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-1.5 rounded-full transition-all duration-500 ${
              idx === currentStep ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
};