/**
 * 对称二叉树 (Symmetric Tree · LeetCode 101)
 * 多阶段演化四语言代码模板与精准 1-Based 行号映射
 *
 * Stage 1: 双指针镜像递归 (Recursive Mirror DFS · 经典内外侧双路递归)
 * Stage 2: 队列成对迭代 (Iterative Queue BFS · 镜像双双入队校验)
 * Stage 3: 静态数组模拟队列 (Static Array Queue · 左神招牌零 GC 连续内存)
 */

// ============================================================
// Stage 1: 双指针镜像递归 (Recursive Mirror DFS)
// ============================================================
export const TREE_SYMMETRIC_STAGE1_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                          // 1
    '    public boolean isSymmetric(TreeNode root) {',                 // 2
    '        if (root == null) return true;',                          // 3
    '        return check(root.left, root.right);',                    // 4
    '    }',                                                           // 5
    '    private boolean check(TreeNode left, TreeNode right) {',      // 6
    '        if (left == null && right == null) return true;',         // 7
    '        if (left == null || right == null) return false;',        // 8
    '        if (left.val != right.val) return false;',                // 9
    '        boolean outside = check(left.left, right.right);',        // 10
    '        boolean inside = check(left.right, right.left);',         // 11
    '        return outside && inside;',                               // 12
    '    }',                                                           // 13
    '}',                                                               // 14
  ],
  cpp: [
    'class Solution {',                                                // 1
    'public:',                                                         // 2
    '    bool isSymmetric(TreeNode* root) {',                          // 3
    '        if (!root) return true;',                                 // 4
    '        return check(root->left, root->right);',                  // 5
    '    }',                                                           // 6
    '    bool check(TreeNode* left, TreeNode* right) {',               // 7
    '        if (!left && !right) return true;',                       // 8
    '        if (!left || !right) return false;',                      // 9
    '        if (left->val != right->val) return false;',              // 10
    '        bool outside = check(left->left, right->right);',         // 11
    '        bool inside = check(left->right, right->left);',          // 12
    '        return outside && inside;',                               // 13
    '    }',                                                           // 14
    '};',                                                              // 15
  ],
  python: [
    'class Solution:',                                                 // 1
    '    def isSymmetric(self, root: Optional[TreeNode]) -> bool:',    // 2
    '        if not root: return True',                                // 3
    '        def check(left: Optional[TreeNode], right: Optional[TreeNode]) -> bool:', // 4
    '            if not left and not right: return True',              // 5
    '            if not left or not right: return False',              // 6
    '            if left.val != right.val: return False',              // 7
    '            outside = check(left.left, right.right)',             // 8
    '            inside = check(left.right, right.left)',              // 9
    '            return outside and inside',                           // 10
    '        return check(root.left, root.right)',                     // 11
  ],
  javascript: [
    'var isSymmetric = function(root) {',                              // 1
    '    if (!root) return true;',                                     // 2
    '    const check = (left, right) => {',                            // 3
    '        if (!left && !right) return true;',                       // 4
    '        if (!left || !right) return false;',                      // 5
    '        if (left.val !== right.val) return false;',               // 6
    '        const outside = check(left.left, right.right);',          // 7
    '        const inside = check(left.right, right.left);',           // 8
    '        return outside && inside;',                               // 9
    '    };',                                                          // 10
    '    return check(root.left, root.right);',                        // 11
    '};',                                                              // 12
  ],
};

export const TREE_SYMMETRIC_STAGE1_LINES = {
  init: { java: 2, cpp: 3, python: 2, javascript: 1 },
  empty: { java: 3, cpp: 4, python: 3, javascript: 2 },
  startCheck: { java: 4, cpp: 5, python: 11, javascript: 11 },
  checkEntry: { java: 6, cpp: 7, python: 4, javascript: 3 },
  bothNull: { java: 7, cpp: 8, python: 5, javascript: 4 },
  oneNull: { java: 8, cpp: 9, python: 6, javascript: 5 },
  valMismatch: { java: 9, cpp: 10, python: 7, javascript: 6 },
  valMatch: { java: 9, cpp: 10, python: 7, javascript: 6 },
  recurseOutside: { java: 10, cpp: 11, python: 8, javascript: 7 },
  outsideDone: { java: 10, cpp: 11, python: 8, javascript: 7 },
  recurseInside: { java: 11, cpp: 12, python: 9, javascript: 8 },
  insideDone: { java: 11, cpp: 12, python: 9, javascript: 8 },
  combine: { java: 12, cpp: 13, python: 10, javascript: 9 },
  checkDone: { java: 13, cpp: 14, python: 10, javascript: 10 },
  done: { java: 4, cpp: 5, python: 11, javascript: 11 },
};

