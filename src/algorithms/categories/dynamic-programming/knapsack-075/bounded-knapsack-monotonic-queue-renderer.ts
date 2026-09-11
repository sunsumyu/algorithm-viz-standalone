/**
 * 多重背包单调队列优化 (洛谷 P1776 极速最优解) - 声明式 4-Card 沙盘渲染器
 * 核心：按余数 mod 同余链划分，维护指标函数 val(q) = dp[q] - (q/w)*v 在滑动窗口中的最大值
 * 架构重构：引入四语言代码高亮映射、双层沙盘与实时背包载荷舱
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { KNAPSACK_075_PROBLEMS } from './knapsack-075-problem-content';
import { HighlightTarget } from '../../../../core/code-panel';
import { renderKnapsackDpMatrix } from '../../../../core/renderers/knapsack-sandbox-stage';
import {
  BOUNDED_NAIVE_STAGE1_CODE_LANGUAGES,
  BOUNDED_NAIVE_STAGE2_CODE_LANGUAGES,
  BOUNDED_NAIVE_STAGE3_CODE_LANGUAGES,
} from './knapsack-075-stage-codes';
import {
  buildBoundedNaiveRecursionSteps,
  buildBoundedNaiveMemoSteps,
  buildBoundedNaive2DSteps,
} from '../../../../core/renderers/bounded-knapsack-stage-evolution';
import {
  renderSpecialRecursionCard1,
  renderSpecialMemoCard1,
  renderSpecialMemoCard2,
  renderSpecial2DCard1,
  renderSpecial2DCard2,
} from '../../../../core/renderers/special-stage-cards';


export interface BoundedKnapsackMonoQueueStep {
  itemIndex: number;
  mod: number;
  j: number;
  queue: number[];
  queueMetrics: number[];
  dp: number[];
  maxVal: number;
  totalCapacity: number;
  vList: number[];
  wList: number[];
  cList: number[];
  status: 'init' | 'mod-chain' | 'queue-push' | 'update' | 'done';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, any>;
}

export function parseMonoQueueInputs(inputs: Record<string, any>) {
  const t = Math.max(0, parseInt(inputs['input-t'], 10) || 0);
  const parseList = (str: string) =>
    (str || '')
      .split(/[,，\s]+/)
      .map((x) => parseInt(x.trim(), 10))
      .filter((x) => !isNaN(x));

  const vList = parseList(inputs['input-v']);
  const wList = parseList(inputs['input-w']);
  const cList = parseList(inputs['input-c']);
  return { t, vList, wList, cList };
}

export function buildBoundedKnapsackMonoQueueSteps(inputs: Record<string, any>): BoundedKnapsackMonoQueueStep[] {
  const { t, vList, wList, cList } = parseMonoQueueInputs(inputs);

  const n = Math.min(vList.length, wList.length, cList.length);
  const steps: BoundedKnapsackMonoQueueStep[] = [];
  const dp = new Array(t + 1).fill(0);

  const lines = {
    initDp: { java: 3, cpp: 3, python: 3, javascript: 3 },
    itemLoop: { java: 5, cpp: 4, python: 4, javascript: 5 },
    modLoop: { java: 7, cpp: 7, python: 6, javascript: 7 },
    pushWindow: { java: 11, cpp: 11, python: 12, javascript: 11 },
    updateWindow: { java: 18, cpp: 18, python: 20, javascript: 18 },
    returnAns: { java: 23, cpp: 23, python: 23, javascript: 23 },
  };

  const makeStep = (data: Partial<BoundedKnapsackMonoQueueStep> & {
    status: BoundedKnapsackMonoQueueStep['status'];
    message: string;
    log: string;
  }): BoundedKnapsackMonoQueueStep => {
    const itemIdx = data.itemIndex ?? -1;
    const modVal = data.mod ?? -1;
    const jVal = data.j ?? -1;
    const q = data.queue ? [...data.queue] : [];
    return {
      itemIndex: itemIdx,
      mod: modVal,
      j: jVal,
      queue: q,
      queueMetrics: data.queueMetrics ? [...data.queueMetrics] : [],
      dp: [...dp],
      maxVal: dp[t],
      totalCapacity: t,
      vList: [...vList],
      wList: [...wList],
      cList: [...cList],
      status: data.status,
      message: data.message,
      log: data.log,
      codeLine: data.codeLine,
      metrics: {
        'metric-cur-mod': modVal >= 0 ? `mod = ${modVal}` : '—',
        'metric-cur-j': jVal >= 0 ? `${jVal}` : '—',
        'metric-queue-head': q.length > 0 ? `pos=${q[0]}` : '—',
        'metric-max-val': `${dp[t]}`,
      },
    };
  };

  steps.push(
    makeStep({
      status: 'init',
      message: `⚡ 初始化单调队列多重背包沙盘：背包容量 t=${t}，共有 ${n} 种宝物。复杂度严格压缩至理论极限 O(N·W)！`,
      log: `init: t=${t}, n=${n}`,
      codeLine: lines.initDp,
    })
  );

  if (n === 0 || t === 0) {
    steps.push(
      makeStep({
        j: 0,
        status: 'done',
        message: '🏁 容量为 0 或无可用宝物，最大价值为 0。',
        log: 'done: ans=0',
        codeLine: lines.returnAns,
      })
    );
    return steps;
  }

  for (let i = 0; i < n; i++) {
    const weight = wList[i];
    const val = vList[i];
    const cnt = cList[i];

    steps.push(
      makeStep({
        itemIndex: i,
        status: 'init',
        message: `📦 开始处理宝物 #${i + 1} (v=${val}, w=${weight}, c=${cnt})：按余数 mod ∈ [0, ${Math.min(t, weight - 1)}] 进行 ${Math.min(t + 1, weight)} 条独立同余链划分。`,
        log: `item #${i + 1}: w=${weight}, v=${val}, c=${cnt}`,
        codeLine: lines.itemLoop,
      })
    );

    const getVal = (pos: number) => dp[pos] - Math.floor(pos / weight) * val;

    for (let mod = 0; mod < Math.min(t + 1, weight); mod++) {
      steps.push(
        makeStep({
          itemIndex: i,
          mod,
          status: 'mod-chain',
          message: `🔗 开启同余链 mod=${mod}：处理容量序列 [${mod}, ${mod + weight}, ${mod + 2 * weight}...]，双端单调队列滑动窗口最值启动！`,
          log: `mod chain: ${mod}`,
          codeLine: lines.modLoop,
        })
      );

      const q: number[] = [];

      // 预热加载窗口右侧初始元素
      for (let j = t - mod, cCount = 1; j >= 0 && cCount <= cnt; j -= weight, cCount++) {
        const valJ = getVal(j);
        while (q.length > 0 && getVal(q[q.length - 1]) <= valJ) {
          q.pop();
        }
        q.push(j);

        steps.push(
          makeStep({
            itemIndex: i,
            mod,
            j,
            queue: [...q],
            queueMetrics: q.map(getVal),
            status: 'queue-push',
            message: `📥 窗口预填充：将容量点 j=${j} (指标=${valJ}) 推入单调队列，维持单调递减。`,
            log: `push: pos=${j}, val=${valJ}`,
            codeLine: lines.pushWindow,
          })
        );
      }

      // 正式滑动推进更新
      for (let j = t - mod, enter = j - weight * cnt; j >= 0; j -= weight, enter -= weight) {
        if (enter >= 0) {
          const valEnter = getVal(enter);
          while (q.length > 0 && getVal(q[q.length - 1]) <= valEnter) {
            q.pop();
          }
          q.push(enter);
        }

        const headPos = q[0];
        const candidate = getVal(headPos) + Math.floor(j / weight) * val;
        dp[j] = candidate;

        steps.push(
          makeStep({
            itemIndex: i,
            mod,
            j,
            queue: [...q],
            queueMetrics: q.map(getVal),
            status: 'update',
            message: `✨ 滑窗最优转移：容量 j=${j} 从队头 pos=${headPos} 取得最大指标，dp[${j}]=${dp[j]}！`,
            log: `dp[${j}] = ${dp[j]} from queue head pos=${headPos}`,
            codeLine: lines.updateWindow,
          })
        );

        if (q[0] === j) {
          q.shift();
        }
      }
    }
  }

  steps.push(
    makeStep({
      itemIndex: -1,
      j: t,
      status: 'done',
      message: `🎉 单调队列极速求解完成！在 O(N·W) 线性时间内求得最大价值为 ${dp[t]}！`,
      log: `done: ans=${dp[t]}`,
      codeLine: lines.returnAns,
    })
  );

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<BoundedKnapsackMonoQueueStep | any>({
  id: 'bounded-knapsack-monotonic-queue',
  name: '多重背包单调队列优化 (洛谷 P1776 极速最优解)',
  category: 'dynamic-programming',
  badge: {
    mode: '多重背包 · 单调队列 O(NW)',
    complexity: 'O(N · W) · O(W)',
  },
  card1Title: '⚡ 同余链划分与双端单调队列滑动窗口',
  card2Title: '📈 动态规划收益向量 dp[0..W] (滑窗高亮)',
  card2Desc: '展示利用模同余分组将状态转移映射为滑动窗口最值、队列单调递减出入队的线性推演',
  legend: [
    { label: '普通容量点', color: '#334155' },
    { label: '位于滑窗内点', color: '#10b981' },
    { label: '当前考察容量 j', color: '#38bdf8' },
  ],
  inputs: [
    { id: 'input-t', label: '容量 t:', type: 'number', defaultValue: 15, width: '55px' },
    { id: 'input-v', label: '价值 v:', type: 'text', defaultValue: '3, 4, 7, 8', width: '110px' },
    { id: 'input-w', label: '重量 w:', type: 'text', defaultValue: '2, 3, 5, 6', width: '110px' },
    { id: 'input-c', label: '数量 c:', type: 'text', defaultValue: '2, 3, 2, 2', width: '110px' },
  ],
  presets: [
    {
      label: '洛谷经典案例 (t=15, 4种宝物, Ans=21)',
      values: { 'input-t': 15, 'input-v': '3, 4, 7, 8', 'input-w': '2, 3, 5, 6', 'input-c': '2, 3, 2, 2' },
    },
    {
      label: '大步长同余链案例 (t=20, w=[4,5], v=[8,10], c=[3,2], Ans=40)',
      values: { 'input-t': 20, 'input-v': '8, 10', 'input-w': '4, 5', 'input-c': '3, 2' },
    },
  ],
  metrics: [
    { id: 'metric-cur-mod', label: '当前同余链 mod', color: '#8b5cf6' },
    { id: 'metric-cur-j', label: '当前考察容量 j', color: '#38bdf8' },
    { id: 'metric-queue-head', label: '队头最优容量点', color: '#f59e0b' },
    { id: 'metric-max-val', label: '最大总价值', color: '#10b981' },
  ],
  defaultStage: 'stage-4',
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力递归',
      shortName: '递归',
      num: 1,
      timeBadge: 'O(Π(c_i+1))',
      theme: 'bg-blue',
      badge: {
        mode: '多重背包 · 递归暴力搜索',
        complexity: 'O(Π(c_i+1)) · O(N) 栈深',
      },
      card1Title: '🌿 递归分支展开与运行时调用栈',
      card2Title: '📊 递归调用开销与重叠子问题监控',
      codeLanguages: BOUNDED_NAIVE_STAGE1_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { t, vList, wList, cList } = parseMonoQueueInputs(inputs);
        return buildBoundedNaiveRecursionSteps(t, vList, wList, cList);
      },
      renderCanvas: (container, step) => {
        const infoHtml = `
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px;">
            <div style="font-size:12px; font-weight:700; color:#1e293b; margin-bottom:4px;">${step.decision}</div>
            <div style="font-size:11px; color:#64748b; line-height:1.5;">${step.message}</div>
          </div>
        `;
        renderSpecialRecursionCard1(container, {
          title: step.i < step.n ? `正在决策宝物 #${step.i + 1} (重:${step.wList[step.i]}, 价:${step.vList[step.i]}, 上限:${step.cList[step.i]})` : '所有宝物决策完成',
          callStack: step.callStack || [],
          customInfoHtml: infoHtml,
        });
      },
      renderCustomMetrics: (container, step) => {
        container.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:10px; height:100%; width:100%; justify-content:center; align-items:center; background:rgba(241, 245, 249, 0.9); border:1px solid #e2e8f0; border-radius:8px; padding:16px; box-sizing:border-box;">
            <div style="font-size:13px; font-weight:700; color:#38bdf8;">📊 多重背包递归调用开销监控</div>
            <div style="display:flex; gap:16px; margin-top:8px;">
              <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:6px; padding:10px 16px; text-align:center;">
                <div style="font-size:11px; color:#64748b;">当前调用深度</div>
                <div style="font-size:20px; font-weight:800; color:#fbbf24;">${step.callStack?.length ?? 0}</div>
              </div>
              <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:6px; padding:10px 16px; text-align:center;">
                <div style="font-size:11px; color:#64748b;">当前尝试件数 k</div>
                <div style="font-size:20px; font-weight:800; color:#34d399;">${step.k !== undefined ? step.k : '—'}</div>
              </div>
            </div>
            <div style="font-size:11px; color:#64748b; text-align:center; max-width:320px; margin-top:6px;">
              每个状态通过循环枚举 0..c[i] 分支，在无缓存时会造成严重的重叠子问题指数级爆炸。
            </div>
          </div>
        `;
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 记忆化搜索',
      shortName: '记忆化',
      num: 2,
      timeBadge: 'O(N·W·c)',
      theme: 'bg-blue',
      badge: {
        mode: '多重背包 · 记忆化搜索',
        complexity: 'O(N · W · c) · O(N · W) 备忘录',
      },
      card1Title: '💾 备忘录探查追踪 (Cache Hit/Miss)',
      card2Title: '🎯 2D 备忘录缓存热力矩阵 memo[i][remCap]',
      codeLanguages: BOUNDED_NAIVE_STAGE2_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { t, vList, wList, cList } = parseMonoQueueInputs(inputs);
        return buildBoundedNaiveMemoSteps(t, vList, wList, cList);
      },
      renderCanvas: (container, step) =>
        renderSpecialMemoCard1(container, {
          stateStr: `dfsMemo(i=${step.i}, remCap=${step.remCap})`,
          cacheHit: step.memoHit,
          hitCount: step.hitCount,
          missCount: step.missCount,
          decision: step.decision,
          message: step.message,
        }),
      renderCustomMetrics: (container, step) =>
        renderSpecialMemoCard2(container, {
          title: '备忘录矩阵 memo[i][remCap]',
          memo: step.memoGrid,
          curI: step.i,
          curJ: step.remCap,
        }),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 二维动态规划',
      shortName: '二维DP',
      num: 3,
      timeBadge: 'O(N·W·c)',
      theme: 'bg-emerald',
      badge: {
        mode: '多重背包 · 严格二维表递推',
        complexity: 'O(N · W · c) · O(N · W)',
      },
      card1Title: '📐 状态转移决策推导',
      card2Title: '📊 严格二维位置依赖状态表 dp[i][j]',
      codeLanguages: BOUNDED_NAIVE_STAGE3_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { t, vList, wList, cList } = parseMonoQueueInputs(inputs);
        return buildBoundedNaive2DSteps(t, vList, wList, cList);
      },
      renderCanvas: (container, step) =>
        renderSpecial2DCard1(container, {
          cellName: `dp[${step.curI}][${step.curJ}]`,
          cellValStr: `${step.dpTable?.[step.curI]?.[step.curJ] ?? 0}`,
          depCells: step.depCells || [],
          decision: step.decision,
          message: step.message,
        }),
      renderCustomMetrics: (container, step) =>
        renderSpecial2DCard2(container, {
          title: '严格二维状态表 dp[i][j]',
          dp: step.dpTable,
          curI: step.curI,
          curJ: step.curJ,
          depCells: (step.depCells || []).map((d: any) => ({ r: d.r, c: d.c })),
        }),
    },
    {
      id: 'stage-4',
      name: '阶段 4: 单调队列优化',
      shortName: '单调队列',
      num: 4,
      timeBadge: 'O(NW) 终极极限',
      theme: 'bg-amber',
      badge: {
        mode: '多重背包 · 同余分组 + 单调队列 O(NW)',
        complexity: 'O(N · W) · O(W)',
      },
      card1Title: '⚡ 同余链划分与双端单调队列滑动窗口',
      card2Title: '📈 动态规划收益向量 dp[0..W] (滑窗高亮)',
      codeLanguages: KNAPSACK_075_PROBLEMS['bounded-knapsack-monotonic-queue'].codeLanguages,
      buildSteps: buildBoundedKnapsackMonoQueueSteps,
      renderCanvas: (container, step) => {
        const queueHtml = step.queue.length > 0
          ? step.queue
              .map((pos: any, idx: number) => {
                const isHead = idx === 0;
                const mVal = step.queueMetrics[idx];
                return `
                  <div style="background:${isHead ? '#166534' : '#1e293b'}; border:1.5px solid ${
                  isHead ? '#22c55e' : '#475569'
                }; border-radius:6px; padding:6px 10px; text-align:center; min-width:75px;">
                    <div style="font-size:10.5px; color:${isHead ? '#4ade80' : '#94a3b8'}; font-weight:700;">${isHead ? '👑 队头' : `#${idx + 1}`} pos=${pos}</div>
                    <div style="font-size:11.5px; color:#1e293b; margin-top:2px;">指标: <b>${mVal}</b></div>
                  </div>
                `;
              })
              .join('<span style="color:#64748b; font-size:14px; align-self:center;">←</span>')
          : '<span style="color:#64748b; font-size:11px;">(队列为空)</span>';

        const itemsHtml = step.vList
          .map((val: any, idx: number) => {
            const isCur = idx === step.itemIndex;
            const w = step.wList[idx];
            const c = step.cList[idx];
            return `
              <div style="background:${isCur ? 'rgba(30, 27, 75, 0.7)' : 'rgba(241, 245, 249, 0.9)'}; border:1.5px solid ${
              isCur ? '#818cf8' : '#334155'
            }; border-radius:6px; padding:6px 10px; min-width:110px; display:flex; flex-direction:column; gap:2px;">
                <div style="font-size:11px; font-weight:700; color:${isCur ? '#818cf8' : '#cbd5e1'};">宝物 #${idx + 1}</div>
                <div style="display:flex; justify-content:space-between; font-size:10.5px;">
                  <span style="color:#64748b;">单重: <b style="color:#38bdf8;">${w}</b></span>
                  <span style="color:#64748b;">价值: <b style="color:#10b981;">${val}</b></span>
                </div>
                <div style="font-size:9.5px; color:#64748b;">数量: ${c} 件</div>
              </div>
            `;
          })
          .join('');

        container.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#f8fafc; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
              <div style="font-size:12px; color:#64748b; font-weight:700;">⚡ 单调队列优化沙盘 (同余分组 mod=${step.mod >= 0 ? step.mod : '—'})</div>
              <div style="font-size:11px; color:#374151; background:#e8f0fe; padding:2px 8px; border-radius:4px; border:1px solid #e2e8f0;">
                当前考察容量: <b style="color:#38bdf8;">${step.j >= 0 ? step.j : '—'}</b> / ${step.totalCapacity}
              </div>
            </div>

            <!-- 宝物属性列表 -->
            <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">
              ${itemsHtml}
            </div>

            <!-- 双端单调队列滑动窗口 -->
            <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:11.5px; font-weight:800; color:#374151;">🪟 双端单调队列滑动窗口 (维持 val(q)=dp[q]-(q/w)*v 单调递减)</span>
                <span style="font-size:11px; color:#38bdf8;">队头始终为滑窗最大值</span>
              </div>

              <div style="display:flex; gap:8px; overflow-x:auto; background:#f1f5f9; padding:8px; border-radius:6px; align-items:center; min-height:48px;">
                ${queueHtml}
              </div>
            </div>
          </div>
        `;
      },
      renderCustomMetrics: (container, step) => {
        const cells = step.dp.map((val: any, j: number) => {
          const isTarget = j === step.j;
          const inQueue = step.queue.includes(j);
          const bg = isTarget ? '#0284c7' : inQueue ? '#065f46' : '#1e293b';
          const border = isTarget ? '#38bdf8' : inQueue ? '#34d399' : '#334155';
          const color = val > 0 ? '#10b981' : '#64748b';
          return `
            <div style="display:inline-flex; flex-direction:column; align-items:center; min-width:32px; padding:3px; margin:2px; background:${bg}; border:1px solid ${border}; border-radius:4px;">
              <span style="font-size:8px; color:#64748b;">${j}</span>
              <span style="font-size:10.5px; font-weight:700; color:${color};">${val}</span>
            </div>
          `;
        });

        container.innerHTML = `
          <div style="width:100%; height:100%; display:flex; flex-direction:column; padding:2px 4px; box-sizing:border-box; flex:1; min-height:0; overflow:hidden;">
            <div style="font-size:11px; color:#64748b; margin-bottom:4px; font-weight:700; flex-shrink:0;">DP 容量矩阵向量 (绿色代表当前位于滑窗内的容量点)</div>
            <div style="display:flex; flex-wrap:wrap; align-content:flex-start; flex:1; min-height:0; overflow-y:auto; gap:2px; background:#f1f5f9; padding:6px; border-radius:6px; border:1px solid #e2e8f0;">
              ${cells.join('')}
            </div>
          </div>
        `;
      },
    },
  ],
  codeLanguages: KNAPSACK_075_PROBLEMS['bounded-knapsack-monotonic-queue'].codeLanguages,
  problemHtml: KNAPSACK_075_PROBLEMS['bounded-knapsack-monotonic-queue'].problemHtml,
  analysisHtml: KNAPSACK_075_PROBLEMS['bounded-knapsack-monotonic-queue'].analysisHtml,
  buildSteps: buildBoundedKnapsackMonoQueueSteps,
  renderCanvas: (container, step) => {
    const queueHtml = step.queue.length > 0
      ? step.queue
          .map((pos: number, idx: number) => {
            const isHead = idx === 0;
            const mVal = step.queueMetrics[idx];
            return `
              <div style="background:${isHead ? '#166534' : '#1e293b'}; border:1.5px solid ${
              isHead ? '#22c55e' : '#475569'
            }; border-radius:6px; padding:6px 10px; text-align:center; min-width:75px;">
                <div style="font-size:10.5px; color:${isHead ? '#4ade80' : '#94a3b8'}; font-weight:700;">${isHead ? '👑 队头' : `#${idx + 1}`} pos=${pos}</div>
                <div style="font-size:11.5px; color:#1e293b; margin-top:2px;">指标: <b>${mVal}</b></div>
              </div>
            `;
          })
          .join('<span style="color:#64748b; font-size:14px; align-self:center;">←</span>')
      : '<span style="color:#64748b; font-size:11px;">(队列为空)</span>';

    const itemsHtml = step.vList
      .map((val: number, idx: number) => {
        const isCur = idx === step.itemIndex;
        const w = step.wList[idx];
        const c = step.cList[idx];
        return `
          <div style="background:${isCur ? 'rgba(30, 27, 75, 0.7)' : 'rgba(241, 245, 249, 0.9)'}; border:1.5px solid ${
          isCur ? '#818cf8' : '#334155'
        }; border-radius:6px; padding:6px 10px; min-width:110px; display:flex; flex-direction:column; gap:2px;">
            <div style="font-size:11px; font-weight:700; color:${isCur ? '#818cf8' : '#cbd5e1'};">宝物 #${idx + 1}</div>
            <div style="display:flex; justify-content:space-between; font-size:10.5px;">
              <span style="color:#64748b;">单重: <b style="color:#38bdf8;">${w}</b></span>
              <span style="color:#64748b;">价值: <b style="color:#10b981;">${val}</b></span>
            </div>
            <div style="font-size:9.5px; color:#64748b;">数量: ${c} 件</div>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#f8fafc; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
          <div style="font-size:12px; color:#64748b; font-weight:700;">⚡ 单调队列优化沙盘 (同余分组 mod=${step.mod >= 0 ? step.mod : '—'})</div>
          <div style="font-size:11px; color:#374151; background:#e8f0fe; padding:2px 8px; border-radius:4px; border:1px solid #e2e8f0;">
            当前考察容量: <b style="color:#38bdf8;">${step.j >= 0 ? step.j : '—'}</b> / ${step.totalCapacity}
          </div>
        </div>

        <!-- 宝物属性列表 -->
        <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">
          ${itemsHtml}
        </div>

        <!-- 双端单调队列滑动窗口 -->
        <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11.5px; font-weight:800; color:#374151;">🪟 双端单调队列滑动窗口 (维持 val(q)=dp[q]-(q/w)*v 单调递减)</span>
            <span style="font-size:11px; color:#38bdf8;">队头始终为滑窗最大值</span>
          </div>

          <div style="display:flex; gap:8px; overflow-x:auto; background:#f1f5f9; padding:8px; border-radius:6px; align-items:center; min-height:48px;">
            ${queueHtml}
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const cells = step.dp.map((val: number, j: number) => {
      const isTarget = j === step.j;
      const inQueue = step.queue.includes(j);
      const bg = isTarget ? '#0284c7' : inQueue ? '#065f46' : '#1e293b';
      const border = isTarget ? '#38bdf8' : inQueue ? '#34d399' : '#334155';
      const color = val > 0 ? '#10b981' : '#64748b';
      return `
        <div style="display:inline-flex; flex-direction:column; align-items:center; min-width:32px; padding:3px; margin:2px; background:${bg}; border:1px solid ${border}; border-radius:4px;">
          <span style="font-size:8px; color:#64748b;">${j}</span>
          <span style="font-size:10.5px; font-weight:700; color:${color};">${val}</span>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="width:100%; height:100%; display:flex; flex-direction:column; padding:2px 4px; box-sizing:border-box; flex:1; min-height:0; overflow:hidden;">
        <div style="font-size:11px; color:#64748b; margin-bottom:4px; font-weight:700; flex-shrink:0;">DP 容量矩阵向量 (绿色代表当前位于滑窗内的容量点)</div>
        <div style="display:flex; flex-wrap:wrap; align-content:flex-start; flex:1; min-height:0; overflow-y:auto; gap:2px; background:#f1f5f9; padding:6px; border-radius:6px; border:1px solid #e2e8f0;">
          ${cells.join('')}
        </div>
      </div>
    `;
  },
});

export const BoundedKnapsackMonoQueueVisualizer = Visualizer;

registerAlgorithm({
  id: 'bounded-knapsack-monotonic-queue',
  name: '多重背包单调队列优化 (洛谷 P1776 极速最优解)',
  viewId: 'algo-bounded-knapsack-monotonic-queue-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 075 Code04：洛谷 P1776 宝物筛选，按余数分组同余链，使用单调双端队列滑动窗口最值达到理论 O(NW) 极限复杂度',
  icon: '⚡',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 93,
  learningGoal: '深刻掌握同余分组模型、指标函数提取与单调队列优化多重背包的严谨代数推导',
});
