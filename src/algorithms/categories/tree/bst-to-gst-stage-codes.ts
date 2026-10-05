/**
 * 把二叉搜索树转换为累加树多语言代码注册 (Convert BST to Greater Tree · LC 538 / LC 1038)
 * 严格支持 Java / C++ / Python / JavaScript 四语言 1-based 行号联动
 */

import { HighlightTarget } from '../../../core/step-visualizer';

// =========================================================================
// Stage 1: 反向中序遍历 (Reverse Inorder Traversal · 经典递归)
// =========================================================================
export const BST_TO_GST_STAGE1_JAVA = `class Solution {
    private int sum = 0;

    public TreeNode convertBST(TreeNode root) {
        sum = 0;
        reverseInorder(root);
        return root;
    }

    private void reverseInorder(TreeNode node) {
        if (node == null) return;
        reverseInorder(node.right);
        sum += node.val;
        node.val = sum;
        reverseInorder(node.left);
    }
}`;

export const BST_TO_GST_STAGE1_CPP = `class Solution {
private:
    int sum = 0;

public:
    TreeNode* convertBST(TreeNode* root) {
        sum = 0;
        reverseInorder(root);
        return root;
    }

    void reverseInorder(TreeNode* node) {
        if (!node) return;
        reverseInorder(node->right);
        sum += node->val;
        node->val = sum;
        reverseInorder(node->left);
    }
};`;

export const BST_TO_GST_STAGE1_PYTHON = `class Solution:
    def convertBST(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        total = 0

        def reverse_inorder(node: Optional[TreeNode]) -> None:
            nonlocal total
            if not node:
                return
            reverse_inorder(node.right)
            total += node.val
            node.val = total
            reverse_inorder(node.left)

        reverse_inorder(root)
        return root`;

export const BST_TO_GST_STAGE1_JS = `var convertBST = function(root) {
    let sum = 0;

    function reverseInorder(node) {
        if (!node) return;
        reverseInorder(node.right);
        sum += node.val;
        node.val = sum;
        reverseInorder(node.left);
    }

    reverseInorder(root);
    return root;
};`;

export const BST_TO_GST_STAGE1_CODES: Record<string, string> = {
  java: BST_TO_GST_STAGE1_JAVA,
  cpp: BST_TO_GST_STAGE1_CPP,
  python: BST_TO_GST_STAGE1_PYTHON,
  javascript: BST_TO_GST_STAGE1_JS,
};

export const BST_TO_GST_STAGE1_LINES: Record<string, HighlightTarget> = {
  entry: { java: 4, cpp: 6, python: 3, javascript: 2 },
  callReverseInorder: { java: 6, cpp: 8, python: 14, javascript: 12 },
  reverseInorderEnter: { java: 10, cpp: 12, python: 5, javascript: 4 },
  checkNull: { java: 11, cpp: 13, python: 7, javascript: 5 },
  rightRecurse: { java: 12, cpp: 14, python: 9, javascript: 6 },
  accumulateSum: { java: 13, cpp: 15, python: 10, javascript: 7 },
  updateNodeVal: { java: 14, cpp: 16, python: 11, javascript: 8 },
  leftRecurse: { java: 15, cpp: 17, python: 12, javascript: 9 },
  returnFrame: { java: 16, cpp: 18, python: 12, javascript: 10 },
  done: { java: 7, cpp: 9, python: 15, javascript: 13 },
};

// =========================================================================
// Stage 2: 显式单调栈迭代反向中序 (Iterative Explicit Stack Reverse Inorder)
// =========================================================================
export const BST_TO_GST_STAGE2_JAVA = `class Solution {
    public TreeNode convertBST(TreeNode root) {
        int sum = 0;
        Deque<TreeNode> stack = new ArrayDeque<>();
        TreeNode curr = root;

        while (curr != null || !stack.isEmpty()) {
            while (curr != null) {
                stack.push(curr);
                curr = curr.right;
            }
            curr = stack.pop();
            sum += curr.val;
            curr.val = sum;
            curr = curr.left;
        }
        return root;
    }
}`;

export const BST_TO_GST_STAGE2_CPP = `class Solution {
public:
    TreeNode* convertBST(TreeNode* root) {
        int sum = 0;
        stack<TreeNode*> st;
        TreeNode* curr = root;

        while (curr != nullptr || !st.empty()) {
            while (curr != nullptr) {
                st.push(curr);
                curr = curr->right;
            }
            curr = st.top();
            st.pop();
            sum += curr->val;
            curr->val = sum;
            curr = curr->left;
        }
        return root;
    }
};`;

export const BST_TO_GST_STAGE2_PYTHON = `class Solution:
    def convertBST(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        total = 0
        stack = []
        curr = root

        while curr or stack:
            while curr:
                stack.append(curr)
                curr = curr.right
            curr = stack.pop()
            total += curr.val
            curr.val = total
            curr = curr.left

        return root`;

export const BST_TO_GST_STAGE2_JS = `var convertBST = function(root) {
    let sum = 0;
    const stack = [];
    let curr = root;

    while (curr !== null || stack.length > 0) {
        while (curr !== null) {
            stack.push(curr);
            curr = curr.right;
        }
        curr = stack.pop();
        sum += curr.val;
        curr.val = sum;
        curr = curr.left;
    }
    return root;
};`;

