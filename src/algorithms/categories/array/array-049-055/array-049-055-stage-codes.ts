/**
 * 左神算法通关课 049 ~ 055 前缀和、差分与单调栈队列专题 多语言代码与 1-based 行号映射
 */

export interface CodeMapping {
  java: number;
  cpp: number;
  python: number;
  javascript: number;
}

// ==========================================
// 1. Class 049: 一维前缀和与哈希表
// ==========================================
export const PREFIX_SUM_BASIC_049_CODES: Record<string, string[]> = {
  java: [
    'public int subarraySum(int[] nums, int k) {', // 1
    '    Map<Integer, Integer> map = new HashMap<>();', // 2
    '    map.put(0, 1); int preSum = 0, count = 0;', // 3
    '    for (int x : nums) {', // 4
    '        preSum += x; // 累加前缀和', // 5
    '        if (map.containsKey(preSum - k)) count += map.get(preSum - k); // 查询差值', // 6
    '        map.put(preSum, map.getOrDefault(preSum, 0) + 1); // 登记频次', // 7
    '    }', // 8
    '    return count;', // 9
    '}', // 10
  ],
  cpp: [
    'int subarraySum(vector<int>& nums, int k) {', // 1
    '    unordered_map<int, int> map; map[0] = 1;', // 2
    '    int preSum = 0, count = 0;', // 3
    '    for (int x : nums) {', // 4
    '        preSum += x;', // 5
    '        if (map.count(preSum - k)) count += map[preSum - k];', // 6
    '        map[preSum]++;', // 7
    '    }', // 8
    '    return count;', // 9
    '}', // 10
  ],
  python: [
    'def subarray_sum(self, nums: list, k: int) -> int:', // 1
    '    count_map = {0: 1}; pre_sum = 0; count = 0', // 2
    '    for x in nums:', // 3
    '        pre_sum += x # 前缀累加', // 4
    '        if (pre_sum - k) in count_map: count += count_map[pre_sum - k]', // 5
    '        count_map[pre_sum] = count_map.get(pre_sum, 0) + 1', // 6
    '    return count', // 7
  ],
  javascript: [
    'function subarraySum(nums, k) {', // 1
    '    const map = new Map([[0, 1]]); let preSum = 0, count = 0;', // 2
    '    for (const x of nums) {', // 3
    '        preSum += x;', // 4
    '        if (map.has(preSum - k)) count += map.get(preSum - k);', // 5
    '        map.set(preSum, (map.get(preSum) || 0) + 1);', // 6
    '    }', // 7
    '    return count;', // 8
    '}', // 9
  ],
};

export const PREFIX_SUM_BASIC_049_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  initMap:     { java: 3, cpp: 2, python: 2, javascript: 2 },
  addSum:      { java: 5, cpp: 5, python: 4, javascript: 4 },
  queryDiff:   { java: 6, cpp: 6, python: 5, javascript: 5 },
  recordFreq:  { java: 7, cpp: 7, python: 6, javascript: 6 },
  returnCount: { java: 9, cpp: 9, python: 7, javascript: 8 },
};

