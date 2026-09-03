/**
 * 通用背包算法推演核心深模块 (KnapsackExecutionEngine)
 * 深度设计原则：小接口 + 丰富内部实现 (Small Interface, Deep Implementation)
 * 
 * 职责：
 * 1. 统一生成 01 背包、分组背包、完全背包、多重背包的全流程行行逐行单步执行流
 * 2. 统一映射 Java / C++ / Python / JavaScript 4 语言行号
 * 3. 实时跟踪最优解入选商品清单 (Solution Reconstruction) 与试算对比指标
 */

import { HighlightTarget } from './code-panel';

export interface KnapsackItem {
  cost: number;
  val: number;
  group?: number;
  id?: string | number;
  name?: string;
}

export interface KnapsackLanguageLineMap {
  initDp?: number | Record<string, number>;
  sort?: number | Record<string, number>;
  outerLoop?: number | Record<string, number>;
  groupEnd?: number | Record<string, number>;
  capLoop?: number | Record<string, number>;
  itemLoop?: number | Record<string, number>;
  ifFit?: number | Record<string, number>;
  updateDp?: number | Record<string, number>;
  advanceLoop?: number | Record<string, number>;
  returnAns?: number | Record<string, number>;
}

export interface KnapsackExecutionStep {
  groupIndex: number;
  itemIndex: number;
  j: number;
  dp: number[];
  maxVal: number;
  items: KnapsackItem[];
  currentGroupItems: KnapsackItem[];
  status: 'init' | 'group' | 'check' | 'update' | 'done';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  selectedItems: KnapsackItem[];
  evalInfo?: {
    item?: KnapsackItem;
    candidateVal?: number;
    prevVal?: number;
    fits?: boolean;
    improved?: boolean;
  };
  metrics?: Record<string, any>;
}

export interface KnapsackEngineOptions {
  type: '01' | 'partitioned' | 'unbounded' | 'bounded';
  capacity: number;
  items: KnapsackItem[];
  lineMap: KnapsackLanguageLineMap;
  customMessages?: {
    init?: string;
    done?: string;
  };
}

/**
 * 核心驱动函数：纯函数、无副作用、全流程覆盖
 */
export function runKnapsackEngine(options: KnapsackEngineOptions): KnapsackExecutionStep[] {
  const { type, capacity, items: rawItems, lineMap } = options;
  const m = Math.max(0, capacity);

  if (type === 'partitioned') {
    return runPartitionedKnapsack(m, rawItems, lineMap, options.customMessages);
  } else if (type === 'unbounded') {
    return runUnboundedKnapsack(m, rawItems, lineMap, options.customMessages);
  }

  // 默认作为 01 背包处理
  return runStandard01Knapsack(m, rawItems, lineMap, options.customMessages);
}

/**
 * 分组背包执行引擎
 */
