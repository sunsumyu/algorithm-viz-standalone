/**
 * 左程云算法通关课 Class 020: 二叉树非递归与双栈遍历 (Iterative Tree Traversals)
 * 源码实现与 1-based 精准代码行字典
 */

export const TREE_TRAVERSAL_020_CODES = {
  java: `public class IterativeTraversals {
    // 先序遍历 (中左右)：弹出一个打印一个，先压右再压左
    public static List<Integer> preorder(TreeNode root) {
        List<Integer> ans = new ArrayList<>();
        if (root == null) return ans;
        Stack<TreeNode> stack = new Stack<>();
        stack.push(root);
        while (!stack.isEmpty()) {
            TreeNode cur = stack.pop();
            ans.add(cur.val);
            if (cur.right != null) stack.push(cur.right);
            if (cur.left != null) stack.push(cur.left);
        }
        return ans;
    }
    // 中序遍历 (左中右)：整条左边界全进栈，无法下潜时弹出并转向右子树
    public static List<Integer> inorder(TreeNode root) {
        List<Integer> ans = new ArrayList<>();
        Stack<TreeNode> stack = new Stack<>();
        TreeNode cur = root;
        while (!stack.isEmpty() || cur != null) {
            if (cur != null) {
                stack.push(cur);
                cur = cur.left;
            } else {
                cur = stack.pop();
                ans.add(cur.val);
                cur = cur.right;
            }
        }
        return ans;
    }
    // 后序遍历 (左右中)：双栈法，先按 中右左 压入收集栈，再弹出即为 左右中
    public static List<Integer> postorder(TreeNode root) {
        List<Integer> ans = new ArrayList<>();
        if (root == null) return ans;
        Stack<TreeNode> s1 = new Stack<>(), s2 = new Stack<>();
        s1.push(root);
        while (!s1.isEmpty()) {
            TreeNode cur = s1.pop();
            s2.push(cur);
            if (cur.left != null) s1.push(cur.left);
            if (cur.right != null) s1.push(cur.right);
        }
        while (!s2.isEmpty()) ans.add(s2.pop().val);
        return ans;
    }
}`,
  cpp: `vector<int> preorder(TreeNode* root) {
    vector<int> ans; if (!root) return ans;
    stack<TreeNode*> st; st.push(root);
    while (!st.empty()) {
        TreeNode* cur = st.top(); st.pop(); ans.push_back(cur->val);
        if (cur->right) st.push(cur->right);
        if (cur->left) st.push(cur->left);
    }
    return ans;
}
vector<int> inorder(TreeNode* root) {
    vector<int> ans; stack<TreeNode*> st; TreeNode* cur = root;
    while (!st.empty() || cur) {
        if (cur) { st.push(cur); cur = cur->left; }
        else { cur = st.top(); st.pop(); ans.push_back(cur->val); cur = cur->right; }
    }
    return ans;
}
vector<int> postorder(TreeNode* root) {
    vector<int> ans; if (!root) return ans;
    stack<TreeNode*> s1, s2; s1.push(root);
    while (!s1.empty()) {
        TreeNode* cur = s1.top(); s1.pop(); s2.push(cur);
        if (cur->left) s1.push(cur->left);
        if (cur->right) s1.push(cur->right);
    }
    while (!s2.empty()) { ans.push_back(s2.top()->val); s2.pop(); }
    return ans;
}`,
  python: `def preorder(root):
    if not root: return []
    ans, stack = [], [root]
    while stack:
        cur = stack.pop()
        ans.append(cur.val)
        if cur.right: stack.append(cur.right)
        if cur.left: stack.append(cur.left)
    return ans

def inorder(root):
    ans, stack, cur = [], [], root
    while stack or cur:
        if cur:
            stack.append(cur)
            cur = cur.left
        else:
            cur = stack.pop()
            ans.append(cur.val)
            cur = cur.right
    return ans

def postorder(root):
    if not root: return []
    s1, s2 = [root], []
    while s1:
        cur = s1.pop()
        s2.append(cur.val)
        if cur.left: s1.append(cur.left)
        if cur.right: s1.append(cur.right)
    return s2[::-1]`,
  typescript: `export function preorder(root: any): number[] {
    const ans: number[] = [];
    if (!root) return ans;
    const stack = [root];
    while (stack.length > 0) {
        const cur = stack.pop();
        ans.push(cur.val);
        if (cur.right) stack.push(cur.right);
        if (cur.left) stack.push(cur.left);
    }
    return ans;
}
export function inorder(root: any): number[] {
    const ans: number[] = [], stack: any[] = [];
    let cur = root;
    while (stack.length > 0 || cur) {
        if (cur) { stack.push(cur); cur = cur.left; }
        else { cur = stack.pop(); ans.push(cur.val); cur = cur.right; }
    }
    return ans;
}
export function postorder(root: any): number[] {
    if (!root) return [];
    const s1 = [root], s2: number[] = [];
    while (s1.length > 0) {
        const cur = s1.pop();
        s2.push(cur.val);
        if (cur.left) s1.push(cur.left);
        if (cur.right) s1.push(cur.right);
    }
    return s2.reverse();
}`,
  javascript: `function preorder(root) {
    const ans = [];
    if (!root) return ans;
    const stack = [root];
    while (stack.length > 0) {
        const cur = stack.pop();
        ans.push(cur.val);
        if (cur.right) stack.push(cur.right);
        if (cur.left) stack.push(cur.left);
    }
    return ans;
}
function inorder(root) {
    const ans = [], stack = [];
    let cur = root;
    while (stack.length > 0 || cur) {
        if (cur) { stack.push(cur); cur = cur.left; }
        else { cur = stack.pop(); ans.push(cur.val); cur = cur.right; }
    }
    return ans;
}
function postorder(root) {
    if (!root) return [];
    const s1 = [root], s2 = [];
    while (s1.length > 0) {
        const cur = s1.pop();
        s2.push(cur.val);
        if (cur.left) s1.push(cur.left);
        if (cur.right) s1.push(cur.right);
    }
    return s2.reverse();
}`,
};

export const TREE_TRAVERSAL_020_CODE_LINES = {
  preorder: {
    entry: { java: 3, cpp: 1, python: 1, typescript: 1, javascript: 1 },
    popVisit: { java: 9, cpp: 5, python: 5, typescript: 6, javascript: 6 },
    pushRight: { java: 11, cpp: 6, python: 7, typescript: 8, javascript: 8 },
    pushLeft: { java: 12, cpp: 7, python: 8, typescript: 9, javascript: 9 },
  },
  inorder: {
    entry: { java: 17, cpp: 11, python: 11, typescript: 13, javascript: 13 },
    pushLeft: { java: 23, cpp: 14, python: 15, typescript: 17, javascript: 17 },
    popVisitRight: { java: 26, cpp: 15, python: 18, typescript: 18, javascript: 18 },
  },
  postorder: {
    entry: { java: 34, cpp: 19, python: 23, typescript: 22, javascript: 22 },
    s1PopS2Push: { java: 40, cpp: 23, python: 27, typescript: 26, javascript: 26 },
    s2PopAns: { java: 45, cpp: 27, python: 31, typescript: 31, javascript: 31 },
  },
};