// ==========================================
// 2. Class 050: 二维前缀和与区域检索
// ==========================================
export const PREFIX_SUM_2D_050_CODES: Record<string, string[]> = {
  java: [
    'public void build2DPrefix(int[][] mat) {', // 1
    '    int n = mat.length, m = mat[0].length;', // 2
    '    sum = new int[n + 1][m + 1];', // 3
    '    for (int i = 1; i <= n; i++) {', // 4
    '        for (int j = 1; j <= m; j++) {', // 5
    '            sum[i][j] = sum[i - 1][j] + sum[i][j - 1] - sum[i - 1][j - 1] + mat[i - 1][j - 1]; // 容斥建表', // 6
    '        }', // 7
    '    }', // 8
    '}', // 9
    'public int sumRegion(int r1, int c1, int r2, int c2) { // O(1) 瞬时查询', // 10
    '    return sum[r2 + 1][c2 + 1] - sum[r1][c2 + 1] - sum[r2 + 1][c1] + sum[r1][c1];', // 11
    '}', // 12
  ],
  cpp: [
    'void build2DPrefix(const vector<vector<int>>& mat) {', // 1
    '    int n = mat.size(), m = mat[0].size();', // 2
    '    sum.assign(n + 1, vector<int>(m + 1, 0));', // 3
    '    for (int i = 1; i <= n; i++) {', // 4
    '        for (int j = 1; j <= m; j++) {', // 5
    '            sum[i][j] = sum[i - 1][j] + sum[i][j - 1] - sum[i - 1][j - 1] + mat[i - 1][j - 1];', // 6
    '        }', // 7
    '    }', // 8
    '}', // 9
    'int sumRegion(int r1, int c1, int r2, int c2) {', // 10
    '    return sum[r2 + 1][c2 + 1] - sum[r1][c2 + 1] - sum[r2 + 1][c1] + sum[r1][c1];', // 11
    '}', // 12
  ],
  python: [
    'def build_2d_prefix(self, mat: list):', // 1
    '    n, m = len(mat), len(mat[0]); self.sum = [[0] * (m + 1) for _ in range(n + 1)]', // 2
    '    for i in range(1, n + 1):', // 3
    '        for j in range(1, m + 1):', // 4
    '            self.sum[i][j] = self.sum[i - 1][j] + self.sum[i][j - 1] - self.sum[i - 1][j - 1] + mat[i - 1][j - 1]', // 5
    'def sum_region(self, r1: int, c1: int, r2: int, c2: int) -> int:', // 6
    '    return self.sum[r2 + 1][c2 + 1] - self.sum[r1][c2 + 1] - self.sum[r2 + 1][c1] + self.sum[r1][c1]', // 7
  ],
  javascript: [
    'function build2DPrefix(mat) {', // 1
    '    const n = mat.length, m = mat[0].length;', // 2
    '    const sum = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));', // 3
    '    for (let i = 1; i <= n; i++) {', // 4
    '        for (let j = 1; j <= m; j++) {', // 5
    '            sum[i][j] = sum[i - 1][j] + sum[i][j - 1] - sum[i - 1][j - 1] + mat[i - 1][j - 1];', // 6
    '        }', // 7
    '    }', // 8
    '    return sum;', // 9
    '}', // 10
  ],
};

export const PREFIX_SUM_2D_050_LINES: Record<string, CodeMapping> = {
  entryBuild:  { java: 1, cpp: 1, python: 1, javascript: 1 },
  fillSum:     { java: 6, cpp: 6, python: 5, javascript: 6 },
  entryQuery:  { java: 10, cpp: 10, python: 6, javascript: 10 },
  calcRegion:  { java: 11, cpp: 11, python: 7, javascript: 10 },
};

