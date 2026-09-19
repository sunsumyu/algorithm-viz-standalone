你批评得非常对。**算法演示必须接入顶层统一抽象，绝不能每个算法各自为战写一套 ad-hoc 实现。** 

以 **`LeetCode 115. 不同的子序列`** 作为黄金基准，标准的顶层抽象架构必须满足 5 大铁律：
1. **统一领域事实源**：具备独立的 `src/core/models/<algo>.yaml`，严禁在页面或 Renderer 里硬编码多语言代码与行号；
2. **顶层策略引擎闭环**：继承 `AbstractSequenceRecursionCompiler` 或对应的领域抽象策略，严禁私自手写步进生成；
3. **四阶段演化标准**：完整具备 `[1 递归]`、`[2 记忆化]`、`[3 二维DP / 严格表递推]`、`[4 空间压缩优化]`；
4. **统一双卡片架构**：
   - **Card 1**：状态演算沙盘（网格坐标与算法模型严格 1:1，角色与行列高亮对齐）；
   - **Card 2**：状态结构与空间演化（调用树、串比对看板、滚动数组，带子视图切换）；
5. **单行代码物理对齐与防跳步**：分支调用前先发射独立 `branch-call` 步骤帧，子递归返回时发射 `branch-return` 闭环。

---

### 全库 DP 算法架构排查全景清单

全库共 **117** 个动规（Dynamic Programming）类目算法（除去 17 篇纯理论文章卡片后共 **100** 个交互演示）：

| 阵营分类 | 数量 | 现状与核心问题诊断 | 代表题目 |
| :--- | :---: | :--- | :--- |
| **A. 黄金标杆** | **2** | 完全满足 115 标准：YAML 完备、4 阶段闭环、顺逆推双向、Card 1/2 协同、零跳步 | `distinct-subsequences` (115)<br>`unique-paths-ii` (63) |
| **B. 完全独立的私有实现 (Legacy Ad-hoc)** | **46** | **最严重**：完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环（如你的图 3） | `recursion-to-dp-038` (Class 038)<br>`knapsack-073/074/075` 系列 (20+)<br>`dp-079~088` 系列 (10+)<br>`word-search`, `word-break-ii` |
| **C. Spec 动态合成但模型/视图错乱** | **37** | 无独立 YAML 事实源，依赖 Spec 动态拼凑。**存在画布维度倒置、参数缺失**（如你的图 2 完全背包：Card 1 成了 1×5 槽位，Card 2 成了二维表，且缺少重量价值输入） | `complete-knapsack` (完全背包)<br>`coin-change`, `coin-change-ii`<br>`combination-sum-iv`<br>`target-sum`, `ones-and-zeroes` |
| **D. 已有 YAML 但需深化达标** | **15** | 已有 YAML 文件，但多语言代码未严格展开单行锚点，或未接入抽象递归/填表编译器，缺少 Card 2 深度看板 | `climb-stairs`, `fibonacci`<br>`min-path-sum`, `house-robber` 系列<br>`stock` 买卖股票系列 1~3<br>`longest-common-subsequence` |

---

### 详细问题清单（按优先级排队）

#### 第一批：彻底拔除完全独立的 Ad-hoc 孤岛（直接接入 UniversalStageVisualizer 顶层抽象）
这些是当前界面风格完全割裂、手写私有 DOM 的典型：
1. **`recursion-to-dp-038`（Class 038: 经典递归向记忆化搜索与动态规划初步转换）**（图 3 所示）
   - **问题**：自己写了一套蓝白按钮和独立的沙盘，没有接入顶层通用 4 阶段舞台，代码行号手工写死。
2. **`knapsack-073` 专题（01背包与变体）**：
   - `knapsack-01-standard`（采药）
   - `buy-goods-discount`（夏季特惠）
   - `target-sum-standard`（目标和方案数）
   - `last-stone-weight-ii-standard`（最后石重 II）
   - `dependent-knapsack-standard`（有依赖的背包）
   - `top-k-subsequence-sum` / `find-kth-sum`
   - **问题**：全部散落在 `knapsack-073/` 独立目录内，各自实现了一套独立的 Canvas 渲染，没有四阶段演化抽象。
