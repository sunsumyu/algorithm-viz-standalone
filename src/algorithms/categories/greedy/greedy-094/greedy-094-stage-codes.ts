/**
 * 第 94 课：左神贪心算法专题 6 - 多语言代码片段与 1-based 相对行号映射
 */

// ==========================================
// 1. 消灭怪物的最大数量 (LeetCode 1921)
// ==========================================
export const ELIMINATE_MONSTERS_CODES: Record<string, string[]> = {
  java: [
    'public int eliminateMaximum(int[] dist, int[] speed) {',
    '    int n = dist.length;',
    '    int[] times = new int[n];',
    '    for (int i = 0; i < n; i++) times[i] = (dist[i] + speed[i] - 1) / speed[i];',
    '    Arrays.sort(times);',
    '    for (int i = 0; i < n; i++) {',
    '        if (times[i] <= i) return i;',
    '    }',
    '    return n;',
    '}',
  ],
  cpp: [
    'int eliminateMaximum(vector<int>& dist, vector<int>& speed) {',
    '    int n = dist.size();',
    '    vector<int> times(n);',
    '    for (int i = 0; i < n; i++) times[i] = (dist[i] + speed[i] - 1) / speed[i];',
    '    sort(times.begin(), times.end());',
    '    for (int i = 0; i < n; i++) {',
    '        if (times[i] <= i) return i;',
    '    }',
    '    return n;',
    '}',
  ],
  python: [
    'def eliminateMaximum(dist: List[int], speed: List[int]) -> int:',
    '    times = [(d + s - 1) // s for d, s in zip(dist, speed)]',
    '    times.sort()',
    '    for i, t in enumerate(times):',
    '        if t <= i: return i',
    '    return len(dist)',
  ],
  javascript: [
    'function eliminateMaximum(dist, speed) {',
    '    const n = dist.length;',
    '    const times = dist.map((d, i) => Math.ceil(d / speed[i]));',
    '    times.sort((a, b) => a - b);',
    '    for (let i = 0; i < n; i++) {',
    '        if (times[i] <= i) return i;',
    '    }',
    '    return n;',
    '}',
  ],
};

export const ELIMINATE_MONSTERS_LINES = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  calcTimes: { java: 4, cpp: 4, python: 2, javascript: 3 },
  sortTimes: { java: 5, cpp: 5, python: 3, javascript: 4 },
  checkLoss: { java: 7, cpp: 7, python: 5, javascript: 6 },
  done:      { java: 9, cpp: 9, python: 6, javascript: 8 },
};

// ==========================================
// 2. 最大回文数字 (LeetCode 2384)
// ==========================================
export const LARGEST_PALINDROMIC_NUMBER_CODES: Record<string, string[]> = {
  java: [
    'public String largestPalindromic(String num) {',
    '    int[] count = new int[10];',
    '    for (char c : num.toCharArray()) count[c - "0"]++;',
    '    StringBuilder left = new StringBuilder();',
    '    for (int d = 9; d >= 0; d--) {',
    '        if (d == 0 && left.length() == 0) break;',
    '        while (count[d] >= 2) { left.append(d); count[d] -= 2; }',
    '    }',
    '    String mid = "";',
    '    for (int d = 9; d >= 0; d--) {',
    '        if (count[d] > 0) { mid = String.valueOf(d); break; }',
    '    }',
    '    if (left.length() == 0 && mid.isEmpty()) return "0";',
    '    return left.toString() + mid + left.reverse().toString();',
    '}',
  ],
  cpp: [
    'string largestPalindromic(string num) {',
    '    vector<int> count(10, 0);',
    '    for (char c : num) count[c - "0"]++;',
    '    string left = "";',
    '    for (int d = 9; d >= 0; d--) {',
    '        if (d == 0 && left.empty()) break;',
    '        while (count[d] >= 2) { left.push_back(d + "0"); count[d] -= 2; }',
    '    }',
    '    string mid = "";',
    '    for (int d = 9; d >= 0; d--) {',
    '        if (count[d] > 0) { mid = to_string(d); break; }',
    '    }',
    '    if (left.empty() && mid.empty()) return "0";',
    '    string right = left; reverse(right.begin(), right.end());',
    '    return left + mid + right;',
    '}',
  ],
  python: [
    'def largestPalindromic(num: str) -> str:',
    '    count = collections.Counter(num)',
    '    left = []',
    '    for d in "9876543210":',
    '        if d == "0" and not left: break',
    '        left.append(d * (count[d] // 2))',
    '        count[d] %= 2',
    '    left_str = "".join(left)',
    '    mid = next((d for d in "9876543210" if count[d] > 0), "")',
    '    if not left_str and not mid: return "0"',
    '    return left_str + mid + left_str[::-1]',
  ],
  javascript: [
    'function largestPalindromic(num) {',
    '    const count = new Array(10).fill(0);',
    '    for (const c of num) count[parseInt(c, 10)]++;',
    '    let left = "";',
    '    for (let d = 9; d >= 0; d--) {',
    '        if (d === 0 && left.length === 0) break;',
    '        while (count[d] >= 2) { left += d; count[d] -= 2; }',
    '    }',
    '    let mid = "";',
    '    for (let d = 9; d >= 0; d--) {',
    '        if (count[d] > 0) { mid = String(d); break; }',
    '    }',
    '    if (left.length === 0 && mid.length === 0) return "0";',
    '    return left + mid + left.split("").reverse().join("");',
    '}',
  ],
};

