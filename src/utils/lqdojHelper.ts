import { LQDOJProblem, SubtaskSolution } from "../types";

export interface TestBatch {
  name: string;
  points: number;
  testCount: number;
  startIdx: number;
  endIdx: number;
  isPretest?: boolean;
}

export function parseSubtasksFromStatement(problem: LQDOJProblem): TestBatch[] {
  const statement = problem.problemStatement || "";
  const scriptLines = problem.generatorScript
    ? problem.generatorScript.trim().split("\n").filter(Boolean)
    : [];
  const totalTests = scriptLines.length > 0 ? scriptLines.length : (problem.testCount || 100);

  // Try to find subtask descriptions in solutions or statement
  const subtaskCount = problem.solutions && problem.solutions.length > 0 ? problem.solutions.length : 3;
  const batches: TestBatch[] = [];
  
  const pointsPerSubtask = Math.floor(100 / subtaskCount);
  let testsPerSubtask = Math.floor(totalTests / subtaskCount);
  let currentStart = 1;

  for (let i = 0; i < subtaskCount; i++) {
    const isLast = i === subtaskCount - 1;
    const count = isLast ? totalTests - currentStart + 1 : testsPerSubtask;
    const end = currentStart + count - 1;
    const points = isLast ? 100 - pointsPerSubtask * (subtaskCount - 1) : pointsPerSubtask;
    const name = problem.solutions[i]?.subtask || `Subtask ${i + 1}`;
    
    batches.push({
      name,
      points,
      testCount: count,
      startIdx: currentStart,
      endIdx: end,
      isPretest: i === 0
    });

    currentStart = end + 1;
  }

  return batches;
}

export function generateLQDOJInitYml(problem: LQDOJProblem): string {
  if (problem.initYml && problem.initYml.trim().length > 30) {
    return problem.initYml;
  }

  const batches = parseSubtasksFromStatement(problem);
  const scriptLines = problem.generatorScript
    ? problem.generatorScript.trim().split("\n").filter(Boolean)
    : [];
  
  let checkerName = problem.checkerType || (
    problem.problemType === 'floats' ? 'floats' :
    problem.problemType === 'checker' ? 'customcpp' :
    problem.problemType === 'interactive' ? 'customcpp' :
    problem.problemType === 'kaggle_csv' ? (problem.kaggle?.metric || 'csv_accuracy') :
    'standard'
  );

  let checkerArgs = problem.checkerArgs || "";
  if (!checkerArgs && problem.problemType === 'floats') {
    checkerArgs = JSON.stringify({ precision: 6 });
  } else if (!checkerArgs && problem.problemType === 'kaggle_csv' && problem.kaggle) {
    const kArgs: any = {
      has_header: problem.kaggle.hasHeader ?? true
    };
    if (problem.kaggle.idColumn) kArgs.id_column = problem.kaggle.idColumn;
    if (problem.kaggle.labelColumn) kArgs.label_column = problem.kaggle.labelColumn;
    if (problem.kaggle.baseline !== undefined) kArgs.baseline = problem.kaggle.baseline;
    if (problem.kaggle.pretestFraction !== undefined) kArgs.pretest_fraction = problem.kaggle.pretestFraction;
    checkerArgs = JSON.stringify(kArgs, null, 2);
  }

  let yml = `# LQDOJ Test Data Configuration File (init.yml)
# Tự động sinh bởi LQDOJ Problem Setter Tool
# Tuân thủ tài liệu "Hướng dẫn Test Data LQDOJ"

problem: "${problem.title}"
rating: ${problem.rating}
category: "${problem.category}"
problem_type: "${problem.problemType}"
`;

  if (problem.outputOnlyConfig?.isOutputOnly || problem.problemType === 'output_only') {
    yml += `output_only: true\n`;
    if (problem.outputOnlyConfig?.submissionSizeLimitMb) {
      yml += `output_size_limit: ${problem.outputOnlyConfig.submissionSizeLimitMb} # MB\n`;
    }
    if (problem.outputOnlyConfig?.binaryAnswerData) {
      yml += `binary_answer_data: true\n`;
    }
  }

  if (problem.ioi || problem.problemType === 'ioi') {
    yml += `\nsignature_grader:\n`;
    yml += `  cpp: grader.cpp\n`;
    yml += `  header: header.h\n`;
    yml += `  python: handler.py\n`;
    yml += `  java: Handler.java\n`;
    if (problem.ioi?.isCommunication) {
      yml += `  communication: true\n`;
      yml += `  manager: manager.cpp\n`;
      yml += `  processes: ${problem.ioi.processCount || 1}\n`;
    }
  }

  yml += `\nchecker: ${checkerName}\n`;
  if (checkerArgs) {
    yml += `checker_args: |\n  ${checkerArgs.replace(/\n/g, "\n  ")}\n`;
  }

  yml += `\n# Cấu hình các Subtask / Test Cases theo mục 2.5 (Batch và cách tính điểm)\n`;
  yml += `test_cases:\n`;

  batches.forEach((b, bIdx) => {
    yml += `  # --- ${b.name} (${b.points} điểm, ${b.testCount} tests) ---\n`;
    yml += `  - batch_start: true\n`;
    yml += `    points: ${b.points}\n`;
    yml += `    batch_mode: ${problem.batchMode || 'icpc'}\n`;
    if (b.isPretest) {
      yml += `    is_pretest: true\n`;
    }

    for (let t = b.startIdx; t <= b.endIdx; t++) {
      const arg = scriptLines[t - 1] || `${t} 1000 ${t * 137}`;
      yml += `    - in: test${t.toString().padStart(2, '0')}.in\n`;
      yml += `      out: test${t.toString().padStart(2, '0')}.out\n`;
      yml += `      generator_args: "${arg.replace(/"/g, '\\"')}"\n`;
    }

    yml += `  - batch_end: true\n\n`;
  });

  return yml;
}

