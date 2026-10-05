/**
 * 二叉搜索树中的众数多语言代码注册 (Find Mode in BST · LC 501)
 * 严格支持 Java / C++ / Python / JavaScript 四语言 1-based 行号联动
 */

import { HighlightTarget } from '../../../core/step-visualizer';

// =========================================================================
// Stage 1: 经典中序双指针在线动态结算递归 (Inorder Traversal with Dynamic Update)
// =========================================================================
export const BST_MODES_STAGE1_JAVA = `class Solution {
    private int count = 0;
    private int maxCount = 0;
    private TreeNode prev = null;
    private List<Integer> modes = new ArrayList<>();

    public int[] findMode(TreeNode root) {
        count = 0;
        maxCount = 0;
        prev = null;
        modes.clear();
        inorder(root);
        int[] res = new int[modes.size()];
        for (int i = 0; i < modes.size(); i++) res[i] = modes.get(i);
        return res;
    }

    private void inorder(TreeNode node) {
        if (node == null) return;
        inorder(node.left);
        if (prev != null && prev.val == node.val) {
            count++;
        } else {
            count = 1;
        }
        if (count > maxCount) {
            maxCount = count;
            modes.clear();
            modes.add(node.val);
        } else if (count == maxCount) {
            modes.add(node.val);
        }
        prev = node;
        inorder(node.right);
    }
}`;

export const BST_MODES_STAGE1_CPP = `class Solution {
private:
    int count = 0;
    int maxCount = 0;
    TreeNode* prev = nullptr;
    vector<int> modes;

public:
    vector<int> findMode(TreeNode* root) {
        count = 0;
        maxCount = 0;
        prev = nullptr;
        modes.clear();
        inorder(root);
        return modes;
    }

    void inorder(TreeNode* node) {
        if (!node) return;
        inorder(node->left);
        if (prev && prev->val == node->val) {
            count++;
        } else {
            count = 1;
        }
        if (count > maxCount) {
            maxCount = count;
            modes.clear();
            modes.push_back(node->val);
        } else if (count == maxCount) {
            modes.push_back(node->val);
        }
        prev = node;
        inorder(node->right);
    }
};`;

export const BST_MODES_STAGE1_PYTHON = `class Solution:
    def findMode(self, root: Optional[TreeNode]) -> List[int]:
        count = 0
        max_count = 0
        prev = None
        modes = []

        def inorder(node: Optional[TreeNode]) -> None:
            nonlocal count, max_count, prev, modes
            if not node:
                return
            inorder(node.left)
            if prev and prev.val == node.val:
                count += 1
            else:
                count = 1
            if count > max_count:
                max_count = count
                modes = [node.val]
            elif count == max_count:
                modes.append(node.val)
            prev = node
            inorder(node.right)

        inorder(root)
        return modes`;

export const BST_MODES_STAGE1_JS = `var findMode = function(root) {
    let count = 0;
    let maxCount = 0;
    let prev = null;
    let modes = [];

    function inorder(node) {
        if (!node) return;
        inorder(node.left);
        if (prev !== null && prev.val === node.val) {
            count++;
        } else {
            count = 1;
        }
        if (count > maxCount) {
            maxCount = count;
            modes = [node.val];
        } else if (count == maxCount) {
            modes.push(node.val);
        }
        prev = node;
        inorder(node.right);
    }

    inorder(root);
    return modes;
};`;

export const BST_MODES_STAGE1_CODES: Record<string, string> = {
  java: BST_MODES_STAGE1_JAVA,
  cpp: BST_MODES_STAGE1_CPP,
  python: BST_MODES_STAGE1_PYTHON,
  javascript: BST_MODES_STAGE1_JS,
};

export const BST_MODES_STAGE1_LINES: Record<string, HighlightTarget> = {
  entry: { java: 8, cpp: 10, python: 3, javascript: 2 },
  callInorder: { java: 12, cpp: 14, python: 24, javascript: 23 },
  inorderEnter: { java: 18, cpp: 18, python: 9, javascript: 7 },
  checkNull: { java: 19, cpp: 19, python: 11, javascript: 8 },
  leftRecurse: { java: 20, cpp: 20, python: 13, javascript: 9 },
  countUpdate: { java: 21, cpp: 21, python: 14, javascript: 10 },
  maxCountUpdate: { java: 26, cpp: 26, python: 18, javascript: 15 },
  updatePrev: { java: 33, cpp: 33, python: 22, javascript: 20 },
  rightRecurse: { java: 34, cpp: 34, python: 23, javascript: 21 },
  done: { java: 15, cpp: 15, python: 25, javascript: 24 },
};

