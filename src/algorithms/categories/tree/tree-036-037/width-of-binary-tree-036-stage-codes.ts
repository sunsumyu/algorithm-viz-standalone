/**
 * 二叉树最大宽度 (Width of Binary Tree · LeetCode 662 / Class 036 Code03)
 * 多阶段演化四语言代码模板与精准 1-Based 行号映射
 *
 * Stage 1: 标准 Queue + 基准偏移防溢出 (Queue BFS with Base Offset · 经典集合)
 * Stage 2: 静态连续双数组模拟队列 (Two Static Arrays Queue · 左神 Class 036 招牌零 GC)
 * Stage 3: DFS 递归先序遍历记录每层最左编号 (Depth-Indexed DFS with Leftmost Map)
 */

// ============================================================
// Stage 1: 标准 Queue + 基准偏移防溢出 (Queue BFS with Base Offset)
// ============================================================
export const WIDTH_STAGE1_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                         // 1
    '    public int widthOfBinaryTree(TreeNode root) {',               // 2
    '        if (root == null) return 0;',                             // 3
    '        int maxWidth = 0;',                                       // 4
    '        Queue<Pair<TreeNode, Integer>> queue = new LinkedList<>();', // 5
    '        queue.offer(new Pair<>(root, 1));',                       // 6
    '        while (!queue.isEmpty()) {',                              // 7
    '            int size = queue.size();',                            // 8
    '            int base = queue.peek().getValue();',                 // 9
    '            int left = 0, right = 0;',                            // 10
    '            for (int i = 0; i < size; i++) {',                    // 11
    '                Pair<TreeNode, Integer> pair = queue.poll();',    // 12
    '                TreeNode cur = pair.getKey();',                   // 13
    '                int idx = pair.getValue() - base;',               // 14
    '                if (i == 0) left = idx;',                         // 15
    '                if (i == size - 1) right = idx;',                 // 16
    '                if (cur.left != null) queue.offer(new Pair<>(cur.left, idx * 2));', // 17
    '                if (cur.right != null) queue.offer(new Pair<>(cur.right, idx * 2 + 1));', // 18
    '            }',                                                   // 19
    '            maxWidth = Math.max(maxWidth, right - left + 1);',    // 20
    '        }',                                                       // 21
    '        return maxWidth;',                                        // 22
    '    }',                                                           // 23
    '}',                                                               // 24
  ],
  cpp: [
    'class Solution {',                                                // 1
    'public:',                                                         // 2
    '    int widthOfBinaryTree(TreeNode* root) {',                     // 3
    '        if (!root) return 0;',                                    // 4
    '        long long maxWidth = 0;',                                 // 5
    '        queue<pair<TreeNode*, long long>> q;',                    // 6
    '        q.push({root, 1});',                                      // 7
    '        while (!q.empty()) {',                                    // 8
    '            int sz = q.size();',                                  // 9
    '            long long base = q.front().second;',                  // 10
    '            long long left = 0, right = 0;',                      // 11
    '            for (int i = 0; i < sz; ++i) {',                      // 12
    '                auto [cur, rawIdx] = q.front(); q.pop();',        // 13
    '                long long idx = rawIdx - base;',                  // 14
    '                if (i == 0) left = idx;',                         // 15
    '                if (i == sz - 1) right = idx;',                   // 16
    '                if (cur->left) q.push({cur->left, idx * 2});',    // 17
    '                if (cur->right) q.push({cur->right, idx * 2 + 1});', // 18
    '            }',                                                   // 19
    '            maxWidth = max(maxWidth, right - left + 1);',         // 20
    '        }',                                                       // 21
    '        return maxWidth;',                                        // 22
    '    }',                                                           // 23
    '};',                                                              // 24
  ],
  python: [
    'class Solution:',                                                 // 1
    '    def widthOfBinaryTree(self, root: Optional[TreeNode]) -> int:', // 2
    '        if not root: return 0',                                   // 3
    '        max_width = 0',                                           // 4
    '        q = collections.deque([(root, 1)])',                      // 5
    '        while q:',                                                // 6
    '            sz = len(q)',                                         // 7
    '            _, base = q[0]',                                      // 8
    '            left, right = 0, 0',                                  // 9
    '            for i in range(sz):',                                 // 10
    '                cur, raw_idx = q.popleft()',                      // 11
    '                idx = raw_idx - base',                            // 12
    '                if i == 0: left = idx',                           // 13
    '                if i == sz - 1: right = idx',                     // 14
    '                if cur.left: q.append((cur.left, idx * 2))',      // 15
    '                if cur.right: q.append((cur.right, idx * 2 + 1))', // 16
    '            max_width = max(max_width, right - left + 1)',        // 17
    '        return max_width',                                        // 18
  ],
  javascript: [
    'var widthOfBinaryTree = function(root) {',                        // 1
    '    if (!root) return 0;',                                        // 2
    '    let maxWidth = 0;',                                           // 3
    '    const q = [[root, 1]];',                                      // 4
    '    while (q.length > 0) {',                                      // 5
    '        const sz = q.length;',                                    // 6
    '        const base = q[0][1];',                                   // 7
    '        let left = 0, right = 0;',                                // 8
    '        for (let i = 0; i < sz; i++) {',                          // 9
    '            const [cur, rawIdx] = q.shift();',                    // 10
    '            const idx = rawIdx - base;',                          // 11
    '            if (i === 0) left = idx;',                            // 12
    '            if (i === sz - 1) right = idx;',                      // 13
    '            if (cur.left) q.push([cur.left, idx * 2]);',          // 14
    '            if (cur.right) q.push([cur.right, idx * 2 + 1]);',    // 15
    '        }',                                                       // 16
    '        maxWidth = Math.max(maxWidth, right - left + 1);',        // 17
    '    }',                                                           // 18
    '    return maxWidth;',                                            // 19
    '};',                                                              // 20
  ],
};

