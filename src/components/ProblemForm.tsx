import React, { useState } from "react";
import { GenerationRequest } from "../types";
import { HelpCircle, Sparkles, BookOpen, Trophy, Settings, Key, Eye, EyeOff, Brain, ChevronDown, ChevronUp, Layers, Tag } from "lucide-react";

export interface TopicItem {
  name: string;
  level: "THCS" | "THPT";
  isNew?: boolean;
  desc?: string;
}

export interface CategoryGroup {
  group: string;
  levelBadge?: "THCS" | "THPT" | "THCS & THPT";
  topics: TopicItem[];
}

export const MEMES_TOURNAMENT_CATEGORIES: CategoryGroup[] = [
  {
    group: "THCS - Thuật toán & Kỹ thuật",
    levelBadge: "THCS",
    topics: [
      { name: "Tìm kiếm nhị phân (Binary Search)", level: "THCS", desc: "Thuật toán tìm kiếm nhị phân trên mảng đã sắp xếp" },
      { name: "Tìm kiếm nhị phân trên kết quả (Binary Search on Answer)", level: "THCS", desc: "Chặt nhị phân tìm nghiệm tối ưu f(x)" },
      { name: "Sắp xếp (Sort)", level: "THCS", desc: "Sắp xếp tăng/giảm, sắp xếp theo nhiều tiêu chí" },
      { name: "Mảng cộng dồn (Prefix Sum)", level: "THCS", desc: "Tính tổng đoạn con O(1), mảng cộng dồn 2D" },
      { name: "Mảng hiệu (Difference Array)", level: "THCS", desc: "Cập nhật cộng đoạn O(1) và khôi phục mảng" },
      { name: "Mảng đánh dấu & Đếm phân phối", level: "THCS", desc: "Đếm tần suất, đánh dấu phần tử đã xuất hiện" },
      { name: "Đệ quy và Quay lui (Backtracking)", level: "THCS", desc: "Duyệt tìm kiếm lời giải toàn diện, sinh tổ hợp" },
      { name: "Phương pháp duyệt, vét cạn (Brute-force)", level: "THCS", desc: "Duyệt toàn bộ không gian trạng thái cho N nhỏ" },
      { name: "Quy hoạch động cơ bản", level: "THCS", desc: "Quy hoạch động 1 chiều, tìm phương án tối ưu" }
    ]
  },
  {
    group: "THCS - Số học & Toán học",
    levelBadge: "THCS",
    topics: [
      { name: "Số nguyên tố & Kiểm tra nguyên tố", level: "THCS", desc: "Kiểm tra căn bậc hai, phân loại số" },
      { name: "Sàng nguyên tố Eratosthenes", level: "THCS", desc: "Sàng nguyên tố đến 10^6 - 10^7" },
      { name: "Phân tích thừa số nguyên tố", level: "THCS", desc: "Phân tích N thành tích các số nguyên tố" },
      { name: "Ước số, bội số & Ước chung lớn nhất (GCD/LCM)", level: "THCS", desc: "Thuật toán Euclid tìm GCD và LCM" },
      { name: "Phép chia lấy dư (Modulo)", level: "THCS", desc: "Phép toán (a+b)%M, (a*b)%M, lũy thừa cơ bản" },
      { name: "Số chính phương & Tính chất số học", level: "THCS", desc: "Đếm, kiểm tra số chính phương, số đặc biệt" },
      { name: "Đếm & Tính tổng các ước số", level: "THCS", desc: "Hàm d(n), sigma(n) qua phân tích thừa số" }
    ]
  },
  {
    group: "THCS - Dãy số, Bảng số & Hình học",
    levelBadge: "THCS",
    topics: [
      { name: "Dãy số theo quy luật", level: "THCS", desc: "Tìm số hạng thứ k, tổng n số hạng của dãy" },
      { name: "Dãy số Fibonacci", level: "THCS", desc: "Tính F[n], tính chất Fibonacci, đệ quy có nhớ" },
      { name: "Bảng số & Mảng 2 chiều quy luật", level: "THCS", desc: "Điền số xoắn ốc, ma trận ziczac, bảng nhân" },
      { name: "Mảng cộng dồn trên bảng số 2 chiều", level: "THCS", desc: "Prefix sum 2D tính tổng hình chữ nhật con" },
      { name: "Hình học phẳng cơ bản (Chu vi, Diện tích)", level: "THCS", desc: "Tam giác, hình chữ nhật, hình thang, hình tròn" },
      { name: "Tọa độ điểm & Phương trình đường thẳng", level: "THCS", desc: "Khoảng cách giữa 2 điểm, phương trình y = ax + b" },
      { name: "Hàm số & Hàm đệ quy", level: "THCS", desc: "Tập xác định, tập giá trị, biến đổi đối số hàm" }
    ]
  },
  {
    group: "THPT - Cấu trúc dữ liệu",
    levelBadge: "THPT",
    topics: [
      { name: "Ngăn xếp (Stack)", level: "THPT", desc: "Ngăn xếp đơn điệu (Monotonic Stack), kiểm tra ngoặc" },
      { name: "Hàng đợi (Queue)", level: "THPT", desc: "Xếp hàng FIFO, phục vụ BFS" },
      { name: "Hàng đợi hai đầu (Deque)", level: "THPT", desc: "Tìm min/max trên đoạn tịnh tiến (Sliding Window)" },
      { name: "Hàng đợi ưu tiên (Priority Queue / Heap)", level: "THPT", desc: "Duy trì phần tử lớn nhất/nhỏ nhất linh hoạt" },
      { name: "Cây tìm kiếm nhị phân (Binary Search Tree)", level: "THPT", desc: "Cấu trúc BST, cây tìm kiếm nhị phân cân bằng" }
    ]
  },
  {
    group: "THPT - Cây phân đoạn & Cây chỉ số nhị phân",
    levelBadge: "THPT",
    topics: [
      { name: "Cây phân đoạn (Segment Tree)", level: "THPT", desc: "Truy vấn và cập nhật điểm/đoạn trên dãy số" },
      { name: "Cây chỉ số nhị phân (Fenwick Tree / BIT)", level: "THPT", desc: "Binary Indexed Tree cập nhật điểm và tính tổng tiền tố" },
      { name: "Segment Tree với Lazy Propagation", level: "THPT", desc: "Cập nhật trên đoạn và truy vấn trên đoạn O(log N)" },
      { name: "Fenwick Tree 2D & Mở rộng", level: "THPT", desc: "Truy vấn trên bảng 2 chiều và đếm nghịch thế" }
    ]
  },
  {
    group: "THPT - Lý thuyết đồ thị",
    levelBadge: "THPT",
    topics: [
      { name: "Biểu diễn đồ thị (Ma trận kề, Danh sách kề, Danh sách cạnh)", level: "THPT", desc: "Lưu trữ đồ thị có hướng, vô hướng, có trọng số" },
      { name: "Thuật toán duyệt DFS trên đồ thị đơn giản", level: "THPT", desc: "Tìm thành phần liên thông, kiểm tra chu trình" },
      { name: "Thuật toán duyệt BFS trên đồ thị & Ma trận", level: "THPT", desc: "Tìm đường đi ngắn nhất không trọng số trên mê cung/lưới" },
      { name: "Duyệt DFS / BFS trên lưới ô vuông (Matrix)", level: "THPT", desc: "Tìm vùng liên thông (Flood Fill) trên ma trận 2D" }
    ]
  },
  {
    group: "THPT - Quy hoạch động",
    levelBadge: "THPT",
    topics: [
      { name: "Dãy con tăng dài nhất (LIS - Longest Increasing Subsequence)", level: "THPT", desc: "Quy hoạch động O(N^2) và tối ưu O(N log N)" },
      { name: "Bài toán cái túi (Knapsack Problem)", level: "THPT", desc: "Cái túi 0/1, cái túi không giới hạn (Unbounded Knapsack)" },
      { name: "Quy hoạch động hai chiều (2D Dynamic Programming)", level: "THPT", desc: "QHĐ trên lưới ô vuông, QHĐ bảng" },
      { name: "Bài toán quy hoạch động tối ưu hóa", level: "THPT", desc: "Tìm chi phí tối thiểu, phương án tối ưu" }
    ]
  },
  {
    group: "THPT - Chia để trị & Xử lý xâu",
    levelBadge: "THPT",
    topics: [
      { name: "Phương pháp Chia để trị (Divide and Conquer)", level: "THPT", desc: "Chia nhỏ bài toán thành các bài toán con độc lập" },
      { name: "Thuật toán Sắp xếp nhanh (QuickSort)", level: "THPT", desc: "Phân hoạch và sắp xếp đệ quy" },
      { name: "Thuật toán Sắp xếp trộn (MergeSort)", level: "THPT", desc: "Trộn hai dãy đã sắp xếp và đếm số cặp nghịch thế" },
      { name: "Chuẩn hóa và đếm ký tự xâu", level: "THPT", desc: "Xử lý khoảng trắng, chuyển đổi chữ hoa/thường" },
      { name: "Kiểm tra tính đối xứng (Palindrome)", level: "THPT", desc: "Kiểm tra xâu đối xứng, tìm xâu con đối xứng" }
    ]
  },
  {
    group: "THPT - Tổ hợp, Hoán vị & Nâng cao",
    levelBadge: "THPT",
    topics: [
      { name: "Sinh hoán vị, tổ hợp, chỉnh hợp", level: "THPT", desc: "Thuật toán sinh kế tiếp và quay lui" },
      { name: "Bài toán xếp hậu (N-Queens)", level: "THPT", desc: "Quay lui có đặt cờ đánh dấu đường chéo và cột" },
      { name: "Ứng dụng sáng tạo của Tìm kiếm nhị phân", level: "THPT", desc: "Biến đổi bài toán để áp dụng tính đơn điệu" },
      { name: "Kết hợp nhiều kỹ thuật giải bài toán phức tạp", level: "THPT", desc: "Phối hợp Cấu trúc dữ liệu + Quy hoạch động + Đồ thị" }
    ]
  }
];