// =========================================================================
// Stage 2: 显式单调栈迭代中序 (Iterative Explicit Stack Inorder)
// =========================================================================
export const BST_MODES_STAGE2_JAVA = `class Solution {
    public int[] findMode(TreeNode root) {
        if (root == null) return new int[0];
        List<Integer> modes = new ArrayList<>();
        Deque<TreeNode> stack = new ArrayDeque<>();
        TreeNode curr = root, prev = null;
        int count = 0, maxCount = 0;

        while (curr != null || !stack.isEmpty()) {
            while (curr != null) {
                stack.push(curr);
                curr = curr.left;
            }
            curr = stack.pop();
            if (prev != null && prev.val == curr.val) {
                count++;
            } else {
                count = 1;
            }
            if (count > maxCount) {
                maxCount = count;
                modes.clear();
                modes.add(curr.val);
            } else if (count == maxCount) {
                modes.add(curr.val);
            }
            prev = curr;
            curr = curr.right;
        }
        int[] res = new int[modes.size()];
        for (int i = 0; i < modes.size(); i++) res[i] = modes.get(i);
        return res;
    }
}`;

export const BST_MODES_STAGE2_CPP = `class Solution {
public:
    vector<int> findMode(TreeNode* root) {
        if (!root) return {};
        vector<int> modes;
        stack<TreeNode*> st;
        TreeNode *curr = root, *prev = nullptr;
        int count = 0, maxCount = 0;

        while (curr != nullptr || !st.empty()) {
            while (curr != nullptr) {
                st.push(curr);
                curr = curr->left;
            }
            curr = st.top();
            st.pop();
            if (prev != nullptr && prev->val == curr->val) {
                count++;
            } else {
                count = 1;
            }
            if (count > maxCount) {
                maxCount = count;
                modes.clear();
                modes.push_back(curr->val);
            } else if (count == maxCount) {
                modes.push_back(curr->val);
            }
            prev = curr;
            curr = curr->right;
        }
        return modes;
    }
};`;

export const BST_MODES_STAGE2_PYTHON = `class Solution:
    def findMode(self, root: Optional[TreeNode]) -> List[int]:
        if not root:
            return []
        modes = []
        stack = []
        curr = root
        prev = None
        count = 0
        max_count = 0

        while curr or stack:
            while curr:
                stack.append(curr)
                curr = curr.left
            curr = stack.pop()
            if prev and prev.val == curr.val:
                count += 1
            else:
                count = 1
            if count > max_count:
                max_count = count
                modes = [curr.val]
            elif count == max_count:
                modes.append(curr.val)
            prev = curr
            curr = curr.right

        return modes`;

export const BST_MODES_STAGE2_JS = `var findMode = function(root) {
    if (!root) return [];
    let modes = [];
    const stack = [];
    let curr = root;
    let prev = null;
    let count = 0;
    let maxCount = 0;

    while (curr !== null || stack.length > 0) {
        while (curr !== null) {
            stack.push(curr);
            curr = curr.left;
        }
        curr = stack.pop();
        if (prev !== null && prev.val === curr.val) {
            count++;
        } else {
            count = 1;
        }
        if (count > maxCount) {
            maxCount = count;
            modes = [curr.val];
        } else if (count === maxCount) {
            modes.push(curr.val);
        }
        prev = curr;
        curr = curr.right;
    }
    return modes;
};`;

export const BST_MODES_STAGE2_CODES: Record<string, string> = {
  java: BST_MODES_STAGE2_JAVA,
  cpp: BST_MODES_STAGE2_CPP,
  python: BST_MODES_STAGE2_PYTHON,
  javascript: BST_MODES_STAGE2_JS,
};

export const BST_MODES_STAGE2_LINES: Record<string, HighlightTarget> = {
  init: { java: 4, cpp: 5, python: 5, javascript: 3 },
  whileLoop: { java: 9, cpp: 9, python: 12, javascript: 10 },
  pushLeft: { java: 11, cpp: 11, python: 14, javascript: 12 },
  popNode: { java: 14, cpp: 15, python: 16, javascript: 15 },
  countUpdate: { java: 15, cpp: 16, python: 17, javascript: 16 },
  maxCountUpdate: { java: 20, cpp: 21, python: 21, javascript: 21 },
  updatePrev: { java: 27, cpp: 28, python: 25, javascript: 26 },
  turnRight: { java: 28, cpp: 29, python: 26, javascript: 27 },
  done: { java: 32, cpp: 31, python: 28, javascript: 29 },
};

// =========================================================================
// Stage 3: Morris 中序遍历 (O(1) 常数空间进阶算法)
// =========================================================================
export const BST_MODES_STAGE3_JAVA = `class Solution {
    public int[] findMode(TreeNode root) {
        if (root == null) return new int[0];
        List<Integer> modes = new ArrayList<>();
        TreeNode curr = root, prev = null;
        int count = 0, maxCount = 0;

        while (curr != null) {
            if (curr.left == null) {
                if (prev != null && prev.val == curr.val) count++;
                else count = 1;
                if (count > maxCount) {
                    maxCount = count;
                    modes.clear();
                    modes.add(curr.val);
                } else if (count == maxCount) {
                    modes.add(curr.val);
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
                    if (prev != null && prev.val == curr.val) count++;
                    else count = 1;
                    if (count > maxCount) {
                        maxCount = count;
                        modes.clear();
                        modes.add(curr.val);
                    } else if (count == maxCount) {
                        modes.add(curr.val);
                    }
                    prev = curr;
                    curr = curr.right;
                }
            }
        }
        int[] res = new int[modes.size()];
        for (int i = 0; i < modes.size(); i++) res[i] = modes.get(i);
        return res;
    }
}`;

