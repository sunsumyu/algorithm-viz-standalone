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
> 4. **顶层策略引擎（Strategy Pattern）承担核心推演，具体 Renderer 只做极简薄切片**；
> 5. **绝对严禁为了修错而修错：高层抽象约束与报错是架构守门人，有错误是好事！**

---

## 0. 错误不是阻碍，而是架构守门人：绝对严禁为了修错而修错 (Errors as Architectural Enforcement Gates)

> **铁律**：
> **“需要治本，但是目的不是阻断报错，有错并抛出是很好的，就怕不报错。有错要真正解决报错的深层原因，而不是为了解决报错而解决。没有 YAML 就补 YAML，千万不要去简单地修错。进行高层抽象约束就是为了要把错报出来，强制去实现必须实现的内容！”**

### 0.1 核心思想：抽象约束的防御性倒逼机制
1. **报错是架构契约守门人在履职**：
   例如 `[VisualizerAppController] 算法模型 "${requestedId}" 未在仓储中找到！禁止错误回退至其他算法。`，这类强约束断言绝不是“开发阻碍”或“待消灭的异常”，而是系统最高层的**防腐门禁**。它的存在就是为了死死守住单一事实源，拦截一切试图逃避模型实现、通过随意 hack 混进系统的行为。
2. **严禁“掩耳盗铃”式的表面修补**：
   - ❌ **绝对禁止**：为了不弹窗，去把错误吞掉（try-catch 忽略或静默降级）；
   - ❌ **绝对禁止**：为了让页面打开，私自给它 fallback 回退到 `unique-paths` 等其他无关算法；
   - ❌ **绝对禁止**：为了消除 `hasModel` 失败，私自把算法从列表、目录或流水线中摘除隐藏；
   - ❌ **绝对禁止**：不建规范 YAML 模型，而在外围写临时的 ad-hoc 渲染器或 iframe 补丁绕过去。
3. **唯一的正途：正面履约，实现必须实现的内容**：
   - 报错提示“算法模型未在仓储中找到”，其深层原因必然是：**该算法进入了动规体系，但其必须履行的领域契约（YAML 事实源、四阶段演化策略、仓储静态注册）处于欠缺或半拉子状态**。
   - 正确解法**唯有且必须是正面攻坚**：按照黄金基准创建完整的 `src/core/models/<algorithm-id>.yaml`，在 `AlgorithmModelRepository` 完成注册，在顶层策略引擎中补齐 Stage 1~4 的编译逻辑，并通过全量测试断言。

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

---

### 第四步：顶层统一舞台挂载与旧文件清理 (宿主对齐铁律)

