import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';
import { snapshotGrid2D } from './grid-snapshot';

/**
 * 不含连续 1 的非负整数 (Non-negative Integers without Consecutive Ones, LC 600, 左程云 85 课数位DP)
 * 二进制数位动态规划记忆化搜索：
 * 状态定义：dfs(idx, pre, isLimit) 表示处理到第 idx 个二进制位，前一位填写的值为 pre (0 或 1)，
 * 是否受到原数字二进制上界约束 isLimit。
 * 严格遵循黄金规约：
 * 1. 零跳步（Zero Step Skipping）：深入二进制位枚举发射 forward，回溯时发射 backtrack；
 * 2. 代码行零冻结（Zero Line Freezing）：精准绑定 Java 代码模板锚点；
 * 3. 冲突剪枝可视化：连续 1 冲突时精准高亮并触发跳过；
 * 4. 完备生命周期：entry -> convert_binary -> init_len -> init_memo -> dfs_entry -> calc_up -> check_consecutive -> call_dfs -> transfer -> memo_save -> return。
 */
export function compileNonNegativeConsecutiveOnes(
  _model: IYamlAlgorithmModel,
  params: StageExecutionParams
): UniversalStep[] {
  const n = Number(params.params?.n ?? 5);
  const anchorMap = params.anchorMap;

  const lineEntry = anchorMap?.entry || 2;
  const lineConvertBinary = anchorMap?.convert_binary || 3;
  const lineInitLen = anchorMap?.init_len || 4;
  const lineInitMemo = anchorMap?.init_memo || 5;
  const lineCallDfsRoot = anchorMap?.call_dfs_root || 7;
  const lineDfsEntry = anchorMap?.dfs_entry || 9;
  const lineBase = anchorMap?.base || 10;
  const lineMemoHit = anchorMap?.memo_hit || 11;
  const lineCalcUp = anchorMap?.calc_up || 12;
  const lineLoopDigit = anchorMap?.loop_digit || 14;
  const lineCheckConsecutive = anchorMap?.check_consecutive || 15;
  const lineCallDfs = anchorMap?.call_dfs || 16;
  const lineMemoSave = anchorMap?.memo_save || 18;
  const lineReturn = anchorMap?.return || 19;

  const steps: UniversalStep[] = [];
  const s = n.toString(2); // 转为二进制字符串
  const len = s.length;

  // memo[idx][pre]: idx ∈ [0, len-1], pre ∈ [0, 1]
  const memo: (number | null)[][] = Array.from({ length: len }, () => [null, null]);
  const callStack: string[] = [];

  // Step 0: 主函数入口
  steps.push({
    type: 'entry',
    flowPhase: 'forward',
    line: lineEntry,
    i: 0,
    j: 0,
    grid: snapshotGrid2D(memo),
    dp1d: [n],
    memo: {},
    activeSlot: 0,
    tag: `findIntegers(n=${n}) 入口`,
    log: `🎯 进入 findIntegers：统计 [0, ${n}] 中不含连续 1 的非负整数个数`,
    msg: `主函数入口：给定正整数 <code>n = ${n}</code>，求 <code>[0, ${n}]</code> 范围内二进制无连续 1 的整数个数。`,
    callStack: [...callStack],
  });

  // Step 1: 二进制转换
  steps.push({
    type: 'convert_binary',
    flowPhase: 'forward',
    line: lineConvertBinary,
    i: 0,
    j: 0,
    grid: snapshotGrid2D(memo),
    dp1d: s.split('').map(Number),
    memo: {},
    activeSlot: 0,
    tag: `转换为二进制: "${s}" (${len} 位)`,
    log: `| 将 ${n} 转换为二进制表示 "${s}" (最高有效位长度 len = ${len})`,
    msg: `二进制分解：<code>${n} = (${s})_2</code>，从最高位（下标 0）向最低位进行二进制数位搜索。`,
    callStack: [...callStack],
  });

  // Step 2: 初始化记忆化数组
  steps.push({
    type: 'init_memo',
    flowPhase: 'forward',
    line: lineInitMemo,
    i: 0,
    j: 0,
    grid: snapshotGrid2D(memo),
    dp1d: s.split('').map(Number),
    memo: {},
    activeSlot: 0,
    tag: `初始化 memo[${len}][2] 二进制记忆化矩阵`,
    log: `| 分配记忆化表 memo[${len}][2]，初始填充 -1`,
    msg: `初始化记忆化数组 <code>memo[${len}][2]</code>。<code>memo[idx][pre]</code> 记录在无上界约束时，当前处理第 <code>idx</code> 位且前一位为 <code>pre</code> 时后续合法整数个数。`,
    callStack: [...callStack],
  });

  // Step 3: 调用根 DFS
  steps.push({
    type: 'call_dfs_root',
    flowPhase: 'forward',
    line: lineCallDfsRoot,
    i: 0,
    j: 0,
    grid: snapshotGrid2D(memo),
    dp1d: s.split('').map(Number),
    memo: {},
    activeSlot: 0,
    tag: `启动根递归 dfs(idx=0, pre=0, isLimit=true)`,
    log: `| 🚀 启动根数位搜索：dfs(0, pre=0, isLimit=true)`,
    msg: `启动 DFS 递归：从最高位 <code>idx = 0</code> 出发，前驱位默认 <code>pre = 0</code>，初始受上限约束 <code>isLimit = true</code>。`,
    callStack: ['dfs(0, pre=0, limit)'],
  });

  // 递归模拟实现
  function dfs(idx: number, pre: number, isLimit: boolean): number {
    const frameName = `dfs(${idx}, pre=${pre}, ${isLimit ? 'limit' : 'free'})`;
    callStack.push(frameName);

    // DFS 入口帧
    steps.push({
      type: 'dfs_entry',
      flowPhase: 'forward',
      line: lineDfsEntry,
      i: idx < len ? idx : len - 1,
      j: pre,
      grid: snapshotGrid2D(memo),
      dp1d: s.split('').map(Number),
      memo: {},
      activeSlot: idx,
      tag: frameName,
      log: `| 📥 进入 ${frameName}`,
      msg: `DFS 入口：处理第 <code>${idx}</code> 位，前一位填 <code>${pre}</code>，受限状态：<code>isLimit = ${isLimit}</code>。`,
      callStack: [...callStack],
    });

    // 基底条件：所有二进制位均成功构造
    if (idx === len) {
      steps.push({
        type: 'base',
        flowPhase: 'backtrack',
        line: lineBase,
        i: len - 1,
        j: pre,
        grid: snapshotGrid2D(memo),
        dp1d: s.split('').map(Number),
        memo: {},
        activeSlot: idx,
        tag: '触底成功：发现 1 个合法二进制整数，返回 1',
        log: '| 🏁 触底完成：成功构造出 1 个合法无连续 1 的整数，返回 1',
        msg: `构造完成：<code>idx == ${len}</code>，成功生成 1 个合法无连续 1 的非负整数，返回 <strong>1</strong>。`,
        callStack: [...callStack],
      });
      callStack.pop();
      return 1;
    }

    // 记忆化命中
    if (!isLimit && memo[idx]![pre] !== null) {
      const cached = memo[idx]![pre]!;
      steps.push({
        type: 'memo_hit',
        flowPhase: 'backtrack',
        line: lineMemoHit,
        i: idx,
        j: pre,
        grid: snapshotGrid2D(memo),
        dp1d: s.split('').map(Number),
        memo: {},
        activeSlot: idx,
        tag: `记忆化命中: memo[${idx}][${pre}] = ${cached}`,
        log: `| ⚡ 记忆化缓存命中：memo[${idx}][${pre}] = ${cached}`,
        msg: `记忆化剪枝：非受限自由态下，状态 <code>(idx=${idx}, pre=${pre})</code> 已被计算过，直接返回缓存值 <strong>${cached}</strong>。`,
        callStack: [...callStack],
      });
      callStack.pop();
      return cached;
    }

    const up = isLimit ? Number(s[idx]) : 1;
    steps.push({
      type: 'calc_up',
      flowPhase: 'forward',
      line: lineCalcUp,
      i: idx,
      j: pre,
      grid: snapshotGrid2D(memo),
      dp1d: s.split('').map(Number),
      memo: {},
      activeSlot: idx,
      tag: `当前位可选二进制位: 0 .. ${up}`,
      log: `| 🔢 计算上界：isLimit=${isLimit} -> 当前位可枚举 d ∈ [0, ${up}]`,
      msg: `计算二进制上界：由于 <code>isLimit = ${isLimit}</code>，当前位最高可填 <code>${up}</code>。`,
      callStack: [...callStack],
    });

    let ans = 0;
    for (let d = 0; d <= up; d++) {
      // 连续 1 冲突剪枝
      if (pre === 1 && d === 1) {
        steps.push({
          type: 'check_consecutive',
          flowPhase: 'forward',
          line: lineCheckConsecutive,
          i: idx,
          j: pre,
          grid: snapshotGrid2D(memo),
          dp1d: s.split('').map(Number),
          memo: {},
          activeSlot: idx,
          tag: `⚠️ 触发连续 1 剪枝！pre=1 且当前位 d=1，剪枝跳过`,
          log: `| 🛑 发现连续 1 冲突 (pre=1, d=1)，立即剪枝放弃该分支`,
          msg: `连续 1 冲突：前一位 <code>pre = 1</code> 且当前准备填入 <code>d = 1</code>，违反“不含连续 1”约束，剪枝跳过！`,
          callStack: [...callStack],
        });
      continue;
    }

    const nextLimit = isLimit && d === up;
    steps.push({
      type: 'call_dfs',
      flowPhase: 'forward',
      line: lineCallDfs,
      i: idx,
      j: pre,
      grid: snapshotGrid2D(memo),
      dp1d: s.split('').map(Number),
      memo: {},
      activeSlot: idx,
      tag: `第 ${idx} 位填入 ${d} -> 递归 dfs(${idx + 1}, pre=${d}, ${nextLimit ? 'limit' : 'free'})`,
      log: `| ➡️ 第 ${idx} 位填入 ${d}，合法无冲突，深入下一位`,
      msg: `合法数位填充：当前位填入 <strong>${d}</strong>，无连续 1 冲突。递归进入子问题 <code>dfs(${idx + 1}, pre=${d}, limit=${nextLimit})</code>。`,
      callStack: [...callStack],
    });

    const subResult = dfs(idx + 1, d, nextLimit);
    ans += subResult;

    // 回溯汇总
    steps.push({
      type: 'transfer',
      flowPhase: 'backtrack',
      line: lineCallDfs,
      i: idx,
      j: pre,
      grid: snapshotGrid2D(memo),
      dp1d: s.split('').map(Number),
      memo: {},
      activeSlot: idx,
      tag: `填入 ${d} 子树回溯：子树贡献 ${subResult}，累计 ans = ${ans}`,
      log: `| ⬅️ 子递归返回：分支 d=${d} 贡献 ${subResult} 个合法解，本层 ans = ${ans}`,
      msg: `数位回溯闭环：分支 <code>d = ${d}</code> 探索完毕，贡献 <strong>${subResult}</strong> 个合法非负整数。本层累计达 <code>ans = ${ans}</code>。`,
      callStack: [...callStack],
    });
  }

  if (!isLimit) {
    memo[idx]![pre] = ans;
    steps.push({
      type: 'memo_save',
      flowPhase: 'backtrack',
      line: lineMemoSave,
      i: idx,
      j: pre,
      grid: snapshotGrid2D(memo),
      dp1d: s.split('').map(Number),
      memo: {},
      activeSlot: idx,
      tag: `记忆化保存: memo[${idx}][${pre}] = ${ans}`,
      log: `| 💾 保存记忆化：memo[${idx}][${pre}] = ${ans}`,
      msg: `记录记忆化：自由状态 <code>(idx=${idx}, pre=${pre})</code> 结果为 <strong>${ans}</strong>，写入缓存。`,
      callStack: [...callStack],
    });
  }

  steps.push({
    type: 'return',
    flowPhase: 'backtrack',
    line: lineReturn,
    i: idx,
    j: pre,
    grid: snapshotGrid2D(memo),
    dp1d: s.split('').map(Number),
    memo: {},
    activeSlot: idx,
    tag: `返回第 ${idx} 位总合法数: ${ans}`,
    log: `| 📤 退出 ${frameName}，返回 ${ans}`,
    msg: `本层求解完毕：返回当前位出发的总合法整数数 <strong>${ans}</strong>。`,
    callStack: [...callStack],
  });

  callStack.pop();
  return ans;
}

const finalTotal = dfs(0, 0, true);

// 主函数最终返回帧
steps.push({
  type: 'return',
  flowPhase: 'backtrack',
  line: lineReturn,
  i: 0,
  j: 0,
  grid: snapshotGrid2D(memo),
  dp1d: [finalTotal],
  memo: {},
  activeSlot: 0,
  tag: `🎉 统计完成！[0, ${n}] 中不含连续 1 的整数共有 ${finalTotal} 个`,
  log: `🏆 findIntegers 计算圆满完成：答案为 ${finalTotal}`,
  msg: `全局求解完成：在 <code>[0, ${n}]</code> 范围内，二进制表示中不含连续 1 的整数共有 <strong>${finalTotal}</strong> 个。`,
  callStack: [],
});

return steps;
}