export const BST_TO_GST_STAGE2_CODES: Record<string, string> = {
  java: BST_TO_GST_STAGE2_JAVA,
  cpp: BST_TO_GST_STAGE2_CPP,
  python: BST_TO_GST_STAGE2_PYTHON,
  javascript: BST_TO_GST_STAGE2_JS,
};

export const BST_TO_GST_STAGE2_LINES: Record<string, HighlightTarget> = {
  init: { java: 3, cpp: 4, python: 3, javascript: 2 },
  whileLoop: { java: 7, cpp: 8, python: 7, javascript: 6 },
  pushRight: { java: 9, cpp: 10, python: 9, javascript: 8 },
  popNode: { java: 12, cpp: 14, python: 11, javascript: 11 },
  accumulateSum: { java: 13, cpp: 15, python: 12, javascript: 12 },
  updateNodeVal: { java: 14, cpp: 16, python: 13, javascript: 13 },
  turnLeft: { java: 15, cpp: 17, python: 14, javascript: 14 },
  done: { java: 17, cpp: 19, python: 16, javascript: 16 },
};

// =========================================================================
// Stage 3: Morris 反向中序遍历 (Morris Reverse Inorder · O(1) 绝对常数空间)
// =========================================================================
export const BST_TO_GST_STAGE3_JAVA = `class Solution {
    public TreeNode convertBST(TreeNode root) {
        int sum = 0;
        TreeNode curr = root;

        while (curr != null) {
            if (curr.right == null) {
                sum += curr.val;
                curr.val = sum;
                curr = curr.left;
            } else {
                TreeNode mostLeft = curr.right;
                while (mostLeft.left != null && mostLeft.left != curr) {
                    mostLeft = mostLeft.left;
                }
                if (mostLeft.left == null) {
                    mostLeft.left = curr;
                    curr = curr.right;
                } else {
                    mostLeft.left = null;
                    sum += curr.val;
                    curr.val = sum;
                    curr = curr.left;
                }
            }
        }
        return root;
    }
}`;

export const BST_TO_GST_STAGE3_CPP = `class Solution {
public:
    TreeNode* convertBST(TreeNode* root) {
        int sum = 0;
        TreeNode* curr = root;

        while (curr != nullptr) {
            if (curr->right == nullptr) {
                sum += curr->val;
                curr->val = sum;
                curr = curr->left;
            } else {
                TreeNode* mostLeft = curr->right;
                while (mostLeft->left != nullptr && mostLeft->left != curr) {
                    mostLeft = mostLeft->left;
                }
                if (mostLeft->left == nullptr) {
                    mostLeft->left = curr;
                    curr = curr->right;
                } else {
                    mostLeft->left = nullptr;
                    sum += curr->val;
                    curr->val = sum;
                    curr = curr->left;
                }
            }
        }
        return root;
    }
};`;

export const BST_TO_GST_STAGE3_PYTHON = `class Solution:
    def convertBST(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        total = 0
        curr = root

        while curr:
            if not curr.right:
                total += curr.val
                curr.val = total
                curr = curr.left
            else:
                most_left = curr.right
                while most_left.left and most_left.left is not curr:
                    most_left = most_left.left
                if not most_left.left:
                    most_left.left = curr
                    curr = curr.right
                else:
                    most_left.left = None
                    total += curr.val
                    curr.val = total
                    curr = curr.left

        return root`;

export const BST_TO_GST_STAGE3_JS = `var convertBST = function(root) {
    let sum = 0;
    let curr = root;

    while (curr !== null) {
        if (curr.right === null) {
            sum += curr.val;
            curr.val = sum;
            curr = curr.left;
        } else {
            let mostLeft = curr.right;
            while (mostLeft.left !== null && mostLeft.left !== curr) {
                mostLeft = mostLeft.left;
            }
            if (mostLeft.left === null) {
                mostLeft.left = curr;
                curr = curr.right;
            } else {
                mostLeft.left = null;
                sum += curr.val;
                curr.val = sum;
                curr = curr.left;
            }
        }
    }
    return root;
};`;

export const BST_TO_GST_STAGE3_CODES: Record<string, string> = {
  java: BST_TO_GST_STAGE3_JAVA,
  cpp: BST_TO_GST_STAGE3_CPP,
  python: BST_TO_GST_STAGE3_PYTHON,
  javascript: BST_TO_GST_STAGE3_JS,
};

export const BST_TO_GST_STAGE3_LINES: Record<string, HighlightTarget> = {
  init: { java: 3, cpp: 4, python: 3, javascript: 2 },
  whileCheck: { java: 6, cpp: 7, python: 6, javascript: 5 },
  noRightSum: { java: 8, cpp: 9, python: 8, javascript: 7 },
  noRightUpdate: { java: 9, cpp: 10, python: 9, javascript: 8 },
  turnLeftNoRight: { java: 10, cpp: 11, python: 10, javascript: 9 },
  findPredecessor: { java: 12, cpp: 13, python: 12, javascript: 11 },
  buildThread: { java: 17, cpp: 18, python: 16, javascript: 16 },
  moveRight: { java: 18, cpp: 19, python: 17, javascript: 17 },
  cutThread: { java: 20, cpp: 21, python: 19, javascript: 19 },
  threadSum: { java: 21, cpp: 22, python: 20, javascript: 20 },
  threadUpdate: { java: 22, cpp: 23, python: 21, javascript: 21 },
  turnLeftThread: { java: 23, cpp: 24, python: 22, javascript: 22 },
  done: { java: 27, cpp: 28, python: 24, javascript: 25 },
};