> [!CAUTION]
> **黄金舞台唯一性死门禁（绝对禁止使用 registerDeclarativeAlgorithm）**：
> 1. **严禁在动态规划算法中调用 `registerDeclarativeAlgorithm`**！该方法是外围普通声明式算法框架（基础数组、树、排序），根本不是 DP 黄金基准；
> 2. **杜绝先验注册遮蔽（Shadowing）**：若目标算法在 `src/algorithms/categories/dynamic-programming/` 下存在历史手写的 `*-renderer.ts`，**必须彻底删除或清理其注册**，否则 Vite 的 glob 加载会优先占领该算法 ID，导致真正的顶层通用舞台被拦截屏蔽；
> 3. **统一挂载宿主**：所有 DP 算法必须且只能统一通过 `src/algorithms/categories/dynamic-programming/dp-generated-renderers.ts` 注册为 **`UniversalStageVisualizer`**：
>    ```typescript
>    registerAlgorithm({
>      id: def.id,
>      name: def.name,
>      viewId: def.id,
>      category: 'dynamic-programming',
>      description: def.description,
>      icon: def.icon,
>      difficulty: def.difficulty ?? 1,
>      levelOrder: def.levelOrder ?? 1,
>      learningGoal: def.learningGoal,
>      template: `<div id="${def.id}" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
>      Visualizer: UniversalStageVisualizer, // 👈 必须使用该统一顶层宿主！
>    });
>    ```

---

## 2.1 交付前“六项视觉与架构刚性核验清单”（Checklist Gate）

在向用户汇报任何一个 DP 算法重构完成前，**必须逐项核对并输出以下 6 项状态**，任何一项不符合严禁交付：

- [ ] **1. 排除外围框架**：确认代码中未调用 `registerDeclarativeAlgorithm`，且无任何残留 `*-renderer.ts` 抢占 ID；
- [ ] **2. 顶栏 Stage 胶囊控制**：界面顶部正中央是否为规范的 Stage 胶囊按钮（`[1 递归]` `[2 记忆化]` `[3 递推DP / 二维DP]` `[4 空间压缩]`），绝无下拉菜单；
- [ ] **3. 双向推演控制**：顶栏右侧是否具备 **`[➜ 顺推]` 与 `[← 逆推]`** 独立切换按钮；
- [ ] **4. Card 1 状态空间沙盘**：是否由 `StateSpacePresenter` / `GridVisualAdapter` 渲染 2D 状态网格，并具备动画卡通实体（小人）实时站位移动；
- [ ] **5. Card 2 业务专属看板**：是否为领域专属辅助看板（如双串比对看板、一维状态流动条或状态依赖树），绝无平铺的孤立数字卡；
- [ ] **6. 宿主一致性**：点击打开后，界面外观、交互手感与 LeetCode 115 不同的子序列（黄金基准）完全一致！

---

## 3. 递归与填表顶层抽象编译器与防跳步铁律 (The Invariant Compilers & Anti-Skip Laws)

历史开发中最严重的故障是**“算法推演随意跳步、进入 if 块体内前光标瞬移”**（如 `if (s[i] == t[j])` 判定为真后，光标未进入 if 块高亮调用语句，直接飞进子函数签名行）。为彻底杜绝此问题，所有动规重构必须贯彻**顶层编译器 Template Method 规约**：

### 3.1 阶段 1 & 阶段 2：全量继承 `AbstractSequenceRecursionCompiler`
- **控制流完全倒置（Inversion of Control）**：业务编译器**严禁私自手写 `dfs()` 循环调度与步骤发射**，必须继承 `AbstractSequenceRecursionCompiler`；
- **分支调用点物理拦截（Call-Site Interception Invariant）**：
  在触发任何子递归（如 `dfs(nextI, nextJ)`）之前，顶层抽象基类**物理强制先发射高亮本分支调用语句（如 `int useMatch = dfs(...)` / `int delWord1 = dfs(...)` / `int replace = dfs(...)`）的独立步进帧！**
  严禁从条件检查行直接瞬移跳入子函数签名行；
- **调用-返回闭环（Call-Return Parity & Backtracking Assignment）**：
  子递归计算完成返回父层时，基类**强制发射 `branch-return` 回溯赋值步骤帧**，焦点重新回到调用者的分支赋值行，展示该局部变量已被赋值（例如 `useMatch = 1` / `replace = 2`），完美再现 CPU 调用栈入栈与退栈回溯的物理现实，严禁子递归返回后直接飞入下一分支或 combine 语句；
- **分支沙盘元数据先验注入（Grid Dependency Injection）**：
  在发射 `branch-call` 时，自动注入 `targetI`, `targetJ`, `branchIndex`, `branchType`（`diag` / `top` / `left`）与 `deps` 依赖项，驱动 2D 坐标沙盘即时点亮对角线/上方/左侧决策方向箭头与高亮格；
- **调用树与足迹生命周期**：基类统一管理 `activeStack`、`UniversalTreeNode`、`memoCache`，严禁业务层自行维护导致的跨阶段污染。

### 3.2 阶段 3：全量继承 `AbstractSequenceTableCompiler`
- **未计算单元格强制防防御（Uncalculated Defense）**：
  未计算单元格初始必须为 `null`（白底虚线框 `-`），严禁预填 `0`；
- **严格七步完整生命周期**：
  1. `init`：表格创建与全表 `null` 分配帧
  2. `border`：逐格初始化基底值帧
  3. `loop_i`：外层循环头推进帧
  4. `loop_j`：内层循环头推进帧
  5. `cond`：条件比对求值帧（高亮展示 `s1[i-1] == s2[j-1]` 是真还是假）
  6. `transfer`：状态转移方程求值与单元格数值落盘点亮帧
  7. `return`：最终答案汇聚与封板帧

### 3.3 教学代码多分支展开与显式锚点准则 (Branch Unfolding)
- **严禁复合语句与单行压缩**：
  严禁将多个决策分支写在同一行（如单行三元表达式或 `res = dfs(...) + dfs(...)`）；
- **必须展开为多物理行代码**：
  ```java
  // ✅ 标准展开写法：每一行执行语句对应唯一的一个 @step 锚点
  if (s.charAt(i) == t.charAt(j)) { // @step:match
      int useMatch = dfs(s, t, i + 1, j + 1); // @step:branch_match // 选用匹配分支
      int skipChar = dfs(s, t, i + 1, j);     // @step:branch_skip  // 选忽略分支
      return useMatch + skipChar; // @step:combine // 汇总方案数
  } else {
      return dfs(s, t, i + 1, j); // @step:skip // 只能跳过
  }
  ```

### 3.4 自动化零跳步门禁规范 (Zero-Skip Gatekeeper)
重构完成后，必须在 `src/core/strategies/dp-stage-invariants.gate.test.ts` 中注册自动化门禁断言：
- 校验步骤流序列：凡是发生比对决策的步骤（`match-eval`），其下一步**必须且只能是进入 if/else 块体的 `branch-call`**，如果紧随其后是 `dfs-call`（跳步），测试必须阻断报错！

---

## 4. 重构后的强制全量验证门禁 (Verification Gateways)

重构任何算法后，必须按顺序运行以下命令，全部返回 Exit code 0 方可宣布完成：

```bash
# 1. 运行该算法专项测试套件（确保原有单步高亮与教学断言无回归）
npx vitest run src/algorithms/categories/dynamic-programming/<cat>/<id>.test.ts

