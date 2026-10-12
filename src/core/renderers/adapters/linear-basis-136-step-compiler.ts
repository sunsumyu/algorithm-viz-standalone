import { LINEAR_BASIS_LINES } from '../../../algorithms/categories/advanced-topics/advanced-134-140/advanced-134-140-stage-codes';
import { Advanced134Step } from '../../../algorithms/categories/advanced-topics/advanced-134-140/advanced-134-140-shared';

export interface LinearBasisStep extends Advanced134Step {
  basis: number[];
  curNum: number;
  curBit: number;
  maxXor: number;
  insertedCount: number;
  finalAns?: number;
}

export function buildLinearBasisSteps(nums: number[]): LinearBasisStep[] {
  const steps: LinearBasisStep[] = [];
  const lines = LINEAR_BASIS_LINES;

  const d: number[] = new Array(62).fill(0);
  let inserted = 0;

  // Step 0: 入口
  steps.push({
    basis: [...d],
    curNum: 0,
    curBit: -1,
    maxXor: 0,
    insertedCount: 0,
    decision: `主函数入口：准备将 ${nums.length} 个正整数依次插入线性基，以求解全局最大异或和`,
    message: '线性基性质：原集合任意子集的异或和，与线性基子集的异或和完全等价',
    log: `enter getMaxXor(count=${nums.length})`,
    codeLine: lines.entry,
    metrics: { '输入数字个数': nums.length, '线性基容量': '62 bits' },
  });

  // 插入每个元素
  for (const rawX of nums) {
    let x = rawX;

    steps.push({
      basis: [...d],
      curNum: x,
      curBit: -1,
      maxXor: 0,
      insertedCount: inserted,
      decision: `开始将元素 x = ${x} (0b${x.toString(2)}) 插入线性基`,
      message: '从最高位向低位逐位扫描探测',
      log: `inserting ${x}`,
      codeLine: lines.insertBit,
      metrics: { '当前插入数': x, '已建立基底数': inserted },
    });

    for (let i = 60; i >= 0; i--) {
      if ((x & (1 << i)) !== 0) {
        steps.push({
          basis: [...d],
          curNum: x,
          curBit: i,
          maxXor: 0,
          insertedCount: inserted,
          decision: `元素 x=${x} 在第 ${i} 位为 1：检查该位的线性基槽位 d[${i}]`,
          message: d[i] === 0 ? `槽位 d[${i}] 为空，可直接作为基底驻留！` : `槽位 d[${i}] 已存在值 ${d[i]}，需要执行异或消元`,
          log: `check bit ${i}: d[${i}]=${d[i]}`,
          codeLine: lines.insertBit,
          metrics: { '检测二进制位': i, '槽位状态': d[i] === 0 ? '空置' : `占用(${d[i]})` },
        });

        if (d[i] === 0) {
          d[i] = x;
          inserted++;

          steps.push({
            basis: [...d],
            curNum: x,
            curBit: i,
            maxXor: 0,
            insertedCount: inserted,
            decision: `📌 成功占领基底槽位：令 d[${i}] = ${x} (0b${x.toString(2)})，元素插入成功！`,
            message: `基底中已有 ${inserted} 个线性无关基向量`,
            log: `d[${i}] = ${x}, inserted successfully`,
            codeLine: lines.addBasis,
            metrics: { '新增基底': `d[${i}]=${x}`, '总基底数': inserted },
            statusBadge: { text: `占位成功: d[${i}]=${x}`, type: 'success' },
          });

          break;
        }

        x ^= d[i];

        steps.push({
          basis: [...d],
          curNum: x,
          curBit: i,
          maxXor: 0,
          insertedCount: inserted,
          decision: `⚡ 异或消元：x ^= d[${i}] (${d[i]}) 得到新值 x = ${x} (0b${x.toString(2)})，消去第 ${i} 位`,
          message: `由于第 ${i} 位已有基底，将其异或消去后继续向更低位寻找基底`,
          log: `x ^= d[${i}] -> ${x}`,
          codeLine: lines.xorElim,
          metrics: { '消元后新 x': x, '消去位': i },
        });
      }
    }
  }

  // 贪心求最大异或和
  let maxXor = 0;
  for (let i = 60; i >= 0; i--) {
    if (d[i] > 0) {
      const candidate = maxXor ^ d[i];
      if (candidate > maxXor) {
        const oldMax = maxXor;
        maxXor = candidate;

        steps.push({
          basis: [...d],
          curNum: 0,
          curBit: i,
          maxXor,
          insertedCount: inserted,
          decision: `🎯 贪心最大化：当前 max (${oldMax}) ^ d[${i}] (${d[i]}) = ${maxXor} > ${oldMax}，采纳该基向量！`,
          message: `高位为 1 能够显著增大异或和，更新当前最优值`,
          log: `greedy: maxXor = ${maxXor}`,
          codeLine: lines.queryMax,
          metrics: { '考查基底': `d[${i}]=${d[i]}`, '最大异或和': maxXor },
          statusBadge: { text: `刷新最大异或和: ${maxXor}`, type: 'warning' },
        });
      }
    }
  }

  // 终态
  steps.push({
    basis: [...d],
    curNum: 0,
    curBit: -1,
    maxXor,
    insertedCount: inserted,
    finalAns: maxXor,
    decision: `✅ 线性基求解完毕！子集异或和的最大值为: ${maxXor} (0b${maxXor.toString(2)})`,
    message: `整个插入与贪心查询过程复杂度严格为 O(N log V)，单次查询仅需 O(log V) 秒出结果`,
    log: `linear basis finished, max xor = ${maxXor}`,
    codeLine: lines.returnAns,
    metrics: { '全局最大异或和': maxXor, '总基底数': inserted, '时间复杂度': 'O(N log V)' },
    statusBadge: { text: `最大异或和 = ${maxXor}`, type: 'success' },
  });

  return steps;
}
