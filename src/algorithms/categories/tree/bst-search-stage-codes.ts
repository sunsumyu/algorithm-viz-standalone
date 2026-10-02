/**
 * 二叉搜索树中的搜索 (Search in a Binary Search Tree · LeetCode 700 & 701)
 * 多阶段演化四语言代码模板与精准 1-Based 行号映射
 *
 * Stage 1: 迭代单向剪枝查找 (Iterative BST Search · O(1) 空间)
 * Stage 2: 递归分支剪枝查找 (Recursive Divide & Conquer · O(H) 栈深度)
 * Stage 3: 搜索未命中定点动态插入 (BST Search & Insert · LC 701 读写闭环)
 */

// ============================================================
// Stage 1: 迭代单向剪枝查找 (Iterative BST Search · LC 700)
// ============================================================
export const BST_SEARCH_STAGE1_ITERATIVE_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                          // 1
    '    public TreeNode searchBST(TreeNode root, int val) {',          // 2
    '        TreeNode cur = root;',                                     // 3
    '        while (cur != null) {',                                    // 4
    '            if (cur.val == val) return cur;',                      // 5
    '            if (val < cur.val) {',                                 // 6
    '                cur = cur.left;  // 目标小于当前值，往左搜',       // 7
    '            } else {',                                             // 8
    '                cur = cur.right; // 目标大于当前值，往右搜',       // 9
    '            }',                                                    // 10
    '        }',                                                        // 11
    '        return null; // 未在 BST 中找到目标节点',                  // 12
    '    }',                                                            // 13
    '}',                                                                // 14
  ],
  cpp: [
    'class Solution {',                                                 // 1
    'public:',                                                          // 2
    '    TreeNode* searchBST(TreeNode* root, int val) {',               // 3
    '        TreeNode* cur = root;',                                    // 4
    '        while (cur) {',                                            // 5
    '            if (cur->val == val) return cur;',                     // 6
    '            if (val < cur->val) cur = cur->left;',                 // 7
    '            else cur = cur->right;',                               // 8
    '        }',                                                        // 9
    '        return nullptr;',                                          // 10
    '    }',                                                            // 11
    '};',                                                               // 12
  ],
  python: [
    'class Solution:',                                                  // 1
    '    def searchBST(self, root: Optional[TreeNode], val: int) -> Optional[TreeNode]:', // 2
    '        cur = root',                                               // 3
    '        while cur:',                                               // 4
    '            if cur.val == val:',                                   // 5
    '                return cur',                                       // 6
    '            if val < cur.val:',                                    // 7
    '                cur = cur.left',                                   // 8
    '            else:',                                                // 9
    '                cur = cur.right',                                  // 10
    '        return None',                                              // 11
  ],
  javascript: [
    'var searchBST = function(root, val) {',                            // 1
    '    let cur = root;',                                              // 2
    '    while (cur !== null) {',                                       // 3
    '        if (cur.val === val) return cur;',                         // 4
    '        if (val < cur.val) {',                                     // 5
    '            cur = cur.left;',                                      // 6
    '        } else {',                                                 // 7
    '            cur = cur.right;',                                     // 8
    '        }',                                                        // 9
    '    }',                                                            // 10
    '    return null;',                                                 // 11
    '};',                                                               // 12
  ],
};

export const BST_SEARCH_STAGE1_LINES = {
  init: { java: 3, cpp: 4, python: 3, javascript: 2 },
  whileCheck: { java: 4, cpp: 5, python: 4, javascript: 3 },
  match: { java: 5, cpp: 6, python: [5, 6], javascript: 4 },
  goLeft: { java: 7, cpp: 7, python: [7, 8], javascript: 6 },
  goRight: { java: 9, cpp: 8, python: [9, 10], javascript: 8 },
  notFound: { java: 12, cpp: 10, python: 11, javascript: 11 },
  done: { java: 12, cpp: 10, python: 11, javascript: 11 },
};

// ============================================================
// Stage 2: 递归分支剪枝查找 (Recursive BST Search · LC 700)
// ============================================================
export const BST_SEARCH_STAGE2_RECURSIVE_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                          // 1
    '    public TreeNode searchBST(TreeNode root, int val) {',          // 2
    '        if (root == null || root.val == val) return root;',        // 3
    '        if (val < root.val) {',                                    // 4
    '            return searchBST(root.left, val);',                    // 5
    '        } else {',                                                 // 6
    '            return searchBST(root.right, val);',                   // 7
    '        }',                                                        // 8
    '    }',                                                            // 9
    '}',                                                                // 10
  ],
  cpp: [
    'class Solution {',                                                 // 1
    'public:',                                                          // 2
    '    TreeNode* searchBST(TreeNode* root, int val) {',               // 3
    '        if (!root || root->val == val) return root;',              // 4
    '        if (val < root->val) return searchBST(root->left, val);',  // 5
    '        return searchBST(root->right, val);',                      // 6
    '    }',                                                            // 7
    '};',                                                               // 8
  ],
  python: [
    'class Solution:',                                                  // 1
    '    def searchBST(self, root: Optional[TreeNode], val: int) -> Optional[TreeNode]:', // 2
    '        if not root or root.val == val:',                          // 3
    '            return root',                                          // 4
    '        if val < root.val:',                                       // 5
    '            return self.searchBST(root.left, val)',                // 6
    '        return self.searchBST(root.right, val)',                   // 7
  ],
  javascript: [
    'var searchBST = function(root, val) {',                            // 1
    '    if (!root || root.val === val) return root;',                  // 2
    '    if (val < root.val) {',                                        // 3
    '        return searchBST(root.left, val);',                        // 4
    '    } else {',                                                     // 5
    '        return searchBST(root.right, val);',                       // 6
    '    }',                                                            // 7
    '};',                                                               // 8
  ],
};

