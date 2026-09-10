/**
 * 左神算法通关课 108 ~ 116 高阶区间数据结构多语言标准源码库与行号基准映射字典
 */

export interface CodeMapping {
  java: number;
  cpp: number;
  python: number;
  javascript: number;
}

// ==========================================
// 1. Class 108: 树状数组 (Fenwick Tree / BIT)
// ==========================================
export const FENWICK_TREE_CODES: Record<string, string[]> = {
  java: [
    'public class FenwickTree {', // 1
    '    private int[] tree;', // 2
    '    private int n;', // 3
    '    public int lowbit(int x) { return x & (-x); }', // 4
    '    public void add(int i, int v) {', // 5
    '        for (; i <= n; i += lowbit(i)) tree[i] += v; // 单点累加', // 6
    '    }', // 7
    '    public int query(int i) {', // 8
    '        int sum = 0;', // 9
    '        for (; i > 0; i -= lowbit(i)) sum += tree[i]; // 前缀和累加', // 10
    '        return sum;', // 11
    '    }', // 12
    '}', // 13
  ],
  cpp: [
    'class FenwickTree {', // 1
    '    vector<int> tree;', // 2
    '    int n;', // 3
    '    int lowbit(int x) { return x & (-x); }', // 4
    'public:', // 5
    '    void add(int i, int v) {', // 6
    '        for (; i <= n; i += lowbit(i)) tree[i] += v;', // 7
    '    }', // 8
    '    int query(int i) {', // 9
    '        int sum = 0;', // 10
    '        for (; i > 0; i -= lowbit(i)) sum += tree[i];', // 11
    '        return sum;', // 12
    '    }', // 13
    '};', // 14
  ],
  python: [
    'class FenwickTree:', // 1
    '    def __init__(self, n: int):', // 2
    '        self.n = n; self.tree = [0] * (n + 1)', // 3
    '    def lowbit(self, x: int) -> int:', // 4
    '        return x & (-x)', // 5
    '    def add(self, i: int, v: int):', // 6
    '        while i <= self.n:', // 7
    '            self.tree[i] += v; i += self.lowbit(i)', // 8
    '    def query(self, i: int) -> int:', // 9
    '        s = 0', // 10
    '        while i > 0:', // 11
    '            s += self.tree[i]; i -= self.lowbit(i)', // 12
    '        return s', // 13
  ],
  javascript: [
    'class FenwickTree {', // 1
    '    constructor(n) { this.n = n; this.tree = new Array(n + 1).fill(0); }', // 2
    '    lowbit(x) { return x & (-x); }', // 3
    '    add(i, v) {', // 4
    '        for (; i <= this.n; i += this.lowbit(i)) this.tree[i] += v;', // 5
    '    }', // 6
    '    query(i) {', // 7
    '        let sum = 0;', // 8
    '        for (; i > 0; i -= this.lowbit(i)) sum += this.tree[i];', // 9
    '        return sum;', // 10
    '    }', // 11
    '}', // 12
  ],
};

export const FENWICK_TREE_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  lowbit:    { java: 4, cpp: 4, python: 5, javascript: 3 },
  addHead:   { java: 5, cpp: 6, python: 6, javascript: 4 },
  addExec:   { java: 6, cpp: 7, python: 8, javascript: 5 },
  queryHead: { java: 8, cpp: 9, python: 9, javascript: 7 },
  queryExec: { java: 10, cpp: 11, python: 12, javascript: 9 },
  returnAns: { java: 11, cpp: 12, python: 13, javascript: 10 },
};

// ==========================================
// 2. Class 109: 树状数组求逆序对数 (Inversion Count)
// ==========================================
export const FENWICK_INVERSION_CODES: Record<string, string[]> = {
  java: [
    'public long countInversions(int[] nums) {', // 1
    '    int[] ranks = discretize(nums); // 离散化映射', // 2
    '    FenwickTree bit = new FenwickTree(nums.length);', // 3
    '    long ans = 0;', // 4
    '    for (int i = nums.length - 1; i >= 0; i--) {', // 5
    '        ans += bit.query(ranks[i] - 1); // 统计右侧比自身小的元素', // 6
    '        bit.add(ranks[i], 1); // 将当前数值加入树状数组', // 7
    '    }', // 8
    '    return ans;', // 9
    '}', // 10
  ],
  cpp: [
    'long long countInversions(vector<int>& nums) {', // 1
    '    vector<int> ranks = discretize(nums);', // 2
    '    FenwickTree bit(nums.size());', // 3
    '    long long ans = 0;', // 4
    '    for (int i = (int)nums.size() - 1; i >= 0; i--) {', // 5
    '        ans += bit.query(ranks[i] - 1);', // 6
    '        bit.add(ranks[i], 1);', // 7
    '    }', // 8
    '    return ans;', // 9
    '}', // 10
  ],
  python: [
    'def count_inversions(nums: list[int]) -> int:', // 1
    '    ranks = discretize(nums)  # 离散化', // 2
    '    bit = FenwickTree(len(nums))', // 3
    '    ans = 0', // 4
    '    for r in reversed(ranks):', // 5
    '        ans += bit.query(r - 1)  # 查较小计数', // 6
    '        bit.add(r, 1)', // 7
    '    return ans', // 8
  ],
  javascript: [
    'function countInversions(nums) {', // 1
    '    const ranks = discretize(nums); // 离散化', // 2
    '    const bit = new FenwickTree(nums.length);', // 3
    '    let ans = 0;', // 4
    '    for (let i = nums.length - 1; i >= 0; i--) {', // 5
    '        ans += bit.query(ranks[i] - 1);', // 6
    '        bit.add(ranks[i], 1);', // 7
    '    }', // 8
    '    return ans;', // 9
    '}', // 10
  ],
};

