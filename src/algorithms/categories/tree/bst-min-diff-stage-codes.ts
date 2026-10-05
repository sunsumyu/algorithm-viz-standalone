/**
 * 二叉搜索树最小绝对差多语言代码注册 (BST Minimum Absolute Difference · LC 530 / LC 783)
 * 严格支持 Java / C++ / Python / JavaScript 四语言 1-based 行号联动
 */

import { HighlightTarget } from '../../../core/step-visualizer';

// =========================================================================
// Stage 1: 经典中序双指针递归 (Inorder Traversal with Prev Pointer)
// =========================================================================
export const BST_MIN_DIFF_STAGE1_JAVA = `class Solution {
    private int minDiff = Integer.MAX_VALUE;
    private TreeNode prev = null;

    public int getMinimumDifference(TreeNode root) {
        minDiff = Integer.MAX_VALUE;
        prev = null;
        inorder(root);
        return minDiff;
    }

    private void inorder(TreeNode node) {
        if (node == null) return;
        inorder(node.left);
        if (prev != null) {
            minDiff = Math.min(minDiff, node.val - prev.val);
        }
        prev = node;
        inorder(node.right);
    }
}`;

export const BST_MIN_DIFF_STAGE1_CPP = `class Solution {
private:
    int minDiff = INT_MAX;
    TreeNode* prev = nullptr;

public:
    int getMinimumDifference(TreeNode* root) {
        minDiff = INT_MAX;
        prev = nullptr;
        inorder(root);
        return minDiff;
    }

    void inorder(TreeNode* node) {
        if (!node) return;
        inorder(node->left);
        if (prev) {
            minDiff = min(minDiff, node->val - prev->val);
        }
        prev = node;
        inorder(node->right);
    }
};`;

export const BST_MIN_DIFF_STAGE1_PYTHON = `class Solution:
    def getMinimumDifference(self, root: Optional[TreeNode]) -> int:
        min_diff = float('inf')
        prev = None

        def inorder(node: Optional[TreeNode]) -> None:
            nonlocal min_diff, prev
            if not node:
                return
            inorder(node.left)
            if prev is not None:
                min_diff = min(min_diff, node.val - prev.val)
            prev = node
            inorder(node.right)

        inorder(root)
        return int(min_diff)`;

export const BST_MIN_DIFF_STAGE1_JS = `var getMinimumDifference = function(root) {
    let minDiff = Infinity;
    let prev = null;

    function inorder(node) {
        if (!node) return;
        inorder(node.left);
        if (prev !== null) {
            minDiff = Math.min(minDiff, node.val - prev.val);
        }
        prev = node;
        inorder(node.right);
    }

    inorder(root);
    return minDiff;
};`;

export const BST_MIN_DIFF_STAGE1_CODES: Record<string, string> = {
  java: BST_MIN_DIFF_STAGE1_JAVA,
  cpp: BST_MIN_DIFF_STAGE1_CPP,
  python: BST_MIN_DIFF_STAGE1_PYTHON,
  javascript: BST_MIN_DIFF_STAGE1_JS,
};

export const BST_MIN_DIFF_STAGE1_LINES: Record<string, HighlightTarget> = {
  entry: { java: 6, cpp: 8, python: 3, javascript: 2 },
  callInorder: { java: 8, cpp: 10, python: 16, javascript: 15 },
  inorderEnter: { java: 12, cpp: 14, python: 6, javascript: 5 },
  checkNull: { java: 13, cpp: 15, python: 8, javascript: 6 },
  leftRecurse: { java: 14, cpp: 16, python: 10, javascript: 7 },
  checkPrev: { java: 15, cpp: 17, python: 11, javascript: 8 },
  calcDiff: { java: 16, cpp: 18, python: 12, javascript: 9 },
  updatePrev: { java: 18, cpp: 20, python: 13, javascript: 11 },
  rightRecurse: { java: 19, cpp: 21, python: 14, javascript: 12 },
  returnFrame: { java: 20, cpp: 22, python: 14, javascript: 13 },
  done: { java: 9, cpp: 11, python: 17, javascript: 16 },
};

