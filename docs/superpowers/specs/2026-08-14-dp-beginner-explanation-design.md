# 动态规划初学者讲解与决策拆解系统设计规范 (DP Beginner Explanation Design)

## 1. 目标与背景 (Goals & Context)

在动态规划（如 0-1 背包、最后一块石头的重量 II、分割等和子集等）可视化演示中，初学者常常因公式抽象、循环机制不易理解、代码与图表无法实时对应而产生困惑。
本设计旨在为动态规划可视化器引入一套**多维度、沉浸式、初学者友好**的讲解系统，帮助读者无缝理解每一步的状态推导、核心公式物理意义以及 0-1 背包的关键设计考量。

---

## 2. 核心模块与功能设计 (Core Modules)

### 模块 1：实时决策思维拆解卡片 (Dynamic Decision Breakdown Card)
在状态转移时，提供结构化的“决策对比”UI：
- **不选分支 (Don't Take)**：
  - 标签：`🚫 保持原有`
  - 物理意义：不放入当前物品/石块，保持容量 $j$ 的原有最大价值/重量 $\rightarrow dp[j] = \text{oldVal}$。
- **选入分支 (Take)**：
  - 标签：`🟢 放入当前`
  - 物理意义：消耗当前物品重量 $w$，取剩余容量 $j - w$ 的最优解 $\rightarrow dp[j - w] + w = \text{newVal}$。
- **最优决策 (Result Choice)**：
  - 标签：`⚖️ 取最优`
  - 结论：$\max(\text{oldVal}, \text{newVal})$，将胜出的值写入当前单元格 $dp[j]$。

### 模块 2：公式与代码数值实时代入 (Live Formula & Variable Substitution)
- 升级 `dp-formula` 区域：
  - 第一行显示标准抽象递推公式：`dp[j] = Math.max(dp[j], dp[j - stones[i]] + stones[i])`
  - 第二行以高亮徽章形式显示**数值代入版**：`dp[5] = max( 0 [原值], 0 + 2 [依赖 dp[3]] ) => 2`
  - 与一维 DP 数组中的**黄色依赖格（$j-w$）**和**绿色当前格（$j$）**形成强烈的视觉联动。

### 模块 3：核心考点新手向导折叠面板 (Beginner Coach & FAQ Accordion)
在页面顶部或侧边提供可随时展开/收起的「💡 新手避坑与核心考点」抽屉：
1. **Q1: 为什么要求目标容量 $target = \lfloor sum / 2 \rfloor$？**
   - 两堆石头的差值要最小，等价于让其中一堆的重量尽可能接近总重量的一半。
2. **Q2: 为什么 0-1 背包一维滚动数组的容量 $j$ 必须倒序遍历？**
   - 正序遍历会导致同一个物品在当前轮被累加多次（变成完全背包）；倒序能保证在计算 $dp[j]$ 时用到的 $dp[j - w]$ 尚未被当前物品修改，依然是上一轮的历史状态。
3. **Q3: 为什么最后两堆石头的最小差值是 $sum - 2 \times dp[target]$？**
   - 一堆的最大重量是 $dp[target]$，另一堆则是 $sum - dp[target]$，二者之差就是 $(sum - dp[target]) - dp[target] = sum - 2 \times dp[target]$。

---

## 3. UI 布局与视觉规范 (UI/UX & Aesthetics)

1. **色彩搭配**：
   - 依赖与历史（黄色/琥珀色）：`#fbbf24` / `rgba(251, 191, 36, 0.15)`
   - 当前与胜出（绿色/翠绿）：`#34d399` / `rgba(52, 211, 153, 0.18)`
   - 玻璃拟态卡片背景：`rgba(20, 18, 38, 0.55)` + `backdrop-filter: blur(16px)`
2. **响应式自适应**：
   - 在宽屏下并排展示或纵向流式排布，不挤占一维数组与决策树空间。
   - FAQ 折叠面板支持一键展开/收起，保持界面清爽。

---

## 4. 技术实现方案 (Technical Architecture)

- **数据层扩展**：
  - 在 `DpDemoStep` 中新增 `breakdown` 字段，包含 `{ notTake: { val: number | string, desc: string }, take: { val: number | string, depIdx?: number, itemVal?: number, total: number | string }, chosen: 'take' | 'notTake' | 'same' }`。
  - 在 `knapsackSteps` 与 `arrayLinearSteps` 中自动计算并填充 `breakdown` 数据。
- **渲染层更新**：
  - 在 `dp-demo.html` 中注入决策拆解与 FAQ 结构及样式。
  - 在 `dp-demo-visualizer.ts` 中实现 `renderBreakdown()` 与 `renderFAQ()`。
- **向后兼容**：
  - 没有 `breakdown` 数据的通用 DP 步骤自动隐藏拆解卡片，平滑降级。
