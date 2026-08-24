/**
 * 可视化器作用域上下文（可选）
 */
export interface VisualizerContext {
  algorithmId: string;
  viewId: string;
  root: HTMLElement;
  /** 返回算法选择器的回调，替代全局 window.backToAlgorithmSelector */
  navigateBack?: () => void;
}

/**
 * 可视化器接口
 * 所有算法可视化器都需要实现此接口
 */

export interface IVisualizer {
  /**
   * 初始化可视化器
   * @param context 可选的作用域上下文，用于安全查询 DOM
   */
  init(context?: VisualizerContext): Promise<void>;

  /**
   * 暂停动画
   */
  pause?(): void;

  /**
   * 销毁可视化器，清理资源
   */
  destroy?(): void;
}

/** 单个变量的快照 */
export interface StepVar {
  /** 变量名，如 "i", "path", "sum" */
  name: string;
  /** 显示值，如 "3", "[2, 3]" */
  value: string;
  /** 值类型，用于着色 */
  type?: 'number' | 'array' | 'string' | 'boolean';
  /** 本步是否刚变化，用于闪烁动画 */
  changed?: boolean;
}

/**
 * 算法步进执行模式
 * - 'two-phase': 两阶段模式（先停 if 比较，再进分支转移）[默认推荐]
 * - 'compact': 快速状态级（每格一步直接转移）
 * - 'line-by-line': 严格单步逐行（for循环头 -> if判断 -> 分支转移）
 */
export type ExecutionStepMode = 'two-phase' | 'compact' | 'line-by-line';

export const STEP_MODE_KEY = 'algo_execution_step_mode';

export function getSavedStepMode(): ExecutionStepMode {
  try {
    const saved = localStorage.getItem(STEP_MODE_KEY);
    if (saved === 'two-phase' || saved === 'compact' || saved === 'line-by-line') {
      return saved;
    }
  } catch {}
  return 'two-phase';
}

export function saveStepMode(mode: ExecutionStepMode): void {
  try {
    localStorage.setItem(STEP_MODE_KEY, mode);
  } catch {}
}

/**
 * 动态规划教学视口模式
 * - 'staircase': 🪜 立体物理台阶与动态跳跃轨迹视口
 * - 'thematic': 🌟 全专题物理实景动画视口（机械背包/储钱罐/网格探险/街景神偷/K线操盘/能量棒）
 * - 'workshop': 🎭 实体卡片变形工作台（3D 物理微动作动画）
 * - 'story': 📖 白话图解剧场（大白话情景卡片与三路分支决策条）
 * - 'backtrack': 🎮 路径回溯探索（最优编辑路径逆向光点与交互时间轴）
 * - 'matrix': 📊 经典 2D DP 表格与推导树
 */
export type DpViewportMode = 'staircase' | 'thematic' | 'workshop' | 'story' | 'backtrack' | 'matrix';

export const DP_VIEWPORT_KEY = 'algo_dp_preferred_viewport';

export function getSavedViewportMode(): DpViewportMode {
  try {
    const saved = localStorage.getItem(DP_VIEWPORT_KEY);
    if (saved === 'thematic' || saved === 'workshop' || saved === 'story' || saved === 'backtrack' || saved === 'matrix') {
      return saved;
    }
  } catch {
    // ignore
  }
  return 'workshop';
}

export function saveViewportMode(mode: DpViewportMode): void {
  try {
    localStorage.setItem(DP_VIEWPORT_KEY, mode);
  } catch {}
}

/**
 * 结构化动作元数据
 */
export interface DpActionMeta {
  type: 'match' | 'delete' | 'insert' | 'replace' | 'cond' | 'init' | 'done';
  charA?: string;
  charB?: string;
  indexA?: number;
  indexB?: number;
  cost?: number;
  /** 当前阶段变换后的中间字符串预览 */
  intermediate?: string;
  /** 描述文字 */
  desc?: string;
}

/**
 * 白话图解剧场元数据
 */
export interface DpStoryMeta {
  /** 当前小目标 */
  goal: string;
  /** 候选决策分支（如三路/两路对比） */
  candidates: Array<{
    name: string;
    formula: string;
    cost: number | string;
    desc: string;
    isChosen: boolean;
    icon?: string;
  }>;
  /** 决策推导结论 */
  conclusion: string;
  /** 胜出方案名称 */
  winnerName?: string;
}

/**
 * 路径回溯单步节点
 */
export interface DpBacktrackStep {
  i: number;
  j: number;
  action: 'match' | 'delete' | 'insert' | 'replace' | 'keep' | 'take' | 'not-take' | 'start';
  charA?: string;
  charB?: string;
  cost: number;
  desc: string;
  title?: string;
  badge?: string;
  badgeClass?: string;
  /** 对应可视化推导步骤在 steps 数组中的索引，用于点击直接跳转 */
  stepIndex?: number;
}

/**
 * 声明式 YAML 算法模型规范契约 (YAML Algorithm Model Spec Schema)
 */
export interface IYamlBranchDef {
  name: string;
  delta: [number, number];
  label: string;
  codeVar?: string;
  arrow?: string;
}

export interface IYamlDirectionDef {
  label: string;
  start?: [number, number];
  target?: [number, number];
  startFormula?: string;
  targetFormula?: string;
  branches: IYamlBranchDef[];
  combineFormula?: string;
}

export interface IYamlCodeSnippet {
  title: string;
  source: string;
}

export interface IYamlStageVariant {
  variantLabel?: string;
  title: { forward: string; reverse: string } | string;
  code: {
    forward?: IYamlCodeSnippet;
    reverse?: IYamlCodeSnippet;
  };
}

export interface IYamlStageSpec {
  type: 'recursion' | 'memoization' | 'tabulation-2d' | 'space-optimized-1d' | 'sequence-dp' | 'knapsack-dp';
  shortName?: string;
  timeBadge?: string;
  badgeBg?: string;
  name: { forward: string; reverse: string } | string;
  desc: { forward: string; reverse: string } | string;
  card2Title?: { forward: string; reverse: string } | string;
  card2Desc?: { forward: string; reverse: string } | string;
  code?: {
    forward?: IYamlCodeSnippet;
    reverse?: IYamlCodeSnippet;
  };
  variants?: Record<string, IYamlStageVariant>;
}

export interface IYamlAlgorithmModel {
  id: string;
  name: string;
  nameEn?: string;
  category: string;
  icon?: string;
  difficulty?: number | string;
  levelOrder?: number;
  learningGoal?: string;
  description?: string;
  defaultStage?: string;
  defaultParams?: Record<string, any>;
  directions: {
    forward: IYamlDirectionDef;
    reverse: IYamlDirectionDef;
    [key: string]: IYamlDirectionDef;
  };
  stages: {
    'stage-1': IYamlStageSpec;
    'stage-2': IYamlStageSpec;
    'stage-3': IYamlStageSpec;
    'stage-4': IYamlStageSpec;
    [key: string]: IYamlStageSpec;
  };
}

