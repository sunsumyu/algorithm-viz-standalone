import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';

/**
 * 每个人戴不同帽子的方案数 (Number of Ways to Wear Different Hats, LC 1434, 左程云 81 课 Code01)
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

  const isReverse = params.direction === 'reverse';

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
  const memoRecord: Record<string, number | string> = {};

  const formatSteps = (rawSteps: UniversalStep[], finalAns: number) => {
    const currentStage =
      typeof params.stage === 'number'
        ? params.stage
        : parseInt(String(params.stage || '1').replace(/\D/g, ''), 10) || 1;
    return rawSteps.map((s, idx) => ({
      ...s,
      stepIndex: idx,
      stage: currentStage,
      line: s.line || lineEntry,
      codeLine: s.codeLine || s.line || lineEntry,
      decision: s.decision || s.log || s.tag || '状压DP帽子分配推导',
      message: s.message || s.msg || s.log || '',
      metrics: s.metrics || {
        '人数(n)': String(n),
        '全满掩码': `${full.toString(2)}b (${full})`,
        '当前帽子编号': typeof s.i === 'number' ? `#${s.i}` : '全局',
        '有效分配方案数': String(finalAns),
      },
    }));
  };

  // Step 0: 函数入口
  steps.push({
    type: 'entry',
    line: lineEntry,
    i: 0,
    j: 0,
    dp1d: new Array(1 << n).fill(0),
    memo: { ...memoRecord },
    activeSlot: 0,
    tag: isReverse ? `[逆向帽子探测] numberWays 入口` : `numberWays(hats) 人数 n=${n}`,
    log: isReverse
      ? `🌲 [逆向帽子优先] 进入 numberWays：人数 n=${n}，喜好 hats=${JSON.stringify(hats)}`
      : `🎯 进入 numberWays：人数 n=${n}，喜好 hats=${JSON.stringify(hats)}`,
    msg: isReverse
      ? `逆向降序帽子探测入口：共有 <code>${n}</code> 个人，反向考察帽子编号并进行维度反转状态压缩。`
      : `主函数入口：共有 <code>${n}</code> 个人，帽子编号范围 1~40。由于人数很少 (<code>n <= 10</code>)，对人的满足状态进行二进制状态压缩。`,
  });

  // Step 1: 常量与参数初始化
  steps.push({
    type: 'init',
    line: lineInitMod,
    i: 0,
    j: 0,
    dp1d: new Array(1 << n).fill(0),
    memo: { ...memoRecord },
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
    dp1d: new Array(1 << n).fill(0),
    memo: { ...memoRecord },
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
    dp1d: new Array(1 << n).fill(0),
    memo: { ...memoRecord },
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
    dp1d: new Array(1 << n).fill(0),
    memo: { ...memoRecord },
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
    dp1d: new Array(1 << n).fill(0),
    memo: { ...memoRecord },
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
    memo: { ...memoRecord },
    activeSlot: 0,
    tag: `分配 dp 数组：大小 2^${n} = ${1 << n}`,
    log: `| 📊 初始化 DP 数组：dp[0..${(1 << n) - 1}] = 0`,
    msg: `分配状压数组 <code>dp = new int[1 << ${n}]</code>，<code>dp[S]</code> 表示满足了集合 <code>S</code> 中所有人的帽子分配方案数。`,
  });

  dp[0] = 1;
  memoRecord['dp[000b]'] = 1;

  steps.push({
    type: 'init',
    line: lineBase,
    i: 0,
    j: 0,
    dp1d: [...dp],
    memo: { ...memoRecord },
    activeSlot: 0,
    tag: '基础初值: dp[0] = 1',
    log: '| 🏁 初始基底：0 个人戴帽子时的方案数为 1 (dp[0] = 1)',
    msg: '设置边界基础值：当没有人需要戴帽子时（集合状态为 0），方案数为 <code>dp[0] = 1</code>。',
  });

  // Step 4: 0-1 背包式状压外层与内层推进
  const effectiveMaxHat = Math.min(Math.max(maxHatId, 1), 40);
  const hatRange = isReverse
    ? Array.from({ length: effectiveMaxHat }, (_, i) => effectiveMaxHat - i)
    : Array.from({ length: effectiveMaxHat }, (_, i) => i + 1);

  for (const h of hatRange) {
    const interested = hatToPersons[h] || [];
    if (interested.length === 0) continue;

    steps.push({
      type: 'loop_hat',
      line: lineLoopHat,
      i: h,
      j: 0,
      dp1d: [...dp],
      memo: { ...memoRecord },
      activeSlot: 0,
      tag: isReverse
        ? `[逆序探索] 决策帽子 #${h} (喜欢者: [${interested.join(',')}])`
        : `考察帽子 #${h} (喜欢者: [${interested.join(',')}])`,
      log: `| 🎩 开始决策第 ${h} 顶帽子 (喜欢者: 人[${interested.join(',')}])`,
      msg: `外层遍历：考察第 <code>${h}</code> 顶帽子，可选择不分配，或分配给喜欢它的某个人 <code>p ∈ [${interested.join(', ')}]</code>。`,
    });

    for (let s = full; s >= 0; s--) {
      if (dp[s] === 0) continue;

      const sBin = s.toString(2).padStart(n, '0');
      steps.push({
        type: 'loop_status',
        line: lineLoopStatus,
        i: h,
        j: s,
        dp1d: [...dp],
        memo: { ...memoRecord },
        activeSlot: s,
        tag: `考察状态 s = ${sBin}b (方案数 ${dp[s]})`,
        log: `| 👥 考察人员满足集合 s = ${sBin}b`,
        msg: `中层枚举：考察当前戴帽人员集合 <code>${sBin}b</code>，当前方案数 <code>${dp[s]}</code>。`,
      });

      for (const p of interested) {
        steps.push({
          type: 'loop_p',
          line: lineLoopP,
          i: h,
          j: s,
          dp1d: [...dp],
          memo: { ...memoRecord },
          activeSlot: p,
          tag: `尝试将帽子 #${h} 分配给人 #${p}`,
          log: `| 👤 考察候选人员 p=${p}`,
          msg: `内层尝试：考察将帽子 <code>#${h}</code> 分配给人 <code>${p}</code>。`,
        });

        // 检查人 p 是否还没戴帽子
        const hasHat = (s & (1 << p)) !== 0;
        if (hasHat) {
          continue;
        }

        steps.push({
          type: 'cond_available',
          line: lineCondAvailable,
          i: h,
          j: s,
          dp1d: [...dp],
          memo: { ...memoRecord },
          activeSlot: p,
          tag: `人 #${p} 尚未戴帽子，满足分配条件`,
          log: `| 🟢 人 ${p} 尚未戴帽子，可以分配`,
          msg: `条件成立：人 <code>${p}</code> 尚未戴帽子，可以接受帽子 <code>#${h}</code>。`,
        });

        const nextS = s | (1 << p);
        const nextSBin = nextS.toString(2).padStart(n, '0');

        steps.push({
          type: 'calc_next_s',
          line: lineCalcNextS,
          i: h,
          j: nextS,
          dp1d: [...dp],
          memo: { ...memoRecord },
          activeSlot: nextS,
          tag: `生成新状态 nextS = ${nextSBin}b`,
          log: `| 🔲 新状态 nextS = ${nextSBin}b`,
          msg: `状态扩充：人 <code>${p}</code> 戴上帽子 <code>#${h}</code> 后，满足集合变为 <code>${nextSBin}b</code>。`,
        });

        const prevVal = dp[nextS];
        dp[nextS] = (dp[nextS] + dp[s]) % MOD;
        memoRecord[`dp[${nextSBin}b]`] = dp[nextS];

        steps.push({
          type: 'transfer',
          line: lineTransfer,
          i: h,
          j: nextS,
          dp1d: [...dp],
          memo: { ...memoRecord },
          activeSlot: nextS,
          tag: `帽子${h} 分配给 人${p}: ${sBin}b -> ${nextSBin}b`,
          log: `| ➕ [分配方案] 帽子${h} 给 人${p}：状态 ${sBin}b ➔ ${nextSBin}b，dp[${nextSBin}b] = ${prevVal} + ${dp[s]} = ${dp[nextS]}`,
          msg: `状态转移：将第 <code>${h}</code> 顶帽子分配给人 <code>${p}</code>，满足集合从 <code>${sBin}b</code> 变为 <code>${nextSBin}b</code>，方案数累加：<code>dp[${nextSBin}b] = <strong>${dp[nextS]}</strong></code>。`,
        });
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
    memo: { ...memoRecord },
    activeSlot: full,
    tag: `所有人戴上帽子方案数: ${ans}`,
    log: `| 🏆 全局答案汇聚：dp[${full.toString(2).padStart(n, '0')}b] = ${ans}`,
    msg: `🎉 推导完毕！所有 <code>${n}</code> 个人都戴上不同且喜欢的帽子的总方案数为 <strong>${ans}</strong>。`,
  });

  return formatSteps(steps, ans);
}
