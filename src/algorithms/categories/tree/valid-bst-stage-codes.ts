/**
 * 验证二叉搜索树 (Validate BST · LeetCode 98 / Class 037 Code05)
 * 多阶段演化四语言代码模板与精准 1-Based 行号映射
 *
 * Stage 1: 中序递归单调性校验 (Recursive Inorder Monotonicity · 经典全局前驱指针)
 * Stage 2: 上下界区间约束先序定界 (Boundary Range Pruning · (min, max) 递归先序剪枝)
 * Stage 3: 迭代显式栈模拟中序遍历 (Iterative Explicit Stack Inorder · 模拟调用栈)
 */

// ============================================================
// Stage 1: 中序递归单调性校验 (Recursive Inorder Monotonicity)
// ============================================================
export const VALID_BST_STAGE1_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                          // 1
    '    private TreeNode prev = null;',                                // 2
    '    public boolean isValidBST(TreeNode root) {',                  // 3
    '        if (root == null) {',                                     // 4
    '            return true;',                                        // 5
    '        }',                                                       // 6
    '        if (!isValidBST(root.left)) {',                           // 7
    '            return false;',                                       // 8
    '        }',                                                       // 9
    '        if (prev != null && root.val <= prev.val) {',             // 10
    '            return false;',                                       // 11
    '        }',                                                       // 12
    '        prev = root;',                                            // 13
    '        return isValidBST(root.right);',                          // 14
    '    }',                                                           // 15
    '}',                                                               // 16
  ],
  cpp: [
    'class Solution {',                                                // 1
    '    TreeNode* prev = nullptr;',                                   // 2
    'public:',                                                         // 3
    '    bool isValidBST(TreeNode* root) {',                           // 4
    '        if (!root) {',                                            // 5
    '            return true;',                                        // 6
    '        }',                                                       // 7
    '        if (!isValidBST(root->left)) {',                          // 8
    '            return false;',                                       // 9
    '        }',                                                       // 10
    '        if (prev && root->val <= prev->val) {',                   // 11
    '            return false;',                                       // 12
    '        }',                                                       // 13
    '        prev = root;',                                            // 14
    '        return isValidBST(root->right);',                         // 15
    '    }',                                                           // 16
    '};',                                                              // 17
  ],
  python: [
    'class Solution:',                                                 // 1
    '    def __init__(self):',                                         // 2
    '        self.prev = None',                                        // 3
    '',                                                                // 4
    '    def isValidBST(self, root: Optional[TreeNode]) -> bool:',     // 5
    '        if not root:',                                            // 6
    '            return True',                                         // 7
    '        if not self.isValidBST(root.left):',                      // 8
    '            return False',                                        // 9
    '        if self.prev is not None and root.val <= self.prev.val:', // 10
    '            return False',                                        // 11
    '        self.prev = root',                                        // 12
    '        return self.isValidBST(root.right)',                      // 13
  ],
  javascript: [
    'var isValidBST = function(root) {',                              // 1
    '    let prev = null;',                                            // 2
    '    const inorder = (node) => {',                                 // 3
    '        if (!node) {',                                            // 4
    '            return true;',                                        // 5
    '        }',                                                       // 6
    '        if (!inorder(node.left)) {',                              // 7
    '            return false;',                                       // 8
    '        }',                                                       // 9
    '        if (prev !== null && node.val <= prev.val) {',            // 10
    '            return false;',                                       // 11
    '        }',                                                       // 12
    '        prev = node;',                                            // 13
    '        return inorder(node.right);',                             // 14
    '    };',                                                          // 15
    '    return inorder(root);',                                       // 16
    '};',                                                              // 17
  ],
};

