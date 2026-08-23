# 算法可视化代码联动与执行感知高亮规范 (Code Sync & Execution Step Highlighting Design)

## Problem Statement

初学者在使用算法可视化系统学习动态规划和各类算法时，代码面板联动存在明显断层与认知盲区：
1. **缺少完整执行生命周期**：演示直接从循环体内开始计算，跳过了边界与数据结构的初始化代码，结束时也缺少返回值高亮，导致初学者无法建立算法从“输入/初始化 $\rightarrow$ 迭代递推 $\rightarrow$ 输出结果”的完整心智模型。
2. **多步执行时高亮感知停滞**：当连续若干步落在相同分支逻辑（如连续多个不匹配字符）时，高亮条停留在同一行纹丝不动，缺乏重新执行、步进更新或条件判断的动态反馈，给用户造成“卡死”或“代码未参与联动”的误解。
3. **判断与转移未解耦**：代码高亮直接瞬移到转移赋值行，跳过了前置 `for` 迭代步进与 `if` 条件判断的执行过程，用户无法直观理解当前状态为何满足或不满足条件。

## Solution

建立统一且符合真实代码执行语义的**代码联动与执行感知高亮体系**：
1. **完整生命周期阶段化步进**：为算法生成器引入标准生命周期阶段：
   - **`init` 阶段**：高亮边界与表格初始化代码行，配合对应数据结构初态渲染。
   - **`step` 阶段**：精准映射主执行行（转移赋值）与结构上下文行（双层循环 + `if` 判断），并在连续停留时提供**微脉冲感知动画 (Execution Flash)**。
   - **`done` 阶段**：高亮 `return` 语句行，聚焦最终目标答案。
2. **动态执行反馈与变量监视**：高亮条在连续多步触发时产生即时呼吸/波纹动效，同时联动变量监视面板显示 `i`, `j`, 当前字符与判定布尔值。

---

## User Stories

1. As a learner, I want the code panel to highlight initialization statements at step 1, so that I understand where base cases (like `dp[i][0] = 1` or boundary tables) originate.
2. As a learner, I want the code panel to highlight the `return` statement on the final step, so that I clearly know which cell holds the final answer and how the function concludes.
3. As a learner, I want to see context highlighting on loop headers (`for i`, `for j`), so that I know which loop iteration and scope the current computation belongs to.
4. As a learner, I want visual feedback (e.g., flash/pulse effect) when consecutive steps land on the same code line, so that I know the algorithm has advanced to a new iteration rather than freezing.
5. As a learner, I want the condition checks (`if (s[i-1] == t[j-1])`) to be visibly indicated or explained in the step message, so that I know why a specific branch was taken.
6. As a student preparing for coding interviews, I want every algorithm to display real, full compilable language code (Java/TypeScript/C++), so that I can directly understand and replicate the code implementation.
7. As a learner, I want variable monitor values (`i`, `j`, characters, boolean flags) to update synchronously with code highlights, so that I can track state evolution line-by-line.
8. As a user stepping forward and backward, I want the code highlight to accurately rewind and advance to the corresponding line, so that mental debugging feels as natural as an IDE debugger.
9. As a visual learner, I want the code panel highlight colors to harmoniously match the colors on the DP grid/tree (e.g., green for current target, amber for dependency), so that my visual focus easily transitions between code and diagrams.
10. As a fast learner using auto-play mode, I want smooth code transitions that don't cause layout jank or eye fatigue, so that I can focus on the overall algorithmic trend.

---

## Implementation Decisions

### 1. 生命周期阶段协议 (Step Phase Protocol)
- 规定算法步进生成器必须包含至少三个阶段：
  - **初始化步 (`init`)**：
    - `type: 'init'`
    - `codeLine`: 指向数组创建与边界循环初始化（如 `CodeLineMap.init`）
    - `message`: 阐明初始状态与边界语义。
  - **递推迭代步 (`compute` / `step`)**：
    - `type: 'compute'`
    - `codeLine`: 使用复合高亮结构 `{ primary: 转移行, context: [外层for, 内层for, if判断] }`
    - `message`: 阐明当前下标比对、条件判断结果以及具体状态转移方程。
  - **结束步 (`done`)**：
    - `type: 'done'`
    - `codeLine`: 指向 `return` 返回行（如 `CodeLineMap.result`）
    - `message`: 总结最终结果与时空复杂度要点。

### 2. 代码面板多重/脉冲高亮渲染引擎 (Code Highlighting Engine)
- **复合高亮支持**：
  - `primary` 行应用主高亮背景与左侧高亮指示条（绿色发光）。
  - `context` 行应用浅色背景与淡色行号标记（辅助定位循环与条件范围）。
- **执行感知脉冲 (Execution Flash)**：
  - 当连续两个 Step 的 `primary` 行相同时，移除并重新添加 `.is-flashing` 动效类，触发一次 $200\text{ms}$ 的亮度微增动画，为用户提供明确的“单步已重入”物理反馈。

### 3. 数据层与算法步进生成器重构 (Generator Modernization)
- 重构字符串 DP（`stringDpSteps`）、股票 DP（`stockSteps`）及一维/二维 DP 生成器，消除遗留的硬编码行号。
- 确保所有分类的 `buildSteps` 在循环前 `push` 一个 `init` 步骤，在循环后 `push` 一个 `done` 步骤。

---

## Testing Decisions

- **外部行为测试标准**：
  - 验证任意算法生成器输出的 `steps` 数组，第 1 个 step 的 `type` 必须为 `init`，且其 `codeLine` 对应初始化行。
  - 验证任意算法生成器的最后 1 个 step，`type` 必须为 `done`，且其 `codeLine` 对应返回值行。
  - 验证中间每一步的 `codeLine` 均在有效代码行数区间 $[1, \text{lines.length}]$ 内，无越界与 `undefined`。
  - 验证代码面板 DOM 在接收相同行号高亮连续调用时，能够成功触发一次 class/animation 刷新。
- **参考先验**：
  - 参考已实现的 `decode-ways-steps.ts` 中 `init` $\rightarrow$ `call` $\rightarrow$ `return` $\rightarrow$ `done` 阶段化测试模式。

---

## Out of Scope

1. **逐字符 AST 语法树动态解释器**：不实现完整的在浏览器内跑任意用户自定义代码的 JS/Python 虚拟机，依旧基于结构化预先录制好的 Step 事件流。
2. **多断点调试器断点注入**：本阶段不涉及允许用户在代码面板行号点击下断点（Breakpoint）暂停的功能。

---

## Further Notes

- 确保代码高亮在多语言切换（如 Java $\leftrightarrow$ Python $\leftrightarrow$ C++）时，高亮能按对应的语言行号映射保持在同等逻辑位置。
