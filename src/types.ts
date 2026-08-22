export interface SubtaskSolution {
  subtask: string;
  description: string;
  code: string;
}

export interface LQDOJProblem {
  title: string;
  rating: number;
  category: string;
  problemStatement: string;
  testGenerator: string;
  generatorScript: string;
  checker: string | null;
  interactive: string | null;
  solutions: SubtaskSolution[];
  analysis: string;
}

export interface GenerationRequest {
  rating: number | "random";
  category: string;
  briefIdea?: string;
  problemType: 'standard' | 'checker' | 'interactive';
  model?: string;
  apiKey?: string;
}
