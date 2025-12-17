import { GenerationResponse, ApiConfig } from "../types";
import { STIMULI_LIBRARY } from "../constants";

// 辅助函数：从词库中随机抽取 N 个不重复的词
const getRandomStimuli = (count: number): string[] => {
  // 将所有分类的词汇扁平化为一个大数组
  const allWords = Object.values(STIMULI_LIBRARY).flat();
  
  const selected: string[] = [];
  // 简单的随机抽取去重逻辑
  let availableWords = [...allWords];
  
  for (let i = 0; i < count; i++) {
    if (availableWords.length === 0) break;
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    selected.push(availableWords[randomIndex]);
    // 移除已选中的词，避免重复
    availableWords.splice(randomIndex, 1);
  }
  
  return selected;
};

export const generateLateralIdeas = async (
  category: string,
  subcategory: string,
  problem: string,
  config: ApiConfig
): Promise<GenerationResponse> => {
  
  // 获取 3 个不同的随机刺激词
  const randomWords = getRandomStimuli(3);

  const systemInstruction = `
    你是一位精通爱德华·德·波诺（Edward de Bono）水平思维方法论的顶级创意顾问。
    
    你的任务是为客户（用户）的难题生成一份完整的《水平思维创意解决方案报告》。
    你需要**严格按照**以下 10 种水平思维方法逐一进行思考，并且**每种方法必须生成 3 个具体的创新方案**（共 30 个方案）。

    请严格遵循以下执行步骤和方法定义：

    1. **生成多种方案 (Alternatives)**
       - 方法逻辑：别满足于现有方案或最明显的方案。列出当前方案，然后问“还有其他方式吗？”，逼迫大脑生成新路径。
       - 任务：针对问题，生成 3 个截然不同的替代方案。

    2. **挑战假设 (Challenging Assumptions)**
       - 方法逻辑：列出问题中被认为是“理所当然”的假设（如边界、规则、习惯），问“为什么要这样？能换吗？”，通过打破假设来生成新想法。
       - 任务：识别 3 个核心假设并分别打破它们，生成 3 个方案。

    3. **创新与混搭 (Innovation)**
       - 方法逻辑：不是等灵感，而是系统产生。将问题分解为旧元素，并随机混搭新元素（如科技、娱乐、生态），问“如何更好？”。
       - 任务：使用“分解+混搭”技巧生成 3 个方案。

    4. **暂缓判断 (Suspended Judgment)**
       - 方法逻辑：先收集“疯狂”的想法，不批评，之后再从中提取价值。
       - 任务：提出 3 个看似荒谬、疯狂或不可能的想法，然后给出优化后的可行落地版本（格式：疯狂想法 -> 优化落地）。

    5. **设计 (Design)**
       - 方法逻辑：从零或改进东西。定义目标（功能+实用），抽象其功能（如“杯子”抽象为“盛水容器”），然后重组元素设计新物。
       - 任务：基于功能抽象，重新设计 3 个解决方案。

    6. **反转法 (Reversal)**
       - 方法逻辑：倒过来想。列出正常的方式（如方向、关系、因果），将其完全反转（如“学生教老师”、“顾客付钱给公司”），从中寻找新视角。
       - 任务：使用反转技巧生成 3 个方案。

    7. **随机刺激 (Random Stimulation)**
       - 方法逻辑：引入一个完全无关的词汇，强行建立它与问题的联系。
       - **关键指令**：你必须分别使用我提供的三个不同的随机词来生成 3 个方案：
         - 方案 1 必须使用随机词：【${randomWords[0]}】
         - 方案 2 必须使用随机词：【${randomWords[1]}】
         - 方案 3 必须使用随机词：【${randomWords[2]}】
       - 任务：分别将这三个词的特征（物理特征、功能、隐喻）与问题强行联结，生成 3 个截然不同的方案。**请在方案描述中明确指出是如何联结该随机词的。**

    8. **新词 PO (New Word PO)**
       - 方法逻辑：使用 "PO" 作为激发工具，提出一个挑衅性的陈述（如“PO 汽车是方形的”），然后利用这个不稳定的跳板移动到新想法。
       - 任务：提出 3 个 PO 陈述，并由此移动生成的 3 个方案。

    9. **分解 (Fractionation)**
       - 方法逻辑：将大问题拆解成小块，逐个重组，避免整体卡住。问“每个部分能换吗？”。
       - 任务：将问题分解为不同部分，对部分进行重组，生成 3 个方案。

    10. **类比法 (Analogy)**
        - 方法逻辑：用相似的东西比喻（如动物、自然现象、其他行业），借用其运作原理来解决问题。
        - 任务：寻找 3 个类比对象，借用其原理生成 3 个方案。

    上下文信息：
    - 领域: ${category} - ${subcategory}
    - 用户难题: ${problem}

    输出要求：
    - **必须且只能返回纯 JSON 格式**。
    - 不要包含 markdown 代码块标记（如 \`\`\`json）。
    - 确保所有 JSON 字符串内的双引号都被正确转义。
    - 严禁在 JSON 结构中出现尾部逗号。
    - 确保对象使用 } 闭合，数组使用 ] 闭合。特别注意 ideas 数组必须以 ] 结尾。
    - JSON 结构必须严格符合以下 interface：
    {
      "sections": [
        {
          "methodName": "方法名称",
          "methodSummary": "方法简介",
          "ideas": [
            { "title": "方案标题", "description": "方案详情" },
            { "title": "方案标题", "description": "方案详情" },
            { "title": "方案标题", "description": "方案详情" }
          ]
        }
      ]
    }
    - 语言: 简体中文。
    - 内容质量: 具体、可执行、脑洞大开但有落地逻辑。
  `;

  // 处理 Base URL，确保没有尾部斜杠
  const baseUrl = config.baseUrl.replace(/\/+$/, '');
  const apiUrl = `${baseUrl}/chat/completions`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: `请开始生成水平思维报告，针对难题: "${problem}"` }
        ],
        temperature: 0.5,
        max_tokens: 4000,
        // 大多数 OpenAI 兼容接口（如 DeepSeek）支持 json_object 模式
        response_format: { type: "json_object" },
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `API 请求失败: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error && errorJson.error.message) {
          errorMsg = `API 错误: ${errorJson.error.message}`;
        }
      } catch (e) {
        // ignore JSON parse error
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content;
    
    if (!content) throw new Error("API 返回内容为空");

    // 1. 提取 JSON 块 (贪婪匹配最外层的 {})
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    } else {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }

    // 2. 预处理/修复常见的 LLM JSON 错误
    
    // 修复尾部逗号 (Trailing Commas): , } -> } 和 , ] -> ]
    content = content.replace(/,(\s*[}\]])/g, '$1');
    
    // 修复特定错误1：对象被 ] 闭合而不是 }
    // 场景： "description": "..." ]
    content = content.replace(/("description"\s*:\s*"(?:[^"\\]|\\.)*")\s*\]/g, '$1}');

    // 修复特定错误2：数组中的对象闭合后，数组本身被 } 闭合而不是 ]
    // 场景： { ... "description": "..." } }
    // 期望： { ... "description": "..." } ]
    // 该正则匹配： description字段 + 结束双引号 + 可能的空白 + 结束大括号(对象结束) + 可能的空白 + 结束大括号(错误的数组结束)
    content = content.replace(/("description"\s*:\s*"(?:[^"\\]|\\.)*"\s*})\s*}/g, '$1]');

    try {
      return JSON.parse(content) as GenerationResponse;
    } catch (parseError) {
      console.error("JSON Parse Error Content:", content);
      console.error("Original Error:", parseError);
      throw new Error("生成的内容格式有误，请尝试重新生成");
    }
  } catch (error) {
    console.error("Generation Error:", error);
    throw error;
  }
};