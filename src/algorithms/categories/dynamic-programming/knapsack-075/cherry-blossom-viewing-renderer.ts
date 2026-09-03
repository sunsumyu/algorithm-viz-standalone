import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { KNAPSACK_075_PROBLEMS } from './knapsack-075-problem-content';

export interface CherryItem {
  cost: number;
  val: number;
  cnt: number;
  type: 'unbounded' | 'bounded' | 'zero-one';
}

export interface CherryBlossomViewingStep {
  treeIndex: number;
  derivedIndex: number;
  j: number;
  dp: number[];
  maxVal: number;
  totalTime: number;
  trees: CherryItem[];
  status: 'init' | 'tree' | 'update' | 'done';
  message: string;
  log: string;
  codeLine: number;
}

export function buildCherryBlossomViewingSteps(inputs: Record<string, any>): CherryBlossomViewingStep[] {
  const t = Math.max(0, parseInt(inputs['input-t'], 10) || 0);
  const parseList = (str: string) =>
    (str || '')
      .split(/[,，\s]+/)
      .map((x) => parseInt(x.trim(), 10))
      .filter((x) => !isNaN(x));

  const costList = parseList(inputs['input-costs']);
  const valList = parseList(inputs['input-vals']);
  const cntList = parseList(inputs['input-cnts']);

  const n = Math.min(costList.length, valList.length, cntList.length);
  const steps: CherryBlossomViewingStep[] = [];

  const trees: CherryItem[] = [];
  for (let i = 0; i < n; i++) {
    const c = cntList[i];
    trees.push({
      cost: costList[i],
      val: valList[i],
      cnt: c,
      type: c === 0 ? 'unbounded' : c === 1 ? 'zero-one' : 'bounded',
    });
  }

  const dp = new Array(t + 1).fill(0);

  const makeStep = (p: Partial<CherryBlossomViewingStep>): CherryBlossomViewingStep => ({
    treeIndex: p.treeIndex ?? -1,
    derivedIndex: p.derivedIndex ?? -1,
    j: p.j ?? 0,
    dp: [...(p.dp ?? dp)],
    maxVal: p.maxVal ?? dp[t],
    totalTime: t,
    trees: [...trees],
    status: p.status ?? 'tree',
    message: p.message ?? '',
    log: p.log ?? '',
    codeLine: p.codeLine ?? 4,
  });

  steps.push(
    makeStep({
      status: 'init',
      message: `🌸 观赏樱花开始：可用时间为 ${t} 分钟，园内共有 ${n} 棵樱花树。`,
      log: `init: t=${t}, n=${n}`,
      codeLine: 4,
    })
  );

  if (n === 0 || t === 0) {
    steps.push(
      makeStep({
        status: 'done',
        message: '🏁 可用时间为 0 或无樱花树，最大价值为 0。',
        log: 'done: ans=0',
        codeLine: 35,
      })
    );
    return steps;
  }

  // 转化为衍生包并动态规划
  const derivedV: number[] = [];
  const derivedW: number[] = [];
  const derivedTree: number[] = [];

  for (let i = 0; i < n; i++) {
    const tree = trees[i];
    // 若 cnt == 0 (无限观赏)，时间最多 1000 分钟，最多看 1000 次
    let c = tree.cnt === 0 ? Math.max(1, Math.floor(t / Math.max(1, tree.cost))) : tree.cnt;

    for (let k = 1; k <= c; k <<= 1) {
      derivedV.push(k * tree.val);
      derivedW.push(k * tree.cost);
      derivedTree.push(i);
      c -= k;
    }
    if (c > 0) {
      derivedV.push(c * tree.val);
      derivedW.push(c * tree.cost);
      derivedTree.push(i);
    }
  }

  for (let idx = 0; idx < derivedV.length; idx++) {
    const itemV = derivedV[idx];
    const itemW = derivedW[idx];
    const treeIdx = derivedTree[idx];
    const tree = trees[treeIdx];

    steps.push(
      makeStep({
        treeIndex: treeIdx,
        derivedIndex: idx,
        status: 'tree',
        message: `🌸 考察樱花树 #${treeIdx + 1} (${tree.type === 'unbounded' ? '无限次完全背包' : '有限次多重背包'} 衍生包): 耗时 ${itemW} 分钟，获得美学价值 +${itemV}。`,
        log: `tree #${treeIdx + 1} derived #${idx + 1}: w=${itemW}, v=${itemV}`,
        codeLine: 26,
      })
    );

    for (let j = t; j >= itemW; j--) {
      const candidate = dp[j - itemW] + itemV;
      if (candidate > dp[j]) {
        dp[j] = candidate;
        steps.push(
          makeStep({
            treeIndex: treeIdx,
            derivedIndex: idx,
            j,
            dp: [...dp],
            maxVal: dp[t],
            status: 'update',
            message: `✨ 时间剩余 j=${j} 分钟：分配时间给樱花树 #${treeIdx + 1}，将累计美学价值刷新至 dp[${j}]=${dp[j]}！`,
            log: `update: dp[${j}]=${dp[j]}`,
            codeLine: 31,
          })
        );
      }
    }
  }

  steps.push(
    makeStep({
      treeIndex: -1,
      j: t,
      status: 'done',
      message: `🎉 游览结束！在 ${t} 分钟时限内，最科学的赏花决策可收获最大美学价值 ${dp[t]}！`,
      log: `done: ans=${dp[t]}`,
      codeLine: 35,
    })
  );

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<CherryBlossomViewingStep>({
  id: 'cherry-blossom-viewing',
  name: '观赏樱花 (洛谷 P1833 混合背包)',
  category: 'dynamic-programming',
  badge: {
    mode: '混合背包 · 统一拆分',
    complexity: 'O(T · Σlog c) · O(T)',
  },
  card1Title: '🌸 樱花树林图谱 (01背包 / 完全背包 / 多重背包全兼容)',
  card2Title: '📈 赏花美学价值向量 dp[0..T]',
  inputs: [
    { id: 'input-t', label: '可用时间 t:', type: 'number', defaultValue: 10, width: '55px' },
    { id: 'input-costs', label: '耗时 costs:', type: 'text', defaultValue: '2, 3, 5', width: '110px' },
    { id: 'input-vals', label: '美学价值 vals:', type: 'text', defaultValue: '3, 4, 10', width: '110px' },
    { id: 'input-cnts', label: '观赏限制 cnts:', type: 'text', defaultValue: '0, 2, 1', width: '110px' },
  ],
  presets: [
    {
      label: '洛谷混合案例 (t=10, 包含完全/多重/01, Ans=16)',
      values: { 'input-t': 10, 'input-costs': '2, 3, 5', 'input-vals': '3, 4, 10', 'input-cnts': '0, 2, 1' },
    },
    {
      label: '全无限观赏 (t=12, costs=[3,4], vals=[5,7], cnts=[0,0], Ans=21)',
      values: { 'input-t': 12, 'input-costs': '3, 4', 'input-vals': '5, 7', 'input-cnts': '0, 0' },
    },
  ],
  metrics: [
    { id: 'metric-total-time', label: '总可用时间', color: '#38bdf8' },
    { id: 'metric-cur-tree', label: '当前樱花树', color: '#f59e0b' },
    { id: 'metric-tree-type', label: '背包模式分类', color: '#ec4899' },
    { id: 'metric-max-val', label: '最大美学总价值', color: '#10b981' },
  ],
  codeLanguages: KNAPSACK_075_PROBLEMS['cherry-blossom-viewing'].codeLanguages,
  problemHtml: KNAPSACK_075_PROBLEMS['cherry-blossom-viewing'].problemHtml,
  analysisHtml: KNAPSACK_075_PROBLEMS['cherry-blossom-viewing'].analysisHtml,
  buildSteps: buildCherryBlossomViewingSteps,
  renderCustomStep: (step, { container, updateMetric }) => {
    updateMetric('metric-total-time', `${step.totalTime} min`);
    updateMetric('metric-cur-tree', step.treeIndex >= 0 ? `树 #${step.treeIndex + 1}` : '—');
    if (step.treeIndex >= 0 && step.trees[step.treeIndex]) {
      const type = step.trees[step.treeIndex].type;
      updateMetric('metric-tree-type', type === 'unbounded' ? '完全背包(无限)' : type === 'zero-one' ? '01背包(单次)' : '多重背包(有限)');
    } else {
      updateMetric('metric-tree-type', '—');
    }
    updateMetric('metric-max-val', `${step.maxVal}`);

    const treesHtml = step.trees
      .map((tree, idx) => {
        const isCur = idx === step.treeIndex;
        const tag = tree.type === 'unbounded' ? '♾️ 完全' : tree.type === 'zero-one' ? '🎯 01' : `📦 多重×${tree.cnt}`;
        return `
          <div style="background:${isCur ? '#1e293b' : '#0f172a'}; border:1px solid ${
          isCur ? '#ec4899' : '#334155'
        }; border-radius:6px; padding:6px 10px; min-width:95px; flex:1;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11px; font-weight:700; color:${isCur ? '#ec4899' : '#f472b6'};">树 #${idx + 1}</span>
              <span style="font-size:9px; background:#831843; color:#fbcfe8; padding:1px 4px; border-radius:3px;">${tag}</span>
            </div>
            <div style="font-size:12px; color:#f8fafc; margin-top:2px;">🌸 美学: <b>+${tree.val}</b></div>
            <div style="font-size:10px; color:#94a3b8;">⏱️ 耗时: ${tree.cost} 分钟</div>
          </div>
        `;
      })
      .join('');

    const dpCells = step.dp
      .map((val, j) => {
        const isTarget = j === step.j;
        return `
          <div style="flex:1; min-width:30px; background:${isTarget ? '#db2777' : val > 0 ? '#064e3b' : '#1e293b'};
                      border:1px solid ${isTarget ? '#f472b6' : '#334155'}; border-radius:4px;
                      padding:4px 2px; text-align:center;">
            <div style="font-size:9px; color:#94a3b8;">${j}m</div>
            <div style="font-size:11px; font-weight:700; color:#f8fafc;">${val}</div>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="width:100%; display:flex; flex-direction:column; gap:8px; padding:4px 8px; box-sizing:border-box;">
        <div style="font-size:11px; color:#94a3b8; font-weight:700;">樱花林品种清单 (完全背包 cnt=0 转化为容量上限多重背包)</div>
        <div style="display:flex; gap:6px; overflow-x:auto; background:#0b1329; padding:6px; border-radius:6px;">
          ${treesHtml}
        </div>
        <div style="font-size:11px; color:#94a3b8; font-weight:700;">DP 时间收益矩阵 dp[0..${step.totalTime}]</div>
        <div style="display:flex; gap:3px; overflow-x:auto; background:#0b1329; padding:6px; border-radius:6px;">
          ${dpCells}
        </div>
      </div>
    `;
  },
});

export const CherryBlossomViewingVisualizer = Visualizer;

registerAlgorithm({
  id: 'cherry-blossom-viewing',
  name: '观赏樱花 (洛谷 P1833 混合背包)',
  viewId: 'algo-cherry-blossom-viewing-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 075 Code03：洛谷 P1833 观赏樱花，统一融合 01 背包、完全背包与多重背包的经典混合背包模版',
  icon: '🌸',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 92,
  learningGoal: '掌握混合背包的判定边界、完全背包向上界多重背包的数学转化与统一二进制拆分',
});
