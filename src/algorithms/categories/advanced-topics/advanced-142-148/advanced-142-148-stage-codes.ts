/**
 * 左神算法通关课 142 ~ 148 差分约束、同余最短路、二项式反演、康托展开、卡特兰数与 AVL 树多语言代码与行号映射
 */

export interface CodeMapping {
  java: number;
  cpp: number;
  python: number;
  javascript: number;
}

// ==========================================
// 1. Class 142: 差分约束系统与负环判定 (Difference Constraints)
// ==========================================
export const DIFF_CONSTRAINTS_CODES: Record<string, string[]> = {
  java: [
    'public boolean solveDiffConstraints(int n, List<Edge> edges, int[] dist) {', // 1
    '    int[] count = new int[n + 1]; boolean[] inQueue = new boolean[n + 1];', // 2
    '    Queue<Integer> q = new LinkedList<>();', // 3
    '    for (int i = 1; i <= n; i++) { q.offer(i); inQueue[i] = true; } // 超级源点', // 4
    '    while (!q.isEmpty()) {', // 5
    '        int u = q.poll(); inQueue[u] = false;', // 6
    '        for (Edge e : adj.get(u)) {', // 7
    '            if (dist[u] + e.w < dist[e.v]) {', // 8
    '                dist[e.v] = dist[u] + e.w;', // 9
    '                if (!inQueue[e.v]) {', // 10
    '                    count[e.v]++;', // 11
    '                    if (count[e.v] >= n) return false; // 存在负环，无解', // 12
    '                    q.offer(e.v); inQueue[e.v] = true;', // 13
    '                }', // 14
    '            }', // 15
    '        }', // 16
    '    }', // 17
    '    return true; // 成功求出可行解', // 18
    '}', // 19
  ],
  cpp: [
    'bool solveDiffConstraints(int n, vector<int>& dist) {', // 1
    '    vector<int> count(n + 1, 0); vector<bool> inQueue(n + 1, true);', // 2
    '    queue<int> q;', // 3
    '    for (int i = 1; i <= n; i++) q.push(i);', // 4
    '    while (!q.empty()) {', // 5
    '        int u = q.front(); q.pop(); inQueue[u] = false;', // 6
    '        for (auto& e : adj[u]) {', // 7
    '            if (dist[u] + e.w < dist[e.v]) {', // 8
    '                dist[e.v] = dist[u] + e.w;', // 9
    '                if (!inQueue[e.v]) {', // 10
    '                    if (++count[e.v] >= n) return false;', // 11
    '                    q.push(e.v); inQueue[e.v] = true;', // 12
    '                }', // 13
    '            }', // 14
    '        }', // 15
    '    }', // 16
    '    return true;', // 17
    '}', // 18
  ],
  python: [
    'def solve_diff_constraints(n: int, dist: list[int]) -> bool:', // 1
    '    count, in_q = [0] * (n + 1), [True] * (n + 1)', // 2
    '    q = deque(range(1, n + 1))', // 3
    '    while q:', // 4
    '        u = q.popleft(); in_q[u] = False', // 5
    '        for v, w in adj[u]:', // 6
    '            if dist[u] + w < dist[v]:', // 7
    '                dist[v] = dist[u] + w', // 8
    '                if not in_q[v]:', // 9
    '                    count[v] += 1', // 10
    '                    if count[v] >= n: return False', // 11
    '                    q.append(v); in_q[v] = True', // 12
    '    return True', // 13
  ],
  javascript: [
    'function solveDiffConstraints(n, dist) {', // 1
    '    const count = new Array(n + 1).fill(0); const inQueue = new Array(n + 1).fill(true);', // 2
    '    const q = [];', // 3
    '    for (let i = 1; i <= n; i++) q.push(i);', // 4
    '    while (q.length) {', // 5
    '        const u = q.shift(); inQueue[u] = false;', // 6
    '        for (const e of adj[u]) {', // 7
    '            if (dist[u] + e.w < dist[e.v]) {', // 8
    '                dist[e.v] = dist[u] + e.w;', // 9
    '                if (!inQueue[e.v]) {', // 10
    '                    count[e.v]++;', // 11
    '                    if (count[e.v] >= n) return false;', // 12
    '                    q.push(e.v); inQueue[e.v] = true;', // 13
    '                }', // 14
    '            }', // 15
    '        }', // 16
    '    }', // 17
    '    return true;', // 18
    '}', // 19
  ],
};

