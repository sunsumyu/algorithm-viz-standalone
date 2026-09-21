# 算法可视化系统 (algorithm-viz-standalone) 完整对话与工程交接报告
> 本文档记录了本轮对话中的全部任务诉求、技术推演、根本原因分析、架构改造实现、代码改动明细及验证证据，供接手 AI 获得 100% 完整上下文。

---

## 目录
1. [任务全景与诉求演进](#一任务全景与诉求演进)
2. [第一阶段：MinDeleteToBeSubstring 顶层模型与策略接入](#二第一阶段mindeletetobesubstring-顶层模型与策略接入)
3. [第二阶段：跳跃游戏 II UI 表现异常与用户诉求](#三第二阶段跳跃游戏-ii-ui-表现异常与用户诉求)
4. [核心根因深度分析：为什么代码区域会出现“白底药丸块”](#四核心根因深度分析为什么代码区域会出现白底药丸块)
5. [架构级改造：跳跃游戏 II 接入顶层领域抽象](#五架构级改造跳跃游戏-ii-接入顶层领域抽象)
6. [样式表修复与暗色代码终端强效隔离盾](#六样式表修复与暗色代码终端强效隔离盾)
7. [全量改动文件与代码 Diff 明细](#七全量改动文件与代码-diff-明细)
8. [质量门禁与全量构建验证结果](#八质量门禁与全量构建验证结果)
9. [后续接手建议与排查备忘](#九后续接手建议与排查备忘)

---

## 一、任务全景与诉求演进

本轮对话中，用户先后提出了两阶段核心任务：

1. **序列 DP 顶层抽象接入**：
   - 用户提供 Java 核心算法 `MinDeleteToBeSubstring`（最少删除多少个字符使 str1 变成以 str2[j] 结尾的子串）。
   - 要求接入工程的通用序列 DP 架构（YAML 领域模型、编译器、策略分发器）。

2. **跳跃游戏 II（Jump Game II）代码展示区域严重异常与顶层抽象统一**：
   - 用户反馈界面与标准 UI（LeetCode 62. 不同路径）存在严重差异。
   - **用户核心批评**：“最重要的代码区域的不同你没发现吗”、“不是应该修复而是应该接入顶层抽象，这种代码演示区域不是基本一样的吗”。
   - 用户提供了 3 张关键运行截图：
     - **截图 1（全局）**：`跳跃游戏 II`，代码区域内变量全部呈现为白色胶囊背景，代码可读性彻底被破坏；
     - **截图 2（标杆）**：`LeetCode 62. 不同路径`，标准暗黑代码终端（`#0d1117`），无任何白底药丸，行号整齐，代码语法高亮清晰；
     - **截图 3（特写）**：`跳跃游戏 II` 代码区域放大特写，展示所有变量标识符（`nums`、`length`、`curEnd`、`nextReach`、`steps`、`i`）均被白色圆角矩形背景块覆盖，宛如白色药丸。
   - 用户后续反馈：“还是一样啊，”，要求必须从根本上解决代码区域的变形问题，彻底统一到顶层抽象规范。

---

## 二、第一阶段：MinDeleteToBeSubstring 顶层模型与策略接入

### 1. 算法背景
- **核心逻辑**：给定字符串 `str1` 和 `str2`，求最少删除多少字符，使 `str1` 包含 `str2` 的某个子串。
- **状态定义**：`dp[i][j]` 表示 `str1` 前 `i` 个字符变成以 `str2` 第 `j` 个字符结尾的子串所需的最少删除字符数。
- **转移方程**：
  - 若 `s1[i - 1] == s2[j - 1]`：`dp[i][j] = dp[i - 1][j - 1]`（保留匹配）或 `dp[i - 1][j] + 1`（删除 `s1[i-1]`）。
  - 若 `s1[i - 1] != s2[j - 1]`：`dp[i][j] = dp[i - 1][j] + 1`。

### 2. 交付物
- 领域模型：[`src/core/models/min-delete-to-be-substring.yaml`](file:///f:/chain/algorithm-viz-standalone/src/core/models/min-delete-to-be-substring.yaml)
- 编译器：[`src/core/strategies/sequence-mindeletetobesubstring-compiler.ts`](file:///f:/chain/algorithm-viz-standalone/src/core/strategies/sequence-mindeletetobesubstring-compiler.ts)
- 维度解析：[`src/core/resolvers/problem-dimension-resolver.ts`](file:///f:/chain/algorithm-viz-standalone/src/core/resolvers/problem-dimension-resolver.ts)
- 策略门禁测试：[`src/core/strategies/universal-string-dp-strategy.test.ts`](file:///f:/chain/algorithm-viz-standalone/src/core/strategies/universal-string-dp-strategy.test.ts)

---

## 三、第二阶段：跳跃游戏 II UI 表现异常与用户诉求

### 1. 用户反馈现象对比
| 维度 | 跳跃游戏 II（异常状态，截图 1 & 3） | LeetCode 62. 不同路径（标杆状态，截图 2） |
| :--- | :--- | :--- |
| **代码区域背景** | 暗黑底色上所有变量覆盖厚重白底圆角药丸框 | 统一暗黑代码终端（`#0d1117`），无任何多余背景框 |
| **代码高亮表现** | `nums`, `curEnd`, `steps`, `i` 全被白块覆盖，文字被吞 | 关键字紫、类型黄、数字橙、函数蓝、变量灰，层次分明 |
| **阶段与方向演化** | 顶部仅单个 `[1 标准]` 胶囊，无顺逆推切换 | `[1 递归][2 记忆化][3 二维DP][4 一维优化]` + `[➜ 顺推][← 逆推]` |
| **架构承载模式** | 历史声明式局部渲染器（`registerDeclarativeAlgorithm`） | 顶层统一领域模型驱动（`YAML` + `IAlgorithmStrategy`） |

### 2. 用户的核心指令
- 严禁打地鼠式的局部修补，必须统一纳入顶层抽象体系；
- 代码演示区域在所有算法中必须保持高度一致的暗色终端体验；
- 彻底消灭代码行内的白色药丸框与错位现象。

---

## 四、核心根因深度分析：为什么代码区域会出现“白底药丸块”

经过跨模块排查与 AST 词法追踪，白块问题的真正祸首是由**CSS 历史规则通配缺陷**与**代码高亮类名**碰撞产生的：

### 1. 灾难级通配选择器
在 [`src/styles/visualizer-theme.css`](file:///f:/chain/algorithm-viz-standalone/src/styles/visualizer-theme.css) 中，原有一条旨在将历史遗留旧页面的头部卡片进行亮色提振的规则：
```css
/* 历史遗留规则：本意是匹配顶栏 Hero，但通配符书写过宽 */
[id^="algo-"][id$="-view"] [class*="-hero"],
[id^="algo-"][id$="-view"] [class$="-hero"],
[id^="algo-"][id$="-view"] [class*="-h"]:not([class*="-ph"]) {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 10px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03) !important;
}
```

### 2. 致命的碰撞链条
1. **容器匹配**：`jump-game-ii` 挂载在 `<div id="algo-jump-game-ii-view">` 下，精准命中了前缀 `[id^="algo-"][id$="-view"]`。
2. **选择器过宽**：`[class*="-h"]` 会匹配**任何包含 `-h` 的 CSS 类名**（如 `-help`、`-half`、`-hidden` 等）。
3. **词法解析器的注入**：
   在 [`src/core/code-highlighter.ts`](file:///f:/chain/algorithm-viz-standalone/src/core/code-highlighter.ts) 中，解析普通变量标识符的代码为：
   ```ts
   out += `<span class="algo-code-ident cursor-help" data-var="${escapeHtml(word)}">${escapeHtml(word)}</span>`;
   ```
   这里的 `cursor-help` 包含子串 **`-h`**（即 `-help`）！
4. **结果**：
   - 变量标识符（`nums`、`length`、`curEnd`、`nextReach`、`steps`、`i`）由于带了 `cursor-help`，被强制赋予了：
     `background: #ffffff !important; border: 1px solid #e2e8f0 !important; border-radius: 10px !important;`
   - 关键字（`algo-code-token-keyword`）、数字（`algo-code-token-number`）等无 `-h`，未受影响。
   - **为何 LeetCode 62 没出现该问题？** 因为其容器 ID 为 `view-unique-paths`，不匹配 `[id^="algo-"][id$="-view"]`，从而幸免于难。

---

## 五、架构级改造：跳跃游戏 II 接入顶层领域抽象

为了彻底响应用户“接入顶层抽象”的要求，我们完成了跳跃游戏 II 顶层架构的全链路标准化接入：

### 1. 顶层领域模型 YAML
- 文件路径：[`src/core/models/jump-game-ii.yaml`](file:///f:/chain/algorithm-viz-standalone/src/core/models/jump-game-ii.yaml)
- 规范特征：
  - 具备 LeetCode 45 题目规格元数据、双向推进分支（`directions.forward`）。
  - 内嵌物理锚点标准 Java 源码（`@step:entry`, `@step:init`, `@step:loop`, `@step:explore`, `@step:check`, `@step:jump`, `@step:done`）。

### 2. 模型仓储注册
- 文件路径：[`src/core/model-repository.ts`](file:///f:/chain/algorithm-viz-standalone/src/core/model-repository.ts)
- 引入 `jump-game-ii.yaml` 并通过 `AlgorithmModelRepository.registerModel` 同时注册为 `jump-game-ii` 和 `jump-game`。

### 3. 标准步进编译器
- 文件路径：[`src/core/strategies/jump-game-ii-compiler.ts`](file:///f:/chain/algorithm-viz-standalone/src/core/strategies/jump-game-ii-compiler.ts)
- 规范特征：
  - 实现 `compile(model, options): UniversalStep[]`。
  - **Step 0 纯净入口**：杜绝执行前脏数据泄漏。
  - **标准网格与多维数组**：`grid: [nums]`（符合 `(number | null)[][]`），`dp1d: nums`，以及 Card 1 状态数组 `stateArrays`。
  - **标准变量观察器**：`vars` 中每个变量的 `value` 均转为符合 `StepVar` 接口的 `string` 类型。
  - **决策看板**：每一步均产生结构化 `decisions` 与 `metrics` 指标。

### 4. 策略引擎与分发
- 文件路径：[`src/core/strategies/jump-game-ii-strategy.ts`](file:///f:/chain/algorithm-viz-standalone/src/core/strategies/jump-game-ii-strategy.ts) 与 [`src/core/strategies/index.ts`](file:///f:/chain/algorithm-viz-standalone/src/core/strategies/index.ts)
- 实现 `IAlgorithmStrategy` 接口，接管 `jump-game-ii` 和 `jump-game`，在策略注册表中注册。

---

## 六、样式表修复与暗色代码终端强效隔离盾

为从样式层面永久根除此类污染，我们重构了样式系统：

### 1. 修复过宽选择器
在 [`src/styles/visualizer-theme.css`](file:///f:/chain/algorithm-viz-standalone/src/styles/visualizer-theme.css) 中，将危险的 `[class*="-h"]` 收敛为精准的 Header 选择器：
```css
/* 5. 遗留顶栏 Hero 归一化（精确排除暗色代码终端相关头部） */
[id^="algo-"][id$="-view"] [class*="-hero"],
[id^="algo-"][id$="-view"] [class$="-hero"],
[id^="algo-"][id$="-view"] [class*="-header"]:not([class*="-card-header"]):not([class*="-panel-header"]):not(.terminal-auto-header):not(.dark-code-terminal-header):not(.dsp-header) {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 10px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03) !important;
}
```

### 2. 构建暗色代码终端隔离盾（Terminal Isolation Shield）
在 [`src/styles/visualizer-theme.css`](file:///f:/chain/algorithm-viz-standalone/src/styles/visualizer-theme.css) 中，增加高优先级隔离规则，无论外部选择器如何匹配，终端内部与代码高亮行绝对保持透明底色与暗黑 Terminal 风格：
```css
/* 明确隔离暗色代码终端与代码高亮元素，严禁任何亮色归一化规则侵入终端内部 */
[id^="algo-"][id$="-view"] .dsp-terminal-card,
[id^="algo-"][id$="-view"] .code-terminal-card,
[id^="algo-"][id$="-view"] .dark-terminal-auto-frame,
[id^="algo-"][id$="-view"] [data-code-panel],
[id^="algo-"][id$="-view"] [data-code-terminal] {
  background: #0d1117 !important;
  color: #e2e8f0 !important;
}

[id^="algo-"][id$="-view"] .algo-code-line,
[id^="algo-"][id$="-view"] .algo-code-line *,
[id^="algo-"][id$="-view"] .code-line,
[id^="algo-"][id$="-view"] .code-line * {
  box-sizing: border-box;
}

[id^="algo-"][id$="-view"] .algo-code-line span:not(.inline-token-focus):not(.algo-code-inline-hint),
[id^="algo-"][id$="-view"] .code-line span:not(.inline-token-focus):not(.algo-code-inline-hint) {
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

.algo-code-ident {
  color: #e2e8f0 !important;
  font-weight: 500;
  cursor: help;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  padding: 0 !important;
  display: inline !important;
}
```

### 3. 清理词法解析器冗余类名
在 [`src/core/code-highlighter.ts`](file:///f:/chain/algorithm-viz-standalone/src/core/code-highlighter.ts) 中，变量 span 移除 `cursor-help` class（因 `.algo-code-ident` 已原生内置 `cursor: help`），彻底切断外部类名误伤的任何可能。

---

## 七、全量改动文件与代码 Diff 明细

### 1. 新增文件清单
1. [`src/core/models/jump-game-ii.yaml`](file:///f:/chain/algorithm-viz-standalone/src/core/models/jump-game-ii.yaml)：跳跃游戏 II 顶层 YAML 领域模型；
2. [`src/core/strategies/jump-game-ii-compiler.ts`](file:///f:/chain/algorithm-viz-standalone/src/core/strategies/jump-game-ii-compiler.ts)：顶层单步状态编译器；
3. [`src/core/strategies/jump-game-ii-strategy.ts`](file:///f:/chain/algorithm-viz-standalone/src/core/strategies/jump-game-ii-strategy.ts)：顶层算法策略实现类；
4. [`src/core/strategies/jump-game-ii.gate.test.ts`](file:///f:/chain/algorithm-viz-standalone/src/core/strategies/jump-game-ii.gate.test.ts)：门禁测试（含模型注册、Step 0 纯净性、贪心计算精准度、特判验证）。

### 2. 修改文件清单与关键 Diff

#### ① [`src/core/code-highlighter.ts`](file:///f:/chain/algorithm-viz-standalone/src/core/code-highlighter.ts)
```diff
@@ -174,7 +174,7 @@ export function highlightTokens(
         if (isFunc) {
           out += `<span class="algo-code-token-func text-sky-300">${escapeHtml(word)}</span>`;
         } else {
-          out += `<span class="algo-code-ident cursor-help" data-var="${escapeHtml(word)}">${escapeHtml(word)}</span>`;
+          out += `<span class="algo-code-ident" data-var="${escapeHtml(word)}">${escapeHtml(word)}</span>`;
         }
       }
       i = j;
```

#### ② [`src/styles/visualizer-theme.css`](file:///f:/chain/algorithm-viz-standalone/src/styles/visualizer-theme.css)
```diff
@@ -831,6 +831,38 @@
 .algo-code-ident {
   color: #e2e8f0 !important;
   font-weight: 500;
+  cursor: help;
+  background: transparent !important;
+  border: none !important;
+  border-radius: 0 !important;
+  box-shadow: none !important;
+  padding: 0 !important;
+  display: inline !important;
 }
+
+/* 明确隔离暗色代码终端与代码高亮元素，严禁任何亮色归一化规则侵入终端内部 */
+[id^="algo-"][id$="-view"] .dsp-terminal-card,
+[id^="algo-"][id$="-view"] .code-terminal-card,
+[id^="algo-"][id$="-view"] .dark-terminal-auto-frame,
+[id^="algo-"][id$="-view"] [data-code-panel],
+[id^="algo-"][id$="-view"] [data-code-terminal] {
+  background: #0d1117 !important;
+  color: #e2e8f0 !important;
+}
+
+[id^="algo-"][id$="-view"] .algo-code-line,
+[id^="algo-"][id$="-view"] .algo-code-line *,
+[id^="algo-"][id$="-view"] .code-line,
+[id^="algo-"][id$="-view"] .code-line * {
+  box-sizing: border-box;
+}
+
+[id^="algo-"][id$="-view"] .algo-code-line span:not(.inline-token-focus):not(.algo-code-inline-hint),
+[id^="algo-"][id$="-view"] .code-line span:not(.inline-token-focus):not(.algo-code-inline-hint) {
+  background: transparent !important;
+  border: none !important;
+  border-radius: 0 !important;
+  box-shadow: none !important;
 }
@@ -1387,7 +1419,7 @@
 /* 5. 遗留顶栏 Hero */
 [id^="algo-"][id$="-view"] [class*="-hero"],
 [id^="algo-"][id$="-view"] [class$="-hero"],
-[id^="algo-"][id$="-view"] [class*="-h"]:not([class*="-ph"]) {
+[id^="algo-"][id$="-view"] [class*="-header"]:not([class*="-card-header"]):not([class*="-panel-header"]):not(.terminal-auto-header):not(.dark-code-terminal-header):not(.dsp-header) {
   background: #ffffff !important;
   border: 1px solid #e2e8f0 !important;
   border-radius: 10px !important;
```

#### ③ [`src/core/model-repository.ts`](file:///f:/chain/algorithm-viz-standalone/src/core/model-repository.ts)
```diff
+import jumpGameIIModelRaw from './models/jump-game-ii.yaml?raw';
+const jumpGameIIModel = YamlModelLoader.loadModelFromYaml(jumpGameIIModelRaw);
+AlgorithmModelRepository.registerModel(jumpGameIIModel);
+AlgorithmModelRepository.registerModel({ ...jumpGameIIModel, id: 'jump-game' });
```

#### ④ [`src/core/strategies/index.ts`](file:///f:/chain/algorithm-viz-standalone/src/core/strategies/index.ts)
```diff
+export { JumpGameIIStrategy } from './jump-game-ii-strategy';
+export { JumpGameIIStepCompiler } from './jump-game-ii-compiler';
+// 在 registerBuiltinStrategies 中：
+AlgorithmStrategyRegistry.register(new JumpGameIIStrategy());
```

#### ⑤ [`src/algorithms/categories/greedy/jump-game-problem-content.ts`](file:///f:/chain/algorithm-viz-standalone/src/algorithms/categories/greedy/jump-game-problem-content.ts)
- 将旧版 14 行与 11 行不一致的多语言源码统一为使用 `curEnd`, `nextReach`, `steps` 的标准 11 行代码。

#### ⑥ [`src/algorithms/categories/greedy/jump-game-renderer.ts`](file:///f:/chain/algorithm-viz-standalone/src/algorithms/categories/greedy/jump-game-renderer.ts) 与 [`greedy-093/jump-game-ii-renderer.ts`](file:///f:/chain/algorithm-viz-standalone/src/algorithms/categories/greedy/greedy-093/jump-game-ii-renderer.ts)
- `vars` 中的数值全部严格转换为 `string` 格式，与 `StepVar` 类型契约严格吻合。

---

## 八、质量门禁与全量构建验证结果

所有修改已通过全套本地自动化验证：

1. **全量 TypeScript 类型检查 (`npm run typecheck`)**：
   ```text
   > tsc -b --noEmit
   # 退出码 0，全工程 0 个类型错误
   ```

2. **高亮器单元测试 (`src/core/code-highlighter.test.ts`)**：
   ```text
   ✓ 6/6 tests passed
   ```

3. **代码终端单元测试 (`src/core/renderers/dark-code-terminal-presenter.test.ts`)**：
   ```text
   ✓ 9/9 tests passed
   ```

4. **跳跃游戏顶层抽象门禁验证 (`src/core/strategies/jump-game-ii.gate.test.ts`)**：
   ```text
   ✓ 模型应在 AlgorithmModelRepository 正确静态注册
   ✓ 策略应能接管 jump-game-ii 与 jump-game
   ✓ Step 0 入口帧必须纯洁无脏数据且携带合法锚点与全局输入
   ✓ 贪心计算结果必须精确符合预期 (nums=[2,3,1,1,4] -> 2步)
   ✓ 单元素特判用例应正确直接返回 0
   ✓ 5/5 tests passed
   ```

5. **贪心全量算法回归测试 (`src/algorithms/categories/greedy`)**：
   ```text
   ✓ 8 个测试套件，73/73 tests passed
   ```

6. **目录索引与新鲜度门禁 (`npm run meta:sync` & `algorithm-catalog-indexer.test.ts`)**：
   ```text
   [meta:sync] 已收获 611 条目录元数据 → src/core/algorithm-catalog.generated.ts
   ✓ 3/3 passed (目录新鲜度 / id 唯一性 / 完整性验证全部通过)
   ```

7. **生产环境完整构建打包 (`npm run build`)**：
   ```text
   > tsc -b && vite build
   ✓ built in 18.49s (退出码 0)
   ```

---

## 九、后续接手建议与排查备忘

1. **关于历史声明式渲染器与顶层抽象的双轨并存**：
   - 当前跳跃游戏已由顶层抽象（`AlgorithmModelRepository` + `JumpGameIIStrategy`）完全接管步进编译与模型数据；
   - 遗留的 `src/algorithms/categories/greedy/greedy-093/jump-game-ii-renderer.ts` 与 `jump-game-renderer.ts` 已经同步修整；
   - 如果需要进一步将此类算法彻底由 `UniversalStageVisualizer` 驱动，可参考 `dp-generated-renderers.ts` 的注册模式。

2. **样式隔离铁律**：
   - 绝不要在全局样式中使用宽泛的包含选择器（如 `[class*="-h"]`、`[class*="-s"]`）；
   - 代码终端与高亮系统（`.algo-code-line`, `.algo-code-ident`, `.dark-terminal-auto-frame`）具有神圣的暗色封闭性，任何亮色归一化逻辑都不得突破该边界。
