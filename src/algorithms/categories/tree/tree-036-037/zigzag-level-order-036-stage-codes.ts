/**
 * 二叉树锯齿形层序遍历 (Binary Tree Zigzag Level Order Traversal · LeetCode 103 / Class 036 Code02)
 * 多阶段演化四语言代码模板与精准 1-Based 行号映射
 *
 * Stage 1: 标准双端队列 / isReverse 标志法 (Queue + Deque/isReverse flag)
 * Stage 2: 静态数组模拟队列 (Static Array Queue · Class 036 招牌双向读指针极致优化)
 * Stage 3: 递归 DFS 深度映射分层收集 (Depth-Indexed DFS with level % 2 collection)
 */

// ============================================================
// Stage 1: 标准双端队列 / isReverse 标志法 (Queue + Deque/isReverse)
// ============================================================
export const ZIGZAG_STAGE1_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                         // 1
    '    public List<List<Integer>> zigzagLevelOrder(TreeNode root) {',// 2
    '        List<List<Integer>> ans = new ArrayList<>();',            // 3
    '        if (root == null) return ans;',                           // 4
    '        Queue<TreeNode> queue = new LinkedList<>();',             // 5
    '        queue.offer(root);',                                      // 6
    '        boolean isReverse = false;',                              // 7
    '        while (!queue.isEmpty()) {',                              // 8
    '            int size = queue.size();',                            // 9
    '            LinkedList<Integer> level = new LinkedList<>();',     // 10
    '            for (int i = 0; i < size; i++) {',                    // 11
    '                TreeNode cur = queue.poll();',                    // 12
    '                if (!isReverse) level.addLast(cur.val);',         // 13
    '                else level.addFirst(cur.val);',                   // 14
    '                if (cur.left != null) queue.offer(cur.left);',    // 15
    '                if (cur.right != null) queue.offer(cur.right);',  // 16
    '            }',                                                   // 17
    '            ans.add(level);',                                     // 18
    '            isReverse = !isReverse;',                             // 19
    '        }',                                                       // 20
    '        return ans;',                                             // 21
    '    }',                                                           // 22
    '}',                                                               // 23
  ],
  cpp: [
    'class Solution {',                                                // 1
    'public:',                                                         // 2
    '    vector<vector<int>> zigzagLevelOrder(TreeNode* root) {',      // 3
    '        vector<vector<int>> ans;',                                // 4
    '        if (!root) return ans;',                                  // 5
    '        queue<TreeNode*> q;',                                     // 6
    '        q.push(root);',                                           // 7
    '        bool isReverse = false;',                                 // 8
    '        while (!q.empty()) {',                                    // 9
    '            int sz = q.size();',                                  // 10
    '            deque<int> level;',                                   // 11
    '            for (int i = 0; i < sz; ++i) {',                      // 12
    '                TreeNode* cur = q.front(); q.pop();',             // 13
    '                if (!isReverse) level.push_back(cur->val);',      // 14
    '                else level.push_front(cur->val);',                // 15
    '                if (cur->left) q.push(cur->left);',               // 16
    '                if (cur->right) q.push(cur->right);',             // 17
    '            }',                                                   // 18
    '            ans.push_back(vector<int>(level.begin(), level.end()));',// 19
    '            isReverse = !isReverse;',                             // 20
    '        }',                                                       // 21
    '        return ans;',                                             // 22
    '    }',                                                           // 23
    '};',                                                              // 24
  ],
  python: [
    'class Solution:',                                                 // 1
    '    def zigzagLevelOrder(self, root: Optional[TreeNode]) -> list[list[int]]:', // 2
    '        if not root: return []',                                  // 3
    '        ans, q, is_rev = [], collections.deque([root]), False',   // 4
    '        while q:',                                                // 5
    '            level = collections.deque()',                         // 6
    '            for _ in range(len(q)):',                             // 7
    '                node = q.popleft()',                              // 8
    '                if not is_rev: level.append(node.val)',           // 9
    '                else: level.appendleft(node.val)',                // 10
    '                if node.left: q.append(node.left)',               // 11
    '                if node.right: q.append(node.right)',             // 12
    '            ans.append(list(level))',                             // 13
    '            is_rev = not is_rev',                                 // 14
    '        return ans',                                              // 15
  ],
  javascript: [
    'var zigzagLevelOrder = function(root) {',                         // 1
    '    if (!root) return [];',                                       // 2
    '    const ans = [], q = [root];',                                 // 3
    '    let isReverse = false;',                                      // 4
    '    while (q.length > 0) {',                                      // 5
    '        const size = q.length, level = [];',                      // 6
    '        for (let i = 0; i < size; i++) {',                        // 7
    '            const cur = q.shift();',                              // 8
    '            if (!isReverse) level.push(cur.val);',                // 9
    '            else level.unshift(cur.val);',                        // 10
    '            if (cur.left) q.push(cur.left);',                     // 11
    '            if (cur.right) q.push(cur.right);',                   // 12
    '        }',                                                       // 13
    '        ans.push(level);',                                        // 14
    '        isReverse = !isReverse;',                                 // 15
    '    }',                                                           // 16
    '    return ans;',                                                 // 17
    '};',                                                              // 18
  ],
};

