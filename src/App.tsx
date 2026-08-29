import { useState, useEffect } from "react";
import { ProblemForm, MEMES_TOURNAMENT_CATEGORIES } from "./components/ProblemForm";
import { ProblemViewer } from "./components/ProblemViewer";
import { LQDOJProblem, GenerationRequest } from "./types";
import { Sparkles, Code2, ArrowLeft, Terminal, FileText, AlertTriangle } from "lucide-react";

const LOADING_STEPS = [
  "Gemma 4 31B IT đang phân tích yêu cầu...",
  "Đang xây dựng cốt truyện hấp dẫn và soạn thảo đề bài bằng Tiếng Việt...",
  "Đang thiết kế giới hạn dữ liệu & phân chia các Subtask chấm điểm...",
  "Đang lập trình mã nguồn sinh test ngẫu nhiên (generator.cpp) bằng C++ và testlib.h...",
  "Đang thiết kế thuật toán tối ưu (Full solution) và duyệt trâu (suboptimal solution)...",
  "Đang đóng gói toàn bộ bộ nhớ, checker và hoàn tất tài liệu phân tích..."
];

// Helper to extract detailed error messages from HTTP responses (handles JSON, HTML, or raw text)
async function parseHTTPError(response: Response, defaultMessage: string): Promise<string> {
  try {
    const text = await response.text();
    // Try to parse as JSON first
    try {
      const data = JSON.parse(text);
      if (data && data.error) {
        return data.error + (data.details ? `\nChi tiết: ${data.details}` : "");
      }
    } catch {
      // Not JSON, return raw text or a clean representation of the error page
    }
    
    if (text && text.trim().length > 0) {
      const cleanText = text.trim();
      if (cleanText.startsWith("<!DOCTYPE") || cleanText.startsWith("<html")) {
        const titleMatch = cleanText.match(/<title>(.*?)<\/title>/i);
        const h1Match = cleanText.match(/<h1>(.*?)<\/h1>/i);
        
        let details = "";
        if (titleMatch) details += `[Tiêu đề: ${titleMatch[1]}] `;
        if (h1Match) details += `[Lỗi: ${h1Match[1]}] `;
        
        return `${defaultMessage} (Mã lỗi ${response.status} ${response.statusText}).\nThông báo lỗi thô:\n${details || cleanText.slice(0, 350)}`;
      }
      return `${defaultMessage} (Mã lỗi ${response.status} ${response.statusText}).\nThông báo từ máy chủ:\n${cleanText}`;
    }
    return `${defaultMessage} (Mã lỗi ${response.status} ${response.statusText})`;
  } catch (err: any) {
    return `${defaultMessage} (Mã lỗi ${response.status} ${response.statusText}) - Không thể đọc nội dung lỗi: ${err.message}`;
  }
}

