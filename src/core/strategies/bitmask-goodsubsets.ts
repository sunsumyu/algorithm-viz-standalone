import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';

/**
 * 好子集的数目 (The Number of Good Subsets, LC 1994, 左程云 81 课)
 * 状压 DP + 数论质因数分解：
 * 1. 30 以内质数仅 10 个：[2, 3, 5, 7, 11, 13, 17, 19, 23, 29]；
 * 2. 排除平方因子数，合法数字压缩为 10 位质因数掩码；
 * 3. 0-1 背包转移求不含 1 的好子集；
 * 4. 数字 1 贡献 2^cnt[1] 倍乘。
 * 遵循黄金生命周期与零跳步规约：
 * entry -> init_primes -> count_freq -> alloc_masks -> save_mask -> alloc_dp -> base ->
 * loop_num -> get_mask -> loop_status -> cond_disjoint -> transfer -> sum_ans -> mult_ones -> return
 */
export function compileGoodSubsets(
  _model: IYamlAlgorithmModel,
  params: StageExecutionParams
): UniversalStep[] {
  const nums: number[] = (params.params?.nums as number[]) || [1, 2, 3, 4];
  const anchorMap = params.anchorMap;

  const lineEntry = anchorMap?.entry || 2;
  const lineInitMod = anchorMap?.init_mod || 3;
  const lineInitPrimes = anchorMap?.init_primes || 4;
  const lineAllocCnt = anchorMap?.alloc_cnt || 5;
  const lineCountFreq = anchorMap?.count_freq || 6;
  const lineAllocMasks = anchorMap?.alloc_masks || 7;
  const lineSaveMask = anchorMap?.save_mask || 18;
  const lineAllocDp = anchorMap?.alloc_dp || 20;
  const lineBase = anchorMap?.base || 21;
  const lineLoopNum = anchorMap?.loop_num || 22;
  const lineCondSkipNum = anchorMap?.cond_skip_num || 23;
  const lineGetMask = anchorMap?.get_mask || 24;
  const lineLoopStatus = anchorMap?.loop_status || 25;
  const lineCondDisjoint = anchorMap?.cond_disjoint || 26;
  const lineTransfer = anchorMap?.transfer || 27;
  const lineSumAns = anchorMap?.sum_ans || 32;
  const lineMultOnes = anchorMap?.mult_ones || 33;
  const lineReturn = anchorMap?.return || 34;

  const MOD = 1000000007;
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
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
    tag: `numberOfGoodSubsets(nums) 规模: ${nums.length}`,
    log: `🎯 进入 numberOfGoodSubsets：输入数组 nums=${JSON.stringify(nums)}`,
    msg: `主函数入口：输入数组元素范围为 <code>1 ~ 30</code>。好子集的元素乘积必须是互不相同的质数之积。`,
  });

  // Step 1: 质数表与频次统计
  steps.push({
    type: 'init',
    line: lineInitPrimes,
    i: 0,
    j: 0,
    dp1d: [...primes],
    memo: {},
    activeSlot: 0,
    tag: '10个质数表: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]',
    log: `| 30以内的 10 个质数：[${primes.join(', ')}]，对应 10 位二进制掩码`,
    msg: '因为 30 以内只有 10 个质数，将每个合法数字表示为其质因数组成的 10 位二进制集合掩码。',
  });

  const cnt = new Array(31).fill(0);
  for (const x of nums) {
    if (x >= 1 && x <= 30) cnt[x]++;
  }

  steps.push({
    type: 'init',
    line: lineCountFreq,
    i: 0,
    j: 0,
    dp1d: [...cnt],
    memo: {},
    activeSlot: 0,
    tag: `数字频次统计完成: 1有${cnt[1]}个, 出现数字: ${nums.filter((v, idx) => nums.indexOf(v) === idx).join(', ')}`,
    log: `| 频次统计完成：含 1 的个数 = ${cnt[1]}`,
    msg: `统计各数字出现频次：数字 1 出现 <code>${cnt[1]}</code> 次。数字 1 不含任何质因子，其每个副本都可选或不选。`,
  });

  // Step 2: 预处理 1~30 的质因数 mask
  const masks = new Array(31).fill(0);
  for (let i = 2; i <= 30; i++) {
    let m = 0;
    let x = i;
    for (let j = 0; j < 10; j++) {
      if (x % primes[j]! === 0) {
        x = Math.floor(x / primes[j]!);
        if (x % primes[j]! === 0) {
          m = -1; // 存在平方因子
          break;
        }
        m |= 1 << j;
      }
    }
    masks[i] = m;
  }

  steps.push({
    type: 'init',
    line: lineSaveMask,
    i: 0,
    j: 0,
    dp1d: [...masks],
    memo: {},
    activeSlot: 0,
    tag: '预处理 2~30 各数质因数掩码 (含平方因子标记为 -1)',
    log: `| 预处理完成：平方因子排除数包括 4, 8, 9, 12, 16, 18, 20, 24, 25, 27, 28`,
    msg: '完成 2~30 质因数掩码预处理：过滤带平方因子的数（mask 设为 -1），其余映射为 10 位无重叠二进制掩码。',
  });

  // Step 3: 分配并初始化 DP 数组
  const dp = new Array(1 << 10).fill(0);
  dp[0] = 1;

  steps.push({
    type: 'init',
    line: lineBase,
    i: 0,
    j: 0,
    dp1d: [...dp],
    memo: {},
    activeSlot: 0,
    tag: `分配 dp 数组，dp[0] = 1`,
    log: '| 📊 状态定义：dp[S] 表示质因子集合为 S 的好子集数量，初始 dp[0] = 1',
    msg: '分配 <code>dp = new int[1 << 10]</code>，<code>dp[S]</code> 表示恰好包含质因数集合 <code>S</code> 的好子集数量。',
  });

  // Step 4: 0-1 背包转移推进
  const full = (1 << 10) - 1;
  for (let i = 2; i <= 30; i++) {
    if (cnt[i] === 0 || masks[i] === -1) continue;

    const m = masks[i]!;
    const mBin = m.toString(2).padStart(10, '0');

    for (let s = full; s >= 0; s--) {
      if ((s & m) === 0 && dp[s]! > 0) {
        const nextS = s | m;
        const addWays = (dp[s]! * cnt[i]!) % MOD;
        dp[nextS] = (dp[nextS]! + addWays) % MOD;

        steps.push({
          type: 'transfer',
          line: lineTransfer,
          i: i,
          j: nextS,
          dp1d: [...dp],
          memo: {},
          activeSlot: nextS,
          tag: `加入数 ${i} (mask ${mBin}b): dp[${nextS.toString(2).padStart(10, '0')}b] += ${addWays}`,
          log: `| ➕ [加入数字 ${i}] 原质数集 ${s.toString(2).padStart(10, '0')}b + 数${i}(${mBin}b) ➔ 新质数集 ${nextS.toString(2).padStart(10, '0')}b，方案数增量 = ${addWays}`,
          msg: `加入数字 <code>${i}</code>（出现 <code>${cnt[i]}</code> 次，掩码 <code>${mBin}b</code>）：与前序质数集无冲突，状态转移至 <code>${nextS.toString(2).padStart(10, '0')}b</code>，当前方案数 <code>dp[nextS] = ${dp[nextS]}</code>。`,
        });
      }
    }
  }

  // Step 5: 累加所有非空好子集，并乘上 2^cnt[1]
  let sumWithoutOne = 0;
  for (let s = 1; s <= full; s++) {
    sumWithoutOne = (sumWithoutOne + dp[s]!) % MOD;
  }

  steps.push({
    type: 'init',
    line: lineSumAns,
    i: 0,
    j: sumWithoutOne,
    dp1d: [...dp],
    memo: {},
    activeSlot: 0,
    tag: `不含1的好子集方案总数: ${sumWithoutOne}`,
    log: `| 🧮 累加所有非空质数集合：不含数字 1 的好子集总数 = ${sumWithoutOne}`,
    msg: `统计所有非空质数集合的方案总数：不含 1 的好子集数为 <code>${sumWithoutOne}</code>。`,
  });

  let totalAns = sumWithoutOne;
  for (let c = 0; c < cnt[1]!; c++) {
    totalAns = (totalAns * 2) % MOD;
  }

  steps.push({
    type: 'init',
    line: lineMultOnes,
    i: 0,
    j: totalAns,
    dp1d: [...dp],
    memo: {},
    activeSlot: 0,
    tag: `计入数字 1 (2^${cnt[1]} 倍乘): 最终结果 ${totalAns}`,
    log: `| ✖️ 乘上数字 1 的选/不选倍数 2^${cnt[1]} = ${Math.pow(2, cnt[1]!)} ➔ 最终结果 = ${totalAns}`,
    msg: `处理数字 1：每个数字 1 都独立具备“选”与“不选”2 种可能，方案数乘以 <code>2^${cnt[1]}</code>，得到最终好子集数目 <strong>${totalAns}</strong>。`,
  });

  // Step 6: 收敛返回
  steps.push({
    type: 'return',
    line: lineReturn,
    i: 0,
    j: totalAns,
    dp1d: [...dp],
    memo: {},
    activeSlot: full,
    tag: `🎉 好子集的数目: ${totalAns}`,
    log: `| 🏆 全局推导完成：好子集的数目 = ${totalAns}`,
    msg: `🎉 推导完成！数组 <code>nums</code> 中能构成的互不相同质数乘积的好子集总数为 <strong>${totalAns}</strong>。`,
  });

  return steps;
}
