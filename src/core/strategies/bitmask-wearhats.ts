import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';

/**
 * 每个人戴不同帽子的方案数 (Number of Ways to Wear Different Hats, LC 1434, 左程云 81 课)
 * 维度反转状压 DP：
 * 人少帽子多 (n <= 10, hats <= 40)，对“人”状压，按“帽子”逐顶分配。
 * 遵循黄金生命周期与零跳步规约：
 * entry -> init_mod -> init_n -> init_full -> init_map -> fill_map -> init_dp -> base ->
 * loop_hat -> loop_status -> loop_p -> cond_available -> calc_next_s -> transfer -> return
 */
export function compileWearHats(
  _model: IYamlAlgorithmModel,
  params: StageExecutionParams
): UniversalStep[] {
  const hats: number[][] = (params.params?.hats as number[][]) || [[3, 4], [4, 5], [5]];
  const n = hats.length;
  const full = (1 << n) - 1;
  const MOD = 1000000007;
  const anchorMap = params.anchorMap;

  const lineEntry = anchorMap?.entry || 2;
  const lineInitMod = anchorMap?.init_mod || 3;
  const lineInitN = anchorMap?.init_n || 4;
  const lineInitFull = anchorMap?.init_full || 5;
  const lineInitMap = anchorMap?.init_map || 6;
  const lineAllocMap = anchorMap?.alloc_map || 7;
  const lineLoopPerson = anchorMap?.loop_person || 8;
  const lineFillMap = anchorMap?.fill_map || 9;
  const lineInitDp = anchorMap?.init_dp || 11;
  const lineBase = anchorMap?.base || 12;
  const lineLoopHat = anchorMap?.loop_hat || 13;
  const lineLoopStatus = anchorMap?.loop_status || 14;
  const lineCondSkip = anchorMap?.cond_skip || 15;
  const lineLoopP = anchorMap?.loop_p || 16;
  const lineCondAvailable = anchorMap?.cond_available || 17;
  const lineCalcNextS = anchorMap?.calc_next_s || 18;
  const lineTransfer = anchorMap?.transfer || 19;
  const lineReturn = anchorMap?.return || 24;

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
    tag: `numberWays(hats) 人数 n=${n}`,
    log: `🎯 进入 numberWays：人数 n=${n}，喜好 hats=${JSON.stringify(hats)}`,
    msg: `主函数入口：共有 <code>${n}</code> 个人，帽子编号范围 1~40。由于人数很少 (<code>n <= 10</code>)，对人的满足状态进行二进制状态压缩。`,
  });

  // Step 1: 常量与参数初始化
  steps.push({
    type: 'init',
    line: lineInitMod,
    i: 0,
    j: 0,
    dp1d: [MOD],
    memo: {},
    activeSlot: 0,
    tag: `MOD = ${MOD}`,
    log: `| 模数 MOD = ${MOD}`,
    msg: `设定大数取模常量 <code>MOD = 1,000,000,007</code>。`,
  });

  steps.push({
    type: 'init',
    line: lineInitN,
    i: 0,
    j: 0,
    dp1d: [n],
    memo: {},
    activeSlot: 0,
    tag: `n = ${n}`,
    log: `| 获取人数 n = ${n}`,
    msg: `确定人数 <code>n = ${n}</code>。`,
  });

  steps.push({
    type: 'init',
    line: lineInitFull,
    i: 0,
    j: 0,
    dp1d: [full],
    memo: {},
    activeSlot: 0,
    tag: `full = (1<<${n})-1 = ${full.toString(2).padStart(n, '0')}b`,
    log: `| 全满目标掩码 full = ${(1 << n) - 1} (${full.toString(2).padStart(n, '0')}b)`,
    msg: `所有人均戴上帽子的目标掩码为 <code>full = (1 << ${n}) - 1 = ${full}</code>（二进制全 1）。`,
  });

  // Step 2: 建立帽子到人的反向映射
  steps.push({
    type: 'init',
    line: lineInitMap,
    i: 0,
    j: 0,
    dp1d: [],
    memo: {},
    activeSlot: 0,
    tag: '初始化反向映射表 hatToPersons',
    log: '| 🎩 准备反向映射：记录喜欢每顶帽子的人员列表',
    msg: '维度反转：因为帽子多、人少，将外层维度设为帽子（1~40），内层状态设为已戴帽子的人的集合。',
  });

  const hatToPersons: number[][] = Array.from({ length: 41 }, () => []);
  let maxHatId = 0;
  for (let p = 0; p < n; p++) {
    for (const h of hats[p]!) {
      if (h <= 40) {
        hatToPersons[h]!.push(p);
        if (h > maxHatId) maxHatId = h;
      }
    }
  }

  steps.push({
    type: 'init',
    line: lineFillMap,
    i: 0,
    j: 0,
    dp1d: [],
    memo: {},
    activeSlot: 0,
    tag: `映射建立完成：涉及帽子 1~${maxHatId}`,
    log: `| 映射详情: ${Array.from({ length: maxHatId + 1 }, (_, h) => h)
      .filter((h) => hatToPersons[h] && hatToPersons[h]!.length > 0)
      .map((h) => `帽子${h}→人[${hatToPersons[h]!.join(',')}]`)
      .join(', ')}`,
    msg: `反向映射建立完成：喜欢各帽子的人员列表已就绪。`,
  });

  // Step 3: 初始化 DP 数组
  const dp = new Array(1 << n).fill(0);
  steps.push({
    type: 'init',
    line: lineInitDp,
    i: 0,
    j: 0,
    dp1d: [...dp],
    memo: {},
    activeSlot: 0,
    tag: `分配 dp 数组：大小 2^${n} = ${1 << n}`,
    log: `| 📊 初始化 DP 数组：dp[0..${(1 << n) - 1}] = 0`,
    msg: `分配状压数组 <code>dp = new int[1 << ${n}]</code>，<code>dp[S]</code> 表示满足了集合 <code>S</code> 中所有人的帽子分配方案数。`,
  });

  dp[0] = 1;
  steps.push({
    type: 'init',
    line: lineBase,
    i: 0,
    j: 0,
    dp1d: [...dp],
    memo: {},
    activeSlot: 0,
    tag: '基础初值: dp[0] = 1',
    log: '| 🏁 初始基底：0 个人戴帽子时的方案数为 1 (dp[0] = 1)',
    msg: '设置边界基础值：当没有人需要戴帽子时（集合状态为 0），方案数为 <code>dp[0] = 1</code>。',
  });

  // Step 4: 0-1 背包式状压外层与内层推进
  const effectiveMaxHat = Math.min(maxHatId, 40);
  for (let h = 1; h <= effectiveMaxHat; h++) {
    const interested = hatToPersons[h] || [];
    if (interested.length === 0) continue;

    steps.push({
      type: 'loop_hat',
      line: lineLoopHat,
      i: h,
      j: 0,
      dp1d: [...dp],
      memo: {},
      activeSlot: 0,
      tag: `考察帽子 #${h} (喜欢它的人: [${interested.join(',')}])`,
      log: `| 🎩 开始决策第 ${h} 顶帽子 (喜欢者: 人[${interested.join(',')}])`,
      msg: `外层遍历：考察第 <code>${h}</code> 顶帽子，可选择不分配，或分配给喜欢它的某个人 <code>p ∈ [${interested.join(', ')}]</code>。`,
    });

    for (let s = full; s >= 0; s--) {
      if (dp[s] === 0) continue;

      const sBin = s.toString(2).padStart(n, '0');
      for (const p of interested) {
        // 检查人 p 是否还没戴帽子
        const hasHat = (s & (1 << p)) !== 0;
        if (!hasHat) {
          const nextS = s | (1 << p);
          const nextSBin = nextS.toString(2).padStart(n, '0');
          const prevVal = dp[nextS];
          dp[nextS] = (dp[nextS] + dp[s]) % MOD;

          steps.push({
            type: 'transfer',
            line: lineTransfer,
            i: h,
            j: nextS,
            dp1d: [...dp],
            memo: {},
            activeSlot: nextS,
            tag: `帽子${h} 分配给 人${p}: ${sBin}b -> ${nextSBin}b`,
            log: `| ➕ [分配方案] 帽子${h} 给 人${p}：状态 ${sBin}b ➔ ${nextSBin}b，dp[${nextSBin}b] = ${prevVal} + ${dp[s]} = ${dp[nextS]}`,
            msg: `状态转移：将第 <code>${h}</code> 顶帽子分配给人 <code>${p}</code>，满足集合从 <code>${sBin}b</code> 变为 <code>${nextSBin}b</code>，方案数累加：<code>dp[${nextSBin}b] = ${dp[nextS]}</code>。`,
          });
        }
      }
    }
  }

  // Step 5: 收敛返回
  const ans = dp[full];
  steps.push({
    type: 'return',
    line: lineReturn,
    i: effectiveMaxHat,
    j: full,
    dp1d: [...dp],
    memo: {},
    activeSlot: full,
    tag: `所有人戴上帽子方案数: ${ans}`,
    log: `| 🏆 全局答案汇聚：dp[${full.toString(2).padStart(n, '0')}b] = ${ans}`,
    msg: `🎉 推导完毕！所有 <code>${n}</code> 个人都戴上不同且喜欢的帽子的总方案数为 <strong>${ans}</strong>。`,
  });

  return steps;
}
