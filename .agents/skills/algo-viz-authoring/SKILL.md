---
name: algo-viz-authoring
description: Use when authoring, implementing, or auditing algorithm visualization renderers, step generators, and multi-language code linkages in this project to prevent line offset misalignments, missing entry frames, and skipped execution loops.
---

# 算法可视化全栈开发与审查规范 (Algorithm Visualizer Master Authoring Standards)

本规范是算法可视化沙盘系统（Algorithm Visualizer）关于**步进生成器**、**代码联动高亮**、**演化阶段**、**物理沙盘**及**自动化测试**的核心准则。

> **核心诫律**：本项目旨在构建**教学级、高可读性、高保真**的算法推演交互系统。所有算法必须让学习者“知其然更知其所以然”。**严禁未查重盲目新建，严禁双版本粗暴二选一删除，必须综合两版本长处深度整合！**

---

## 0. 实现前强制死门禁：四维查重与双版本长处综合整合

在着手编写、接入或修改任何算法前，**必须无条件执行本门禁**：

### 0.1 强制前置四维查重（第 0 步门禁）
严禁接到需求后直接新建文件！必须先在全库执行四维检索：
1. **LeetCode / 题目权威题号**：如 `grep "102"`、`grep "236"`、`grep "105"`；
2. **英文核心函数名 / 类名**：如 `grep "levelOrder"`、`grep "lowestCommonAncestor"`、`grep "buildTree"`；
3. **中文核心关键词**：如 `grep "层序遍历"`、`grep "最近公共祖先"`、`grep "前序与中序构造"`；
4. **类目目录与全量元数据**：核验 `src/algorithms/categories/<类目>/` 现有文件与 `src/core/algorithm-catalog.generated.ts`。

### 0.2 双版本长处综合整合铁律（Bi-Version Synthesis, NOT Deletion）
若库内已存在同题实现，或者排查出同题目的两个版本，**绝对禁止粗暴删掉其中一个版本，也绝对禁止另建平行割裂文件！必须综合两者的长处进行整合**：
- **旧版本的不可替代长处**：细致打磨的参数输入控件（`inputs`）、丰富的典型测试用例预设（`presets` 案例下拉选择）、成熟稳定的 SVG/Canvas 画布渲染器与边界处理；
- **新版本的不可替代长处**：体系化名师讲义解析（`problemHtml`）、Java/C++/Python/JS 四语言齐备的源码面板与精准 1-based 相对行号联动（`codeLanguages` / `codeLine`）、深度解构的演化阶段（Stage Evolution）；
- **整合落地标准**：
  1. **优势互补融合**：保留旧版输入/用例/画布，注入新版讲义/四语言/阶段演化；
  2. **唯一事实来源（Single Source of Truth）**：全库保留唯一主 renderer 文件与主算法 ID（如 `binary-tree-level-order`）；
  3. **别名机制统合（Aliases）**：将课号 ID（如 `tree-036-level-order`）登记进主算法的 `aliases: [...]` 数组中，确保索引双向畅通。

---

## 1. 五大核心黄金不变量 (Core Golden Invariants)

在编码时，必须时刻保持以下 5 项不变式约束：

1. **1-based 相对行号与四语言对齐**：代码高亮行号必须严格落在局部短代码 `[1, codeArray.length]` 范围之内，严禁绝对大文件物理行号（无 500+ 超界行），严禁单值硬编码；优先走 `@step:` 锚点路线（`CodeStepIndexer` / `StageCodeRegistry`）。
2. **严格一行一步与零静默（Strict One-Line-One-Step）**：代码面板必须完整展示所有被调用的辅助函数。每一次状态变更都必须映射到具体代码行，杜绝高亮冻结（Zero Line Freezing）与循环静默跳步。
3. **深模块与公共模板复用**：所有递归树/状态依赖树必须接入 `RecursionTreeAdapter`，数组快照必须调用 `GridSnapshotPrimitives`，严禁在业务 Renderer 中私建重复轮子。
4. **视觉连续性与零 undefined 脏渲染**：双序列/双指针对比必须包含末尾 `EOF` 哨兵格子，指针越界不消失；严禁在卡片或日志中输出 `'undefined'` 或 `NaN`。
5. **100% 硬测试断言**：每个算法必须配备包含入口帧、四语言行号合法性以及关键变量演化的单测，严禁伪绿灯。

---

## 2. 渐进式参考手册导航 (Progressive Disclosure References)

按需查阅细分领域的专项规范文档，严禁一次性盲目加载全部细节：

| 领域模块 | 对应参考文件 | 核心包含内容 |
| :--- | :--- | :--- |
| **避坑指南** | [anti-patterns.md](./references/anti-patterns.md) | 历史 24 大典型故障深度复盘与纠偏指引（行号超界、跳步、套娃、穿模、脏数据等） |
| **代码联动** | [code-linkage.md](./references/code-linkage.md) | 四语言相对行号、完整生命周期闭环、递归日志形参绑定、多向分支独立分行规范 |
| **阶段演化** | [stage-evolution.md](./references/stage-evolution.md) | 动态规划标准“四段式”体系、空间压缩寄存器透明原则、正逆序双向推演支持 |
| **沙盘与布局** | [sandbox-and-ui.md](./references/sandbox-and-ui.md) | 卡通实体动画、递归树避让算法、双指针哨兵、UI 布局去套娃、Splitter 边界约束 |
| **模板与清单** | [template-and-checklist.md](./references/template-and-checklist.md) | 标准 TypeScript 步进生成器骨架、Vitest 自动化防退化断言与终极提交前 Checklist |

---

## 3. 自动化门禁自检命令

每次编写或重构算法完成后，必须依次执行以下确定性自检命令：

```bash
# 1. 验证目标算法单测与防退化断言
npx vitest run src/algorithms/categories/<类目>/<算法名>.test.ts

# 2. 验证全库目录新鲜度与元数据索引同步
npm run meta:sync

# 3. 验证 TypeScript 类型全库无报错
npm run typecheck
```
