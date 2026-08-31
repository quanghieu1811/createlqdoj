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
const buildSystemInstruction = (
  rating: any,
  category: any,
  testCount: number = 100,
  subtaskDistribution: 'decreasing' | 'increasing' | 'equal' = 'decreasing'
) => {
  const count = testCount && testCount >= 5 && testCount <= 200 ? testCount : 100;

  let distExplanation = "";
  if (subtaskDistribution === 'decreasing') {
    distExplanation = `KIỂU 2 (MẶC ĐỊNH): SỐ ĐIỂM GIẢM DẦN THEO ĐỘ KHÓ.
Các subtask dễ có số điểm cao nhất, số điểm giảm dần ở các subtask khó hơn phía sau.
Ví dụ:
- Nếu chia 4 subtask: Subtask 1 (40 điểm/%), Subtask 2 (30 điểm/%), Subtask 3 (20 điểm/%), Subtask 4 (10 điểm/%).
- Nếu chia 5 subtask: Subtask 1 (35 điểm), Subtask 2 (25 điểm), Subtask 3 (20 điểm), Subtask 4 (12 điểm), Subtask 5 (8 điểm).`;
  } else if (subtaskDistribution === 'increasing') {
    distExplanation = `KIỂU 3: SỐ ĐIỂM TĂNG DẦN THEO ĐỘ KHÓ.
Các subtask dễ có số điểm thấp, các subtask khó và tối ưu cao nhất chiếm số điểm cao nhất.
Ví dụ:
- Nếu chia 4 subtask: Subtask 1 (10 điểm/%), Subtask 2 (20 điểm/%), Subtask 3 (30 điểm/%), Subtask 4 (40 điểm/%).
- Nếu chia 5 subtask: Subtask 1 (8 điểm), Subtask 2 (12 điểm), Subtask 3 (20 điểm), Subtask 4 (25 điểm), Subtask 5 (35 điểm).`;
  } else {
    distExplanation = `KIỂU 1: CHIA TẤT CẢ BẰNG NHAU.
Mọi subtask đều có số điểm bằng nhau (hoặc gần như bằng nhau với tổng bằng 100).
Ví dụ:
- Nếu chia 4 subtask: Mỗi subtask đúng 25 điểm / 25%.
- Nếu chia 5 subtask: Mỗi subtask đúng 20 điểm / 20%.`;
  }

  return `Bạn đóng vai trò là một "Gemma 4 31B IT" - Mô hình ngôn ngữ lớn chuyên gia thiết kế đề thi lập trình thi đấu (Problem Setter) kỳ cựu trên nền tảng LQDOJ (Lê Quý Đôn Online Judge).
Nhiệm vụ của bạn là thiết kế một bài tập lập trình hoàn chỉnh, chuyên nghiệp và có độ chính xác khoa học tuyệt đối, nhắm tới độ khó rating ${rating || 1400} và chủ đề "${category || "Dynamic Programming"}".

YÊU CẦU CRITICAL (BẮT BUỘC):
1. BÀI TẬP HOÀN TOÀN MỚI: Phải sáng tạo ra một bài tập hoàn toàn mới, độc lập, chưa từng xuất hiện ở bất cứ đâu.
2. KHÔNG ĐƯỢC VIẾT CỐT TRUYỆN NẾU KHÔNG CÓ YÊU CẦU BỔ SUNG:
   - Nếu trong gợi ý hoặc ý tưởng sơ lược ("briefIdea" hoặc "feedback") từ người dùng có yêu cầu viết cốt truyện/bối cảnh rõ ràng, bạn hãy thiết kế một cốt truyện sáng tạo.
   - Ngược lại, nếu người dùng KHÔNG yêu cầu gì về bối cảnh/cốt truyện, bạn tuyệt đối KHÔNG ĐƯỢC VIẾT CỐT TRUYỆN (không rùa thỏ, không Tèo Tí, không phiêu lưu, không cổ tích...). Đề bài phải được phát biểu trực tiếp dưới dạng toán học hoặc cấu trúc dữ liệu thô một cách rõ ràng, ngắn gọn và trực quan nhất.

3. QUY TẮC PHÂN CHIA SUBTASK & BẢO TOÀN TÍNH ĐỘC LẬP (ANTI-AC-LEAK):
   a. TỐI ĐA HÓA SỐ LƯỢNG SUBTASK:
      - Hãy cố gắng chia bài toán thành NHIỀU SUBTASK NHẤT CÓ THỂ (thông thường từ 4 đến 6 subtask, hoặc ít nhất 3-5 subtask có ý nghĩa thuật toán thực chất).
      - Các subtask phải tương ứng với các tầng độ phức tạp giải thuật hoặc các trường hợp đặc biệt tự nhiên, ví dụ:
        + Subtask 1: Vét cạn / Đệ quy quay lui / Sinh nhị phân O(2^N) hoặc O(N!) với N <= 20.
        + Subtask 2: Quy hoạch động / Duyệt O(N^3) với N <= 100.
        + Subtask 3: Thuật toán O(N^2) với N <= 3000 hoặc trường hợp đặc biệt (đồ thị là cây/đường thẳng, mảng nhị phân, K=1...).
        + Subtask 4: Thuật toán O(N sqrt(N)) chia căn hoặc Hai con trỏ với N <= 5*10^4.
        + Subtask 5: Thuật toán Full Solution O(N log N) hoặc O(N) với N <= 2*10^5 (hoặc 10^6).
   b. TÍNH ĐỘC LẬP VÀ CHẶN TRIỆT ĐỂ (KHÔNG AC VƯỢT SUBTASK):
      - BẮT BUỘC mỗi lời giải của subtask k chỉ giải được tối đa đến subtask k.
      - TUYỆT ĐỐI KHÔNG TỒN TẠI TRƯỜNG HỢP lời giải của subtask trước có thể giải được (AC) các subtask sau.
      - Giới hạn thời gian (Time Limit), giới hạn N và bộ testcase trong script.txt phải được thiết kế cực kỳ chặt chẽ: testcase của subtask sau phải đủ lớn và chứa các dữ liệu worst-case để chặn đứng hoàn toàn (bị TLE hoặc WA) tất cả các giải thuật chưa tối ưu của subtask trước.
   c. KIỂU PHÂN BỔ ĐIỂM SỐ SUBTASK:
      - Áp dụng cấu hình phân bổ điểm: ${subtaskDistribution}
      - ${distExplanation}
      - Trong mục "#### Scoring" của Đề bài và file init.yml, hãy ghi rõ số điểm / tỷ lệ % của từng subtask theo đúng quy tắc này.

HỆ THỐNG CÁC THỂ LOẠI BÀI TOÁN THEO HƯỚNG DẪN TEST DATA LQDOJ:
1. 'standard': So sánh theo token, bỏ qua khoảng trắng. Checker 'standard'.
2. 'floats': Output số thực có sai số tuyệt đối hoặc tương đối (precision). Checker 'floats' / 'floatsabs' / 'floatsrel'.
3. 'checker': Custom C++ Checker (nhiều đáp án đúng hoặc chấm đặc biệt). Checker 'customcpp' hoặc 'testlib'.
4. 'interactive': Bài tương tác (interactor) hoặc bài Communication IOI (nhiều tiến trình).
5. 'ioi': IOI Signature (Nộp bằng hàm). Cung cấp đầy đủ Header + Handlers + Stubs cho C/C++, Python và Java.
6. 'output_only': Bài Output-only truyền thống (kiểu IOI), nộp zip các file output đáp án.
7. 'kaggle_csv': Bài Machine Learning / Data kiểu Kaggle, nộp file CSV, chấm bằng các bộ chấm: csv_accuracy, csv_rmse, csv_mae, csv_f1, csv_auc, csv_logloss kèm baseline và pretest_fraction cho bảng xếp hạng public/private.

YÊU CẦU CHI TIẾT CỦA CÁC THÀNH PHẦN:
1. ĐỀ BÀI (problemStatement):
- Viết hoàn toàn bằng Tiếng Việt.
- Định dạng Markdown chuẩn của LQDOJ với 4 mục chính: \`#### Input\`, \`#### Output\`, \`#### Example\`, \`#### Scoring\`.
- Sử dụng các khối thông báo kiểu MkDocs (Admonition) cho phần Ví dụ:
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
- Nếu bài thuộc thể loại 'ioi': Nêu rõ thí sinh cần cài đặt hàm (tên hàm, tham số, kiểu trả về) cho cả C/C++, Python và Java thay vì đọc/ghi luồng chuẩn.
- Nếu bài thuộc thể loại 'kaggle_csv': Nêu rõ định dạng file CSV yêu cầu, các cột id, label và metric chấm điểm.
- Phần Scoring (Chấm điểm) phải chia thành các Subtask rõ ràng với số điểm tuân thủ đúng quy tắc phân bổ điểm: ${subtaskDistribution}.
- Sử dụng ký hiệu Toán học bằng LaTeX (kẹp giữa dấu $) như $1 \\le N \\le 10^5$. Hãy chắc chắn dấu gạch chéo ngược được escape đúng trong JSON (dùng \\\\ thay vì \\).

2. TEST GENERATOR (testGenerator) VÀ SCRIPT (generatorScript):
- Viết mã nguồn C++ sinh test ngẫu nhiên hoàn chỉnh (generator.cpp). Nhận tham số ràng buộc và seed từ đối số dòng lệnh:
  ./generator [arg_1] [arg_2] ... [seed]
- In dữ liệu đầu vào (input) ra stdout (cout).
- In dữ liệu đầu ra mong đợi ra stderr (cerr).
- Kịch bản "generatorScript" gồm ĐÚNG ${count} dòng tương ứng với ${count} testcases mạnh khác nhau, kết thúc bằng seed ngẫu nhiên thay đổi. Phân chia dải test tương ứng chính xác theo từng Subtask.

3. TRÌNH KIỂM TRA TEST / VALIDATOR (validator):
- Cung cấp mã nguồn C++ (validatorCpp) và Python (validatorPy) để kiểm tra tính hợp lệ của mọi file input theo đúng ràng buộc đề bài. Đọc từ stdin, exit 0 nếu hợp lệ, exit 1 và in thông báo lỗi ra stderr nếu vi phạm.

4. CHECKER & INTERACTIVE & IOI & KAGGLE:
- checker: Nếu là 'checker', viết checker C++ chạy dạng ./main <input_file> <output_file> <ans_file>. Exit 0=AC, 1=WA, 2=PARTIAL (in tỷ lệ ra stderr).
- interactive: Nếu là 'interactive', viết interactor C++ chạy dạng ./main <input_file> <answer_file>.
- ioi: Nếu là 'ioi', cung cấp functionSignatureCpp, functionSignaturePy, functionSignatureJava, headerH, handlerCpp, handlerPy, handlerJava, contestantStubCpp, contestantStubPy, contestantStubJava.
- kaggle: Nếu là 'kaggle_csv', cung cấp metric, idColumn, labelColumn, hasHeader, baseline, pretestFraction, sampleTrainCsv, sampleTestCsv, sampleSolutionCsv.
- outputOnlyConfig: Nếu là 'output_only', cung cấp isOutputOnly=true, submissionSizeLimitMb, binaryAnswerData.

5. SOLUTIONS (solutions):
- Có bao nhiêu Subtask trong Đề bài thì viết đúng bấy nhiêu lời giải mẫu C++ độc lập tương ứng trong mảng "solutions".
- Mỗi phần tử trong "solutions" phải được viết chuyên biệt cho subtask đó (ví dụ giải thuật O(N^3) cho subtask 2, giải thuật O(N^2) cho subtask 3, Segment Tree O(N log N) cho Full Solution).
- Với bài 'ioi', cài đặt hàm tương ứng thay vì hàm main().
- CẤM TUYỆT ĐỐI KHÔNG SỬ DỤNG #pragma.

6. LQDOJ INIT.YML (initYml) VÀ CUSTOM JSON (customJson):
- Tự động tạo nội dung file init.yml hoàn chỉnh chuẩn cú pháp LQDOJ cho bài này.
- Tự động tạo custom JSON cấu hình batch subtask theo mục 2.4 hướng dẫn LQDOJ.

7. PHÂN TÍCH (analysis):
- Viết phân tích/editorial chi tiết bằng tiếng Việt giải thích ý tưởng giải bài.`;
};

