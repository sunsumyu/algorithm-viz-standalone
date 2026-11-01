// scripts/patterns-data-2.cjs
// 包含 06. 管道与过滤器模式、07. 适配器模式、08. 桥接模式、09. 外观模式、10. 表现器模式

const patterns2 = [
  {
    id: "pattern-pipes-filters",
    index: "06",
    title: "06. 管道与过滤器模式 (Pipes and Filters Pattern)",
    category: "ARCH",
    categoryLabel: "架构型模式",
    alsoKnownAs: "管道处理流水线 (Data Pipeline)",
    intent: "将处理复杂数据流的系统分解为若干独立的子处理阶段（过滤器 Filter），各阶段通过标准管道（Pipe）串联，前一个过滤器的输出作为后一个过滤器的输入。",
    realWorldAnalogy: "自来水厂的多级净水流水线：浑浊的原水流经水源管网进入水厂，首先经过粗滤格栅过滤器截留大块悬浮物，然后流入絮凝沉淀过滤器去除微小颗粒，接着流经活性炭吸附过滤器去除异味和有机物，最后经过紫外线与加氯消毒过滤器输出纯净饮用水。每个净水池是一个独立的 Filter，水管是 Pipe。在本项目中，580+ 算法的原始推演步骤（Raw Steps）由于不同作者编写，经常存在空指针时画布断电全灰、递归返回跳步瞬移、幽灵无变化帧等缺陷。USNE 归一化引擎构建了一条包含 4 大净化过滤器的纯函数流水线，自动将残缺步骤自愈为高品质标准步骤！",
    inPlainWords: "把一整套庞大的数据清洗与转换任务，拆解为一组依次执行、职责单一的过滤器流水线。",
    formalDefinition: "架构模式定义：管道与过滤器模式提供了一种将丰富数据流处理操作组织为一组离散、自治且高度复用的过滤器构件的架构方案，构件之间仅通过单向数据管道交互。",
    programmaticSteps: [
      {
        stepNum: 1,
        stepTitle: "定义过滤器类型与流水线管道调度器 (Pipeline Engine)",
        file: "src/core/step-normalization-engine.ts",
        line: "L12 ~ L45",
        description: "StepNormalizationEngine.normalize 接收原始步进数组，通过函数式组合串联流水线，输出 100% 免疫画布断电与漏帧的高保真步骤。",
        code: `export type StepFilter<T extends StepBase = StepBase> = (
  steps: T[],
  spec?: DeclarativeAlgorithmSpec<T>
) => T[];

export class StepNormalizationEngine {
  /**
   * 管道总线入口：流水线串联执行四大防跳步自愈过滤器
   */
  public static normalize<T extends StepBase = StepBase>(
    rawSteps: T[],
    spec?: DeclarativeAlgorithmSpec<T>
  ): T[] {
    if (!rawSteps || rawSteps.length === 0) return [];

    // 管道组合串联：Filter1 ➔ Filter2 ➔ Filter3 ➔ Filter4
    const pipeline: StepFilter<T>[] = [
      this.filterZeroVisualBlackout,    // 过滤器 1: 画布防断电与动态探针锚点自愈
      this.filterCallReturnUnwind,      // 过滤器 2: 递归子调用返回现场帧缺失自愈
      this.filterGhostSteps,            // 过滤器 3: 连续无变化幽灵跳步剔除
      this.filterSequenceNumbering      // 过滤器 4: 1-based 序号与时间戳连续性校准
    ];

    return pipeline.reduce((currentSteps, filter) => filter(currentSteps, spec), rawSteps);
  }
}`
      },
      {
        stepNum: 2,
        stepTitle: "编写具体过滤器 1：画布防断电与动态探针自愈 (Visual Blackout Filter)",
        file: "src/core/step-normalization-engine.ts",
        line: "L60 ~ L110",
        description: "当二叉树算法出现 root == null 时，严禁清空活跃节点导致画布全灰断电！过滤器自动为其挂载父级调用节点作为探针锚点（nullProbe）。",
        code: `private static filterZeroVisualBlackout<T extends StepBase>(
  steps: T[],
  spec?: DeclarativeAlgorithmSpec<T>
): T[] {
  let lastActiveTarget: HighlightTarget | null = null;

  return steps.map((step) => {
    const clone = { ...step };

    // 判定当前步骤是否为判空边界帧 (root == null)
    if (clone.codeLine === spec?.codeKeywords?.nullCheckLine) {
      if (!clone.highlights || clone.highlights.length === 0) {
        // 🚨 触发自愈：注入父节点探针锚点，动态渲染 ∅ null 虚线探针！
        clone.nullProbe = {
          parentVal: lastActiveTarget?.value ?? 'root',
          branch: lastActiveTarget?.branch ?? 'root'
        };
        clone.highlights = lastActiveTarget ? [lastActiveTarget] : [];
      }
    } else if (clone.highlights && clone.highlights.length > 0) {
      lastActiveTarget = clone.highlights[0];
    }

    return clone;
  });
}`
      },
      {
        stepNum: 3,
        stepTitle: "编写具体过滤器 2：递归调用返回现场帧合成器 (Unwind Repair Filter)",
        file: "src/core/step-normalization-engine.ts",
        line: "L120 ~ L175",
        description: "检测递归退栈，若调用方返回现场帧缺失，自动合成平滑的「调用返回现场帧」，防止光标从子函数瞬间瞬移至下一物理语句。",
        code: `private static filterCallReturnUnwind<T extends StepBase>(steps: T[]): T[] {
  const result: T[] = [];

  for (let i = 0; i < steps.length; i++) {
    const current = steps[i];
    const prev = steps[i - 1];

    // 检测到调用栈深度下降（退栈），且缺失调用方接收返回值的现场帧
    if (prev && prev.callStackDepth && current.callStackDepth && prev.callStackDepth > current.callStackDepth) {
      if (current.codeLine !== prev.callReturnLine) {
        // 自动插入合成的平滑返回帧
        const synthesizedReturnStep = {
          ...current,
          codeLine: prev.callReturnLine,
          log: \`子调用执行完毕，控制权返回父层现场，恢复上下文...\`
        };
        result.push(synthesizedReturnStep);
      }
    }

    result.push(current);
  }

  return result;
}`
      },
      {
        stepNum: 4,
        stepTitle: "在声明式渲染管网中全量装载管道过滤器",
        file: "src/core/declarative-algorithm-visualizer.ts",
        line: "L310 ~ L330",
        description: "在所有的 buildSteps 统一执行入口，全量自动流经 StepNormalizationEngine 管道，无需单题作者手动调用。",
        code: `// 在基类生命周期中统一步进归一化
const rawSteps = spec.buildSteps(presetInput);
const cleanSteps = StepNormalizationEngine.normalize(rawSteps, spec);
this.totalSteps = cleanSteps.length;
this.steps = cleanSteps;`
      }
    ],
    classDiagram: `  [ Raw Steps (原始残缺步骤) ]
                 │
                 ▼
  ┌────────────────────────────────────────────────────────┐
  │ Filter 1: filterZeroVisualBlackout (防断电动态探针)    │
  └──────────────────────────────┬─────────────────────────┘
                                 │
                                 ▼
  ┌────────────────────────────────────────────────────────┐
  │ Filter 2: filterCallReturnUnwind (递归返回现场补偿)    │
  └──────────────────────────────┬─────────────────────────┘
                                 │
                                 ▼
  ┌────────────────────────────────────────────────────────┐
  │ Filter 3: filterGhostSteps (无变化幽灵跳步剔除)        │
  └──────────────────────────────┬─────────────────────────┘
                                 │
                                 ▼
  ┌────────────────────────────────────────────────────────┐
  │ Filter 4: filterSequenceNumbering (1-based序号校准)    │
  └──────────────────────────────┬─────────────────────────┘
                                 │
                                 ▼
  [ High-Fidelity Clean Steps (100% 门禁合规标准步骤) ]`,
    applicability: [
      "数据处理需求可以自然分解为一系列独立且相继的转换步骤时；",
      "不同的业务场景需要灵活增减、重新编排某些转换处理步骤时；",
      "需要对第三方或不同作者输出的数据进行质量自愈、格式规约与契约清洗时。"
    ],
    pros: [
      "极佳的解耦与内聚：每个过滤器仅做一件事（如只做探针自愈，或只做退栈自愈），代码极为简洁；",
      "易于复用与重排：可以通过添加、移除或调整过滤器次序轻松重构流程；",
      "高可测试性：每个 Filter 都是纯函数 (Pure Function)，输入数组 -> 输出数组，测试极其简单。"
    ],
    cons: [
      "每次过滤若采用深度克隆可能会带来微小的内存开销（在前端几千步规模下完全可忽略）；",
      "过滤器之间传递的数据格式必须保持统一兼容契约（统一遵循 StepBase）。"
    ],
    mitigations: "本项目所有 Filter 均基于浅拷贝和只读映射，单次流水线耗时 < 3ms，且由 StepBase 接口作为不可变共享规范保护。",
    realWorldJava: "Java 8+ Stream API (stream.filter().map().sorted().collect())；Servlet Filter 链；Netty ChannelPipeline 编解码流水线。",
    realWorldProject: "src/core/step-normalization-engine.ts，保障全库 580+ 算法在无头门禁 (test:presentation) 下 100% 零红灯通过的核心引擎。",
    relatedPatterns: [
      { name: "管道过滤器 vs 责任链模式", comparison: "责任链模式侧重于在链条中找到一个能处理请求的对象并终止处理；管道过滤器模式中所有过滤器都必须依次处理同一份数据流，进行多道加工。" },
      { name: "管道过滤器 vs 建造者模式", comparison: "建造者模式用于组装一个复杂的复合对象；管道过滤器模式用于对数据集合进行逐步转换与质量清洗。" }
    ]
  },
  {
    id: "pattern-adapter",
    index: "07",
    title: "07. 适配器模式 (Adapter Pattern)",
    category: "STRUCTURAL",
    categoryLabel: "结构型模式",
    alsoKnownAs: "变压器模式 (Wrapper Pattern)",
    intent: "将一个类的接口转换成客户希望的另外一个接口。适配器模式使得原本由于接口不兼容而不能一起工作的那些类可以一起工作。",
    realWorldAnalogy: "电源插头旅行转换器：当你带着中国标准的三脚插头（扁脚）去欧洲旅行时，欧洲的插座是双圆孔标准。你不可能把欧洲的插座砸掉重装，也不可能剪断电脑电源线，只需买一个欧标插头适配器：一头接入中国插头，另一头插进欧标插座。在本项目中，可视化底层有高性能的原生 Canvas 绘制引擎（TreeCanvasEngine）和原生的 3D Three.js 网格对象（Three.Group），但平台统一的调度体系只认 IVisualRenderer 接口（拥有 mount, updateStep, dispose 三大约束）。适配器类将异构的物理渲染引擎包装为平台统一标准契约！",
    inPlainWords: "在两个不兼容的接口之间搭建一座桥梁，让老组件或异构第三方组件无需修改即可接入新规范。",
    formalDefinition: "GoF《设计模式》定义：适配器模式把一个已有类（Adaptee）的接口变换成目标接口（Target），使依赖目标接口的客户端无感知地复用已有类的能力。",
    programmaticSteps: [
      {
        stepNum: 1,
        stepTitle: "定义平台统一视觉适配器目标接口 (Target Interface)",
        file: "src/core/renderers/visual-renderer.ts",
        line: "L18 ~ L38",
        description: "IVisualRenderer 规范了所有渲染器在 UI 生命周期中的三大约束方法：mount 挂载、updateStep 单步快照更新、dispose 内存销毁。",
        code: `export interface IVisualRenderer {
  readonly id: string;

  /**
   * 挂载至指定 DOM 容器
   */
  mount(container: HTMLElement): void;

  /**
   * 更新当前步骤快照并触发平滑视图过渡
   */
  updateStep(step: UniversalStep, context?: VisualRendererContext): void;

  /**
   * 响应容器尺寸变化
   */
  resize?(width?: number, height?: number): void;

  /**
   * 销毁实例，彻底释放 WebGL 纹理、几何体和事件监听器
   */
  dispose(): void;
}`
      },
      {
        stepNum: 2,
        stepTitle: "现有且不兼容的被适配者（Adaptee: Three.js 立体体素引擎）",
        file: "src/core/renderers/three-layered-voxel-engine.ts",
        line: "L15 ~ L50",
        description: "底层的 Three.js 体素引擎只暴露原生 WebGL API：scene.add()、mesh.position.set()、renderer.render()，与 IVisualRenderer 完全不兼容。",
        code: `// 原生 WebGL 引擎（被适配者 Adaptee）
export class NativeThreeVoxelEngine {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public voxelMeshes: Map<string, THREE.Mesh> = new Map();

  public renderScene(): void {
    this.renderer.render(this.scene, this.camera);
  }

  public setVoxelColor(key: string, hexColor: number): void {
    const mesh = this.voxelMeshes.get(key);
    if (mesh) (mesh.material as THREE.MeshStandardMaterial).color.setHex(hexColor);
  }
}`
      },
      {
        stepNum: 3,
        stepTitle: "编写适配器类实现 Target 接口并封装 Adaptee (Object Adapter)",
        file: "src/core/renderers/three-layered-voxel-adapter.ts",
        line: "L25 ~ L85",
        description: "ThreeLayeredVoxelAdapter 实现 IVisualRenderer，将上层的 UniversalStep 数据规约为 Three.js 原生图元操作，实现接口转接。",
        code: `export class ThreeLayeredVoxelAdapter implements IVisualRenderer {
  public readonly id = 'three-layered-voxel';
  private engine!: NativeThreeVoxelEngine; // 持有被适配者引用 (Composition)

  public mount(container: HTMLElement): void {
    // 将底层 Three.js 画布注入到平台统一的容器中
    this.engine = new NativeThreeVoxelEngine(container);
  }

  public updateStep(step: UniversalStep, context?: VisualRendererContext): void {
    if (!this.engine) return;

    // 核心适配逻辑：将通用业务数据 UniversalStep 转换为 3D 体素空间状态
    if (step.gridState) {
      step.gridState.forEach((row, r) => {
        row.forEach((cellVal, c) => {
          const color = step.highlights?.some(h => h.r === r && h.c === c)
            ? 0x38bdf8  // 活跃高亮体素
            : 0x1e293b; // 常规底色体素
          this.engine.setVoxelColor(\`\${r}-\${c}\`, color);
        });
      });
    }

    this.engine.renderScene();
  }

  public dispose(): void {
    if (this.engine) {
      this.engine.dispose();
    }
  }
}`
      },
      {
        stepNum: 4,
        stepTitle: "客户端统一无差别调用 Target 接口",
        file: "src/core/controllers/visualizer-mediator.ts",
        line: "L160 ~ L175",
        description: "控制器对底层是 2D DOM Table 还是 3D WebGL 完全无感，统一通过 IVisualRenderer 触发 updateStep。",
        code: `// 客户端完全面向 IVisualRenderer 编程，无需知晓底层使用了原生 Three.js 还是 DOM
const adapter: IVisualRenderer = new ThreeLayeredVoxelAdapter();
adapter.mount(canvasContainer);
adapter.updateStep(currentStep); // 平滑无缝触发！`
      }
    ],
    classDiagram: `  ┌────────────────────────────────────────────────────────┐
  │         Client: VisualizerMediator (客户端)            │
  └────────────────────────────┬───────────────────────────┘
                               │ 依赖
                               ▼
  ┌────────────────────────────────────────────────────────┐
  │        «interface» IVisualRenderer (Target 目标)       │
  ├────────────────────────────────────────────────────────┤
  │ + mount(container: HTMLElement): void                  │
  │ + updateStep(step: UniversalStep): void                │
  │ + dispose(): void                                      │
  └────────────────────────────▲───────────────────────────┘
                               │ 实现
  ┌────────────────────────────┴───────────────────────────┐
  │       ThreeLayeredVoxelAdapter (适配器)                │
  ├────────────────────────────────────────────────────────┤
  │ - engine: NativeThreeVoxelEngine (持有 Adaptee 引用)   │
  ├────────────────────────────────────────────────────────┤
  │ + mount() -> new NativeThreeVoxelEngine(...)           │
  │ + updateStep() -> engine.setVoxelColor(...)            │
  └────────────────────────────┬───────────────────────────┘
                               │ 委托调用
                               ▼
  ┌────────────────────────────────────────────────────────┐
  │         NativeThreeVoxelEngine (Adaptee 被适配者)      │
  ├────────────────────────────────────────────────────────┤
  │ + setVoxelColor(key, hex): void                        │
  │ + renderScene(): void                                  │
  └────────────────────────────────────────────────────────┘`,
    applicability: [
      "你想使用一个已经存在的类，而它的接口不符合系统的需求；",
      "你想创建一个可以复用的类，该类可以与其他不相关的类或不可预见的类协同工作；",
      "需要统一多种异构呈现技术（如同时支持 2D DOM、SVG、Canvas 和 WebGL 3D）。"
    ],
    pros: [
      "单一职责原则：把接口转换代码从核心业务逻辑中彻底剥离；",
      "开闭原则：引入新适配器类无需修改既有被适配者代码或平台调度层；",
      "保护既有资产：复用成熟底层库（如 Three.js）而无需修改其源码。"
    ],
    cons: [
      "由于增加了适配器中间转发层，代码系统复杂度有轻微上升。"
    ],
    mitigations: "本项目所有适配器采用薄适配器（Thin Domain Adapter）原则，行数严格控制在 150 行以内，杜绝在适配器中堆砌私有推演逻辑。",
    realWorldJava: "java.util.Arrays.asList()（将数组适配为 List）；org.springframework.web.servlet.HandlerAdapter。",
    realWorldProject: "src/core/renderers/adapters/ 目录下的所有 Canvas 与 WebGL 适配器（DOMGridVisualAdapter, ThreeLayeredVoxelAdapter 等）。",
    relatedPatterns: [
      { name: "适配器模式 vs 装饰器模式", comparison: "适配器模式改变接口以解决不兼容问题；装饰器模式保持接口不变，动态增强对象的功能。" },
      { name: "适配器模式 vs 桥接模式", comparison: "适配器模式通常用于系统演化后期解决已有接口的兼容问题（亡羊补牢）；桥接模式是在系统设计初期主动将抽象与实现分离（未雨绸缪）。" }
    ]
  },
  {
    id: "pattern-bridge",
    index: "08",
    title: "08. 桥接模式 (Bridge Pattern)",
    category: "STRUCTURAL",
    categoryLabel: "结构型模式",
    alsoKnownAs: "句柄/实体模式 (Handle/Body Pattern)",
    intent: "将抽象部分与它的实现部分分离，使它们都可以独立地变化。",
    realWorldAnalogy: "通用遥控器与智能家电：如果设计 5 款不同品牌电视（索尼、三星、LG、小米、海信）且每款电视有 3 种遥控器（红外遥控、蓝牙遥控、手机App遥控），若采用紧耦合继承体系，需要写 5 * 3 = 15 个类。采用桥接模式，遥控器定义「抽象部分」（开机、关机、换台），电视定义「实现部分」（接收红外/蓝牙信号并驱动屏幕）。遥控器聚合电视接口，双方各新增 10 个型号只需 5+3=8 个类，彻底避免 M*N 类爆炸！在本项目中，【算法步进推演抽象】与【物理渲染呈现实现】彼此独立，一种 DP 矩阵可自由桥接 2D 表格或 3D 立体切片。",
    inPlainWords: "用组合替代继承，把业务维度的变化和技术实现维度的变化彻底拆开，让两轴独立扩展。",
    formalDefinition: "GoF《设计模式》定义：桥接模式通过在抽象化与实现化之间建立一个关联桥梁，取代多层继承结构，实现两个独立变化维度的正交解耦。",
    programmaticSteps: [
      {
        stepNum: 1,
        stepTitle: "定义技术实现维度接口 (Implementor)",
        file: "src/core/renderers/visual-renderer.ts",
        line: "L18 ~ L38",
        description: "IVisualRenderer 代表纯粹的物理渲染技术轴，它只关心如何把图元画在屏幕上，完全不知晓算法的具体业务含义。",
        code: `export interface IVisualRenderer {
  mount(container: HTMLElement): void;
  updateStep(step: UniversalStep, context?: VisualRendererContext): void;
  dispose(): void;
}`
      },
      {
        stepNum: 2,
        stepTitle: "定义业务抽象维度抽象基类 (Abstraction)",
        file: "src/core/universal-stage-engine.ts",
        line: "L45 ~ L90",
        description: "UniversalStagePresenter 作为抽象维度，持有 IVisualRenderer 引用（这就是“桥”），自身专注于四阶段状态流转与推演逻辑。",
        code: `export class UniversalStagePresenter {
  // 🌉 桥梁核心：持有实现维度的抽象引用，而非具体某一种渲染技术
  protected renderer: IVisualRenderer;

  constructor(renderer: IVisualRenderer) {
    this.renderer = renderer;
  }

  /**
   * 业务维度演进动作：切换至下一阶段并驱动底层渲染
   */
  public transitionToStage(nextStage: number, stepData: UniversalStep): void {
    // 业务推演逻辑
    console.log(\`[StagePresenter] Transition to stage: \${nextStage}\`);

    // 跨越桥梁，委派底层渲染器呈现
    this.renderer.updateStep(stepData, { stage: nextStage });
  }

  public setRenderer(newRenderer: IVisualRenderer): void {
    this.renderer.dispose();
    this.renderer = newRenderer;
  }
}`
      },
      {
        stepNum: 3,
        stepTitle: "实现维度独立演化扩展 (Concrete Implementors)",
        file: "src/core/renderers/dom-grid-visual-adapter.ts",
        line: "L30 ~ L70",
        description: "实现轴可以随意演化出 2D DOM 渲染器、3D WebGL 渲染器，甚至未来的 VR 渲染器，而无需改动业务抽象层的一行代码。",
        code: `// 实现维度分支 1: 2D DOM 渲染
export class DOMGridVisualAdapter implements IVisualRenderer {
  public updateStep(step: UniversalStep): void {
    // 纯 HTML Table 渲染
  }
  public mount() {}
  public dispose() {}
}

// 实现维度分支 2: 3D Three.js 渲染
export class ThreeGridVisualAdapter implements IVisualRenderer {
  public updateStep(step: UniversalStep): void {
    // 纯 WebGL 立体切片渲染
  }
  public mount() {}
  public dispose() {}
}`
      },
      {
        stepNum: 4,
        stepTitle: "客户端在运行时自由正交组装两轴",
        file: "src/core/declarative-algorithm-visualizer.ts",
        line: "L250 ~ L280",
        description: "用户在界面点击「2D / 3D 模式切换」时，抽象层无需销毁重建，只需替换桥接的 Implementor 即可实现平滑技术跃迁。",
        code: `// 运行时动态桥接：从 2D DOM 渲染无缝切换至 3D 体素渲染
const presenter = new UniversalStagePresenter(new DOMGridVisualAdapter());
presenter.transitionToStage(3, step);

// 用户一键开启 3D 视界
presenter.setRenderer(new ThreeGridVisualAdapter());
presenter.transitionToStage(3, step); // 同一份算法，不同物理维度！`
      }
    ],
    classDiagram: `  ┌─────────────────────────────────┐           ┌─────────────────────────────────┐
  │   Abstraction (业务推导抽象)    │           │  Implementor (物理渲染实现)     │
  │   UniversalStagePresenter       │           │        IVisualRenderer          │
  ├─────────────────────────────────┤  桥 (Bridge) ├─────────────────────────────────┤
  │ - renderer: IVisualRenderer ────┼──────────►│ + mount(container)              │
  ├─────────────────────────────────┤           │ + updateStep(step)              │
  │ + transitionToStage(stage, step)│           │ + dispose()                     │
  └────────────────┬────────────────┘           └────────────────┬────────────────┘
                   │ 派生                                         │ 实现
       ┌───────────┴───────────┐                     ┌───────────┴───────────┐
       ▼                       ▼                     ▼                       ▼
  ┌──────────┐           ┌──────────┐           ┌──────────┐           ┌──────────┐
  │ 1D DP    │           │ 2D Grid  │           │ DOM 2D   │           │ Three.js │
  │ Presenter│           │ Presenter│           │ Adapter  │           │ 3D Adptr │
  └──────────┘           └──────────┘           └──────────┘           └──────────┘`,
    applicability: [
      "你不希望在抽象和它的实现部分之间有一个固定的绑定关系（例如需要在运行时动态切换实现）；",
      "类的抽象以及它的实现都应该可以通过生成子类的方法加以扩充；",
      "对一个抽象的实现部分的修改应对客户不能产生影响，即客户的代码不必重新编译。"
    ],
    pros: [
      "分离接口及其实现部分：实现细节完全不渗漏到抽象接口中；",
      "提高可扩充性：两个维度（业务与渲染）可以完全独立地扩充而互不影响；",
      "消除类爆炸：将原本乘法级增长的子类网格（M*N）降解为加法级独立扩展（M+N）。"
    ],
    cons: [
      "增加了系统的理解与设计难度，需要在一开始就准确识别出系统中两个独立变化的维度。"
    ],
    mitigations: "本项目从架构设计的第一天便在 CONTEXT.md 明确划定了两轴：算法数学推导（StepCompiler）与视图物理呈像（IVisualRenderer），界限极为鲜明。",
    realWorldJava: "JDBC 驱动管理器体系（java.sql.Driver 与各厂商驱动包如 MySQL Connector / Oracle OJDBC）；AWT 的 Peer 架构。",
    realWorldProject: "src/core/universal-stage-engine.ts（业务抽象）与 src/core/renderers/visual-renderer.ts（实现接口及其 2D/3D 适配实现）。",
    relatedPatterns: [
      { name: "桥接模式 vs 适配器模式", comparison: "适配器模式是在两个已有接口之间解决不兼容问题（后置发生）；桥接模式是在系统架构时主动拆分两个独立演进的维度（前置设计）。" },
      { name: "桥接模式 vs 策略模式", comparison: "策略模式关注算法行为在同一维度内的可替换性；桥接模式关注结构层面上抽象与实现的解耦与独立派生。" }
    ]
  },
  {
    id: "pattern-facade",
    index: "09",
    title: "09. 外观模式 (Facade Pattern)",
    category: "STRUCTURAL",
    categoryLabel: "结构型模式",
    alsoKnownAs: "门面模式 (門面模式)",
    intent: "为子系统中的一组接口提供一个一致的界面，Facade模式定义了一个高层接口，这个接口使得这一子系统更加容易使用。",
    realWorldAnalogy: "豪华餐厅的套餐与私人管家服务：如果你去一家顶级法式餐厅单点菜品，你需要研究前菜、汤品、主菜牛排熟度、搭配红酒年份、餐后甜点，还要协调上菜次序。而直接选择「主厨甄选套餐（Facade）」后，管家一站式搞定点餐、厨师烹饪、侍酒师醒酒与结账全部流程。在本项目中，渲染一个算法需要协调 6 个复杂子系统：①生成 Card 1~4 网格 HTML、②挂载 SplitterEngine 响应式拖拽、③集成 StepNormalizationEngine 防跳步自愈、④向 AlgorithmRegistry 注册 Manifest、⑤挂载 DarkCodeTerminal、⑥挂载 ExecutionLogPresenter。Facade 将其封装为 registerDeclarativeAlgorithm 一行调用！",
    inPlainWords: "用一个高层统一的门面方法，把底层五六个子系统的繁琐交互流程彻底包揽，给使用者极简的开发体验。",
    formalDefinition: "GoF《设计模式》定义：外观模式外部与一个子系统的通信必须通过一个统一的门面对象进行，门面类将客户端的请求代理给子系统内部相应的对象，从而降低子系统使用的复杂度。",
    programmaticSteps: [
      {
        stepNum: 1,
        stepTitle: "定义一站式声明式元数据配置规范 (Spec Interface)",
        file: "src/core/renderers/declarative-stage-presenter.ts",
        line: "L30 ~ L85",
        description: "DeclarativeAlgorithmSpec 作为轻量领域适配器的数据源，单题作者只需关注算法 ID、讲义、预设用例与步进推导函数。",
        code: `export interface DeclarativeAlgorithmSpec<TStep extends StepBase = StepBase> {
  id: string;
  name: string;
  category: string;
  badge?: string;
  descriptionHtml?: string;
  presets: PresetCaseDef[];
  codeLanguages: Record<string, string>;
  buildSteps: (input: any) => TStep[];
  rendererKind?: '2d-grid' | '3d-voxel' | 'svg-tree';
}`
      },
      {
        stepNum: 2,
        stepTitle: "实现统摄六大子系统的高层外观门面 (Facade Core)",
        file: "src/core/declarative-algorithm-visualizer.ts",
        line: "L109 ~ L220",
        description: "registerDeclarativeAlgorithm 集中编排 HTML 骨架编译、Splitter 拖拽注册、USNE 自愈注入与全局清单播种，彻底收拢繁杂逻辑。",
        code: `export function registerDeclarativeAlgorithm<TStep extends StepBase>(
  spec: DeclarativeAlgorithmSpec<TStep>
): void {
  // 1. 协调子系统 1: 自动编译标准 4-Card HTML 骨架
  const template = compileCardGridHtml(spec);

  // 2. 协调子系统 2: 构建高阶 Visualizer 类并自动注入 Splitter 拖拽引擎
  class GeneratedVisualizer extends DeclarativeAlgorithmVisualizer<TStep> {
    constructor() {
      super(spec);
    }
  }

  // 3. 协调子系统 3: 挂载 StepNormalizationEngine 自动消除跳步与断电
  DECLARATIVE_SPECS.set(spec.id, spec);

  // 4. 协调子系统 4: 注册至全局元数据与分包清单
  registerAlgorithm({
    id: spec.id,
    name: spec.name,
    category: spec.category,
    template,
    Visualizer: GeneratedVisualizer
  });
}`
      },
      {
        stepNum: 3,
        stepTitle: "客户端单题极致极简接入 (49行瘦身范例)",
        file: "src/algorithms/categories/dynamic-programming/climbing-stairs-matrix-renderer.ts",
        line: "L18 ~ L49",
        description: "由于 Facade 承担了巨量脏活累活，单题文件只需纯粹配置领域 Spec，行数仅 49 行，完全不越身材红线（< 150行）！",
        code: `import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { ClimbingStairsMatrixStepCompiler } from '../../../core/renderers/adapters/climbing-stairs-matrix-098-step-compiler';

// 客户端无需知晓 Splitter、DOM Grid、DarkTerminal 等细节，一行外观搞定！
registerDeclarativeAlgorithm({
  id: 'climbing-stairs-matrix',
  name: '爬楼梯矩阵快速幂 (Climbing Stairs Matrix)',
  category: 'dynamic-programming',
  presets: [
    { label: '基础用例 (n=5)', value: 5 },
    { label: '中等步数 (n=10)', value: 10 }
  ],
  codeLanguages: {
    java: \`public int climbStairs(int n) { ... }\`,
    cpp: \`int climbStairs(int n) { ... }\`
  },
  buildSteps: (input: number) => {
    return ClimbingStairsMatrixStepCompiler.compile(input);
  }
});`
      },
      {
        stepNum: 4,
        stepTitle: "外观统一装配生成的运行期应用界面",
        file: "src/core/declarative-algorithm-visualizer.ts",
        line: "L350 ~ L420",
        description: "在页面加载时，外观自动把 DarkCodeTerminalPresenter 与 ExecutionLogPresenter 挂载到生成的 Card 容器中，浑然一体。",
        code: `public onMount(container: HTMLElement): void {
  // 外观自动装配控制台与日志流
  this.terminalPresenter = new DarkCodeTerminalPresenter(container.querySelector('#dsp-code-terminal')!);
  this.logPresenter = new ExecutionLogPresenter(container.querySelector('#dsp-log-container')!);
  this.splitterEngine = new SplitterEngine(container);
}`
      }
    ],
    classDiagram: `  ┌────────────────────────────────────────────────────────┐
  │      Client: climbing-stairs-matrix-renderer.ts        │
  │                  (单题极简接入，49行)                  │
  └──────────────────────────┬─────────────────────────────┘
                             │ 单一高层调用
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │         Facade: registerDeclarativeAlgorithm           │
  ├────────────────────────────────────────────────────────┤
  │ + compileCardGridHtml()                                │
  │ + bindSplitterEngine()                                 │
  │ + injectNormalizationPipeline()                        │
  │ + registerToManifest()                                 │
  └──────┬────────────┬────────────┬────────────┬──────────┘
         │ 代理       │ 代理       │ 代理       │ 代理
         ▼            ▼            ▼            ▼
  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
  │Card1~4 HTML│ │  Splitter  │ │    USNE    │ │ Algorithm  │
  │  Compiler  │ │   Engine   │ │ Engine     │ │ Registry   │
  └────────────┘ └────────────┘ └────────────┘ └────────────┘`,
    applicability: [
      "当你要为一个复杂子系统提供一个简单接口时；",
      "客户程序与多个子系统之间存在很大的依赖性，引入外观模式将子系统与客户以及其他子系统分离；",
      "当你需要构建一个层次结构的子系统时，使用外观模式定义子系统中每一层的入口点。"
    ],
    pros: [
      "极简的开发者体验（DX）：大幅降低新题接入的学习成本，单题开发提效 80%；",
      "强行对齐架构规范：通过门面内部硬性装配 Splitter、USNE 和日志流，杜绝各题私自魔改 UI 结构；",
      "身材红线绝对防线：单题 renderer.ts 得以严格压制在 150 行以内。"
    ],
    cons: [
      "外观类自身代码量庞大（在本项目 declarative-algorithm-visualizer.ts 约 1400 行）；",
      "如果需要定制非常特殊的非标布局，可能需要穿透外观直接操作底层子系统。"
    ],
    mitigations: "本项目提供了 DeclarativeAlgorithmSpec 的丰富插槽（VisualSlot, customClass 等），兼具极简门面与高阶定制能力。",
    realWorldJava: "Spring Boot 的 @SpringBootApplication（复合了 @Configuration, @EnableAutoConfiguration, @ComponentScan 的外观注解）；Java SLF4J 门面框架。",
    realWorldProject: "src/core/declarative-algorithm-visualizer.ts，全库 90% 声明式算法接入的唯一高杠杆门面。",
    relatedPatterns: [
      { name: "外观模式 vs 中介者模式", comparison: "外观模式抽象子系统接口提供单向外部调用；中介者模式协调内部同事之间的多向交互。" },
      { name: "外观模式 vs 单例模式", comparison: "外观对象经常被实现为单例（Singleton），以提供全局唯一的高层访问入口。" }
    ]
  },
  {
    id: "pattern-presenter",
    index: "10",
    title: "10. 表现器模式 (Presenter / MVP)",
    category: "STRUCTURAL",
    categoryLabel: "结构型模式",
    alsoKnownAs: "MVP 表现层模式 (Model-View-Presenter)",
    intent: "从视图（View）中抽取所有复杂的 DOM 渲染、状态计算与样式格式化逻辑，封装进专门的表现器（Presenter），确保视图极其薄弱，业务表现逻辑可被纯粹单测，并确立系统的单一事实来源（SSOT）。",
    realWorldAnalogy: "博物馆专业讲解员：展览馆里陈列着古代恐龙化石（Model 数据），普通参观者站在展柜前（View DOM 容器）。讲解员（Presenter）负责把化石的年代、骨骼结构、发掘故事以生动浅显的语言与多媒体投影呈现给游客。游客无需自己去翻阅古生物专业论文。在本项目中，Card 4 执行日志流拥有极为严苛的黄金标准（浅板色标题头、药丸徽标、自动吸底、活跃行高亮、非活跃行步骤计数）。ExecutionLogPresenter 充当金牌讲解员，统筹全库 658+ 道算法日志渲染，严禁任何单题在页面内手写 innerHTML！",
    inPlainWords: "把界面组件的渲染细节与格式化逻辑彻底抽离至独立的 Presenter 类中，做到视图极薄、逻辑可测、全库体验绝对一致。",
    formalDefinition: "架构模式定义：MVP 模式将应用程序分为模型（Model 数据）、视图（View 纯 DOM 容器）与表现器（Presenter 展现驱动）。Presenter 响应模型变化并直接操纵 View 元素，确立视觉渲染的单一事实来源。",
    programmaticSteps: [
      {
        stepNum: 1,
        stepTitle: "定义表现器配置选项与领域日志数据契约 (Model Interface)",
        file: "src/core/renderers/execution-log-presenter.ts",
        line: "L15 ~ L40",
        description: "StepLogEntry 规范数据模型，ExecutionLogCardOptions 规范容器标题与徽标配置。",
        code: `export interface ExecutionLogCardOptions {
  title?: string;
  countLabel?: string;
  containerId?: string;
  countId?: string;
  customClass?: string;
}

export interface StepLogEntry {
  log?: string;
  message?: string;
  msg?: string;
  decision?: string;
  type?: string;
  [key: string]: any;
}`
      },
      {
        stepNum: 2,
        stepTitle: "实现单一事实来源的统一日志表现器 (ExecutionLogPresenter SSOT)",
        file: "src/core/renderers/execution-log-presenter.ts",
        line: "L45 ~ L130",
        description: "ExecutionLogPresenter 包含渲染 Card 4 骨架与逐帧渲染条目的核心方法，自动计算活跃高亮色（#eff6ff）与自动平滑吸底。",
        code: `export class ExecutionLogPresenter {
  /**
   * 生成对齐黄金基准的标准 Card 4 HTML 骨架
   */
  public static renderCard4Html(options: ExecutionLogCardOptions = {}): string {
    const title = options.title ?? '执行日志与决策流';
    const containerId = options.containerId ?? 'dsp-log-container';
    const countId = options.countId ?? 'log-count';

    return \`
      <div class="dsp-card dsp-card-4 border border-slate-700 bg-slate-900 rounded-lg flex flex-col h-full overflow-hidden">
        <div class="dsp-card-header px-4 py-2 border-b border-slate-700 flex justify-between items-center bg-slate-800">
          <span class="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h12"/></svg>
            \${title}
          </span>
          <span id="\${countId}" class="px-2 py-0.5 text-xs bg-slate-700 text-slate-300 rounded-full font-mono">0 步</span>
        </div>
        <div id="\${containerId}" class="dsp-log-scroll flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1.5 scroll-smooth"></div>
      </div>
    \`;
  }

  /**
   * 逐帧更新日志列表：高亮当前行、应用鲜蓝边框并平滑吸底滚动
   */
  public static renderStepLogs(
    container: HTMLElement,
    steps: StepLogEntry[],
    currentIndex: number,
    logCountEl?: HTMLElement | null
  ): void {
    if (!container) return;

    if (logCountEl) {
      logCountEl.textContent = \`\${currentIndex + 1} / \${steps.length} 步\`;
    }

    // 渲染历史所有日志，当前步添加高亮标记
    container.innerHTML = steps.slice(0, currentIndex + 1).map((s, idx) => {
      const isCurrent = idx === currentIndex;
      const text = s.log || s.message || s.msg || s.decision || \`步骤 \${idx + 1}\`;
      const bgClass = isCurrent ? 'bg-blue-950/40 border-l-4 border-blue-500 text-blue-200' : 'text-slate-400 border-l-2 border-slate-700';

      return \`<div class="p-1.5 pl-2 rounded transition-all \${bgClass}">
        <span class="text-slate-500 mr-2">#\${idx + 1}</span>\${text}
      </div>\`;
    }).join('');

    // 自动平滑滚动吸底 (Auto Scroll to Bottom)
    container.scrollTop = container.scrollHeight;
  }
}`
      },
      {
        stepNum: 3,
        stepTitle: "表现器与无头测试断言深度结合",
        file: "src/core/renderers/execution-log-presenter.test.ts",
        line: "L30 ~ L65",
        description: "在 JSDOM 环境中单测 Presenter，保证高亮类名、滚动条位置与条目数量百分之百精确无误。",
        code: `it('should mark active step with border-blue-500 and auto-scroll', () => {
  const container = document.createElement('div');
  const steps = [{ log: 'Step A' }, { log: 'Step B' }];

  ExecutionLogPresenter.renderStepLogs(container, steps, 1);

  expect(container.children.length).toBe(2);
  expect(container.children[1].className).toContain('border-blue-500');
  expect(container.children[1].className).toContain('text-blue-200');
});`
      },
      {
        stepNum: 4,
        stepTitle: "在全库所有算法中彻底禁止内联手拼 DOM，全部委托 Presenter",
        file: "src/core/declarative-algorithm-visualizer.ts",
        line: "L390 ~ L410",
        description: "中介者与外观层在每一步变更时，直接调用 ExecutionLogPresenter.renderStepLogs，实现全库体验绝对一致。",
        code: `// 全库 658+ 算法彻底统一归约为一行调用：
ExecutionLogPresenter.renderStepLogs(this.logContainer, this.steps, stepIndex, this.logCountEl);`
      }
    ],
    classDiagram: `  ┌────────────────────────────────────────────────────────┐
  │         Model: UniversalStep[] (纯领域步进数据)         │
  └──────────────────────────┬─────────────────────────────┘
                             │ 提供数据
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │       Presenter: ExecutionLogPresenter (唯一事实)      │
  ├────────────────────────────────────────────────────────┤
  │ + renderCard4Html(options): string                     │
  │ + renderStepLogs(container, steps, currIdx, countEl)   │
  └──────────────────────────┬─────────────────────────────┘
                             │ 驱动与操纵 DOM
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │           View: #dsp-log-container (受控 DOM 容器)      │
  │   - 浅板色头部 + #log-count 药丸徽标                   │
  │   - 当前行 bg-blue-950/40 + border-l-4 border-blue-500 │
  │   - container.scrollTop = container.scrollHeight       │
  └────────────────────────────────────────────────────────┘`,
    applicability: [
      "多个视图组件需要以完全统一的样式规范与排版呈现相同类型的数据（如统一日志流、统一样式卡片）；",
      "需要对原本混杂在 UI 组件中的 DOM 字符串拼接与样式计算进行独立单元测试；",
      "项目中出现不同页面由于不同开发者编写而导致的 UI 风格割裂、字体不一致等失控现象。"
    ],
    pros: [
      "确立单一事实来源（SSOT）：全库 658+ 道算法日志 UI 彻底归一，任何样式升级只需修改这一个类；",
      "彻底消除散装 innerHTML 注入漏洞；",
      "支持在零 DOM / Node.js 虚拟 DOM 环境中直接验证格式化逻辑。"
    ],
    cons: [
      "需要额外编写 Presenter 层，对极其简单的小组件可能会显得有些繁琐。"
    ],
    mitigations: "本项目仅在 Card 4 日志流、Card 3 代码控制台与 Card 2 指标网格等全库核心通用区域采用 Presenter，精准打击痛点。",
    realWorldJava: "Android MVP 架构中的 Presenter；Web 领域的 Vaadin 框架；WPF 中的 ViewModel/Presenter。",
    realWorldProject: "src/core/renderers/execution-log-presenter.ts 与 DarkCodeTerminalPresenter。",
    relatedPatterns: [
      { name: "Presenter 模式 vs 适配器模式", comparison: "适配器模式用于解决接口不匹配的问题；Presenter 模式用于分离模型与视图的呈现逻辑，统筹 UI 渲染。" },
      { name: "Presenter 模式 vs 观察者模式", comparison: "Presenter 往往作为观察者监听领域事件，然后主动更新 View 视图元素。" }
    ]
  }
];

module.exports = { patterns2 };
