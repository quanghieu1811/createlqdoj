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
  Sparkles
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

BÊN TRONG FILE ZIP NÀY BAO GỒM:
1. statement.md: Đề bài lập trình định dạng Markdown chuẩn LQDOJ.
2. generator.cpp: Mã nguồn C++ sinh dữ liệu test ngẫu nhiên (đầu vào qua stdout, đáp án qua stderr).
3. script.txt: Script sinh test gồm 100 dòng tham số tương ứng với 100 testcases mạnh.
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

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="bg-slate-900 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-indigo-600 text-[10px] font-bold rounded-full uppercase tracking-wider">LQDOJ Setter</span>
            <span className="text-sm font-mono text-slate-400">★ Rating {problem.rating}</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight mt-1 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            {problem.title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Chủ đề chính: <span className="text-indigo-400 font-semibold">{problem.category}</span></p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopyStatement}
            className="flex-1 sm:flex-none py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
          >
            {copiedStatement ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Đã copy Đề bài</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Markdown</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownloadZip}
            className="flex-1 sm:flex-none py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/20 hover:shadow-indigo-900/40 cursor-pointer"
          >
            <FolderDown className="w-4 h-4" />
            <span>Tải trọn bộ ZIP</span>
          </button>
        </div>
      </div>

      {/* Main layout with Sidebar Tabs and Content Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: tabs */}
        <div className="lg:col-span-3 space-y-2">
          <button
            onClick={() => setActiveTab('statement')}
            className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all text-left border ${
              activeTab === 'statement'
                ? "bg-white text-indigo-950 border-slate-200 shadow-sm font-bold ring-2 ring-indigo-50/50"
                : "bg-slate-50/50 text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <BookOpen className={`w-5 h-5 ${activeTab === 'statement' ? "text-indigo-600" : "text-slate-400"}`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm">Đề bài (Markdown)</div>
              <div className="text-[10px] text-slate-400 font-normal truncate">Bản dịch LQDOJ chuẩn</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          <button
            onClick={() => setActiveTab('generator')}
            className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all text-left border ${
              activeTab === 'generator'
                ? "bg-white text-indigo-950 border-slate-200 shadow-sm font-bold ring-2 ring-indigo-50/50"
                : "bg-slate-50/50 text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Settings2 className={`w-5 h-5 ${activeTab === 'generator' ? "text-indigo-600" : "text-slate-400"}`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm">Bộ sinh Test (C++)</div>
              <div className="text-[10px] text-slate-400 font-normal truncate">Sử dụng testlib.h sinh ngẫu nhiên</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          <button
            onClick={() => setActiveTab('solutions')}
            className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all text-left border ${
              activeTab === 'solutions'
                ? "bg-white text-indigo-950 border-slate-200 shadow-sm font-bold ring-2 ring-indigo-50/50"
                : "bg-slate-50/50 text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <FileCode2 className={`w-5 h-5 ${activeTab === 'solutions' ? "text-indigo-600" : "text-slate-400"}`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm">Lời giải mẫu (Solutions)</div>
              <div className="text-[10px] text-slate-400 font-normal truncate">{problem.solutions.length} thuật toán mẫu khác nhau</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          {(problem.checker || problem.interactive) && (
            <button
              onClick={() => setActiveTab('checker')}
              className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all text-left border ${
                activeTab === 'checker'
                  ? "bg-white text-indigo-950 border-slate-200 shadow-sm font-bold ring-2 ring-indigo-50/50"
                  : "bg-slate-50/50 text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <CheckSquare className={`w-5 h-5 ${activeTab === 'checker' ? "text-indigo-600" : "text-slate-400"}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm">Trình chấm đặc biệt (C++)</div>
                <div className="text-[10px] text-slate-400 font-normal truncate">{problem.checker ? "Special Checker" : "Interactive Manager"}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
          )}

          <button
            onClick={() => setActiveTab('analysis')}
            className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all text-left border ${
              activeTab === 'analysis'
                ? "bg-white text-indigo-950 border-slate-200 shadow-sm font-bold ring-2 ring-indigo-50/50"
                : "bg-slate-50/50 text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Lightbulb className={`w-5 h-5 ${activeTab === 'analysis' ? "text-indigo-600" : "text-slate-400"}`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm">Phân tích thuật toán</div>
              <div className="text-[10px] text-slate-400 font-normal truncate">Ý tưởng giải bài & lời khuyên</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        </div>

        {/* Right column: content */}
        <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm min-h-[500px]">
          {activeTab === 'statement' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-lg font-bold text-slate-800">Đề bài (Định dạng hiển thị)</h3>
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-semibold">Cốt truyện đầy đủ</span>
              </div>
              <div className="prose max-w-none">
                <LqdojMarkdown content={problem.problemStatement} />
              </div>
            </div>
          )}

          {activeTab === 'generator' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Bộ sinh dữ liệu (testcase generator)</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Sử dụng chương trình C++ sinh dữ liệu và kịch bản sinh test (Script)</p>
                </div>
              </div>
              
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed space-y-1">
                <p className="font-bold">💡 Hướng dẫn sinh test tự động chuẩn:</p>
                <p>1. <strong>Chương trình generator.cpp:</strong> Nhận các tham số ràng buộc cộng thêm seed; in input ra <code>stdout</code> và output mong đợi ra <code>stderr</code>.</p>
                <p>2. Biên dịch generator.cpp bằng lệnh: <code>g++ -O3 generator.cpp -o generator</code></p>
                <p>3. <strong>Script sinh test (100 dòng):</strong> Mỗi dòng bên dưới là tham số truyền vào lệnh <code>./generator [arg_1] [arg_2] ... [seed]</code> để tự động sinh lần lượt 100 testcase mạnh khác nhau, tránh trùng lặp.</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-700">1. Mã nguồn generator.cpp</h4>
                <CodeBlock code={problem.testGenerator} filename="generator.cpp" />
              </div>

              {problem.generatorScript && (
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-700">2. Kịch bản sinh test (Script sinh test gồm 100 testcase)</h4>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">100 dòng test</span>
                  </div>
                  <p className="text-xs text-slate-500">Mỗi dòng là các tham số cho một testcase chạy với generator. Dòng cuối cùng là hạt giống (seed) thay đổi liên tục.</p>
                  <CodeBlock code={problem.generatorScript} filename="script.txt" />
                </div>
              )}
            </div>
          )}

          {activeTab === 'solutions' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Mã nguồn Lời giải (Solutions)</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Mã nguồn chuẩn tối ưu và duyệt trâu cho từng Subtask</p>
                </div>

                {/* Subtask selector */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                  {problem.solutions.map((sol, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSolutionIdx(idx)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        activeSolutionIdx === idx
                          ? "bg-white text-indigo-950 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {sol.subtask}
                    </button>
                  ))}
                </div>
              </div>

              {problem.solutions[activeSolutionIdx] && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <h4 className="text-sm font-bold text-indigo-950">{problem.solutions[activeSolutionIdx].subtask}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      <strong>Giải thuật:</strong> {problem.solutions[activeSolutionIdx].description}
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

          {activeTab === 'checker' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {problem.checker ? "Trình chấm đặc biệt (Special Checker)" : "Trình tương tác (Interactive Manager)"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {problem.checker 
                    ? "Dùng khi bài toán có nhiều đáp án hợp lệ khác nhau." 
                    : "Dùng để tương tác và hỏi đáp trực tiếp với chương trình học sinh."}
                </p>
              </div>

              {problem.checker && (
                <CodeBlock code={problem.checker} filename="checker.cpp" />
              )}

              {problem.interactive && (
                <CodeBlock code={problem.interactive} filename="interactive.cpp" />
              )}
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">Phân tích thuật toán & Editorial</h3>
                <p className="text-xs text-slate-400 mt-0.5">Phân tích kỹ lưỡng các hướng giải và tối ưu bộ nhớ/thời gian</p>
              </div>
              <div className="bg-slate-50/50 p-6 border border-slate-200 rounded-xl text-slate-700 leading-relaxed text-sm whitespace-pre-line font-medium">
                {problem.analysis}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Refinement Prompts Box (Iterative update) */}
      <div className="bg-indigo-50/30 border border-indigo-100/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-800 text-sm">Chỉnh sửa đề bài hoặc bộ test với AI (Gemma 4)</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Bạn chưa hài lòng với khía cạnh nào? Ví dụ: <em>"Hãy đổi tên nhân vật thành Tèo và Tý"</em>, <em>"Hãy tăng giới hạn của Subtask 2 lên $5 \cdot 10^5$"</em>, hoặc <em>"Sửa lại cốt truyện cho hài hước hơn"</em>. AI sẽ sửa đổi trực tiếp trên bản thiết kế hiện tại!
        </p>

        <form onSubmit={handleRefineSubmit} className="flex gap-2">
          <input
            type="text"
            value={refineFeedback}
            onChange={(e) => setRefineFeedback(e.target.value)}
            disabled={refining}
            placeholder={refining ? "Đang gửi phản hồi chỉnh sửa..." : "Gửi yêu cầu chỉnh sửa đề bài cho AI..."}
            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-all"
          />
          <button
            type="submit"
            disabled={!refineFeedback.trim() || refining}
            className={`px-5 py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer ${
              !refineFeedback.trim() || refining
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100"
            }`}
          >
            {refining ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Gửi yêu cầu</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
