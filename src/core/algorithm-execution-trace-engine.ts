/**
 * AlgorithmExecutionTraceEngine (算法无头执行与轨迹录制编译引擎)
 *
 * 核心设计与深模块契约：
 * 1. 100% 零 DOM / 零 UI 依赖：纯函数式、内存级算法单步生成与录制。
 * 2. 自动多语言行号编译绑定：通过 CodeStepIndexer 在编译期将 @step:anchor 自动映射为 4 语种物理行号。
 * 3. 结构化不可变快照：底层自动对 vars、graph、matrix 状态进行深克隆防御，杜绝引用泄露与时序竞态。
 * 4. 高杠杆领域原语支持：内置针对图论（节点、流管、残量）与矩阵（单元格、依赖前驱、滚动压缩）的标准化语义原语。
 */

import { CodeStepIndexer, CodeAnchorTarget } from './code-step-indexer';

export interface GraphTraceState {
  activeNodes?: Array<string | number>;
  visitedNodes?: Array<string | number>;
  highlightNodes?: Array<string | number>;
  activeEdges?: Array<string>;
  visitedEdges?: Array<string>;
  edgeWeights?: Record<string, string | number>;
  flowMeta?: Record<string, any>;
  custom?: Record<string, any>;
}

export interface MatrixTraceState {
  activeCell?: { r: number; c: number };
  depCells?: Array<{ r: number; c: number }>;
  currentVal?: any;
  grid?: any[][];
  vector1D?: any[];
  custom?: Record<string, any>;
}

export interface TraceStepPayload<TVars = Record<string, any>> {
  /** 语义锚点标识（如 '@step:relax' 或 'relax'） */
  anchor?: string;
  /** 手动指定或覆盖的多语言行号映射字典 */
  codeLine?: Record<string, number | number[]>;
  /** 单步实时语义解说消息（支持纯文本或简易 HTML 标签） */
  message?: string;
  /** 单步执行控制台日志行 */
  log?: string;
  /** 当前算法核心变量快照（如 { u: 1, v: 2, dist: 5 }） */
  vars?: TVars;
  /** 图论沙盘拓扑领域状态快照 */
  graph?: GraphTraceState;
  /** 矩阵/动态规划状态空间领域快照 */
  matrix?: MatrixTraceState;
  /** 顶栏/看板专属指标数值字典 */
  metrics?: Record<string, any>;
  /** 算法专属自定义元数据 */
  custom?: Record<string, any>;
  /** 步骤类型标记（如 'entry' | 'traverse' | 'relax' | 'return'） */
  type?: string;
}

export interface AlgorithmTraceStep<TVars = Record<string, any>> extends TraceStepPayload<TVars> {
  /** 1-based 物理步骤序号 */
  stepIndex: number;
  /** 0-based 步骤索引 */
  index: number;
  /** 自动编译对齐的 4 语种真实物理行号字典 */
  codeLinesByLang: Record<string, number | number[]>;
}

export interface TraceRecorder<TVars = Record<string, any>> {
  /** 记录一个原子执行单步 */
  step(payload: TraceStepPayload<TVars>): void;
  /** 获取当前已录制的单步总数 */
  getStepCount(): number;
  /** 获取最后一步的只读快照 */
  getLastStep(): Readonly<AlgorithmTraceStep<TVars>> | undefined;
}

export interface TraceEngineOptions {
  /** 多语言带锚点源码模板字典（如 { java: [...], python: [...] }） */
  codeLanguages?: Record<string, string[]>;
  /** 算法或阶段唯一标识（用于 CodeStepIndexer 缓存） */
  specKey?: string;
  /** 自定义静态锚点映射表（用于直接注入覆盖） */
  anchorMap?: Record<string, Record<string, number | number[]>>;
}

/** 辅助深克隆工具，优先使用原生 structuredClone，降级使用 JSON 序列化 */
function deepClone<T>(val: T): T {
  if (val === undefined || val === null || typeof val !== 'object') {
    return val;
  }
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(val);
    } catch {
      // 回退到 JSON 克隆
    }
  }
  try {
    return JSON.parse(JSON.stringify(val));
  } catch {
    return val;
  }
}

