/**
 * 左程云算法通关课 Class 064: 访问所有节点的最短路径 (Shortest Path Visiting All Nodes · LeetCode 847)
 * 位运算状态压缩 (Bitmask)、状态空间扩维 (u, mask) 与多源并发广搜
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth & Bi-Version Synthesis):
 * 深度综合整合：
 * 1. 经典版本的状态掩码矩阵、多用例预设 (star_4nodes, triangle_3nodes, chain_4nodes)；
 * 2. 声明式规范、名师讲义与四语言 1-based 精准行号联动。
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_064_PROBLEMS } from './graph-064-problem-content';
import {
  STATE_COMP_064_CODES,
  STATE_COMP_064_LINES,
} from './graph-064-stage-codes';
import {
  Graph064StepBase,
  renderGraph064PriorityQueue,
} from './graph-064-shared';

export interface StateCompStep extends Graph064StepBase {
  n: number;
  curNode: number | null;
  curMask: number | null;
  curDist: number;
  targetMask: number;
  visitedCount: number;
  queueSnapshot: Array<{ u: number; mask: number; dist: number }>;
}

export function buildStateComp064Steps(preset: string = 'star_4nodes'): StateCompStep[] {
  const steps: StateCompStep[] = [];
  const lines = STATE_COMP_064_LINES;

  let n = 4;
  let graph: number[][] = [];

  if (preset === 'triangle_3nodes') {
    // 3 节点三角形连通图
    n = 3;
    graph = [
      [1, 2],
      [0, 2],
      [0, 1],
    ];
  } else if (preset === 'chain_4nodes') {
    // 4 节点线性链
    n = 4;
    graph = [
      [1],
      [0, 2],
      [1, 3],
      [2],
    ];
  } else {
    // star_4nodes: 节点 0 连接 1, 2, 3 (星形结构)
    n = 4;
    graph = [
      [1, 2, 3],
      [0],
      [0],
      [0],
    ];
  }

  const targetMask = (1 << n) - 1;
  const visited: boolean[][] = Array.from({ length: n }, () => new Array(1 << n).fill(false));
  const queue: Array<{ u: number; mask: number; dist: number }> = [];

  // 1. 初始化全源并发入队
  for (let i = 0; i < n; i++) {
    queue.push({ u: i, mask: 1 << i, dist: 0 });
    visited[i][1 << i] = true;
  }

  steps.push({
    n,
    curNode: null,
    curMask: 0,
    curDist: 0,
    targetMask,
    visitedCount: n,
    queueSnapshot: [...queue],
    decision: `1. 初始化多源并发状态队列：将所有节点作为可能起点推入队列 (u, 1<<u, dist=0)`,
    message: `目标状态掩码为 ${(1 << n) - 1} (二进制全 1: 0b${targetMask.toString(2)})，代表所有节点均被点亮。`,
    log: `Init multi-source -> targetMask=0b${targetMask.toString(2)}`,
    codeLine: lines.multiSourceQueue,
    metrics: { '目标掩码': `0b${targetMask.toString(2)}`, '初始入队源点': n, '当前步数': 0 },
    statusBadge: { text: `目标掩码: 0b${targetMask.toString(2)}`, type: 'info' },
  });

  while (queue.length > 0) {
    const { u, mask, dist } = queue.shift()!;

    steps.push({
      n,
      curNode: u,
      curMask: mask,
      curDist: dist,
      targetMask,
      visitedCount: queue.length,
      queueSnapshot: [...queue],
      decision: `队列头部出队：当前位于节点 ${u}，已访问掩码 0b${mask.toString(2).padStart(n, '0')}，当前累计移动步数 = ${dist}`,
      message: `检测掩码是否达到目标全满状态。`,
      log: `Poll state (u=${u}, mask=0b${mask.toString(2)}) dist=${dist}`,
      codeLine: lines.pollNode,
      metrics: { '当前节点': u, '访问掩码': `0b${mask.toString(2).padStart(n, '0')}`, '已走步数': dist },
      statusBadge: { text: `在节点 ${u} (步数 ${dist})`, type: 'info' },
    });

    if (mask === targetMask) {
      steps.push({
        n,
        curNode: u,
        curMask: mask,
        curDist: dist,
        targetMask,
        visitedCount: queue.length,
        queueSnapshot: [...queue],
        decision: `目标达成！当前掩码全满 (0b${mask.toString(2)})，访问全部节点的最短路径长度即为 ${dist}`,
        message: `根据广度优先遍历的单调性，首次出现的终态掩码必然具备最少边数！`,
        log: `Target mask reached! Shortest path length = ${dist}`,
        codeLine: lines.checkComplete,
        metrics: { '最终最短路径': dist, '点亮率': '100%' },
        statusBadge: { text: `全节点遍历完成: 步数=${dist}`, type: 'success' },
      });
      break;
    }

    for (const v of graph[u]) {
      const nextMask = mask | (1 << v);
      if (!visited[v][nextMask]) {
        visited[v][nextMask] = true;
        queue.push({ u: v, mask: nextMask, dist: dist + 1 });

        steps.push({
          n,
          curNode: u,
          curMask: mask,
          curDist: dist,
          targetMask,
          visitedCount: queue.length,
          queueSnapshot: [...queue],
          decision: `转移到邻居节点 ${v}：新掩码 0b${mask.toString(2)} | (1<<${v}) = 0b${nextMask.toString(2).padStart(n, '0')}，步数 +1 (${dist + 1})`,
          message: `新状态 (v=${v}, mask=0b${nextMask.toString(2)}) 未被探查，加入广搜队列。`,
          log: `Transition (${u}->${v}) -> nextMask=0b${nextMask.toString(2)}, dist=${dist+1}`,
          codeLine: lines.maskTransition,
          metrics: { '扩展邻居': v, '新掩码': `0b${nextMask.toString(2).padStart(n, '0')}`, '新步数': dist + 1 },
          statusBadge: { text: `前往节点 ${v}`, type: 'info' },
        });
      }
    }
  }

  return steps;
}

export const stateCompressionBfs064Visualizer = registerDeclarativeAlgorithm<StateCompStep>({
  id: 'state-compression-bfs-064',
  aliases: ['state-compression-bfs', 'class064-code06', 'leetcode-847'],
  name: '访问所有节点最短路与状态压缩广搜 (Class 064)',
  category: 'graph',
  icon: '🗝️',
  difficulty: 3,
  levelOrder: 6406,
  learningGoal: '掌握状态空间扩维 (u, mask) 建模、位掩码状态压缩与多源并发广搜',
  problemHtml: GRAPH_064_PROBLEMS.stateCompressionBfs064.html,
  codeLanguages: STATE_COMP_064_CODES,
  inputs: [
    {
      id: 'preset',
      label: '图结构用例选择',
      type: 'select',
      defaultValue: 'star_4nodes',
      options: [
        { label: '4 节点星形拓扑 (中心辐射, 最短路=4)', value: 'star_4nodes' },
        { label: '3 节点三角形连通图 (最短路=2)', value: 'triangle_3nodes' },
        { label: '4 节点线性链状图 (最短路=3)', value: 'chain_4nodes' },
      ],
    },
  ],
  presets: [
    { label: '4 节点星形拓扑 (LeetCode 847)', values: { preset: 'star_4nodes' } },
    { label: '3 节点三角形', values: { preset: 'triangle_3nodes' } },
    { label: '4 节点线性链', values: { preset: 'chain_4nodes' } },
  ],
  generateSteps: (inputs) => buildStateComp064Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    const nodeBadges = [];
    for (let i = 0; i < step.n; i++) {
      const isVisitedInMask = (step.curMask !== null) && ((step.curMask & (1 << i)) !== 0);
      const isCur = step.curNode === i;
      const bg = isCur ? '#fef3c7' : isVisitedInMask ? '#ecfdf5' : '#f1f5f9';
      const border = isCur ? '2.5px solid #f59e0b' : isVisitedInMask ? '1.5px solid #10b981' : '1px solid #cbd5e1';
      const textCol = isCur ? '#b45309' : isVisitedInMask ? '#047857' : '#64748b';

      nodeBadges.push(`
        <div style="
          width: 58px;
          height: 58px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: ${bg};
          border: ${border};
          border-radius: 50%;
          box-shadow: ${isCur ? '0 0 10px rgba(245, 158, 11, 0.4)' : 'none'};
          transition: all 0.2s ease;
        ">
          <span style="font-size: 13px; font-weight: 800; color: ${textCol};">N${i}</span>
          <span style="font-size: 8px; color: ${textCol};">${isVisitedInMask ? '已点亮' : '未覆盖'}</span>
        </div>
      `);
    }

    const qItems = step.queueSnapshot.slice(0, 8).map((x) => ({
      label: `N${x.u}(0b${x.mask.toString(2).padStart(step.n, '0')})`,
      priority: `${x.dist}步`,
      highlight: step.curNode === x.u && step.curMask === x.mask,
    }));

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 16px; gap: 16px;">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; background: #f8fafc; padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0; width: 100%; max-width: 500px; box-sizing: border-box;">
          <span style="font-size: 11px; font-weight: 700; color: #475569;">节点访问状态 (位掩码点亮监控):</span>
          <div style="display: flex; gap: 16px; justify-content: center;">${nodeBadges.join('')}</div>
          <div style="margin-top: 4px; font-size: 11px; font-family: monospace; color: #6366f1;">
            当前掩码: 0b${step.curMask !== null ? step.curMask.toString(2).padStart(step.n, '0') : '0'} / 目标: 0b${step.targetMask.toString(2)}
          </div>
        </div>
        <div style="width: 100%; max-width: 500px;">
          ${renderGraph064PriorityQueue(qItems, '广搜波前队列 (按步数推进)')}
        </div>
      </div>
    `;
  },
});
