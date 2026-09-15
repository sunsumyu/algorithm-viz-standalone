import { describe, it, expect } from 'vitest';
import { VariableContextResolver } from '../variable-context-resolver';
import { captureScope } from './scope-capture';

describe('全项目全自动变量捕获与智能求值引擎 (Universal VarScopeTracer Engine) 门禁测试', () => {
  it('应当能从仅包含 curL, curR, s 的老旧 step 中无损解析 l, r, n, s (等价类映射与环境派生)', () => {
    const legacyStep = {
      curL: 1,
      curR: 3,
      s: 'bbbab',
      decision: '正在比对 s[1] 与 s[3]',
    };

    const varsMap = VariableContextResolver.resolve(legacyStep, 'java');

    // 1. 基础存在性
    expect(varsMap.has('curL')).toBe(true);
    expect(varsMap.has('curR')).toBe(true);
    expect(varsMap.has('s')).toBe(true);

    // 2. 自动派生 n = s.length
    expect(varsMap.get('n')?.value).toBe('5');

    // 3. 跨算法语义等价类映射查询：查询 'l'，自动映射到 curL
    const varL = VariableContextResolver.getVariable(varsMap, 'l', legacyStep);
    expect(varL).toBeDefined();
    expect(varL?.value).toBe('1');

    // 4. 查询 'r'，自动映射到 curR
    const varR = VariableContextResolver.getVariable(varsMap, 'r', legacyStep);
    expect(varR).toBeDefined();
    expect(varR?.value).toBe('3');

    // 5. 复合下标求值：s[l] 或 s.charAt(l)
    const charL = VariableContextResolver.getVariable(varsMap, 's[l]', legacyStep);
    expect(charL).toBeDefined();
    expect(charL?.value).toBe("'b'");
  });

  it('应当支持显式 captureScope (优先级 0 覆盖)', () => {
    const scope = captureScope({
      l: 2,
      r: 4,
      len: 3,
      n: 5,
      s: 'bbbab',
      dp: [[1, 2], [3, 4]],
    });

    const step = {
      curL: 99, // 故意设置不一致的旧属性
      scope,
      decision: 'test scope priority',
    };

    const varsMap = VariableContextResolver.resolve(step, 'java');
    // 优先级 0 的 scope.l 应该直接生效
    const varL = VariableContextResolver.getVariable(varsMap, 'l', step);
    expect(varL?.value).toBe('2');
    expect(varsMap.get('len')?.value).toBe('3');
    expect(varsMap.get('n')?.value).toBe('5');
  });

  it('应当能从纯文本 decision/log 中自动反向挖掘出变量 (即使未在 step 对象顶层声明)', () => {
    const textOnlyStep = {
      currentCell: 'l=3, r=4',
      decision: '外层循环判定：for l = 3; l >= 0 成立；len = 2',
      log: 'innerLoop: r = 4',
    };

    const varsMap = VariableContextResolver.resolve(textOnlyStep, 'java');

    const varL = VariableContextResolver.getVariable(varsMap, 'l', textOnlyStep);
    expect(varL).toBeDefined();
    expect(varL?.value).toBe('3');

    const varR = VariableContextResolver.getVariable(varsMap, 'r', textOnlyStep);
    expect(varR).toBeDefined();
    expect(varR?.value).toBe('4');

    const varLen = VariableContextResolver.getVariable(varsMap, 'len', textOnlyStep);
    expect(varLen).toBeDefined();
    expect(varLen?.value).toBe('2');
  });

  it('应当支持二维矩阵 dp[l][r] 的动态计算与详情呈现', () => {
    const dpMatrix = [
      [1, 2, 3],
      [null, 1, 4],
      [null, null, 1],
    ];

    const step = {
      curL: 1,
      curR: 2,
      s: 'aba',
      dpTable: dpMatrix,
    };

    const varsMap = VariableContextResolver.resolve(step, 'java');

    // 悬停在 dp 变量上时，如果有 l, r 上下文，应输出 dp[1][2] 的单元格值
    const varDp = VariableContextResolver.getVariable(varsMap, 'dp', step);
    expect(varDp).toBeDefined();
    expect(varDp?.detail).toContain('dp[1][2] = 4');

    // 直接查询表达式 dp[l][r]
    const exprDp = VariableContextResolver.getVariable(varsMap, 'dp[l][r]', step);
    expect(exprDp).toBeDefined();
    expect(exprDp?.value).toBe('4');
  });

  it('应当支持双字符串 LCS / 编辑距离类算法的 m, n 自动派生', () => {
    const lcsStep = {
      s1: 'abcde',
      s2: 'ace',
      i: 2,
      j: 1,
    };

    const varsMap = VariableContextResolver.resolve(lcsStep, 'java');
    expect(varsMap.get('m')?.value).toBe('5');
    expect(varsMap.get('n')?.value).toBe('3');
    expect(varsMap.get('i')?.value).toBe('2');
    expect(varsMap.get('j')?.value).toBe('1');
  });

  it('应当对用户遇到的区间内层循环场景，自动由 (curL, curR) 三元推导出 len 并提供行末调试提示', () => {
    // 模拟截图真实场景：进入 for (int l = 0; l <= n - len; l++) 时 l = 2, r = 3, s = 'bbbab'
    const step = {
      curL: 2,
      curR: 3,
      s: 'bbbab',
      decision: '内层循环：考察起点 l = 2，计算右端点 r = l + len - 1 = 3',
    };

    const varsMap = VariableContextResolver.resolve(step, 'java');

    // 1. 验证 len 自动被推导出来 (3 - 2 + 1 = 2)
    const varLen = VariableContextResolver.getVariable(varsMap, 'len', step);
    expect(varLen).toBeDefined();
    expect(varLen?.value).toBe('2');

    // 2. 验证 l 和 n 同时存在
    expect(VariableContextResolver.getVariable(varsMap, 'l', step)?.value).toBe('2');
    expect(VariableContextResolver.getVariable(varsMap, 'n', step)?.value).toBe('5');

    // 3. 验证当前行代码生成行末提示时包含 len
    const lineCode = 'for (int l = 0; l <= n - len; l++) {';
    const inlineSummary = VariableContextResolver.formatInlineSummary(varsMap, lineCode);
    expect(inlineSummary).toContain('l: 2');
    expect(inlineSummary).toContain('n: 5');
    expect(inlineSummary).toContain('len: 2');
  });
});
