/**
 * 声明式 4-Card 舞台数据契约 (DeclarativeStageSpec)
 *
 * 从 declarative-stage-presenter 拆出的纯类型层：
 * DeclarativeAlgorithmSpec / DeclarativeStageSpec / VisualSlot 与各控件定义。
 * 零行为、零 DOM —— 渲染逻辑见 declarative-stage-presenter。
 */

import { visualState, type VisualStateId } from './visual-state-tokens';
import type { PresetCaseDef } from './preset-case-presenter';

export type { PresetCaseDef };

export interface InputControlDef {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select';
  defaultValue: any;
  width?: string;
  placeholder?: string;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  step?: number;
}

export interface ModeOptionDef {
  id: string;
  label: string;
}

export interface MetricCardDef {
  id: string;
  label: string;
  color?: string;
  badge?: boolean;
}

export interface LegendItemDef {
  label: string;
  /** 语义状态令牌（渲染期由当前主题解析色值，与 color 二选一） */
  state?: VisualStateId;
  /** 直接色值（分类色/装饰色与 state 二选一） */
  color?: string;
}

/** 解析图例色点的最终色值：显式 color 优先，语义 state 交由当前主题解析 */
export function resolveLegendDotColor(lg: LegendItemDef): string {
  return lg.color ?? visualState(lg.state ?? 'idle').border;
}

/**
 * 视觉槽位定义规范 (VisualSlot)
 * 强制约束 Card 1 (主视觉/顶部沙盘) 与 Card 2 (辅助视觉/底部栈与状态) 的语义角色
 */
export interface VisualSlot<TStep = any> {
  title: string;
  desc?: string;
  render: (container: HTMLElement, step: TStep, extra?: any) => void;
}

export interface DeclarativeStageSpec<TStep = any> {
  id: string; // 'stage-1' | 'stage-2' | 'stage-3' | 'stage-4'
  name: string; // '阶段 1: 暴力递归'
  shortName: string; // '递归'
  num?: number;
  theme?: string;
  timeBadge?: string; // 'O(2ⁿ)'
  badge?: {
    mode: string;
    complexity: string;
  };
  /**
   * 顶部主视觉槽位 (Card 1): 恒定映射到顶部沙盘/画布/雷达/矩阵
   */
  primaryVisual?: VisualSlot<TStep>;
  /**
   * 底部辅助视觉槽位 (Card 2): 恒定映射到底部调用栈/决策树/指标诊断
   */
  auxiliaryVisual?: VisualSlot<TStep>;

  // 兼容遗留字段
  card1Title?: string;
  card2Title?: string;
  card2Desc?: string;
  legend?: LegendItemDef[];
  metrics?: MetricCardDef[];
  has3D?: boolean;
  codeLanguages?: Record<string, string[] | string>;
  modeCodeLanguages?: Record<string, Record<string, string[]>>;
  buildSteps?: (inputs: Record<string, any>, mode?: string) => TStep[];
  generateSteps?: (inputs: Record<string, any>, mode?: string) => TStep[];
  renderCanvas?: (container: HTMLElement, step: TStep, extra?: any) => void;
  renderCustomMetrics?: (container: HTMLElement, step: TStep, extra?: any) => void;
}

export interface DeclarativeAlgorithmSpec<TStep = any> {
  id: string;
  name?: string;
  title?: string;
  viewId?: string;
  category: string;
  categoryName?: string;
  icon?: string;
  description?: string;
  difficulty?: 1 | 2 | 3 | 'easy' | 'medium' | 'hard' | string;
  levelOrder?: number;
  timeComplexity?: string;
  spaceComplexity?: string;
  learningGoal?: string;
  /** 名称别名（中英文变体、旧称）：参与搜索命中，不参与目录展示 */
  aliases?: string[];
  badge?: {
    mode: string;
    complexity: string;
  };
  /**
   * 顶部主视觉槽位 (Card 1): 恒定映射到顶部沙盘/画布/雷达/矩阵
   */
  primaryVisual?: VisualSlot<TStep>;
  /**
   * 底部辅助视觉槽位 (Card 2): 恒定映射到底部调用栈/决策树/指标诊断
   */
  auxiliaryVisual?: VisualSlot<TStep>;

  // 兼容遗留字段
  card1Title?: string;
  card2Title?: string;
  card2Desc?: string;
  legend?: LegendItemDef[];
  inputs?: InputControlDef[];
  presets?: PresetCaseDef[];
  modes?: ModeOptionDef[];
  metrics?: MetricCardDef[];
  codeLanguages?: Record<string, string[] | string>;
  sourceCodes?: any;
  problemHtml?: string;
  analysisHtml?: string;
  problemContent?: any;
  stages?: DeclarativeStageSpec<TStep>[];
  defaultStage?: string;
  defaultMode?: string;
  buildSteps?: (inputs: Record<string, any>, mode?: string) => TStep[];
  generateSteps?: (inputs: Record<string, any>, mode?: string) => TStep[];
  renderCanvas?: (container: HTMLElement, step: TStep, extra?: any) => void;
  renderCustomMetrics?: (container: HTMLElement, step: TStep, extra?: any) => void;
}