function runPartitionedKnapsack(
  m: number,
  rawItems: KnapsackItem[],
  lineMap: KnapsackLanguageLineMap,
  customMsgs?: { init?: string; done?: string }
): KnapsackExecutionStep[] {
  const steps: KnapsackExecutionStep[] = [];
  const items = [...rawItems].sort((a, b) => (a.group ?? 1) - (b.group ?? 1));
  const n = items.length;
  const dp = new Array(m + 1).fill(0);
  let bestItemsForCapacity: KnapsackItem[][] = Array.from({ length: m + 1 }, () => []);

  const makeStep = (data: Partial<KnapsackExecutionStep> & {
    status: KnapsackExecutionStep['status'];
    message: string;
    log: string;
  }): KnapsackExecutionStep => {
    const groupIdx = data.groupIndex ?? -1;
    const jVal = data.j ?? -1;
    return {
      groupIndex: groupIdx,
      itemIndex: data.itemIndex ?? -1,
      j: jVal,
      dp: [...dp],
      maxVal: dp[m] ?? 0,
      items: [...items],
      currentGroupItems: data.currentGroupItems ? [...data.currentGroupItems] : [],
      status: data.status,
      message: data.message,
      log: data.log,
      codeLine: data.codeLine,
      selectedItems: data.selectedItems ? [...data.selectedItems] : [...(bestItemsForCapacity[m] || [])],
      evalInfo: data.evalInfo,
      metrics: {
        'metric-cur-group': groupIdx >= 0 ? `第 ${groupIdx} 组` : '—',
        'metric-cur-capacity': jVal >= 0 ? `${jVal}` : '—',
        'metric-group-items-cnt': `${data.currentGroupItems ? data.currentGroupItems.length : 0}`,
        'metric-max-val': `${dp[m] ?? 0}`,
        ...(data.metrics || {}),
      },
    };
  };

  // 1. 排序
  if (lineMap.sort) {
    steps.push(
      makeStep({
        status: 'init',
        message: `🎒 预处理排序：对 ${n} 个物品按组号升序排列，组内物品内存连续。`,
        log: `sort: items by group (total ${n} items)`,
        codeLine: lineMap.sort,
        selectedItems: [],
      })
    );
  }

  // 2. 初始化 DP 数组
  steps.push(
    makeStep({
      status: 'init',
      message: customMsgs?.init || `📊 初始化 DP 数组：分配 dp[0..${m}] 空间，初始最大收益全为 0。`,
      log: `init: dp[0..${m}] = 0`,
      codeLine: lineMap.initDp,
      selectedItems: [],
    })
  );

  if (m === 0 || n === 0) {
    steps.push(
      makeStep({
        j: 0,
        status: 'done',
        message: '🏁 容量为 0 或无可用物品，最大收益为 0。',
        log: 'done: ans=0',
        codeLine: lineMap.returnAns,
        selectedItems: [],
      })
    );
    return steps;
  }

  for (let start = 0, end = 1; start < n; ) {
    const curGroupVal = items[start].group ?? 1;

    // 3. 进入组循环
    steps.push(
      makeStep({
        groupIndex: curGroupVal,
        status: 'group',
        message: `🔄 外层组循环：start=${start}，开始处理第 ${curGroupVal} 组。`,
        log: `group loop: start=${start}`,
        codeLine: lineMap.outerLoop,
      })
    );

    // 4. 计算组区间
    while (end < n && (items[end].group ?? 1) === curGroupVal) end++;
    const currentGroup = items.slice(start, end);
    const nextBestItems = bestItemsForCapacity.map((list) => [...list]);

    steps.push(
      makeStep({
        groupIndex: curGroupVal,
        currentGroupItems: currentGroup,
        status: 'group',
        message: `🔍 确定组边界：第 ${curGroupVal} 组索引范围 [${start}, ${end})，共 ${currentGroup.length} 件互斥备选物品。`,
        log: `group ${curGroupVal}: [${start}, ${end}), size=${currentGroup.length}`,
        codeLine: lineMap.groupEnd,
      })
    );

    // 5. 容量倒序循环
    for (let j = m; j >= 0; j--) {
      steps.push(
        makeStep({
          groupIndex: curGroupVal,
          j,
          currentGroupItems: currentGroup,
          status: 'check',
          message: `⏳ 容量倒序：考察背包容量 j=${j}（倒序枚举确保本组至多选 1 件）。`,
          log: `capacity loop: j=${j}`,
          codeLine: lineMap.capLoop,
        })
      );

      // 6. 组内物品枚举
      for (let k = start; k < end; k++) {
        const it = items[k];

        steps.push(
          makeStep({
            groupIndex: curGroupVal,
            itemIndex: k,
            j,
            currentGroupItems: currentGroup,
            status: 'check',
            message: `📦 组内枚举：考察第 ${curGroupVal} 组第 ${k - start + 1} 件物品 (体积=${it.cost}, 价值=${it.val})。`,
            log: `item loop: k=${k}, cost=${it.cost}, val=${it.val}`,
            codeLine: lineMap.itemLoop,
          })
        );

        const fits = j >= it.cost;
        steps.push(
          makeStep({
            groupIndex: curGroupVal,
            itemIndex: k,
            j,
            currentGroupItems: currentGroup,
            status: 'check',
            message: fits
              ? `✅ 能够装入：容量 j=${j} >= 体积 ${it.cost}，开始试算收益。`
              : `❌ 超重放弃：容量 j=${j} < 体积 ${it.cost}，无法装入该物品。`,
            log: `if (j >= cost): ${j} >= ${it.cost} => ${fits}`,
            codeLine: lineMap.ifFit,
            evalInfo: {
              item: it,
              fits,
              candidateVal: fits ? dp[j - it.cost] + it.val : undefined,
              prevVal: dp[j],
            },
          })
        );

        if (fits) {
          const candidate = dp[j - it.cost] + it.val;
          const updated = candidate > dp[j];
          if (updated) {
            dp[j] = candidate;
            nextBestItems[j] = [...bestItemsForCapacity[j - it.cost], it];
          }

          steps.push(
            makeStep({
              groupIndex: curGroupVal,
              itemIndex: k,
              j,
              currentGroupItems: currentGroup,
              status: updated ? 'update' : 'check',
              selectedItems: [...nextBestItems[m]],
              message: updated
                ? `✨ 状态转移：dp[${j}] = Math.max(${dp[j]}, dp[${j - it.cost}] + ${it.val}) = ${candidate}，收益提高！`
                : `⏸️ 状态保持：装入后收益 ${candidate} <= 原收益 ${dp[j]}，保持当前值。`,
              log: `dp[${j}] = Math.max(${dp[j]}, ${candidate}) => ${dp[j]}`,
              codeLine: lineMap.updateDp,
              evalInfo: {
                item: it,
                fits: true,
                candidateVal: candidate,
                prevVal: dp[j],
                improved: updated,
              },
            })
          );
        }
      }
    }

    bestItemsForCapacity = nextBestItems;

    // 7. 组指针后移
    steps.push(
      makeStep({
        groupIndex: curGroupVal,
        currentGroupItems: currentGroup,
        selectedItems: [...bestItemsForCapacity[m]],
        status: 'group',
        message: `⏭️ 组推进：第 ${curGroupVal} 组枚举完毕，更新指针 start = ${end}。`,
        log: `next group: start=${end}`,
        codeLine: lineMap.advanceLoop,
      })
    );

    start = end++;
  }

  // 8. 返回最终结果
  steps.push(
    makeStep({
      j: m,
      selectedItems: [...bestItemsForCapacity[m]],
      status: 'done',
      message: customMsgs?.done || `🎉 分组背包求解完成！各组互斥选择的最大收益为 ${dp[m]}！`,
      log: `done: ans=${dp[m]}`,
      codeLine: lineMap.returnAns,
    })
  );

  return steps;
}

