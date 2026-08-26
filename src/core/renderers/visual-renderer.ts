import type { UniversalStep } from '../universal-stage-engine';
import type { GridRenderOptions } from './grid-visual-adapter';

export type VisualRendererContext = GridRenderOptions & {
  stage?: number;
  direction?: 'forward' | 'reverse';
  is3D?: boolean;
};

/**
 * 统一视觉表现适配器接口 (Unified Visual Adapter Interface)
 * 遵循桥接模式 (Bridge Pattern) 与生命周期管理契约
 */
export interface IVisualRenderer {
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
}
