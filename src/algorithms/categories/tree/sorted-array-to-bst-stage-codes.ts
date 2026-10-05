/**
 * 将有序数组转换为二叉搜索树 (Convert Sorted Array to BST · LeetCode 108)
 * 多阶段演化四语言代码模板与精准 1-Based 行号映射
 *
 * Stage 1: 偏左中点经典分治递归 (Classic Divide & Conquer · 偏左取中)
 * Stage 2: 偏右中点分治递归 (Right-Biased Divide & Conquer · 探索平衡多解)
 * Stage 3: 三队列显式 BFS 迭代模拟 (Iterative BFS Three-Queues · 零递归调用栈)
 */

// ============================================================
// Stage 1: 偏左中点经典分治递归
// ============================================================
export const SORTED_ARRAY_TO_BST_STAGE1_CODES: Record<string, string[]> = {
  java: [
    'public class Solution {',                                          // 1
    '    public TreeNode sortedArrayToBST(int[] nums) {',               // 2
    '        if (nums == null || nums.length == 0) return null;',       // 3
    '        return build(nums, 0, nums.length - 1);',                  // 4
    '    }',                                                            // 5
    '    private TreeNode build(int[] nums, int left, int right) {',    // 6
    '        if (left > right) return null; // 递归基底：区间越界',    // 7
    '        int mid = left + (right - left) / 2; // 选取中间偏左元素', // 8
    '        TreeNode root = new TreeNode(nums[mid]);',                 // 9
    '        root.left = build(nums, left, mid - 1); // 递归构建左子树', // 10
    '        root.right = build(nums, mid + 1, right); // 递归构建右子树', // 11
    '        return root; // 返回构建好的平衡子树根',                   // 12
    '    }',                                                            // 13
    '}',                                                                // 14
  ],
  cpp: [
    'class Solution {',                                                 // 1
    'public:',                                                          // 2
    '    TreeNode* sortedArrayToBST(vector<int>& nums) {',              // 3
    '        if (nums.empty()) return nullptr;',                        // 4
    '        return build(nums, 0, nums.size() - 1);',                  // 5
    '    }',                                                            // 6
    '    TreeNode* build(vector<int>& nums, int left, int right) {',    // 7
    '        if (left > right) return nullptr;',                        // 8
    '        int mid = left + (right - left) / 2;',                     // 9
    '        TreeNode* root = new TreeNode(nums[mid]);',                // 10
    '        root->left = build(nums, left, mid - 1);',                 // 11
    '        root->right = build(nums, mid + 1, right);',               // 12
    '        return root;',                                             // 13
    '    }',                                                            // 14
    '};',                                                               // 15
  ],
  python: [
    'class Solution:',                                                  // 1
    '    def sortedArrayToBST(self, nums: List[int]) -> Optional[TreeNode]:', // 2
    '        if not nums: return None',                                 // 3
    '        def build(left: int, right: int) -> Optional[TreeNode]:',  // 4
    '            if left > right: return None',                         // 5
    '            mid = (left + right) // 2',                            // 6
    '            root = TreeNode(nums[mid])',                           // 7
    '            root.left = build(left, mid - 1)',                     // 8
    '            root.right = build(mid + 1, right)',                   // 9
    '            return root',                                          // 10
    '        return build(0, len(nums) - 1)',                           // 11
  ],
  javascript: [
    'var sortedArrayToBST = function(nums) {',                          // 1
    '    if (!nums || nums.length === 0) return null;',                 // 2
    '    function build(left, right) {',                                // 3
    '        if (left > right) return null;',                           // 4
    '        const mid = Math.floor((left + right) / 2);',              // 5
    '        const root = new TreeNode(nums[mid]);',                    // 6
    '        root.left = build(left, mid - 1);',                        // 7
    '        root.right = build(mid + 1, right);',                      // 8
    '        return root;',                                             // 9
    '    }',                                                            // 10
    '    return build(0, nums.length - 1);',                            // 11
    '};',                                                               // 12
  ],
};

