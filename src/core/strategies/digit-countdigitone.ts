import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';
import { snapshotGrid2D } from './grid-snapshot';

/**
 * 数字 1 的个数 (Number of Digit One, LC 233, 左程云 84 课数位DP)
 * 经典数位动态规划记忆化搜索：
 * 状态定义：dfs(idx, count, isLimit) 表示处理到第 idx 位，已出现 count 个数字 1，
 * 是否受到原数字上界约束 isLimit。
 * 严格遵循黄金规约：
 * 1. 零跳步（Zero Step Skipping）：逐位深入发射 forward，子问题返回汇总发射 backtrack；
 * 2. 代码行零冻结（Zero Line Freezing）：精准对应阶段代码编译器中的 Java 锚点；
 * 3. 顶层控制流相位契约：深入枚举为 forward，回溯汇总与写入为 backtrack；
 * 4. 完备生命周期：entry -> convert_str -> init_len -> init_memo -> dfs_entry -> calc_up -> loop_digit -> call_dfs -> transfer -> memo_save -> return。
 */
export function compileCountDigitOne(
  _model: IYamlAlgorithmModel,
  params: StageExecutionParams
): UniversalStep[] {
  const n = Number(params.params?.n ?? 13);
  const anchorMap = params.anchorMap;

  const lineEntry = anchorMap?.entry || 2;
  const lineConvertStr = anchorMap?.convert_str || 3;
  const lineInitLen = anchorMap?.init_len || 4;
  const lineInitMemo = anchorMap?.init_memo || 5;
  const lineCallDfsRoot = anchorMap?.call_dfs_root || 7;
  const lineDfsEntry = anchorMap?.dfs_entry || 9;
  const lineBase = anchorMap?.base || 10;
  const lineMemoHit = anchorMap?.memo_hit || 11;
  const lineCalcUp = anchorMap?.calc_up || 12;
  const lineCallDfs = anchorMap?.call_dfs || 15;
  const lineMemoSave = anchorMap?.memo_save || 17;
  const lineReturn = anchorMap?.return || 18;

  const steps: UniversalStep[] = [];
  const s = String(n);
  const len = s.length;

  // memo[idx][count]: idx 范围 [0, len-1], count 范围 [0, len]
  const memo: (number | null)[][] = Array.from({ length: len }, () =>
    new Array(len + 1).fill(null)
  );

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
    tag: `countDigitOne(n=${n}) 入口`,
    log: `🎯 进入 countDigitOne：目标上界 n = ${n}`,
    msg: `主函数入口：计算在 <code>1 ~ ${n}</code> 的所有非负整数中，数字 <code>1</code> 出现的总次数。`,
    callStack: [...callStack],
  });

  // Step 1: 转为字符串数位
  steps.push({
    type: 'convert_str',
    flowPhase: 'forward',
    line: lineConvertStr,
    i: 0,
    j: 0,
    grid: snapshotGrid2D(memo),
    dp1d: s.split('').map(Number),
    memo: {},
    activeSlot: 0,
    tag: `转换为数位数组: [${s.split('').join(', ')}]`,
    log: `| 将数字 ${n} 转为十进制字符串 "${s}" (长度 len = ${len})`,
    msg: `数位分解：将整数 <code>n = ${n}</code> 转换为十进制字符串 <code>"${s}"</code>，从最高位向最低位按位记忆化搜索。`,
    callStack: [...callStack],
  });

  // Step 2: 分配记忆化表
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
    tag: `分配 memo[${len}][${len + 1}] 记忆化矩阵`,
    log: `| 分配记忆化表 memo[${len}][${len + 1}]，初始填充 -1`,
    msg: `初始化记忆化表 <code>memo[${len}][${len + 1}]</code>。其中 <code>memo[idx][count]</code> 记录在非受限状态下，从第 <code>idx</code> 位出发且已累计 <code>count</code> 个 1 时后续能贡献的总 1 次数。`,
    callStack: [...callStack],
  });

  // Step 3: 调用根层 DFS
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
    tag: `启动根递归 dfs(0, count=0, isLimit=true)`,
    log: `| 🚀 启动根数位搜索：dfs(idx=0, count=0, isLimit=true)`,
    msg: `启动 DFS：从最高位 <code>idx = 0</code> 开始，初始累计 <code>count = 0</code> 个 1，初始受上界约束 <code>isLimit = true</code>。`,
    callStack: ['dfs(0, 0, limit)'],
  });

  // 递归模拟实现
  function dfs(idx: number, count: number, isLimit: boolean): number {
    const frameName = `dfs(${idx}, cnt=${count}, ${isLimit ? 'limit' : 'free'})`;
    callStack.push(frameName);

    // DFS 入口帧
    steps.push({
      type: 'dfs_entry',
      flowPhase: 'forward',
      line: lineDfsEntry,
      i: idx < len ? idx : len - 1,
      j: Math.min(count, len),
      grid: snapshotGrid2D(memo),
      dp1d: s.split('').map(Number),
      memo: {},
      activeSlot: idx,
      tag: frameName,
      log: `| 📥 进入 ${frameName}`,
      msg: `DFS 入口：正在处理第 <code>${idx}</code> 位，当前路径已累加 <code>${count}</code> 个 '1'，受限状态：<code>isLimit = ${isLimit}</code>。`,
      callStack: [...callStack],
    });

    // 基底条件：所有数位处理完毕
    if (idx === len) {
      steps.push({
        type: 'base',
        flowPhase: 'backtrack',
        line: lineBase,
        i: len - 1,
        j: Math.min(count, len),
        grid: snapshotGrid2D(memo),
        dp1d: s.split('').map(Number),
        memo: {},
        activeSlot: idx,
        tag: `触底达成：返回当前数位累计的 1 频次 = ${count}`,
        log: `| 🏁 触底完成：所有数位构造完毕，该数字贡献 ${count} 个 1`,
        msg: `数位构造触底：<code>idx == ${len}</code>，成功构成一个完整非负整数，返回其包含的 1 的个数 <strong>${count}</strong>。`,
        callStack: [...callStack],
      });
      callStack.pop();
      return count;
    }

    // 记忆化命中（仅在不受限时有效）
    if (!isLimit && memo[idx]![count] !== null) {
      const cached = memo[idx]![count]!;
      steps.push({
        type: 'memo_hit',
        flowPhase: 'backtrack',
        line: lineMemoHit,
        i: idx,
        j: count,
        grid: snapshotGrid2D(memo),
        dp1d: s.split('').map(Number),
        memo: {},
        activeSlot: idx,
        tag: `记忆化命中: memo[${idx}][${count}] = ${cached}`,
        log: `| ⚡ 记忆化缓存命中：memo[${idx}][${count}] = ${cached}`,
        msg: `记忆化剪枝：非受限自由态下，状态 <code>(idx=${idx}, count=${count})</code> 之前已计算过，直接复用缓存值 <strong>${cached}</strong>。`,
        callStack: [...callStack],
      });
      callStack.pop();
      return cached;
    }

    const up = isLimit ? Number(s[idx]) : 9;
    steps.push({
      type: 'calc_up',
      flowPhase: 'forward',
      line: lineCalcUp,
      i: idx,
      j: count,
      grid: snapshotGrid2D(memo),
      dp1d: s.split('').map(Number),
      memo: {},
      activeSlot: idx,
      tag: `当前位可选数字: 0 .. ${up} (${isLimit ? `受限最高为 ${up}` : '自由态 0..9'})`,
      log: `| 🔢 计算上界：isLimit=${isLimit} -> 可枚举数字 d ∈ [0, ${up}]`,
      msg: `计算数位上界：由于 <code>isLimit = ${isLimit}</code>，当前位可选数字范围为 <code>[0, ${up}]</code>。`,
      callStack: [...callStack],
    });

    let ans = 0;
    for (let d = 0; d <= up; d++) {
      const nextLimit = isLimit && d === up;
      const nextCount = count + (d === 1 ? 1 : 0);

      // 枚举数字，准备调用下一层
      steps.push({
        type: 'call_dfs',
        flowPhase: 'forward',
        line: lineCallDfs,
        i: idx,
        j: count,
        grid: snapshotGrid2D(memo),
        dp1d: s.split('').map(Number),
        memo: {},
        activeSlot: idx,
        tag: `第 ${idx} 位填入 ${d} -> 递归 dfs(${idx + 1}, cnt=${nextCount}, ${nextLimit ? 'limit' : 'free'})`,
        log: `| ➡️ 第 ${idx} 位填入 ${d}，当前累计 1 个数变为 ${nextCount}，深入下一位`,
        msg: `枚举数位决策：当前第 <code>${idx}</code> 位填入数字 <strong>${d}</strong>。若 <code>d == 1</code> 则计数值加 1；递归调用子问题 <code>dfs(${idx + 1}, cnt=${nextCount}, limit=${nextLimit})</code>。`,
        callStack: [...callStack],
      });

      const subResult = dfs(idx + 1, nextCount, nextLimit);
      ans += subResult;

      // 子问题回溯返回，累加方案
      steps.push({
        type: 'transfer',
        flowPhase: 'backtrack',
        line: lineCallDfs,
        i: idx,
        j: count,
        grid: snapshotGrid2D(memo),
        dp1d: s.split('').map(Number),
        memo: {},
        activeSlot: idx,
        tag: `填入 ${d} 子树回溯：子树贡献 ${subResult}，本层累计 ans = ${ans}`,
        log: `| ⬅️ 子递归返回：分支 d=${d} 贡献 ${subResult} 个 1，本层 ans 累加为 ${ans}`,
        msg: `数位回溯闭环：子分支 <code>d = ${d}</code> 探索完毕，带来 <strong>${subResult}</strong> 个符合条件的 1。本层方案数累加至 <code>ans = ${ans}</code>。`,
        callStack: [...callStack],
      });
    }

    if (!isLimit) {
      memo[idx]![count] = ans;
      steps.push({
        type: 'memo_save',
        flowPhase: 'backtrack',
        line: lineMemoSave,
        i: idx,
        j: count,
        grid: snapshotGrid2D(memo),
        dp1d: s.split('').map(Number),
        memo: {},
        activeSlot: idx,
        tag: `记忆化保存: memo[${idx}][${count}] = ${ans}`,
        log: `| 💾 保存记忆化：memo[${idx}][${count}] = ${ans}`,
        msg: `记录记忆化：自由状态 <code>(idx=${idx}, count=${count})</code> 求解完毕，将结果 <strong>${ans}</strong> 写入缓存表。`,
        callStack: [...callStack],
      });
    }

    steps.push({
      type: 'return',
      flowPhase: 'backtrack',
      line: lineReturn,
      i: idx,
      j: count,
      grid: snapshotGrid2D(memo),
      dp1d: s.split('').map(Number),
      memo: {},
      activeSlot: idx,
      tag: `返回第 ${idx} 位总贡献: ${ans}`,
      log: `| 📤 退出 ${frameName}，返回 ${ans}`,
      msg: `本层求解完毕：返回第 <code>${idx}</code> 位出发的总贡献 <strong>${ans}</strong>。`,
      callStack: [...callStack],
    });

    callStack.pop();
    return ans;
  }

  const finalTotal = dfs(0, 0, true);

  // 最终主函数返回帧
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
    tag: `🎉 统计完成！1 到 ${n} 中数字 1 一共出现 ${finalTotal} 次`,
    log: `🏆 countDigitOne 计算圆满完成：答案为 ${finalTotal}`,
    msg: `全局求解完成：在 <code>1 ~ ${n}</code> 范围内，所有整数的十进制表示中共计包含 <strong>${finalTotal}</strong> 个数字 <code>1</code>。`,
    callStack: [],
  });

  return steps;
}
