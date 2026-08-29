import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Helper to resolve client-specified model to official API model
const resolveModel = (clientModel?: string) => {
  if (!clientModel || !clientModel.trim()) {
    return "gemini-flash-latest"; // Default
  }
  const clean = clientModel.trim();
  // Strip 'models/' prefix if provided
  return clean.startsWith("models/") ? clean.replace("models/", "") : clean;
};

// Helper to build cohesive system instructions reflecting user guidelines and platform requirements
const buildSystemInstruction = (rating: any, category: any, testCount: number = 100) => {
  const count = testCount && testCount >= 5 && testCount <= 200 ? testCount : 100;
  return `Bạn đóng vai trò là một "Gemma 4 31B IT" - Mô hình ngôn ngữ lớn chuyên gia thiết kế đề thi lập trình thi đấu (Problem Setter) kỳ cựu trên nền tảng LQDOJ (Lê Quý Đôn Online Judge).
Nhiệm vụ của bạn là thiết kế một bài tập lập trình hoàn chỉnh, chuyên nghiệp và có độ chính xác khoa học tuyệt đối, nhắm tới độ khó rating ${rating || 1400} và chủ đề "${category || "Dynamic Programming"}".

YÊU CẦU CRITICAL (BẮT BUỘC):
1. BÀI TẬP HOÀN TOÀN MỚI: Phải sáng tạo ra một bài tập hoàn toàn mới, độc lập, chưa từng xuất hiện ở bất cứ đâu.
2. KHÔNG ĐƯỢC VIẾT CỐT TRUYỆN NẾU KHÔNG CÓ YÊU CẦU BỔ SUNG:
   - Nếu trong gợi ý hoặc ý tưởng sơ lược ("briefIdea" hoặc "feedback") từ người dùng có yêu cầu viết cốt truyện/bối cảnh rõ ràng, bạn hãy thiết kế một cốt truyện sáng tạo.
   - Ngược lại, nếu người dùng KHÔNG yêu cầu gì về bối cảnh/cốt truyện, bạn tuyệt đối KHÔNG ĐƯỢC VIẾT CỐT TRUYỆN (không rùa thỏ, không Tèo Tí, không phiêu lưu, không cổ tích...). Đề bài phải được phát biểu trực tiếp dưới dạng toán học hoặc cấu trúc dữ liệu thô một cách rõ ràng, ngắn gọn và trực quan nhất.

YÊU CẦU CHI TIẾT CỦA CÁC THÀNH PHẦN:
1. ĐỀ BÀI (problemStatement):
- Viết hoàn toàn bằng Tiếng Việt.
- Định dạng Markdown chuẩn của LQDOJ. Chú ý sử dụng các khối thông báo kiểu MkDocs (Admonition) cho phần Ví dụ:
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
            [Giải thích nếu cần]
- Nếu bài thuộc thể loại 'ioi' (IOI Signature / Cài đặt hàm):
  + Trong đề bài, hãy nêu rõ: Thí sinh cần cài đặt hàm (tên hàm, tham số, kiểu trả về) thay vì đọc/ghi luồng chuẩn.
  + Trình bày rõ ràng giao diện hàm cho cả C/C++ và Python.
  + Trong phần Ví dụ, mô tả chi tiết các lời gọi hàm mẫu và giá trị trả về.
- Phần Scoring (Chấm điểm) phải chia thành các Subtask rõ ràng phù hợp với độ khó và phân bố điểm.
- Sử dụng ký hiệu Toán học bằng LaTeX (kẹp giữa dấu $) như $1 \\le N \\le 10^5$. Hãy chắc chắn dấu gạch chéo ngược được escape đúng trong JSON (dùng \\\\ thay vì \\).

2. TEST GENERATOR (testGenerator) VÀ SCRIPT (generatorScript):
- Viết mã nguồn C++ sinh test ngẫu nhiên hoàn chỉnh (generator.cpp). Chương trình nhận các tham số ràng buộc cộng thêm seed qua đối số dòng lệnh:
  ./generator [arg_1] [arg_2] ... [seed]
- KHÔNG CẦN THIẾT DÙNG THƯ VIỆN testlib.h mà hãy dùng C++ chuẩn thông thường (như mt19937, stoi, argv).
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
- BẮT BUỘC: Có bao nhiêu Subtask được định nghĩa trong Đề bài, bạn PHẢI viết đúng bấy nhiêu lời giải/giải thuật mẫu độc lập tương ứng vào mảng "solutions".
- Với bài dạng 'ioi', mã nguồn trong "solutions" PHẢI cài đặt hàm theo đúng chữ ký IOI Signature (không chứa hàm main).
- Với bài dạng thông thường, mã nguồn C++ có hàm main() hoàn chỉnh.
- CẤM TUYỆT ĐỐI KHÔNG SỬ DỤNG #pragma trong bất kỳ mã nguồn lời giải nào.

7. PHÂN TÍCH (analysis):
- Viết phân tích/editorial chi tiết bằng tiếng Việt giải thích ý tưởng giải bài.`;
};

