# 代码联动与执行粒度规范 (Code Linkage & Granularity Standards)

### 2.1 相对行号与四语言映射准则
- **基准统一**：代码高亮行号必须严格对应各个语言代码数组（`codeLanguages[lang]`）的 **1-based 相对行号**（第 1 行下标为 1）。
  $$\forall step, \quad 1 \le \text{step.codeLine}[lang] \le \text{codeLanguages}[lang].\text{length}$$
- **严禁单一数字硬编码**：由于 Java、C++、Python、JavaScript 语法不同，代码行数天然存在差异，**严禁使用单值数字作为行号**。取行号有两级形态，优先用锚点路线：
  ```typescript
  // ❌ 严禁：单一硬编码行号，非 Java 语言必定错位
  codeLine: 7

  // ✅ 首选：@step: 锚点路线 —— 模板自带标签，行号由 CodeStepIndexer 编译得出，
  //    模板改行行号自动跟随，永不漂移（多阶段算法族用 StageCodeRegistry）
  //    模板里：'int cur = dfs(i + 1, j); // @step:branch_down // ⬇️ 向下探索'
  import { codeStepIndexer } from '.../core/code-step-indexer';
  const { cleanCode, anchorIndex } = codeStepIndexer.register('my-algo', {
    java: [...], cpp: [...], python: [...], javascript: [...],
  });
  codeLine: codeStepIndexer.resolveHighlight('my-algo', 'branch_down', 'java') // 按锚点取行
  // 多阶段算法族（stage × kind）：
  // codeLine: registry.getAnchor(stage, kind, 'branch_down')  ← createStageCodeRegistry 工厂

  // ✅ 退路：显式定义多语言映射字典（行号手写，改模板时必须人工同步）
  const lines = {
    entry:     { java: 2, cpp: 2, python: 2, javascript: 2 },
    guard:     { java: 3, cpp: 3, python: 3, javascript: 3 },
    initDp:    { java: 5, cpp: 4, python: 4, javascript: 4 },
    outerLoop: { java: 6, cpp: 5, python: 5, javascript: 5 },
    compute:   { java: 10, cpp: 9, python: 9, javascript: 9 },
    returnAns: { java: 15, cpp: 14, python: 12, javascript: 14 },
  };
  ```
  无论哪级形态，行号字典/锚点查询必须**集中在文件顶部或 stage-codes 常量文件**，使用点只引用（`codeLine: lines.entry`），严禁在使用点按四语种四行展开，也严禁在使用点裸写行号字面量。

### 2.2 完整生命周期闭环不变量 (Full Lifecycle Invariant)
每一个算法推演步进必须具备完整的生命周期，严禁直接跳到循环中：
1. **0. 函数入口 (`entry`)**：高亮主函数签名行（如 `public int solve(...) {`），展示接收到的初始参数规模，设定沙盘起点。
2. **1. 边界特判 (`guard`)**：高亮边界或非法条件判断行（`if (n <= 1) return ...`），校验基底。
3. **2. 状态表分配 (`alloc`)**：高亮 `int[] dp = new int[...]`，分配沙盘表格与边界初值。
4. **3. 核心递推递增 (`loop` / `compute`)**：循环头 ➔ 条件检验 ➔ 方程计算 ➔ 暂存与填表更新。
5. **4. 收敛返回 (`done` / `return`)**：高亮 `return dp[...]`，明确标出全局最优解所在格并封板。

### 2.3 绝对的一行一步原则与零静默铁律 (Strict One-Line-One-Step Invariant across ALL Algorithms)
- **全局铁律：所有算法必须彻底贯彻“一行一步” (Every Single Executed Line Must Generate Exactly One Visual Step)**：
  教学演示的灵魂是让学习者看到“每一行代码在计算机中是如何驱动状态变化的”。严禁将 5~10 行真实代码执行粗暴合并为一步，严禁在不同状态变更时让代码高亮冻结在同一行（Zero Line Freezing）。每一个状态更新（如网格标记、栈压入、表格写入、指针移动）都必须且只能归因于其对应的具体代码行。
- **杜绝高亮冻结（Zero Line Freezing）**：
  若在连续步骤中实体状态发生了改变（例如坐标从 `(2, 1)` 移动到 `(2, 2)`，或者字符被占位），但代码高亮行号却纹丝不动，这是严重渲染事故！每一次进入递归、每一次判断边界、每一次修改网格、每一次递归调用、每一次回溯恢复，都必须切到对应的独立代码行。
