# 领域适配器与核心编译器参考目录 (Domain Adapters & Compilers Catalog)

> **Matt Pocock 架构准则**：
> 核心适配器与编译器驻留在 `src/core/`，提供**小接口、大实现（Small Interface, Deep Implementation）**的高杠杆深模块。
> 单题 `*-renderer.ts` 严禁私建画布渲染与状态机构造，只作为纯领域适配器（LOC < 120）调用本目录列出的核心设施。

---

## 1. 表现层视觉适配器 (Visual Adapters at `src/core/renderers/adapters/`)

| 领域视觉适配器 | 核心职责与视觉槽位 | 适用算法与数据结构族群 | 关键公开方法 |
| :--- | :--- | :--- | :--- |
| **`TreeCanvasAdapter`** | 二叉树纯净 SVG 拓扑画板，分层自动布局、活跃游标定位、节点连线高亮 | 普通二叉树遍历、BST、序列化、深度计算、平衡判定 | `TreeCanvasAdapter.renderTree(container, options)` |
| **`TrieCanvasAdapter`** | 字典树（26 叉前缀树 / 01-Trie 二进制树）分层 SVG 画布、位深度标尺、对偶路径高亮、静态连续数组内存映射表 | 字符串前缀统计 (LC 208)、两数最大异或 (LC 421)、子数组最大异或 (P4551) | `TrieCanvasAdapter.renderTrieCanvas(container, step)`<br>`TrieCanvasAdapter.renderTrieCard2(container, step)` |
| **`RecursionTreeAdapter`** | 递归调用树与自顶向下展开树，节点调用帧、后序归约返回边动态着色 | 树形 DP、分治、回溯递归推演 | `RecursionTreeAdapter.renderCallTree(container, step)` |
| **`GridSnapshotPrimitives`** | 二维状态空间沙盘、网格依赖雷达、双序列矩阵平铺与单元格高亮 | 网格路径探索、LCS/编辑距离、矩阵链乘 | `GridSnapshotPrimitives.render2DGrid(container, step)` |

---

## 2. 状态推演核心编译器 (Step Compilers at `src/core/strategies/` & `src/core/compilers/`)

| 核心状态编译器 | 归约模型与推演状态机 | 覆盖算法族群 |
| :--- | :--- | :--- |
| **`LinearStepMatrixCompiler`** | 线性 1D 空间滚动、前驱决策回溯与全局极值维护 | 爬楼梯、打家劫舍、解码方法、最大子数组和 |
| **`KnapsackStepMatrixCompiler`** | 0/1 背包、完全背包二维/一维空间压缩转移矩阵 | 零钱兑换、分割等和子集、目标和 |
| **`SequenceStepMatrixCompiler`** | 双序列二维矩阵、对角线匹配与双向回溯路径 | 最长公共子序列 (LCS)、编辑距离、不同子序列 |
| **`IntervalSchedulingStepCompiler`** | 区间排序、贪心不相交选择与射箭气球覆盖 | 无重叠区间、用最少数量的箭引爆气球、会议室 |
| **`IntervalRelayStepCompiler`** | 最远右边界接力扫描、跳跃生命期断言 | 跳跃游戏 I/II、视频拼接 |
| **`TwoPassNeighborStepCompiler`** | 双向前后缀邻域扫描、局部坡度与峰值推导 | 分发糖果、除自身以外数组的乘积、接雨水 |
| **`BinaryTrieStepCompiler`** | 01-Trie 逐位构建、高位对偶贪心探测、前缀异或转化 | LeetCode 421、洛谷 P4551、LeetCode 1707 |

---

## 3. 两适配器下沉法则 (The Two-Adapter Deepening Rule)

当开发或重构算法时：
1. **查阅本目录**：优先使用已有适配器或编译器；
2. **两适配器判定**：如果当前算法属于一个全新的原型（Archetype），且库内已经或即将出现第二个实例（如 01-Trie 出现于 Class 017 之后），**绝对禁止在单题内私写代码**，必须：
   - 提取通用的 `*Adapter` 至 `src/core/renderers/adapters/`；
   - 提取通用的 `*Compiler` 至 `src/core/strategies/` 或 `src/core/compilers/`；
   - 确保核心模块拥有独立的伴生测试（`*.test.ts`）；
   - 在本目录中登记注册新适配器。