// ==========================================
// 3. Class 051: 等差数列差分
// ==========================================
export const ARITHMETIC_DIFF_051_CODES: Record<string, string[]> = {
  java: [
    'public void addArithmetic(int l, int r, int s, int e, int d) {', // 1
    '    diff2[l] += s; // 1. 首项累加', // 2
    '    diff2[l + 1] += (d - s); // 2. 二阶增量调整', // 3
    '    diff2[r + 1] -= (e + d); // 3. 终点截断', // 4
    '    diff2[r + 2] += e;       // 4. 二阶恢复', // 5
    '}', // 6
    'public void buildArray(int n) { // 两次前缀和彻底还原', // 7
    '    for (int i = 1; i <= n; i++) diff2[i] += diff2[i - 1]; // 还原一阶差分', // 8
    '    for (int i = 1; i <= n; i++) diff2[i] += diff2[i - 1]; // 还原原数组', // 9
    '}', // 10
  ],
  cpp: [
    'void addArithmetic(int l, int r, int s, int e, int d) {', // 1
    '    diff2[l] += s;', // 2
    '    diff2[l + 1] += (d - s);', // 3
    '    diff2[r + 1] -= (e + d);', // 4
    '    diff2[r + 2] += e;', // 5
    '}', // 6
    'void buildArray(int n) {', // 7
    '    for (int i = 1; i <= n; i++) diff2[i] += diff2[i - 1];', // 8
    '    for (int i = 1; i <= n; i++) diff2[i] += diff2[i - 1];', // 9
    '}', // 10
  ],
  python: [
    'def add_arithmetic(self, l: int, r: int, s: int, e: int, d: int):', // 1
    '    self.diff2[l] += s # 4点打标', // 2
    '    self.diff2[l + 1] += (d - s)', // 3
    '    self.diff2[r + 1] -= (e + d)', // 4
    '    self.diff2[r + 2] += e', // 5
    'def build_array(self, n: int): # 两次前缀和', // 6
    '    for i in range(1, n + 1): self.diff2[i] += self.diff2[i - 1]', // 7
    '    for i in range(1, n + 1): self.diff2[i] += self.diff2[i - 1]', // 8
  ],
  javascript: [
    'function addArithmetic(diff2, l, r, s, e, d) {', // 1
    '    diff2[l] += s;', // 2
    '    diff2[l + 1] += (d - s);', // 3
    '    diff2[r + 1] -= (e + d);', // 4
    '    diff2[r + 2] += e;', // 5
    '}', // 6
    'function buildArray(diff2, n) {', // 7
    '    for (let i = 1; i <= n; i++) diff2[i] += diff2[i - 1];', // 8
    '    for (let i = 1; i <= n; i++) diff2[i] += diff2[i - 1];', // 9
    '}', // 10
  ],
};

export const ARITHMETIC_DIFF_051_LINES: Record<string, CodeMapping> = {
  entryAdd:    { java: 1, cpp: 1, python: 1, javascript: 1 },
  markPoints:  { java: 2, cpp: 2, python: 2, javascript: 2 },
  entryBuild:  { java: 7, cpp: 7, python: 6, javascript: 7 },
  firstPrefix: { java: 8, cpp: 8, python: 7, javascript: 8 },
  secondPrefix:{ java: 9, cpp: 9, python: 8, javascript: 9 },
};

// ==========================================
// 4. Class 052: 单调栈原理
// ==========================================
export const MONOTONIC_STACK_052_CODES: Record<string, string[]> = {
  java: [
    'public int[][] getNearLess(int[] arr) {', // 1
    '    int n = arr.length; int[][] res = new int[n][2];', // 2
    '    Stack<Integer> stack = new Stack<>(); // 底到顶单调递增', // 3
    '    for (int i = 0; i < n; i++) {', // 4
    '        while (!stack.isEmpty() && arr[stack.peek()] >= arr[i]) {', // 5
    '            int cur = stack.pop(); // 弹出结算', // 6
    '            res[cur][0] = stack.isEmpty() ? -1 : stack.peek(); // 左最近较小值', // 7
    '            res[cur][1] = i; // 右最近较小值', // 8
    '        }', // 9
    '        stack.push(i);', // 10
    '    }', // 11
    '    return res;', // 12
    '}', // 13
  ],
  cpp: [
    'vector<vector<int>> getNearLess(const vector<int>& arr) {', // 1
    '    int n = arr.size(); vector<vector<int>> res(n, vector<int>(2, -1));', // 2
    '    stack<int> st;', // 3
    '    for (int i = 0; i < n; i++) {', // 4
    '        while (!st.empty() && arr[st.top()] >= arr[i]) {', // 5
    '            int cur = st.top(); st.pop();', // 6
    '            res[cur][0] = st.empty() ? -1 : st.top();', // 7
    '            res[cur][1] = i;', // 8
    '        }', // 9
    '        st.push(i);', // 10
    '    }', // 11
    '    return res;', // 12
    '}', // 13
  ],
  python: [
    'def get_near_less(self, arr: list) -> list:', // 1
    '    n = len(arr); res = [[-1, -1] for _ in range(n)]; stack = []', // 2
    '    for i in range(n):', // 3
    '        while stack and arr[stack[-1]] >= arr[i]:', // 4
    '            cur = stack.pop() # 弹出结算', // 5
    '            res[cur][0] = stack[-1] if stack else -1', // 6
    '            res[cur][1] = i', // 7
    '        stack.append(i)', // 8
    '    return res', // 9
  ],
  javascript: [
    'function getNearLess(arr) {', // 1
    '    const n = arr.length; const res = Array.from({ length: n }, () => [-1, -1]);', // 2
    '    const stack = [];', // 3
    '    for (let i = 0; i < n; i++) {', // 4
    '        while (stack.length > 0 && arr[stack[stack.length - 1]] >= arr[i]) {', // 5
    '            const cur = stack.pop();', // 6
    '            res[cur][0] = stack.length === 0 ? -1 : stack[stack.length - 1];', // 7
    '            res[cur][1] = i;', // 8
    '        }', // 9
    '        stack.push(i);', // 10
    '    }', // 11
    '    return res;', // 12
    '}', // 13
  ],
};

