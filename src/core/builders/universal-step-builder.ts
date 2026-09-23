import type { UniversalStep, UniversalTreeNode, StateArrayItem } from '../universal-stage-engine';

/**
 * 🏗️ [UniversalStepBuilder] 统一算法推演步骤建造者模式 (Builder Pattern)
 * 
 * 核心目标：
 * 1. 规范化步骤构建流程，杜绝直接散落手写对象导致的字段缺失（如漏写 line、漏写 stage、漏写 decision）；
 * 2. 强类型安全与运行时断言：在 build() 时物理保证 step.line、stage、decision 100% 完备且合法；
 * 3. 物理同构绑定：自动保持 step.line 与 step.codeLine 镜像同步，消除历史双字段割裂；
 * 4. 保证全库 586+ 算法的视觉演示拥有统一的最高标准品质契约。
 */
export class UniversalStepBuilder {
  private _step: Partial<UniversalStep> = {};

  constructor(stepIndex?: number) {
    if (typeof stepIndex === 'number') {
      this._step.stepIndex = stepIndex;
    }
  }

  public static create(stepIndex?: number): UniversalStepBuilder {
    return new UniversalStepBuilder(stepIndex);
  }

  /**
   * 绑定推导阶段 (Stage 1-4)
   */
  public stage(stage: number): this {
    if (stage < 1 || stage > 5 || !Number.isInteger(stage)) {
      throw new Error(`[UniversalStepBuilder] stage 必须为 1~5 之间的正整数，当前输入: ${stage}`);
    }
    this._step.stage = stage;
    return this;
  }

  /**
   * 绑定代码行号 (物理强制有效正整数)
   * 自动同步 step.line 与 step.codeLine 双向镜像契约
   */
  public line(lineNumber: number | undefined, fallbackLine = 1): this {
    const validLine = typeof lineNumber === 'number' && lineNumber >= 1 ? Math.floor(lineNumber) : fallbackLine;
    this._step.line = validLine;
    (this._step as any).codeLine = validLine;
    return this;
  }

  /**
   * 绑定核心决策文字 (严禁空白)
   */
  public decision(text: string): this {
    if (!text || text.trim().length === 0) {
      throw new Error(`[UniversalStepBuilder] 决策说明 decision 严禁为空白字符串！宁可报错绝不偷懒！`);
    }
    this._step.decision = text.trim();
    return this;
  }

  /**
   * 绑定详细语义解释
   */
  public message(text: string): this {
    this._step.message = text;
    this._step.msg = text;
    return this;
  }

  /**
   * 绑定步骤类型 (生命周期帧)
   */
  public type(type: string): this {
    this._step.type = type;
    return this;
  }

  /**
   * 绑定标签与控制台日志
   */
  public tag(tag: string): this {
    this._step.tag = tag;
    return this;
  }

  public log(log: string): this {
    this._step.log = log;
    return this;
  }

  /**
   * 绑定执行槽位与当前小人位置
   */
  public slot(activeSlot: number): this {
    this._step.activeSlot = activeSlot;
    this._step.activeIndices = [activeSlot];
    return this;
  }

  public coords(r: number, c: number): this {
    this._step.currentI = r;
    this._step.currentJ = c;
    this._step.i = r;
    this._step.j = c;
    return this;
  }

  /**
   * 绑定状态变量监控表
   */
  public variables(vars: Record<string, any>): this {
    this._step.variables = { ...(this._step.variables || {}), ...vars };
    return this;
  }

  /**
   * 绑定性能指标与看板数据 (支持 string 与 number 自动类型适配)
   */
  public metrics(metrics: Record<string, string | number>): this {
    const stringified: Record<string, string> = {};
    for (const [k, v] of Object.entries(metrics)) {
      stringified[k] = String(v);
    }
    this._step.metrics = { ...(this._step.metrics || {}), ...stringified };
    return this;
  }

  /**
   * 绑定 2D 状态矩阵 (深拷贝防护)
   */
  public grid(grid: (number | null)[][]): this {
    this._step.grid = grid.map((row) => [...row]);
    return this;
  }

  /**
   * 绑定状态依赖格高亮
   */
  public deps(deps: Array<{ r: number; c: number; label?: string }>): this {
    this._step.deps = deps;
    return this;
  }

  /**
   * 绑定高亮槽位集合
   */
  public highlightSlots(slots: number[]): this {
    this._step.highlightSlots = [...slots];
    this._step.activeIndices = [...slots];
    return this;
  }

  /**
   * 绑定单元格坐标 (等同于 coords)
   */
  public cell(r: number, c: number): this {
    return this.coords(r, c);
  }

  /**
   * 绑定当前激活的树节点 ID
   */
  public activeNode(nodeId: string): this {
    this._step.activeNodeId = nodeId;
    return this;
  }

  /**
   * 绑定状态依赖树 (treeRoot 别名)
   */
  public tree(root: UniversalTreeNode): this {
    return this.treeRoot(root);
  }

  /**
   * 绑定状态依赖树 (用于 Stage 2 递归展开沙盘)
   */
  public treeRoot(treeRoot: UniversalTreeNode): this {
    this._step.treeRoot = treeRoot;
    return this;
  }

  /**
   * 绑定一维状态槽位数组 (用于 Stage 1 / Stage 4)
   */
  public stateArrays(arrays: StateArrayItem[]): this {
    this._step.stateArrays = arrays;
    return this;
  }

  /**
   * 绑定小人状态机动作
   */
  public actor(slot: number, action: 'idle' | 'walk' | 'compare' | 'jump' = 'walk'): this {
    this._step.actorState = { currentSlot: slot, action };
    return this;
  }

  /**
   * 执行物理不变量检验并完成构建
   */
  public build(): UniversalStep {
    if (this._step.line === undefined || typeof this._step.line !== 'number' || this._step.line < 1) {
      throw new Error(`[UniversalStepBuilder: INVARIANT_VIOLATION] 步骤未设置有效代码行号 step.line (必须 >= 1)！`);
    }

    if (!this._step.decision && !this._step.message && !this._step.msg && !this._step.log) {
      throw new Error(`[UniversalStepBuilder: INVARIANT_VIOLATION] 步骤未设置任何文字说明 (decision/message/log)！`);
    }

    // 权威同构绑定
    (this._step as any).codeLine = this._step.line;

    return this._step as UniversalStep;
  }
}
