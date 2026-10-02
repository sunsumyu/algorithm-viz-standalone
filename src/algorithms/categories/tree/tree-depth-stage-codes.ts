/**
 * 二叉树的最大深度 (Maximum Depth of Binary Tree · LeetCode 104 / Class 036 Code04)
 * 多阶段演化四语言代码模板与精准 1-Based 行号映射
 *
 * Stage 1: 递归后序自底向上归约 (Recursive DFS Post-order · 分治)
 * Stage 2: 层次遍历 BFS 队列层数计数 (Level Order BFS Queue · 逐层扩展)
 * Stage 3: 静态数组模拟队列 (Static Array Queue BFS · 左神 Class 036 招牌零 GC)
 */

// ============================================================
// Stage 1: 递归后序自底向上归约 (Recursive DFS Post-order)
// ============================================================
export const TREE_DEPTH_STAGE1_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                         // 1
    '    public int maxDepth(TreeNode root) {',                        // 2
    '        if (root == null) return 0;',                             // 3
    '        int leftDepth = maxDepth(root.left);',                    // 4
    '        int rightDepth = maxDepth(root.right);',                  // 5
    '        return 1 + Math.max(leftDepth, rightDepth);',             // 6
    '    }',                                                           // 7
    '}',                                                               // 8
  ],
  cpp: [
    'class Solution {',                                                // 1
    'public:',                                                         // 2
    '    int maxDepth(TreeNode* root) {',                              // 3
    '        if (!root) return 0;',                                    // 4
    '        int leftDepth = maxDepth(root->left);',                   // 5
    '        int rightDepth = maxDepth(root->right);',                 // 6
    '        return 1 + max(leftDepth, rightDepth);',                  // 7
    '    }',                                                           // 8
    '};',                                                              // 9
  ],
  python: [
    'class Solution:',                                                 // 1
    '    def maxDepth(self, root: Optional[TreeNode]) -> int:',        // 2
    '        if not root: return 0',                                   // 3
    '        left_depth = self.maxDepth(root.left)',                   // 4
    '        right_depth = self.maxDepth(root.right)',                 // 5
    '        return 1 + max(left_depth, right_depth)',                 // 6
  ],
  javascript: [
    'var maxDepth = function(root) {',                                 // 1
    '    if (!root) return 0;',                                        // 2
    '    const leftDepth = maxDepth(root.left);',                      // 3
    '    const rightDepth = maxDepth(root.right);',                    // 4
    '    return 1 + Math.max(leftDepth, rightDepth);',                 // 5
    '};',                                                              // 6
  ],
};

export const TREE_DEPTH_STAGE1_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  empty: { java: 3, cpp: 4, python: 3, javascript: 2 },
  leftDone: { java: 4, cpp: 5, python: 4, javascript: 3 },
  rightDone: { java: 5, cpp: 6, python: 5, javascript: 4 },
  returnDepth: { java: 6, cpp: 7, python: 6, javascript: 5 },
  done: { java: 6, cpp: 7, python: 6, javascript: 5 },
};