3. **`knapsack-074` 专题（完全背包与分组背包）**：
   - `unbounded-knapsack-standard`（疯狂采药）
   - `partitioned-knapsack-standard`（通天之分组背包）
   - `coins-from-piles`（栈中取金币）
   - `buying-hay-min-cost`（购买干草）
   - `wildcard-matching`（通配符背包视角）
   - `regex-matching`（正则匹配）
   - **问题**：通配符与正则匹配用自制背包视角手写，缺乏序列对齐与标准网格模型。
4. **`knapsack-075` 专题（多重背包与混合背包）**：
   - `bounded-knapsack-naive`（朴素多重背包）
   - `bounded-knapsack-binary`（二进制拆分）
   - `cherry-blossom-viewing`（混合背包）
   - `bounded-knapsack-monotonic-queue`（单调队列优化）
   - `coins-change-kinds`（找零钱数种类）
5. **进阶 Class 079~088 专题**：
   - `digit-dp-basic-079`, `rerooting-tree-dp-080`, `expected-value-dp-081`, `slope-optimization-dp-082`, `knuth-quadrangle-inequality-083`, `counting-dp-inclusion-exclusion-084`, `game-probability-dp-085`, `sos-profile-dp-086`, `circular-interval-dp-087`, `tree-knapsack-dp-088`。

#### 第二批：修复 Spec 动态合成中的“维度颠倒与参数残缺”
典型如你的图 2：
1. **`complete-knapsack`（完全背包问题）**：
   - **问题 1（严重维度颠倒）**：阶段 3（二维DP）时，Card 1 被画成了 `1×5` 一维槽位，Card 2 却画成了二维表，角色和网格脱节；
   - **问题 2（输入缺失）**：输入区只有容量 `n`，无法自定义物品 `weights` 和 `values`；
   - **问题 3（无独立 YAML）**：依赖 Spec 动态合成，缺乏标准 YAML 事实源。
2. **`coin-change` / `coin-change-ii`（零钱兑换系列）**：
   - **问题**：背包容量与硬币面额输入混乱，顺逆推阶段切换时未正确重置一维/二维视图。
3. **`combination-sum-iv`（组合总和 IV）**：
   - **问题**：排列与组合的内外层循环语义在代码与沙盘中未显式区分。
4. **`partition-equal-subset-sum` / `target-sum`**：
   - **问题**：目标和转化成背包容量时的 offset 映射未在 Card 1 坐标系体现。

#### 第三批：已有 YAML 模型的精细化深化（对齐 115 标杆）
1. **`knapsack-01` (0-1 背包)**：完善 weights/values 输入与 Card 1 空间映射。
2. **`climb-stairs` / `fibonacci`**：补充 1~4 阶段标准代码单行展开与矩阵快速幂 Stage 4 优化。
3. **`house-robber` 系列（1、2、3）**：环形与树形 DP 状态转移树看板深化。
4. **`best-time-to-buy-and-sell-stock` 系列（1、2、3）**：状态机网格维度统一。

---

### 小步快跑执行路线

建议从最典型、最刺眼的题目开始，**一次攻坚一个 / 一组算法**：

1. **第 1 步（立竿见影，修复图 2 问题）**：
   - 为 **`complete-knapsack`（完全背包）** 创建规范的 `complete-knapsack.yaml`，修复二维 DP 阶段 Card 1（2D 背包网格）与 Card 2（状态转移表/滚动数组）的严重颠倒，补齐 weights/values 参数输入，接入顶层背包策略引擎。
2. **第 2 步（拔除私有孤岛，修复图 3 问题）**：
   - 重构 **`recursion-to-dp-038`**，建立完整的 YAML 事实源，接入 `UniversalStageVisualizer` 顶层抽象，彻底废弃其手写的独立 DOM。
3. **第 3 步（批量整合 knapsack-073/074/075）**：
   - 统一接入顶层背包策略引擎，共享统一的 2D/3D 沙盘。

请确认是否先从 **第 1 步：以 115 标准彻底重构完全背包（修复 Card 1/2 颠倒与缺失输入）** 开始推进？