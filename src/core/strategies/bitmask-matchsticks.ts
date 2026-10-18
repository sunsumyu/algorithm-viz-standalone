import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';

/**
 * 火柴拼正方形 (Matchsticks to Square, LC 473, 左程云 80 课)
 * 状态压缩与回溯剪枝经典基石
 * 严格遵循黄金规约：
 * 1. 零跳步（Zero Step Skipping）：放入火柴前发射 branch-call，进入递归发射 dfs_entry；
 * 2. 调用-返回物理闭环（Call-Return Parity）：子递归返回后发射 branch-return 回溯赋值闭环；
 * 3. 完备生命周期：entry -> calc_sum -> guard_sum -> calc_side -> sort -> init -> start_dfs -> dfs_entry -> boundary -> cache_hit -> loop_match -> cond_fit -> branch_call -> branch_return -> record -> return。
 */
export function compileMatchsticks(
  _model: IYamlAlgorithmModel,
  params: StageExecutionParams
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const anchorMap = params.anchorMap;
  const isReverse = params.direction === 'reverse';

  let matchsticks: number[];
  const raw = params.params?.nums;
  if (Array.isArray(raw)) {
    matchsticks = raw.map(Number);
  } else if (typeof raw === 'string') {
    matchsticks = raw
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
  } else {
    matchsticks = [1, 1, 2, 2, 2];
  }

  const lineEntry = anchorMap?.entry || 2;
  const lineCalcSum = anchorMap?.calc_sum || 4;
  const lineGuardSum = anchorMap?.guard_sum || 5;
  const lineCalcSide = anchorMap?.calc_side || 6;
  const lineSort = anchorMap?.sort || 7;
  const lineInit = anchorMap?.init || 9;
  const lineStartDfs = anchorMap?.start_dfs || 10;
  const lineDfsEntry = anchorMap?.dfs_entry || 12;
  const lineBoundary = anchorMap?.boundary || 13;
  const lineCacheHit = anchorMap?.cache_hit || 14;
  const lineInitAns = anchorMap?.init_ans || 15;
  const lineLoopMatch = anchorMap?.loop_match || 16;
  const lineCondFit = anchorMap?.cond_fit || 17;
  const lineCalcNext = anchorMap?.calc_next || 18;
  const lineBranchCall = anchorMap?.branch_call || 19;
  const lineMarkWin = anchorMap?.mark_win || 20;
  const lineBreak = anchorMap?.break || 21;
  const lineRecord = anchorMap?.record || 25;
  const lineReturn = anchorMap?.return || 26;

  const n = matchsticks.length;

  const formatSteps = (
    rawSteps: UniversalStep[],
    result: boolean,
    targetSide: number
  ) => {
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
      decision: s.decision || s.log || s.tag || '状压DP火柴拼正方形',
      message: s.message || s.msg || s.log || '',
      metrics: s.metrics || {
        '火柴数': String(n),
        '目标边长': targetSide > 0 ? String(targetSide) : '无解(总长非4倍数)',
        '拼成判定': result ? '可行 (true)' : '失败 (false)',
      },
    }));
  };

  // Step 0: 主入口
  steps.push({
    type: 'entry',
    line: lineEntry,
    i: 0,
    j: 0,
    dp1d: [0],
    memo: {},
    activeSlot: 0,
    tag: isReverse ? '[逆向升序搜索] makesquare 入口' : 'makesquare 入口',
    log: isReverse
      ? `🌲 [逆向小火柴优先] 进入 makesquare：输入火柴 [${matchsticks.join(', ')}]`
      : `🌲 进入 makesquare：输入火柴 [${matchsticks.join(', ')}]，准备计算总和与四边均分`,
    msg: isReverse
      ? `逆向小火柴优先探查：考察火柴数组 <code>[${matchsticks.join(', ')}]</code>，从小到大尝试碎片填充。`
      : `主函数入口：考察火柴数组 <code>[${matchsticks.join(', ')}]</code>，判定能否无折断拼成正方形。`,
  });

  // Step 1: 计算总和
  const sum = matchsticks.reduce((a, b) => a + b, 0);
  steps.push({
    type: 'update',
    line: lineCalcSum,
    i: 0,
    j: 0,
    dp1d: [sum],
    memo: {},
    activeSlot: 0,
    tag: `火柴总长度: ${sum}`,
    log: `| 📏 累加所有火柴总长度 sum = ${sum}`,
    msg: `火柴总长度为 <code>sum = ${sum}</code>。`,
  });

  // Step 2: 能否被 4 整除守卫
  if (sum % 4 !== 0) {
    steps.push({
      type: 'return',
      line: lineGuardSum,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: {},
      activeSlot: 0,
      tag: `总长度 ${sum} 不能被 4 整除 -> false`,
      log: `| 🛑 总长 ${sum} 不是 4 的倍数，无法构成正方形，直接返回 false`,
      msg: `边界特判：总长度 <code>${sum} % 4 != 0</code>，无法分为 4 等长边，返回 <strong>false</strong>。`,
    });
    return formatSteps(steps, false, 0);
  }

  // Step 3: 计算目标边长
  const side = sum / 4;
  steps.push({
    type: 'update',
    line: lineCalcSide,
    i: 0,
    j: 0,
    dp1d: [sum, side],
    memo: {},
    activeSlot: 0,
    tag: `目标正方形边长 side = ${side}`,
    log: `| 📐 正方形每条边目标长度 side = ${sum} / 4 = ${side}`,
    msg: `计算目标边长：<code>side = ${sum} / 4 = <strong>${side}</strong></code>。`,
  });

  // Step 4: 升序或降序排序
  matchsticks.sort((a, b) => a - b);
  steps.push({
    type: 'update',
    line: lineSort,
    i: 0,
    j: 0,
    dp1d: [sum, side],
    memo: {},
    activeSlot: 0,
    tag: `火柴排序: [${matchsticks.join(', ')}]`,
    log: `| 📊 火柴排序完成: [${matchsticks.join(', ')}]`,
    msg: `对火柴长度进行排序：<code>[${matchsticks.join(', ')}]</code>，优先从大火柴开始匹配可极大提升剪枝效率。`,
  });

  if (matchsticks[n - 1] > side) {
    steps.push({
      type: 'return',
      line: lineGuardSum,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: {},
      activeSlot: 0,
      tag: `单根火柴 ${matchsticks[n - 1]} > side(${side}) -> false`,
      log: `| 🛑 存在单根火柴 ${matchsticks[n - 1]} 大于目标边长 ${side}，无法放入任何边，返回 false`,
      msg: `剪枝特判：单根火柴 <code>${matchsticks[n - 1]} > ${side}</code>，直接返回 <strong>false</strong>。`,
    });
    return formatSteps(steps, false, side);
  }

  // Step 5: 初始化状态压缩记忆化表
  const memoTable: Record<string, number> = {};
  steps.push({
    type: 'init',
    line: lineInit,
    i: 0,
    j: 0,
    dp1d: [0, side],
    memo: {},
    activeSlot: 0,
    tag: `初始化状压 DP 表 (2^${n} = ${1 << n})`,
    log: `| 💾 初始化状压 DP 表：大小 2^${n} = ${1 << n}`,
    msg: `初始化状压记忆化表 <code>dp = new int[1 << ${n}]</code>。`,
  });

  // Step 6: 启动记忆化递归
  steps.push({
    type: 'call',
    line: lineStartDfs,
    i: 0,
    j: 0,
    dp1d: [0, side],
    memo: {},
    activeSlot: 0,
    tag: isReverse ? '[逆向升序] 启动 dfs(status=0, cur=0)' : '启动 dfs(status=0, cur=0)',
    log: isReverse
      ? '| 🚀 [逆向小火柴优先] 启动记忆化搜索：从小火柴开始枚举填充，当前边已拼 cur=0'
      : '| 🚀 启动记忆化搜索：从 0 根火柴开始，当前边已拼长度 cur=0',
    msg: isReverse
      ? '逆向从小火柴优先调用辅助递归函数：<code>dfs(status=0, cur=0)</code>。'
      : '调用辅助递归函数：<code>dfs(status=0, cur=0)</code>。',
  });

  let stepCount = 0;
  const maxSteps = 80;
  const targetFull = (1 << n) - 1;

  function dfs(status: number, cur: number): boolean {
    const statusBin = status.toString(2).padStart(n, '0');

    // 边界条件：所有火柴均已用完
    if (status === targetFull) {
      steps.push({
        type: 'boundary',
        line: lineBoundary,
        i: 0,
        j: 0,
        dp1d: [1, cur, side],
        memo: { ...memoTable },
        activeSlot: 0,
        tag: `所有火柴已用完 (status=${statusBin}) -> true`,
        log: `| 🏆 【边界出口】所有火柴全部归位！四条等长边全部拼成，返回 true`,
        msg: `边界条件满足：所有火柴均已用完（<code>status == (1 << n) - 1</code>），<strong>成功拼成正方形！</strong>`,
      });
      return true;
    }

    // 缓存命中
    if (memoTable[status] !== undefined) {
      const cached = memoTable[status] === 1;
      steps.push({
        type: 'cache_hit',
        line: lineCacheHit,
        i: 0,
        j: 0,
        dp1d: [cached ? 1 : 0, cur, side],
        memo: { ...memoTable },
        activeSlot: 0,
        tag: `缓存命中: 状态[${statusBin}] -> ${cached ? '可行' : '不可行'}`,
        log: `| ⚡ 【缓存命中】状压状态 ${statusBin} 已搜索过，返回 ${cached ? 'true' : 'false'}`,
        msg: `记忆化缓存命中：状态 <code>${statusBin}</code> 结果为 <strong>${cached ? '可行' : '不可行'}</strong>。`,
      });
      return cached;
    }

    // Callee Entry Frame
    steps.push({
      type: 'entry',
      line: lineDfsEntry,
      i: 0,
      j: 0,
      dp1d: [0, cur, side],
      memo: { ...memoTable },
      activeSlot: 0,
      tag: `进入递归 dfs(status=${statusBin}, cur=${cur})`,
      log: `| 📥 【递归帧】考察状压状态 status=${statusBin}，当前边已拼 ${cur}/${side}`,
      msg: `进入递归函数：火柴使用掩码 <code>${statusBin}</code>，当前边已拼 <code>${cur}/${side}</code>。`,
    });

    steps.push({
      type: 'update',
      line: lineInitAns,
      i: 0,
      j: 0,
      dp1d: [0, cur, side],
      memo: { ...memoTable },
      activeSlot: 0,
      tag: 'ans = false',
      log: '| 📍 初始化当前局面推导 ans = false',
      msg: '初始化当前局面可行性：<code>ans = false</code>。',
    });

    let ans = false;

    // 遍历未选火柴：正向优先大火柴加速剪枝，逆序优先小火柴探索碎片填充
    const order: number[] = [];
    if (isReverse) {
      for (let i = 0; i < n; i++) order.push(i);
    } else {
      for (let i = n - 1; i >= 0; i--) order.push(i);
    }

    for (const i of order) {
      if (stepCount >= maxSteps) break;

      steps.push({
        type: 'loop',
        line: lineLoopMatch,
        i,
        j: matchsticks[i],
        dp1d: [ans ? 1 : 0, cur, matchsticks[i]],
        memo: { ...memoTable },
        activeSlot: 0,
        tag: isReverse ? `[逆序] 尝试第 ${i} 根火柴(长${matchsticks[i]})` : `尝试第 ${i} 根火柴(长${matchsticks[i]})`,
        log: isReverse
          ? `| 🔄 【逆序探查】优先检查较小火柴 #${i}(长度=${matchsticks[i]})`
          : `| 🔄 检查火柴 #${i}(长度=${matchsticks[i]})`,
        msg: isReverse
          ? `逆序较小火柴优先探查：尝试火柴 <strong>#${i} (长度 ${matchsticks[i]})</strong>。`
          : `尝试火柴 <strong>#${i} (长度 ${matchsticks[i]})</strong>。`,
      });

      const isUsed = (status & (1 << i)) !== 0;
      if (isUsed || cur + matchsticks[i] > side) {
        continue;
      }

      steps.push({
        type: 'cond',
        line: lineCondFit,
        i,
        j: matchsticks[i],
        dp1d: [ans ? 1 : 0, cur, matchsticks[i]],
        memo: { ...memoTable },
        activeSlot: 0,
        tag: `火柴#${i}可放入 (放入后长 ${cur + matchsticks[i]} <= ${side})`,
        log: `| 🟢 火柴 #${i} 未使用且可放入当前边: ${cur} + ${matchsticks[i]} = ${cur + matchsticks[i]} <= ${side}`,
        msg: `条件满足：火柴 <strong>#${i} (长 ${matchsticks[i]})</strong> 可以放入当前边。`,
      });

      const nextCur = (cur + matchsticks[i]) % side;
      steps.push({
        type: 'update',
        line: lineCalcNext,
        i,
        j: nextCur,
        dp1d: [ans ? 1 : 0, nextCur, side],
        memo: { ...memoTable },
        activeSlot: 0,
        tag: `更新下一边进度: nextCur = ${nextCur} ${nextCur === 0 ? '(边拼成！开启新边)' : ''}`,
        log: `| 📐 计算下一当前边已拼长度: (${cur} + ${matchsticks[i]}) % ${side} = ${nextCur} ${nextCur === 0 ? '[一条完整边拼完！]' : ''}`,
        msg: `计算边进度：<code>nextCur = (${cur} + ${matchsticks[i]}) % ${side} = <strong>${nextCur}</strong></code> ${nextCur === 0 ? '（🎉 当前边拼成，开启新一条边！）' : ''}。`,
      });

      // Zero Step Skipping 拦截帧 (branch-call)
      const nextStatus = status | (1 << i);
      steps.push({
        type: 'branch-call',
        line: lineBranchCall,
        branchType: 'diag',
        varName: 'sub',
        i,
        j: matchsticks[i],
        dp1d: [0, nextCur, side],
        memo: { ...memoTable },
        activeSlot: 0,
        tag: `放入火柴#${i} -> dfs(status|${1 << i}, nextCur=${nextCur})`,
        log: `| 🌿 【分支深入】放入火柴 #${i}，深入状态: status=${nextStatus.toString(2).padStart(n, '0')}, cur=${nextCur}`,
        msg: `放入火柴 <strong>#${i} (长 ${matchsticks[i]})</strong>，深入下一层状压搜索。`,
      });
      stepCount++;

      const subResult = dfs(nextStatus, nextCur);

      // Call-Return Parity 回溯赋值闭环帧 (branch-return)
      steps.push({
        type: 'branch-return',
        line: lineBranchCall,
        branchType: 'diag',
        subResult: subResult ? 1 : 0,
        i,
        j: matchsticks[i],
        dp1d: [subResult ? 1 : 0, cur, side],
        memo: { ...memoTable },
        activeSlot: 0,
        tag: `子递归返回: ${subResult ? '成功' : '失败 (需回溯取出火柴)'}`,
        log: `| ↩️ 【回溯赋值】放入火柴 #${i} 的后续结果为: ${subResult ? '可行' : '不可行'}`,
        msg: `子递归返回赋值：放入火柴 <code>#${i}</code> 后的拼凑方案为 <strong>${subResult ? '可行 ✓' : '失败 ✗ (回溯取出)'}</strong>。`,
      });

      if (subResult) {
        ans = true;
        steps.push({
          type: 'update',
          line: lineMarkWin,
          i,
          j: 0,
          dp1d: [1, cur, side],
          memo: { ...memoTable },
          activeSlot: 0,
          tag: '成功拼成正方形，ans = true',
          log: '| 🏆 找到有效拼凑组合，标记 ans = true',
          msg: '找到合法拼凑方案：<code>ans = true</code>。',
        });

        steps.push({
          type: 'break',
          line: lineBreak,
          i,
          j: 0,
          dp1d: [1, cur, side],
          memo: { ...memoTable },
          activeSlot: 0,
          tag: '提前 break 剪枝',
          log: '| ✂️ 已成功，无需遍历剩余火柴，提前 break',
          msg: '剪枝跳出：已获得成功解，<code>break</code> 终止循环。',
        });
        break;
      }
    }

    memoTable[status] = ans ? 1 : -1;

    steps.push({
      type: 'record',
      line: lineRecord,
      i: 0,
      j: 0,
      dp1d: [ans ? 1 : 0, cur, side],
      memo: { ...memoTable },
      activeSlot: 0,
      tag: `dp[${statusBin}] = ${ans ? '1 (可行)' : '-1 (不可行)'}`,
      log: `| 💾 【记忆化保存】dp[${statusBin}] = ${ans ? '1' : '-1'}`,
      msg: `保存记忆化状态：<code>dp[${statusBin}] = <strong>${ans ? '1 (可行)' : '-1 (不可行)'}</strong></code>。`,
    });

    steps.push({
      type: 'return',
      line: lineReturn,
      i: 0,
      j: 0,
      dp1d: [ans ? 1 : 0, cur, side],
      memo: { ...memoTable },
      activeSlot: 0,
      tag: `返回 ${ans}`,
      log: `| ⬆️ 状态 ${statusBin} 返回 ${ans}`,
      msg: `返回递归结果：<code>return ${ans}</code>。`,
    });

    return ans;
  }

  const finalResult = dfs(0, 0);

  // 最终收敛返回
  steps.push({
    type: 'return',
    line: lineEntry,
    i: 0,
    j: 0,
    dp1d: [finalResult ? 1 : 0],
    memo: { ...memoTable },
    activeSlot: 0,
    tag: isReverse
      ? `[逆序推导完成]: ${finalResult ? '能拼成正方形 ✓' : '不能拼成正方形 ✗'}`
      : `最终结果: ${finalResult ? '能拼成正方形 ✓' : '不能拼成正方形 ✗'}`,
    log: isReverse
      ? `| 🏆 【逆序升序探查完成】makesquare = ${finalResult}`
      : `| 🏆 状压推导演化完成！makesquare = ${finalResult}`,
    msg: isReverse
      ? `🏆 逆向升序火柴推导完成！给定火柴 <strong>${finalResult ? '能够拼成正方形 (true) ✓' : '无法拼成正方形 (false) ✗'}</strong>。`
      : `🏆 状态压缩推导完成！给定火柴 <strong>${finalResult ? '能够拼成正方形 (true) ✓' : '无法拼成正方形 (false) ✗'}</strong>。`,
  });

  return formatSteps(steps, finalResult, side);
}