interface ProblemFormProps {
  onSubmit: (request: GenerationRequest) => void;
  loading: boolean;
  apiKey: string;
  setApiKey: (key: string) => void;
  model: 'gemini-flash-latest' | 'gemma-4-31b-it';
  setModel: (m: 'gemini-flash-latest' | 'gemma-4-31b-it') => void;
}

export const ProblemForm: React.FC<ProblemFormProps> = ({
  onSubmit,
  loading,
  apiKey,
  setApiKey,
  model,
  setModel
}) => {
  const [rating, setRating] = useState<number>(1400);
  const [isRandomRating, setIsRandomRating] = useState<boolean>(false);
  const [category, setCategory] = useState<string>("Quy hoạch động");
  const [problemType, setProblemType] = useState<'standard' | 'checker' | 'interactive'>('standard');
  const [briefIdea, setBriefIdea] = useState<string>("");
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<"ALL" | "THCS" | "THPT">("ALL");
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState<string>("Tất cả");
  const [showMemesTopics, setShowMemesTopics] = useState<boolean>(true);

  // Helper function to pick random rating from 800 to 3500 in steps of 100
  const getRandomRating = (): number => {
    const min = 800;
    const max = 3500;
    const steps = (max - min) / 100; // 27 steps
    const randomStep = Math.floor(Math.random() * (steps + 1));
    return min + randomStep * 100;
  };

  // Helper function to pick random category from MEMES_TOURNAMENT_CATEGORIES list
  const getRandomCategory = (): string => {
    let candidateTopics = MEMES_TOURNAMENT_CATEGORIES.flatMap(g => g.topics);
    if (selectedLevelFilter !== "ALL") {
      candidateTopics = candidateTopics.filter(t => t.level === selectedLevelFilter);
    }
    if (selectedCategoryGroup !== "Tất cả") {
      const groupObj = MEMES_TOURNAMENT_CATEGORIES.find(g => g.group === selectedCategoryGroup);
      if (groupObj) {
        candidateTopics = groupObj.topics;
      }
    }
    if (candidateTopics.length === 0) {
      candidateTopics = MEMES_TOURNAMENT_CATEGORIES.flatMap(g => g.topics);
    }
    const randomIndex = Math.floor(Math.random() * candidateTopics.length);
    return candidateTopics[randomIndex].name;
  };

  const handleRollRandomRating = () => {
    const rolled = getRandomRating();
    setRating(rolled);
    setIsRandomRating(true);
  };

  const handleRollRandomCategory = () => {
    const rolled = getRandomCategory();
    setCategory(rolled);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      alert("Vui lòng nhập API Key của bạn để sử dụng ứng dụng!");
      return;
    }

    let finalRating: number = rating;
    if (isRandomRating) {
      finalRating = rating >= 800 && rating <= 3500 ? rating : getRandomRating();
    }

    let finalCategory: string = category.trim();
    if (!finalCategory || finalCategory === "Random" || finalCategory.toLowerCase().includes("ngẫu nhiên")) {
      finalCategory = getRandomCategory();
    }

    onSubmit({
      rating: finalRating,
      category: finalCategory,
      briefIdea: briefIdea.trim() ? briefIdea : undefined,
      problemType
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 space-y-6">
      {/* Sparkle Header */}
      <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
        <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
        <h2 className="text-xl font-bold text-slate-800">Cấu hình Đề bài LQDOJ</h2>
      </div>

      {/* API KEY CONFIGURATION (REQUIRED) */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-1 bg-amber-500 text-white rounded-lg mt-0.5 shadow-sm">
            <Key className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-950 flex items-center gap-1.5">
              Cấu hình Gemini API Key cá nhân
              <span className="px-2 py-0.5 bg-amber-600 text-white text-[10px] uppercase font-bold rounded-full">Bắt buộc</span>
            </h3>
            <p className="text-xs text-amber-850 mt-1 leading-relaxed">
              Bạn cần cung cấp Gemini API Key để khởi chạy thiết kế đề bài. Key của bạn được lưu cục bộ ở trình duyệt (localStorage) và chỉ gửi trực tiếp lên server phụ trợ bảo mật.
            </p>
          </div>
        </div>

        <div className="relative mt-2">
          <input
            type={showApiKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Nhập Gemini API Key của bạn (AIzaSy...)"
            className="w-full pl-4 pr-10 py-2.5 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs font-mono text-slate-800 transition-all shadow-inner"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="text-[10px] text-amber-800 flex justify-between items-center">
          <span>Chưa có API Key?</span>
          <a
            href="https://aistudio.google.com/"
            target="_blank"
            rel="noreferrer"
            className="font-bold underline hover:text-amber-950 flex items-center gap-1"
          >
            Lấy API Key miễn phí tại Google AI Studio ↗
          </a>
        </div>
      </div>

      {/* MODEL SELECTION */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
          <Brain className="w-4 h-4 text-indigo-600" />
          Chọn Mô hình thiết kế AI
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setModel('gemini-flash-latest')}
            className={`p-3.5 border rounded-xl flex flex-col items-start cursor-pointer transition-all ${
              model === 'gemini-flash-latest'
                ? "border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600 text-indigo-950"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">gemini-flash-latest</span>
              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-extrabold rounded-md uppercase">
                Khuyên dùng
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 text-left">
              Siêu nhanh, phản hồi tức thì, tối ưu cấu trúc dữ liệu xuất sắc.
            </span>
          </button>

          <button
            type="button"
            onClick={() => setModel('gemma-4-31b-it')}
            className={`p-3.5 border rounded-xl flex flex-col items-start cursor-pointer transition-all ${
              model === 'gemma-4-31b-it'
                ? "border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600 text-indigo-950"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">gemma-4-31b-it</span>
              <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 text-[9px] font-extrabold rounded-md uppercase">
                Chuyên gia
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 text-left">
              Mô hình chuyên gia Competitive Programming với lối tư duy toán học sâu sắc.
            </span>
          </button>
        </div>
      </div>

      {/* Grid Inputs for Rating and Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Rating selection (Slider + Numeric Input) */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              Độ khó mong muốn (Rating)
            </span>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold">
              Rating: {isRandomRating ? `${rating} (Ngẫu nhiên)` : rating}
            </span>
          </label>
          
          <div className="flex items-center gap-3">
            {isRandomRating ? (
              <div className="flex-1 py-2 px-3.5 bg-indigo-50/70 border border-indigo-150 rounded-xl flex items-center justify-between text-xs text-indigo-950 font-semibold animate-fade-in">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                  Đã bốc ngẫu nhiên rating: <strong className="text-indigo-700 text-sm font-bold">{rating}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRollRandomRating}
                    className="px-2.5 py-1 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-[11px] font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Bốc lại
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRandomRating(false)}
                    className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
                  >
                    Chỉnh thủ công
                  </button>
                </div>
              </div>
            ) : (
              <>
                <input
                  type="range"
                  min={800}
                  max={3500}
                  step={100}
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <input
                  type="number"
                  min={800}
                  max={3500}
                  value={rating}
                  onChange={(e) => {
                    let val = Number(e.target.value);
                    if (val > 3500) val = 3500;
                    setRating(val);
                  }}
                  onBlur={() => {
                    if (rating < 800) setRating(800);
                  }}
                  className="w-20 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 text-center focus:ring-2 focus:ring-indigo-500"
                />
              </>
            )}
          </div>
          {!isRandomRating && (
            <button
              type="button"
              onClick={handleRollRandomRating}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1.5 cursor-pointer w-max transition-all hover:translate-x-0.5 bg-indigo-50/80 hover:bg-indigo-100/80 px-2.5 py-1 rounded-lg border border-indigo-100"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              Bốc ngẫu nhiên rating (800 - 3500)
            </button>
          )}
          <p className="text-[11px] text-slate-400">
            Học sinh LQDOJ thường giải các bài từ 800 (Rất dễ) đến 3500 (Thách đấu tối thượng). Bấm nút Bốc ngẫu nhiên để hàm JS quay số từ 800 - 3500.
          </p>
        </div>

        {/* Category Input & Memes Tournament Topics */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              Chủ đề thuật toán
            </span>
            <span className="text-xs text-indigo-600 font-medium">
              Chủ đề đang chọn: <strong className="font-bold text-slate-900">{category}</strong>
            </span>
          </label>
          <input
            type="text"
            required
            placeholder="Nhập hoặc bốc ngẫu nhiên chủ đề thuật toán..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium text-slate-800 transition-all"
          />

          {/* Memes Tournament 2026-2027 Giới hạn kiến thức (Phụ lục 2 - 14/08/2026) */}
          <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Giới hạn kiến thức Memes Tournament 2026 – 2027 (Phụ lục 2)</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-semibold rounded-full border border-amber-200">
                  Cập nhật 14/08/2026
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowMemesTopics(!showMemesTopics)}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 cursor-pointer ml-auto"
              >
                {showMemesTopics ? (
                  <>Ẩn bớt <ChevronUp className="w-3.5 h-3.5" /></>
                ) : (
                  <>Xem danh mục ({MEMES_TOURNAMENT_CATEGORIES.reduce((acc, curr) => acc + curr.topics.length, 0)} chuyên đề) <ChevronDown className="w-3.5 h-3.5" /></>
                )}
              </button>
            </div>

            {showMemesTopics && (
              <div className="space-y-3 pt-2 border-t border-slate-200/80">
                {/* Level Selector Tabs (THCS vs THPT) - Fully responsive flex-wrap */}
                <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/60 rounded-xl w-full text-xs">
                  <span className="text-[11px] font-semibold text-slate-600 px-1 shrink-0">Cấp độ thi:</span>
                  <button
                    type="button"
                    onClick={() => { setSelectedLevelFilter("ALL"); setSelectedCategoryGroup("Tất cả"); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      selectedLevelFilter === "ALL"
                        ? "bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Tất cả (THCS + THPT)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedLevelFilter("THCS"); setSelectedCategoryGroup("Tất cả"); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedLevelFilter === "THCS"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span>
                    Cấp THCS (Nền tảng chính)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedLevelFilter("THPT"); setSelectedCategoryGroup("Tất cả"); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedLevelFilter === "THPT"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-300"></span>
                    Cấp THPT (Bài khó / Phân loại)
                  </button>
                </div>

                {/* Random Button + Group Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={handleRollRandomCategory}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    Bốc ngẫu nhiên chuyên đề
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedCategoryGroup("Tất cả")}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      selectedCategoryGroup === "Tất cả"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-200/70 text-slate-700 hover:bg-slate-300/70"
                    }`}
                  >
                    Tất cả nhóm
                  </button>

                  {MEMES_TOURNAMENT_CATEGORIES.filter(catGroup => {
                    if (selectedLevelFilter === "ALL") return true;
                    return catGroup.levelBadge === selectedLevelFilter;
                  }).map((catGroup) => (
                    <button
                      key={catGroup.group}
                      type="button"
                      onClick={() => setSelectedCategoryGroup(catGroup.group)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                        selectedCategoryGroup === catGroup.group
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-200/70 text-slate-700 hover:bg-slate-300/70"
                      }`}
                    >
                      <span className={`text-[9px] px-1 py-0.2 rounded font-extrabold ${catGroup.levelBadge === "THCS" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                        {catGroup.levelBadge}
                      </span>
                      {catGroup.group.replace(/^THCS - |^THPT - /, "")}
                    </button>
                  ))}
                </div>

                {/* Topics Pills without stars */}
                <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                  {MEMES_TOURNAMENT_CATEGORIES.filter((g) => {
                    if (selectedLevelFilter !== "ALL" && g.levelBadge !== selectedLevelFilter) return false;
                    if (selectedCategoryGroup !== "Tất cả" && selectedCategoryGroup !== g.group) return false;
                    return true;
                  }).map((g) =>
                    g.topics.map((item) => {
                      const isSelected = category.toLowerCase() === item.name.toLowerCase();
                      return (
                        <button
                          key={item.name}
                          type="button"
                          title={item.desc}
                          onClick={() => setCategory(item.name)}
                          className={`px-2.5 py-1 text-[11px] rounded-lg transition-all cursor-pointer font-medium flex items-center gap-1.5 text-left ${
                            isSelected
                              ? "bg-indigo-600 text-white font-bold shadow-xs ring-1 ring-indigo-600"
                              : "bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700"
                          }`}
                        >
                          <span className={`text-[9px] px-1 py-0.2 rounded font-bold shrink-0 ${
                            isSelected 
                              ? "bg-white/20 text-white" 
                              : item.level === "THCS" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                          }`}>
                            {item.level}
                          </span>
                          <span>{item.name}</span>
                        </button>
                      );
                    })
                  )}
                </div>
                
                <p className="text-[11px] text-slate-500 italic bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                  📌 <strong>Quy định giải đấu:</strong> Đề thi chủ yếu nằm ở kiến thức dành cho học sinh THCS (tương đương HSG cấp Tỉnh/Thành phố THCS). Một số bài khó phân loại có thể sử dụng kiến thức mức THPT (Segment Tree, Fenwick, Đồ thị, Quy hoạch động, Chia để trị).
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Problem Type Selection */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
          <Settings className="w-4 h-4 text-purple-500" />
          Thể loại đề thi / Chấm điểm
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setProblemType('standard')}
            className={`p-3 border rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              problemType === 'standard'
                ? "border-indigo-500 bg-indigo-50/40 text-indigo-950 font-semibold ring-1 ring-indigo-500"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="text-sm font-bold">Standard</span>
            <span className="text-[10px] text-slate-400 mt-1 font-normal">Đơn nghiệm, so khớp đáp án trực tiếp</span>
          </button>

          <button
            type="button"
            onClick={() => setProblemType('checker')}
            className={`p-3 border rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              problemType === 'checker'
                ? "border-indigo-500 bg-indigo-50/40 text-indigo-950 font-semibold ring-1 ring-indigo-500"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="text-sm font-bold">Special Judge</span>
            <span className="text-[10px] text-slate-400 mt-1 font-normal">Đa nghiệm, tự động viết checker.cpp</span>
          </button>

          <button
            type="button"
            onClick={() => setProblemType('interactive')}
            className={`p-3 border rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              problemType === 'interactive'
                ? "border-indigo-500 bg-indigo-50/40 text-indigo-950 font-semibold ring-1 ring-indigo-500"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="text-sm font-bold">Interactive</span>
            <span className="text-[10px] text-slate-400 mt-1 font-normal">Tương tác, tự viết interactive.cpp</span>
          </button>
        </div>
      </div>

      {/* Brief Idea */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-sky-500" />
          Ý tưởng sơ lược hoặc Yêu cầu đặc biệt (Không bắt buộc)
        </label>
        <textarea
          rows={3}
          value={briefIdea}
          onChange={(e) => setBriefIdea(e.target.value)}
          placeholder="Ví dụ: Cho một mảng số nguyên, hãy tìm dãy con dài nhất có tổng chia hết cho K. Hoặc: Hãy lấy cốt truyện về rùa và thỏ thi chạy..."
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all font-medium placeholder:text-slate-400"
        />
        <p className="text-xs text-slate-400 leading-relaxed">
          Nếu bạn nhập ý tưởng, AI sẽ bám sát ý tưởng của bạn và cụ thể hóa thành đề bài hoàn chỉnh, bộ testcase sinh tự động và code giải. Nếu bỏ trống, AI sẽ tự sáng tạo một bài tập hấp dẫn.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer ${
          loading
            ? "bg-indigo-400 cursor-not-allowed"
            : !apiKey.trim()
            ? "bg-slate-400 cursor-not-allowed shadow-none"
            : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300 transform hover:-translate-y-0.5 active:translate-y-0"
        }`}
      >
        <Sparkles className="w-5 h-5" />
        <span>
          {!apiKey.trim()
            ? "Vui lòng nhập API Key để bắt đầu"
            : loading
            ? "Đang thiết kế đề bài với AI..."
            : `Bắt đầu Sinh Đề Bài (${model === "gemini-flash-latest" ? "Vite Flash" : "Gemma 4 CP"})`}
        </span>
      </button>
    </form>
  );
};