export const FENWICK_INVERSION_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  discretize:{ java: 2, cpp: 2, python: 2, javascript: 2 },
  loopHead:  { java: 5, cpp: 5, python: 5, javascript: 5 },
  queryCnt:  { java: 6, cpp: 6, python: 6, javascript: 6 },
  addVal:    { java: 7, cpp: 7, python: 7, javascript: 7 },
  returnAns: { java: 9, cpp: 9, python: 8, javascript: 9 },
};

// ==========================================
// 3. Class 110: 经典线段树与懒标记 (Segment Tree with Lazy Tag)
// ==========================================
export const SEGMENT_TREE_CODES: Record<string, string[]> = {
  java: [
    'public void updateRange(int node, int l, int r, int ql, int qr, int val) {', // 1
    '    if (ql <= l && r <= qr) {', // 2
    '        sum[node] += (r - l + 1) * val; lazy[node] += val; return;', // 3
    '    }', // 4
    '    pushDown(node, l, r); // 下传懒标记', // 5
    '    int mid = (l + r) / 2;', // 6
    '    if (ql <= mid) updateRange(node * 2, l, mid, ql, qr, val);', // 7
    '    if (qr > mid) updateRange(node * 2 + 1, mid + 1, r, ql, qr, val);', // 8
    '    pushUp(node); // 向上合并', // 9
    '}', // 10
  ],
  cpp: [
    'void updateRange(int node, int l, int r, int ql, int qr, int val) {', // 1
    '    if (ql <= l && r <= qr) {', // 2
    '        sum[node] += (r - l + 1) * val; lazy[node] += val; return;', // 3
    '    }', // 4
    '    pushDown(node, l, r);', // 5
    '    int mid = (l + r) / 2;', // 6
    '    if (ql <= mid) updateRange(node * 2, l, mid, ql, qr, val);', // 7
    '    if (qr > mid) updateRange(node * 2 + 1, mid + 1, r, ql, qr, val);', // 8
    '    pushUp(node);', // 9
    '}', // 10
  ],
  python: [
    'def update_range(self, node: int, l: int, r: int, ql: int, qr: int, val: int):', // 1
    '    if ql <= l and r <= qr:', // 2
    '        self.sum[node] += (r - l + 1) * val; self.lazy[node] += val; return', // 3
    '    self.push_down(node, l, r)  # 下传懒标记', // 4
    '    mid = (l + r) // 2', // 5
    '    if ql <= mid: self.update_range(node * 2, l, mid, ql, qr, val)', // 6
    '    if qr > mid: self.update_range(node * 2 + 1, mid + 1, r, ql, qr, val)', // 7
    '    self.push_up(node)  # 合并', // 8
  ],
  javascript: [
    'function updateRange(node, l, r, ql, qr, val) {', // 1
    '    if (ql <= l && r <= qr) {', // 2
    '        sum[node] += (r - l + 1) * val; lazy[node] += val; return;', // 3
    '    }', // 4
    '    pushDown(node, l, r); // 下传懒标记', // 5
    '    const mid = Math.floor((l + r) / 2);', // 6
    '    if (ql <= mid) updateRange(node * 2, l, mid, ql, qr, val);', // 7
    '    if (qr > mid) updateRange(node * 2 + 1, mid + 1, r, ql, qr, val);', // 8
    '    pushUp(node); // 合并', // 9
    '}', // 10
  ],
};

export const SEGMENT_TREE_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  hitRange:  { java: 3, cpp: 3, python: 3, javascript: 3 },
  pushDown:  { java: 5, cpp: 5, python: 4, javascript: 5 },
  splitLeft: { java: 7, cpp: 7, python: 6, javascript: 7 },
  splitRight:{ java: 8, cpp: 8, python: 7, javascript: 8 },
  pushUp:    { java: 9, cpp: 9, python: 8, javascript: 9 },
};

