/**
 * 二叉树前中后序遍历 — 多阶段演化四语言代码模板
 *
 * Stage 1: 递归遍历 (Recursive DFS) — 保留原 tree-traversal-problem-content.ts 中的代码
 * Stage 2: 迭代栈遍历 (Iterative Stack) — 显式栈模拟递归
 */

// ============================================================
// Stage 1: 递归遍历四语言代码（按 mode 分组）
// ============================================================
export const TRAVERSAL_STAGE1_CODES: Record<string, Record<string, string[]>> = {
  pre: {
    java: [
      'public void preorder(TreeNode root, List<Integer> res) {',  // 1
      '    if (root == null) return;',                              // 2
      '    res.add(root.val);',                                     // 3
      '    preorder(root.left, res);',                              // 4
      '    preorder(root.right, res);',                             // 5
      '}',                                                          // 6
    ],
    cpp: [
      'void preorder(TreeNode* root, vector<int>& res) {',         // 1
      '    if (!root) return;',                                     // 2
      '    res.push_back(root->val);',                              // 3
      '    preorder(root->left, res);',                             // 4
      '    preorder(root->right, res);',                            // 5
      '}',                                                          // 6
    ],
    python: [
      'def preorder(root, res):',                                   // 1
      '    if not root: return',                                    // 2
      '    res.append(root.val)',                                   // 3
      '    preorder(root.left, res)',                               // 4
      '    preorder(root.right, res)',                              // 5
    ],
    javascript: [
      'function preorder(root, res = []) {',                       // 1
      '    if (!root) return res;',                                // 2
      '    res.push(root.val);',                                   // 3
      '    preorder(root.left, res);',                             // 4
      '    preorder(root.right, res);',                            // 5
      '    return res;',                                           // 6
      '}',                                                         // 7
    ],
  },
  in: {
    java: [
      'public void inorder(TreeNode root, List<Integer> res) {',   // 1
      '    if (root == null) return;',                              // 2
      '    inorder(root.left, res);',                               // 3
      '    res.add(root.val);',                                     // 4
      '    inorder(root.right, res);',                              // 5
      '}',                                                          // 6
    ],
    cpp: [
      'void inorder(TreeNode* root, vector<int>& res) {',         // 1
      '    if (!root) return;',                                     // 2
      '    inorder(root->left, res);',                              // 3
      '    res.push_back(root->val);',                              // 4
      '    inorder(root->right, res);',                             // 5
      '}',                                                          // 6
    ],
    python: [
      'def inorder(root, res):',                                    // 1
      '    if not root: return',                                    // 2
      '    inorder(root.left, res)',                                // 3
      '    res.append(root.val)',                                   // 4
      '    inorder(root.right, res)',                               // 5
    ],
    javascript: [
      'function inorder(root, res = []) {',                        // 1
      '    if (!root) return res;',                                // 2
      '    inorder(root.left, res);',                              // 3
      '    res.push(root.val);',                                   // 4
      '    inorder(root.right, res);',                             // 5
      '    return res;',                                           // 6
      '}',                                                         // 7
    ],
  },
  post: {
    java: [
      'public void postorder(TreeNode root, List<Integer> res) {', // 1
      '    if (root == null) return;',                              // 2
      '    postorder(root.left, res);',                             // 3
      '    postorder(root.right, res);',                            // 4
      '    res.add(root.val);',                                     // 5
      '}',                                                          // 6
    ],
    cpp: [
      'void postorder(TreeNode* root, vector<int>& res) {',       // 1
      '    if (!root) return;',                                     // 2
      '    postorder(root->left, res);',                            // 3
      '    postorder(root->right, res);',                           // 4
      '    res.push_back(root->val);',                              // 5
      '}',                                                          // 6
    ],
    python: [
      'def postorder(root, res):',                                  // 1
      '    if not root: return',                                    // 2
      '    postorder(root.left, res)',                              // 3
      '    postorder(root.right, res)',                             // 4
      '    res.append(root.val)',                                   // 5
    ],
    javascript: [
      'function postorder(root, res = []) {',                      // 1
      '    if (!root) return res;',                                // 2
      '    postorder(root.left, res);',                            // 3
      '    postorder(root.right, res);',                           // 4
      '    res.push(root.val);',                                   // 5
      '    return res;',                                           // 6
      '}',                                                         // 7
    ],
  },
};