export const MONOTONIC_STACK_052_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  initStack:   { java: 3, cpp: 3, python: 2, javascript: 3 },
  whilePop:    { java: 5, cpp: 5, python: 4, javascript: 5 },
  settleLeft:  { java: 7, cpp: 7, python: 6, javascript: 7 },
  settleRight: { java: 8, cpp: 8, python: 7, javascript: 8 },
  pushCurrent: { java: 10, cpp: 10, python: 8, javascript: 10 },
};

// ==========================================
// 5. Class 053: 柱状图最大矩形
// ==========================================
export const LARGEST_RECTANGLE_053_CODES: Record<string, string[]> = {
  java: [
    'public int largestRectangleArea(int[] heights) {', // 1
    '    int maxArea = 0, n = heights.length; Stack<Integer> stack = new Stack<>();', // 2
    '    for (int i = 0; i < n; i++) {', // 3
    '        while (!stack.isEmpty() && heights[stack.peek()] >= heights[i]) {', // 4
    '            int h = heights[stack.pop()];', // 5
    '            int w = stack.isEmpty() ? i : (i - stack.peek() - 1); // 宽度跨度', // 6
    '            maxArea = Math.max(maxArea, h * w);', // 7
    '        }', // 8
    '        stack.push(i);', // 9
    '    }', // 10
    '    return maxArea;', // 11
    '}', // 12
  ],
  cpp: [
    'int largestRectangleArea(vector<int>& heights) {', // 1
    '    int maxArea = 0, n = heights.size(); stack<int> st;', // 2
    '    for (int i = 0; i < n; i++) {', // 3
    '        while (!st.empty() && heights[st.top()] >= heights[i]) {', // 4
    '            int h = heights[st.top()]; st.pop();', // 5
    '            int w = st.empty() ? i : (i - st.top() - 1);', // 6
    '            maxArea = max(maxArea, h * w);', // 7
    '        }', // 8
    '        st.push(i);', // 9
    '    }', // 10
    '    return maxArea;', // 11
    '}', // 12
  ],
  python: [
    'def largest_rectangle_area(self, heights: list) -> int:', // 1
    '    max_area = 0; n = len(heights); stack = []', // 2
    '    for i in range(n):', // 3
    '        while stack and heights[stack[-1]] >= heights[i]:', // 4
    '            h = heights[stack.pop()]', // 5
    '            w = i if not stack else (i - stack[-1] - 1)', // 6
    '            max_area = max(max_area, h * w)', // 7
    '        stack.append(i)', // 8
    '    return max_area', // 9
  ],
  javascript: [
    'function largestRectangleArea(heights) {', // 1
    '    let maxArea = 0; const n = heights.length; const stack = [];', // 2
    '    for (let i = 0; i < n; i++) {', // 3
    '        while (stack.length > 0 && heights[stack[stack.length - 1]] >= heights[i]) {', // 4
    '            const h = heights[stack.pop()];', // 5
    '            const w = stack.length === 0 ? i : (i - stack[stack.length - 1] - 1);', // 6
    '            maxArea = Math.max(maxArea, h * w);', // 7
    '        }', // 8
    '        stack.push(i);', // 9
    '    }', // 10
    '    return maxArea;', // 11
    '}', // 12
  ],
};