// ============================================================
// Stage 2: 层次遍历 BFS 队列层数计数 (Level Order BFS Queue)
// ============================================================
export const TREE_DEPTH_STAGE2_BFS_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                         // 1
    '    public int maxDepth(TreeNode root) {',                        // 2
    '        if (root == null) return 0;',                             // 3
    '        Queue<TreeNode> queue = new LinkedList<>();',             // 4
    '        queue.offer(root);',                                      // 5
    '        int depth = 0;',                                          // 6
    '        while (!queue.isEmpty()) {',                              // 7
    '            int size = queue.size();',                            // 8
    '            for (int i = 0; i < size; i++) {',                    // 9
    '                TreeNode cur = queue.poll();',                    // 10
    '                if (cur.left != null) queue.offer(cur.left);',    // 11
    '                if (cur.right != null) queue.offer(cur.right);',  // 12
    '            }',                                                   // 13
    '            depth++;',                                            // 14
    '        }',                                                       // 15
    '        return depth;',                                           // 16
    '    }',                                                           // 17
    '}',                                                               // 18
  ],
  cpp: [
    'class Solution {',                                                // 1
    'public:',                                                         // 2
    '    int maxDepth(TreeNode* root) {',                              // 3
    '        if (!root) return 0;',                                    // 4
    '        queue<TreeNode*> q;',                                     // 5
    '        q.push(root);',                                           // 6
    '        int depth = 0;',                                          // 7
    '        while (!q.empty()) {',                                    // 8
    '            int sz = q.size();',                                  // 9
    '            for (int i = 0; i < sz; ++i) {',                      // 10
    '                TreeNode* cur = q.front(); q.pop();',             // 11
    '                if (cur->left) q.push(cur->left);',               // 12
    '                if (cur->right) q.push(cur->right);',             // 13
    '            }',                                                   // 14
    '            depth++;',                                            // 15
    '        }',                                                       // 16
    '        return depth;',                                           // 17
    '    }',                                                           // 18
    '};',                                                              // 19
  ],
  python: [
    'class Solution:',                                                 // 1
    '    def maxDepth(self, root: Optional[TreeNode]) -> int:',        // 2
    '        if not root: return 0',                                   // 3
    '        q = collections.deque([root])',                           // 4
    '        depth = 0',                                               // 5
    '        while q:',                                                // 6
    '            size = len(q)',                                       // 7
    '            for _ in range(size):',                               // 8
    '                cur = q.popleft()',                               // 9
    '                if cur.left: q.append(cur.left)',                 // 10
    '                if cur.right: q.append(cur.right)',               // 11
    '            depth += 1',                                          // 12
    '        return depth',                                            // 13
  ],
  javascript: [
    'var maxDepth = function(root) {',                                 // 1
    '    if (!root) return 0;',                                        // 2
    '    const q = [root];',                                           // 3
    '    let depth = 0;',                                              // 4
    '    while (q.length > 0) {',                                      // 5
    '        const size = q.length;',                                  // 6
    '        for (let i = 0; i < size; i++) {',                        // 7
    '            const cur = q.shift();',                              // 8
    '            if (cur.left) q.push(cur.left);',                     // 9
    '            if (cur.right) q.push(cur.right);',                   // 10
    '        }',                                                       // 11
    '        depth++;',                                                // 12
    '    }',                                                           // 13
    '    return depth;',                                               // 14
    '};',                                                              // 15
  ],
};

export const TREE_DEPTH_STAGE2_BFS_LINES = {
  entry: { java: 3, cpp: 4, python: 3, javascript: 2 },
  initQueue: { java: 5, cpp: 6, python: 4, javascript: 3 },
  loopLevel: { java: 8, cpp: 9, python: 7, javascript: 6 },
  popNode: { java: 10, cpp: 11, python: 9, javascript: 8 },
  pushChildren: { java: [11, 12], cpp: [12, 13], python: [10, 11], javascript: [9, 10] },
  levelDone: { java: 14, cpp: 15, python: 12, javascript: 12 },
  returnDepth: { java: 16, cpp: 17, python: 13, javascript: 14 },
};

