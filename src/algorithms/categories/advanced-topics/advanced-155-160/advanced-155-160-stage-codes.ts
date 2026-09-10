/**
 * 左神算法通关课 155 ~ 160 动态树、可持久化数据结构、树上启发式合并、莫队与 FFT 多语言代码与 1-based 行号映射
 */

export interface CodeMapping {
  java: number;
  cpp: number;
  python: number;
  javascript: number;
}

// ==========================================
// 1. Class 155: 动态树 Link-Cut Tree (LCT)
// ==========================================
export const LCT_CODES: Record<string, string[]> = {
  java: [
    'public void access(int x) { // 打通根到 x 的实链', // 1
    '    for (int t = 0; x != 0; t = x, x = fa[x]) {', // 2
    '        splay(x); rc[x] = t; pushUp(x); // 将右儿子换为新的实链节点 t', // 3
    '    }', // 4
    '}', // 5
    'public void makeRoot(int x) { access(x); splay(x); pushRev(x); } // 换根', // 6
    'public void link(int x, int y) { makeRoot(x); if (findRoot(y) != x) fa[x] = y; } // 动态加边', // 7
    'public void cut(int x, int y) { makeRoot(x); if (findRoot(y) == x && fa[y] == x && !lc[y]) { fa[y] = rc[x] = 0; pushUp(x); } }', // 8
  ],
  cpp: [
    'void access(int x) {', // 1
    '    for (int t = 0; x; t = x, x = fa[x]) {', // 2
    '        splay(x); rc[x] = t; pushUp(x);', // 3
    '    }', // 4
    '}', // 5
    'void makeRoot(int x) { access(x); splay(x); pushRev(x); }', // 6
    'void link(int x, int y) { makeRoot(x); if (findRoot(y) != x) fa[x] = y; }', // 7
    'void cut(int x, int y) { makeRoot(x); if (findRoot(y) == x && fa[y] == x && !lc[y]) { fa[y] = rc[x] = 0; pushUp(x); } }', // 8
  ],
  python: [
    'def access(self, x: int):', // 1
    '    t = 0', // 2
    '    while x:', // 3
    '        self.splay(x); self.rc[x] = t; self.push_up(x); t = x; x = self.fa[x]', // 4
    'def make_root(self, x: int):', // 5
    '    self.access(x); self.splay(x); self.push_rev(x)', // 6
    'def link(self, x: int, y: int):', // 7
    '    self.make_root(x); if self.find_root(y) != x: self.fa[x] = y', // 8
    'def cut(self, x: int, y: int):', // 9
    '    self.make_root(x); if self.find_root(y) == x and self.fa[y] == x and not self.lc[y]: self.fa[y] = self.rc[x] = 0; self.push_up(x)', // 10
  ],
  javascript: [
    'function access(x) {', // 1
    '    for (let t = 0; x; t = x, x = fa[x]) {', // 2
    '        splay(x); rc[x] = t; pushUp(x);', // 3
    '    }', // 4
    '}', // 5
    'function makeRoot(x) { access(x); splay(x); pushRev(x); }', // 6
    'function link(x, y) { makeRoot(x); if (findRoot(y) !== x) fa[x] = y; }', // 7
    'function cut(x, y) { makeRoot(x); if (findRoot(y) === x && fa[y] === x && !lc[y]) { fa[y] = rc[x] = 0; pushUp(x); } }', // 8
  ],
};

export const LCT_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  accessPath:{ java: 3, cpp: 3, python: 4, javascript: 3 },
  makeRoot:  { java: 6, cpp: 6, python: 6, javascript: 6 },
  linkEdge:  { java: 7, cpp: 7, python: 8, javascript: 7 },
  cutEdge:   { java: 8, cpp: 8, python: 10, javascript: 8 },
};