# 2. 运行顶层策略引擎单测与防跳步零跳步门禁
npx vitest run src/core/strategies/dp-stage-invariants.gate.test.ts
npx vitest run src/core/strategies/direction-divergence.gate.test.ts

# 3. 运行全局 YAML 模型高保真门禁测试
npx vitest run src/core/universal-model-fidelity.test.ts

# 4. 运行算法目录一致性新鲜度门禁
npx vitest run src/core/algorithm-catalog-indexer.test.ts

# 5. 全项目 TypeScript 类型检查（零编译警告）
npm run typecheck

# 6. 顶层抽象合规门禁（必须通过）
npx vitest run src/core/top-level-abstraction-compliance.test.ts
```

---

## 6. 合规验证

完成重构后，**必须**加载并执行 `top-level-abstraction-compliance` 技能进行全量合规检查：

```bash
npx vitest run src/core/top-level-abstraction-compliance.test.ts
```

任何一项失败都意味着重构未完成，严禁交付。

合规检查技能详见：`.agents/skills/top-level-abstraction-compliance/SKILL.md`

---

## 7. 典型重构参考案例

- **网格类 DP 黄金基准**：
  - YAML: `src/core/models/unique-paths-ii.yaml`
  - 策略: `src/core/strategies/grid-unique-paths-strategy.ts`
- **双串序列类 DP 黄金基准 (全套抽象规约)**：
  - YAML: `src/core/models/distinct-subsequences.yaml`
  - 递归抽象基类: `src/core/strategies/abstract-sequence-recursion-compiler.ts`
  - 填表抽象基类: `src/core/strategies/abstract-sequence-table-compiler.ts`
  - 业务编译器: `src/core/strategies/sequence-distinctsubsequences-compiler.ts`
  - 门禁测试: `src/core/strategies/dp-stage-invariants.gate.test.ts`