export const ZIGZAG_STAGE1_LINES = {
  entry: { java: 4, cpp: 5, python: 3, javascript: 2 },
  initQueue: { java: 6, cpp: 7, python: 4, javascript: 3 },
  loopLevel: { java: 9, cpp: 10, python: 5, javascript: 6 },
  popNode: { java: 12, cpp: 13, python: 8, javascript: 8 },
  collectAddLast: { java: 13, cpp: 14, python: 9, javascript: 9 },
  collectAddFirst: { java: 14, cpp: 15, python: 10, javascript: 10 },
  pushChildren: { java: [15, 16], cpp: [16, 17], python: [11, 12], javascript: [11, 12] },
  levelDone: { java: 18, cpp: 19, python: 13, javascript: 14 },
  reverseToggle: { java: 19, cpp: 20, python: 14, javascript: 15 },
  returnAns: { java: 21, cpp: 22, python: 15, javascript: 17 },
};

// ============================================================
// Stage 2: 静态数组模拟队列 (Class 036 招牌极致优化)
// ============================================================
export const ZIGZAG_STAGE2_STATIC_ARRAY_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                         // 1
    '    public static int MAXN = 2001;',                              // 2
    '    public static TreeNode[] queue = new TreeNode[MAXN];',        // 3
    '    public static int l, r;',                                     // 4
    '    public List<List<Integer>> zigzagLevelOrder(TreeNode root) {',// 5
    '        List<List<Integer>> ans = new ArrayList<>();',            // 6
    '        if (root == null) return ans;',                           // 7
    '        l = 0; r = 0;',                                           // 8
    '        queue[r++] = root;',                                      // 9
    '        boolean isReverse = false;',                              // 10
    '        while (l < r) {',                                         // 11
    '            int size = r - l;',                                   // 12
    '            ArrayList<Integer> level = new ArrayList<>();',       // 13
    '            if (!isReverse) {',                                   // 14
    '                for (int i = l; i < l + size; i++) level.add(queue[i].val);', // 15
    '            } else {',                                            // 16
    '                for (int i = l + size - 1; i >= l; i--) level.add(queue[i].val);', // 17
    '            }',                                                   // 18
    '            for (int i = 0; i < size; i++) {',                    // 19
    '                TreeNode node = queue[l++];',                     // 20
    '                if (node.left != null) queue[r++] = node.left;',  // 21
    '                if (node.right != null) queue[r++] = node.right;',// 22
    '            }',                                                   // 23
    '            ans.add(level);',                                     // 24
    '            isReverse = !isReverse;',                             // 25
    '        }',                                                       // 26
    '        return ans;',                                             // 27
    '    }',                                                           // 28
    '}',                                                               // 29
  ],
  cpp: [
    'class Solution {',                                                // 1
    '    static const int MAXN = 2001;',                               // 2
    '    TreeNode* queue[MAXN];',                                      // 3
    'public:',                                                         // 4
    '    vector<vector<int>> zigzagLevelOrder(TreeNode* root) {',      // 5
    '        vector<vector<int>> ans;',                                // 6
    '        if (!root) return ans;',                                  // 7
    '        int l = 0, r = 0;',                                       // 8
    '        queue[r++] = root;',                                      // 9
    '        bool isReverse = false;',                                 // 10
    '        while (l < r) {',                                         // 11
    '            int sz = r - l;',                                     // 12
    '            vector<int> level;',                                  // 13
    '            if (!isReverse) {',                                   // 14
    '                for (int i = l; i < l + sz; ++i) level.push_back(queue[i]->val);', // 15
    '            } else {',                                            // 16
    '                for (int i = l + sz - 1; i >= l; --i) level.push_back(queue[i]->val);', // 17
    '            }',                                                   // 18
    '            for (int i = 0; i < sz; ++i) {',                      // 19
    '                TreeNode* node = queue[l++];',                    // 20
    '                if (node->left) queue[r++] = node->left;',        // 21
    '                if (node->right) queue[r++] = node->right;',      // 22
    '            }',                                                   // 23
    '            ans.push_back(level);',                               // 24
    '            isReverse = !isReverse;',                             // 25
    '        }',                                                       // 26
    '        return ans;',                                             // 27
    '    }',                                                           // 28
    '};',                                                              // 29
  ],
  python: [
    'class Solution:',                                                 // 1
    '    def zigzagLevelOrder(self, root: Optional[TreeNode]) -> list[list[int]]:', // 2
    '        if not root: return []',                                  // 3
    '        queue = [None] * 2005',                                   // 4
    '        l, r = 0, 0',                                             // 5
    '        queue[r] = root; r += 1',                                 // 6
    '        ans, is_rev = [], False',                                 // 7
    '        while l < r:',                                            // 8
    '            size = r - l',                                        // 9
    '            level = []',                                          // 10
    '            if not is_rev:',                                      // 11
    '                for i in range(l, l + size): level.append(queue[i].val)', // 12
    '            else:',                                               // 13
    '                for i in range(l + size - 1, l - 1, -1): level.append(queue[i].val)', // 14
    '            for _ in range(size):',                               // 15
    '                node = queue[l]; l += 1',                         // 16
    '                if node.left: queue[r] = node.left; r += 1',      // 17
    '                if node.right: queue[r] = node.right; r += 1',    // 18
    '            ans.append(level)',                                   // 19
    '            is_rev = not is_rev',                                 // 20
    '        return ans',                                              // 21
  ],
  javascript: [
    'var zigzagLevelOrder = function(root) {',                         // 1
    '    if (!root) return [];',                                       // 2
    '    const queue = new Array(2005);',                              // 3
    '    let l = 0, r = 0;',                                           // 4
    '    queue[r++] = root;',                                          // 5
    '    const ans = [];',                                             // 6
    '    let isReverse = false;',                                      // 7
    '    while (l < r) {',                                             // 8
    '        const size = r - l, level = [];',                         // 9
    '        if (!isReverse) {',                                       // 10
    '            for (let i = l; i < l + size; i++) level.push(queue[i].val);', // 11
    '        } else {',                                                // 12
    '            for (let i = l + size - 1; i >= l; i--) level.push(queue[i].val);', // 13
    '        }',                                                       // 14
    '        for (let i = 0; i < size; i++) {',                        // 15
    '            const node = queue[l++];',                            // 16
    '            if (node.left) queue[r++] = node.left;',              // 17
    '            if (node.right) queue[r++] = node.right;',            // 18
    '        }',                                                       // 19
    '        ans.push(level);',                                        // 20
    '        isReverse = !isReverse;',                                 // 21
    '    }',                                                           // 22
    '    return ans;',                                                 // 23
    '};',                                                              // 24
  ],
};

