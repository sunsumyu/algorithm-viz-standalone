---
name: binary-tree-parity-audit
description: "二叉树演示单算法一致性审计。一次会话仅审计一个二叉树算法 (Kanban WIP=1)；统一 TreeCanvasAdapter/树上挂树/图形化推演 SSOT 基线，阻断私有画布、文本墙兜底、步数密度不足与行号冻结。"
---

# Skill: binary-tree-parity-audit (二叉树演示单算法一致性审计)

## 何时唤起

每次对**任意一个**二叉树算法演示做一致性检查/修复前，**必须先调用本 skill**。一次会话只审计**一个**算法（Kanban WIP=1，GEC 极简微循环），严禁一次性批量检查多个算法。

## 标准基线 (SSOT · 唯一事实来源)

所有二叉树算法演示必须走统一共享深模块，任何"自己搞一套"都是违规：

| 能力 | 唯一标准实现 | 禁止的自制版本 |
| :--- | :--- | :--- |
| 树拓扑画布 | `TreeCanvasAdapter.renderTree` (`src/core/renderers/adapters/tree-canvas-adapter.ts`) | 私有 `renderTreeSvg`、内联 SVG 拼接、硬编码坐标表 |
| 树上挂树全景 | `BinaryTreeOfTreesSynthesizer` 自动合成 (USNE 阶段 4 挂载 `step.treeOfTrees`) | 手绘推演面板、跳过合成器 |
| Card 1 全景推演子视图 | `StaticDeductionTreeAdapter.renderDeduction` 走 `step.treeOfTrees` → `TreeOfTreesCanvasAdapter` **图形化母树** | 落入 `DeductionRendererRegistry` 讲义文本墙兜底 |
| 空调用探针 | `StepNullProbe` 契约 (`{parentVal, parentId?, branch, phase}`) | 无探针的空基底帧 (画布断电) |
| 步进颗粒度 | 递归五段式生命周期：入口帧→判空帧→比较帧→深入帧→**返回归约帧**→闭合帧；比较与移动严格分离 | 多状态合并成一步、子调用返回后父帧无归约步、行号冻结/跳变 |

## 非标准红线 (命中任意一条即 FAIL)

1. Card 1 "全景推演树" 子视图渲染的是**讲义文本墙**（含未渲染 `$...$` 标记）而非图形化母树卡片 —— 步骤缺 `treeOfTrees`/可提取 `tree`，落入 `DeductionRendererRegistry` 兜底。
2. 沙盘缺少「🌳 树上挂树 | 🌲 单树实时沙盘」切换器且无 `disableTreeOfTrees` 的正当书面理由（正当理由：序列流/栈范式等非树形主视觉算法，如 valid-bst 前序序列栈版）。
3. 适配器导入 `tree-036-037-shared` 的私有 `renderTreeSvg` 或自绘 SVG。
4. 步骤携带的 `tree` 不是核心 `TreeNode` 链接树（如 `TreeNode036` 平铺数组直接渲染）。
5. 递归算法步进不含五段式生命周期；`min(各阶段步数) < 4`。
6. 连续步 codeLine 冻结或跳变（一行一步破坏）。

## 单算法审计流程 (每次会话执行一次)

设目标算法 id 为 `$ID`、卡片名为 `$NAME`：

### 第 0 步 · 静态侦察 (先看再点)
```bash
# 画布走线：是否委托统一深模块
grep -rn "renderCanvas|renderTree" src/algorithms/categories/tree/**/<目标>-renderer.ts
# 步骤数据：是否发射链接树与 treeOfTrees
grep -n "tree:|treeOfTrees|nullProbe" src/core/renderers/adapters/<目标>-step-compiler.ts
# 私有画布红线
grep -n "renderTreeSvg|disableTreeOfTrees" <相关 adapter/renderer>
```

### 第 1 步 · 无头单算法探针 (1920×1080，零孤儿标签页)
用 Playwright 独立 headless 脚本（参考 `scripts/verify-tree-category-batch.ts` 的单算法切片）对 `$NAME` 执行并断言：
1. 详情页挂载，沙盘容器存在；
2. 沙盘含 `#btn-subview-tot` 切换器（或记录正当豁免理由）；
3. 点击 `#btn-card1-view-deduction` → **断言 `#dsp-deduction-container` 内 SVG > 0**（图形化母树；= 0 即文本墙红灯）；
4. 每个阶段步进**走完全部步骤**，断言：总步数 ≥ 4、无 console/page 错误、树形范式沙盘 SVG 起终态常驻（防断电）；
5. 递归算法抽验步骤序列含：入口帧/判空帧/比较帧/深入帧/返回归约帧，且 codeLine 逐步推进不冻结。