// Schema for LQDOJ Problem definition
const problemSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Tiêu đề bài toán (Tiếng Việt)" },
    rating: { type: Type.INTEGER, description: "Độ khó / rating của bài tập" },
    category: { type: Type.STRING, description: "Chủ đề chính của bài toán" },
    problemType: { 
      type: Type.STRING, 
      description: "Thể loại bài: 'standard' | 'floats' | 'checker' | 'interactive' | 'ioi' | 'output_only' | 'kaggle_csv'" 
    },
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
      description: "Script sinh test gồm nhiều dòng testcase mạnh khác nhau. Mỗi dòng chứa các tham số truyền cho generator, cột cuối cùng là seed ngẫu nhiên thay đổi liên tục." 
    },
    checkerType: {
      type: Type.STRING,
      description: "Tên checker trên LQDOJ: 'standard' | 'floats' | 'floatsabs' | 'floatsrel' | 'rstripped' | 'sorted' | 'identical' | 'linecount' | 'customcpp' | 'testlib' | 'testlib_ioi' | 'csv_accuracy' | 'csv_rmse' | 'csv_mae' | 'csv_f1' | 'csv_auc' | 'csv_logloss'"
    },
    checkerArgs: {
      type: Type.STRING,
      description: "Cấu hình JSON bổ sung cho checker (nếu dùng floats precision, csv cột, baseline, pretest_fraction)"
    },
    checker: { 
      type: Type.STRING, 
      description: "Mã nguồn C++ checker.cpp chạy dưới dạng ./main <input_file> <output_file> <ans_file> (nullable)" 
    },
    interactive: { 
      type: Type.STRING, 
      description: "Mã nguồn C++ interactive.cpp chạy dưới dạng ./main <input_file> <answer_file> (nullable)" 
    },
    validator: {
      type: Type.OBJECT,
      description: "Trình kiểm tra testcase (Validator) theo mục 6 LQDOJ",
      properties: {
        validatorCpp: { type: Type.STRING, description: "Mã nguồn C++ validator.cpp đọc stdin kiểm tra ràng buộc" },
        validatorPy: { type: Type.STRING, description: "Mã nguồn Python validator.py đọc stdin kiểm tra ràng buộc" }
      },
      required: ["validatorCpp", "validatorPy"]
    },
    ioi: {
      type: Type.OBJECT,
      description: "Cấu hình chấm bài theo dạng hàm (IOI Signature / Grader). BẮT BUỘC có khi problemType là 'ioi'. Nếu không phải 'ioi', đặt là null.",
      properties: {
        functionSignatureCpp: { type: Type.STRING, description: "Khai báo hàm C++ (ví dụ: long long solve(long long n);)" },
        functionSignaturePy: { type: Type.STRING, description: "Khai báo hàm Python (ví dụ: def solve(n: int) -> int:)" },
        functionSignatureJava: { type: Type.STRING, description: "Khai báo hàm Java (ví dụ: public static int solve(int n))" },
        headerH: { type: Type.STRING, description: "File header.h hoàn chỉnh có include guard (#ifndef _HEADER_INCLUDED...)" },
        handlerCpp: { type: Type.STRING, description: "File handler.cpp C++ đọc stdin, gọi hàm của thí sinh, in output ra stdout" },
        handlerPy: { type: Type.STRING, description: "File handler.py Python import hàm từ _submission, đọc stdin, gọi hàm, in output ra stdout" },
        handlerJava: { type: Type.STRING, description: "File Handler.java đọc stdin, gọi Solution.solve, in output ra stdout" },
        contestantStubCpp: { type: Type.STRING, description: "Khung code stub.cpp C++ cho thí sinh tải về" },
        contestantStubPy: { type: Type.STRING, description: "Khung code stub.py Python cho thí sinh tải về" },
        contestantStubJava: { type: Type.STRING, description: "Khung code Solution.java cho thí sinh tải về" },
        isCommunication: { type: Type.BOOLEAN, description: "True nếu là bài tương tác đa tiến trình IOI Communication" },
        managerCpp: { type: Type.STRING, description: "Source manager.cpp sử dụng testlib_ioi.h nếu là bài Communication" },
        processCount: { type: Type.INTEGER, description: "Số tiến trình bài làm (1 hoặc 2)" }
      },
      required: ["functionSignatureCpp", "functionSignaturePy", "headerH", "handlerCpp", "handlerPy", "contestantStubCpp", "contestantStubPy"]
    },
    kaggle: {
      type: Type.OBJECT,
      description: "Cấu hình bài tập kiểu Kaggle CSV Machine Learning",
      properties: {
        metric: { type: Type.STRING, description: "'csv_accuracy' | 'csv_rmse' | 'csv_mae' | 'csv_f1' | 'csv_auc' | 'csv_logloss'" },
        idColumn: { type: Type.STRING, description: "Tên cột định danh id_column" },
        labelColumn: { type: Type.STRING, description: "Tên cột mục tiêu label_column" },
        hasHeader: { type: Type.BOOLEAN, description: "File CSV có hàng tiêu đề hay không" },
        baseline: { type: Type.NUMBER, description: "Giá trị baseline tệ nhất tương ứng với 0 điểm (cho rmse, mae, logloss)" },
        pretestFraction: { type: Type.NUMBER, description: "Tỷ lệ dòng pretest hiển thị bảng xếp hạng public (ví dụ 0.5)" },
        sampleTrainCsv: { type: Type.STRING, description: "Nội dung file train.csv mẫu" },
        sampleTestCsv: { type: Type.STRING, description: "Nội dung file test.csv mẫu" },
        sampleSolutionCsv: { type: Type.STRING, description: "Nội dung file solution.csv (đáp án đúng) mẫu" }
      },
      required: ["metric", "hasHeader"]
    },
    outputOnlyConfig: {
      type: Type.OBJECT,
      description: "Cấu hình bài Output-only truyền thống kiểu IOI",
      properties: {
        isOutputOnly: { type: Type.BOOLEAN, description: "True nếu là bài Output-only" },
        submissionSizeLimitMb: { type: Type.INTEGER, description: "Dung lượng tối đa của file zip bài nộp (MB)" },
        binaryAnswerData: { type: Type.BOOLEAN, description: "True nếu đáp án là dữ liệu nhị phân" }
      },
      required: ["isOutputOnly"]
    },
    initYml: {
      type: Type.STRING,
      description: "File cấu hình init.yml hoàn chỉnh chuẩn LQDOJ Test Data"
    },
    customJson: {
      type: Type.STRING,
      description: "JSON cấu hình test cases và batches theo mục 2.4 Hướng dẫn LQDOJ"
    },
    batchMode: {
      type: Type.STRING,
      description: "Quy tắc tính điểm subtask: 'icpc' | 'sum' | 'ioi_min'"
    },
    subtaskDistribution: {
      type: Type.STRING,
      description: "Kiểu phân bổ điểm subtask: 'decreasing' | 'increasing' | 'equal'"
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
};