export function generateLQDOJCustomJson(problem: LQDOJProblem): string {
  if (problem.customJson && problem.customJson.trim().startsWith("[")) {
    return problem.customJson;
  }

  const batches = parseSubtasksFromStatement(problem);
  const scriptLines = problem.generatorScript
    ? problem.generatorScript.trim().split("\n").filter(Boolean)
    : [];

  const jsonBatches = batches.map((b) => {
    const testcases: any[] = [];
    for (let t = b.startIdx; t <= b.endIdx; t++) {
      const arg = scriptLines[t - 1];
      if (arg) {
        testcases.push({ generator_args: arg });
      } else {
        testcases.push(`test${t.toString().padStart(2, '0')}`);
      }
    }

    return {
      score: b.points,
      testcases: testcases
    };
  });

  return JSON.stringify(jsonBatches, null, 2);
}

export function generateDefaultValidators(problem: LQDOJProblem): { validatorCpp: string; validatorPy: string } {
  if (problem.validator?.validatorCpp && problem.validator?.validatorPy) {
    return {
      validatorCpp: problem.validator.validatorCpp,
      validatorPy: problem.validator.validatorPy
    };
  }

  const validatorCpp = `// Trình kiểm tra testcase (Validator C++) chuẩn LQDOJ
// Mục 6: Đọc dữ liệu từ stdin, exit 0 nếu hợp lệ, exit 1 nếu dữ liệu vi phạm ràng buộc đề bài.
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    long long n;
    if (!(cin >> n)) {
        cerr << "Lỗi: Không đọc được số nguyên n từ stdin!" << endl;
        return 1;
    }

    // Kiểm tra ràng buộc bài toán
    if (n < 1 || n > 1000000000LL) {
        cerr << "Lỗi: n = " << n << " nằm ngoài dải ràng buộc cho phép [1, 10^9]!" << endl;
        return 1;
    }

    string extra;
    if (cin >> extra) {
        cerr << "Lỗi: Dữ liệu thừa cuối file input: " << extra << endl;
        return 1;
    }

    // Input hoàn toàn hợp lệ
    return 0;
}
`;

  const validatorPy = `#!/usr/bin/env python3
# Trình kiểm tra testcase (Validator Python) chuẩn LQDOJ
# Mục 6: Đọc sys.stdin, sys.exit(0) nếu hợp lệ, sys.exit(1) nếu lỗi.
import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        print("Lỗi: File input rỗng!", file=sys.stderr)
        sys.exit(1)

    try:
        n = int(tokens[0])
    except ValueError:
        print(f"Lỗi: '{tokens[0]}' không phải là số nguyên!", file=sys.stderr)
        sys.exit(1)

    if not (1 <= n <= 10**9):
        print(f"Lỗi: n = {n} nằm ngoài đoạn [1, 10^9]!", file=sys.stderr)
        sys.exit(1)

    if len(tokens) > 1:
        print(f"Lỗi: Dữ liệu thừa {len(tokens) - 1} token: {tokens[1:]}", file=sys.stderr)
        sys.exit(1)

    # Hợp lệ
    sys.exit(0)

if __name__ == "__main__":
    main()
`;

  return { validatorCpp, validatorPy };
}