export const LARGEST_PALINDROMIC_NUMBER_LINES = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  countDigits: { java: 3, cpp: 3, python: 2, javascript: 3 },
  placePairs:{ java: 7, cpp: 7, python: 6, javascript: 7 },
  pickMid:   { java: 11, cpp: 11, python: 9, javascript: 11 },
  done:      { java: 14, cpp: 14, python: 11, javascript: 14 },
};

// ==========================================
// 3. 最大平均通过率 (LeetCode 1792)
// ==========================================
export const MAX_AVG_PASS_RATIO_CODES: Record<string, string[]> = {
  java: [
    'public double maxAverageRatio(int[][] classes, int extraStudents) {',
    '    PriorityQueue<int[]> maxHeap = new PriorityQueue<>((a, b) -> Double.compare(gain(b[0], b[1]), gain(a[0], a[1])));',
    '    for (int[] c : classes) maxHeap.offer(c);',
    '    while (extraStudents-- > 0) {',
    '        int[] cur = maxHeap.poll();',
    '        cur[0]++; cur[1]++;',
    '        maxHeap.offer(cur);',
    '    }',
    '    double sum = 0;',
    '    for (int[] c : maxHeap) sum += (double) c[0] / c[1];',
    '    return sum / classes.length;',
    '}',
  ],
  cpp: [
    'double maxAverageRatio(vector<vector<int>>& classes, int extraStudents) {',
    '    auto gain = [](int p, int t) { return (double)(p + 1) / (t + 1) - (double)p / t; };',
    '    auto cmp = [&](const auto& a, const auto& b) { return gain(a[0], a[1]) < gain(b[0], b[1]); };',
    '    priority_queue<vector<int>, vector<vector<int>>, decltype(cmp)> maxHeap(cmp);',
    '    for (auto& c : classes) maxHeap.push(c);',
    '    while (extraStudents-- > 0) {',
    '        auto cur = maxHeap.top(); maxHeap.pop();',
    '        cur[0]++; cur[1]++;',
    '        maxHeap.push(cur);',
    '    }',
    '    double sum = 0;',
    '    while (!maxHeap.empty()) { auto c = maxHeap.top(); maxHeap.pop(); sum += (double)c[0] / c[1]; }',
    '    return sum / classes.size();',
    '}',
  ],
  python: [
    'def maxAverageRatio(classes: List[List[int]], extraStudents: int) -> float:',
    '    def gain(p, t): return (p + 1) / (t + 1) - p / t',
    '    max_heap = [(-gain(p, t), p, t) for p, t in classes]',
    '    heapq.heapify(max_heap)',
    '    for _ in range(extraStudents):',
    '        _, p, t = heapq.heappop(max_heap)',
    '        heapq.heappush(max_heap, (-gain(p + 1, t + 1), p + 1, t + 1))',
    '    return sum(p / t for _, p, t in max_heap) / len(classes)',
  ],
  javascript: [
    'function maxAverageRatio(classes, extraStudents) {',
    '    const gain = (p, t) => (p + 1) / (t + 1) - p / t;',
    '    const heap = classes.map(c => [...c]);',
    '    while (extraStudents-- > 0) {',
    '        heap.sort((a, b) => gain(b[0], b[1]) - gain(a[0], a[1]));',
    '        heap[0][0]++; heap[0][1]++;',
    '    }',
    '    const sum = heap.reduce((acc, c) => acc + c[0] / c[1], 0);',
    '    return sum / classes.length;',
    '}',
  ],
};

