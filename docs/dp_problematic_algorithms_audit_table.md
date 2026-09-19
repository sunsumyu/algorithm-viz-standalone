Created At: 2026-09-18T00:59:54+08:00
Completed At: 2026-09-18T00:59:54+08:00
File Path: `file:///f:/chain/algorithm-viz-standalone/.agents/skills/universal-dp-refactoring/SKILL.md`
Total Lines: 225
Total Bytes: 14585
Showing lines 1 to 225
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: ---
2: name: universal-dp-refactoring
3: description: "使用基于「不同路径 II」黄金基准与 YAML 驱动模型的通用架构，对所有存在状态混乱、顺逆推颠倒、代码脱节等问题的动态规划算法进行顶层标准化重构。"
4: ---
5: 
6: # 通用动态规划算法重构终极规范 (Universal DP Refactoring Standard)
7: 
8: 本规范定义了将全库所有动态规划（Dynamic Programming）算法演示重构为**以「不同路径 II (`unique-paths-ii`)」为黄金基准的顶层模型驱动架构**的标准作业规程。
9: 
10: > **核心原则**：
11: > 1. **拒绝在具体 Renderer 中堆砌数百行 ad-hoc 状态推演逻辑**；
12: > 2. **拒绝手写散落的多语言代码与行号映射**；
13: > 3. **统一 Single Source of Truth（YAML 驱动模型）**；
14: > 4. **顶层策略引擎（Strategy Pattern）承担核心推演，具体 Renderer 只做极简薄切片**；
15: > 5. **绝对严禁为了修错而修错：高层抽象约束与报错是架构守门人，有错误是好事！**
16: 
17: ---
18: 
19: ## 0. 错误不是阻碍，而是架构守门人：绝对严禁为了修错而修错 (Errors as Architectural Enforcement Gates)
20: 
21: > **铁律**：
22: > **“需要治本，但是目的不是阻断报错，有错并抛出是很好的，就怕不报错。有错要真正解决报错的深层原因，而不是为了解决报错而解决。没有 YAML 就补 YAML，千万不要去简单地修错。进行高层抽象约束就是为了要把错报出来，强制去实现必须实现的内容！”**
23: 
24: ### 0.1 核心思想：抽象约束的防御性倒逼机制
25: 1. **报错是架构契约守门人在履职**：
26:    例如 `[VisualizerAppController] 算法模型 "${requestedId}" 未在仓储中找到！禁止错误回退至其他算法。`，这类强约束断言绝不是“开发阻碍”或“待消灭的异常”，而是系统最高层的**防腐门禁**。它的存在就是为了死死守住单一事实源，拦截一切试图逃避模型实现、通过随意 hack 混进系统的行为。
27: 2. **严禁“掩耳盗铃”式的表面修补**：
28:    - ❌ **绝对禁止**：为了不弹窗，去把错误吞掉（try-catch 忽略或静默降级）；
29:    - ❌ **绝对禁止**：为了让页面打开，私自给它 fallback 回退到 `unique-paths` 等其他无关算法；
30:    - ❌ **绝对禁止**：为了消除 `hasModel` 失败，私自把算法从列表、目录或流水线中摘除隐藏；
31:    - ❌ **绝对禁止**：不建规范 YAML 模型，而在外围写临时的 ad-hoc 渲染器或 iframe 补丁绕过去。
32: 3. **唯一的正途：正面履约，实现必须实现的内容**：
33:    - 报错提示“算法模型未在仓储中找到”，其深层原因必然是：**该算法进入了动规体系，但其必须履行的领域契约（YAML 事实源、四阶段演化策略、仓储静态注册）处于欠缺或半拉子状态**。
34:    - 正确解法**唯有且必须是正面攻坚**：按照黄金基准创建完整的 `src/core/models/<algorithm-id>.yaml`，在 `AlgorithmModelRepository` 完成注册，在顶层策略引擎中补齐 Stage 1~4 的编译逻辑，并通过全量测试断言。
35: 
36: ---
37: 
38: ## 1. 架构核心三层结构
39: 
40: 所有 DP 算法演示重构必须严格划分为三层：
41: 
42: ```
43:                     ┌──────────────────────────────────────────────┐
44:                     │  1. 领域事实源: YAML 模型定义                │
45:                     │  src/core/models/<algorithm-id>.yaml         │
46:                     └──────────────────────┬───────────────────────┘
47:                                            │ 解析与注册
48:                                            ▼
49:                     ┌──────────────────────────────────────────────┐
50:                     │  2. 顶层策略引擎: IAlgorithmStrategy         │
51:                     │  src/core/strategies/<domain>-strategy.ts     │
52:                     │  - compileStage1or2 (纯递归 / 记忆化搜索)    │
53:                     │  - compileStage3 (严格表递推)                │
54:                     │  - compileStage4 (空间压缩优化)              │
55:                     └──────────────────────┬───────────────────────┘
56:                                            │ 生成通用 UniversalStep
57:                                            ▼
58:                     ┌──────────────────────────────────────────────┐
59:                     │  3. 业务薄切片: 声明式渲染器                  │
60:                     │  src/algorithms/categories/.../*-renderer.ts │
61:                     │  - 仅负责 2D/3D 画布渲染挂载与视图适配       │
62:                     └──────────────────────────────────────────────┘
63: ```
64: 
65: ---
66: 
67: ## 2. 规范实施四步法 (Step-by-Step Workflow)
68: 
69: ### 第一步：创建 YAML 黄金模型文件
70: 在 `src/core/models/<algorithm-id>.yaml` 创建规范模型，参考 `unique-paths-ii.yaml` 与 `longest-common-subsequence.yaml`：
71: - **元数据**：`id`, `name`, `category`, `difficulty`, `learningGoal`
72: - **默认参数**：`defaultParams`（网格为 `m, n`，字符串为 `text1, text2`，线性为 `n`）
73: - **双向遍历定义 (directions)**：
74:   - `forward`: 顺推定义（基底 -> 终点），起始状态、终止状态、转移说明
75:   - `reverse`: 逆推定义（终点 -> 基底），起始状态、终止状态、转移说明
76: - **四阶段规范 (stages)**：
77:   - `stage-1`: 纯递归（方法名、时间/空间复杂度、参数、多语言代码映射 `code.java/cpp/python/javascript`、1-based 相对行号映射）
78:   - `stage-2`: 记忆化搜索（备忘录结构、剪枝行号映射、状态重叠分析）
79:   - `stage-3`: 自底向上严格表递推（表格维度、边界初始化、两层循环转移行号）
80:   - `stage-4`: 一维空间压缩优化（滚动数组/单一数组、暂存变量如 `leftUp`、状态覆盖保护机制）
81: 
82: 在 `src/core/model-repository.ts` 中完成静态注册，并在 `src/core/universal-model-fidelity.test.ts` 中增加保真度断言。
83: 
84: ---
85: 
86: ### 第二步：实现或适配顶层策略引擎
87: 根据问题领域（网格类 `grid-*`、一维序列类 `linear-1d-*`、双串比对类 `sequence-*`、背包类 `knapsack-*`）：
88: 1. 继承或实现 `IAlgorithmStrategy`（位于 `src/core/strategies/algorithm-strategy.ts`）：
89:    ```typescript
90:    export interface IAlgorithmStrategy {
91:      readonly modelId: string;
92:      canHandle(modelId: string): boolean;
93:      generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[];
94:    }
95:    ```
96: 2. 确保步进生成严格包含四状态周期：
97:    - `init`: 初始帧（Step 0，主函数入口，表格未计算状态填充 `null` 或 `-1`）
98:    - `eval`: 决策中（高亮依赖前驱格点、展开树当前活跃节点、比较字符/比较边界）
99:    - `transfer` / `record`: 落盘计算值并高亮目标单元格
100:    - `return`: 最终返回解帧
101: 3. 在 `src/core/strategies/index.ts` 注册策略实例。
102: 
103: ---
104: 
105: ### 第三步：彻底遵循顺推与逆推不变式 (The Direction Invariant)
106: 
107: 历史上 90% 的渲染 Bug 源自顺推与逆推的混乱定义。任何 AI 在实现或重构时**必须无条件遵守**以下不变式：
108: 
109: | 模式 ID | 模式名称 | 核心语义 | 代码与步进实现必须满足 |
110: | :--- | :--- | :--- | :--- |
111: | **`id: 'forward'`** | **顺推** | 从原点/前缀基底向最终目标推导 | - Stage 1/2: 从首部 `f(0, 0)` 开始递归；<br>- Stage 3: `for i = 1..N` 自底向上填表；<br>- 默认配置必须是 `defaultMode: 'forward'` |
112: | **`id: 'reverse'`** | **逆推** | 从末尾目标向子问题基底反推 | - Stage 1/2: 从末尾 `f(N-1, M-1)` 开始递归；<br>- Stage 3: `for i = N-1..0` 倒序填表 |
113: 
114: > [!CAUTION]
115: > **绝对禁忌**：
116: > 1. 严禁把逆推函数命名为 `Forward`；
117: > 2. 严禁在 `modes` 里将 `id: 'reverse'` 命名为“顺推”——顶层 `declarative-stage-fragments.ts` 强制绑定了 `isForward = id === 'forward'`，若 ID 错误会直接导致 UI 按钮符号和文字反转！
118: > 3. 必须在 Stage 配置中提供正确的 `modeCodeLanguages`：
119: >    ```typescript
120: >    codeLanguages: STAGE_FORWARD_CODE, // 默认顺推
121: >    modeCodeLanguages: {
122: >      forward: STAGE_FORWARD_CODE,
123: >      reverse: STAGE_REVERSE_CODE,
124: >    }
125: >    ```
126: 
127: ---
128: 
129: ---
130: 
131: ### 第四步：瘦身 Renderer 并建立极简垂直切片
132: 
133: Renderer（`*-renderer.ts`）只负责：
134: 1. 调用 `createDeclarativeVisualizer` 声明式注册；
135: 2. 绑定 `modes: [{ id: 'forward', label: '顺推' }, { id: 'reverse', label: '逆推' }]`；
136: 3. 将 `buildSteps` 指向顶层编译策略；
137: 4. 挂载 2D/3D Canvas 渲染器（如 `renderDp2DCard2`, `renderMemoGridCard`, `renderLcsTreeCanvas` 等）。
138: 
139: ---
140: 
141: ## 3. 递归与填表顶层抽象编译器与防跳步铁律 (The Invariant Compilers & Anti-Skip Laws)
142: 
143: 历史开发中最严重的故障是**“算法推演随意跳步、进入 if 块体内前光标瞬移”**（如 `if (s[i] == t[j])` 判定为真后，光标未进入 if 块高亮调用语句，直接飞进子函数签名行）。为彻底杜绝此问题，所有动规重构必须贯彻**顶层编译器 Template Method 规约**：
144: 
145: ### 3.1 阶段 1 & 阶段 2：全量继承 `AbstractSequenceRecursionCompiler`
146: - **控制流完全倒置（Inversion of Control）**：业务编译器**严禁私自手写 `dfs()` 循环调度与步骤发射**，必须继承 `AbstractSequenceRecursionCompiler`；
147: - **分支调用点物理拦截（Call-Site Interception Invariant）**：
148:   在触发任何子递归（如 `dfs(nextI, nextJ)`）之前，顶层抽象基类**物理强制先发射高亮本分支调用语句（如 `int useMatch = dfs(...)` / `int delWord1 = dfs(...)` / `int replace = dfs(...)`）的独立步进帧！**
149:   严禁从条件检查行直接瞬移跳入子函数签名行；
150: - **调用-返回闭环（Call-Return Parity & Backtracking Assignment）**：
151:   子递归计算完成返回父层时，基类**强制发射 `branch-return` 回溯赋值步骤帧**，焦点重新回到调用者的分支赋值行，展示该局部变量已被赋值（例如 `useMatch = 1` / `replace = 2`），完美再现 CPU 调用栈入栈与退栈回溯的物理现实，严禁子递归返回后直接飞入下一分支或 combine 语句；
152: - **分支沙盘元数据先验注入（Grid Dependency Injection）**：
153:   在发射 `branch-call` 时，自动注入 `targetI`, `targetJ`, `branchIndex`, `branchType`（`diag` / `top` / `left`）与 `deps` 依赖项，驱动 2D 坐标沙盘即时点亮对角线/上方/左侧决策方向箭头与高亮格；
154: - **调用树与足迹生命周期**：基类统一管理 `activeStack`、`UniversalTreeNode`、`memoCache`，严禁业务层自行维护导致的跨阶段污染。
155: 
156: ### 3.2 阶段 3：全量继承 `AbstractSequenceTableCompiler`
157: - **未计算单元格强制防防御（Uncalculated Defense）**：
158:   未计算单元格初始必须为 `null`（白底虚线框 `-`），严禁预填 `0`；
159: - **严格七步完整生命周期**：
160:   1. `init`：表格创建与全表 `null` 分配帧
161:   2. `border`：逐格初始化基底值帧
162:   3. `loop_i`：外层循环头推进帧
163:   4. `loop_j`：内层循环头推进帧
164:   5. `cond`：条件比对求值帧（高亮展示 `s1[i-1] == s2[j-1]` 是真还是假）
165:   6. `transfer`：状态转移方程求值与单元格数值落盘点亮帧
166:   7. `return`：最终答案汇聚与封板帧
167: 
168: ### 3.3 教学代码多分支展开与显式锚点准则 (Branch Unfolding)
169: - **严禁复合语句与单行压缩**：
170:   严禁将多个决策分支写在同一行（如单行三元表达式或 `res = dfs(...) + dfs(...)`）；
171: - **必须展开为多物理行代码**：
172:   ```java
173:   // ✅ 标准展开写法：每一行执行语句对应唯一的一个 @step 锚点
174:   if (s.charAt(i) == t.charAt(j)) { // @step:match
175:       int useMatch = dfs(s, t, i + 1, j + 1); // @step:branch_match // 选用匹配分支
176:       int skipChar = dfs(s, t, i + 1, j);     // @step:branch_skip  // 选忽略分支
177:       return useMatch + skipChar; // @step:combine // 汇总方案数
178:   } else {
179:       return dfs(s, t, i + 1, j); // @step:skip // 只能跳过
180:   }
181:   ```
182: 
183: ### 3.4 自动化零跳步门禁规范 (Zero-Skip Gatekeeper)
184: 重构完成后，必须在 `src/core/strategies/dp-stage-invariants.gate.test.ts` 中注册自动化门禁断言：
185: - 校验步骤流序列：凡是发生比对决策的步骤（`match-eval`），其下一步**必须且只能是进入 if/else 块体的 `branch-call`**，如果紧随其后是 `dfs-call`（跳步），测试必须阻断报错！
186: 
187: ---
188: 
189: ## 4. 重构后的强制全量验证门禁 (Verification Gateways)
190: 
191: 重构任何算法后，必须按顺序运行以下命令，全部返回 Exit code 0 方可宣布完成：
192: 
193: ```bash
194: # 1. 运行该算法专项测试套件（确保原有单步高亮与教学断言无回归）
195: npx vitest run src/algorithms/categories/dynamic-programming/<cat>/<id>.test.ts
196: 
197: # 2. 运行顶层策略引擎单测与防跳步零跳步门禁
198: npx vitest run src/core/strategies/dp-stage-invariants.gate.test.ts
199: npx vitest run src/core/strategies/direction-divergence.gate.test.ts
200: 
201: # 3. 运行全局 YAML 模型高保真门禁测试
202: npx vitest run src/core/universal-model-fidelity.test.ts
203: 
204: # 4. 运行算法目录一致性新鲜度门禁
205: npx vitest run src/core/algorithm-catalog-indexer.test.ts
206: 
207: # 5. 全项目 TypeScript 类型检查（零编译警告）
208: npm run typecheck
209: ```
210: 
211: ---
212: 
213: ## 5. 典型重构参考案例
214: 
215: - **网格类 DP 黄金基准**：
216:   - YAML: `src/core/models/unique-paths-ii.yaml`
217:   - 策略: `src/core/strategies/grid-unique-paths-strategy.ts`
218: - **双串序列类 DP 黄金基准 (全套抽象规约)**：
219:   - YAML: `src/core/models/distinct-subsequences.yaml`
220:   - 递归抽象基类: `src/core/strategies/abstract-sequence-recursion-compiler.ts`
221:   - 填表抽象基类: `src/core/strategies/abstract-sequence-table-compiler.ts`
222:   - 业务编译器: `src/core/strategies/sequence-distinctsubsequences-compiler.ts`
223:   - 门禁测试: `src/core/strategies/dp-stage-invariants.gate.test.ts`
224: 
225: 
The above content shows the entire, complete file contents of the requested file.
