/**
 * 分组背包模版 (洛谷 P1757 通天之分组背包) - 声明式 4-Card 沙盘渲染器
 * 核心：组内物品互斥决策（至多选 1 件），容量倒序枚举保证组内单选
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  PARTITIONED_KNAPSACK_PROBLEM_HTML,
  PARTITIONED_KNAPSACK_ANALYSIS_HTML,
  PARTITIONED_KNAPSACK_CODE_LANGUAGES,
} from './knapsack-074-problem-content';
import { HighlightTarget } from '../../../../core/code-panel';

export interface PartitionedItem {
  cost: number;
  val: number;
  group: number;
}

export interface PartitionedKnapsackStep {
  groupIndex: number;
  itemIndex: number;
  j: number;
  dp: number[];
  maxVal: number;
  items: PartitionedItem[];
  currentGroupItems: PartitionedItem[];
  status: 'init' | 'group' | 'check' | 'update' | 'done';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, any>;
}

export function buildPartitionedKnapsackSteps(
  capacity: number,
  rawItems: PartitionedItem[]
): PartitionedKnapsackStep[] {
  const steps: PartitionedKnapsackStep[] = [];
  const m = Math.max(0, capacity);
  const items = [...rawItems].sort((a, b) => a.group - b.group);
  const n = items.length;
  const dp = new Array(m + 1).fill(0);

  const lines = {
    sort: { java: 9, cpp: 63, python: 109, javascript: 127 },
    initDp: { java: 10, cpp: 64, python: 110, javascript: 128 },
    groupLoop: { java: 11, cpp: 65, python: 112, javascript: 130 },
    groupEnd: { java: 12, cpp: 66, python: 114, javascript: 132 },
    capLoop: { java: 13, cpp: 68, python: 116, javascript: 133 },
    itemLoop: { java: 14, cpp: 69, python: 117, javascript: 134 },
    ifFit: { java: 15, cpp: 70, python: 119, javascript: 136 },
    updateDp: { java: 16, cpp: 71, python: 120, javascript: 137 },
    nextGroup: { java: 20, cpp: 75, python: 121, javascript: 142 },
    returnAns: { java: 22, cpp: 77, python: 122, javascript: 144 },
  };

  function makeStep(data: Omit<PartitionedKnapsackStep, 'metrics'>): PartitionedKnapsackStep {
    const gStr = data.groupIndex >= 0 ? `第 ${data.groupIndex} 组` : '—';
    const jStr = data.j >= 0 ? `${data.j}` : '—';
    return {
      ...data,
      metrics: {
        'metric-cur-group': gStr,
        'metric-cur-capacity': jStr,
        'metric-group-items-cnt': `${data.currentGroupItems.length}`,
        'metric-max-val': `${data.maxVal}`,
      },
    };
  }

  // 1. 排序
  steps.push(
    makeStep({
      groupIndex: -1,
      itemIndex: -1,
      j: -1,
      dp: [...dp],
      maxVal: 0,
      items: [...items],
      currentGroupItems: [],
      status: 'init',
      message: `🎒 执行排序：对 ${n} 个物品按组号升序排列，使同一组物品在内存中连续排列。`,
      log: `sort: items by group (total ${n} items)`,
      codeLine: lines.sort,
    })
  );

  // 2. 初始化 DP 数组
  steps.push(
    makeStep({
      groupIndex: -1,
      itemIndex: -1,
      j: -1,
      dp: [...dp],
      maxVal: 0,
      items: [...items],
      currentGroupItems: [],
      status: 'init',
      message: `📊 初始化 DP 数组：容量范围 0..${m}，初始最大收益全为 0。`,
      log: `init: dp[0..${m}] = 0`,
      codeLine: lines.initDp,
    })
  );

  if (m === 0 || n === 0) {
    steps.push(
      makeStep({
        groupIndex: -1,
        itemIndex: -1,
        j: 0,
        dp: [...dp],
        maxVal: 0,
        items: [...items],
        currentGroupItems: [],
        status: 'done',
        message: '🏁 容量为 0 或无物品，运算结束，最大收益为 0。',
        log: 'done: ans=0',
        codeLine: lines.returnAns,
      })
    );
    return steps;
  }

  for (let start = 0, end = 1; start < n; ) {
    // 3. 组循环开始
    steps.push(
      makeStep({
        groupIndex: items[start].group,
        itemIndex: -1,
        j: -1,
        dp: [...dp],
        maxVal: dp[m],
        items: [...items],
        currentGroupItems: [],
        status: 'group',
        message: `🔄 外层组循环：start=${start}，开始处理第 ${items[start].group} 组。`,
        log: `group loop: start=${start}`,
        codeLine: lines.groupLoop,
      })
    );

    // 4. 计算当前组区间 [start, end)
    while (end < n && items[end].group === items[start].group) end++;
    const currentGroup = items.slice(start, end);

    steps.push(
      makeStep({
        groupIndex: items[start].group,
        itemIndex: -1,
        j: -1,
        dp: [...dp],
        maxVal: dp[m],
        items: [...items],
        currentGroupItems: currentGroup,
        status: 'group',
        message: `🔍 确定组边界：第 ${items[start].group} 组索引范围 [${start}, ${end})，共包含 ${currentGroup.length} 件互斥物品。`,
        log: `group ${items[start].group}: [${start}, ${end}), size=${currentGroup.length}`,
        codeLine: lines.groupEnd,
      })
    );

    // 5. 容量倒序循环
    for (let j = m; j >= 0; j--) {
      steps.push(
        makeStep({
          groupIndex: items[start].group,
          itemIndex: -1,
          j,
          dp: [...dp],
          maxVal: dp[m],
          items: [...items],
          currentGroupItems: currentGroup,
          status: 'check',
          message: `⏳ 容量循环：当前考察背包容量 j=${j}（倒序枚举确保每组至多选 1 件）。`,
          log: `capacity loop: j=${j}`,
          codeLine: lines.capLoop,
        })
      );

      // 6. 组内物品枚举
      for (let k = start; k < end; k++) {
        const it = items[k];

        steps.push(
          makeStep({
            groupIndex: items[start].group,
            itemIndex: k,
            j,
            dp: [...dp],
            maxVal: dp[m],
            items: [...items],
            currentGroupItems: currentGroup,
            status: 'check',
            message: `📦 组内物品枚举：考察第 ${items[start].group} 组物品 #${k + 1} (体积=${it.cost}, 价值=${it.val})。`,
            log: `item loop: k=${k}, cost=${it.cost}, val=${it.val}`,
            codeLine: lines.itemLoop,
          })
        );

        const fits = j >= it.cost;
        steps.push(
          makeStep({
            groupIndex: items[start].group,
            itemIndex: k,
            j,
            dp: [...dp],
            maxVal: dp[m],
            items: [...items],
            currentGroupItems: currentGroup,
            status: 'check',
            message: fits
              ? `✅ 条件满足：容量 j=${j} >= 体积 ${it.cost}，可以尝试放入该物品。`
              : `❌ 容量不足：容量 j=${j} < 体积 ${it.cost}，无法装入该物品。`,
            log: `if (j >= cost): ${j} >= ${it.cost} => ${fits}`,
            codeLine: lines.ifFit,
          })
        );

        if (fits) {
          const candidate = dp[j - it.cost] + it.val;
          const updated = candidate > dp[j];
          if (updated) {
            dp[j] = candidate;
          }
          steps.push(
            makeStep({
              groupIndex: items[start].group,
              itemIndex: k,
              j,
              dp: [...dp],
              maxVal: dp[m],
              items: [...items],
              currentGroupItems: currentGroup,
              status: updated ? 'update' : 'check',
              message: updated
                ? `✨ 状态转移：dp[${j}] = Math.max(${dp[j]}, dp[${j - it.cost}] + ${it.val}) = ${candidate}，收益提高！`
                : `⏸️ 状态保持：装入该物品后收益 ${candidate} <= 原收益 ${dp[j]}，保持 dp[${j}]=${dp[j]}。`,
              log: `dp[${j}] = Math.max(${dp[j]}, ${candidate}) => ${dp[j]}`,
              codeLine: lines.updateDp,
            })
          );
        }
      }
    }

    // 7. 移动组指针
    steps.push(
      makeStep({
        groupIndex: items[start].group,
        itemIndex: -1,
        j: -1,
        dp: [...dp],
        maxVal: dp[m],
        items: [...items],
        currentGroupItems: currentGroup,
        status: 'group',
        message: `⏭️ 组指针递增：第 ${items[start].group} 组所有容量枚举完毕，执行 start = end (${end})。`,
        log: `next group: start=${end}`,
        codeLine: lines.nextGroup,
      })
    );

    start = end++;
  }

  // 8. 返回最终答案
  steps.push(
    makeStep({
      groupIndex: -1,
      itemIndex: -1,
      j: m,
      dp: [...dp],
      maxVal: dp[m],
      items: [...items],
      currentGroupItems: [],
      status: 'done',
      message: `🎉 分组背包决策完毕！在总容量 ${m} 下，各组互斥选择的最大收益为 ${dp[m]}！`,
      log: `done: maxVal=${dp[m]}`,
      codeLine: 23,
    })
  );

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<PartitionedKnapsackStep>({
  id: 'partitioned-knapsack-standard',
  name: '分组背包模版 (通天之分组背包)',
  category: 'dynamic-programming',
  badge: {
    mode: '分组背包 · 组内互斥',
    complexity: 'O(N · M) · O(M)',
  },
  card1Title: '🗂️ 物品分组陈列与组内互斥选择沙盘',
  card2Title: '📊 滚动收益向量 dp[j] 监视器',
  card2Desc: '展示倒序容量枚举下，组内多选被严格禁止的互斥填表过程',
  legend: [
    { label: '未处理组', color: '#475569' },
    { label: '当前考察互斥组', color: '#f59e0b' },
    { label: '带来更优更新项', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'input-capacity',
      label: '背包总容量 m',
      type: 'number',
      defaultValue: 45,
      width: '60px',
    },
    {
      id: 'input-items-json',
      label: '物品数组 JSON [cost, val, group]',
      type: 'text',
      defaultValue: '[[10,10,1],[10,20,1],[20,20,2]]',
      width: '240px',
    },
  ],
  presets: [
    {
      label: '洛谷经典案例 (m=45, 3物品2组, Ans=40)',
      values: {
        'input-capacity': 45,
        'input-items-json': '[[10,10,1],[10,20,1],[20,20,2]]',
      },
    },
    {
      label: '多组充分用例 (m=50, 5物品3组, Ans=65)',
      values: {
        'input-capacity': 50,
        'input-items-json':
          '[[15,25,1],[10,15,1],[20,30,2],[15,20,2],[10,20,3]]',
      },
    },
  ],
  metrics: [
    { id: 'metric-cur-group', label: '当前考察分组', color: '#f59e0b' },
    { id: 'metric-cur-capacity', label: '当前枚举容量 j', color: '#38bdf8' },
    { id: 'metric-group-items-cnt', label: '组内候选商品数', color: '#8b5cf6' },
    { id: 'metric-max-val', label: '当前最大收益', color: '#10b981' },
  ],
  codeLanguages: PARTITIONED_KNAPSACK_CODE_LANGUAGES,
  problemHtml: PARTITIONED_KNAPSACK_PROBLEM_HTML,
  analysisHtml: PARTITIONED_KNAPSACK_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const m = parseInt(inputs['input-capacity'] || '45', 10);
    let rawArr: [number, number, number][] = [];
    try {
      rawArr = JSON.parse(
        inputs['input-items-json'] || '[[10,10,1],[10,20,1],[20,20,2]]'
      );
    } catch {
      rawArr = [
        [10, 10, 1],
        [10, 20, 1],
        [20, 20, 2],
      ];
    }
    const items: PartitionedItem[] = rawArr.map(([cost, val, group]) => ({
      cost,
      val,
      group,
    }));
    return buildPartitionedKnapsackSteps(m, items);
  },
  renderCanvas: (container, step) => {
    // 渲染组结构
    const groupMap: Record<number, PartitionedItem[]> = {};
    step.items.forEach((it) => {
      if (!groupMap[it.group]) groupMap[it.group] = [];
      groupMap[it.group].push(it);
    });

    const groupsHtml = Object.entries(groupMap)
      .map(([gIdStr, list]) => {
        const gId = parseInt(gIdStr, 10);
        const isCurGroup = step.groupIndex === gId;
        const bg = isCurGroup ? '#1e1b4b' : '#0f172a';
        const border = isCurGroup ? '#818cf8' : '#334155';

        const itemsBadges = list
          .map((it) => {
            const isCurItem =
              step.itemIndex >= 0 &&
              step.items[step.itemIndex] === it;
            const itBg = isCurItem ? '#065f46' : '#1e293b';
            const itBorder = isCurItem ? '#34d399' : '#475569';
            return `
              <div style="background:${itBg}; border:1px solid ${itBorder}; border-radius:6px; padding:4px 8px; font-size:11px; text-align:center;">
                <div style="color:#cbd5e1;">体积: ${it.cost}</div>
                <div style="color:#10b981; font-weight:800;">价值: ${it.val}</div>
              </div>
            `;
          })
          .join('');

        return `
          <div style="background:${bg}; border:2px solid ${border}; border-radius:8px; padding:8px 12px; min-width:110px;">
            <div style="font-size:11px; font-weight:800; color:#c7d2fe; margin-bottom:6px; text-align:center;">
              第 ${gId} 组 (互斥)
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              ${itemsBadges}
            </div>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:10px; width:100%; height:100%; justify-content:center; align-items:center; background:#0b0f19; padding:12px; border-radius:8px; box-sizing:border-box;">
        <div style="font-size:12px; color:#94a3b8; font-weight:700;">分组货架陈列 (Group Compartments)</div>
        <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center;">
          ${groupsHtml}
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const len = step.dp.length;
    const cells = step.dp.map((val, idx) => {
      const isCur = step.j === idx;
      const bg = isCur ? '#0284c7' : '#1e293b';
      const border = isCur ? '#38bdf8' : '#334155';
      const color = val > 0 ? '#10b981' : '#64748b';
      return `
        <div style="display:inline-flex; flex-direction:column; align-items:center; min-width:34px; padding:4px; margin:2px; background:${bg}; border:1px solid ${border}; border-radius:4px;">
          <span style="font-size:8.5px; color:#94a3b8;">${idx}</span>
          <span style="font-size:11px; font-weight:700; color:${color};">${val}</span>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="width:100%; padding:4px 8px; box-sizing:border-box;">
        <div style="font-size:11px; color:#94a3b8; margin-bottom:4px; font-weight:700;">滚动状态向量 dp[0..${len - 1}]</div>
        <div style="display:flex; flex-wrap:wrap; max-height:110px; overflow-y:auto; gap:2px; background:#0b1329; padding:6px; border-radius:6px;">
          ${cells.join('')}
        </div>
      </div>
    `;
  },
});

export const PartitionedKnapsackVisualizer = Visualizer;

registerAlgorithm({
  id: 'partitioned-knapsack-standard',
  name: '分组背包模版 (通天之分组背包)',
  viewId: 'algo-partitioned-knapsack-standard-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 074 Code01：洛谷 P1757 通天之分组背包，组内物品至多选 1 件，容量倒序外层枚举防止组内多选',
  icon: '🗂️',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 84,
  learningGoal: '掌握分组背包组内互斥决策建模、外层容量倒序内层枚举组内物品的核心循环顺序',
});

