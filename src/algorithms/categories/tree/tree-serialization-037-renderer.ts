/**
 * Class 037: 二叉树序列化与反序列化深入 (Serialize and Deserialize Binary Tree)
 * 左程云算法通关课入门篇 Class 037 / LeetCode 297
 * 核心原语：先序遍历字符串流转换 + 空节点 '#' 占位哨兵 + 队列单向递归建树
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface SerializeStep extends StepBase {
  stepIndex?: number;
  mode: 'serialize' | 'deserialize';
  tokenStream: string[];
  activeTokenIndex: number;
  constructedNodes: number[];
  currentNode: string | null;
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const SERIALIZE_037_CODES = {
  java: `public class Codec {
    // 1. 先序遍历序列化
    public String serialize(TreeNode root) {
        StringBuilder sb = new StringBuilder();
        serial(root, sb);
        return sb.toString();
    }
    private void serial(TreeNode node, StringBuilder sb) {
        if (node == null) {
            sb.append("#,");
            return;
        }
        sb.append(node.val).append(",");
        serial(node.left, sb);
        serial(node.right, sb);
    }

    // 2. 先序遍历反序列化
    public TreeNode deserialize(String data) {
        Queue<String> queue = new LinkedList<>(Arrays.asList(data.split(",")));
        return build(queue);
    }
    private TreeNode build(Queue<String> queue) {
        String val = queue.poll();
        if (val.equals("#")) return null; // 遇到空哨兵返回 null
        TreeNode head = new TreeNode(Integer.parseInt(val));
        head.left = build(queue);
        head.right = build(queue);
        return head;
    }
}`,
  cpp: `class Codec {
public:
    string serialize(TreeNode* root) {
        if (!root) return "#,";
        return to_string(root->val) + "," + serialize(root->left) + serialize(root->right);
    }

    TreeNode* deserialize(string data) {
        queue<string> q;
        stringstream ss(data);
        string item;
        while (getline(ss, item, ',')) {
            if (!item.empty()) q.push(item);
        }
        return build(q);
    }
    TreeNode* build(queue<string>& q) {
        string val = q.front(); q.pop();
        if (val == "#") return nullptr;
        TreeNode* root = new TreeNode(stoi(val));
        root->left = build(q);
        root->right = build(q);
        return root;
    }
};`,
  python: `class Codec:
    def serialize(self, root):
        def rserial(node):
            if not node:
                return ["#"]
            return [str(node.val)] + rserial(node.left) + rserial(node.right)
        return ",".join(rserial(root))

    def deserialize(self, data):
        tokens = collections.deque(data.split(","))
        def rdeserial():
            val = tokens.popleft()
            if val == "#":
                return None
            node = TreeNode(int(val))
            node.left = rdeserial()
            node.right = rdeserial()
            return node
        return rdeserial()`,
  typescript: `class Codec {
    serialize(root: TreeNode | null): string {
        if (!root) return '#,';
        return \`\${root.val},\${this.serialize(root.left)}\${this.serialize(root.right)}\`;
    }
    deserialize(data: string): TreeNode | null {
        const tokens = data.split(',').filter(s => s.length > 0);
        function build(): TreeNode | null {
            const val = tokens.shift()!;
            if (val === '#') return null;
            const node = new TreeNode(Number(val));
            node.left = build();
            node.right = build();
            return node;
        }
        return build();
    }
}`
};

export function generateSerializationSteps(mode: 'serialize' | 'deserialize' = 'deserialize'): SerializeStep[] {
  const steps: SerializeStep[] = [];
  // 树: 1(L: 2, R: 3(L: 4, R: 5))
  // 对应序列化流: ["1", "2", "#", "#", "3", "4", "#", "#", "5", "#", "#"]
  const tokens = ['1', '2', '#', '#', '3', '4', '#', '#', '5', '#', '#'];

  const lines = {
    serEntry: 3,
    serBase: 9,
    serAppend: 13,
    deserEntry: 18,
    deserPoll: 23,
    deserBase: 24,
    deserNode: 25,
    deserLeft: 26,
    deserRight: 27,
  };

  if (mode === 'serialize') {
    const stream: string[] = [];
    steps.push({
      mode,
      tokenStream: [],
      activeTokenIndex: -1,
      constructedNodes: [1, 2, 3, 4, 5],
      currentNode: '1',
      decision: '启动先序遍历序列化：root = 1',
      message: '规则：遇到有效节点追加 val，遇到空指针追加 "#" 占位哨兵',
      log: 'Start serialize tree to stream',
      codeLine: lines.serEntry,
      statusBadge: { text: '开始序列化', type: 'info' },
    });

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      stream.push(tok);
      steps.push({
        mode,
        tokenStream: [...stream],
        activeTokenIndex: i,
        constructedNodes: [1, 2, 3, 4, 5],
        currentNode: tok,
        decision: tok === '#' ? '遇到 null 空子树 ➔ 追加 "#," 哨兵' : `访问节点 [${tok}] ➔ 追加 "${tok},"`,
        message: `当前已生成序列化串: "${stream.join(',')}"`,
        log: `Append token: ${tok}`,
        codeLine: tok === '#' ? lines.serBase : lines.serAppend,
        statusBadge: { text: tok === '#' ? '空指针哨兵' : `写入 ${tok}`, type: tok === '#' ? 'warning' : 'success' },
      });
    }

    steps.push({
      mode,
      tokenStream: stream,
      activeTokenIndex: tokens.length - 1,
      constructedNodes: [1, 2, 3, 4, 5],
      currentNode: null,
      decision: `🎉 序列化完毕！最终编码: "${stream.join(',')}"`,
      message: '树结构无歧义压缩为一维连续字符串流',
      log: 'Serialization complete.',
      codeLine: lines.serEntry,
      statusBadge: { text: '序列化成功', type: 'success' },
    });
  } else {
    // 反序列化
    const built: number[] = [];
    steps.push({
      mode,
      tokenStream: tokens,
      activeTokenIndex: -1,
      constructedNodes: [],
      currentNode: null,
      decision: `启动反序列化：解析数据流 [${tokens.join(', ')}]`,
      message: '利用队列 FIFO 特性，先序单向递归重构二叉树拓扑',
      log: 'Init deserialization from tokens',
      codeLine: lines.deserEntry,
      statusBadge: { text: '开始反序列化', type: 'info' },
    });

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      if (tok !== '#') {
        built.push(Number(tok));
        steps.push({
          mode,
          tokenStream: tokens,
          activeTokenIndex: i,
          constructedNodes: [...built],
          currentNode: tok,
          decision: `弹出 Token "${tok}" ➔ 实例化 TreeNode(${tok})，准备构建其左右子树`,
          message: `构建新节点 ${tok}，当前已有节点集合: [${built.join(', ')}]`,
          log: `Build node ${tok}`,
          codeLine: lines.deserNode,
          statusBadge: { text: `建节点 ${tok}`, type: 'success' },
        });
      } else {
        steps.push({
          mode,
          tokenStream: tokens,
          activeTokenIndex: i,
          constructedNodes: [...built],
          currentNode: tok,
          decision: `弹出 Token "#" ➔ 识别为空指针哨兵，返回 null 接在父节点上`,
          message: '空指针哨兵闭合对应分支',
          log: 'Token # -> return null',
          codeLine: lines.deserBase,
          statusBadge: { text: '空指针分支', type: 'warning' },
        });
      }
    }

    steps.push({
      mode,
      tokenStream: tokens,
      activeTokenIndex: tokens.length - 1,
      constructedNodes: built,
      currentNode: null,
      decision: '🎉 反序列化重构完全成功！二叉树完全复原',
      message: '所有 Token 严格消费完毕，结构与原树 100% 同构',
      log: 'Deserialization completed successfully.',
      codeLine: lines.deserEntry,
      statusBadge: { text: '重构完毕', type: 'success' },
    });
  }

  return steps;
}

export function renderSerializationCanvas(container: HTMLElement, step: SerializeStep): void {
  container.innerHTML = `
    <div style="padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 核心指标看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">当前工作模式</div>
          <div style="font-size: 20px; font-weight: bold; color: #38bdf8; margin-top: 4px;">
            ${step.mode === 'serialize' ? '序列化 (Tree ➔ Stream)' : '反序列化 (Stream ➔ Tree)'}
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">当前活跃消费 Token</div>
          <div style="font-size: 22px; font-weight: bold; color: ${step.currentNode === '#' ? '#fbbf24' : '#34d399'}; margin-top: 4px;">
            ${step.currentNode !== null ? `"${step.currentNode}"` : '等待中'}
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">已重构/存在的有效节点数</div>
          <div style="font-size: 20px; font-weight: bold; color: #a855f7; margin-top: 4px;">
            ${step.constructedNodes.length} 个节点
          </div>
        </div>
      </div>

      <!-- 数据流传送带沙盘 -->
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px;">
          Token 字符串队列传送带 (Token Stream Queue)
        </div>

        <div style="display: flex; gap: 6px; overflow-x: auto; padding: 6px 0;">
          ${step.tokenStream.map((tok, idx) => {
            const isActive = idx === step.activeTokenIndex;
            const isConsumed = idx < step.activeTokenIndex;
            return `
              <div style="
                min-width: 38px;
                height: 42px;
                background: ${isActive ? '#0284c7' : isConsumed ? '#1e293b' : 'rgba(30,41,59,0.5)'};
                border: ${isActive ? '2px solid #38bdf8' : tok === '#' ? '1px solid #d97706' : '1px solid #475569'};
                border-radius: 6px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                box-shadow: ${isActive ? '0 0 10px rgba(56,189,248,0.5)' : 'none'};
              ">
                <div style="font-size: 13px; font-weight: bold; color: ${tok === '#' ? '#fbbf24' : '#fff'};">${tok}</div>
                <div style="font-size: 8px; color: #94a3b8;">#${idx}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 原理卡片 -->
      ${renderFormulaCard(
        '二叉树序列化与反序列化公理',
        '任何二叉树只要在先序或后序遍历时显式记录空指针占位符 "#"，即可唯一确定一棵二叉树的拓扑结构！反序列化时按前序队列递归消费，遇到 "#" 返回空，遇到数值构造节点并递归构建其左右子树，时间与空间均严格 O(N) 完美还原！',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const treeSerialization037Visualizer = registerDeclarativeAlgorithm<SerializeStep>({
  id: 'tree-serialization-037',
  name: 'Class 037: 二叉树序列化与反序列化深入',
  category: 'tree',
  icon: '📦',
  difficulty: 2,
  levelOrder: 37,
  learningGoal: '掌握二叉树空节点 "#" 占位哨兵编码原理，理解前序队列递归消费反序列化重建树拓扑过程',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 037 / LeetCode 297)</h3>
      <p>序列化是将一个数据结构或者对象转换为连续的比特位的操作，进而可以存储在文件或者内存中：</p>
      <ul>
        <li><strong>先序序列化</strong>：先序遍历节点，以逗号分隔，遇到空引用写 <code>#</code>。例如 <code>1,2,#,#,3,4,#,#,5,#,#</code>。</li>
        <li><strong>先序反序列化</strong>：利用队列 <code>Queue</code> 存入分割后的 Token，每次弹出队头；若为 <code>#</code> 返回 null，否则新建节点并递归构建左右子树。</li>
        <li><strong>核心价值</strong>：消除二叉树结构歧义，实现内存与外存持久化无缝互通。</li>
      </ul>
    </div>
  `,
  codeLanguages: SERIALIZE_037_CODES,
  inputs: [
    {
      id: 'mode',
      label: '演示流程模式',
      type: 'select',
      defaultValue: 'deserialize',
      options: [
        { label: '反序列化重构过程 (Stream ➔ Tree)', value: 'deserialize' },
        { label: '序列化编码过程 (Tree ➔ Stream)', value: 'serialize' },
      ],
    },
  ],
  generateSteps: (input) => {
    const mode = (input.mode || 'deserialize') as 'serialize' | 'deserialize';
    return generateSerializationSteps(mode);
  },
  renderCanvas: (container, step) => {
    renderSerializationCanvas(container, step);
  },
});
