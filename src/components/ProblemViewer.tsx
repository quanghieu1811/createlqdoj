import React, { useState } from "react";
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
  Wand2
} from "lucide-react";
import JSZip from "jszip";

interface ProblemViewerProps {
  problem: LQDOJProblem;
  onRefine: (feedback: string) => void;
  refining: boolean;
}

export const ProblemViewer: React.FC<ProblemViewerProps> = ({ problem, onRefine, refining }) => {
  const [activeTab, setActiveTab] = useState<'statement' | 'generator' | 'solutions' | 'checker' | 'analysis'>('statement');
  const [activeSolutionIdx, setActiveSolutionIdx] = useState<number>(0);
  const [copiedStatement, setCopiedStatement] = useState(false);
  const [refineFeedback, setRefineFeedback] = useState("");

  const scriptLines = problem.generatorScript 
    ? problem.generatorScript.trim().split("\n").filter(Boolean).length 
    : (problem.testCount || 100);

  const handleCopyStatement = async () => {
    try {
      await navigator.clipboard.writeText(problem.problemStatement);
      setCopiedStatement(true);
      setTimeout(() => setCopiedStatement(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    const folderName = problem.title.toLowerCase().replace(/[^a-z0-9]+/g, "_");

    // 1. Problem statement
    zip.file("statement.md", problem.problemStatement);

    // 2. Test Generator C++
    zip.file("generator.cpp", problem.testGenerator);

    // 2.5. Generator Script
    if (problem.generatorScript) {
      zip.file("script.txt", problem.generatorScript);
    }

    // 3. Solutions C++
    problem.solutions.forEach((sol) => {
      const subtaskName = sol.subtask.toLowerCase().replace(/[^a-z0-9]+/g, "_");
      zip.file(`solution_${subtaskName}.cpp`, sol.code);
    });

    // 4. Checker / Interactive
    if (problem.checker) {
      zip.file("checker.cpp", problem.checker);
    }
    if (problem.interactive) {
      zip.file("interactive.cpp", problem.interactive);
    }

    // 5. Analysis
    zip.file("analysis.txt", problem.analysis);

    // 6. Helpful LQDOJ instructions
    const readmeContent = `LQDOJ PROBLEM SETTING PACKAGE: ${problem.title}
===================================================
Chủ đề: ${problem.category}
Rating: ${problem.rating}
Số lượng testcase: ${scriptLines}

BÊN TRONG FILE ZIP NÀY BAO GỒM:
1. statement.md: Đề bài lập trình định dạng Markdown chuẩn LQDOJ.
2. generator.cpp: Mã nguồn C++ sinh dữ liệu test ngẫu nhiên (đầu vào qua stdout, đáp án qua stderr).
3. script.txt: Script sinh test gồm đúng ${scriptLines} dòng tham số tương ứng với ${scriptLines} testcases mạnh.
4. solution_*: Mã nguồn giải thuật C++ mẫu cho từng subtask tương ứng.
5. checker.cpp: Trình chấm đặc biệt (Special Judge) nếu có.
6. interactive.cpp: Trình tương tác (Interactive Manager) nếu có.
7. analysis.txt: Phân tích thuật toán chi tiết.

CÁCH SỬ DỤNG TRÌNH SINH TEST (generator.cpp) VÀ SCRIPT:
- Biên dịch: g++ -O3 generator.cpp -o generator
- Với mỗi dòng trong script.txt, hãy chạy lệnh:
  ./generator [tham_so_dong_i] > [i].in 2> [i].out
  Ví dụ dòng "10 100 12345" sẽ sinh test: ./generator 10 100 12345 > 1.in 2> 1.out
- Rất tiện lợi và tự động hoàn toàn!
`;
    zip.file("readme.txt", readmeContent);

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
    "Đơn giản hóa đề bài, bỏ bớt cốt truyện dài",
    "Bổ sung giải thích chi tiết hơn cho các testcase ví dụ",
    "Tối ưu lại thuật toán full solution bằng Segment Tree"
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
                {problem.solutions.length} Subtasks
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/80">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                {scriptLines} Testcases tự động
              </span>
              {problem.checker && (
                <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/80 text-amber-300">
                  <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                  Custom Checker
                </span>
              )}
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
                  <span className="text-emerald-400 font-bold">Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-300" />
                  <span>Sao chép Markdown</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadZip}
              className="flex-1 lg:flex-none py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 cursor-pointer active:scale-95"
            >
              <FolderDown className="w-4 h-4" />
              <span>Tải trọn bộ .ZIP</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main layout with Sidebar Tabs and Content Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Navigation Tabs */}
        <div className="lg:col-span-3 space-y-2">
          <button
            type="button"
            onClick={() => setActiveTab('statement')}
            className={`w-full p-3.5 rounded-2xl flex items-center gap-3 transition-all text-left border cursor-pointer ${
              activeTab === 'statement'
                ? "bg-white text-indigo-950 border-indigo-200 shadow-sm font-bold ring-1 ring-indigo-500/20"
                : "bg-white/60 text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-900"
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'statement' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold">Đề bài (Markdown)</div>
              <div className="text-[10px] text-slate-400 font-normal truncate">Định dạng MkDocs chuẩn LQDOJ</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('generator')}
            className={`w-full p-3.5 rounded-2xl flex items-center gap-3 transition-all text-left border cursor-pointer ${
              activeTab === 'generator'
                ? "bg-white text-indigo-950 border-indigo-200 shadow-sm font-bold ring-1 ring-indigo-500/20"
                : "bg-white/60 text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-900"
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'generator' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
              <Settings2 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold">Bộ sinh Test & Script</div>
              <div className="text-[10px] text-slate-400 font-normal truncate">generator.cpp + {scriptLines} dòng test</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('solutions')}
            className={`w-full p-3.5 rounded-2xl flex items-center gap-3 transition-all text-left border cursor-pointer ${
              activeTab === 'solutions'
                ? "bg-white text-indigo-950 border-indigo-200 shadow-sm font-bold ring-1 ring-indigo-500/20"
                : "bg-white/60 text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-900"
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'solutions' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
              <FileCode2 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold">Lời giải mẫu ({problem.solutions.length})</div>
              <div className="text-[10px] text-slate-400 font-normal truncate">Mã nguồn C++ cho từng subtask</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          {(problem.checker || problem.interactive) && (
            <button
              type="button"
              onClick={() => setActiveTab('checker')}
              className={`w-full p-3.5 rounded-2xl flex items-center gap-3 transition-all text-left border cursor-pointer ${
                activeTab === 'checker'
                  ? "bg-white text-indigo-950 border-indigo-200 shadow-sm font-bold ring-1 ring-indigo-500/20"
                  : "bg-white/60 text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-900"
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'checker' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                <CheckSquare className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold">Trình chấm đặc biệt</div>
                <div className="text-[10px] text-slate-400 font-normal truncate">Checker & Interactor C++</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('analysis')}
            className={`w-full p-3.5 rounded-2xl flex items-center gap-3 transition-all text-left border cursor-pointer ${
              activeTab === 'analysis'
                ? "bg-white text-indigo-950 border-indigo-200 shadow-sm font-bold ring-1 ring-indigo-500/20"
                : "bg-white/60 text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-900"
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'analysis' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
              <Lightbulb className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold">Phân tích thuật toán</div>
              <div className="text-[10px] text-slate-400 font-normal truncate">Editorial & Hướng tiếp cận</div>
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
                  Đề bài chính thức
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

          {/* TAB 2: GENERATOR & SCRIPT */}
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

          {/* TAB 3: SOLUTIONS */}
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

          {/* TAB 4: CHECKER */}
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

          {/* TAB 5: ANALYSIS */}
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

