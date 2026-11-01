// scripts/patterns-data-1.cjs
// 包含 01. 策略模式、02. 中介者模式、03. 观察者模式、04. 模板方法模式、05. 状态模式

const patterns1 = [
  {
    id: "pattern-strategy",
    index: "01",
    title: "01. 策略模式 (Strategy Pattern)",
    category: "BEHAVIORAL",
    categoryLabel: "行为型模式",
    alsoKnownAs: "政策模式 (Policy Pattern)",
    intent: "定义一系列算法，把它们一个个封装起来，并且使它们可以相互替换。本模式使得算法可独立于使用它的客户而变化。",
    realWorldAnalogy: "在RPG游戏中，英雄屠龙时可随时根据龙的属性切换战术：面对喷火龙拔出大剑近战（MeleeStrategy），面对飞龙使用弓箭远程狙击（ProjectileStrategy），面对幽灵龙则咏唱圣光魔法（SpellStrategy）。英雄本身只发出一道「发动攻击」指令，具体的杀伤推演与动作逻辑全部委托给当前挂载的战术策略。在本项目中，面对 586+ 道算法（如不同路径、01背包、最长公共子序列），系统无需在渲染控制器中编写巨大的 switch-case，而是将每个算法的数学步进推演抽象为独立的策略类。",
    inPlainWords: "策略模式允许在运行时根据上下文环境，动态挑选并切换最适用的算法实现，且算法的变更对调用者完全透明。",
    formalDefinition: "GoF《设计模式》定义：策略模式将可变的行为算法从核心业务环境中抽取为独立类型，通过持有策略接口的引用实现多态行为委托，消除硬编码条件分支。",
    programmaticSteps: [
      {
        stepNum: 1,
        stepTitle: "定义统一步进推演策略接口 (Strategy Interface)",
        file: "src/core/strategies/algorithm-strategy.ts",
        line: "L18 ~ L26",
        description: "抽象出极窄的深模块缝隙契约：通过 canHandle 声明多态捕获范围，通过 generateSteps 接收纯数据入参并输出零 DOM 依赖的 UniversalStep 步进数组。",
        code: `export interface StageExecutionParams {
  stage: number; // 1 = 纯递归, 2 = 记忆化搜索, 3 = 动态规划填表, 4 = 空间压缩
  m?: number;
  n?: number;
  direction?: 'forward' | 'reverse';
  isMemo?: boolean;
  stageVariant?: 'if' | 'for' | 'terminal';
  anchorMap?: Record<string, number>;
}

/**
 * 算法推演策略统一接缝 (Algorithm Strategy Seam)
 * 遵循策略模式 (Strategy Pattern) 与单一职责原则 (SRP)
 */
export interface IAlgorithmStrategy {
  readonly modelId: string;
  canHandle(modelId: string): boolean;
  generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[];
}`
      },
      {
        stepNum: 2,
        stepTitle: "编写具体的算法推演策略实现 (Concrete Strategy)",
        file: "src/core/strategies/grid-unique-paths-strategy.ts",
        line: "L12 ~ L75",
        description: "GridUniquePathsStrategy 仅聚焦于不同路径网格的四阶段推演数学规约，LOC < 120 行，严格遵守身材红线，完全不掺杂任何 DOM 与 UI 操作。",
        code: `import { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import { IYamlAlgorithmModel } from '../interfaces';
import { UniversalStep } from '../universal-stage-engine';
import { GridUniquePathsCompiler } from './grid-unique-paths-compiler';

export class GridUniquePathsStrategy implements IAlgorithmStrategy {
  public readonly modelId = 'unique-paths';

  public canHandle(modelId: string): boolean {
    return modelId === 'unique-paths' || modelId === 'unique-paths-ii';
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const m = params.m ?? 3;
    const n = params.n ?? 7;
    const stage = params.stage ?? 3;

    // 根据演化阶段委托专属编译器进行数学填表推导
    switch (stage) {
      case 1:
        return GridUniquePathsCompiler.compileRecursion(m, n, params.direction);
      case 2:
        return GridUniquePathsCompiler.compileMemoization(m, n);
      case 3:
        return GridUniquePathsCompiler.compileTabulation(m, n, params.stageVariant);
      case 4:
        return GridUniquePathsCompiler.compileSpaceOptimized(m, n);
      default:
        return GridUniquePathsCompiler.compileTabulation(m, n);
    }
  }
}`
      },
      {
        stepNum: 3,
        stepTitle: "构建策略注册中心与多态派发器 (Strategy Registry & Dispatcher)",
        file: "src/core/strategies/algorithm-strategy-registry.ts",
        line: "L9 ~ L74",
        description: "集中管理所有注入的策略实例，提供根据 modelId 自动寻址与后备回退机制，彻底消除各模块手写 if-else 的恶疾。",
        code: `export class AlgorithmStrategyRegistry {
  private static strategies: IAlgorithmStrategy[] = [];

  public static register(strategy: IAlgorithmStrategy): void {
    const existingIndex = this.strategies.findIndex(s => s.modelId === strategy.modelId);
    if (existingIndex >= 0) {
      this.strategies[existingIndex] = strategy;
    } else {
      this.strategies.push(strategy);
    }
  }

  public static getStrategy(modelId: string): IAlgorithmStrategy | undefined {
    return this.strategies.find(s => s.canHandle(modelId));
  }

  public static clear(): void {
    this.strategies = [];
  }
}`
      },
      {
        stepNum: 4,
        stepTitle: "客户端上下文环境装配与动态推演调用 (Context & Client)",
        file: "src/core/controllers/universal-stage-engine.ts",
        line: "L80 ~ L115",
        description: "UniversalStageEngine 作为策略执行环境上下文（Context），在需要生成演进步骤时，无需知晓具体算法是谁，直接向策略注册中心索取并委托执行。",
        code: `export class UniversalStageEngine {
  public static executeModel(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    // 1. 通过注册中心动态检索命中的推演策略 (Context 获取 Strategy)
    const strategy = AlgorithmStrategyRegistry.getStrategy(model.id);
    
    if (strategy) {
      // 2. 多态委派：策略独立演进推导步骤
      return strategy.generateSteps(model, params);
    }

    // 3. 后备通配降级机制 (Fallback)
    return UniversalStageEngine.executeFallbackMatrix(model, params);
  }
}`
      }
    ],
    classDiagram: `  ┌─────────────────────────────────────────────────────────┐
  │         Client: UniversalStageEngine (上下文)            │
  └────────────────────────────┬────────────────────────────┘
                               │ 动态查找并委托
                               ▼
  ┌─────────────────────────────────────────────────────────┐
  │        «interface» IAlgorithmStrategy (策略接口)         │
  ├─────────────────────────────────────────────────────────┤
  │ + modelId: string                                       │
  │ + canHandle(modelId: string): boolean                   │
  │ + generateSteps(model, params): UniversalStep[]         │
  └────────────────────────────▲────────────────────────────┘
                               │ 实现
        ┌──────────────────────┴──────────────────────┐
        │                                             │
  ┌─────┴────────────────────────┐       ┌────────────┴─────────────────┐
  │  GridUniquePathsStrategy     │       │     KnapsackStrategy         │
  ├──────────────────────────────┤       ├──────────────────────────────┤
  │ + canHandle(modelId)         │       │ + canHandle(modelId)         │
  │ + generateSteps(...)         │       │ + generateSteps(...)         │
  └──────────────────────────────┘       └──────────────────────────────┘`,
    applicability: [
      "当一个系统需要动态支持数十甚至数百种算法变体（如 580+ 道算法题的 DP、贪心、搜索推导）时；",
      "当代码中出现包含十几个分支的 switch (algoId) 或冗长 if-else 时；",
      "当算法的推导逻辑需要独立于视图层进行单元测试，要求输出纯净不可变数据时；",
      "当需要对算法作者施加「身材红线」约束（Strategy < 120行），隔离业务变更爆炸半径时。"
    ],
    pros: [
      "开闭原则 (OCP)：新增算法策略只需实现 IAlgorithmStrategy 并注册，无需改动核心引擎或既有算法；",
      "消除条件分支：彻底消灭庞大晦涩的 switch/case 分支代码；",
      "高内聚轻量化：每个策略专注自身数学规约，测试用例与实现紧密伴生；",
      "零 DOM 契约：返回纯内存数组，可在 Node.js/Vitest 下实现毫秒级高并发测试。"
    ],
    cons: [
      "策略类数量增加：每个算法或题族都会诞生对应的 Strategy 策略类；",
      "客户端需要感知：调用方必须知晓 modelId 与参数结构以匹配到对应的策略。"
    ],
    mitigations: "本项目在架构层通过 AlgorithmStrategyRegistry 统一收口寻址，并由 AlgorithmCatalogIndexer 配合 AST 自动完成策略播种，完全规避了手写策略实例化的认知负担。",
    realWorldJava: "JDK 中的 java.util.Comparator 接口（可根据不同字段动态替换排序策略）；Spring 框架中的 ResourceLoader 与 ClientHttpRequestFactory。",
    realWorldProject: "src/core/strategies/algorithm-strategy.ts 与 20+ 个具体题族策略实现 (GridUniquePathsStrategy, KnapsackStrategy 等)。",
    relatedPatterns: [
      { name: "策略模式 vs 状态模式", comparison: "策略模式强调算法的平行替换，通常由客户端外部决定注入哪种策略；状态模式侧重对象生命周期内部状态的自我转换，行为随内部状态流转自动改变。" },
      { name: "策略模式 vs 模板方法", comparison: "策略模式使用对象组合（Composition），可以在运行时动态替换整套算法；模板方法使用类继承或固定算法骨架，在编译期固定骨架，子类仅重写具体步骤挂钩。" },
      { name: "策略模式 vs 简单工厂", comparison: "简单工厂负责根据标识创建对象，返回的是对象实例；策略模式关注的是将算法行为封装并委托给持有引用的对象去执行。" }
    ]
  },
  {
    id: "pattern-mediator",
    index: "02",
    title: "02. 中介者模式 (Mediator Pattern)",
    category: "BEHAVIORAL",
    categoryLabel: "行为型模式",
    alsoKnownAs: "调停者模式 (Intermediary Pattern)",
    intent: "用一个中介对象来封装一系列的对象交互。中介者使各对象不需要显式地相互引用，从而使其耦合松散，而且可以独立地改变它们之间的交互。",
    realWorldAnalogy: "机场空中交通管制塔（Control Tower）：如果有 50 架飞机在机场上空准备降落，若让飞机与飞机之间互相通信协商高度与跑道，通信链路数量将高达 N*(N-1)/2 = 1225 条，极易导致灾难性混乱。空管塔作为中介者，所有飞机仅向空管塔报告位置，空管塔统筹调度后向各机发布航向与降落指令。在本项目中，可视化界面同时拥有【播放时间轴】、【Canvas/WebGL 画布】、【暗色代码终端】、【执行日志流】和【控制台按键】，组件间若直接相互调用会导致毁灭性的网状交叉依赖。VisualizerMediator 充当空管塔，原子化统一协调所有面板。",
    inPlainWords: "中介者将组件间错综复杂的网状多对多关系，规约为以中介者为核心的星型一对多拓扑关系。",
    formalDefinition: "GoF《设计模式》定义：中介者模式定义一个集中的协调者对象，将一组同事对象（Colleagues）的通信完全解耦，使得对象间的交互行为可被集中控制和复用。",
    programmaticSteps: [
      {
        stepNum: 1,
        stepTitle: "定义协调中介者核心调度状态与契约",
        file: "src/core/controllers/visualizer-mediator.ts",
        line: "L35 ~ L65",
        description: "VisualizerMediator 封装播放器时间轴、多模态渲染器、代码联动与当前步骤状态，集中管理全部同事对象。",
        code: `export interface VisualizerState {
  model: IYamlAlgorithmModel | null;
  modelId: string;
  stage: string;
  stageNum: number;
  direction: 'forward' | 'reverse';
  steps: UniversalStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number;
}

export class VisualizerMediator {
  private timelineController!: PlaybackTimelineController;
  private renderer?: IVisualRenderer;
  private state: VisualizerState;

  constructor(options: VisualizerMediatorOptions = {}) {
    this.state = this.initDefaultState(options);
  }
}`
      },
      {
        stepNum: 2,
        stepTitle: "挂载同事对象并建立单一向心汇报关系",
        file: "src/core/controllers/visualizer-mediator.ts",
        line: "L80 ~ L145",
        description: "时间轴控制器（PlaybackTimelineController）与视图渲染器（IVisualRenderer）作为同事对象挂载到中介者，自身不保留对方的引用，仅响应中介者分发。",
        code: `public bindTimeline(timeline: PlaybackTimelineController): void {
  this.timelineController = timeline;
  // 同事对象（时间轴）状态变更时，只通知中介者，不直接触碰画布渲染器
  this.timelineController.onStepChange((stepIndex) => {
    this.handleStepTransition(stepIndex);
  });
}

public setRenderer(renderer: IVisualRenderer): void {
  // 卸载既有渲染器
  if (this.renderer) {
    this.renderer.dispose();
  }
  this.renderer = renderer;
}`
      },
      {
        stepNum: 3,
        stepTitle: "中介者集中执行跨组件原子化协调动作",
        file: "src/core/controllers/visualizer-mediator.ts",
        line: "L150 ~ L220",
        description: "当用户在界面拖拽进度条或触发单步时，中介者原子化同步刷新画布切片、代码行高亮、执行日志吸底与状态指示器。",
        code: `private handleStepTransition(stepIndex: number): void {
  this.state.currentStepIndex = stepIndex;
  const currentStep = this.state.steps[stepIndex];
  if (!currentStep) return;

  // 1. 协调同事 1: 更新 2D/3D 画布拓扑
  if (this.renderer) {
    this.renderer.updateStep(currentStep, { stage: this.state.stageNum });
  }

  // 2. 协调同事 2: 同步暗色终端代码高亮行号 (1-based)
  if (currentStep.codeLine !== undefined) {
    DarkCodeTerminalPresenter.highlightLine(currentStep.codeLine);
  }

  // 3. 协调同事 3: 更新 Card 4 执行日志流并触发自动平滑吸底
  ExecutionLogPresenter.renderStepLogs(
    document.getElementById('dsp-log-container')!,
    this.state.steps,
    stepIndex
  );

  // 4. 广播全局弱耦合领域事件
  eventHub.emit('step:change', {
    currentStep: stepIndex,
    totalSteps: this.state.steps.length,
    stepData: currentStep
  });
}`
      },
      {
        stepNum: 4,
        stepTitle: "客户端通过中介者统一触发高层意图",
        file: "src/core/declarative-algorithm-visualizer.ts",
        line: "L380 ~ L420",
        description: "客户端（UI 面板）无需关心具体的协调细节，只需向中介者下达播放、跳转、切换阶段等高层意图。",
        code: `// 客户端初始化中介者并启动
const mediator = new VisualizerMediator({ modelId: spec.id });
mediator.bindTimeline(new PlaybackTimelineController(options));
mediator.setRenderer(VisualRendererFactory.getRenderer(spec.rendererKind));

// 客户端触发动作，中介者全权接管内部流转
document.getElementById('btn-play')?.addEventListener('click', () => {
  mediator.togglePlay();
});`
      }
    ],
    classDiagram: `                   ┌──────────────────────────────┐
                   │      VisualizerMediator      │
                   │           (中介者)           │
                   └──────┬───────┬───────┬───────┘
                          │       │       │       
            ┌─────────────┘       │       └─────────────┐
            ▼                     ▼                     ▼
┌───────────────────────┐ ┌───────────────┐ ┌─────────────────────────┐
│PlaybackTimelineContr. │ │IVisualRenderer│ │ DarkCodeTerminalPresent.│
│     (同事: 时间轴)    │ │ (同事: 画布)  │ │    (同事: 代码高亮)     │
└───────────────────────┘ └───────────────┘ └─────────────────────────┘`,
    applicability: [
      "一组对象以良好定义但高度复杂的方式通信，导致网状调用结构混乱时；",
      "一个组件由于引用了太多其他组件，导致自身无法被单独复用或单测时；",
      "想定制一个分布在多个类中的多步骤联动行为，而不希望生成大量子类时。"
    ],
    pros: [
      "降低参与者耦合度：将各同事组件间的网状 M*N 依赖降解为 1*N 简单星形依赖；",
      "集中控制流转逻辑：状态联动与时序调度逻辑收拢在单一中介者类中，查阅排错极为清晰；",
      "组件可独立单元测试：各同事组件无需知晓彼此存在，可单独进行 Mock 验证。"
    ],
    cons: [
      "中介者容易演化为上帝对象（God Object）：若不加节制，所有杂务都塞入中介者会导致其臃肿膨胀。"
    ],
    mitigations: "本项目严格遵从 Matt Pocock 深模块身材红线，将纯数学推导剥离给 Strategy 编译器，将纯视图 DOM 渲染剥离给 Presenter/Adapter，中介者仅行使调度中转职责。",
    realWorldJava: "Java Swing 中的 ButtonGroup / FocusManager；Spring MVC 中的 DispatcherServlet（协调 HandlerMapping、Controller 与 ViewResolver）。",
    realWorldProject: "src/core/controllers/visualizer-mediator.ts，统筹 PlaybackTimelineController 与 IVisualRenderer 各面板的无缝协同。",
    relatedPatterns: [
      { name: "中介者模式 vs 外观模式", comparison: "外观模式（Facade）单向抽象子系统，外部调用子系统，子系统不反向知晓门面；中介者模式（Mediator）是双向协调各同事对象，同事对象向中介者发消息并接收中介者通知。" },
      { name: "中介者模式 vs 观察者模式", comparison: "观察者模式发布订阅，信息流单向广播，发布者不关心谁订阅；中介者封装具体的组件间交互协议，是有针对性的集中调度流程。" }
    ]
  },
  {
    id: "pattern-observer",
    index: "03",
    title: "03. 观察者模式与强类型事件总线 (Observer / Pub-Sub)",
    category: "BEHAVIORAL",
    categoryLabel: "行为型模式",
    alsoKnownAs: "发布-订阅模式 (Publish-Subscribe), 监听器模式 (Listener)",
    intent: "定义对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都得到通知并被自动更新。",
    realWorldAnalogy: "订阅报纸或杂志：读者向邮局（EventHub）订阅《国家地理》，当新一期杂志印刷出厂后，邮局自动将杂志寄送到所有已登记的订阅者信箱。读者随时可以退订（Unsubscribe），邮局无需探究读者订报后是做剪报还是垫桌脚。在本项目中，全局存在键盘快捷键、主题深浅切换、布局分隔条拖拽、演化阶段切换等松散广播，若每个面板都持有全局引用会引发严重内存泄露。强类型事件总线 VisualizerEventHub 提供了内存安全的 RAII 式发布订阅机制。",
    inPlainWords: "让订阅者在感兴趣的事件发生时收到通知，而发布者无需知道订阅者的具体身份与数量。",
    formalDefinition: "GoF《设计模式》定义：观察者模式为目标对象（Subject）与观察者对象（Observer）解耦，使得目标状态变更可广播通知任意数量的未知接收者。",
    programmaticSteps: [
      {
        stepNum: 1,
        stepTitle: "定义全局强类型事件映射表 (Type-Safe Event Map)",
        file: "src/core/controllers/visualizer-event-hub.ts",
        line: "L10 ~ L30",
        description: "在 TypeScript 层面建立键与载荷的映射矩阵，杜绝 JavaScript 弱类型事件总线中的拼写错误与非法数据传递。",
        code: `export interface VisualizerEventMap {
  /** 单步状态变更事件 */
  'step:change': { currentStep: number; totalSteps: number; stepData: any };
  /** 播放状态变更事件 (播放/暂停/结束) */
  'playback:state': { isPlaying: boolean; isFinished: boolean };
  /** 演化阶段切换事件 (Stage 1 / 2 / 3 / 4) */
  'stage:change': { stage: number; isMemo: boolean; direction: 'forward' | 'reverse' };
  /** 布局分隔条拖拽变更事件 */
  'layout:resize': { splitterId: string; size: number };
}

export type EventHandler<T> = (payload: T) => void;
export type UnsubscribeFn = () => void;`
      },
      {
        stepNum: 2,
        stepTitle: "构建支持 RAII 安全注销的事件总线单例 (Event Hub Singleton)",
        file: "src/core/controllers/visualizer-event-hub.ts",
        line: "L32 ~ L85",
        description: "VisualizerEventHub 返回开箱即用的 UnsubscribeFn 闭包，并在 emit 时执行浅复制防御性迭代，杜绝迭代中修改 Set 导致的并发异常。",
        code: `export class VisualizerEventHub {
  private static instance: VisualizerEventHub | null = null;
  private listeners: Map<keyof VisualizerEventMap, Set<EventHandler<any>>> = new Map();

  public static getInstance(): VisualizerEventHub {
    if (!this.instance) {
      this.instance = new VisualizerEventHub();
    }
    return this.instance;
  }

  /**
   * 注册事件监听，返回无参注销闭包（RAII 资源自动释放）
   */
  public on<K extends keyof VisualizerEventMap>(
    event: K,
    handler: EventHandler<VisualizerEventMap[K]>
  ): UnsubscribeFn {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // 返回自清理闭包
    return () => this.off(event, handler);
  }

  /**
   * 广播事件：使用展开运算符进行防御式快照拷贝迭代
   */
  public emit<K extends keyof VisualizerEventMap>(
    event: K,
    payload: VisualizerEventMap[K]
  ): void {
    const handlers = this.listeners.get(event);
    if (!handlers || handlers.size === 0) return;

    // 防御性拷贝，防止 handler 内部调用 off 导致迭代死锁或跳项
    [...handlers].forEach((handler) => {
      try {
        handler(payload);
      } catch (err) {
        console.error(\`[EventHub] Error in \${String(event)}:\`, err);
      }
    });
  }

  public off<K extends keyof VisualizerEventMap>(event: K, handler: EventHandler<any>): void {
    this.listeners.get(event)?.delete(handler);
  }
}`
      },
      {
        stepNum: 3,
        stepTitle: "观察者订阅事件与生命周期绑定 (Subscribing Observer)",
        file: "src/core/controllers/keyboard-shortcut-controller.ts",
        line: "L45 ~ L70",
        description: "各视图控制器监听总线广播，并在 dispose 钩子中一键释放所有取消函数，防止内存驻留。",
        code: `export class KeyboardShortcutController {
  private disposers: UnsubscribeFn[] = [];

  public mount(): void {
    const hub = VisualizerEventHub.getInstance();

    // 订阅播放状态变更，更新快捷键提示
    const unsubPlayback = hub.on('playback:state', ({ isPlaying }) => {
      this.updatePlayPauseIcon(isPlaying);
    });
    this.disposers.push(unsubPlayback);

    // 订阅阶段变更
    const unsubStage = hub.on('stage:change', ({ stage }) => {
      console.log(\`[ShortcutController] Stage switched to: \${stage}\`);
    });
    this.disposers.push(unsubStage);
  }

  public dispose(): void {
    // 优雅释放全部观察者监听
    this.disposers.forEach(unsub => unsub());
    this.disposers = [];
  }
}`
      },
      {
        stepNum: 4,
        stepTitle: "发布者触发广播事件 (Publisher Emit)",
        file: "src/core/playback-coordinator.ts",
        line: "L110 ~ L125",
        description: "状态发生迁移的核心控制器向总线推送强类型事件载荷，触发所有感兴趣的观察者协同响应。",
        code: `// 播放协调器状态切换为暂停时，向全系统发布广播
VisualizerEventHub.getInstance().emit('playback:state', {
  isPlaying: false,
  isFinished: this.isFinished
});`
      }
    ],
    classDiagram: `  ┌────────────────────────────────────────────────────────┐
  │                 VisualizerEventHub                     │
  ├────────────────────────────────────────────────────────┤
  │ - listeners: Map<EventKey, Set<EventHandler>>          │
  ├────────────────────────────────────────────────────────┤
  │ + on<K>(event, handler): UnsubscribeFn                 │
  │ + emit<K>(event, payload): void                        │
  │ + off<K>(event, handler): void                         │
  └──────────────────────────┬─────────────────────────────┘
                             │ 广播通知
        ┌────────────────────┴────────────────────┐
        ▼                                         ▼
  ┌────────────────────────┐            ┌────────────────────────┐
  │   KeyboardShortcutCtrl │            │   VisualThemeManager   │
  ├────────────────────────┤            ├────────────────────────┤
  │ + updateIcons()        │            │ + applyThemeColors()   │
  └────────────────────────┘            └────────────────────────┘`,
    applicability: [
      "当一个对象的改变需要同时改变其他未知数量的对象，而不知道具体有多少对象有待改变时；",
      "当一个抽象模型有两个方面，其中一个方面依赖于另一个方面，需要将二者封装在独立的对象中使它们各自独立改变时；",
      "需要实现轻量级、跨组件的解耦事件流，杜绝直接对象持有时。"
    ],
    pros: [
      "目标与观察者松耦合：Subject 无需知道 Observer 的具体类型，仅持有函数引用；",
      "支持广播通信：消息可以一次性派发给所有感兴趣的监听者；",
      "TypeScript 强类型校验保障：所有事件名与 payload 在编译期受控，杜绝拼写错误引发的黑洞失效。"
    ],
    cons: [
      "如果未注销监听器会导致内存泄漏（经典 DOM Event / Observer Leak）；",
      "事件调用顺序未定义，容易引发难以追踪的时序副作用。"
    ],
    mitigations: "本项目所有 on 注册均强制返回 UnsubscribeFn 撤销闭包，并在各个 Presenter / Controller 的 dispose() 生命周期契约中强制执行注销自愈。",
    realWorldJava: "java.util.Observer 与 Observable；Spring 的 ApplicationEventPublisher 与 @EventListener；Swing 中的 ActionListener。",
    realWorldProject: "src/core/controllers/visualizer-event-hub.ts，统领全平台 10+ 类广播事件的派发与安全消费。",
    relatedPatterns: [
      { name: "观察者模式 vs 中介者模式", comparison: "观察者模式提供星形或多对多的单向事件发布，订阅者彼此无关联；中介者模式封装复杂的跨对象业务协议，中介者主动介入并调度同事交互。" },
      { name: "观察者模式 vs 责任链模式", comparison: "观察者模式中事件会被所有监听者全量接收处理；责任链模式中请求沿着单向链路依次传递，通常由一个节点拦截处理后即终止传递。" }
    ]
  },
  {
    id: "pattern-template-method",
    index: "04",
    title: "04. 模板方法模式 (Template Method Pattern)",
    category: "BEHAVIORAL",
    categoryLabel: "行为型模式",
    alsoKnownAs: "模板模式 (Template Pattern)",
    intent: "定义一个操作中的算法的骨架，而将一些步骤延迟到子类或挂钩函数中。模板方法使得子类可以不改变一个算法的结构即可重定义该算法的某些特定步骤。",
    realWorldAnalogy: "冲泡含咖啡因的热饮：制作一杯标准热饮的完整生命周期工序是固定的：①烧开水 ➔ ②用热水浸泡提取 ➔ ③将饮料倒入杯中 ➔ ④添加调味品。骨架模板固定了 4 个步骤的先后次序，但冲泡咖啡（浸泡咖啡粉 + 加糖加奶）与冲泡绿茶（浸泡西湖龙井 + 加柠檬）只需分别覆写第 ② 和 第 ④ 步挂钩。在本项目中，所有二叉树递归遍历（深度计算、验证BST、二叉树直径、路径总和等）都必须严格经历【五段式递归生命周期】：📥函数入口 ➔ 🔍基底判空 ➔ 🎯叶子特判 ➔ 🔀深入分支 ➔ 🔄后序归约。模板方法将此骨架一次性锁死，25+ 道单题只需编写领域判别挂钩！",
    inPlainWords: "骨架定次序，挂钩重细节。高层代码控制算法主流程，底层实现注入业务挂钩。",
    formalDefinition: "GoF《设计模式》定义：模板方法模式在一个方法中定义了算法的骨干步骤，将某些特定步骤的实现推迟到子类或回调函数中，保持骨架不变而允许局部特化。",
    programmaticSteps: [
      {
        stepNum: 1,
        stepTitle: "定义算法骨架与扩展挂钩接口 (Template Skeleton & Hooks)",
        file: "src/core/renderers/adapters/binary-tree-traversal-compiler.ts",
        line: "L473 ~ L540",
        description: "BinaryTreeTraversalCompiler.compileDfs 封装严格的五段式递归生命周期，强行锁定入栈、判空探针、回溯退栈的固定调用顺序。",
        code: `export interface DfsHooks<TNode, TResult> {
  onEnterFrame?: (node: TNode, depth: number) => void;
  onBaseCaseCheck?: (node: TNode | null) => boolean;
  onLeafHit?: (node: TNode) => TResult;
  onBranchDive?: (parent: TNode, child: TNode, direction: 'left' | 'right') => void;
  onPostOrderReduce?: (node: TNode, leftResult: TResult, rightResult: TResult) => TResult;
}

export class BinaryTreeTraversalCompiler {
  /**
   * 模板方法：二叉树严格五段式 DFS 步进推导骨架
   */
  public static compileDfs<TNode = TreeNode, TResult = any>(
    root: TNode | null,
    hooks: DfsHooks<TNode, TResult>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const callStack: TNode[] = [];

    // 核心算法骨架方法 (固定执行顺序，不可篡改)
    function dfs(current: TNode | null, parent: TNode | null, branch: string): TResult | null {
      // 1. 📥 步骤一：函数入口帧
      steps.push(createEnterStep(current, callStack));
      if (!current) {
        // 2. 🔍 步骤二：边界判空（自动注入父级 nullProbe 防断电探针）
        steps.push(createNullProbeStep(parent, branch));
        return null;
      }

      callStack.push(current);

      // 3. 🎯 步骤三：叶节点与特判挂钩
      if (isLeaf(current) && hooks.onLeafHit) {
        const leafRes = hooks.onLeafHit(current);
        steps.push(createLeafStep(current, leafRes));
      }

      // 4. 🔀 步骤四：深入左右分支子调用帧
      const leftRes = dfs(getLeft(current), current, 'left');
      const rightRes = dfs(getRight(current), current, 'right');

      // 5. 🔄 步骤五：后序归约与返回现场帧
      const finalRes = hooks.onPostOrderReduce
        ? hooks.onPostOrderReduce(current, leftRes, rightRes)
        : null;

      steps.push(createReturnStep(current, finalRes));
      callStack.pop();
      return finalRes;
    }

    dfs(root, null, 'root');
    return steps;
  }
}`
      },
      {
        stepNum: 2,
        stepTitle: "具体算法实现专属领域挂钩 (Hook Implementation)",
        file: "src/core/renderers/adapters/tree-depth-step-compiler.ts",
        line: "L20 ~ L65",
        description: "在《二叉树最大深度》单题中，开发者仅需实现挂钩函数注入 Math.max(left, right) + 1，零重复手写 stack 模拟或判空探针。",
        code: `export class TreeDepthStepCompiler {
  public static compile(root: TreeNode | null): UniversalStep[] {
    // 委托模板方法，仅重写后序归约与叶子挂钩！LOC 极度轻巧 (< 40行)
    return BinaryTreeTraversalCompiler.compileDfs<TreeNode, number>(root, {
      onBaseCaseCheck: (node) => node === null,
      
      onLeafHit: (node) => {
        return 1; // 叶子节点深度初值为 1
      },

      onPostOrderReduce: (node, leftDepth, rightDepth) => {
        const l = leftDepth ?? 0;
        const r = rightDepth ?? 0;
        return Math.max(l, r) + 1; // 树深度核心数学递推式
      }
    });
  }
}`
      },
      {
        stepNum: 3,
        stepTitle: "另一算法复用同一骨架重写不同挂钩 (Reusing Skeleton)",
        file: "src/core/renderers/adapters/valid-bst-step-compiler.ts",
        line: "L15 ~ L55",
        description: "在《验证二叉搜索树》中，完全复用同一 compileDfs 骨架，挂钩注入中序区间 (min, max) 校验。",
        code: `export class ValidBstStepCompiler {
  public static compile(root: TreeNode | null): UniversalStep[] {
    return BinaryTreeTraversalCompiler.compileDfs<TreeNode, boolean>(root, {
      onPostOrderReduce: (node, leftValid, rightValid) => {
        // BST 合规校验：左子树合法 && 右子树合法 && 当前值在合法上下界内
        return (leftValid !== false) && (rightValid !== false);
      }
    });
  }
}`
      },
      {
        stepNum: 4,
        stepTitle: "客户端调用统一编译器生成高品质步骤",
        file: "src/algorithms/categories/tree/tree-depth-renderer.ts",
        line: "L40 ~ L55",
        description: "渲染器层以极低代码量调用伴生编译器，输出符合 14 大红灯陷阱校验的完美步骤数组。",
        code: `export const treeDepthRenderer = {
  buildSteps: (inputTree: TreeNode) => {
    return TreeDepthStepCompiler.compile(inputTree);
  }
};`
      }
    ],
    classDiagram: `  ┌────────────────────────────────────────────────────────┐
  │              BinaryTreeTraversalCompiler               │
  ├────────────────────────────────────────────────────────┤
  │ + compileDfs(root, hooks): UniversalStep[] (模板方法)  │
  │   1. 📥 createEnterStep()                              │
  │   2. 🔍 createNullProbeStep()                          │
  │   3. 🎯 hooks.onLeafHit()  (挂钩)                      │
  │   4. 🔀 dfs(left) & dfs(right)                         │
  │   5. 🔄 hooks.onPostOrderReduce() (挂钩)               │
  └──────────────────────────┬─────────────────────────────┘
                             │ 传入领域 Hook 注入
        ┌────────────────────┴────────────────────┐
        ▼                                         ▼
  ┌────────────────────────┐            ┌────────────────────────┐
  │ TreeDepthStepCompiler  │            │  ValidBstStepCompiler  │
  ├────────────────────────┤            ├────────────────────────┤
  │ + onPostOrderReduce:   │            │ + onPostOrderReduce:   │
  │   Math.max(l, r) + 1   │            │   leftValid && rightVal│
  └────────────────────────┘            └────────────────────────┘`,
    applicability: [
      "一次性实现一个算法的不变部分，并将可变的行为留给子类或挂钩函数来实现；",
      "各子类中公共的行为应被提取出来并集中到一个公共类中以避免代码重复；",
      "控制算法生命周期的延伸点（Hooks），强制要求派生者遵守严格的前后执行约束时。"
    ],
    pros: [
      "消除样板代码复制：将 25+ 算法中数百行相同的递归状态转移、空指针防断电探针抽调至唯一模板；",
      "好莱坞原则（Don't call us, we'll call you）：高层骨架调度低层挂钩，流程反转受控；",
      "架构约束落地：确保所有递归单题 100% 具备标准的五段式生命周期与返回现场帧。"
    ],
    cons: [
      "算法框架必须设计得极有前瞻性，一旦骨架本身需要大改，所有依赖挂钩的实现都要适配；",
      "代码阅读跳转较多，对初学者需要理解回调或继承机制。"
    ],
    mitigations: "本项目采用 TypeScript 强类型泛型接口 DfsHooks<TNode, TResult> 代替古典类继承，具备完美的静态检查与代码悬停文档提示。",
    realWorldJava: "java.io.InputStream 的 read() 方法；Spring 的 JdbcTemplate (execute 模板方法)；Servlet 的 HttpServlet.service() 路由 doGet/doPost。",
    realWorldProject: "src/core/renderers/adapters/binary-tree-traversal-compiler.ts (compileDfs / compileBfs) 与 SequenceStepMatrixCompiler (双序列 DP 矩阵模板)。",
    relatedPatterns: [
      { name: "模板方法 vs 策略模式", comparison: "模板方法通过继承或钩子定制算法内部某些步骤，算法大骨架固定；策略模式通过组合完全替换整套算法，算法结构无预设约束。" },
      { name: "模板方法 vs 工厂方法", comparison: "工厂方法模式常被模板方法调用，作为模板方法在某个步骤创建特定产品对象的挂钩。" }
    ]
  },
  {
    id: "pattern-state",
    index: "05",
    title: "05. 状态模式 / 纯领域状态机 (State Pattern / FSM)",
    category: "BEHAVIORAL",
    categoryLabel: "行为型模式",
    alsoKnownAs: "有限状态机 (Finite State Machine, FSM)",
    intent: "允许一个对象在其内部状态改变时改变它的行为。对象看起来似乎修改了它的类。",
    realWorldAnalogy: "自动售货机投币状态机：售货机有【未投币 Idle】、【已投币 HasCoin】、【出货中 Dispensing】、【售罄 SoldOut】四种状态。在【未投币】状态下按「出货」按钮毫无反应；投币进入【已投币】状态后，按「退币」会返还硬币，按「出货」则进入【出货中】并禁止再次投币。同一套物理按钮，在不同状态下产生的行为截然不同。在本项目中，算法播放调度器具备【就绪闲置 idle】、【自动播放 playing】、【手动暂停 paused】与【推演完毕 completed】四种严格状态，每种状态对 Next/Prev/Play/Seek 指令有严格的状态迁移矩阵，坚决杜绝时序竞态！",
    inPlainWords: "将状态以及与该状态相关的行为封装进独立状态类或状态枚举，对象随内部状态迁移而自动切换行为。",
    formalDefinition: "GoF《设计模式》定义：状态模式把所研究对象的行为包装在不同的状态对象里，每一个状态对象都属于一个抽象状态类的子类，使复杂的分支判断下沉为状态对象的自然多态转换。",
    programmaticSteps: [
      {
        stepNum: 1,
        stepTitle: "定义状态枚举与时空不可变快照 (State & Memento)",
        file: "src/core/playback-coordinator.ts",
        line: "L15 ~ L40",
        description: "PlaybackStatus 严格定义领域状态集合，PlaybackSnapshot 承载零 DOM、完全可序列化的状态机备忘录切片。",
        code: `export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'completed';

export interface PlaybackSnapshot {
  currentIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: number;
  status: PlaybackStatus;
  isFinished: boolean;
  canGoNext: boolean;
  canGoPrev: boolean;
}`
      },
      {
        stepNum: 2,
        stepTitle: "实现 100% 零 DOM 依赖的纯领域状态机 (Domain State Machine)",
        file: "src/core/playback-coordinator.ts",
        line: "L55 ~ L145",
        description: "PlaybackCoordinator 封装定时器时序自校准、防越界裁剪 (Clamping)、完成流转保护与幂等销毁。",
        code: `export class PlaybackCoordinator {
  private status: PlaybackStatus = 'idle';
  private currentIndex: number = 0;
  private timer: number | null = null;
  private readonly options: PlaybackOptions;

  constructor(options: PlaybackOptions = {}) {
    this.options = options;
    this.currentIndex = options.initialIndex ?? 0;
  }

  /**
   * 状态迁移：触发播放
   */
  public play(): void {
    // 状态守卫：若当前已是 completed 状态，必须自动重置回第 0 步
    if (this.status === 'completed' || this.isFinished) {
      this.seek(0);
    }

    if (this.status === 'playing') return;

    this.status = 'playing';
    this.notifyStatusChange();
    this.scheduleNextTick();
  }

  /**
   * 状态迁移：暂停
   */
  public pause(): void {
    if (this.status !== 'playing') return;

    this.clearTimer();
    this.status = 'paused';
    this.notifyStatusChange();
  }

  /**
   * 单步前进时序守卫：状态感知行为
   */
  public stepForward(): boolean {
    // 如果处于播放中，单步触发强制降级为暂停
    if (this.status === 'playing') {
      this.pause();
    }

    if (this.currentIndex >= this.totalSteps - 1) {
      this.status = 'completed';
      this.notifyStatusChange();
      return false;
    }

    this.currentIndex++;
    this.notifyStepChange(false);
    return true;
  }

  private scheduleNextTick(): void {
    this.clearTimer();
    if (this.status !== 'playing') return;

    this.timer = window.setTimeout(() => {
      if (this.currentIndex < this.totalSteps - 1) {
        this.currentIndex++;
        this.notifyStepChange(true);
        this.scheduleNextTick();
      } else {
        // 自然播放至终局：自动迁移为 completed
        this.status = 'completed';
        this.clearTimer();
        this.notifyStatusChange();
      }
    }, this.speedMs);
  }
}`
      },
      {
        stepNum: 3,
        stepTitle: "纯领域状态机在无头 Vitest 中的秒级验证",
        file: "src/core/playback-coordinator.test.ts",
        line: "L25 ~ L60",
        description: "由于状态机没有任何浏览器 DOM API 耦合，在单元测试中可以通过虚拟时钟（vi.useFakeTimers）进行确定性状态迁移测试。",
        code: `it('should automatically transition to completed when reaching end', () => {
  const coordinator = new PlaybackCoordinator({ totalSteps: 3, speedMs: 100 });
  
  expect(coordinator.getSnapshot().status).toBe('idle');
  coordinator.play();
  expect(coordinator.getSnapshot().status).toBe('playing');

  // 快进 300ms
  vi.advanceTimersByTime(300);

  const finalSnapshot = coordinator.getSnapshot();
  expect(finalSnapshot.status).toBe('completed');
  expect(finalSnapshot.isFinished).toBe(true);
  expect(finalSnapshot.canGoNext).toBe(false);
});`
      },
      {
        stepNum: 4,
        stepTitle: "表现层根据状态快照驱动 UI 按钮启用/禁用 (State-Driven View)",
        file: "src/core/renderers/playback-control-presenter.ts",
        line: "L40 ~ L65",
        description: "UI 视图变成纯粹的受控组件，完全由 PlaybackSnapshot 决定按钮的图标是 Play 还是 Pause、Next 是否 disabled。",
        code: `coordinator.onStateChange((snapshot: PlaybackSnapshot) => {
  const btnPlay = document.getElementById('btn-play')!;
  const btnNext = document.getElementById('btn-next') as HTMLButtonElement;
  const btnPrev = document.getElementById('btn-prev') as HTMLButtonElement;

  btnPlay.innerHTML = snapshot.isPlaying ? '<svg>IconPause</svg>' : '<svg>IconPlay</svg>';
  btnNext.disabled = !snapshot.canGoNext;
  btnPrev.disabled = !snapshot.canGoPrev;
});`
      }
    ],
    classDiagram: `  ┌────────────────────────────────────────────────────────┐
  │                 PlaybackCoordinator                    │
  ├────────────────────────────────────────────────────────┤
  │ - status: PlaybackStatus ('idle'|'playing'|'paused'...)│
  │ - currentIndex: number                                 │
  ├────────────────────────────────────────────────────────┤
  │ + play(): void                                         │
  │ + pause(): void                                        │
  │ + stepForward(): boolean                               │
  │ + getSnapshot(): PlaybackSnapshot                      │
  └──────────────────────────┬─────────────────────────────┘
                             │ 状态迁移
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
   [ idle ] ──play()──► [ playing ] ──pause()─► [ paused ]
      ▲                      │                     │
      │                   到达终点                 │
      └──────seek(0)───────  ▼                     │
                        [ completed ] ◄────────────┘`,
    applicability: [
      "一个对象的行为取决于它的状态，并且它必须在运行时刻根据状态改变它的行为；",
      "一个操作中含有庞大的多分支的条件语句，且这些分支依赖于该对象的状态；",
      "需要对播放控制、网络拉取、事务流转进行严格且无副作用的幂等调度时。"
    ],
    pros: [
      "结构清晰：消除了巨型的 if (isPlaying && !isFinished) 条件分支堆砌；",
      "状态迁移安全守卫：非法状态操作（如 completed 状态下执行 next）被严格阻断；",
      "100% 零 DOM 单测性：纯领域状态机彻底解耦浏览器 UI，保障极高的回归测试信心。"
    ],
    cons: [
      "如果状态流转非常简单（仅两三种布尔标记），引入完备状态机可能会增加代码层级。"
    ],
    mitigations: "本项目采用轻量联合枚举（'idle' | 'playing' | 'paused' | 'completed'）与 Snapshot 备忘录结合，避免了古典 GoF 模式下每种状态新建一个类的重度样板代价。",
    realWorldJava: "Spring Statemachine 框架；Java 线程状态 Thread.State (NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, TERMINATED)。",
    realWorldProject: "src/core/playback-coordinator.ts，全系统时序播放、跳转与自校准单步调度的单一事实状态机。",
    relatedPatterns: [
      { name: "状态模式 vs 策略模式", comparison: "两者类图几乎完全一样，但意图完全不同：策略模式是由外部客户端主动注入算法，算法彼此平行互斥；状态模式是内部状态自动流转，客户无需了解具体状态即可直接使用对象。" },
      { name: "状态模式 vs 备忘录模式", comparison: "状态模式维护实时的迁移与行为；备忘录模式（Memento，如本项目中的 PlaybackSnapshot）用于捕获并暂存某个时刻的状态快照，以供回溯与比对。" }
    ]
  }
];

module.exports = { patterns1 };
