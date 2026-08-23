# 深入浅出动态规划教学视口与趣味动画设计规格 (Intuitive DP Animated Explainer Spec)

## 1. 目标与背景 (Goals & Context)
当前的动态规划算法演示虽然具备完整的代码联动、状态表格与变量监视，但对于初学者而言，二维数字表格与数学转移方程依然存在一定的理解门槛。
为了让算法学习变得**深入浅出、具象生动且富有乐趣**，系统将引入**多视角教学视口切换系统**，提供三种全新的直观趣味呈现方式，并通过顶部的视口选择器无缝切换。

---

## 2. 视角切换系统架构 (View Switcher Architecture)

### 2.1 视口模式定义 (`DpViewportMode`)
在 `src/core/interfaces.ts` 中定义视口枚举与持久化 key：
```typescript
export type DpViewportMode = 'workshop' | 'story' | 'backtrack' | 'matrix';
export const DP_VIEWPORT_KEY = 'algo_dp_preferred_viewport';
```

### 2.2 视口选择器 UI 布局
在 `dp-demo.html` 核心演示区顶部配置视口药丸切换栏：
```html
<div class="dp-view-switch-row">
  <span class="dp-view-label">🎨 教学视口：</span>
  <div class="dp-view-pills" id="dp-viewport-selector">
    <button class="dp-view-btn is-active" data-view="workshop" title="字符实体卡片 3D 翻转/弹跳/消散变形动画">🎭 变形工作台</button>
    <button class="dp-view-btn" data-view="story" title="通俗大白话情景卡片与三路分支比对">📖 白话图解</button>
    <button class="dp-view-btn" data-view="backtrack" title="最优编辑路径光点逆向穿梭与步骤时间轴">🎮 路径回溯</button>
    <button class="dp-view-btn" data-view="matrix" title="经典 2D DP 表格与状态推导树">📊 经典矩阵</button>
  </div>
</div>
```

---

## 3. 三大趣味视口功能规格 (Features of 3 New Viewports)

### 3.1 🎭 实体变形工作台 (Transformation Workshop)
* **字符实体卡片槽**：
  * 源字符串 $S$ 与目标字符串 $T$ 分别排列为上下两排立体浮雕卡片。
* **物理微动作动效库**：
  1. 🟢 **匹配/跳过 (Match)**：两张字符卡片高亮绿色辉光，中间产生激光连接线与轻微下沉同步呼吸；
  2. 🗑️ **删除 (Delete)**：源字符卡片向上抛起 30px，伴随透明度降低与粒子淡出消散；
  3. ➕ **插入 (Insert)**：目标字符卡片从上方带着弹性 Spring 动画落下插入，邻近卡片平滑向两侧推开；
  4. 🔄 **替换 (Replace)**：卡片执行 3D Y 轴 180° 翻转（`transform: rotateY(180deg)`），背面翻转出新字符并伴随金橙色边框脉冲。

### 3.2 📖 白话图解剧场 (Story & Narrative Explainer)
* **大白话情景卡片 (Goal & Dilemma Card)**：
  * 清晰标明当前小目标（例如：“🎯 **当前目标**：如何用最少步数将前缀 `"ho"` 变成 `"ros"`？”）。
* **三路分支“比武招亲”决策条 (3-Branch Comparison Strip)**：
  * **删除分支**：先将 `"h"` 变成 `"ros"`（历史最少 $A$ 步），再删末尾字符 $\rightarrow$ 总成本 $A + 1$；
  * **插入分支**：先将 `"ho"` 变成 `"ro"`（历史最少 $B$ 步），再插入末尾字符 $\rightarrow$ 总成本 $B + 1$；
  * **替换分支**：先将 `"h"` 变成 `"ro"`（历史最少 $C$ 步），再替换字符 $\rightarrow$ 总成本 $C + 1$。
* **胜出高亮与结论**：用绿色徽章点亮最终选中的最优决策，并给出通俗解释。

### 3.3 🎮 路径回溯探索与时间轴 (Backtracking Timeline Explorer)
* **逆向最优光点穿梭**：
  * 自动从右下角最终答案单元格逆向寻路回起点 `(0, 0)`，在 DP 矩阵与工作台卡片之间点亮连续的光点转移连线。
* **可交互步骤时间轴 (Interactive Operations Timeline)**：
  * 呈现有序的编辑操作列表：`[ 1. 替换 h->r ]` $\rightarrow$ `[ 2. 保持 o ]` $\rightarrow$ `[ 3. 删除 r ]` $\dots$
  * 点击时间轴任意一步，主视口实时定位并播放该步骤的卡片变形微动作。

---

## 4. 数据结构增强 (Data Model Extensions)

在 `DpDemoStep` 中补充结构化动作与情景元数据：
```typescript
export interface DpActionMeta {
  type: 'match' | 'delete' | 'insert' | 'replace' | 'init' | 'done';
  charA?: string;
  charB?: string;
  indexA?: number;
  indexB?: number;
  cost?: number;
}

export interface DpStoryMeta {
  goal: string;
  candidates: Array<{
    name: string;
    formula: string;
    cost: number;
    desc: string;
    isChosen: boolean;
  }>;
  conclusion: string;
}

export interface DpBacktrackStep {
  i: number;
  j: number;
  action: 'match' | 'delete' | 'insert' | 'replace';
  desc: string;
}
```

---

## 5. 验证与回归计划 (Verification Plan)
1. **TypeScript 静态检查**：运行 `npx tsc --noEmit` 保证类型安全与 0 编译错误。
2. **多视角切换平滑性**：验证在播放、暂停或单步执行中切换 4 个视角时，进度与数据 100% 保持一致无闪烁。
3. **响应式与性能**：确保 3D 动画在低功耗设备上 60fps 流畅运行（使用硬件加速 `transform: translate3d`）。
