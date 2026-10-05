/**
 * 路径总和 (Path Sum & Path Sum II · LeetCode 112 & 113 / Class 037 Code03)
 * 多阶段演化四语言代码模板与精准 1-Based 行号映射
 *
 * Stage 1: 递归减法回溯 (Recursive Subtraction DFS · 单解判定 LC 112)
 * Stage 2: 回溯现场恢复与全解收集 (Backtracking Path Restoration · 全路径收集 LC 113 / Class 037 Code03)
 * Stage 3: 迭代 BFS 双队列双数组 (Iterative BFS Queues · 广度优先层序求和)
 */

// ============================================================
// Stage 1: 递归减法回溯 (Recursive Subtraction DFS · LC 112)
// ============================================================
export const PATH_SUM_STAGE1_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                          // 1
    '    public boolean hasPathSum(TreeNode root, int targetSum) {',     // 2
    '        if (root == null) return false;',                          // 3
    '        if (root.left == null && root.right == null) {',           // 4
    '            return root.val == targetSum;',                        // 5
    '        }',                                                        // 6
    '        boolean left = hasPathSum(root.left, targetSum - root.val);', // 7
    '        boolean right = hasPathSum(root.right, targetSum - root.val);', // 8
    '        return left || right;',                                    // 9
    '    }',                                                            // 10
    '}',                                                                // 11
  ],
  cpp: [
    'class Solution {',                                                 // 1
    'public:',                                                         // 2
    '    bool hasPathSum(TreeNode* root, int targetSum) {',             // 3
    '        if (!root) return false;',                                 // 4
    '        if (!root->left && !root->right) {',                       // 5
    '            return root->val == targetSum;',                       // 6
    '        }',                                                        // 7
    '        bool left = hasPathSum(root->left, targetSum - root->val);', // 8
    '        bool right = hasPathSum(root->right, targetSum - root->val);', // 9
    '        return left || right;',                                    // 10
    '    }',                                                            // 11
    '};',                                                               // 12
  ],
  python: [
    'class Solution:',                                                  // 1
    '    def hasPathSum(self, root: Optional[TreeNode], targetSum: int) -> bool:', // 2
    '        if not root:',                                             // 3
    '            return False',                                         // 4
    '        if not root.left and not root.right:',                     // 5
    '            return root.val == targetSum',                         // 6
    '        left = self.hasPathSum(root.left, targetSum - root.val)',  // 7
    '        right = self.hasPathSum(root.right, targetSum - root.val)', // 8
    '        return left or right',                                     // 9
  ],
  javascript: [
    'var hasPathSum = function(root, targetSum) {',                     // 1
    '    if (!root) return false;',                                     // 2
    '    if (!root.left && !root.right) {',                             // 3
    '        return root.val === targetSum;',                           // 4
    '    }',                                                            // 5
    '    const left = hasPathSum(root.left, targetSum - root.val);',    // 6
    '    const right = hasPathSum(root.right, targetSum - root.val);',   // 7
    '    return left || right;',                                        // 8
    '};',                                                               // 9
  ],
};

export const PATH_SUM_STAGE1_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  nullCheck: { java: 3, cpp: 4, python: 3, javascript: 2 },
  leafCheck: { java: 4, cpp: 5, python: 5, javascript: 3 },
  match: { java: 5, cpp: 6, python: 6, javascript: 4 },
  recurseLeft: { java: 7, cpp: 8, python: 7, javascript: 6 },
  leftDone: { java: 7, cpp: 8, python: 7, javascript: 6 },
  recurseRight: { java: 8, cpp: 9, python: 8, javascript: 7 },
  rightDone: { java: 8, cpp: 9, python: 8, javascript: 7 },
  combine: { java: 9, cpp: 10, python: 9, javascript: 8 },
  leave: { java: 10, cpp: 11, python: 9, javascript: 9 },
  done: { java: 10, cpp: 11, python: 9, javascript: 9 },
};

