# 深入浅出动态规划教学视口与趣味动画实现计划 (Intuitive DP Explainer Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建多视角教学视口系统，包含「🎭 实体变形工作台」、「📖 白话图解剧场」、「🎮 路径回溯探索」与「📊 经典矩阵」，支持一键无缝切换、3D 物理动作动画与大白话决策对比。

**Architecture:** 在 `StepVisualizer` 中引入 `viewportMode` 统一驱动框架与 `localStorage` 偏好记忆；在 `dp-demo-visualizer.ts` 中构建三大独立视口渲染器与 CSS 3D 动画引擎；在 `dp-generated-renderers.ts` 中增强每步的 `actionMeta`、`storyMeta` 与 `backtrackPath`。

**Tech Stack:** TypeScript, Vanilla CSS (3D Transform / Keyframes), HTML5, Vite.

## Global Constraints
- 所有操作必须保持 60fps 流畅硬件加速渲染（`transform: translate3d`）。
- 切换视口不能重置或丢失当前的播放进度 `currentIndex`。
- 与右侧代码面板和变量监视器保持 100% 联动。

---

### Task 1: 教学视口模式定义与 UI 药丸切换器
**Files:**
- Modify: `src/core/interfaces.ts`
- Modify: `src/algorithms/categories/dynamic-programming/dp-demo.html`
- Modify: `src/core/step-visualizer.ts`

**Interfaces:**
- Produces: `DpViewportMode = 'workshop' | 'story' | 'backtrack' | 'matrix'`, `getSavedViewportMode()`, `saveViewportMode()`

- [ ] **Step 1: 在 `interfaces.ts` 中定义 `DpViewportMode` 及存储辅助函数**
```typescript
export type DpViewportMode = 'workshop' | 'story' | 'backtrack' | 'matrix';
export const DP_VIEWPORT_KEY = 'algo_dp_preferred_viewport';
export function getSavedViewportMode(): DpViewportMode {
  try {
    const saved = localStorage.getItem(DP_VIEWPORT_KEY);
    if (saved === 'workshop' || saved === 'story' || saved === 'backtrack' || saved === 'matrix') return saved;
  } catch { /* ignore */ }
  return 'workshop';
}
export function saveViewportMode(mode: DpViewportMode): void {
  try { localStorage.setItem(DP_VIEWPORT_KEY, mode); } catch { /* ignore */ }
}
```

- [x] **Step 2: 在 `dp-demo.html` 中添加视口药丸切换栏和各视口容器 DOM**
- [x] **Step 3: 在 `step-visualizer.ts` 中绑定 `viewportMode` 切换事件并刷新视图**
- [x] **Step 4: 运行 `npx tsc --noEmit` 校验**

---

### Task 2: 🎭 实体变形工作台渲染器与 3D 物理动作动画
**Files:**
- Modify: `src/algorithms/categories/dynamic-programming/dp-demo.html`
- Modify: `src/algorithms/categories/dynamic-programming/dp-demo-visualizer.ts`

**Interfaces:**
- Produces: `renderTransformationWorkshop(step: DpDemoStep): void`
- Animations:
  - 🟢 匹配/锁定：`.is-matched` + 激光连接高亮
  - 🗑️ 删除：`.is-deleted` (Fly-up & Fade-out)
  - ➕ 插入：`.is-inserted` (Spring-bounce from top)
  - 🔄 替换：`.is-replaced` (3D rotateY 180° + energy glow)

- [x] **Step 1: 在 `dp-demo.html` 添加 3D 舞台卡片样式与 `@keyframes` 动画**
- [x] **Step 2: 在 `dp-demo-visualizer.ts` 中实现 `renderTransformationWorkshop`**
- [x] **Step 3: 校验单步切换时的动画触发与卡片状态**

---

### Task 3: 📖 白话图解剧场（情景卡片与三路分支决策条）
**Files:**
- Modify: `src/algorithms/categories/dynamic-programming/dp-demo-visualizer.ts`
- Modify: `src/algorithms/categories/dynamic-programming/dp-generated-renderers.ts`

**Interfaces:**
- Consumes: `DpStoryMeta` on `DpDemoStep`
- Produces: `renderStoryTheatre(step: DpDemoStep): void`

- [x] **Step 1: 在 `dp-generated-renderers.ts` 中为二维 DP 步生成白话 `storyMeta`**
- [x] **Step 2: 在 `dp-demo-visualizer.ts` 中实现 `renderStoryTheatre` 渲染情景卡片与三路对比条**
- [x] **Step 3: 测试两阶段模式与单步模式下的白话文同步更新**

---

### Task 4: 🎮 路径回溯探索与交互时间轴
**Files:**
- Modify: `src/algorithms/categories/dynamic-programming/dp-demo-visualizer.ts`
- Modify: `src/algorithms/categories/dynamic-programming/dp-demo.html`

**Interfaces:**
- Produces: `renderBacktrackExplorer(step: DpDemoStep): void`, `computeOptimalEditPath()`

- [x] **Step 1: 实现最优回溯路径寻路算法（从 `(m,n)` 追溯至 `(0,0)`）**
- [x] **Step 2: 渲染有序操作时间轴，支持点击任意节点高亮与跳转**
- [x] **Step 3: 在矩阵上动态点亮金色回溯转移连线与流动光球**

---

### Task 5: 全量回归与类型检查
**Files:**
- Test: 全题型适配验证（编辑距离、LCS、最长重复子数组、回文子串等）

- [x] **Step 1: 运行 `npx tsc --noEmit` 确保 0 错误**
- [x] **Step 2: 验证 4 个视口热切换无任何状态抖动**
