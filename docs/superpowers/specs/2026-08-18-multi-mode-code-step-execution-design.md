# 多模式算法步进与代码联动设置系统设计规范 (Multi-Mode Step Execution & Code Sync Design)

## Problem Statement

不同的用户在学习算法时具有不同的诉求与认知节奏：
1. **初学者与面试备战者**希望清晰看到每一步的**“条件判定 $\rightarrow$ 分支转移”因果逻辑**（VisuAlgo 风格），代码能够先停在 `if` 行、再落入分支赋值行，避免思维瞬移；
2. **需要快速预览全貌者**希望以**“一个格子/状态一步”的紧凑节奏**快速推进（Compact 状态级），避免因步骤过多频繁点击；
3. **深度代码调试与语言学习者**希望像 **IDE（F10 单步调试）或 Python Tutor** 那样，严格按照 `for 循环头` $\rightarrow$ `if 条件判断` $\rightarrow$ `分支赋值` 一行一行顺序推进。

目前系统仅支持固定的一种步进粒度，无法满足不同学习场景和用户偏好的自由切换。

---

## Solution

构建一套**全模式支持、实时可切换、持久化记忆的多模式步进与代码联动系统**：
1. **支持三大主流步进模式**：
   - 🎯 **模式 1：标准两阶段模式 (Two-Phase Compare & Apply) [默认推荐]**
     - 每个状态分为两拍：
       - 第 1 拍（条件判定）：高亮 `if` 判断行，对比当前元素，提示判断布尔值；
       - 第 2 拍（状态转移）：高亮落入的分支赋值行，拉出转移箭头，写入表格数值。
   - ⏩ **模式 2：状态级快速模式 (State Compact Mode)**
     - 每个状态一步：直接高亮分支转移赋值行，结合循环上下文，快速填满表格。
   - 🔍 **模式 3：严格逐行单步模式 (Strict Line-by-Line Debugger Mode)**
     - 完全模拟 IDE 单步调试：依次经过 `for i 循环行` $\rightarrow$ `for j 循环行` $\rightarrow$ `if 判定行` $\rightarrow$ `分支赋值行`。
2. **控制栏与全局设置无缝切换**：
   - 在控制栏（或全局设置菜单）提供直观的模式切换下拉框 / 药丸选择器（Pill Selector）。
   - 切换模式时，自适应重置或映射当前进度，并持久化保存至 `localStorage`。

---

## User Stories

1. As a beginner, I want a Two-Phase stepping mode, so that I can see the condition evaluated at the `if` line before the value is assigned.
2. As a quick learner reviewing a familiar topic, I want a State Compact mode (1 step per cell), so that I can quickly observe the entire DP table filling pattern.
3. As a developer debugging an implementation, I want a Strict Line-by-Line mode, so that every loop iteration header and branching statement is stepped through in chronological order.
4. As a user, I want to switch the execution mode via a dropdown/toggle in the control panel at any time, so that I can change granularity without leaving the current algorithm view.
5. As a user, I want my preferred stepping mode to be saved across browser restarts and page refreshes, so that I don't have to reconfigure it every time.
6. As a user, I want the step counter (`步骤: X / Y`) to update dynamically to reflect the total step count of the active mode, so that I have an accurate progress indicator.
7. As an auto-play user, I want the playback animation to smoothly transition across code lines at the selected speed in any mode, so that I can sit back and watch the execution flow.
8. As a user stepping backward, I want previous steps in all three modes to cleanly undo both visual elements (arrows, cell values) and code highlights, so that reverse debugging is 100% reliable.
9. As a mobile or small-screen user, I want the mode selector in the control bar to be compact and touch-friendly, so that it doesn't obstruct the visual canvas.
10. As a keyboard shortcut user, I want hotkeys to step forward/backward smoothly regardless of which execution mode is active, so that I can navigate with minimal friction.

---

## Implementation Decisions

### 1. 步进模式类型与枚举定义 (Step Mode Enum & Interface)
- 定义统一枚举：
  ```typescript
  export type ExecutionStepMode = 
    | 'two-phase'   // 两阶段（比较 -> 转移）[默认]
    | 'compact'     // 状态级（直接转移）
    | 'line-by-line'; // 严格单步（for -> if -> branch）
  ```

### 2. 步进生成管线架构 (Step Generation Pipeline)
- 采用 **元事件流（Meta-Event Stream）+ 模式投影器（Mode Projector）** 架构：
  - 生成器在计算算法时产生标准的元事件（包含 `loop-enter`, `compare`, `branch-taken`, `state-commit` 等原子信息）。
  - **模式投影器** 根据当前选中的 `ExecutionStepMode` 将元事件流合成为对应的 `steps[]` 数组：
    - `two-phase`：每个格子生成 2 步（`compare` $\rightarrow$ `branch-taken`）；
    - `compact`：每个格子仅生成 1 步（`branch-taken`）；
    - `line-by-line`：每个格子生成 3~4 步（`loop-enter` $\rightarrow$ `compare` $\rightarrow$ `branch-taken`）。
  - 该设计保证了**一份核心算法逻辑，自动生成全部三种模式的步骤**，无需为每个模式重复编写算法循环代码。

### 3. UI 交互与设置持久化 (UI & Persistence)
- **控制栏药丸/下拉选择器**：
  - 在 `#step-controls` 或顶部控制条注入模式选择器：
    - `[🎯 标准两阶段 | ⏩ 快速状态级 | 🔍 严格逐行]`
  - 监听 `change` 事件：触发 `visualizer.setStepMode(mode)`，重新编译当前输入的步骤并重置或定位到最接近的进度。
- **持久化键名**：
  - `localStorage.getItem('algo_execution_step_mode') || 'two-phase'`。

### 4. 代码面板微动画与状态协同 (CodePanel Integration)
- 在 `two-phase` 与 `line-by-line` 模式下，当停留在 `if` 判断行时：
  - 代码主高亮定位在 `if` 行；
  - 数组/字符串输入区对应两个字符进入闪烁比较状态（黄色高亮）；
  - `formula` 区域展示条件对比等式；
  - 转移箭头暂不生成。
- 进入下一拍（转移赋值）时：
  - 代码主高亮跳入分支赋值行；
  - 表格当前格填入计算结果；
  - 拉出依赖转移箭头。

---

## Testing Decisions

- **外部行为测试标准**：
  - 针对同一组输入（例如 `word1="horse", word2="ros"`）：
    - 验证 `compact` 模式生成的总步数为 $1 + 5 \times 3 + 1 = 17$ 步；
    - 验证 `two-phase` 模式生成的总步数为 $1 + 2 \times (5 \times 3) + 1 = 32$ 步；
    - 验证 `line-by-line` 模式生成的总步数 $> 32$ 步；
    - 验证所有模式在执行完毕后，最终返回的计算结果（如编辑距离 $3$）完全一致。
  - 验证切换模式后，`localStorage` 中的设置项立即更新，刷新页面后仍然保持该设置。
- **回归与兼容性测试**：
  - 确保一维 DP、二维 DP、股票 DP、背包 DP 在三种模式下均能正常生成与渲染。

---

## Out of Scope

1. **自定义微秒级时钟中断模拟器**：不模拟 CPU 指令周期或汇编级别调度。
2. **多线程并发交错步进**：本系统聚焦于单线程算法执行流的可视化。

---

## Further Notes

- 默认推荐模式设为 `two-phase`，在兼顾教学深度（看清条件因果）的同时，避免总步数过多。
