/**
 * 动态规划引擎类型契约 (DpEngine Types)
 * 领域深模块：AlgorithmSpec / DpTraceStep / DpTreeNode 等纯类型契约，
 * 不与任何渲染器或浏览器上下文耦合。
 */

import type { KeyPointsData, HighlightTarget } from '../code-panel';

export type DpCell = any;

export interface DpTreeNode {
  id: number | string;
  val?: number | string;
  value?: any;
  left?: DpTreeNode | null;
  right?: DpTreeNode | null;
  children?: DpTreeNode[];
  /** 边上的决策标注，如 "✓ A" 或 "✗ A" */
  edgeLabel?: string;
  label?: string;
  /** 节点形状: 'circle' (默认) | 'rect' (矩形决策块 i/cap) */
  shape?: 'circle' | 'rect';
  /** 节点底部的辅助数值/价值 */
  subVal?: string | number;
  /** 后序 DP 或状态推导计算出的文本 */
  tag?: string;
  /** 节点状态: 'current' | 'dependency' | 'visited' | 'selected' | 'normal' */
  status?: 'current' | 'dependency' | 'visited' | 'selected' | 'normal' | string;
  [key: string]: any;
}

export type LanguageKey = 'java' | 'cpp' | 'python' | 'javascript';

export interface SemanticLineMap {
  /** 函数入口行 (Java Line 2, JS Line 1...) */
  entry: number | number[] | Record<LanguageKey, number | number[]>;
  /** 边界特判或前置条件 */
  guard?: number | number[] | Record<LanguageKey, number | number[]>;
  /** 初始化状态行 */
  init: number | number[] | Record<LanguageKey, number | number[]>;
  /** 外层循环条件判断行 */
  loopCheck?: number | number[] | Record<LanguageKey, number | number[]>;
  /** 内层循环条件判断行 */
  innerLoopCheck?: number | number[] | Record<LanguageKey, number | number[]>;
  /** 状态转移计算行 */
  stateTransfer: number | number[] | Record<LanguageKey, number | number[] | { primary: number | number[]; context?: number | number[] }>;
  /** 循环终止跳出行 */
  loopExit?: number | number[] | Record<LanguageKey, number | number[]>;
  /** 结果返回行 */
  returnResult: number | number[] | Record<LanguageKey, number | number[]>;
}

export interface DpVarItem {
  name: string;
  value: string;
  type?: 'number' | 'string' | 'array';
  changed?: boolean;
}

export interface DpTraceStep {
  dp1d?: DpCell[];
  dp2d?: DpCell[][];
  tree?: DpTreeNode | null;
  current?: { row?: number; col?: number; index?: number };
  dependencies?: Array<{ row?: number; col?: number; index?: number }>;
  message?: string;
  description?: string;
  log?: string;
  formula?: string;
  formulaSubstituted?: string;
  actionMeta?: any;
  storyMeta?: any;
  backtrackPath?: any[];
  thematicMeta?: any;
  metrics?: Record<string, any>;
  vars?: DpVarItem[];
  codeLine?: HighlightTarget;
  line?: number | number[];
  phase?: string;
  source?: string[];
  target?: string[];
  staircase?: {
    totalSteps: number;
    costs?: number[];
    dp: DpCell[];
    currentStep?: number;
    fromSteps?: number[];
    bestFromStep?: number;
    characterPosition?: number;
    isGoal?: boolean;
  };
  [key: string]: any;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ProblemDetail {
  title?: string;
  leetcodeId?: number;
  leetcodeUrl?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  description: string;
  inputDesc?: string;
  outputDesc?: string;
  examples?: ProblemExample[];
  constraints?: string[];
}

export interface DpKeyPointsStructure {
  thinking?: string;
  state?: string;
  equation?: string;
  initAndBounds?: string;
  complexity?: string;
  [key: string]: any;
}

export interface AlgorithmCodeDefinition {
  languages: Record<LanguageKey, string[]>;
  lineExplanations?: Record<LanguageKey, Record<number, string>>;
  keyPoints?: KeyPointsData | DpKeyPointsStructure;
  faqList?: Array<{ tag: string; question: string; answer: string }>;
}

export interface AlgorithmSpec {
  id: string;
  name: string;
  category: string;
  description: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  problem: ProblemDetail;
  code: AlgorithmCodeDefinition;
  semanticLines: SemanticLineMap;
  generateSteps: (input: any) => DpTraceStep[];
}
