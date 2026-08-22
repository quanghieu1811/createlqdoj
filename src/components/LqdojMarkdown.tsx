import React from "react";
import { HelpCircle, FileInput, CheckCircle2, AlertTriangle, Info } from "lucide-react";

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

    // Math formulas: $formula$ -> <code>formula</code>
    // Let's make it look like beautiful math italic text
    html = html.replace(/\$([^$]+)\$/g, '<span class="font-serif italic text-blue-600 bg-blue-50/50 px-1 rounded">$1</span>');

    // Bold: **text** -> <strong>text</strong>
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');

    // Italic: *text* -> <em>text</em>
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

    // Inline code: `code` -> <code class="px-1.5 py-0.5 bg-gray-100 rounded text-red-600 font-mono text-sm">code</code>
    html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-gray-100 rounded text-pink-600 font-mono text-xs font-semibold">$1</code>');

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
        <div key={`admonition-${i}`} className="my-5 border-l-4 border-blue-500 bg-blue-50/30 rounded-r-lg overflow-hidden shadow-xs">
          <div className="flex items-center gap-2 bg-blue-500/10 px-4 py-2.5 text-blue-800 font-semibold border-b border-blue-100">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <span>{title}</span>
          </div>
          <div className="p-4 space-y-4">
            {renderNestedAdmonitions(nestedLines)}
          </div>
        </div>
      );
      continue;
    }

    // Headers
    if (line.startsWith("####")) {
      renderedElements.push(
        <h4 key={`h4-${i}`} className="text-lg font-bold text-gray-800 mt-6 mb-3 border-b border-gray-100 pb-1 flex items-center">
          {parseInlineMarkdown(line.substring(4).trim())}
        </h4>
      );
      i++;
      continue;
    }
    if (line.startsWith("###")) {
      renderedElements.push(
        <h3 key={`h3-${i}`} className="text-xl font-bold text-gray-900 mt-8 mb-4 border-b border-gray-200 pb-1.5">
          {parseInlineMarkdown(line.substring(3).trim())}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith("##")) {
      renderedElements.push(
        <h2 key={`h2-${i}`} className="text-2xl font-bold text-gray-900 mt-10 mb-4">
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
        <pre key={`code-${i}`} className="bg-gray-950 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto my-4 border border-gray-800 shadow-inner">
          {lang && <div className="text-xs text-gray-400 mb-2 border-b border-gray-800 pb-1 uppercase font-semibold">{lang}</div>}
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    // List items
    if (line.trim().startsWith("- ")) {
      renderedElements.push(
        <li key={`li-${i}`} className="ml-6 list-disc text-gray-700 my-1">
          {parseInlineMarkdown(line.trim().substring(2))}
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
      <p key={`p-${i}`} className="text-gray-700 leading-relaxed my-2">
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
        // Strip the leading and trailing ```
        const firstLineBreak = contentStr.indexOf("\n");
        const lastTicks = contentStr.lastIndexOf("```");
        codeContent = contentStr.substring(firstLineBreak + 1, lastTicks).trim();
      }

      // Determine style based on title / type
      let borderColor = "border-gray-300";
      let bgColor = "bg-gray-50/50";
      let headerBg = "bg-gray-100";
      let textColor = "text-gray-800";
      let Icon = Info;

      if (title.toLowerCase() === "input") {
        borderColor = "border-slate-400";
        bgColor = "bg-slate-50/50";
        headerBg = "bg-slate-100";
        textColor = "text-slate-800";
        Icon = FileInput;
      } else if (title.toLowerCase() === "output" || type === "success") {
        borderColor = "border-emerald-500";
        bgColor = "bg-emerald-50/30";
        headerBg = "bg-emerald-50";
        textColor = "text-emerald-900";
        Icon = CheckCircle2;
      } else if (title.toLowerCase() === "note" || type === "warning") {
        borderColor = "border-amber-500";
        bgColor = "bg-amber-50/30";
        headerBg = "bg-amber-50";
        textColor = "text-amber-900";
        Icon = AlertTriangle;
      }

      elements.push(
        <div key={`sub-${i}`} className={`border ${borderColor} ${bgColor} rounded-md overflow-hidden shadow-xs my-3`}>
          <div className={`flex items-center gap-1.5 ${headerBg} px-3 py-1.5 text-xs font-semibold ${textColor} border-b ${borderColor}/20`}>
            <Icon className="w-4 h-4" />
            <span>{title}</span>
          </div>
          <div className="p-3">
            {isCodeBlock ? (
              <pre className="font-mono text-sm bg-gray-950 text-gray-100 p-2.5 rounded-md overflow-x-auto shadow-inner">
                <code>{codeContent}</code>
              </pre>
            ) : (
              <p className="text-sm text-gray-700">{contentStr}</p>
            )}
          </div>
        </div>
      );
      continue;
    }

    if (line.trim() !== "") {
      elements.push(
        <p key={`nested-p-${i}`} className="text-sm text-gray-600">
          {line}
        </p>
      );
    }
    i++;
  }

  return <div className="space-y-1">{elements}</div>;
};
