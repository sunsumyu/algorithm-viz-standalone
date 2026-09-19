# 全库动态规划 (DP) 算法未接入顶层黄金抽象规约深度排查全景表

> **生成时间**：2026-09-18 | **基准标杆**：LeetCode 115. 不同的子序列 (`distinct-subsequences`) & LeetCode 63. 不同路径 II (`unique-paths-ii`)

## 1. 架构排查分类汇总

| 级别分类 | 数量 | 核心特征与问题 |
| :--- | :---: | :--- |
| **A. 黄金基准 (Golden Standard)** | 2 | 具备规范 YAML、4 阶段完整演化、顺逆推双向、Card 1/2 双卡片协同、单行代码无跳步 |
| **B. 完全独立的私有实现 (Legacy Ad-hoc)** | 46 | 最严重：完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签 |
| **C. 视图维度颠倒 / 缺失 YAML 事实源** | 37 | 无独立 YAML 或维度颠倒（如完全背包 Card 1/2 颠倒，缺少 weights/values 参数） |
| **D. 已有 YAML 但需深化达标** | 15 | 已有 YAML，但多语言代码未严格展开单行锚点，或未接入抽象递归/填表编译器 |
| **E. 理论教学与文章总结** | 17 | 动规理论、心法或周总结卡片，无需算法执行沙盘 |

## 2. 全量 117 个动规题目排查清单 (逐题核验)

