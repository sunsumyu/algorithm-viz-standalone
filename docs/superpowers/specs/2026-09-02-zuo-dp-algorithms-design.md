# 左程云《算法通关课》全量动态规划 (DP) 算法实现设计规范 (Design Spec)

## 1. 概述与背景

本项目（`algorithm-viz-standalone`）致力于构建高质量、生产级、双阶段零滚动的算法可视化交互系统。
本设计规范旨在参考左程云老师《算法和数据结构通关课》（[algorithm-journey/ppt](https://github.com/algorithmzuo/algorithm-journey/tree/main/ppt)）中的全部动态规划（DP）教学体系（涵盖基础课 066~088 以及进阶扩展 123、125~132），将所有尚未实现的经典与高阶 DP 算法系统化地实现并集成到现有的 `DpStepEngine` 与可视化系统中。

---

## 2. 目标算法清单与分类体系

本期设计将补齐 7 大核心专项，共计 22 道精选经典动态规划算法 Spec 与完整测试集：

```
src/algorithms/categories/dynamic-programming/specs/
├── interval/                          # 【算法讲解076~077】区间 DP
│   ├── merge-stones.spec.ts           # 石子合并 (左神经典 / LC 1000)
│   ├── burst-balloons.spec.ts         # 戳气球 (LC 312)
│   ├── predict-the-winner.spec.ts     # 预测赢家 (LC 486)
│   ├── min-score-triangulation.spec.ts# 多边形三角剖分最低得分 (LC 1039)
│   ├── strange-printer.spec.ts        # 奇怪的打印机 (LC 664)
│   └── interval-specs.test.ts
├── tree/                              # 【算法讲解078~079 & 123】树型 DP 与换根 DP
│   ├── max-path-sum.spec.ts           # 二叉树中的最大路径和 (LC 124)
│   ├── binary-tree-cameras.spec.ts    # 监控二叉树 (LC 968)
│   ├── tree-diameter.spec.ts          # 树的直径与重心 (左神经典 / LC 543)
│   ├── course-selection.spec.ts       # 选课 (树上背包问题)
│   ├── tree-rerooting.spec.ts         # 换根 DP (树中距离之和 / LC 834)
│   └── tree-specs.test.ts
├── bitmask/                           # 【算法讲解080~081】状态压缩 DP
│   ├── tsp.spec.ts                    # 旅行商问题 (TSP 最短汉密尔顿回路)
│   ├── partition-k-subsets.spec.ts    # 划分为k个相等的子集 (LC 698)
│   ├── domino-tromino-tiling.spec.ts  # 多米诺和三格骨牌铺瓦 (LC 790)
│   └── bitmask-specs.test.ts
├── three-dimension/                   # 【算法讲解069】三维 DP
│   ├── knight-probability.spec.ts     # 骑士在棋盘上的概率 (LC 688)
│   ├── out-of-boundary-paths.spec.ts  # 出界的路径数 (LC 576)
│   ├── profitable-schemes.spec.ts     # 盈利计划 (LC 879 二维费用三维状态)
│   └── three-dimension-specs.test.ts
├── digit/                             # 【算法讲解084~085】数位 DP
│   ├── count-digit-one.spec.ts        # 数字 1 的出现次数 (LC 233)
│   ├── non-negative-consecutive-ones.spec.ts # 不含连续1的非负整数 (LC 600)
│   └── digit-specs.test.ts
├── subarray-extension/                # 【算法讲解070~072】子数组与 LIS 深度扩展
│   ├── max-circular-subarray.spec.ts  # 环形子数组最大和 (LC 918)
│   ├── max-product-subarray.spec.ts   # 乘积最大子数组 (LC 152)
│   ├── magic-scroll.spec.ts           # 魔法卷轴问题 (左神课时71独门经典)
│   ├── russian-doll-envelopes.spec.ts # 俄罗斯套娃信封 (LC 354 二维排序+LIS二分)
│   └── subarray-extension-specs.test.ts
└── optimization/                      # 【算法讲解082~083 & 130】观察与单调性优化 DP
    ├── super-egg-drop.spec.ts         # 高楼扔鸡蛋 (LC 887 DP+观察二分优化)
    ├── sliding-window-dp.spec.ts      # 单调队列优化 DP (跳跃游戏VI / LC 1696)
    └── optimization-specs.test.ts
```

---

## 3. 技术标准与规范设计

### 3.1 严格遵循 `AlgorithmSpec` 规范
每一个算法 Spec 文件导出独立的常量对象（如 `MergeStonesSpec`），其结构必须完整覆盖：
1. **基础元数据**：`id`, `name`, `category`, `description`, `difficulty`
2. **题目信息 (`problem`)**：
   - `leetcodeId`, `leetcodeUrl`, `difficulty`, `tags`
   - `description`：清晰的 HTML 题目说明与公式排版
   - `inputDesc`, `outputDesc`, `examples`（包含多组典型用例和图解说明）, `constraints`
3. **语义行映射 (`semanticLines`)**：
   - 映射 `entry`, `guard`, `init`, `loopCheck`, `innerLoopCheck`, `stateTransfer`, `loopExit`, `returnResult`
   - 精确对齐 4 种语言（Java, C++, Python, JavaScript）的代码行号
4. **多语言代码与深度教学 (`code`)**：
   - 4 种主流语言的标准规范实现代码
   - `lineExplanations`：针对 4 种语言每行核心逻辑的富文本高亮注释与教学解析
   - `keyPoints`：包含 `thinking`（核心思维）、`state`（状态定义）、`equation`（状态转移方程）、`initAndBounds`（初始化与边界）、`complexity`（时间与空间复杂度分析）
   - `faqList`：收集 2~3 个面试高频核心追问与解答（如递归分支去重、空间压缩技巧、枚举优化本质）
5. **单步执行追踪引擎 (`generateSteps`)**：
   - 输出完整的 `DpTraceStep[]` 阵列
   - 包含变量区（`vars`）、当前坐标（`current`）、依赖坐标（`dependencies`）、状态转移代入公式（`formulaSubstituted`）、监控指标（`metrics`）、日志文本（`message`, `log`）、高亮代码行（`codeLine`）

### 3.2 专项 DP 的状态可视化适配

| DP 专题 | 可视化结构展示 | 依赖关系捕获方式 |
| :--- | :--- | :--- |
| **区间 DP** | 上三角二维矩阵 `dp[i][j]` ($i \le j$)，按区间长度 $len$ 沿对角线依次推进 | 高亮 $dp[i][k]$ 和 $dp[k+1][j]$，公式显示两端及合并代价 |
| **树型 DP** | 树形结构 `tree: DpTreeNode`，按后序 DFS 递归展开 | 节点自底向上回溯，显示 `yes/no` 或 `dp[node]` 聚合向量 |
| **状压 DP** | 二进制掩码表格（行/列为状态整数），附带二进制位标签（如 `0b1011 -> {0,1,3}`） | 捕获从子掩码 `mask ^ (1<<i)` 向当前 `mask` 的状态跃迁 |
| **三维 DP** | 3D 切片投影或当前步骤层二维网格（如棋盘步数 $k$） | 高亮第 $k-1$ 层向第 $k$ 层的周边邻格流动 |
| **数位 DP** | 逐位决策树（`pos`, `sum/pre`, `limit`, `isNum`） | 展示记忆化缓存命中与递归深度剪枝分支 |
| **子数组/LIS扩展** | 双轨/多轨 1D 数组（如 `maxDp[i]` 与 `minDp[i]`、`ends[i]` 二分数组） | 展现历史极值更新与二分定位过程 |
| **优化 DP** | 状态数组 + 单调队列/二分查找窗口辅助指示器 | 展现窗口滑动极值获取 $O(1)$ 与二分缩减决策范围 |

---

## 4. 注册与测试验证计划

1. **统一导出与注册**：
   - 在 `src/algorithms/categories/dynamic-programming/specs/index.ts` 中集中导出所有新建 Spec，并统一通过 `DpStepEngine.register(spec)` 注册。
   - 配置别名映射，保证 ID 检索、短名检索和自动化运行无缝连通。
2. **全覆盖单元测试**：
   - 每个专项子目录创建配套的 `*-specs.test.ts`。
   - 验证：Spec 元数据完整性、4 语言行号与映射一致性、边界与示例输入的 `generateSteps()` 执行正确性、无崩溃且最终结果与标准算法一致。
   - 在主测试套件 `specs/complete-specs.test.ts` 中增加断言，确保全量 DP Spec 均已正确注册并能在引擎中执行。

---
