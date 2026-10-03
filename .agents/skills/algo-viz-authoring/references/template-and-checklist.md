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

### 8.2 终极提交前审查 Checklist (Pre-submission Checklist)
- [ ] **强制前置查重与双版本长处整合（第 0 步门禁）**：实现前已无条件执行全库四维检索（LC题号、英文函数名、中文核心词、Catalog目录）；若库内已存在旧实现，**绝对禁止粗暴删掉任一版本，绝对禁止新建平行割裂文件**，必须综合双版本长处（保留旧版本的输入控件/预设案例下拉/成熟画布，融入新版本的名师讲义/四语言行号/阶段演化），以主 ID + `aliases` 统合为唯一事实来源。
- [ ] **行号自查**：所有行号来自独立代码片段（1-based），杜绝外部大文件行号（无 500+ / 600+ 超界行）。
- [ ] **四语言齐备**：Java、C++、Python、JavaScript 行号字典完备映射，无单值硬编码；优先走 `@step:` 锚点路线（`CodeStepIndexer` / `StageCodeRegistry`），手写 lines 字典仅作退路且必须集中在文件顶部；使用点无四语种四行展开。
- [ ] **生命周期闭环**：包含 Step 0（入口行）与收敛返回行，不跳步、不突兀。
- [ ] **预处理推演**：循环预处理有显式可视化帧，杜绝后台静默执行。
- [ ] **演化阶段对称**：四阶段 Tab、Card 标题、代码片段与推演逻辑 100% 语义对应。
- [ ] **实体永不消失**：小人/探针不从 DOM 卸载，遇障碍触水有弹回动画。
- [ ] **UI 拒绝套娃**：无多层嵌套卡片，无中英双语重复标签，主画布占 60%~70%。
- [ ] **顶栏文字不被截断**：顶栏左侧容器自适应，无固定硬编码 max-width，标题与时空复杂度徽章完整展示。
- [ ] **顶栏按钮语义明确**：重新生成/应用按钮使用“应用”等明确汉字，禁止单独放播放三角图标 `▶`，与“重置”按钮对称。
- [ ] **排版自洽**：“重置”按钮在输入框最后，变化变量 $i, j$ 优先显式展示，输入 label 无重复双冒号。
- [ ] **代码一键复制**：代码面板右上角提供常驻复制按钮（#btn-code-copy），点击即时反馈「已复制」，兼容 4 语言源码提取。
- [ ] **序列连续性与哨兵**：双序列比对具备 EOF 哨兵，焦点越界不消失，路径锁定字符常驻高亮，页面绝对无 `undefined` 脏字符。
- [ ] **重置幂等**：点击重置回到 Step 0 初始状态，无白板、无死锁。
- [ ] **全量测试通过**：执行全量 Vitest 测试套件，100% 绿色通过方可提交。