export const SORTED_ARRAY_TO_BST_STAGE1_LINES = {
  entry: { java: 3, cpp: 4, python: 3, javascript: 2 },
  callBuild: { java: 4, cpp: 5, python: 11, javascript: 11 },
  baseCheck: { java: 7, cpp: 8, python: 5, javascript: 4 },
  calcMid: { java: 8, cpp: 9, python: 6, javascript: 5 },
  createNode: { java: 9, cpp: 10, python: 7, javascript: 6 },
  leftRecurse: { java: 10, cpp: 11, python: 8, javascript: 7 },
  rightRecurse: { java: 11, cpp: 12, python: 9, javascript: 8 },
  returnRoot: { java: 12, cpp: 13, python: 10, javascript: 9 },
  done: { java: 4, cpp: 5, python: 11, javascript: 11 },
};

// ============================================================
// Stage 2: 偏右中点分治递归
// ============================================================
export const SORTED_ARRAY_TO_BST_STAGE2_CODES: Record<string, string[]> = {
  java: [
    'public class Solution {',                                          // 1
    '    public TreeNode sortedArrayToBST(int[] nums) {',               // 2
    '        if (nums == null || nums.length == 0) return null;',       // 3
    '        return build(nums, 0, nums.length - 1);',                  // 4
    '    }',                                                            // 5
    '    private TreeNode build(int[] nums, int left, int right) {',    // 6
    '        if (left > right) return null; // 递归基底',               // 7
    '        int mid = left + (right - left + 1) / 2; // 选取中间偏右元素', // 8
    '        TreeNode root = new TreeNode(nums[mid]);',                 // 9
    '        root.left = build(nums, left, mid - 1);',                  // 10
    '        root.right = build(nums, mid + 1, right);',                // 11
    '        return root;',                                             // 12
    '    }',                                                            // 13
    '}',                                                                // 14
  ],
  cpp: [
    'class Solution {',                                                 // 1
    'public:',                                                          // 2
    '    TreeNode* sortedArrayToBST(vector<int>& nums) {',              // 3
    '        if (nums.empty()) return nullptr;',                        // 4
    '        return build(nums, 0, nums.size() - 1);',                  // 5
    '    }',                                                            // 6
    '    TreeNode* build(vector<int>& nums, int left, int right) {',    // 7
    '        if (left > right) return nullptr;',                        // 8
    '        int mid = left + (right - left + 1) / 2;',                 // 9
    '        TreeNode* root = new TreeNode(nums[mid]);',                // 10
    '        root->left = build(nums, left, mid - 1);',                 // 11
    '        root->right = build(nums, mid + 1, right);',               // 12
    '        return root;',                                             // 13
    '    }',                                                            // 14
    '};',                                                               // 15
  ],
  python: [
    'class Solution:',                                                  // 1
    '    def sortedArrayToBST(self, nums: List[int]) -> Optional[TreeNode]:', // 2
    '        if not nums: return None',                                 // 3
    '        def build(left: int, right: int) -> Optional[TreeNode]:',  // 4
    '            if left > right: return None',                         // 5
    '            mid = (left + right + 1) // 2',                        // 6
    '            root = TreeNode(nums[mid])',                           // 7
    '            root.left = build(left, mid - 1)',                     // 8
    '            root.right = build(mid + 1, right)',                   // 9
    '            return root',                                          // 10
    '        return build(0, len(nums) - 1)',                           // 11
  ],
  javascript: [
    'var sortedArrayToBST = function(nums) {',                          // 1
    '    if (!nums || nums.length === 0) return null;',                 // 2
    '    function build(left, right) {',                                // 3
    '        if (left > right) return null;',                           // 4
    '        const mid = Math.floor((left + right + 1) / 2);',          // 5
    '        const root = new TreeNode(nums[mid]);',                    // 6
    '        root.left = build(left, mid - 1);',                        // 7
    '        root.right = build(mid + 1, right);',                      // 8
    '        return root;',                                             // 9
    '    }',                                                            // 10
    '    return build(0, nums.length - 1);',                            // 11
    '};',                                                               // 12
  ],
};

