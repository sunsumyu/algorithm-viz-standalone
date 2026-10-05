/**
 * 左程云算法通关课 Class 019: 二叉树高频递归套路 (Tree Recursion Patterns)
 * 三大阶段四语言源码实现与 1-based 精准代码行字典
 */

// ==========================================
// Stage 1: 平衡二叉树判定 (Is Balanced)
// ==========================================
export const TREE_RECURSION_019_CODES = {
  java: `public class TreeRecursion019 {
    // 树形 DP 递归信息结构体
    public static class Info {
        public boolean isBalanced;
        public int height;
        public Info(boolean b, int h) { isBalanced = b; height = h; }
    }

    public static Info process(TreeNode x) {
        if (x == null) {
            return new Info(true, 0); // 空树平且高度为0
        }
        Info leftInfo = process(x.left);
        Info rightInfo = process(x.right);

        int height = Math.max(leftInfo.height, rightInfo.height) + 1;
        boolean isBalanced = leftInfo.isBalanced && rightInfo.isBalanced 
            && Math.abs(leftInfo.height - rightInfo.height) <= 1;

        return new Info(isBalanced, height);
    }
}`,
  cpp: `struct Info {
    bool isBalanced;
    int height;
};

Info process(TreeNode* x) {
    if (!x) return {true, 0};
    Info leftInfo = process(x->left);
    Info rightInfo = process(x->right);

    int height = max(leftInfo.height, rightInfo.height) + 1;
    bool isBalanced = leftInfo.isBalanced && rightInfo.isBalanced &&
                      abs(leftInfo.height - rightInfo.height) <= 1;
    return {isBalanced, height};
}`,
  python: `class Info:
    def __init__(self, is_balanced: bool, height: int):
        self.is_balanced = is_balanced
        self.height = height

def process(x: TreeNode) -> Info:
    if not x:
        return Info(True, 0)
    left_info = process(x.left)
    right_info = process(x.right)
    
    height = max(left_info.height, right_info.height) + 1
    is_balanced = (left_info.is_balanced and right_info.is_balanced 
                   and abs(left_info.height - right_info.height) <= 1)
    return Info(is_balanced, height)`,
  typescript: `interface TreeInfo {
  isBalanced: boolean;
  height: number;
}

function process(node: TreeNode | null): TreeInfo {
  if (!node) return { isBalanced: true, height: 0 };
  const left = process(node.left);
  const right = process(node.right);
  const height = Math.max(left.height, right.height) + 1;
  const isBalanced = left.isBalanced && right.isBalanced 
    && Math.abs(left.height - right.height) <= 1;
  return { isBalanced, height };
}
`,
  javascript: `function process(node) {
  if (!node) return { isBalanced: true, height: 0 };
  const left = process(node.left);
  const right = process(node.right);
  const height = Math.max(left.height, right.height) + 1;
  const isBalanced = left.isBalanced && right.isBalanced 
    && Math.abs(left.height - right.height) <= 1;
  return { isBalanced, height };
}`,
};

export const TREE_RECURSION_019_CODE_LINES = {
  baseCase: { java: 10, cpp: 7, python: 7, typescript: 7, javascript: 2 },
  enterLeft: { java: 13, cpp: 8, python: 9, typescript: 8, javascript: 3 },
  leftDone: { java: 14, cpp: 9, python: 10, typescript: 9, javascript: 4 },
  rightDone: { java: 16, cpp: 11, python: 12, typescript: 10, javascript: 5 },
  returnInfo: { java: 20, cpp: 14, python: 15, typescript: 13, javascript: 7 },
};

