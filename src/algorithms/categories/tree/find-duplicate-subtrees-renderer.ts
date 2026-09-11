import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';

export interface TreeNodeData {
  id: number;
  val: number;
  leftId: number | null;
  rightId: number | null;
  x: number;
  y: number;
}

export interface DuplicateSubtreeStep extends StepBase {
  nodes: TreeNodeData[];
  currentNodeId: number | null;
  subtreeSerialMap: Record<number, string>; // 节点 ID -> 其子树序列化串
  serialCountMap: Record<string, number>;    // 序列化串 -> 出现次数
  duplicateRoots: number[];                 // 重复子树的根节点 ID 列表
  decision: string;
  metrics?: Record<string, string>;
  message: string;
  log: string;
  codeLine: Record<string, number>;
}

export const FIND_DUPLICATE_SUBTREES_CODES = {
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

const CODE_LINES = {
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

// 预制二叉树结构：[1, 2, 3, 4, null, 2, 4, null, null, 4]
// 拥有重复子树：根为 2 (左 4，右 null)，以及单独的叶子 4
export function buildDuplicateSubtreesSteps(): DuplicateSubtreeStep[] {
  const steps: DuplicateSubtreeStep[] = [];

  const nodes: TreeNodeData[] = [
    { id: 1, val: 1, leftId: 2, rightId: 3, x: 250, y: 40 },
    { id: 2, val: 2, leftId: 4, rightId: null, x: 140, y: 110 },
    { id: 3, val: 3, leftId: 5, rightId: 6, x: 360, y: 110 },
    { id: 4, val: 4, leftId: null, rightId: null, x: 80, y: 180 },
    { id: 5, val: 2, leftId: 7, rightId: null, x: 300, y: 180 },
    { id: 6, val: 4, leftId: null, rightId: null, x: 420, y: 180 },
    { id: 7, val: 4, leftId: null, rightId: null, x: 260, y: 250 }
  ];

  const nodeMap = new Map<number, TreeNodeData>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const subtreeSerialMap: Record<number, string> = {};
  const serialCountMap: Record<string, number> = {};
  const duplicateRoots: number[] = [];

  // Step 0: 入口
  steps.push({
    nodes,
    currentNodeId: null,
    subtreeSerialMap: {},
    serialCountMap: {},
    duplicateRoots: [],
    decision: '主函数入口：findDuplicateSubtrees(root=1)',
    message: '利用后序遍历（左-右-根）自底向上序列化子树形态，并通过哈希表统计频次',
    log: 'enter findDuplicateSubtrees(root)',
    codeLine: CODE_LINES.entry,
    metrics: { '当前状态': '准备后序遍历', '重复子树数': '0' }
  });

  function dfs(nodeId: number | null): string {
    if (nodeId === null) {
      steps.push({
        nodes,
        currentNodeId: null,
        subtreeSerialMap: { ...subtreeSerialMap },
        serialCountMap: { ...serialCountMap },
        duplicateRoots: [...duplicateRoots],
        decision: '遇到空节点 null，返回序列化基底 "#"',
        message: '空指针统一标记为 "#" 作为子树结构分隔符',
        log: 'dfs(null) -> "#"',
        codeLine: CODE_LINES.dfsNull,
        metrics: { '当前节点': 'null', '返回值': '#' }
      });
      return '#';
    }

    const node = nodeMap.get(nodeId)!;

    // 进入节点
    steps.push({
      nodes,
      currentNodeId: nodeId,
      subtreeSerialMap: { ...subtreeSerialMap },
      serialCountMap: { ...serialCountMap },
      duplicateRoots: [...duplicateRoots],
      decision: `进入节点 [${node.val}] (ID:${nodeId})，开始探索其左子树`,
      message: `后序遍历优先探索子节点，以获取下层子树序列`,
      log: `enter dfs(node=${node.val}, id=${nodeId})`,
      codeLine: CODE_LINES.dfsEntry,
      metrics: { '当前节点': `${node.val}`, '节点ID': `${nodeId}` }
    });

    const leftSerial = dfs(node.leftId);
    const rightSerial = dfs(node.rightId);

    // 序列化
    const serial = `${leftSerial},${rightSerial},${node.val}`;
    subtreeSerialMap[nodeId] = serial;

    steps.push({
      nodes,
      currentNodeId: nodeId,
      subtreeSerialMap: { ...subtreeSerialMap },
      serialCountMap: { ...serialCountMap },
      duplicateRoots: [...duplicateRoots],
      decision: `合并子树序列：left("${leftSerial}") + right("${rightSerial}") + val(${node.val}) ➔ "${serial}"`,
      message: `唯一序列签名 "${serial}" 完整表征以节点 ${node.val} 为根的二叉树形状`,
      log: `serialized node ${nodeId}: ${serial}`,
      codeLine: CODE_LINES.serial,
      metrics: { '子树签名': serial, '当前节点': `${node.val}` }
    });

    // 频次统计
    const prevCount = serialCountMap[serial] || 0;
    const newCount = prevCount + 1;
    serialCountMap[serial] = newCount;

    steps.push({
      nodes,
      currentNodeId: nodeId,
      subtreeSerialMap: { ...subtreeSerialMap },
      serialCountMap: { ...serialCountMap },
      duplicateRoots: [...duplicateRoots],
      decision: `在哈希表中更新序列 "${serial}" 的计数值为 ${newCount}`,
      message: newCount > 1 ? `⚠️ 发现重复子树形态！当前出现第 ${newCount} 次` : '该形态首次出现',
      log: `serial "${serial}" count = ${newCount}`,
      codeLine: CODE_LINES.count,
      metrics: { '当前序列频次': `${newCount}`, '重复子树数': `${duplicateRoots.length}` }
    });

    if (newCount === 2) {
      duplicateRoots.push(nodeId);
      steps.push({
        nodes,
        currentNodeId: nodeId,
        subtreeSerialMap: { ...subtreeSerialMap },
        serialCountMap: { ...serialCountMap },
        duplicateRoots: [...duplicateRoots],
        decision: `🎯 命中重复！第 2 次出现该子树，将根节点 [${node.val}] (ID:${nodeId}) 收集至答案列表`,
        message: '仅在频次达到 2 时收集一次，避免多次重复加入结果',
        log: `collected duplicate root id=${nodeId}, val=${node.val}`,
        codeLine: CODE_LINES.addRes,
        metrics: { '新增重复根': `节点 [${node.val}]`, '已收集总数': `${duplicateRoots.length}` }
      });
    }

    steps.push({
      nodes,
      currentNodeId: nodeId,
      subtreeSerialMap: { ...subtreeSerialMap },
      serialCountMap: { ...serialCountMap },
      duplicateRoots: [...duplicateRoots],
      decision: `完成节点 [${node.val}] 的后序处理，回传序列 "${serial}" 给父节点`,
      message: '当前栈帧弹出，向上层调用传递序列化表达',
      log: `return serial "${serial}" for node ${nodeId}`,
      codeLine: CODE_LINES.dfsReturn,
      metrics: { '回传签名': serial }
    });

    return serial;
  }

  dfs(1);

  // 终态
  steps.push({
    nodes,
    currentNodeId: null,
    subtreeSerialMap: { ...subtreeSerialMap },
    serialCountMap: { ...serialCountMap },
    duplicateRoots: [...duplicateRoots],
    decision: `🎉 遍历完成！共检测并收集到 ${duplicateRoots.length} 个重复子树根节点`,
    message: `重复子树根节点 ID: [${duplicateRoots.join(', ')}]，分别对应子树 [4] 与 [2, 4]`,
    log: `finished findDuplicateSubtrees, duplicates: ${duplicateRoots.join(',')}`,
    codeLine: CODE_LINES.returnAns,
    metrics: { '重复子树数': `${duplicateRoots.length}`, '状态': '完成' }
  });

  return steps;
}

export function renderDuplicateSubtreesCanvas(container: HTMLElement, step: DuplicateSubtreeStep): void {
  const { nodes, currentNodeId, subtreeSerialMap, serialCountMap, duplicateRoots } = step;

  // 绘制二叉树 SVG 连线与节点
  const linesHtml = nodes.map(node => {
    const leftChild = node.leftId ? nodes.find(n => n.id === node.leftId) : null;
    const rightChild = node.rightId ? nodes.find(n => n.id === node.rightId) : null;

    let res = '';
    if (leftChild) {
      res += `<line x1="${node.x}" y1="${node.y}" x2="${leftChild.x}" y2="${leftChild.y}" stroke="rgba(255,255,255,0.2)" stroke-width="2" />`;
    }
    if (rightChild) {
      res += `<line x1="${node.x}" y1="${node.y}" x2="${rightChild.x}" y2="${rightChild.y}" stroke="rgba(255,255,255,0.2)" stroke-width="2" />`;
    }
    return res;
  }).join('');

  const nodesHtml = nodes.map(node => {
    const isCurrent = node.id === currentNodeId;
    const isDuplicate = duplicateRoots.includes(node.id);
    const serial = subtreeSerialMap[node.id];

    let fill = 'rgba(30, 41, 59, 0.9)';
    let stroke = 'rgba(255, 255, 255, 0.3)';
    let textColor = '#f8fafc';
    let filter = 'none';

    if (isDuplicate) {
      fill = 'rgba(16, 185, 129, 0.35)';
      stroke = '#10b981';
      textColor = '#34d399';
    }
    if (isCurrent) {
      fill = 'rgba(56, 189, 248, 0.4)';
      stroke = '#38bdf8';
      textColor = '#38bdf8';
      filter = 'drop-shadow(0 0 10px #38bdf8)';
    }

    return `
      <g style="filter: ${filter};">
        <circle cx="${node.x}" cy="${node.y}" r="22" fill="${fill}" stroke="${stroke}" stroke-width="${isCurrent || isDuplicate ? 3 : 1.5}" />
        <text x="${node.x}" y="${node.y + 5}" font-size="14" font-weight="700" fill="${textColor}" text-anchor="middle">${node.val}</text>
        ${serial ? `<text x="${node.x}" y="${node.y + 36}" font-size="9" fill="#94a3b8" text-anchor="middle" font-family="monospace">${serial.length > 12 ? serial.substring(0, 11) + '..' : serial}</text>` : ''}
        ${isDuplicate ? `<text x="${node.x}" y="${node.y - 28}" font-size="10" fill="#34d399" font-weight="700" text-anchor="middle">★ 重复根</text>` : ''}
      </g>
    `;
  }).join('');

  // 序列化哈希表展示
  const hashMapEntries = Object.entries(serialCountMap).map(([serial, count]) => {
    const isDupe = count >= 2;
    return `
      <div style="
        padding: 6px 10px;
        background: ${isDupe ? 'rgba(16, 185, 129, 0.15)' : 'rgba(2, 6, 23, 0.4)'};
        border: 1px solid ${isDupe ? '#10b981' : 'rgba(255, 255, 255, 0.08)'};
        border-radius: 6px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: monospace;
        font-size: 0.78rem;
      ">
        <span style="color: #cbd5e1; max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">"${serial}"</span>
        <span style="font-weight: 700; color: ${isDupe ? '#34d399' : '#94a3b8'};">频次: ${count} ${isDupe ? '🎯' : ''}</span>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; gap: 16px; padding: 16px; box-sizing: border-box;">
      <!-- 左侧：二叉树主画布 -->
      <div style="
        flex: 3;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        padding: 16px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 0.95rem; font-weight: 600; color: #f1f5f9;">🌳 二叉树后序遍历与子树签名推演</span>
          <div style="display: flex; gap: 10px; font-size: 0.8rem;">
            <span style="color: #38bdf8;">● 当前遍历点</span>
            <span style="color: #34d399;">★ 重复子树根节点</span>
          </div>
        </div>

        <div style="flex: 1; display: flex; justify-content: center; align-items: center;">
          <svg viewBox="0 0 500 320" style="width: 100%; max-height: 320px;">
            ${linesHtml}
            ${nodesHtml}
          </svg>
        </div>
      </div>

      <!-- 右侧：序列频次哈希表与收集池 -->
      <div style="
        flex: 2;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      ">
        <div style="font-size: 0.95rem; font-weight: 600; color: #f1f5f9; display: flex; align-items: center; justify-content: space-between;">
          <span>📋 序列签名频次表 (Hash Table)</span>
          <span style="font-size: 0.78rem; color: #94a3b8;">共 ${Object.keys(serialCountMap).length} 种形态</span>
        </div>

        <div style="
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
          overflow-y: auto;
          max-height: 200px;
          padding: 8px;
          background: rgba(2, 6, 23, 0.5);
          border-radius: 8px;
        ">
          ${hashMapEntries.length ? hashMapEntries : '<div style="color:#64748b; font-size:0.8rem; text-align:center; padding:10px;">暂无序列记录</div>'}
        </div>

        <!-- 收集结果池 -->
        <div style="
          padding: 10px 12px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 8px;
          font-size: 0.85rem;
        ">
          <div style="font-weight: 600; color: #34d399; margin-bottom: 4px;">🎯 重复子树根节点集合:</div>
          <div style="color: #f1f5f9; font-weight: 700;">
            ${duplicateRoots.length ? duplicateRoots.map(id => `[节点 ${nodes.find(n => n.id === id)?.val} (ID:${id})]`).join('、') : '<span style="color:#94a3b8; font-weight:normal;">尚未检测到重复</span>'}
          </div>
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'find-duplicate-subtrees',
  name: '寻找重复的子树',
  category: 'tree',
  learningGoal: '掌握二叉树后序遍历序列化与哈希表查重机制，理解子树形态的唯一哈希编码表示',
  inputs: [
    {
      id: 'treePreset',
      label: '树型用例',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: '经典用例: [1,2,3,4,null,2,4,null,null,4]', value: 'default' }
      ]
    }
  ],
  codeLanguages: FIND_DUPLICATE_SUBTREES_CODES,
  generateSteps: () => {
    return buildDuplicateSubtreesSteps();
  },
  renderCanvas: (container, step) => {
    renderDuplicateSubtreesCanvas(container, step as DuplicateSubtreeStep);
  }
});
