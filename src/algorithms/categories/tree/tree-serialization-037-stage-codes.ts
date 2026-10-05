/**
 * 左程云算法通关课 Class 037: 二叉树后序与高级序列化与反序列化
 * 四语言源码实现与 1-based 精准代码行字典
 */

export const TREE_SERIALIZATION_037_CODES = {
  java: `public class Codec037 {
    // 1. 后序遍历序列化 (左右根)
    public String serialize(TreeNode root) {
        StringBuilder sb = new StringBuilder();
        post(root, sb);
        return sb.toString();
    }
    private void post(TreeNode node, StringBuilder sb) {
        if (node == null) {
            sb.append("#,");
            return;
        }
        post(node.left, sb);
        post(node.right, sb);
        sb.append(node.val).append(",");
    }

    // 2. 后序遍历反序列化 (从右向左消费: 根 -> 右 -> 左)
    public TreeNode deserialize(String data) {
        if (data == null || data.isEmpty()) return null;
        String[] tokens = data.split(",");
        Stack<String> stack = new Stack<>();
        for (String s : tokens) stack.push(s);
        return build(stack);
    }
    private TreeNode build(Stack<String> stack) {
        String val = stack.pop();
        if (val.equals("#")) return null;
        TreeNode head = new TreeNode(Integer.parseInt(val));
        head.right = build(stack); // 关键：先右
        head.left = build(stack);  // 后左
        return head;
    }
}`,
  cpp: `class Codec037 {
public:
    // 1. 后序遍历序列化
    string serialize(TreeNode* root) {
        if (!root) return "#,";
        return serialize(root->left) + serialize(root->right) + to_string(root->val) + ",";
    }

    // 2. 后序遍历反序列化 (从右往左消费: 根 -> 右 -> 左)
    TreeNode* deserialize(string data) {
        stringstream ss(data);
        string item;
        vector<string> tokens;
        while (getline(ss, item, ',')) {
            if (!item.empty()) tokens.push_back(item);
        }
        int idx = tokens.size() - 1;
        return build(tokens, idx);
    }
    TreeNode* build(const vector<string>& tokens, int& idx) {
        if (idx < 0) return nullptr;
        string val = tokens[idx--];
        if (val == "#") return nullptr;
        TreeNode* root = new TreeNode(stoi(val));
        root->right = build(tokens, idx); // 先右
        root->left = build(tokens, idx);  // 后左
        return root;
    }
};`,
  python: `class Codec037:
    # 1. 后序遍历序列化
    def serialize(self, root):
        def post(node):
            if not node:
                return ["#"]
            return post(node.left) + post(node.right) + [str(node.val)]
        return ",".join(post(root))

    # 2. 后序遍历反序列化 (从右往左消费: 根 -> 右 -> 左)
    def deserialize(self, data):
        tokens = data.split(",")
        def build():
            if not tokens:
                return None
            val = tokens.pop()
            if val == "#":
                return None
            node = TreeNode(int(val))
            node.right = build()  # 先右
            node.left = build()   # 后左
            return node
        return build()`,
  typescript: `export class Codec037 {
  // 1. 后序遍历序列化
  serialize(root: any): string {
    const res: string[] = [];
    const post = (node: any) => {
      if (!node) { res.push('#'); return; }
      post(node.left);
      post(node.right);
      res.push(String(node.val));
    };
    post(root);
    return res.join(',');
  }

  // 2. 后序反序列化 (从右往左消费: 根 -> 右 -> 左)
  deserialize(data: string): any {
    const tokens = data.split(',').filter(Boolean);
    const build = (): any => {
      const val = tokens.pop();
      if (!val || val === '#') return null;
      const node = { val: Number(val), left: null, right: null };
      node.right = build(); // 先右
      node.left = build();  // 后左
      return node;
    };
    return build();
  }
}`,
};

export const SERIALIZE_037_CODE_LINES = {
  serEntry: { java: 3, cpp: 3, python: 3, typescript: 3 },
  serBase: { java: 9, cpp: 5, python: 5, typescript: 6 },
  serAppend: { java: 15, cpp: 6, python: 7, typescript: 9 },
  deserEntry: { java: 19, cpp: 10, python: 11, typescript: 15 },
  deserPoll: { java: 26, cpp: 23, python: 16, typescript: 19 },
  deserBase: { java: 27, cpp: 24, python: 17, typescript: 20 },
  deserNode: { java: 28, cpp: 25, python: 19, typescript: 21 },
  deserRight: { java: 29, cpp: 26, python: 20, typescript: 22 },
  deserLeft: { java: 30, cpp: 27, python: 21, typescript: 23 },
};
