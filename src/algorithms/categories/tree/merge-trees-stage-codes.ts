/**
 * LeetCode 617: 合并二叉树 (Merge Two Binary Trees)
 * 四语言权威解法与精准 1-Based 代码行号映射
 */

// ----------------------------------------------------
// Stage 1: 递归 DFS 同步下潜 (Simultaneous DFS)
// ----------------------------------------------------
export const MERGE_TREES_STAGE1_JAVA = `public class Solution {
    public TreeNode mergeTrees(TreeNode root1, TreeNode root2) {
        if (root1 == null) return root2;
        if (root2 == null) return root1;
        TreeNode merged = new TreeNode(root1.val + root2.val);
        merged.left = mergeTrees(root1.left, root2.left);
        merged.right = mergeTrees(root1.right, root2.right);
        return merged;
    }
}`;

export const MERGE_TREES_STAGE1_CPP = `class Solution {
public:
    TreeNode* mergeTrees(TreeNode* root1, TreeNode* root2) {
        if (!root1) return root2;
        if (!root2) return root1;
        TreeNode* merged = new TreeNode(root1->val + root2->val);
        merged->left = mergeTrees(root1->left, root2->left);
        merged->right = mergeTrees(root1->right, root2->right);
        return merged;
    }
};`;

export const MERGE_TREES_STAGE1_PYTHON = `class Solution:
    def mergeTrees(self, root1: Optional[TreeNode], root2: Optional[TreeNode]) -> Optional[TreeNode]:
        if not root1:
            return root2
        if not root2:
            return root1
        merged = TreeNode(root1.val + root2.val)
        merged.left = self.mergeTrees(root1.left, root2.left)
        merged.right = self.mergeTrees(root1.right, root2.right)
        return merged`;

export const MERGE_TREES_STAGE1_JS = `function mergeTrees(root1, root2) {
    if (!root1) return root2;
    if (!root2) return root1;
    const merged = new TreeNode(root1.val + root2.val);
    merged.left = mergeTrees(root1.left, root2.left);
    merged.right = mergeTrees(root1.right, root2.right);
    return merged;
}`;

export const MERGE_TREES_STAGE1_CODES = {
  java: MERGE_TREES_STAGE1_JAVA.split('\n'),
  cpp: MERGE_TREES_STAGE1_CPP.split('\n'),
  python: MERGE_TREES_STAGE1_PYTHON.split('\n'),
  javascript: MERGE_TREES_STAGE1_JS.split('\n'),
};

export const MERGE_TREES_STAGE1_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  check1: { java: 3, cpp: 4, python: 4, javascript: 2 },
  check2: { java: 4, cpp: 5, python: 6, javascript: 3 },
  createMerged: { java: 5, cpp: 6, python: 7, javascript: 4 },
  recurseLeft: { java: 6, cpp: 7, python: 8, javascript: 5 },
  recurseRight: { java: 7, cpp: 8, python: 9, javascript: 6 },
  returnMerged: { java: 8, cpp: 9, python: 10, javascript: 7 },
};

// ----------------------------------------------------
// Stage 2: 迭代 BFS 队列同步合并 (Iterative BFS Queue)
// ----------------------------------------------------
export const MERGE_TREES_STAGE2_JAVA = `public class Solution {
    public TreeNode mergeTrees(TreeNode root1, TreeNode root2) {
        if (root1 == null) return root2;
        if (root2 == null) return root1;
        Queue<TreeNode[]> queue = new LinkedList<>();
        queue.offer(new TreeNode[]{root1, root2});
        while (!queue.isEmpty()) {
            TreeNode[] pair = queue.poll();
            TreeNode n1 = pair[0], n2 = pair[1];
            n1.val += n2.val;
            if (n1.left != null && n2.left != null) {
                queue.offer(new TreeNode[]{n1.left, n2.left});
            } else if (n1.left == null) {
                n1.left = n2.left;
            }
            if (n1.right != null && n2.right != null) {
                queue.offer(new TreeNode[]{n1.right, n2.right});
            } else if (n1.right == null) {
                n1.right = n2.right;
            }
        }
        return root1;
    }
}`;

export const MERGE_TREES_STAGE2_CPP = `class Solution {
public:
    TreeNode* mergeTrees(TreeNode* root1, TreeNode* root2) {
        if (!root1) return root2;
        if (!root2) return root1;
        queue<pair<TreeNode*, TreeNode*>> q;
        q.push({root1, root2});
        while (!q.empty()) {
            auto [n1, n2] = q.front();
            q.pop();
            n1->val += n2->val;
            if (n1->left && n2->left) {
                q.push({n1->left, n2->left});
            } else if (!n1->left) {
                n1->left = n2->left;
            }
            if (n1->right && n2->right) {
                q.push({n1->right, n2->right});
            } else if (!n1->right) {
                n1->right = n2->right;
            }
        }
        return root1;
    }
};`;

export const MERGE_TREES_STAGE2_PYTHON = `class Solution:
    def mergeTrees(self, root1: Optional[TreeNode], root2: Optional[TreeNode]) -> Optional[TreeNode]:
        if not root1:
            return root2
        if not root2:
            return root1
        queue = collections.deque([(root1, root2)])
        while queue:
            n1, n2 = queue.popleft()
            n1.val += n2.val
            if n1.left and n2.left:
                queue.append((n1.left, n2.left))
            elif not n1.left:
                n1.left = n2.left
            if n1.right and n2.right:
                queue.append((n1.right, n2.right))
            elif not n1.right:
                n1.right = n2.right
        return root1`;

export const MERGE_TREES_STAGE2_JS = `function mergeTrees(root1, root2) {
    if (!root1) return root2;
    if (!root2) return root1;
    const queue = [[root1, root2]];
    while (queue.length > 0) {
        const [n1, n2] = queue.shift();
        n1.val += n2.val;
        if (n1.left && n2.left) {
            queue.push([n1.left, n2.left]);
        } else if (!n1.left) {
            n1.left = n2.left;
        }
        if (n1.right && n2.right) {
            queue.push([n1.right, n2.right]);
        } else if (!n1.right) {
            n1.right = n2.right;
        }
    }
    return root1;
}`;

export const MERGE_TREES_STAGE2_CODES = {
  java: MERGE_TREES_STAGE2_JAVA.split('\n'),
  cpp: MERGE_TREES_STAGE2_CPP.split('\n'),
  python: MERGE_TREES_STAGE2_PYTHON.split('\n'),
  javascript: MERGE_TREES_STAGE2_JS.split('\n'),
};

export const MERGE_TREES_STAGE2_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  check1: { java: 3, cpp: 4, python: 4, javascript: 2 },
  check2: { java: 4, cpp: 5, python: 6, javascript: 3 },
  initQueue: { java: 6, cpp: 7, python: 7, javascript: 4 },
  whileLoop: { java: 7, cpp: 8, python: 8, javascript: 5 },
  pollPair: { java: 8, cpp: 9, python: 9, javascript: 6 },
  addVal: { java: 10, cpp: 11, python: 10, javascript: 8 },
  checkLeftBoth: { java: 11, cpp: 12, python: 11, javascript: 9 },
  graftLeft: { java: 13, cpp: 14, python: 13, javascript: 11 },
  checkRightBoth: { java: 16, cpp: 17, python: 15, javascript: 13 },
  graftRight: { java: 18, cpp: 19, python: 17, javascript: 15 },
  returnRoot: { java: 22, cpp: 23, python: 19, javascript: 18 },
};
