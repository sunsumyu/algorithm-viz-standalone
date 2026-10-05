/**
 * 寻找重复的子树 (LeetCode 652) 多阶段代码定义与行号映射
 */

// ============================================================
// Stage 1: 经典后序序列化与哈希查重 (兼容原有契约测试)
// ============================================================
export const FIND_DUPLICATE_SUBTREES_STAGE1_CODES: Record<string, string> = {
  java: `public class Solution {
    private Map<String, Integer> count = new HashMap<>();
    private List<TreeNode> res = new ArrayList<>();

    public List<TreeNode> findDuplicateSubtrees(TreeNode root) {
        dfs(root);
        return res;
    }

    private String dfs(TreeNode node) {
        if (node == null) return "#";
        String left = dfs(node.left);
        String right = dfs(node.right);
        String serial = left + "," + right + "," + node.val;
        int freq = count.getOrDefault(serial, 0) + 1;
        count.put(serial, freq);
        if (freq == 2) {
            res.add(node);
        }
        return serial;
    }
}`,
  cpp: `class Solution {
    unordered_map<string, int> count;
    vector<TreeNode*> res;
public:
    vector<TreeNode*> findDuplicateSubtrees(TreeNode* root) {
        dfs(root);
        return res;
    }

    string dfs(TreeNode* node) {
        if (!node) return "#";
        string left = dfs(node->left);
        string right = dfs(node->right);
        string serial = left + "," + right + "," + to_string(node->val);
        if (++count[serial] == 2) {
            res.push_back(node);
        }
        return serial;
    }
};`,
  python: `class Solution:
    def findDuplicateSubtrees(self, root: Optional[TreeNode]) -> List[Optional[TreeNode]]:
        count = collections.defaultdict(int)
        res = []

        def dfs(node):
            if not node:
                return "#"
            serial = f"{dfs(node.left)},{dfs(node.right)},{node.val}"
            count[serial] += 1
            if count[serial] == 2:
                res.append(node)
            return serial

        dfs(root)
        return res`,
  javascript: `function findDuplicateSubtrees(root) {
    const count = new Map();
    const res = [];

    function dfs(node) {
        if (!node) return "#";
        const left = dfs(node.left);
        const right = dfs(node.right);
        const serial = left + "," + right + "," + node.val;
        const freq = (count.get(serial) || 0) + 1;
        count.set(serial, freq);
        if (freq === 2) {
            res.push(node);
        }
        return serial;
    }

    dfs(root);
    return res;
}`
};

export const FIND_DUPLICATE_SUBTREES_CODES = FIND_DUPLICATE_SUBTREES_STAGE1_CODES;

export const FIND_DUPLICATE_SUBTREES_STAGE1_LINES: Record<string, Record<string, number>> = {
  entry: { java: 6, cpp: 6, python: 15, javascript: 18 },
  dfsEntry: { java: 11, cpp: 11, python: 6, javascript: 5 },
  dfsNull: { java: 12, cpp: 12, python: 7, javascript: 6 },
  dfsLeft: { java: 13, cpp: 13, python: 9, javascript: 7 },
  dfsRight: { java: 14, cpp: 14, python: 9, javascript: 8 },
  serial: { java: 15, cpp: 15, python: 9, javascript: 9 },
  count: { java: 16, cpp: 16, python: 10, javascript: 11 },
  addRes: { java: 19, cpp: 17, python: 12, javascript: 13 },
  dfsReturn: { java: 21, cpp: 19, python: 13, javascript: 15 },
  returnAns: { java: 8, cpp: 8, python: 16, javascript: 19 }
};

