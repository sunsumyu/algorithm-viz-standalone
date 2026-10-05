/**
 * 二叉搜索子树的最大键值和 (LeetCode 1373 / 333 / Class 036) 多阶段代码与行号映射
 */

// ============================================================
// Stage 1: 树形 DP 二叉树递归套路 (Info 结构体自底向上收集)
// ============================================================
export const MAX_SUM_BST_STAGE1_CODES: Record<string, string> = {
  java: `public class Solution {
    static class Info {
        boolean isBst;
        int min, max, sum;
        Info(boolean b, int mi, int ma, int s) {
            isBst = b; min = mi; max = ma; sum = s;
        }
    }
    private int maxSum = 0;
    public int maxSumBST(TreeNode root) {
        dfs(root);
        return Math.max(0, maxSum);
    }
    private Info dfs(TreeNode node) {
        if (node == null) {
            return new Info(true, Integer.MAX_VALUE, Integer.MIN_VALUE, 0);
        }
        Info l = dfs(node.left);
        Info r = dfs(node.right);
        if (l.isBst && r.isBst && l.max < node.val && node.val < r.min) {
            int curSum = l.sum + r.sum + node.val;
            maxSum = Math.max(maxSum, curSum);
            return new Info(true, Math.min(l.min, node.val), Math.max(r.max, node.val), curSum);
        }
        return new Info(false, 0, 0, 0);
    }
}`,
  cpp: `class Solution {
    struct Info {
        bool isBst;
        int minVal, maxVal, sum;
    };
    int maxSum = 0;
public:
    int maxSumBST(TreeNode* root) {
        dfs(root);
        return max(0, maxSum);
    }
    Info dfs(TreeNode* node) {
        if (!node) return {true, INT_MAX, INT_MIN, 0};
        Info l = dfs(node->left);
        Info r = dfs(node->right);
        if (l.isBst && r.isBst && l.maxVal < node->val && node->val < r.minVal) {
            int curSum = l.sum + r.sum + node->val;
            maxSum = max(maxSum, curSum);
            return {true, min(l.minVal, node->val), max(r.maxVal, node->val), curSum};
        }
        return {false, 0, 0, 0};
    }
};`,
  python: `class Solution:
    def maxSumBST(self, root: Optional[TreeNode]) -> int:
        self.max_sum = 0
        def dfs(node):
            if not node:
                return (True, float('inf'), float('-inf'), 0)
            l_bst, l_min, l_max, l_sum = dfs(node.left)
            r_bst, r_min, r_max, r_sum = dfs(node.right)
            if l_bst and r_bst and l_max < node.val < r_min:
                cur_sum = l_sum + r_sum + node.val
                self.max_sum = max(self.max_sum, cur_sum)
                return (True, min(l_min, node.val), max(r_max, node.val), cur_sum)
            return (False, 0, 0, 0)
        dfs(root)
        return max(0, self.max_sum)`,
  javascript: `function maxSumBST(root) {
    let maxSum = 0;
    function dfs(node) {
        if (!node) {
            return { isBst: true, min: Infinity, max: -Infinity, sum: 0 };
        }
        const l = dfs(node.left);
        const r = dfs(node.right);
        if (l.isBst && r.isBst && l.max < node.val && node.val < r.min) {
            const curSum = l.sum + r.sum + node.val;
            maxSum = Math.max(maxSum, curSum);
            return { isBst: true, min: Math.min(l.min, node.val), max: Math.max(r.max, node.val), sum: curSum };
        }
        return { isBst: false, min: 0, max: 0, sum: 0 };
    }
    dfs(root);
    return Math.max(0, maxSum);
}`
};

export const MAX_SUM_BST_CODES = MAX_SUM_BST_STAGE1_CODES;

export const MAX_SUM_BST_STAGE1_LINES = {
  entry: { java: 11, cpp: 9, python: 14, javascript: 18 },
  dfsNull: { java: 15, cpp: 13, python: 6, javascript: 5 },
  dfsLeft: { java: 18, cpp: 14, python: 7, javascript: 7 },
  dfsRight: { java: 19, cpp: 15, python: 8, javascript: 8 },
  checkBst: { java: 20, cpp: 16, python: 9, javascript: 9 },
  validBst: { java: 21, cpp: 17, python: 10, javascript: 10 },
  invalidBst: { java: 25, cpp: 21, python: 13, javascript: 14 },
  finish: { java: 12, cpp: 10, python: 15, javascript: 18 },
};

export const MAX_SUM_BST_CODE_LINES = MAX_SUM_BST_STAGE1_LINES;

