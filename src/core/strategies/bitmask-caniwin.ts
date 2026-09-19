import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';

/**
 * 我能赢吗 (Can I Win, LC 464, 左程云 80 课)
 * 状态压缩与博弈 DP 经典基石
 * 严格遵循黄金规约：
 * 1. 零跳步（Zero Step Skipping）：选择数字前发射 branch-call，进入子递归发射 dfs_entry；
 * 2. 调用-返回物理闭环（Call-Return Parity）：对手回合返回后发射 branch-return 回溯赋值闭环；
 * 3. 完备生命周期：entry -> guard -> init -> start_dfs -> dfs_entry -> cache_hit -> loop -> branch_call -> branch_return -> record -> return。
 */
export function compileCanIWin(
  _model: IYamlAlgorithmModel,
  params: StageExecutionParams
): UniversalStep[] {
  const n = Number(params.params?.n) || 4;
  const m = Number(params.params?.m) || 6;
  const anchorMap = params.anchorMap;

  const lineEntry = anchorMap?.entry || 2;
  const lineGuardWin = anchorMap?.guard_win || 3;
  const lineGuardLose = anchorMap?.guard_lose || 4;
  const lineInit = anchorMap?.init || 5;
  const lineStartDfs = anchorMap?.start_dfs || 6;
  const lineDfsEntry = anchorMap?.dfs_entry || 9;
  const lineCacheHit = anchorMap?.cache_hit || 10;
  const lineInitAns = anchorMap?.init_ans || 11;
  const lineLoopNum = anchorMap?.loop_num || 12;
  const lineCondAvailable = anchorMap?.cond_available || 13;
  const lineBranchCall = anchorMap?.branch_call || 14;
  const lineMarkWin = anchorMap?.mark_win || 15;
  const lineBreak = anchorMap?.break || 16;
  const lineRecord = anchorMap?.record || 20;
  const lineReturn = anchorMap?.return || 21;

  const steps: UniversalStep[] = [];

  // Step 0: 主函数入口
  steps.push({
    type: 'entry',
    line: lineEntry,
    i: 0,
    j: 0,
    dp1d: [0],
    memo: {},
    activeSlot: 0,
    tag: `canIWin(n=${n}, m=${m}) 入口`,
    log: `🎯 进入 canIWin：可选池 1~${n}，目标累加和 ≥ ${m}`,
    msg: `主函数入口：数字池为 <code>1 ~ ${n}</code>，目标累加和达到或超过 <code>${m}</code> 即可获胜。`,
  });

  // Step 1: 特判
  if (m <= 0) {
    steps.push({
      type: 'return',
      line: lineGuardWin,
      i: 0,
      j: 0,
      dp1d: [1],
      memo: {},
      activeSlot: 0,
      tag: '目标为 0，先手直接获胜',
      log: '| 🏆 目标累加和 <= 0，先手未行动即已达成目标，返回 true',
      msg: '边界特判：目标累加和 <code>m <= 0</code>，先手无需抽数直接获胜，返回 <strong>true</strong>。',
    });
    return steps;
  }

  const totalSum = (n * (n + 1)) / 2;
  if (totalSum < m) {
    steps.push({
      type: 'return',
      line: lineGuardLose,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: {},
      activeSlot: 0,
      tag: `所有数总和 ${totalSum} < ${m}，先手必输`,
      log: `| 🛑 所有数字累加总和 ${totalSum} 均小于目标 ${m}，双方均无法达标，先手必输，返回 false`,
      msg: `边界特判：池中所有数总和 <code>${totalSum} < ${m}</code>，无法达成目标，先手必输，返回 <strong>false</strong>。`,
    });
    return steps;
  }

  // Step 2: 初始化记忆化表
  const memoTable: Record<string, number> = {};
  steps.push({
    type: 'init',
    line: lineInit,
    i: 0,
    j: 0,
    dp1d: [0],
    memo: {},
    activeSlot: 0,
    tag: `初始化状压记忆化表 dp[1<<${n + 1}]`,
    log: `| 📊 初始化记忆化表：大小为 2^${n + 1} = ${1 << (n + 1)}，记录各状态胜负`,
    msg: `初始化记忆化数组 <code>dp = new int[1 << ${n + 1}]</code>，以二进制掩码记录各局面胜负。`,
  });

  // Step 3: 启动记忆化递归
  steps.push({
    type: 'call',
    line: lineStartDfs,
    i: 0,
    j: 0,
    dp1d: [0],
    memo: {},
    activeSlot: 0,
    tag: '启动 dfs(status=0, rest=m)',
    log: '| 🚀 启动记忆化递归 dfs(status=0, rest=m)',
    msg: `调用辅助递归函数：<code>dfs(status=0, rest=${m})</code>。`,
  });

  let stepCount = 0;
  const maxSteps = 80;

  function dfs(status: number, rest: number): boolean {
    const statusBin = status.toString(2).padStart(n + 1, '0');
    // 缓存命中检查
    if (memoTable[status] !== undefined) {
      const cached = memoTable[status] === 1;
      steps.push({
        type: 'cache_hit',
        line: lineCacheHit,
        i: 0,
        j: 0,
        dp1d: [cached ? 1 : 0, rest],
        memo: { ...memoTable },
        activeSlot: 0,
        tag: `缓存命中: 状态[${statusBin}] -> ${cached ? '先手赢' : '先手输'}`,
        log: `| ⚡ 【缓存命中】状态 status=${statusBin} 已推导过，直接返回 ${cached ? 'true(必胜)' : 'false(必败)'}`,
        msg: `记忆化缓存命中：局面 <code>status=${statusBin}</code> 结论为 <strong>${cached ? '先手必胜' : '先手必败'}</strong>。`,
      });
      return cached;
    }

    // Callee Entry Frame
    steps.push({
      type: 'entry',
      line: lineDfsEntry,
      i: 0,
      j: 0,
      dp1d: [0, rest],
      memo: { ...memoTable },
      activeSlot: 0,
      tag: `进入递归 dfs(status=${statusBin}, rest=${rest})`,
      log: `| 📥 【递归帧】考察局面 status=${statusBin}，当前选手需凑齐 rest=${rest}`,
      msg: `进入递归函数：当前局面二进制状态 <code>${statusBin}</code>，距离目标尚需 <code>${rest}</code>。`,
    });

    // 初始化本回合 ans = false
    steps.push({
      type: 'update',
      line: lineInitAns,
      i: 0,
      j: 0,
      dp1d: [0, rest],
      memo: { ...memoTable },
      activeSlot: 0,
      tag: 'ans = false (假定必败)',
      log: '| 📍 初始化当前回合结论 ans = false，尝试所有可选数字寻找必胜分支',
      msg: '初始化当前选手胜负结论：<code>ans = false</code>，只要找到一种让对手必败的选法即告胜。',
    });

    let ans = false;

    // 遍历可选数字 1 ~ n
    for (let i = 1; i <= n; i++) {
      if (stepCount >= maxSteps) break;

      steps.push({
        type: 'loop',
        line: lineLoopNum,
        i,
        j: 0,
        dp1d: [ans ? 1 : 0, rest, i],
        memo: { ...memoTable },
        activeSlot: 0,
        tag: `尝试数字 ${i}`,
        log: `| 🔄 循环检查数字 i=${i}`,
        msg: `循环遍历：检查数字 <strong>${i}</strong> 是否已被选用。`,
      });

      const isUsed = (status & (1 << i)) !== 0;
      if (isUsed) {
        continue;
      }

      steps.push({
        type: 'cond',
        line: lineCondAvailable,
        i,
        j: 0,
        dp1d: [ans ? 1 : 0, rest, i],
        memo: { ...memoTable },
        activeSlot: 0,
        tag: `数字 ${i} 可用`,
        log: `| 🟢 数字 i=${i} 未被使用，属于当前可选策略`,
        msg: `条件满足：数字 <strong>${i}</strong> 尚未被使用，尝试选择该数字。`,
      });

      if (i >= rest) {
        // 当前选手选 i 即可直接达成目标获胜
        ans = true;
        steps.push({
          type: 'update',
          line: lineMarkWin,
          i,
          j: 0,
          dp1d: [1, rest, i],
          memo: { ...memoTable },
          activeSlot: 0,
          tag: `选 ${i} >= rest(${rest})，当前选手立即获胜！`,
          log: `| 🏆 【一步致胜】当前选手选择 ${i} >= rest(${rest})，立即达到目标累加和，宣告胜利！`,
          msg: `当前选手选择 <code>${i} >= rest(${rest})</code>，累加和达标，<strong>立即获胜！</strong>`,
        });

        steps.push({
          type: 'break',
          line: lineBreak,
          i,
          j: 0,
          dp1d: [1, rest, i],
          memo: { ...memoTable },
          activeSlot: 0,
          tag: '已获胜，剪枝跳出循环',
          log: '| ✂️ 已找到致胜策略，无需尝试其他数字，提前 break 剪枝',
          msg: '剪枝跳出：已找到致胜分支，<code>break</code> 终止遍历。',
        });
        break;
      }

      // Zero Step Skipping 拦截帧 (branch-call)
      const nextStatus = status | (1 << i);
      const nextRest = rest - i;
      steps.push({
        type: 'branch-call',
        line: lineBranchCall,
        branchType: 'diag',
        varName: 'subOpponentWin',
        i,
        j: 0,
        dp1d: [0, nextRest, i],
        memo: { ...memoTable },
        activeSlot: 0,
        tag: `选择 ${i} -> 交替由对手行动 dfs(status|${1 << i}, rest-${i})`,
        log: `| 🌿 【分支深入】选择 ${i}，进入对手回合：dfs(status=${nextStatus.toString(2).padStart(n + 1, '0')}, rest=${nextRest})`,
        msg: `深入对手回合：选入数字 <strong>${i}</strong>，局面转移至对手，求解对手在该局面下能否必胜。`,
      });
      stepCount++;

      const opponentWin = dfs(nextStatus, nextRest);

      // Call-Return Parity 回溯赋值闭环帧 (branch-return)
      steps.push({
        type: 'branch-return',
        line: lineBranchCall,
        branchType: 'diag',
        subResult: opponentWin ? 1 : 0,
        i,
        j: 0,
        dp1d: [opponentWin ? 0 : 1, rest, i],
        memo: { ...memoTable },
        activeSlot: 0,
        tag: `对手回合返回: ${opponentWin ? '对手必胜' : '对手必败 -> 我方必胜！'}`,
        log: `| ↩️ 【回溯赋值】对手在局面 ${nextStatus.toString(2).padStart(n + 1, '0')} 下${opponentWin ? '能赢' : '必输(我方胜！)'}`,
        msg: `对手回合回溯赋值：对手在选入 <code>${i}</code> 后的局面下结果为 <strong>${opponentWin ? '能赢' : '必输 (从而我方必胜！)'}</strong>。`,
      });

      if (!opponentWin) {
        ans = true;
        steps.push({
          type: 'update',
          line: lineMarkWin,
          i,
          j: 0,
          dp1d: [1, rest, i],
          memo: { ...memoTable },
          activeSlot: 0,
          tag: `选 ${i} 令对手必败 -> 当前选手胜！`,
          log: `| 🏆 【博弈致胜】选入 ${i} 导致对手必输，当前选手达成必胜策略 ans = true`,
          msg: `选择数字 <code>${i}</code> 后对手无路可走必输，因此当前选手 <strong>必胜！</strong>`,
        });

        steps.push({
          type: 'break',
          line: lineBreak,
          i,
          j: 0,
          dp1d: [1, rest, i],
          memo: { ...memoTable },
          activeSlot: 0,
          tag: '已获胜，剪枝跳出',
          log: '| ✂️ 已找到令对手必输的策略，提前 break',
          msg: '剪枝跳出：已找到致胜分支，<code>break</code> 终止遍历。',
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
      dp1d: [ans ? 1 : 0, rest],
      memo: { ...memoTable },
      activeSlot: 0,
      tag: `dp[${statusBin}] = ${ans ? '1 (必胜)' : '-1 (必败)'}`,
      log: `| 💾 【记忆化保存】记录局面 dp[${statusBin}] = ${ans ? '1(必胜)' : '-1(必败)'}`,
      msg: `保存状态：局面 <code>${statusBin}</code> 记忆化保存为 <strong>${ans ? '1 (必胜)' : '-1 (必败)'}</strong>。`,
    });

    steps.push({
      type: 'return',
      line: lineReturn,
      i: 0,
      j: 0,
      dp1d: [ans ? 1 : 0, rest],
      memo: { ...memoTable },
      activeSlot: 0,
      tag: `返回: ${ans}`,
      log: `| ⬆️ 局面 ${statusBin} 计算完毕，返回 ${ans}`,
      msg: `返回递归结果：<code>return ${ans}</code>。`,
    });

    return ans;
  }

  const finalResult = dfs(0, m);

  // 主函数收敛帧
  steps.push({
    type: 'return',
    line: lineEntry,
    i: 0,
    j: 0,
    dp1d: [finalResult ? 1 : 0],
    memo: { ...memoTable },
    activeSlot: 0,
    tag: `最终推导: 先手${finalResult ? '能赢 ✓' : '不能赢 ✗'}`,
    log: `| 🏆 推导演化完成！canIWin(n=${n}, m=${m}) = ${finalResult}`,
    msg: `🏆 状压博弈推导完成！对于规模 <code>n=${n}, m=${m}</code>，先手 <strong>${finalResult ? '必胜 (true) ✓' : '必败 (false) ✗'}</strong>。`,
  });

  return steps;
}
