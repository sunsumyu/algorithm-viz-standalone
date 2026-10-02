/**
 * 二叉树层序遍历 (Binary Tree Level Order Traversal · LeetCode 102 / Class 036 Code01)
 * 多阶段演化四语言代码模板与精准 1-Based 行号映射
 *
 * Stage 1: 标准 Queue 队列逐层批处理 (Queue BFS with size snapshot)
 * Stage 2: 静态数组模拟队列 (Static Array Queue BFS · Class 036 招牌优化)
 * Stage 3: 哈希表辅助层级映射 (Queue + HashMap BFS · Class 036 基础对比)
 * Stage 4: 递归 DFS 分层收集 (Recursive DFS with depth parameter)
 */

// ============================================================
// Stage 1: 标准 Queue 队列逐层批处理 (LeetCode 102 / Class 036 基准)
// ============================================================
export const LEVEL_ORDER_STAGE2_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                         // 1
    '    public List<List<Integer>> levelOrder(TreeNode root) {',      // 2
    '        List<List<Integer>> res = new ArrayList<>();',            // 3
    '        if (root == null) return res;',                           // 4
    '        Queue<TreeNode> queue = new LinkedList<>();',             // 5
    '        queue.offer(root);',                                      // 6
    '        while (!queue.isEmpty()) {',                              // 7
    '            int size = queue.size(); // 固定当前层大小',            // 8
    '            List<Integer> level = new ArrayList<>();',            // 9
    '            for (int i = 0; i < size; i++) {',                    // 10
    '                TreeNode node = queue.poll();',                   // 11
    '                level.add(node.val);',                            // 12
    '                if (node.left != null) queue.offer(node.left);',  // 13
    '                if (node.right != null) queue.offer(node.right);',// 14
    '            }',                                                   // 15
    '            res.add(level);',                                     // 16
    '        }',                                                       // 17
    '        return res;',                                             // 18
    '    }',                                                           // 19
    '}',                                                               // 20
  ],
  cpp: [
    'class Solution {',                                                // 1
    'public:',                                                         // 2
    '    vector<vector<int>> levelOrder(TreeNode* root) {',            // 3
    '        vector<vector<int>> res;',                                // 4
    '        if (!root) return res;',                                  // 5
    '        queue<TreeNode*> q;',                                     // 6
    '        q.push(root);',                                           // 7
    '        while (!q.empty()) {',                                    // 8
    '            int size = q.size();',                                // 9
    '            vector<int> level;',                                  // 10
    '            for (int i = 0; i < size; i++) {',                    // 11
    '                TreeNode* node = q.front(); q.pop();',            // 12
    '                level.push_back(node->val);',                     // 13
    '                if (node->left) q.push(node->left);',             // 14
    '                if (node->right) q.push(node->right);',           // 15
    '            }',                                                   // 16
    '            res.push_back(level);',                               // 17
    '        }',                                                       // 18
    '        return res;',                                             // 19
    '    }',                                                           // 20
    '};',                                                              // 21
  ],
  python: [
    'class Solution:',                                                 // 1
    '    def levelOrder(self, root: Optional[TreeNode]) -> list[list[int]]:', // 2
    '        res = []',                                                // 3
    '        if not root: return res',                                 // 4
    '        queue = collections.deque([root])',                        // 5
    '        while queue:',                                            // 6
    '            size = len(queue)',                                    // 7
    '            level = []',                                          // 8
    '            for _ in range(size):',                                // 9
    '                node = queue.popleft()',                           // 10
    '                level.append(node.val)',                          // 11
    '                if node.left: queue.append(node.left)',            // 12
    '                if node.right: queue.append(node.right)',          // 13
    '            res.append(level)',                                    // 14
    '        return res',                                              // 15
  ],
  javascript: [
    'var levelOrder = function(root) {',                               // 1
    '    const res = [];',                                             // 2
    '    if (!root) return res;',                                      // 3
    '    const queue = [root];',                                       // 4
    '    while (queue.length > 0) {',                                  // 5
    '        const size = queue.length;',                               // 6
    '        const level = [];',                                       // 7
    '        for (let i = 0; i < size; i++) {',                        // 8
    '            const node = queue.shift();',                          // 9
    '            level.push(node.val);',                               // 10
    '            if (node.left) queue.push(node.left);',               // 11
    '            if (node.right) queue.push(node.right);',             // 12
    '        }',                                                       // 13
    '        res.push(level);',                                        // 14
    '    }',                                                           // 15
    '    return res;',                                                 // 16
    '};',                                                              // 17
  ],
};