export const BST_MODES_STAGE3_CPP = `class Solution {
public:
    vector<int> findMode(TreeNode* root) {
        if (!root) return {};
        vector<int> modes;
        TreeNode *curr = root, *prev = nullptr;
        int count = 0, maxCount = 0;

        while (curr != nullptr) {
            if (curr->left == nullptr) {
                if (prev && prev->val == curr->val) count++;
                else count = 1;
                if (count > maxCount) {
                    maxCount = count;
                    modes.clear();
                    modes.push_back(curr->val);
                } else if (count == maxCount) {
                    modes.push_back(curr->val);
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
                    if (prev && prev->val == curr->val) count++;
                    else count = 1;
                    if (count > maxCount) {
                        maxCount = count;
                        modes.clear();
                        modes.push_back(curr->val);
                    } else if (count == maxCount) {
                        modes.push_back(curr->val);
                    }
                    prev = curr;
                    curr = curr->right;
                }
            }
        }
        return modes;
    }
};`;

export const BST_MODES_STAGE3_PYTHON = `class Solution:
    def findMode(self, root: Optional[TreeNode]) -> List[int]:
        if not root:
            return []
        modes = []
        curr = root
        prev = None
        count = 0
        max_count = 0

        while curr:
            if not curr.left:
                if prev and prev.val == curr.val:
                    count += 1
                else:
                    count = 1
                if count > max_count:
                    max_count = count
                    modes = [curr.val]
                elif count == max_count:
                    modes.append(curr.val)
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
                    if prev and prev.val == curr.val:
                        count += 1
                    else:
                        count = 1
                    if count > max_count:
                        max_count = count
                        modes = [curr.val]
                    elif count == max_count:
                        modes.append(curr.val)
                    prev = curr
                    curr = curr.right

        return modes`;

export const BST_MODES_STAGE3_JS = `var findMode = function(root) {
    if (!root) return [];
    let modes = [];
    let curr = root;
    let prev = null;
    let count = 0;
    let maxCount = 0;

    while (curr !== null) {
        if (curr.left === null) {
            if (prev !== null && prev.val === curr.val) count++;
            else count = 1;
            if (count > maxCount) {
                maxCount = count;
                modes = [curr.val];
            } else if (count === maxCount) {
                modes.push(curr.val);
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
                if (prev !== null && prev.val === curr.val) count++;
                else count = 1;
                if (count > maxCount) {
                    maxCount = count;
                    modes = [curr.val];
                } else if (count === maxCount) {
                    modes.push(curr.val);
                }
                prev = curr;
                curr = curr.right;
            }
        }
    }
    return modes;
};`;

export const BST_MODES_STAGE3_CODES: Record<string, string> = {
  java: BST_MODES_STAGE3_JAVA,
  cpp: BST_MODES_STAGE3_CPP,
  python: BST_MODES_STAGE3_PYTHON,
  javascript: BST_MODES_STAGE3_JS,
};

export const BST_MODES_STAGE3_LINES: Record<string, HighlightTarget> = {
  init: { java: 4, cpp: 5, python: 5, javascript: 3 },
  whileCheck: { java: 8, cpp: 8, python: 11, javascript: 9 },
  countNoLeft: { java: 10, cpp: 10, python: 13, javascript: 11 },
  maxCountNoLeft: { java: 12, cpp: 12, python: 17, javascript: 13 },
  updatePrevNoLeft: { java: 19, cpp: 19, python: 21, javascript: 18 },
  turnRightNoLeft: { java: 20, cpp: 20, python: 22, javascript: 19 },
  findPredecessor: { java: 22, cpp: 22, python: 24, javascript: 21 },
  buildThread: { java: 27, cpp: 27, python: 28, javascript: 26 },
  moveLeft: { java: 28, cpp: 28, python: 29, javascript: 27 },
  cutThread: { java: 30, cpp: 30, python: 31, javascript: 29 },
  countThread: { java: 31, cpp: 31, python: 32, javascript: 30 },
  maxCountThread: { java: 33, cpp: 33, python: 36, javascript: 32 },
  updatePrevThread: { java: 40, cpp: 40, python: 40, javascript: 37 },
  turnRightThread: { java: 41, cpp: 41, python: 41, javascript: 38 },
  done: { java: 47, cpp: 46, python: 43, javascript: 42 },
};