export const DIFF_CONSTRAINTS_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  initQueue: { java: 4, cpp: 4, python: 3, javascript: 4 },
  relaxEdge: { java: 9, cpp: 9, python: 8, javascript: 9 },
  checkCycle:{ java: 12, cpp: 11, python: 11, javascript: 12 },
  returnAns: { java: 18, cpp: 17, python: 13, javascript: 18 },
};

// ==========================================
// 2. Class 143: 同余最短路 (Congruence Shortest Path)
// ==========================================
export const CONGRUENCE_PATH_CODES: Record<string, string[]> = {
  java: [
    'public long countHeights(int x, int y, int z, long h) {', // 1
    '    long[] dist = new long[x]; Arrays.fill(dist, Long.MAX_VALUE); dist[0] = 0;', // 2
    '    PriorityQueue<long[]> pq = new PriorityQueue<>(Comparator.comparingLong(a -> a[1]));', // 3
    '    pq.offer(new long[]{0, 0});', // 4
    '    while (!pq.isEmpty()) { // Dijkstra 求模 x 余数类的最小高度', // 5
    '        long[] cur = pq.poll(); int u = (int) cur[0];', // 6
    '        if (cur[1] > dist[u]) continue;', // 7
    '        int v1 = (u + y) % x; if (dist[u] + y < dist[v1]) { dist[v1] = dist[u] + y; pq.offer(new long[]{v1, dist[v1]}); }', // 8
    '        int v2 = (u + z) % x; if (dist[u] + z < dist[v2]) { dist[v2] = dist[u] + z; pq.offer(new long[]{v2, dist[v2]}); }', // 9
    '    }', // 10
    '    long ans = 0;', // 11
    '    for (int i = 0; i < x; i++) { if (h >= dist[i]) ans += (h - dist[i]) / x + 1; }', // 12
    '    return ans;', // 13
    '}', // 14
  ],
  cpp: [
    'long long countHeights(int x, int y, int z, long long h) {', // 1
    '    vector<long long> dist(x, 1e18); dist[0] = 0;', // 2
    '    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;', // 3
    '    pq.push({0, 0});', // 4
    '    while (!pq.empty()) {', // 5
    '        auto [d, u] = pq.top(); pq.pop();', // 6
    '        if (d > dist[u]) continue;', // 7
    '        int v1 = (u + y) % x; if (dist[u] + y < dist[v1]) { dist[v1] = dist[u] + y; pq.push({dist[v1], v1}); }', // 8
    '        int v2 = (u + z) % x; if (dist[u] + z < dist[v2]) { dist[v2] = dist[u] + z; pq.push({dist[v2], v2}); }', // 9
    '    }', // 10
    '    long long ans = 0;', // 11
    '    for (int i = 0; i < x; i++) if (h >= dist[i]) ans += (h - dist[i]) / x + 1;', // 12
    '    return ans;', // 13
    '}', // 14
  ],
  python: [
    'def count_heights(x: int, y: int, z: int, h: int) -> int:', // 1
    '    dist = [float("inf")] * x; dist[0] = 0', // 2
    '    pq = [(0, 0)]', // 3
    '    while pq:', // 4
    '        d, u = heapq.heappop(pq)', // 5
    '        if d > dist[u]: continue', // 6
    '        for step in (y, z):', // 7
    '            v = (u + step) % x', // 8
    '            if dist[u] + step < dist[v]:', // 9
    '                dist[v] = dist[u] + step; heapq.heappush(pq, (dist[v], v))', // 10
    '    ans = sum((h - dist[i]) // x + 1 for i in range(x) if h >= dist[i])', // 11
    '    return ans', // 12
  ],
  javascript: [
    'function countHeights(x, y, z, h) {', // 1
    '    const dist = new Array(x).fill(Infinity); dist[0] = 0;', // 2
    '    const pq = [[0, 0]];', // 3
    '    while (pq.length) {', // 4
    '        pq.sort((a, b) => a[0] - b[0]); const [d, u] = pq.shift();', // 5
    '        if (d > dist[u]) continue;', // 6
    '        for (const step of [y, z]) {', // 7
    '            const v = (u + step) % x;', // 8
    '            if (dist[u] + step < dist[v]) { dist[v] = dist[u] + step; pq.push([dist[v], v]); }', // 9
    '        }', // 10
    '    }', // 11
    '    let ans = 0;', // 12
    '    for (let i = 0; i < x; i++) { if (h >= dist[i]) ans += Math.floor((h - dist[i]) / x) + 1; }', // 13
    '    return ans;', // 14
    '}', // 15
  ],
};

