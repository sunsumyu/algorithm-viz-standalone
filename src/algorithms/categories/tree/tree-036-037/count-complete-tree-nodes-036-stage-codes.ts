/**
 * 完全二叉树节点个数 (Count Complete Tree Nodes · LeetCode 222 / Class 036 Code06)
 * 多阶段演化四语言代码模板与精准 1-Based 行号映射
 *
 * Stage 1: 朴素递归 DFS 遍历 (O(N) 完整遍历基准对照)
 * Stage 2: 左神二分子树定界剪枝 (O((log N)^2) 招牌满树公式递归剪枝)
 * Stage 3: 二分叶子编号 + 二进制寻路探测 (O((log N)^2) 迭代二分查找)
 */

// ============================================================
// Stage 1: 朴素递归 DFS 遍历 (Naive Recursive DFS · O(N))
// ============================================================
export const COUNT_NODES_STAGE1_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                               // 1
    '    public int countNodes(TreeNode root) {',            // 2
    '        if (root == null) return 0;',                   // 3
    '        int leftCount = countNodes(root.left);',        // 4
    '        int rightCount = countNodes(root.right);',      // 5
    '        return leftCount + rightCount + 1;',            // 6
    '    }',                                                 // 7
    '}',                                                     // 8
  ],
  cpp: [
    'class Solution {',                                      // 1
    'public:',                                               // 2
    '    int countNodes(TreeNode* root) {',                  // 3
    '        if (!root) return 0;',                          // 4
    '        int leftCount = countNodes(root->left);',       // 5
    '        int rightCount = countNodes(root->right);',     // 6
    '        return leftCount + rightCount + 1;',            // 7
    '    }',                                                 // 8
    '};',                                                    // 9
  ],
  python: [
    'class Solution:',                                       // 1
    '    def countNodes(self, root: Optional[TreeNode]) -> int:', // 2
    '        if not root:',                                  // 3
    '            return 0',                                  // 4
    '        left_count = self.countNodes(root.left)',       // 5
    '        right_count = self.countNodes(root.right)',     // 6
    '        return left_count + right_count + 1',           // 7
  ],
  javascript: [
    'function countNodes(root) {',                           // 1
    '    if (!root) return 0;',                              // 2
    '    const leftCount = countNodes(root.left);',          // 3
    '    const rightCount = countNodes(root.right);',        // 4
    '    return leftCount + rightCount + 1;',                // 5
    '}',                                                     // 6
  ],
};

export const COUNT_NODES_STAGE1_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  baseCase: { java: 3, cpp: 4, python: 3, javascript: 2 },
  recurseLeft: { java: 4, cpp: 5, python: 5, javascript: 3 },
  recurseRight: { java: 5, cpp: 6, python: 6, javascript: 4 },
  combine: { java: 6, cpp: 7, python: 7, javascript: 5 },
};