// ============================================================
// Stage 2: 队列成对迭代 (Iterative Queue BFS)
// ============================================================
export const TREE_SYMMETRIC_STAGE2_QUEUE_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                          // 1
    '    public boolean isSymmetric(TreeNode root) {',                 // 2
    '        if (root == null) return true;',                          // 3
    '        Queue<TreeNode> queue = new LinkedList<>();',             // 4
    '        queue.offer(root.left);',                                 // 5
    '        queue.offer(root.right);',                                // 6
    '        while (!queue.isEmpty()) {',                              // 7
    '            TreeNode u = queue.poll();',                          // 8
    '            TreeNode v = queue.poll();',                          // 9
    '            if (u == null && v == null) continue;',               // 10
    '            if (u == null || v == null || u.val != v.val) return false;', // 11
    '            queue.offer(u.left);',                                // 12
    '            queue.offer(v.right);',                               // 13
    '            queue.offer(u.right);',                               // 14
    '            queue.offer(v.left);',                                // 15
    '        }',                                                       // 16
    '        return true;',                                            // 17
    '    }',                                                           // 18
    '}',                                                               // 19
  ],
  cpp: [
    'class Solution {',                                                // 1
    'public:',                                                         // 2
    '    bool isSymmetric(TreeNode* root) {',                          // 3
    '        if (!root) return true;',                                 // 4
    '        queue<TreeNode*> q;',                                     // 5
    '        q.push(root->left);',                                     // 6
    '        q.push(root->right);',                                    // 7
    '        while (!q.empty()) {',                                    // 8
    '            TreeNode* u = q.front(); q.pop();',                   // 9
    '            TreeNode* v = q.front(); q.pop();',                   // 10
    '            if (!u && !v) continue;',                             // 11
    '            if (!u || !v || u->val != v->val) return false;',     // 12
    '            q.push(u->left);',                                    // 13
    '            q.push(v->right);',                                   // 14
    '            q.push(u->right);',                                   // 15
    '            q.push(v->left);',                                    // 16
    '        }',                                                       // 17
    '        return true;',                                            // 18
    '    }',                                                           // 19
    '};',                                                              // 20
  ],
  python: [
    'class Solution:',                                                 // 1
    '    def isSymmetric(self, root: Optional[TreeNode]) -> bool:',    // 2
    '        if not root: return True',                                // 3
    '        q = collections.deque([root.left, root.right])',          // 4
    '        while q:',                                                // 5
    '            u = q.popleft()',                                     // 6
    '            v = q.popleft()',                                     // 7
    '            if not u and not v: continue',                        // 8
    '            if not u or not v or u.val != v.val: return False',   // 9
    '            q.append(u.left)',                                    // 10
    '            q.append(v.right)',                                   // 11
    '            q.append(u.right)',                                   // 12
    '            q.append(v.left)',                                    // 13
    '        return True',                                             // 14
  ],
  javascript: [
    'function isSymmetric(root) {',                                    // 1
    '    if (!root) return true;',                                     // 2
    '    const queue = [root.left, root.right];',                      // 3
    '    while (queue.length > 0) {',                                  // 4
    '        const u = queue.shift();',                                // 5
    '        const v = queue.shift();',                                // 6
    '        if (!u && !v) continue;',                                 // 7
    '        if (!u || !v || u.val !== v.val) return false;',          // 8
    '        queue.push(u.left, v.right);',                            // 9
    '        queue.push(u.right, v.left);',                            // 10
    '    }',                                                           // 11
    '    return true;',                                                // 12
    '}',                                                               // 13
  ],
};

export const TREE_SYMMETRIC_STAGE2_QUEUE_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  pushRootChildren: { java: 5, cpp: 6, python: 4, javascript: 3 },
  whileLoop: { java: 7, cpp: 8, python: 5, javascript: 4 },
  pollPair: { java: 8, cpp: 9, python: 6, javascript: 5 },
  bothNull: { java: 10, cpp: 11, python: 8, javascript: 7 },
  mismatch: { java: 11, cpp: 12, python: 9, javascript: 8 },
  pushOutside: { java: 12, cpp: 13, python: 10, javascript: 9 },
  pushInside: { java: 14, cpp: 15, python: 12, javascript: 10 },
  returnTrue: { java: 17, cpp: 18, python: 14, javascript: 12 },
};