// ==========================================
// 2. Class 156: 可持久化线段树 / 主席树 (Persistent Segment Tree)
// ==========================================
export const PERSISTENT_SEGMENT_CODES: Record<string, string[]> = {
  java: [
    'public int insert(int pre, int l, int r, int val) { // 插入单点生成新版本', // 1
    '    int cur = ++tot; lc[cur] = lc[pre]; rc[cur] = rc[pre]; count[cur] = count[pre] + 1; // 共享历史子树', // 2
    '    if (l == r) return cur;', // 3
    '    int mid = (l + r) >> 1;', // 4
    '    if (val <= mid) lc[cur] = insert(lc[pre], l, mid, val);', // 5
    '    else rc[cur] = insert(rc[pre], mid + 1, r, val);', // 6
    '    return cur;', // 7
    '}', // 8
    'public int queryKth(int u, int v, int l, int r, int k) { // 差分版本树求区间第 K 小', // 9
    '    if (l == r) return l;', // 10
    '    int cntLeft = count[lc[v]] - count[lc[u]]; // 左子树频次增量', // 11
    '    int mid = (l + r) >> 1;', // 12
    '    if (k <= cntLeft) return queryKth(lc[u], lc[v], l, mid, k);', // 13
    '    else return queryKth(rc[u], rc[v], mid + 1, r, k - cntLeft);', // 14
    '}', // 15
  ],
  cpp: [
    'int insert(int pre, int l, int r, int val) {', // 1
    '    int cur = ++tot; lc[cur] = lc[pre]; rc[cur] = rc[pre]; count[cur] = count[pre] + 1;', // 2
    '    if (l == r) return cur;', // 3
    '    int mid = (l + r) >> 1;', // 4
    '    if (val <= mid) lc[cur] = insert(lc[pre], l, mid, val);', // 5
    '    else rc[cur] = insert(rc[pre], mid + 1, r, val);', // 6
    '    return cur;', // 7
    '}', // 8
    'int queryKth(int u, int v, int l, int r, int k) {', // 9
    '    if (l == r) return l;', // 10
    '    int cntLeft = count[lc[v]] - count[lc[u]];', // 11
    '    int mid = (l + r) >> 1;', // 12
    '    if (k <= cntLeft) return queryKth(lc[u], lc[v], l, mid, k);', // 13
    '    else return queryKth(rc[u], rc[v], mid + 1, r, k - cntLeft);', // 14
    '}', // 15
  ],
  python: [
    'def insert(self, pre: int, l: int, r: int, val: int) -> int:', // 1
    '    cur = self.new_node(); self.lc[cur] = self.lc[pre]; self.rc[cur] = self.rc[pre]; self.count[cur] = self.count[pre] + 1', // 2
    '    if l == r: return cur', // 3
    '    mid = (l + r) // 2', // 4
    '    if val <= mid: self.lc[cur] = self.insert(self.lc[pre], l, mid, val)', // 5
    '    else: self.rc[cur] = self.insert(self.rc[pre], mid + 1, r, val)', // 6
    '    return cur', // 7
    'def query_kth(self, u: int, v: int, l: int, r: int, k: int) -> int:', // 8
    '    if l == r: return l', // 9
    '    cnt_left = self.count[self.lc[v]] - self.count[self.lc[u]]', // 10
    '    mid = (l + r) // 2', // 11
    '    if k <= cnt_left: return self.query_kth(self.lc[u], self.lc[v], l, mid, k)', // 12
    '    else: return self.query_kth(self.rc[u], self.rc[v], mid + 1, r, k - cnt_left)', // 13
  ],
  javascript: [
    'function insert(pre, l, r, val) {', // 1
    '    const cur = ++tot; lc[cur] = lc[pre]; rc[cur] = rc[pre]; count[cur] = count[pre] + 1;', // 2
    '    if (l === r) return cur;', // 3
    '    const mid = (l + r) >> 1;', // 4
    '    if (val <= mid) lc[cur] = insert(lc[pre], l, mid, val);', // 5
    '    else rc[cur] = insert(rc[pre], mid + 1, r, val);', // 6
    '    return cur;', // 7
    '}', // 8
    'function queryKth(u, v, l, r, k) {', // 9
    '    if (l === r) return l;', // 10
    '    const cntLeft = count[lc[v]] - count[lc[u]];', // 11
    '    const mid = (l + r) >> 1;', // 12
    '    if (k <= cntLeft) return queryKth(lc[u], lc[v], l, mid, k);', // 13
    '    else return queryKth(rc[u], rc[v], mid + 1, r, k - cntLeft);', // 14
    '}', // 15
  ],
};