// API endpoint to generate or refine LQDOJ problem
app.post("/api/generate", async (req, res) => {
  try {
    const { rating, category, briefIdea, problemType, previousProblem, feedback, apiKey, model, testCount } = req.body;
    const keyHeader = req.headers["x-gemini-api-key"] as string;
    const selectedModelHeader = req.headers["x-selected-model"] as string;

    const resolvedKey = keyHeader || apiKey || process.env.GEMINI_API_KEY;
    if (!resolvedKey) {
      return res.status(400).json({ error: "Không tìm thấy API Key. Vui lòng cung cấp Gemini API Key." });
    }

    const finalTestCount = testCount && testCount >= 5 && testCount <= 200 ? testCount : 100;

    const ai = new GoogleGenAI({
      apiKey: resolvedKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const targetModel = resolveModel(selectedModelHeader || model);
    const systemInstruction = buildSystemInstruction(rating, category, finalTestCount);

    let userPrompt = "";

    if (previousProblem && feedback) {
      // Refinement mode
      userPrompt = `Dưới đây là bài toán lập trình hiện tại đã được sinh ra:
Tiêu đề: ${previousProblem.title}
Chủ đề: ${previousProblem.category}
Rating: ${previousProblem.rating}

Mã nguồn sinh test (generator.cpp):
${previousProblem.testGenerator}

Đề bài hiện tại (problemStatement):
${previousProblem.problemStatement}

Hãy CHỈNH SỬA VÀ CẬP NHẬT bài toán này dựa trên phản hồi của người dùng sau:
"${feedback}"

LƯU Ý KHI CHỈNH SỬA:
- Giữ nguyên các phần không bị yêu cầu thay đổi để đảm bảo tính nhất quán.
- Kịch bản generatorScript gồm đúng ${finalTestCount} dòng testcase tương ứng.
- Nếu người dùng yêu cầu chỉnh sửa giới hạn, hãy cập nhật tương ứng ở cả Đề bài, Trình sinh test (generator.cpp) và phần Phân tích thuật toán.
- Đảm bảo mã nguồn C++ (giải thuật mẫu và trình sinh test) vẫn hoàn toàn chính xác và biên dịch được sau khi sửa đổi.
- Trả về đối tượng JSON đầy đủ sau khi đã sửa đổi.`;
    } else {
      // Fresh generation mode
      if (!rating || !category) {
        return res.status(400).json({ error: "Thiếu thông tin rating hoặc category" });
      }
      userPrompt = `Hãy tạo một bài tập lập trình hoàn chỉnh mới với các thông số sau:
- Độ khó (Rating): ${rating}
- Chủ đề: ${category}
- Thể loại bài: ${problemType}
- Số lượng testcase sinh tự động: ${finalTestCount} testcases (kịch bản generatorScript gồm đúng ${finalTestCount} dòng tham số)
${briefIdea ? `- Ý tưởng sơ lược hoặc gợi ý từ người dùng: ${briefIdea}` : "- Hãy tự sáng tạo ra một bài tập độc đáo, thú vị và phát biểu toán học trực tiếp (tuyệt đối không viết cốt truyện) phù hợp với rating và chủ đề này."}

Hãy trả về kết quả hoàn toàn dưới dạng JSON tuân thủ đúng cấu trúc schema yêu cầu.`;
    }

    // We use gemini-3.1-pro-preview or gemini-2.5-pro because it requires complex reasoning, math, and code generation.
    let response;
    const modelConfig = {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Tiêu đề bài toán (Tiếng Việt)" },
          rating: { type: Type.INTEGER, description: "Độ khó / rating của bài tập" },
          category: { type: Type.STRING, description: "Chủ đề chính của bài toán" },
          problemStatement: { 
            type: Type.STRING, 
            description: "Đề bài bằng tiếng Việt định dạng Markdown theo mẫu LQDOJ (bao gồm các thẻ !!! question, ???+ Input, v.v.)" 
          },
          testGenerator: { 
            type: Type.STRING, 
            description: "Mã nguồn C++ generator.cpp sinh dữ liệu testcase ngẫu nhiên tuân thủ: nhận tham số giới hạn và seed từ đối số dòng lệnh; in input ra stdout; in output mong đợi ra stderr." 
          },
          generatorScript: { 
            type: Type.STRING, 
            description: `Script sinh test gồm đúng ${finalTestCount} dòng tương ứng với ${finalTestCount} testcases mạnh khác nhau. Mỗi dòng chứa các tham số truyền cho generator, cột cuối cùng là seed ngẫu nhiên thay đổi liên tục.` 
          },
          checker: { 
            type: Type.STRING, 
            description: "Mã nguồn C++ checker.cpp chạy dưới dạng ./main <input_file> <output_file> <ans_file> (nullable)" 
          },
          interactive: { 
            type: Type.STRING, 
            description: "Mã nguồn C++ interactive.cpp chạy dưới dạng ./main <input_file> <answer_file> (nullable)" 
          },
          ioi: {
            type: Type.OBJECT,
            description: "Cấu hình chấm bài theo dạng hàm (IOI Signature / Grader). BẮT BUỘC có khi problemType là 'ioi'. Nếu không phải 'ioi', đặt là null.",
            properties: {
              functionSignatureCpp: { type: Type.STRING, description: "Khai báo hàm C++ (ví dụ: long long solve(long long n);)" },
              functionSignaturePy: { type: Type.STRING, description: "Khai báo hàm Python (ví dụ: def solve(n: int) -> int:)" },
              headerH: { type: Type.STRING, description: "File header.h hoàn chỉnh có include guard (#ifndef _HEADER_INCLUDED...)" },
              handlerCpp: { type: Type.STRING, description: "File handler.cpp C++ đọc stdin, gọi hàm của thí sinh, in output ra stdout" },
              handlerPy: { type: Type.STRING, description: "File handler.py Python import hàm từ _submission, đọc stdin, gọi hàm, in output ra stdout" },
              contestantStubCpp: { type: Type.STRING, description: "Khung code stub.cpp C++ cho thí sinh tải về" },
              contestantStubPy: { type: Type.STRING, description: "Khung code stub.py Python cho thí sinh tải về" }
            },
            required: ["functionSignatureCpp", "functionSignaturePy", "headerH", "handlerCpp", "handlerPy", "contestantStubCpp", "contestantStubPy"]
          },
          solutions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                subtask: { type: Type.STRING, description: "Tên subtask (ví dụ: Subtask 1, Subtask 2, Full Solution)" },
                description: { type: Type.STRING, description: "Mô tả giải thuật cho subtask này (ví dụ: Duyệt trâu O(N^2))" },
                code: { type: Type.STRING, description: "Mã nguồn C++ hoàn chỉnh giải quyết subtask này" }
              },
              required: ["subtask", "description", "code"]
            }
          },
          analysis: { 
            type: Type.STRING, 
            description: "Phân tích/editorial giải thuật chi tiết của bài tập để hỗ trợ người ra đề và học sinh." 
          }
        },
        required: ["title", "rating", "category", "problemStatement", "testGenerator", "generatorScript", "solutions", "analysis"]
      }
    };

    try {
      response = await ai.models.generateContent({
        model: targetModel,
        contents: userPrompt,
        config: modelConfig
      });
    } catch (modelError: any) {
      console.warn(`Không thể dùng model ${targetModel}, chuyển sang gemini-flash-latest:`, modelError.message);
      response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: userPrompt,
        config: modelConfig
      });
    }

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Không nhận được dữ liệu phản hồi từ AI");
    }

    const parsedData = JSON.parse(resultText);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Lỗi khi sinh đề bài:", error);
    res.status(500).json({ 
      error: "Đã xảy ra lỗi trong quá trình sinh đề bài bằng AI. Vui lòng thử lại.",
      details: error.message 
    });
  }
});