export const WIDTH_STAGE1_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  initQueue: { java: 6, cpp: 7, python: 5, javascript: 4 },
  whileLoop: { java: 7, cpp: 8, python: 6, javascript: 5 },
  baseOffset: { java: 9, cpp: 10, python: 8, javascript: 7 },
  pollNode: { java: 12, cpp: 13, python: 11, javascript: 10 },
  calcIdx: { java: 14, cpp: 14, python: 12, javascript: 11 },
  pushLeft: { java: 17, cpp: 17, python: 15, javascript: 14 },
  pushRight: { java: 18, cpp: 18, python: 16, javascript: 15 },
  calcSpan: { java: 20, cpp: 20, python: 17, javascript: 17 },
  returnAns: { java: 22, cpp: 22, python: 18, javascript: 19 },
};

// ============================================================
// Stage 2: 静态连续双数组模拟队列 (Two Static Arrays Queue · Class 036 招牌零 GC)
// ============================================================
export const WIDTH_STAGE2_STATIC_ARRAY_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                         // 1
    '    public static int MAXN = 3001;',                              // 2
    '    public static TreeNode[] nq = new TreeNode[MAXN];',           // 3
    '    public static int[] iq = new int[MAXN];',                     // 4
    '    public static int l, r;',                                     // 5
    '    public int widthOfBinaryTree(TreeNode root) {',               // 6
    '        if (root == null) return 0;',                             // 7
    '        int maxWidth = 0;',                                       // 8
    '        l = 0; r = 0;',                                           // 9
    '        nq[r] = root; iq[r++] = 1;',                              // 10
    '        while (l < r) {',                                         // 11
    '            int size = r - l;',                                   // 12
    '            int base = iq[l];',                                   // 13
    '            maxWidth = Math.max(maxWidth, iq[r - 1] - iq[l] + 1);', // 14
    '            for (int i = 0; i < size; i++) {',                    // 15
    '                TreeNode cur = nq[l];',                           // 16
    '                int idx = iq[l++] - base;',                       // 17
    '                if (cur.left != null) { nq[r] = cur.left; iq[r++] = idx * 2; }', // 18
    '                if (cur.right != null) { nq[r] = cur.right; iq[r++] = idx * 2 + 1; }', // 19
    '            }',                                                   // 20
    '        }',                                                       // 21
    '        return maxWidth;',                                        // 22
    '    }',                                                           // 23
    '}',                                                               // 24
  ],
  cpp: [
    'class Solution {',                                                // 1
    'public:',                                                         // 2
    '    static const int MAXN = 3001;',                               // 3
    '    TreeNode* nq[MAXN];',                                         // 4
    '    long long iq[MAXN];',                                         // 5
    '    int widthOfBinaryTree(TreeNode* root) {',                     // 6
    '        if (!root) return 0;',                                    // 7
    '        long long maxWidth = 0;',                                 // 8
    '        int l = 0, r = 0;',                                       // 9
    '        nq[r] = root; iq[r++] = 1;',                              // 10
    '        while (l < r) {',                                         // 11
    '            int size = r - l;',                                   // 12
    '            long long base = iq[l];',                             // 13
    '            maxWidth = max(maxWidth, iq[r - 1] - iq[l] + 1);',     // 14
    '            for (int i = 0; i < size; ++i) {',                    // 15
    '                TreeNode* cur = nq[l];',                          // 16
    '                long long idx = iq[l++] - base;',                 // 17
    '                if (cur->left) { nq[r] = cur->left; iq[r++] = idx * 2; }', // 18
    '                if (cur->right) { nq[r] = cur->right; iq[r++] = idx * 2 + 1; }', // 19
    '            }',                                                   // 20
    '        }',                                                       // 21
    '        return maxWidth;',                                        // 22
    '    }',                                                           // 23
    '};',                                                              // 24
  ],
  python: [
    'class Solution:',                                                 // 1
    '    MAXN = 3001',                                                 // 2
    '    nq = [None] * MAXN',                                          // 3
    '    iq = [0] * MAXN',                                             // 4
    '    def widthOfBinaryTree(self, root: Optional[TreeNode]) -> int:', // 5
    '        if not root: return 0',                                   // 6
    '        max_width = 0',                                           // 7
    '        l, r = 0, 0',                                             // 8
    '        self.nq[r] = root; self.iq[r] = 1; r += 1',               // 9
    '        while l < r:',                                            // 10
    '            size = r - l',                                        // 11
    '            base = self.iq[l]',                                   // 12
    '            max_width = max(max_width, self.iq[r - 1] - self.iq[l] + 1)', // 13
    '            for _ in range(size):',                               // 14
    '                cur = self.nq[l]',                                // 15
    '                idx = self.iq[l] - base; l += 1',                 // 16
    '                if cur.left: self.nq[r] = cur.left; self.iq[r] = idx * 2; r += 1', // 17
    '                if cur.right: self.nq[r] = cur.right; self.iq[r] = idx * 2 + 1; r += 1', // 18
    '        return max_width',                                        // 19
  ],
  javascript: [
    'const MAXN = 3001;',                                              // 1
    'const nq = new Array(MAXN);',                                     // 2
    'const iq = new Array(MAXN);',                                     // 3
    'var widthOfBinaryTree = function(root) {',                        // 4
    '    if (!root) return 0;',                                        // 5
    '    let maxWidth = 0;',                                           // 6
    '    let l = 0, r = 0;',                                           // 7
    '    nq[r] = root; iq[r++] = 1;',                                  // 8
    '    while (l < r) {',                                             // 9
    '        const size = r - l;',                                     // 10
    '        const base = iq[l];',                                     // 11
    '        maxWidth = Math.max(maxWidth, iq[r - 1] - iq[l] + 1);',   // 12
    '        for (let i = 0; i < size; i++) {',                        // 13
    '            const cur = nq[l];',                                  // 14
    '            const idx = iq[l++] - base;',                         // 15
    '            if (cur.left) { nq[r] = cur.left; iq[r++] = idx * 2; }', // 16
    '            if (cur.right) { nq[r] = cur.right; iq[r++] = idx * 2 + 1; }', // 17
    '        }',                                                       // 18
    '    }',                                                           // 19
    '    return maxWidth;',                                            // 20
    '};',                                                              // 21
  ],
};

