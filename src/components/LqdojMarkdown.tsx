import React from "react";
import { HelpCircle, FileInput, CheckCircle2, AlertTriangle, Info, Terminal, Award } from "lucide-react";

interface LqdojMarkdownProps {
  content: string;
}

export const LqdojMarkdown: React.FC<LqdojMarkdownProps> = ({ content }) => {
  if (!content) return null;

  // Render mathematical formulas and basic markdown syntax (bold, lists, headers, inline code)
  const parseInlineMarkdown = (text: string): React.ReactNode[] => {
    // Escape standard HTML characters
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Math formulas: $formula$ -> styled math span
    html = html.replace(
      /\$([^$]+)\$/g,
      '<span class="font-serif italic font-medium text-indigo-700 bg-indigo-50/70 border border-indigo-100/80 px-1.5 py-0.5 rounded text-[13px] mx-0.5 tracking-wide">$1</span>'
    );

    // Bold: **text** -> strong
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');

    // Italic: *text* -> em
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-700">$1</em>');

    // Inline code: `code`
    html = html.replace(
      /`([^`]+)`/g,
      '<code class="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-rose-600 font-mono text-xs font-semibold">$1</code>'
    );

    return [<span key={text} dangerouslySetInnerHTML={{ __html: html }} />];
  };

  // Parse lines to detect admonitions (!!! and ??? blocks)
  const lines = content.split("\n");
  const renderedElements: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Check for MkDocs Admonitions: !!! question "Title"
    const admonitionMatch = line.match(/^!!!\s+(\w+)\s+"([^"]+)"/);
    if (admonitionMatch) {
      const type = admonitionMatch[1]; // e.g. question, info, warning
      const title = admonitionMatch[2]; // e.g. Test 1

      // Parse nested block
      const nestedLines: string[] = [];
      i++;
      while (i < lines.length && (lines[i].startsWith("    ") || lines[i].trim() === "")) {
        // Strip the 4 leading spaces of the nested block
        nestedLines.push(lines[i].startsWith("    ") ? lines[i].substring(4) : lines[i]);
        i++;
      }

      renderedElements.push(
        <div key={`admonition-${i}`} className="my-6 border border-indigo-200/90 bg-indigo-50/30 rounded-2xl overflow-hidden shadow-xs">
          <div className="flex items-center justify-between bg-indigo-600/10 px-4 py-3 text-indigo-950 font-bold border-b border-indigo-200/80">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-indigo-600 text-white rounded-lg">
                <HelpCircle className="w-4 h-4" />
              </span>
              <span className="text-sm">{title}</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
              Testcase mẫu
            </span>
          </div>
          <div className="p-4 sm:p-5 space-y-4">
            {renderNestedAdmonitions(nestedLines)}
          </div>
        </div>
      );
      continue;
    }

    // Headers
    if (line.startsWith("####")) {
      const headerText = line.substring(4).trim();
      const isScoring = headerText.toLowerCase().includes("scoring") || headerText.toLowerCase().includes("chấm điểm");
      const isExample = headerText.toLowerCase().includes("example") || headerText.toLowerCase().includes("ví dụ");
      const isInput = headerText.toLowerCase().includes("input");
      const isOutput = headerText.toLowerCase().includes("output");

      renderedElements.push(
        <div key={`h4-${i}`} className="mt-8 mb-3 pt-3 border-t border-slate-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
          <h4 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            {parseInlineMarkdown(headerText)}
            {isScoring && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                <Award className="w-3 h-3" /> Subtasks
              </span>
            )}
            {isExample && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Sample
              </span>
            )}
            {isInput && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Đầu vào
              </span>
            )}
            {isOutput && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Đầu ra
              </span>
            )}
          </h4>
        </div>
      );
      i++;
      continue;
    }
    if (line.startsWith("###")) {
      renderedElements.push(
        <h3 key={`h3-${i}`} className="text-lg font-bold text-slate-900 mt-8 mb-3 border-b border-slate-200 pb-1.5 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-md bg-indigo-600"></span>
          {parseInlineMarkdown(line.substring(3).trim())}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith("##")) {
      renderedElements.push(
        <h2 key={`h2-${i}`} className="text-xl font-extrabold text-slate-900 mt-8 mb-4">
          {parseInlineMarkdown(line.substring(2).trim())}
        </h2>
      );
      i++;
      continue;
    }

    // Code block outside admonition
    if (line.startsWith("```")) {
      const lang = line.substring(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // Skip closing ```
      renderedElements.push(
        <div key={`code-${i}`} className="my-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md">
          {lang && (
            <div className="text-[11px] font-mono text-slate-400 bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
              <span className="uppercase font-bold">{lang}</span>
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
            </div>
          )}
          <pre className="p-4 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
            <code>{codeLines.join("\n")}</code>
          </pre>
        </div>
      );
      continue;
    }

    // List items
    if (line.trim().startsWith("- ")) {
      const itemContent = line.trim().substring(2);
      const isSubtask = itemContent.toLowerCase().includes("subtask");
      renderedElements.push(
        <li 
          key={`li-${i}`} 
          className={`ml-4 list-none my-2 text-slate-700 leading-relaxed text-sm flex items-start gap-2.5 ${
            isSubtask ? "p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 font-medium" : ""
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${isSubtask ? "bg-indigo-600" : "bg-slate-400"}`}></span>
          <div className="flex-1 min-w-0">
            {parseInlineMarkdown(itemContent)}
          </div>
        </li>
      );
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      renderedElements.push(<div key={`empty-${i}`} className="h-2" />);
      i++;
      continue;
    }

    // Plain text paragraph
    renderedElements.push(
      <p key={`p-${i}`} className="text-slate-700 leading-relaxed my-2.5 text-sm sm:text-base font-normal">
        {parseInlineMarkdown(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-1">{renderedElements}</div>;
};

// Render inner admonitions (Input, Output, Note) which are nested inside the question block
const renderNestedAdmonitions = (lines: string[]): React.ReactNode => {
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Check for nested sub-admonitions: ???+ "Input" or ???+ success "Output" or ??? warning "Note"
    const subMatch = line.match(/^\?\?\?\+?\s*(\w+)?\s*"([^"]+)"/);
    if (subMatch) {
      const type = subMatch[1] || ""; // e.g. success, warning, or blank
      const title = subMatch[2]; // e.g. Input, Output, Note

      const nestedLines: string[] = [];
      i++;
      while (i < lines.length && (lines[i].startsWith("    ") || lines[i].trim() === "")) {
        nestedLines.push(lines[i].startsWith("    ") ? lines[i].substring(4) : lines[i]);
        i++;
      }

      // Check if content is code block
      const contentStr = nestedLines.join("\n").trim();
      let isCodeBlock = false;
      let codeContent = contentStr;
      if (contentStr.startsWith("```")) {
        isCodeBlock = true;
        const firstLineBreak = contentStr.indexOf("\n");
        const lastTicks = contentStr.lastIndexOf("```");
        codeContent = contentStr.substring(firstLineBreak + 1, lastTicks).trim();
      }

      // Determine style based on title / type
      let borderColor = "border-slate-200";
      let bgColor = "bg-white";
      let headerBg = "bg-slate-50";
      let textColor = "text-slate-800";
      let Icon = Info;

      if (title.toLowerCase() === "input") {
        borderColor = "border-slate-300";
        bgColor = "bg-white";
        headerBg = "bg-slate-100";
        textColor = "text-slate-800";
        Icon = FileInput;
      } else if (title.toLowerCase() === "output" || type === "success") {
        borderColor = "border-emerald-200";
        bgColor = "bg-emerald-50/20";
        headerBg = "bg-emerald-50";
        textColor = "text-emerald-900";
        Icon = CheckCircle2;
      } else if (title.toLowerCase() === "note" || type === "warning") {
        borderColor = "border-amber-200";
        bgColor = "bg-amber-50/20";
        headerBg = "bg-amber-50";
        textColor = "text-amber-900";
        Icon = AlertTriangle;
      }

      elements.push(
        <div key={`sub-${i}`} className={`border ${borderColor} ${bgColor} rounded-xl overflow-hidden shadow-xs my-3`}>
          <div className={`flex items-center gap-2 ${headerBg} px-3.5 py-2 text-xs font-bold ${textColor} border-b ${borderColor}`}>
            <Icon className="w-3.5 h-3.5" />
            <span>{title}</span>
          </div>
          <div className="p-3">
            {isCodeBlock ? (
              <pre className="font-mono text-xs bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto shadow-inner leading-5">
                <code>{codeContent}</code>
              </pre>
            ) : (
              <p className="text-xs text-slate-700 leading-relaxed">{contentStr}</p>
            )}
          </div>
        </div>
      );
      continue;
    }

    if (line.trim() !== "") {
      elements.push(
        <p key={`nested-p-${i}`} className="text-xs text-slate-600 leading-relaxed">
          {line}
        </p>
      );
    }
    i++;
  }

  return <div className="space-y-1">{elements}</div>;
};

