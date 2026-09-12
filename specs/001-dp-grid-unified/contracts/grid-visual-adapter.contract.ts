/**
 * GridVisualAdapter 公共接口契约 (Contract Definition)
 * 供全库所有二维网格、迷宫探索、双串样本对应模型动态规划统一调用。
 */

export interface AdventurerRenderOptions {
  state?: 'walking' | 'cheering' | 'jumping' | 'blocked';
  isFinish?: boolean;
}

export interface GridRenderOptions {
  m: number;
  n: number;
  isReverse?: boolean;
  isGridProblem?: boolean;
  modelId?: string;

  /**
   * 可选行轴字符标尺 (例如 ['Ø', 'a', 'b', 'c'])
   */
  rowLabels?: string[];

  /**
   * 可选列轴字符标尺 (例如 ['Ø', 'a', 'c', 'e'])
   */
  colLabels?: string[];

  /**
   * 可选字符匹配判定回调 (用于标记 ✨ 勋章)
   */
  isMatch?: (r: number, c: number) => boolean;

  /**
   * 可选状态转移依赖前驱单元格列表
   */
  deps?: Array<{ r: number; c: number; type?: 'top' | 'left' | 'diag'; label?: string }>;
}

export interface IGridVisualAdapter {
  getAdventurerSvgHtml(options?: AdventurerRenderOptions): string;
  renderGrid(container: HTMLElement, step: any, options: GridRenderOptions): void;
}
