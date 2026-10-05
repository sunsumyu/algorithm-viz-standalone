/**
 * 翻转二叉树 (Invert Binary Tree · LeetCode 226)
 * 多阶段演化四语言代码模板与精准 1-Based 行号映射
 *
 * Stage 1: 前序递归翻转 (Recursive Preorder DFS · 经典指针互换)
 * Stage 2: 队列层序遍历翻转 (Iterative Queue BFS · 逐层出队交换)
 * Stage 3: 静态数组模拟队列 (Static Array Queue · 左神招牌零 GC 连续内存)
 */

// ============================================================
// Stage 1: 前序递归翻转 (Recursive Preorder DFS)
// ============================================================
export const TREE_INVERT_STAGE1_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                          // 1
    '    public TreeNode invertTree(TreeNode root) {',                 // 2
    '        if (root == null) return null;',                          // 3
    '        // 1. 交换当前节点的左右子节点',                         // 4
    '        TreeNode temp = root.left;',                              // 5
    '        root.left = root.right;',                                 // 6
    '        root.right = temp;',                                      // 7
    '        // 2. 递归翻转左右子树',                                 // 8
    '        invertTree(root.left);',                                  // 9
    '        invertTree(root.right);',                                 // 10
    '        return root;',                                            // 11
    '    }',                                                           // 12
    '}',                                                               // 13
  ],
  cpp: [
    'class Solution {',                                                // 1
    'public:',                                                         // 2
    '    TreeNode* invertTree(TreeNode* root) {',                      // 3
    '        if (!root) return nullptr;',                              // 4
    '        swap(root->left, root->right);',                          // 5
    '        invertTree(root->left);',                                 // 6
    '        invertTree(root->right);',                                // 7
    '        return root;',                                            // 8
    '    }',                                                           // 9
    '};',                                                              // 10
  ],
  python: [
    'class Solution:',                                                 // 1
    '    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:', // 2
    '        if not root:',                                            // 3
    '            return None',                                         // 4
    '        root.left, root.right = root.right, root.left',           // 5
    '        self.invertTree(root.left)',                              // 6
    '        self.invertTree(root.right)',                             // 7
    '        return root',                                             // 8
  ],
  javascript: [
    'var invertTree = function(root) {',                              // 1
    '    if (!root) return null;',                                     // 2
    '    const temp = root.left;',                                     // 3
    '    root.left = root.right;',                                     // 4
    '    root.right = temp;',                                          // 5
    '    invertTree(root.left);',                                      // 6
    '    invertTree(root.right);',                                     // 7
    '    return root;',                                                // 8
    '};',                                                              // 9
  ],
};

export const TREE_INVERT_STAGE1_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  nullCheck: { java: 3, cpp: 4, python: 3, javascript: 2 },
  nullCheckHit: { java: 3, cpp: 4, python: 4, javascript: 2 },
  nullCheckPass: { java: 3, cpp: 4, python: 3, javascript: 2 },
  swap: { java: 6, cpp: 5, python: 5, javascript: 4 },
  recurseLeft: { java: 9, cpp: 6, python: 6, javascript: 6 },
  recurseRight: { java: 10, cpp: 7, python: 7, javascript: 7 },
  leave: { java: 11, cpp: 8, python: 8, javascript: 8 },
  returnRoot: { java: 11, cpp: 8, python: 8, javascript: 8 },
};

// ============================================================
// Stage 2: 队列层序遍历翻转 (Iterative Queue BFS)
// ============================================================
export const TREE_INVERT_STAGE2_QUEUE_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                          // 1
    '    public TreeNode invertTree(TreeNode root) {',                 // 2
    '        if (root == null) return null;',                          // 3
    '        Queue<TreeNode> queue = new LinkedList<>();',             // 4
    '        queue.offer(root);',                                      // 5
    '        while (!queue.isEmpty()) {',                              // 6
    '            TreeNode cur = queue.poll();',                        // 7
    '            TreeNode temp = cur.left;',                           // 8
    '            cur.left = cur.right;',                               // 9
    '            cur.right = temp;',                                   // 10
    '            if (cur.left != null) queue.offer(cur.left);',        // 11
    '            if (cur.right != null) queue.offer(cur.right);',      // 12
    '        }',                                                       // 13
    '        return root;',                                            // 14
    '    }',                                                           // 15
    '}',                                                               // 16
  ],
  cpp: [
    'class Solution {',                                                // 1
    'public:',                                                         // 2
    '    TreeNode* invertTree(TreeNode* root) {',                      // 3
    '        if (!root) return nullptr;',                              // 4
    '        queue<TreeNode*> q;',                                     // 5
    '        q.push(root);',                                           // 6
    '        while (!q.empty()) {',                                    // 7
    '            TreeNode* cur = q.front(); q.pop();',                 // 8
    '            swap(cur->left, cur->right);',                        // 9
    '            if (cur->left) q.push(cur->left);',                   // 10
    '            if (cur->right) q.push(cur->right);',                 // 11
    '        }',                                                       // 12
    '        return root;',                                            // 13
    '    }',                                                           // 14
    '};',                                                              // 15
  ],
  python: [
    'class Solution:',                                                 // 1
    '    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:', // 2
    '        if not root: return None',                                // 3
    '        q = collections.deque([root])',                           // 4
    '        while q:',                                                // 5
    '            cur = q.popleft()',                                   // 6
    '            cur.left, cur.right = cur.right, cur.left',           // 7
    '            if cur.left: q.append(cur.left)',                     // 8
    '            if cur.right: q.append(cur.right)',                   // 9
    '        return root',                                             // 10
  ],
  javascript: [
    'function invertTree(root) {',                                     // 1
    '    if (!root) return null;',                                     // 2
    '    const queue = [root];',                                       // 3
    '    while (queue.length > 0) {',                                  // 4
    '        const cur = queue.shift();',                              // 5
    '        const temp = cur.left;',                                  // 6
    '        cur.left = cur.right;',                                   // 7
    '        cur.right = temp;',                                       // 8
    '        if (cur.left) queue.push(cur.left);',                     // 9
    '        if (cur.right) queue.push(cur.right);',                   // 10
    '    }',                                                           // 11
    '    return root;',                                                // 12
    '}',                                                               // 13
  ],
};