// ============================================================
// Stage 2: 快速失效剪枝优化 (Pruning Invalidation)
// ============================================================
export const MAX_SUM_BST_STAGE2_CODES: Record<string, string> = {
  java: `public class Solution {
    private int maxSum = 0;
    public int maxSumBST(TreeNode root) {
        dfs(root);
        return Math.max(0, maxSum);
    }
    private int[] dfs(TreeNode node) {
        if (node == null) return new int[]{1, Integer.MAX_VALUE, Integer.MIN_VALUE, 0};
        int[] l = dfs(node.left);
        int[] r = dfs(node.right);
        if (l[0] == 1 && r[0] == 1 && l[2] < node.val && node.val < r[1]) {
            int curSum = l[3] + r[3] + node.val;
            maxSum = Math.max(maxSum, curSum);
            return new int[]{1, Math.min(l[1], node.val), Math.max(r[2], node.val), curSum};
        }
        return new int[]{0, 0, 0, 0};
    }
}`,
  cpp: `class Solution {
    int maxSum = 0;
public:
    int maxSumBST(TreeNode* root) {
        dfs(root);
        return max(0, maxSum);
    }
    vector<int> dfs(TreeNode* node) {
        if (!node) return {1, INT_MAX, INT_MIN, 0};
        auto l = dfs(node->left);
        auto r = dfs(node->right);
        if (l[0] && r[0] && l[2] < node->val && node->val < r[1]) {
            int curSum = l[3] + r[3] + node->val;
            maxSum = max(maxSum, curSum);
            return {1, min(l[1], node->val), max(r[2], node->val), curSum};
        }
        return {0, 0, 0, 0};
    }
};`,
  python: `class Solution:
    def maxSumBST(self, root: Optional[TreeNode]) -> int:
        self.max_sum = 0
        def dfs(node):
            if not node:
                return (1, float('inf'), float('-inf'), 0)
            l = dfs(node.left)
            r = dfs(node.right)
            if l[0] and r[0] and l[2] < node.val < r[1]:
                cur_sum = l[3] + r[3] + node.val
                self.max_sum = max(self.max_sum, cur_sum)
                return (1, min(l[1], node.val), max(r[2], node.val), cur_sum)
            return (0, 0, 0, 0)
        dfs(root)
        return max(0, self.max_sum)`,
  javascript: `function maxSumBST(root) {
    let maxSum = 0;
    function dfs(node) {
        if (!node) return [1, Infinity, -Infinity, 0];
        const l = dfs(node.left);
        const r = dfs(node.right);
        if (l[0] === 1 && r[0] === 1 && l[2] < node.val && node.val < r[1]) {
            const curSum = l[3] + r[3] + node.val;
            maxSum = Math.max(maxSum, curSum);
            return [1, Math.min(l[1], node.val), Math.max(r[2], node.val), curSum];
        }
        return [0, 0, 0, 0];
    }
    dfs(root);
    return Math.max(0, maxSum);
}`
};

export const MAX_SUM_BST_STAGE2_LINES = {
  entry: { java: 4, cpp: 5, python: 14, javascript: 14 },
  dfsNull: { java: 8, cpp: 9, python: 6, javascript: 4 },
  dfsLeft: { java: 9, cpp: 10, python: 7, javascript: 5 },
  dfsRight: { java: 10, cpp: 11, python: 8, javascript: 6 },
  checkBst: { java: 11, cpp: 12, python: 9, javascript: 7 },
  validBst: { java: 12, cpp: 13, python: 10, javascript: 8 },
  invalidBst: { java: 16, cpp: 17, python: 13, javascript: 12 },
  finish: { java: 5, cpp: 6, python: 15, javascript: 15 },
};