export const VALID_BST_STAGE1_LINES = {
  entry: { java: 3, cpp: 4, python: 5, javascript: 3 },
  nullCheckHit: { java: 4, cpp: 5, python: 6, javascript: 4 },
  nullCheckPass: { java: 4, cpp: 5, python: 6, javascript: 4 },
  nullReturn: { java: 5, cpp: 6, python: 7, javascript: 5 },
  checkLeft: { java: 7, cpp: 8, python: 8, javascript: 7 },
  leftReturned: { java: 7, cpp: 8, python: 8, javascript: 7 },
  leftReturnFalse: { java: 8, cpp: 9, python: 9, javascript: 8 },
  comparePrev: { java: 10, cpp: 11, python: 10, javascript: 10 },
  prevViolation: { java: 11, cpp: 12, python: 11, javascript: 11 },
  updatePrev: { java: 13, cpp: 14, python: 12, javascript: 13 },
  checkRight: { java: 14, cpp: 15, python: 13, javascript: 14 },
  returnRight: { java: 14, cpp: 15, python: 13, javascript: 14 },
  doneValid: { java: 14, cpp: 15, python: 13, javascript: 16 },

  // Backward compatibility alias
  emptyCheck: { java: 4, cpp: 5, python: 6, javascript: 4 },
};

// ============================================================
// Stage 2: 上下界区间约束先序定界 (Boundary Range Pruning)
// ============================================================
export const VALID_BST_STAGE2_RANGE_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                          // 1
    '    public boolean isValidBST(TreeNode root) {',                  // 2
    '        return check(root, Long.MIN_VALUE, Long.MAX_VALUE);',     // 3
    '    }',                                                           // 4
    '    private boolean check(TreeNode node, long min, long max) {', // 5
    '        if (node == null) return true;',                          // 6
    '        // 检查当前节点值是否在合法开区间 (min, max) 内',           // 7
    '        if (node.val <= min || node.val >= max) {',               // 8
    '            return false;',                                       // 9
    '        }',                                                       // 10
    '        // 左子树上界为当前节点值，右子树下界为当前节点值',       // 11
    '        return check(node.left, min, node.val)',                  // 12
    '            && check(node.right, node.val, max);',                // 13
    '    }',                                                           // 14
    '}',                                                               // 15
  ],
  cpp: [
    'class Solution {',                                                // 1
    'public:',                                                         // 2
    '    bool isValidBST(TreeNode* root) {',                           // 3
    '        return check(root, LONG_MIN, LONG_MAX);',                 // 4
    '    }',                                                           // 5
    '    bool check(TreeNode* node, long long min, long long max) {',  // 6
    '        if (!node) return true;',                                 // 7
    '        if (node->val <= min || node->val >= max) return false;', // 8
    '        return check(node->left, min, node->val)',                // 9
    '            && check(node->right, node->val, max);',              // 10
    '    }',                                                           // 11
    '};',                                                              // 12
  ],
  python: [
    'class Solution:',                                                 // 1
    '    def isValidBST(self, root: Optional[TreeNode]) -> bool:',     // 2
    '        def check(node, lower, upper):',                          // 3
    '            if not node:',                                        // 4
    '                return True',                                     // 5
    '            if node.val <= lower or node.val >= upper:',          // 6
    '                return False',                                    // 7
    '            return check(node.left, lower, node.val) and \\',      // 8
    '                   check(node.right, node.val, upper)',           // 9
    '        return check(root, float("-inf"), float("inf"))',         // 10
  ],
  javascript: [
    'function isValidBST(root) {',                                     // 1
    '    function check(node, min, max) {',                            // 2
    '        if (!node) return true;',                                 // 3
    '        if (node.val <= min || node.val >= max) {',               // 4
    '            return false;',                                       // 5
    '        }',                                                       // 6
    '        return check(node.left, min, node.val)',                  // 7
    '            && check(node.right, node.val, max);',                // 8
    '    }',                                                           // 9
    '    return check(root, -Infinity, Infinity);',                    // 10
    '}',                                                               // 11
  ],
};

export const VALID_BST_STAGE2_RANGE_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  callRoot: { java: 3, cpp: 4, python: 10, javascript: 10 },
  nullCheck: { java: 6, cpp: 7, python: 4, javascript: 3 },
  nullReturn: { java: 6, cpp: 7, python: 5, javascript: 3 },
  boundaryCheck: { java: 8, cpp: 8, python: 6, javascript: 4 },
  violation: { java: 9, cpp: 8, python: 7, javascript: 5 },
  recurseLeft: { java: 12, cpp: 9, python: 8, javascript: 7 },
  recurseRight: { java: 13, cpp: 10, python: 9, javascript: 8 },
  done: { java: 3, cpp: 4, python: 10, javascript: 10 },
};