export const BST_SEARCH_STAGE2_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  baseCheck: { java: 3, cpp: 4, python: [3, 4], javascript: 2 },
  match: { java: 3, cpp: 4, python: [3, 4], javascript: 2 },
  recurseLeft: { java: 5, cpp: 5, python: 6, javascript: 4 },
  recurseRight: { java: 7, cpp: 6, python: 7, javascript: 6 },
  done: { java: 3, cpp: 4, python: 4, javascript: 2 },
};

// ============================================================
// Stage 3: 搜索未命中定点动态插入 (BST Search & Insert · LC 701)
// ============================================================
export const BST_SEARCH_STAGE3_INSERT_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                          // 1
    '    public TreeNode insertIntoBST(TreeNode root, int val) {',       // 2
    '        if (root == null) return new TreeNode(val);',              // 3
    '        TreeNode cur = root;',                                     // 4
    '        while (true) {',                                           // 5
    '            if (val < cur.val) {',                                 // 6
    '                if (cur.left == null) {',                          // 7
    '                    cur.left = new TreeNode(val); // 挂载左叶子',  // 8
    '                    break;',                                       // 9
    '                }',                                                // 10
    '                cur = cur.left;',                                  // 11
    '            } else {',                                             // 12
    '                if (cur.right == null) {',                         // 13
    '                    cur.right = new TreeNode(val); // 挂载右叶子', // 14
    '                    break;',                                       // 15
    '                }',                                                // 16
    '                cur = cur.right;',                                 // 17
    '            }',                                                    // 18
    '        }',                                                        // 19
    '        return root;',                                             // 20
    '    }',                                                            // 21
    '}',                                                                // 22
  ],
  cpp: [
    'class Solution {',                                                 // 1
    'public:',                                                          // 2
    '    TreeNode* insertIntoBST(TreeNode* root, int val) {',           // 3
    '        if (!root) return new TreeNode(val);',                     // 4
    '        TreeNode* cur = root;',                                    // 5
    '        while (true) {',                                           // 6
    '            if (val < cur->val) {',                                // 7
    '                if (!cur->left) { cur->left = new TreeNode(val); break; }', // 8
    '                cur = cur->left;',                                 // 9
    '            } else {',                                             // 10
    '                if (!cur->right) { cur->right = new TreeNode(val); break; }', // 11
    '                cur = cur->right;',                                // 12
    '            }',                                                    // 13
    '        }',                                                        // 14
    '        return root;',                                             // 15
    '    }',                                                            // 16
    '};',                                                               // 17
  ],
  python: [
    'class Solution:',                                                  // 1
    '    def insertIntoBST(self, root: Optional[TreeNode], val: int) -> Optional[TreeNode]:', // 2
    '        if not root:',                                             // 3
    '            return TreeNode(val)',                                 // 4
    '        cur = root',                                               // 5
    '        while True:',                                              // 6
    '            if val < cur.val:',                                    // 7
    '                if not cur.left:',                                 // 8
    '                    cur.left = TreeNode(val)',                     // 9
    '                    break',                                        // 10
    '                cur = cur.left',                                   // 11
    '            else:',                                                // 12
    '                if not cur.right:',                                // 13
    '                    cur.right = TreeNode(val)',                    // 14
    '                    break',                                        // 15
    '                cur = cur.right',                                  // 16
    '        return root',                                              // 17
  ],
  javascript: [
    'var insertIntoBST = function(root, val) {',                        // 1
    '    if (!root) return new TreeNode(val);',                         // 2
    '    let cur = root;',                                              // 3
    '    while (true) {',                                               // 4
    '        if (val < cur.val) {',                                     // 5
    '            if (!cur.left) {',                                     // 6
    '                cur.left = new TreeNode(val);',                    // 7
    '                break;',                                           // 8
    '            }',                                                    // 9
    '            cur = cur.left;',                                      // 10
    '        } else {',                                                 // 11
    '            if (!cur.right) {',                                    // 12
    '                cur.right = new TreeNode(val);',                   // 13
    '                break;',                                           // 14
    '            }',                                                    // 15
    '            cur = cur.right;',                                     // 16
    '        }',                                                        // 17
    '    }',                                                            // 18
    '    return root;',                                                 // 19
    '};',                                                               // 20
  ],
};

export const BST_SEARCH_STAGE3_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  emptyRoot: { java: 3, cpp: 4, python: [3, 4], javascript: 2 },
  whileSearch: { java: 5, cpp: 6, python: 6, javascript: 4 },
  checkLeft: { java: 7, cpp: 7, python: [7, 8], javascript: [5, 6] },
  insertLeft: { java: 8, cpp: 8, python: 9, javascript: 7 },
  stepLeft: { java: 11, cpp: 9, python: 11, javascript: 10 },
  checkRight: { java: 13, cpp: 10, python: [12, 13], javascript: [11, 12] },
  insertRight: { java: 14, cpp: 11, python: 14, javascript: 13 },
  stepRight: { java: 17, cpp: 12, python: 16, javascript: 16 },
  done: { java: 20, cpp: 15, python: 17, javascript: 19 },
};
