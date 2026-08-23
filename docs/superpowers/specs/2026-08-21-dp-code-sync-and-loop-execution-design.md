# 动态规划多语言代码联动与循环单步执行对齐设计规范 (DP Code Sync & Multi-Language Loop Execution Alignment Spec)

<!-- triage-label: ready-for-agent -->

## Problem Statement

用户在「使用最小花费爬楼梯」等动态规划算法的可视化演示中，发现单步执行与代码面板高亮存在严重脱节与未进入循环体的问题：
1. **代码高亮未进入 `for` 循环体**：在 Java 模式下，当演示进行到第 3 步（计算台阶 3 / 楼顶平台时），代码高亮停留在第 7 行 `for (int i = 2; i <= n; i++) {`，而没有进入第 8 行 `dp[i] = Math.min(...)` 执行状态计算，给用户造成“算法未进入循环体、代码没有真正执行”的错觉。
2. **多语言行号硬编码导致的错位 (Language Line Mismatch)**：算法步进生成器中硬编码了 JavaScript 的 1-based 行号（如 `codeLine: [6, 7]`），但在默认展示的 Java 视图中，类包装与类型声明导致行号产生偏移（Java 第 6 行是 `dp[1] = 0;`，第 7 行是 `for` 循环头，第 8 行才是转移方程计算）。这导致在 Java 下高亮的是 `dp[1] = 0` (上下文) 和 `for` (主高亮)，循环体核心行被完全跳过。
3. **逐行精讲 HUD 解释内容错位**：代码底部的「实时代码精解」HUD 显示的文本为第 6 行的 `🎬 初始化起跳点 (dp[1])`，与当前正在进行的“到达楼顶计算”完全矛盾。
4. **单步颗粒度与执行生命周期感知不足**：在递推填表模式下，循环迭代缺乏清晰的“循环条件检查 $\rightarrow$ 状态转移计算”微步或复合高亮认知，用户无法感知循环变量 `i` 是如何逐步驱动状态数组填充的。

## Solution

构建**多语言语义对齐的高亮映射系统与循环执行生命周期标准**：
1. **多语言语义行号自适应映射 (Multi-Language Semantic CodeLine Mapping)**：
   - 算法步骤的 `codeLine` 支持多语言自适应结构：既支持按语言键映射 `{ java: [7, 8], cpp: [8, 9], python: [6, 7], javascript: [6, 7] }`，也支持按语义动作标签（如 `init`, `loop-cond`, `transition`, `return`）自动解析到各语言的具体物理行号。
   - 当用户在代码面板切换语言（Java / C++ / Python / JS）时，当前正在执行的高亮与精解 HUD 自动无缝切换到新语言对应的精确行号，杜绝行号错位。
2. **精准的复合高亮与循环执行高亮规则 (Compound Highlighting for Loops)**：
   - 处于循环转移步时，明确将**转移方程执行行**（Java 第 8 行）作为 `primary`（主高亮，带发光与执行指示），将 **`for` 循环头部行**（Java 第 7 行）作为 `context`（浅亮上下文）。
   - HUD 精解卡片优先展示当前 `primary` 主执行行（状态转移方程）的保姆级数学推导与当前变量代入。
3. **支持细粒度两阶段循环步进 (Optional Two-Phase Loop Stepping)**：
   - 在细粒度单步模式下，支持将循环拆分为两拍：
     - **第 1 拍 (循环判断)**：高亮 `for (int i = 2; i <= n; i++)`，变量面板更新 `i = 3 <= 3 为 true`，画布指示当前考察的目标位置。
     - **第 2 拍 (转移计算)**：高亮 `dp[i] = Math.min(...)`，画布播放起跳弧线与最优路径选择，更新 `dp[i]` 单元格。

---

## User Stories

1. As a student studying DP in Java, I want the code panel to highlight the transfer equation line (`dp[i] = Math.min(...)`) as the primary active line when computing step $i$, so that I see the code actually executing inside the loop.
2. As a learner viewing the loop iteration, I want the `for` loop header line to be highlighted with context styling while the loop body is executing, so that I understand both the current iteration boundary and the inner calculation.
3. As a user switching between Java, Python, C++, and JavaScript tabs, I want the highlighted lines and HUD explanations to automatically adapt to each language's exact line numbers without skipping or misaligning.
4. As a beginner looking at the Live Line Teaching Card (HUD) at step 3/4, I want to read the explanation and formula for the state transition equation currently being computed, rather than an unrelated initialization line.
5. As a learner stepping through the algorithm, I want variable monitor values (such as `i`, `cost[i-1]`, `from1`, `from2`, `dp[i]`) to match the exact mathematical expression in the currently highlighted code line.
6. As a visual learner, I want clear visual distinction between the loop header (context / scope) and the transfer body (active execution) via intuitive color differentiation and pulsing.
7. As a student stepping through "使用最小花费爬楼梯", I want step 1 to highlight initialization (`dp[0] = 0; dp[1] = 0;`), steps 2..n to highlight loop computation (`dp[i] = min(...)`), and the final step to highlight `return dp[n];`.
8. As a user rewinding steps with the "上一步" button, I want the code highlight and HUD explanation to accurately roll back to the exact previous code line and variable state.
9. As a learner exploring other DP visualizers (Climbing Stairs, House Robber, Integer Break, Unique BST), I want the same robust multi-language line mapping so that none of them suffer from line misalignment.

