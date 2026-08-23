# 动态规划初学者讲解与决策拆解系统 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为动态规划演示平台打造全方位的初学者讲解系统，包含“实时决策对比拆解卡片”、“公式数值代入”、“新手核心考点 FAQ 折叠抽屉”。

**Architecture:** 
- 在数据层（`DpDemoStep`）扩展 `breakdown` 与增强型公式结构。
- 在算法生成器（`knapsackSteps`）中为每一步生成“不选” vs “选入”的分支数据。
- 在表现层（`dp-demo.html` / `dp-demo-visualizer.ts`）构建玻璃拟态卡片，渲染动态决策流与 FAQ 折叠卡片。

**Tech Stack:** TypeScript, Vanilla CSS, DOM API, Tauri/Vite

## Global Constraints
- 维持现有深色玻璃感（green→amber 渐变）设计语言与视觉规范。
- 保证无 `breakdown` 数据的其它 DP 算法平滑降级（自动隐藏拆解区域）。
- 严格遵循 TypeScript 类型检查，`npx tsc --noEmit` 0 错误。

---

### Task 1: 数据模型扩展与背包算法步进生成增强

**Files:**
- Modify: `src/algorithms/categories/dynamic-programming/dp-demo-visualizer.ts`
- Modify: `src/algorithms/categories/dynamic-programming/dp-generated-renderers.ts`

**Interfaces:**
- `DpDecisionBreakdown`:
  ```typescript
  export interface DpDecisionBranch {
    title: string;
    tag: string;
    action: string;
    formula: string;
    val: number | string;
    depIdx?: number;
  }
  export interface DpDecisionBreakdown {
    currentCap: number;
    itemWeight: number;
    notTake: DpDecisionBranch;
    take: DpDecisionBranch;
    winner: 'take' | 'notTake' | 'same';
    conclusion: string;
  }
  ```

- [x] **Step 1: 在 `dp-demo-visualizer.ts` 中定义 `DpDecisionBreakdown` 接口并加入 `DpDemoStep`**
- [x] **Step 2: 在 `dp-generated-renderers.ts` 的 `knapsackSteps` 中生成详细的 `breakdown` 与数值代入公式**
- [x] **Step 3: 运行 `npx tsc --noEmit` 校验类型定义无误**

---

### Task 2: UI 容器与玻璃拟态样式定义

**Files:**
- Modify: `src/algorithms/categories/dynamic-programming/dp-demo.html`

**Interfaces:**
- 新增 CSS 类：
  - `.dp-faq-panel`: 可折叠的新手考点卡片
  - `.dp-breakdown-panel`: 决策思维拆解容器
  - `.dp-branch-grid`: 左右双分支对比网格
  - `.dp-branch-card`: 单个决策分支卡片（不放 vs 放入）
  - `.dp-branch-card.is-winner`: 胜出分支的高亮外边框与辉光

- [x] **Step 1: 在 `dp-demo.html` `<style>` 中添加决策拆解卡片与 FAQ 折叠样式**
- [x] **Step 2: 在 `dp-demo.html` DOM 结构中插入 `#dp-faq` 与 `#dp-breakdown` 挂载点**

---

### Task 3: 视图渲染器逻辑实现与动态挂载

**Files:**
- Modify: `src/algorithms/categories/dynamic-programming/dp-demo-visualizer.ts`

**Interfaces:**
- `renderBreakdown(step: DpDemoStep): void`
- `renderFAQ(): void`
- `renderFormula(step: DpDemoStep): void`

- [x] **Step 1: 实现 `renderBreakdown()` 方法，动态渲染双分支对比与决策胜出标记**
- [x] **Step 2: 实现 `renderFAQ()` 方法，支持点击手风琴展开/收起核心考点**
- [x] **Step 3: 优化 `renderFormula()`，支持公式中展示真实变量代入值**
- [x] **Step 4: 在 `renderStep()` 中集成各模块渲染**

---

### Task 4: 编译校验与全流程功能验证

**Files:**
- Check: All modified files

- [x] **Step 1: 运行 `npx tsc --noEmit` 验证项目编译通过**
- [x] **Step 2: 验证步进播放时决策拆解卡片、数值公式与代码高亮无缝联动**