export const LEVEL_ORDER_STAGE2_LINES = {
  entry:           { java: 2,  cpp: 3,  python: 2,  javascript: 1  },
  empty:           { java: 4,  cpp: 5,  python: 4,  javascript: 3  },
  init:            { java: 6,  cpp: 7,  python: 5,  javascript: 4  },
  whileCondition:  { java: 7,  cpp: 8,  python: 6,  javascript: 5  },
  whileExit:       { java: 7,  cpp: 8,  python: 6,  javascript: 5  },
  calcSize:        { java: 8,  cpp: 9,  python: 7,  javascript: 6  },
  initLevel:       { java: 9,  cpp: 10, python: 8,  javascript: 7  },
  startLevel:      { java: 8,  cpp: 9,  python: 7,  javascript: 6  },
  forLoopCheck:    { java: 10, cpp: 11, python: 9,  javascript: 8  },
  forLoopExit:     { java: 10, cpp: 11, python: 9,  javascript: 8  },
  pollNode:        { java: 11, cpp: 12, python: 10, javascript: 9  },
  collectVal:      { java: 12, cpp: 13, python: 11, javascript: 10 },
  checkLeftChild:  { java: 13, cpp: 14, python: 12, javascript: 11 },
  enqueueLeft:     { java: 13, cpp: 14, python: 12, javascript: 11 },
  checkRightChild: { java: 14, cpp: 15, python: 13, javascript: 12 },
  enqueueRight:    { java: 14, cpp: 15, python: 13, javascript: 12 },
  enqueueChildren: { java: 13, cpp: 14, python: 12, javascript: 11 },
  endLevel:        { java: 16, cpp: 17, python: 14, javascript: 14 },
  done:            { java: 18, cpp: 19, python: 15, javascript: 16 },
};

// 兼容别名
export const LEVEL_ORDER_QUEUE_CODE = LEVEL_ORDER_STAGE2_CODE;
export const LEVEL_ORDER_QUEUE_LINES = LEVEL_ORDER_STAGE2_LINES;