// ============================================================
// Stage 2: 左神二分子树定界剪枝 (Zuoshen O((logN)^2) Subtree Probe)
// ============================================================
export const COUNT_NODES_STAGE2_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                              // 1
    '    public int countNodes(TreeNode root) {',                           // 2
    '        if (root == null) return 0;',                                  // 3
    '        return count(root, 1, mostLeft(root, 1));',                    // 4
    '    }',                                                                // 5
    '    private int count(TreeNode node, int level, int h) {',             // 6
    '        if (level == h) return 1;',                                    // 7
    '        if (mostLeft(node.right, level + 1) == h) {',                  // 8
    '            return (1 << (h - level)) + count(node.right, level + 1, h);', // 9
    '        } else {',                                                     // 10
    '            return (1 << (h - level - 1)) + count(node.left, level + 1, h);', // 11
    '        }',                                                            // 12
    '    }',                                                                // 13
    '    private int mostLeft(TreeNode node, int level) {',                  // 14
    '        while (node != null) { level++; node = node.left; }',          // 15
    '        return level - 1;',                                            // 16
    '    }',                                                                // 17
    '}',                                                                    // 18
  ],
  cpp: [
    'class Solution {',                                                     // 1
    'public:',                                                              // 2
    '    int countNodes(TreeNode* root) {',                                 // 3
    '        if (!root) return 0;',                                         // 4
    '        return count(root, 1, mostLeft(root, 1));',                    // 5
    '    }',                                                                // 6
    '    int count(TreeNode* node, int level, int h) {',                    // 7
    '        if (level == h) return 1;',                                    // 8
    '        if (mostLeft(node->right, level + 1) == h) {',                 // 9
    '            return (1 << (h - level)) + count(node->right, level + 1, h);', // 10
    '        } else {',                                                     // 11
    '            return (1 << (h - level - 1)) + count(node->left, level + 1, h);', // 12
    '        }',                                                            // 13
    '    }',                                                                // 14
    '    int mostLeft(TreeNode* node, int level) {',                        // 15
    '        while (node) { level++; node = node->left; }',                 // 16
    '        return level - 1;',                                            // 17
    '    }',                                                                // 18
    '};',                                                                   // 19
  ],
  python: [
    'class Solution:',                                                      // 1
    '    def countNodes(self, root: Optional[TreeNode]) -> int:',           // 2
    '        if not root: return 0',                                        // 3
    '        def most_left(node, level):',                                  // 4
    '            while node: level += 1; node = node.left',                 // 5
    '            return level - 1',                                         // 6
    '        h = most_left(root, 1)',                                       // 7
    '        def count(node, level):',                                      // 8
    '            if level == h: return 1',                                  // 9
    '            if most_left(node.right, level + 1) == h:',                // 10
    '                return (1 << (h - level)) + count(node.right, level + 1)', // 11
    '            else:',                                                    // 12
    '                return (1 << (h - level - 1)) + count(node.left, level + 1)', // 13
    '        return count(root, 1)',                                        // 14
  ],
  javascript: [
    'function countNodes(root) {',                                          // 1
    '    if (!root) return 0;',                                             // 2
    '    function mostLeft(node, level) {',                                 // 3
    '        while (node) { level++; node = node.left; }',                  // 4
    '        return level - 1;',                                            // 5
    '    }',                                                                // 6
    '    const h = mostLeft(root, 1);',                                     // 7
    '    function count(node, level) {',                                    // 8
    '        if (level === h) return 1;',                                   // 9
    '        if (mostLeft(node.right, level + 1) === h) {',                 // 10
    '            return (1 << (h - level)) + count(node.right, level + 1);',// 11
    '        } else {',                                                     // 12
    '            return (1 << (h - level - 1)) + count(node.left, level + 1);',// 13
    '        }',                                                            // 14
    '    }',                                                                // 15
    '    return count(root, 1);',                                           // 16
    '}',                                                                    // 17
  ],
};

export const COUNT_NODES_STAGE2_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  calcHeight: { java: 4, cpp: 5, python: 7, javascript: 7 },
  countEntry: { java: 6, cpp: 7, python: 8, javascript: 8 },
  baseCase: { java: 7, cpp: 8, python: 9, javascript: 9 },
  probeRight: { java: 8, cpp: 9, python: 10, javascript: 10 },
  leftFullSubtree: { java: 9, cpp: 10, python: 11, javascript: 11 },
  rightFullSubtree: { java: 11, cpp: 12, python: 13, javascript: 13 },
  mostLeft: { java: 15, cpp: 16, python: 5, javascript: 4 },
  finish: { java: 4, cpp: 5, python: 14, javascript: 16 },
};

