---
name: universal-dp-refactoring
description: "使用基于「不同路径 II」黄金基准与 YAML 驱动模型的通用架构，对 dynamic-programming 类目算法进行顶层标准化重构。仅限 DP 类目重构任务调用；严禁用于图论、树、普通声明式算法或日常 Bug 修复。"
---

# 通用动态规划算法重构规范 (Universal DP Refactoring Standard)

本规范定义了将全库动态规划（`dynamic-programming`）算法演示重构为**以「不同路径 II (`unique-paths-ii`)」为黄金基准的顶层模型驱动架构**的标准作业规程。

> **核心诫律**：
> 1. **拒绝在具体 Renderer 中堆砌数百行 ad-hoc 状态推演逻辑**；
> 2. **统一 Single Source of Truth（YAML 驱动模型）**；
> 3. **顶层策略引擎（Strategy Pattern）承担核心推演，具体 Renderer 只做极简薄切片**；
> 4. **绝对严禁为了修错而修错：高层抽象约束与报错是架构守门人，有错误是好事！**
> 5. **强制前置四维查重与双版本长处综合整合**：重构或新建前必须在全库查重；若库内已存在该题目版本，严禁直接删掉任一版本，必须综合提取两者长处深度整合（旧版输入交互/预设用例/成熟画布 + 新版讲义/四语言/行号联动/演化阶段），以主 ID 配合 aliases 统一。

---

## 0. 错误不是阻碍，而是架构守门人：绝对严禁为了修错而修错

> **铁律**：
> **“需要治本，但是目的不是阻断报错，有错并抛出是很好的，就怕不报错。有错要真正解决报错的深层原因，而不是为了解决报错而解决。没有 YAML 就补 YAML，千万不要去简单地修错。进行高层抽象约束就是为了要把错报出来，强制去实现必须实现的内容！”**

- **报错是架构契约守门人在履职**：如 `[VisualizerAppController] 算法模型 "${id}" 未在仓储中找到！禁止错误回退至其他算法` 是系统最高层的防腐门禁。
- **严禁掩耳盗铃**：严禁吞掉错误（try-catch）、严禁私自 fallback 到无关算法、严禁从目录中临时移除或写临时 patch。
- **正面攻坚履约**：必须按照规范创建完整的 `src/core/models/<algorithm-id>.yaml`，在 `AlgorithmModelRepository` 静态注册，并在策略引擎中补齐 Stage 1~4。
- **测试断言不可篡改（No Test Tampering）**：严禁为了跑通门禁私自删改、注释 `universal-model-fidelity.test.ts` 或各阶段门禁断言，严禁将精准匹配弱化为软断言；报错必须通过补全 YAML 与实现自愈，严禁“改测试迎合残缺实现”！

---

## 1. 高维规划与任务拆解工程（第三章工序编排规范）

面对复杂 DP 算法（4 个演化阶段、顺逆推双向、四语言行号映射），**严禁单次会话一口气写完全量代码**！必须执行 **穿甲弹多阶段工序（Multi-Phase Tracer Pipeline）**：

1. **反向盘问与决策收敛（Grill Before Code）**：
   - 编码前先明确核心维度：属于哪一族统一编译器（网格/一维/背包/双序列）？
   - 若涉及同题双版本整合，向人类提出结构化多选项并标明 `(Recommended)`，禁止抛出开放式大问题。
2. **Phase 1: 穿甲弹刺穿（Tracer Bullet First）**：
   - 先写 YAML 模型骨架 + Stage 3 表递推核心；
   - 策略引擎实现 Stage 3 最小推演并挂载 `UniversalStageVisualizer`；
   - 运行单测验证端到端接缝畅通 ➔ Git Commit ➔ `/clear`。
3. **Phase 2: 阶段演化扩展**：
   - 补齐 Stage 1 纯暴力递归与 Stage 2 记忆化搜索 ➔ 运行防跳步门禁 ➔ Git Commit ➔ `/clear`。
4. **Phase 3: 空间压缩与四语言联动**：
   - 补齐 Stage 4 一维空间优化与四语言 1-based 相对行号映射 ➔ 策略身材门禁（LOC < 120） ➔ Git Commit ➔ `/clear`。
5. **Phase 4: 全景核查与验收**：
   - 运行 6 大全量验证门禁，确认全库零退化。

---

## 2. 顺推与逆推核心不变式 (The Direction Invariant)

| 模式 ID | 模式名称 | 核心语义 | 代码与步进实现必须满足 |
| :--- | :--- | :--- | :--- |
| **`id: 'forward'`** | **顺推** | 从原点/前缀基底向最终目标推导 | - Stage 1/2: 从首部 `f(0, 0)` 开始递归；<br>- Stage 3: `for i = 1..N` 自底向上填表；<br>- 默认配置必须是 `defaultMode: 'forward'` |
| **`id: 'reverse'`** | **逆推** | 从末尾目标向子问题基底反推 | - Stage 1/2: 从末尾 `f(N-1, M-1)` 开始递归；<br>- Stage 3: `for i = N-1..0` 倒序填表 |

---

## 3. 渐进式参考手册导航 (Progressive Disclosure References)

按需查阅细分领域的专项规范文档，严禁一次性盲目加载全部细节：

| 领域模块 | 对应参考文件 | 核心包含内容 |
| :--- | :--- | :--- |
| **实施流程与清单** | [step-by-step-workflow.md](./references/step-by-step-workflow.md) | 穿甲弹多阶段重构工序 (Phase 1~4)、统一宿主对齐铁律及交付前“六项核验清单” |
| **编译器抽象基类** | [compiler-invariants.md](./references/compiler-invariants.md) | 递归与填表抽象基类规约、分支展开多行规范、零跳步门禁及网格/双序列典型案例 |

---

## 4. 重构后的强制全量验证门禁

重构任何 DP 算法后，必须按顺序运行以下命令，全部返回 Exit code 0 方可宣布完成：

```bash
# 1. 运行该算法专项测试套件
npx vitest run src/algorithms/categories/dynamic-programming/<cat>/<id>.test.ts

# 2. 运行顶层策略引擎单测与防跳步零跳步门禁
npx vitest run src/core/strategies/dp-stage-invariants.gate.test.ts
npx vitest run src/core/strategies/direction-divergence.gate.test.ts

# 3. 运行全局 YAML 模型高保真门禁测试
npx vitest run src/core/universal-model-fidelity.test.ts

# 4. 运行算法目录一致性新鲜度门禁
npx vitest run src/core/algorithm-catalog-indexer.test.ts

# 5. 全项目 TypeScript 类型检查（零编译报错）
npm run typecheck

# 6. 顶层抽象合规门禁（必须通过）
npx vitest run src/core/top-level-abstraction-compliance.test.ts
```
