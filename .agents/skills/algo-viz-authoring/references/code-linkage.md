# 代码联动与执行粒度规范 (Code Linkage & Granularity Standards)

### 2.1 相对行号与四语言映射准则
- **基准统一**：代码高亮行号必须严格对应各个语言代码数组（`codeLanguages[lang]`）的 **1-based 相对行号**（第 1 行下标为 1）。
  $$\forall step, \quad 1 \le \text{step.codeLine}[lang] \le \text{codeLanguages}[lang].\text{length}$$
- **多语言相对行号完备映射 (Multi-Language Relative Line Mapping)**：由于 Java、C++、Python、JavaScript 语法不同，代码行数天然存在差异，必须为每个语言映射对应的 1-based 局部行号。取行号首选 `@step:` 锚点路线：
  ```typescript
  // 锚点路线：模板自带标签，行号由 CodeStepIndexer 编译得出，模板改行行号自动跟随
  // 模板源码中标注：'int cur = dfs(i + 1, j); // @step:branch_down // ⬇️ 向下探索'
  import { codeStepIndexer } from '.../core/code-step-indexer';
  const { cleanCode, anchorIndex } = codeStepIndexer.register('my-algo', {
    java: [...], cpp: [...], python: [...], javascript: [...],
  });
  codeLine: codeStepIndexer.resolveHighlight('my-algo', 'branch_down', 'java')
  // 多阶段算法族（stage × kind）：
  // codeLine: registry.getAnchor(stage, kind, 'branch_down')  ← createStageCodeRegistry 工厂

  // 映射字典路线：集中定义多语言映射字典
  const lines = {
    entry:     { java: 2, cpp: 2, python: 2, javascript: 2 },
    guard:     { java: 3, cpp: 3, python: 3, javascript: 3 },
    initDp:    { java: 5, cpp: 4, python: 4, javascript: 4 },
    outerLoop: { java: 6, cpp: 5, python: 5, javascript: 5 },
    compute:   { java: 10, cpp: 9, python: 9, javascript: 9 },
    returnAns: { java: 15, cpp: 14, python: 12, javascript: 14 },
  };
  ```
  行号字典/锚点查询必须**集中在文件顶部或 stage-codes 常量文件**，使用点统一按键名引用（`codeLine: lines.entry`），保持使用点极简干净。

### 2.2 完整生命周期闭环不变量 (Full Lifecycle Invariant)
每一个算法推演步进必须按顺序经历完整的生命周期五阶段：
1. **0. 函数入口 (`entry`)**：高亮主函数签名行（如 `public int solve(...) {`），展示接收到的初始参数规模，设定沙盘起点。
2. **1. 边界特判 (`guard`)**：高亮边界或非法条件判断行（`if (n <= 1) return ...`），校验基底。
3. **2. 状态表分配 (`alloc`)**：高亮 `int[] dp = new int[...]`，分配沙盘表格与边界初值。
4. **3. 核心递推递增 (`loop` / `compute`)**：循环头 ➔ 条件检验 ➔ 方程计算 ➔ 暂存与填表更新。
5. **4. 收敛返回 (`done` / `return`)**：高亮 `return dp[...]`，明确标出全局最优解所在格并封板。

### 2.3 严格一行一步原则与零静默铁律 (Strict One-Line-One-Step Invariant)
- **一行一步核心契约 (Every Single Executed Line Must Generate Exactly One Visual Step)**：
  教学演示的核心是让学习者看清代码行如何驱动状态演变。每一个状态变更（网格标记、栈压入、表格写入、指针移动）均归因并高亮到具体的执行代码行。
- **动态行号步进 (Dynamic Line Advancement)**：
  状态变更伴随行号步进。在进入递归、判断边界、修改网格、递归子调用与回溯恢复时，光标精准移动至对应的独立代码行，杜绝高亮冻结（Zero Line Freezing）。