export const TREE_INVERT_STAGE2_QUEUE_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  nullCheck: { java: 3, cpp: 4, python: 3, javascript: 2 },
  initQueue: { java: 5, cpp: 6, python: 4, javascript: 3 },
  whileLoop: { java: 6, cpp: 7, python: 5, javascript: 4 },
  poll: { java: 7, cpp: 8, python: 6, javascript: 5 },
  swap: { java: 9, cpp: 9, python: 7, javascript: 7 },
  pushLeft: { java: 11, cpp: 10, python: 8, javascript: 9 },
  pushRight: { java: 12, cpp: 11, python: 9, javascript: 10 },
  returnRoot: { java: 14, cpp: 13, python: 10, javascript: 12 },
};

// ============================================================
// Stage 3: 静态数组模拟队列 (Static Array Queue · 左神招牌零 GC)
// ============================================================
export const TREE_INVERT_STAGE3_STATIC_ARRAY_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                          // 1
    '    public static int MAXN = 2001;',                              // 2
    '    public static TreeNode[] queue = new TreeNode[MAXN];',        // 3
    '    public static int l, r;',                                     // 4
    '    public TreeNode invertTree(TreeNode root) {',                 // 5
    '        if (root == null) return null;',                          // 6
    '        l = 0; r = 0;',                                           // 7
    '        queue[r++] = root;',                                      // 8
    '        while (l < r) {',                                         // 9
    '            TreeNode cur = queue[l++];',                          // 10
    '            TreeNode temp = cur.left;',                           // 11
    '            cur.left = cur.right;',                               // 12
    '            cur.right = temp;',                                   // 13
    '            if (cur.left != null) queue[r++] = cur.left;',        // 14
    '            if (cur.right != null) queue[r++] = cur.right;',      // 15
    '        }',                                                       // 16
    '        return root;',                                            // 17
    '    }',                                                           // 18
    '}',                                                               // 19
  ],
  cpp: [
    'class Solution {',                                                // 1
    'public:',                                                         // 2
    '    static const int MAXN = 2001;',                               // 3
    '    TreeNode* queue[MAXN];',                                      // 4
    '    int l = 0, r = 0;',                                           // 5
    '    TreeNode* invertTree(TreeNode* root) {',                      // 6
    '        if (!root) return nullptr;',                              // 7
    '        l = 0; r = 0;',                                           // 8
    '        queue[r++] = root;',                                      // 9
    '        while (l < r) {',                                         // 10
    '            TreeNode* cur = queue[l++];',                         // 11
    '            swap(cur->left, cur->right);',                        // 12
    '            if (cur->left) queue[r++] = cur->left;',              // 13
    '            if (cur->right) queue[r++] = cur->right;',            // 14
    '        }',                                                       // 15
    '        return root;',                                            // 16
    '    }',                                                           // 17
    '};',                                                              // 18
  ],
  python: [
    'class Solution:',                                                 // 1
    '    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:', // 2
    '        if not root: return None',                                // 3
    '        MAXN = 2001',                                             // 4
    '        queue = [None] * MAXN',                                   // 5
    '        l, r = 0, 0',                                             // 6
    '        queue[r] = root; r += 1',                                 // 7
    '        while l < r:',                                            // 8
    '            cur = queue[l]; l += 1',                              // 9
    '            cur.left, cur.right = cur.right, cur.left',           // 10
    '            if cur.left: queue[r] = cur.left; r += 1',            // 11
    '            if cur.right: queue[r] = cur.right; r += 1',          // 12
    '        return root',                                             // 13
  ],
  javascript: [
    'function invertTree(root) {',                                     // 1
    '    if (!root) return null;',                                     // 2
    '    const MAXN = 2001;',                                          // 3
    '    const queue = new Array(MAXN);',                              // 4
    '    let l = 0, r = 0;',                                           // 5
    '    queue[r++] = root;',                                          // 6
    '    while (l < r) {',                                             // 7
    '        const cur = queue[l++];',                                 // 8
    '        const temp = cur.left;',                                  // 9
    '        cur.left = cur.right;',                                   // 10
    '        cur.right = temp;',                                       // 11
    '        if (cur.left) queue[r++] = cur.left;',                    // 12
    '        if (cur.right) queue[r++] = cur.right;',                  // 13
    '    }',                                                           // 14
    '    return root;',                                                // 15
    '}',                                                               // 16
  ],
};

export const TREE_INVERT_STAGE3_STATIC_ARRAY_LINES = {
  entry: { java: 5, cpp: 6, python: 2, javascript: 1 },
  nullCheck: { java: 6, cpp: 7, python: 3, javascript: 2 },
  initQueue: { java: 8, cpp: 9, python: 7, javascript: 6 },
  whileLoop: { java: 9, cpp: 10, python: 8, javascript: 7 },
  poll: { java: 10, cpp: 11, python: 9, javascript: 8 },
  swap: { java: 12, cpp: 12, python: 10, javascript: 10 },
  pushLeft: { java: 14, cpp: 13, python: 11, javascript: 12 },
  pushRight: { java: 15, cpp: 14, python: 12, javascript: 13 },
  returnRoot: { java: 17, cpp: 16, python: 13, javascript: 15 },
};
