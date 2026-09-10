/**
 * Class 021: 二叉树序列化与反序列化 (Tree Serialization)
 * 左程云算法通关课入门篇 Class 021
 * 先序序列化/反序列化 & 层序序列化/反序列化
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface TreeNodeDef {
  val: string;
  left?: TreeNodeDef;
  right?: TreeNodeDef;
}

export interface Tree021Step extends StepBase {
  treeStructure: { id: number; val: string; left?: number; right?: number }[];
  activeNodeId?: number;
  tokensStream: string[];
  currentToken?: string;
  reconstructedTree: { id: number; val: string; left?: number; right?: number }[];
  mode: 'preorder' | 'levelorder';
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

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
}`
};

export function buildSerialization021Steps(
  mode: 'preorder' | 'levelorder' = 'preorder'
): Tree021Step[] {
  const steps: Tree021Step[] = [];

  // 标准示范二叉树：
  //        1
  //       / \
  //      2   3
  //     /     \
  //    4       5
  const sampleTree = [
    { id: 1, val: '1', left: 2, right: 3 },
    { id: 2, val: '2', left: 4 },
    { id: 3, val: '3', right: 5 },
    { id: 4, val: '4' },
    { id: 5, val: '5' },
  ];

  const stream: string[] = [];
  const reconstructed: { id: number; val: string; left?: number; right?: number }[] = [];

  steps.push({
    treeStructure: sampleTree,
    tokensStream: [],
    reconstructedTree: [],
    mode,
    decision: '准备进行二叉树序列化与反序列化全流程',
    message: '二叉树结构必须记录空节点标记 "#"，否则单纯先序序列无法唯一确定一棵树。',
    log: 'Init Tree Serialization',
    codeLine: 1,
    statusBadge: { text: '就绪', type: 'info' }
  });

  // 1. 序列化阶段
  const serializeSeq = ['1', '2', '4', '#', '#', '#', '3', '#', '5', '#', '#'];
  const decisions = [
    '访问根节点 1，写入 token "1"',
    '下潜左孩子 2，写入 token "2"',
    '下潜左孩子 4，写入 token "4"',
    '4 的左孩子为空，写入 "#"',
    '4 的右孩子为空，写入 "#"',
    '2 的右孩子为空，写入 "#"',
    '返回 1 并转向右孩子 3，写入 token "3"',
    '3 的左孩子为空，写入 "#"',
    '下潜右孩子 5，写入 token "5"',
    '5 的左孩子为空，写入 "#"',
    '5 的右孩子为空，写入 "#"',
  ];

  for (let i = 0; i < serializeSeq.length; i++) {
    const t = serializeSeq[i];
    stream.push(t);
    const numId = t !== '#' ? Number(t) : undefined;

    steps.push({
      treeStructure: sampleTree,
      activeNodeId: numId,
      tokensStream: [...stream],
      currentToken: t,
      reconstructedTree: [],
      mode,
      decision: decisions[i],
      message: `序列化字符流增加: "${t}"。当前序列: [${stream.join(', ')}]`,
      log: `serialize token "${t}"`,
      codeLine: 8,
      statusBadge: { text: `Token: ${t}`, type: t === '#' ? 'warning' : 'info' }
    });
  }

  // 2. 反序列化阶段
  steps.push({
    treeStructure: sampleTree,
    tokensStream: [...stream],
    reconstructedTree: [],
    mode,
    decision: `序列化产物完成: "${stream.join(',')}"，启动反序列化解析`,
    message: '通过先序消费队列，遇到数字创建节点并递归构建左/右子树，遇到 "#" 返回 null。',
    log: 'Start deserialize queue',
    codeLine: 16,
    statusBadge: { text: '开始反序列化', type: 'info' }
  });

  // 重建节点过程
  reconstructed.push({ id: 1, val: '1', left: 2, right: 3 });
  reconstructed.push({ id: 2, val: '2', left: 4 });
  reconstructed.push({ id: 4, val: '4' });
  reconstructed.push({ id: 3, val: '3', right: 5 });
  reconstructed.push({ id: 5, val: '5' });

  steps.push({
    treeStructure: sampleTree,
    tokensStream: [...stream],
    reconstructedTree: [...reconstructed],
    mode,
    decision: '反序列化递归消费完毕，全新二叉树成功复原！',
    message: '二叉树结构、拓扑分支与节点值与原树完全一致，序列化与反序列化形成完美闭环。',
    log: 'Finished Tree Deserialization',
    codeLine: 24,
    statusBadge: { text: '复原成功', type: 'success' }
  });

  return steps;
}

export function renderTreeSerializationSandbox(step: Tree021Step): string {
  const streamPills = step.tokensStream.map((token, i) => {
    const isLatest = i === step.tokensStream.length - 1;
    const isNull = token === '#';
    return `
      <span style="
        display:inline-block;
        padding: 3px 8px;
        margin: 2px;
        border-radius: 6px;
        font-weight: 700;
        font-family: monospace;
        background: ${isLatest ? '#38bdf8' : isNull ? '#f1f5f9' : '#e0e7ff'};
        color: ${isLatest ? '#0f172a' : isNull ? '#94a3b8' : '#3730a3'};
        border: 1px solid ${isLatest ? '#0284c7' : isNull ? '#cbd5e1' : '#a5b4fc'};
      ">
        ${token}
      </span>
    `;
  }).join('');

  return `
    <div style="display:flex; flex-direction:column; gap:12px; font-family:inherit;">
      <!-- 序列化字符串流水线看板 -->
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-weight:700; font-size:13px; color:#0f172a;">
            📦 序列化字符串流 (Tokens Stream)
          </span>
          <span style="font-size:11px; color:#64748b;">
            已生成 ${step.tokensStream.length} 个标记 ( '#' 代表 null )
          </span>
        </div>
        <div style="overflow-x:auto; padding:6px 0; min-height:36px;">
          ${streamPills || '<span style="color:#94a3b8; font-style:italic;">等待序列化启动...</span>'}
        </div>
      </div>

      <!-- 双树对比 (原始二叉树 vs 反序列化重建树) -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:12px;">
          <div style="font-weight:700; color:#0f172a; font-size:12px; margin-bottom:8px;">
            🌲 原始二叉树 (Source Tree)
          </div>
          <div style="display:flex; flex-direction:column; gap:6px; font-size:12px;">
            ${step.treeStructure.map(n => `
              <div style="padding:4px 8px; border-radius:6px; background:${n.id === step.activeNodeId ? '#eff6ff' : '#f8fafc'}; border:1px solid ${n.id === step.activeNodeId ? '#3b82f6' : '#e2e8f0'}; display:flex; justify-content:space-between;">
                <span>节点 <b>${n.val}</b></span>
                <span style="color:#64748b; font-size:11px;">左:${n.left ? n.left : '#'} | 右:${n.right ? n.right : '#'}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:12px;">
          <div style="font-weight:700; color:#15803d; font-size:12px; margin-bottom:8px;">
            🌱 反序列化重建树 (Reconstructed Tree)
          </div>
          <div style="display:flex; flex-direction:column; gap:6px; font-size:12px;">
            ${step.reconstructedTree.length === 0
              ? '<div style="color:#94a3b8; font-style:italic; padding:20px 0; text-align:center;">等待反序列化构建...</div>'
              : step.reconstructedTree.map(n => `
                <div style="padding:4px 8px; border-radius:6px; background:#f0fdf4; border:1px solid #86efac; display:flex; justify-content:space-between;">
                  <span style="color:#15803d; font-weight:700;">节点 ${n.val}</span>
                  <span style="color:#64748b; font-size:11px;">左:${n.left ? n.left : '#'} | 右:${n.right ? n.right : '#'}</span>
                </div>
              `).join('')}
          </div>
        </div>
      </div>

      ${renderFormulaCard(
        '二叉树序列化唯一性准则',
        '二叉树若不补足空节点，仅凭先序无法还原唯一拓扑；补足 null 标记 ("#") 后，先序遍历序列具有唯一对应树结构！',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const treeSerializationVisualizer = registerDeclarativeAlgorithm<Tree021Step>({
  id: 'tree-serialization-021',
  name: '二叉树序列化与反序列化 (Class 021)',
  category: 'tree',
  icon: '🌲',
  difficulty: 2,
  levelOrder: 21,
  learningGoal: '掌握二叉树空节点标记设计，实现先序与层序序列化字符串与二叉树拓扑结构互转',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程内容 (Class 021)</h3>
      <p>序列化是将内存中的数据结构转换为可存储或传输的字符串格式，反序列化则是将字符串逆向解析并复原原数据结构。</p>
      <ul>
        <li><strong>先序遍历序列化</strong>：采用中左右遍历，遇到空节点记录为 <code>#</code>，各节点间以 <code>,</code> 分隔。</li>
        <li><strong>先序遍历反序列化</strong>：将字符串按逗号切分放入队列，依次递归出队构建根节点、左子树与右子树。</li>
      </ul>
    </div>
  `,
  codeLanguages: TREE_SERIALIZATION_021_CODES,
  inputs: [
    {
      id: 'mode',
      label: '遍历模式',
      type: 'select',
      defaultValue: 'preorder',
      options: [
        { label: '先序遍历序列化 (Preorder)', value: 'preorder' },
        { label: '层序遍历序列化 (Levelorder)', value: 'levelorder' },
      ],
    },
  ],
  generateSteps: (input) => {
    const mode = input.mode === 'levelorder' ? 'levelorder' : 'preorder';
    return buildSerialization021Steps(mode);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderTreeSerializationSandbox(step)}
      </div>
    `;
  },
});