export const PERSISTENT_SEGMENT_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  cloneNode: { java: 2, cpp: 2, python: 2, javascript: 2 },
  queryKth:  { java: 9, cpp: 9, python: 8, javascript: 9 },
  diffCheck: { java: 11, cpp: 11, python: 10, javascript: 11 },
  returnAns: { java: 13, cpp: 13, python: 12, javascript: 13 },
};

// ==========================================
// 3. Class 157: 可持久化平衡树 (Persistent Treap)
// ==========================================
export const PERSISTENT_TREAP_CODES: Record<string, string[]> = {
  java: [
    'public void split(int root, int key, int[] out) { // 写时复制 COW 分裂', // 1
    '    if (root == 0) { out[0] = out[1] = 0; return; }', // 2
    '    int cur = cloneNode(root); // 复制路径节点，旧版本不受破坏', // 3
    '    if (val[cur] <= key) { out[0] = cur; split(rc[cur], key, out); rc[cur] = out[1]; }', // 4
    '    else { out[1] = cur; split(lc[cur], key, out); lc[cur] = out[0]; }', // 5
    '    pushUp(cur);', // 6
    '}', // 7
    'public int merge(int x, int y) { // 写时复制合并', // 8
    '    if (x == 0 || y == 0) return x + y;', // 9
    '    if (pri[x] < pri[y]) { int cur = cloneNode(x); rc[cur] = merge(rc[cur], y); pushUp(cur); return cur; }', // 10
    '    else { int cur = cloneNode(y); lc[cur] = merge(x, lc[cur]); pushUp(cur); return cur; }', // 11
    '}', // 12
  ],
  cpp: [
    'void split(int root, int key, int& x, int& y) {', // 1
    '    if (!root) { x = y = 0; return; }', // 2
    '    int cur = cloneNode(root);', // 3
    '    if (val[cur] <= key) { x = cur; split(rc[cur], key, rc[cur], y); }', // 4
    '    else { y = cur; split(lc[cur], key, x, lc[cur]); }', // 5
    '    pushUp(cur);', // 6
    '}', // 7
    'int merge(int x, int y) {', // 8
    '    if (!x || !y) return x + y;', // 9
    '    if (pri[x] < pri[y]) { int cur = cloneNode(x); rc[cur] = merge(rc[cur], y); pushUp(cur); return cur; }', // 10
    '    else { int cur = cloneNode(y); lc[cur] = merge(x, lc[cur]); pushUp(cur); return cur; }', // 11
    '}', // 12
  ],
  python: [
    'def split(self, root: int, key: int):', // 1
    '    if not root: return 0, 0', // 2
    '    cur = self.clone_node(root)', // 3
    '    if self.val[cur] <= key: x = cur; self.rc[cur], y = self.split(self.rc[cur], key)', // 4
    '    else: y = cur; x, self.lc[cur] = self.split(self.lc[cur], key)', // 5
    '    self.push_up(cur); return x, y', // 6
    'def merge(self, x: int, y: int) -> int:', // 7
    '    if not x or not y: return x + y', // 8
    '    if self.pri[x] < self.pri[y]: cur = self.clone_node(x); self.rc[cur] = self.merge(self.rc[cur], y); self.push_up(cur); return cur', // 9
    '    else: cur = self.clone_node(y); self.lc[cur] = self.merge(x, self.lc[cur]); self.push_up(cur); return cur', // 10
  ],
  javascript: [
    'function split(root, key) {', // 1
    '    if (!root) return [0, 0];', // 2
    '    const cur = cloneNode(root);', // 3
    '    if (val[cur] <= key) { const [, r] = split(rc[cur], key); rc[cur] = r; return [cur, r]; }', // 4
    '    else { const [l] = split(lc[cur], key); lc[cur] = l; return [l, cur]; }', // 5
    '}', // 6
    'function merge(x, y) {', // 7
    '    if (!x || !y) return x + y;', // 8
    '    if (pri[x] < pri[y]) { const cur = cloneNode(x); rc[cur] = merge(rc[cur], y); pushUp(cur); return cur; }', // 9
    '    else { const cur = cloneNode(y); lc[cur] = merge(x, lc[cur]); pushUp(cur); return cur; }', // 10
    '}', // 11
  ],
};