export const MAX_AVG_PASS_RATIO_LINES = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  initHeap:  { java: 3, cpp: 5, python: 3, javascript: 3 },
  addStudent:{ java: 6, cpp: 8, python: 7, javascript: 5 },
  done:      { java: 11, cpp: 13, python: 8, javascript: 8 },
};

// ==========================================
// 4. 雇佣 K 名工人的最低成本 (LeetCode 857)
// ==========================================
export const MIN_COST_HIRE_WORKERS_CODES: Record<string, string[]> = {
  java: [
    'public double mincostToHireWorkers(int[] quality, int[] wage, int k) {',
    '    int n = quality.length;',
    '    double[][] workers = new double[n][2];',
    '    for (int i = 0; i < n; i++) workers[i] = new double[]{(double) wage[i] / quality[i], (double) quality[i]};',
    '    Arrays.sort(workers, (a, b) -> Double.compare(a[0], b[0]));',
    '    PriorityQueue<Double> maxHeap = new PriorityQueue<>((a, b) -> Double.compare(b, a));',
    '    double sumQ = 0, minCost = Double.MAX_VALUE;',
    '    for (double[] w : workers) {',
    '        maxHeap.offer(w[1]); sumQ += w[1];',
    '        if (maxHeap.size() > k) sumQ -= maxHeap.poll();',
    '        if (maxHeap.size() == k) minCost = Math.min(minCost, sumQ * w[0]);',
    '    }',
    '    return minCost;',
    '}',
  ],
  cpp: [
    'double mincostToHireWorkers(vector<int>& quality, vector<int>& wage, int k) {',
    '    int n = quality.size();',
    '    vector<pair<double, double>> workers(n);',
    '    for (int i = 0; i < n; i++) workers[i] = {(double)wage[i] / quality[i], (double)quality[i]};',
    '    sort(workers.begin(), workers.end());',
    '    priority_queue<double> maxHeap;',
    '    double sumQ = 0, minCost = 1e18;',
    '    for (auto& w : workers) {',
    '        maxHeap.push(w.second); sumQ += w.second;',
    '        if ((int)maxHeap.size() > k) { sumQ -= maxHeap.top(); maxHeap.pop(); }',
    '        if ((int)maxHeap.size() == k) minCost = min(minCost, sumQ * w.first);',
    '    }',
    '    return minCost;',
    '}',
  ],
  python: [
    'def mincostToHireWorkers(quality: List[int], wage: List[int], k: int) -> float:',
    '    workers = sorted([(w / q, q) for w, q in zip(wage, quality)])',
    '    max_heap = []',
    '    sum_q, min_cost = 0, float("inf")',
    '    for ratio, q in workers:',
    '        heapq.heappush(max_heap, -q); sum_q += q',
    '        if len(max_heap) > k: sum_q += heapq.heappop(max_heap)',
    '        if len(max_heap) == k: min_cost = min(min_cost, sum_q * ratio)',
    '    return min_cost',
  ],
  javascript: [
    'function mincostToHireWorkers(quality, wage, k) {',
    '    const workers = quality.map((q, i) => [wage[i] / q, q]);',
    '    workers.sort((a, b) => a[0] - b[0]);',
    '    const heap = [];',
    '    let sumQ = 0, minCost = Infinity;',
    '    for (const [ratio, q] of workers) {',
    '        heap.push(q); sumQ += q;',
    '        heap.sort((a, b) => b - a);',
    '        if (heap.length > k) sumQ -= heap.shift();',
    '        if (heap.length === k) minCost = Math.min(minCost, sumQ * ratio);',
    '    }',
    '    return minCost;',
    '}',
  ],
};

export const MIN_COST_HIRE_WORKERS_LINES = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  sortRatio: { java: 5, cpp: 5, python: 2, javascript: 3 },
  maintainQ: { java: 9, cpp: 9, python: 6, javascript: 7 },
  updateAns: { java: 11, cpp: 11, python: 8, javascript: 10 },
  done:      { java: 13, cpp: 13, python: 9, javascript: 12 },
};

