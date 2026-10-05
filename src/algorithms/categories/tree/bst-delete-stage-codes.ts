/**
 * 二叉搜索树中的删除 (Delete Node in a BST · LeetCode 450)
 * 多阶段演化四语言代码模板与精准 1-Based 行号映射
 *
 * Stage 1: 递归直接嫁接删除 (Recursive Child Grafting · LC 450 优雅指针重连)
 * Stage 2: 递归后继节点值覆盖 (Recursive Successor Replacement · 算法导论经典解法)
 * Stage 3: 双指针显式迭代删除 (Iterative Two-Pointers BST Deletion · O(1) 辅助空间)
 */

// ============================================================
// Stage 1: 递归直接嫁接删除 (Recursive Child Grafting)
// ============================================================
export const BST_DELETE_STAGE1_GRAFT_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                          // 1
    '    public TreeNode deleteNode(TreeNode root, int key) {',          // 2
    '        if (root == null) return null; // 1. 树为空或未命中目标',  // 3
    '        if (key < root.val) {',                                    // 4
    '            root.left = deleteNode(root.left, key); // 2. 深入左子树', // 5
    '        } else if (key > root.val) {',                             // 6
    '            root.right = deleteNode(root.right, key); // 3. 深入右子树', // 7
    '        } else {',                                                 // 8
    '            if (root.left == null) return root.right; // 4. 左空右上位', // 9
    '            if (root.right == null) return root.left; // 5. 右空左上位', // 10
    '            TreeNode cur = root.right; // 6. 左右俱在，定位右子树极左叶', // 11
    '            while (cur.left != null) cur = cur.left;',             // 12
    '            cur.left = root.left; // 7. 将原左子树嫁接至极左叶下', // 13
    '            root = root.right; // 8. 右子树根节点晋升为新根',      // 14
    '        }',                                                        // 15
    '        return root; // 9. 返回调整后的子树根',                    // 16
    '    }',                                                            // 17
    '}',                                                                // 18
  ],
  cpp: [
    'class Solution {',                                                 // 1
    'public:',                                                          // 2
    '    TreeNode* deleteNode(TreeNode* root, int key) {',              // 3
    '        if (!root) return nullptr;',                               // 4
    '        if (key < root->val) {',                                   // 5
    '            root->left = deleteNode(root->left, key);',            // 6
    '        } else if (key > root->val) {',                            // 7
    '            root->right = deleteNode(root->right, key);',          // 8
    '        } else {',                                                 // 9
    '            if (!root->left) return root->right;',                 // 10
    '            if (!root->right) return root->left;',                 // 11
    '            TreeNode* cur = root->right;',                         // 12
    '            while (cur->left) cur = cur->left;',                   // 13
    '            cur->left = root->left;',                              // 14
    '            root = root->right;',                                  // 15
    '        }',                                                        // 16
    '        return root;',                                             // 17
    '    }',                                                            // 18
    '};',                                                               // 19
  ],
  python: [
    'class Solution:',                                                  // 1
    '    def deleteNode(self, root: Optional[TreeNode], key: int) -> Optional[TreeNode]:', // 2
    '        if not root:',                                             // 3
    '            return None',                                          // 4
    '        if key < root.val:',                                       // 5
    '            root.left = self.deleteNode(root.left, key)',          // 6
    '        elif key > root.val:',                                     // 7
    '            root.right = self.deleteNode(root.right, key)',        // 8
    '        else:',                                                    // 9
    '            if not root.left:',                                    // 10
    '                return root.right',                                // 11
    '            if not root.right:',                                   // 12
    '                return root.left',                                 // 13
    '            cur = root.right',                                     // 14
    '            while cur.left:',                                      // 15
    '                cur = cur.left',                                   // 16
    '            cur.left = root.left',                                 // 17
    '            root = root.right',                                    // 18
    '        return root',                                              // 19
  ],
  javascript: [
    'var deleteNode = function(root, key) {',                           // 1
    '    if (!root) return null;',                                      // 2
    '    if (key < root.val) {',                                        // 3
    '        root.left = deleteNode(root.left, key);',                  // 4
    '    } else if (key > root.val) {',                                 // 5
    '        root.right = deleteNode(root.right, key);',                 // 6
    '    } else {',                                                     // 7
    '        if (!root.left) return root.right;',                       // 8
    '        if (!root.right) return root.left;',                       // 9
    '        let cur = root.right;',                                    // 10
    '        while (cur.left) cur = cur.left;',                         // 11
    '        cur.left = root.left;',                                    // 12
    '        root = root.right;',                                       // 13
    '    }',                                                            // 14
    '    return root;',                                                 // 15
    '};',                                                               // 16
  ],
};