// ============================================================
// Stage 3: 二分叶子编号 + 二进制寻路探测 (Binary Search + Bit Path)
// ============================================================
export const COUNT_NODES_STAGE3_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                              // 1
    '    public int countNodes(TreeNode root) {',                           // 2
    '        if (root == null) return 0;',                                  // 3
    '        int h = 0; TreeNode cur = root;',                              // 4
    '        while (cur != null) { h++; cur = cur.left; }',                 // 5
    '        if (h <= 1) return h;',                                        // 6
    '        int low = 1 << (h - 1), high = (1 << h) - 1;',                 // 7
    '        while (low <= high) {',                                        // 8
    '            int mid = low + (high - low) / 2;',                        // 9
    '            if (exists(root, h, mid)) low = mid + 1;',                 // 10
    '            else high = mid - 1;',                                     // 11
    '        }',                                                            // 12
    '        return high;',                                                 // 13
    '    }',                                                                // 14
    '    private boolean exists(TreeNode root, int h, int k) {',            // 15
    '        int bits = 1 << (h - 2); TreeNode node = root;',               // 16
    '        while (node != null && bits > 0) {',                           // 17
    '            if ((bits & k) == 0) node = node.left;',                   // 18
    '            else node = node.right;',                                  // 19
    '            bits >>= 1;',                                              // 20
    '        }',                                                            // 21
    '        return node != null;',                                         // 22
    '    }',                                                                // 23
    '}',                                                                    // 24
  ],
  cpp: [
    'class Solution {',                                                     // 1
    'public:',                                                              // 2
    '    int countNodes(TreeNode* root) {',                                 // 3
    '        if (!root) return 0;',                                         // 4
    '        int h = 0; TreeNode* cur = root;',                             // 5
    '        while (cur) { h++; cur = cur->left; }',                        // 6
    '        if (h <= 1) return h;',                                        // 7
    '        int low = 1 << (h - 1), high = (1 << h) - 1;',                 // 8
    '        while (low <= high) {',                                        // 9
    '            int mid = low + (high - low) / 2;',                        // 10
    '            if (exists(root, h, mid)) low = mid + 1;',                 // 11
    '            else high = mid - 1;',                                     // 12
    '        }',                                                            // 13
    '        return high;',                                                 // 14
    '    }',                                                                // 15
    '    bool exists(TreeNode* root, int h, int k) {',                      // 16
    '        int bits = 1 << (h - 2); TreeNode* node = root;',              // 17
    '        while (node && bits > 0) {',                                   // 18
    '            if ((bits & k) == 0) node = node->left;',                  // 19
    '            else node = node->right;',                                 // 20
    '            bits >>= 1;',                                              // 21
    '        }',                                                            // 22
    '        return node != nullptr;',                                      // 23
    '    }',                                                                // 24
    '};',                                                                   // 25
  ],
  python: [
    'class Solution:',                                                      // 1
    '    def countNodes(self, root: Optional[TreeNode]) -> int:',           // 2
    '        if not root: return 0',                                        // 3
    '        h, cur = 0, root',                                             // 4
    '        while cur: h += 1; cur = cur.left',                            // 5
    '        if h <= 1: return h',                                          // 6
    '        def exists(k: int) -> bool:',                                  // 7
    '            bits, node = 1 << (h - 2), root',                          // 8
    '            while node and bits > 0:',                                 // 9
    '                node = node.right if (bits & k) else node.left',       // 10
    '                bits >>= 1',                                           // 11
    '            return node is not None',                                  // 12
    '        low, high = 1 << (h - 1), (1 << h) - 1',                       // 13
    '        while low <= high:',                                           // 14
    '            mid = (low + high) // 2',                                  // 15
    '            if exists(mid): low = mid + 1',                            // 16
    '            else: high = mid - 1',                                     // 17
    '        return high',                                                  // 18
  ],
  javascript: [
    'function countNodes(root) {',                                          // 1
    '    if (!root) return 0;',                                             // 2
    '    let h = 0, cur = root;',                                           // 3
    '    while (cur) { h++; cur = cur.left; }',                             // 4
    '    if (h <= 1) return h;',                                            // 5
    '    function exists(k) {',                                             // 6
    '        let bits = 1 << (h - 2), node = root;',                        // 7
    '        while (node && bits > 0) {',                                   // 8
    '            node = (bits & k) ? node.right : node.left;',              // 9
    '            bits >>= 1;',                                              // 10
    '        }',                                                            // 11
    '        return node !== null;',                                        // 12
    '    }',                                                                // 13
    '    let low = 1 << (h - 1), high = (1 << h) - 1;',                     // 14
    '    while (low <= high) {',                                            // 15
    '        const mid = Math.floor((low + high) / 2);',                    // 16
    '        if (exists(mid)) low = mid + 1;',                              // 17
    '        else high = mid - 1;',                                         // 18
    '    }',                                                                // 19
    '    return high;',                                                     // 20
    '}',                                                                    // 21
  ],
};

export const COUNT_NODES_STAGE3_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  calcHeight: { java: 5, cpp: 6, python: 5, javascript: 4 },
  initRange: { java: 7, cpp: 8, python: 13, javascript: 14 },
  binarySearch: { java: 8, cpp: 9, python: 14, javascript: 15 },
  calcMid: { java: 9, cpp: 10, python: 15, javascript: 16 },
  checkExists: { java: 10, cpp: 11, python: 16, javascript: 17 },
  moveRight: { java: 10, cpp: 11, python: 16, javascript: 17 },
  moveLeft: { java: 11, cpp: 12, python: 17, javascript: 18 },
  bitPath: { java: 18, cpp: 19, python: 10, javascript: 9 },
  finish: { java: 13, cpp: 14, python: 18, javascript: 20 },
};