/** Stage 1 递归行号字典 */
export const TRAVERSAL_STAGE1_LINES = {
  pre: {
    init:  { java: 1, cpp: 1, python: 1, javascript: 1 },
    empty: { java: 2, cpp: 2, python: 2, javascript: 2 },
    enter: { java: 2, cpp: 2, python: 2, javascript: 2 },
    visit: { java: 3, cpp: 3, python: 3, javascript: 3 },
    left:  { java: 4, cpp: 4, python: 4, javascript: 4 },
    right: { java: 5, cpp: 5, python: 5, javascript: 5 },
    leave: { java: 5, cpp: 5, python: 5, javascript: 5 },
  },
  in: {
    init:  { java: 1, cpp: 1, python: 1, javascript: 1 },
    empty: { java: 2, cpp: 2, python: 2, javascript: 2 },
    enter: { java: 2, cpp: 2, python: 2, javascript: 2 },
    left:  { java: 3, cpp: 3, python: 3, javascript: 3 },
    visit: { java: 4, cpp: 4, python: 4, javascript: 4 },
    right: { java: 5, cpp: 5, python: 5, javascript: 5 },
    leave: { java: 5, cpp: 5, python: 5, javascript: 5 },
  },
  post: {
    init:  { java: 1, cpp: 1, python: 1, javascript: 1 },
    empty: { java: 2, cpp: 2, python: 2, javascript: 2 },
    enter: { java: 2, cpp: 2, python: 2, javascript: 2 },
    left:  { java: 3, cpp: 3, python: 3, javascript: 3 },
    right: { java: 4, cpp: 4, python: 4, javascript: 4 },
    visit: { java: 5, cpp: 5, python: 5, javascript: 5 },
    leave: { java: 5, cpp: 5, python: 5, javascript: 5 },
  },
};