// ============================================================
// Stage 2: 静态数组模拟队列 (Class 036 招牌极致优化)
// ============================================================
export const LEVEL_ORDER_STATIC_ARRAY_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                         // 1
    '    public static int MAXN = 2001;',                              // 2
    '    public static TreeNode[] queue = new TreeNode[MAXN];',        // 3
    '    public static int l, r;',                                     // 4
    '    public List<List<Integer>> levelOrder(TreeNode root) {',      // 5
    '        List<List<Integer>> ans = new ArrayList<>();',            // 6
    '        if (root == null) return ans;',                           // 7
    '        l = r = 0;',                                              // 8
    '        queue[r++] = root;',                                      // 9
    '        while (l < r) {',                                         // 10
    '            int size = r - l; // 当前层大小',                       // 11
    '            List<Integer> list = new ArrayList<>();',             // 12
    '            for (int i = 0; i < size; i++) {',                    // 13
    '                TreeNode cur = queue[l++];',                      // 14
    '                list.add(cur.val);',                              // 15
    '                if (cur.left != null) queue[r++] = cur.left;',    // 16
    '                if (cur.right != null) queue[r++] = cur.right;',  // 17
    '            }',                                                   // 18
    '            ans.add(list);',                                      // 19
    '        }',                                                       // 20
    '        return ans;',                                             // 21
    '    }',                                                           // 22
    '}',                                                               // 23
  ],
  cpp: [
    'class Solution {',                                                // 1
    'public:',                                                         // 2
    '    static const int MAXN = 2001;',                               // 3
    '    TreeNode* q[MAXN];',                                          // 4
    '    int l = 0, r = 0;',                                           // 5
    '    vector<vector<int>> levelOrder(TreeNode* root) {',            // 6
    '        vector<vector<int>> ans;',                                // 7
    '        if (!root) return ans;',                                  // 8
    '        l = r = 0;',                                              // 9
    '        q[r++] = root;',                                          // 10
    '        while (l < r) {',                                         // 11
    '            int size = r - l;',                                   // 12
    '            vector<int> list;',                                   // 13
    '            for (int i = 0; i < size; i++) {',                    // 14
    '                TreeNode* cur = q[l++];',                         // 15
    '                list.push_back(cur->val);',                       // 16
    '                if (cur->left) q[r++] = cur->left;',              // 17
    '                if (cur->right) q[r++] = cur->right;',            // 18
    '            }',                                                   // 19
    '            ans.push_back(list);',                                // 20
    '        }',                                                       // 21
    '        return ans;',                                             // 22
    '    }',                                                           // 23
    '};',                                                              // 24
  ],
  python: [
    'class Solution:',                                                 // 1
    '    def levelOrder(self, root: Optional[TreeNode]) -> list[list[int]]:', // 2
    '        ans = []',                                                // 3
    '        if not root: return ans',                                 // 4
    '        MAXN = 2001',                                             // 5
    '        queue = [None] * MAXN',                                   // 6
    '        l, r = 0, 0',                                             // 7
    '        queue[r] = root; r += 1',                                 // 8
    '        while l < r:',                                            // 9
    '            size = r - l',                                        // 10
    '            level = []',                                          // 11
    '            for _ in range(size):',                               // 12
    '                cur = queue[l]; l += 1',                          // 13
    '                level.append(cur.val)',                           // 14
    '                if cur.left: queue[r] = cur.left; r += 1',        // 15
    '                if cur.right: queue[r] = cur.right; r += 1',      // 16
    '            ans.append(level)',                                   // 17
    '        return ans',                                              // 18
  ],
  javascript: [
    'var levelOrder = function(root) {',                               // 1
    '    const ans = [];',                                             // 2
    '    if (!root) return ans;',                                      // 3
    '    const MAXN = 2001;',                                          // 4
    '    const queue = new Array(MAXN);',                              // 5
    '    let l = 0, r = 0;',                                           // 6
    '    queue[r++] = root;',                                          // 7
    '    while (l < r) {',                                             // 8
    '        const size = r - l;',                                     // 9
    '        const level = [];',                                       // 10
    '        for (let i = 0; i < size; i++) {',                        // 11
    '            const cur = queue[l++];',                             // 12
    '            level.push(cur.val);',                                // 13
    '            if (cur.left) queue[r++] = cur.left;',                // 14
    '            if (cur.right) queue[r++] = cur.right;',              // 15
    '        }',                                                       // 16
    '        ans.push(level);',                                        // 17
    '    }',                                                           // 18
    '    return ans;',                                                 // 19
    '};',                                                              // 20
  ],
};

