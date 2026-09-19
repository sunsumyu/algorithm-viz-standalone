import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';

/**
 * 分配重复整数 (Distribute Repeating Integers, LC 1655, 左程云 81 课)
 * 状压 DP + 子掩码枚举：
 * 1. 顾客数少 (m <= 10)，状压顾客集合；
 * 2. 统计数字频次 counts；
 * 3. 预处理顾客子集需求 sum[1 << m]；
 * 4. 外层枚举频次，内层高效率枚举子掩码 (sub = (sub - 1) & s) 转移。
 * 遵循黄金生命周期与零跳步规约：
 * entry -> count_freq -> get_counts -> init_m -> init_full -> alloc_sum ->
 * calc_sum -> alloc_dp -> base -> loop_count -> loop_status -> loop_submask ->
 * cond_valid_sub -> mark_achieved -> return
 */
export function compileDistributeRepeating(
  _model: IYamlAlgorithmModel,
  params: StageExecutionParams
): UniversalStep[] {
  const nums: number[] = (params.params?.nums as number[]) || [1, 1, 2, 2];
  const quantity: number[] = (params.params?.quantity as number[]) || [2, 2];
  const anchorMap = params.anchorMap;

  const lineEntry = anchorMap?.entry || 2;
  const lineInitMap = anchorMap?.init_map || 3;
  const lineCountFreq = anchorMap?.count_freq || 4;
  const lineGetCounts = anchorMap?.get_counts || 5;
  const lineInitM = anchorMap?.init_m || 6;
  const lineInitFull = anchorMap?.init_full || 7;
  const lineAllocSum = anchorMap?.alloc_sum || 8;
  const lineLoopSumS = anchorMap?.loop_sum_s || 9;
  const lineLoopSumI = anchorMap?.loop_sum_i || 10;
  const lineCondSumBit = anchorMap?.cond_sum_bit || 11;
  const lineCalcSum = anchorMap?.calc_sum || 12;
  const lineBreakSum = anchorMap?.break_sum || 13;
  const lineAllocDp = anchorMap?.alloc_dp || 16;
  const lineBase = anchorMap?.base || 17;
  const lineLoopCount = anchorMap?.loop_count || 18;
  const lineLoopStatus = anchorMap?.loop_status || 19;
  const lineLoopSubmask = anchorMap?.loop_submask || 20;
  const lineCondValidSub = anchorMap?.cond_valid_sub || 21;
  const lineMarkAchieved = anchorMap?.mark_achieved || 22;
  const lineBreakSubmask = anchorMap?.break_submask || 23;
  const lineReturn = anchorMap?.return || 27;

  const steps: UniversalStep[] = [];

  // Step 0: 函数入口
  steps.push({
    type: 'entry',
    line: lineEntry,
    i: 0,
    j: 0,
    dp1d: [0],
    memo: {},
    activeSlot: 0,
    tag: `canDistribute(nums, quantity) 顾客数: ${quantity.length}`,
    log: `🎯 进入 canDistribute：nums=${JSON.stringify(nums)}, quantity=${JSON.stringify(quantity)}`,
    msg: `主函数入口：目标是将数组中的数字分配给 <code>${quantity.length}</code> 位顾客，且每位顾客必须获得完全相同的整数。`,
  });

  // Step 1: 频次统计与提取
  const freqMap = new Map<number, number>();
  for (const x of nums) {
    freqMap.set(x, (freqMap.get(x) || 0) + 1);
  }
  const counts = Array.from(freqMap.values());

  steps.push({
    type: 'init',
    line: lineGetCounts,
    i: 0,
    j: 0,
    dp1d: [...counts],
    memo: {},
    activeSlot: 0,
    tag: `提取可用频次列表 counts: [${counts.join(', ')}]`,
    log: `| 频次统计完成，各整数可用数量为: [${counts.join(', ')}]`,
    msg: `统计各数字可用频次：<code>counts = [${counts.join(', ')}]</code>。`,
  });

  const m = quantity.length;
  const full = (1 << m) - 1;

  steps.push({
    type: 'init',
    line: lineInitFull,
    i: 0,
    j: 0,
    dp1d: [full],
    memo: {},
    activeSlot: 0,
    tag: `顾客数 m=${m}, 全集掩码 full=${full.toString(2).padStart(m, '0')}b`,
    log: `| 顾客全集掩码: full = ${full} (${full.toString(2).padStart(m, '0')}b)`,
    msg: `顾客数量为 <code>${m}</code>，全满足目标掩码为 <code>full = (1 << ${m}) - 1 = ${full}</code>。`,
  });

  // Step 2: 预处理顾客子集需求总量 sum[1 << m]
  const sum = new Array(1 << m).fill(0);
  for (let s = 1; s <= full; s++) {
    for (let i = 0; i < m; i++) {
      if ((s & (1 << i)) !== 0) {
        sum[s] = sum[s ^ (1 << i)]! + quantity[i]!;
        break;
      }
    }
  }

  steps.push({
    type: 'init',
    line: lineCalcSum,
    i: 0,
    j: 0,
    dp1d: [...sum],
    memo: {},
    activeSlot: 0,
    tag: `预处理所有 ${1 << m} 个顾客子集的需求总和`,
    log: `| 🧮 顾客子集总需求计算完成: ${Array.from({ length: full + 1 }, (_, s) => s)
      .filter((s) => s > 0)
      .map((s) => `子集${s.toString(2).padStart(m, '0')}b需要${sum[s]}`)
      .join(', ')}`,
    msg: '预处理所有顾客子集的总需求和，后续快速判断某一频次能否一次性喂饱该子集。',
  });

  // Step 3: 初始化 DP 数组
  const dp = new Array(1 << m).fill(false);
  dp[0] = true;

  steps.push({
    type: 'init',
    line: lineBase,
    i: 0,
    j: 0,
    dp1d: dp.map((v) => (v ? 1 : 0)),
    memo: {},
    activeSlot: 0,
    tag: '基础初值: dp[0] = true',
    log: '| 🏁 初始基底：0 个顾客默认已被满足 (dp[0] = true)',
    msg: '初始化 <code>dp = new boolean[1 << ${m}]</code>，<code>dp[0] = true</code>。',
  });

  // Step 4: 状压 DP + 子掩码高效枚举
  let countIdx = 0;
  for (const c of counts) {
    countIdx++;
    steps.push({
      type: 'init',
      line: lineLoopCount,
      i: countIdx,
      j: c,
      dp1d: dp.map((v) => (v ? 1 : 0)),
      memo: {},
      activeSlot: 0,
      tag: `考虑第 ${countIdx} 组相同整数 (可用频次 c = ${c})`,
      log: `| 📦 考虑可用频次 c = ${c}`,
      msg: `外层遍历：当前有一组相同整数，总可用数量为 <code>${c}</code>。`,
    });

    for (let s = full; s > 0; s--) {
      if (dp[s]) continue; // 已经能够被满足

      const sBin = s.toString(2).padStart(m, '0');
      // 高效子掩码枚举 (sub = (sub - 1) & s)
      for (let sub = s; sub > 0; sub = (sub - 1) & s) {
        if (sum[sub]! <= c && dp[s ^ sub]!) {
          dp[s] = true;
          const subBin = sub.toString(2).padStart(m, '0');
          const restBin = (s ^ sub).toString(2).padStart(m, '0');

          steps.push({
            type: 'transfer',
            line: lineMarkAchieved,
            i: countIdx,
            j: s,
            dp1d: dp.map((v) => (v ? 1 : 0)),
            memo: {},
            activeSlot: s,
            tag: `频次 ${c} 满足子集 ${subBin}b + 前驱 ${restBin}b ➔ 达成状态 ${sBin}b!`,
            log: `| ✨ [成功分配] 频次 ${c} ≥ 需求 sum[${subBin}b](${sum[sub]})，且其余顾客 ${restBin}b 此前已满足 ➔ dp[${sBin}b] = true`,
            msg: `状态转移：将当前频次为 <code>${c}</code> 的整数分配给顾客子集 <code>${subBin}b</code>（需求量 <code>${sum[sub]}</code>），其余顾客集合 <code>${restBin}b</code> 已可满足，因此状态 <code>${sBin}b</code> 成功达成！`,
          });
          break;
        }
      }
    }
  }

  // Step 5: 收敛返回
  const ans = dp[full]!;
  steps.push({
    type: 'return',
    line: lineReturn,
    i: counts.length,
    j: ans ? 1 : 0,
    dp1d: dp.map((v) => (v ? 1 : 0)),
    memo: {},
    activeSlot: full,
    tag: `是否能满足所有顾客: ${ans ? 'true (可以全部满足 ✓)' : 'false (无法满足 ✗)'}`,
    log: `| 🏆 推演收敛：dp[${full.toString(2).padStart(m, '0')}b] = ${ans}`,
    msg: `🎉 推导完成！${ans ? '<strong>可以满足所有顾客的需求！</strong>返回 <code>true</code>。' : '<strong>无法同时满足所有顾客！</strong>返回 <code>false</code>。'}`,
  });

  return steps;
}