export const SORTED_ARRAY_TO_BST_STAGE2_LINES = {
  entry: { java: 3, cpp: 4, python: 3, javascript: 2 },
  callBuild: { java: 4, cpp: 5, python: 11, javascript: 11 },
  baseCheck: { java: 7, cpp: 8, python: 5, javascript: 4 },
  calcMid: { java: 8, cpp: 9, python: 6, javascript: 5 },
  createNode: { java: 9, cpp: 10, python: 7, javascript: 6 },
  leftRecurse: { java: 10, cpp: 11, python: 8, javascript: 7 },
  rightRecurse: { java: 11, cpp: 12, python: 9, javascript: 8 },
  returnRoot: { java: 12, cpp: 13, python: 10, javascript: 9 },
  done: { java: 4, cpp: 5, python: 11, javascript: 11 },
};

// ============================================================
// Stage 3: 三队列显式 BFS 迭代模拟
// ============================================================
export const SORTED_ARRAY_TO_BST_STAGE3_CODES: Record<string, string[]> = {
  java: [
    'public class Solution {',                                          // 1
    '    public TreeNode sortedArrayToBST(int[] nums) {',               // 2
    '        if (nums == null || nums.length == 0) return null;',       // 3
    '        int n = nums.length;',                                     // 4
    '        Queue<TreeNode> nodeQ = new LinkedList<>();',              // 5
    '        Queue<Integer> leftQ = new LinkedList<>();',               // 6
    '        Queue<Integer> rightQ = new LinkedList<>();',              // 7
    '        int rootMid = (n - 1) / 2;',                               // 8
    '        TreeNode root = new TreeNode(nums[rootMid]);',             // 9
    '        nodeQ.offer(root); leftQ.offer(0); rightQ.offer(n - 1);',  // 10
    '        while (!nodeQ.isEmpty()) {',                               // 11
    '            TreeNode cur = nodeQ.poll();',                         // 12
    '            int l = leftQ.poll(), r = rightQ.poll();',             // 13
    '            int m = l + (r - l) / 2;',                             // 14
    '            if (l <= m - 1) { // 存在左子区间',                    // 15
    '                int lm = l + (m - 1 - l) / 2;',                    // 16
    '                cur.left = new TreeNode(nums[lm]);',               // 17
    '                nodeQ.offer(cur.left); leftQ.offer(l); rightQ.offer(m - 1);', // 18
    '            }',                                                    // 19
    '            if (m + 1 <= r) { // 存在右子区间',                    // 20
    '                int rm = m + 1 + (r - (m + 1)) / 2;',              // 21
    '                cur.right = new TreeNode(nums[rm]);',              // 22
    '                nodeQ.offer(cur.right); leftQ.offer(m + 1); rightQ.offer(r);', // 23
    '            }',                                                    // 24
    '        }',                                                        // 25
    '        return root;',                                             // 26
    '    }',                                                            // 27
    '}',                                                                // 28
  ],
  cpp: [
    'class Solution {',                                                 // 1
    'public:',                                                          // 2
    '    TreeNode* sortedArrayToBST(vector<int>& nums) {',              // 3
    '        if (nums.empty()) return nullptr;',                        // 4
    '        int n = nums.size();',                                     // 5
    '        queue<TreeNode*> nodeQ; queue<int> leftQ, rightQ;',        // 6
    '        int rootMid = (n - 1) / 2;',                               // 7
    '        TreeNode* root = new TreeNode(nums[rootMid]);',            // 8
    '        nodeQ.push(root); leftQ.push(0); rightQ.push(n - 1);',     // 9
    '        while (!nodeQ.empty()) {',                                 // 10
    '            TreeNode* cur = nodeQ.front(); nodeQ.pop();',          // 11
    '            int l = leftQ.front(); leftQ.pop();',                  // 12
    '            int r = rightQ.front(); rightQ.pop();',                // 13
    '            int m = l + (r - l) / 2;',                             // 14
    '            if (l <= m - 1) {',                                    // 15
    '                int lm = l + (m - 1 - l) / 2;',                    // 16
    '                cur->left = new TreeNode(nums[lm]);',              // 17
    '                nodeQ.push(cur->left); leftQ.push(l); rightQ.push(m - 1);', // 18
    '            }',                                                    // 19
    '            if (m + 1 <= r) {',                                    // 20
    '                int rm = m + 1 + (r - (m + 1)) / 2;',              // 21
    '                cur->right = new TreeNode(nums[rm]);',             // 22
    '                nodeQ.push(cur->right); leftQ.push(m + 1); rightQ.push(r);', // 23
    '            }',                                                    // 24
    '        }',                                                        // 25
    '        return root;',                                             // 26
    '    }',                                                            // 27
    '};',                                                               // 28
  ],
  python: [
    'class Solution:',                                                  // 1
    '    def sortedArrayToBST(self, nums: List[int]) -> Optional[TreeNode]:', // 2
    '        if not nums: return None',                                 // 3
    '        n = len(nums)',                                            // 4
    '        root_mid = (n - 1) // 2',                                  // 5
    '        root = TreeNode(nums[root_mid])',                          // 6
    '        nodeQ = collections.deque([root])',                        // 7
    '        leftQ = collections.deque([0])',                           // 8
    '        rightQ = collections.deque([n - 1])',                      // 9
    '        while nodeQ:',                                             // 10
    '            cur = nodeQ.popleft()',                                // 11
    '            l, r = leftQ.popleft(), rightQ.popleft()',             // 12
    '            m = l + (r - l) // 2',                                 // 13
    '            if l <= m - 1:',                                       // 14
    '                lm = l + (m - 1 - l) // 2',                        // 15
    '                cur.left = TreeNode(nums[lm])',                    // 16
    '                nodeQ.append(cur.left); leftQ.append(l); rightQ.append(m - 1)', // 17
    '            if m + 1 <= r:',                                       // 18
    '                rm = m + 1 + (r - (m + 1)) // 2',                  // 19
    '                cur.right = TreeNode(nums[rm])',                   // 20
    '                nodeQ.append(cur.right); leftQ.append(m + 1); rightQ.append(r)', // 21
    '        return root',                                              // 22
  ],
  javascript: [
    'var sortedArrayToBST = function(nums) {',                          // 1
    '    if (!nums || nums.length === 0) return null;',                 // 2
    '    const n = nums.length;',                                       // 3
    '    const rootMid = Math.floor((n - 1) / 2);',                     // 4
    '    const root = new TreeNode(nums[rootMid]);',                    // 5
    '    const nodeQ = [root], leftQ = [0], rightQ = [n - 1];',         // 6
    '    while (nodeQ.length > 0) {',                                   // 7
    '        const cur = nodeQ.shift();',                               // 8
    '        const l = leftQ.shift(), r = rightQ.shift();',             // 9
    '        const m = l + Math.floor((r - l) / 2);',                   // 10
    '        if (l <= m - 1) {',                                        // 11
    '            const lm = l + Math.floor((m - 1 - l) / 2);',          // 12
    '            cur.left = new TreeNode(nums[lm]);',                   // 13
    '            nodeQ.push(cur.left); leftQ.push(l); rightQ.push(m - 1);', // 14
    '        }',                                                        // 15
    '        if (m + 1 <= r) {',                                        // 16
    '            const rm = m + 1 + Math.floor((r - (m + 1)) / 2);',    // 17
    '            cur.right = new TreeNode(nums[rm]);',                  // 18
    '            nodeQ.push(cur.right); leftQ.push(m + 1); rightQ.push(r);', // 19
    '        }',                                                        // 20
    '    }',                                                            // 21
    '    return root;',                                                 // 22
    '};',                                                               // 23
  ],
};

export const SORTED_ARRAY_TO_BST_STAGE3_LINES = {
  entry: { java: 3, cpp: 4, python: 3, javascript: 2 },
  initRoot: { java: 9, cpp: 8, python: 6, javascript: 5 },
  whileCheck: { java: 11, cpp: 10, python: 10, javascript: 7 },
  pollNode: { java: 12, cpp: 11, python: 11, javascript: 8 },
  checkLeft: { java: 15, cpp: 15, python: 14, javascript: 11 },
  attachLeft: { java: 17, cpp: 17, python: 16, javascript: 13 },
  checkRight: { java: 20, cpp: 20, python: 18, javascript: 16 },
  attachRight: { java: 22, cpp: 22, python: 20, javascript: 18 },
  done: { java: 26, cpp: 26, python: 22, javascript: 22 },
};
