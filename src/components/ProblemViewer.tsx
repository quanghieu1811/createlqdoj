import React, { useState, useMemo } from "react";
import { LQDOJProblem } from "../types";
import { LqdojMarkdown } from "./LqdojMarkdown";
import { CodeBlock } from "./CodeBlock";
import { 
  FileCode2, 
  BookOpen, 
  Lightbulb, 
  FolderDown, 
  Settings2, 
  CheckSquare, 
  Send, 
  Copy, 
  Check,
  ChevronRight,
  Sparkles,
  Trophy,
  Layers,
  FileCheck,
  Cpu,
  Download,
  Flame,
  Wand2,
  Code2,
  Terminal,
  FileText,
  Database,
  Table,
  HelpCircle,
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import JSZip from "jszip";
import { 
  generateLQDOJInitYml, 
  generateLQDOJCustomJson, 
  generateDefaultValidators, 
  parseSubtasksFromStatement 
} from "../utils/lqdojHelper";

interface ProblemViewerProps {
  problem: LQDOJProblem;
  onRefine: (feedback: string) => void;
  refining: boolean;
}

export const ProblemViewer: React.FC<ProblemViewerProps> = ({ problem, onRefine, refining }) => {
  const [activeTab, setActiveTab] = useState<
    'statement' | 'testdata_config' | 'validator' | 'ioi' | 'kaggle' | 'output_only' | 'generator' | 'solutions' | 'checker' | 'analysis' | 'guide'
  >('statement');
  const [activeSolutionIdx, setActiveSolutionIdx] = useState<number>(0);
  const [activeIoiLang, setActiveIoiLang] = useState<'cpp' | 'py' | 'java'>('cpp');
  const [activeValidatorLang, setActiveValidatorLang] = useState<'cpp' | 'py'>('cpp');
  const [copiedStatement, setCopiedStatement] = useState(false);
  const [copiedInitYml, setCopiedInitYml] = useState(false);
  const [copiedCustomJson, setCopiedCustomJson] = useState(false);
  const [refineFeedback, setRefineFeedback] = useState("");

  const scriptLines = problem.generatorScript 
    ? problem.generatorScript.trim().split("\n").filter(Boolean).length 
    : (problem.testCount || 100);

  const initYmlContent = useMemo(() => generateLQDOJInitYml(problem), [problem]);
  const customJsonContent = useMemo(() => generateLQDOJCustomJson(problem), [problem]);
  const validators = useMemo(() => generateDefaultValidators(problem), [problem]);
  const batches = useMemo(() => parseSubtasksFromStatement(problem), [problem]);

  const handleCopyStatement = async () => {
    try {
      await navigator.clipboard.writeText(problem.problemStatement);
      setCopiedStatement(true);
      setTimeout(() => setCopiedStatement(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const handleCopyInitYml = async () => {
    try {
      await navigator.clipboard.writeText(initYmlContent);
      setCopiedInitYml(true);
      setTimeout(() => setCopiedInitYml(false), 2000);
    } catch (err) {
      console.error("Failed to copy init.yml!", err);
    }
  };

  const handleCopyCustomJson = async () => {
    try {
      await navigator.clipboard.writeText(customJsonContent);
      setCopiedCustomJson(true);
      setTimeout(() => setCopiedCustomJson(false), 2000);
    } catch (err) {
      console.error("Failed to copy custom JSON!", err);
    }
  };

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    const folderName = problem.title.toLowerCase().replace(/[^a-z0-9]+/g, "_");

    // 1. Problem statement
    zip.file("statement.md", problem.problemStatement);

    // 2. LQDOJ Configs
    zip.file("init.yml", initYmlContent);
    zip.file("test_cases.json", customJsonContent);

    // 3. Validators
    zip.file("validator.cpp", validators.validatorCpp);
    zip.file("validator.py", validators.validatorPy);

    // 4. IOI Files (if present)
    if (problem.ioi || problem.problemType === 'ioi') {
      const ioi = problem.ioi;
      const ioiFolder = zip.folder("ioi_grader");
      if (ioiFolder && ioi) {
        ioiFolder.file("header.h", ioi.headerH || "");
        ioiFolder.file("handler.cpp", ioi.handlerCpp || "");
        ioiFolder.file("handler.py", ioi.handlerPy || "");
        if (ioi.handlerJava) ioiFolder.file("Handler.java", ioi.handlerJava);
        if (ioi.contestantStubJava) ioiFolder.file("Solution.java", ioi.contestantStubJava);
        if (ioi.managerCpp) ioiFolder.file("manager.cpp", ioi.managerCpp);
        ioiFolder.file("stub.cpp", ioi.contestantStubCpp || "");
        ioiFolder.file("stub.py", ioi.contestantStubPy || "");
        ioiFolder.file("signatures.txt", `C++ Signature:\n${ioi.functionSignatureCpp || ""}\n\nPython Signature:\n${ioi.functionSignaturePy || ""}\n\nJava Signature:\n${ioi.functionSignatureJava || ""}\n`);
      }
      if (ioi) {
        zip.file("stub.cpp", ioi.contestantStubCpp || "");
        zip.file("stub.py", ioi.contestantStubPy || "");
        zip.file("header.h", ioi.headerH || "");
      }
    }

    // 5. Kaggle CSV Data (if present)
    if (problem.kaggle || problem.problemType === 'kaggle_csv') {
      const kaggleFolder = zip.folder("kaggle_data");
      if (kaggleFolder && problem.kaggle) {
        if (problem.kaggle.trainCsv) kaggleFolder.file("train.csv", problem.kaggle.trainCsv);
        if (problem.kaggle.testCsv) kaggleFolder.file("test.csv", problem.kaggle.testCsv);
        if (problem.kaggle.solutionCsv) kaggleFolder.file("solution.csv", problem.kaggle.solutionCsv);
        kaggleFolder.file("checker_args.json", JSON.stringify({
          metric: problem.kaggle.metric || "csv_accuracy",
          id_column: problem.kaggle.idColumn || "id",
          label_column: problem.kaggle.labelColumn || "label",
          baseline: problem.kaggle.baseline ?? 0.5,
          pretest_fraction: problem.kaggle.pretestFraction ?? 0.5
        }, null, 2));
      }
    }

    // 6. Test Generator C++
    zip.file("generator.cpp", problem.testGenerator);

    // 7. Generator Script
    if (problem.generatorScript) {
      zip.file("script.txt", problem.generatorScript);
    }

    // 8. Solutions C++
    problem.solutions.forEach((sol) => {
      const subtaskName = sol.subtask.toLowerCase().replace(/[^a-z0-9]+/g, "_");
      zip.file(`solutions/solution_${subtaskName}.cpp`, sol.code);
    });

    // 9. Checker / Interactive
    if (problem.checker) {
      zip.file("checker.cpp", problem.checker);
    }
    if (problem.interactive) {
      zip.file("interactive.cpp", problem.interactive);
    }

    // 10. Analysis
    zip.file("analysis.txt", problem.analysis);

    // 11. Comprehensive README.txt matching LQDOJ guide
    const readmeContent = `LQDOJ PROBLEM SETTING PACKAGE: ${problem.title}
===================================================
Chủ đề: ${problem.category}
Rating: ${problem.rating}
Thể loại bài: ${problem.problemType}
Quy tắc tính điểm (Batch Mode): ${problem.batchMode || 'icpc'} (All-or-0)
Số lượng testcase: ${scriptLines}
${problem.ioi ? `Dạng bài: IOI Signature (Nộp bằng hàm)\nChữ ký C++: ${problem.ioi.functionSignatureCpp || ""}\nChữ ký Python: ${problem.ioi.functionSignaturePy || ""}\n` : ""}

DANH SÁCH FILE TRONG GÓI HOÀN CHỈNH (Tuân thủ Hướng dẫn Test Data LQDOJ):
---------------------------------------------------
1. statement.md: Đề bài lập trình định dạng MkDocs Markdown chuẩn LQDOJ.
2. init.yml: File cấu hình toàn bộ bài tập cho judge LQDOJ (Mục 1 & 2.5).
3. test_cases.json: Cấu hình JSON sẵn sàng dán vào ô "Or use custom JSON" trên LQDOJ (Mục 2.4).
4. validator.cpp & validator.py: Trình kiểm tra testcase bảo đảm dữ liệu đầu vào đúng 100% ràng buộc đề bài (Mục 6).
5. generator.cpp: Mã nguồn C++ sinh dữ liệu test ngẫu nhiên (stdin: tham số + seed; stdout: input; stderr: output).
6. script.txt: Script sinh test gồm đúng ${scriptLines} dòng tham số độc lập.
7. solutions/: Thư mục chứa mã nguồn giải thuật C++ cho từng Subtask.
8. checker.cpp: Trình chấm đặc biệt (Special Judge C++) nếu có.
9. interactive.cpp: Trình tương tác (Interactive Manager) nếu có.
${problem.ioi ? `10. ioi_grader/: Thư mục chứa header.h, handler.cpp, handler.py, Handler.java và stubs cho thí sinh.\n` : ""}
${problem.kaggle ? `11. kaggle_data/: Dữ liệu huấn luyện, kiểm thử và đáp án CSV cho bài Kaggle ML.\n` : ""}
12. analysis.txt: Phân tích thuật toán chi tiết và tài liệu editorial.

CÁCH SỬ DỤNG TRÌNH SINH TEST:
- Biên dịch: g++ -O3 generator.cpp -o generator
- Với mỗi dòng trong script.txt, chạy:
  ./generator [tham_so_dong_i] > test[i].in 2> test[i].out
- Nén các file test vào file zip và upload lên trang Test Data của LQDOJ!
`;
    zip.file("README.txt", readmeContent);

    // Generate zip blob and trigger client download
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${folderName}_lqdoj_package.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refineFeedback.trim() || refining) return;
    onRefine(refineFeedback.trim());
    setRefineFeedback("");
  };

  const QUICK_REFINE_PROMPTS = [
    "Tăng giới hạn thời gian và N lên 10^6",
    "Thêm subtask vét cạn O(N^2) cho học sinh THCS",
    "Chuyển sang dạng bài IOI Grader (Nộp bằng hàm)",
    "Bổ sung Validator C++ kiểm tra chặt chẽ các biên",
    "Thêm cấu hình Kaggle CSV với chỉ số csv_accuracy"
  ];

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-indigo-600 text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider shadow-sm">
                LQDOJ Standard
              </span>
              
              <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold rounded-full flex items-center gap-1 uppercase">
                <Sparkles className="w-3 h-3 text-purple-400" />
                {problem.problemType === 'ioi' ? "IOI Mode (Nộp hàm)" :
                 problem.problemType === 'checker' ? "Special Judge" :
                 problem.problemType === 'interactive' ? "Interactive" :
                 problem.problemType === 'floats' ? "Số thực (Floats)" :
                 problem.problemType === 'kaggle_csv' ? "Kaggle ML (CSV)" :
                 problem.problemType === 'output_only' ? "Output-Only" :
                 "Standard (Đơn nghiệm)"}
              </span>

              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono rounded-full flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400" />
                Rating {problem.rating}
              </span>

              <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold rounded-full">
                {problem.category}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {problem.title}
            </h2>

            {/* Quick stats pills */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/80">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                {problem.solutions.length} Subtasks ({problem.batchMode === 'sum' ? 'VOI Sum' : problem.batchMode === 'ioi_min' ? 'IOI Min' : 'All-or-0 ICPC'})
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/80">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                {scriptLines} Testcases tự động
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/80 text-sky-300">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                Validator C++ & Python
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/80 text-purple-300">
                <Database className="w-3.5 h-3.5 text-purple-400" />
                init.yml & Custom JSON
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button
              type="button"
              onClick={handleCopyStatement}
              className="flex-1 lg:flex-none py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 border border-slate-700 shadow-xs cursor-pointer active:scale-95"
            >
              {copiedStatement ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Đã sao chép Markdown</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-300" />
                  <span>Sao chép Đề bài</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadZip}
              className="flex-1 lg:flex-none py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 cursor-pointer active:scale-95"
            >
              <FolderDown className="w-4 h-4" />
              <span>Tải trọn gói .ZIP LQDOJ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main layout with Sidebar Tabs and Content Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Navigation Tabs */}
        <div className="lg:col-span-3 space-y-1.5">
          {/* TAB 1: Đề bài */}
          <button
            type="button"
            onClick={() => setActiveTab('statement')}
            className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left border cursor-pointer ${
              activeTab === 'statement'
                ? "bg-white text-indigo-950 border-indigo-200 shadow-sm font-bold ring-1 ring-indigo-500/20"
                : "bg-white/60 text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-900"
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'statement' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold">1. Đề bài (statement.md)</div>
              <div className="text-[10px] text-slate-400 font-normal truncate">Markdown MkDocs chuẩn LQDOJ</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          {/* TAB 2: Cấu hình Test Data (init.yml & Custom JSON) */}
          <button
            type="button"
            onClick={() => setActiveTab('testdata_config')}
            className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left border cursor-pointer ${
              activeTab === 'testdata_config'
                ? "bg-white text-indigo-950 border-indigo-200 shadow-sm font-bold ring-1 ring-indigo-500/20"
                : "bg-white/60 text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-900"
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'testdata_config' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
              <Database className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold">2. Cấu hình Test Data</div>
              <div className="text-[10px] text-slate-400 font-normal truncate">init.yml & Custom JSON LQDOJ</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          {/* TAB 3: Trình kiểm tra test (Validator) */}
          <button
            type="button"
            onClick={() => setActiveTab('validator')}
            className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left border cursor-pointer ${
              activeTab === 'validator'
                ? "bg-white text-indigo-950 border-indigo-200 shadow-sm font-bold ring-1 ring-indigo-500/20"
                : "bg-white/60 text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-900"
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'validator' ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500"}`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold">3. Trình kiểm tra test</div>
              <div className="text-[10px] text-slate-400 font-normal truncate">validator.cpp & validator.py</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          {/* TAB 4: IOI Tab (if problem is IOI Mode) */}
          {(problem.ioi || problem.problemType === 'ioi') && (
            <button
              type="button"
              onClick={() => setActiveTab('ioi')}
              className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left border cursor-pointer ${
                activeTab === 'ioi'
                  ? "bg-white text-purple-950 border-purple-200 shadow-sm font-bold ring-1 ring-purple-500/20"
                  : "bg-white/60 text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-900"
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'ioi' ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-600"}`}>
                <Code2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold flex items-center gap-1 text-purple-950">
                  <span>4. IOI Grader (Nộp hàm)</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                </div>
                <div className="text-[10px] text-slate-400 font-normal truncate">C++, Python, Java & Manager</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
          )}

          {/* TAB: Kaggle Data (if problem is Kaggle) */}
          {(problem.kaggle || problem.problemType === 'kaggle_csv') && (
            <button
              type="button"
              onClick={() => setActiveTab('kaggle')}
              className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left border cursor-pointer ${
                activeTab === 'kaggle'
                  ? "bg-white text-emerald-950 border-emerald-200 shadow-sm font-bold ring-1 ring-emerald-500/20"
                : "bg-white/60 text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-900"
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'kaggle' ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-600"}`}>
                <Table className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-emerald-950">Kaggle CSV Data</div>
                <div className="text-[10px] text-slate-400 font-normal truncate">train/test/solution.csv & metric</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
          )}

          {/* TAB: Generator & Script */}
          <button
            type="button"
            onClick={() => setActiveTab('generator')}
            className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left border cursor-pointer ${
              activeTab === 'generator'
                ? "bg-white text-indigo-950 border-indigo-200 shadow-sm font-bold ring-1 ring-indigo-500/20"
                : "bg-white/60 text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-900"
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'generator' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
              <Settings2 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold">5. Sinh Test & Script</div>
              <div className="text-[10px] text-slate-400 font-normal truncate">generator.cpp + {scriptLines} dòng</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          {/* TAB: Solutions */}
          <button
            type="button"
            onClick={() => setActiveTab('solutions')}
            className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left border cursor-pointer ${
              activeTab === 'solutions'
                ? "bg-white text-indigo-950 border-indigo-200 shadow-sm font-bold ring-1 ring-indigo-500/20"
                : "bg-white/60 text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-900"
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'solutions' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
              <FileCode2 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold">6. Lời giải mẫu ({problem.solutions.length})</div>
              <div className="text-[10px] text-slate-400 font-normal truncate">C++ cho từng subtask</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          {/* TAB: Custom Checker / Interactive */}
          {(problem.checker || problem.interactive || problem.problemType === 'checker' || problem.problemType === 'interactive') && (
            <button
              type="button"
              onClick={() => setActiveTab('checker')}
              className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left border cursor-pointer ${
                activeTab === 'checker'
                  ? "bg-white text-indigo-950 border-indigo-200 shadow-sm font-bold ring-1 ring-indigo-500/20"
                  : "bg-white/60 text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-900"
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'checker' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                <CheckSquare className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold">7. Trình chấm đặc biệt</div>
                <div className="text-[10px] text-slate-400 font-normal truncate">checker.cpp / interactive.cpp</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
          )}

          {/* TAB: Analysis */}
          <button
            type="button"
            onClick={() => setActiveTab('analysis')}
            className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left border cursor-pointer ${
              activeTab === 'analysis'
                ? "bg-white text-indigo-950 border-indigo-200 shadow-sm font-bold ring-1 ring-indigo-500/20"
                : "bg-white/60 text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-900"
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'analysis' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
              <Lightbulb className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold">8. Phân tích thuật toán</div>
              <div className="text-[10px] text-slate-400 font-normal truncate">Editorial & Lời giải chi tiết</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          {/* TAB: LQDOJ Guide Map */}
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left border cursor-pointer ${
              activeTab === 'guide'
                ? "bg-white text-indigo-950 border-indigo-200 shadow-sm font-bold ring-1 ring-indigo-500/20"
                : "bg-white/60 text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-900"
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'guide' ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-500"}`}>
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-amber-900">Bản đồ Test Data LQDOJ</div>
              <div className="text-[10px] text-slate-400 font-normal truncate">Hướng dẫn tra cứu nhanh</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        </div>

        {/* Right column: Content panel */}
        <div className="lg:col-span-9 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm min-h-[500px]">
          {/* TAB 1: STATEMENT */}
          {activeTab === 'statement' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Đề bài chính thức (statement.md)
                </h3>
                <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-semibold border border-slate-200">
                  Chuẩn LQDOJ Markdown
                </span>
              </div>
              <div className="prose max-w-none">
                <LqdojMarkdown content={problem.problemStatement} />
              </div>
            </div>
          )}

          {/* TAB 2: TESTDATA CONFIG (init.yml & Custom JSON) */}
          {activeTab === 'testdata_config' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-600" />
                    Cấu hình Test Data (init.yml & Custom JSON)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tuân thủ mục 2.4 & 2.5 trong tài liệu "Hướng dẫn Test Data LQDOJ"
                  </p>
                </div>
              </div>

              {/* Summary Table of Batches */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Bảng phân bổ Subtask & Điểm số (Mục 2.5):
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-white border-b border-slate-200 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2.5">Subtask</th>
                        <th className="p-2.5">Số lượng test</th>
                        <th className="p-2.5">Dải test</th>
                        <th className="p-2.5">Điểm (Points)</th>
                        <th className="p-2.5">Quy tắc chấm (Batch Mode)</th>
                        <th className="p-2.5">Pretest</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/80 font-mono">
                      {batches.map((b, idx) => (
                        <tr key={idx} className="hover:bg-white/60">
                          <td className="p-2.5 font-sans font-semibold text-indigo-950">{b.name}</td>
                          <td className="p-2.5">{b.testCount} tests</td>
                          <td className="p-2.5 text-slate-500">test{b.startIdx.toString().padStart(2, '0')} → test{b.endIdx.toString().padStart(2, '0')}</td>
                          <td className="p-2.5 font-bold text-emerald-700">{b.points}đ</td>
                          <td className="p-2.5 font-sans">
                            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold">
                              {problem.batchMode === 'sum' ? 'Sum (VOI)' : problem.batchMode === 'ioi_min' ? 'Min (IOI)' : 'All-or-0 (ICPC/IOI)'}
                            </span>
                          </td>
                          <td className="p-2.5 font-sans">
                            {b.isPretest ? (
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold">Pretest</span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">Full</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* init.yml Preview & Copy */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>1. File cấu hình chuẩn judge: init.yml</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleCopyInitYml}
                    className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {copiedInitYml ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedInitYml ? "Đã sao chép" : "Sao chép init.yml"}</span>
                  </button>
                </div>
                <CodeBlock code={initYmlContent} filename="init.yml" />
              </div>

              {/* Custom JSON Preview & Copy */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span>2. Cấu hình JSON (Mục 2.4 - Or use custom JSON)</span>
                    </h4>
                    <p className="text-xs text-slate-400">Copy và dán trực tiếp vào ô cấu hình JSON trên LQDOJ</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCustomJson}
                    className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCustomJson ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCustomJson ? "Đã sao chép" : "Sao chép JSON"}</span>
                  </button>
                </div>
                <CodeBlock code={customJsonContent} filename="test_cases.json" />
              </div>
            </div>
          )}

          {/* TAB 3: VALIDATOR (Section 6) */}
          {activeTab === 'validator' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    Trình kiểm tra testcase (Test Validator - Mục 6)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Bảo đảm 100% testcase tuân thủ nghiêm ngặt ràng buộc đề bài (Đọc stdin, exit 0 nếu hợp lệ, exit 1 nếu lỗi)
                  </p>
                </div>

                {/* Language Switcher */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveValidatorLang('cpp')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeValidatorLang === 'cpp' ? "bg-white text-indigo-950 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    C++ Validator
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveValidatorLang('py')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeValidatorLang === 'py' ? "bg-white text-indigo-950 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Python Validator
                  </button>
                </div>
              </div>

              <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl text-xs text-sky-950 space-y-1">
                <p className="font-bold flex items-center gap-1 text-sky-900">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  Quy ước Validator chuẩn LQDOJ:
                </p>
                <p>• Trình validator đọc toàn bộ dữ liệu từ <code>stdin</code>.</p>
                <p>• Nếu dữ liệu hợp lệ: Trả về mã thoát <code>exit(0)</code> (hoặc <code>return 0;</code>).</p>
                <p>• Nếu dữ liệu sai định dạng/vượt quá ràng buộc: In thông báo lỗi ra <code>stderr</code> và trả về <code>exit(1)</code>.</p>
              </div>

              {activeValidatorLang === 'cpp' ? (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Mã nguồn validator.cpp (C++)</h4>
                  <CodeBlock code={validators.validatorCpp} filename="validator.cpp" />
                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Mã nguồn validator.py (Python)</h4>
                  <CodeBlock code={validators.validatorPy} filename="validator.py" />
                </div>
              )}
            </div>
          )}

          {/* TAB 4: IOI MODE */}
          {activeTab === 'ioi' && (problem.ioi || problem.problemType === 'ioi') && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-purple-950 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-purple-600" />
                    IOI Signature & Bộ điều phối (Grader / Handler - Mục 5)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thí sinh cài đặt một hàm; hệ thống judge liên kết với Handler do bạn cung cấp
                  </p>
                </div>

                {/* Language Switcher */}
                <div className="flex items-center gap-1 bg-purple-50/80 p-1 rounded-xl border border-purple-200">
                  <button
                    type="button"
                    onClick={() => setActiveIoiLang('cpp')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeIoiLang === 'cpp'
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-purple-900 hover:text-purple-950"
                    }`}
                  >
                    C / C++
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveIoiLang('py')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeIoiLang === 'py'
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-purple-900 hover:text-purple-950"
                    }`}
                  >
                    Python
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveIoiLang('java')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeIoiLang === 'java'
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-purple-900 hover:text-purple-950"
                    }`}
                  >
                    Java
                  </button>
                </div>
              </div>

              {/* Function Signature Callout */}
              <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-2">
                <h4 className="text-xs font-extrabold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Chữ ký hàm ({activeIoiLang.toUpperCase()} Signature):
                </h4>
                <div className="font-mono text-xs bg-white p-3 rounded-xl border border-purple-100 text-purple-950 shadow-2xs">
                  {activeIoiLang === 'cpp' ? (problem.ioi?.functionSignatureCpp || "long long solve(long long n);") :
                   activeIoiLang === 'py' ? (problem.ioi?.functionSignaturePy || "def solve(n: int) -> int:") :
                   (problem.ioi?.functionSignatureJava || "public static long solve(long n)")}
                </div>
                <p className="text-[11px] text-purple-800 leading-relaxed">
                  {activeIoiLang === 'cpp' && "C/C++: Thí sinh nộp thân hàm, #include \"header.h\". Judge tự động biên dịch cùng handler.cpp."}
                  {activeIoiLang === 'py' && "Python: Bài nộp của thí sinh sẽ được lưu vào file _submission.py. Handler sẽ import trực tiếp hàm."}
                  {activeIoiLang === 'java' && "Java: Thí sinh cài đặt phương thức trong lớp Solution.java. Handler.java sẽ gọi trực tiếp phương thức này."}
                </p>
              </div>

              {/* C++ Specific IOI Assets */}
              {activeIoiLang === 'cpp' && problem.ioi && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        1. File khai báo thư viện: header.h
                      </h4>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                        C/C++ Header
                      </span>
                    </div>
                    <CodeBlock code={problem.ioi.headerH} filename="header.h" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        2. Trình điều phối chấm bài: handler.cpp
                      </h4>
                      <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
                        Judge Wrapper
                      </span>
                    </div>
                    <CodeBlock code={problem.ioi.handlerCpp} filename="handler.cpp" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        3. Khung code mẫu cho thí sinh: stub.cpp
                      </h4>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                        Contestant Stub
                      </span>
                    </div>
                    <CodeBlock code={problem.ioi.contestantStubCpp} filename="stub.cpp" />
                  </div>
                </div>
              )}

              {/* Python Specific IOI Assets */}
              {activeIoiLang === 'py' && problem.ioi && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        1. Trình điều phối chấm bài: handler.py
                      </h4>
                      <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
                        Python Judge Wrapper
                      </span>
                    </div>
                    <CodeBlock code={problem.ioi.handlerPy} filename="handler.py" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        2. Khung code mẫu cho thí sinh Python: stub.py
                      </h4>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                        Contestant Stub
                      </span>
                    </div>
                    <CodeBlock code={problem.ioi.contestantStubPy} filename="stub.py" />
                  </div>
                </div>
              )}

              {/* Java Specific IOI Assets */}
              {activeIoiLang === 'java' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        1. Trình điều phối chấm bài: Handler.java
                      </h4>
                      <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
                        Java Handler
                      </span>
                    </div>
                    <CodeBlock 
                      code={problem.ioi?.handlerJava || `import java.util.Scanner;\n\npublic class Handler {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextLong()) return;\n        int t = sc.nextInt();\n        for (int i = 0; i < t; i++) {\n            long n = sc.nextLong();\n            System.out.println(Solution.solve(n));\n        }\n    }\n}`} 
                      filename="Handler.java" 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        2. Khung code mẫu cho thí sinh Java: Solution.java
                      </h4>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                        Contestant Stub
                      </span>
                    </div>
                    <CodeBlock 
                      code={problem.ioi?.contestantStubJava || `public class Solution {\n    public static long solve(long n) {\n        // Cài đặt thuật toán của bạn tại đây\n        return n * 2;\n    }\n}`} 
                      filename="Solution.java" 
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: KAGGLE CSV */}
          {activeTab === 'kaggle' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-emerald-950 flex items-center gap-2">
                    <Table className="w-4 h-4 text-emerald-600" />
                    Bài tập kiểu Kaggle (CSV Machine Learning - Mục 7.2)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chấm bài theo tệp CSV với bảng xếp hạng Public/Private Leaderboard
                  </p>
                </div>
              </div>

              {/* Metric Card */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Chỉ số đánh giá:</span>
                  <span className="font-mono font-bold text-emerald-900">{problem.kaggle?.metric || "csv_accuracy"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Cột định danh (ID):</span>
                  <span className="font-mono font-bold text-emerald-900">{problem.kaggle?.idColumn || "id"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Cột nhãn (Label):</span>
                  <span className="font-mono font-bold text-emerald-900">{problem.kaggle?.labelColumn || "label"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Pretest Fraction:</span>
                  <span className="font-mono font-bold text-emerald-900">{problem.kaggle?.pretestFraction || 0.5} (50% Public)</span>
                </div>
              </div>

              {problem.kaggle?.trainCsv && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tập dữ liệu huấn luyện: train.csv</h4>
                  <CodeBlock code={problem.kaggle.trainCsv} filename="train.csv" />
                </div>
              )}

              {problem.kaggle?.testCsv && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tập dữ liệu kiểm thử: test.csv</h4>
                  <CodeBlock code={problem.kaggle.testCsv} filename="test.csv" />
                </div>
              )}

              {problem.kaggle?.solutionCsv && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tập đáp án của ban tổ chức: solution.csv</h4>
                  <CodeBlock code={problem.kaggle.solutionCsv} filename="solution.csv" />
                </div>
              )}
            </div>
          )}

          {/* TAB 5: GENERATOR & SCRIPT */}
          {activeTab === 'generator' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-indigo-600" />
                    Bộ sinh testcase & Kịch bản tự động
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Sinh testcase độc lập với seed ngẫu nhiên</p>
                </div>
              </div>
              
              <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl text-xs text-indigo-950 leading-relaxed space-y-1.5">
                <p className="font-bold flex items-center gap-1 text-indigo-900">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Cơ chế sinh test tự động:
                </p>
                <p>1. <strong>Chương trình generator.cpp:</strong> Nhận các tham số ràng buộc cộng thêm seed; in input ra <code>stdout</code> và output ra <code>stderr</code>.</p>
                <p>2. Biên dịch: <code>g++ -O3 generator.cpp -o generator</code></p>
                <p>3. <strong>Kịch bản script.txt ({scriptLines} testcases):</strong> Tự động cấp phát tham số từ nhỏ đến lớn cho {scriptLines} testcase không bị trùng lặp.</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">1. Mã nguồn sinh test: generator.cpp</h4>
                <CodeBlock code={problem.testGenerator} filename="generator.cpp" />
              </div>

              {problem.generatorScript && (
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      2. Kịch bản sinh test: script.txt ({scriptLines} testcases)
                    </h4>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                      {scriptLines} dòng test
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Mỗi dòng tương ứng với 1 testcase, cột cuối cùng là hạt giống ngẫu nhiên (seed).</p>
                  <CodeBlock code={problem.generatorScript} filename="script.txt" />
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SOLUTIONS */}
          {activeTab === 'solutions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-indigo-600" />
                    Mã nguồn Lời giải mẫu (Solutions)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Lời giải mẫu C++ độc lập cho từng Subtask</p>
                </div>

                {/* Subtask switcher buttons */}
                <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {problem.solutions.map((sol, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveSolutionIdx(idx)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        activeSolutionIdx === idx
                          ? "bg-white text-indigo-950 shadow-xs ring-1 ring-slate-200"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {sol.subtask}
                    </button>
                  ))}
                </div>
              </div>

              {problem.solutions[activeSolutionIdx] && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl">
                    <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider">
                      {problem.solutions[activeSolutionIdx].subtask}
                    </h4>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      <strong>Ý tưởng giải thuật:</strong> {problem.solutions[activeSolutionIdx].description}
                    </p>
                  </div>
                  <CodeBlock 
                    code={problem.solutions[activeSolutionIdx].code} 
                    filename={`solution_${problem.solutions[activeSolutionIdx].subtask.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.cpp`} 
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 7: CHECKER */}
          {activeTab === 'checker' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                  {problem.checker ? "Trình chấm đặc biệt (Special Checker)" : "Trình tương tác (Interactive Manager)"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {problem.checker 
                    ? "Dùng khi bài toán có nhiều đáp án hợp lệ hoặc cho điểm thành phần." 
                    : "Dùng để giao tiếp trực tiếp với chương trình của thí sinh."}
                </p>
              </div>

              {problem.checker && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Mã nguồn checker.cpp</h4>
                  <CodeBlock code={problem.checker} filename="checker.cpp" />
                </div>
              )}

              {problem.interactive && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Mã nguồn interactive.cpp</h4>
                  <CodeBlock code={problem.interactive} filename="interactive.cpp" />
                </div>
              )}
            </div>
          )}

          {/* TAB 8: ANALYSIS */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-indigo-600" />
                  Phân tích thuật toán & Hướng dẫn giải (Editorial)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Tài liệu chi tiết dành cho giáo viên và học sinh</p>
              </div>
              <div className="bg-slate-50/70 p-6 border border-slate-200/90 rounded-2xl text-slate-800 leading-relaxed text-xs sm:text-sm whitespace-pre-line font-medium">
                {problem.analysis}
              </div>
            </div>
          )}

          {/* TAB: GUIDE MAP */}
          {activeTab === 'guide' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-amber-950 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  Bản đồ Giao diện & Hướng dẫn Test Data LQDOJ
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bảng đối chiếu cấu hình từ tài liệu chính thức "Hướng dẫn Test Data LQDOJ"
                </p>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Mục</th>
                      <th className="p-3">Thành phần</th>
                      <th className="p-3">Mô tả & Định dạng</th>
                      <th className="p-3">Trạng thái trong app</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    <tr>
                      <td className="p-3 font-mono font-bold">2.1</td>
                      <td className="p-3 font-semibold">Upload ZIP</td>
                      <td className="p-3">File zip chứa test (.in / .out)</td>
                      <td className="p-3 text-emerald-700 font-bold">✓ Tự động đóng gói ZIP</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold">2.2</td>
                      <td className="p-3 font-semibold">Dùng Generator</td>
                      <td className="p-3">File sinh test C++ (stdout: in, stderr: out)</td>
                      <td className="p-3 text-emerald-700 font-bold">✓ generator.cpp hoàn chỉnh</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold">2.3</td>
                      <td className="p-3 font-semibold">Script sinh test</td>
                      <td className="p-3">script.txt gồm 100 dòng tham số + seed</td>
                      <td className="p-3 text-emerald-700 font-bold">✓ script.txt 100 dòng</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold">2.4</td>
                      <td className="p-3 font-semibold">Tự điền bằng JSON</td>
                      <td className="p-3">Cấu trúc score & generator_args</td>
                      <td className="p-3 text-emerald-700 font-bold">✓ test_cases.json có sẵn</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold">2.5</td>
                      <td className="p-3 font-semibold">Batch & Tính điểm</td>
                      <td className="p-3">Sum (VOI), All-or-0 (ICPC), Min (IOI)</td>
                      <td className="p-3 text-emerald-700 font-bold">✓ Hỗ trợ đầy đủ 3 chế độ</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold">3.1</td>
                      <td className="p-3 font-semibold">Default Checker</td>
                      <td className="p-3">Standard, Floats, FloatsAbs, FloatsRel, Rstripped</td>
                      <td className="p-3 text-emerald-700 font-bold">✓ Tự sinh cấu hình YAML</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold">3.2</td>
                      <td className="p-3 font-semibold">Custom Checker</td>
                      <td className="p-3">checker.cpp (testlib.h / mã thoát 0, 1, 2)</td>
                      <td className="p-3 text-emerald-700 font-bold">✓ checker.cpp C++</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold">4</td>
                      <td className="p-3 font-semibold">Interactive</td>
                      <td className="p-3">interactive.cpp giao tiếp 2 chiều</td>
                      <td className="p-3 text-emerald-700 font-bold">✓ interactive.cpp C++</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold">5</td>
                      <td className="p-3 font-semibold">IOI Signature</td>
                      <td className="p-3">header.h, handler.cpp, handler.py, Handler.java</td>
                      <td className="p-3 text-emerald-700 font-bold">✓ C++, Python, Java Stubs</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold">6</td>
                      <td className="p-3 font-semibold">Test Validator</td>
                      <td className="p-3">validator.cpp & validator.py kiểm tra ràng buộc</td>
                      <td className="p-3 text-emerald-700 font-bold">✓ validator.cpp & py</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold">7.1</td>
                      <td className="p-3 font-semibold">Output-only</td>
                      <td className="p-3">Nộp file zip kết quả, giới hạn MB</td>
                      <td className="p-3 text-emerald-700 font-bold">✓ OutputOnlyConfig</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold">7.2</td>
                      <td className="p-3 font-semibold">Kaggle (CSV)</td>
                      <td className="p-3">csv_accuracy, csv_rmse, train/test/solution CSV</td>
                      <td className="p-3 text-emerald-700 font-bold">✓ KaggleConfig + CSVS</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Refinement Prompts Box (Iterative update) */}
      <div className="bg-gradient-to-br from-indigo-50/70 via-slate-50 to-purple-50/50 border border-indigo-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Yêu cầu AI tinh chỉnh hoặc bổ sung đề bài
            </h3>
            <p className="text-xs text-slate-500">
              Nhập yêu cầu sửa đổi (VD: thay đổi giới hạn, sửa cốt truyện, viết thêm subtask...)
            </p>
          </div>
        </div>

        {/* Quick prompt suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" /> Gợi ý nhanh:
          </span>
          {QUICK_REFINE_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setRefineFeedback(prompt)}
              className="text-[11px] bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 border border-slate-200 hover:border-indigo-200 px-2.5 py-1 rounded-full transition-all cursor-pointer shadow-2xs font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form onSubmit={handleRefineSubmit} className="flex flex-col sm:flex-row gap-2 pt-2">
          <input
            type="text"
            value={refineFeedback}
            onChange={(e) => setRefineFeedback(e.target.value)}
            disabled={refining}
            placeholder={refining ? "Đang xử lý yêu cầu tinh chỉnh..." : "Ví dụ: 'Hãy tăng giới hạn N lên 2*10^5 và cập nhật code solution tương ứng'..."}
            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm font-medium transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!refineFeedback.trim() || refining}
            className={`px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0 ${
              !refineFeedback.trim() || refining
                ? "bg-slate-300 shadow-none cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 active:scale-95"
            }`}
          >
            {refining ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Đang tinh chỉnh...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Gửi tinh chỉnh</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