export class AlgorithmExecutionTraceEngine {
  /**
   * 运行算法逻辑并编译生成完整不可变的执行轨迹流 (Trace Steps)
   *
   * @param runner 纯算法推导执行闭包，接受录制器 recorder 进行单步记录
   * @param options 源码模板与锚点编译选项
   */
  public static trace<TVars = Record<string, any>>(
    runner: (recorder: TraceRecorder<TVars>) => void,
    options: TraceEngineOptions = {}
  ): AlgorithmTraceStep<TVars>[] {
    const steps: AlgorithmTraceStep<TVars>[] = [];
    const indexer = CodeStepIndexer.getInstance();

    // 1. 预先解析并编译多语言代码锚点索引表
    let compiledAnchors: Record<string, Record<string, CodeAnchorTarget>> = {};
    const defaultLangs = ['java', 'cpp', 'python', 'javascript'];

    if (options.codeLanguages) {
      const key = options.specKey || `trace-temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const compiled = indexer.register(key, options.codeLanguages);
      compiledAnchors = compiled.anchorIndex;
    }

    // 2. 构建高效流式记录器实景
    const recorder: TraceRecorder<TVars> = {
      step(payload: TraceStepPayload<TVars>): void {
        const index = steps.length;
        const stepIndex = index + 1;

        // 2.1 自动计算 4 语种物理行号映射
        const codeLinesByLang: Record<string, number | number[]> = {};

        // 先采用手动注入的 codeLine
        if (payload.codeLine) {
          Object.assign(codeLinesByLang, payload.codeLine);
        }

        // 统一归一化锚点名称（去除 '@step:' 前缀）
        const rawAnchor = payload.anchor?.trim();
        const cleanAnchor = rawAnchor?.startsWith('@step:') ? rawAnchor.slice(6) : rawAnchor;

        if (cleanAnchor) {
          // 优先从自定义 anchorMap 查询
          if (options.anchorMap) {
            for (const lang of defaultLangs) {
              const langMap = options.anchorMap[lang];
              if (langMap && langMap[cleanAnchor] !== undefined) {
                codeLinesByLang[lang] = langMap[cleanAnchor];
              }
            }
          }

          // 再从 CodeStepIndexer 编译的索引中解析
          for (const [lang, anchors] of Object.entries(compiledAnchors)) {
            if (codeLinesByLang[lang] === undefined) {
              const target = anchors[cleanAnchor];
              if (target) {
                codeLinesByLang[lang] = target.primary;
              }
            }
          }
        }

        // 2.2 构建深克隆且不可变的状态切片
        const stepRecord: AlgorithmTraceStep<TVars> = {
          stepIndex,
          index,
          anchor: cleanAnchor || rawAnchor,
          type: payload.type,
          message: payload.message || '',
          log: payload.log || payload.message || '',
          codeLine: Object.keys(codeLinesByLang).length > 0 ? codeLinesByLang : payload.codeLine,
          codeLinesByLang,
          vars: deepClone(payload.vars) as TVars,
          graph: deepClone(payload.graph),
          matrix: deepClone(payload.matrix),
          metrics: deepClone(payload.metrics),
          custom: deepClone(payload.custom),
        };

        steps.push(stepRecord);
      },

      getStepCount(): number {
        return steps.length;
      },

      getLastStep(): Readonly<AlgorithmTraceStep<TVars>> | undefined {
        return steps.length > 0 ? steps[steps.length - 1] : undefined;
      },
    };

    // 3. 执行算法逻辑闭包
    runner(recorder);

    return steps;
  }

  /**
   * 工具方法：清洗多语言源码模板中的 @step: 锚点标签，输出用于终端展示的干净代码
   */
  public static cleanCode(codeLanguages: Record<string, string[]>): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    const indexer = CodeStepIndexer.getInstance();
    for (const [lang, lines] of Object.entries(codeLanguages)) {
      result[lang] = indexer.stripAnchors(lines);
    }
    return result;
  }
}
