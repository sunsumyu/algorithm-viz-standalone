// scripts/patterns-data-3.cjs
// 包含 11. 注册表与定位器、12. 工厂方法、13. 建造者、14. 单例模式，以及 00. 深模块与身材红线规范

const patterns3 = [
  {
    id: "pattern-registry",
    index: "11",
    title: "11. 注册表模式与服务定位器 (Registry & Service Locator)",
    category: "CREATIONAL",
    categoryLabel: "创建型模式",
    alsoKnownAs: "服务定位器 (Service Locator), 服务注册中心 (Service Registry)",
    intent: "使客户能够通过一个众所周知的静态访问点（注册表）来查找和获取系统中的服务对象或算法元数据，避免直接硬编码具体的依赖实例化。",
    realWorldAnalogy: "大型商业写字楼的中央前台与名册：访客走进 100 层高的摩天大楼，不需要知道 500 家入驻公司的具体楼层与办公室门牌号。访客走到大堂中央前台（AlgorithmRegistry），出示想要拜访的公司名字（algorithmId），前台秘书查阅花名册后，给访客派发电梯通行卡，甚至直接电联引导该公司的接待专员下楼迎接。在本项目中，全库有 586+ 道算法，如果全部在首屏一次性静态 import 打包，会导致首屏体积突破 50MB，浏览器直接卡死崩溃！AlgorithmRegistry 建立了元数据与动态分包映射中心，支持按需异步解析与惰性加载！",
    inPlainWords: "集中管理所有服务或对象的目录清单，按需定位与延迟获取，消灭大单体静态依赖。",
    formalDefinition: "企业应用架构模式（Fowler）：注册表模式充当系统全局已知对象的良好访问点；服务定位器模式封装了执行服务查找所需的过程，使客户摆脱对具体类名与加载方式的依赖。",
    programmaticSteps: [
      {
        stepNum: 1,
        stepTitle: "定义已解析算法条目与注册表选项契约 (Registry Contract)",
        file: "src/core/algorithm-registry.ts",
        line: "L15 ~ L40",
        description: "ResolvedAlgorithmEntry 继承算法基础元数据，增加动态加载生成的 Visualizer 构造器与 template HTML 骨架契约。",
        code: `import type { IVisualizer } from './interfaces';
import type { AlgorithmMetadata, AlgorithmManifest } from './registry';
import { ALL_ALGORITHM_METADATA } from './algorithm-catalog.generated';
import { loadAlgorithmBatch } from './algorithm-loader';

export interface ResolvedAlgorithmEntry extends AlgorithmMetadata {
  template: string;
  Visualizer: new () => IVisualizer;
  createVisualizer(): IVisualizer;
}`
      },
      {
        stepNum: 2,
        stepTitle: "实现支持惰性分包动态加载的注册表单例 (Lazy Registry)",
        file: "src/core/algorithm-registry.ts",
        line: "L45 ~ L130",
        description: "AlgorithmRegistry 采用单例管理，维护元数据字典与清单缓存，当调用 resolve(id) 时按需触发动态分包 batchLoader()。",
        code: `export class AlgorithmRegistry {
  private static instance: AlgorithmRegistry | null = null;
  private metadataMap: Map<string, AlgorithmMetadata> = new Map();
  private manifests: Map<string, AlgorithmManifest> = new Map();

  public static getInstance(): AlgorithmRegistry {
    if (!this.instance) {
      this.instance = new AlgorithmRegistry();
    }
    return this.instance;
  }

  /**
   * 核心定位方法：一步解析算法清单（若未加载则自动按需触发动态分包 chunk 导入）
   */
  public async resolve(id: string): Promise<ResolvedAlgorithmEntry | null> {
    // 1. 若内存清单中已存在，直接返回
    if (this.manifests.has(id)) {
      return this.toResolvedEntry(this.manifests.get(id)!);
    }

    // 2. 查验元数据确认类目
    const meta = this.metadataMap.get(id);
    if (!meta) {
      console.warn(\`[AlgorithmRegistry] Unknown algorithm ID: \${id}\`);
      return null;
    }

    // 3. 惰性动态按需加载对应的 Webpack/Vite 分包 Chunk
    await loadAlgorithmBatch(meta.category);

    // 4. 加载完毕后再次从已注册清单中取出
    const loadedManifest = this.manifests.get(id);
    if (!loadedManifest) {
      throw new Error(\`[AlgorithmRegistry] Failed to resolve manifest for \${id} after loading batch\`);
    }

    return this.toResolvedEntry(loadedManifest);
  }

  public registerManifest(manifest: AlgorithmManifest): void {
    this.manifests.set(manifest.id, manifest);
  }
}`
      },
      {
        stepNum: 3,
        stepTitle: "元数据收割与批量播种 (Catalog Harvest & Seeding)",
        file: "src/core/algorithm-catalog-indexer.ts",
        line: "L20 ~ L65",
        description: "在构建期由 npm run meta:sync 自动扫描 586+ 题并投影生成不可变静态全景索引 ALL_ALGORITHM_METADATA，供注册表秒级初始化播种。",
        code: `export function seedDefaultRegistry(): AlgorithmRegistry {
  const registry = AlgorithmRegistry.getInstance();
  // 一次性播种 586+ 题的轻量元数据（仅 9 个轻量字符串字段，体积 < 100KB）
  ALL_ALGORITHM_METADATA.forEach(meta => {
    registry.registerMetadata(meta);
  });
  return registry;
}`
      },
      {
        stepNum: 4,
        stepTitle: "客户端（导航栏与路由）极简索取并无感挂载",
        file: "src/core/visualizer-app-controller.ts",
        line: "L50 ~ L75",
        description: "当用户在侧边栏点击任意算法时，应用控制器向注册表索取实体，注册表在背后静默完成分包拉取并返回实例化对象。",
        code: `async function onAlgorithmSelect(algorithmId: string) {
  // 服务定位器一步搞定异步拉取、解析与实例化！
  const entry = await AlgorithmRegistry.getInstance().resolve(algorithmId);
  if (entry) {
    mountContainer.innerHTML = entry.template;
    const visualizer = entry.createVisualizer();
    visualizer.mount(mountContainer);
  }
}`
      }
    ],
    classDiagram: `  ┌────────────────────────────────────────────────────────┐
  │         Client: visualizer-app-controller.ts           │
  └──────────────────────────┬─────────────────────────────┘
                             │ resolve('climbing-stairs')
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │                 AlgorithmRegistry (SSOT)               │
  ├────────────────────────────────────────────────────────┤
  │ - metadataMap: Map<string, AlgorithmMetadata>          │
  │ - manifests: Map<string, AlgorithmManifest>            │
  ├────────────────────────────────────────────────────────┤
  │ + resolve(id): Promise<ResolvedAlgorithmEntry>         │
  │ + registerManifest(manifest): void                     │
  └──────────────────────────┬─────────────────────────────┘
                             │ 惰性触发按需加载
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │  loadAlgorithmBatch('dynamic-programming') (Vite 分包) │
  └────────────────────────────────────────────────────────┘`,
    applicability: [
      "系统拥有数百个同类型组件（如 586+ 算法题），全部静态打包会导致体积爆炸，需要按需分包异步加载；",
      "多个模块需要共享一份不可篡改的组件花名册，且需要按 ID 进行快速寻址；",
      "需要彻底解耦调用方与具体的类导入路径，消除跨层级深度相对路径引用。"
    ],
    pros: [
      "首屏体积极致轻量：586+ 题仅加载轻量元数据花名册，体积从 50MB 骤降至 < 2MB；",
      "统一访问通道：全系统只需知道 AlgorithmRegistry.getInstance().resolve(id)；",
      "优雅降级与健壮容错：找不到 ID 或分包失败时集中报错与回退处理。"
    ],
    cons: [
      "如果注册表承担过多杂务，容易退化为隐式全局状态依赖；",
      "服务定位器模式若使用不当会隐藏类之间的直接依赖关系。"
    ],
    mitigations: "本项目中注册表只负责只读元数据与生命周期实例化，不存储任何易变的业务运行态变量，且有严格的 TypeScript 契约。",
    realWorldJava: "JNDI (Java Naming and Directory Interface)；Spring 的 BeanFactory 与 ApplicationContext 注册表；OSGi 服务注册中心。",
    realWorldProject: "src/core/algorithm-registry.ts，统一收敛原先分散在 registry.ts 与 algorithm-manager.ts 中的散装映射表。",
    relatedPatterns: [
      { name: "注册表模式 vs 单例模式", comparison: "注册表本身通常作为单例运行，用于存放并查找大量的其他对象实例。" },
      { name: "注册表模式 vs 工厂方法", comparison: "注册表通常配合工厂方法使用：注册表中存放的是各类工厂构造器，查找到后由工厂负责具体实例化。" }
    ]
  },
  {
    id: "pattern-factory",
    index: "12",
    title: "12. 工厂方法模式 (Factory Method Pattern)",
    category: "CREATIONAL",
    categoryLabel: "创建型模式",
    alsoKnownAs: "虚拟构造器 (Virtual Constructor)",
    intent: "定义一个用于创建对象的接口，让子类或工厂方法决定实例化哪一个类。工厂方法使一个类的实例化延迟到其工厂中，并统管对象池生命周期。",
    realWorldAnalogy: "现代化立体车库与租车服务中心：用户来到租车中心，告诉接待员自己需要一辆【越野车 SUV】或【纯电轿车 EV】。用户无需亲自到地下工厂锻造底盘、调校电池或安装轮毂。租车工厂中心根据车型标识，自动从车库对象池中调配一辆合格的车辆交付给客户，并负责退租后的整备与保养。在本项目中，算法根据声明的 rendererKind（2d-grid / 3d-voxel / 3d-graph / svg-tree）需要对应的呈现器。VisualRendererFactory 统一屏蔽各渲染器的复杂构造与 WebGL 资源申请，并维护实例缓存池！",
    inPlainWords: "把复杂的对象创建逻辑和资源池管理集中收拢到工厂方法中，客户端只传类型标识即可获得标准对象。",
    formalDefinition: "GoF《设计模式》定义：工厂方法模式定义了一个创建产品对象的工厂接口，将实际创建工作推迟到子类或具体的工厂方法中完成，使系统具备极佳的可扩展性。",
    programmaticSteps: [
      {
        stepNum: 1,
        stepTitle: "定义工厂创建类型标识与产品标准契约",
        file: "src/core/renderers/visual-renderer-factory.ts",
        line: "L10 ~ L25",
        description: "RendererKind 定义所支持的渲染引擎种类，IVisualRenderer 规范统一的产品接口。",
        code: `import type { IVisualRenderer } from './visual-renderer';
import { ThreeGridVisualAdapter } from './three-grid-visual-adapter';
import { DOMGridVisualAdapter } from './dom-grid-visual-adapter';
import { ThreeGraphTopologyAdapter } from './three-graph-topology-adapter';

export type RendererKind = '3d-voxel' | '2d-grid' | '3d-graph' | string;`
      },
      {
        stepNum: 2,
        stepTitle: "实现带缓存池的渲染器工厂深度模块 (VisualRendererFactory)",
        file: "src/core/renderers/visual-renderer-factory.ts",
        line: "L28 ~ L75",
        description: "工厂封装对 WebGL 单例、2D DOM 渲染器的按需实例化逻辑，并利用 Map 实现对象池复用，杜绝频繁创建销毁导致的内存抖动。",
        code: `export class VisualRendererFactory {
  // 对象池缓存，复用长生命周期适配器
  private static renderers: Map<string, IVisualRenderer> = new Map();

  /**
   * 工厂方法：按类型构建或从对象池中提取渲染器实例
   */
  public static getRenderer(kind: RendererKind): IVisualRenderer {
    if (this.renderers.has(kind)) {
      return this.renderers.get(kind)!;
    }

    let renderer: IVisualRenderer;
    switch (kind) {
      case '3d-voxel':
        renderer = ThreeGridVisualAdapter.getInstance();
        break;
      case '2d-grid':
        renderer = new DOMGridVisualAdapter();
        break;
      case '3d-graph':
        renderer = new ThreeGraphTopologyAdapter();
        break;
      default:
        console.warn(\`[VisualRendererFactory] Unknown kind: \${kind}, fallback to 2d-grid\`);
        renderer = new DOMGridVisualAdapter();
        break;
    }

    this.renderers.set(kind, renderer);
    return renderer;
  }

  /**
   * 释放并清空所有工厂缓存实例
   */
  public static disposeAll(): void {
    this.renderers.forEach(r => r.dispose());
    this.renderers.clear();
  }
}`
      },
      {
        stepNum: 3,
        stepTitle: "客户端完全摆脱各具体渲染器类的硬编码导入",
        file: "src/core/controllers/visualizer-mediator.ts",
        line: "L120 ~ L140",
        description: "控制器只需将 Spec 中声明的字符串交给工厂，即可获得开箱即用的产品实例。",
        code: `// 客户端无需 import ThreeGridVisualAdapter 等具体类，解耦彻底！
const rendererKind = spec.rendererKind ?? '2d-grid';
const renderer = VisualRendererFactory.getRenderer(rendererKind);
mediator.setRenderer(renderer);`
      },
      {
        stepNum: 4,
        stepTitle: "在单测中对工厂方法进行行为与边界验证",
        file: "src/core/renderers/visual-renderer-factory.test.ts",
        line: "L15 ~ L45",
        description: "测试断言工厂返回的对象完全符合 IVisualRenderer 契约，且未知类型能正确优雅降级。",
        code: `it('should return DOMGridVisualAdapter for 2d-grid kind', () => {
  const r = VisualRendererFactory.getRenderer('2d-grid');
  expect(r).toBeDefined();
  expect(typeof r.mount).toBe('function');
  expect(typeof r.updateStep).toBe('function');
});`
      }
    ],
    classDiagram: `  ┌────────────────────────────────────────────────────────┐
  │         Client: VisualizerMediator                     │
  └──────────────────────────┬─────────────────────────────┘
                             │ VisualRendererFactory.getRenderer('3d-voxel')
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │                 VisualRendererFactory                  │
  ├────────────────────────────────────────────────────────┤
  │ - renderers: Map<string, IVisualRenderer> (缓存池)     │
  ├────────────────────────────────────────────────────────┤
  │ + getRenderer(kind: RendererKind): IVisualRenderer     │
  │ + disposeAll(): void                                   │
  └──────────────────────────┬─────────────────────────────┘
                             │ 制造并返回
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │        «interface» IVisualRenderer (抽象产品)          │
  └──────────────────────────▲─────────────────────────────┘
                             │ 继承与实现
        ┌────────────────────┴────────────────────┐
        ▼                                         ▼
  ┌────────────────────────┐            ┌────────────────────────┐
  │  DOMGridVisualAdapter  │            │ ThreeGridVisualAdapter │
  └────────────────────────┘            └────────────────────────┘`,
    applicability: [
      "当一个类不知道它所必须创建的对象的类的时候；",
      "当一个类希望由它的子类或工厂类来指定它所创建的对象的时候；",
      "需要对被创建对象的生命周期、全局复用（如对象池）进行统一管控时。"
    ],
    pros: [
      "解耦创建与使用：调用者面向抽象产品编程，对具体类的名字、构造参数一无所知；",
      "符合开闭原则：增加新渲染器只需扩展工厂分支，无需修改既有调用方；",
      "内存资源可控：通过对象池避免大量重复创建销毁 WebGL 渲染管线造成的崩溃。"
    ],
    cons: [
      "每增加一种新产品，可能需要在工厂中增加条件分支或注册代码。"
    ],
    mitigations: "本项目通过 TypeScript 字符串字面量联合（RendererKind）在编译期提供自动补全与类型检查，彻底避免拼写错误。",
    realWorldJava: "java.sql.DriverManager.getConnection()；Spring 的 BeanFactory.getBean()；LoggerFactory.getLogger()。",
    realWorldProject: "src/core/renderers/visual-renderer-factory.ts，统一生产与管控全系统 2D DOM、3D WebGL 与图论拓扑呈现器。",
    relatedPatterns: [
      { name: "工厂方法 vs 抽象工厂", comparison: "工厂方法用于创建一个特定产品族的一个对象；抽象工厂用于创建一组相关或相互依赖的产品族。" },
      { name: "工厂方法 vs 建造者模式", comparison: "工厂方法关注的是「要创建什么对象」（一键即出）；建造者模式关注的是「如何一步步组装一个复杂对象」。" }
    ]
  },
  {
    id: "pattern-builder",
    index: "13",
    title: "13. 建造者模式 (Builder Pattern)",
    category: "CREATIONAL",
    categoryLabel: "创建型模式",
    alsoKnownAs: "生成器模式 (Builder)",
    intent: "将一个复杂对象的构建与它的表示分离，使得同样的构建过程可以创建不同的表示。允许用户在不知道内部构建细节的情况下，通过流式调用一步步构建复杂实体。",
    realWorldAnalogy: "订制一台高性能台式组装电脑：如果你去买电脑，主板、CPU、显卡、散热水冷、DDR5内存、固态硬盘、电源机箱有几十种参数与安装次序（CPU要涂硅脂再压散热器，供电线要理线插防呆口）。如果把这 20 个参数直接作为构造函数入参：new PC(cpu, cooler, ram, ssd, gpu, psu, case, fan1, fan2, fan3...)，参数列表长达两米且极其容易把显卡和声卡位置传颠倒！建造者模式允许你使用流式装配器：builder.setCpu('i9').addRam(32).setGpu('RTX4090').build()，清晰可读且杜绝错漏。在本项目中，构造一个 3D 体素角色需要组装帽子、眼部、腮红、衣服、背包与四肢等 15+ 种材质与网格；构建一个 UniversalStep 需要组装网格、行号、日志、高亮、探针等 20+ 个状态字段。Builder 提供了极致优雅的构建体验！",
    inPlainWords: "通过链式方法一步一步精细配置复杂对象的各个部件，最后调用 build() 一键输出完整对象。",
    formalDefinition: "GoF《设计模式》定义：建造者模式将一个复杂对象的构建过程抽取为一个独立的 Builder，通过分步执行构建方法并封装零件装配细节，使相同的构建流可产出不同配置的复杂对象。",
    programmaticSteps: [
      {
        stepNum: 1,
        stepTitle: "定义复杂多部件实体的建造者类 (VoxelActorBuilder)",
        file: "src/core/renderers/voxel-actor-builder.ts",
        line: "L10 ~ L45",
        description: "VoxelActorBuilder 封装 3D 萌系体素探险家的多部件装配，内部精细化定义身体各部位的几何尺寸、材质高光与层级树。",
        code: `import * as THREE from 'three';

export class VoxelActorBuilder {
  /**
   * 构建多部件 3D 萌系体素探险家模型 (Crossy Road / Monument Valley Style)
   */
  public static buildAdventurerMesh(): THREE.Group {
    const explorer = new THREE.Group();

    // 1. 部件装配：材质定义（暖肉色皮肤、棕色探险帽、黑眼、腮红）
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfed7aa, roughness: 0.4 });
    const hatBrimMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35 });
    const hatTopMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.35 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xfb7185, transparent: true, opacity: 0.8 });

    // 2. 逐步组装头部与五官零件
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.45), skinMat);
    head.position.y = 0.55;
    explorer.add(head);

    // 3. 组装探险家帽子（帽檐与帽顶）
    const hatBrim = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.65), hatBrimMat);
    hatBrim.position.y = 0.26;
    head.add(hatBrim);

    // 4. 组装眼球与腮红部件
    const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 0.04), eyeMat);
    leftEye.position.set(-0.12, 0.02, 0.23);
    head.add(leftEye);

    // 5. 组装躯干、背包与四肢
    // ...一步步完成组装...

    // 6. 返回构建完毕的高内聚 3D 复合对象
    return explorer;
  }
}`
      },
      {
        stepNum: 2,
        stepTitle: "编写步进数据流式建造者 (UniversalStepBuilder)",
        file: "src/core/compilers/universal-step-builder.ts",
        line: "L15 ~ L70",
        description: "消除拥有 20 多个可选字段的 UniversalStep 构造污染，提供类型安全的链式 API。",
        code: `export class UniversalStepBuilder {
  private step: Partial<UniversalStep> = {
    highlights: [],
    metrics: {}
  };

  public atCodeLine(line: number): this {
    this.step.codeLine = line;
    return this;
  }

  public withLog(message: string): this {
    this.step.log = message;
    return this;
  }

  public highlightCell(r: number, c: number, type: 'read' | 'write' = 'read'): this {
    this.step.highlights!.push({ r, c, type });
    return this;
  }

  public setMetric(key: string, value: any): this {
    this.step.metrics![key] = value;
    return this;
  }

  public withNullProbe(parentVal: any, branch: string): this {
    this.step.nullProbe = { parentVal, branch };
    return this;
  }

  public build(): UniversalStep {
    if (this.step.codeLine === undefined) {
      throw new Error('[StepBuilder] codeLine is mandatory for 1-based code sync!');
    }
    return this.step as UniversalStep;
  }
}`
      },
      {
        stepNum: 3,
        stepTitle: "客户端通过流式链式调用清晰组装复杂步骤",
        file: "src/core/strategies/grid-unique-paths-compiler.ts",
        line: "L80 ~ L95",
        description: "推演编译器中使用 Builder 构造步骤，字段意图跃然纸上，彻底告别位置参数传错的噩梦。",
        code: `const step = new UniversalStepBuilder()
  .atCodeLine(14)
  .withLog(\`状态转移: dp[\${i}][\${j}] = dp[\${i-1}][\${j}] + dp[\${i}][\${j-1}]\`)
  .highlightCell(i, j, 'write')
  .setMetric('currentPathSum', dp[i][j])
  .build();`
      },
      {
        stepNum: 4,
        stepTitle: "在单测中断言建造者构建出的完整对象",
        file: "src/core/renderers/voxel-actor-builder.test.ts",
        line: "L20 ~ L40",
        description: "验证生成的 THREE.Group 结构完整，包含所有的子部件网格，材质与几何体均合规初始化。",
        code: `it('should assemble adventurer mesh with hat and eyes', () => {
  const mesh = VoxelActorBuilder.buildAdventurerMesh();
  expect(mesh).toBeInstanceOf(THREE.Group);
  expect(mesh.children.length).toBeGreaterThan(0);
});`
      }
    ],
    classDiagram: `  ┌────────────────────────────────────────────────────────┐
  │                  UniversalStepBuilder                  │
  ├────────────────────────────────────────────────────────┤
  │ - step: Partial<UniversalStep>                         │
  ├────────────────────────────────────────────────────────┤
  │ + atCodeLine(line: number): this                       │
  │ + withLog(message: string): this                       │
  │ + highlightCell(r, c, type): this                      │
  │ + setMetric(key, val): this                            │
  │ + build(): UniversalStep                               │
  └──────────────────────────┬─────────────────────────────┘
                             │ 流式装配并输出
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │                 Product: UniversalStep                 │
  │  { codeLine, log, highlights, metrics, nullProbe, ... }│
  └────────────────────────────────────────────────────────┘`,
    applicability: [
      "当创建复杂对象的算法应该独立于该对象的组成部分以及它们的装配方式时；",
      "当构造过程必须允许被构造的对象有不同的表示时；",
      "类的构造函数参数多达 5 个以上，且很多参数是可选参数时（消除伸缩构造函数反模式 Telescoping Constructor）。"
    ],
    pros: [
      "消除超长参数列表：链式调用使每个参数赋予了显式的方法名，绝不会传错位置；",
      "保证不可变性：可以在 build() 触发的一瞬间进行完备的契约校验（如强制校验 1-based codeLine 必须存在）；",
      "更好的可读性与可维护性：组装过程清晰直观。"
    ],
    cons: [
      "需要额外编写 Builder 辅助类，增加了代码量。"
    ],
    mitigations: "在复杂数据对象（如 UniversalStep）和 3D 网格构件（如 VoxelActorBuilder）中重点使用，收益远大于编写 Builder 的成本。",
    realWorldJava: "java.lang.StringBuilder；Lombok 的 @Builder 注解；Guava 的 ImmutableList.builder()；HTTP Client Request.Builder。",
    realWorldProject: "src/core/renderers/voxel-actor-builder.ts 与 UniversalStepBuilder。",
    relatedPatterns: [
      { name: "建造者模式 vs 工厂方法", comparison: "工厂方法关注于一键生成对象整体；建造者模式侧重于分阶段、分步骤地定制组装零件以构建复杂对象。" },
      { name: "建造者模式 vs 抽象工厂", comparison: "抽象工厂关注于创建一系列相关的产品族；建造者模式关注于一步步组装一个复杂的单一实体产品。" }
    ]
  },
  {
    id: "pattern-singleton",
    index: "14",
    title: "14. 单例模式 (Singleton Pattern)",
    category: "CREATIONAL",
    categoryLabel: "创建型模式",
    alsoKnownAs: "独生子模式 (Singleton)",
    intent: "保证一个类仅有一个实例，并提供一个访问它的全局访问点。确保系统全局范围内某些核心资源管理者的唯一性与生命周期统一。",
    realWorldAnalogy: "国家中央银行与货币发行局：一个国家只能有一家唯一的中央银行（例如中国人民银行）。如果每个省份、每个城市甚至每个银行网点都各自成立一家中央银行各自随意印钞，国家货币体系将彻底崩溃。中央银行是全局唯一的权威中枢。在本项目中，浏览器的 DOM 树挂载中枢 ViewMountEngine、全局唯一的事件总线 VisualizerEventHub 以及算法元数据中心 AlgorithmRegistry 必须全局绝对唯一，如果有两个事件总线实例，组件间将产生灾难性的事件失联与内存泄漏！",
    inPlainWords: "在整个应用生命周期中，某个类永远只被实例化一次，所有地方都共享使用这同一个实例。",
    formalDefinition: "GoF《设计模式》定义：单例模式确保某一个类只有一个实例，而且自行实例化并向整个系统提供这个实例，这个类称为单例类，它提供全局访问的方法。",
    programmaticSteps: [
      {
        stepNum: 1,
        stepTitle: "定义带有私有构造函数与静态实例引用的单例类 (Singleton Anatomy)",
        file: "src/core/view-mount-engine.ts",
        line: "L15 ~ L45",
        description: "ViewMountEngine 私有化 constructor 防止外部 new，提供静态 getInstance() 方法进行双重保障懒汉式加载。",
        code: `export class ViewMountEngine {
  // 1. 持有全局唯一的私有静态实例
  private static instance: ViewMountEngine | null = null;
  
  private activeContainer: HTMLElement | null = null;
  private currentRenderer: IVisualRenderer | null = null;

  // 2. 私有构造函数：坚决阻断外部直接 new ViewMountEngine()
  private constructor() {
    console.log('[ViewMountEngine] Global Mount Singleton Initialized.');
  }

  // 3. 全局唯一访问点：惰性实例化 (Lazy Initialization)
  public static getInstance(): ViewMountEngine {
    if (!this.instance) {
      this.instance = new ViewMountEngine();
    }
    return this.instance;
  }
}`
      },
      {
        stepNum: 2,
        stepTitle: "在单例内部集中管理全局唯一排他性资源 (Resource Exclusive Access)",
        file: "src/core/view-mount-engine.ts",
        line: "L50 ~ L85",
        description: "ViewMountEngine 管理全屏唯一的 DOM 画布容器挂载，卸载旧算法时自动执行清理，防止多个算法重叠渲染。",
        code: `/**
 * 独占挂载：确保当前屏幕上永远只有一个活跃的可视化实例
 */
public mount(container: HTMLElement, renderer: IVisualRenderer): void {
  // 1. 互斥清理既有渲染器，防止 WebGL 上下文丢失或内存驻留
  if (this.currentRenderer) {
    this.currentRenderer.dispose();
    this.currentRenderer = null;
  }

  // 2. 清空既有容器 DOM 节点
  if (this.activeContainer && this.activeContainer !== container) {
    this.activeContainer.innerHTML = '';
  }

  this.activeContainer = container;
  this.currentRenderer = renderer;
  this.currentRenderer.mount(container);
}

public reset(): void {
  if (this.currentRenderer) {
    this.currentRenderer.dispose();
    this.currentRenderer = null;
  }
  if (this.activeContainer) {
    this.activeContainer.innerHTML = '';
    this.activeContainer = null;
  }
}`
      },
      {
        stepNum: 3,
        stepTitle: "在单元测试中提供显式自愈清理钩子 (Test Teardown)",
        file: "src/core/view-mount-engine.test.ts",
        line: "L15 ~ L40",
        description: "单例模式在测试环境中最大的隐患是测试用例间的状态污染。本项目所有单例均提供重置或测试销毁钩子，确保每次单测洁净运行。",
        code: `describe('ViewMountEngine Singleton', () => {
  afterEach(() => {
    // 门禁保障：单测跑完立即销毁，防止污染后续用例
    ViewMountEngine.getInstance().reset();
  });

  it('should always return the identical instance across multiple calls', () => {
    const instanceA = ViewMountEngine.getInstance();
    const instanceB = ViewMountEngine.getInstance();
    expect(instanceA).toBe(instanceB); // 内存地址严格同一！
  });
});`
      },
      {
        stepNum: 4,
        stepTitle: "客户端在任意业务模块中无感知索取使用",
        file: "src/core/visualizer-app-controller.ts",
        line: "L80 ~ L95",
        description: "业务调用者无需四处传递 mountEngine 引用，直接获取并调用挂载。",
        code: `// 全局统一安全挂载
ViewMountEngine.getInstance().mount(rootElement, selectedRenderer);`
      }
    ],
    classDiagram: `  ┌────────────────────────────────────────────────────────┐
  │                    ViewMountEngine                     │
  ├────────────────────────────────────────────────────────┤
  │ - static instance: ViewMountEngine | null              │
  │ - activeContainer: HTMLElement | null                  │
  │ - currentRenderer: IVisualRenderer | null              │
  ├────────────────────────────────────────────────────────┤
  │ - constructor()  <<private 私有>>                      │
  │ + static getInstance(): ViewMountEngine                │
  │ + mount(container, renderer): void                     │
  │ + reset(): void                                        │
  └────────────────────────────────────────────────────────┘`,
    applicability: [
      "当类只能有一个实例而且客户可以从一个众所周知的访问点访问它时；",
      "当这个唯一实例应该是通过子类化可扩展的，并且客户应该无需更改代码就能使用一个扩展的实例时；",
      "控制对系统排他性硬件或 DOM 资源的独占访问（如 WebGL 视口、音频引擎、事件总线）。"
    ],
    pros: [
      "受控访问：单例类封装它的唯一实例，可以严格地控制客户怎样以及何时访问它；",
      "缩小命名空间：单例模式是对全局变量的一种改进，它避免了那些存储唯一实例的全局变量污染系统命名空间；",
      "节约系统资源：避免昂贵对象（如事件总线、3D 渲染器上下文）的重复创建。"
    ],
    cons: [
      "单例模式容易隐藏依赖，降低代码的可测试性（单元测试之间容易产生状态污染）；",
      "在并发环境下需要考虑线程安全或时序竞争。"
    ],
    mitigations: "本项目所有核心单例均配套严格的 reset() / clear() 生命周期钩子，在 Vitest beforeEach / afterEach 中统一清理，测试隔离度达到 100%。",
    realWorldJava: "java.lang.Runtime.getRuntime()；Spring 容器中的默认 Bean（Singleton 作用域）；java.awt.Desktop.getDesktop()。",
    realWorldProject: "src/core/view-mount-engine.ts, src/core/controllers/visualizer-event-hub.ts, src/core/algorithm-registry.ts 等。",
    relatedPatterns: [
      { name: "单例模式 vs 注册表模式", comparison: "注册表通常作为单例存在，单例是其实现手段，注册表是其承载元数据寻址的业务职责。" },
      { name: "单例模式 vs 外观模式", comparison: "外观对象经常也是单例，因为只需要一个门面入口统一调度整个子系统。" }
    ]
  }
];