export default function App() {
  const [problem, setProblem] = useState<LQDOJProblem | null>(null);
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // API Key and model settings
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem("gemini_api_key") || "");
  const [model, setModel] = useState<string>(() => localStorage.getItem("gemini_model") || "gemini-flash-latest");

  useEffect(() => {
    localStorage.setItem("gemini_api_key", apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem("gemini_model", model);
  }, [model]);

  // Helper to build cohesive system instructions reflecting user guidelines and platform requirements
  const buildSystemInstruction = (rating: any, category: any, testCount: number = 100) => {
    const ratingStr = rating === "random" ? "tùy chọn ngẫu nhiên phù hợp từ 800 đến 3500 (hãy tự chọn độ khó thích hợp và ghi chính xác số này vào trường rating trong JSON)" : (rating || 1400);
    const categoryStr = category === "Random" ? "tùy chọn ngẫu nhiên chủ đề theo Thể lệ Memes Tournament 2026-2027 (Phụ lục 2: Giới hạn kiến thức THCS & THPT, ghi chính xác tên chủ đề vào trường category trong JSON)" : (category || "Quy hoạch động cơ bản");
    const count = testCount && testCount >= 5 && testCount <= 200 ? testCount : 100;
    return `Bạn đóng vai trò là "Gemma 4 31B IT" - Mô hình ngôn ngữ lớn chuyên gia thiết kế đề thi lập trình thi đấu (Problem Setter) kỳ cựu trên nền tảng LQDOJ (Lê Quý Đôn Online Judge) và Ban ra đề cuộc thi Memes Tournament năm học 2026 - 2027 (Fan Memes × CBRT Online Judge).
Nhiệm vụ của bạn là thiết kế một bài tập lập trình hoàn chỉnh, chuyên nghiệp và có độ chính xác khoa học tuyệt đối, nhắm tới độ khó rating ${ratingStr} và chủ đề "${categoryStr}".

QUY CHẾ VÀ GIỚI HẠN KIẾN THỨC MEMES TOURNAMENT 2026 - 2027 (PHỤ LỤC 2):
1. Khung kiến thức chủ đạo: Tương đương đề thi Học sinh Giỏi cấp Tỉnh/Thành phố dành cho THCS (gồm: Tìm kiếm nhị phân, Chặt nhị phân trên đáp án, Mảng cộng dồn, Mảng hiệu, Đệ quy - Quay lui, Vét cạn, Quy hoạch động cơ bản, Số học, Dãy số quy luật, Fibonacci, Hình học cơ bản, Hàm số).
2. Khung kiến thức THPT mở rộng (cho các bài khó / subtask phân loại): Stack, Queue, Deque, Priority Queue, BST, Cây phân đoạn (Segment Tree), Cây chỉ số nhị phân (Fenwick Tree / BIT), Đồ thị (DFS/BFS trên ma trận và đồ thị đơn giản), Chia để trị (QuickSort, MergeSort), Quy hoạch động nâng cao (LIS, Knapsack, QHĐ 2 chiều, tối ưu hóa), Hoán vị - Tổ hợp - Xếp hậu, Xử lý xâu (Palindrome, chuẩn hóa, đếm).

YÊU CẦU CRITICAL (BẮT BUỘC):
1. BÀI TẬP HOÀN TOÀN MỚI: Phải sáng tạo ra một bài tập hoàn toàn mới, độc lập, chưa từng xuất hiện ở bất cứ đâu.
2. KHÔNG ĐƯỢC VIẾT CỐT TRUYỆN NẾU KHÔNG CÓ YÊU CẦU BỔ SUNG:
   - Nếu trong gợi ý hoặc ý tưởng sơ lược ("briefIdea" hoặc "feedback") từ người dùng có yêu cầu viết cốt truyện/bối cảnh rõ ràng, bạn hãy thiết kế một cốt truyện sáng tạo.
   - Ngược lại, nếu người dùng KHÔNG yêu cầu gì về bối cảnh/cốt truyện, bạn tuyệt đối KHÔNG ĐƯỢC VIẾT CỐT TRUYỆN (không rùa thỏ, không Tèo Tí, không phiêu lưu, không cổ tích...). Đề bài phải được phát biểu trực tiếp dưới dạng toán học hoặc cấu trúc dữ liệu thô một cách rõ ràng, ngắn gọn và trực quan nhất.

YÊU CẦU CHI TIẾT CỦA CÁC THÀNH PHẦN:
1. ĐỀ BÀI (problemStatement):
- Viết hoàn toàn bằng Tiếng Việt.
- BẮT BUỘC KẾT QUẢ XUẤT RA PHẢI CHUẨN 100% ĐÚNG ĐỊNH DẠNG VÀ CẤU TRÚC SAU (không được đổi tên hay bỏ các mục tiêu đề ####):

[Phần mô tả đề bài chi tiết ở đây. Phát biểu rõ ràng và chính xác bài toán.]

#### Input
- [Mô tả định dạng dữ liệu đầu vào]
- [Các giới hạn và ràng buộc]

#### Output
- [Mô tả định dạng dữ liệu đầu ra]

#### Example

!!! question "Test 1"
    ???+ "Input"
        \`\`\`sample
        [dữ liệu đầu vào]
        \`\`\`
    ???+ success "Output"
        \`\`\`sample
        [dữ liệu đầu ra]
        \`\`\`
    ??? warning "Note"
        [Giải thích ví dụ nếu cần]

#### Scoring
- Subtask 1 (x điểm): $1 \\le n \\le 100$
- Subtask 2 (y điểm): $1 \\le n \\le 10^5$

- QUY TẮC BẮT BUỘC VỀ ĐỊNH DẠNG:
  + Dùng đúng 4 mục tiêu đề level 4: \`#### Input\`, \`#### Output\`, \`#### Example\`, \`#### Scoring\`.
  + Nếu thể loại bài là 'ioi' (IOI Signature / Cài đặt hàm):
    * Trong đề bài, nêu rõ: Thí sinh cài đặt hàm (tên hàm, các tham số đầu vào, kiểu dữ liệu trả về) cho cả C/C++ và Python thay vì nhập/xuất từ stdin/stdout.
    * Giải thích giao diện thư viện: C++ include header.h; Python được chấm qua file _submission.py.
    * Phần ví dụ mô tả rõ các giá trị truyền vào hàm và kết quả hàm trả về.
  + Các ví dụ testcase phải dùng đúng cấu trúc khối thông báo MkDocs Admonition (\`!!! question "Test 1"\`, \`???+ "Input"\`, \`???+ success "Output"\`, \`??? warning "Note"\`).
  + Khối mã mẫu phải kẹp trong \`\`\`sample.
  + Sử dụng ký hiệu Toán học bằng LaTeX (kẹp giữa dấu $) như $1 \\le N \\le 10^5$. Hãy chắc chắn dấu gạch chéo ngược được escape đúng trong JSON (dùng \\\\ thay vì \\).

2. TEST GENERATOR (testGenerator) VÀ SCRIPT (generatorScript):
- Viết mã nguồn C++ sinh test ngẫu nhiên hoàn chỉnh (generator.cpp). Chương trình nhận các tham số ràng buộc cộng thêm seed qua đối số dòng lệnh:
  ./generator [arg_1] [arg_2] ... [seed]
- KHÔNG CẦN THIẾT DÙNG THƯ VIỆN testlib.h mà hãy dùng C++ chuẩn thông thường (như mt19937, stoi, argv).
- ĐƯỢC PHÉP VÀ KHUYẾN KHÍCH sử dụng #pragma GCC optimize("O3,unroll-loops") và Fast I/O (ios_base::sync_with_stdio(false); cin.tie(NULL);) trong mã nguồn C++ generator để đảm bảo tốc độ sinh test tối ưu.
- Generator phải:
  - In dữ liệu đầu vào (input) ra stdout (cout).
  - In dữ liệu đầu ra mong đợi (lời giải/đáp án chuẩn) ra stderr (cerr).
- Bạn phải cung cấp kịch bản sinh test "generatorScript" gồm ĐÚNG ${count} dòng tương ứng với ${count} testcases mạnh khác nhau. Mỗi dòng chứa các tham số truyền vào lệnh ./generator, kết thúc bằng một seed thay đổi liên tục cho mỗi testcase (để tránh trùng lặp). Dải tham số trên ${count} dòng phải phân bố đều từ các giới hạn cực nhỏ (cho Subtask 1) đến giới hạn tối đa cực lớn (cho Subtask cuối).

3. CUSTOM CHECKER (checker) [C++]:
- Nếu đề bài thuộc thể loại 'checker' (nhiều đáp án đúng hoặc định dạng chấm điểm đặc biệt), bạn phải viết một chương trình checker hoàn chỉnh bằng C++ chạy dạng:
  ./main <input_file> <output_file> <ans_file>
  Trong đó, mã thoát:
  - 0 = AC (Chấp nhận bài làm)
  - 1 = WA (Sai đáp án)
  - 2 = PARTIAL (Điểm thành phần; khi đó hãy in tỷ lệ điểm trong dải [0,1] ra stderr).
  Mọi dữ liệu in ra stdout của checker sẽ được hiển thị làm feedback cho học sinh.
- Nếu không phải thể loại 'checker', hãy đặt trường này là null.

4. INTERACTIVE (interactive) [C++]:
- Nếu đề bài thuộc thể loại 'interactive' (tương tác trực tiếp), bạn phải viết một chương trình tương tác interactor hoàn chỉnh bằng C++ chạy dạng:
  ./main <input_file> <answer_file>
  Giao tiếp giữa bài làm và interactor thông qua stdin/stdout (nhớ flush).
  Mã thoát:
  - 0 = AC
  - 1 = WA
  - 2 = PARTIAL (in tỷ lệ điểm trong dải [0,1] ra stderr).
  Mọi dữ liệu ghi ra stderr sẽ được hiển thị làm feedback cho học sinh.
- Nếu không phải thể loại 'interactive', hãy đặt trường này là null.

5. IOI SIGNATURE (ioi):
- Nếu đề bài thuộc thể loại 'ioi' (Dạng bài nộp bằng hàm như IOI / Grader), bạn PHẢI cung cấp đầy đủ đối tượng 'ioi':
  + functionSignatureCpp: Khai báo hàm C++ (ví dụ: long long solve(long long n);)
  + functionSignaturePy: Khai báo hàm Python (ví dụ: def solve(n: int) -> int:)
  + headerH: File header (header.h) cho C/C++ có include guard (#ifndef _HEADER_INCLUDED...)
  + handlerCpp: File handler.cpp C++ đọc input từ stdin, gọi hàm của thí sinh, in output ra stdout
  + handlerPy: File handler.py Python import hàm từ _submission (ví dụ: from _submission import solve), đọc input, gọi hàm, in output ra stdout
  + contestantStubCpp: File stub.cpp mẫu khung code C++ cho thí sinh
  + contestantStubPy: File stub.py mẫu khung code Python cho thí sinh
- Nếu không phải thể loại 'ioi', hãy đặt trường này là null.

6. SOLUTIONS (solutions):
- BẮT BUỘC TUYỆT ĐỐI: Có bao nhiêu Subtask được định nghĩa trong Đề bài (problemStatement), bạn PHẢI viết đúng bấy nhiêu lời giải/giải thuật mẫu bằng C++ độc lập tương ứng vào mảng "solutions" này (Số lượng Subtask = Số lượng giải thuật trong mảng solutions).
- Đối với bài thể loại 'ioi', mã nguồn trong "solutions" PHẢI cài đặt hàm theo đúng chữ ký IOI Signature (không chứa hàm main).
- CẤM TUYỆT ĐỐI KHÔNG SỬ DỤNG #pragma (như #pragma GCC optimize, #pragma GCC target, v.v.) trong bất kỳ mã nguồn lời giải (solutions) nào. Lời giải mẫu phải tuân thủ chuẩn C++ thuần túy và độ phức tạp thuật toán (được phép dùng Fast I/O như ios_base::sync_with_stdio(false); cin.tie(NULL);).
- TUYỆT ĐỐI KHÔNG ĐƯỢC GỘP CHUNG các Subtask.
- Ví dụ, nếu Đề bài có 3 Subtask độc lập thì mảng "solutions" PHẢI chứa đúng 3 phần tử C++ hoàn chỉnh tương ứng với từng Subtask một.

7. PHÂN TÍCH (analysis):
- Viết phân tích/editorial chi tiết bằng tiếng Việt giải thích ý tưởng giải bài.`;
  };

  // Direct client-side streaming implementation to bypass server/Vercel timeouts
  const callGeminiStreamDirect = async (
    systemInstruction: string,
    userPrompt: string,
    clientModel: string,
    testCount: number = 100,
    onStepChange?: (step: number) => void
  ) => {
    // Resolve model name, stripping any leading 'models/' if input by user
    let officialModel = clientModel && clientModel.trim() ? clientModel.trim() : "gemini-flash-latest";
    if (officialModel.startsWith("models/")) {
      officialModel = officialModel.replace("models/", "");
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${officialModel}:streamGenerateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: userPrompt
              }
            ]
          }
        ],
        systemInstruction: {
          parts: [
            {
              text: systemInstruction
            }
          ]
        },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING", description: "Tiêu đề bài toán (Tiếng Việt)" },
              rating: { type: "INTEGER", description: "Độ khó / rating của bài tập (Nếu được yêu cầu ngẫu nhiên, hãy tự chọn một độ khó cụ thể từ 1000 đến 2800 và ghi vào đây)" },
              category: { type: "STRING", description: "Chủ đề chính của bài toán (Nếu được yêu cầu ngẫu nhiên, hãy tự chọn một chủ đề CP cụ thể như 'Quy hoạch động', 'Đồ thị',... và ghi vào đây)" },
              problemStatement: { 
                type: "STRING", 
                description: "Đề bài bằng tiếng Việt định dạng Markdown chuẩn 100% mẫu LQDOJ với các mục #### Input, #### Output, #### Example (với các thẻ MkDocs !!! question 'Test 1', ???+ 'Input', ???+ success 'Output', ??? warning 'Note'), và #### Scoring." 
              },
              testGenerator: { 
                type: "STRING", 
                description: "Mã nguồn C++ generator.cpp sinh dữ liệu testcase ngẫu nhiên tuân thủ: nhận tham số giới hạn và seed từ đối số dòng lệnh; in input ra stdout; in output mong đợi ra stderr. ĐƯỢC PHÉP dùng #pragma GCC optimize." 
              },
              generatorScript: { 
                type: "STRING", 
                description: `Script sinh test gồm đúng ${testCount} dòng tương ứng với ${testCount} testcases mạnh khác nhau. Mỗi dòng chứa các tham số truyền cho generator, cột cuối cùng là seed ngẫu nhiên thay đổi liên tục.` 
              },
              checker: { 
                type: "STRING", 
                description: "Mã nguồn C++ checker.cpp chạy dưới dạng ./main <input_file> <output_file> <ans_file> (nullable)" 
              },
              interactive: { 
                type: "STRING", 
                description: "Mã nguồn C++ interactive.cpp chạy dưới dạng ./main <input_file> <answer_file> (nullable)" 
              },
              ioi: {
                type: "OBJECT",
                description: "Cấu hình chấm bài theo dạng hàm (IOI Signature / Grader). BẮT BUỘC có khi problemType là 'ioi'. Nếu không phải 'ioi', đặt là null.",
                properties: {
                  functionSignatureCpp: { type: "STRING", description: "Khai báo hàm C++ (ví dụ: long long solve(long long n);)" },
                  functionSignaturePy: { type: "STRING", description: "Khai báo hàm Python (ví dụ: def solve(n: int) -> int:)" },
                  headerH: { type: "STRING", description: "File header.h hoàn chỉnh có include guard (#ifndef _HEADER_INCLUDED...)" },
                  handlerCpp: { type: "STRING", description: "File handler.cpp C++ đọc stdin, gọi hàm của thí sinh, in output ra stdout" },
                  handlerPy: { type: "STRING", description: "File handler.py Python import hàm từ _submission, đọc stdin, gọi hàm, in output ra stdout" },
                  contestantStubCpp: { type: "STRING", description: "Khung code stub.cpp C++ cho thí sinh tải về" },
                  contestantStubPy: { type: "STRING", description: "Khung code stub.py Python cho thí sinh tải về" }
                },
                required: ["functionSignatureCpp", "functionSignaturePy", "headerH", "handlerCpp", "handlerPy", "contestantStubCpp", "contestantStubPy"]
              },
              solutions: {
                type: "ARRAY",
                description: "Mảng chứa danh sách các lời giải thuật mẫu bằng C++. BẮT BUỘC số lượng phần tử trong mảng này phải trùng khớp hoàn toàn với số lượng Subtask có trong đề bài. Với bài 'ioi', cài đặt hàm tương ứng thay vì hàm main.",
                items: {
                  type: "OBJECT",
                  properties: {
                    subtask: { type: "STRING", description: "Tên subtask chính xác của riêng lời giải này (ví dụ: 'Subtask 1', 'Subtask 2', 'Subtask 3' hoặc 'Full Solution'). CẤM đặt tên gộp chung như 'Subtask 1 & 2'." },
                    description: { type: "STRING", description: "Mô tả giải thuật chi tiết cho riêng subtask này (ví dụ: Duyệt trâu O(N^2) cho Subtask 1)" },
                    code: { type: "STRING", description: "Mã nguồn C++ hoàn chỉnh và biên dịch được, giải quyết độc lập cho subtask này. TUYỆT ĐỐI CẤM SỬ DỤNG #pragma (như #pragma GCC optimize) trong lời giải!" }
                  },
                  required: ["subtask", "description", "code"]
                }
              },
              analysis: { 
                type: "STRING", 
                description: "Phân tích/editorial giải thuật chi tiết của bài tập để hỗ trợ người ra đề và học sinh." 
              }
            },
            required: ["title", "rating", "category", "problemStatement", "testGenerator", "generatorScript", "solutions", "analysis"]
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetail = "";
      try {
        const errJson = JSON.parse(errorText);
        errorDetail = errJson.error?.message || errorText;
      } catch {
        errorDetail = errorText;
      }
      throw new Error(`Lỗi kết nối trực tiếp đến Gemini API (${response.status} ${response.statusText}):\n${errorDetail}\n\nVui lòng kiểm tra lại API Key cá nhân của bạn.`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Trình duyệt không hỗ trợ nhận luồng dữ liệu thời gian thực (Streaming)");
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let accumulatedText = "";

    let braceCount = 0;
    let inString = false;
    let escape = false;
    let startIdx = -1;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      for (let i = 0; i < buffer.length; i++) {
        const char = buffer[i];
        if (escape) {
          escape = false;
          continue;
        }
        if (char === "\\") {
          escape = true;
          continue;
        }
        if (char === '"') {
          inString = !inString;
          continue;
        }
        if (!inString) {
          if (char === "{") {
            if (braceCount === 0) {
              startIdx = i;
            }
            braceCount++;
          } else if (char === "}") {
            braceCount--;
            if (braceCount === 0 && startIdx !== -1) {
              const objStr = buffer.slice(startIdx, i + 1);
              try {
                const obj = JSON.parse(objStr);
                const txt = obj.candidates?.[0]?.content?.parts?.[0]?.text;
                if (txt) {
                  accumulatedText += txt;
                  
                  // Update progress bar based on fields generated in stream
                  if (onStepChange) {
                    if (accumulatedText.includes('"analysis"')) {
                      onStepChange(5);
                    } else if (accumulatedText.includes('"solutions"')) {
                      onStepChange(4);
                    } else if (accumulatedText.includes('"testGenerator"')) {
                      onStepChange(3);
                    } else if (accumulatedText.includes('"problemStatement"')) {
                      onStepChange(2);
                    } else if (accumulatedText.includes('"title"')) {
                      onStepChange(1);
                    }
                  }
                }
              } catch (e) {
                // Ignore incomplete structures
              }
              buffer = buffer.slice(i + 1);
              i = -1; // restart search with remaining buffer
              startIdx = -1;
            }
          }
        }
      }
    }

    if (!accumulatedText.trim()) {
      throw new Error("Không nhận được phản hồi hợp lệ từ Gemini API.");
    }

    return accumulatedText;
  };

  const handleGenerate = async (request: GenerationRequest) => {
    if (!apiKey) {
      setError("Bạn phải nhập API Key trước khi sử dụng ứng dụng.");
      return;
    }
    setLoading(true);
    setError(null);
    setProblem(null);
    setCurrentStepIdx(0);
    try {
      const finalRating = request.rating === "random"
        ? (800 + Math.floor(Math.random() * 28) * 100)
        : request.rating;

      const fallbackCategories = MEMES_TOURNAMENT_CATEGORIES.flatMap(g => g.topics.map(t => t.name));

      const finalCategory = (request.category === "Random" || !request.category || request.category.toLowerCase().includes("ngẫu nhiên"))
        ? fallbackCategories[Math.floor(Math.random() * fallbackCategories.length)]
        : request.category;

      const finalTestCount = request.testCount && request.testCount >= 5 && request.testCount <= 200 ? request.testCount : 100;

      const systemInstruction = buildSystemInstruction(finalRating, finalCategory, finalTestCount);
      
      const userPrompt = `Hãy tạo một bài tập lập trình hoàn chỉnh mới với các thông số sau:
- Độ khó (Rating): ${finalRating}
- Chủ đề: ${finalCategory}
- Thể loại bài: ${request.problemType}
- Số lượng testcase sinh tự động: ${finalTestCount} testcases (kịch bản generatorScript bắt buộc gồm đúng ${finalTestCount} dòng tham số khác nhau)
${request.briefIdea ? `- Ý tưởng sơ lược hoặc gợi ý từ người dùng: ${request.briefIdea}` : "- Hãy tự sáng tạo ra một bài tập độc đáo, thú vị và phát biểu toán học trực tiếp (tuyệt đối không viết cốt truyện) phù hợp với rating và chủ đề này."}

Hãy trả về kết quả hoàn toàn dưới dạng JSON tuân thủ đúng cấu trúc schema yêu cầu.`;

      const accumulatedText = await callGeminiStreamDirect(
        systemInstruction,
        userPrompt,
        model,
        finalTestCount,
        (step) => {
          setCurrentStepIdx(step);
        }
      );

      // Parse final compiled JSON response
      const data = JSON.parse(accumulatedText);
      data.testCount = finalTestCount;
      setProblem(data);
    } catch (err: any) {
      console.error("Lỗi streaming trực tiếp:", err);
      setError(err.message || "Đã xảy ra lỗi không xác định. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async (feedback: string) => {
    if (!problem) return;
    if (!apiKey) {
      setError("Bạn phải nhập API Key trước khi sử dụng ứng dụng.");
      return;
    }
    setRefining(true);
    setError(null);
    try {
      const currentTestCount = problem.testCount || 100;
      const systemInstruction = buildSystemInstruction(problem.rating, problem.category, currentTestCount);
      const userPrompt = `Dưới đây là bài toán lập trình hiện tại đã được sinh ra:
Tiêu đề: ${problem.title}
Chủ đề: ${problem.category}
Rating: ${problem.rating}
Số lượng testcase (testCount): ${currentTestCount}

Mã nguồn sinh test (generator.cpp):
${problem.testGenerator}

Đề bài hiện tại (problemStatement):
${problem.problemStatement}

Hãy CHỈNH SỬA VÀ CẬP NHẬT bài toán này dựa trên phản hồi của người dùng sau:
"${feedback}"

LƯU Ý KHI CHỈNH SỬA:
- Giữ nguyên các phần không bị yêu cầu thay đổi để đảm bảo tính nhất quán.
- Kịch bản generatorScript vẫn phải giữ đúng ${currentTestCount} dòng testcase tương ứng.
- Nếu người dùng yêu cầu chỉnh sửa giới hạn, hãy cập nhật tương ứng ở cả Đề bài, Trình sinh test (generator.cpp) và phần Phân tích thuật toán.
- Đảm bảo mã nguồn C++ (giải thuật mẫu và trình sinh test) vẫn hoàn toàn chính xác và biên dịch được sau khi sửa đổi.
- Trả về đối tượng JSON đầy đủ sau khi đã sửa đổi.`;

      const accumulatedText = await callGeminiStreamDirect(
        systemInstruction,
        userPrompt,
        model,
        currentTestCount
      );

      const data = JSON.parse(accumulatedText);
      data.testCount = currentTestCount;
      setProblem(data);
    } catch (err: any) {
      console.error(err);
      setError(`Chỉnh sửa thất bại: ${err.message}`);
    } finally {
      setRefining(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg flex items-center gap-2">
                LQDOJ Problem Generator
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold border border-slate-200">
                  v1.2
                </span>
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">
                Công cụ soạn bài tập CP tự động • Powered by Gemma 4 31B IT
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://lqdoj.edu.vn"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 hidden sm:block"
            >
              Trang chủ LQDOJ ↗
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-900 animate-fade-in shadow-xs">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-red-800">Đã xảy ra sự cố</h4>
              <div className="mt-2 text-xs text-red-700 leading-relaxed whitespace-pre-wrap font-mono bg-red-100/40 p-3 rounded-lg border border-red-100 max-h-60 overflow-y-auto">
                {error}
              </div>
              <div className="mt-3 flex items-center gap-4">
                <button
                  onClick={() => setError(null)}
                  className="text-xs font-bold text-red-700 hover:text-red-950 underline cursor-pointer"
                >
                  Bỏ qua thông báo
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(error);
                  }}
                  className="text-xs font-bold text-red-700 hover:text-red-950 underline cursor-pointer"
                >
                  Sao chép chi tiết lỗi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-100 p-8 text-center space-y-8 shadow-xl my-12 animate-fade-in">
            {/* Spinning Indicator */}
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-50"></div>
              <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-extrabold text-slate-900">Đang chuẩn bị đề bài với AI</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Quá trình sinh đề bài lập trình thi đấu đầy đủ bao gồm soạn đề, thiết kế subtask và viết mã nguồn giải thuật hoàn chỉnh bằng C++. Việc này có thể mất từ 20 đến 40 giây.
              </p>
            </div>

            {/* Stepper progress display */}
            <div className="space-y-4 pt-4 border-t border-slate-50 text-left">
              <div className="flex justify-between items-center text-xs font-bold text-indigo-600">
                <span>TIẾN TRÌNH THIẾT KẾ</span>
                <span>{Math.round(((currentStepIdx + 1) / LOADING_STEPS.length) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${((currentStepIdx + 1) / LOADING_STEPS.length) * 100}%` }}
                ></div>
              </div>

              {/* Sub-steps visual checklist */}
              <div className="space-y-3 mt-4">
                {LOADING_STEPS.map((step, idx) => {
                  let stepStyle = "text-slate-400 text-xs flex items-start gap-2.5";
                  let Icon = FileText;

                  if (idx < currentStepIdx) {
                    stepStyle = "text-emerald-600 font-medium text-xs flex items-start gap-2.5";
                    Icon = Terminal;
                  } else if (idx === currentStepIdx) {
                    stepStyle = "text-indigo-900 font-bold text-xs flex items-start gap-2.5 animate-pulse";
                    Icon = Sparkles;
                  }

                  let stepText = step;
                  if (idx === 0) {
                    stepText = `Mô hình ${model} đang phân tích yêu cầu...`;
                  }

                  return (
                    <div key={idx} className={stepStyle}>
                      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{stepText}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* FRESH FORM STATE */}
        {!loading && !problem && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-4">
            {/* Left intro panel */}
            <div className="lg:col-span-4 space-y-6">
              <div className="space-y-4">
                <div className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full w-max border border-indigo-100">
                  LQDOJ Setter Hub
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  Tạo Đề Lập Trình Thi Đấu Chuẩn LQDOJ Trong Vài Giây
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Công cụ hỗ trợ giáo viên và admin tự động hóa quy trình soạn thảo đề bài, viết C++ test generator bằng testlib.h, xây dựng phân bố điểm subtask và viết mã nguồn lời giải một cách khoa học.
                </p>
              </div>

              {/* Bento Quick features */}
              <div className="space-y-3">
                <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-xs flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">LQDOJ Markdown</h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Sử dụng đúng cú pháp các khối admonition !!! question, ???+ Input để đề bài hiển thị hoàn hảo trên hệ thống LQDOJ.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-xs flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">C++ Test Generator</h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Sinh tự động generator.cpp sử dụng thư viện testlib.h, giúp sinh testcase chuẩn chỉnh không lo sai định dạng.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-xs flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Đa Thuật Toán Giải</h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Cung cấp cả code trâu suboptimal cho Subtask 1 và code tối ưu hoàn chỉnh cho full test, phục vụ làm lời giải mẫu.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right configuration panel */}
            <div className="lg:col-span-8">
              <ProblemForm
                onSubmit={handleGenerate}
                loading={loading}
                apiKey={apiKey}
                setApiKey={setApiKey}
                model={model}
                setModel={setModel}
              />
            </div>
          </div>
        )}

        {/* RENDER PROBLEM OUTPUT STATE */}
        {!loading && problem && (
          <div className="space-y-6">
            {/* Back button to form */}
            <button
              onClick={() => setProblem(null)}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer w-max"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Tạo đề bài mới</span>
            </button>

            {/* Problem panel */}
            <ProblemViewer 
              problem={problem} 
              onRefine={handleRefine} 
              refining={refining} 
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
          <p>© 2026 LQDOJ Problem Generator • Sản xuất bởi AI Coding Agent.</p>
          <div className="flex gap-4">
            <a href="https://lqdoj.edu.vn/docs/" target="_blank" rel="noreferrer" className="hover:text-indigo-600">
              LQDOJ Docs ↗
            </a>
            <span>•</span>
            <span className="text-indigo-600 font-bold">Gemma 4 31B IT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
