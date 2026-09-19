import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';

/**
 * 划分为 k 个相等的子集 (Partition to K Equal Sum Subsets, LC 698, 左程云 80 课)
 * 状态压缩 DP 经典题
 * 严格遵循黄金规约：
 * 1. 零跳步（Zero Step Skipping）：放入数字前发射 branch-call，进入递归发射 dfs_entry；
 * 2. 调用-返回物理闭环（Call-Return Parity）：子递归返回后发射 branch-return 回溯赋值闭环；
 * 3. 完备生命周期：entry -> calc_sum -> guard_sum -> calc_target -> sort -> init -> start_dfs -> dfs_entry -> boundary -> cache_hit -> loop_num -> cond_fit -> branch_call -> branch_return -> record -> return。
 */
export function compilePartitionK(
  _model: IYamlAlgorithmModel,
  params: StageExecutionParams
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const anchorMap = params.anchorMap;

  let nums: number[];
  const raw = params.params?.nums;
  if (Array.isArray(raw)) {
    nums = raw.map(Number);
  } else if (typeof raw === 'string') {
    nums = raw
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
  } else {
    nums = [4, 3, 2, 3, 5, 2, 1];
  }
  const k = Number(params.params?.k) || 4;

  const lineEntry = anchorMap?.entry || 2;
  const lineCalcSum = anchorMap?.calc_sum || 4;
  const lineGuardSum = anchorMap?.guard_sum || 5;
  const lineCalcTarget = anchorMap?.calc_target || 6;
  const lineSort = anchorMap?.sort || 7;
  const lineInit = anchorMap?.init || 8;
  const lineStartDfs = anchorMap?.start_dfs || 9;
  const lineDfsEntry = anchorMap?.dfs_entry || 11;
  const lineBoundary = anchorMap?.boundary || 12;
  const lineCacheHit = anchorMap?.cache_hit || 13;
  const lineInitAns = anchorMap?.init_ans || 14;
  const lineLoopNum = anchorMap?.loop_num || 15;
  const lineCondFit = anchorMap?.cond_fit || 16;
  const lineCalcNext = anchorMap?.calc_next || 17;
  const lineBranchCall = anchorMap?.branch_call || 18;
  const lineMarkWin = anchorMap?.mark_win || 19;
  const lineBreak = anchorMap?.break || 20;
  const lineRecord = anchorMap?.record || 24;
  const lineReturn = anchorMap?.return || 25;

  const n = nums.length;

  // Step 0: 主入口
  steps.push({
    type: 'entry',
    line: lineEntry,
    i: 0,
    j: 0,
    dp1d: [0],
    memo: {},
    activeSlot: 0,
    tag: `canPartitionKSubsets(k=${k}) 入口`,
    log: `🌲 进入 canPartitionKSubsets：数组 [${nums.join(', ')}]，目标分为 ${k} 个等和子集`,
    msg: `主函数入口：考察数组 <code>[${nums.join(', ')}]</code>，判定能否划分为 <code>${k}</code> 个等和子集。`,
  });

  // Step 1: 计算总和
  const sum = nums.reduce((a, b) => a + b, 0);
  steps.push({
    type: 'update',
    line: lineCalcSum,
    i: 0,
    j: 0,
    dp1d: [sum],
    memo: {},
    activeSlot: 0,
    tag: `元素总和: ${sum}`,
    log: `| 📏 累加总和 sum = ${sum}`,
    msg: `元素总和为 <code>sum = ${sum}</code>。`,
  });

  // Step 2: 整除判断
  if (sum % k !== 0) {
    steps.push({
      type: 'return',
      line: lineGuardSum,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: {},
      activeSlot: 0,
      tag: `总和 ${sum} 不能被 k=${k} 整除 -> false`,
      log: `| 🛑 总和 ${sum} 不是 k=${k} 的倍数，无法均分，返回 false`,
      msg: `边界特判：总和 <code>${sum} % ${k} != 0</code>，无法分为 ${k} 个等和子集，返回 <strong>false</strong>。`,
    });
    return steps;
  }

  // Step 3: 计算目标每组和
  const target = sum / k;
  steps.push({
    type: 'update',
    line: lineCalcTarget,
    i: 0,
    j: 0,
    dp1d: [sum, target],
    memo: {},
    activeSlot: 0,
    tag: `每组目标和 target = ${target}`,
    log: `| 📐 每组目标和 target = ${sum} / ${k} = ${target}`,
    msg: `计算目标子集和：<code>target = ${sum} / ${k} = <strong>${target}</strong></code>。`,
  });

  // Step 4: 排序
  nums.sort((a, b) => a - b);
  steps.push({
    type: 'update',
    line: lineSort,
    i: 0,
    j: 0,
    dp1d: [sum, target],
    memo: {},
    activeSlot: 0,
    tag: `数组排序: [${nums.join(', ')}]`,
    log: `| 📊 数组升序排序完成: [${nums.join(', ')}]`,
    msg: `对数组排序：<code>[${nums.join(', ')}]</code>。`,
  });

  if (nums[n - 1] > target) {
    steps.push({
      type: 'return',
      line: lineGuardSum,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: {},
      activeSlot: 0,
      tag: `最大值 ${nums[n - 1]} > target(${target}) -> false`,
      log: `| 🛑 最大值 ${nums[n - 1]} 大于每组目标和 ${target}，无法放入任何组，返回 false`,
      msg: `剪枝特判：最大值 <code>${nums[n - 1]} > ${target}</code>，直接返回 <strong>false</strong>。`,
    });
    return steps;
  }

  // Step 5: 初始化记忆化表
  const memoTable: Record<string, number> = {};
  steps.push({
    type: 'init',
    line: lineInit,
    i: 0,
    j: 0,
    dp1d: [0, target],
    memo: {},
    activeSlot: 0,
    tag: `初始化状压 DP 表 (2^${n} = ${1 << n})`,
    log: `| 💾 初始化状压 DP 表：大小 2^${n} = ${1 << n}`,
    msg: `初始化状压记忆化表 <code>dp = new int[1 << ${n}]</code>。`,
  });

  // Step 6: 启动递归
  steps.push({
    type: 'call',
    line: lineStartDfs,
    i: 0,
    j: 0,
    dp1d: [0, target],
    memo: {},
    activeSlot: 0,
    tag: '启动 dfs(status=0, cur=0)',
    log: '| 🚀 启动记忆化搜索：dfs(status=0, cur=0)',
    msg: '调用辅助递归函数：<code>dfs(status=0, cur=0)</code>。',
  });

  let stepCount = 0;
  const maxSteps = 80;
  const targetFull = (1 << n) - 1;

  function dfs(status: number, cur: number): boolean {
    const statusBin = status.toString(2).padStart(n, '0');

    if (status === targetFull) {
      steps.push({
        type: 'boundary',
        line: lineBoundary,
        i: 0,
        j: 0,
        dp1d: [1, cur, target],
        memo: { ...memoTable },
        activeSlot: 0,
        tag: `所有元素已分配 (status=${statusBin}) -> true`,
        log: `| 🏆 【边界出口】所有元素分配完毕，${k} 个等和子集构造成功！返回 true`,
        msg: `边界条件满足：所有元素分配完毕（<code>status == (1 << n) - 1</code>），<strong>成功划分！</strong>`,
      });
      return true;
    }

    if (memoTable[status] !== undefined) {
      const cached = memoTable[status] === 1;
      steps.push({
        type: 'cache_hit',
        line: lineCacheHit,
        i: 0,
        j: 0,
        dp1d: [cached ? 1 : 0, cur, target],
        memo: { ...memoTable },
        activeSlot: 0,
        tag: `缓存命中: 状态[${statusBin}] -> ${cached ? '可行' : '不可行'}`,
        log: `| ⚡ 【缓存命中】状压状态 ${statusBin} 已推导过，返回 ${cached ? 'true' : 'false'}`,
        msg: `记忆化缓存命中：状态 <code>${statusBin}</code> 结果为 <strong>${cached ? '可行' : '不可行'}</strong>。`,
      });
      return cached;
    }

    steps.push({
      type: 'entry',
      line: lineDfsEntry,
      i: 0,
      j: 0,
      dp1d: [0, cur, target],
      memo: { ...memoTable },
      activeSlot: 0,
      tag: `进入递归 dfs(status=${statusBin}, cur=${cur})`,
      log: `| 📥 【递归帧】考察状压状态 status=${statusBin}，当前子集已凑 ${cur}/${target}`,
      msg: `进入递归函数：状态 <code>${statusBin}</code>，当前子集已凑 <code>${cur}/${target}</code>。`,
    });

    steps.push({
      type: 'update',
      line: lineInitAns,
      i: 0,
      j: 0,
      dp1d: [0, cur, target],
      memo: { ...memoTable },
      activeSlot: 0,
      tag: 'ans = false',
      log: '| 📍 初始化 ans = false',
      msg: '初始化当前局面可行性：<code>ans = false</code>。',
    });

    let ans = false;

    for (let i = n - 1; i >= 0; i--) {
      if (stepCount >= maxSteps) break;

      steps.push({
        type: 'loop',
        line: lineLoopNum,
        i,
        j: nums[i],
        dp1d: [ans ? 1 : 0, cur, nums[i]],
        memo: { ...memoTable },
        activeSlot: 0,
        tag: `尝试数字 #${i}(值${nums[i]})`,
        log: `| 🔄 检查元素 #${i} (值=${nums[i]})`,
        msg: `尝试元素 <strong>#${i} (值 ${nums[i]})</strong>。`,
      });

      const isUsed = (status & (1 << i)) !== 0;
      if (isUsed || cur + nums[i] > target) {
        continue;
      }

      steps.push({
        type: 'cond',
        line: lineCondFit,
        i,
        j: nums[i],
        dp1d: [ans ? 1 : 0, cur, nums[i]],
        memo: { ...memoTable },
        activeSlot: 0,
        tag: `元素#${i}可加入 (加入后和 ${cur + nums[i]} <= ${target})`,
        log: `| 🟢 元素 #${i} 未使用且可加入当前子集: ${cur} + ${nums[i]} = ${cur + nums[i]} <= ${target}`,
        msg: `条件满足：元素 <strong>#${i} (值 ${nums[i]})</strong> 可以加入当前子集。`,
      });

      const nextCur = (cur + nums[i]) % target;
      steps.push({
        type: 'update',
        line: lineCalcNext,
        i,
        j: nextCur,
        dp1d: [ans ? 1 : 0, nextCur, target],
        memo: { ...memoTable },
        activeSlot: 0,
        tag: `下一子集进度: nextCur = ${nextCur} ${nextCur === 0 ? '(该子集凑满！开启下一子集)' : ''}`,
        log: `| 📐 计算下一子集已凑和: (${cur} + ${nums[i]}) % ${target} = ${nextCur}`,
        msg: `计算子集进度：<code>nextCur = (${cur} + ${nums[i]}) % ${target} = <strong>${nextCur}</strong></code> ${nextCur === 0 ? '（🎉 当前子集凑满，开始下一子集！）' : ''}。`,
      });

      // Zero Step Skipping 拦截帧 (branch-call)
      const nextStatus = status | (1 << i);
      steps.push({
        type: 'branch-call',
        line: lineBranchCall,
        branchType: 'diag',
        varName: 'sub',
        i,
        j: nums[i],
        dp1d: [0, nextCur, target],
        memo: { ...memoTable },
        activeSlot: 0,
        tag: `加入元素#${i} -> dfs(status|${1 << i}, nextCur=${nextCur})`,
        log: `| 🌿 【分支深入】加入元素 #${i}，深入状态: status=${nextStatus.toString(2).padStart(n, '0')}, cur=${nextCur}`,
        msg: `加入元素 <strong>#${i} (值 ${nums[i]})</strong>，深入下一层状压搜索。`,
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
        j: nums[i],
        dp1d: [subResult ? 1 : 0, cur, target],
        memo: { ...memoTable },
        activeSlot: 0,
        tag: `子递归返回: ${subResult ? '成功' : '失败 (需回溯撤出元素)'}`,
        log: `| ↩️ 【回溯赋值】加入元素 #${i} 后续结果为: ${subResult ? '可行' : '不可行'}`,
        msg: `子递归返回赋值：加入元素 <code>#${i}</code> 后的方案为 <strong>${subResult ? '可行 ✓' : '失败 ✗ (回溯取出)'}</strong>。`,
      });

      if (subResult) {
        ans = true;
        steps.push({
          type: 'update',
          line: lineMarkWin,
          i,
          j: 0,
          dp1d: [1, cur, target],
          memo: { ...memoTable },
          activeSlot: 0,
          tag: '成功划分，ans = true',
          log: '| 🏆 找到有效划分组合，标记 ans = true',
          msg: '找到合法划分方案：<code>ans = true</code>。',
        });

        steps.push({
          type: 'break',
          line: lineBreak,
          i,
          j: 0,
          dp1d: [1, cur, target],
          memo: { ...memoTable },
          activeSlot: 0,
          tag: '提前 break 剪枝',
          log: '| ✂️ 已成功，无需遍历剩余元素，提前 break',
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
      dp1d: [ans ? 1 : 0, cur, target],
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
      dp1d: [ans ? 1 : 0, cur, target],
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
    tag: `最终结果: ${finalResult ? '能划分为 ' + k + ' 个等和子集 ✓' : '不能划分 ✗'}`,
    log: `| 🏆 状压推导演化完成！canPartitionKSubsets = ${finalResult}`,
    msg: `🏆 状态压缩推导完成！数组 <strong>${finalResult ? `能够划分为 ${k} 个等和子集 (true) ✓` : `无法划分为 ${k} 个等和子集 (false) ✗`}</strong>。`,
  });

  return steps;
}
