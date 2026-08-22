import React, { useState } from "react";
import { Check, Copy, Download } from "lucide-react";

interface CodeBlockProps {
  code: string;
  filename: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, filename, language = "cpp" }) => {
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-900 shadow-md">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-slate-300">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 block"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 block"></span>
            <span className="w-3 h-3 rounded-full bg-green-500/80 block"></span>
          </div>
          <span className="text-xs font-mono text-slate-400 font-semibold ml-2">{filename}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-all flex items-center gap-1 text-xs font-medium"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-all flex items-center gap-1 text-xs font-medium"
            title="Download file"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div className="overflow-x-auto max-h-[500px]">
        <pre className="p-4 font-mono text-sm leading-relaxed text-slate-100 bg-slate-900 overflow-y-auto antialiased">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
