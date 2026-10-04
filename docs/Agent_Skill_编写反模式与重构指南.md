# 🔬 Agent Skill 编写反模式与重构实战指南
> **基于 Matt Pocock `writing-for-agents` 方法论与真实工业级工程实例**  
> **适用对象**：负责编写、维护 Agent 规则（AGENTS.md、CLAUDE.md、SKILL.md、PROMPT.md）的工程师与架构师

---

## 目录
- [0. 核心心智模型：为什么不能像管人一样写 Agent Skill？](#0-核心心智模型为什么不能像管人一样写-agent-skill)
- [0.5 Matt Pocock 智能体原生软件工程学：十大颠覆性核心法则全景总览](#05-matt-pocock-智能体原生软件工程学十大颠覆性核心法则全景总览)
- [1. 反模式一：否定词堆叠陷阱（The Negation Trap）](#1-反模式一否定词堆叠陷阱the-negation-trap)
- [2. 反模式二：情绪化沉积物（Emotional Sediment）](#2-反模式二情绪化沉积物emotional-sediment)
- [3. 反模式三：缺少 Leading Words 的啰嗦长句（Missing Anchor Words）](#3-反模式三缺少-leading-words-的啰嗦长句missing-anchor-words)
- [4. 反模式四：跨文件整段重复（Cross-File Duplication & Doc Drift）](#4-反模式四跨文件整段重复cross-file-duplication--doc-drift)
- [5. 反模式五：无法量化的主观模糊修饰与 No-ops（Unmeasurable Adjectives & No-ops）](#5-反模式五无法量化的主观模糊修饰与-no-opsunmeasurable-adjectives--no-ops)
- [6. 反模式六：常驻 Description 臃肿与反误触过载（Bloated Frontmatter Context Tax）](#6-反模式六常驻-description-臃肿与反误触过载bloated-frontmatter-context-tax)
- [7. Matt Pocock 标准重构对比速查表（12 组对照）](#7-matt-pocock-标准重构对比速查表12-组对照)
- [8. Skill 编写上线前自动化门禁自检（Pre-flight Checklist）](#8-skill-编写上线前自动化门禁自检pre-flight-checklist)
- [9. 本库真实落地全景解剖：我们到底改了哪些点？（改前 vs 改后完整对照）](#9-本库真实落地全景解剖我们到底改了哪些点改前-vs-改后完整对照)
  - [9.1 文件一：AGENTS.md（全库治理总则与唯一事实来源）](#91-文件一agentsmd全库治理总则与唯一事实来源)
  - [9.2 文件二：algo-viz-authoring/SKILL.md（算法编写核心入口）](#92-文件二agentsskillsalgo-viz-authoringskillmd算法编写核心入口)
  - [9.3 文件三：universal-dp-refactoring/SKILL.md（动态规划专项规范）](#93-文件三agentsskillsuniversal-dp-refactoringskillmd动态规划专项规范)
  - [9.4 文件四：top-level-abstraction-compliance/SKILL.md（顶层抽象合规检查）](#94-文件四agentsskillstop-level-abstraction-complianceskillmd顶层抽象合规检查)
  - [9.5 文件五：ui-layout-design/SKILL.md（画布主导权、反套娃与量化尺寸）](#95-文件五agentsskillsui-layout-designskillmd画布主导权反套娃与量化尺寸)
  - [9.6 文件六：browser-viewport-debugging/SKILL.md（视口调试与截图）](#96-文件六agentsskillsbrowser-viewport-debuggingskillmd视口调试与截图)
  - [9.7 全量外置参考手册（Progressive Disclosure References）深度治理对照](#97-全量外置参考手册progressive-disclosure-references深度治理对照)
  - [9.8 AGENTS.md 终极清洗与环境自白原则落地](#98-agentsmd-终极清洗与环境自白原则落地)
  - [9.9 全库清洗终极量化成果（The Zero-Elephant Milestone）](#99--全库清洗终极量化成果the-zero-elephant-milestone)
- [10. 为什么推荐核心 Skill 使用英文？用英文真的更好吗？](#10-为什么推荐核心-skill-使用英文用英文真的更好吗)
- [11. 防早泄与抗抢跑机制（Premature Completion & Completion Criteria）](#11-防早泄与抗抢跑机制premature-completion--completion-criteria)
- [12. 三层渐进式揭示梯子与分支裁决测试（Progressive Disclosure Ladder & Branching Test）](#12-三层渐进式揭示梯子与分支裁决测试progressive-disclosure-ladder--branching-test)
- [13. 环境作为唯一事实源：拒绝把 Prompt 当过期缓存（Environment as Cache & Hunting No-ops）](#13-环境作为唯一事实源拒绝把-prompt-当过期缓存environment-as-cache--hunting-no-ops)
- [14. 领域建模与深模块架构词汇层（Vocabulary Layer & The Deletion Test）](#14-领域建模与深模块架构词汇层vocabulary-layer--the-deletion-test)
- [15. 破坏性宽重构物理特例：展开-收缩模式（Expand-Contract Pattern for Wide Refactors）](#15-破坏性宽重构物理特例展开-收缩模式expand-contract-pattern-for-wide-refactors)
- [16. 抛弃型原型的残酷纪律（Throwaway Prototypes: No Persistence by Default）](#16-抛弃型原型的残酷纪律throwaway-prototypes-no-persistence-by-default)
- [17. 总结：工程落地终极四铁律行动清单（Four Golden Action Rules）](#17-总结工程落地终极四铁律行动清单four-golden-action-rules)

---

## 0. 核心心智模型：为什么不能像管人一样写 Agent Skill？

很多工程师写 Skill 时，会习惯性代入团队管理者的角色：
- "严禁为了修错而修错！"
- "绝对禁止私自篡改测试！"
- "一定要保证推演清晰，严禁突然消失！"

这些带有情绪化、感叹号、高压否定词的句子在面对人类开发者时可能管用（因为人类会产生敬畏或内疚），**但面对大语言模型（LLM）时，其底层数学机制恰恰适得其反**。

### 为什么自然语言的"严禁"会失效？
1. **Transformer 的注意力机制是正向激活的**：
   Matt Pocock 在 `writing-for-agents` 中指出：
   > *"Don't think of an elephant, and the elephant is all there is; the negation is a weak modifier the strongly-activated concept overruns, so the ban half-reads as an instruction to do the thing."*
   
   当你写下“严禁吞掉错误（try-catch）”时，“吞掉错误”和“try-catch”的概念权重被强烈激活，而开头的“严禁”只是一个弱修饰符。模型在长文本采样中，很容易将这半截话采样为“使用 try-catch”。

2. **自然语言的高熵与模糊性**：
   “清晰”、“优雅”、“充分验证”在人类脑中有语境，但在 LLM 权重中是均匀分布的高熵词，没有确切的执行路径。

3. **智能区（Smart Zone）与上下文税（Context Tax）**：
   LLM 的注意力窗口虽然有 200k 甚至 1M，但超过 150k 后会出现注意力衰减（Lost in the Middle）。每一句无意义的情绪化训诫，都在白白消耗宝贵的战略预算。

---

## 0.5 Matt Pocock 智能体原生软件工程学：十大颠覆性核心法则全景总览

深入研读 Matt Pocock 的官方开源库 [mattpocock/skills](https://github.com/mattpocock/skills)（以及其配套的内部元技能 `writing-for-agents` 与 `SKILL-MECHANICS.md`），你会发现这根本不是一份随意的 Prompt 收藏夹，而是一套将自然语言编译为确定性状态机的**“Agent 原生软件工程学”（Agent-Native Systems Engineering）**。

大多数人写 Skill 时，往往停留在“你是一个资深架构师，请遵循整洁代码原则”这种无效文学修饰；而 Matt Pocock 展示了顶级工程师如何像设计操作系统与编译器一样去设计 Skill。

从这套代码库中，我们可以提炼出**十大具有颠覆性的核心设计模式与工程法则**：

### 一、核心哲学：过程确定性代替输出确定性 (Process Determinism)
> *"The same levers make each one predictable — the agent taking the same process every run, not producing the same output."* —— `writing-for-agents/SKILL.md`

- **认知误区**：很多人试图通过写极长的提示词，逼迫 LLM 每次都生成一模一样的代码（输出确定性）。这是违背物理概率特性的妄念；
- **Matt 的解法**：你管不住它的字句生成，但你能完全焊死它的执行工序（Process）。每一个 Skill 的核心不是教它“怎么写代码”，而是强制它遵循不可跳步的流水线（例如：探查现状 ➔ 盘问决策树 ➔ 穿甲切片 ➔ 红灯断言 ➔ 最小实现 ➔ 双轴审查）；
- **结论**：只要过程是确定且带门禁的，最终代码的质量就被客观计算机机制牢牢锁死。

### 二、两大预算权衡法则：Context Load vs Cognitive Load
Matt 提出了构建 Agent 辅助系统的“两大负荷守恒定律”：
```
系统设计权衡总轴
┌───────────────────────────────────────┐
│ Context Load (智能体上下文负荷)       │
│ Token 消耗、注意力稀释、工作记忆占用  │
└──────────────────┬────────────────────┘
                   ▲ 相互抵消与权衡
                   ▼
┌───────────────────────────────────────┐
│ Cognitive Load (人类工程认知负荷)     │
│ 人脑记忆负担、何时调哪个技能的决策成本│
└───────────────────────────────────────┘
```
- **Context Load（智能体上下文负荷）**：总是加载的规则、常驻内存的 Skill 描述，都在消耗 150k 智能区。越多的常驻规则，单条规则被执行的概率就越低；
- **Cognitive Load（人类认知负荷）**：将规则藏在文件里或做成纯手动触发的 Skill，虽然拯救了上下文，但人类需要在大脑里记住它们的名字和用法；
- **Matt 的精妙设计**：
  1. **模型自主调用（Model-invoked）**：必须由 Agent 自动感知触发的技能才写精密的 description（付 Context Load）；
  2. **人类手动调用（User-invoked）**：配置 `disable-model-invocation: true`，清空对 Agent 的常驻描述，零占用上下文；
  3. **路由技能（Router Skill，如 `/ask-matt`）**：当人类也记不住 30 多个技能时，写一个路由技能作为人类的“总线索引”，让人类只记一个入口。

### 三、Leading Words（概念锚定词技术）：借力预训练先验
这是 Matt 在词汇工程学上的神来之笔：严禁自创花哨的长句子，优先选用模型预训练权重中已经内聚了海量工程先验的高密度词汇（Leading Words）。
- ❌ **低效的啰嗦句子**：“请提供一个快速的、确定性的、执行开销极低的、单次只需几秒钟的自动化验证环境。”  
  👉 **✅ Matt 的做法**：直接使用 `tight feedback loop`（紧致反馈环）。
- ❌ **啰嗦的解释**：“我们要先打通一条贯穿前端、后端与数据库的最小端到端骨架代码以验证连通性。”  
  👉 **✅ Matt 的做法**：直接使用 `tracer bullets`（穿甲弹）。
- ❌ **啰嗦的测试要求**：“请确保这个命令在当前 Bug 出现时能够明确报错失败，而不是假装通过。”  
  👉 **✅ Matt 的做法**：直接要求 `the loop goes red on this bug`（环路必须见红）。
- **底层原理**：自创词汇需要消耗大量的解释性 Token 去建立上下文；而借用《程序员修炼之道》或《重构》中的经典行业词汇（如 `fog of war`, `tracer bullets`, `seam`, `relentless`），只需一个 Token 就能激活模型内部深沉的工程常识。

### 四、肯定式目标 vs 否定词陷阱（Prompting the Positive）
> *"Don't think of an elephant, and the elephant is all there is."* —— `writing-for-agents/SKILL.md`

在心理学与 LLM 采样机制中，你越对模型强调“千万不要做 X”，X 在上下文注意力中被激活的权重就越强，模型反而更容易出现“偷做 X”的幻觉。
- ❌ **纯否定句**：“绝对不要在返回值中包含未处理的 null，不要返回 undefined。”
- ✅ **Matt 的模式（肯定式目标引导）**：“所有返回值必须显式包裹为 `Result<T, E>` 结构，遇到空值返回 `Result.err(NotFound)`。”
- **原则**：只有在极少数无法被肯定句表达的物理硬门禁时才用否定词，并且必须在同一行紧跟着给出“正向替代动作”。

### 五、防早泄与抗抢跑机制（Premature Completion & Completion Criteria）
LLM 有极强烈的“提前宣布胜利”的冲动（Premature Completion）。当它看到后面还有 Step 4、Step 5 时，在 Step 1 就会草草了事，急于汇报“已搞定”。
Matt 的对抗绝招是设计具备 Clarity（清晰度） 与 Demand（压榨度） 的出口断言：
1. **可检验的二进制边界（Checkable Bound）**：严禁出现“直到充分理解需求为止”这种虚幻描述；必须是“直到决策前沿（The Frontier）为空，且所有阻断依赖被清空”；
2. **隐藏后续步骤（Hide Post-Completion Steps）**：如果某个任务需要深度调研（如 `research` 或 `prototype`），严禁把后续的编码步骤直接暴露在同一个文档中；必须通过跨会话隔离（如派发独立 Background Subagent 或使用 `/handoff` 转场），让当前 Agent 以为“做好手头这件事就是它的全部人生”。

### 六、三层渐进式揭示（Progressive Disclosure Ladder）
- **梯子顶层: In-file Step**（当前文件中的顺序执行动作，只写核心命令）；
- **梯子中层: In-file Reference**（平铺的规则参考集，扁平同级平铺）；
- **梯子底层: Disclosed Reference**（通过 Context Pointer 按需拉取的外置子文件）。
- **分支裁决测试（Branching Test）**：所有分支必经逻辑留在主文件；特定分支细则坚决踢出主文件，拆成独立子文件（如 `UI.md`、`POSTMORTEM.md`）。

### 七、环境作为唯一事实来源，拒绝把 Prompt 当缓存（No-ops & Environment as Cache）
- **反模式**：在提示词中事无巨细地告诉 AI 你的目录长什么样、package.json 里有哪些脚本、Git 分支命名规则是什么；
- **后果**：代码库一旦变动，Prompt 立刻腐化失效，沦为产生幻觉的过期缓存；
- **准则**：系统命令（`--help`）、配置文件（`package.json`）、Git 状态能够查到的，Skill 中一概不写，只留一行让 Agent 自己运行命令获取；Skill 只记录**“计算机自身无法招供的事实”**（历史暗坑、非显然权衡、ADR）；
- **猎杀废话指令（Hunting No-ops）**：删掉某句话若模型行为不变，整句物理删除。

### 八、领域建模与深模块架构的底层基石（Vocabulary Layer）
- 技能之间建立分层的统一词汇基石：上层工序技能直接调用 `/domain-modeling`（业务名词与 ADR）与 `/codebase-design`（架构词汇：Module, Interface, Depth, Seam, Adapter, Leverage）；
- **删除测试法（The Deletion Test）**：*“想象删除该模块。如果复杂度彻底消失，它就是浅薄无用的中间层；如果复杂度分散爆发在 N 个调用方身上，它才是真正具有深度的优秀模块。”*

### 九、宽重构的物理特例：Expand-Contract（展开-收缩）模式
- 破坏性宽重构（修改全局基类、重命名核心列名）爆炸半径大，垂直切片会导致全库编译瘫痪；
- **唯一解法**：
  1. **Expand（展开）**：引入新接口，保留旧接口，CI 保持 100% 全绿；
  2. **Migrate（批量迁移）**：按目录分批迁移调用方，小步原子提交；
  3. **Contract（收缩）**：全部旧调用方清零后，在独立的 Ticket 中物理删除旧接口。

### 十、抛弃型原型（Prototype）的残酷纪律
- **Throwaway from day one**：原型代码从写下的第一秒起就是注定要被销毁的脏代码；
- **绝对禁止持久化**：状态全在内存，严禁依赖真实数据库；
- **彻底物理删除**：原型的唯一产出是人类肉眼得出的结论（Answer）；结论一旦落定，把脏代码提交到临时分支并在主干物理删除，**严禁直接在脏代码上“修修补补当成生产代码合入主干”**！

---

## 1. 反模式一：否定词堆叠陷阱（The Negation Trap）

### 表现特征
大量使用“严禁”、“绝对禁止”、“死门禁”、“切勿”，并且在同一段内反复罗列被禁止的行为。

### 🔴 真实反例 1.1（测试篡改门禁）
**❌ 原文**（出自 `algo-viz-authoring/SKILL.md`）：
```markdown
测试不可篡改与防自测陷阱（No Test Tampering & No Mock Tests）：
严禁 AI 自写自测闭环（断言契约 RED 必须先行）；
绝对严禁为了通过测试而私自删改、注释已有测试断言，
或将精准断言篡改为模糊软断言；
报错必须自愈修复业务代码，严禁“改测试迎合错误实现”！严禁伪绿灯。
```

**诊断分析**：
- 3 行内出现了 4 次“严禁”，高频激活了“删改测试”、“注释已有断言”、“篡改为模糊软断言”、“伪绿灯”这些被禁止的行为。
- 模型在注意力采样时，脑子里全是被禁止的操作。

**✅ Matt Pocock 范式重构**：
```markdown
## Immutable Test Contracts
- Pre-existing test assertions are immutable.
- Turn failures green exclusively by editing production code until `exit code 0`.
- Humans define failing tests (RED); the agent only writes production implementation (GREEN).
```
**重构亮点**：
- 使用正向 Leading Word **`Immutable`**（不可变的）。
- 只陈述期望的行为（“只改生产代码”），被禁止的动作压根不出现在 Prompt 中。

---

### 🔴 真实反例 1.2（UI 视觉描述）
**❌ 原文**（出自 `ui-layout-design/SKILL.md` & `sandbox-and-ui.md`）：
```markdown
- 严禁出现“中间是小方块、上下是两条超长大边框”的失衡结构。
- 在函数返回时：原地做出庆祝或终点标定动画，严禁突然消失。
```

**诊断分析**：
- “小方块”、“超长大边框”、“突然消失”是人类的主观文学化形容，机器无法测量。

**✅ Matt Pocock 范式重构**：
```markdown
## Viewport & Element Lifecycle
- Canvas allocation: visualization sandbox must occupy 60%–70% of total viewport height/width.
- Frame continuity: keep pointer/cursor elements rendered at all step frames. When inactive, transition via `opacity: 0` instead of unmounting from DOM.
```
**重构亮点**：
- 给出了可被 CSS 度量的数字（60%–70%）与可落地的 DOM 行为（`opacity: 0` 代替 `unmount`）。

---

## 2. 反模式二：情绪化沉积物（Emotional Sediment）

### 表现特征
团队在踩坑复盘或与 AI 斗智斗勇时写下的情绪化对话、聊天记录被直接拷贝进生产规范，日积月累形成沉渣（Sediment）。

### 🔴 真实反例 2.1（把吵架语录当架构铁律）
**❌ 原文**（出自 `universal-dp-refactoring/SKILL.md` 第 22 行）：
```markdown
> **铁律**：
> **"需要治本，但是目的不是阻断报错，有错并抛出是很好的，就怕不报错。
> 有错要真正解决报错的深层原因，而不是为了解决报错而解决。
> 没有 YAML 就补 YAML，千万不要去简单地修错。
> 进行高层抽象约束就是为了要把错报出来，强制去实现必须实现的内容！"**
```

**诊断分析**：
- 典型的口头训话与会议记录风格，废话多、信息熵极低。
- 消耗了 140 字，其实只表达了一件事：“缺失模型时直接抛异常，通过补全 YAML 修复，不得拦截异常”。

**✅ Matt Pocock 范式重构**：
```markdown
## Hard-Fail on Missing Models
Missing YAML models or unregistered strategies must throw immediately.
Resolve errors by:
1. Creating `src/core/models/<id>.yaml` (defining all 4 stages)
2. Registering strategy in `AlgorithmModelRepository`

Never catch, suppress, or mock missing models.
```

---

### 🔴 真实反例 2.2（25 行事故复盘作为常驻上下文）
**❌ 原文**（出自 `browser-viewport-debugging/SKILL.md`）：
```markdown
## 0. 核心痛点与事故根因 (Post-Mortem)
### 为什么会出现"界面缩在左上角，右下大面积空白"？
1. **Puppeteer 的隐式陷阱**：
   Puppeteer MCP 的 `puppeteer_screenshot` 工具若未显式传参，默认参数为：
   { "width": 800, "height": 600 }
   每次调用它时，底层会强制将 Chrome 渲染视口重设为 800×600
2. **物理窗口与视口错位**：
   用户的桌面窗口通常是 1920×1080 或 2K 最大化状态。
   此时外层 Chrome 窗口很大，但视口被死死压在左上角...
```

**诊断分析**：
- Agent 每次运行调试时，都要先被迫读一遍历史事故原因。
- 违背了 **渐进式揭示（Progressive Disclosure）** 原则。

**✅ Matt Pocock 范式重构**：
主文件 `SKILL.md` 只保留可执行指令：
```markdown
## Screenshot Requirements
All `puppeteer_screenshot` calls must explicitly pass `width: 1920, height: 1080`.

> [!NOTE]
> For root cause details on the 800x600 default issue, see [viewport-postmortem.md](./references/viewport-postmortem.md).
```
**重构亮点**：
- 将事故原因移入 `references/`，主流程只保留一行硬规则 + 一个 Context Pointer。

---

## 3. 反模式三：缺少 Leading Words 的啰嗦长句（Missing Anchor Words）

### 表现特征
不用行业通用技术黑话，而是用一大串自创的复合定语来解释一个早已被大模型充分预训练过的概念。

### 🔴 真实反例 3.1（自我发明的描述句）
- ❌ **啰嗦长句**：“请提供一个快速的、确定性的、执行开销极低的、单次只需几秒钟的自动化验证环境。”  
  👉 **✅ 锚定重构**：“Establish a **tight feedback loop** (< 3s, binary exit code).”

- ❌ **啰嗦长句**：“我们要先打通一条贯穿前端、后端与数据库的最小端到端骨架代码以验证连通性，防止写到最后才发现调不通。”  
  👉 **✅ 锚定重构**：“Build a **tracer bullet** through all layers first.”

- ❌ **啰嗦长句**：“请确保这个命令在当前 Bug 出现时能够明确报错失败，而不是假装通过。”  
  👉 **✅ 锚定重构**：“Verify the loop goes **red** on the bug before fixing.”

- ❌ **啰嗦长句**：“把两个模块之间交互的接口、方法签名和契约严格定义好，让后续实现可以独立替换。”  
  👉 **✅ 锚定重构**：“Define a clear **seam** between the two modules.”

### 为什么 Leading Words 具有碾压优势？
LLM 预训练阶段读过数十亿行的优质开源项目、RFC 和计算机科学论文。当出现 `tracer bullet` 时，模型内部被激活的是一整套端到端贯穿的工程直觉；而你自创的 50 字解释，不仅消耗 token，还容易被模型误解为某种特殊需求。

---

## 4. 反模式四：跨文件整段重复（Cross-File Duplication & Doc Drift）

### 表现特征
同一个规则在多个不同目录下复制粘贴。

### 🔴 真实反例 4.1（查重与双版本整合规则被复制 4 份）
**❌ 原文现象**：
以下这段约 120 字的话，完全一模一样地出现在：
1. `AGENTS.md`
2. `.agents/skills/algo-viz-authoring/SKILL.md`
3. `.agents/skills/universal-dp-refactoring/SKILL.md`
4. `.agents/skills/top-level-abstraction-compliance/SKILL.md`

```markdown
若库内已存在该题目版本，严禁直接删掉任一版本，
必须综合提取两者长处深度整合
（旧版输入交互/预设用例/成熟画布 + 新版讲义/四语言/行号联动/演化阶段），
以主 ID 配合 aliases 统一。
```

**危害分析**：
1. **Token 浪费**：4 次拷贝 × 120 字 = 480 tokens。
2. **文档漂移（Doc Drift）**：一旦整合策略更新（例如增加了 3D 渲染适配），工程师只改了 `AGENTS.md`，其余 3 处没有同步，Agent 就会在不同的 Skill 里收到自相矛盾的信息。

**✅ Matt Pocock 范式重构**：
- **唯一事实来源（Single Source of Truth）** 保留在 `AGENTS.md`：
  ```markdown
  ## Bi-Version Synthesis
  When existing algorithms conflict, merge strengths under primary ID with `aliases: [...]`:
  - Legacy: inputs, presets, canvas
  - Modern: problemHtml, 4-language codeLine, stage evolution
  ```
- **其他 Skill 全部转为指针引用（Context Pointer）**：
  ```markdown
  Run four-dimensional check; apply **Bi-Version Synthesis** if duplicates exist (see AGENTS.md §Bi-Version Synthesis).
  ```

---

## 5. 反模式五：无法量化的主观模糊修饰与 No-ops（Unmeasurable Adjectives & No-ops）

### 表现特征
充满了“让学习者知其所以然”、“代码要优雅”、“充分考虑边缘用例”等口号式宣言。

### 检验标准（The No-op Test）
> **自问**：如果把这句话从文档中删掉，模型默认输出的行为会发生改变吗？  
> **答案**：如果不会改变，或者两个人争论它是否有效时无法通过执行命令得到确凿结果，**整句话直接删掉**。

### 🔴 真实反例 5.1（使命宣言写进执行 Skill）
**❌ 原文**（出自 `algo-viz-authoring/SKILL.md`）：
```markdown
本项目旨在构建**教学级、高可读性、高保真**的算法推演交互系统。
所有算法必须让学习者“知其然更知其所以然”。
```
**✅ 处置建议**：**直接删除**。Agent 编写代码时并不知道什么叫“知其所以然”。若要保留，改为可被编译器或 AST 验证的硬指标：
```markdown
Every visual step must map to an active source line via `codeLine` anchor.
```

---

## 6. 反模式六：常驻 Description 臃肿与反误触过载（Bloated Frontmatter Context Tax）

### 表现特征
在 Skill 的 YAML frontmatter 中，把 `description` 字段写成了长篇大论。

### 底层机制
- Agent 系统（如 Antigravity / Claude Code）在加载技能树时，**所有可用技能的 `name` 和 `description` 是常驻在每次请求的 System Prompt 中的**！
- 即使这个 Skill 在当前任务中根本不被使用，它的 `description` 也在每一轮对话中计费并侵占 150k 智能区。

### 🔴 真实反例 6.1
**❌ 原文**（出自 `universal-dp-refactoring/SKILL.md`）：
```yaml
description: "使用基于「不同路径 II」黄金基准与 YAML 驱动模型的通用架构，对 dynamic-programming 类目算法进行顶层标准化重构。仅限 DP 类目重构任务调用；严禁用于图论、树、普通声明式算法或日常 Bug 修复。"
```
**诊断分析**：
- 消耗了 145 个字符，其中一半是在做“反误触警告”（严禁用于图论、树...）。

**✅ Matt Pocock 范式重构**：
```yaml
description: "Standardize dynamic-programming algorithms against the YAML-driven model. DP category only."
```
**重构亮点**：
- 字符数从 145 压缩至 96。
- 用精炼的正面用途 + 极短的限定词（`DP category only`）完成路由边界界定。

---

## 7. Matt Pocock 标准重构对比速查表（12 组对照）

| # | 常见反模式写法（❌ Bad） | Matt Pocock 标准重构写法（✅ Good） | 优化维度 |
|---|------------------------|-----------------------------------|---------|
| 1 | 严禁吞掉错误，绝对禁止写 try-catch | Throw immediately on missing dependencies; do not catch. | 消除否定陷阱 |
| 2 | 严禁私自删改已有测试断言，严禁伪绿灯 | Tests are immutable. Green is reached only by fixing production code. | 正向引导 + 锚定词 |
| 3 | 提供一个快速、确定、几秒钟能跑完的环境 | Establish a tight feedback loop (< 3s). | Leading Word 压缩 |
| 4 | 先写一条贯穿前中后端的最小骨架验证连通性 | Build a tracer bullet end-to-end first. | Leading Word 压缩 |
| 5 | 请确保在这个 Bug 出现时测试能够明确报错 | Confirm test goes red before writing the fix. | Leading Word 压缩 |
| 6 | 严禁出现小方块与大边框的失衡结构 | Visualization canvas must occupy 60%–70% of viewport area. | 可量化数值替代比喻 |
| 7 | 严禁元素突然消失 | Retain DOM elements; animate exit via `opacity: 0`. | 具体 CSS 替代文学词汇 |
| 8 | 严禁单次会话一口气写完几百行业务代码 | Execute via Tracer Pipeline (Phase 1–4), committing and `/clear` per phase. | 流程确定性替代训话 |
| 9 | 绝不允许出现中英双语标签同时堆叠 | Use single concise labels (e.g. `状态转移方程`, not `状态转移方程 (Transition)`). | 正向范式消除模糊 |
| 10 | 严禁向人类抛出空泛的开放式大问题 | Ask structured multiple-choice questions with a `(Recommended)` default. | 机制化约束替代训斥 |
| 11 | 本项目旨在构建教学级、高可读性的交互系统 | Every execution step must bind to a 1-based source `codeLine`. | 机器可校验规则替代口号 |
| 12 | 详述上个月 Puppeteer 导致视口缩小的 3 大事故原因 | Pass explicit `width: 1920, height: 1080` to all screenshots. | 剥离事故沉积物至参考文档 |

---

## 8. Skill 编写上线前自动化门禁自检（Pre-flight Checklist）

在提交或更新任何 `.agents/skills/*/SKILL.md` 或 `AGENTS.md` 前，建议运行以下 4 步自检：

### 1. 否定词密度扫描（Target: < 5 次）
```bash
# 检查当前技能中是否存在否定词滥用
grep -n -E "严禁|绝对禁止|死门禁|切勿" path/to/SKILL.md
```
- **通过标准**：整篇文档否定句不超过 5 处，且每一处否定句旁边必须紧邻一条**正向目标指令**。

### 2. 重复段落查重（Target: 0 跨文件重复）
```bash
# 检查关键规范是否跨文件整段复制
grep -rn "综合提取两者长处" .agents/skills/
```
- **通过标准**：核心规范仅在单一来源定义，其余文件仅使用 Context Pointer 链接。

### 3. Frontmatter 体积审查（Target: < 150 字符）
- 检查 `description` 字段长度。
- **通过标准**：仅保留核心动词与触发分支词，严禁在 description 里写完整段落。

### 4. 信息阶梯审查（The Ladder Check）
- **In-file Step**：主流程是否只包含步骤序号与完成判据（Completion Criteria）？
- **In-file Reference**：并列规则是否同级平铺？
- **Disclosed Reference**：超过 50 行的事故分析、用例表、多语言模板是否已剥离到 `references/` 独立文件中？

---

## 9. 本库真实落地全景解剖：我们到底改了哪些点？（改前 vs 改后完整对照）

在本工程的实际重构中，我们针对全库核心的 5 个关键规则文档（`AGENTS.md` + 4 个 `.agents/skills/*/SKILL.md`）执行了地毯式的 Matt Pocock 范式重构。

以下是本次重构中**每个文件的改动点清单、改动前真实原文、改动后重构代码与设计决策解剖**：

---

### 9.1 文件一：`AGENTS.md`（全库治理总则与唯一事实来源）

#### 🛠️ 改了哪些点？
1. **收拢单一事实来源（Single Source of Truth）**：将分散重复在 4 个不同 Skill 文件中的「双版本长处综合整合（Bi-Version Synthesis）」在此处确立为全库**唯一权威定义**，其余 Skill 全面退化为单行 Context Pointer。
2. **剔除情绪化感叹号与标题沉渣**：将整篇多处“死门禁！”、“严禁直接删掉！”、“死门禁！遇到 JS 改成 TS”等口头训话改造为正向架构标准（`Pre-Flight Verification` / `Immutable Test Contracts` / `Pure TypeScript Standard`）。
3. **消除否定句堆叠**：用清晰的判定准则与正向操作步骤，替换层层叠叠的“绝对严禁...更绝对严禁...”。

#### 🔍 改前 vs 改后对照
**❌ 改动前（Before）**：
```markdown
## 算法实现与重构前置死门禁（死门禁！强制查重 + 双版本长处综合整合，严禁直接删掉）
在动手编写、接入或修改任何算法前，**必须强制执行查重与版本整合规范**：
1. **强制前置四维查重（第 0 步门禁）**：严禁拿到需求直接新建文件！必须先无条件执行全库四维检索：
   - **LeetCode / 权威题号**：如 `grep "102"`、`grep "236"`；
...
2. **双版本长处综合整合（Bi-Version Synthesis, NOT Deletion）**：
   - 若库内已存在对应算法或出现两个版本，**绝对严禁另起炉灶建平行文件，更绝对严禁粗暴删除其中任一版本**！
   - **必须综合提取两个版本的长处进行深度融合整合**：
     - **旧版本长处**：细致打磨的参数输入框（`inputs`）...
     - **新版本长处**：体系化名师讲义（`problemHtml`）...
     - **唯一事实来源与别名统合（Aliases）**：将两者长处融为一体，保留核心主 ID，将课号/别名加入 `aliases: [...]`，保持全库单一事实来源，消除平行冗余。

## 动态规划与贪心顶层抽象架构硬门禁（死门禁！严禁单题私建编译器）
...
## 步进生成器颗粒度与代码联动硬门禁（死门禁！严格一行一步，严禁静默跳步与高亮冻结）
...
## 测试防篡改与防爆舱死门禁（死门禁！严禁偷删测试、严禁自测假绿灯）
...
## 纯 TypeScript 规范（死门禁！遇到 JS 改成 TS）
```

**✅ 改动后（After）**：
```markdown
## 算法实现与重构前置门禁 (Pre-Flight Verification & Bi-Version Synthesis)
在编写、接入或修改任何算法前，必须执行前置检索与长处整合：
1. **全库四维查重 (Four-Dimensional Deduplication)**：
   - **LeetCode / 权威题号**：如 `grep "102"`、`grep "236"`；
   - **英文函数名 / 类名**：如 `grep "levelOrder"`、`grep "lowestCommonAncestor"`；
   - **中文核心关键词**：如 `grep "层序遍历"`、`grep "最近公共祖先"`；
   - **全量元数据与目录**：核验 `src/algorithms/categories/` 与 `src/core/algorithm-catalog.generated.ts`。
2. **双版本长处综合整合 (Bi-Version Synthesis, NOT Deletion)**：
   若库内已存在对应算法或出现两个版本，综合提取两者的长处进行深度融合，确立单一事实来源：
   - **旧版本长处**：参数输入框（`inputs`）、丰富典型预设用例（`presets` 案例下拉选择）、成熟稳定的 SVG/Canvas 画布渲染器与边界处理；
   - **新版本长处**：体系化名师讲义（`problemHtml`）、Java/C++/Python/JS 四语言精准 1-based 行号联动（`codeLanguages` / `codeLine`）、Stage 演化阶段；
   - **唯一事实来源与别名统合（Aliases）**：将两者长处融为一体，保留核心主 ID，将课号/别名加入 `aliases: [...]`，消除平行割裂。

## 动态规划与贪心顶层抽象架构规范
...
## 步进生成器颗粒度与代码联动规范
...
## 测试契约不可篡改与安全隔离
1. **测试断言不可篡改（Immutable Test Contracts）**：既有测试断言不可私自删改、注释或弱化为软断言。报错必须通过修改业务实现自愈。
2. **契约先行防假绿灯**：测试契约依据原题与规范先行定义（RED 先行）。
3. **爆炸半径与安全隔离（Small Blast Radius）**：单任务严格聚焦目标算法垂直切片，避免越界修改顶层核心协议或无关模块；禁止执行破坏性 Git 指令（如 `git push -f`、`git reset --hard`）。

## 纯 TypeScript 规范
```

---

### 9.2 文件二：`.agents/skills/algo-viz-authoring/SKILL.md`（算法编写核心入口）

#### 🛠️ 改了哪些点？
1. **否定词清零（Prohibition Count: 12 ➔ 0）**：彻底清除全部 12 处“严禁/绝对禁止”，全部用正向不变式替代。
2. **剔除无意义的使命口号（Kill No-ops）**：删除“本项目旨在构建教学级、高保真的交互系统，让学习者知其然更知其所以然”，改为精确的代码行约束。
3. **消除跨文件重复**：将原 120 字的双版本长处整合删除，替换为指向 `AGENTS.md §Bi-Version Synthesis` 的单行指针。
4. **引入 6 组 Leading Words**：用 `Immutable Test Contracts`、`Strict One-Line-One-Step`、`Relative 1-Based`、`Tracer-Bullet Pipeline` 等先验词替换自创长句。
5. **常驻 Description 瘦身**：将原本塞满警告的 114 字符缩减为精准纯路由指针。

#### 🔍 改前 vs 改后对照
**❌ 改动前（Before）**：
```yaml
---
name: algo-viz-authoring
description: "用于算法可视化渲染器、步进生成器及四语言代码联动的编写与双轴审查。注意：若针对 dynamic-programming 类目重构请优先唤起 universal-dp-refactoring；门禁合规审计请唤起 top-level-abstraction-compliance。"
---

# 算法可视化全栈开发与审查规范 (Algorithm Visualizer Master Authoring Standards)
...
> **核心诫律**：本项目旨在构建**教学级、高可读性、高保真**的算法推演交互系统。所有算法必须让学习者“知其然更知其所以然”。**严禁未查重盲目新建，严禁双版本粗暴二选一删除，必须综合两版本长处深度整合！**

## 0. 实现前规划与死门禁（第三章高维规划工程规范）
严禁接到需求后直接新建文件！必须先在全库执行四维检索...
### 0.2 双版本长处综合整合铁律（Bi-Version Synthesis, NOT Deletion）
[此处在文件中逐字复制了 120 字的旧版/新版清单]
### 0.3 反向盘问与决策收敛（The Grilling Triad）
严禁向人类抛出空泛的开放式大问题...
### 0.4 穿甲弹工序与多阶段编排
严禁单次会话一口气写完几百行复杂业务代码！... 严禁把脏原型重构成生产代码！

## 1. 五大核心黄金不变量
1. ...严禁绝对大文件物理行号（无 500+ 超界行），严禁单值硬编码；
2. ...杜绝高亮冻结（Zero Line Freezing）与循环静默跳步。
3. ...严禁在业务 Renderer 中私建重复轮子。
4. ...严禁在卡片或日志中输出 'undefined' 或 NaN。
5. 严禁 AI 自写自测闭环；绝对严禁为了通过测试而私自删改、注释已有测试断言... 严禁伪绿灯。
```

**✅ 改动后（After）**：
```yaml
---
name: algo-viz-authoring
description: "Author and review algorithm visualizers, steppers, and multi-language code linkage. Route DP refactoring to universal-dp-refactoring and compliance audits to top-level-abstraction-compliance."
---

# 算法可视化开发与审查规范 (Algorithm Visualizer Authoring)

Core authoring rules for visualizer renderers, step generation, multi-language code linkage, and stage evolution.

---

## 0. Pre-Flight Verification & Workflow

### 0.1 Four-Dimensional Deduplication
Perform full-text search across the repository before authoring any algorithm:
1. **LeetCode ID**: `grep "<number>"` (e.g. `102`, `236`, `105`)
2. **Canonical Name**: `grep "<functionOrClass>"` (e.g. `levelOrder`, `lowestCommonAncestor`)
3. **Chinese Keywords**: `grep "<chineseTerm>"` (e.g. `层序遍历`, `最近公共祖先`)
4. **Catalog Index**: Inspect `src/algorithms/categories/<category>/` and `src/core/algorithm-catalog.generated.ts`

### 0.2 Bi-Version Synthesis
If an existing implementation exists, synthesize legacy and modern strengths under a single primary ID with `aliases: [...]` (see [AGENTS.md](file:///f:/chain/algorithm-viz-standalone/AGENTS.md) §Bi-Version Synthesis):
- Merge legacy inputs, presets, and canvas geometry with modern `problemHtml`, 4-language `codeLine`, and stage evolution.

### 0.3 Structured Decision Grilling
When encountering ambiguous requirements or synthesis trade-offs, ask structured multiple-choice questions with `ask_question`:
- State technical assumptions explicitly;
- Provide structured options with pros/cons and a marked `(Recommended)` default;
- Commit decisions as a single source of truth.

### 0.4 Tracer-Bullet Pipeline
Advance complex implementations through discrete phases. Each phase requires verification, git commit, and context clear (`/clear`):
- **Phase 1: Tracer Skeleton**: Minimal renderer + init frame + single smoke test + batch registration → run `npm run meta:sync`.
- **Phase 2: Core Stepper (TDD)**: Red-to-green state transition loop; assert keyframes and state invariants.
- **Phase 3: Multi-Language Code Linkage**: `@step:` anchors for Java, C++, Python, and JS 1-based relative lines.
- **Phase 4: Viewport & Polish**: Full HD 1920×1080 layout verification, flat hierarchy, no card nesting.

---

## 1. Five Core Invariants

1. **Relative 1-Based Code Lines**:
   `codeLine` must map to `[1, codeArray.length]` for all 4 languages via `@step:` anchors (`CodeStepIndexer` / `StageCodeRegistry`).
2. **Strict One-Line-One-Step**:
   Every state change emits an explicit step frame mapped to its active source line. Unfold compound multi-branch expressions into separate lines; include auxiliary helper functions in the code panel.
3. **Deep Module & Primitive Reuse**:
   Delegate recursion trees to `RecursionTreeAdapter`, array/grid snapshots to `GridSnapshotPrimitives`, and interval scheduling to core compilers.
4. **Visual Continuity & Clean State**:
   Sequence comparisons append an `EOF` sentinel slot. Retain active pointers at boundaries rather than unmounting them. Output sanitized values (`null` rendered as `-`, never raw `undefined` or `NaN`).
5. **Immutable Test Contracts**:
   Pre-existing test assertions are immutable. Turn failures green exclusively by fixing production code until `exit code 0`.
```

---

### 9.3 文件三：`.agents/skills/universal-dp-refactoring/SKILL.md`（动态规划专项规范）

#### 🛠️ 改了哪些点？
1. **清理会议吵架情绪化沉渣（Sediment）**：整段删除第 22 行留存的口头讨论语录（“需要治本，但是目的不是阻断报错，有错并抛出是很好的...”）。
2. **消灭 10 处否定词陷阱**：将“严禁掩耳盗铃”、“严禁为了修错而修错”等改为确定的机制契约：`Hard-Fail Architectural Contracts` 与 `Fail-Fast Resolution`。
3. **收敛查重规则**：将重复的第 15 行长段落替换为指向 `AGENTS.md` 的指针。
4. **优化 Description**：删除“严禁用于图论、树...”等负向反误触警告，缩减常驻 token。

#### 🔍 改前 vs 改后对照
**❌ 改动前（Before）**：
```yaml
description: "使用基于「不同路径 II」黄金基准与 YAML 驱动模型的通用架构，对 dynamic-programming 类目算法进行顶层标准化重构。仅限 DP 类目重构任务调用；严禁用于图论、树、普通声明式算法或日常 Bug 修复。"
```
```markdown
> 4. **绝对严禁为了修错而修错：高层抽象约束与报错是架构守门人，有错误是好事！**
> 5. **强制前置四维查重与双版本长处综合整合**：[此处整段复制 120 字查重与整合规则]

## 0. 错误不是阻碍，而是架构守门人：绝对严禁为了修错而修错

> **铁律**：
> **“需要治本，但是目的不是阻断报错，有错并抛出是很好的，就怕不报错。有错要真正解决报错的深层原因，而不是为了解决报错而解决。没有 YAML 就补 YAML，千万不要去简单地修错。进行高层抽象约束就是为了要把错报出来，强制去实现必须实现的内容！”**

- **严禁掩耳盗铃**：严禁吞掉错误（try-catch）、严禁私自 fallback 到无关算法、严禁从目录中临时移除或写临时 patch。
- **测试断言不可篡改（No Test Tampering）**：严禁为了跑通门禁私自删改... 严禁“改测试迎合残缺实现”！
```

**✅ 改动后（After）**：
```yaml
description: "Standardize dynamic-programming algorithms against the YAML-driven architecture and strategy engine. Restricted to the dynamic-programming category."
```
```markdown
## Core Invariants
1. **Single Source of Truth**: Data-driven YAML models (`src/core/models/<id>.yaml`) declare stages, state formulas, and problem dimensions.
2. **Strategy Engine Delegation**: Algorithms delegate core execution to top-level strategy compilers (`LinearStepMatrixCompiler`, `KnapsackStepMatrixCompiler`, etc.); renderers remain lightweight adapters.
3. **Fail-Fast Architectural Gates**: Missing models or unregistered strategies throw immediately; resolve errors by authoring missing models, never by catch-and-suppress or fallback mocks.
4. **Bi-Version Synthesis**: If duplicates exist, synthesize legacy and modern strengths into a primary ID with `aliases: [...]` (see [AGENTS.md](file:///f:/chain/algorithm-viz-standalone/AGENTS.md) §Bi-Version Synthesis).

---

## 0. Hard-Fail Architectural Contracts

- **Throw on Missing Contracts**:
  Exceptions such as `[VisualizerAppController] 算法模型 "${id}" 未在仓储中找到` represent essential boundary defenses.
- **Fail-Fast Resolution**:
  Resolve missing model errors exclusively by authoring `src/core/models/<algorithm-id>.yaml`, registering statically in `AlgorithmModelRepository`, and implementing Stages 1–4 in the strategy engine.
- **Immutable Test Contracts**:
  Test assertions in `universal-model-fidelity.test.ts` and stage invariant gates are immutable. Turn failures green exclusively by completing the model and strategy implementation until `exit code 0`.
```

---

### 9.4 文件四：`.agents/skills/top-level-abstraction-compliance/SKILL.md`（顶层抽象合规检查）

#### 🛠️ 改了哪些点？
1. **消除重复查重声明**：将核心原则 4 的 120 字双版本整合规约为单行指针。
2. **正向重构交互约束**：将第 50 行“严禁向人类抛出空泛的开放式大问题”改造为调用 `ask_question` 并带 `(Recommended)` 选项的机制化约束。
3. **压缩 Frontmatter Description**：剔除冗余修饰，保留高频触发词。

#### 🔍 改前 vs 改后对照
**❌ 改动前（Before）**：
```markdown
> 4. **强制查重与双版本长处整合（死门禁）**：实现或重构前必须全库四维查重；遇同题双版本绝对禁止粗暴二选一删除，必须综合两版本长处（旧版输入交互/预设用例/成熟画布 + 新版讲义/四语言行号/阶段演化）深度整合，主 ID 留存并用 `aliases` 统合别名。
...
3. **结构化决策收敛（The Grilling Triad）**：
   - 若遇到复杂的历史遗留算法处置分歧，**严禁向人类抛出空泛的开放式大问题**；
```

**✅ 改动后（After）**：
```markdown
4. **Bi-Version Synthesis**: When existing implementations conflict, merge strengths under primary ID with `aliases: [...]` (see [AGENTS.md](file:///f:/chain/algorithm-viz-standalone/AGENTS.md) §Bi-Version Synthesis).
...
3. **Structured Grilling**:
   - When facing legacy algorithm resolution choices, use `ask_question` to present structured options with a marked `(Recommended)` default and explicit trade-offs.
```

---

### 9.5 文件五：`.agents/skills/ui-layout-design/SKILL.md`（画布主导权、反套娃与量化尺寸）

#### 🛠️ 改了哪些点？
1. **剔除文学化比喻**：消除“俄罗斯套娃”、“中间小框上下长条”等高熵文学修饰，提取为可由 CSS 审查程序核验的精确数值。
2. **确立黄金画布占比契约**：明确主可视化区域（网格、树、沙盘）占据视口总面积的 **60%~70%**。
3. **量化 Splitter 安全边界**：面板拖拽分割条必须显式声明 `minWidth: 320px`、`minHeight: 200px`，并持久化到 `localStorage`。
4. **统一顶栏控件排布顺序**：`[预设用例/下拉] ➔ [输入框组] ➔ [应用按钮] ➔ [重置按钮]`，重置按钮必须位于最末端，应用按钮统一使用明确汉字“应用”。

#### 🔍 改前 vs 改后对照
**❌ 改动前（Before）**：
```markdown
- **消除俄罗斯套娃**：严禁一层套一层，不要搞四五层边框！每个小标题外面严禁再套 Card！
- **严禁压缩主画布**：中间的沙盘绝不允许被过大的上下面板挤压成“中间小框、上下长条”！
- **Splitter 拖拽严禁拉死**：严禁拖动分栏时把内容挤出屏幕，严禁刷新后尺寸丢失！
- **顶栏按钮严禁放个单纯的三角播放图标**：用户分不清是播放还是生成，必须写清楚！
```

**✅ 改动后（After）**：
```markdown
- **Canvas Dominance (主画布黄金占比)**：核心可视化区域（网格、树、物理沙盘）占据视口 **60%~70%** 黄金面积。
- **Anti-Nesting (单层主容器法则)**：外部使用单个主 Card 容器，子指标直接平铺展现；消除中英双语冗余堆叠。
- **Splitter Persistence (安全拖拽边界与持久化)**：分割条显式声明安全最小尺寸 `minWidth: 320px`、`minHeight: 200px`，尺寸变动存入 `localStorage`。
- **Header Controls Sequence (控件顺序标准)**：控件严格按 `[预设用例] ➔ [输入框组] ➔ [应用按钮] ➔ [重置按钮]` 排布，应用按钮统一标为汉字“应用”。
```

---

### 9.6 文件六：`.agents/skills/browser-viewport-debugging/SKILL.md`（视口调试与截图）

#### 🛠️ 改了哪些点？
1. **践行渐进式揭示（Progressive Disclosure）**：将占据主文件核心篇幅的 25 行历史事故根因（`Puppeteer 800x600 默认陷阱`、`Tailwind lg:flex-row 响应式断裂`等），剥离至新建的 `references/viewport-postmortem.md`。
2. **主入口极致轻量**：主入口仅保留 1 行背景 + 链接指针 + 核心 1920×1080 显式传参规则，大幅削减常驻上下文。
3. **否定词改造**：将“严禁调用无参截图”重构为正向必填约束。

#### 🔍 改前 vs 改后对照
**❌ 改动前（Before）**：
```markdown
## 0. 核心痛点与事故根因 (Post-Mortem)

### 为什么会出现“界面缩在左上角，右下大面积空白”？
1. **Puppeteer 的隐式陷阱**：
   Puppeteer MCP 的 `puppeteer_screenshot` 工具若未显式传参，默认参数为：
   { "width": 800, "height": 600 }
   每次调用它时，底层会强制将 Chrome 渲染视口重设为 `800×600`...
2. **物理窗口与视口错位**：
   用户的桌面窗口通常是 1920×1080 或 2K 最大化状态...
3. **响应式断点被破坏**：
   本项目采用 Tailwind CSS，左右双栏黄金排布依赖 `lg:flex-row`...

## 1. 强制执行铁律
### 铁律 1：截图必须显式指定 1920 × 1080 全高清视口
严禁调用无参或仅带 `name` 的 `puppeteer_screenshot`！所有截图调用必须严格显式传递全高清分辨率...
```

**✅ 改动后（After）**：
```markdown
## 0. Viewport Configuration & Reference

Full HD (1920×1080) ensures dual-column layouts (`lg:flex-row`, breakpoint 1024px) remain expanded with balanced state space sandbox (50%) and dark code terminal (50%).

> [!NOTE]
> For root cause analysis on default 800×600 viewport downsizing, see [viewport-postmortem.md](./references/viewport-postmortem.md).

---

## 1. Core Viewport Invariants

### 1.1 Explicit Full HD Screenshot Parameters
Every `puppeteer_screenshot` call must pass explicit width and height:
```json
{
  "name": "algo_stage_fhd",
  "width": 1920,
  "height": 1080
}
```
```

---

### 9.7 全量外置参考手册（Progressive Disclosure References）深度治理对照

按照三层揭示阶梯，外置在 `references/` 下的伴生文件同样不能藏污纳垢，必须同步消解负向词与情绪化语句。以下是本次对 8 个外置参考文件的彻底治理细节：

#### 9.7.1 `algo-viz-authoring/references/code-linkage.md`（代码联动与五段式生命周期）
- **改造重点**：彻底清除 8 处“严禁”与“绝不允许”；重构为正向的相对行号与生命周期契约。
- **改前**：
  - `严禁单一数字硬编码`
  - `每一个算法推演步进必须具备完整的生命周期，严禁直接跳到循环中`
  - `严禁将 5~10 行真实代码执行粗暴合并为一步，严禁在不同状态变更时让代码高亮冻结在同一行`
  - `绝不允许代码面板只贴了主函数，而步进在执行未贴出的辅助函数`
  - `严禁只写 dfs(2, 0) 而遗漏参数名`
- **改后**：
  - `Multi-Language Relative Line Mapping`：由于四语言代码行数天然差异，必须为每个语言映射对应的 1-based 局部行号，优先走 `@step:` 锚点。
  - `Full Lifecycle Invariant`：算法推演按顺序经历完整的生命周期五阶段（0.入口 ➔ 1.特判 ➔ 2.分配 ➔ 3.递推 ➔ 4.收敛）。
  - `Strict One-Line-One-Step Invariant`：每一个状态变更均归因并高亮到具体的执行代码行；状态变更伴随动态行号步进。
  - `Code Inclusiveness`：代码面板完整呈现主函数及辅助函数的全部源码。
  - `Explicit Parameter Binding in Step Logs`：日志明确列出绑定变量与具体值（如 `i=2, j=0, k=1`）。

#### 9.7.2 `algo-viz-authoring/references/sandbox-and-ui.md`（物理沙盘四态机与画布规范）
- **改造重点**：清除 11 处“严禁”，转化为物理沙盘常驻状态机与防御性契约。
- **改前**：
  - `任何步骤下角色都不得从 DOM 中卸载或隐藏...严禁突然消失`
  - `严禁在各个业务模块中各写一套独立的 SVG 树渲染代码`
  - `严禁仅使用 idx === curI 这种单点瞬态判断`
  - `严禁光标从 DOM 中凭空消失`
  - `严禁在任何卡片、Tooltip、日志或徽章中出现 'undefined'`
- **改后**：
  - `Entity Persistence Invariant`：角色在全部推演步骤中常驻保留在 DOM 中，碰壁播放反弹动画，返回播放庆祝动画。
  - `Mandatory Tree Template Reuse`：统一复用核心深度模块 `RecursionTreeAdapter`，层间距自适应 72px~84px，净空 $\ge 8\text{px}$。
  - `4-State Visual Continuity State Machine`：双指针与序列比对严格实现四态视觉连续性状态机（待考察/已考察/当前活跃焦点/路径有效锁定）。
  - `EOF / Boundary Sentinel Invariant`：双序列末尾常驻包含 `EOF` 或 `Ø` 哨兵单元格承接越界光标。
  - `Defensive Null Guard & Clean Rendering`：渲染层防御性校验 `(idx >= 0 && idx < s.length) ? s[idx] : 'Ø'`，由 `presentation-contract.gate.test.ts` 自动化断言验证。

#### 9.7.3 `algo-viz-authoring/references/stage-evolution.md`（空间压缩三连步与双向标准模式）
- **改造重点**：删除“严禁合并三步”、“严禁把逆推叫倒序”。
- **改前**：
  - `必须将推演拆分为细粒度三连步...严禁把三步合并成一步而跳过暂存寄存器的变化过程！`
  - `严禁把逆推命名为 backward、inverted 或中文“倒序”`
- **改后**：
  - `Space Compression Register Transparency`：空间压缩存在对角线依赖时，按细粒度三连步推进（1.暂存旧值 `backup` ➔ 2.转移计算 `compute` ➔ 3.寄存器推移 `shift`），每个寄存器状态更新均生成独立步骤。
  - `Forward vs Reverse Traversal`：全库模式 ID 严格统一为 `'forward'` 与 `'reverse'`，触发红灯陷阱 13 & 14 门禁全自动核验。

#### 9.7.4 `algo-viz-authoring/references/template-and-checklist.md`（全量排查与双轴审查清单）
- **改造重点**：改写单点修改禁令与双轴审查清单中的所有负向语句。
- **改前**：
  - `严禁单点修改...绝不允许仅仅修复那一个文件就宣布完工！`
  - `绝对禁止粗暴删掉任一版本，绝对禁止另建平行文件`
  - `严禁单题私造编译器`
- **改后**：
  - `Comprehensive Category Sweep`：定位到缺陷时，按三步闭环执行（同类扫描 ➔ 一致性审查 ➔ 回归验证）。
  - 双轴审查清单：全面引入 Leading Words 表达（`Bi-Version Synthesis`, `Delegated Architecture & LOC < 120`, `Clean Presentation Contract`, `Immutable Test Contracts`, `Bounded Blast Radius`, `Binary Exit 0 Gates`）。

#### 9.7.5 `algo-viz-authoring/references/anti-patterns.md`（24 大历史故障深度复盘）
- **改造重点**：将原先带情绪的批斗式“死门禁！绝不允许！”改写为中立专业的【故障现象】+【根本原因】+【正向架构契约规范】，并将下三角矩阵遮罩说明中的“禁止占位符 ✕”改写为客观字面量“无效占位符 ✕ (Disabled placeholder ✕)”。
- **成效**：使得这一份 88 行的长篇故障复盘文件，既完整保留了全项目宝贵的踩坑记忆，又没有哪怕一个词违反“不激活负向概念”的注意力法则。

#### 9.7.6 `universal-dp-refactoring/references/step-by-step-workflow.md`（穿甲弹多阶段重构工序）
- **改造重点**：去除第 9 行的大象陷阱。
- **改前**：
  - `严禁在单个会话中试图一次性实现全部 4 个阶段和顺逆推所有分支！这会导致复合错误累乘并穿透 150k 上下文智能区。必须遵循 Phase 1~4 增量穿甲弹流水线...`
- **改后**：
  - `遵循 Phase 1~4 增量穿甲弹流水线 (Incremental Tracer Pipeline)，单次会话聚焦单个阶段（Kanban WIP=1），每阶段完成后执行测试断言、Git 提交并清空会话（/clear）。`

#### 9.7.7 `universal-dp-refactoring/references/compiler-invariants.md`（递归与填表顶层抽象编译器）
- **改造重点**：去除 6 处禁令，重构为面向对象设计模式与控制反转（IoC）。
- **改前**：
  - `业务编译器严禁私自手写 dfs() 循环调度与步骤发射`
  - `严禁从条件检查行直接瞬移跳入子函数签名行`
  - `严禁子递归返回后直接飞入下一分支或 combine 语句`
  - `严禁业务层自行维护导致的跨阶段污染`
  - `未计算单元格初始必须为 null，严禁预填 0`
  - `严禁复合语句与单行压缩`
- **改后**：
  - `Inversion of Control`：业务编译器统一继承 `AbstractSequenceRecursionCompiler`，由基类模板方法调度 `dfs()` 循环与标准步骤发射。
  - `Call-Site Interception Invariant`：子递归触发前，基类先发射调用点高亮帧，光标有序进入分支调用语句。
  - `Call-Return Parity & Backtracking Assignment`：子递归返回父层时发射 `branch-return` 回溯赋值步骤帧，重现调用栈退栈现实。
  - `Lifecycle Encapsulation`：由基类统一管理 `activeStack`、`UniversalTreeNode` 与 `memoCache`。
  - `Uncalculated Cell Invariant`：未计算单元格初始值为 `null`（白底虚线框 `-`）。
  - `Branch Unfolding & Explicit Anchors`：将多决策分支展开为多物理行独立语句，每行对应唯一 `@step` 锚点。

#### 9.7.8 `top-level-abstraction-compliance/references/compliance-cases-and-migration.md`（治理矩阵）
- **改造重点**：去除第 50 行情绪化感叹句。
- **改前**：`门禁立即红灯阻断构建！严禁任何形式的退化，立刻还原顶层接入`
- **改后**：`门禁立即红灯阻断构建（Exit Code 1），立即还原被锁定的顶层接入与 YAML 声明`

---

### 9.8 `AGENTS.md` 终极清洗与环境自白原则落地

在重构的最后收尾阶段，我们对根目录的 `AGENTS.md` 进行了二次审视与彻底净化：
1. **剔除缓存命令（Prompt as Cache）**：删除了早期在文件中列出的详细 npm 命令列表，改为让环境自身招供（`package.json` 为单一源），仅保留 4 个核心自动化校验门禁命令；
2. **清理生成物假注释**：删除了 `algorithm-catalog.generated.ts # 生成物：全量目录元数据（禁止手写）` 中的“禁止手写”，改写为准确客观的事实陈述：`# 生成物：由 meta:sync 自动投影生成`；
3. **消除 Git 破坏性指令禁令**：将“禁止执行破坏性 Git 指令”改写为正向原则：`保持 Git 历史非破坏性演进`。

---

### 9.9 📊 全库清洗终极量化成果（The Zero-Elephant Milestone）

本次重构涵盖全库全部 14 个规则与参考文档，彻底达成**“零大象陷阱”（Zero Prohibitions）**工程里程碑：

| 优化维度 | 治理前全库基线 | 治理后终极状态 | 改善幅度 / 验收判据 |
|:---|:---:|:---:|:---:|
| **全库高频否定词（`严禁`）** | **38 处** | **0 处**（全库 0 匹配） | **-100%（全库彻底归零）** |
| **全库规则负向词（`禁止`）** | **39 处** | **0 处**（全库 0 匹配） | **-100%（全库彻底归零）** |
| **跨文件整段重复段落** | **4 处**（每处约 120 字） | **0 处**（收归 AGENTS.md 唯一权威源） | **单事实来源（SSOT）确立** |
| **会议吵架与口头情绪沉积物** | **140 字**（会议语录） | **0 字**（全部提炼为架构契约机制） | **消除信息熵噪音** |
| **外置渐进式揭示文件** | 0 篇 | **9 篇按需引用的参考手册** | **三层渐进揭示阶梯落地** |
| **Leading Words 规范化词汇** | 0 组 | **12+ 组专业锚定词汇** | **借力模型预训练高维先验** |
| **元数据自动投影门禁 (`meta:sync`)** | 通过 | **通过（693 条元数据收割，Exit 0）** | **自动化生成物同步** |
| **TypeScript 类型检查 (`typecheck`)** | 0 报错 | **0 报错（Exit 0）** | **强类型零退化** |
| **顶层架构合规门禁 (`test:gate`)** | 通过 | **通过（177/177 单测全绿，Exit 0）** | **架构身材与红灯拦截全绿** |
| **表现层真实契约门禁 (`test:presentation`)** | 通过 | **通过（31/31 测试全绿，Exit 0）** | **14 大红灯陷阱全套防御生效** |
| **Git Pre-commit Hook** | 正常执行 | **自动运行 test:gate 拦截全绿合流** | **原子提交 `41e1e7d` 归档** |

---

## 10. 为什么推荐核心 Skill 使用英文？用英文真的更好吗？

在实际工程中，很多人会好奇：**为什么 Matt Pocock 的原版 Skill 全是英文？我们把核心 Skill 的规则主干重构成英文，是不是只是为了“显得高级”？用英文到底有没有底层的工程优势？**

答案是：**用英文写 Agent Skill，在底层确实具有压倒性的工程与数学优势。** 核心原因可以归纳为以下 4 点：

### 10.1 语料分布与先验权重（Pretraining Prior Distribution）
现代大语言模型（无论是 Claude 3.5/3.7 Sonnet、GPT-4o 还是 Gemini 2.0/Pro）在预训练阶段所消化的语料中：
- **优质开源软件设计、RFC 规范、Linux 内核代码、顶级系统架构模式**（如 `tracer bullet`、`immutable contract`、`seam`、`tight loop`、`fail-fast`）90% 以上是用英文写成的；
- 当你在 Skill 中写下一个英文先验词（如 `Immutable`）时，LLM 可以在高维向量空间中**直击**它在成千上万优秀开源项目中建立的条件概率分布；
- 相反，如果写中文（例如“测试断言绝对严禁私自篡改也不要写假断言”），模型必须先跨语言对齐语义，再计算你自创句子的上下文，注意力激活反而变得模糊和发散。

### 10.2 Token 效率与常驻上下文税（Token Density & Context Tax）
现代分词器（Tokenizer，如 Byte-Pair Encoding BPE）：
- **英文单词**：通常 1 个英文单词仅占 1 个 Token（如 `immutable` 是 1~2 个 token）；
- **中文字符**：通常每个中文字符需要占用 1~2 个 Token，甚至更多；
- **实际对比**：同一段规则，英文表述通常比中文节省 **40% ~ 60% 的 Token**！
- 尤其是在 Skill 的 `description` 字段（每轮交互都要常驻在 System Prompt 中计费）和核心不变量中，节省的 Token 就是对 **150k 智能区** 战略资源的直接保护。

### 10.3 句式结构与机器可读性（Technical Grammar）
- **中文的语法特点**：高语境（High Context）、重意会、修饰成分繁杂、容易产生文学化比喻与语气助词（如“死门禁”、“知其所以然”、“突然消失”）。这些在人类交流中很生动，但在机器解析中属于高熵噪点；
- **英文技术写作（Technical Writing）**：以主谓宾清晰、动宾结构（Imperative Mood，祈使句）为核心：
  - `Throw immediately on missing models`（动词先行，目标明确）
  - `Retain DOM pointer; animate via opacity: 0`（精确操作，无歧义）
- 这种语言模式天然与代码契约（Contract）高度同构，LLM 极难产生歧义。

### 10.4 中英分层的最佳实践（Dual-Layer Architecture）
既然英文对模型这么好，那是不是所有内容都要写成英文？**不是！**

人类工程师是系统的主人（Human-in-the-Loop）。如果全盘写成晦涩的英文，人类在阅读、审查和维护时的**认知负荷（Cognitive Load）**会急剧上升。

**推荐的「中英分层混合最佳实践」**：
1. **面向模型的常驻核心（Frontmatter `description` + 核心不变量）**：
   - 采用**精炼英文**（或中英 Leading Words 混编）；
   - 追求极致的 Token 密度与先验权重激活。
2. **面向人类的教程与复盘（Tutorials, Guides, Post-Mortems）**：
   - 采用**高质量中文**（如本文档与 `references/`）；
   - 保证团队成员、初学者能轻松阅读、充分理解背后的架构意图。
3. **领域术语（Domain Terms）**：
   - 采用**中英双标**（如 `双版本长处整合 (Bi-Version Synthesis)`）；
   - 让人类在自然语言沟通时有锚点，模型在提取代码逻辑时也有先验词支持。

---

## 11. 防早泄与抗抢跑机制（Premature Completion & Completion Criteria）

在大语言模型（LLM）执行复杂工程任务时，存在一个致命的物理本能：**“提前宣布胜利”（Premature Completion）**。

### 11.1 为什么 LLM 会本能地“早泄抢跑”？

Transformer 的自注意力机制（Self-Attention）是对当前上下文窗口中**所有 Token 进行全局交互计算**的。
当你的文档中清晰地列出了：
- Step 1: 深入调研全库架构与隐式依赖；
- Step 2: 设计边界与数据模型；
- Step 3: 编写端到端测试用例；
- Step 4: 编写业务实现代码；
- Step 5: 验证并交付。

当 Agent 在执行 Step 1 时，它的注意力矩阵已经被后面的 Step 3、Step 4、Step 5 **向心引力（The Pull of Post-Completion Steps）** 死死拉扯！
在模型看来，“最终目标是写代码交付”，于是它在 Step 1 就会草草浏览两眼、敷衍了事，急切地宣布“我已经充分理解了”，然后迅速抢跑去写残缺的代码。

### 11.2 Matt Pocock 的破局双杠杆：Clarity（清晰度）与 Demand（压榨度）

Matt Pocock 在 `writing-for-agents/SKILL.md` 中提出了两个核心控制杠杆：

> *"The visible steps still ahead — the post-completion steps — supply the pull; the criterion's clarity is the resistance. Defend in order: sharpen the bound first; only if it is irreducibly fuzzy and you observe the rush, hide the later steps by splitting the sequence — and hiding only works across a real context boundary."*

#### 1. 杠杆一：清晰度（Clarity ➔ Checkable Bound）
- **模糊边界（Fuzzy Bound ❌）**：“直到充分理解需求为止”、“做深入的研究”、“代码编写完毕”。这些是主观感受，模型可以在任何时刻宣布自己“已经理解了”。
- **可检验的二进制边界（Checkable Bound ✅）**：
  - “直到决策前沿（The Frontier）为空，且所有阻断依赖被清空”；
  - “直到 `npx vitest run ...` 返回退出码 `0`，且 `git diff` 无未提交变更”；
  - “直到所有 16 项红灯陷阱断言全部通过”。

#### 2. 杠杆二：压榨度（Demand ➔ Exhaustiveness Bar）
- 压榨度决定了模型在没有被微观指令催促的情况下，自发做多少**深挖苦力活（Legwork）**；
- 弱压榨度：“列出修改建议” ➔ 模型随便吐出 3 条；
- 强压榨度：“每一个被修改的模型、每一个受影响的边缘分支，均需在清单中闭环核实” ➔ 逼迫模型进行穷举式扫描。

### 11.3 隐藏后续步骤的铁律：必须跨越物理上下文边界

很多工程师会尝试在同一个文档中写：“在完成 Step 1 之前，千万不要去看 Step 2”。**这是无效的！**
因为在同一个 Context Window 内，Step 2 的文本已经存在于 GPU 显存和注意力权重中了。

**真正的隐藏（Hiding），必须依赖物理上下文隔离（Real Context Boundary）**：
1. **跨会话工序清空（Phase Clear）**：
   在本项目采用的 Tracer-Bullet Pipeline 中：
   - Phase 1（骨架）完成后 ➔ 执行验证 ➔ `git commit` ➔ **强制 `/clear`**；
   - Phase 2 启动时，上下文是**全新的、干净的**，当前会话根本不知道后面还有 Phase 3 和 Phase 4。它唯一的使命就是把当前阶段做到极致！
2. **派发无状态子代理（Subagent Dispatch）**：
   将调研任务通过 `browser_subagent` 或 Background Agent 派发出去，子代理只接收调研指令，完全不知道父任务的编码细节，从而逼迫子代理在局部世界里“穷尽所有探索”。
3. **交付转场接力（Handoff）**：
   通过 `/handoff` 将当前的中间状态压缩为交接文档，唤起全新 Agent 继续后续步骤，彻底斩断后序步骤对前序步骤的抢跑拉扯。

---

### 11.4 一个有趣的元反思：反模式写在防抢跑规则里

观察以下这段常见的反早泄规则草稿：

> **❌ 草稿写法（再次掉入否定词陷阱）**：  
> “严禁出现‘直到充分理解需求为止’这种虚幻描述！  
> 严禁把后续的编码步骤直接暴露在同一个文档中！必须派发 Subagent！”

**诊断分析**：
即使在写“防早泄”规则时，工程师依然本能地使用了 2 次“严禁”，再次触发了 Transformer 的弱修饰否定陷阱。

**✅ Matt Pocock 范式重构（正向、可检验、契约化）**：
```markdown
## Completion Criteria & Sequence Boundaries

1. **Checkable Binary Bounds**:
   Every procedural step must terminate on an observable, binary condition:
   - Command exit code 0 (`npm test`, `typecheck`);
   - Empty decision frontier (zero pending blocking edges);
   - Exhaustive accounting of all declared entities.

2. **Physical Context Isolation (Hiding Post-Completion Steps)**:
   Protect exploratory phases (research, prototyping, specification) from the pull of downstream coding steps.
   Isolate sequences across real context boundaries:
   - Run multi-phase pipelines via discrete commits and context resets (`/clear`);
   - Dispatch background subagents for open-ended deep exploration.
```

---

## 12. 三层渐进式揭示梯子与分支裁决测试（Progressive Disclosure Ladder & Branching Test）

Matt Pocock 在 `writing-for-agents` 中指出，技能文档的组织绝不是随意平铺的，而是遵循严密的**信息分层梯子（The Ladder）**：

```
梯子顶层 ➔ 【In-file Step】      当前文件内的顺序执行动作，只写必须执行的核心命令
            │
梯子中层 ➔ 【In-file Reference】 平铺的并列规则集（如 Review Checklist），扁平同级平铺
            │
梯子底层 ➔ 【Disclosed Reference】外置独立文件（如 HTML-REPORT.md, LOGIC.md），通过 Context Pointer 按需拉取
```

### 12.1 分支裁决测试（The Branching Test）
当你在犹豫“某段逻辑到底是留在主文件还是拆出去”时，运行这一确定性法则：
- **全部分支均需执行的内容 ➔ 留在主文件（In-file）**；
- **仅有部分分支才会触发的复杂细则 ➔ 坚决踢出主文件（Disclosed）**，拆入 `references/` 独立子文件（如 `UI.md`、`POSTMORTEM.md`）。只有当 Agent 在当前运行中明确做出决策要走该分支时，才由单行 Context Pointer 动态读取。

**收益**：避免主流程被 80% 的罕见分支细则淹没，使 Agent 在主干上执行时注意力集中度达到峰值。

---

## 13. 环境作为唯一事实源：拒绝把 Prompt 当过期缓存（Environment as Cache & Hunting No-ops）

### 13.1 提示词即缓存的反模式（Prompt as Stale Cache）
- **常见反模式**：在 Prompt 中事无巨细地告诉 Agent“你的项目目录长什么样”、“package.json 里有哪些 script”、“各组件在什么路径”。
- **致命后果**：随着代码库演进，只要有人重构了目录或改写了脚本，Prompt 就立刻腐化变质，沦为向 LLM 投毒的**过期缓存**，直接诱发严重幻觉。

### 13.2 让环境自身招供（Environment as Source of Truth）
Matt Pocock 的准则极其硬核：
> **只要是系统命令（`--help`）、配置文件（`package.json`）、Git 状态（`git status`）能够直接查到的，在 Skill 中一个字也不写，只留一行命令让 Agent 自己运行去查！**

Skill 真正应该沉淀的，是**“计算机自身无法招供的事实”**：
- 未经书面约定的历史暗坑（Dark Traps）；
- 非显然的业务取舍与架构决策记录（ADR）；
- 核心领域的隐式不变量（Invariants）。

### 13.3 猎杀废话指令（Hunting No-ops）
- **检验标准**：阅读 Skill 的每一句话，自问：“如果把它删掉，模型在默认状态下的行为会改变吗？”
- **处置原则**：如果删掉后行为零变化，或者两个人争论某句话是否有用却无法用测试命令区分，**整句物理删除**，彻底杜绝文本沉积（Sediment）。

---

## 14. 领域建模与深模块架构词汇层（Vocabulary Layer & The Deletion Test）

在顶尖的智能体工程体系中，技能之间不是扁平孤立的，而是拥有清晰的**词汇基石层（Vocabulary Layer）**：

```
上层业务工序技能 ➔  /grill-with-docs    /to-tickets    /implement    /algo-viz-authoring
                            │                 │              │                │
                            ▼                 ▼              ▼                ▼
下层统一词汇基石 ➔      【/domain-modeling】                  【/codebase-design】
                     (统一定义业务领域实体与 ADR)          (统一定义深模块、接缝与杠杆率)
```

1. **业务词汇层（`domain-modeling`）**：
   - 严格约束领域名词（如统一叫 `Order`，严禁在不同模块中混用 `Purchase`、`Deal`、`Transaction`）；
   - 任何新增概念必须先在词汇层登记，全库零名词脑裂。
2. **架构词汇层（`codebase-design`）**：
   - 统一定义什么是 `Module`（模块）、`Interface`（接口）、`Depth`（深度）、`Seam`（接缝）、`Adapter`（适配器）、`Leverage`（杠杆率）、`Locality`（局部性）；
   - **删除测试法（The Deletion Test）**：
     > *"Imagine deleting the module. If complexity simply vanishes, it was a shallow useless middleman; if complexity erupts across N callers, it is a truly deep module."*  
     > **翻译**：想象删除该模块。如果复杂度跟着彻底消失了，说明它只是个多余的浅薄中介层；如果复杂度瞬间爆发并泼洒在所有调用方身上，说明它真正收拢了核心复杂度，是一个优秀的**深模块（Deep Module）**。

---

## 15. 破坏性宽重构物理特例：展开-收缩模式（Expand-Contract Pattern for Wide Refactors）

在常规任务中，我们提倡垂直穿甲弹（一条线穿透 UI ➔ API ➔ DB）。  
但在面对**破坏性宽重构（Wide Refactors）**（例如：重构全库统一编译器基类、重构全局状态管理器、修改全库核心数据库列名）时，垂直穿甲弹会直接引爆**全库编译大面积瘫痪（Blast Radius 爆炸）**。

Matt Pocock 在 `to-tickets` 中给出了唯一严谨解法 —— **展开-收缩三步法（Expand-Contract Pattern）**：

```
1. Expand（展开）   ➔ 新旧两套接口并存，引入新接口，保留旧接口，CI 保持 100% 全绿
        │
2. Migrate（批量迁移）➔ 按子目录或小批次逐个重构调用方，每个批次原子提交，随时可上线
        │
3. Contract（收缩） ➔ 全库旧调用方清零后，在独立的 Ticket 中物理删除旧接口与兼容层
```

---

## 16. 抛弃型原型的残酷纪律（Throwaway Prototypes: No Persistence by Default）

在 `prototype` 技能中，Matt Pocock 树立了最严肃的工程物理边界：

1. **Throwaway from day one（从第一秒起就是注定销毁的脏代码）**：
   原型只用于摸索交互手感、验证数学可行性，绝对不是生产代码的前置草稿。
2. **绝对禁止持久化（No Persistence by Default）**：
   状态完全保存在临时内存中，严禁写入生产数据库，严禁引入生产持久化设施。
3. **彻底物理删除（Capture Answer, Destroy Code）**：
   - 原型的**唯一产出是人类肉眼得出的结论（Answer）**；
   - 结论一旦敲定，把原型提交到独立的 scratch/临时分支，并在主分支**彻底物理删除**！
   - **严禁直接在脏原型上“修修补补当成生产代码合入主干”**。

---

## 17. 总结：工程落地终极四铁律行动清单（Four Golden Action Rules）

将 Matt Pocock 的方法论精髓完全落地到我们的算法可视化与日常工程中，只需要守住 **四大行动铁律**：

1. ✂️ **砍掉虚头巴脑的形容词（Prompt with Leading Words）**：
   - 用高先验词（`tight`, `red`, `tracer bullet`, `seam`, `immutable`, `fail-fast`）取代又长又空的自定义句子。
2. 🛡️ **守住 150k 上下文负荷（Respect the Smart Zone）**：
   - 践行三层梯子渐进式揭示，非全部分支通用的细则踢出主文件；
   - 多阶段工序交界处无情执行 `git commit` 与 `/clear`，彻底切断后序步骤引力。
3. 🛑 **用二进制断言防抢跑（Checkable Binary Exit Criteria）**：
   - 每一个 Step 结尾必须有可执行、可检验的 Exit Code 0（`npm test`、`typecheck`），绝不听信 AI 的口头保证。
4. ⚙️ **把规矩做成自动化状态机（Rules as Executable Gates）**：
   - 提示词只做路由，把所有规矩转化为自动化拦截门禁（如本工程的 14 大红灯陷阱测试 `npm run test:presentation` 与架构合规门禁），让机器代替人类执勤。