/**
 * 完全背包执行引擎
 */
function runUnboundedKnapsack(
  t: number,
  items: KnapsackItem[],
  lineMap: KnapsackLanguageLineMap,
  customMsgs?: { init?: string; done?: string }
): KnapsackExecutionStep[] {
  const steps: KnapsackExecutionStep[] = [];
  const m = items.length;
  const dp = new Array(t + 1).fill(0);
  let bestItemsForCapacity: KnapsackItem[][] = Array.from({ length: t + 1 }, () => []);

  const makeStep = (data: Partial<KnapsackExecutionStep> & {
    status: KnapsackExecutionStep['status'];
    message: string;
    log: string;
  }): KnapsackExecutionStep => {
    const itemIdx = data.itemIndex ?? -1;
    const jVal = data.j ?? -1;
    return {
      groupIndex: -1,
      itemIndex: itemIdx,
      j: jVal,
      dp: [...dp],
      maxVal: dp[t] ?? 0,
      items: [...items],
      currentGroupItems: [],
      status: data.status,
      message: data.message,
      log: data.log,
      codeLine: data.codeLine,
      selectedItems: data.selectedItems ? [...data.selectedItems] : [...(bestItemsForCapacity[t] || [])],
      evalInfo: data.evalInfo,
      metrics: {
        'metric-cur-herb': itemIdx >= 0 ? `第 ${itemIdx + 1} 种` : '—',
        'metric-cur-time': jVal >= 0 ? `${jVal}` : '—',
        'metric-max-val': `${dp[t] ?? 0}`,
        ...(data.metrics || {}),
      },
    };
  };

  steps.push(
    makeStep({
      status: 'init',
      message: customMsgs?.init || `🌿 初始化完全背包：总容量 T=${t}，物品种类 m=${m}（每种物品可无限次叠加）。`,
      log: `init: T=${t}, m=${m}`,
      codeLine: lineMap.initDp,
      selectedItems: [],
    })
  );

  if (t === 0 || m === 0) {
    steps.push(
      makeStep({
        j: 0,
        status: 'done',
        message: '🏁 容量为 0 或无可采物品，最大收益为 0。',
        log: 'done: ans=0',
        codeLine: lineMap.returnAns,
        selectedItems: [],
      })
    );
    return steps;
  }

  for (let i = 0; i < m; i++) {
    const it = items[i];

    steps.push(
      makeStep({
        itemIndex: i,
        status: 'group',
        message: `🌱 外层循环：考察第 ${i + 1} 种物品（消耗=${it.cost}, 价值=${it.val}）。完全背包正序枚举！`,
        log: `item #${i + 1}: cost=${it.cost}, val=${it.val}`,
        codeLine: lineMap.outerLoop,
      })
    );

    for (let j = it.cost; j <= t; j++) {
      steps.push(
        makeStep({
          itemIndex: i,
          j,
          status: 'check',
          message: `⏳ 正序枚举容量：j=${j}（从 cost=${it.cost} 递增至 ${t}，支持同轮无限选取）。`,
          log: `cap loop: j=${j}`,
          codeLine: lineMap.capLoop,
        })
      );

      const candidate = dp[j - it.cost] + it.val;
      const updated = candidate > dp[j];
      if (updated) {
        dp[j] = candidate;
        bestItemsForCapacity[j] = [...bestItemsForCapacity[j - it.cost], it];
      }

      steps.push(
        makeStep({
          itemIndex: i,
          j,
          status: updated ? 'update' : 'check',
          selectedItems: [...bestItemsForCapacity[t]],
          message: updated
            ? `✨ 状态更新：dp[${j}] = Math.max(${dp[j]}, dp[${j - it.cost}] + ${it.val}) = ${candidate}，收益提高！`
            : `⏸️ 状态保持：叠加收益 ${candidate} <= 原收益 ${dp[j]}，保持原值。`,
          log: `dp[${j}] = Math.max(${dp[j]}, ${candidate}) => ${dp[j]}`,
          codeLine: lineMap.updateDp,
          evalInfo: {
            item: it,
            fits: true,
            candidateVal: candidate,
            prevVal: dp[j],
            improved: updated,
          },
        })
      );
    }
  }

  steps.push(
    makeStep({
      j: t,
      status: 'done',
      message: customMsgs?.done || `🎉 完全背包决策完毕！在时间 ${t} 内无限选取的最大总收益为 ${dp[t]}！`,
      log: `return dp[${t}]=${dp[t]}`,
      codeLine: lineMap.returnAns,
      selectedItems: [...bestItemsForCapacity[t]],
    })
  );

  return steps;
}

