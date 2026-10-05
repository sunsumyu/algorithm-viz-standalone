/**
 * 左程云算法通关课 Class 021: 二叉树序列化与反序列化 (Tree Serialization)
 * 四语言源码实现与 1-based 精准代码行字典
 */

export const TREE_SERIALIZATION_021_CODES = {
  java: `public class Codec {
    // 1. 先序遍历序列化
    public String serialize(TreeNode root) {
        StringBuilder sb = new StringBuilder();
        pre(root, sb);
        return sb.toString();
    }
    void pre(TreeNode node, StringBuilder sb) {
        if (node == null) { sb.append("#,"); return; }
        sb.append(node.val).append(",");
        pre(node.left, sb);
        pre(node.right, sb);
    }
    // 2. 先序遍历反序列化
    public TreeNode deserialize(String data) {
        String[] tokens = data.split(",");
        Queue<String> q = new LinkedList<>(Arrays.asList(tokens));
        return build(q);
    }
    TreeNode build(Queue<String> q) {
        String val = q.poll();
        if (val.equals("#")) return null;
        TreeNode node = new TreeNode(Integer.parseInt(val));
        node.left = build(q);
        node.right = build(q);
        return node;
    }
}`,
  cpp: `class Codec {
public:
    string serialize(TreeNode* root) {
        if (!root) return "#,";
        return to_string(root->val) + "," + serialize(root->left) + serialize(root->right);
    }
    TreeNode* deserialize(string data) {
        stringstream ss(data);
        string item;
        queue<string> q;
        while (getline(ss, item, ',')) q.push(item);
        return build(q);
    }
    TreeNode* build(queue<string>& q) {
        string val = q.front(); q.pop();
        if (val == "#") return nullptr;
        TreeNode* node = new TreeNode(stoi(val));
        node->left = build(q);
        node->right = build(q);
        return node;
    }
};`,
  python: `class Codec:
    def serialize(self, root):
        def pre(node):
            if not node:
                return ["#"]
            return [str(node.val)] + pre(node.left) + pre(node.right)
        return ",".join(pre(root))

    def deserialize(self, data):
        tokens = iter(data.split(","))
        def build():
            val = next(tokens)
            if val == "#":
                return None
            node = TreeNode(int(val))
            node.left = build()
            node.right = build()
            return node
        return build()`,
  typescript: `export class Codec {
  serialize(root: any): string {
    const res: string[] = [];
    const pre = (node: any) => {
      if (!node) { res.push('#'); return; }
      res.push(String(node.val));
      pre(node.left);
      pre(node.right);
    };
    pre(root);
    return res.join(',');
  }

  deserialize(data: string): any {
    const tokens = data.split(',');
    let cursor = 0;
    const build = (): any => {
      const val = tokens[cursor++];
      if (val === '#') return null;
      const node = { val: Number(val), left: null, right: null };
      node.left = build();
      node.right = build();
      return node;
    };
    return build();
  }
}`,
  javascript: `class Codec {
  serialize(root) {
    const res = [];
    const pre = (node) => {
      if (!node) { res.push('#'); return; }
      res.push(String(node.val));
      pre(node.left);
      pre(node.right);
    };
    pre(root);
    return res.join(',');
  }

  deserialize(data) {
    const tokens = data.split(',');
    let cursor = 0;
    const build = () => {
      const val = tokens[cursor++];
      if (val === '#') return null;
      const node = { val: Number(val), left: null, right: null };
      node.left = build();
      node.right = build();
      return node;
    };
    return build();
  }
}`,
};

export const TREE_SERIALIZATION_021_CODE_LINES = {
  entry: { java: 3, cpp: 3, python: 2, typescript: 2, javascript: 2 },
  serializeToken: { java: 10, cpp: 5, python: 6, typescript: 7, javascript: 7 },
  startDeserialize: { java: 16, cpp: 11, python: 11, typescript: 14, javascript: 14 },
  reconstructedDone: { java: 24, cpp: 19, python: 18, typescript: 25, javascript: 25 },
};