export const WIDTH_STAGE2_STATIC_ARRAY_LINES = {
  entry: { java: 6, cpp: 6, python: 5, javascript: 4 },
  offerRoot: { java: 10, cpp: 10, python: 9, javascript: 8 },
  whileLoop: { java: 11, cpp: 11, python: 10, javascript: 9 },
  calcSpan: { java: 14, cpp: 14, python: 13, javascript: 12 },
  pollNode: { java: 16, cpp: 16, python: 15, javascript: 14 },
  pushLeft: { java: 18, cpp: 18, python: 17, javascript: 16 },
  pushRight: { java: 19, cpp: 19, python: 18, javascript: 17 },
  returnAns: { java: 22, cpp: 22, python: 19, javascript: 20 },
};

// ============================================================
// Stage 3: DFS 递归先序遍历记录每层最左编号 (Depth-Indexed DFS with Leftmost Map)
// ============================================================
export const WIDTH_STAGE3_DFS_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                         // 1
    '    private int maxWidth = 0;',                                  // 2
    '    private List<Integer> leftMost = new ArrayList<>();',         // 3
    '    public int widthOfBinaryTree(TreeNode root) {',               // 4
    '        if (root == null) return 0;',                             // 5
    '        maxWidth = 0;',                                           // 6
    '        leftMost.clear();',                                       // 7
    '        dfs(root, 0, 1);',                                        // 8
    '        return maxWidth;',                                        // 9
    '    }',                                                           // 10
    '    private void dfs(TreeNode node, int depth, int index) {',     // 11
    '        if (node == null) return;',                               // 12
    '        if (depth == leftMost.size()) {',                         // 13
    '            leftMost.add(index);',                                // 14
    '        }',                                                       // 15
    '        int curWidth = index - leftMost.get(depth) + 1;',         // 16
    '        maxWidth = Math.max(maxWidth, curWidth);',                // 17
    '        dfs(node.left, depth + 1, index * 2);',                   // 18
    '        dfs(node.right, depth + 1, index * 2 + 1);',              // 19
    '    }',                                                           // 20
    '}',                                                               // 21
  ],
  cpp: [
    'class Solution {',                                                // 1
    '    long long maxWidth = 0;',                                     // 2
    '    vector<long long> leftMost;',                                 // 3
    'public:',                                                         // 4
    '    int widthOfBinaryTree(TreeNode* root) {',                     // 5
    '        if (!root) return 0;',                                    // 6
    '        maxWidth = 0;',                                           // 7
    '        leftMost.clear();',                                       // 8
    '        dfs(root, 0, 1);',                                        // 9
    '        return maxWidth;',                                        // 10
    '    }',                                                           // 11
    '    void dfs(TreeNode* node, int depth, long long index) {',      // 12
    '        if (!node) return;',                                      // 13
    '        if (depth == (int)leftMost.size()) {',                    // 14
    '            leftMost.push_back(index);',                          // 15
    '        }',                                                       // 16
    '        long long curWidth = index - leftMost[depth] + 1;',       // 17
    '        maxWidth = max(maxWidth, (int)curWidth);',                // 18
    '        dfs(node->left, depth + 1, index * 2);',                  // 19
    '        dfs(node->right, depth + 1, index * 2 + 1);',             // 20
    '    }',                                                           // 21
    '};',                                                              // 22
  ],
  python: [
    'class Solution:',                                                 // 1
    '    def widthOfBinaryTree(self, root: Optional[TreeNode]) -> int:', // 2
    '        if not root: return 0',                                   // 3
    '        max_width = 0',                                           // 4
    '        left_most = {}',                                          // 5
    '        def dfs(node, depth, index):',                            // 6
    '            nonlocal max_width',                                  // 7
    '            if not node: return',                                 // 8
    '            if depth not in left_most:',                          // 9
    '                left_most[depth] = index',                        // 10
    '            cur_width = index - left_most[depth] + 1',            // 11
    '            max_width = max(max_width, cur_width)',               // 12
    '            dfs(node.left, depth + 1, index * 2)',                // 13
    '            dfs(node.right, depth + 1, index * 2 + 1)',           // 14
    '        dfs(root, 0, 1)',                                         // 15
    '        return max_width',                                        // 16
  ],
  javascript: [
    'var widthOfBinaryTree = function(root) {',                        // 1
    '    if (!root) return 0;',                                        // 2
    '    let maxWidth = 0;',                                           // 3
    '    const leftMost = [];',                                        // 4
    '    function dfs(node, depth, index) {',                          // 5
    '        if (!node) return;',                                      // 6
    '        if (depth === leftMost.length) {',                        // 7
    '            leftMost.push(index);',                               // 8
    '        }',                                                       // 9
    '        const curWidth = index - leftMost[depth] + 1;',           // 10
    '        maxWidth = Math.max(maxWidth, curWidth);',                // 11
    '        dfs(node.left, depth + 1, index * 2);',                   // 12
    '        dfs(node.right, depth + 1, index * 2 + 1);',              // 13
    '    }',                                                           // 14
    '    dfs(root, 0, 1);',                                            // 15
    '    return maxWidth;',                                            // 16
    '};',                                                              // 17
  ],
};

export const WIDTH_STAGE3_DFS_LINES = {
  entry: { java: 4, cpp: 5, python: 2, javascript: 1 },
  initDfs: { java: 8, cpp: 9, python: 15, javascript: 15 },
  dfsEntry: { java: 11, cpp: 12, python: 6, javascript: 5 },
  recordLeft: { java: 14, cpp: 15, python: 10, javascript: 8 },
  calcWidth: { java: 17, cpp: 18, python: 12, javascript: 11 },
  dfsLeft: { java: 18, cpp: 19, python: 13, javascript: 12 },
  dfsRight: { java: 19, cpp: 20, python: 14, javascript: 13 },
  returnAns: { java: 9, cpp: 10, python: 16, javascript: 16 },
};