// ============================================================
// Stage 3: 静态数组模拟队列 (Static Array Queue · Class 036 招牌零 GC)
// ============================================================
export const TREE_DEPTH_STAGE3_STATIC_ARRAY_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                         // 1
    '    public static int MAXN = 2001;',                              // 2
    '    public static TreeNode[] queue = new TreeNode[MAXN];',        // 3
    '    public static int l, r;',                                     // 4
    '    public int maxDepth(TreeNode root) {',                        // 5
    '        if (root == null) return 0;',                             // 6
    '        l = 0; r = 0;',                                           // 7
    '        queue[r++] = root;',                                      // 8
    '        int depth = 0;',                                          // 9
    '        while (l < r) {',                                         // 10
    '            int size = r - l;',                                   // 11
    '            for (int i = 0; i < size; i++) {',                    // 12
    '                TreeNode cur = queue[l++];',                      // 13
    '                if (cur.left != null) queue[r++] = cur.left;',    // 14
    '                if (cur.right != null) queue[r++] = cur.right;',  // 15
    '            }',                                                   // 16
    '            depth++;',                                            // 17
    '        }',                                                       // 18
    '        return depth;',                                           // 19
    '    }',                                                           // 20
    '}',                                                               // 21
  ],
  cpp: [
    'class Solution {',                                                // 1
    '    static const int MAXN = 2001;',                               // 2
    '    TreeNode* queue[MAXN];',                                      // 3
    'public:',                                                         // 4
    '    int maxDepth(TreeNode* root) {',                              // 5
    '        if (!root) return 0;',                                    // 6
    '        int l = 0, r = 0;',                                       // 7
    '        queue[r++] = root;',                                      // 8
    '        int depth = 0;',                                          // 9
    '        while (l < r) {',                                         // 10
    '            int sz = r - l;',                                     // 11
    '            for (int i = 0; i < sz; ++i) {',                      // 12
    '                TreeNode* cur = queue[l++];',                     // 13
    '                if (cur->left) queue[r++] = cur->left;',          // 14
    '                if (cur->right) queue[r++] = cur->right;',        // 15
    '            }',                                                   // 16
    '            depth++;',                                            // 17
    '        }',                                                       // 18
    '        return depth;',                                           // 19
    '    }',                                                           // 20
    '};',                                                              // 21
  ],
  python: [
    'class Solution:',                                                 // 1
    '    def maxDepth(self, root: Optional[TreeNode]) -> int:',        // 2
    '        if not root: return 0',                                   // 3
    '        queue = [None] * 2005',                                   // 4
    '        l, r = 0, 0',                                             // 5
    '        queue[r] = root; r += 1',                                 // 6
    '        depth = 0',                                               // 7
    '        while l < r:',                                            // 8
    '            size = r - l',                                        // 9
    '            for _ in range(size):',                               // 10
    '                cur = queue[l]; l += 1',                          // 11
    '                if cur.left: queue[r] = cur.left; r += 1',        // 12
    '                if cur.right: queue[r] = cur.right; r += 1',      // 13
    '            depth += 1',                                          // 14
    '        return depth',                                            // 15
  ],
  javascript: [
    'var maxDepth = function(root) {',                                 // 1
    '    if (!root) return 0;',                                        // 2
    '    const queue = new Array(2005);',                              // 3
    '    let l = 0, r = 0;',                                           // 4
    '    queue[r++] = root;',                                          // 5
    '    let depth = 0;',                                              // 6
    '    while (l < r) {',                                             // 7
    '        const size = r - l;',                                     // 8
    '        for (let i = 0; i < size; i++) {',                        // 9
    '            const cur = queue[l++];',                             // 10
    '            if (cur.left) queue[r++] = cur.left;',                // 11
    '            if (cur.right) queue[r++] = cur.right;',              // 12
    '        }',                                                       // 13
    '        depth++;',                                                // 14
    '    }',                                                           // 15
    '    return depth;',                                               // 16
    '};',                                                              // 17
  ],
};

export const TREE_DEPTH_STAGE3_STATIC_ARRAY_LINES = {
  entry: { java: 6, cpp: 6, python: 3, javascript: 2 },
  initPointers: { java: 8, cpp: 8, python: 6, javascript: 5 },
  loopLevel: { java: 11, cpp: 11, python: 9, javascript: 8 },
  popNode: { java: 13, cpp: 13, python: 11, javascript: 10 },
  pushChildren: { java: [14, 15], cpp: [14, 15], python: [12, 13], javascript: [11, 12] },
  levelDone: { java: 17, cpp: 17, python: 14, javascript: 14 },
  returnDepth: { java: 19, cpp: 19, python: 15, javascript: 16 },
};