export const PERSISTENT_TREAP_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  cowClone:  { java: 3, cpp: 3, python: 3, javascript: 3 },
  splitPath: { java: 4, cpp: 4, python: 4, javascript: 4 },
  mergeCow:  { java: 10, cpp: 10, python: 9, javascript: 9 },
  returnAns: { java: 12, cpp: 12, python: 10, javascript: 11 },
};

// ==========================================
// 4. Class 158: 树上启发式合并 (DSU on Tree)
// ==========================================
export const DSU_ON_TREE_CODES: Record<string, string[]> = {
  java: [
    'public void dsu(int u, int p, boolean keep) {', // 1
    '    for (int v : adj.get(u)) if (v != p && v != heavySon[u]) dsu(v, u, false); // 先处理轻儿子，不保留贡献', // 2
    '    if (heavySon[u] != 0) dsu(heavySon[u], u, true); // 处理重儿子，保留贡献', // 3
    '    addContribute(u, p, 1, heavySon[u]); // 暴力并入轻儿子子树', // 4
    '    ans[u] = maxColorSum; // 记录当前节点答案', // 5
    '    if (!keep) addContribute(u, p, -1, 0); // 若不保留则清除当前子树全部贡献', // 6
    '}', // 7
  ],
  cpp: [
    'void dsu(int u, int p, bool keep) {', // 1
    '    for (int v : adj[u]) if (v != p && v != heavySon[u]) dsu(v, u, false);', // 2
    '    if (heavySon[u]) dsu(heavySon[u], u, true);', // 3
    '    addContribute(u, p, 1, heavySon[u]);', // 4
    '    ans[u] = maxColorSum;', // 5
    '    if (!keep) addContribute(u, p, -1, 0);', // 6
    '}', // 7
  ],
  python: [
    'def dsu(self, u: int, p: int, keep: bool):', // 1
    '    for v in self.adj[u]:', // 2
    '        if v != p and v != self.heavy_son[u]: self.dsu(v, u, False)', // 3
    '    if self.heavy_son[u]: self.dsu(self.heavy_son[u], u, True)', // 4
    '    self.add_contribute(u, p, 1, self.heavy_son[u])', // 5
    '    self.ans[u] = self.max_color_sum', // 6
    '    if not keep: self.add_contribute(u, p, -1, 0)', // 7
  ],
  javascript: [
    'function dsu(u, p, keep) {', // 1
    '    for (const v of adj[u]) if (v !== p && v !== heavySon[u]) dsu(v, u, false);', // 2
    '    if (heavySon[u]) dsu(heavySon[u], u, true);', // 3
    '    addContribute(u, p, 1, heavySon[u]);', // 4
    '    ans[u] = maxColorSum;', // 5
    '    if (!keep) addContribute(u, p, -1, 0);', // 6
    '}', // 7
  ],
};