// ==========================================
// Stage 2: 搜索二叉树判定 (Is BST)
// ==========================================
export const TREE_RECURSION_STAGE2_CODES = {
  java: `public class CheckBST {
    public static class Info {
        public boolean isBST;
        public int min;
        public int max;
        public Info(boolean isBST, int min, int max) {
            this.isBST = isBST; this.min = min; this.max = max;
        }
    }
    public static Info process(TreeNode x) {
        if (x == null) return null;
        Info left = process(x.left);
        Info right = process(x.right);
        int min = x.val, max = x.val;
        if (left != null) { min = Math.min(min, left.min); max = Math.max(max, left.max); }
        if (right != null) { min = Math.min(min, right.min); max = Math.max(max, right.max); }
        boolean isBST = true;
        if (left != null && (!left.isBST || left.max >= x.val)) isBST = false;
        if (right != null && (!right.isBST || right.min <= x.val)) isBST = false;
        return new Info(isBST, min, max);
    }
}`,
  cpp: `struct BSTInfo { bool isBST; int minVal; int maxVal; };
BSTInfo* process(TreeNode* x) {
    if (!x) return nullptr;
    auto left = process(x->left);
    auto right = process(x->right);
    int minVal = x->val, maxVal = x->val;
    if (left) { minVal = min(minVal, left->minVal); maxVal = max(maxVal, left->maxVal); }
    if (right) { minVal = min(minVal, right->minVal); maxVal = max(maxVal, right->maxVal); }
    bool isBST = true;
    if (left && (!left->isBST || left->maxVal >= x->val)) isBST = false;
    if (right && (!right->isBST || right->minVal <= x->val)) isBST = false;
    return new BSTInfo{isBST, minVal, maxVal};
}`,
  python: `class BSTInfo:
    def __init__(self, is_bst: bool, min_val: int, max_val: int):
        self.is_bst, self.min_val, self.max_val = is_bst, min_val, max_val

def process(x: TreeNode) -> BSTInfo | None:
    if not x:
        return None
    left = process(x.left)
    right = process(x.right)
    min_v, max_v = x.val, x.val
    if left:
        min_v = min(min_v, left.min_val); max_v = max(max_v, left.max_val)
    if right:
        min_v = min(min_v, right.min_val); max_v = max(max_v, right.max_val)
    is_bst = True
    if left and (not left.is_bst or left.max_val >= x.val): is_bst = False
    if right and (not right.is_bst or right.min_val <= x.val): is_bst = False
    return BSTInfo(is_bst, min_v, max_v)`,
  javascript: `function processBST(x) {
  if (!x) return null;
  const left = processBST(x.left);
  const right = processBST(x.right);
  let min = x.val, max = x.val;
  if (left) { min = Math.min(min, left.min); max = Math.max(max, left.max); }
  if (right) { min = Math.min(min, right.min); max = Math.max(max, right.max); }
  let isBST = true;
  if (left && (!left.isBST || left.max >= x.val)) isBST = false;
  if (right && (!right.isBST || right.min <= x.val)) isBST = false;
  return { isBST, min, max };
}`,
};

export const TREE_RECURSION_STAGE2_LINES = {
  baseCase: { java: 11, cpp: 3, python: 7, javascript: 2 },
  enterLeft: { java: 12, cpp: 4, python: 9, javascript: 3 },
  leftDone: { java: 13, cpp: 5, python: 10, javascript: 4 },
  rightDone: { java: 14, cpp: 6, python: 11, javascript: 5 },
  returnInfo: { java: 21, cpp: 13, python: 18, javascript: 11 },
};

// ==========================================
// Stage 3: 二叉树最大节点距离 (Max Distance)
// ==========================================
export const TREE_RECURSION_STAGE3_CODES = {
  java: `public class MaxDistance {
    public static class Info {
        public int maxDistance;
        public int height;
        public Info(int d, int h) { maxDistance = d; height = h; }
    }
    public static Info process(TreeNode x) {
        if (x == null) return new Info(0, 0);
        Info left = process(x.left);
        Info right = process(x.right);
        int height = Math.max(left.height, right.height) + 1;
        int p1 = left.maxDistance;
        int p2 = right.maxDistance;
        int p3 = left.height + right.height + 1;
        int maxDistance = Math.max(Math.max(p1, p2), p3);
        return new Info(maxDistance, height);
    }
}`,
  cpp: `struct DistInfo { int maxDistance; int height; };
DistInfo process(TreeNode* x) {
    if (!x) return {0, 0};
    auto left = process(x->left);
    auto right = process(x->right);
    int height = max(left.height, right.height) + 1;
    int p1 = left.maxDistance;
    int p2 = right.maxDistance;
    int p3 = left.height + right.height + 1;
    int maxDist = max(max(p1, p2), p3);
    return {maxDist, height};
}`,
  python: `class DistInfo:
    def __init__(self, max_dist: int, height: int):
        self.max_dist, self.height = max_dist, height

def process(x: TreeNode) -> DistInfo:
    if not x:
        return DistInfo(0, 0)
    left = process(x.left)
    right = process(x.right)
    height = max(left.height, right.height) + 1
    p1 = left.max_dist
    p2 = right.max_dist
    p3 = left.height + right.height + 1
    max_dist = max(p1, p2, p3)
    return DistInfo(max_dist, height)`,
  javascript: `function processDist(x) {
  if (!x) return { maxDistance: 0, height: 0 };
  const left = processDist(x.left);
  const right = processDist(x.right);
  const height = Math.max(left.height, right.height) + 1;
  const p1 = left.maxDistance;
  const p2 = right.maxDistance;
  const p3 = left.height + right.height + 1;
  const maxDistance = Math.max(p1, p2, p3);
  return { maxDistance, height };
}`,
};

export const TREE_RECURSION_STAGE3_LINES = {
  baseCase: { java: 8, cpp: 3, python: 7, javascript: 2 },
  enterLeft: { java: 9, cpp: 4, python: 9, javascript: 3 },
  leftDone: { java: 10, cpp: 5, python: 10, javascript: 4 },
  rightDone: { java: 11, cpp: 6, python: 11, javascript: 5 },
  returnInfo: { java: 16, cpp: 11, python: 15, javascript: 9 },
};