// ============================================================
// Stage 2: 迭代栈遍历四语言代码（按 mode 分组）
// ============================================================
export const TRAVERSAL_STAGE2_CODES: Record<string, Record<string, string[]>> = {
  pre: {
    java: [
      'public List<Integer> preorderIterative(TreeNode root) {',    // 1
      '    List<Integer> ans = new ArrayList<>();',                  // 2
      '    if (root == null) return ans;',                           // 3
      '    Stack<TreeNode> stack = new Stack<>();',                  // 4
      '    stack.push(root);',                                       // 5
      '    while (!stack.isEmpty()) {',                              // 6
      '        TreeNode cur = stack.pop();',                         // 7
      '        ans.add(cur.val);',                                   // 8
      '        if (cur.right != null) stack.push(cur.right);',       // 9
      '        if (cur.left != null) stack.push(cur.left);',        // 10
      '    }',                                                       // 11
      '    return ans;',                                             // 12
      '}',                                                           // 13
    ],
    cpp: [
      'vector<int> preorderIterative(TreeNode* root) {',            // 1
      '    vector<int> ans;',                                        // 2
      '    if (!root) return ans;',                                  // 3
      '    stack<TreeNode*> st;',                                    // 4
      '    st.push(root);',                                          // 5
      '    while (!st.empty()) {',                                   // 6
      '        TreeNode* cur = st.top(); st.pop();',                 // 7
      '        ans.push_back(cur->val);',                            // 8
      '        if (cur->right) st.push(cur->right);',                // 9
      '        if (cur->left) st.push(cur->left);',                 // 10
      '    }',                                                       // 11
      '    return ans;',                                             // 12
      '}',                                                           // 13
    ],
    python: [
      'def preorder_iterative(root):',                               // 1
      '    if not root: return []',                                  // 2
      '    ans, stack = [], [root]',                                 // 3
      '    while stack:',                                            // 4
      '        cur = stack.pop()',                                   // 5
      '        ans.append(cur.val)',                                 // 6
      '        if cur.right: stack.append(cur.right)',               // 7
      '        if cur.left: stack.append(cur.left)',                 // 8
      '    return ans',                                              // 9
    ],
    javascript: [
      'function preorderIterative(root) {',                          // 1
      '    if (!root) return [];',                                   // 2
      '    const ans = [], stack = [root];',                         // 3
      '    while (stack.length > 0) {',                              // 4
      '        const cur = stack.pop();',                            // 5
      '        ans.push(cur.val);',                                  // 6
      '        if (cur.right) stack.push(cur.right);',               // 7
      '        if (cur.left) stack.push(cur.left);',                // 8
      '    }',                                                       // 9
      '    return ans;',                                             // 10
      '}',                                                           // 11
    ],
  },
  in: {
    java: [
      'public List<Integer> inorderIterative(TreeNode root) {',     // 1
      '    List<Integer> ans = new ArrayList<>();',                  // 2
      '    Stack<TreeNode> stack = new Stack<>();',                  // 3
      '    TreeNode cur = root;',                                    // 4
      '    while (!stack.isEmpty() || cur != null) {',               // 5
      '        if (cur != null) {',                                  // 6
      '            stack.push(cur);',                                // 7
      '            cur = cur.left;',                                 // 8
      '        } else {',                                            // 9
      '            cur = stack.pop();',                              // 10
      '            ans.add(cur.val);',                               // 11
      '            cur = cur.right;',                                // 12
      '        }',                                                   // 13
      '    }',                                                       // 14
      '    return ans;',                                             // 15
      '}',                                                           // 16
    ],
    cpp: [
      'vector<int> inorderIterative(TreeNode* root) {',             // 1
      '    vector<int> ans;',                                        // 2
      '    stack<TreeNode*> st;',                                    // 3
      '    TreeNode* cur = root;',                                   // 4
      '    while (!st.empty() || cur) {',                            // 5
      '        if (cur) {',                                          // 6
      '            st.push(cur);',                                   // 7
      '            cur = cur->left;',                                // 8
      '        } else {',                                            // 9
      '            cur = st.top(); st.pop();',                       // 10
      '            ans.push_back(cur->val);',                        // 11
      '            cur = cur->right;',                               // 12
      '        }',                                                   // 13
      '    }',                                                       // 14
      '    return ans;',                                             // 15
      '}',                                                           // 16
    ],
    python: [
      'def inorder_iterative(root):',                                // 1
      '    ans, stack, cur = [], [], root',                          // 2
      '    while stack or cur:',                                     // 3
      '        if cur:',                                             // 4
      '            stack.append(cur)',                               // 5
      '            cur = cur.left',                                  // 6
      '        else:',                                               // 7
      '            cur = stack.pop()',                               // 8
      '            ans.append(cur.val)',                             // 9
      '            cur = cur.right',                                // 10
      '    return ans',                                              // 11
    ],
    javascript: [
      'function inorderIterative(root) {',                           // 1
      '    const ans = [], stack = [];',                             // 2
      '    let cur = root;',                                         // 3
      '    while (stack.length > 0 || cur) {',                       // 4
      '        if (cur) {',                                          // 5
      '            stack.push(cur);',                                // 6
      '            cur = cur.left;',                                 // 7
      '        } else {',                                            // 8
      '            cur = stack.pop();',                              // 9
      '            ans.push(cur.val);',                              // 10
      '            cur = cur.right;',                                // 11
      '        }',                                                   // 12
      '    }',                                                       // 13
      '    return ans;',                                             // 14
      '}',                                                           // 15
    ],
  },
  post: {
    java: [
      'public List<Integer> postorderIterative(TreeNode root) {',   // 1
      '    List<Integer> ans = new ArrayList<>();',                  // 2
      '    if (root == null) return ans;',                           // 3
      '    Stack<TreeNode> s1 = new Stack<>(), s2 = new Stack<>();', // 4
      '    s1.push(root);',                                          // 5
      '    while (!s1.isEmpty()) {',                                 // 6
      '        TreeNode cur = s1.pop();',                            // 7
      '        s2.push(cur);',                                       // 8
      '        if (cur.left != null) s1.push(cur.left);',           // 9
      '        if (cur.right != null) s1.push(cur.right);',         // 10
      '    }',                                                       // 11
      '    while (!s2.isEmpty()) ans.add(s2.pop().val);',           // 12
      '    return ans;',                                             // 13
      '}',                                                           // 14
    ],
    cpp: [
      'vector<int> postorderIterative(TreeNode* root) {',           // 1
      '    vector<int> ans;',                                        // 2
      '    if (!root) return ans;',                                  // 3
      '    stack<TreeNode*> s1, s2;',                                // 4
      '    s1.push(root);',                                          // 5
      '    while (!s1.empty()) {',                                   // 6
      '        TreeNode* cur = s1.top(); s1.pop();',                 // 7
      '        s2.push(cur);',                                       // 8
      '        if (cur->left) s1.push(cur->left);',                 // 9
      '        if (cur->right) s1.push(cur->right);',               // 10
      '    }',                                                       // 11
      '    while (!s2.empty()) { ans.push_back(s2.top()->val); s2.pop(); }', // 12
      '    return ans;',                                             // 13
      '}',                                                           // 14
    ],
    python: [
      'def postorder_iterative(root):',                              // 1
      '    if not root: return []',                                  // 2
      '    s1, s2 = [root], []',                                    // 3
      '    while s1:',                                               // 4
      '        cur = s1.pop()',                                     // 5
      '        s2.append(cur.val)',                                 // 6
      '        if cur.left: s1.append(cur.left)',                   // 7
      '        if cur.right: s1.append(cur.right)',                 // 8
      '    return s2[::-1]',                                         // 9
    ],
    javascript: [
      'function postorderIterative(root) {',                         // 1
      '    if (!root) return [];',                                   // 2
      '    const s1 = [root], s2 = [];',                            // 3
      '    while (s1.length > 0) {',                                 // 4
      '        const cur = s1.pop();',                               // 5
      '        s2.push(cur.val);',                                   // 6
      '        if (cur.left) s1.push(cur.left);',                   // 7
      '        if (cur.right) s1.push(cur.right);',                 // 8
      '    }',                                                       // 9
      '    return s2.reverse();',                                    // 10
      '}',                                                           // 11
    ],
  },
};