export const ZIGZAG_STAGE2_STATIC_ARRAY_LINES = {
  entry: { java: 7, cpp: 7, python: 3, javascript: 2 },
  initPointers: { java: 9, cpp: 9, python: 6, javascript: 5 },
  loopLevel: { java: 12, cpp: 12, python: 9, javascript: 9 },
  forwardCollect: { java: 15, cpp: 15, python: 12, javascript: 11 },
  backwardCollect: { java: 17, cpp: 17, python: 14, javascript: 13 },
  popNode: { java: 20, cpp: 20, python: 16, javascript: 16 },
  pushChildren: { java: [21, 22], cpp: [21, 22], python: [17, 18], javascript: [17, 18] },
  levelDone: { java: 24, cpp: 24, python: 19, javascript: 20 },
  reverseToggle: { java: 25, cpp: 25, python: 20, javascript: 21 },
  returnAns: { java: 27, cpp: 27, python: 21, javascript: 23 },
};

// ============================================================
// Stage 3: 递归 DFS 深度映射分层收集 (Depth-Indexed DFS)
// ============================================================
export const ZIGZAG_STAGE3_DFS_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                         // 1
    '    public List<List<Integer>> zigzagLevelOrder(TreeNode root) {',// 2
    '        List<List<Integer>> ans = new ArrayList<>();',            // 3
    '        dfs(root, 0, ans);',                                      // 4
    '        return ans;',                                             // 5
    '    }',                                                           // 6
    '    private void dfs(TreeNode node, int level, List<List<Integer>> ans) {', // 7
    '        if (node == null) return;',                               // 8
    '        if (level == ans.size()) {',                              // 9
    '            ans.add(new LinkedList<>());',                        // 10
    '        }',                                                       // 11
    '        LinkedList<Integer> list = (LinkedList<Integer>) ans.get(level);', // 12
    '        if (level % 2 == 0) {',                                   // 13
    '            list.addLast(node.val);',                             // 14
    '        } else {',                                                // 15
    '            list.addFirst(node.val);',                            // 16
    '        }',                                                       // 17
    '        dfs(node.left, level + 1, ans);',                         // 18
    '        dfs(node.right, level + 1, ans);',                        // 19
    '    }',                                                           // 20
    '}',                                                               // 21
  ],
  cpp: [
    'class Solution {',                                                // 1
    'public:',                                                         // 2
    '    vector<vector<int>> zigzagLevelOrder(TreeNode* root) {',      // 3
    '        vector<vector<int>> ans;',                                // 4
    '        dfs(root, 0, ans);',                                      // 5
    '        return ans;',                                             // 6
    '    }',                                                           // 7
    '    void dfs(TreeNode* node, int level, vector<vector<int>>& ans) {', // 8
    '        if (!node) return;',                                      // 9
    '        if (level == ans.size()) {',                              // 10
    '            ans.push_back({});',                                  // 11
    '        }',                                                       // 12
    '        if (level % 2 == 0) {',                                   // 13
    '            ans[level].push_back(node->val);',                    // 14
    '        } else {',                                                // 15
    '            ans[level].insert(ans[level].begin(), node->val);',   // 16
    '        }',                                                       // 17
    '        dfs(node->left, level + 1, ans);',                        // 18
    '        dfs(node->right, level + 1, ans);',                       // 19
    '    }',                                                           // 20
    '};',                                                              // 21
  ],
  python: [
    'class Solution:',                                                 // 1
    '    def zigzagLevelOrder(self, root: Optional[TreeNode]) -> list[list[int]]:', // 2
    '        ans = []',                                                // 3
    '        def dfs(node: Optional[TreeNode], level: int) -> None:',  // 4
    '            if not node: return',                                 // 5
    '            if level == len(ans):',                               // 6
    '                ans.append(collections.deque())',                 // 7
    '            if level % 2 == 0:',                                  // 8
    '                ans[level].append(node.val)',                     // 9
    '            else:',                                               // 10
    '                ans[level].appendleft(node.val)',                 // 11
    '            dfs(node.left, level + 1)',                           // 12
    '            dfs(node.right, level + 1)',                          // 13
    '        dfs(root, 0)',                                            // 14
    '        return [list(q) for q in ans]',                           // 15
  ],
  javascript: [
    'var zigzagLevelOrder = function(root) {',                         // 1
    '    const ans = [];',                                             // 2
    '    function dfs(node, level) {',                                 // 3
    '        if (!node) return;',                                      // 4
    '        if (level === ans.length) ans.push([]);',                 // 5
    '        if (level % 2 === 0) {',                                  // 6
    '            ans[level].push(node.val);',                          // 7
    '        } else {',                                                // 8
    '            ans[level].unshift(node.val);',                       // 9
    '        }',                                                       // 10
    '        dfs(node.left, level + 1);',                              // 11
    '        dfs(node.right, level + 1);',                             // 12
    '    }',                                                           // 13
    '    dfs(root, 0);',                                               // 14
    '    return ans;',                                                 // 15
    '};',                                                              // 16
  ],
};

export const ZIGZAG_STAGE3_DFS_LINES = {
  entry: { java: 4, cpp: 5, python: 3, javascript: 2 },
  dfsBase: { java: 8, cpp: 9, python: 5, javascript: 4 },
  newLevel: { java: 10, cpp: 11, python: 7, javascript: 5 },
  evenCollect: { java: 14, cpp: 14, python: 9, javascript: 7 },
  oddCollect: { java: 16, cpp: 16, python: 11, javascript: 9 },
  recurLeft: { java: 18, cpp: 18, python: 12, javascript: 11 },
  recurRight: { java: 19, cpp: 19, python: 13, javascript: 12 },
  returnAns: { java: 5, cpp: 6, python: 15, javascript: 15 },
};