// ============================================================
// Stage 3: 静态数组模拟队列 (Static Array Queue · 左神招牌零 GC)
// ============================================================
export const TREE_SYMMETRIC_STAGE3_STATIC_ARRAY_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                          // 1
    '    public static int MAXN = 2001;',                              // 2
    '    public static TreeNode[] queue = new TreeNode[MAXN];',        // 3
    '    public static int l, r;',                                     // 4
    '    public boolean isSymmetric(TreeNode root) {',                 // 5
    '        if (root == null) return true;',                          // 6
    '        l = 0; r = 0;',                                           // 7
    '        queue[r++] = root.left;',                                 // 8
    '        queue[r++] = root.right;',                                // 9
    '        while (l < r) {',                                         // 10
    '            TreeNode u = queue[l++];',                            // 11
    '            TreeNode v = queue[l++];',                            // 12
    '            if (u == null && v == null) continue;',               // 13
    '            if (u == null || v == null || u.val != v.val) return false;', // 14
    '            queue[r++] = u.left;',                                // 15
    '            queue[r++] = v.right;',                               // 16
    '            queue[r++] = u.right;',                               // 17
    '            queue[r++] = v.left;',                                // 18
    '        }',                                                       // 19
    '        return true;',                                            // 20
    '    }',                                                           // 21
    '}',                                                               // 22
  ],
  cpp: [
    'class Solution {',                                                // 1
    'public:',                                                         // 2
    '    static const int MAXN = 2001;',                               // 3
    '    TreeNode* queue[MAXN];',                                      // 4
    '    int l = 0, r = 0;',                                           // 5
    '    bool isSymmetric(TreeNode* root) {',                          // 6
    '        if (!root) return true;',                                 // 7
    '        l = 0; r = 0;',                                           // 8
    '        queue[r++] = root->left;',                                // 9
    '        queue[r++] = root->right;',                               // 10
    '        while (l < r) {',                                         // 11
    '            TreeNode* u = queue[l++];',                           // 12
    '            TreeNode* v = queue[l++];',                           // 13
    '            if (!u && !v) continue;',                             // 14
    '            if (!u || !v || u->val != v->val) return false;',     // 15
    '            queue[r++] = u->left;',                               // 16
    '            queue[r++] = v->right;',                              // 17
    '            queue[r++] = u->right;',                              // 18
    '            queue[r++] = v->left;',                               // 19
    '        }',                                                       // 20
    '        return true;',                                            // 21
    '    }',                                                           // 22
    '};',                                                              // 23
  ],
  python: [
    'class Solution:',                                                 // 1
    '    def isSymmetric(self, root: Optional[TreeNode]) -> bool:',    // 2
    '        if not root: return True',                                // 3
    '        MAXN = 2001',                                             // 4
    '        queue = [None] * MAXN',                                   // 5
    '        l, r = 0, 0',                                             // 6
    '        queue[r] = root.left; r += 1',                            // 7
    '        queue[r] = root.right; r += 1',                           // 8
    '        while l < r:',                                            // 9
    '            u = queue[l]; l += 1',                                // 10
    '            v = queue[l]; l += 1',                                // 11
    '            if not u and not v: continue',                        // 12
    '            if not u or not v or u.val != v.val: return False',   // 13
    '            queue[r] = u.left; r += 1',                           // 14
    '            queue[r] = v.right; r += 1',                          // 15
    '            queue[r] = u.right; r += 1',                          // 16
    '            queue[r] = v.left; r += 1',                           // 17
    '        return True',                                             // 18
  ],
  javascript: [
    'function isSymmetric(root) {',                                    // 1
    '    if (!root) return true;',                                     // 2
    '    const MAXN = 2001;',                                          // 3
    '    const queue = new Array(MAXN);',                              // 4
    '    let l = 0, r = 0;',                                           // 5
    '    queue[r++] = root.left;',                                     // 6
    '    queue[r++] = root.right;',                                    // 7
    '    while (l < r) {',                                             // 8
    '        const u = queue[l++];',                                   // 9
    '        const v = queue[l++];',                                   // 10
    '        if (!u && !v) continue;',                                 // 11
    '        if (!u || !v || u.val !== v.val) return false;',          // 12
    '        queue[r++] = u.left;',                                    // 13
    '        queue[r++] = v.right;',                                   // 14
    '        queue[r++] = u.right;',                                   // 15
    '        queue[r++] = v.left;',                                    // 16
    '    }',                                                           // 17
    '    return true;',                                                // 18
    '}',                                                               // 19
  ],
};

export const TREE_SYMMETRIC_STAGE3_STATIC_ARRAY_LINES = {
  entry: { java: 5, cpp: 6, python: 2, javascript: 1 },
  pushRootChildren: { java: 8, cpp: 9, python: 7, javascript: 6 },
  whileLoop: { java: 10, cpp: 11, python: 9, javascript: 8 },
  pollPair: { java: 11, cpp: 12, python: 10, javascript: 9 },
  bothNull: { java: 13, cpp: 14, python: 12, javascript: 11 },
  mismatch: { java: 14, cpp: 15, python: 13, javascript: 12 },
  pushOutside: { java: 15, cpp: 16, python: 14, javascript: 13 },
  pushInside: { java: 17, cpp: 18, python: 16, javascript: 15 },
  returnTrue: { java: 20, cpp: 21, python: 18, javascript: 18 },
};
