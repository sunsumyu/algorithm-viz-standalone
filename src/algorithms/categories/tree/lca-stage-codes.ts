/**
 * 二叉树的最近公共祖先 (Lowest Common Ancestor of a Binary Tree · LeetCode 236 / Class 037 Code04)
 * 多阶段演化四语言代码模板与精准 1-Based 行号映射
 *
 * Stage 1: 递归后序汇聚 (Recursive Postorder DFS · 左右子树汇聚返回)
 * Stage 2: 父节点哈希表遍历 (Parent Pointer Hash Map · 回溯路径集合重合)
 * Stage 3: 根到节点显式路径比对 (Root-to-Node Path Trace & Intersection · 分叉前夕判定)
 */

// ============================================================
// Stage 1: 递归后序汇聚 (Recursive Postorder DFS · LC 236)
// ============================================================
export const LCA_STAGE1_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                          // 1
    '    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {', // 2
    '        if (root == null || root == p || root == q) return root;', // 3
    '        TreeNode left = lowestCommonAncestor(root.left, p, q);',   // 4
    '        TreeNode right = lowestCommonAncestor(root.right, p, q);', // 5
    '        if (left != null && right != null) return root; // p, q 分属两侧', // 6
    '        return left != null ? left : right;',                      // 7
    '    }',                                                            // 8
    '}',                                                                // 9
  ],
  cpp: [
    'class Solution {',                                                 // 1
    'public:',                                                          // 2
    '    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {', // 3
    '        if (!root || root == p || root == q) return root;',        // 4
    '        TreeNode* left = lowestCommonAncestor(root->left, p, q);', // 5
    '        TreeNode* right = lowestCommonAncestor(root->right, p, q);', // 6
    '        if (left && right) return root;',                          // 7
    '        return left ? left : right;',                              // 8
    '    }',                                                            // 9
    '};',                                                               // 10
  ],
  python: [
    'class Solution:',                                                  // 1
    '    def lowestCommonAncestor(self, root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:', // 2
    '        if not root or root == p or root == q:',                   // 3
    '            return root',                                          // 4
    '        left = self.lowestCommonAncestor(root.left, p, q)',        // 5
    '        right = self.lowestCommonAncestor(root.right, p, q)',      // 6
    '        if left and right:',                                       // 7
    '            return root',                                          // 8
    '        return left if left else right',                           // 9
  ],
  javascript: [
    'var lowestCommonAncestor = function(root, p, q) {',               // 1
    '    if (!root || root === p || root === q) return root;',          // 2
    '    const left = lowestCommonAncestor(root.left, p, q);',          // 3
    '    const right = lowestCommonAncestor(root.right, p, q);',        // 4
    '    if (left && right) return root;',                              // 5
    '    return left ? left : right;',                                  // 6
    '};',                                                               // 7
  ],
};

export const LCA_STAGE1_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  baseCheck: { java: 3, cpp: 4, python: [3, 4], javascript: 2 },
  leftCall: { java: 4, cpp: 5, python: 5, javascript: 3 },
  rightCall: { java: 5, cpp: 6, python: 6, javascript: 4 },
  splitLCA: { java: 6, cpp: 7, python: [7, 8], javascript: 5 },
  singlePass: { java: 7, cpp: 8, python: 9, javascript: 6 },
  done: { java: 7, cpp: 8, python: 9, javascript: 6 },
};

