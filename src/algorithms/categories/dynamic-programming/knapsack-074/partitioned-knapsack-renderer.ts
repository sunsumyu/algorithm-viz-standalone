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
  selectedItems?: PartitionedItem[];
  evalInfo?: {
    candidateVal?: number;
    prevVal?: number;
    fits?: boolean;
    improved?: boolean;
  };
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
  let bestItemsForCapacity: PartitionedItem[][] = Array.from({ length: m + 1 }, () => []);

  const lines = {
    sort: { java: 9, cpp: 9, python: 3, javascript: 3 },
    initDp: { java: 10, cpp: 10, python: 4, javascript: 4 },
    groupLoop: { java: 11, cpp: 11, python: 6, javascript: 6 },
    groupEnd: { java: 12, cpp: 12, python: 8, javascript: 8 },
    capLoop: { java: 13, cpp: 14, python: 10, javascript: 9 },
    itemLoop: { java: 14, cpp: 15, python: 11, javascript: 10 },
    ifFit: { java: 15, cpp: 16, python: 13, javascript: 12 },
    updateDp: { java: 16, cpp: 17, python: 14, javascript: 13 },
    nextGroup: { java: 20, cpp: 21, python: 15, javascript: 17 },
    returnAns: { java: 22, cpp: 23, python: 16, javascript: 19 },
  };

  function makeStep(data: Omit<PartitionedKnapsackStep, 'metrics'>): PartitionedKnapsackStep {
    const gStr = data.groupIndex >= 0 ? `第 ${data.groupIndex} 组` : '—';
    const jStr = data.j >= 0 ? `${data.j}` : '—';
    return {
      ...data,
      selectedItems: data.selectedItems ? [...data.selectedItems] : [...(bestItemsForCapacity[m] || [])],
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
      selectedItems: [],
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
      selectedItems: [],
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
        selectedItems: [],
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
    const nextBestItems = bestItemsForCapacity.map((list) => [...list]);

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
            message: `📦 组内物品枚举：考察第 ${items[start].group} 组物品 #${k - start + 1} (体积=${it.cost}, 价值=${it.val})。`,
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
            evalInfo: {
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
              groupIndex: items[start].group,
              itemIndex: k,
              j,
              dp: [...dp],
              maxVal: dp[m],
              items: [...items],
              currentGroupItems: currentGroup,
              status: updated ? 'update' : 'check',
              selectedItems: [...nextBestItems[m]],
              message: updated
                ? `✨ 状态转移：dp[${j}] = Math.max(${dp[j]}, dp[${j - it.cost}] + ${it.val}) = ${candidate}，收益提高！`
                : `⏸️ 状态保持：装入该物品后收益 ${candidate} <= 原收益 ${dp[j]}，保持 dp[${j}]=${dp[j]}。`,
              log: `dp[${j}] = Math.max(${dp[j]}, ${candidate}) => ${dp[j]}`,
              codeLine: lines.updateDp,
              evalInfo: {
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
        selectedItems: [...bestItemsForCapacity[m]],
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
    const selected = step.selectedItems || [];
    const usedCap = selected.reduce((sum, it) => sum + it.cost, 0);
    const totalVal = selected.reduce((sum, it) => sum + it.val, 0);
    const capMax = step.dp.length > 0 ? step.dp.length - 1 : 45;
    const ratio = Math.min(100, Math.round((usedCap / (capMax || 1)) * 100));

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
        const bg = isCurGroup ? 'rgba(30, 27, 75, 0.7)' : 'rgba(15, 23, 42, 0.6)';
        const border = isCurGroup ? '#818cf8' : '#334155';

        const itemsBadges = list
          .map((it, idx) => {
            const isSelected = selected.some(
              (s) => s.group === it.group && s.cost === it.cost && s.val === it.val
            );
            const isCurItem =
              step.itemIndex >= 0 &&
              step.items[step.itemIndex]?.group === it.group &&
              step.items[step.itemIndex]?.cost === it.cost &&
              step.items[step.itemIndex]?.val === it.val;

            let badgeHtml = '';
            let cardBg = '#1e293b';
            let cardBorder = '#475569';

            if (isSelected) {
              cardBg = 'rgba(6, 95, 70, 0.4)';
              cardBorder = '#10b981';
              badgeHtml = `<span style="background:#059669; color:#ffffff; font-size:9.5px; padding:1px 5px; border-radius:3px; font-weight:bold;">✔ 已入选</span>`;
            } else if (isCurItem) {
              cardBg = 'rgba(30, 58, 138, 0.45)';
              cardBorder = '#3b82f6';
              if (step.evalInfo) {
                if (!step.evalInfo.fits) {
                  badgeHtml = `<span style="background:#dc2626; color:#ffffff; font-size:9.5px; padding:1px 5px; border-radius:3px; font-weight:bold;">❌ 超重无法装入</span>`;
                } else if (step.evalInfo.improved) {
                  badgeHtml = `<span style="background:#16a34a; color:#ffffff; font-size:9.5px; padding:1px 5px; border-radius:3px; font-weight:bold;">✨ 收益更优 (+${it.val})</span>`;
                } else {
                  badgeHtml = `<span style="background:#ca8a04; color:#ffffff; font-size:9.5px; padding:1px 5px; border-radius:3px; font-weight:bold;">⏸ 试算无提升</span>`;
                }
              } else {
                badgeHtml = `<span style="background:#2563eb; color:#ffffff; font-size:9.5px; padding:1px 5px; border-radius:3px; font-weight:bold;">🔍 考察中</span>`;
              }
            } else {
              badgeHtml = `<span style="color:#64748b; font-size:9.5px;">⚪ 候选待选</span>`;
            }

            return `
              <div style="background:${cardBg}; border:1.5px solid ${cardBorder}; border-radius:6px; padding:6px 10px; font-size:11px; display:flex; flex-direction:column; gap:3px; transition:all 0.2s ease;">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                  <span style="color:#94a3b8; font-weight:700;">#${idx + 1}</span>
                  ${badgeHtml}
                </div>
                <div style="display:flex; justify-content:space-between; gap:10px; margin-top:2px;">
                  <span style="color:#cbd5e1;">体积: <b style="color:#38bdf8;">${it.cost}</b></span>
                  <span style="color:#cbd5e1;">价值: <b style="color:#10b981;">${it.val}</b></span>
                  <span style="color:#94a3b8; font-size:9.5px;">v/c: ${(it.val / it.cost).toFixed(1)}</span>
                </div>
              </div>
            `;
          })
          .join('');

        return `
          <div style="background:${bg}; border:2px solid ${border}; border-radius:8px; padding:10px 12px; min-width:175px; flex:1; max-width:260px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-size:12px; font-weight:800; color:#c7d2fe;">第 ${gId} 组 (互斥)</span>
              ${isCurGroup ? '<span style="background:#f59e0b; color:#0f172a; font-size:9px; font-weight:800; padding:1px 5px; border-radius:10px;">正在决策</span>' : '<span style="color:#64748b; font-size:9.5px;">互斥至多选1</span>'}
            </div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${itemsBadges}
            </div>
          </div>
        `;
      })
      .join('');

    // 已选入背包的清单
    const selectedListHtml = selected.length > 0
      ? selected.map((it) => `
          <div style="background:rgba(6, 95, 70, 0.4); border:1px solid #10b981; border-radius:4px; padding:3px 8px; font-size:10.5px; display:inline-flex; align-items:center; gap:6px;">
            <span style="color:#a7f3d0; font-weight:700;">第${it.group}组</span>
            <span style="color:#cbd5e1;">体积:${it.cost}</span>
            <span style="color:#34d399; font-weight:800;">价值:+${it.val}</span>
          </div>
        `).join('')
      : `<span style="color:#64748b; font-size:11px;">(背包当前暂无装入物品，等待容量决策...)</span>`;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#0b0f19; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
        <!-- 顶部标题与当前决策容量提示 -->
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #1e293b; padding-bottom:8px;">
          <div style="font-size:12px; color:#94a3b8; font-weight:700;">🗂️ 分组货架陈列 (每组互斥至多选1件)</div>
          <div style="font-size:11px; color:#e2e8f0; background:#1e293b; padding:2px 8px; border-radius:4px; border:1px solid #334155;">
            当前考察容量: <b style="color:#38bdf8;">${step.j >= 0 ? step.j : '—'}</b> / ${capMax}
          </div>
        </div>

        <!-- 货架组卡片陈列 -->
        <div style="display:flex; flex-wrap:wrap; gap:12px; justify-content:center; align-items:flex-start;">
          ${groupsHtml}
        </div>

        <!-- 底部实时背包货舱装载监视器 -->
        <div style="background:#0f172a; border:1px solid #334155; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11.5px; font-weight:800; color:#cbd5e1;">🎒 实时背包载荷舱</span>
            <div style="display:flex; gap:16px; font-size:11px;">
              <span>总占用容量: <b style="color:#38bdf8;">${usedCap}</b> / ${capMax}</span>
              <span>背包累计收益: <b style="color:#10b981;">${totalVal}</b></span>
            </div>
          </div>

          <!-- 容量进度条 -->
          <div style="width:100%; height:8px; background:#1e293b; border-radius:4px; overflow:hidden;">
            <div style="width:${ratio}%; height:100%; background:linear-gradient(90deg, #3b82f6, #10b981); transition:width 0.25s ease;"></div>
          </div>

          <!-- 已选装物品标签流 -->
          <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
            <span style="color:#94a3b8; font-size:10.5px; min-width:60px;">已装入商品:</span>
            ${selectedListHtml}
          </div>
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