// ==========================================
// 4. Class 111: 动态开点线段树 (Dynamic Segment Tree)
// ==========================================
export const DYNAMIC_SEGMENT_TREE_CODES: Record<string, string[]> = {
  java: [
    'public void updateDynamic(Node cur, int l, int r, int ql, int qr, int val) {', // 1
    '    if (ql <= l && r <= qr) { cur.val += (r - l + 1) * val; cur.lazy += val; return; }', // 2
    '    if (cur.left == null) cur.left = new Node(); // 动态按需开左子点', // 3
    '    if (cur.right == null) cur.right = new Node(); // 动态按需开右子点', // 4
    '    pushDown(cur, l, r);', // 5
    '    int mid = (l + r) / 2;', // 6
    '    if (ql <= mid) updateDynamic(cur.left, l, mid, ql, qr, val);', // 7
    '    if (qr > mid) updateDynamic(cur.right, mid + 1, r, ql, qr, val);', // 8
    '    pushUp(cur);', // 9
    '}', // 10
  ],
  cpp: [
    'void updateDynamic(Node* cur, int l, int r, int ql, int qr, int val) {', // 1
    '    if (ql <= l && r <= qr) { cur->val += (r - l + 1) * val; cur->lazy += val; return; }', // 2
    '    if (!cur->left) cur->left = new Node();', // 3
    '    if (!cur->right) cur->right = new Node();', // 4
    '    pushDown(cur, l, r);', // 5
    '    int mid = (l + r) / 2;', // 6
    '    if (ql <= mid) updateDynamic(cur->left, l, mid, ql, qr, val);', // 7
    '    if (qr > mid) updateDynamic(cur->right, mid + 1, r, ql, qr, val);', // 8
    '    pushUp(cur);', // 9
    '}', // 10
  ],
  python: [
    'def update_dynamic(cur: Node, l: int, r: int, ql: int, qr: int, val: int):', // 1
    '    if ql <= l and r <= qr:', // 2
    '        cur.val += (r - l + 1) * val; cur.lazy += val; return', // 3
    '    if not cur.left: cur.left = Node()  # 按需分配', // 4
    '    if not cur.right: cur.right = Node()', // 5
    '    push_down(cur, l, r)', // 6
    '    mid = (l + r) // 2', // 7
    '    if ql <= mid: update_dynamic(cur.left, l, mid, ql, qr, val)', // 8
    '    if qr > mid: update_dynamic(cur.right, mid + 1, r, ql, qr, val)', // 9
    '    push_up(cur)', // 10
  ],
  javascript: [
    'function updateDynamic(cur, l, r, ql, qr, val) {', // 1
    '    if (ql <= l && r <= qr) { cur.val += (r - l + 1) * val; cur.lazy += val; return; }', // 2
    '    if (!cur.left) cur.left = new Node(); // 动态分配', // 3
    '    if (!cur.right) cur.right = new Node();', // 4
    '    pushDown(cur, l, r);', // 5
    '    const mid = Math.floor((l + r) / 2);', // 6
    '    if (ql <= mid) updateDynamic(cur.left, l, mid, ql, qr, val);', // 7
    '    if (qr > mid) updateDynamic(cur.right, mid + 1, r, ql, qr, val);', // 8
    '    pushUp(cur);', // 9
    '}', // 10
  ],
};

export const DYNAMIC_SEGMENT_TREE_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  allocChild:{ java: 3, cpp: 3, python: 4, javascript: 3 },
  pushDown:  { java: 5, cpp: 5, python: 6, javascript: 5 },
  splitLeft: { java: 7, cpp: 7, python: 8, javascript: 7 },
  splitRight:{ java: 8, cpp: 8, python: 9, javascript: 8 },
  pushUp:    { java: 9, cpp: 9, python: 10, javascript: 9 },
};