export const CONGRUENCE_PATH_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  initDist:  { java: 2, cpp: 2, python: 2, javascript: 2 },
  dijkstra:  { java: 8, cpp: 8, python: 10, javascript: 9 },
  countAns:  { java: 12, cpp: 12, python: 11, javascript: 13 },
  returnAns: { java: 13, cpp: 13, python: 12, javascript: 14 },
};

// ==========================================
// 3. Class 145: 二项式反演 (Binomial Inversion)
// ==========================================
export const BINOMIAL_INVERSION_CODES: Record<string, string[]> = {
  java: [
    'public long derangement(int n) {', // 1
    '    long[] d = new long[n + 1];', // 2
    '    d[0] = 1; if (n >= 1) d[1] = 0;', // 3
    '    for (int i = 2; i <= n; i++) {', // 4
    '        d[i] = (i - 1) * (d[i - 1] + d[i - 2]); // 错排递推', // 5
    '    }', // 6
    '    return d[n];', // 7
    '}', // 8
  ],
  cpp: [
    'long long derangement(int n) {', // 1
    '    vector<long long> d(n + 1, 0);', // 2
    '    d[0] = 1; if (n >= 1) d[1] = 0;', // 3
    '    for (int i = 2; i <= n; i++) {', // 4
    '        d[i] = (i - 1) * (d[i - 1] + d[i - 2]);', // 5
    '    }', // 6
    '    return d[n];', // 7
    '}', // 8
  ],
  python: [
    'def derangement(n: int) -> int:', // 1
    '    if n == 0: return 1', // 2
    '    if n == 1: return 0', // 3
    '    d0, d1 = 1, 0', // 4
    '    for i in range(2, n + 1):', // 5
    '        d0, d1 = d1, (i - 1) * (d0 + d1)', // 6
    '    return d1', // 7
  ],
  javascript: [
    'function derangement(n) {', // 1
    '    const d = new Array(n + 1).fill(0);', // 2
    '    d[0] = 1; if (n >= 1) d[1] = 0;', // 3
    '    for (let i = 2; i <= n; i++) {', // 4
    '        d[i] = (i - 1) * (d[i - 1] + d[i - 2]);', // 5
    '    }', // 6
    '    return d[n];', // 7
    '}', // 8
  ],
};

export const BINOMIAL_INVERSION_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  baseInit:  { java: 3, cpp: 3, python: 4, javascript: 3 },
  recurse:   { java: 5, cpp: 5, python: 6, javascript: 5 },
  returnAns: { java: 7, cpp: 7, python: 7, javascript: 7 },
};