- **代码面板完整性 (Code Inclusiveness)**：
  若推演步进包含辅助递归函数（如 `dfs(...)`、`process(...)`、`partition(...)`），代码面板必须完整呈现主函数及辅助函数的全部源码，确保每一个步骤的高亮行在面板中清晰可见。
- **循环枚举逐项展示 (Loop Iteration Transparency)**：
  网格或序列枚举（如 `for (int i = 0; ...)`、`for (int j = 0; ...)`）提供显式的循环迭代步进，展现指针从起点依次考察到目标位置的全过程。
- **前置预处理显式化 (Preprocessing Transparency)**：
  词频统计、首尾比对反转、二进制拆分、单调栈预处理、前缀和等前置逻辑，逐行发射独立的可视化步骤帧。
- **四语言语义对齐**：每一个步骤的 `codeLine` 在 Java、C++、Python、JavaScript 四种语言中精确对齐在语义相同的执行行上。

### 2.4 执行日志递归调用与形参显式绑定规范 (Explicit Parameter Binding in Step Logs)
在递归推演日志中，清晰区分**调用方分支调用**与**被调方函数入口**的双帧演化，并在日志中显式标出具体的形参变量名与代入数值：
1. **调用方分支探索步（Caller Frame）**：高亮递归调用语句，记录执行的具体方向与实参表达式：
   - `| ⬇️ 执行 down = dfs(nextI, nextJ)，准备深入探索`
   - `| ➡️ 执行 right = dfs(nextI, nextJ)，准备深入探索`
2. **被调方函数入口步（Callee Entry Frame）**：高亮辅助函数签名行，显式标出形参变量名及其具体绑定数值：
   - `| 📥 进入 dfs(i=2, j=0) [顺推调用 #13]`
   - 日志明确列出绑定变量与具体值（如 `i=2, j=0, k=1`），方便学习者追踪调用现场。
3. **拦截、备份与回溯步（Guard & Backtrack Frames）**：显式携带当前函数帧的完整形参变量：
   - `| 🌊 【越界触水拦截】dfs(i=2, j=0) 跳入边界深水河流！立即弹回，return false`
   - `| 💾 【现场备份】dfs(i=2, j=0) 暂存原字符 tmp = b[2][0] ('A')`
   - `| 🔒 【原地打标】dfs(i=2, j=0) b[2][0] = 0 占位防重复踏入`
   - `| ↩️ 【回溯恢复】dfs(i=2, j=0) 现场还原 b[2][0] = 'A'`
   - `| ❌ 【分支失败】dfs(i=2, j=0) 四向探索均无解，return false`

### 2.5 多向/多分支递归调用独立分行与分支高亮准则 (Independent Directional Branch Highlighting)
- **遵循“不同路径”（Unique Paths）黄金标准**：
  - 在“不同路径”中，向下探索与向右探索分为独立代码行：
    `int down = dfs(i + 1, j, m, n);  // @step:branch_down // 向下探索`
    `int right = dfs(i, j + 1, m, n); // @step:branch_right // 向右探索`
  - 将各个方向或子问题分支展开为独立行，使每一步探索精确推进到对应分支行。
- **各语言独立分行与语义注释**：
  - 每一个方向作为独立的一行存在，且附带方向符号与语义注释：
    - `boolean found = dfs1(b, w, i + 1, j, k + 1, vis)   // ⬇️ 向下探索`
    - `             || dfs1(b, w, i - 1, j, k + 1, vis)   // ⬆️ 向上探索`
    - `             || dfs1(b, w, i, j + 1, k + 1, vis)   // ➡️ 向右探索`
    - `             || dfs1(b, w, i, j - 1, k + 1, vis);  // ⬅️ 向左探索`
- **四向独立映射字典**：
  - 在 `lines` 映射字典中，显式声明 `branchDown`、`branchUp`、`branchRight`、`branchLeft` 四个独立行号。
  - 在遍历方向列表（`dirList`）推演时，将各个方向的 `codeLine` 直接绑定到对应的分支行号。
