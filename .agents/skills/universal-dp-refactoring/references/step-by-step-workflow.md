# 动态规划规范实施四步法与交付前六项核验清单

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
