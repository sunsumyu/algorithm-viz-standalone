/**
 * 多重背包二进制拆分 (洛谷 P1776 宝物筛选 / 左程云 Class 075 Code02)
 * Step Compiler: 多重背包按二进制 1, 2, 4, 8... 位权拆分为独立衍生 01 包，随后执行 01 空间压缩
 */

import type { HighlightTarget } from '../../code-panel';

export interface DerivedItem {
  origIndex: number;
  multiplier: number;
  val: number;
  weight: number;
}

export interface BoundedKnapsackBinaryStep {
  curDerivedIndex: number;
  derivedItems: DerivedItem[];
  j: number;
  dp: number[];
  maxVal: number;
  totalCapacity: number;
  status: 'split' | 'dp-item' | 'check' | 'update' | 'done';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  selectedDerived: DerivedItem[];
  metrics?: Record<string, any>;
}

export function parseBinarySplitInputs(inputs: Record<string, any>) {
  const t = Math.max(0, parseInt(inputs['input-t'], 10) || 0);
  const parseList = (str: string) =>
    (str || '')
      .split(/[,，\s]+/)
      .map((x) => parseInt(x.trim(), 10))
      .filter((x) => !isNaN(x));

  const vList = parseList(inputs['input-v']);
  const wList = parseList(inputs['input-w']);
  const cList = parseList(inputs['input-c']);

  const n = Math.min(vList.length, wList.length, cList.length);
  const derivedItems: DerivedItem[] = [];

  // 1. 二进制拆分阶段
  for (let i = 0; i < n; i++) {
    let cnt = cList[i];
    const val = vList[i];
    const weight = wList[i];

    for (let k = 1; k <= cnt; k <<= 1) {
      derivedItems.push({
        origIndex: i,
        multiplier: k,
        val: k * val,
        weight: k * weight,
      });
      cnt -= k;
    }
    if (cnt > 0) {
      derivedItems.push({
        origIndex: i,
        multiplier: cnt,
        val: cnt * val,
        weight: cnt * weight,
      });
    }
  }

  return { t, vList, wList, cList, n, derivedItems };
}