// ==========================================
// 4. Class 146: 康托展开与逆康托展开 (Cantor Expansion)
// ==========================================
export const CANTOR_EXPANSION_CODES: Record<string, string[]> = {
  java: [
    'public long cantor(int[] p, int n) {', // 1
    '    long rank = 1;', // 2
    '    for (int i = 0; i < n; i++) {', // 3
    '        int smaller = 0;', // 4
    '        for (int j = i + 1; j < n; j++) if (p[j] < p[i]) smaller++; // 统计右侧较小元素', // 5
    '        rank += smaller * fact[n - 1 - i];', // 6
    '    }', // 7
    '    return rank;', // 8
    '}', // 9
  ],
  cpp: [
    'long long cantor(const vector<int>& p, int n) {', // 1
    '    long long rank = 1;', // 2
    '    for (int i = 0; i < n; i++) {', // 3
    '        int smaller = 0;', // 4
    '        for (int j = i + 1; j < n; j++) if (p[j] < p[i]) smaller++;', // 5
    '        rank += smaller * fact[n - 1 - i];', // 6
    '    }', // 7
    '    return rank;', // 8
    '}', // 9
  ],
  python: [
    'def cantor(p: list[int], n: int) -> int:', // 1
    '    rank = 1', // 2
    '    for i in range(n):', // 3
    '        smaller = sum(1 for j in range(i + 1, n) if p[j] < p[i])', // 4
    '        rank += smaller * fact[n - 1 - i]', // 5
    '    return rank', // 6
  ],
  javascript: [
    'function cantor(p, n) {', // 1
    '    let rank = 1;', // 2
    '    for (let i = 0; i < n; i++) {', // 3
    '        let smaller = 0;', // 4
    '        for (let j = i + 1; j < n; j++) if (p[j] < p[i]) smaller++;', // 5
    '        rank += smaller * fact[n - 1 - i];', // 6
    '    }', // 7
    '    return rank;', // 8
    '}', // 9
  ],
};

export const CANTOR_EXPANSION_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  countSmall:{ java: 5, cpp: 5, python: 4, javascript: 5 },
  accumRank: { java: 6, cpp: 6, python: 5, javascript: 6 },
  returnAns: { java: 8, cpp: 8, python: 6, javascript: 8 },
};

// ==========================================
// 5. Class 147: 卡特兰数 (Catalan Number)
// ==========================================
export const CATALAN_NUMBER_CODES: Record<string, string[]> = {
  java: [
    'public long getCatalan(int n) {', // 1
    '    long[] c = new long[n + 1]; c[0] = 1;', // 2
    '    for (int i = 1; i <= n; i++) {', // 3
    '        // 递推式: C(n) = C(n-1) * (4n - 2) / (n + 1)', // 4
    '        c[i] = c[i - 1] * (4 * i - 2) / (i + 1);', // 5
    '    }', // 6
    '    return c[n];', // 7
    '}', // 8
  ],
  cpp: [
    'long long getCatalan(int n) {', // 1
    '    vector<long long> c(n + 1, 0); c[0] = 1;', // 2
    '    for (int i = 1; i <= n; i++) {', // 3
    '        c[i] = c[i - 1] * (4 * i - 2) / (i + 1);', // 4
    '    }', // 5
    '    return c[n];', // 6
    '}', // 7
  ],
  python: [
    'def get_catalan(n: int) -> int:', // 1
    '    c = 1', // 2
    '    for i in range(1, n + 1):', // 3
    '        c = c * (4 * i - 2) // (i + 1)', // 4
    '    return c', // 5
  ],
  javascript: [
    'function getCatalan(n) {', // 1
    '    const c = new Array(n + 1).fill(0); c[0] = 1;', // 2
    '    for (let i = 1; i <= n; i++) {', // 3
    '        c[i] = Math.floor(c[i - 1] * (4 * i - 2) / (i + 1));', // 4
    '    }', // 5
    '    return c[n];', // 6
    '}', // 7
  ],
};

export const CATALAN_NUMBER_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  initZero:  { java: 2, cpp: 2, python: 2, javascript: 2 },
  stepRecur: { java: 5, cpp: 4, python: 4, javascript: 4 },
  returnAns: { java: 7, cpp: 6, python: 5, javascript: 6 },
};