export const LEVEL_ORDER_STATIC_ARRAY_LINES = {
  entry:           { java: 5,  cpp: 6,  python: 2,  javascript: 1 },
  guardEmpty:      { java: 7,  cpp: 8,  python: 4,  javascript: 3 },
  initPointers:    { java: 8,  cpp: 9,  python: 7,  javascript: 6 },
  initQueue:       { java: 9,  cpp: 10, python: 8,  javascript: 7 },
  whileCondition:  { java: 10, cpp: 11, python: 9,  javascript: 8 },
  whileExit:       { java: 10, cpp: 11, python: 9,  javascript: 8 },
  calcSize:        { java: 11, cpp: 12, python: 10, javascript: 9 },
  initLevel:       { java: 12, cpp: 13, python: 11, javascript: 10 },
  forLoopCheck:    { java: 13, cpp: 14, python: 12, javascript: 11 },
  forLoopExit:     { java: 13, cpp: 14, python: 12, javascript: 11 },
  pollNode:        { java: 14, cpp: 15, python: 13, javascript: 12 },
  collectVal:      { java: 15, cpp: 16, python: 14, javascript: 13 },
  checkLeftChild:  { java: 16, cpp: 17, python: 15, javascript: 14 },
  enqueueLeft:     { java: 16, cpp: 17, python: 15, javascript: 14 },
  checkRightChild: { java: 17, cpp: 18, python: 16, javascript: 15 },
  enqueueRight:    { java: 17, cpp: 18, python: 16, javascript: 15 },
  enqueueChildren: { java: 16, cpp: 17, python: 15, javascript: 14 },
  endLevel:        { java: 19, cpp: 20, python: 17, javascript: 17 },
  done:            { java: 21, cpp: 22, python: 18, javascript: 19 },
};

// ============================================================
// Stage 3: 哈希表辅助层级映射 (Class 036 基础对比 / 初学误区)
// ============================================================
export const LEVEL_ORDER_HASH_MAP_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                         // 1
    '    public List<List<Integer>> levelOrder(TreeNode root) {',      // 2
    '        List<List<Integer>> ans = new ArrayList<>();',            // 3
    '        if (root == null) return ans;',                           // 4
    '        Queue<TreeNode> queue = new LinkedList<>();',             // 5
    '        Map<TreeNode, Integer> levels = new HashMap<>();',        // 6
    '        queue.add(root);',                                        // 7
    '        levels.put(root, 0);',                                    // 8
    '        while (!queue.isEmpty()) {',                              // 9
    '            TreeNode cur = queue.poll();',                        // 10
    '            int level = levels.get(cur);',                        // 11
    '            if (ans.size() == level) ans.add(new ArrayList<>());',// 12
    '            ans.get(level).add(cur.val);',                        // 13
    '            if (cur.left != null) {',                             // 14
    '                queue.add(cur.left);',                            // 15
    '                levels.put(cur.left, level + 1);',                // 16
    '            }',                                                   // 17
    '            if (cur.right != null) {',                            // 18
    '                queue.add(cur.right);',                           // 19
    '                levels.put(cur.right, level + 1);',               // 20
    '            }',                                                   // 21
    '        }',                                                       // 22
    '        return ans;',                                             // 23
    '    }',                                                           // 24
    '}',                                                               // 25
  ],
  cpp: [
    'class Solution {',                                                // 1
    'public:',                                                         // 2
    '    vector<vector<int>> levelOrder(TreeNode* root) {',            // 3
    '        vector<vector<int>> ans;',                                // 4
    '        if (!root) return ans;',                                  // 5
    '        queue<TreeNode*> q;',                                     // 6
    '        unordered_map<TreeNode*, int> levels;',                   // 7
    '        q.push(root);',                                           // 8
    '        levels[root] = 0;',                                       // 9
    '        while (!q.empty()) {',                                    // 10
    '            TreeNode* cur = q.front(); q.pop();',                 // 11
    '            int level = levels[cur];',                            // 12
    '            if ((int)ans.size() == level) ans.push_back({});',    // 13
    '            ans[level].push_back(cur->val);',                     // 14
    '            if (cur->left) {',                                    // 15
    '                q.push(cur->left);',                              // 16
    '                levels[cur->left] = level + 1;',                  // 17
    '            }',                                                   // 18
    '            if (cur->right) {',                                   // 19
    '                q.push(cur->right);',                             // 20
    '                levels[cur->right] = level + 1;',                 // 21
    '            }',                                                   // 22
    '        }',                                                       // 23
    '        return ans;',                                             // 24
    '    }',                                                           // 25
    '};',                                                              // 26
  ],
  python: [
    'class Solution:',                                                 // 1
    '    def levelOrder(self, root: Optional[TreeNode]) -> list[list[int]]:', // 2
    '        ans = []',                                                // 3
    '        if not root: return ans',                                 // 4
    '        queue = collections.deque([root])',                        // 5
    '        levels = {root: 0}',                                      // 6
    '        while queue:',                                            // 7
    '            cur = queue.popleft()',                               // 8
    '            level = levels[cur]',                                 // 9
    '            if len(ans) == level: ans.append([])',                // 10
    '            ans[level].append(cur.val)',                          // 11
    '            if cur.left:',                                        // 12
    '                queue.append(cur.left)',                          // 13
    '                levels[cur.left] = level + 1',                    // 14
    '            if cur.right:',                                       // 15
    '                queue.append(cur.right)',                         // 16
    '                levels[cur.right] = level + 1',                   // 17
    '        return ans',                                              // 18
  ],
  javascript: [
    'var levelOrder = function(root) {',                               // 1
    '    const ans = [];',                                             // 2
    '    if (!root) return ans;',                                      // 3
    '    const queue = [root];',                                       // 4
    '    const levels = new Map();',                                   // 5
    '    levels.set(root, 0);',                                        // 6
    '    while (queue.length > 0) {',                                  // 7
    '        const cur = queue.shift();',                              // 8
    '        const level = levels.get(cur);',                          // 9
    '        if (ans.length === level) ans.push([]);',                 // 10
    '        ans[level].push(cur.val);',                               // 11
    '        if (cur.left) {',                                         // 12
    '            queue.push(cur.left);',                               // 13
    '            levels.set(cur.left, level + 1);',                    // 14
    '        }',                                                       // 15
    '        if (cur.right) {',                                        // 16
    '            queue.push(cur.right);',                              // 17
    '            levels.set(cur.right, level + 1);',                   // 18
    '        }',                                                       // 19
    '    }',                                                           // 20
    '    return ans;',                                                 // 21
    '};',                                                              // 22
  ],
};