// ============================================================
// Stage 2: 唯一三元组 ID 整数三元映射极速哈希 (O(N) 工业级)
// ============================================================
export const FIND_DUPLICATE_SUBTREES_STAGE2_CODES: Record<string, string> = {
  java: `public class Solution {
    private Map<String, Integer> seen = new HashMap<>();
    private Map<Integer, Integer> count = new HashMap<>();
    private List<TreeNode> res = new ArrayList<>();
    private int nextUid = 1;

    public List<TreeNode> findDuplicateSubtrees(TreeNode root) {
        getUid(root);
        return res;
    }

    private int getUid(TreeNode node) {
        if (node == null) return 0;
        int leftUid = getUid(node.left);
        int rightUid = getUid(node.right);
        String triplet = node.val + "," + leftUid + "," + rightUid;
        int uid = seen.computeIfAbsent(triplet, k -> nextUid++);
        int freq = count.getOrDefault(uid, 0) + 1;
        count.put(uid, freq);
        if (freq == 2) {
            res.add(node);
        }
        return uid;
    }
}`,
  cpp: `class Solution {
    unordered_map<string, int> seen;
    unordered_map<int, int> count;
    vector<TreeNode*> res;
    int nextUid = 1;
public:
    vector<TreeNode*> findDuplicateSubtrees(TreeNode* root) {
        getUid(root);
        return res;
    }

    int getUid(TreeNode* node) {
        if (!node) return 0;
        int leftUid = getUid(node->left);
        int rightUid = getUid(node->right);
        string triplet = to_string(node->val) + "," + to_string(leftUid) + "," + to_string(rightUid);
        if (!seen.count(triplet)) seen[triplet] = nextUid++;
        int uid = seen[triplet];
        if (++count[uid] == 2) {
            res.push_back(node);
        }
        return uid;
    }
};`,
  python: `class Solution:
    def findDuplicateSubtrees(self, root: Optional[TreeNode]) -> List[Optional[TreeNode]]:
        seen = {}
        count = collections.defaultdict(int)
        res = []
        next_uid = 1

        def get_uid(node):
            nonlocal next_uid
            if not node:
                return 0
            left_uid = get_uid(node.left)
            right_uid = get_uid(node.right)
            triplet = (node.val, left_uid, right_uid)
            if triplet not in seen:
                seen[triplet] = next_uid
                next_uid += 1
            uid = seen[triplet]
            count[uid] += 1
            if count[uid] == 2:
                res.append(node)
            return uid

        get_uid(root)
        return res`,
  javascript: `function findDuplicateSubtrees(root) {
    const seen = new Map();
    const count = new Map();
    const res = [];
    let nextUid = 1;

    function getUid(node) {
        if (!node) return 0;
        const leftUid = getUid(node.left);
        const rightUid = getUid(node.right);
        const triplet = \`\${node.val},\${leftUid},\${rightUid}\`;
        let uid = seen.get(triplet);
        if (uid === undefined) {
            uid = nextUid++;
            seen.set(triplet, uid);
        }
        const freq = (count.get(uid) || 0) + 1;
        count.set(uid, freq);
        if (freq === 2) {
            res.push(node);
        }
        return uid;
    }

    getUid(root);
    return res;
}`
};

export const FIND_DUPLICATE_SUBTREES_STAGE2_LINES: Record<string, Record<string, number>> = {
  entry: { java: 8, cpp: 8, python: 22, javascript: 24 },
  dfsEntry: { java: 13, cpp: 13, python: 9, javascript: 7 },
  dfsNull: { java: 14, cpp: 14, python: 11, javascript: 8 },
  dfsLeft: { java: 15, cpp: 15, python: 13, javascript: 9 },
  dfsRight: { java: 16, cpp: 16, python: 14, javascript: 10 },
  triplet: { java: 17, cpp: 17, python: 15, javascript: 11 },
  uidAssign: { java: 18, cpp: 18, python: 16, javascript: 12 },
  count: { java: 19, cpp: 20, python: 20, javascript: 17 },
  addRes: { java: 22, cpp: 21, python: 21, javascript: 20 },
  dfsReturn: { java: 24, cpp: 23, python: 22, javascript: 22 },
  returnAns: { java: 10, cpp: 10, python: 23, javascript: 25 }
};

