/**
 * LeetCode 654: 最大二叉树 (Maximum Binary Tree)
 * 四语言权威解法与精准 1-Based 代码行号映射
 */

// ----------------------------------------------------
// Stage 1: 递归分治与区间扫描 (Recursive Divide & Conquer)
// ----------------------------------------------------
export const MAX_TREE_STAGE1_JAVA = `public class Solution {
    public TreeNode constructMaximumBinaryTree(int[] nums) {
        if (nums == null || nums.length == 0) return null;
        return build(nums, 0, nums.length - 1);
    }

    private TreeNode build(int[] nums, int l, int r) {
        if (l > r) return null;
        int maxIdx = l;
        for (int i = l + 1; i <= r; i++) {
            if (nums[i] > nums[maxIdx]) maxIdx = i;
        }
        TreeNode root = new TreeNode(nums[maxIdx]);
        root.left = build(nums, l, maxIdx - 1);
        root.right = build(nums, maxIdx + 1, r);
        return root;
    }
}`;

export const MAX_TREE_STAGE1_CPP = `class Solution {
public:
    TreeNode* constructMaximumBinaryTree(vector<int>& nums) {
        if (nums.empty()) return nullptr;
        return build(nums, 0, nums.size() - 1);
    }

private:
    TreeNode* build(vector<int>& nums, int l, int r) {
        if (l > r) return nullptr;
        int maxIdx = l;
        for (int i = l + 1; i <= r; i++) {
            if (nums[i] > nums[maxIdx]) maxIdx = i;
        }
        TreeNode* root = new TreeNode(nums[maxIdx]);
        root->left = build(nums, l, maxIdx - 1);
        root->right = build(nums, maxIdx + 1, r);
        return root;
    }
};`;

export const MAX_TREE_STAGE1_PYTHON = `class Solution:
    def constructMaximumBinaryTree(self, nums: List[int]) -> Optional[TreeNode]:
        if not nums:
            return None
        return self._build(nums, 0, len(nums) - 1)

    def _build(self, nums: List[int], l: int, r: int) -> Optional[TreeNode]:
        if l > r:
            return None
        max_idx = l
        for i in range(l + 1, r + 1):
            if nums[i] > nums[max_idx]:
                max_idx = i
        root = TreeNode(nums[max_idx])
        root.left = self._build(nums, l, max_idx - 1)
        root.right = self._build(nums, max_idx + 1, r)
        return root`;

export const MAX_TREE_STAGE1_JS = `function constructMaximumBinaryTree(nums) {
    if (!nums || nums.length === 0) return null;

    function build(l, r) {
        if (l > r) return null;
        let maxIdx = l;
        for (let i = l + 1; i <= r; i++) {
            if (nums[i] > nums[maxIdx]) maxIdx = i;
        }
        const root = new TreeNode(nums[maxIdx]);
        root.left = build(l, maxIdx - 1);
        root.right = build(maxIdx + 1, r);
        return root;
    }

    return build(0, nums.length - 1);
}`;

export const MAX_TREE_STAGE1_CODES = {
  java: MAX_TREE_STAGE1_JAVA.split('\n'),
  cpp: MAX_TREE_STAGE1_CPP.split('\n'),
  python: MAX_TREE_STAGE1_PYTHON.split('\n'),
  javascript: MAX_TREE_STAGE1_JS.split('\n'),
};

export const MAX_TREE_STAGE1_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  check: { java: 3, cpp: 4, python: 3, javascript: 2 },
  start: { java: 4, cpp: 5, python: 5, javascript: 16 },
  buildSignature: { java: 7, cpp: 9, python: 7, javascript: 4 },
  baseCase: { java: 8, cpp: 10, python: 8, javascript: 5 },
  initMax: { java: 9, cpp: 11, python: 10, javascript: 6 },
  scanLoop: { java: 10, cpp: 12, python: 11, javascript: 7 },
  updateMax: { java: 11, cpp: 13, python: 12, javascript: 8 },
  createNode: { java: 13, cpp: 15, python: 14, javascript: 10 },
  recurseLeft: { java: 14, cpp: 16, python: 15, javascript: 11 },
  recurseRight: { java: 15, cpp: 17, python: 16, javascript: 12 },
  returnRoot: { java: 16, cpp: 18, python: 17, javascript: 13 },
};