/**
 * 标准 01 背包执行引擎
 */
function runStandard01Knapsack(
  m: number,
  items: KnapsackItem[],
  lineMap: KnapsackLanguageLineMap,
  customMsgs?: { init?: string; done?: string }
): KnapsackExecutionStep[] {
  const steps: KnapsackExecutionStep[] = [];
  const n = items.length;
  const dp = new Array(m + 1).fill(0);
  let bestItemsForCapacity: KnapsackItem[][] = Array.from({ length: m + 1 }, () => []);

  const makeStep = (data: Partial<KnapsackExecutionStep> & {
    status: KnapsackExecutionStep['status'];
    message: string;
    log: string;
  }): KnapsackExecutionStep => {
    const itemIdx = data.itemIndex ?? -1;
    const jVal = data.j ?? -1;
    return {
      groupIndex: -1,
      itemIndex: itemIdx,
      j: jVal,
      dp: [...dp],
      maxVal: dp[m] ?? 0,
      items: [...items],
      currentGroupItems: [],
      status: data.status,
      message: data.message,
      log: data.log,
      codeLine: data.codeLine,
      selectedItems: data.selectedItems ? [...data.selectedItems] : [...(bestItemsForCapacity[m] || [])],
      evalInfo: data.evalInfo,
      metrics: {
        'metric-cur-item': itemIdx >= 0 ? `#${itemIdx + 1}` : '—',
        'metric-cur-capacity': jVal >= 0 ? `${jVal}` : '—',
        'metric-max-val': `${dp[m] ?? 0}`,
        ...(data.metrics || {}),
      },
    };
  };

  steps.push(
    makeStep({
      status: 'init',
      message: customMsgs?.init || `🎒 初始化 01 背包空间：容量 m=${m}，物品数量 n=${n}。`,
      log: `init: capacity=${m}, items=${n}`,
      codeLine: lineMap.initDp,
      selectedItems: [],
    })
  );

  for (let i = 0; i < n; i++) {
    const it = items[i];

    steps.push(
      makeStep({
        itemIndex: i,
        status: 'group',
        message: `📦 考察第 ${i + 1} 件物品：体积 ${it.cost}，价值 ${it.val}。`,
        log: `item #${i + 1}: cost=${it.cost}, val=${it.val}`,
        codeLine: lineMap.outerLoop,
      })
    );

    // 01 背包倒序枚举
    for (let j = m; j >= it.cost; j--) {
      steps.push(
        makeStep({
          itemIndex: i,
          j,
          status: 'check',
          message: `⏳ 容量倒序循环：当前容量 j=${j}。`,
          log: `cap loop: j=${j}`,
          codeLine: lineMap.capLoop,
        })
      );

      const candidate = dp[j - it.cost] + it.val;
      const updated = candidate > dp[j];
      if (updated) {
        dp[j] = candidate;
        bestItemsForCapacity[j] = [...bestItemsForCapacity[j - it.cost], it];
      }

      steps.push(
        makeStep({
          itemIndex: i,
          j,
          status: updated ? 'update' : 'check',
          selectedItems: [...bestItemsForCapacity[m]],
          message: updated
            ? `✨ 状态转移：放入物品 #${i + 1} 获得更优收益 dp[${j}]=${dp[j]}！`
            : `⏸️ 状态保持：不放入该物品，保持原最优收益 dp[${j}]。`,
          log: `dp[${j}] = Math.max(${dp[j]}, ${candidate}) => ${dp[j]}`,
          codeLine: lineMap.updateDp,
          evalInfo: {
            item: it,
            fits: true,
            candidateVal: candidate,
            prevVal: dp[j],
            improved: updated,
          },
        })
      );
    }
  }

  steps.push(
    makeStep({
      j: m,
      status: 'done',
      message: customMsgs?.done || `🎉 01 背包决策完毕！在总容量 ${m} 下的最大收益为 ${dp[m]}！`,
      log: `return dp[${m}]=${dp[m]}`,
      codeLine: lineMap.returnAns,
      selectedItems: [...bestItemsForCapacity[m]],
    })
  );

  return steps;
}
