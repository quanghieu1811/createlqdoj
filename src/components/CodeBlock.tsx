import React, { useState } from "react";
import { Check, Copy, Download, Code2, WrapText, CheckCheck } from "lucide-react";

interface CodeBlockProps {
  code: string;
  filename: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, filename, language = "cpp" }) => {
  const [copied, setCopied] = useState(false);
  const [wrapLines, setWrapLines] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const lines = code ? code.split("\n") : [];
  const lineCount = lines.length;

  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 shadow-lg text-slate-200">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-mono font-bold text-slate-200">{filename}</span>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
              {lineCount} dòng
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setWrapLines(!wrapLines)}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
              wrapLines 
                ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40" 
                : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Tự động xuống dòng"
          >
            <WrapText className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden sm:inline">Wrap</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
              copied 
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" 
                : "bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
            }`}
            title="Sao chép toàn bộ mã nguồn"
          >
            {copied ? (
              <>
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold text-[11px]">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px]">Sao chép</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all flex items-center gap-1 text-xs font-medium border border-slate-700 cursor-pointer"
            title="Tải file về máy"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] hidden md:inline">Tải về</span>
          </button>
        </div>
      </div>

      {/* Code Body with Line Numbers */}
      <div className="overflow-x-auto max-h-[520px] bg-slate-950/95">
        <div className={`p-4 font-mono text-xs leading-6 flex gap-4 ${wrapLines ? "whitespace-pre-wrap" : "whitespace-pre"}`}>
          {/* Line Numbers Column */}
          <div className="select-none text-right text-slate-600 shrink-0 font-mono text-[11px] pr-3 border-r border-slate-800/70">
            {lines.map((_, idx) => (
              <div key={idx} className="leading-6">
                {idx + 1}
              </div>
            ))}
          </div>

          {/* Actual Code content */}
          <pre className="flex-1 text-slate-200 antialiased font-mono text-xs overflow-x-auto focus:outline-none">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
