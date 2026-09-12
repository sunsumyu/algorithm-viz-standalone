---
name: algo-viz-authoring
description: Use when authoring, implementing, or auditing algorithm visualization renderers, step generators, and multi-language code linkages in this project to prevent line offset misalignments, missing entry frames, and skipped execution loops.
---

# 算法可视化项目全栈开发与审查终极规范 (Algorithm Visualizer Master Authoring Standards)

本规范是本算法可视化沙盘系统（Algorithm Visualizer）关于**步进生成器（Step Generator）**、**代码联动高亮（Code Linkage）**、**演化阶段（Stage Evolution）**、**动画实体物理沙盘（Sandbox Entity）**、**UI 布局与空间交互（UI Layout）**及**自动化测试（Vitest Invariants）**的唯一事实标准。

> **核心诫律**：本项目旨在构建**教学级、高可读性、高保真**的算法推演交互系统。所有算法必须让学习者“知其然更知其所以然”。严禁粗制滥造、严禁跳步运行、严禁单一硬编码、严禁单点修改而不做全局核验。

---

## 目录
1. [全项目历史七大典型故障深度复盘 (The 7 Historical Anti-Patterns)](#1-全项目历史七大典型故障深度复盘)
2. [代码联动与执行粒度规范 (Code Linkage & Granularity Standards)](#2-代码联动与执行粒度规范)
3. [算法“四段式”与正逆序演化规范 (4-Stage Evolution & Bidirectional Traversal)](#3-算法四段式与正逆序演化规范)
4. [物理沙盘与实体动画交互规范 (Sandbox & Entity Dynamics)](#4-物理沙盘与实体动画交互规范)
5. [UI 布局、层次去冗余与交互控制规范 (UI Layout & Controls)](#5-ui-布局层次去冗余与交互控制规范)
6. [重置状态与幂等性规范 (Reset & Idempotency)](#6-重置状态与幂等性规范)
7. [全量排查与 Vitest 自动化约束规范 (Whole-Suite Audit & TDD Invariants)](#7-全量排查与-vitest-自动化约束规范)
8. [标准生产模板与提交前 Checklist (Standard Template & Checklist)](#8-标准生产模板与提交前-checklist)

---

## 1. 全项目历史七大典型故障深度复盘

历次迭代开发与用户反馈中暴露出以下七大高频严重缺陷，后续开发必须无条件避开：

1. **代码行号基准错误（乱跳与超界）**：
   - *故障现象*：代码高亮一直在最后几行跳动，或直接跳到空白区域（如行号 505、625）。
   - *根本原因*：直接使用了跨语言大源文件（如 `*-stage-codes.ts`）在编辑器中的绝对物理行号，而前端 UI 面板渲染的是各个语言独立的**局部短代码片段**（通常仅 10~30 行）。
2. **算法推演随意跳步、静默执行**：
   - *故障现象*：推演一开始直接跳到循环体中间；关键预处理（如二进制拆分、拓扑排序、优先队列出入）在内存中默默跑完，步骤中完全看不到。
   - *根本原因*：开发者为图省事，将多行真实执行合并成一步，或者直接漏掉 Step 0（入口帧）与边界特判帧。
3. **“四段式”残缺或假演化**：
   - *故障现象*：用户要求经典动规四段式，却只实现了一两个阶段；空间压缩优化阶段直接把二维表变成一维展示，但状态转移与暂存逻辑含混不清。
   - *根本原因*：未严格贯彻“递归 ➔ 记忆化 ➔ 严格表 ➔ 空间压缩”的教学演进闭环。
4. **动画实体突兀消失与穿模违规**：
   - *故障现象*：行走方格的卡通小人在步进到方法头或返回语句时瞬间消失；碰触边界/障碍或触水时没有弹回动作，甚至直接穿模掉出网格。
   - *根本原因*：实体渲染缺少常驻状态机保护，未设计“碰壁-弹回”物理状态过渡帧。
5. **UI 嵌套“俄罗斯套娃”与冗余标签**：
   - *故障现象*：界面嵌套 3~4 层边框，一个文字包一个卡片；中英文双语 Tag 并列（如 `记忆化搜索 (Memoization)`），极其臃肿且挤占可视空间。
   - *根本原因*：缺乏全局 UI 布局规范，过度使用 Card 容器包装。
6. **面板拖拽拉死与尺寸不可持久化**：
   - *故障现象*：分栏被拖动后无法复原或把内容挤出屏幕；页面刷新后用户调节好的面板宽高全部丢失。
   - *根本原因*：Splitter 缺少 `min-width` / `min-height` 边界约束，且未接入 LocalStorage 记忆。
7. **“头痛医头”式单点修补与端口泄漏**：
   - *故障现象*：用户指出某个算法的一个 Bug，AI 只改当前文件，留下数十个同类算法的同款 Bug；浏览器连接异常时死循环打开数百个空窗口。
   - *根本原因*：缺乏全量批量检索意识与防御性进程管理。
8. **顶栏文字/徽章被生硬截断（字被挡住）**：
   - *故障现象*：算法标题、题目按钮、模式徽章与时空复杂度在顶栏右侧被硬切掉一半（如只露出 `O(M×N×4^L) · O(` 或 `[ 回 `）。
   - *根本原因*：顶栏左侧容器（如 `.dsp-header-left`）写死了固定最大宽度（如 `max-width: 380px; overflow: hidden;`），未做弹性自适应与合理的响应式降级。
9. **顶栏“应用/生成”按钮与“播放”控制混淆**：
   - *故障现象*：顶栏右侧仅放置一个蓝色三角图标 `▶` 按钮，用户误以为是播放/暂停控制，极其困惑。
   - *根本原因*：未将“参数应用/生成”与“时间轴播放”在语义上解耦，必须使用明确的文字（如“应用”），并与旁边的“重置”按钮在视觉规格（高度、字号、边距）上严格对称。
10. **数据字典键名单一硬编码导致降级（Unknown 故障）**：
    - *故障现象*：图谱边关系或实体展示中，关联关系全量显示为 `Unknown`，强度全显示为默认值 `10`。
    - *根本原因*：数据消费端单一硬编码取值 `rel.get("relationship")`，而数据源端实际字段名为 `"type"` 或 `"relation"`，缺乏字段兼容归一化。
11. **树组件重复造轮子与几何遮挡穿模（Redundant Tree Visualizers & Collision Overlap）**：
    - *故障现象*：连线分支标签（Edge Label 如 `↑上`、`\ 'e'`）与父节点返回值徽章（Tag）、当前活跃游标（🐸 青蛙）及子节点边框发生严重重叠穿模，文字混在一起不可读；多个算法各自实现一份树渲染，参数与体验割裂。
    - *根本原因*：未贯彻“能用模板的一律用模板”的深度模块复用原则，各个业务模块私自编写树渲染；且层间距写死过小（如 46px），缺少垂直净空安全避让（Safe Vertical Clearance）机制。
12. **序列/指针状态瞬态蒸发与越界丢失（Transient Highlight & Boundary Vanishing）**：
    - *故障现象*：双字符串/双指针对比中，匹配过的字符在步骤深入后高亮瞬间退为白色；指针一移到边界基底（如越界空串）所有高亮彻底消失，甚至界面抛出 `s1[5] ('undefined')` 脏数据。
    - *根本原因*：仅使用单一瞬态点判断（`idx === curI`），缺乏“待访/已扫/当前焦点/路径锁定”的三态状态机；且未设置末尾 `EOF / Ø` 边界哨兵格子承接越界焦点。
13. **视图层越权做业务裁决与初始帧作用域泄漏（Visualizer Decision Overreach & Scope Leakage）**：
    - *故障现象*：算法停在 Step 0（主函数签名行，如 `public static int lcs1(String s1, String s2)`），尚未进入递归函数，变量看板就提前泄漏了子函数的形参 `i: 3, j: 2`；下方“双字符串比对”卡片自动给两端字符打上绿勾并生成了“✨ 字符匹配成功：纳入公共子序列 (+1)”的决策徽章。
    - *根本原因*：
      1. 视图呈现器（如 `SequenceAlignmentPresenter`）缺乏比对状态控制（`isComparing`），越权仅根据字符相等就自发判定匹配成功与采纳决策；
      2. 步进生成器在 Step 0 混淆了主函数作用域与子函数作用域，提前泄漏了子函数形参 `i, j`。
    - *严格规范*：
      1. **视图层决策解耦（Renderer Decision Decoupling）**：视觉呈现器必须是纯状态投影，严禁未经 Step 显式授权（如 `isComparing !== false`）擅自推导业务结论；
      2. **作用域纯洁性（Scope Purity）**：主函数入口帧（Step 0）只保留全局输入参数，游标与比对控件在未就绪时必须呈现待比对/未就绪状态（`isComparing: false` / `curI: -1, curJ: -1`），严禁泄漏未定义的形参。

---

## 2. 代码联动与执行粒度规范

### 2.1 相对行号与四语言映射准则
- **基准统一**：代码高亮行号必须严格对应各个语言代码数组（`codeLanguages[lang]`）的 **1-based 相对行号**（第 1 行下标为 1）。
  $$\forall step, \quad 1 \le \text{step.codeLine}[lang] \le \text{codeLanguages}[lang].\text{length}$$
- **严禁单一数字硬编码**：由于 Java、C++、Python、JavaScript 语法不同，代码行数天然存在差异，**严禁使用单值数字作为行号**，必须显式定义映射字典：
  ```typescript
  // ❌ 严禁：单一硬编码行号，非 Java 语言必定错位
  codeLine: 7

  // ✅ 正确：显式定义多语言映射字典
  const lines = {
    entry:     { java: 2, cpp: 2, python: 2, javascript: 2 },
    guard:     { java: 3, cpp: 3, python: 3, javascript: 3 },
    initDp:    { java: 5, cpp: 4, python: 4, javascript: 4 },
    outerLoop: { java: 6, cpp: 5, python: 5, javascript: 5 },
    compute:   { java: 10, cpp: 9, python: 9, javascript: 9 },
    returnAns: { java: 15, cpp: 14, python: 12, javascript: 14 },
  };
  ```

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
  若在连续步骤中实体状态发生了改变（例如坐标从 `(2, 1)` 移动到 `(2, 2)`，或者字符被占位），但代码高亮行号却纹丝不动（如始终卡在外层 `for (int j = 0; ...)` 或 `dfs(...)` 这一行），这是**最高级别的渲染事故**！每一次进入递归、每一次判断边界、每一次修改网格、每一次递归调用、每一次回溯恢复，都必须切到对应的独立代码行。
- **代码面板完整性（Code Inclusiveness，杜绝隐形函数）**：
  若推演步进包含辅助递归函数（如 `dfs(...)`、`process(...)`、`partition(...)`），**代码面板必须完整呈现主函数及该辅助函数的全部实现代码**！绝不允许代码面板只贴了主函数，而步进在执行未贴出的辅助函数。所有 4 种语言（Java, C++, Python, JavaScript）必须完整展示并保持 1-based 行号严格对应。
- **循环枚举绝不静默传送（No Silent Loop Teleportation）**：
  网格或序列枚举（如 `for (int i = 0; ...)`、`for (int j = 0; ...)`）必须有显式的循环迭代步进。不能从 Step 1 瞬间瞬移到矩阵中央成功的格子，而完全不展示前面的格子是如何被考察并跳过的。学习者必须看到指针从起点依次考察到成功起点的完整过程。
- **前置预处理与辅助计算绝不静默**：
  词频统计、首尾比对反转、二进制拆分、单调栈预处理、前缀和等前置逻辑，必须逐行发射独立的可视化步骤帧，展示临时变量看板与数据结构的具体赋值，让学习者完全看清前置优化的每一步计算。
- **高亮指针与执行语句语义 100% 对应**：
  - 函数入口：高亮函数签名行（如 `public boolean exist(...) {`）。
  - 变量声明与分配：高亮 `int[] count = new int[...]` 等分配行。
  - 外层与内层循环：分别高亮 `for (int i...)` 与 `for (int j...)` 循环头。
  - 条件分支与边界特判：高亮 `if (...)` 判断行。
  - 辅助函数调用与进入：调用方高亮 `dfs(...)` 调用行，进入辅助函数后高亮辅助函数签名行。
  - 原地标记 / 状态转移：高亮 `board[i][j] = 0` 或 `dp[i][j] = ...` 行。
  - 现场恢复 / 回溯：高亮 `board[i][j] = tmp` 或 `vis[i][j] = false` 行。
  - 返回语句：高亮 `return ...` 所在行。
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
  - 学习者在观看步进演示时，代码面板的光标会精确跳至当前正在调用的具体方向代码行，彻底告别“不知道正在走哪个分支”的困惑。

---

## 3. 算法“四段式”与正逆序演化规范

### 3.1 动态规划标准“四段式”体系
所有经典动态规划算法必须提供标准的四阶段演化演示：
1. **阶段 1：暴力递归 (Brute-Force Recursion)**
   - 目标：展示问题的递归树展开与重叠子问题。
   - 配套组件：递归树（Tree Visualizer）+ 局部栈帧调用。
2. **阶段 2：记忆化搜索 (Memoization Search)**
   - 目标：展示缓存表命中（Cache Hit / Prune）过程，对比剪枝效果。
   - 配套组件：递归树（剪枝变灰/高亮）+ 缓存表变化。
3. **阶段 3：严格表依赖 (Tabulation / 2D Grid)**
   - 目标：将递归调用反转为自底向上的迭代填表，明确网格方向性依赖。
   - 配套组件：二维状态网格 + 依赖单元格高亮 + 方向指示箭头。
4. **阶段 4：空间压缩优化 (Space Compression / 1D Rolling)**
   - 目标：展示维度消除（如 $O(M \times N) \to O(N)$），揭示状态覆盖风险。
   - 配套组件：一维滚动条 + **对角线暂存寄存器透明展示**。

### 3.2 空间压缩寄存器透明原则
当一维滚动数组存在对角线依赖（如 LCS 的 `leftUp`、LPS 的 `leftDown`）时，**必须将推演拆分为细粒度三连步**：
1. **暂存旧值**：高亮 `int backup = dp[j];`，展示寄存器缓存。
2. **转移计算**：高亮 `dp[j] = Math.max(...)`，使用暂存值与相邻格计算。
3. **寄存器推移**：高亮 `leftUp = backup;`，为下一列的对角线做好准备。
严禁把三步合并成一步而跳过暂存寄存器的变化过程！

### 3.3 双向推演支持 (顺推 vs 逆序)
- **顺推（正序）**：从 `0, 0` 或第 `1` 项开始向前推演到终点。
- **逆序（倒序）**：从终点边界倒推至起点。
- 在涉及状态定义的算法中（如不同路径、背包），必须支持或提供切换按钮，并确保顺推逆序的初始状态与坐标系完全自洽，不可混淆。

---

## 4. 物理沙盘与实体动画交互规范

### 4.1 卡通实体“永不消失”原则
- 沙盘上的行走角色（如小人、探针指示器）代表执行指令游标指针。
- **任何步骤下角色都不得从 DOM 中卸载或隐藏**：
  - 在函数入口时：停留在起始方格（`[0, 0]`）。
  - 在遇到障碍物、边界特判或河道时：必须播放**碰壁反弹（Bounce Back）**动画，即短暂前倾后弹回上一个合法方格。
  - 在函数返回时：原地做出庆祝或终点标定动画，严禁突然消失。

### 4.2 状态依赖树与自适应视口 (Tree Visualizer)
- 递归树/状态依赖树不得预先一次性全部画出死节点，应随着步骤推演**动态点亮或生长**。
- **自适应缩放（Scale to Fit）**：树节点较多时，自动计算 SVG 视口比例（Zoom & Pan），确保活跃节点始终位于视口黄金中心区，不得超出边界或被顶栏遮挡。

### 4.3 路径痕迹与单元格依赖高亮
- 网格推演走过的路径应保留足迹（Footprints）与流动箭头。
- 正在被当前单元格 `dp[i][j]` 依赖的单元格（如 `dp[i-1][j]`、`dp[i][j-1]`）必须用对比色（如黄色/琥珀色脉冲光）突出显示。

### 4.4 递归调用树与依赖图统一模板复用铁律 (Mandatory Tree Template Reuse)
- **能用模板的一律用模板，坚决消灭重复轮子**：
  - 所有涉及**暴力递归展开树（Recursion Tree）**、**记忆化剪枝树（Memo Pruning Tree）**、**状态转移依赖图（DP Dependency Tree）**的算法沙盘，**必须统一接入并复用核心深度模块 `RecursionTreeAdapter.renderRecursionTree`（位于 `src/core/renderers/recursion-tree-adapter.ts`）**。
  - **严禁在各个业务模块（如各个算法的 renderer）中各写一套独立的 SVG 树渲染代码**！
  - 只有在面临完全异构的物理形态（例如三维力导向图、极坐标雷达网、粒子碰撞物理引擎等通用树完全无法支持的特殊沙盘）时，才允许单独特异化实现。
- **几何防重叠与安全避让规范 (Collision-Free Geometry Invariant)**：
  - **动态安全层高计算**：只要树中存在连线分支标签（`edgeLabel`，如 `↑上`、`\ 'e'`）或节点返回值徽章（`tag`），垂直层间距 `levelH` 必须自适应扩展至 **72px ~ 84px**，严禁在深层多节点时粗暴压缩至 46px 造成垂直挤爆。
  - **垂直净空安全定位 (Safe Vertical Clearance)**：
    连线上的分支标签胶囊 `edgeLabel` 必须计算父节点底部与子节点顶部的绝对安全中点：
    $$\text{SafeMidY} = \frac{(Y_{\text{parent}} + \text{nodeH}/2 + \text{tagPad}) + (Y_{\text{child}} - \text{nodeH}/2 - \text{frogPad})}{2}$$
    并且 X 坐标沿贝塞尔 S 弯曲线动态取值，确保边标签四周保留至少 $\ge 8\text{px}$ 的安全净空，绝不能与父节点的返回值徽章（Tag）或子节点头顶的当前活跃游标（🐸 青蛙）发生像素级重叠。
  - **图层分层与不透明底衬 (Layering & Opaque Shields)**：
    SVG 图元必须分层输出：`底图连线层 (lines) ➔ 中间分支标签层 (edgeLabels) ➔ 顶层状态节点层 (nodes)`。分支标签必须自带不透明 `#ffffff` 填充底衬与边框阴影，杜绝连线穿透文字。

### 4.5 序列比对与双指针跟踪交互规范 (Sequence Alignment & Dual-Pointer Tracking Invariants)
- **坚决杜绝单点瞬态高亮（No Ephemeral Point-in-Time Highlighting）**：
  - 凡涉及字符串比对、双指针滑动、序列模式匹配（LCS、编辑距离、通配符、回文串）等推演，**严禁仅使用 `idx === curI` 这种单点瞬态判断**。
  - 必须实现四态视觉连续性状态机：
    1. **待考察（Unvisited/Pending）**：默认中性底色。
    2. **已考察/历史轨迹（Visited/Explored）**：弱化半透明灰，展现扫描前进历史。
    3. **当前活跃焦点（Active Focus）**：高亮亮蓝/琥珀金脉冲，指示当前正在比对的字符。
    4. **路径有效锁定（Matched/Committed）**：当前调用链上已匹配采纳的字符，必须常驻翡翠绿高亮与标识，直至该分支回溯退栈。
- **末尾边界哨兵不变量（EOF / Boundary Sentinel Invariant）**：
  - 所有双序列/双指针算法，当 `i >= s.length` 或 `j >= s.length` 达到基底终止条件时，字符容器末尾必须常驻包含一个 **`EOF` 或 `Ø` 哨兵单元格**。
  - 越界推演步的活跃光标必须精准落在该 `EOF` 哨兵格上，**严禁光标从 DOM 中凭空消失**。
- **零 Undefined 脏渲染铁律（Zero Undefined Rendering Invariant）**：
  - 渲染层取字符值前必须做防御性校验：`(idx >= 0 && idx < s.length) ? s[idx] : 'Ø/空'`。
  - 严禁在任何卡片、Tooltip、日志或徽章中出现 `'undefined'`。
- **统一复用核心深度模块**：
  - 所有序列比对与指针跟踪必须优先调用 `SequenceAlignmentPresenter`，杜绝各个业务模块私自手写 `split('').map(...)`。

---

## 5. UI 布局、层次去冗余与交互控制规范

### 5.1 消除“俄罗斯套娃”与冗余标签
- **单层主容器法则**：外部使用一个高质感 Card 容器即可，严禁在内部给每个文字或每一行单独套一层 Card 或 Border。
- **去双语重复**：严禁出现如 `状态转移 (Transition State)` 这种中英冗余堆叠，统一使用清晰、精炼的单一中文专业术语。
- **主画布优先**：核心可视化区域（网格、树、沙盘）必须占据整个视口的 **60%~70%** 面积，绝不允许被过大的上下面板挤压成“中间小框、上下长条”。

### 5.2 核心变量指标看板规范
- 动态变化的游标变量（如当前索引 $i, j$、暂存值 `backup`、当前物品容量/价值）必须以显著独立的 Badge/看板优先展示。
- **参数排布顺序**：动态游标变量（$i, j, k$）放左侧，静态规模参数（$m, n, W$）放右侧。
- 算式代入必须直观：不仅展示数学符号，更要展示具体代入数值（如 `dp[2][3] = dp[1][3] (5) + dp[2][2] (4) = 9`）。

### 5.3 控件与输入框排布顺序
- **顶栏左侧防遮挡（No Clipping）**：
  - 顶栏左侧容器必须使用弹性自适应（`flex-shrink: 0; min-width: 0;`），严禁写死固定最大宽度（如 `380px`）和 `overflow: hidden` 导致标题与复杂度等徽章被截半。
  - 算法标题设置 `text-overflow: ellipsis; white-space: nowrap;` 并提供原生 `title` 浮动全名提示。
  - 辅以响应式断点（如 `< 1380px` 隐藏模式徽章、`< 1200px` 隐藏复杂度徽章），确保各可见元素完整。
- **顶栏“应用”按钮明确语义文字**：
  - 顶栏用于重新生成/应用参数的按钮必须使用文字（统一为 **“应用”**），严禁单独放置一个播放三角图标 `▶` 造成用户与底部播放控制产生混淆。
  - 必须与旁边的“重置”按钮保持高度、圆角、字号和内边距的对称统一。
- **输入标签标点统一与防重**：
  - 必须对输入项 `label` 实施尾部冒号过滤 `label.replace(/[:：]\s*$/, '')`，避免拼装出 `容量::` 等重复双冒号。
- **输入区域与重置按钮排布**：
  - 各类预设用例、输入框从左至右依次排列。
  - 顺序依次为：`[预设用例/下拉] ➔ [输入框组] ➔ [应用按钮] ➔ [重置按钮]`。
  - **“重置”按钮必须位于最末尾**，严禁把输入框或应用按钮放在“重置”之后。
- **播放控制区**：播放、暂停、单步前进、单步后退、速度滑块必须居中或贴近核心画布右下方，便于单手交互。
- **代码面板一键复制代码规范 (One-Click Code Copy Standard)**：
  - 代码调试面板右上角控制区（字号缩放器 `A-/A+` 左侧）必须常驻提供「一键复制当前代码」按钮（`#btn-code-copy`）。
  - 能够一键提取当前活跃编程语言（Java / C++ / Python / JS）的纯净完整源码写入系统剪贴板（支持 `navigator.clipboard` 与 `execCommand` 双向降级）。
  - 点击后必须提供即时、优雅的微动画视觉反馈：图标转为 `✓` 勾选，文字变为 `已复制`，按键高亮为翠绿色（`#34d399`），并在 1.8 秒后自动复位。
- **原题信息展示**：所有算法必须在顶栏或右上角提供题目原题入口，统一弹窗标题为 `📋 算法题目描述`，展示 LeetCode / 洛谷原题编号及题面。

### 5.4 面板 Splitter 拖拽持久化与安全边界
- 调整面板宽度/高度的分割条（Resizer/Splitter）必须设置严格的安全最小尺寸：
  - `minWidth: 320px`，`minHeight: 200px`。
- 用户拖动后的尺寸必须存入 `localStorage`，下次进入页面时自动恢复，严禁刷新后丢失。

---

## 6. 重置状态与幂等性规范

### 6.1 状态幂等初始化
- 用户点击“重置”或更改输入参数重新生成时，系统必须立即重置至 `Step 0`：
  - 清空推演历史栈与日志。
  - 恢复实体角色至起点位置。
  - 重置 DP 表格各格为初始值（如 `0`、`inf` 或空）。
  - **严禁出现点击重置后沙盘变成全白板（White-out）或无响应**。

---

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
- [ ] **行号自查**：所有行号来自独立代码片段（1-based），杜绝外部大文件行号（无 500+ / 600+ 超界行）。
- [ ] **四语言齐备**：Java、C++、Python、JavaScript 行号字典完备映射，无单值硬编码。
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
