---
name: universal-dp-refactoring
description: "使用基于「不同路径 II」黄金基准与 YAML 驱动模型的通用架构，对所有存在状态混乱、顺逆推颠倒、代码脱节等问题的动态规划算法进行顶层标准化重构。"
---

# 通用动态规划算法重构终极规范 (Universal DP Refactoring Standard)

本规范定义了将全库所有动态规划（Dynamic Programming）算法演示重构为**以「不同路径 II (`unique-paths-ii`)」为黄金基准的顶层模型驱动架构**的标准作业规程。

> **核心原则**：
> 1. **拒绝在具体 Renderer 中堆砌数百行 ad-hoc 状态推演逻辑**；
> 2. **拒绝手写散落的多语言代码与行号映射**；
> 3. **统一 Single Source of Truth（YAML 驱动模型）**；
> 4. **顶层策略引擎（Strategy Pattern）承担核心推演，具体 Renderer 只做极简薄切片**。

---

## 1. 架构核心三层结构

所有 DP 算法演示重构必须严格划分为三层：

```
                    ┌──────────────────────────────────────────────┐
                    │  1. 领域事实源: YAML 模型定义                │
                    │  src/core/models/<algorithm-id>.yaml         │
                    └──────────────────────┬───────────────────────┘
                                           │ 解析与注册
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │  2. 顶层策略引擎: IAlgorithmStrategy         │
                    │  src/core/strategies/<domain>-strategy.ts     │
                    │  - compileStage1or2 (纯递归 / 记忆化搜索)    │
                    │  - compileStage3 (严格表递推)                │
                    │  - compileStage4 (空间压缩优化)              │
                    └──────────────────────┬───────────────────────┘
                                           │ 生成通用 UniversalStep
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │  3. 业务薄切片: 声明式渲染器                  │
                    │  src/algorithms/categories/.../*-renderer.ts │
                    │  - 仅负责 2D/3D 画布渲染挂载与视图适配       │
                    └──────────────────────────────────────────────┘
```

---

## 2. 规范实施四步法 (Step-by-Step Workflow)

### 第一步：创建 YAML 黄金模型文件
在 `src/core/models/<algorithm-id>.yaml` 创建规范模型，参考 `unique-paths-ii.yaml` 与 `longest-common-subsequence.yaml`：
- **元数据**：`id`, `name`, `category`, `difficulty`, `learningGoal`
- **默认参数**：`defaultParams`（网格为 `m, n`，字符串为 `text1, text2`，线性为 `n`）
- **双向遍历定义 (directions)**：
  - `forward`: 顺推定义（基底 -> 终点），起始状态、终止状态、转移说明
  - `reverse`: 逆推定义（终点 -> 基底），起始状态、终止状态、转移说明
- **四阶段规范 (stages)**：
  - `stage-1`: 纯递归（方法名、时间/空间复杂度、参数、多语言代码映射 `code.java/cpp/python/javascript`、1-based 相对行号映射）
  - `stage-2`: 记忆化搜索（备忘录结构、剪枝行号映射、状态重叠分析）
  - `stage-3`: 自底向上严格表递推（表格维度、边界初始化、两层循环转移行号）
  - `stage-4`: 一维空间压缩优化（滚动数组/单一数组、暂存变量如 `leftUp`、状态覆盖保护机制）

在 `src/core/model-repository.ts` 中完成静态注册，并在 `src/core/universal-model-fidelity.test.ts` 中增加保真度断言。

---

### 第二步：实现或适配顶层策略引擎
根据问题领域（网格类 `grid-*`、一维序列类 `linear-1d-*`、双串比对类 `sequence-*`、背包类 `knapsack-*`）：
1. 继承或实现 `IAlgorithmStrategy`（位于 `src/core/strategies/algorithm-strategy.ts`）：
   ```typescript
   export interface IAlgorithmStrategy {
     readonly modelId: string;
     canHandle(modelId: string): boolean;
     generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[];
   }
   ```