// ============================================================
// Stage 3: 迭代显式栈模拟中序遍历 (Iterative Explicit Stack Inorder)
// ============================================================
export const VALID_BST_STAGE3_STACK_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                          // 1
    '    public boolean isValidBST(TreeNode root) {',                  // 2
    '        if (root == null) return true;',                          // 3
    '        Stack<TreeNode> stack = new Stack<>();',                  // 4
    '        TreeNode cur = root;',                                    // 5
    '        TreeNode prev = null;',                                   // 6
    '        while (cur != null || !stack.isEmpty()) {',               // 7
    '            while (cur != null) {',                               // 8
    '                stack.push(cur);',                                // 9
    '                cur = cur.left;',                                 // 10
    '            }',                                                   // 11
    '            cur = stack.pop();',                                  // 12
    '            if (prev != null && cur.val <= prev.val) return false;', // 13
    '            prev = cur;',                                         // 14
    '            cur = cur.right;',                                    // 15
    '        }',                                                       // 16
    '        return true;',                                            // 17
    '    }',                                                           // 18
    '}',                                                               // 19
  ],
  cpp: [
    'class Solution {',                                                // 1
    'public:',                                                         // 2
    '    bool isValidBST(TreeNode* root) {',                           // 3
    '        if (!root) return true;',                                 // 4
    '        stack<TreeNode*> st;',                                    // 5
    '        TreeNode* cur = root;',                                   // 6
    '        TreeNode* prev = nullptr;',                               // 7
    '        while (cur || !st.empty()) {',                            // 8
    '            while (cur) {',                                       // 9
    '                st.push(cur);',                                   // 10
    '                cur = cur->left;',                                // 11
    '            }',                                                   // 12
    '            cur = st.top(); st.pop();',                           // 13
    '            if (prev && cur->val <= prev->val) return false;',    // 14
    '            prev = cur;',                                         // 15
    '            cur = cur->right;',                                   // 16
    '        }',                                                       // 17
    '        return true;',                                            // 18
    '    }',                                                           // 19
    '};',                                                              // 20
  ],
  python: [
    'class Solution:',                                                 // 1
    '    def isValidBST(self, root: Optional[TreeNode]) -> bool:',     // 2
    '        if not root: return True',                                // 3
    '        stack = []',                                              // 4
    '        cur = root',                                              // 5
    '        prev = None',                                             // 6
    '        while cur or stack:',                                     // 7
    '            while cur:',                                          // 8
    '                stack.append(cur)',                               // 9
    '                cur = cur.left',                                  // 10
    '            cur = stack.pop()',                                   // 11
    '            if prev is not None and cur.val <= prev.val:',        // 12
    '                return False',                                    // 13
    '            prev = cur',                                          // 14
    '            cur = cur.right',                                     // 15
    '        return True',                                             // 16
  ],
  javascript: [
    'function isValidBST(root) {',                                     // 1
    '    if (!root) return true;',                                     // 2
    '    const stack = [];',                                           // 3
    '    let cur = root;',                                             // 4
    '    let prev = null;',                                            // 5
    '    while (cur || stack.length > 0) {',                           // 6
    '        while (cur) {',                                           // 7
    '            stack.push(cur);',                                    // 8
    '            cur = cur.left;',                                     // 9
    '        }',                                                       // 10
    '        cur = stack.pop();',                                      // 11
    '        if (prev !== null && cur.val <= prev.val) return false;', // 12
    '        prev = cur;',                                             // 13
    '        cur = cur.right;',                                        // 14
    '    }',                                                           // 15
    '    return true;',                                                // 16
    '}',                                                               // 17
  ],
};

export const VALID_BST_STAGE3_STACK_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  nullCheck: { java: 3, cpp: 4, python: 3, javascript: 2 },
  initStack: { java: 4, cpp: 5, python: 4, javascript: 3 },
  pushLeftBranch: { java: 9, cpp: 10, python: 9, javascript: 8 },
  popNode: { java: 12, cpp: 13, python: 11, javascript: 11 },
  comparePrev: { java: 13, cpp: 14, python: 12, javascript: 12 },
  updatePrev: { java: 14, cpp: 15, python: 14, javascript: 13 },
  turnRight: { java: 15, cpp: 16, python: 15, javascript: 14 },
  doneValid: { java: 17, cpp: 18, python: 16, javascript: 16 },
};
