/**
 * 多重背包单调队列优化 (洛谷 P1776 极速最优解 / 左程云 Class 075 Code03)
 * Step Compiler: 按余数 mod 同余链划分，维护指标函数在滑动窗口中的单调队列最值
 */

import type { HighlightTarget } from '../../code-panel';

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