// =========================================================================
// Stage 2: 显式单调栈迭代中序 (Iterative Explicit Stack Inorder)
// =========================================================================
export const BST_MIN_DIFF_STAGE2_JAVA = `class Solution {
    public int getMinimumDifference(TreeNode root) {
        int minDiff = Integer.MAX_VALUE;
        TreeNode prev = null;
        Deque<TreeNode> stack = new ArrayDeque<>();
        TreeNode curr = root;

        while (curr != null || !stack.isEmpty()) {
            while (curr != null) {
                stack.push(curr);
                curr = curr.left;
            }
            curr = stack.pop();
            if (prev != null) {
                minDiff = Math.min(minDiff, curr.val - prev.val);
            }
            prev = curr;
            curr = curr.right;
        }
        return minDiff;
    }
}`;

export const BST_MIN_DIFF_STAGE2_CPP = `class Solution {
public:
    int getMinimumDifference(TreeNode* root) {
        int minDiff = INT_MAX;
        TreeNode* prev = nullptr;
        stack<TreeNode*> st;
        TreeNode* curr = root;

        while (curr != nullptr || !st.empty()) {
            while (curr != nullptr) {
                st.push(curr);
                curr = curr->left;
            }
            curr = st.top();
            st.pop();
            if (prev != nullptr) {
                minDiff = min(minDiff, curr->val - prev->val);
            }
            prev = curr;
            curr = curr->right;
        }
        return minDiff;
    }
};`;

export const BST_MIN_DIFF_STAGE2_PYTHON = `class Solution:
    def getMinimumDifference(self, root: Optional[TreeNode]) -> int:
        min_diff = float('inf')
        prev = None
        stack = []
        curr = root

        while curr or stack:
            while curr:
                stack.append(curr)
                curr = curr.left
            curr = stack.pop()
            if prev is not None:
                min_diff = min(min_diff, curr.val - prev.val)
            prev = curr
            curr = curr.right

        return int(min_diff)`;

export const BST_MIN_DIFF_STAGE2_JS = `var getMinimumDifference = function(root) {
    let minDiff = Infinity;
    let prev = null;
    const stack = [];
    let curr = root;

    while (curr !== null || stack.length > 0) {
        while (curr !== null) {
            stack.push(curr);
            curr = curr.left;
        }
        curr = stack.pop();
        if (prev !== null) {
            minDiff = Math.min(minDiff, curr.val - prev.val);
        }
        prev = curr;
        curr = curr.right;
    }
    return minDiff;
};`;

export const BST_MIN_DIFF_STAGE2_CODES: Record<string, string> = {
  java: BST_MIN_DIFF_STAGE2_JAVA,
  cpp: BST_MIN_DIFF_STAGE2_CPP,
  python: BST_MIN_DIFF_STAGE2_PYTHON,
  javascript: BST_MIN_DIFF_STAGE2_JS,
};

export const BST_MIN_DIFF_STAGE2_LINES: Record<string, HighlightTarget> = {
  init: { java: 3, cpp: 4, python: 3, javascript: 2 },
  whileLoop: { java: 8, cpp: 9, python: 8, javascript: 7 },
  pushLeft: { java: 10, cpp: 11, python: 10, javascript: 9 },
  popNode: { java: 13, cpp: 15, python: 12, javascript: 12 },
  checkPrev: { java: 14, cpp: 16, python: 13, javascript: 13 },
  calcDiff: { java: 15, cpp: 17, python: 14, javascript: 14 },
  updatePrev: { java: 17, cpp: 19, python: 15, javascript: 16 },
  turnRight: { java: 18, cpp: 20, python: 16, javascript: 17 },
  done: { java: 20, cpp: 22, python: 18, javascript: 19 },
};

// =========================================================================
// Stage 3: Morris 中序遍历 (O(1) 常数空间神级算法)
// =========================================================================
export const BST_MIN_DIFF_STAGE3_JAVA = `class Solution {
    public int getMinimumDifference(TreeNode root) {
        int minDiff = Integer.MAX_VALUE;
        TreeNode prev = null;
        TreeNode curr = root;

        while (curr != null) {
            if (curr.left == null) {
                if (prev != null) {
                    minDiff = Math.min(minDiff, curr.val - prev.val);
                }
                prev = curr;
                curr = curr.right;
            } else {
                TreeNode mostRight = curr.left;
                while (mostRight.right != null && mostRight.right != curr) {
                    mostRight = mostRight.right;
                }
                if (mostRight.right == null) {
                    mostRight.right = curr;
                    curr = curr.left;
                } else {
                    mostRight.right = null;
                    if (prev != null) {
                        minDiff = Math.min(minDiff, curr.val - prev.val);
                    }
                    prev = curr;
                    curr = curr.right;
                }
            }
        }
        return minDiff;
    }
}`;