export const LARGEST_RECTANGLE_053_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  forLoop:     { java: 3, cpp: 3, python: 3, javascript: 3 },
  calcHeight:  { java: 5, cpp: 5, python: 5, javascript: 5 },
  calcWidth:   { java: 6, cpp: 6, python: 6, javascript: 6 },
  updateMax:   { java: 7, cpp: 7, python: 7, javascript: 7 },
};

// ==========================================
// 6. Class 054: 单调队列与滑动窗口最大值
// ==========================================
export const MONOTONIC_QUEUE_054_CODES: Record<string, string[]> = {
  java: [
    'public int[] maxSlidingWindow(int[] nums, int k) {', // 1
    '    int n = nums.length; int[] res = new int[n - k + 1]; int idx = 0;', // 2
    '    Deque<Integer> q = new ArrayDeque<>(); // 存储下标，单调递减', // 3
    '    for (int i = 0; i < n; i++) {', // 4
    '        while (!q.isEmpty() && nums[q.peekLast()] <= nums[i]) q.pollLast(); // 淘汰较小者', // 5
    '        q.addLast(i); // 当前下标入队', // 6
    '        if (q.peekFirst() <= i - k) q.pollFirst(); // 弹出过期元素', // 7
    '        if (i >= k - 1) res[idx++] = nums[q.peekFirst()]; // 队头即为窗口最大值', // 8
    '    }', // 9
    '    return res;', // 10
    '}', // 11
  ],
  cpp: [
    'vector<int> maxSlidingWindow(vector<int>& nums, int k) {', // 1
    '    vector<int> res; deque<int> q;', // 2
    '    for (int i = 0; i < (int)nums.size(); i++) {', // 3
    '        while (!q.empty() && nums[q.back()] <= nums[i]) q.pop_back();', // 4
    '        q.push_back(i);', // 5
    '        if (q.front() <= i - k) q.pop_front();', // 6
    '        if (i >= k - 1) res.push_back(nums[q.front()]);', // 7
    '    }', // 8
    '    return res;', // 9
    '}', // 10
  ],
  python: [
    'def max_sliding_window(self, nums: list, k: int) -> list:', // 1
    '    res = []; q = collections.deque() # 下标单调减', // 2
    '    for i in range(len(nums)):', // 3
    '        while q and nums[q[-1]] <= nums[i]: q.pop() # 淘汰', // 4
    '        q.append(i)', // 5
    '        if q[0] <= i - k: q.popleft() # 过期', // 6
    '        if i >= k - 1: res.append(nums[q[0]])', // 7
    '    return res', // 8
  ],
  javascript: [
    'function maxSlidingWindow(nums, k) {', // 1
    '    const res = []; const q = [];', // 2
    '    for (let i = 0; i < nums.length; i++) {', // 3
    '        while (q.length > 0 && nums[q[q.length - 1]] <= nums[i]) q.pop();', // 4
    '        q.push(i);', // 5
    '        if (q[0] <= i - k) q.shift();', // 6
    '        if (i >= k - 1) res.push(nums[q[0]]);', // 7
    '    }', // 8
    '    return res;', // 9
    '}', // 10
  ],
};

export const MONOTONIC_QUEUE_054_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  popBack:     { java: 5, cpp: 4, python: 4, javascript: 4 },
  pushBack:    { java: 6, cpp: 5, python: 5, javascript: 5 },
  popExpired:  { java: 7, cpp: 6, python: 6, javascript: 6 },
  recordMax:   { java: 8, cpp: 7, python: 7, javascript: 7 },
};

