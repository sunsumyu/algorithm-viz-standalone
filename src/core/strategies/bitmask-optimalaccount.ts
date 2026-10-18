import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';

/**
 * 最优账单平衡 (Optimal Account Balancing, LC 465, 左程云 81 课 Code02)
 * 状压 DP：
 * 1. 过滤净负债为 0 的人，得 m 个非零负债者；
 * 2. 和为 0 的独立子集内，只需 size - 1 笔交易即可清零；
 * 3. 欲使总交易笔数 ∑(size - 1) = m - k 最小，等价于求最大和为 0 的独立子集数 k！
 * 遵循黄金生命周期与零跳步规约：
 * entry -> init_map -> loop_trans -> filter_zero -> init_m -> alloc_debts ->
 * alloc_sum -> loop_sum_s -> calc_sum -> alloc_dp -> loop_dp_s -> transfer_sub ->
 * cond_zero_sum -> increment_zero_subset -> return
 */
export function compileOptimalAccount(
  _model: IYamlAlgorithmModel,
  params: StageExecutionParams
): UniversalStep[] {
  const transactions: number[][] = (params.params?.transactions as number[][]) || [
    [0, 1, 10],
    [2, 0, 5],
  ];
  const anchorMap = params.anchorMap;

  const isReverse = params.direction === 'reverse';

  const lineEntry = anchorMap?.entry || 2;
  const lineInitMap = anchorMap?.init_map || 3;
  const lineLoopTrans = anchorMap?.loop_trans || 4;
  const lineRecordFrom = anchorMap?.record_from || 5;
  const lineRecordTo = anchorMap?.record_to || 6;
  const lineInitList = anchorMap?.init_list || 8;
  const lineFilterZero = anchorMap?.filter_zero || 9;
  const lineInitM = anchorMap?.init_m || 10;
  const lineGuardZero = anchorMap?.guard_zero || 11;
  const lineAllocDebts = anchorMap?.alloc_debts || 12;
  const lineFillDebts = anchorMap?.fill_debts || 13;
  const lineInitFull = anchorMap?.init_full || 14;
  const lineAllocSum = anchorMap?.alloc_sum || 15;
  const lineLoopSumS = anchorMap?.loop_sum_s || 16;
  const lineLoopSumI = anchorMap?.loop_sum_i || 17;
  const lineCondSumHas = anchorMap?.cond_sum_has || 18;
  const lineCalcSum = anchorMap?.calc_sum || 19;
  const lineBreakSum = anchorMap?.break_sum || 20;
  const lineAllocDp = anchorMap?.alloc_dp || 24;
  const lineLoopDpS = anchorMap?.loop_dp_s || 25;
  const lineLoopDpI = anchorMap?.loop_dp_i || 26;
  const lineCondDpHas = anchorMap?.cond_dp_has || 27;
  const lineTransferSub = anchorMap?.transfer_sub || 28;
  const lineCondZeroSum = anchorMap?.cond_zero_sum || 31;
  const lineIncrementZeroSubset = anchorMap?.increment_zero_subset || 32;
  const lineReturn = anchorMap?.return || 35;

  const steps: UniversalStep[] = [];
  const memoRecord: Record<string, number | string> = {};

  const debtMap = new Map<number, number>();
  for (const [u, v, w] of transactions) {
    debtMap.set(u, (debtMap.get(u) || 0) - w);
    debtMap.set(v, (debtMap.get(v) || 0) + w);
  }

  const nonZeroList: number[] = [];
  for (const d of debtMap.values()) {
    if (d !== 0) nonZeroList.push(d);
  }

  const m = nonZeroList.length;
  const full = (1 << m) - 1;

  const formatSteps = (rawSteps: UniversalStep[], finalAns: number, zeroCount: number) => {
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
      decision: s.decision || s.log || s.tag || '状压DP最优账单平衡推导',
      message: s.message || s.msg || s.log || '',
      metrics: s.metrics || {
        '非零负债人数(m)': String(m),
        '全集掩码': `${full.toString(2)}b (${full})`,
        '最大和0子集数': String(zeroCount),
        '最少交易笔数': String(finalAns),
      },
    }));
  };

  // Step 0: 函数入口
  steps.push({
    type: 'entry',
    line: lineEntry,
    i: 0,
    j: 0,
    dp1d: [0],
    memo: { ...memoRecord },
    activeSlot: 0,
    tag: isReverse ? `[逆向探测] minTransfers 笔数: ${transactions.length}` : `minTransfers(transactions) 笔数: ${transactions.length}`,
    log: isReverse
      ? `🌲 [逆向对偶探测] 进入 minTransfers：交易记录 transactions=${JSON.stringify(transactions)}`
      : `🎯 进入 minTransfers：交易记录 transactions=${JSON.stringify(transactions)}`,
    msg: '主函数入口：给定每笔转账 <code>[from, to, amount]</code>，目标是找到结清所有债务的最少交易总笔数。',
  });

  // Step 1: 统计每人净负债
  steps.push({
    type: 'init',
    line: lineInitMap,
    i: 0,
    j: 0,
    dp1d: [],
    memo: { ...memoRecord },
    activeSlot: 0,
    tag: '初始化负债哈希表 map',
    log: '| 准备统计每人净负债 (支出为负，收入为正)',
    msg: '统计每个人的净结余：付款方 <code>-amount</code>，收款方 <code>+amount</code>。',
  });

  steps.push({
    type: 'init',
    line: lineFilterZero,
    i: 0,
    j: 0,
    dp1d: [...nonZeroList],
    memo: { ...memoRecord },
    activeSlot: 0,
    tag: `过滤收支平衡者，非零负债列表: [${nonZeroList.join(', ')}]`,
    log: `| 过滤净负债为 0 的人，剩余 ${nonZeroList.length} 人：[${nonZeroList.join(', ')}]`,
    msg: `过滤已收支平衡的人后，剩余 <code>${nonZeroList.length}</code> 个非零负债者：<code>[${nonZeroList.join(', ')}]</code>。`,
  });

  steps.push({
    type: 'init',
    line: lineInitM,
    i: 0,
    j: 0,
    dp1d: [m],
    memo: { ...memoRecord },
    activeSlot: 0,
    tag: `非零负债人数 m = ${m}`,
    log: `| 确定非零负债人数 m = ${m}`,
    msg: `确定有效负债人数 <code>m = ${m}</code>。`,
  });

  if (m === 0) {
    steps.push({
      type: 'return',
      line: lineGuardZero,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: { ...memoRecord },
      activeSlot: 0,
      tag: '无非零负债，返回 0 笔',
      log: '| 所有人均收支平衡，无需任何转账，返回 0',
      msg: '所有人初始已平衡，最少转账笔数为 <strong>0</strong>。',
    });
    return formatSteps(steps, 0, 0);
  }

  const debts = [...nonZeroList];

  steps.push({
    type: 'init',
    line: lineFillDebts,
    i: 0,
    j: 0,
    dp1d: [...debts],
    memo: { ...memoRecord },
    activeSlot: 0,
    tag: `debts 数组就绪: [${debts.join(', ')}], full=${full.toString(2).padStart(m, '0')}b`,
    log: `| debts 数组: [${debts.join(', ')}]，全集掩码 full = ${full}`,
    msg: `负债数组创建完毕，全员集合掩码 <code>full = (1 << ${m}) - 1 = ${full}</code>。`,
  });

  // Step 2: 预处理子集和 sum[1 << m]
  const sum = new Array(1 << m).fill(0);
  for (let s = 1; s <= full; s++) {
    const indices = isReverse
      ? Array.from({ length: m }, (_, i) => m - 1 - i)
      : Array.from({ length: m }, (_, i) => i);

    for (const i of indices) {
      if ((s & (1 << i)) !== 0) {
        sum[s] = sum[s ^ (1 << i)]! + debts[i]!;
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
    memo: { ...memoRecord },
    activeSlot: 0,
    tag: `预处理所有 ${1 << m} 个子集和 sum`,
    log: `| 🧮 预处理各子集净额累加和，其中和为 0 的子集包括: ${Array.from({ length: full + 1 }, (_, s) => s)
      .filter((s) => s > 0 && sum[s] === 0)
      .map((s) => `${s.toString(2).padStart(m, '0')}b`)
      .join(', ')}`,
    msg: '预处理所有 <code>2^m</code> 个子集的净额累加和，寻找哪些子集内部可以自平衡（和为 0）。',
  });

  // Step 3: 状压 DP，求最大和为 0 的子集数
  const dp = new Array(1 << m).fill(0);
  steps.push({
    type: 'init',
    line: lineAllocDp,
    i: 0,
    j: 0,
    dp1d: [...dp],
    memo: { ...memoRecord },
    activeSlot: 0,
    tag: `分配 dp 数组，大小 2^${m} = ${1 << m}`,
    log: `| 📊 初始化 dp[0..${full}] = 0 (记录各集合能拆出的最大和为0子集数)`,
    msg: `<code>dp[S]</code> 表示集合 <code>S</code> 最多能拆分成多少个内部和为 0 的独立子集。`,
  });

  for (let s = 1; s <= full; s++) {
    const sBin = s.toString(2).padStart(m, '0');
    const indices = isReverse
      ? Array.from({ length: m }, (_, i) => m - 1 - i)
      : Array.from({ length: m }, (_, i) => i);

    steps.push({
      type: 'loop',
      line: lineLoopDpS,
      i: s,
      j: 0,
      dp1d: [...dp],
      memo: { ...memoRecord },
      activeSlot: s,
      tag: isReverse ? `[逆序探索] 集合 s = ${sBin}b` : `考察集合 s = ${sBin}b (和 sum=${sum[s]})`,
      log: `| 🔄 推进状态集合 s = ${sBin}b (当前净额和: ${sum[s]})`,
      msg: `外层枚举：考察非零负债集合 <code>${sBin}b</code>，子集净额总和为 <code>${sum[s]}</code>。`,
    });

    // 继承前驱子集最大值
    for (const i of indices) {
      if ((s & (1 << i)) !== 0) {
        const sub = s ^ (1 << i);
        if (dp[sub]! > dp[s]!) {
          dp[s] = dp[sub]!;
          steps.push({
            type: 'update',
            line: lineTransferSub,
            i: s,
            j: i,
            dp1d: [...dp],
            memo: { ...memoRecord },
            activeSlot: s,
            tag: `继承前驱子集: dp[${sBin}b] = dp[${sub.toString(2).padStart(m, '0')}b] = ${dp[s]}`,
            log: `| ⤴️ 集合 ${sBin}b 继承子状态 ${sub.toString(2).padStart(m, '0')}b 的最大拆分数: ${dp[s]}`,
            msg: `转移继承：集合 <code>${sBin}b</code> 继承去除人员 <code>${i}</code> 后的子集最大值 <code>dp[${sub.toString(2).padStart(m, '0')}b] = <strong>${dp[s]}</strong></code>。`,
          });
        }
      }
    }

    memoRecord[`dp[${sBin}b]`] = dp[s];

    // 若自身净额和为 0，额外增加一个和为 0 的独立子集
    if (sum[s] === 0) {
      dp[s]! += 1;
      memoRecord[`dp[${sBin}b]`] = dp[s];

      steps.push({
        type: 'transfer',
        line: lineIncrementZeroSubset,
        i: s,
        j: dp[s]!,
        dp1d: [...dp],
        memo: { ...memoRecord },
        activeSlot: s,
        tag: `🎯 子集 ${sBin}b 和为 0！dp[${sBin}b] = ${dp[s]}`,
        log: `| ✨ [发现和为0子集] 集合 ${sBin}b 净负债和为 0，最大独立和为0子集数递增至 dp[${sBin}b] = ${dp[s]}`,
        msg: `集合 <code>${sBin}b</code> 的净负债总和为 0！可独立闭合结清，最大和为 0 的子集数增加：<code>dp[${sBin}b] = ${dp[s]}</code>。`,
      });
    }
  }

  // Step 4: 收敛返回
  const maxZeroSubsets = dp[full]!;
  const ans = m - maxZeroSubsets;

  steps.push({
    type: 'return',
    line: lineReturn,
    i: full,
    j: ans,
    dp1d: [...dp],
    memo: { ...memoRecord },
    activeSlot: full,
    tag: `最少交易笔数: ${ans} (m=${m} - dp[full]=${maxZeroSubsets})`,
    log: `| 🏆 推导收敛：最大和0子集数 = ${maxZeroSubsets}，最少交易笔数 = m(${m}) - ${maxZeroSubsets} = ${ans}`,
    msg: `🎉 推演完成！全集 <code>m = ${m}</code> 个人最多能拆出 <strong>${maxZeroSubsets}</strong> 个和为 0 的独立子集，还清所有债务所需最少交易笔数为 <code>${m} - ${maxZeroSubsets} = <strong>${ans}</strong></code> 笔。`,
  });

  return formatSteps(steps, ans, maxZeroSubsets);
}