---

## Implementation Decisions

### 1. 多语言行号映射协议 (Multi-Language Code Line Protocol)
- `HighlightTarget` 接口扩展为支持多语言字典映射与语义字典：
  - `type MultiLangHighlightTarget = HighlightTarget | Record<string, HighlightTarget>;`
  - 允许步骤定义形如：
    ```ts
    codeLine: {
      java: { primary: 8, context: 7 },
      cpp: { primary: 9, context: 8 },
      python: { primary: 7, context: 6 },
      javascript: { primary: 7, context: 6 },
    }
    ```
- `CodePanel` 内部维护语言感知解析器：当调用 `highlight(target)` 时，若 `target` 包含当前激活语言的键，优先提取对应语言的目标行；若为通用结构则配合语言行号表自适应定位。

### 2. 算法步进生成器修复与对齐 (Generator Line Alignment)
- 修复 `dp-generated-renderers.ts` 中的 `arrayLinearSteps`（针对 `min-cost`、`climb-stairs`、`rob`、`rob2`、`integer-break`、`unique-bst`）：
  - **初始化步**：Java 高亮 `[4, 5, 6]`（数组创建与两个基底初始化），JS 高亮 `[3, 4, 5]`。
  - **循环迭代步**：Java 高亮 `{ primary: 8, context: 7 }`，确保主高亮直接打在 `dp[i] = Math.min(...)` 上；JS 高亮 `{ primary: 7, context: 6 }`。
  - **结束返回步**：Java 高亮第 10 行 `return dp[n];`，JS 高亮第 9 行 `return dp[n];`。
- 修复 `dp-universal-evolution.ts` 中 `tabulation-bottomup` 与 `space-optimized` 阶段的代码映射。

### 3. 多语言逐行精解字典对齐 (Language-Aware Line Explanations)
- 为 `LINEAR_DP_CODES` 中的算法提供多语言独立的 `lineExplanations`，或者基于 AST/关键词模式动态校准行号索引，确保 Java 模式下点击或高亮第 8 行时展示的是转移方程详解，点击第 6 行时展示的是 `dp[1]=0` 详解。

---

## Testing Decisions

- **测试接缝 (Primary Testing Seam)**：
  - 在 `src/core/code-panel.test.ts` 与各 DP 生成器测试文件（如 `src/algorithms/categories/dynamic-programming/dp-universal-evolution.test.ts`）中进行端到端数据验证。
- **外部行为测试标准**：
  1. **多语言行号解析测试**：验证 `CodePanel` 在当前语言为 `java`、`cpp`、`python`、`javascript` 时，传入多语言 `codeLine` 对象能正确高亮各自对应的有效代码行且 `is-active` 仅作用于 `primary`。
  2. **最小花费爬楼梯步进高亮校验**：验证 `min-cost` 生成的所有 steps：
     - Step 1 (初始化): Java 映射包含 `dp[0]=0` 和 `dp[1]=0` 所在行。
     - Step 2..n (递推): Java 映射的 `primary` 必须严格等于第 8 行（`dp[i] = Math.min(...)`），`context` 等于第 7 行（`for` 循环），不得停留在第 7 行或第 6 行。
     - Final Step (返回): Java 映射必须严格等于第 10 行（`return dp[n]`）。
  3. **精解 HUD 对齐校验**：验证在 Java 视图下，执行第 3 步时 `getLineExplanation(8)` 返回转移方程解析，而非边界初始化解析。

---

## Out of Scope

1. **运行时断点与任意语句单步调试器 (GDB/JDB Style Debugger)**：不实现用户下断点任意单步暂停，保持基于预生成步骤帧的时序回放机制。
2. **代码编辑器与在线代码编译运行 (Online Judge)**：不提供用户在线编辑重编译代码的功能。

---

## Further Notes

- 修复后需要与现有台阶跳跃动画与 5 步动规面板无缝兼容。
- 统一更新一维线性 DP、二维网格 DP 和背包 DP 的多语言代码对齐逻辑。