export const BST_DELETE_STAGE1_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  baseNull: { java: 3, cpp: 4, python: [3, 4], javascript: 2 },
  searchLeft: { java: 5, cpp: 6, python: 6, javascript: 4 },
  searchRight: { java: 7, cpp: 8, python: 8, javascript: 6 },
  foundMatch: { java: 8, cpp: 9, python: 9, javascript: 7 },
  leftNull: { java: 9, cpp: 10, python: [10, 11], javascript: 8 },
  rightNull: { java: 10, cpp: 11, python: [12, 13], javascript: 9 },
  findSuccessor: { java: 11, cpp: 12, python: 14, javascript: 10 },
  loopSuccessor: { java: 12, cpp: 13, python: [15, 16], javascript: 11 },
  attachGraft: { java: 13, cpp: 14, python: 17, javascript: 12 },
  promoteRight: { java: 14, cpp: 15, python: 18, javascript: 13 },
  returnRoot: { java: 16, cpp: 17, python: 19, javascript: 15 },
  done: { java: 16, cpp: 17, python: 19, javascript: 15 },
};

// ============================================================
// Stage 2: 递归后继节点值覆盖 (Recursive Successor Replacement)
// ============================================================
export const BST_DELETE_STAGE2_REPLACE_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                          // 1
    '    public TreeNode deleteNode(TreeNode root, int key) {',          // 2
    '        if (root == null) return null;',                           // 3
    '        if (key < root.val) {',                                    // 4
    '            root.left = deleteNode(root.left, key);',              // 5
    '        } else if (key > root.val) {',                             // 6
    '            root.right = deleteNode(root.right, key);',            // 7
    '        } else {',                                                 // 8
    '            if (root.left == null) return root.right;',            // 9
    '            if (root.right == null) return root.left;',            // 10
    '            TreeNode minNode = findMin(root.right); // 查找后继',   // 11
    '            root.val = minNode.val; // 覆盖替换为后继节点值',      // 12
    '            root.right = deleteNode(root.right, minNode.val); // 递归删除后继', // 13
    '        }',                                                        // 14
    '        return root;',                                             // 15
    '    }',                                                            // 16
    '    private TreeNode findMin(TreeNode node) {',                    // 17
    '        while (node.left != null) node = node.left;',              // 18
    '        return node;',                                             // 19
    '    }',                                                            // 20
    '}',                                                                // 21
  ],
  cpp: [
    'class Solution {',                                                 // 1
    'public:',                                                          // 2
    '    TreeNode* deleteNode(TreeNode* root, int key) {',              // 3
    '        if (!root) return nullptr;',                               // 4
    '        if (key < root->val) {',                                   // 5
    '            root->left = deleteNode(root->left, key);',            // 6
    '        } else if (key > root->val) {',                            // 7
    '            root->right = deleteNode(root->right, key);',          // 8
    '        } else {',                                                 // 9
    '            if (!root->left) return root->right;',                 // 10
    '            if (!root->right) return root->left;',                 // 11
    '            TreeNode* minNode = findMin(root->right);',            // 12
    '            root->val = minNode->val;',                            // 13
    '            root->right = deleteNode(root->right, minNode->val);', // 14
    '        }',                                                        // 15
    '        return root;',                                             // 16
    '    }',                                                            // 17
    '    TreeNode* findMin(TreeNode* node) {',                          // 18
    '        while (node->left) node = node->left;',                    // 19
    '        return node;',                                             // 20
    '    }',                                                            // 21
    '};',                                                               // 22
  ],
  python: [
    'class Solution:',                                                  // 1
    '    def deleteNode(self, root: Optional[TreeNode], key: int) -> Optional[TreeNode]:', // 2
    '        if not root:',                                             // 3
    '            return None',                                          // 4
    '        if key < root.val:',                                       // 5
    '            root.left = self.deleteNode(root.left, key)',          // 6
    '        elif key > root.val:',                                     // 7
    '            root.right = self.deleteNode(root.right, key)',        // 8
    '        else:',                                                    // 9
    '            if not root.left:',                                    // 10
    '                return root.right',                                // 11
    '            if not root.right:',                                   // 12
    '                return root.left',                                 // 13
    '            minNode = self.findMin(root.right)',                   // 14
    '            root.val = minNode.val',                               // 15
    '            root.right = self.deleteNode(root.right, minNode.val)', // 16
    '        return root',                                              // 17
    '    def findMin(self, node: TreeNode) -> TreeNode:',               // 18
    '        while node.left:',                                         // 19
    '            node = node.left',                                     // 20
    '        return node',                                              // 21
  ],
  javascript: [
    'var deleteNode = function(root, key) {',                           // 1
    '    if (!root) return null;',                                      // 2
    '    if (key < root.val) {',                                        // 3
    '        root.left = deleteNode(root.left, key);',                  // 4
    '    } else if (key > root.val) {',                                 // 5
    '        root.right = deleteNode(root.right, key);',                 // 6
    '    } else {',                                                     // 7
    '        if (!root.left) return root.right;',                       // 8
    '        if (!root.right) return root.left;',                       // 9
    '        let minNode = findMin(root.right);',                       // 10
    '        root.val = minNode.val;',                                  // 11
    '        root.right = deleteNode(root.right, minNode.val);',        // 12
    '    }',                                                            // 13
    '    return root;',                                                 // 14
    '};',                                                               // 15
    'function findMin(node) {',                                         // 16
    '    while (node.left) node = node.left;',                          // 17
    '    return node;',                                                 // 18
    '}',                                                                // 19
  ],
};