// ==========================================
// 5. Class 113: 区间合并线段树 (Interval Merge)
// ==========================================
export const INTERVAL_MERGE_SEGMENT_TREE_CODES: Record<string, string[]> = {
  java: [
    'public void pushUp(int node) {', // 1
    '    int left = node * 2, right = node * 2 + 1;', // 2
    '    sum[node] = sum[left] + sum[right];', // 3
    '    lmax[node] = Math.max(lmax[left], sum[left] + lmax[right]); // 左前缀最大', // 4
    '    rmax[node] = Math.max(rmax[right], sum[right] + rmax[left]); // 右后缀最大', // 5
    '    maxSum[node] = Math.max(Math.max(maxSum[left], maxSum[right]), rmax[left] + lmax[right]); // 跨越合并', // 6
    '}', // 7
  ],
  cpp: [
    'void pushUp(int node) {', // 1
    '    int left = node * 2, right = node * 2 + 1;', // 2
    '    sum[node] = sum[left] + sum[right];', // 3
    '    lmax[node] = max(lmax[left], sum[left] + lmax[right]);', // 4
    '    rmax[node] = max(rmax[right], sum[right] + rmax[left]);', // 5
    '    maxSum[node] = max({maxSum[left], maxSum[right], rmax[left] + lmax[right]});', // 6
    '}', // 7
  ],
  python: [
    'def push_up(self, node: int):', // 1
    '    left, right = node * 2, node * 2 + 1', // 2
    '    self.sum[node] = self.sum[left] + self.sum[right]', // 3
    '    self.lmax[node] = max(self.lmax[left], self.sum[left] + self.lmax[right])', // 4
    '    self.rmax[node] = max(self.rmax[right], self.sum[right] + self.rmax[left])', // 5
    '    self.max_sum[node] = max(self.max_sum[left], self.max_sum[right], self.rmax[left] + self.lmax[right])', // 6
  ],
  javascript: [
    'function pushUp(node) {', // 1
    '    const left = node * 2, right = node * 2 + 1;', // 2
    '    sum[node] = sum[left] + sum[right];', // 3
    '    lmax[node] = Math.max(lmax[left], sum[left] + lmax[right]); // 左前缀最大', // 4
    '    rmax[node] = Math.max(rmax[right], sum[right] + rmax[left]); // 右后缀最大', // 5
    '    maxSum[node] = Math.max(Math.max(maxSum[left], maxSum[right]), rmax[left] + lmax[right]); // 跨越合并', // 6
    '}', // 7
  ],
};

export const INTERVAL_MERGE_SEGMENT_TREE_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  calcSum:   { java: 3, cpp: 3, python: 3, javascript: 3 },
  calcLmax:  { java: 4, cpp: 4, python: 4, javascript: 4 },
  calcRmax:  { java: 5, cpp: 5, python: 5, javascript: 5 },
  calcMaxSum:{ java: 6, cpp: 6, python: 6, javascript: 6 },
};

// ==========================================
// 6. Class 115: 扫描线求矩形面积并 (Sweep Line)
// ==========================================
export const SWEEP_LINE_CODES: Record<string, string[]> = {
  java: [
    'public long sweepArea(Event[] events) {', // 1
    '    Arrays.sort(events, (a, b) -> Integer.compare(a.x, b.x)); // 按 x 排序', // 2
    '    long totalArea = 0;', // 3
    '    for (int i = 0; i < events.length - 1; i++) {', // 4
    '        update(1, 1, m, events[i].y1, events[i].y2, events[i].type); // 增减区间', // 5
    '        totalArea += (long) tree[1].len * (events[i + 1].x - events[i].x); // 底乘高', // 6
    '    }', // 7
    '    return totalArea;', // 8
    '}', // 9
  ],
  cpp: [
    'long long sweepArea(vector<Event>& events) {', // 1
    '    sort(events.begin(), events.end(), [](auto& a, auto& b) { return a.x < b.x; });', // 2
    '    long long totalArea = 0;', // 3
    '    for (int i = 0; i + 1 < events.size(); i++) {', // 4
    '        update(1, 1, m, events[i].y1, events[i].y2, events[i].type);', // 5
    '        totalArea += 1LL * tree[1].len * (events[i + 1].x - events[i].x);', // 6
    '    }', // 7
    '    return totalArea;', // 8
    '}', // 9
  ],
  python: [
    'def sweep_area(events: list[Event]) -> int:', // 1
    '    events.sort(key=lambda e: e.x)  # 按 x 轴排序', // 2
    '    total_area = 0', // 3
    '    for i in range(len(events) - 1):', // 4
    '        update(1, 1, m, events[i].y1, events[i].y2, events[i].type)', // 5
    '        total_area += tree[1].len * (events[i + 1].x - events[i].x)  # 底乘高', // 6
    '    return total_area', // 7
  ],
  javascript: [
    'function sweepArea(events) {', // 1
    '    events.sort((a, b) => a.x - b.x); // 按 x 排序', // 2
    '    let totalArea = 0;', // 3
    '    for (let i = 0; i < events.length - 1; i++) {', // 4
    '        update(1, 1, m, events[i].y1, events[i].y2, events[i].type); // 增减区间', // 5
    '        totalArea += tree[1].len * (events[i + 1].x - events[i].x); // 底乘高', // 6
    '    }', // 7
    '    return totalArea;', // 8
    '}', // 9
  ],
};

export const SWEEP_LINE_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  sortEvents:{ java: 2, cpp: 2, python: 2, javascript: 2 },
  loopHead:  { java: 4, cpp: 4, python: 4, javascript: 4 },
  updateTree:{ java: 5, cpp: 5, python: 5, javascript: 5 },
  calcDelta: { java: 6, cpp: 6, python: 6, javascript: 6 },
  returnAns: { java: 8, cpp: 8, python: 7, javascript: 8 },
};
