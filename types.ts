export interface Category {
  id: string;
  label: string;
  icon: string;
  subcategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  label: string;
  prompts: string[]; // Helper prompts to guide the user
}

// New structure for individual ideas within a method
export interface IdeaDetail {
  title: string;
  description: string;
}

// New structure for a method section (e.g., "Reversal Method")
export interface MethodSection {
  methodName: string; // e.g., "6. 反转法"
  methodSummary: string; // e.g., "倒过来想。列出正常情况，反转方向或关系..."
  ideas: IdeaDetail[]; // Must contain 3 ideas
}

// Top level response
export interface GenerationResponse {
  sections: MethodSection[];
}

export interface ApiConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}