export const BST_MIN_DIFF_STAGE3_CPP = `class Solution {
public:
    int getMinimumDifference(TreeNode* root) {
        int minDiff = INT_MAX;
        TreeNode* prev = nullptr;
        TreeNode* curr = root;

        while (curr != nullptr) {
            if (curr->left == nullptr) {
                if (prev != nullptr) {
                    minDiff = min(minDiff, curr->val - prev->val);
                }
                prev = curr;
                curr = curr->right;
            } else {
                TreeNode* mostRight = curr->left;
                while (mostRight->right != nullptr && mostRight->right != curr) {
                    mostRight = mostRight->right;
                }
                if (mostRight->right == nullptr) {
                    mostRight->right = curr;
                    curr = curr->left;
                } else {
                    mostRight->right = nullptr;
                    if (prev != nullptr) {
                        minDiff = min(minDiff, curr->val - prev->val);
                    }
                    prev = curr;
                    curr = curr->right;
                }
            }
        }
        return minDiff;
    }
};`;

export const BST_MIN_DIFF_STAGE3_PYTHON = `class Solution:
    def getMinimumDifference(self, root: Optional[TreeNode]) -> int:
        min_diff = float('inf')
        prev = None
        curr = root

        while curr:
            if not curr.left:
                if prev is not None:
                    min_diff = min(min_diff, curr.val - prev.val)
                prev = curr
                curr = curr.right
            else:
                most_right = curr.left
                while most_right.right and most_right.right is not curr:
                    most_right = most_right.right
                if not most_right.right:
                    most_right.right = curr
                    curr = curr.left
                else:
                    most_right.right = None
                    if prev is not None:
                        min_diff = min(min_diff, curr.val - prev.val)
                    prev = curr
                    curr = curr.right

        return int(min_diff)`;

export const BST_MIN_DIFF_STAGE3_JS = `var getMinimumDifference = function(root) {
    let minDiff = Infinity;
    let prev = null;
    let curr = root;

    while (curr !== null) {
        if (curr.left === null) {
            if (prev !== null) {
                minDiff = Math.min(minDiff, curr.val - prev.val);
            }
            prev = curr;
            curr = curr.right;
        } else {
            let mostRight = curr.left;
            while (mostRight.right !== null && mostRight.right !== curr) {
                mostRight = mostRight.right;
            }
            if (mostRight.right === null) {
                mostRight.right = curr;
                curr = curr.left;
            } else {
                mostRight.right = null;
                if (prev !== null) {
                    minDiff = Math.min(minDiff, curr.val - prev.val);
                }
                prev = curr;
                curr = curr.right;
            }
        }
    }
    return minDiff;
};`;

export const BST_MIN_DIFF_STAGE3_CODES: Record<string, string> = {
  java: BST_MIN_DIFF_STAGE3_JAVA,
  cpp: BST_MIN_DIFF_STAGE3_CPP,
  python: BST_MIN_DIFF_STAGE3_PYTHON,
  javascript: BST_MIN_DIFF_STAGE3_JS,
};

export const BST_MIN_DIFF_STAGE3_LINES: Record<string, HighlightTarget> = {
  init: { java: 3, cpp: 4, python: 3, javascript: 2 },
  whileCheck: { java: 7, cpp: 8, python: 7, javascript: 6 },
  checkLeftNull: { java: 8, cpp: 9, python: 8, javascript: 7 },
  calcDiffNoLeft: { java: 10, cpp: 11, python: 10, javascript: 9 },
  updatePrevNoLeft: { java: 12, cpp: 13, python: 11, javascript: 11 },
  turnRightNoLeft: { java: 13, cpp: 14, python: 12, javascript: 12 },
  findPredecessor: { java: 15, cpp: 16, python: 14, javascript: 14 },
  checkThreadNull: { java: 19, cpp: 20, python: 17, javascript: 18 },
  buildThread: { java: 20, cpp: 21, python: 18, javascript: 19 },
  moveLeft: { java: 21, cpp: 22, python: 19, javascript: 20 },
  cutThread: { java: 23, cpp: 24, python: 21, javascript: 22 },
  calcDiffThread: { java: 25, cpp: 26, python: 23, javascript: 24 },
  updatePrevThread: { java: 27, cpp: 28, python: 24, javascript: 26 },
  turnRightThread: { java: 28, cpp: 29, python: 25, javascript: 27 },
  done: { java: 32, cpp: 33, python: 27, javascript: 31 },
};
