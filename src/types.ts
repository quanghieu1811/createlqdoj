export interface SubtaskSolution {
  subtask: string;
  description: string;
  code: string;
}

export interface IOISignature {
  functionSignatureCpp: string; // e.g. "long long solve(long long n);"
  functionSignaturePy: string;  // e.g. "def solve(n: int) -> int:"
  headerH: string;              // header.h (Header declaration for C/C++)
  handlerCpp: string;           // handler.cpp (Judge handler reading input, calling function, printing output)
  handlerPy?: string;           // handler.py (Python handler reading input, importing solve from _submission, calling function)
  contestantStubCpp?: string;   // stub.cpp (Sample contestant starter code in C++)
  contestantStubPy?: string;    // stub.py (Sample contestant starter code in Python)
}

export interface LQDOJProblem {
  title: string;
  rating: number;
  category: string;
  problemStatement: string;
  testGenerator: string;
  generatorScript: string;
  testCount?: number;
  checker: string | null;
  interactive: string | null;
  ioi?: IOISignature | null;
  solutions: SubtaskSolution[];
  analysis: string;
}

export interface GenerationRequest {
  rating: number | "random";
  category: string;
  briefIdea?: string;
  problemType: 'standard' | 'checker' | 'interactive' | 'ioi';
  testCount?: number;
  model?: string;
  apiKey?: string;
}

