import { CONGRUENCE_PATH_LINES } from '../../../algorithms/categories/advanced-topics/advanced-142-148/advanced-142-148-stage-codes';
import { Advanced142Step } from '../../../algorithms/categories/advanced-topics/advanced-142-148/advanced-142-148-shared';

export interface CongruenceStep extends Advanced142Step {
  x: number;
  y: number;
  z: number;
  h: number;
  dist: number[];
  curU: number;
  ansSoFar: number;
}

export function buildCongruenceSteps(x: number, y: number, z: number, h: number): CongruenceStep[] {
  const steps: CongruenceStep[] = [];
  const lines = CONGRUENCE_PATH_LINES;

  const dist = new Array(x).fill(Infinity);
  const cloneDist = () => [...dist];

  // Step 0: 入口
  steps.push({
    x,
    y,
    z,
    h,
    dist: cloneDist(),
    curU: -1,
    ansSoFar: 0,
    decision: `主函数入口：同余最短路求解在高度上限 H=${h} 内，由步长 (${x}, ${y}, ${z}) 可组合出的不同楼层总数`,
    message: `选取最小步长 x=${x} 作为同余基数。0 ~ ${x - 1} 构筑同余剩余系节点图`,
    log: `enter countHeights(x=${x}, y=${y}, z=${z}, h=${h})`,
    codeLine: lines.entry,
    metrics: { '基准模数 x': x, '跳跃步长 y': y, '跳跃步长 z': z, '高度上限 H': h },
  });

  // Step 1: 初始化距离数组
  dist[0] = 0;
  steps.push({
    x,
    y,
    z,
    h,
    dist: cloneDist(),
    curU: 0,
    ansSoFar: 0,
    decision: `初始化同余起点：基准楼层为 0，即 dist[0] = 0，其余余数 dist[1..${x - 1}] = INF`,
    message: `说明余数为 0 的最小可达高度为 0`,
    log: `initDist: dist[0]=0, others INF`,
    codeLine: lines.initDist,
    metrics: { '当前优先队列': '[(0, 0)]', '已确定节点数': 1 },
  });

  // Dijkstra
  const pq: [number, number][] = [[0, 0]]; // [dist, u]
  const visited = new Array(x).fill(false);

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift()!;

    if (visited[u]) continue;
    visited[u] = true;

    for (const step of [y, z]) {
      const v = (u + step) % x;
      if (dist[u] + step < dist[v]) {
        dist[v] = dist[u] + step;
        pq.push([dist[v], v]);

        steps.push({
          x,
          y,
          z,
          h,
          dist: cloneDist(),
          curU: v,
          ansSoFar: 0,
          decision: `Dijkstra 松弛：从余数 ${u} 跨步 +${step} 转移至余数 (${u} + ${step}) % ${x} = ${v}`,
          message: `新探测到到达余数 ${v} 的最小高度 dist[${v}] = ${dist[v]}`,
          log: `dijkstraRelax: u=${u} -> v=${v}, step=${step}, newDist=${dist[v]}`,
          codeLine: lines.dijkstra,
          metrics: { '转移前余数': u, '跨步': `+${step}`, '新余数': v, '余数最小高度': dist[v] },
        });
      }
    }
  }

  // Step: 统计各个余数类的累计贡献
  let totalAns = 0;
  for (let i = 0; i < x; i++) {
    if (h >= dist[i]) {
      const cnt = Math.floor((h - dist[i]) / x) + 1;
      totalAns += cnt;

      steps.push({
        x,
        y,
        z,
        h,
        dist: cloneDist(),
        curU: i,
        ansSoFar: totalAns,
        decision: `统计余数 ${i} 的可行高度：最小高度 dist[${i}]=${dist[i]} <= H(${h})，贡献 ${cnt} 层`,
        message: `在范围 [dist[${i}], ${h}] 内，每次递增 x=${x}，共 floor((${h} - ${dist[i]}) / ${x}) + 1 = ${cnt} 种高度`,
        log: `countAns: residue=${i}, minH=${dist[i]}, count=${cnt}, total=${totalAns}`,
        codeLine: lines.countAns,
        metrics: { '统计余数类': i, '单类可达数': cnt, '当前累计总数': totalAns },
      });
    }
  }

  // Step: 返回答案
  steps.push({
    x,
    y,
    z,
    h,
    dist: cloneDist(),
    curU: -1,
    ansSoFar: totalAns,
    decision: `🎉 计算完成：在高度不超过 ${h} 范围内，可到达的相异楼层总数为 ${totalAns}`,
    message: `同余最短路将 O(H) 的枚举量急剧降维为 O(x * log x) 的图算法，完美规避爆炸规模`,
    log: `returnAns: totalAns=${totalAns}`,
    codeLine: lines.returnAns,
    statusBadge: { text: `可达楼层数: ${totalAns}`, type: 'success' },
    metrics: { '最终结果': totalAns, '时空复杂度': `O(x log x) = O(${x} log ${x})` },
  });

  return steps;
}