// ============================================================
// Stage 2: 回溯现场恢复与全解收集 (Backtracking Path Restoration · LC 113)
// ============================================================
export const PATH_SUM_STAGE2_BACKTRACK_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                          // 1
    '    public List<List<Integer>> pathSum(TreeNode root, int targetSum) {', // 2
    '        List<List<Integer>> ans = new ArrayList<>();',             // 3
    '        if (root == null) return ans;',                           // 4
    '        List<Integer> path = new ArrayList<>();',                  // 5
    '        dfs(root, targetSum, path, ans);',                         // 6
    '        return ans;',                                             // 7
    '    }',                                                            // 8
    '    private void dfs(TreeNode cur, int remain, List<Integer> path, List<List<Integer>> ans) {', // 9
    '        path.add(cur.val);',                                       // 10
    '        remain -= cur.val;',                                       // 11
    '        if (cur.left == null && cur.right == null && remain == 0) {', // 12
    '            ans.add(new ArrayList<>(path));',                      // 13
    '        }',                                                        // 14
    '        if (cur.left != null) dfs(cur.left, remain, path, ans);',  // 15
    '        if (cur.right != null) dfs(cur.right, remain, path, ans);',// 16
    '        path.remove(path.size() - 1); // 现场恢复',                // 17
    '    }',                                                            // 18
    '}',                                                                // 19
  ],
  cpp: [
    'class Solution {',                                                 // 1
    'public:',                                                          // 2
    '    vector<vector<int>> pathSum(TreeNode* root, int targetSum) {', // 3
    '        vector<vector<int>> ans;',                                 // 4
    '        if (!root) return ans;',                                   // 5
    '        vector<int> path;',                                        // 6
    '        dfs(root, targetSum, path, ans);',                         // 7
    '        return ans;',                                              // 8
    '    }',                                                            // 9
    '    void dfs(TreeNode* cur, int remain, vector<int>& path, vector<vector<int>>& ans) {', // 10
    '        path.push_back(cur->val);',                                // 11
    '        remain -= cur->val;',                                      // 12
    '        if (!cur->left && !cur->right && remain == 0) {',          // 13
    '            ans.push_back(path);',                                 // 14
    '        }',                                                        // 15
    '        if (cur->left) dfs(cur->left, remain, path, ans);',        // 16
    '        if (cur->right) dfs(cur->right, remain, path, ans);',      // 17
    '        path.pop_back(); // 现场恢复',                             // 18
    '    }',                                                            // 19
    '};',                                                               // 20
  ],
  python: [
    'class Solution:',                                                  // 1
    '    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> List[List[int]]:', // 2
    '        ans = []',                                                 // 3
    '        if not root: return ans',                                  // 4
    '        path = []',                                                // 5
    '        def dfs(cur, remain):',                                    // 6
    '            path.append(cur.val)',                                 // 7
    '            remain -= cur.val',                                    // 8
    '            if not cur.left and not cur.right and remain == 0:',   // 9
    '                ans.append(list(path))',                           // 10
    '            if cur.left: dfs(cur.left, remain)',                   // 11
    '            if cur.right: dfs(cur.right, remain)',                 // 12
    '            path.pop()  # 现场恢复',                               // 13
    '        dfs(root, targetSum)',                                     // 14
    '        return ans',                                               // 15
  ],
  javascript: [
    'function pathSum(root, targetSum) {',                              // 1
    '    const ans = [];',                                              // 2
    '    if (!root) return ans;',                                       // 3
    '    const path = [];',                                             // 4
    '    function dfs(cur, remain) {',                                  // 5
    '        path.push(cur.val);',                                      // 6
    '        remain -= cur.val;',                                       // 7
    '        if (!cur.left && !cur.right && remain === 0) {',           // 8
    '            ans.push([...path]);',                                 // 9
    '        }',                                                        // 10
    '        if (cur.left) dfs(cur.left, remain);',                     // 11
    '        if (cur.right) dfs(cur.right, remain);',                   // 12
    '        path.pop(); // 现场恢复',                                  // 13
    '    }',                                                            // 14
    '    dfs(root, targetSum);',                                        // 15
    '    return ans;',                                                  // 16
    '}',                                                                // 17
  ],
};

export const PATH_SUM_STAGE2_BACKTRACK_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  nullCheck: { java: 4, cpp: 5, python: 4, javascript: 3 },
  dfsEntry: { java: 10, cpp: 11, python: 7, javascript: 6 },
  leafCheck: { java: 12, cpp: 13, python: 9, javascript: 8 },
  collectPath: { java: 13, cpp: 14, python: 10, javascript: 9 },
  recurseLeft: { java: 15, cpp: 16, python: 11, javascript: 11 },
  recurseRight: { java: 16, cpp: 17, python: 12, javascript: 12 },
  backtrack: { java: 17, cpp: 18, python: 13, javascript: 13 },
  returnAns: { java: 7, cpp: 8, python: 15, javascript: 16 },
};