| 序号 | 算法 ID | 中文名称 | 分级分类 | YAML | Renderer 相对路径 | 核心问题诊断与修复目标 |
| :---: | :--- | :--- | :---: | :---: | :--- | :--- |
| 1 | `dp-theory` | 动态规划理论基础 | **E (理论/总结)** | 否 | `UNKNOWN` | 纯理论文章或阶段总结卡片，无需算法执行沙盘 |
| 2 | `fibonacci` | 斐波那契数 | **A (黄金基准)** | 是 | `src/algorithms/categories/dynamic-programming/fibonacci-renderer.ts` | 4 阶段演化完备（递归、记忆化、DP填表、O(1)双变量），Step 0 入口帧、循环头帧与四语言对齐全绿 |
| 3 | `decode-ways` | 数字串翻译方案数（解码方法） | **A (黄金基准)** | 是 | `src/algorithms/categories/dynamic-programming/decode-ways-renderer.ts` | 4 阶段演化完备（递归、记忆化剪枝、DP填表、O(1)双变量滚动），Step 0 入口帧、循环头帧与四语言对齐全绿 |
| 4 | `min-cost-climbing-stairs` | 使用最小花费爬楼梯 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 5 | `dp-week-summary-1` | 动规周总结（一） | **E (理论/总结)** | 否 | `UNKNOWN` | 纯理论文章或阶段总结卡片，无需算法执行沙盘 |
| 6 | `unique-paths` | 不同路径 | **D (需深化对齐)** | 是 | `src/algorithms/categories/dynamic-programming/unique-paths-renderer.ts` | 已有 YAML，但缺少 4 阶段完整代码行号锚点，或未与 Card 2 深度看板联动 |
| 7 | `unique-paths-ii` | 不同路径 II | **A (黄金基准)** | 是 | `src/algorithms/categories/dynamic-programming/unique-paths-renderer.ts` | 完全满足 115 标准：YAML 完备、4 阶段闭环、顺逆推双向、Card 1/2 协同、零跳步 |
| 8 | `integer-break` | 整数拆分 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 9 | `unique-bst` | 不同的二叉搜索树 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 10 | `dp-week-summary-2` | 动规周总结（二） | **E (理论/总结)** | 否 | `UNKNOWN` | 纯理论文章或阶段总结卡片，无需算法执行沙盘 |
| 11 | `knapsack-01-theory-1` | 0-1背包理论基础（一） | **E (理论/总结)** | 否 | `UNKNOWN` | 纯理论文章或阶段总结卡片，无需算法执行沙盘 |
| 12 | `knapsack-01-2d` | 0-1背包问题（二维） | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 13 | `knapsack-01-theory-2` | 0-1背包理论基础（二） | **E (理论/总结)** | 否 | `UNKNOWN` | 纯理论文章或阶段总结卡片，无需算法执行沙盘 |
| 14 | `knapsack-01-1d` | 0-1背包问题（一维） | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 15 | `partition-equal-subset-sum` | 分割等和子集 | **D (需深化对齐)** | 是 | `UNKNOWN` | 已有 YAML，但缺少 4 阶段完整代码行号锚点，或未与 Card 2 深度看板联动 |
| 16 | `last-stone-weight-ii` | 最后一块石头的重量 II | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 17 | `target-sum` | 目标和 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 18 | `ones-and-zeroes` | 一和零 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 19 | `dp-week-summary-3` | 动规周总结（三） | **E (理论/总结)** | 否 | `UNKNOWN` | 纯理论文章或阶段总结卡片，无需算法执行沙盘 |
| 20 | `complete-knapsack-theory` | 完全背包理论基础 | **E (理论/总结)** | 否 | `UNKNOWN` | 纯理论文章或阶段总结卡片，无需算法执行沙盘 |
| 21 | `complete-knapsack` | 完全背包问题 | **C (待修复典型)** | 是 | `UNKNOWN` | 严重颠倒：二维阶段 Card 1 误画为一维，Card 2 画为二维；缺少物品/容量输入区；无独立 YAML 事实源 |
| 22 | `coin-change-ii` | 零钱兑换 II | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 23 | `combination-sum-iv` | 组合总和 Ⅳ | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 24 | `climb-stairs-advanced` | 爬楼梯（进阶完全背包） | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 25 | `dp-week-summary-4` | 动规周总结（四） | **E (理论/总结)** | 否 | `UNKNOWN` | 纯理论文章或阶段总结卡片，无需算法执行沙盘 |
| 26 | `coin-change` | 零钱兑换 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 27 | `perfect-squares` | 完全平方数 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 28 | `word-break` | 单词拆分 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 29 | `dp-week-summary-5` | 动规周总结（五） | **E (理论/总结)** | 否 | `UNKNOWN` | 纯理论文章或阶段总结卡片，无需算法执行沙盘 |
| 30 | `multiple-knapsack-theory` | 多重背包理论基础 | **E (理论/总结)** | 否 | `UNKNOWN` | 纯理论文章或阶段总结卡片，无需算法执行沙盘 |
| 31 | `multiple-knapsack` | 多重背包理论基础 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 32 | `knapsack-summary` | 背包问题总结篇 | **E (理论/总结)** | 否 | `UNKNOWN` | 纯理论文章或阶段总结卡片，无需算法执行沙盘 |
| 33 | `house-robber` | 打家劫舍 | **D (需深化对齐)** | 是 | `UNKNOWN` | 已有 YAML，但缺少 4 阶段完整代码行号锚点，或未与 Card 2 深度看板联动 |
| 34 | `house-robber-ii` | 打家劫舍 II | **D (需深化对齐)** | 是 | `UNKNOWN` | 已有 YAML，但缺少 4 阶段完整代码行号锚点，或未与 Card 2 深度看板联动 |
| 35 | `house-robber-iii` | 打家劫舍 III | **D (需深化对齐)** | 是 | `UNKNOWN` | 已有 YAML，但缺少 4 阶段完整代码行号锚点，或未与 Card 2 深度看板联动 |
| 36 | `best-time-to-buy-and-sell-stock` | 买卖股票的最佳时机 | **D (需深化对齐)** | 是 | `UNKNOWN` | 已有 YAML，但缺少 4 阶段完整代码行号锚点，或未与 Card 2 深度看板联动 |
| 37 | `best-time-to-buy-and-sell-stock-ii` | 买卖股票的最佳时机 II | **D (需深化对齐)** | 是 | `UNKNOWN` | 已有 YAML，但缺少 4 阶段完整代码行号锚点，或未与 Card 2 深度看板联动 |
| 38 | `dp-week-summary-6` | 动规周总结（六） | **E (理论/总结)** | 否 | `UNKNOWN` | 纯理论文章或阶段总结卡片，无需算法执行沙盘 |
| 39 | `best-time-to-buy-and-sell-stock-iii` | 买卖股票的最佳时机 III | **D (需深化对齐)** | 是 | `UNKNOWN` | 已有 YAML，但缺少 4 阶段完整代码行号锚点，或未与 Card 2 深度看板联动 |
| 40 | `recursion-to-dp-038` | Class 038: 经典递归向记忆化搜索与动态规划初步转换 (Recursion to DP) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/recursion-to-dp-038-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 41 | `best-time-to-buy-and-sell-stock-iv` | 买卖股票的最佳时机 IV | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 42 | `best-time-to-buy-and-sell-stock-with-cooldown` | 买卖股票的最佳时机含冷冻期 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 43 | `best-time-to-buy-and-sell-stock-with-transaction-fee` | 买卖股票的最佳时机含手续费 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 44 | `dp-week-summary-7` | 动规周总结（七） | **E (理论/总结)** | 否 | `UNKNOWN` | 纯理论文章或阶段总结卡片，无需算法执行沙盘 |
| 45 | `stock-summary` | 股票问题总结篇 | **E (理论/总结)** | 否 | `UNKNOWN` | 纯理论文章或阶段总结卡片，无需算法执行沙盘 |
| 46 | `longest-increasing-subsequence` | 最长递增子序列 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 47 | `longest-continuous-increasing-subsequence` | 最长连续递增序列 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 48 | `longest-repeated-subarray` | 最长重复子数组 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 49 | `uncrossed-lines` | 不相交的线 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 50 | `max-subarray-dp` | 最大子数组和 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 51 | `distinct-subsequences` | 不同的子序列 | **A (黄金基准)** | 是 | `UNKNOWN` | 完全满足 115 标准：YAML 完备、4 阶段闭环、顺逆推双向、Card 1/2 协同、零跳步 |
| 52 | `edit-distance` | 编辑距离 | **D (需深化对齐)** | 是 | `UNKNOWN` | 已有 YAML，但缺少 4 阶段完整代码行号锚点，或未与 Card 2 深度看板联动 |
| 53 | `edit-distance-summary` | 编辑距离总结篇 | **E (理论/总结)** | 否 | `UNKNOWN` | 纯理论文章或阶段总结卡片，无需算法执行沙盘 |
| 54 | `palindromic-substrings` | 回文子串 | **D (需深化对齐)** | 是 | `UNKNOWN` | 已有 YAML，但缺少 4 阶段完整代码行号锚点，或未与 Card 2 深度看板联动 |
| 55 | `tree-dp-theory` | 树型DP理论篇（必备套路） | **E (理论/总结)** | 否 | `UNKNOWN` | 纯理论文章或阶段总结卡片，无需算法执行沙盘 |
| 56 | `max-distance-in-tree` | 树的最大距离 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 57 | `max-path-sum` | 二叉树最大路径和 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 58 | `largest-bst-subtree` | 最大BST子树 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 59 | `tree-diameter` | 二叉树的直径 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 60 | `binary-tree-cameras` | 监控二叉树 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 61 | `course-selection` | 选课（树上背包DP） | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 62 | `minimum-fuel-cost` | 到达首都的最少油耗 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 63 | `longest-path-different-characters` | 相邻字符不同的最长路径 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 64 | `party-without-boss` | 没有上司的舞会 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 65 | `height-removal-queries` | 移除子树后的二叉树高度 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 66 | `minimum-score-after-removals` | 从树中删除边的最小分数 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 67 | `can-i-win` | 我能赢吗 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 68 | `matchsticks-to-square` | 火柴拼正方形 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 69 | `partition-k-equal-subsets` | 划分为k个相等子集 | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 70 | `tsp-bitmask-dp` | 旅行商问题 TSP | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 71 | `dp-final-summary` | 动态规划总结篇 | **E (理论/总结)** | 否 | `UNKNOWN` | 纯理论文章或阶段总结卡片，无需算法执行沙盘 |
| 72 | `knapsack-01-standard` | 01背包模版 (采药) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/knapsack-073/knapsack-01-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 73 | `buy-goods-discount` | 夏季特惠 (贪心白嫖+01背包) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/knapsack-073/buy-goods-discount-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 74 | `target-sum-standard` | 目标和 (01背包方案计数) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/knapsack-073/target-sum-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 75 | `last-stone-weight-ii-standard` | 最后一块石头的重量 II | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/knapsack-073/last-stone-weight-ii-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 76 | `dependent-knapsack-standard` | 有依赖的背包模版 (金明的预算方案) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/knapsack-073/dependent-knapsack-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 77 | `top-k-subsequence-sum` | 非负数组前k个最小子序列和 | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/knapsack-073/top-k-subsequence-sum-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 78 | `find-kth-sum` | 找出数组的第K大和 (LeetCode 2386) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/knapsack-073/find-kth-sum-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 79 | `partitioned-knapsack-standard` | 分组背包模版 (通天之分组背包) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/knapsack-074/partitioned-knapsack-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 80 | `coins-from-piles` | 从栈中取出K个硬币的最大面值和 | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/knapsack-074/coins-from-piles-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 81 | `unbounded-knapsack-standard` | 完全背包模版 (疯狂的采药) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/knapsack-074/unbounded-knapsack-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 82 | `regex-matching` | 正则表达式匹配 (LeetCode 10) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/knapsack-074/regex-matching-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 83 | `wildcard-matching` | 通配符匹配 (LeetCode 44) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/knapsack-074/wildcard-matching-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 84 | `buying-hay-min-cost` | 购买足量干草的最小花费 (洛谷 P2918) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/knapsack-074/buying-hay-min-cost-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 85 | `bounded-knapsack-naive` | 多重背包朴素枚举 (洛谷 P1776 宝物筛选) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/knapsack-075/bounded-knapsack-naive-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 86 | `bounded-knapsack-binary` | 多重背包二进制拆分 (洛谷 P1776 宝物筛选) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/knapsack-075/bounded-knapsack-binary-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 87 | `cherry-blossom-viewing` | 观赏樱花 (洛谷 P1833 混合背包) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/knapsack-075/cherry-blossom-viewing-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 88 | `bounded-knapsack-monotonic-queue` | 多重背包单调队列优化 (洛谷 P1776 极速最优解) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/knapsack-075/bounded-knapsack-monotonic-queue-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 89 | `coins-change-kinds` | 能成功找零的钱数种类 (POJ 1742 混合窗口优化) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/knapsack-075/coins-change-kinds-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 90 | `circular-interval-dp-087` | 环形区间 DP 与破环成链 (Class 087) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/dp-084-088/circular-interval-dp-087-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 91 | `counting-dp-inclusion-exclusion-084` | 计数 DP 与错排问题 (Class 084) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/dp-084-088/counting-dp-inclusion-exclusion-084-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 92 | `digit-dp-basic-079` | 数位 DP 基础模型 (Class 079) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/dp-079-083/digit-dp-basic-079-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 93 | `expected-value-dp-081` | 期望 DP 与马尔可夫决策 (Class 081) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/dp-079-083/expected-value-dp-081-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 94 | `game-probability-dp-085` | 博弈概率 DP 与倒推状态 (Class 085) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/dp-084-088/game-probability-dp-085-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 95 | `knuth-quadrangle-inequality-083` | 四边形不等式优化 (Class 083) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/dp-079-083/knuth-quadrangle-inequality-083-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 96 | `palindrome-partitioning-ii` | 分割回文串 II | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/palindrome-partitioning-ii-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 97 | `rerooting-tree-dp-080` | 换根 DP 专题 (Class 080) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/dp-079-083/rerooting-tree-dp-080-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 98 | `slope-optimization-dp-082` | 斜率优化 DP 与单调队列凸包 (Class 082) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/dp-079-083/slope-optimization-dp-082-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 99 | `sos-profile-dp-086` | 高阶状压 DP 与 SOS 高维前缀和 (Class 086) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/dp-084-088/sos-profile-dp-086-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 100 | `tree-knapsack-dp-088` | 树上背包 DP 与泛化物品 (Class 088) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/dp-084-088/tree-knapsack-dp-088-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 101 | `min-path-sum` | 最小路径和 (LeetCode 64) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/dp-067/min-path-sum-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 102 | `word-search` | 单词搜索 (LeetCode 79) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/dp-067/word-search-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 103 | `longest-common-subsequence` | 最长公共子序列 (LCS) | **D (需深化对齐)** | 是 | `src/algorithms/categories/dynamic-programming/dp-067/longest-common-subsequence-renderer.ts` | 已有 YAML，但缺少 4 阶段完整代码行号锚点，或未与 Card 2 深度看板联动 |
| 104 | `longest-palindromic-subsequence` | 最长回文子序列 (LPS) | **D (需深化对齐)** | 是 | `src/algorithms/categories/dynamic-programming/dp-067/longest-palindromic-subsequence-renderer.ts` | 已有 YAML，但缺少 4 阶段完整代码行号锚点，或未与 Card 2 深度看板联动 |
| 105 | `tree-count-height-m` | 节点数n高度不大于m的二叉树结构数 | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/dp-067/tree-count-height-m-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 106 | `longest-increasing-path` | 矩阵中的最长递增路径 (LeetCode 329) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/dp-067/longest-increasing-path-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 107 | `profile-dp-125` | 轮廓线 DP (Class 125) | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 108 | `ternary-dp-126` | 三进制状压 DP (Class 126) | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 109 | `binary-lifting-dp-129` | 倍增优化 DP (Class 129) | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 110 | `monotonic-queue-dp-130` | 单调队列优化 DP (Class 130) | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 111 | `word-break-ii` | Hard 23: 单词拆分 II (Word Break II) | **B (私有独立实现)** | 否 | `src/algorithms/categories/dynamic-programming/word-break-ii-renderer.ts` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 112 | `dungeon-game-reverse-dp` | 大厂高频真题: 地下城游戏反向 DP (Dungeon Game) | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 113 | `stock-trading-state-machine` | 大厂高频真题: 股票交易全系列状态机 DP (Stock Trading) | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 114 | `burst-balloons` | 大厂高频真题: 戳气球 (Burst Balloons) | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 115 | `hard-russian-doll-envelopes` | 大厂高频真题: 俄罗斯套娃信封问题 (Russian Doll Envelopes) | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 116 | `freedom-trail-ring-dp` | 大厂高频真题: 自由之路环形 DP (Freedom Trail) | **B (私有独立实现)** | 否 | `UNKNOWN` | 完全游离在顶层抽象之外，自写独立 DOM/HTML，无标准 4 阶段演化标签，无顶层代码高亮与回溯闭环 |
| 117 | `climb-stairs` | 爬楼梯（动态规划） | **D (需深化对齐)** | 是 | `src/algorithms/categories/dynamic-programming/climb-stairs-renderer.ts` | 已有 YAML，但缺少 4 阶段完整代码行号锚点，或未与 Card 2 深度看板联动 |

## 3. 重构标准执行规范 (按用户明确要求的执行方案)

1. **先解决 DP 的，一个一个解决**：绝不一次性修改大量算法导致漏改；
2. **解决前先告知**：明确指出即将重构的算法 ID、当前存在的问题与解决前的样子；
3. **重构完成后报告并交由用户验证**：展示具体修复的 Seam 接缝、YAML 事实源、Card 1 / Card 2 展现与自动化门禁验证结果。
