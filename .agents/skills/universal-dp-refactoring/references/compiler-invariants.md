# 递归与填表顶层抽象编译器、防跳步铁律与典型参考案例

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