- **代码面板完整性（Code Inclusiveness，杜绝隐形函数）**：
  若推演步进包含辅助递归函数（如 `dfs(...)`、`process(...)`、`partition(...)`），**代码面板必须完整呈现主函数及该辅助函数的全部实现代码**！绝不允许代码面板只贴了主函数，而步进在执行未贴出的辅助函数。
- **循环枚举绝不静默传送（No Silent Loop Teleportation）**：
  网格或序列枚举（如 `for (int i = 0; ...)`、`for (int j = 0; ...)`）必须有显式的循环迭代步进。学习者必须看到指针从起点依次考察到成功起点的完整过程。
- **前置预处理与辅助计算绝不静默**：
  词频统计、首尾比对反转、二进制拆分、单调栈预处理、前缀和等前置逻辑，必须逐行发射独立的可视化步骤帧。
- **每一个步骤的 `codeLine` 必须在 Java、C++、Python、JavaScript 四种语言中精确落在语义对应的同一行上**。

### 2.4 执行日志递归调用与形参显式绑定规范 (Explicit Parameter Binding in Step Logs)
在递归推演日志中，必须严格区分**调用方分支调用**与**被调方函数入口**的双帧演化，并在日志中显式标出具体的形参变量名与代入数值：
1. **调用方分支探索步（Caller Frame）**：高亮递归调用语句，记录执行的具体方向与实参表达式：
   - `| ⬇️ 执行 down = dfs(nextI, nextJ)，准备深入探索`
   - `| ➡️ 执行 right = dfs(nextI, nextJ)，准备深入探索`
2. **被调方函数入口步（Callee Entry Frame）**：高亮辅助函数签名行，**必须显式标出形参变量名及其具体绑定数值**：
   - `| 📥 进入 dfs(i=2, j=0) [顺推调用 #13]`
   - 严禁只写 `dfs(2, 0)` 而遗漏参数名，学习者必须在日志中一目了然看清具体是哪个变量被赋予了什么值（如 `i=2, j=0, k=1`）。
3. **拦截、备份与回溯步（Guard & Backtrack Frames）**：必须显式携带当前函数帧的完整形参变量：
   - `| 🌊 【越界触水拦截】dfs(i=2, j=0) 跳入边界深水河流！立即弹回，return false`
   - `| 💾 【现场备份】dfs(i=2, j=0) 暂存原字符 tmp = b[2][0] ('A')`
   - `| 🔒 【原地打标】dfs(i=2, j=0) b[2][0] = 0 占位防重复踏入`
   - `| ↩️ 【回溯恢复】dfs(i=2, j=0) 现场还原 b[2][0] = 'A'`
   - `| ❌ 【分支失败】dfs(i=2, j=0) 四向探索均无解，return false`

### 2.5 多向/多分支递归调用独立分行与分支高亮准则 (Independent Directional Branch Highlighting)
- **严格遵循“不同路径”（Unique Paths）黄金标准**：
  - 在“不同路径”中，向下探索与向右探索分为独立代码行：
    `int down = dfs(i + 1, j, m, n);  // @step:branch_down // 向下探索`
    `int right = dfs(i, j + 1, m, n); // @step:branch_right // 向右探索`
  - 严禁将多个方向或子问题分支（如网格上下左右四向、二叉树左右子树、K叉决策分支）压缩在同一行代码中，导致连续多步探索同一行被“假高亮/冻结”。
- **各语言独立分行与语义注释**：
  - 每一个方向必须作为独立的一行存在，且附带方向符号与语义注释：
    - `boolean found = dfs1(b, w, i + 1, j, k + 1, vis)   // ⬇️ 向下探索`
    - `             || dfs1(b, w, i - 1, j, k + 1, vis)   // ⬆️ 向上探索`
    - `             || dfs1(b, w, i, j + 1, k + 1, vis)   // ➡️ 向右探索`
    - `             || dfs1(b, w, i, j - 1, k + 1, vis);  // ⬅️ 向左探索`
- **四向独立映射字典**：
  - 在 `lines` 映射字典中，显式声明 `branchDown`、`branchUp`、`branchRight`、`branchLeft` 四个独立行号。
  - 在遍历方向列表（`dirList`）推演时，将各个方向的 `codeLine` 直接绑定到对应的分支行号。