// ==========================================
// 6. Class 148: AVL 平衡二叉搜索树 (AVL Tree)
// ==========================================
export const AVL_TREE_CODES: Record<string, string[]> = {
  java: [
    'public AVLNode insert(AVLNode node, int key) {', // 1
    '    if (node == null) return new AVLNode(key);', // 2
    '    if (key < node.key) node.left = insert(node.left, key);', // 3
    '    else if (key > node.key) node.right = insert(node.right, key);', // 4
    '    else return node; // 无重复键', // 5
    '    updateHeight(node); int b = getBalance(node);', // 6
    '    if (b > 1 && key < node.left.key) return rotateRight(node); // LL', // 7
    '    if (b < -1 && key > node.right.key) return rotateLeft(node); // RR', // 8
    '    if (b > 1 && key > node.left.key) { node.left = rotateLeft(node.left); return rotateRight(node); } // LR', // 9
    '    if (b < -1 && key < node.right.key) { node.right = rotateRight(node.right); return rotateLeft(node); } // RL', // 10
    '    return node;', // 11
    '}', // 12
  ],
  cpp: [
    'AVLNode* insert(AVLNode* node, int key) {', // 1
    '    if (!node) return new AVLNode(key);', // 2
    '    if (key < node->key) node->left = insert(node->left, key);', // 3
    '    else if (key > node->key) node->right = insert(node->right, key);', // 4
    '    else return node;', // 5
    '    updateHeight(node); int b = getBalance(node);', // 6
    '    if (b > 1 && key < node->left->key) return rotateRight(node);', // 7
    '    if (b < -1 && key > node->right->key) return rotateLeft(node);', // 8
    '    if (b > 1 && key > node->left->key) { node->left = rotateLeft(node->left); return rotateRight(node); }', // 9
    '    if (b < -1 && key < node->right->key) { node->right = rotateRight(node->right); return rotateLeft(node); }', // 10
    '    return node;', // 11
    '}', // 12
  ],
  python: [
    'def insert(node, key):', // 1
    '    if not node: return AVLNode(key)', // 2
    '    if key < node.key: node.left = insert(node.left, key)', // 3
    '    elif key > node.key: node.right = insert(node.right, key)', // 4
    '    else: return node', // 5
    '    update_height(node); b = get_balance(node)', // 6
    '    if b > 1 and key < node.left.key: return rotate_right(node)', // 7
    '    if b < -1 and key > node.right.key: return rotate_left(node)', // 8
    '    if b > 1 and key > node.left.key: node.left = rotate_left(node.left); return rotate_right(node)', // 9
    '    if b < -1 and key < node.right.key: node.right = rotate_right(node.right); return rotate_left(node)', // 10
    '    return node', // 11
  ],
  javascript: [
    'function insert(node, key) {', // 1
    '    if (!node) return new AVLNode(key);', // 2
    '    if (key < node.key) node.left = insert(node.left, key);', // 3
    '    else if (key > node.key) node.right = insert(node.right, key);', // 4
    '    else return node;', // 5
    '    updateHeight(node); const b = getBalance(node);', // 6
    '    if (b > 1 && key < node.left.key) return rotateRight(node);', // 7
    '    if (b < -1 && key > node.right.key) return rotateLeft(node);', // 8
    '    if (b > 1 && key > node.left.key) { node.left = rotateLeft(node.left); return rotateRight(node); }', // 9
    '    if (b < -1 && key < node.right.key) { node.right = rotateRight(node.right); return rotateLeft(node); }', // 10
    '    return node;', // 11
    '}', // 12
  ],
};

export const AVL_TREE_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  bstInsert: { java: 3, cpp: 3, python: 3, javascript: 3 },
  checkBal:  { java: 6, cpp: 6, python: 6, javascript: 6 },
  rotateLL:  { java: 7, cpp: 7, python: 7, javascript: 7 },
  rotateRR:  { java: 8, cpp: 8, python: 8, javascript: 8 },
  returnAns: { java: 11, cpp: 11, python: 11, javascript: 11 },
};
