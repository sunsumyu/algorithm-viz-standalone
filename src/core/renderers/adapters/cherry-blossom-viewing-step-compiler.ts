import { HighlightTarget } from '../../code-panel';
import { DerivedItem } from '../../../algorithms/categories/dynamic-programming/knapsack-075/bounded-knapsack-stage-evolution';

export interface CherryItem {
  cost: number;
  val: number;
  cnt: number;
  type: 'unbounded' | 'bounded' | 'zero-one';
}

export interface CherryDerivedItem {
  treeIndex: number;
  multiplier: number;
  timeCost: number;
  valEarned: number;
}

export interface CherryBlossomViewingStep {
  treeIndex: number;
  derivedIndex: number;
  j: number;
  dp: number[];
  maxVal: number;
  totalTime: number;
  trees: CherryItem[];
  derivedList: CherryDerivedItem[];
  status: 'init' | 'split' | 'tree' | 'check' | 'update' | 'done';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  selectedDerived: CherryDerivedItem[];
  metrics?: Record<string, any>;
}

export function parseCherryDerivedItems(inputs: Record<string, any>): {
  t: number;
  costList: number[];
  valList: number[];
  cntList: number[];
  n: number;
  derivedItems: DerivedItem[];
} {
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
  const derivedItems: DerivedItem[] = [];

  for (let i = 0; i < n; i++) {
    const cost = costList[i];
    const val = valList[i];
    const origCnt = cntList[i];
    let c = origCnt === 0 ? Math.max(1, Math.floor(t / Math.max(1, cost))) : origCnt;

    for (let k = 1; k <= c; k <<= 1) {
      derivedItems.push({
        origIndex: i,
        multiplier: k,
        weight: k * cost,
        val: k * val,
      });
      c -= k;
    }
    if (c > 0) {
      derivedItems.push({
        origIndex: i,
        multiplier: c,
        weight: c * cost,
        val: c * val,
      });
    }
  }

  return { t, costList, valList, cntList, n, derivedItems };
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

  const lines = {
    entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
    splitTreeLoop: { java: 6, cpp: 4, python: 4, javascript: 4 },
    splitConvert: { java: 7, cpp: 5, python: 5, javascript: 5 },
    splitPow2: { java: 8, cpp: 6, python: 7, javascript: 6 },
    splitRemainder: { java: 12, cpp: 10, python: 11, javascript: 10 },
    initDp: { java: 16, cpp: 14, python: 13, javascript: 14 },
    derivedLoop: { java: 17, cpp: 15, python: 14, javascript: 15 },
    capLoop: { java: 18, cpp: 16, python: 15, javascript: 16 },
    updateDp: { java: 19, cpp: 17, python: 16, javascript: 17 },
    returnAns: { java: 22, cpp: 20, python: 17, javascript: 20 },
  };

  const derivedList: CherryDerivedItem[] = [];
  const dp = new Array(t + 1).fill(0);
  let bestDerivedForCapacity: CherryDerivedItem[][] = Array.from({ length: t + 1 }, () => []);

  const makeStep = (data: Partial<CherryBlossomViewingStep> & {
    status: CherryBlossomViewingStep['status'];
    message: string;
    log: string;
  }): CherryBlossomViewingStep => {
    const treeIdx = data.treeIndex ?? -1;
    const jVal = data.j ?? -1;
    let typeStr = '—';
    if (treeIdx >= 0 && trees[treeIdx]) {
      const type = trees[treeIdx].type;
      typeStr = type === 'unbounded' ? '完全背包 (无限)' : type === 'zero-one' ? '01背包 (单次)' : `多重背包 (×${trees[treeIdx].cnt})`;
    }

    return {
      treeIndex: treeIdx,
      derivedIndex: data.derivedIndex ?? -1,
      j: jVal,
      dp: [...dp],
      maxVal: dp[t],
      totalTime: t,
      trees: [...trees],
      derivedList: [...derivedList],
      status: data.status,
      message: data.message,
      log: data.log,
      codeLine: data.codeLine,
      selectedDerived: data.selectedDerived ? [...data.selectedDerived] : [...(bestDerivedForCapacity[t] || [])],
      metrics: {
        'metric-total-time': `${t} min`,
        'metric-cur-tree': treeIdx >= 0 ? `树 #${treeIdx + 1}` : '—',
        'metric-tree-type': typeStr,
        'metric-max-val': `${dp[t]}`,
      },
    };
  };

  // Step 1: 算法入口与初始化
  steps.push(
    makeStep({
      status: 'init',
      message: `🌸 观赏樱花开始：进入 computeCherry 函数，总可用时间 t=${t} 分钟，园内共有 ${n} 棵樱花树。`,
      log: `init: t=${t}, n=${n}`,
      codeLine: lines.entry,
      selectedDerived: [],
    })
  );

  // Step 2: 细粒度逐树二进制拆分推演
  for (let i = 0; i < n; i++) {
    const tree = trees[i];
    const isUnbounded = tree.cnt === 0;
    let c = isUnbounded ? Math.max(1, Math.floor(t / Math.max(1, tree.cost))) : tree.cnt;

    // 2.1 循环进入第 i 棵树
    steps.push(
      makeStep({
        treeIndex: i,
        status: 'split',
        message: `🌳 考察樱花树 #${i + 1}：${isUnbounded ? '完全背包（无限次观赏）' : tree.cnt === 1 ? '01 背包（单次）' : `多重背包（限观赏 ${tree.cnt} 次）`}，耗时 ${tree.cost}m，美学价值 +${tree.val}。`,
        log: `split loop: tree #${i + 1}, cnt=${tree.cnt}`,
        codeLine: lines.splitTreeLoop,
        selectedDerived: [],
      })
    );

    // 2.2 完全背包有界化
    if (isUnbounded) {
      steps.push(
        makeStep({
          treeIndex: i,
          status: 'split',
          message: `🔄 完全背包转化：樱花树 #${i + 1} 虽可无限观赏，但受时限 t=${t}m 制约，最多观赏 floor(${t}/${tree.cost})=${c} 次，无损转为多重背包 (c=${c})！`,
          log: `unbounded convert: tree #${i + 1} => c=${c}`,
          codeLine: lines.splitConvert,
          selectedDerived: [],
        })
      );
    }

    // 2.3 二进制位权 1, 2, 4... 拆分
    for (let k = 1; k <= c; k <<= 1) {
      derivedList.push({
        treeIndex: i,
        multiplier: k,
        timeCost: k * tree.cost,
        valEarned: k * tree.val,
      });

      steps.push(
        makeStep({
          treeIndex: i,
          derivedIndex: derivedList.length - 1,
          status: 'split',
          message: `📦 二进制位权拆分：为树 #${i + 1} 按位权 2^p = ${k} 打包生成衍生包 #${derivedList.length}（×${k} 件，耗时 ${k * tree.cost}m，美学 +${k * tree.val}），剩余可用拆分量 c=${c - k}。`,
          log: `split pack #${derivedList.length}: tree #${i + 1} x${k}`,
          codeLine: lines.splitPow2,
          selectedDerived: [],
        })
      );

      c -= k;
    }

    // 2.4 补齐余数碎片
    if (c > 0) {
      derivedList.push({
        treeIndex: i,
        multiplier: c,
        timeCost: c * tree.cost,
        valEarned: c * tree.val,
      });

      steps.push(
        makeStep({
          treeIndex: i,
          derivedIndex: derivedList.length - 1,
          status: 'split',
          message: `🧩 补齐余数碎片：树 #${i + 1} 剩余不可被二进制幂整除的余量 c=${c}，打包为衍生包 #${derivedList.length}（×${c} 件，耗时 ${c * tree.cost}m，美学 +${c * tree.val}）！`,
          log: `split remainder #${derivedList.length}: tree #${i + 1} x${c}`,
          codeLine: lines.splitRemainder,
          selectedDerived: [],
        })
      );
    }
  }

  // 2.5 拆分总结
  steps.push(
    makeStep({
      status: 'split',
      message: `✂️ 混合二进制拆分完毕！原始 ${n} 棵树全部拆解为 ${derivedList.length} 个独立 01 衍生包，混合背包模型统一转化为标准 01 背包！`,
      log: `split all done: trees=${n} => derived=${derivedList.length}`,
      codeLine: lines.splitPow2,
      selectedDerived: [],
    })
  );

  // 3. DP 数组初始化
  steps.push(
    makeStep({
      status: 'split',
      message: `📊 初始化 DP 数组：分配 dp[0..${t}] 空间，初始最大美学价值为 0。`,
      log: `init: dp[0..${t}] = 0`,
      codeLine: lines.initDp,
      selectedDerived: [],
    })
  );

  if (n === 0 || t === 0 || derivedList.length === 0) {
    steps.push(
      makeStep({
        j: 0,
        status: 'done',
        message: '🏁 可用时间为 0 或无可观赏樱花树，最大美学价值为 0。',
        log: 'done: ans=0',
        codeLine: lines.returnAns,
        selectedDerived: [],
      })
    );
    return steps;
  }

  // 4. 01 背包空间压缩
  for (let idx = 0; idx < derivedList.length; idx++) {
    const item = derivedList[idx];

    steps.push(
      makeStep({
        treeIndex: item.treeIndex,
        derivedIndex: idx,
        status: 'tree',
        message: `🌸 考察樱花树 #${item.treeIndex + 1} 衍生包 #${idx + 1} (×${item.multiplier})：耗时 ${item.timeCost} 分钟，收获美学价值 +${item.valEarned}。`,
        log: `derived #${idx + 1}: time=${item.timeCost}, val=${item.valEarned}`,
        codeLine: lines.derivedLoop,
      })
    );

    const nextBest = bestDerivedForCapacity.map((list) => [...list]);

    for (let j = t; j >= item.timeCost; j--) {
      steps.push(
        makeStep({
          treeIndex: item.treeIndex,
          derivedIndex: idx,
          j,
          status: 'check',
          message: `⏳ 时间倒序循环：当前可用时间 j=${j} 分钟 >= 耗时 ${item.timeCost} 分钟。`,
          log: `cap loop: j=${j}`,
          codeLine: lines.capLoop,
        })
      );

      const candidate = dp[j - item.timeCost] + item.valEarned;
      const updated = candidate > dp[j];
      if (updated) {
        dp[j] = candidate;
        nextBest[j] = [...bestDerivedForCapacity[j - item.timeCost], item];
      }

      steps.push(
        makeStep({
          treeIndex: item.treeIndex,
          derivedIndex: idx,
          j,
          status: updated ? 'update' : 'check',
          selectedDerived: [...(nextBest[t] || [])],
          message: updated
            ? `✨ 状态更新：分配时间给樱花树 #${item.treeIndex + 1}，刷新最大美学价值 dp[${j}]=${dp[j]}！`
            : `⏸️ 状态保持：赏花收益 ${candidate} <= 原收益 ${dp[j]}，保持原行程。`,
          log: `dp[${j}] = Math.max(${dp[j]}, ${candidate}) => ${dp[j]}`,
          codeLine: lines.updateDp,
        })
      );
    }

    bestDerivedForCapacity = nextBest;
  }

  steps.push(
    makeStep({
      treeIndex: -1,
      j: t,
      status: 'done',
      message: `🎉 赏花行程规划完毕！在 ${t} 分钟时限内，最科学的赏花决策可收获最大美学价值 ${dp[t]}！`,
      log: `done: ans=${dp[t]}`,
      codeLine: lines.returnAns,
      selectedDerived: [...(bestDerivedForCapacity[t] || [])],
    })
  );

  return steps;
}
