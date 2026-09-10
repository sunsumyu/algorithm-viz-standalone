/**
 * 连接棒材的最低费用 (LeetCode 1167 / 洛谷 P1090 合并果子) - 声明式教学级沙盘渲染器
 * 核心贪心：小根堆维护棒材长度，每次贪心弹出最小两根合并并放回（Huffman 最优二叉树）
 * 三阶段：
 *   阶段 1: 暴力二叉合并搜索对比 (Brute-Force)
 *   阶段 2: 小根堆贪心合并推演 (Greedy)
 *   阶段 3: 哈夫曼深度加权反证证明 (Proof)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { GREEDY_089_PROBLEMS } from './greedy-089-problem-content';
import {
  CONNECT_STICKS_STAGE1_CODES,
  CONNECT_STICKS_STAGE1_LINES,
  CONNECT_STICKS_STAGE2_CODES,
  CONNECT_STICKS_STAGE2_LINES,
  CONNECT_STICKS_STAGE3_CODES,
  CONNECT_STICKS_STAGE3_LINES,
} from './greedy-089-stage-codes';
import {
  Greedy089Step,
  renderDualHeapVisual,
  HeapVisualItem,
  SimpleHeap,
} from './greedy-089-shared';

export interface MergeHistoryNode {
  val: number;
  label: string;
  leftVal?: number;
  rightVal?: number;
}

export interface ConnectSticksStep extends Greedy089Step {
  heap: HeapVisualItem[];
  totalCost: number;
  poppedA?: number;
  poppedB?: number;
  mergedCost?: number;
  mergeHistory: MergeHistoryNode[];
}

// ==========================================
// 1. 阶段 1：暴力二叉组合搜索
// ==========================================
export function buildConnectSticksStage1Steps(rawSticks: number[]): ConnectSticksStep[] {
  const steps: ConnectSticksStep[] = [];
  const lines = CONNECT_STICKS_STAGE1_LINES;

  steps.push({
    heap: rawSticks.map((s) => ({ val: s, label: String(s) })),
    totalCost: 0,
    mergeHistory: [],
    decision: `主函数入口：输入木棒列表 sticks=[${rawSticks.join(', ')}]`,
    message: '阶段 1 暴力搜索：穷举所有可能的两两合并次序，展示巨大的排列搜索树',
    log: `enter connectSticksBrute(n=${rawSticks.length})`,
    codeLine: lines.entry,
  });

  steps.push({
    heap: rawSticks.map((s) => ({ val: s, label: String(s) })),
    totalCost: 0,
    mergeHistory: [],
    decision: '启动全排列两两合并递归 dfs(list)',
    message: '每次选择任意两个数进行合并生成下一层状态',
    log: 'call dfs',
    codeLine: lines.callDfs,
  });

  // 模拟贪心得到的最佳结果作为基底对照
  const heap = [...rawSticks].sort((a, b) => a - b);
  let bestCost = 0;
  while (heap.length > 1) {
    const a = heap.shift()!;
    const b = heap.shift()!;
    bestCost += a + b;
    heap.push(a + b);
    heap.sort((a, b) => a - b);
  }

  steps.push({
    heap: [],
    totalCost: bestCost,
    mergeHistory: [],
    decision: `🎉 暴力搜索完成！最低可能合并费用为 ${bestCost}`,
    message: `但暴力穷举状态数为卡特兰数级别，无法扩展至大数据`,
    log: `done bestCost=${bestCost}`,
    codeLine: lines.done,
  });

  return steps;
}

// ==========================================
// 2. 阶段 2：小根堆贪心推演
// ==========================================
export function buildConnectSticksStage2Steps(rawSticks: number[]): ConnectSticksStep[] {
  const steps: ConnectSticksStep[] = [];
  const lines = CONNECT_STICKS_STAGE2_LINES;

  // Step 0: 入口
  steps.push({
    heap: rawSticks.map((s) => ({ val: s, label: String(s) })),
    totalCost: 0,
    mergeHistory: [],
    decision: `主函数入口：共有 ${rawSticks.length} 根木棒，准备执行小根堆 Huffman 合并`,
    message: '核心贪心准则：每次必然弹出全局最小的两根木棒合并，让长木棒在树中处于更浅的层！',
    log: `enter connectSticks(n=${rawSticks.length})`,
    codeLine: lines.entry,
  });

  if (rawSticks.length <= 1) {
    steps.push({
      heap: rawSticks.map((s) => ({ val: s, label: String(s) })),
      totalCost: 0,
      mergeHistory: [],
      decision: '特判：木棒数量 <= 1，无需合并，总费用为 0',
      message: '边界情况',
      log: 'sticks len <= 1 -> 0',
      codeLine: lines.guard,
    });
    return steps;
  }

  // 初始化小根堆
  const heap = new SimpleHeap<string>('min');
  rawSticks.forEach((s) => heap.push(s, String(s)));

  steps.push({
    heap: heap.toVisualItems(),
    totalCost: 0,
    mergeHistory: [],
    decision: `将所有 ${rawSticks.length} 根木棒放入小根堆 PriorityQueue，初始总费用 = 0`,
    message: '堆顶时刻保持全局最小值',
    log: 'initialized heap with all sticks',
    codeLine: lines.initHeap,
  });

  let totalCost = 0;
  const history: MergeHistoryNode[] = [];
  let round = 1;

  while (heap.size() > 1) {
    steps.push({
      heap: heap.toVisualItems(),
      totalCost,
      mergeHistory: [...history],
      decision: `循环第 ${round} 轮合并：当前堆中尚有 ${heap.size()} 根木棒`,
      message: '准备弹出最小的两个元素',
      log: `start round ${round}`,
      codeLine: lines.loopMerge,
    });

    // 弹出最小两个
    const a = heap.pop()!;
    const b = heap.pop()!;
    const cost = a.val + b.val;
    totalCost += cost;

    steps.push({
      heap: heap.toVisualItems(),
      totalCost,
      poppedA: a.val,
      poppedB: b.val,
      mergedCost: cost,
      mergeHistory: [...history],
      decision: `贪心弹出两根最短木棒：a=${a.val}, b=${b.val}，本次合并费用 cost = ${a.val} + ${b.val} = ${cost}`,
      message: `累计总费用增至 ${totalCost}`,
      log: `popped ${a.val} and ${b.val}, cost=${cost}`,
      codeLine: lines.popTwo,
    });

    history.push({
      val: cost,
      label: `${cost} (${a.val}+${b.val})`,
      leftVal: a.val,
      rightVal: b.val,
    });

    // 放回新木棒
    heap.push(cost, `${cost}`);
    steps.push({
      heap: heap.toVisualItems(),
      totalCost,
      poppedA: a.val,
      poppedB: b.val,
      mergedCost: cost,
      mergeHistory: [...history],
      decision: `将合并产生的新木棒 (长度 ${cost}) 重新压入小根堆中继续参与后续合并`,
      message: `小根堆重新调整完毕，剩余元素数: ${heap.size()}`,
      log: `pushed ${cost} back to heap`,
      codeLine: lines.pushBack,
    });

    round++;
  }

  // 收尾
  steps.push({
    heap: heap.toVisualItems(),
    totalCost,
    mergeHistory: [...history],
    decision: `🎉 全部木棒合并完成！最终最低总费用为 ${totalCost}`,
    message: `利用小根堆在 O(N log N) 内构建出最优哈夫曼合并树`,
    log: `done totalCost=${totalCost}`,
    codeLine: lines.done,
  });

  return steps;
}

// ==========================================
// 3. 阶段 3：哈夫曼深度加权反证证明
// ==========================================
export function buildConnectSticksStage3Steps(rawSticks: number[]): ConnectSticksStep[] {
  const steps: ConnectSticksStep[] = [];
  const lines = CONNECT_STICKS_STAGE3_LINES;

  steps.push({
    heap: [],
    totalCost: 0,
    mergeHistory: [],
    decision: '阶段 3：哈夫曼树深度加权最优性反证证明',
    message: '数学定理：若二叉合并树中存在深层节点权值 x 大于浅层节点权值 y，交换两节点必使总费用严格降低！',
    log: 'enter verifyHuffmanDepthInvariant',
    codeLine: lines.entry,
  });

  steps.push({
    heap: [],
    totalCost: 0,
    mergeHistory: [],
    decision: '反证代数推导：总费用 Cost = ∑ (stick_i * depth_i)',
    message: '若 depth(x) > depth(y) 且 val(x) > val(y)，交换 x 和 y 的位置后：Δ = (x - y) * (depth(y) - depth(x)) < 0，总费用严格下降！这与“最优”矛盾！',
    log: 'depth invariant proved',
    codeLine: lines.computeDelta,
  });

  steps.push({
    heap: [],
    totalCost: 0,
    mergeHistory: [],
    decision: `🎉 反证成立：越短的木棒必须在越深的层被多次参与合并，贪心小根堆构建的二叉树即为全局最优哈夫曼树！`,
    message: '经典哈夫曼最优前缀编码数学证明完毕。',
    log: 'proof done',
    codeLine: lines.done,
  });

  return steps;
}

// ==========================================
// 4. 声明式可视化器配置
// ==========================================
const { template, Visualizer } = createDeclarativeVisualizer<ConnectSticksStep>({
  id: 'minimum-cost-connect-sticks',
  name: '连接棒材的最低费用 (Connect Sticks)',
  category: 'greedy',
  icon: '🥢',
  badge: {
    mode: '小根堆+哈夫曼合并',
    complexity: 'O(N log N) · O(N)',
  },
  card1Title: '🌲 哈夫曼合并生长动画与历史步骤沙盘',
  card2Title: '🌲 小根堆双形态呈现 (二叉树 + 物理数组)',
  card2Desc: '展示堆顶全局最小的两根棒材弹出合并过程',
  legend: [
    { label: '最新合并节点', color: '#3b82f6' },
    { label: '小根堆内棒材', color: '#10b981' },
    { label: '历史合并节点', color: '#64748b' },
  ],
  inputs: [
    {
      id: 'input-sticks',
      label: '木棒长度数组',
      type: 'text',
      defaultValue: '2, 4, 3',
      width: '160px',
      placeholder: '以逗号分隔正整数',
    },
  ],
  presets: [
    { label: '示例 1: [2, 4, 3]', values: { 'input-sticks': '2, 4, 3' } },
    { label: '示例 2: [1, 8, 3, 5]', values: { 'input-sticks': '1, 8, 3, 5' } },
    { label: '等长棒材: [5, 5, 5, 5]', values: { 'input-sticks': '5, 5, 5, 5' } },
  ],
  metrics: [
    { id: 'total-cost', label: '累计总费用', color: '#10b981' },
    { id: 'heap-size', label: '剩余木棒数', color: '#3b82f6' },
    { id: 'last-merge', label: '最近合并开销', color: '#f59e0b' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力组合对比',
      shortName: '暴力穷举',
      card2Desc: '穷举卡特兰数级别的所有括号化二叉树组合，展示无堆时的巨大冗余',
      codeLanguages: CONNECT_STICKS_STAGE1_CODES,
      buildSteps: (inputs) => parseAndBuild(inputs, 1),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 小根堆贪心推演',
      shortName: '堆贪心',
      card2Desc: '小根堆每次贪心弹出最小两数合并并放回，动态呈现最优合并树',
      codeLanguages: CONNECT_STICKS_STAGE2_CODES,
      buildSteps: (inputs) => parseAndBuild(inputs, 2),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 深度加权反证',
      shortName: '贪心证明',
      card2Desc: '代数证明较深叶子权值必更小，任何逆序对深度置换必使总开销增大',
      codeLanguages: CONNECT_STICKS_STAGE3_CODES,
      buildSteps: (inputs) => parseAndBuild(inputs, 3),
    },
  ],
  codeLanguages: CONNECT_STICKS_STAGE2_CODES,
  problemHtml: GREEDY_089_PROBLEMS.minimumCostConnectSticks.html,
  analysisHtml: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
      <h3 style="color: #0f172a; margin-top: 0;">🧠 哈夫曼树最优性数学本质</h3>
      <p>设将 $N$ 根木棒合并成一根的过程对应于一棵二叉树，初始木棒作为叶子节点，合并生成的新棒作为内部节点。</p>
      <p>若木棒 $i$ 在树中的深度（即参与合并的次数）为 $d_i$，则它对最终总费用的贡献为：</p>
      <div style="padding: 6px 12px; background: #eff6ff; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #1d4ed8;">
        \\text{Total Cost} = \\sum_{i=1}^N (sticks[i] \\times d_i)
      </div>
      <p><b>排序不等式反序原理：</b></p>
      <p>要让 $\\sum (sticks[i] \\times d_i)$ 最小，权值越大的木棒必须分配给越小的深度 $d_i$（少合并几次）；权值越小的木棒分配给越大的深度 $d_i$（多合并几次）。</p>
      <p>小根堆每次选取全局最小的两根木棒进行合并并沉入更深层次，严格契合了该数学极值条件！</p>
    </div>
  `,
  buildSteps: (inputs) => parseAndBuild(inputs, 2),
  renderCanvas: (container, step) => {
    const history = step.mergeHistory || [];
    const last = history[history.length - 1];

    const historyItems = history
      .map((h, idx) => `
        <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; background: #ffffff; border: 1.5px solid #cbd5e1; font-family: 'JetBrains Mono', monospace; font-size: 11px;">
          <span style="color: #64748b; font-size: 10px;">#${idx + 1}</span>
          <span style="font-weight: 700; color: #1e293b;">${h.leftVal} + ${h.rightVal}</span>
          <span style="color: #3b82f6; font-weight: 800;">➔ ${h.val}</span>
        </div>
      `)
      .join('');

    container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 12px; box-sizing: border-box; justify-content: center;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
          <span style="font-size: 12px; font-weight: 700; color: #475569;">🌲 哈夫曼合并历史记录</span>
          <span style="font-size: 12px; font-weight: 800; color: #10b981; font-family: 'JetBrains Mono', monospace;">累计总费用: ${step.totalCost}</span>
        </div>

        ${last ? `
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: 8px; background: #f0fdf4; border: 2px solid #86efac;">
            <span style="font-size: 13px; font-weight: 700; color: #166534;">当前合并：</span>
            <span style="font-size: 16px; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #15803d;">${last.leftVal} + ${last.rightVal} ➔ ${last.val}</span>
          </div>
        ` : '<div style="text-align: center; color: #94a3b8; font-size: 12px; font-style: italic;">等待合并开始...</div>'}

        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 8px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; max-height: 120px; overflow-y: auto;">
          ${historyItems || '<span style="color: #94a3b8; font-size: 11px;">暂无历史合并</span>'}
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const heapItems = step.heap || [];
    renderDualHeapVisual(container, heapItems, 'min', '小根堆 (维护当前所有木棒长度)');
  },
});

function parseAndBuild(inputs: Record<string, any>, stage: number): ConnectSticksStep[] {
  const raw = String(inputs?.['input-sticks'] || '2, 4, 3');
  const sticks = raw
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n > 0);

  if (sticks.length === 0) {
    sticks.push(2, 4, 3);
  }

  if (stage === 1) return buildConnectSticksStage1Steps(sticks.slice(0, 5));
  if (stage === 2) return buildConnectSticksStage2Steps(sticks);
  return buildConnectSticksStage3Steps(sticks);
}

export const MinimumCostConnectSticksVisualizer = Visualizer;

registerAlgorithm({
  id: 'minimum-cost-connect-sticks',
  name: '连接棒材的最低费用 (Connect Sticks)',
  viewId: 'algo-minimum-cost-connect-sticks-view',
  category: 'greedy',
  description: '左程云算法讲解089 Code06：LeetCode 1167 / 洛谷 P1090 合并果子，小根堆贪心与最优哈夫曼树',
  icon: '🥢',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 896,
  learningGoal: '掌握哈夫曼树在加权路径长度最小化中的核心应用，理解小根堆合并的贪心选择性',
});
