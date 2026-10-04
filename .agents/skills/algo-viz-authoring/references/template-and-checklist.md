# 自动化测试约束、标准代码模板与提交前 Checklist

## 7. 全量排查与 Vitest 自动化约束规范

### 7.1 全量排查与同类核验原则 (Comprehensive Category Sweep)
当定位到某个算法缺陷（如行号错位、步骤遗漏）时，按以下流程进行全量排查与闭环：
1. **同类扫描**：使用 `grep_search` 扫描所有同类算法与同组模块。
2. **一致性审查**：比对排查是否存在同款缺陷模式。
3. **回归验证**：运行全量测试套件（如 `npx vitest run src/algorithms/categories/...`）。

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
- [ ] **前置查重与双版本长处整合 (Bi-Version Synthesis)**：实现前执行全库四维检索；遇同题双版本遵循长处综合整合，保留核心主 ID 并以 `aliases` 统合别名。
- [ ] **深度编译器委托与身材红线 (Delegated Architecture & LOC < 120)**：核心推演委托统一编译器族群，策略类仅负责入参规约与委托，源码严格限制在 **LOC < 120 行**。
- [ ] **表现层真实纯净契约 (Clean Presentation Contract)**：通过 14 大红灯陷阱全套拦截（无双重镜像表格、一维槽位无矩阵污染、无树表脑裂、无 `[object Object]`、无 `undefined` 样式）。
- [ ] **测试契约不可篡改 (Immutable Test Contracts)**：保持既有测试断言完整有效，拒绝迎合实现的伪单测。
- [ ] **爆炸半径安全隔离 (Bounded Blast Radius)**：代码变更严格聚焦目标算法垂直切片，隔离顶层核心协议与无关模块。
- [ ] **核心校验门禁全线绿灯 (Binary Exit 0 Gates)**：依次执行 `npm run test:gate` 与 `npm run typecheck`，退出码 0 为唯一定界判据。