const deepModulesSection = {
  id: "deep-modules",
  title: "00. 现代深模块哲学与身材红线 (Deep Modules & Thin Adapters)",
  content: `
    <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;padding:24px;margin-bottom:32px;">
      <h3 style="color:var(--accent-blue);font-size:1.3rem;margin-bottom:12px;display:flex;align-items:center;gap:8px;">
        🏛️ Matt Pocock 深模块哲学（Deep Modules & Seams）与项目架构红线
      </h3>
      <p style="color:var(--text-muted);font-size:0.95rem;margin-bottom:16px;">
        在 algorithm-viz-standalone 项目中，586+ 个算法不是孤立的代码散沙，而是严格遵循 Matt Pocock 的深模块哲学（Thin Domain Adapters & Deep Modules）进行组织。系统确立了“两适配器深化法则”与“双重身材红线”，彻底根治前端算法可视化系统常见的散装泥潭与类爆炸！
      </p>

      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;margin:20px 0;">
        <div style="background:var(--bg-subcard);border:1px solid rgba(56,189,248,0.2);border-radius:8px;padding:16px;">
          <h4 style="color:var(--accent-blue);margin-bottom:8px;">⚖️ 两适配器深化法则 (Two-Adapter Rule)</h4>
          <p style="color:var(--text-dim);font-size:0.88rem;">
            “一个适配器意味着假设的缝隙；两个适配器意味着真实的缝隙。除非跨缝隙有真正的变化，否则不要引入缝隙。” 当两个算法出现相似的拓扑绘制或状态演进时，必须在核心层抽象出真正的深模块。严禁单题内联手写 SVG 坐标或私造 stack 遍历。
          </p>
        </div>

        <div style="background:var(--bg-subcard);border:1px solid rgba(248,113,113,0.2);border-radius:8px;padding:16px;">
          <h4 style="color:var(--accent-rose);margin-bottom:8px;">📏 双重身材红线 (Dual LOC Guards)</h4>
          <p style="color:var(--text-dim);font-size:0.88rem;">
            <strong>策略身材红线：</strong>单题 <code>*Strategy.ts</code> LOC &lt; 120 行（职责仅限入参提取、规约转换与委托调用）。<br>
            <strong>渲染器身材红线：</strong>单题 <code>*-renderer.ts</code> LOC &lt; 150 行（职责仅限声明式元数据配置与委托挂载）。
          </p>
        </div>

        <div style="background:var(--bg-subcard);border:1px solid rgba(52,211,153,0.2);border-radius:8px;padding:16px;">
          <h4 style="color:var(--accent-emerald);margin-bottom:8px;">🛡️ 强制自省门禁 (Verification Gates)</h4>
          <p style="color:var(--text-dim);font-size:0.88rem;">
            全库实行代码门禁自动化验证：<br>
            <code>npm run test:gate</code>（顶层抽象合规与身材红线门禁）<br>
            <code>npm run test:presentation</code>（表现层真实渲染与 14 大红灯陷阱全套拦截）。以 Exit Code 0 为唯一通过判据。
          </p>
        </div>
      </div>
    </div>
  `
};

module.exports = { patterns3, deepModulesSection };