// ============================================================
// Stage 3: 显式后序遍历与单调栈迭代 (零系统栈爆栈风险)
// ============================================================
export const MAX_SUM_BST_STAGE3_CODES: Record<string, string> = {
  java: `public class Solution {
    public int maxSumBST(TreeNode root) {
        if (root == null) return 0;
        int maxSum = 0;
        Deque<TreeNode> stack = new ArrayDeque<>();
        Map<TreeNode, int[]> infoMap = new HashMap<>();
        TreeNode curr = root, prev = null;
        while (curr != null || !stack.isEmpty()) {
            while (curr != null) { stack.push(curr); curr = curr.left; }
            curr = stack.peek();
            if (curr.right != null && curr.right != prev) {
                curr = curr.right;
            } else {
                stack.pop();
                int[] l = curr.left == null ? new int[]{1, Integer.MAX_VALUE, Integer.MIN_VALUE, 0} : infoMap.get(curr.left);
                int[] r = curr.right == null ? new int[]{1, Integer.MAX_VALUE, Integer.MIN_VALUE, 0} : infoMap.get(curr.right);
                if (l[0] == 1 && r[0] == 1 && l[2] < curr.val && curr.val < r[1]) {
                    int sum = l[3] + r[3] + curr.val;
                    maxSum = Math.max(maxSum, sum);
                    infoMap.put(curr, new int[]{1, Math.min(l[1], curr.val), Math.max(r[2], curr.val), sum});
                } else {
                    infoMap.put(curr, new int[]{0, 0, 0, 0});
                }
                prev = curr; curr = null;
            }
        }
        return Math.max(0, maxSum);
    }
}`,
  cpp: `class Solution {
public:
    int maxSumBST(TreeNode* root) {
        if (!root) return 0;
        int maxSum = 0;
        stack<TreeNode*> st;
        unordered_map<TreeNode*, vector<int>> infoMap;
        TreeNode* curr = root; TreeNode* prev = nullptr;
        while (curr || !st.empty()) {
            while (curr) { st.push(curr); curr = curr->left; }
            curr = st.top();
            if (curr->right && curr->right != prev) {
                curr = curr->right;
            } else {
                st.pop();
                auto l = curr->left ? infoMap[curr->left] : vector<int>{1, INT_MAX, INT_MIN, 0};
                auto r = curr->right ? infoMap[curr->right] : vector<int>{1, INT_MAX, INT_MIN, 0};
                if (l[0] && r[0] && l[2] < curr->val && curr->val < r[1]) {
                    int sum = l[3] + r[3] + curr->val;
                    maxSum = max(maxSum, sum);
                    infoMap[curr] = {1, min(l[1], curr->val), max(r[2], curr->val), sum};
                } else {
                    infoMap[curr] = {0, 0, 0, 0};
                }
                prev = curr; curr = nullptr;
            }
        }
        return max(0, maxSum);
    }
};`,
  python: `class Solution:
    def maxSumBST(self, root: Optional[TreeNode]) -> int:
        if not root: return 0
        max_sum = 0
        stack, info_map = [], {}
        curr, prev = root, None
        while curr or stack:
            while curr:
                stack.append(curr)
                curr = curr.left
            curr = stack[-1]
            if curr.right and curr.right != prev:
                curr = curr.right
            else:
                stack.pop()
                l = info_map.get(curr.left, (1, float('inf'), float('-inf'), 0))
                r = info_map.get(curr.right, (1, float('inf'), float('-inf'), 0))
                if l[0] and r[0] and l[2] < curr.val < r[1]:
                    s = l[3] + r[3] + curr.val
                    max_sum = max(max_sum, s)
                    info_map[curr] = (1, min(l[1], curr.val), max(r[2], curr.val), s)
                else:
                    info_map[curr] = (0, 0, 0, 0)
                prev, curr = curr, None
        return max(0, max_sum)`,
  javascript: `function maxSumBST(root) {
    if (!root) return 0;
    let maxSum = 0;
    const stack = [];
    const infoMap = new Map();
    let curr = root, prev = null;
    while (curr !== null || stack.length > 0) {
        while (curr !== null) { stack.push(curr); curr = curr.left; }
        curr = stack[stack.length - 1];
        if (curr.right !== null && curr.right !== prev) {
            curr = curr.right;
        } else {
            stack.pop();
            const l = curr.left ? infoMap.get(curr.left) : [1, Infinity, -Infinity, 0];
            const r = curr.right ? infoMap.get(curr.right) : [1, Infinity, -Infinity, 0];
            if (l[0] === 1 && r[0] === 1 && l[2] < curr.val && curr.val < r[1]) {
                const sum = l[3] + r[3] + curr.val;
                maxSum = Math.max(maxSum, sum);
                infoMap.set(curr, [1, Math.min(l[1], curr.val), Math.max(r[2], curr.val), sum]);
            } else {
                infoMap.set(curr, [0, 0, 0, 0]);
            }
            prev = curr; curr = null;
        }
    }
    return Math.max(0, maxSum);
}`
};

export const MAX_SUM_BST_STAGE3_LINES = {
  entry: { java: 3, cpp: 4, python: 3, javascript: 2 },
  loopStart: { java: 9, cpp: 9, python: 7, javascript: 7 },
  pushLeftChain: { java: 10, cpp: 10, python: 8, javascript: 8 },
  peekTop: { java: 11, cpp: 11, python: 11, javascript: 9 },
  gotoRight: { java: 12, cpp: 12, python: 12, javascript: 10 },
  popStack: { java: 15, cpp: 15, python: 15, javascript: 13 },
  mergeInfo: { java: 18, cpp: 18, python: 18, javascript: 16 },
  validBst: { java: 19, cpp: 19, python: 19, javascript: 17 },
  invalidBst: { java: 23, cpp: 23, python: 23, javascript: 21 },
  setPrev: { java: 25, cpp: 25, python: 24, javascript: 24 },
  finish: { java: 28, cpp: 28, python: 25, javascript: 27 },
};
