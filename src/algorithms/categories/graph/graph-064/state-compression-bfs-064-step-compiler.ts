/**
 * 左程云算法通关课 Class 064: 访问所有节点的最短路径 (Shortest Path Visiting All Nodes · LeetCode 847) - 步进推演编译器
 */

import { STATE_COMP_064_LINES } from './graph-064-stage-codes';
import { Graph064StepBase } from './graph-064-shared';

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
    n = 3;
    graph = [
      [1, 2],
      [0, 2],
      [0, 1],
    ];
  } else if (preset === 'chain_4nodes') {
    n = 4;
    graph = [
      [1],
      [0, 2],
      [1, 3],
      [2],
    ];
  } else {
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
    line: lines.multiSourceQueue.javascript,
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
      line: lines.pollNode.javascript,
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
        line: lines.checkComplete.javascript,
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
          line: lines.maskTransition.javascript,
          codeLine: lines.maskTransition,
          metrics: { '扩展邻居': v, '新掩码': `0b${nextMask.toString(2).padStart(n, '0')}`, '新步数': dist + 1 },
          statusBadge: { text: `前往节点 ${v}`, type: 'info' },
        });
      }
    }
  }

  return steps;
}