export function buildBoundedKnapsackBinarySteps(inputs: Record<string, any>): BoundedKnapsackBinaryStep[] {
  const { t, vList, wList, cList, n } = parseBinarySplitInputs(inputs);
  const derivedItems: DerivedItem[] = [];
  const steps: BoundedKnapsackBinaryStep[] = [];

  const lines = {
    entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
    splitTreeLoop: { java: 6, cpp: 4, python: 4, javascript: 4 },
    splitPow2: { java: 8, cpp: 6, python: 7, javascript: 6 },
    splitRemainder: { java: 12, cpp: 10, python: 11, javascript: 10 },
    initDp: { java: 16, cpp: 14, python: 13, javascript: 14 },
    derivedLoop: { java: 17, cpp: 15, python: 14, javascript: 15 },
    capLoop: { java: 18, cpp: 16, python: 15, javascript: 16 },
    updateDp: { java: 19, cpp: 17, python: 16, javascript: 17 },
    returnAns: { java: 22, cpp: 20, python: 17, javascript: 20 },
  };

  const dp = new Array(t + 1).fill(0);
  let bestDerivedForCapacity: DerivedItem[][] = Array.from({ length: t + 1 }, () => []);

  const makeStep = (data: Partial<BoundedKnapsackBinaryStep> & {
    status: BoundedKnapsackBinaryStep['status'];
    message: string;
    log: string;
  }): BoundedKnapsackBinaryStep => {
    const dIdx = data.curDerivedIndex ?? -1;
    const jVal = data.j ?? -1;
    return {
      curDerivedIndex: dIdx,
      derivedItems: [...derivedItems],
      j: jVal,
      dp: [...dp],
      maxVal: dp[t],
      totalCapacity: t,
      status: data.status,
      message: data.message,
      log: data.log,
      codeLine: data.codeLine,
      selectedDerived: data.selectedDerived ? [...data.selectedDerived] : [...(bestDerivedForCapacity[t] || [])],
      metrics: {
        'metric-orig-n': `${n} 种`,
        'metric-derived-m': `${derivedItems.length} 个`,
        'metric-cur-derived': dIdx >= 0 ? `#${dIdx + 1}` : '—',
        'metric-max-val': `${dp[t]}`,
      },
    };
  };

  // 1. 函数入口
  steps.push(
    makeStep({
      status: 'split',
      message: `🏁 多重背包二进制拆分开始：进入 computeBinary 函数，背包容量 t=${t}，共有 ${n} 种宝物。`,
      log: `init: t=${t}, n=${n}`,
      codeLine: lines.entry,
      selectedDerived: [],
    })
  );

  // 2. 逐件宝物二进制拆分 (遍历第 6~15 行)
  for (let i = 0; i < n; i++) {
    let cnt = cList[i];
    const val = vList[i];
    const weight = wList[i];

    // 2.1 循环进入宝物 i (Line 6)
    steps.push(
      makeStep({
        status: 'split',
        message: `📦 考察宝物 #${i + 1}：单件价值 ${val}，重量 ${weight}，共有数量 ${cnt} 件。`,
        log: `split loop: item #${i + 1}, cnt=${cnt}`,
        codeLine: lines.splitTreeLoop,
        selectedDerived: [],
      })
    );

    // 2.2 二进制拆分 (Line 8~11)
    for (let k = 1; k <= cnt; k <<= 1) {
      derivedItems.push({
        origIndex: i,
        multiplier: k,
        val: k * val,
        weight: k * weight,
      });

      steps.push(
        makeStep({
          curDerivedIndex: derivedItems.length - 1,
          status: 'split',
          message: `✂️ 二进制位权拆分：按位权 2^p = ${k} 打包生成衍生包 #${derivedItems.length}（×${k} 件，重量 ${k * weight}，价值 ${k * val}），剩余可用数量 ${cnt - k}。`,
          log: `split pack #${derivedItems.length}: item #${i + 1} x${k}`,
          codeLine: lines.splitPow2,
          selectedDerived: [],
        })
      );

      cnt -= k;
    }

    // 2.3 补齐余数碎片 (Line 12~14)
    if (cnt > 0) {
      derivedItems.push({
        origIndex: i,
        multiplier: cnt,
        val: cnt * val,
        weight: cnt * weight,
      });

      steps.push(
        makeStep({
          curDerivedIndex: derivedItems.length - 1,
          status: 'split',
          message: `🧩 余数包装：余下 ${cnt} 件无法凑成完整 2 的幂，打包为衍生包 #${derivedItems.length}（×${cnt} 件，重量 ${cnt * weight}，价值 ${cnt * val}）。至此宝物 #${i + 1} 拆分完毕。`,
          log: `split remainder #${derivedItems.length}: item #${i + 1} x${cnt}`,
          codeLine: lines.splitRemainder,
          selectedDerived: [],
        })
      );
    }
  }

  // 3. DP 状态初始化 (Line 16)
  steps.push(
    makeStep({
      status: 'dp-item',
      message: `📊 拆分完成：原 ${n} 种多重物品共生成 ${derivedItems.length} 个衍生 01 物品！初始化 dp[0..${t}] 为 0，准备开启一维 01 逆序背包。`,
      log: `initDp: total derived=${derivedItems.length}, cap=${t}`,
      codeLine: lines.initDp,
      selectedDerived: [],
    })
  );

  // 4. 执行 01 空间压缩推演 (Line 17~20)
  for (let d = 0; d < derivedItems.length; d++) {
    const item = derivedItems[d];
    const weight = item.weight;
    const val = item.val;

    // 4.1 遍历衍生物品 (Line 17)
    steps.push(
      makeStep({
        curDerivedIndex: d,
        status: 'dp-item',
        message: `🎒 遍历衍生物品 #${d + 1}：源自宝物 #${item.origIndex + 1}×${item.multiplier}（重 ${weight}，价值 ${val}）。`,
        log: `derived item #${d + 1}: w=${weight}, v=${val}`,
        codeLine: lines.derivedLoop,
      })
    );

    const nextBestDerived = bestDerivedForCapacity.map((list) => [...list]);

    // 4.2 倒序枚举容量 (Line 18)
    for (let j = t; j >= weight; j--) {
      steps.push(
        makeStep({
          curDerivedIndex: d,
          j,
          status: 'check',
          message: `⏳ 倒序枚举容量：当前考察背包容量 j=${j} >= 衍生包重 ${weight}。`,
          log: `cap loop: j=${j}`,
          codeLine: lines.capLoop,
        })
      );

      // 4.3 状态转移比较与更新 (Line 19)
      const candidate = dp[j - weight] + val;
      const updated = candidate > dp[j];

      if (updated) {
        dp[j] = candidate;
        nextBestDerived[j] = [...bestDerivedForCapacity[j - weight], item];
      }

      steps.push(
        makeStep({
          curDerivedIndex: d,
          j,
          status: updated ? 'update' : 'check',
          selectedDerived: [...(nextBestDerived[t] || [])],
          message: updated
            ? `✨ 状态转移成功：放入衍生包 #${d + 1} 刷新最高收益 dp[${j}] = Math.max(${dp[j]}, dp[${j - weight}] + ${val}) = ${candidate}！`
            : `⏸️ 状态保持：放入收益 ${candidate} <= 原收益 ${dp[j]}，保持原值。`,
          log: `dp[${j}] = Math.max(${dp[j]}, ${candidate}) => ${dp[j]}`,
          codeLine: lines.updateDp,
        })
      );
    }

    bestDerivedForCapacity = nextBestDerived;
  }

  // 5. 最终返回 (Line 22)
  steps.push(
    makeStep({
      j: t,
      status: 'done',
      message: `🎉 二进制拆分 01 背包求解完成！在总容量 ${t} 下，通过挑选无漏的二进制衍生包，获得最大总价值为 ${dp[t]}！`,
      log: `return dp[${t}]=${dp[t]}`,
      codeLine: lines.returnAns,
      selectedDerived: [...(bestDerivedForCapacity[t] || [])],
    })
  );

  return steps;
}