export const DSU_ON_TREE_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  lightDsu:  { java: 2, cpp: 2, python: 3, javascript: 2 },
  heavyDsu:  { java: 3, cpp: 3, python: 4, javascript: 3 },
  mergeLight:{ java: 4, cpp: 4, python: 5, javascript: 4 },
  clearKeep: { java: 6, cpp: 6, python: 7, javascript: 6 },
};

// ==========================================
// 5. Class 159: 莫队算法 (Mo's Algorithm)
// ==========================================
export const MO_ALGORITHM_CODES: Record<string, string[]> = {
  java: [
    'public void solveMo(Query[] queries) {', // 1
    '    Arrays.sort(queries, (a, b) -> (pos[a.l] != pos[b.l]) ? pos[a.l] - pos[b.l] : (((pos[a.l] & 1) == 1) ? a.r - b.r : b.r - a.r)); // 奇偶分块排序', // 2
    '    int l = 1, r = 0; long curAns = 0;', // 3
    '    for (Query q : queries) {', // 4
    '        while (l > q.l) add(--l); while (r < q.r) add(++r); // 双指针伸展扩展', // 5
    '        while (l < q.l) del(l++); while (r > q.r) del(r--); // 双指针收缩删除', // 6
    '        ans[q.id] = curAns; // 记录答案', // 7
    '    }', // 8
    '}', // 9
  ],
  cpp: [
    'void solveMo(vector<Query>& queries) {', // 1
    '    sort(queries.begin(), queries.end(), [](const Query& a, const Query& b) {', // 2
    '        return (pos[a.l] != pos[b.l]) ? pos[a.l] < pos[b.l] : ((pos[a.l] & 1) ? a.r < b.r : a.r > b.r);', // 3
    '    });', // 4
    '    int l = 1, r = 0;', // 5
    '    for (auto& q : queries) {', // 6
    '        while (l > q.l) add(--l); while (r < q.r) add(++r);', // 7
    '        while (l < q.l) del(l++); while (r > q.r) del(r--);', // 8
    '        ans[q.id] = curAns;', // 9
    '    }', // 10
    '}', // 11
  ],
  python: [
    'def solve_mo(self, queries):', // 1
    '    queries.sort(key=lambda q: (self.pos[q.l], q.r if (self.pos[q.l] & 1) else -q.r))', // 2
    '    l, r = 1, 0', // 3
    '    for q in queries:', // 4
    '        while l > q.l: l -= 1; self.add(l)', // 5
    '        while r < q.r: r += 1; self.add(r)', // 6
    '        while l < q.l: self.del_item(l); l += 1', // 7
    '        while r > q.r: self.del_item(r); r -= 1', // 8
    '        self.ans[q.id] = self.cur_ans', // 9
  ],
  javascript: [
    'function solveMo(queries) {', // 1
    '    queries.sort((a, b) => (pos[a.l] !== pos[b.l]) ? pos[a.l] - pos[b.l] : (((pos[a.l] & 1) === 1) ? a.r - b.r : b.r - a.r));', // 2
    '    let l = 1, r = 0;', // 3
    '    for (const q of queries) {', // 4
    '        while (l > q.l) add(--l); while (r < q.r) add(++r);', // 5
    '        while (l < q.l) del(l++); while (r > q.r) del(r--);', // 6
    '        ans[q.id] = curAns;', // 7
    '    }', // 8
    '}', // 9
  ],
};

export const MO_ALGORITHM_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  sortBlock: { java: 2, cpp: 2, python: 2, javascript: 2 },
  shiftLeft: { java: 5, cpp: 7, python: 5, javascript: 5 },
  shiftRight:{ java: 6, cpp: 8, python: 7, javascript: 6 },
  returnAns: { java: 7, cpp: 9, python: 9, javascript: 7 },
};