// Real-time streaming API for LQDOJ problem generation
app.post("/api/generate-stream", async (req, res) => {
  // Set headers for streaming response
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const { rating, category, briefIdea, problemType, apiKey, model } = req.body;
    const keyHeader = req.headers["x-gemini-api-key"] as string;
    const selectedModelHeader = req.headers["x-selected-model"] as string;

    const resolvedKey = keyHeader || apiKey || process.env.GEMINI_API_KEY;
    if (!resolvedKey) {
      res.write(JSON.stringify({ error: "Không tìm thấy API Key. Vui lòng cung cấp Gemini API Key." }));
      return res.end();
    }

    if (!rating || !category) {
      res.write(JSON.stringify({ error: "Thiếu thông tin rating hoặc category" }));
      return res.end();
    }

    const ai = new GoogleGenAI({
      apiKey: resolvedKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const targetModel = resolveModel(selectedModelHeader || model);

    const systemInstruction = buildSystemInstruction(rating, category);

    const userPrompt = `Hãy tạo một bài tập lập trình hoàn chỉnh mới với các thông số sau:
- Độ khó (Rating): ${rating}
- Chủ đề: ${category}
- Thể loại bài: ${problemType}
${briefIdea ? `- Ý tưởng sơ lược hoặc gợi ý từ người dùng: ${briefIdea}` : "- Hãy tự sáng tạo ra một bài tập độc đáo, thú vị và phát biểu toán học trực tiếp (tuyệt đối không viết cốt truyện) phù hợp với rating và chủ đề này."}

Hãy trả về kết quả hoàn toàn dưới dạng JSON tuân thủ đúng cấu trúc schema yêu cầu.`;

    let responseStream;
    const streamConfig = {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Tiêu đề bài toán (Tiếng Việt)" },
          rating: { type: Type.INTEGER, description: "Độ khó / rating của bài tập" },
          category: { type: Type.STRING, description: "Chủ đề chính của bài toán" },
          problemStatement: { type: Type.STRING, description: "Đề bài bằng tiếng Việt định dạng Markdown theo mẫu LQDOJ" },
          testGenerator: { 
            type: Type.STRING, 
            description: "Mã nguồn C++ generator.cpp sinh dữ liệu testcase ngẫu nhiên tuân thủ: nhận tham số giới hạn và seed từ đối số dòng lệnh; in input ra stdout; in output mong đợi ra stderr." 
          },
          generatorScript: { 
            type: Type.STRING, 
            description: "Script sinh test gồm đúng 100 dòng tương ứng với 100 testcases mạnh khác nhau. Mỗi dòng chứa các tham số truyền cho generator, cột cuối cùng là seed ngẫu nhiên thay đổi liên tục." 
          },
          checker: { 
            type: Type.STRING, 
            description: "Mã nguồn C++ checker.cpp chạy dưới dạng ./main <input_file> <output_file> <ans_file> (nullable)" 
          },
          interactive: { 
            type: Type.STRING, 
            description: "Mã nguồn C++ interactive.cpp chạy dưới dạng ./main <input_file> <answer_file> (nullable)" 
          },
          ioi: {
            type: Type.OBJECT,
            description: "Cấu hình chấm bài theo dạng hàm (IOI Signature / Grader). BẮT BUỘC có khi problemType là 'ioi'. Nếu không phải 'ioi', đặt là null.",
            properties: {
              functionSignatureCpp: { type: Type.STRING, description: "Khai báo hàm C++ (ví dụ: long long solve(long long n);)" },
              functionSignaturePy: { type: Type.STRING, description: "Khai báo hàm Python (ví dụ: def solve(n: int) -> int:)" },
              headerH: { type: Type.STRING, description: "File header.h hoàn chỉnh có include guard (#ifndef _HEADER_INCLUDED...)" },
              handlerCpp: { type: Type.STRING, description: "File handler.cpp C++ đọc stdin, gọi hàm của thí sinh, in output ra stdout" },
              handlerPy: { type: Type.STRING, description: "File handler.py Python import hàm từ _submission, đọc stdin, gọi hàm, in output ra stdout" },
              contestantStubCpp: { type: Type.STRING, description: "Khung code stub.cpp C++ cho thí sinh tải về" },
              contestantStubPy: { type: Type.STRING, description: "Khung code stub.py Python cho thí sinh tải về" }
            },
            required: ["functionSignatureCpp", "functionSignaturePy", "headerH", "handlerCpp", "handlerPy", "contestantStubCpp", "contestantStubPy"]
          },
          solutions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                subtask: { type: Type.STRING, description: "Tên subtask" },
                description: { type: Type.STRING, description: "Mô tả giải thuật" },
                code: { type: Type.STRING, description: "Mã nguồn C++" }
              },
              required: ["subtask", "description", "code"]
            }
          },
          analysis: { type: Type.STRING, description: "Phân tích/editorial giải thuật" }
        },
        required: ["title", "rating", "category", "problemStatement", "testGenerator", "generatorScript", "solutions", "analysis"]
      }
    };

    try {
      responseStream = await ai.models.generateContentStream({
        model: targetModel,
        contents: userPrompt,
        config: streamConfig
      });
    } catch (modelError: any) {
      console.warn(`Không thể dùng model ${targetModel} cho stream, chuyển sang gemini-flash-latest:`, modelError.message);
      responseStream = await ai.models.generateContentStream({
        model: "gemini-flash-latest",
        contents: userPrompt,
        config: streamConfig
      });
    }

    let hasWritten = false;
    try {
      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(chunk.text);
          hasWritten = true;
        }
      }
    } catch (loopError: any) {
      console.error("Lỗi trong quá trình stream chunks:", loopError);
      if (!hasWritten && targetModel !== "gemini-flash-latest") {
        console.warn("Chưa ghi dữ liệu nào, tiến hành chạy fallback sang gemini-flash-latest...");
        try {
          const fallbackStream = await ai.models.generateContentStream({
            model: "gemini-flash-latest",
            contents: userPrompt,
            config: streamConfig
          });
          for await (const chunk of fallbackStream) {
            if (chunk.text) {
              res.write(chunk.text);
            }
          }
        } catch (fallbackError: any) {
          console.error("Lỗi khi chạy fallback stream:", fallbackError);
          res.write(`|||STREAM_ERROR|||${JSON.stringify({ 
            error: `Cả mô hình ${targetModel} và mô hình dự phòng gemini-flash-latest đều không khả dụng hoặc bị lỗi. Chi tiết: ${fallbackError.message}` 
          })}`);
        }
      } else {
        res.write(`|||STREAM_ERROR|||${JSON.stringify({ 
          error: `Quá trình sinh dữ liệu bị gián đoạn do lỗi máy chủ AI: ${loopError.message}. Vui lòng thử lại.` 
        })}`);
      }
    }

    res.end();
  } catch (error: any) {
    console.error("Lỗi khi stream đề bài:", error);
    res.write(`|||STREAM_ERROR|||${JSON.stringify({ 
      error: "Đã xảy ra lỗi khởi động hoặc chạy stream bằng AI. Vui lòng thử lại.", 
      details: error.message 
    })}`);
    res.end();
  }
});

// Setup Vite Dev Server / Static Asset Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
  });
}

export default app;
