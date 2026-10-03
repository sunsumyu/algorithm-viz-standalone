# 自动化测试约束、标准代码模板与提交前 Checklist

## 7. 全量排查与 Vitest 自动化约束规范

### 7.1 严禁单点修改，贯彻全量核验原则
- 当用户或测试报告指出某个算法存在缺陷（如某行号错位、某步跳过）时，**绝不允许仅仅修复那一个文件就宣布完工**！
- 必须：
  1. 使用全局检索工具（`grep_search`）扫描所有同类算法、同组模块。
  2. 逐一比对排查同款缺陷。
  3. 执行全量测试套件（如 `npx vitest run src/algorithms/categories/...`）。

### 7.2 Vitest 自动化防退化机械约束
每个算法的 `*.test.ts` 中必须包含三大黄金防退化断言：
1. **入口帧验证**：`steps[0]` 必须是 `entry` 或主函数签名行。
2. **四语言行号合法性断言**：遍历所有 step，其 `codeLine` 在 Java、C++、Python、JavaScript 中必须全部落在 `[1, codeArray.length]` 之内。
3. **关键变量演化断言**：断言最终返回值与最终步的 `decision` / `metrics` 严格一致。

```typescript
describe('代码联动与生命周期规范核验', () => {
  it('Step 0 必须为函数入口且行号不越界', () => {
    const steps = buildAlgorithmSteps(testInputs);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toMatch(/(入口|初始化|开始)/);

    for (const step of steps) {
      const lineMap = step.codeLine as Record<string, number>;
      for (const [lang, line] of Object.entries(lineMap)) {
        const codeArray = CODE_LANGUAGES[lang];
        expect(line, `语言 ${lang} 行号 ${line} 超界 [1, ${codeArray.length}]`).toBeGreaterThanOrEqual(1);
        expect(line, `语言 ${lang} 行号 ${line} 超界 [1, ${codeArray.length}]`).toBeLessThanOrEqual(codeArray.length);
      }
    }
  });
});
```

---

## 8. 标准生产模板与提交前 Checklist

### 8.1 标准 TypeScript 步进生成器骨架
```typescript
export function buildStandardAlgorithmSteps(inputs: Record<string, any>): AlgoStep[] {
  const { n, items } = parseInputs(inputs);
  const steps: AlgoStep[] = [];

  // 1. 各语言 1-based 相对行号字典
  const lines = {
    entry:     { java: 2, cpp: 2, python: 2, javascript: 2 },
    guard:     { java: 3, cpp: 3, python: 3, javascript: 3 },
    initDp:    { java: 5, cpp: 4, python: 4, javascript: 4 },
    outerLoop: { java: 6, cpp: 5, python: 5, javascript: 5 },
    compute:   { java: 8, cpp: 7, python: 7, javascript: 7 },
    returnAns: { java: 11, cpp: 10, python: 9, javascript: 10 },
  };

  // 2. Step 0: 主函数入口帧
  steps.push({
    currentCall: `solve(n=${n})`,
    codeLine: lines.entry,
    decision: `主函数入口：接收参数规模 n=${n}`,
    message: '准备初始化状态并进入推导',
    log: `enter solve(n=${n})`,
    metrics: { '当前状态': '函数入口', '规模': `${n}` },
  });

  // 3. 边界特判或基础表初始化
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  steps.push({
    currentCall: `solve(n=${n})`,
    codeLine: lines.initDp,
    decision: '初始化基础边界：dp[0] = 1',
    message: '设置递归出口初始值',
    log: 'init dp[0] = 1',
    metrics: { '当前状态': '边界设定', 'dp[0]': '1' },
  });

  // 4. 核心递推过程（逐行步进）
  for (let i = 1; i <= n; i++) {
    dp[i] = dp[i - 1] + 1;
    steps.push({
      currentCall: `solve(i=${i})`,
      codeLine: lines.compute,
      decision: `状态转移：dp[${i}] = dp[${i - 1}] + 1 = ${dp[i]}`,
      message: `由前序状态计算当前项`,
      log: `dp[${i}] = ${dp[i]}`,
      metrics: { '当前索引 i': `${i}`, '当前值': `${dp[i]}` },
    });
  }

  // 5. 收敛返回
  steps.push({
    currentCall: `solve(n=${n})`,
    codeLine: lines.returnAns,
    decision: `🎉 计算完毕！最终答案 = dp[${n}] = ${dp[n]}`,
    message: '全局最优解已收拢',
    log: `done result=${dp[n]}`,
    metrics: { '当前状态': '计算完毕', '最终答案': `${dp[n]}` },
  });

  return steps;
}
```

### 8.2 终极提交前双轴代码审查清单 (Double-Axis Review Checklist)

#### 轴一：规范轴（Syntax, Style & Language）
- [ ] **纯 TypeScript 规范**：全文件为类型安全 `.ts`，零新建 `.js`，零 `any` 滥用。
- [ ] **行号 1-based 局部封闭**：所有行号来自独立代码片段 `[1, codeArray.length]`，杜绝大文件行号（无 500+ 超界行）。
- [ ] **四语言完备映射**：Java、C++、Python、JavaScript 相对行号齐备映射，无单值硬编码；优先走 `@step:` 锚点。
- [ ] **UI 布局去套娃**：无多层嵌套卡片，无中英双语冗余堆叠，主沙盘画布占据 60%~70% 黄金面积。
- [ ] **顶栏自洽性**：顶栏自适应无截断，应用按钮使用“应用”或“运行”明确汉字，“重置”按钮在输入框最末端。

#### 轴二：契约轴（Domain, Presentation & Gates）
- [ ] **强制前置查重与双版本整合（第 0 步门禁）**：实现前无条件执行全库四维检索；若遇同题双版本，**绝对禁止粗暴删掉任一版本，绝对禁止另建平行文件**，必须综合两版本长处深度整合，以主 ID + `aliases` 统合。
- [ ] **深模块契约与身材红线**：严禁单题私造编译器，策略身材严格限制在 **LOC < 120 行**，核心推演接入统一抽象编译器。
- [ ] **表现层真实纯净契约**：严格消灭 14 大红灯陷阱（无双重镜像表格、一维槽位无矩阵污染、无树表脑裂、无 `[object Object]`、无 `undefined` 样式）。
- [ ] **测试不可篡改（RED 先行）**：核对 `git diff`，确认未删改已有测试断言，未将精准断言篡改为软断言，未编写迎合自身实现的伪单测。
- [ ] **爆炸半径安全隔离**：核对 `git status`，确认仅触碰目标算法垂直切片，未越界修改系统顶层核心协议或无关模块。
- [ ] **全量门禁全线绿灯**：依次执行 `npm run test:gate` 与 `npm run typecheck`，100% 退出码 0 方可提交交付。