// ==========================================
// 6. Class 160: 快速傅里叶变换 (FFT)
// ==========================================
export const FFT_POLYNOMIAL_CODES: Record<string, string[]> = {
  java: [
    'public void fft(Complex[] a, int n, int type) { // type=1 DFT, type=-1 IDFT', // 1
    '    for (int i = 0; i < n; i++) if (i < rev[i]) swap(a, i, rev[i]); // 雷德算法位逆序置换', // 2
    '    for (int mid = 1; mid < n; mid <<= 1) { // 迭代分治长度', // 3
    '        Complex wn = new Complex(Math.cos(PI / mid), type * Math.sin(PI / mid)); // 单位根步进', // 4
    '        for (int r = 0; r < n; r += (mid << 1)) {', // 5
    '            Complex w = new Complex(1, 0);', // 6
    '            for (int l = 0; l < mid; l++, w = w.multiply(wn)) {', // 7
    '                Complex x = a[r + l], y = w.multiply(a[r + mid + l]); // 蝶形运算', // 8
    '                a[r + l] = x.add(y); a[r + mid + l] = x.subtract(y);', // 9
    '            }', // 10
    '        }', // 11
    '    }', // 12
    '}', // 13
  ],
  cpp: [
    'void fft(vector<Complex>& a, int n, int type) {', // 1
    '    for (int i = 0; i < n; i++) if (i < rev[i]) swap(a[i], a[rev[i]]);', // 2
    '    for (int mid = 1; mid < n; mid <<= 1) {', // 3
    '        Complex wn(cos(PI / mid), type * sin(PI / mid));', // 4
    '        for (int r = 0; r < n; r += (mid << 1)) {', // 5
    '            Complex w(1, 0);', // 6
    '            for (int l = 0; l < mid; l++, w = w * wn) {', // 7
    '                Complex x = a[r + l], y = w * a[r + mid + l];', // 8
    '                a[r + l] = x + y; a[r + mid + l] = x - y;', // 9
    '            }', // 10
    '        }', // 11
    '    }', // 12
    '}', // 13
  ],
  python: [
    'def fft(self, a: list, n: int, type_flag: int):', // 1
    '    for i in range(n):', // 2
    '        if i < self.rev[i]: a[i], a[self.rev[i]] = a[self.rev[i]], a[i]', // 3
    '    mid = 1', // 4
    '    while mid < n:', // 5
    '        wn = complex(math.cos(math.pi / mid), type_flag * math.sin(math.pi / mid))', // 6
    '        for r in range(0, n, mid * 2):', // 7
    '            w = complex(1, 0)', // 8
    '            for l in range(mid):', // 9
    '                x, y = a[r + l], w * a[r + mid + l]', // 10
    '                a[r + l], a[r + mid + l] = x + y, x - y; w *= wn', // 11
    '        mid *= 2', // 12
  ],
  javascript: [
    'function fft(a, n, type) {', // 1
    '    for (let i = 0; i < n; i++) if (i < rev[i]) swap(a, i, rev[i]);', // 2
    '    for (let mid = 1; mid < n; mid <<= 1) {', // 3
    '        const wn = { r: Math.cos(Math.PI / mid), i: type * Math.sin(Math.PI / mid) };', // 4
    '        for (let r = 0; r < n; r += (mid << 1)) {', // 5
    '            let w = { r: 1, i: 0 };', // 6
    '            for (let l = 0; l < mid; l++) {', // 7
    '                const x = a[r + l], y = complexMul(w, a[r + mid + l]);', // 8
    '                a[r + l] = complexAdd(x, y); a[r + mid + l] = complexSub(x, y);', // 9
    '                w = complexMul(w, wn);', // 10
    '            }', // 11
    '        }', // 12
    '    }', // 13
    '}', // 14
  ],
};

export const FFT_POLYNOMIAL_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  bitReverse:{ java: 2, cpp: 2, python: 3, javascript: 2 },
  unitRoot:  { java: 4, cpp: 4, python: 6, javascript: 4 },
  butterfly: { java: 8, cpp: 8, python: 10, javascript: 8 },
  returnAns: { java: 12, cpp: 12, python: 12, javascript: 13 },
};