// ============================================================
// Stage 3: 迭代 BFS 双队列双数组 (Iterative BFS Queues)
// ============================================================
export const PATH_SUM_STAGE3_BFS_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                          // 1
    '    public boolean hasPathSum(TreeNode root, int targetSum) {',     // 2
    '        if (root == null) return false;',                          // 3
    '        Queue<TreeNode> nodeQ = new LinkedList<>();',              // 4
    '        Queue<Integer> sumQ = new LinkedList<>();',                // 5
    '        nodeQ.offer(root);',                                       // 6
    '        sumQ.offer(root.val);',                                    // 7
    '        while (!nodeQ.isEmpty()) {',                               // 8
    '            TreeNode cur = nodeQ.poll();',                         // 9
    '            int curSum = sumQ.poll();',                            // 10
    '            if (cur.left == null && cur.right == null && curSum == targetSum) {', // 11
    '                return true;',                                     // 12
    '            }',                                                    // 13
    '            if (cur.left != null) {',                              // 14
    '                nodeQ.offer(cur.left);',                           // 15
    '                sumQ.offer(curSum + cur.left.val);',               // 16
    '            }',                                                    // 17
    '            if (cur.right != null) {',                             // 18
    '                nodeQ.offer(cur.right);',                          // 19
    '                sumQ.offer(curSum + cur.right.val);',              // 20
    '            }',                                                    // 21
    '        }',                                                        // 22
    '        return false;',                                            // 23
    '    }',                                                            // 24
    '}',                                                                // 25
  ],
  cpp: [
    'class Solution {',                                                 // 1
    'public:',                                                          // 2
    '    bool hasPathSum(TreeNode* root, int targetSum) {',             // 3
    '        if (!root) return false;',                                 // 4
    '        queue<TreeNode*> nodeQ;',                                  // 5
    '        queue<int> sumQ;',                                         // 6
    '        nodeQ.push(root);',                                        // 7
    '        sumQ.push(root->val);',                                    // 8
    '        while (!nodeQ.empty()) {',                                 // 9
    '            TreeNode* cur = nodeQ.front(); nodeQ.pop();',          // 10
    '            int curSum = sumQ.front(); sumQ.pop();',               // 11
    '            if (!cur->left && !cur->right && curSum == targetSum) {', // 12
    '                return true;',                                     // 13
    '            }',                                                    // 14
    '            if (cur->left) {',                                     // 15
    '                nodeQ.push(cur->left);',                           // 16
    '                sumQ.push(curSum + cur->left->val);',              // 17
    '            }',                                                    // 18
    '            if (cur->right) {',                                    // 19
    '                nodeQ.push(cur->right);',                          // 20
    '                sumQ.push(curSum + cur->right->val);',             // 21
    '            }',                                                    // 22
    '        }',                                                        // 23
    '        return false;',                                            // 24
    '    }',                                                            // 25
    '};',                                                               // 26
  ],
  python: [
    'class Solution:',                                                  // 1
    '    def hasPathSum(self, root: Optional[TreeNode], targetSum: int) -> bool:', // 2
    '        if not root: return False',                                // 3
    '        node_q = collections.deque([root])',                       // 4
    '        sum_q = collections.deque([root.val])',                    // 5
    '        while node_q:',                                            // 6
    '            cur = node_q.popleft()',                               // 7
    '            cur_sum = sum_q.popleft()',                            // 8
    '            if not cur.left and not cur.right and cur_sum == targetSum:', // 9
    '                return True',                                      // 10
    '            if cur.left:',                                         // 11
    '                node_q.append(cur.left)',                          // 12
    '                sum_q.append(cur_sum + cur.left.val)',             // 13
    '            if cur.right:',                                        // 14
    '                node_q.append(cur.right)',                         // 15
    '                sum_q.append(cur_sum + cur.right.val)',            // 16
    '        return False',                                             // 17
  ],
  javascript: [
    'function hasPathSum(root, targetSum) {',                           // 1
    '    if (!root) return false;',                                     // 2
    '    const nodeQ = [root];',                                        // 3
    '    const sumQ = [root.val];',                                     // 4
    '    while (nodeQ.length > 0) {',                                   // 5
    '        const cur = nodeQ.shift();',                               // 6
    '        const curSum = sumQ.shift();',                             // 7
    '        if (!cur.left && !cur.right && curSum === targetSum) {',   // 8
    '            return true;',                                         // 9
    '        }',                                                        // 10
    '        if (cur.left) {',                                          // 11
    '            nodeQ.push(cur.left);',                                // 12
    '            sumQ.push(curSum + cur.left.val);',                    // 13
    '        }',                                                        // 14
    '        if (cur.right) {',                                         // 15
    '            nodeQ.push(cur.right);',                               // 16
    '            sumQ.push(curSum + cur.right.val);',                   // 17
    '        }',                                                        // 18
    '    }',                                                            // 19
    '    return false;',                                                // 20
    '}',                                                                // 21
  ],
};

export const PATH_SUM_STAGE3_BFS_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  nullCheck: { java: 3, cpp: 4, python: 3, javascript: 2 },
  initQueues: { java: 6, cpp: 7, python: 4, javascript: 3 },
  whileLoop: { java: 8, cpp: 9, python: 6, javascript: 5 },
  poll: { java: 9, cpp: 10, python: 7, javascript: 6 },
  leafCheck: { java: 11, cpp: 12, python: 9, javascript: 8 },
  match: { java: 12, cpp: 13, python: 10, javascript: 9 },
  pushLeft: { java: 15, cpp: 16, python: 12, javascript: 12 },
  pushRight: { java: 19, cpp: 20, python: 15, javascript: 16 },
  returnFalse: { java: 23, cpp: 24, python: 17, javascript: 20 },
};