### 第 2 步 · 修复 (若踩红线)
按参考配方迁移（黄金基准：`lca-renderer.ts` + `lca-canvas-adapter.ts` + `lca-step-compiler.ts`；BST 版参照 `lowest-common-ancestor-bst-*` 的五段式改造）：
1. 步骤编译器：为每步挂核心 `TreeNode` 链接树（USNE 自动合成 `treeOfTrees`），递归补五段式帧，空基底挂 `StepNullProbe`；
2. 画布适配器：改委托 `TreeCanvasAdapter.renderTree`（labels 按**节点 id** 键控防 id/val 错位），转发 `nullProbe`；
3. `#dsp-custom-metrics-container` 严禁设 `height: 100%`（自引用污染 PanelBounds 钳制，历史事故：bst-lca-037 面板拉不动）。
修复时**必须保留**其他会话对同文件的并行改动——先 Read 最新状态再叠加。

### 第 3 步 · 门禁与复验 (Exit Code 0 为唯一判据)
```bash
npm run typecheck
npm run test:gate
npm run test:presentation
# 第 1 步的无头探针重跑目标算法 → 全部断言通过 + 终态截图留档 D:/tmp/tree-parity-audit/<id>.png
```

### 第 4 步 · 报告
单算法审计报告固定格式：`结论(PASS/FAIL) · 红线命中项 · 修复内容 · 步数前后对比 · 门禁结果 · 截图路径`。报告完成后**清空会话**（/clear），下一个算法新会话再审计。

## 已审定基准 (Golden Samples)

- `lca` (LC 236)：树上挂树 + 图形推演 + 空探针 + 39 步密度 —— 满分基准
- `tree-037-lowest-common-ancestor-bst` (LC 235)：五段式 11/17/8 步 + 返回归约帧
- `tree-serialization-037` 阶段 3：逐 token 发射 13 步（静态证明类算法的颗粒度基准）

## 审计总台账 (39 个二叉树算法)

| # | 算法 id | 状态 |
| :-- | :-- | :-- |
| 1 | tree-037-trim-bst | ✅ 已修复过审 (2026-11-01: 编译器重写为真实递归五段式 47 步 + TreeCanvasAdapter 迁移 + 推演子视图 SVG=6 图形化；顺带修复 parseTreeArray 裸数字输入与 LC669 官方示例树) |
| 2 | tree-traversal-iterative-020 | 🔴 待审计 (推演SVG=0) |
| 3 | tree-serialization-021 | 🔴 待审计 (私有 renderTreeSvg) |
| 4 | tree-036-levelorder-serialize | 🔴 待审计 (推演SVG=0) |
| 5 | tree-037-house-robber-iii | 🔴 待审计 (推演SVG=0) |
| 6 | tree-036-preorder-serialize | 🔴 待审计 (推演待探) |
| 7 | balanced-binary-tree (tree-037-balanced-binary-tree) | 🟡 待审计 (disableTreeOfTrees 需核豁免理由与推演 tab) |
| 8-39 | 其余 32 个 (lca / bst-lca-037 / tree-traversal / tree-invert / tree-symmetric / tree-recursion-patterns-019 / max-sum-bst-036 / binary-tree-level / bst-delete / bst-min-diff / bst-modes / bst-search / bst-to-gst / build-tree / path-sum / sorted-array-to-bst / valid-bst(序列范式) / tree-depth / min-depth / binary-tree-maximum-path-sum / sum-root-to-leaf-numbers / all-paths / left-leaves / bottom-left / merge-trees / find-duplicate-subtrees / max-tree / tree-036-zigzag-level-order / tree-036-width-of-binary-tree / tree-036-completeness-binary-tree / tree-036-count-complete-tree-nodes / tree-serialization-037) | 🟢 深度体检已过 (按抽样复核原则，仍按序逐个走第 0-1 步确认) |

> 台账状态在每轮审计后由 Agent 更新写回本文件。