// ----------------------------------------------------
// Stage 2: 单调栈笛卡尔树 (Monotonic Stack Cartesian Tree, O(N))
// ----------------------------------------------------
export const MAX_TREE_STAGE2_JAVA = `public class Solution {
    public TreeNode constructMaximumBinaryTree(int[] nums) {
        if (nums == null || nums.length == 0) return null;
        Deque<TreeNode> stack = new ArrayDeque<>();
        for (int num : nums) {
            TreeNode curr = new TreeNode(num);
            while (!stack.isEmpty() && stack.peek().val < num) {
                curr.left = stack.pop();
            }
            if (!stack.isEmpty()) {
                stack.peek().right = curr;
            }
            stack.push(curr);
        }
        TreeNode root = null;
        while (!stack.isEmpty()) {
            root = stack.pop();
        }
        return root;
    }
}`;

export const MAX_TREE_STAGE2_CPP = `class Solution {
public:
    TreeNode* constructMaximumBinaryTree(vector<int>& nums) {
        if (nums.empty()) return nullptr;
        vector<TreeNode*> stack;
        for (int num : nums) {
            TreeNode* curr = new TreeNode(num);
            while (!stack.empty() && stack.back()->val < num) {
                curr->left = stack.back();
                stack.pop_back();
            }
            if (!stack.empty()) {
                stack.back()->right = curr;
            }
            stack.push_back(curr);
        }
        return stack.front();
    }
};`;

export const MAX_TREE_STAGE2_PYTHON = `class Solution:
    def constructMaximumBinaryTree(self, nums: List[int]) -> Optional[TreeNode]:
        if not nums:
            return None
        stack = []
        for num in nums:
            curr = TreeNode(num)
            while stack and stack[-1].val < num:
                curr.left = stack.pop()
            if stack:
                stack[-1].right = curr
            stack.append(curr)
        return stack[0]`;

export const MAX_TREE_STAGE2_JS = `function constructMaximumBinaryTree(nums) {
    if (!nums || nums.length === 0) return null;
    const stack = [];
    for (const num of nums) {
        const curr = new TreeNode(num);
        while (stack.length > 0 && stack[stack.length - 1].val < num) {
            curr.left = stack.pop();
        }
        if (stack.length > 0) {
            stack[stack.length - 1].right = curr;
        }
        stack.push(curr);
    }
    return stack[0];
}`;

export const MAX_TREE_STAGE2_CODES = {
  java: MAX_TREE_STAGE2_JAVA.split('\n'),
  cpp: MAX_TREE_STAGE2_CPP.split('\n'),
  python: MAX_TREE_STAGE2_PYTHON.split('\n'),
  javascript: MAX_TREE_STAGE2_JS.split('\n'),
};

export const MAX_TREE_STAGE2_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  check: { java: 3, cpp: 4, python: 3, javascript: 2 },
  initStack: { java: 4, cpp: 5, python: 5, javascript: 3 },
  forLoop: { java: 5, cpp: 6, python: 6, javascript: 4 },
  createCurr: { java: 6, cpp: 7, python: 7, javascript: 5 },
  whilePop: { java: 7, cpp: 8, python: 8, javascript: 6 },
  attachLeft: { java: 8, cpp: 9, python: 9, javascript: 7 },
  ifHasParent: { java: 10, cpp: 12, python: 10, javascript: 9 },
  attachRight: { java: 11, cpp: 13, python: 11, javascript: 10 },
  pushCurr: { java: 13, cpp: 15, python: 12, javascript: 12 },
  drainStack: { java: 15, cpp: 17, python: 13, javascript: 14 },
  findRoot: { java: 16, cpp: 17, python: 13, javascript: 14 },
  returnRoot: { java: 18, cpp: 17, python: 13, javascript: 14 },
};

// ----------------------------------------------------
// Stage 3: 显式任务栈迭代构建 (Explicit Construction Stack)
// ----------------------------------------------------
export const MAX_TREE_STAGE3_JAVA = `public class Solution {
    static class Task {
        TreeNode parent;
        boolean isLeft;
        int l, r;
        Task(TreeNode p, boolean left, int l, int r) {
            this.parent = p; this.isLeft = left; this.l = l; this.r = r;
        }
    }

    public TreeNode constructMaximumBinaryTree(int[] nums) {
        if (nums == null || nums.length == 0) return null;
        int maxIdx = findMax(nums, 0, nums.length - 1);
        TreeNode root = new TreeNode(nums[maxIdx]);
        Deque<Task> stack = new ArrayDeque<>();
        stack.push(new Task(root, true, 0, maxIdx - 1));
        stack.push(new Task(root, false, maxIdx + 1, nums.length - 1));
        while (!stack.isEmpty()) {
            Task t = stack.pop();
            if (t.l > t.r) continue;
            int m = findMax(nums, t.l, t.r);
            TreeNode child = new TreeNode(nums[m]);
            if (t.isLeft) t.parent.left = child;
            else t.parent.right = child;
            stack.push(new Task(child, true, t.l, m - 1));
            stack.push(new Task(child, false, m + 1, t.r));
        }
        return root;
    }
}`;