// API endpoint to generate or refine LQDOJ problem
app.post("/api/generate", async (req, res) => {
  try {
    const { rating, category, briefIdea, problemType, previousProblem, feedback, apiKey, model, testCount, subtaskDistribution, batchMode } = req.body;
    const keyHeader = req.headers["x-gemini-api-key"] as string;
    const selectedModelHeader = req.headers["x-selected-model"] as string;

    const resolvedKey = keyHeader || apiKey || process.env.GEMINI_API_KEY;
    if (!resolvedKey) {
      return res.status(400).json({ error: "Không tìm thấy API Key. Vui lòng cung cấp Gemini API Key." });
    }

    const finalTestCount = testCount && testCount >= 5 && testCount <= 200 ? testCount : 100;
    const finalSubtaskDist = subtaskDistribution || 'decreasing';
    const finalBatchMode = batchMode || 'icpc';

    const ai = new GoogleGenAI({
      apiKey: resolvedKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const targetModel = resolveModel(selectedModelHeader || model);
    const systemInstruction = buildSystemInstruction(rating, category, finalTestCount, finalSubtaskDist);

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
- Phân bổ điểm Subtask theo kiểu: ${finalSubtaskDist}.
- Quy tắc tính điểm: ${finalBatchMode}.
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
- Kiểu phân bổ điểm Subtask: ${finalSubtaskDist} (Tối đa hóa số lượng subtask và đảm bảo lời giải trước không AC được subtask sau)
- Quy tắc tính điểm subtask (Batch mode): ${finalBatchMode}
- Số lượng testcase sinh tự động: ${finalTestCount} testcases (kịch bản generatorScript gồm đúng ${finalTestCount} dòng tham số)
${briefIdea ? `- Ý tưởng sơ lược hoặc gợi ý từ người dùng: ${briefIdea}` : "- Hãy tự sáng tạo ra một bài tập độc đáo, thú vị và phát biểu toán học trực tiếp (tuyệt đối không viết cốt truyện) phù hợp với rating và chủ đề này."}

Hãy trả về kết quả hoàn toàn dưới dạng JSON tuân thủ đúng cấu trúc schema yêu cầu.`;
    }

    // We use gemini-3.1-pro-preview or gemini-2.5-pro because it requires complex reasoning, math, and code generation.
    let response;

    const modelConfig = {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: problemSchema
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
    const { rating, category, briefIdea, problemType, apiKey, model, testCount, subtaskDistribution, batchMode } = req.body;
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

    const finalTestCount = testCount && testCount >= 5 && testCount <= 200 ? testCount : 100;
    const finalSubtaskDist = subtaskDistribution || 'decreasing';
    const finalBatchMode = batchMode || 'icpc';

    const ai = new GoogleGenAI({
      apiKey: resolvedKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const targetModel = resolveModel(selectedModelHeader || model);

    const systemInstruction = buildSystemInstruction(rating, category, finalTestCount, finalSubtaskDist);

    const userPrompt = `Hãy tạo một bài tập lập trình hoàn chỉnh mới với các thông số sau:
- Độ khó (Rating): ${rating}
- Chủ đề: ${category}
- Thể loại bài: ${problemType}
- Kiểu phân bổ điểm Subtask: ${finalSubtaskDist} (Tối đa hóa số lượng subtask và đảm bảo lời giải trước không AC được subtask sau)
- Quy tắc tính điểm subtask (Batch mode): ${finalBatchMode}
- Số lượng testcase sinh tự động: ${finalTestCount} testcases (kịch bản generatorScript gồm đúng ${finalTestCount} dòng tham số)
${briefIdea ? `- Ý tưởng sơ lược hoặc gợi ý từ người dùng: ${briefIdea}` : "- Hãy tự sáng tạo ra một bài tập độc đáo, thú vị và phát biểu toán học trực tiếp (tuyệt đối không viết cốt truyện) phù hợp với rating và chủ đề này."}

Hãy trả về kết quả hoàn toàn dưới dạng JSON tuân thủ đúng cấu trúc schema yêu cầu.`;

    let responseStream;
    const streamConfig = {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: problemSchema
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