export const LEVEL_ORDER_HASH_MAP_LINES = {
  entry:           { java: 2,  cpp: 3,  python: 2,  javascript: 1 },
  guardEmpty:      { java: 4,  cpp: 5,  python: 4,  javascript: 3 },
  initQueue:       { java: 7,  cpp: 8,  python: 5,  javascript: 4 },
  initLevelMap:    { java: 8,  cpp: 9,  python: 6,  javascript: 6 },
  initQueueAndMap: { java: 7,  cpp: 8,  python: 5,  javascript: 4 },
  whileCondition:  { java: 9,  cpp: 10, python: 7,  javascript: 7 },
  whileExit:       { java: 9,  cpp: 10, python: 7,  javascript: 7 },
  pollNode:        { java: 10, cpp: 11, python: 8,  javascript: 8 },
  queryLevel:      { java: 11, cpp: 12, python: 9,  javascript: 9 },
  checkNewLevel:   { java: 12, cpp: 13, python: 10, javascript: 10 },
  addVal:          { java: 13, cpp: 14, python: 11, javascript: 11 },
  checkLeftChild:  { java: 14, cpp: 15, python: 12, javascript: 12 },
  enqueueLeft:     { java: 15, cpp: 16, python: 13, javascript: 13 },
  recordLeftLevel: { java: 16, cpp: 17, python: 14, javascript: 14 },
  checkRightChild: { java: 18, cpp: 19, python: 15, javascript: 16 },
  enqueueRight:    { java: 19, cpp: 20, python: 16, javascript: 17 },
  recordRightLevel:{ java: 20, cpp: 21, python: 17, javascript: 18 },
  done:            { java: 23, cpp: 24, python: 18, javascript: 21 },
};

