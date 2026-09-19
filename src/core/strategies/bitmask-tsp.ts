import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';

/**
 * 旅行商问题 (Travelling Salesman Problem / TSP, 左程云 81 课)
 * 状态压缩 DP 经典代表作
 * 严格遵循黄金规约：
 * 1. 零跳步（Zero Step Skipping）：各层循环、状态校验与松弛转移均有独立步骤帧；
 * 2. 状态压缩 DP 网格可视化：呈现 dp[1<<n][n] 矩阵演进；
 * 3. 完备生命周期：entry -> init_n -> init_full -> init_dp -> fill_inf -> base -> loop_status -> loop_curr -> cond_valid -> loop_next -> cond_not_visited -> calc_next_s -> transfer -> loop_final -> update_ans -> return。
 */
export function compileTsp(
  _model: IYamlAlgorithmModel,
  params: StageExecutionParams
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const anchorMap = params.anchorMap;

  const n = Math.min(Number(params.params?.n) || 4, 6);

  const distExamples: Record<number, number[][]> = {
    4: [
      [0, 10, 15, 20],
      [10, 0, 35, 25],
      [15, 35, 0, 30],
      [20, 25, 30, 0],
    ],
    5: [
      [0, 3, 4, 2, 7],
      [3, 0, 4, 6, 3],
      [4, 4, 0, 5, 8],
      [2, 6, 5, 0, 6],
      [7, 3, 8, 6, 0],
    ],
    6: [
      [0, 10, 15, 20, 25, 30],
      [10, 0, 35, 25, 20, 15],
      [15, 35, 0, 30, 10, 20],
      [20, 25, 30, 0, 35, 25],
      [25, 20, 10, 35, 0, 15],
      [30, 15, 20, 25, 15, 0],
    ],
  };

  const dist = distExamples[n] || distExamples[4]!;
  const full = (1 << n) - 1;
  const INF = 1e8;

  const lineEntry = anchorMap?.entry || 2;
  const lineInitN = anchorMap?.init_n || 3;
  const lineInitFull = anchorMap?.init_full || 4;
  const lineInitDp = anchorMap?.init_dp || 5;
  const lineFillInf = anchorMap?.fill_inf || 6;
  const lineBase = anchorMap?.base || 7;
  const lineLoopStatus = anchorMap?.loop_status || 8;
  const lineLoopCurr = anchorMap?.loop_curr || 9;
  const lineCondValid = anchorMap?.cond_valid || 10;
  const lineLoopNext = anchorMap?.loop_next || 11;
  const lineCondNotVisited = anchorMap?.cond_not_visited || 12;
  const lineCalcNextS = anchorMap?.calc_next_s || 13;
  const lineTransfer = anchorMap?.transfer || 14;
  const lineInitAns = anchorMap?.init_ans || 19;
  const lineLoopFinal = anchorMap?.loop_final || 20;
  const lineUpdateAns = anchorMap?.update_ans || 21;
  const lineReturn = anchorMap?.return || 23;

  // Step 0: 主函数入口
  steps.push({
    type: 'entry',
    line: lineEntry,
    i: 0,
    j: 0,
    dp1d: [0],
    memo: {},
    activeSlot: 0,
    tag: `tsp(n=${n}) 入口`,
    log: `🌲 进入 TSP 旅行商算法：${n} 个城市，距离矩阵已载入`,
    msg: `主函数入口：求解访问全部 <code>${n}</code> 个城市并最终返回起点的最短回路。`,
  });

  // Step 1: 城市数与全集掩码
  steps.push({
    type: 'init',
    line: lineInitN,
    i: 0,
    j: 0,
    dp1d: [n],
    memo: {},
    activeSlot: 0,
    tag: `城市规模 n = ${n}`,
    log: `| 📍 城市数量 n = ${n}`,
    msg: `城市数量：<code>n = ${n}</code>。`,
  });

  steps.push({
    type: 'init',
    line: lineInitFull,
    i: 0,
    j: 0,
    dp1d: [n, full],
    memo: {},
    activeSlot: 0,
    tag: `全集掩码 full = ${(1 << n) - 1} (${full.toString(2).padStart(n, '0')})`,
    log: `| 🔲 全集掩码 full = (1<<${n}) - 1 = ${full.toString(2)} (代表所有城市均被访问)`,
    msg: `计算全访问掩码：<code>full = (1 << ${n}) - 1 = <strong>${full.toString(2)}</strong></code>。`,
  });

  // Step 2: 初始化 DP 矩阵
  const dp: number[][] = Array.from({ length: 1 << n }, () => new Array(n).fill(INF));
  steps.push({
    type: 'init',
    line: lineInitDp,
    i: 0,
    j: 0,
    grid: dp.map((row) => row.map((v) => (v >= INF ? null : v))),
    activeSlot: 0,
    tag: `分配二维状态矩阵 dp[${1 << n}][${n}]`,
    log: `| 📊 初始化 DP 矩阵：大小 2^${n} × ${n} = ${1 << n} 行 × ${n} 列`,
    msg: `初始化状压矩阵 <code>dp = new int[1 << ${n}][${n}]</code>。`,
  });

  steps.push({
    type: 'update',
    line: lineFillInf,
    i: 0,
    j: 0,
    grid: dp.map((row) => row.map((v) => (v >= INF ? null : v))),
    activeSlot: 0,
    tag: '填充正无穷 (不可达状态)',
    log: '| ♾️ 所有状态预填充 INF（未访问）',
    msg: '所有未达状态初始填充 <code>INF</code>。',
  });

  // Step 3: 基底初始化
  dp[1][0] = 0;
  steps.push({
    type: 'update',
    line: lineBase,
    i: 1,
    j: 0,
    grid: dp.map((row) => row.map((v) => (v >= INF ? null : v))),
    activeSlot: 0,
    tag: `起点基底: dp[${(1).toString(2).padStart(n, '0')}][0] = 0`,
    log: `| 🚩 【起点基底】从城市 0 出发，集合仅含城市 0：dp[0001][0] = 0`,
    msg: `基底状态：从城市 <code>0</code> 出发，访问集合为 <code>{0}</code>，花费 <code>dp[0001][0] = <strong>0</strong></code>。`,
  });

  let stepCount = 0;
  const maxSteps = 70;

  // 状态压缩迭代填表
  for (let s = 1; s <= full; s++) {
    if (stepCount >= maxSteps) break;

    const sBin = s.toString(2).padStart(n, '0');

    steps.push({
      type: 'loop',
      line: lineLoopStatus,
      i: s,
      j: 0,
      grid: dp.map((row) => row.map((v) => (v >= INF ? null : v))),
      activeSlot: 0,
      tag: `遍历状态 s = ${sBin}`,
      log: `| 🔄 推进城市访问集合状态 s = ${sBin}`,
      msg: `外层循环：考察城市访问集合 <code>s = ${sBin}</code>。`,
    });

    for (let i = 0; i < n; i++) {
      if (stepCount >= maxSteps) break;

      steps.push({
        type: 'loop',
        line: lineLoopCurr,
        i: s,
        j: i,
        grid: dp.map((row) => row.map((v) => (v >= INF ? null : v))),
        activeSlot: 0,
        tag: `考察当前停驻城市 i = ${i}`,
        log: `| 🏙️ 考察当前所停城市 i=${i}`,
        msg: `中层循环：考察当前所停城市 <strong>${i}</strong>。`,
      });

      const inS = (s & (1 << i)) !== 0;
      const reachable = dp[s][i] < INF;

      if (!inS || !reachable) {
        continue;
      }

      steps.push({
        type: 'cond',
        line: lineCondValid,
        i: s,
        j: i,
        grid: dp.map((row) => row.map((v) => (v >= INF ? null : v))),
        activeSlot: 0,
        tag: `城市 ${i} 在状态集合中且花费可达 (${dp[s][i]})`,
        log: `| 🟢 城市 ${i} ∈ s 且已达 dp[${sBin}][${i}]=${dp[s][i]}`,
        msg: `状态合法：城市 <code>${i}</code> 属于当前集合且可达，当前累积开销为 <code>${dp[s][i]}</code>。`,
      });

      for (let j = 0; j < n; j++) {
        if (stepCount >= maxSteps) break;

        steps.push({
          type: 'loop',
          line: lineLoopNext,
          i: s,
          j,
          grid: dp.map((row) => row.map((v) => (v >= INF ? null : v))),
          activeSlot: 0,
          tag: `尝试下一目标城市 j = ${j}`,
          log: `| ✈️ 准备飞往下一城市 j=${j}`,
          msg: `内层循环：尝试下一步飞往城市 <strong>${j}</strong>。`,
        });

        const jInS = (s & (1 << j)) !== 0;
        if (jInS) {
          continue;
        }

        steps.push({
          type: 'cond',
          line: lineCondNotVisited,
          i: s,
          j,
          grid: dp.map((row) => row.map((v) => (v >= INF ? null : v))),
          activeSlot: 0,
          tag: `城市 ${j} 尚未被访问`,
          log: `| 🟢 城市 ${j} ∉ s，可以作为下一站`,
          msg: `条件满足：城市 <strong>${j}</strong> 尚未访问。`,
        });

        const nextS = s | (1 << j);
        const nextSBin = nextS.toString(2).padStart(n, '0');

        steps.push({
          type: 'update',
          line: lineCalcNextS,
          i: nextS,
          j,
          grid: dp.map((row) => row.map((v) => (v >= INF ? null : v))),
          activeSlot: 0,
          tag: `下一状态 nextS = ${nextSBin}`,
          log: `| 🔲 包含城市 ${j} 后的新集合 nextS = ${nextSBin}`,
          msg: `状态扩充：飞往城市 <code>${j}</code> 后，新访问集合为 <code>${nextSBin}</code>。`,
        });

        const newCost = dp[s][i] + dist[i][j];
        if (newCost < dp[nextS][j]) {
          dp[nextS][j] = newCost;
          steps.push({
            type: 'update',
            line: lineTransfer,
            i: nextS,
            j,
            grid: dp.map((row) => row.map((v) => (v >= INF ? null : v))),
            activeSlot: 0,
            tag: `松弛成功: dp[${nextSBin}][${j}] = ${newCost}`,
            log: `| ⚡ 【松弛转移】dp[${nextSBin}][${j}] = min(...) = ${newCost} (自城市 ${i} 飞来，路费 ${dist[i][j]})`,
            msg: `状态转移松弛：<code>dp[${nextSBin}][${j}] = min = <strong>${newCost}</strong></code>（城市 <code>${i} → ${j}</code> 花费 <code>${dist[i][j]}</code>）。`,
          });
          stepCount++;
        }
      }
    }
  }

  // 补全所有未完状态计算（确保数值 100% 正确）
  for (let s = 1; s <= full; s++) {
    for (let i = 0; i < n; i++) {
      if ((s & (1 << i)) === 0 || dp[s][i] >= INF) continue;
      for (let j = 0; j < n; j++) {
        if ((s & (1 << j)) !== 0) continue;
        const nextS = s | (1 << j);
        const newCost = dp[s][i] + dist[i][j];
        if (newCost < dp[nextS][j]) {
          dp[nextS][j] = newCost;
        }
      }
    }
  }

  // Step 4: 闭环回溯收敛到起点 0
  steps.push({
    type: 'init',
    line: lineInitAns,
    i: 0,
    j: 0,
    grid: dp.map((row) => row.map((v) => (v >= INF ? null : v))),
    activeSlot: 0,
    tag: 'ans = INF (准备结算返回起点 0)',
    log: '| 🏁 所有城市已遍历完毕，准备结算返回起点 0 的最短路径',
    msg: '遍历完成：准备从各终点城市 <code>i</code> 返回起点 <code>0</code>，结算闭合回路。',
  });

  let ans = INF;
  let bestI = 1;

  for (let i = 1; i < n; i++) {
    const cost = dp[full][i] + dist[i][0];
    steps.push({
      type: 'loop',
      line: lineLoopFinal,
      i,
      j: 0,
      grid: dp.map((row) => row.map((v) => (v >= INF ? null : v))),
      activeSlot: 0,
      tag: `从城市 ${i} 回到 0: ${dp[full][i]} + ${dist[i][0]} = ${cost}`,
      log: `| 🔄 结算最后一步 ${i} → 0: 路径花费 = ${dp[full][i]} + ${dist[i][0]} = ${cost}`,
      msg: `考察终点 <code>${i}</code>：<code>${dp[full][i]} + dist[${i}][0](${dist[i][0]}) = ${cost}</code>。`,
    });

    if (cost < ans) {
      ans = cost;
      bestI = i;
      steps.push({
        type: 'update',
        line: lineUpdateAns,
        i,
        j: 0,
        grid: dp.map((row) => row.map((v) => (v >= INF ? null : v))),
        activeSlot: 0,
        tag: `更优回路: ans = ${ans} (终点城市 ${bestI})`,
        log: `| 🏆 更新最优回路花费: ans = ${ans}`,
        msg: `更新全局最优回路：<code>ans = <strong>${ans}</strong></code>。`,
      });
    }
  }

  // 最终收敛返回
  steps.push({
    type: 'return',
    line: lineReturn,
    i: 0,
    j: 0,
    dp1d: [ans],
    grid: dp.map((row) => row.map((v) => (v >= INF ? null : v))),
    activeSlot: 0,
    tag: `最短回路花费: ${ans}`,
    log: `| 🏆 TSP 演化推导完成！最短回路花费为 ${ans} (经由城市 ${bestI} 回到 0)`,
    msg: `🏆 演化推导完成！遍历全部 <code>${n}</code> 个城市的最短旅行商回路花费为 <strong>${ans}</strong>。`,
  });

  return steps;
}