/** Stage 2 迭代行号字典 */
export const TRAVERSAL_STAGE2_LINES = {
  pre: {
    entry:     { java: 1,  cpp: 1,  python: 1, javascript: 1 },
    init:      { java: [2, 3, 4, 5], cpp: [2, 3, 4, 5], python: [2, 3], javascript: [2, 3] },
    empty:     { java: 3,  cpp: 3,  python: 2, javascript: 2 },
    popVisit:  { java: [7, 8], cpp: [7, 8], python: [5, 6], javascript: [5, 6] },
    pushRight: { java: 9,  cpp: 9,  python: 7, javascript: 7 },
    pushLeft:  { java: 10, cpp: 10, python: 8, javascript: 8 },
    done:      { java: 12, cpp: 12, python: 9, javascript: 10 },
  },
  in: {
    entry:        { java: 1,  cpp: 1,  python: 1, javascript: 1 },
    init:         { java: [2, 3, 4], cpp: [2, 3, 4], python: 2, javascript: [2, 3] },
    empty:        { java: 1,  cpp: 1,  python: 1, javascript: 1 },
    whileHead:    { java: 5,  cpp: 5,  python: 3, javascript: 4 },
    pushLeft:     { java: [7, 8], cpp: [7, 8], python: [5, 6], javascript: [6, 7] },
    popVisitRight:{ java: [10, 11, 12], cpp: [10, 11, 12], python: [8, 9, 10], javascript: [9, 10, 11] },
    done:         { java: 15, cpp: 15, python: 11, javascript: 14 },
  },
  post: {
    entry:      { java: 1,  cpp: 1,  python: 1, javascript: 1 },
    init:       { java: [2, 3, 4, 5], cpp: [2, 3, 4, 5], python: [2, 3], javascript: [2, 3] },
    empty:      { java: 3,  cpp: 3,  python: 2, javascript: 2 },
    s1PopS2Push:{ java: [7, 8], cpp: [7, 8], python: [5, 6], javascript: [5, 6] },
    pushLeft:   { java: 9,  cpp: 9,  python: 7, javascript: 7 },
    pushRight:  { java: 10, cpp: 10, python: 8, javascript: 8 },
    s2Collect:  { java: 12, cpp: 12, python: 9, javascript: 10 },
    done:       { java: 13, cpp: 13, python: 9, javascript: 10 },
  },
};
