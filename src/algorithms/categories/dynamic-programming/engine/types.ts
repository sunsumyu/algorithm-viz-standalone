import type { KeyPointsData, HighlightTarget } from '../../../../core/code-panel';
import type { DpTreeNode, DpCell } from '../dp-demo-visualizer';

export type { DpTreeNode, DpCell };

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
  message: string;
  log?: string;
  formula?: string;
  formulaSubstituted?: string;
  actionMeta?: any;
  storyMeta?: any;
  backtrackPath?: any[];
  thematicMeta?: any;
  metrics?: Record<string, string | number>;
  vars?: DpVarItem[];
  codeLine?: HighlightTarget;
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

export interface AlgorithmCodeDefinition {
  languages: Record<LanguageKey, string[]>;
  lineExplanations: Record<LanguageKey, Record<number, string>>;
  keyPoints?: KeyPointsData;
  faqList?: Array<{ tag: string; question: string; answer: string }>;
}

export interface AlgorithmSpec {
  id: string;
  name: string;
  category: string;
  description: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  problem?: ProblemDetail;
  code: AlgorithmCodeDefinition;
  semanticLines: SemanticLineMap;
  generateSteps: (input: any) => DpTraceStep[];
}