2. 确保步进生成严格包含四状态周期：
   - `init`: 初始帧（Step 0，主函数入口，表格未计算状态填充 `null` 或 `-1`）
   - `eval`: 决策中（高亮依赖前驱格点、展开树当前活跃节点、比较字符/比较边界）
   - `transfer` / `record`: 落盘计算值并高亮目标单元格
   - `return`: 最终返回解帧
3. 在 `src/core/strategies/index.ts` 注册策略实例。

---

### 第三步：彻底遵循顺推与逆推不变式 (The Direction Invariant)

历史上 90% 的渲染 Bug 源自顺推与逆推的混乱定义。任何 AI 在实现或重构时**必须无条件遵守**以下不变式：

| 模式 ID | 模式名称 | 核心语义 | 代码与步进实现必须满足 |
| :--- | :--- | :--- | :--- |
| **`id: 'forward'`** | **顺推** | 从原点/前缀基底向最终目标推导 | - Stage 1/2: 从首部 `f(0, 0)` 开始递归；<br>- Stage 3: `for i = 1..N` 自底向上填表；<br>- 默认配置必须是 `defaultMode: 'forward'` |
| **`id: 'reverse'`** | **逆推** | 从末尾目标向子问题基底反推 | - Stage 1/2: 从末尾 `f(N-1, M-1)` 开始递归；<br>- Stage 3: `for i = N-1..0` 倒序填表 |

> [!CAUTION]
> **绝对禁忌**：
> 1. 严禁把逆推函数命名为 `Forward`；
> 2. 严禁在 `modes` 里将 `id: 'reverse'` 命名为“顺推”——顶层 `declarative-stage-fragments.ts` 强制绑定了 `isForward = id === 'forward'`，若 ID 错误会直接导致 UI 按钮符号和文字反转！
> 3. 必须在 Stage 配置中提供正确的 `modeCodeLanguages`：
>    ```typescript
>    codeLanguages: STAGE_FORWARD_CODE, // 默认顺推
>    modeCodeLanguages: {
>      forward: STAGE_FORWARD_CODE,
>      reverse: STAGE_REVERSE_CODE,
>    }
>    ```

---

### 第四步：瘦身 Renderer 并建立极简垂直切片

Renderer（`*-renderer.ts`）只负责：
1. 调用 `createDeclarativeVisualizer` 声明式注册；
2. 绑定 `modes: [{ id: 'forward', label: '顺推' }, { id: 'reverse', label: '逆推' }]`；
3. 将 `buildSteps` 指向顶层编译策略；
4. 挂载 2D/3D Canvas 渲染器（如 `renderDp2DCard2`, `renderMemoGridCard`, `renderLcsTreeCanvas` 等）。

---

## 3. 重构后的强制全量验证门禁 (Verification Gateways)

重构任何算法后，必须按顺序运行以下命令，全部返回 Exit code 0 方可宣布完成：

```bash
# 1. 运行该算法专项测试套件（确保原有单步高亮与教学断言无回归）
npx vitest run src/algorithms/categories/dynamic-programming/<cat>/<id>.test.ts

# 2. 运行顶层策略引擎单测
npx vitest run src/core/strategies/<strategy>.test.ts

# 3. 运行全局 YAML 模型高保真门禁测试
npx vitest run src/core/universal-model-fidelity.test.ts

# 4. 运行算法目录一致性新鲜度门禁
npx vitest run src/core/algorithm-catalog-indexer.test.ts

# 5. 全项目 TypeScript 类型检查（零编译警告）
npm run typecheck
```

---

## 4. 典型重构参考案例

- **网格类 DP 黄金基准**：
  - YAML: `src/core/models/unique-paths-ii.yaml`
  - 策略: `src/core/strategies/grid-unique-paths-strategy.ts`
- **双串序列类 DP 黄金基准**：
  - YAML: `src/core/models/longest-common-subsequence.yaml`
  - 编译器: `src/core/strategies/sequence-lcs-compiler.ts`
  - 策略: `src/core/strategies/universal-string-dp-strategy.ts`
  - 渲染器: `src/algorithms/categories/dynamic-programming/dp-067/longest-common-subsequence-renderer.ts`