// ============================================================
// Stage 4: 递归 DFS 分层收集
// ============================================================
export const LEVEL_ORDER_STAGE1_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                         // 1
    '    public List<List<Integer>> levelOrder(TreeNode root) {',      // 2
    '        List<List<Integer>> res = new ArrayList<>();',            // 3
    '        dfs(root, 0, res);',                                      // 4
    '        return res;',                                             // 5
    '    }',                                                           // 6
    '    void dfs(TreeNode node, int depth, List<List<Integer>> res) {', // 7
    '        if (node == null) return;',                                // 8
    '        if (depth == res.size()) {',                               // 9
    '            res.add(new ArrayList<>());',                         // 10
    '        }',                                                       // 11
    '        res.get(depth).add(node.val);',                           // 12
    '        dfs(node.left, depth + 1, res);',                         // 13
    '        dfs(node.right, depth + 1, res);',                        // 14
    '    }',                                                           // 15
    '}',                                                               // 16
  ],
  cpp: [
    'class Solution {',                                                // 1
    'public:',                                                         // 2
    '    vector<vector<int>> levelOrder(TreeNode* root) {',            // 3
    '        vector<vector<int>> res;',                                // 4
    '        dfs(root, 0, res);',                                      // 5
    '        return res;',                                             // 6
    '    }',                                                           // 7
    '    void dfs(TreeNode* node, int depth, vector<vector<int>>& res) {', // 8
    '        if (!node) return;',                                      // 9
    '        if (depth == res.size()) {',                               // 10
    '            res.push_back({});',                                  // 11
    '        }',                                                       // 12
    '        res[depth].push_back(node->val);',                        // 13
    '        dfs(node->left, depth + 1, res);',                        // 14
    '        dfs(node->right, depth + 1, res);',                       // 15
    '    }',                                                           // 16
    '};',                                                              // 17
  ],
  python: [
    'class Solution:',                                                 // 1
    '    def levelOrder(self, root: Optional[TreeNode]) -> list[list[int]]:', // 2
    '        res = []',                                                // 3
    '        def dfs(node, depth):',                                   // 4
    '            if not node: return',                                  // 5
    '            if depth == len(res):',                                // 6
    '                res.append([])',                                   // 7
    '            res[depth].append(node.val)',                          // 8
    '            dfs(node.left, depth + 1)',                            // 9
    '            dfs(node.right, depth + 1)',                           // 10
    '        dfs(root, 0)',                                             // 11
    '        return res',                                               // 12
  ],
  javascript: [
    'var levelOrder = function(root) {',                               // 1
    '    const res = [];',                                             // 2
    '    function dfs(node, depth) {',                                 // 3
    '        if (!node) return;',                                      // 4
    '        if (depth === res.length) {',                              // 5
    '            res.push([]);',                                       // 6
    '        }',                                                       // 7
    '        res[depth].push(node.val);',                              // 8
    '        dfs(node.left, depth + 1);',                              // 9
    '        dfs(node.right, depth + 1);',                             // 10
    '    }',                                                           // 11
    '    dfs(root, 0);',                                               // 12
    '    return res;',                                                 // 13
    '};',                                                              // 14
  ],
};

export const LEVEL_ORDER_STAGE1_LINES = {
  mainEntry:    { java: 2,  cpp: 3,  python: 2,  javascript: 1  },
  initRes:      { java: 3,  cpp: 4,  python: 3,  javascript: 2  },
  callDfs:      { java: 4,  cpp: 5,  python: 11, javascript: 12 },
  returnRes:    { java: 5,  cpp: 6,  python: 12, javascript: 13 },
  dfsEntry:     { java: 7,  cpp: 8,  python: 4,  javascript: 3  },
  nullGuard:    { java: 8,  cpp: 9,  python: 5,  javascript: 4  },
  depthCheck:   { java: 9,  cpp: 10, python: 6,  javascript: 5  },
  newLevel:     { java: 10, cpp: 11, python: 7,  javascript: 6  },
  addVal:       { java: 12, cpp: 13, python: 8,  javascript: 8  },
  dfsLeft:      { java: 13, cpp: 14, python: 9,  javascript: 9  },
  dfsRight:     { java: 14, cpp: 15, python: 10, javascript: 10 },
};

export const LEVEL_ORDER_DFS_CODE = LEVEL_ORDER_STAGE1_CODE;
export const LEVEL_ORDER_DFS_LINES = LEVEL_ORDER_STAGE1_LINES;