// ==========================================
// 5. 砍树问题 (Cutting Tree)
// ==========================================
export const CUTTING_TREE_CODES: Record<string, string[]> = {
  java: [
    'public int maxTreeWeight(int[][] trees, int m) {',
    '    Arrays.sort(trees, (a, b) -> a[1] - b[1]);',
    '    int n = trees.length;',
    '    int[] dp = new int[m + 1];',
    '    for (int[] t : trees) {',
    '        for (int j = m; j >= 1; j--) {',
    '            dp[j] = Math.max(dp[j], dp[j - 1] + t[0] + t[1] * (j - 1));',
    '        }',
    '    }',
    '    return dp[m];',
    '}',
  ],
  cpp: [
    'int maxTreeWeight(vector<vector<int>>& trees, int m) {',
    '    sort(trees.begin(), trees.end(), [](const auto& a, const auto& b){ return a[1] < b[1]; });',
    '    int n = trees.size();',
    '    vector<int> dp(m + 1, 0);',
    '    for (auto& t : trees) {',
    '        for (int j = m; j >= 1; j--) {',
    '            dp[j] = max(dp[j], dp[j - 1] + t[0] + t[1] * (j - 1));',
    '        }',
    '    }',
    '    return dp[m];',
    '}',
  ],
  python: [
    'def maxTreeWeight(trees: List[List[int]], m: int) -> int:',
    '    trees.sort(key=lambda t: t[1])',
    '    dp = [0] * (m + 1)',
    '    for w, g in trees:',
    '        for j in range(m, 0, -1):',
    '            dp[j] = max(dp[j], dp[j - 1] + w + g * (j - 1))',
    '    return dp[m]',
  ],
  javascript: [
    'function maxTreeWeight(trees, m) {',
    '    trees.sort((a, b) => a[1] - b[1]);',
    '    const dp = new Array(m + 1).fill(0);',
    '    for (const [w, g] of trees) {',
    '        for (let j = m; j >= 1; j--) {',
    '            dp[j] = Math.max(dp[j], dp[j - 1] + w + g * (j - 1));',
    '        }',
    '    }',
    '    return dp[m];',
    '}',
  ],
};

export const CUTTING_TREE_LINES = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  sortGrowth:{ java: 2, cpp: 2, python: 2, javascript: 2 },
  dpKnapsack:{ java: 7, cpp: 7, python: 6, javascript: 6 },
  done:      { java: 10, cpp: 10, python: 7, javascript: 9 },
};

// ==========================================
// 6. 做菜计划 (LeetCode 1402)
// ==========================================
export const COOKING_PLAN_CODES: Record<string, string[]> = {
  java: [
    'public int maxSatisfaction(int[] satisfaction) {',
    '    Arrays.sort(satisfaction);',
    '    int total = 0, suffixSum = 0;',
    '    for (int i = satisfaction.length - 1; i >= 0; i--) {',
    '        suffixSum += satisfaction[i];',
    '        if (suffixSum <= 0) break;',
    '        total += suffixSum;',
    '    }',
    '    return total;',
    '}',
  ],
  cpp: [
    'int maxSatisfaction(vector<int>& satisfaction) {',
    '    sort(satisfaction.begin(), satisfaction.end());',
    '    int total = 0, suffixSum = 0;',
    '    for (int i = (int)satisfaction.size() - 1; i >= 0; i--) {',
    '        suffixSum += satisfaction[i];',
    '        if (suffixSum <= 0) break;',
    '        total += suffixSum;',
    '    }',
    '    return total;',
    '}',
  ],
  python: [
    'def maxSatisfaction(satisfaction: List[int]) -> int:',
    '    satisfaction.sort()',
    '    total, suffix_sum = 0, 0',
    '    for s in reversed(satisfaction):',
    '        suffix_sum += s',
    '        if suffix_sum <= 0: break',
    '        total += suffix_sum',
    '    return total',
  ],
  javascript: [
    'function maxSatisfaction(satisfaction) {',
    '    satisfaction.sort((a, b) => a - b);',
    '    let total = 0, suffixSum = 0;',
    '    for (let i = satisfaction.length - 1; i >= 0; i--) {',
    '        suffixSum += satisfaction[i];',
    '        if (suffixSum <= 0) break;',
    '        total += suffixSum;',
    '    }',
    '    return total;',
    '}',
  ],
};

export const COOKING_PLAN_LINES = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  sortSat:   { java: 2, cpp: 2, python: 2, javascript: 2 },
  addSuffix: { java: 7, cpp: 7, python: 7, javascript: 7 },
  done:      { java: 9, cpp: 9, python: 8, javascript: 9 },
};