export const MAX_TREE_STAGE3_CPP = `class Solution {
    struct Task {
        TreeNode* parent;
        bool isLeft;
        int l, r;
    };
public:
    TreeNode* constructMaximumBinaryTree(vector<int>& nums) {
        if (nums.empty()) return nullptr;
        int maxIdx = findMax(nums, 0, nums.size() - 1);
        TreeNode* root = new TreeNode(nums[maxIdx]);
        vector<Task> stack;
        stack.push_back({root, true, 0, maxIdx - 1});
        stack.push_back({root, false, maxIdx + 1, (int)nums.size() - 1});
        while (!stack.empty()) {
            Task t = stack.back(); stack.pop_back();
            if (t.l > t.r) continue;
            int m = findMax(nums, t.l, t.r);
            TreeNode* child = new TreeNode(nums[m]);
            if (t.isLeft) t.parent->left = child;
            else t.parent->right = child;
            stack.push_back({child, true, t.l, m - 1});
            stack.push_back({child, false, m + 1, t.r});
        }
        return root;
    }
};`;

export const MAX_TREE_STAGE3_PYTHON = `class Solution:
    def constructMaximumBinaryTree(self, nums: List[int]) -> Optional[TreeNode]:
        if not nums:
            return None
        max_idx = self._find_max(nums, 0, len(nums) - 1)
        root = TreeNode(nums[max_idx])
        stack = [(root, True, 0, max_idx - 1), (root, False, max_idx + 1, len(nums) - 1)]
        while stack:
            parent, is_left, l, r = stack.pop()
            if l > r:
                continue
            m = self._find_max(nums, l, r)
            child = TreeNode(nums[m])
            if is_left:
                parent.left = child
            else:
                parent.right = child
            stack.append((child, True, l, m - 1))
            stack.append((child, False, m + 1, r))
        return root`;

export const MAX_TREE_STAGE3_JS = `function constructMaximumBinaryTree(nums) {
    if (!nums || nums.length === 0) return null;
    const maxIdx = findMax(nums, 0, nums.length - 1);
    const root = new TreeNode(nums[maxIdx]);
    const stack = [
        { parent: root, isLeft: true, l: 0, r: maxIdx - 1 },
        { parent: root, isLeft: false, l: maxIdx + 1, r: nums.length - 1 },
    ];
    while (stack.length > 0) {
        const { parent, isLeft, l, r } = stack.pop();
        if (l > r) continue;
        const m = findMax(nums, l, r);
        const child = new TreeNode(nums[m]);
        if (isLeft) parent.left = child;
        else parent.right = child;
        stack.push({ parent: child, isLeft: true, l, r: m - 1 });
        stack.push({ parent: child, isLeft: false, l: m + 1, r });
    }
    return root;
}`;

export const MAX_TREE_STAGE3_CODES = {
  java: MAX_TREE_STAGE3_JAVA.split('\n'),
  cpp: MAX_TREE_STAGE3_CPP.split('\n'),
  python: MAX_TREE_STAGE3_PYTHON.split('\n'),
  javascript: MAX_TREE_STAGE3_JS.split('\n'),
};

export const MAX_TREE_STAGE3_LINES = {
  entry: { java: 11, cpp: 9, python: 2, javascript: 1 },
  check: { java: 12, cpp: 10, python: 3, javascript: 2 },
  initRoot: { java: 14, cpp: 12, python: 6, javascript: 4 },
  pushSubtasks: { java: 16, cpp: 14, python: 7, javascript: 5 },
  whileLoop: { java: 18, cpp: 16, python: 8, javascript: 9 },
  popTask: { java: 19, cpp: 17, python: 9, javascript: 10 },
  checkBase: { java: 20, cpp: 18, python: 10, javascript: 11 },
  findChildMax: { java: 21, cpp: 19, python: 12, javascript: 12 },
  createChild: { java: 22, cpp: 20, python: 13, javascript: 13 },
  attachChild: { java: 24, cpp: 22, python: 15, javascript: 15 },
  pushNextTasks: { java: 26, cpp: 24, python: 18, javascript: 17 },
  returnRoot: { java: 28, cpp: 27, python: 20, javascript: 20 },
};
