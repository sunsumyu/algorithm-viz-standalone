---
name: algo-viz-authoring
description: "用于算法可视化渲染器、步进生成器及四语言代码联动的编写与双轴审查。注意：若针对 dynamic-programming 类目重构请优先唤起 universal-dp-refactoring；门禁合规审计请唤起 top-level-abstraction-compliance。"
---

# 算法可视化全栈开发与审查规范 (Algorithm Visualizer Master Authoring Standards)

本规范是算法可视化沙盘系统（Algorithm Visualizer）关于**步进生成器**、**代码联动高亮**、**演化阶段**、**物理沙盘**及**自动化测试**的核心准则。

> **核心诫律**：本项目旨在构建**教学级、高可读性、高保真**的算法推演交互系统。所有算法必须让学习者“知其然更知其所以然”。**严禁未查重盲目新建，严禁双版本粗暴二选一删除，必须综合两版本长处深度整合！**

---

## 0. 实现前规划与死门禁（第三章高维规划工程规范）

在着手编写、接入或修改任何算法前，**必须无条件执行本工序**：

### 0.1 强制前置四维查重（第 0 步门禁）
严禁接到需求后直接新建文件！必须先在全库执行四维检索：
1. **LeetCode / 题目权威题号**：如 `grep "102"`、`grep "236"`、`grep "105"`；
2. **英文核心函数名 / 类名**：如 `grep "levelOrder"`、`grep "lowestCommonAncestor"`、`grep "buildTree"`；
3. **中文核心关键词**：如 `grep "层序遍历"`、`grep "最近公共祖先"`、`grep "前序与中序构造"`；
4. **类目目录与全量元数据**：核验 `src/algorithms/categories/<类目>/` 现有文件与 `src/core/algorithm-catalog.generated.ts`。

### 0.2 双版本长处综合整合铁律（Bi-Version Synthesis, NOT Deletion）
若库内已存在同题实现，或者排查出同题目的两个版本，**绝对禁止粗暴删掉其中一个版本，也绝对禁止另建平行割裂文件！必须综合两者的长处进行整合**：
- **旧版本长处**：参数输入控件（`inputs`）、丰富预设案例（`presets` 下拉选择）、成熟稳定 Canvas/SVG 画布与边界处理；
- **新版本长处**：体系化讲义（`problemHtml`）、Java/C++/Python/JS 四语言 1-based 行号联动（`codeLanguages` / `codeLine`）、Stage 演化；
- **整合落地标准**：全库保留唯一主 renderer 文件与主算法 ID（如 `binary-tree-level-order`），将旧课号登记进 `aliases: [...]`。

### 0.3 反向盘问与决策收敛（The Grilling Triad）
若需求存在模糊、发现未知依赖或查出双版本整合方案，**严禁向人类抛出空泛的开放式大问题**。必须遵循结构化多选提问艺术：
- 明确暴露技术假设（Surface Assumptions）；
- 提供带 `(Recommended)` 的结构化选项并讲明收益与代价；
- 拍板后将结论沉淀为单一事实，杜绝反复纠缠。

### 0.4 穿甲弹工序与多阶段编排（Tracer Bullet & Multi-Phase Pipeline）
严禁单次会话一口气写完几百行复杂业务代码！必须按阶段推进（每阶段完成立即门禁验证、Git Commit 并清空上下文）：
- **Phase 1: 穿甲弹骨架刺穿**：构建最小 Renderer 骨架（含最简 init 帧）+ 最小单测 + batch 注册，运行 `meta:sync` 验证全链路接缝畅通；
- **Phase 2: 状态机核心推演**：TDD 红绿循环实现步进生成器，断言状态转移与关键帧；
- **Phase 3: 四语言相对行号联动与讲义**：使用 `@step:` 锚点确保四语言行号合法有效；
- **Phase 4: 表现层视觉与视口核验**：确保 1920x1080 视口展开，消除套娃卡片与脏样式。
> [!NOTE]
> **穿甲弹 vs 原型辨析**：穿甲弹是生产代码的永久地基，必须有单测与强类型；若仅为摸索 UI 摆放手感，使用独立 scratch 原型，验证结论后立即废弃，严禁把脏原型重构成生产代码！

---

## 1. 五大核心黄金不变量 (Core Golden Invariants)

在编码时，必须时刻保持以下 5 项不变式约束：

1. **1-based 相对行号与四语言对齐**：代码高亮行号必须严格落在局部短代码 `[1, codeArray.length]` 范围之内，严禁绝对大文件物理行号（无 500+ 超界行），严禁单值硬编码；优先走 `@step:` 锚点路线（`CodeStepIndexer` / `StageCodeRegistry`）。
2. **严格一行一步与零静默（Strict One-Line-One-Step）**：代码面板必须完整展示所有被调用的辅助函数。每一次状态变更都必须映射到具体代码行，杜绝高亮冻结（Zero Line Freezing）与循环静默跳步。
3. **深模块与公共模板复用**：所有递归树/状态依赖树必须接入 `RecursionTreeAdapter`，数组快照必须调用 `GridSnapshotPrimitives`，严禁在业务 Renderer 中私建重复轮子。
4. **视觉连续性与零 undefined 脏渲染**：双序列/双指针对比必须包含末尾 `EOF` 哨兵格子，指针越界不消失；严禁在卡片或日志中输出 `'undefined'` 或 `NaN`。
5. **测试不可篡改与防自测陷阱（No Test Tampering & No Mock Tests）**：严禁 AI 自写自测闭环（断言契约 RED 必须先行）；绝对严禁为了通过测试而私自删改、注释已有测试断言，或将精准断言篡改为模糊软断言；报错必须自愈修复业务代码，严禁“改测试迎合错误实现”！严禁伪绿灯。

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