// ============================================================
// Stage 2: 父节点哈希表遍历 (Parent Pointer Hash Map)
// ============================================================
export const LCA_STAGE2_PARENT_MAP_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                          // 1
    '    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {', // 2
    '        Map<Integer, TreeNode> parent = new HashMap<>();',         // 3
    '        Set<Integer> visited = new HashSet<>();',                  // 4
    '        Queue<TreeNode> queue = new LinkedList<>();',              // 5
    '        parent.put(root.val, null);',                              // 6
    '        queue.offer(root);',                                       // 7
    '        while (!parent.containsKey(p.val) || !parent.containsKey(q.val)) {', // 8
    '            TreeNode cur = queue.poll();',                         // 9
    '            if (cur.left != null) {',                              // 10
    '                parent.put(cur.left.val, cur);',                   // 11
    '                queue.offer(cur.left);',                           // 12
    '            }',                                                    // 13
    '            if (cur.right != null) {',                             // 14
    '                parent.put(cur.right.val, cur);',                  // 15
    '                queue.offer(cur.right);',                          // 16
    '            }',                                                    // 17
    '        }',                                                        // 18
    '        while (p != null) {',                                      // 19
    '            visited.add(p.val);',                                  // 20
    '            p = parent.get(p.val);',                               // 21
    '        }',                                                        // 22
    '        while (q != null) {',                                      // 23
    '            if (visited.contains(q.val)) return q;',               // 24
    '            q = parent.get(q.val);',                               // 25
    '        }',                                                        // 26
    '        return null;',                                             // 27
    '    }',                                                            // 28
    '}',                                                                // 29
  ],
  cpp: [
    'class Solution {',                                                 // 1
    'public:',                                                          // 2
    '    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {', // 3
    '        unordered_map<int, TreeNode*> parent;',                    // 4
    '        unordered_set<int> visited;',                              // 5
    '        queue<TreeNode*> qTree;',                                  // 6
    '        parent[root->val] = nullptr;',                             // 7
    '        qTree.push(root);',                                        // 8
    '        while (parent.find(p->val) == parent.end() || parent.find(q->val) == parent.end()) {', // 9
    '            TreeNode* cur = qTree.front();',                       // 10
    '            qTree.pop();',                                         // 11
    '            if (cur->left) {',                                     // 12
    '                parent[cur->left->val] = cur;',                    // 13
    '                qTree.push(cur->left);',                           // 14
    '            }',                                                    // 15
    '            if (cur->right) {',                                    // 16
    '                parent[cur->right->val] = cur;',                   // 17
    '                qTree.push(cur->right);',                          // 18
    '            }',                                                    // 19
    '        }',                                                        // 20
    '        while (p) {',                                              // 21
    '            visited.insert(p->val);',                              // 22
    '            p = parent[p->val];',                                  // 23
    '        }',                                                        // 24
    '        while (q) {',                                              // 25
    '            if (visited.count(q->val)) return q;',                 // 26
    '            q = parent[q->val];',                                  // 27
    '        }',                                                        // 28
    '        return nullptr;',                                          // 29
    '    }',                                                            // 30
    '};',                                                               // 31
  ],
  python: [
    'class Solution:',                                                  // 1
    '    def lowestCommonAncestor(self, root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:', // 2
    '        parent = {root.val: None}',                                // 3
    '        visited = set()',                                          // 4
    '        queue = collections.deque([root])',                        // 5
    '        while p.val not in parent or q.val not in parent:',        // 6
    '            cur = queue.popleft()',                                // 7
    '            if cur.left:',                                         // 8
    '                parent[cur.left.val] = cur',                       // 9
    '                queue.append(cur.left)',                           // 10
    '            if cur.right:',                                        // 11
    '                parent[cur.right.val] = cur',                      // 12
    '                queue.append(cur.right)',                          // 13
    '        while p:',                                                 // 14
    '            visited.add(p.val)',                                   // 15
    '            p = parent[p.val]',                                    // 16
    '        while q:',                                                 // 17
    '            if q.val in visited:',                                 // 18
    '                return q',                                         // 19
    '            q = parent[q.val]',                                    // 20
    '        return None',                                              // 21
  ],
  javascript: [
    'var lowestCommonAncestor = function(root, p, q) {',               // 1
    '    const parent = new Map();',                                    // 2
    '    const visited = new Set();',                                   // 3
    '    const queue = [root];',                                        // 4
    '    parent.set(root.val, null);',                                  // 5
    '    while (!parent.has(p.val) || !parent.has(q.val)) {',           // 6
    '        const cur = queue.shift();',                               // 7
    '        if (cur.left) {',                                          // 8
    '            parent.set(cur.left.val, cur);',                       // 9
    '            queue.push(cur.left);',                                // 10
    '        }',                                                        // 11
    '        if (cur.right) {',                                         // 12
    '            parent.set(cur.right.val, cur);',                      // 13
    '            queue.push(cur.right);',                               // 14
    '        }',                                                        // 15
    '    }',                                                            // 16
    '    let pNode = p;',                                               // 17
    '    while (pNode) {',                                              // 18
    '        visited.add(pNode.val);',                                  // 19
    '        pNode = parent.get(pNode.val);',                          // 20
    '    }',                                                            // 21
    '    let qNode = q;',                                               // 22
    '    while (qNode) {',                                              // 23
    '        if (visited.has(qNode.val)) return qNode;',                // 24
    '        qNode = parent.get(qNode.val);',                          // 25
    '    }',                                                            // 26
    '    return null;',                                                 // 27
    '};',                                                               // 28
  ],
};