export const BST_DELETE_STAGE2_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  baseNull: { java: 3, cpp: 4, python: [3, 4], javascript: 2 },
  searchLeft: { java: 5, cpp: 6, python: 6, javascript: 4 },
  searchRight: { java: 7, cpp: 8, python: 8, javascript: 6 },
  foundMatch: { java: 8, cpp: 9, python: 9, javascript: 7 },
  leftNull: { java: 9, cpp: 10, python: [10, 11], javascript: 8 },
  rightNull: { java: 10, cpp: 11, python: [12, 13], javascript: 9 },
  findMinCall: { java: 11, cpp: 12, python: 14, javascript: 10 },
  findMinLoop: { java: 18, cpp: 19, python: [19, 20], javascript: 17 },
  replaceVal: { java: 12, cpp: 13, python: 15, javascript: 11 },
  deleteSuccessor: { java: 13, cpp: 14, python: 16, javascript: 12 },
  returnRoot: { java: 15, cpp: 16, python: 17, javascript: 14 },
  done: { java: 15, cpp: 16, python: 17, javascript: 14 },
};

// ============================================================
// Stage 3: 双指针显式迭代删除 (Iterative Two-Pointers BST Deletion)
// ============================================================
export const BST_DELETE_STAGE3_ITERATIVE_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                          // 1
    '    public TreeNode deleteNode(TreeNode root, int key) {',          // 2
    '        TreeNode cur = root, pre = null;',                         // 3
    '        while (cur != null && cur.val != key) {',                  // 4
    '            pre = cur;',                                           // 5
    '            if (key < cur.val) cur = cur.left;',                   // 6
    '            else cur = cur.right;',                                // 7
    '        }',                                                        // 8
    '        if (cur == null) return root; // 未命中目标节点',          // 9
    '        if (pre == null) return deleteOneNode(cur); // 目标是根节点', // 10
    '        if (pre.left == cur) pre.left = deleteOneNode(cur);',      // 11
    '        else pre.right = deleteOneNode(cur);',                     // 12
    '        return root;',                                             // 13
    '    }',                                                            // 14
    '    private TreeNode deleteOneNode(TreeNode target) {',            // 15
    '        if (target.left == null) return target.right;',            // 16
    '        if (target.right == null) return target.left;',            // 17
    '        TreeNode s = target.right;',                               // 18
    '        while (s.left != null) s = s.left;',                       // 19
    '        s.left = target.left;',                                    // 20
    '        return target.right;',                                     // 21
    '    }',                                                            // 22
    '}',                                                                // 23
  ],
  cpp: [
    'class Solution {',                                                 // 1
    'public:',                                                          // 2
    '    TreeNode* deleteNode(TreeNode* root, int key) {',              // 3
    '        TreeNode *cur = root, *pre = nullptr;',                    // 4
    '        while (cur && cur->val != key) {',                         // 5
    '            pre = cur;',                                           // 6
    '            if (key < cur->val) cur = cur->left;',                 // 7
    '            else cur = cur->right;',                               // 8
    '        }',                                                        // 9
    '        if (!cur) return root;',                                   // 10
    '        if (!pre) return deleteOneNode(cur);',                     // 11
    '        if (pre->left == cur) pre->left = deleteOneNode(cur);',    // 12
    '        else pre->right = deleteOneNode(cur);',                    // 13
    '        return root;',                                             // 14
    '    }',                                                            // 15
    '    TreeNode* deleteOneNode(TreeNode* target) {',                  // 16
    '        if (!target->left) return target->right;',                 // 17
    '        if (!target->right) return target->left;',                 // 18
    '        TreeNode* s = target->right;',                             // 19
    '        while (s->left) s = s->left;',                             // 20
    '        s->left = target->left;',                                  // 21
    '        return target->right;',                                    // 22
    '    }',                                                            // 23
    '};',                                                               // 24
  ],
  python: [
    'class Solution:',                                                  // 1
    '    def deleteNode(self, root: Optional[TreeNode], key: int) -> Optional[TreeNode]:', // 2
    '        cur, pre = root, None',                                    // 3
    '        while cur and cur.val != key:',                            // 4
    '            pre = cur',                                            // 5
    '            if key < cur.val: cur = cur.left',                     // 6
    '            else: cur = cur.right',                                // 7
    '        if not cur: return root',                                  // 8
    '        if not pre: return self.deleteOneNode(cur)',               // 9
    '        if pre.left == cur: pre.left = self.deleteOneNode(cur)',   // 10
    '        else: pre.right = self.deleteOneNode(cur)',                // 11
    '        return root',                                              // 12
    '    def deleteOneNode(self, target: TreeNode) -> Optional[TreeNode]:', // 13
    '        if not target.left: return target.right',                  // 14
    '        if not target.right: return target.left',                  // 15
    '        s = target.right',                                         // 16
    '        while s.left: s = s.left',                                 // 17
    '        s.left = target.left',                                     // 18
    '        return target.right',                                      // 19
  ],
  javascript: [
    'var deleteNode = function(root, key) {',                           // 1
    '    let cur = root, pre = null;',                                  // 2
    '    while (cur && cur.val !== key) {',                             // 3
    '        pre = cur;',                                               // 4
    '        if (key < cur.val) cur = cur.left;',                       // 5
    '        else cur = cur.right;',                                    // 6
    '    }',                                                            // 7
    '    if (!cur) return root;',                                       // 8
    '    if (!pre) return deleteOneNode(cur);',                         // 9
    '    if (pre.left === cur) pre.left = deleteOneNode(cur);',         // 10
    '    else pre.right = deleteOneNode(cur);',                         // 11
    '    return root;',                                                 // 12
    '};',                                                               // 13
    'function deleteOneNode(target) {',                                 // 14
    '    if (!target.left) return target.right;',                       // 15
    '    if (!target.right) return target.left;',                       // 16
    '    let s = target.right;',                                        // 17
    '    while (s.left) s = s.left;',                                   // 18
    '    s.left = target.left;',                                        // 19
    '    return target.right;',                                         // 20
    '}',                                                                // 21
  ],
};

export const BST_DELETE_STAGE3_LINES = {
  init: { java: 3, cpp: 4, python: 3, javascript: 2 },
  whileCheck: { java: 4, cpp: 5, python: 4, javascript: 3 },
  stepLeft: { java: 6, cpp: 7, python: 6, javascript: 5 },
  stepRight: { java: 7, cpp: 8, python: 7, javascript: 6 },
  notFound: { java: 9, cpp: 10, python: 8, javascript: 8 },
  matchRoot: { java: 10, cpp: 11, python: 9, javascript: 9 },
  matchLeft: { java: 11, cpp: 12, python: 10, javascript: 10 },
  matchRight: { java: 12, cpp: 13, python: 11, javascript: 11 },
  deleteLeftNull: { java: 16, cpp: 17, python: 14, javascript: 15 },
  deleteRightNull: { java: 17, cpp: 18, python: 15, javascript: 16 },
  deleteGraft: { java: 20, cpp: 21, python: 18, javascript: 19 },
  returnTargetRight: { java: 21, cpp: 22, python: 19, javascript: 20 },
  done: { java: 13, cpp: 14, python: 12, javascript: 12 },
};