// ============================================================
// Stage 3: 显式后序遍历与单调栈迭代 (无系统递归栈)
// ============================================================
export const FIND_DUPLICATE_SUBTREES_STAGE3_CODES: Record<string, string> = {
  java: `public class Solution {
    public List<TreeNode> findDuplicateSubtrees(TreeNode root) {
        List<TreeNode> res = new ArrayList<>();
        if (root == null) return res;
        Map<String, Integer> count = new HashMap<>();
        Map<TreeNode, String> serialMap = new HashMap<>();
        Deque<TreeNode> stack = new ArrayDeque<>();
        TreeNode curr = root, prev = null;
        while (curr != null || !stack.isEmpty()) {
            while (curr != null) { stack.push(curr); curr = curr.left; }
            curr = stack.peek();
            if (curr.right != null && curr.right != prev) { curr = curr.right; }
            else {
                stack.pop();
                String leftS = curr.left == null ? "#" : serialMap.get(curr.left);
                String rightS = curr.right == null ? "#" : serialMap.get(curr.right);
                String s = leftS + "," + rightS + "," + curr.val;
                serialMap.put(curr, s);
                int c = count.getOrDefault(s, 0) + 1;
                count.put(s, c);
                if (c == 2) res.add(curr);
                prev = curr; curr = null;
            }
        }
        return res;
    }
}`,
  cpp: `class Solution {
public:
    vector<TreeNode*> findDuplicateSubtrees(TreeNode* root) {
        vector<TreeNode*> res;
        if (!root) return res;
        unordered_map<string, int> count;
        unordered_map<TreeNode*, string> serialMap;
        stack<TreeNode*> st;
        TreeNode* curr = root; TreeNode* prev = nullptr;
        while (curr || !st.empty()) {
            while (curr) { st.push(curr); curr = curr->left; }
            curr = st.top();
            if (curr->right && curr->right != prev) { curr = curr->right; }
            else {
                st.pop();
                string leftS = curr->left ? serialMap[curr->left] : "#";
                string rightS = curr->right ? serialMap[curr->right] : "#";
                string s = leftS + "," + rightS + "," + to_string(curr->val);
                serialMap[curr] = s;
                if (++count[s] == 2) res.push_back(curr);
                prev = curr; curr = nullptr;
            }
        }
        return res;
    }
};`,
  python: `class Solution:
    def findDuplicateSubtrees(self, root: Optional[TreeNode]) -> List[Optional[TreeNode]]:
        res = []
        if not root: return res
        count = collections.defaultdict(int)
        serial_map = {}
        stack, curr, prev = [], root, None
        while curr or stack:
            while curr:
                stack.append(curr)
                curr = curr.left
            curr = stack[-1]
            if curr.right and curr.right != prev:
                curr = curr.right
            else:
                stack.pop()
                left_s = serial_map.get(curr.left, "#")
                right_s = serial_map.get(curr.right, "#")
                s = f"{left_s},{right_s},{curr.val}"
                serial_map[curr] = s
                count[s] += 1
                if count[s] == 2:
                    res.append(curr)
                prev, curr = curr, None
        return res`,
  javascript: `function findDuplicateSubtrees(root) {
    const res = [];
    if (!root) return res;
    const count = new Map();
    const serialMap = new Map();
    const stack = [];
    let curr = root, prev = null;
    while (curr !== null || stack.length > 0) {
        while (curr !== null) { stack.push(curr); curr = curr.left; }
        curr = stack[stack.length - 1];
        if (curr.right !== null && curr.right !== prev) {
            curr = curr.right;
        } else {
            stack.pop();
            const leftS = curr.left ? serialMap.get(curr.left) : "#";
            const rightS = curr.right ? serialMap.get(curr.right) : "#";
            const s = \`\${leftS},\${rightS},\${curr.val}\`;
            serialMap.set(curr, s);
            const c = (count.get(s) || 0) + 1;
            count.set(s, c);
            if (c === 2) res.push(curr);
            prev = curr; curr = null;
        }
    }
    return res;
}`
};

export const FIND_DUPLICATE_SUBTREES_STAGE3_LINES: Record<string, Record<string, number>> = {
  entry: { java: 3, cpp: 4, python: 3, javascript: 2 },
  checkEmpty: { java: 4, cpp: 5, python: 4, javascript: 3 },
  loopStart: { java: 9, cpp: 9, python: 8, javascript: 7 },
  pushLeftChain: { java: 10, cpp: 10, python: 9, javascript: 8 },
  peekTop: { java: 11, cpp: 11, python: 12, javascript: 9 },
  gotoRight: { java: 12, cpp: 12, python: 13, javascript: 10 },
  popStack: { java: 14, cpp: 14, python: 16, javascript: 13 },
  calcSerial: { java: 17, cpp: 17, python: 19, javascript: 16 },
  count: { java: 19, cpp: 19, python: 21, javascript: 18 },
  addRes: { java: 21, cpp: 19, python: 23, javascript: 20 },
  setPrev: { java: 22, cpp: 20, python: 24, javascript: 21 },
  returnAns: { java: 25, cpp: 24, python: 25, javascript: 24 }
};
