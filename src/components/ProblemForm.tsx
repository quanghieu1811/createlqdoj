import React, { useState, useMemo } from "react";
import { GenerationRequest } from "../types";
import { HelpCircle, Sparkles, BookOpen, Trophy, Settings, Key, Eye, EyeOff, Brain, ChevronDown, ChevronUp, Layers, Tag, Cpu, Edit3, Star, Sliders, Info, FileText, Search, X, Check, Filter } from "lucide-react";

export interface TopicItem {
  name: string;
  level: "THCS" | "THPT";
  stars?: string;
  isNew?: boolean;
  desc?: string;
}

export interface CategoryGroup {
  group: string;
  levelBadge?: "THCS" | "THPT" | "THCS & THPT";
  topics: TopicItem[];
}

export interface StarLevelInfo {
  stars: string;
  countStars: number;
  name: string;
  desc: string;
  colorClass: string;
}

export const STAR_LEVELS: StarLevelInfo[] = [
  {
    stars: "⭐",
    countStars: 1,
    name: "Cơ bản",
    desc: "Cơ bản",
    colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  {
    stars: "⭐⭐",
    countStars: 2,
    name: "HSG QG & ACM ICPC",
    desc: "Kiến thức cần biết để thi HSG QG, ACM ICPC",
    colorClass: "bg-blue-50 text-blue-700 border-blue-200"
  },
  {
    stars: "⭐⭐⭐",
    countStars: 3,
    name: "Giải cao HSG QG",
    desc: "Kiến thức nâng cao, dành cho các bạn có mục tiêu đạt giải cao trong HSG QG",
    colorClass: "bg-purple-50 text-purple-700 border-purple-200"
  },
  {
    stars: "⭐⭐⭐⭐",
    countStars: 4,
    name: "Rất khó",
    desc: "Kiến thức rất khó",
    colorClass: "bg-amber-50 text-amber-700 border-amber-200"
  },
  {
    stars: "⭐⭐⭐⭐⭐",
    countStars: 5,
    name: "Rất chuyên sâu",
    desc: "Kiến thức rất chuyên sâu về một vấn đề nào đó, chỉ áp dụng được với rất ít bài khó",
    colorClass: "bg-rose-50 text-rose-700 border-rose-200"
  }
];

export const MEMES_TOURNAMENT_CATEGORIES: CategoryGroup[] = [
  {
    group: "Nhập môn",
    levelBadge: "THCS",
    topics: [
      { name: "Tầm quan trọng của Thuật Toán", level: "THCS", stars: "⭐", desc: "Tư duy giải quyết vấn đề và nền tảng thuật toán" },
      { name: "Một số tài liệu hay về Thuật Toán", level: "THCS", stars: "⭐", desc: "Tài liệu học tập và rèn luyện CP" },
      { name: "Nghệ thuật giải bài", level: "THCS", stars: "⭐", desc: "Kỹ năng phân tích đề, tìm hướng giải và debug" },
      { name: "Những cách tiếp cận bài toán", level: "THCS", stars: "⭐", desc: "Phương pháp tư duy từ dễ đến khó" },
      { name: "Độ phức tạp thời gian", level: "THCS", stars: "⭐", desc: "Đánh giá Big-O O(1), O(log N), O(N), O(N^2)" }
    ]
  },
  {
    group: "Các kỹ thuật cơ bản",
    levelBadge: "THCS & THPT",
    topics: [
      { name: "Sắp xếp", level: "THCS", stars: "⭐", desc: "Sắp xếp tăng/giảm, comparator đa tiêu chí" },
      { name: "Tìm kiếm nhị phân", level: "THCS", stars: "⭐", desc: "Binary search trên mảng và chặt nhị phân kết quả" },
      { name: "Hai con trỏ", level: "THCS", stars: "⭐", desc: "Two Pointers tìm cặp phần tử, đoạn con liên tiếp" },
      { name: "Phép toán bit", level: "THCS", stars: "⭐", desc: "Bitwise AND, OR, XOR, NOT, dịch bit" },
      { name: "Fun with bits", level: "THCS", stars: "⭐", desc: "Các thủ thuật bitmask tối ưu hiệu năng" },
      { name: "Đệ quy và quay lui", level: "THCS", stars: "⭐", desc: "Duyệt tìm kiếm lời giải toàn diện, sinh tổ hợp/hoán vị" },
      { name: "Rời rạc hoá (nén số)", level: "THCS", stars: "⭐", desc: "Ánh xạ giá trị lớn về phạm vi [1, N]" },
      { name: "Chia đôi tập (Meet in the middle)", level: "THPT", stars: "⭐", desc: "Giảm độ phức tạp từ O(2^N) về O(2^(N/2))" }
    ]
  },
  {
    group: "Cấu trúc dữ liệu",
    levelBadge: "THCS & THPT",
    topics: [
      { name: "Tổng quan về cấu trúc dữ liệu", level: "THCS", stars: "⭐", desc: "Khái niệm và vai trò cấu trúc dữ liệu" },
      { name: "Mảng và danh sách liên kết", level: "THCS", stars: "⭐", desc: "Array, Singly/Doubly Linked List" },
      { name: "Ngăn xếp (Stack)", level: "THCS", stars: "⭐", desc: "LIFO, Monotonic Stack, kiểm tra ngoặc" },
      { name: "Mảng cộng dồn và mảng hiệu", level: "THCS", stars: "⭐", desc: "Prefix sum O(1), Difference array cộng đoạn" },
      { name: "Deque và tìm min max trên đoạn tịnh tiến", level: "THPT", stars: "⭐⭐", desc: "Sliding Window Min/Max O(N)" },
      { name: "Binary Heap", level: "THPT", stars: "⭐⭐", desc: "Hàng đợi ưu tiên Priority Queue" },
      { name: "Bảng băm (Hash table)", level: "THPT", stars: "⭐⭐", desc: "Bảng băm, giải quyết xung đột" },
      { name: "Sparse Table và bài toán RMQ", level: "THPT", stars: "⭐⭐", desc: "Bảng thưa Range Minimum Query O(1)" },
      { name: "Persistent Data Structures", level: "THPT", stars: "⭐⭐⭐", desc: "Cấu trúc dữ liệu bền vững, lưu vết lịch sử" },
      { name: "Skip List", level: "THPT", stars: "⭐⭐⭐", desc: "Danh sách liên kết nhiều tầng" },
      { name: "Nhảy nhị phân với bộ nhớ O(n)", level: "THPT", stars: "⭐⭐⭐", desc: "Binary Lifting tối ưu không gian O(N)" },
      { name: "Static Wavelet Tree", level: "THPT", stars: "⭐⭐⭐", isNew: true, desc: "Cây Wavelet truy vấn phân vị k-th" }
    ]
  },
  {
    group: "Cấu trúc dữ liệu dạng cây",
    levelBadge: "THPT",
    topics: [
      { name: "Cây Phân Đoạn - Segment Tree - Part 1", level: "THPT", stars: "⭐⭐", desc: "Cây phân đoạn cơ bản, cập nhật điểm, truy vấn đoạn" },
      { name: "Cây Phân Đoạn - Segment Tree - Part 2", level: "THPT", stars: "⭐⭐", desc: "Segment Tree Lazy Propagation cập nhật đoạn" },
      { name: "Fenwick Tree (Binary Indexed Tree)", level: "THPT", stars: "⭐⭐", desc: "Cây chỉ số nhị phân BIT tính tổng tiền tố" },
      { name: "Cải tiến Segment Tree", level: "THPT", stars: "⭐⭐⭐", desc: "Segment Tree động, Segment Tree Beats" },
      { name: "Fenwick Tree (Binary Indexed Tree) 2D", level: "THPT", stars: "⭐⭐⭐", desc: "BIT trên bảng 2 chiều và đếm nghịch thế" },
      { name: "Interval Tree trên tập đoạn thẳng", level: "THPT", stars: "⭐⭐⭐⭐", desc: "Cây đoạn thẳng tìm đoạn giao nhau" },
      { name: "Li-chao Tree (Cây phân đoạn trên tập đường thẳng)", level: "THPT", stars: "⭐⭐⭐⭐", desc: "Tối ưu hóa tìm min/max y = ax + b" },
      { name: "Range Tree - thầy Lê Minh Hoàng", level: "THPT", stars: "⭐⭐⭐", desc: "Cây phạm vi đa chiều" }
    ]
  },
  {
    group: "Chia căn",
    levelBadge: "THPT",
    topics: [
      { name: "Chia căn - Part 1", level: "THPT", stars: "⭐", desc: "Kỹ thuật chia khối Sqrt Decomposition cơ bản" },
      { name: "Chia căn - Part 2", level: "THPT", stars: "⭐⭐", desc: "Chia căn trên truy vấn và cập nhật" },
      { name: "Chia căn - Phần I (Mo's Algorithm)", level: "THPT", stars: "⭐⭐", isNew: true, desc: "Thuật toán Mo giải truy vấn offline O((N+Q)sqrt(N))" },
      { name: "Chia căn - Phần II (Block Decomposition)", level: "THPT", stars: "⭐⭐⭐", isNew: true, desc: "Chia căn nâng cao trên cây và đồ thị" }
    ]
  },
  {
    group: "Xử lý xâu",
    levelBadge: "THCS & THPT",
    topics: [
      { name: "Tổng quan về Xử lý xâu", level: "THCS", stars: "⭐⭐", desc: "Xâu ký tự, chuẩn hóa, đếm ký tự" },
      { name: "KMP (Knuth-Morris-Pratt)", level: "THPT", stars: "⭐⭐", desc: "Khớp mẫu xâu nhanh với mảng tiền tố pi" },
      { name: "Trie (Cây tiền tố)", level: "THPT", stars: "⭐⭐", desc: "Cây tiền tố tra cứu từ điển và XOR lớn nhất" },
      { name: "Hash (Bảng băm xâu)", level: "THPT", stars: "⭐⭐", desc: "Rolling Hash so sánh xâu con O(1)" },
      { name: "Manacher", level: "THPT", stars: "⭐⭐", desc: "Tìm xâu con đối xứng dài nhất O(N)" },
      { name: "Z-function", level: "THPT", stars: "⭐⭐⭐", desc: "Hàm Z tính độ dài tiền tố chung lớn nhất" },
      { name: "Aho-Corasick", level: "THPT", stars: "⭐⭐⭐", desc: "Tự động tìm kiếm nhiều mẫu đồng thời" },
      { name: "Suffix Array", level: "THPT", stars: "⭐⭐⭐⭐", desc: "Mảng hậu tố và mảng LCP" },
      { name: "Suffix Automaton", level: "THPT", stars: "⭐⭐⭐⭐", desc: "Automaton hậu tố mạnh mẽ cho xử lý xâu" },
      { name: "Palindrome Tree", level: "THPT", stars: "⭐⭐⭐⭐", desc: "Cây đối xứng Eertree" },
      { name: "Suffix Tree", level: "THPT", stars: "⭐⭐⭐⭐", desc: "Cây hậu tố Ukkonen" }
    ]
  },
  {
    group: "Quy hoạch động",
    levelBadge: "THCS & THPT",
    topics: [
      { name: "Nhập môn Quy hoạch động", level: "THCS", stars: "⭐⭐", desc: "Khái niệm bài toán con gối nhau và cấu trúc con tối ưu" },
      { name: "Quy hoạch động cơ bản (Phần 1)", level: "THCS", stars: "⭐⭐", desc: "QHĐ 1 chiều: Dãy con tăng dài nhất (LIS), Fibonacci" },
      { name: "Quy hoạch động cơ bản (Phần 2)", level: "THCS", stars: "⭐⭐", desc: "QHĐ 2 chiều: Xâu con chung dài nhất (LCS), đường đi trên lưới" },
      { name: "Quy hoạch động cái túi (DP Knapsack), phần 1", level: "THCS", stars: "⭐⭐", desc: "Bài toán cái túi 0/1 và cái túi không giới hạn" },
      { name: "Một vài bài tập về Palindrome", level: "THCS", stars: "⭐⭐", desc: "QHĐ biến đổi xâu thành đối xứng, đếm xâu đối xứng" },
      { name: "Một số bài toán QHĐ điển hình", level: "THCS", stars: "⭐⭐", desc: "Coin Change, Edit Distance, Matrix Chain Multiplication" },
      { name: "Quy hoạch động cái túi (DP Knapsack), phần 2", level: "THPT", stars: "⭐⭐⭐⭐", desc: "Cái túi đa chiều, tối ưu chia căn / bitset" },
      { name: "Phân tích về QHĐ - Thầy Lê Minh Hoàng", level: "THPT", stars: "⭐⭐⭐", desc: "Tư duy mô hình hóa trạng thái và bảng phương án" },
      { name: "Quy hoạch động Bitmask", level: "THPT", stars: "⭐⭐", desc: "QHĐ trạng thái trên tập hợp con N <= 20" },
      { name: "Quy hoạch động chữ số", level: "THPT", stars: "⭐⭐", desc: "Digit DP đếm số thỏa mãn tính chất trong đoạn [L, R]" },
      { name: "Quy hoạch động trên DAG", level: "THPT", stars: "⭐⭐", desc: "Đường đi dài nhất/ngắn nhất trên đồ thị có hướng không chu trình" },
      { name: "Quy hoạch động Chia để trị", level: "THPT", stars: "⭐⭐⭐", desc: "Divide & Conquer Optimization khi nghiệm đơn điệu" },
      { name: "Một số kĩ thuật tối ưu hoá QHĐ", level: "THPT", stars: "⭐⭐⭐", desc: "Tối ưu hóa bảng phương án và không gian bộ nhớ" },
      { name: "Tối ưu quy hoạch động 1 chiều (1D1D)", level: "THPT", stars: "⭐⭐⭐", desc: "Tối ưu QHĐ dạng dp[i] = min(dp[j] + cost(j, i))" },
      { name: "Kĩ thuật Bao lồi trong QHĐ", level: "THPT", stars: "⭐⭐⭐", desc: "Convex Hull Trick (CHT) tối ưu đường thẳng" },
      { name: "Quy hoạch động trên cây", level: "THPT", stars: "⭐⭐⭐", desc: "Tree DP tính toán kết quả từ nút lá lên gốc" },
      { name: "Quy hoạch động SOS - Phần 1", level: "THPT", stars: "⭐⭐⭐", desc: "Sum Over Subsets DP tính tổng trên tất cả tập con O(N*2^N)" },
      { name: "Quy hoạch động SOS - Phần 2", level: "THPT", stars: "⭐⭐⭐⭐", desc: "Ứng dụng SOS DP trong bài toán tích chập Fast Walsh-Hadamard" }
    ]
  },
  {
    group: "Lý thuyết đồ thị",
    levelBadge: "THCS & THPT",
    topics: [
      { name: "Tổng quan về lý thuyết đồ thị", level: "THCS", stars: "⭐⭐", desc: "Đỉnh, cạnh, bậc, đường đi, chu trình" },
      { name: "Các chủ đề cơ bản về đồ thị", level: "THCS", stars: "⭐⭐", desc: "Biểu diễn đồ thị bằng ma trận kề, danh sách kề" },
      { name: "Disjoint Set Union (DSU)", level: "THCS", stars: "⭐⭐", desc: "Cấu trúc các tập hợp rời nhau với nén đường đi" },
      { name: "Thuật toán duyệt đồ thị theo chiều rộng (BFS)", level: "THCS", stars: "⭐⭐", desc: "Tìm đường đi ngắn nhất đồ thị không trọng số" },
      { name: "Thuật toán duyệt đồ thị theo chiều sâu (DFS)", level: "THCS", stars: "⭐⭐", desc: "Khớp, cầu, thành phần liên thông cơ bản" },
      { name: "Thuật toán BFS 0-1", level: "THPT", stars: "⭐⭐", desc: "Duyệt tìm đường đi ngắn nhất với trọng số 0 và 1 dùng Deque" },
      { name: "Sắp xếp Tô-pô", level: "THPT", stars: "⭐⭐", desc: "Topological Sort trên đồ thị có hướng không chu trình (DAG)" },
      { name: "Đường đi - Chu trình Euler", level: "THPT", stars: "⭐⭐", desc: "Thuật toán Hierholzer tìm chu trình Euler" },
      { name: "Phần 1: DFS trên DAG; thuật toán Dijkstra", level: "THPT", stars: "⭐⭐", desc: "Tìm đường đi ngắn nhất trọng số không âm với Priority Queue" },
      { name: "Phần 2: Xử lý chu trình âm (Bellman-Ford)", level: "THPT", stars: "⭐⭐", desc: "Đường đi ngắn nhất trọng số âm & phát hiện chu trình âm" },
      { name: "Phần 3: Thuật toán SPFA", level: "THPT", stars: "⭐⭐", desc: "Shortest Path Faster Algorithm cải tiến Bellman-Ford" },
      { name: "Cây khung nhỏ nhất trên đồ thị vô hướng", level: "THPT", stars: "⭐⭐", desc: "Thuật toán Kruskal và Prim tìm MST" },
      { name: "Disjoint Set Union (DSU) Rollback", level: "THPT", stars: "⭐⭐⭐", desc: "DSU có thể hoàn tác trạng thái lịch sử" },
      { name: "Bài toán 2-SAT", level: "THPT", stars: "⭐⭐⭐", desc: "Giải bài toán 2-Satisfiability qua thành phần liên thông mạnh" },
      { name: "Bài toán Luồng cực đại trên mạng", level: "THPT", stars: "⭐⭐⭐", desc: "Thuật toán Ford-Fulkerson, Edmonds-Karp, Dinic" },
      { name: "Luồng với chi phí cực tiểu", level: "THPT", stars: "⭐⭐⭐", desc: "Min Cost Max Flow (MCMF)" },
      { name: "Cặp ghép cực đại", level: "THPT", stars: "⭐⭐⭐", desc: "Cặp ghép cực đại trên đồ thị hai phía (Hopcroft-Karp / Kuhn)" },
      { name: "Ứng dụng của luồng trên mạng", level: "THPT", stars: "⭐⭐⭐", desc: "Lát cắt hẹp nhất (Min-Cut), Định lý Hall, Định lý Dilworth" },
      { name: "Đường đi Euler trên cây", level: "THPT", stars: "⭐⭐", desc: "Euler Tour Technique trên cây" },
      { name: "Lowest Common Ancestor (LCA)", level: "THPT", stars: "⭐⭐", desc: "Tổ tiên chung gần nhất bằng Binary Lifting" },
      { name: "Bài toán RMQ & Bài toán LCA", level: "THPT", stars: "⭐⭐", desc: "Chuyển đổi bài toán LCA sang RMQ bằng Euler Tour" },
      { name: "Bài toán Lubenica - RMQ trên cây", level: "THPT", stars: "⭐⭐", desc: "Tìm min/max trọng số cạnh trên đường đi giữa u và v" },
      { name: "Heavy Light Decomposition (HLD)", level: "THPT", stars: "⭐⭐⭐", desc: "Phân rã cây thành các chuỗi nặng-nhẹ để truy vấn đường đi" },
      { name: "Các phương pháp giải bài toán LCA", level: "THPT", stars: "⭐⭐⭐", desc: "Tổng hợp các kỹ thuật giải LCA: Tarjan, Farach-Colton" },
      { name: "Thuật toán phân tách trọng tâm", level: "THPT", stars: "⭐⭐⭐", desc: "Centroid Decomposition giải bài toán đường đi trên cây" }
    ]
  },
  {
    group: "Tham lam",
    levelBadge: "THCS & THPT",
    topics: [
      { name: "Thuật toán Tham lam (Greedy)", level: "THCS", stars: "⭐⭐", desc: "Lựa chọn tối ưu cục bộ dẫn tới tối ưu toàn cục" },
      { name: "Lý thuyết Matroid", level: "THPT", stars: "⭐⭐⭐⭐", desc: "Cơ sở toán học chứng minh thuật toán tham lam" }
    ]
  },
  {
    group: "Toán học & Số học",
    levelBadge: "THCS & THPT",
    topics: [
      { name: "Modulo cơ bản", level: "THCS", stars: "⭐", desc: "Phép toán cộng, trừ, nhân lấy dư (a+b)%M, (a*b)%M" },
      { name: "Ước chung lớn nhất & Thuật toán Euclid", level: "THCS", stars: "⭐", desc: "GCD, LCM và thuật toán Euclid mở rộng" },
      { name: "a^b mod c - Lũy thừa nhị phân", level: "THCS", stars: "⭐", desc: "Tính lũy thừa nhanh O(log b)" },
      { name: "Sàng nguyên tố", level: "THCS", stars: "⭐", desc: "Sàng Eratosthenes, sàng nguyên tố đoạn [L, R]" },
      { name: "Kiểm tra số nguyên tố", level: "THCS", stars: "⭐⭐", desc: "Kiểm tra căn N và thuật toán ngẫu suất Miller-Rabin" },
      { name: "Phân tích thừa số nguyên tố", level: "THCS", stars: "⭐⭐", desc: "Phân tích N thành tích các số nguyên tố, Pollard's rho" },
      { name: "Số các ước và Tổng các ước", level: "THCS", stars: "⭐", desc: "Hàm d(n) và sigma(n) qua phân tích thừa số nguyên tố" },
      { name: "Tính tổ hợp nCk", level: "THCS", stars: "⭐⭐", desc: "Tam giác Pascal và công thức n! / (k! * (n-k)!) mod M" },
      { name: "Nghịch đảo modulo", level: "THPT", stars: "⭐⭐", desc: "Nghịch đảo modulo theo định lý Fermat nhỏ và Euclid mở rộng" },
      { name: "Định lý Wilson", level: "THPT", stars: "⭐⭐", desc: "(p-1)! = -1 (mod p) với p là số nguyên tố" },
      { name: "Định lý Lucas", level: "THPT", stars: "⭐⭐", desc: "Tính nCk mod p nhanh với p nguyên tố nhỏ" },
      { name: "Định lý Thặng dư Trung Hoa (CRT)", level: "THPT", stars: "⭐⭐", desc: "Giải hệ phương trình đồng dư Chinese Remainder Theorem" },
      { name: "Phi hàm Euler", level: "THPT", stars: "⭐⭐", desc: "Hàm phi(n) đếm số nguyên tố cùng nhau với n" },
      { name: "Hàm Mobius", level: "THPT", stars: "⭐⭐⭐⭐", desc: "Hàm Mobius mu(n) và công thức nghịch đảo Mobius" },
      { name: "Hàm nhân tính (Multiplicative Function)", level: "THPT", stars: "⭐⭐⭐⭐", desc: "Hàm nhân tính và sàng tuyến tính" },
      { name: "Giai thừa modulo nguyên tố", level: "THPT", stars: "⭐⭐⭐", desc: "Tính n! mod p trong thời gian O(p log n) hoặc O(sqrt(p) log p)" },
      { name: "Căn bậc hai modulo", level: "THPT", stars: "⭐⭐⭐", desc: "Thuật toán Tonelli-Shanks giải x^2 = a (mod p)" },
      { name: "Logarit rời rạc", level: "THPT", stars: "⭐⭐⭐", desc: "Thuật toán Baby-step Giant-step giải a^x = b (mod m)" }
    ]
  },
  {
    group: "Tổ hợp và Xác suất",
    levelBadge: "THCS & THPT",
    topics: [
      { name: "Các kiến thức cơ bản về Tổ hợp (Combinatorics)", level: "THCS", stars: "⭐⭐", desc: "Quy tắc cộng, quy tắc nhân, hoán vị, chỉnh hợp, tổ hợp" },
      { name: "Xác suất (Probabilities)", level: "THPT", stars: "⭐⭐", desc: "Không gian mẫu, biến cố, xác suất cổ điển, kỳ vọng toán học" },
      { name: "Bao hàm - Loại trừ (Principle of Inclusion-Exclusion)", level: "THPT", stars: "⭐⭐", desc: "Nguyên lý bù trừ PIE tính kích thước hợp các tập hợp" }
    ]
  },
  {
    group: "Hình học",
    levelBadge: "THCS & THPT",
    topics: [
      { name: "Hình học tính toán phần 1: Khái niệm", level: "THCS", stars: "⭐", desc: "Tọa độ điểm, vector, tích vô hướng, tích có hướng" },
      { name: "Hình học tính toán phần 2: Giao điểm", level: "THCS", stars: "⭐", desc: "Giao điểm đường thẳng, đoạn thẳng, khoảng cách" },
      { name: "Hình học tính toán phần 3: Đa giác", level: "THCS", stars: "⭐", desc: "Diện tích đa giác (Shoelace formula), kiểm tra điểm trong đa giác" },
      { name: "Thuật toán đường quét (sweep line)", level: "THPT", stars: "⭐⭐", desc: "Sweep line tìm cặp đoạn thẳng giao nhau, diện tích hợp hình chữ nhật" },
      { name: "Bao lồi (Convex Hull)", level: "THPT", stars: "⭐⭐⭐", desc: "Thuật toán Graham Scan, Monotone Chain tìm bao lồi O(N log N)" },
      { name: "Sum-constrained convex optimization", level: "THPT", stars: "⭐⭐⭐⭐⭐", desc: "Tối ưu hóa lồi có ràng buộc tổng" },
      { name: "Tổng Minkowski", level: "THPT", stars: "⭐⭐⭐⭐⭐", desc: "Tổng Minkowski của hai đa giác lồi" }
    ]
  },
  {
    group: "Đại số - Giải tích",
    levelBadge: "THPT",
    topics: [
      { name: "Nhân ma trận", level: "THPT", stars: "⭐⭐⭐", desc: "Nhân ma trận và lũy thừa ma trận giải bài toán quy hoạch động" },
      { name: "Khử nhân ma trận", level: "THPT", stars: "⭐⭐⭐", desc: "Phép khử Gauss-Jordan giải hệ phương trình tuyến tính" },
      { name: "Áp dụng bất ngờ của đạo hàm", level: "THPT", stars: "⭐⭐⭐", desc: "Ứng dụng đạo hàm tìm cực trị và khảo sát hàm" },
      { name: "Nhân nhanh đa thức - FFT", level: "THPT", stars: "⭐⭐⭐⭐", desc: "Biến đổi Fourier nhanh (Fast Fourier Transform) nhân đa thức O(N log N)" }
    ]
  },
  {
    group: "Lý thuyết trò chơi",
    levelBadge: "THPT",
    topics: [
      { name: "Trò chơi Nim & Định lý Sprague-Grundy", level: "THPT", stars: "⭐⭐⭐", desc: "Trò chơi tổ hợp vô hướng, tính hàm Grundy và phép XOR" },
      { name: "Giải thuật cắt tỉa Alpha-Beta", level: "THPT", stars: "⭐⭐⭐", desc: "Tìm kiếm nước đi tối ưu trên cây trò chơi Minimax" }
    ]
  },
  {
    group: "Tối ưu hoá",
    levelBadge: "THCS & THPT",
    topics: [
      { name: "Chia để trị", level: "THCS", stars: "⭐⭐", desc: "Phương pháp chia nhỏ bài toán con độc lập" },
      { name: "Chia để trị Chen Danqi", level: "THPT", stars: "⭐⭐", desc: "Thuật toán CDQ Divide and Conquer giải bài toán truy vấn offline đa chiều" },
      { name: "Chặt nhị phân song song", level: "THPT", stars: "⭐⭐⭐", desc: "Parallel Binary Search giải đồng thời Q truy vấn" },
      { name: "Tìm kiếm tam phân - Ternary Search", level: "THPT", stars: "⭐⭐⭐", desc: "Tìm cực trị của hàm đơn đỉnh (Unimodal function)" },
      { name: "Local Search", level: "THPT", stars: "⭐⭐⭐", desc: "Thuật toán tìm kiếm cục bộ và tôi luyện kim loại (Simulated Annealing)" }
    ]
  }
];

interface ProblemFormProps {
  onSubmit: (request: GenerationRequest) => void;
  loading: boolean;
  apiKey: string;
  setApiKey: (key: string) => void;
  model: string;
  setModel: (m: string) => void;
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
  const [testCount, setTestCount] = useState<number>(100);
  const [briefIdea, setBriefIdea] = useState<string>("");
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<"ALL" | "THCS" | "THPT">("ALL");
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState<string>("Tất cả");
  const [selectedStarFilter, setSelectedStarFilter] = useState<string>("ALL");
  const [showStarGuide, setShowStarGuide] = useState<boolean>(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState<boolean>(false);
  const [searchTopicQuery, setSearchTopicQuery] = useState<string>("");
  const [isCustomModelMode, setIsCustomModelMode] = useState<boolean>(() => {
    return model !== "gemini-flash-latest" && model !== "gemini-flash-lite-latest" && model !== "gemma-4-31b-it";
  });
  const [customModelText, setCustomModelText] = useState<string>(() => {
    if (model !== "gemini-flash-latest" && model !== "gemini-flash-lite-latest" && model !== "gemma-4-31b-it") {
      return model;
    }
    return "";
  });

  const POPULAR_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-pro"
  ];

  const POPULAR_SHORTCUTS = [
    "Quy hoạch động",
    "Cây phân đoạn (Segment Tree)",
    "Đồ thị (Dijkstra / DFS)",
    "Hình học tính toán",
    "Duyệt nhánh cận",
    "Quy hoạch động trên cây"
  ];

  const allCatalogTopics = useMemo(() => {
    return MEMES_TOURNAMENT_CATEGORIES.flatMap((g) =>
      g.topics.map((t) => ({ ...t, groupName: g.group }))
    );
  }, []);

  const currentTopicMeta = useMemo(() => {
    if (!category) return null;
    return allCatalogTopics.find(
      (t) => t.name.toLowerCase().trim() === category.toLowerCase().trim()
    );
  }, [category, allCatalogTopics]);

  const filteredModalTopics = useMemo(() => {
    const query = searchTopicQuery.toLowerCase().trim();
    return allCatalogTopics.filter((item) => {
      if (selectedLevelFilter !== "ALL" && item.level !== selectedLevelFilter) return false;
      if (selectedStarFilter !== "ALL" && item.stars !== selectedStarFilter) return false;
      if (selectedCategoryGroup !== "Tất cả" && item.groupName !== selectedCategoryGroup) return false;
      if (query) {
        const matchName = item.name.toLowerCase().includes(query);
        const matchDesc = item.desc ? item.desc.toLowerCase().includes(query) : false;
        const matchGroup = item.groupName.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchGroup) return false;
      }
      return true;
    });
  }, [allCatalogTopics, searchTopicQuery, selectedLevelFilter, selectedStarFilter, selectedCategoryGroup]);

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
    if (selectedStarFilter !== "ALL") {
      candidateTopics = candidateTopics.filter(t => t.stars === selectedStarFilter);
    }
    if (candidateTopics.length === 0) {
      candidateTopics = MEMES_TOURNAMENT_CATEGORIES.flatMap(g => g.topics);
    }
    const randomIndex = Math.floor(Math.random() * candidateTopics.length);
    return candidateTopics[randomIndex].name;
  };

  // Function to pick a random topic specifically by star difficulty rating
  const handleRollRandomByStar = (starRating?: string) => {
    const targetStar = starRating || (selectedStarFilter !== "ALL" ? selectedStarFilter : "⭐");
    let candidateTopics = MEMES_TOURNAMENT_CATEGORIES.flatMap(g => g.topics);

    if (targetStar) {
      candidateTopics = candidateTopics.filter(t => t.stars === targetStar);
    }
    if (selectedLevelFilter !== "ALL") {
      const levelMatches = candidateTopics.filter(t => t.level === selectedLevelFilter);
      if (levelMatches.length > 0) {
        candidateTopics = levelMatches;
      }
    }
    if (selectedCategoryGroup !== "Tất cả") {
      const groupObj = MEMES_TOURNAMENT_CATEGORIES.find(g => g.group === selectedCategoryGroup);
      if (groupObj) {
        const groupMatches = candidateTopics.filter(t => groupObj.topics.some(gt => gt.name === t.name));
        if (groupMatches.length > 0) {
          candidateTopics = groupMatches;
        }
      }
    }
    if (candidateTopics.length === 0) {
      candidateTopics = MEMES_TOURNAMENT_CATEGORIES.flatMap(g => g.topics).filter(t => t.stars === targetStar);
      if (candidateTopics.length === 0) {
        candidateTopics = MEMES_TOURNAMENT_CATEGORIES.flatMap(g => g.topics);
      }
    }

    if (candidateTopics.length > 0) {
      const randomIndex = Math.floor(Math.random() * candidateTopics.length);
      const chosen = candidateTopics[randomIndex];
      setCategory(chosen.name);
      if (chosen.stars) {
        setSelectedStarFilter(chosen.stars);
      }
    }
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

    let finalModel = model.trim();
    if (!finalModel) {
      finalModel = "gemini-flash-latest";
    }

    const validatedTestCount = testCount && testCount >= 5 && testCount <= 200 ? testCount : 100;

    onSubmit({
      rating: finalRating,
      category: finalCategory,
      briefIdea: briefIdea.trim() ? briefIdea : undefined,
      problemType,
      testCount: validatedTestCount,
      model: finalModel
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

      {/* MODEL SELECTION & CUSTOM MODEL INPUT */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-indigo-600" />
            Mô hình thiết kế AI (AI Model)
          </label>
          <span className="text-xs font-mono bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-md border border-indigo-100">
            {model}
          </span>
        </div>

        {/* 4 Cards Grid: 3 presets + 1 custom trigger */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Preset 1: gemini-flash-latest */}
          <button
            type="button"
            onClick={() => {
              setModel('gemini-flash-latest');
              setIsCustomModelMode(false);
            }}
            className={`p-3 border rounded-xl flex flex-col items-start cursor-pointer transition-all ${
              !isCustomModelMode && model === 'gemini-flash-latest'
                ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 text-indigo-950 shadow-xs"
                : "border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-slate-100/70"
            }`}
          >
            <div className="flex items-center gap-1.5 w-full justify-between">
              <span className="text-xs font-bold truncate">gemini-flash-latest</span>
              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[8px] font-extrabold rounded uppercase shrink-0">
                Khuyên dùng
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 text-left line-clamp-2">
              Siêu nhanh, phản hồi tức thì, tối ưu cấu trúc dữ liệu.
            </span>
          </button>

          {/* Preset 2: gemini-flash-lite-latest */}
          <button
            type="button"
            onClick={() => {
              setModel('gemini-flash-lite-latest');
              setIsCustomModelMode(false);
            }}
            className={`p-3 border rounded-xl flex flex-col items-start cursor-pointer transition-all ${
              !isCustomModelMode && model === 'gemini-flash-lite-latest'
                ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 text-indigo-950 shadow-xs"
                : "border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-slate-100/70"
            }`}
          >
            <div className="flex items-center gap-1.5 w-full justify-between">
              <span className="text-xs font-bold truncate">gemini-flash-lite-latest</span>
              <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[8px] font-extrabold rounded uppercase shrink-0">
                Mới
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 text-left line-clamp-2">
              Tốc độ tối đa, cực kỳ nhẹ và tối ưu chi phí token.
            </span>
          </button>

          {/* Preset 3: gemma-4-31b-it */}
          <button
            type="button"
            onClick={() => {
              setModel('gemma-4-31b-it');
              setIsCustomModelMode(false);
            }}
            className={`p-3 border rounded-xl flex flex-col items-start cursor-pointer transition-all ${
              !isCustomModelMode && model === 'gemma-4-31b-it'
                ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 text-indigo-950 shadow-xs"
                : "border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-slate-100/70"
            }`}
          >
            <div className="flex items-center gap-1.5 w-full justify-between">
              <span className="text-xs font-bold truncate">gemma-4-31b-it</span>
              <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 text-[8px] font-extrabold rounded uppercase shrink-0">
                Chuyên gia
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 text-left line-clamp-2">
              Chuyên gia CP, giải thuật chuyên sâu & tư duy toán học.
            </span>
          </button>

          {/* Option 4: Tự nhập mô hình (Custom Model) */}
          <button
            type="button"
            onClick={() => {
              setIsCustomModelMode(true);
              if (customModelText.trim()) {
                setModel(customModelText.trim());
              }
            }}
            className={`p-3 border rounded-xl flex flex-col items-start cursor-pointer transition-all ${
              isCustomModelMode
                ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 text-indigo-950 shadow-xs"
                : "border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-slate-100/70"
            }`}
          >
            <div className="flex items-center gap-1.5 w-full justify-between">
              <span className="text-xs font-bold flex items-center gap-1">
                <Edit3 className="w-3 h-3 text-indigo-600" />
                Tự nhập mô hình
              </span>
              <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 text-[8px] font-extrabold rounded uppercase shrink-0">
                Tùy chỉnh
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 text-left line-clamp-2">
              Tùy ý nhập bất kỳ model ID nào (gemini-2.5-pro, v.v.).
            </span>
          </button>
        </div>

        {/* Custom Model Input Area */}
        {isCustomModelMode && (
          <div className="p-3.5 bg-slate-50/90 border border-indigo-200 rounded-xl space-y-2.5 animate-fade-in shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                Nhập tên mã mô hình (Model Identifier):
              </label>
              <span className="text-[10px] text-slate-400">
                (VD: gemini-2.5-pro, gemini-2.0-flash,...)
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={customModelText}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomModelText(val);
                  setModel(val.trim() || "gemini-flash-latest");
                }}
                placeholder="Nhập Model ID (ví dụ: gemini-2.5-flash, gemini-2.5-pro, models/...)"
                className="w-full px-3.5 py-2 bg-white border border-indigo-200 rounded-lg text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-inner"
              />
            </div>

            {/* Quick-select chips for popular models */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-500">Gợi ý nhanh:</span>
              {POPULAR_MODELS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setCustomModelText(m);
                    setModel(m);
                  }}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded-md border transition-all cursor-pointer ${
                    model === m
                      ? "bg-indigo-600 text-white font-bold border-indigo-600"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-indigo-50 hover:border-indigo-200"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 1. Độ khó mong muốn (Rating) */}
      <div className="space-y-3 p-4 sm:p-5 bg-slate-50/90 border border-slate-200/90 rounded-2xl shadow-xs transition-all">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Độ khó mong muốn (Rating)</span>
          </label>
          
          <div className="flex items-center gap-2">
            {/* Dynamic Rating Tier Badge */}
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
              rating <= 1100 ? "bg-slate-100 text-slate-700 border-slate-300" :
              rating <= 1400 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
              rating <= 1800 ? "bg-blue-50 text-blue-700 border-blue-200" :
              rating <= 2100 ? "bg-purple-50 text-purple-700 border-purple-200" :
              rating <= 2500 ? "bg-amber-50 text-amber-800 border-amber-300" :
              "bg-rose-50 text-rose-700 border-rose-300"
            }`}>
              {rating <= 1100 ? "Newbie • Nhập môn" :
               rating <= 1400 ? "Pupil / Specialist • Cơ bản" :
               rating <= 1800 ? "Expert • HSG Tỉnh & TP" :
               rating <= 2100 ? "Candidate Master • HSG Quốc gia" :
               rating <= 2500 ? "Master / GM • Chọn ĐTQG & ACM" :
               "Grandmaster • Olympic Quốc tế"}
            </span>

            <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-0.5 rounded-full font-extrabold border border-indigo-200 font-mono">
              Rating: {isRandomRating ? `${rating} (Ngẫu nhiên)` : rating}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 pt-1">
          {isRandomRating ? (
            <div className="flex-1 py-2.5 px-4 bg-indigo-50/80 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-950 font-semibold animate-fade-in">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                Đã bốc ngẫu nhiên mức rating: <strong className="text-indigo-700 text-sm font-mono font-bold">{rating}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRollRandomRating}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Bốc lại
                </button>
                <button
                  type="button"
                  onClick={() => setIsRandomRating(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline font-semibold cursor-pointer px-1"
                >
                  Chỉnh tay
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
                className="flex-1 h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex items-center gap-1.5">
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
                  className="w-20 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-extrabold text-slate-800 text-center focus:ring-2 focus:ring-indigo-500 shadow-inner"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
          {!isRandomRating ? (
            <button
              type="button"
              onClick={handleRollRandomRating}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1.5 cursor-pointer transition-all bg-indigo-50/90 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 shadow-2xs hover:scale-[1.01]"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              Bốc ngẫu nhiên rating (800 - 3500)
            </button>
          ) : (
            <div />
          )}
          <p className="text-[11px] text-slate-400">
            Thang điểm 800 (Rất dễ) đến 3500 (Thách đấu chuẩn ICPC/VNOI).
          </p>
        </div>
      </div>

      {/* 2. Chủ đề thuật toán (Algorithm Topics & VNOI Library) - NẰM NGAY DƯỚI ĐỘ KHÓ */}
      <div className="space-y-3.5 p-4 sm:p-5 bg-slate-50/90 border border-slate-200/90 rounded-2xl shadow-xs transition-all">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <span>Chủ đề thuật toán / Chuyên đề VNOI</span>
          </label>
          <button
            type="button"
            onClick={() => setIsTopicModalOpen(true)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1.5 cursor-pointer bg-white hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 transition-all shadow-2xs hover:scale-[1.02]"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>📚 Thư viện chuyên đề</span>
            <span className="px-2 py-0.2 bg-indigo-100 text-indigo-900 text-[10px] font-extrabold rounded-full">
              {allCatalogTopics.length}
            </span>
          </button>
        </div>

        {/* Search/Type Input with Quick Actions */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              required
              placeholder="Nhập tên thuật toán hoặc chọn từ thư viện chuyên đề..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium text-slate-800 transition-all placeholder:text-slate-400 shadow-inner"
            />
            {category && (
              <button
                type="button"
                onClick={() => setCategory("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title="Xóa chủ đề"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleRollRandomCategory}
            title="Bốc ngẫu nhiên một chuyên đề bất kỳ"
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">Bốc ngẫu nhiên</span>
            <span className="sm:hidden">Random</span>
          </button>

          <button
            type="button"
            onClick={() => setIsTopicModalOpen(true)}
            title="Mở thư viện chọn chuyên đề chuẩn"
            className="px-3.5 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Tra cứu</span>
          </button>
        </div>

        {/* Active Topic Info Card (if matched in VNOI Catalog) */}
        {currentTopicMeta ? (
          <div className="flex items-center justify-between gap-3 p-3 bg-indigo-50/80 border border-indigo-150 rounded-xl text-xs flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                currentTopicMeta.level === "THCS" ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-purple-100 text-purple-700 border border-purple-200"
              }`}>
                {currentTopicMeta.level}
              </span>
              {currentTopicMeta.stars && (
                <span className="px-2 py-0.5 bg-amber-100/90 text-amber-900 border border-amber-200 rounded-md font-bold font-mono tracking-tight flex items-center gap-1">
                  <span>{currentTopicMeta.stars}</span>
                  <span className="text-[10px] font-sans font-semibold text-amber-800 hidden sm:inline">
                    ({STAR_LEVELS.find(s => s.stars === currentTopicMeta.stars)?.name || "Chuẩn"})
                  </span>
                </span>
              )}
              <span className="text-[11px] font-bold text-slate-700">
                [{currentTopicMeta.groupName}]
              </span>
              <span className="text-slate-600 text-[11px] truncate max-w-xs md:max-w-md" title={currentTopicMeta.desc}>
                {currentTopicMeta.desc}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsTopicModalOpen(true)}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 underline font-bold shrink-0 ml-auto cursor-pointer"
            >
              Đổi chuyên đề →
            </button>
          </div>
        ) : (
          <p className="text-[11px] text-slate-400">
            Bạn có thể tự nhập bất kỳ chủ đề toán/thuật toán nào, hoặc mở thư viện để chọn chuyên đề chuẩn.
          </p>
        )}

        {/* Quick Random by Star Difficulty (1 Compact Row) */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
            Bốc theo sao:
          </span>
          {STAR_LEVELS.map((st) => (
            <button
              key={st.stars}
              type="button"
              onClick={() => handleRollRandomByStar(st.stars)}
              title={`Bốc ngẫu nhiên 1 chủ đề ${st.stars}: ${st.name} (${st.desc})`}
              className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-white hover:bg-amber-500 hover:text-white text-amber-900 border border-amber-200/90 transition-all cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
            >
              <span className="font-mono text-[10px]">{st.stars}</span>
              <span className="text-[10px]">{st.name.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {/* Popular Shortcuts (1 Compact Row) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">Gợi ý nhanh:</span>
          {POPULAR_SHORTCUTS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                category === item
                  ? "bg-indigo-600 text-white font-bold shadow-2xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Grid: Thể loại đề thi (Problem Type) & Số lượng Testcase (Test Count) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
        {/* Problem Type Selection */}
        <div className="space-y-3 p-4 sm:p-5 bg-slate-50/90 border border-slate-200/90 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Settings className="w-4 h-4 text-purple-500" />
              <span>Thể loại đề thi / Chấm điểm</span>
            </label>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-200">
              {problemType}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setProblemType('standard')}
              className={`p-2.5 border rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                problemType === 'standard'
                  ? "border-indigo-500 bg-indigo-50/80 text-indigo-950 font-bold ring-2 ring-indigo-500/20 shadow-xs"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <span className="text-xs font-bold">Standard</span>
              <span className="text-[10px] text-slate-400 mt-0.5 font-normal">Đơn nghiệm</span>
            </button>

            <button
              type="button"
              onClick={() => setProblemType('checker')}
              className={`p-2.5 border rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                problemType === 'checker'
                  ? "border-indigo-500 bg-indigo-50/80 text-indigo-950 font-bold ring-2 ring-indigo-500/20 shadow-xs"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <span className="text-xs font-bold">Special Judge</span>
              <span className="text-[10px] text-slate-400 mt-0.5 font-normal">Đa nghiệm</span>
            </button>

            <button
              type="button"
              onClick={() => setProblemType('interactive')}
              className={`p-2.5 border rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                problemType === 'interactive'
                  ? "border-indigo-500 bg-indigo-50/80 text-indigo-950 font-bold ring-2 ring-indigo-500/20 shadow-xs"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <span className="text-xs font-bold">Interactive</span>
              <span className="text-[10px] text-slate-400 mt-0.5 font-normal">Tương tác</span>
            </button>

            <button
              type="button"
              onClick={() => setProblemType('ioi')}
              className={`p-2.5 border rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                problemType === 'ioi'
                  ? "border-indigo-500 bg-indigo-50/80 text-indigo-950 font-bold ring-2 ring-indigo-500/20 shadow-xs"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <span className="text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                IOI Mode
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 font-normal">Nộp bằng hàm</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {problemType === 'standard' && "So khớp kết quả trực tiếp theo chuẩn Codeforces/LQDOJ."}
            {problemType === 'checker' && "Tự động sinh kèm file testlab/checker.cpp (testlib.h)."}
            {problemType === 'interactive' && "Tự động sinh kèm file testlab/interactive.cpp (interactor)."}
            {problemType === 'ioi' && "Nộp bài dạng hàm theo chuẩn IOI / Grader: sinh kèm header.h, handler.cpp, handler.py và khung code mẫu."}
          </p>
        </div>

        {/* Configurable Testcase Count (testCount) */}
        <div className="space-y-3 p-4 sm:p-5 bg-slate-50/90 border border-slate-200/90 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Số lượng Testcase sinh tự động</span>
            </label>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 font-mono">
              {testCount} tests
            </span>
          </div>

          {/* Quick Presets for Test Count */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Mốc:</span>
            {[20, 50, 80, 100, 150, 200].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setTestCount(count)}
                className={`px-2.5 py-1 text-[11px] rounded-lg font-bold transition-all cursor-pointer ${
                  testCount === count
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {count} {count === 100 && "★"}
              </button>
            ))}
          </div>

          {/* Slider & Numeric Input */}
          <div className="flex items-center gap-3 pt-0.5">
            <input
              type="range"
              min={5}
              max={200}
              step={5}
              value={testCount}
              onChange={(e) => setTestCount(Number(e.target.value))}
              className="flex-1 h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={5}
                max={200}
                value={testCount}
                onChange={(e) => {
                  let val = Number(e.target.value);
                  if (val > 200) val = 200;
                  setTestCount(val);
                }}
                onBlur={() => {
                  if (testCount < 5) setTestCount(5);
                }}
                className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 text-center focus:ring-2 focus:ring-indigo-500 shadow-inner"
              />
              <span className="text-xs text-slate-400 font-medium">test</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Kịch bản <code>script.txt</code> sẽ được tạo gồm đúng <strong>{testCount} testcase</strong> chia đều qua các Subtask.
          </p>
        </div>
      </div>

      {/* 4. Brief Idea */}
      <div className="space-y-2 p-4 sm:p-5 bg-slate-50/90 border border-slate-200/90 rounded-2xl shadow-xs">
        <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-sky-500" />
          <span>Ý tưởng sơ lược hoặc Yêu cầu đặc biệt (Không bắt buộc)</span>
        </label>
        <textarea
          rows={3}
          value={briefIdea}
          onChange={(e) => setBriefIdea(e.target.value)}
          placeholder="Ví dụ: Cho một mảng số nguyên, hãy tìm dãy con dài nhất có tổng chia hết cho K. Hoặc: Hãy lấy cốt truyện về rùa và thỏ thi chạy..."
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all font-medium placeholder:text-slate-400 shadow-inner"
        />
        <p className="text-xs text-slate-400 leading-relaxed">
          Nếu bạn nhập ý tưởng, AI sẽ bám sát ý tưởng của bạn và cụ thể hóa thành đề bài hoàn chỉnh, bộ testcase sinh tự động và code giải. Nếu bỏ trống, AI sẽ tự sáng tạo một bài tập hấp dẫn theo độ khó rating {rating}.
        </p>
      </div>

      {/* Modal Library for 108+ Algorithm Topics */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div 
            className="bg-white w-full max-w-4xl max-h-[88vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <Trophy className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      Thư viện Chuyên đề Thuật toán
                    </h3>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full border border-indigo-200">
                      {allCatalogTopics.length} chuyên đề
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Hệ thống kiến thức chuẩn VNOI Wiki & Giải đấu Tin học (THCS, THPT, HSG QG, ACM ICPC)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTopicModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search & Filters */}
            <div className="p-4 border-b border-slate-100 space-y-3 bg-white">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm chuyên đề (ví dụ: segment tree, quy hoạch động, kmp, hình học, dijkstra...)..."
                  value={searchTopicQuery}
                  onChange={(e) => setSearchTopicQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                  autoFocus
                />
                {searchTopicQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchTopicQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                {/* Level & Star Filters */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Level */}
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setSelectedLevelFilter("ALL")}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        selectedLevelFilter === "ALL" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Tất cả cấp
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLevelFilter("THCS")}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        selectedLevelFilter === "THCS" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      THCS
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLevelFilter("THPT")}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        selectedLevelFilter === "THPT" ? "bg-purple-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      THPT
                    </button>
                  </div>

                  {/* Star Filter Dropdown / Pills */}
                  <div className="flex items-center gap-1 p-1 bg-amber-50/60 rounded-lg border border-amber-200/80">
                    <button
                      type="button"
                      onClick={() => setSelectedStarFilter("ALL")}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        selectedStarFilter === "ALL" ? "bg-amber-600 text-white shadow-xs" : "text-amber-900 hover:bg-amber-100/60"
                      }`}
                    >
                      Tất cả sao
                    </button>
                    {STAR_LEVELS.map((st) => (
                      <button
                        key={st.stars}
                        type="button"
                        onClick={() => setSelectedStarFilter(st.stars)}
                        className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer font-mono tracking-tighter ${
                          selectedStarFilter === st.stars ? "bg-amber-600 text-white shadow-xs" : "text-amber-900 hover:bg-amber-100/60"
                        }`}
                        title={`${st.stars}: ${st.name}`}
                      >
                        {st.stars}
                      </button>
                    ))}
                  </div>

                  {/* Group selector */}
                  <select
                    value={selectedCategoryGroup}
                    onChange={(e) => setSelectedCategoryGroup(e.target.value)}
                    className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Tất cả">Tất cả nhóm ({allCatalogTopics.length})</option>
                    {MEMES_TOURNAMENT_CATEGORIES.map((g) => (
                      <option key={g.group} value={g.group}>
                        {g.group} ({g.topics.length})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Star Guide Toggle & Random button in Modal */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowStarGuide(!showStarGuide)}
                    className="text-[11px] text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1 cursor-pointer underline"
                  >
                    <Info className="w-3.5 h-3.5" />
                    {showStarGuide ? "Ẩn quy ước sao" : "Quy ước sao"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleRollRandomCategory();
                      setIsTopicModalOpen(false);
                    }}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Sparkles className="w-3 h-3" />
                    Bốc ngẫu nhiên & Chọn
                  </button>
                </div>
              </div>

              {/* Star Guide Reference Table */}
              {showStarGuide && (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-1.5">
                  <p className="font-bold text-amber-950 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                    Quy ước mức độ sao (Chuẩn VNOI Wiki & Giải đấu):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                    {STAR_LEVELS.map((st) => (
                      <div key={st.stars} className="flex items-start gap-1.5 bg-white/80 p-1.5 rounded-lg border border-amber-100">
                        <span className="font-mono font-bold text-amber-600 shrink-0">{st.stars}</span>
                        <span className="text-slate-700">
                          <strong>{st.name}:</strong> {st.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable Topics Grid */}
            <div className="p-4 overflow-y-auto flex-1 bg-slate-50/50 scrollbar-thin">
              {filteredModalTopics.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <p className="text-sm font-semibold text-slate-600">Không tìm thấy chuyên đề phù hợp với từ khóa</p>
                  <p className="text-xs text-slate-400">Hãy thử đổi từ khóa tìm kiếm hoặc bấm "Tất cả" ở bộ lọc</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTopicQuery("");
                      setSelectedLevelFilter("ALL");
                      setSelectedStarFilter("ALL");
                      setSelectedCategoryGroup("Tất cả");
                    }}
                    className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    Đặt lại bộ lọc
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {filteredModalTopics.map((item) => {
                    const isSelected = category.toLowerCase() === item.name.toLowerCase();
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => {
                          setCategory(item.name);
                          setIsTopicModalOpen(false);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 relative group ${
                          isSelected
                            ? "bg-indigo-50/90 border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs"
                            : "bg-white border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-xs"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                              item.level === "THCS" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                            }`}>
                              {item.level}
                            </span>
                            {item.stars && (
                              <span className="text-[10px] font-mono tracking-tighter text-amber-600 font-bold">
                                {item.stars}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-medium">
                              • {item.groupName}
                            </span>
                            {item.isNew && (
                              <span className="text-[8px] bg-red-500 text-white font-bold px-1 rounded uppercase">
                                Mới
                              </span>
                            )}
                          </div>

                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>

                        <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {item.name}
                        </div>

                        {item.desc && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {item.desc}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-slate-100 bg-white flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 text-[11px]">
                Hiển thị <strong>{filteredModalTopics.length}</strong> / {allCatalogTopics.length} chuyên đề
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTopicModalOpen(false)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            : `Bắt đầu Sinh Đề Bài (${testCount} testcases)`}
        </span>
      </button>
    </form>
  );
};