export const LCA_STAGE2_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  init: { java: 6, cpp: 7, python: 3, javascript: 5 },
  whileBfs: { java: 8, cpp: 9, python: 6, javascript: 6 },
  poll: { java: 9, cpp: 10, python: 7, javascript: 7 },
  expandLeft: { java: 11, cpp: 13, python: 9, javascript: 9 },
  expandRight: { java: 15, cpp: 17, python: 12, javascript: 13 },
  traceP: { java: 20, cpp: 22, python: 15, javascript: 19 },
  traceQ: { java: 24, cpp: 26, python: 18, javascript: 24 },
  done: { java: 24, cpp: 26, python: 18, javascript: 24 },
};

// ============================================================
// Stage 3: 根到节点显式路径比对 (Root-to-Node Path Trace & Intersection)
// ============================================================
export const LCA_STAGE3_PATH_TRACE_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                          // 1
    '    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {', // 2
    '        List<TreeNode> pathP = new ArrayList<>();',                // 3
    '        List<TreeNode> pathQ = new ArrayList<>();',                // 4
    '        findPath(root, p, pathP);',                                // 5
    '        findPath(root, q, pathQ);',                                // 6
    '        TreeNode lca = null;',                                     // 7
    '        for (int i = 0; i < pathP.size() && i < pathQ.size(); i++) {', // 8
    '            if (pathP.get(i) == pathQ.get(i)) {',                  // 9
    '                lca = pathP.get(i);',                              // 10
    '            } else {',                                             // 11
    '                break;',                                           // 12
    '            }',                                                    // 13
    '        }',                                                        // 14
    '        return lca;',                                              // 15
    '    }',                                                            // 16
    '    private boolean findPath(TreeNode node, TreeNode target, List<TreeNode> path) {', // 17
    '        if (node == null) return false;',                          // 18
    '        path.add(node);',                                          // 19
    '        if (node == target) return true;',                         // 20
    '        if (findPath(node.left, target, path) || findPath(node.right, target, path)) {', // 21
    '            return true;',                                         // 22
    '        }',                                                        // 23
    '        path.remove(path.size() - 1); // 现场回溯恢复',            // 24
    '        return false;',                                            // 25
    '    }',                                                            // 26
    '}',                                                                // 27
  ],
  cpp: [
    'class Solution {',                                                 // 1
    'public:',                                                          // 2
    '    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {', // 3
    '        vector<TreeNode*> pathP, pathQ;',                          // 4
    '        findPath(root, p, pathP);',                                // 5
    '        findPath(root, q, pathQ);',                                // 6
    '        TreeNode* lca = nullptr;',                                 // 7
    '        for (int i = 0; i < pathP.size() && i < pathQ.size(); ++i) {', // 8
    '            if (pathP[i] == pathQ[i]) {',                          // 9
    '                lca = pathP[i];',                                  // 10
    '            } else {',                                             // 11
    '                break;',                                           // 12
    '            }',                                                    // 13
    '        }',                                                        // 14
    '        return lca;',                                              // 15
    '    }',                                                            // 16
    '    bool findPath(TreeNode* node, TreeNode* target, vector<TreeNode*>& path) {', // 17
    '        if (!node) return false;',                                 // 18
    '        path.push_back(node);',                                    // 19
    '        if (node == target) return true;',                         // 20
    '        if (findPath(node->left, target, path) || findPath(node->right, target, path)) {', // 21
    '            return true;',                                         // 22
    '        }',                                                        // 23
    '        path.pop_back();',                                         // 24
    '        return false;',                                            // 25
    '    }',                                                            // 26
    '};',                                                               // 27
  ],
  python: [
    'class Solution:',                                                  // 1
    '    def lowestCommonAncestor(self, root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:', // 2
    '        pathP, pathQ = [], []',                                    // 3
    '        def findPath(node, target, path):',                        // 4
    '            if not node:',                                         // 5
    '                return False',                                     // 6
    '            path.append(node)',                                    // 7
    '            if node == target:',                                   // 8
    '                return True',                                      // 9
    '            if findPath(node.left, target, path) or findPath(node.right, target, path):', // 10
    '                return True',                                      // 11
    '            path.pop()',                                           // 12
    '            return False',                                         // 13
    '        findPath(root, p, pathP)',                                 // 14
    '        findPath(root, q, pathQ)',                                 // 15
    '        lca = None',                                               // 16
    '        for u, v in zip(pathP, pathQ):',                           // 17
    '            if u == v:',                                           // 18
    '                lca = u',                                          // 19
    '            else:',                                                // 20
    '                break',                                            // 21
    '        return lca',                                               // 22
  ],
  javascript: [
    'var lowestCommonAncestor = function(root, p, q) {',               // 1
    '    const pathP = [];',                                            // 2
    '    const pathQ = [];',                                            // 3
    '    function findPath(node, target, path) {',                      // 4
    '        if (!node) return false;',                                 // 5
    '        path.push(node);',                                         // 6
    '        if (node === target) return true;',                        // 7
    '        if (findPath(node.left, target, path) || findPath(node.right, target, path)) {', // 8
    '            return true;',                                         // 9
    '        }',                                                        // 10
    '        path.pop();',                                              // 11
    '        return false;',                                            // 12
    '    }',                                                            // 13
    '    findPath(root, p, pathP);',                                    // 14
    '    findPath(root, q, pathQ);',                                    // 15
    '    let lca = null;',                                              // 16
    '    for (let i = 0; i < pathP.length && i < pathQ.length; i++) {', // 17
    '        if (pathP[i] === pathQ[i]) {',                             // 18
    '            lca = pathP[i];',                                      // 19
    '        } else {',                                                 // 20
    '            break;',                                               // 21
    '        }',                                                        // 22
    '    }',                                                            // 23
    '    return lca;',                                                  // 24
    '};',                                                               // 25
  ],
};

export const LCA_STAGE3_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  findPathP: { java: 5, cpp: 5, python: 14, javascript: 14 },
  pathPush: { java: 19, cpp: 19, python: 7, javascript: 6 },
  pathHit: { java: 20, cpp: 20, python: 8, javascript: 7 },
  pathPop: { java: 24, cpp: 24, python: 12, javascript: 11 },
  findPathQ: { java: 6, cpp: 6, python: 15, javascript: 15 },
  comparePaths: { java: 8, cpp: 8, python: 17, javascript: 17 },
  match: { java: 10, cpp: 10, python: 19, javascript: 19 },
  diverge: { java: 12, cpp: 12, python: 21, javascript: 21 },
  done: { java: 15, cpp: 15, python: 22, javascript: 24 },
};
