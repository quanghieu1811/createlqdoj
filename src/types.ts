export interface SubtaskSolution {
  subtask: string;
  description: string;
  code: string;
}

export interface IOISignature {
  functionSignatureCpp: string; // e.g. "long long solve(long long n);"
  functionSignaturePy: string;  // e.g. "def solve(n: int) -> int:"
  functionSignatureJava?: string; // e.g. "public static int solve(int n)"
  headerH: string;              // header.h (Header declaration for C/C++)
  handlerCpp: string;           // handler.cpp (Judge handler reading input, calling function, printing output)
  handlerPy?: string;           // handler.py (Python handler reading input, importing solve from _submission, calling function)
  handlerJava?: string;         // Handler.java (Java handler reading input, calling Solution.solve, printing output)
  contestantStubCpp?: string;   // stub.cpp (Sample contestant starter code in C++)
  contestantStubPy?: string;    // stub.py (Sample contestant starter code in Python)
  contestantStubJava?: string;  // Solution.java (Sample contestant starter code in Java)
  isCommunication?: boolean;
  managerCpp?: string;          // manager.cpp using testlib_ioi.h
  processCount?: number;        // 1 or 2
}

export interface KaggleConfig {
  metric: 'csv_accuracy' | 'csv_rmse' | 'csv_mae' | 'csv_f1' | 'csv_auc' | 'csv_logloss';
  idColumn?: string;
  labelColumn?: string;
  hasHeader: boolean;
  baseline?: number;
  pretestFraction?: number;
  sampleTrainCsv?: string;
  sampleTestCsv?: string;
  sampleSolutionCsv?: string;
}

export interface TestValidator {
  validatorCpp: string;
  validatorPy: string;
}

export interface OutputOnlyConfig {
  isOutputOnly: boolean;
  submissionSizeLimitMb?: number;
  binaryAnswerData?: boolean;
  sampleOutputFiles?: { filename: string; content: string }[];
}

export type SubtaskDistribution = 'decreasing' | 'increasing' | 'equal';

export interface LQDOJProblem {
  title: string;
  rating: number;
  category: string;
  problemType: 'standard' | 'floats' | 'checker' | 'interactive' | 'ioi' | 'output_only' | 'kaggle_csv';
  problemStatement: string;
  testGenerator: string;
  generatorScript: string;
  testCount?: number;
  checkerType?: string;
  checkerArgs?: string;
  checker: string | null;
  interactive: string | null;
  ioi?: IOISignature | null;
  kaggle?: KaggleConfig | null;
  validator?: TestValidator | null;
  outputOnlyConfig?: OutputOnlyConfig | null;
  initYml?: string;
  customJson?: string;
  batchMode?: 'sum' | 'icpc' | 'ioi_min';
  subtaskDistribution?: SubtaskDistribution;
  solutions: SubtaskSolution[];
  analysis: string;
}

export interface GenerationRequest {
  rating: number | "random";
  category: string;
  briefIdea?: string;
  problemType: 'standard' | 'floats' | 'checker' | 'interactive' | 'ioi' | 'output_only' | 'kaggle_csv';
  checkerType?: string;
  batchMode?: 'sum' | 'icpc' | 'ioi_min';
  subtaskDistribution?: SubtaskDistribution;
  testCount?: number;
  model?: string;
  apiKey?: string;
}