// ==========================================
// 7. Class 055: 双单调队列与绝对差限制
// ==========================================
export const VALID_SUBARRAY_LIMIT_055_CODES: Record<string, string[]> = {
  java: [
    'public int longestSubarray(int[] nums, int limit) {', // 1
    '    Deque<Integer> maxQ = new ArrayDeque<>(); // 维护最大值', // 2
    '    Deque<Integer> minQ = new ArrayDeque<>(); // 维护最小值', // 3
    '    int left = 0, ans = 0;', // 4
    '    for (int right = 0; right < nums.length; right++) {', // 5
    '        while (!maxQ.isEmpty() && nums[maxQ.peekLast()] <= nums[right]) maxQ.pollLast(); maxQ.addLast(right);', // 6
    '        while (!minQ.isEmpty() && nums[minQ.peekLast()] >= nums[right]) minQ.pollLast(); minQ.addLast(right);', // 7
    '        while (nums[maxQ.peekFirst()] - nums[minQ.peekFirst()] > limit) { // 超限收缩', // 8
    '            if (maxQ.peekFirst() == left) maxQ.pollFirst();', // 9
    '            if (minQ.peekFirst() == left) minQ.pollFirst(); left++;', // 10
    '        }', // 11
    '        ans = Math.max(ans, right - left + 1); // 更新最大长度', // 12
    '    }', // 13
    '    return ans;', // 14
    '}', // 15
  ],
  cpp: [
    'int longestSubarray(vector<int>& nums, int limit) {', // 1
    '    deque<int> maxQ, minQ; int left = 0, ans = 0;', // 2
    '    for (int right = 0; right < (int)nums.size(); right++) {', // 3
    '        while (!maxQ.empty() && nums[maxQ.back()] <= nums[right]) maxQ.pop_back(); maxQ.push_back(right);', // 4
    '        while (!minQ.empty() && nums[minQ.back()] >= nums[right]) minQ.pop_back(); minQ.push_back(right);', // 5
    '        while (nums[maxQ.front()] - nums[minQ.front()] > limit) {', // 6
    '            if (maxQ.front() == left) maxQ.pop_front();', // 7
    '            if (minQ.front() == left) minQ.pop_front(); left++;', // 8
    '        }', // 9
    '        ans = max(ans, right - left + 1);', // 10
    '    }', // 11
    '    return ans;', // 12
    '}', // 13
  ],
  python: [
    'def longest_subarray(self, nums: list, limit: int) -> int:', // 1
    '    max_q, min_q = collections.deque(), collections.deque(); left = 0; ans = 0', // 2
    '    for right in range(len(nums)):', // 3
    '        while max_q and nums[max_q[-1]] <= nums[right]: max_q.pop()', // 4
    '        max_q.append(right)', // 5
    '        while min_q and nums[min_q[-1]] >= nums[right]: min_q.pop()', // 6
    '        min_q.append(right)', // 7
    '        while nums[max_q[0]] - nums[min_q[0]] > limit: # 窗口收缩', // 8
    '            if max_q[0] == left: max_q.popleft()', // 9
    '            if min_q[0] == left: min_q.popleft()', // 10
    '            left += 1', // 11
    '        ans = max(ans, right - left + 1)', // 12
    '    return ans', // 13
  ],
  javascript: [
    'function longestSubarray(nums, limit) {', // 1
    '    const maxQ = [], minQ = []; let left = 0, ans = 0;', // 2
    '    for (let right = 0; right < nums.length; right++) {', // 3
    '        while (maxQ.length > 0 && nums[maxQ[maxQ.length - 1]] <= nums[right]) maxQ.pop(); maxQ.push(right);', // 4
    '        while (minQ.length > 0 && nums[minQ[minQ.length - 1]] >= nums[right]) minQ.pop(); minQ.push(right);', // 5
    '        while (nums[maxQ[0]] - nums[minQ[0]] > limit) {', // 6
    '            if (maxQ[0] === left) maxQ.shift();', // 7
    '            if (minQ[0] === left) minQ.shift(); left++;', // 8
    '        }', // 9
    '        ans = Math.max(ans, right - left + 1);', // 10
    '    }', // 11
    '    return ans;', // 12
    '}', // 13
  ],
};

export const VALID_SUBARRAY_LIMIT_055_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  pushMaxMin:  { java: 6, cpp: 4, python: 4, javascript: 4 },
  shrinkLeft:  { java: 8, cpp: 6, python: 8, javascript: 6 },
  updateLen:   { java: 12, cpp: 10, python: 12, javascript: 10 },
  returnAns:   { java: 14, cpp: 12, python: 13, javascript: 12 },
};
