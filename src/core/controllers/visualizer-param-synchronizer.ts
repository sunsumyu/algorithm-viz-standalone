import { ProblemDimensionResolver } from '../resolvers/problem-dimension-resolver';
import { VisualizerStateRouter, type VisualizerState } from '../state-router';
import type { IYamlAlgorithmModel } from '../interfaces';

export interface VisualizerResolvedState {
  m: number;
  n: number;
  is1D: boolean;
  stage: string;
  dir: 'forward' | 'reverse';
  variant?: string;
  theme?: string;
  step: number;
}

export interface InputDimensions {
  m: number;
  n: number;
}

/**
 * 参数归一化与持久化状态同步深模块 (VisualizerParamSynchronizer)
 * 
 * 职责：
 * 1. 跨输入控件 (input-m, input-n)、URL Hash 与 LocalStorage 进行参数归一化与合法性约束
 * 2. 针对 1D 线性动规自动处理输入框的显隐控制与符号隐藏
 * 3. 隔离 LocalStorage 沙箱异常与跨端/iframe 兼容性处理
 */
export class VisualizerParamSynchronizer {
  /**
   * 解析并归一化初始运行参数与阶段/方向状态
   */
  public static resolveInitialState(
    model: IYamlAlgorithmModel,
    restored?: Partial<VisualizerState> | null
  ): VisualizerResolvedState {
    const isSameAlgo = !restored?.algo || restored.algo === model.id;
    const resolvedDim = ProblemDimensionResolver.resolve(model.id, model.defaultParams);

    let m = resolvedDim.m;
    let n = resolvedDim.n;
    let stage = this.getInitialStage(model);
    let dir = this.getInitialDirection(model);
    const variants = (model as any).variants;
    let variant = variants ? Object.keys(variants)[0] : undefined;
    let theme: string | undefined = undefined;
    let step = 0;

    if (restored && isSameAlgo) {
      if (restored.stage && model.stages?.[restored.stage]) {
        stage = restored.stage;
      }
      if ((restored.dir === 'forward' || restored.dir === 'reverse') && model.directions?.[restored.dir]) {
        dir = restored.dir;
      }
      if (restored.variant) {
        variant = restored.variant;
      }
      if (restored.theme) {
        theme = restored.theme;
      }
      if (restored.m && restored.m > 0) {
        m = Math.min(Math.max(restored.m, 1), 10);
      }
      if (restored.n && restored.n > 0) {
        n = Math.min(Math.max(restored.n, 1), 10);
      }
      if (restored.step !== undefined && restored.step >= 0) {
        step = restored.step;
      }
    }

    return {
      m,
      n,
      is1D: resolvedDim.is1D,
      stage,
      dir,
      variant,
      theme,
      step
    };
  }

  /**
   * 从当前 DOM 控件读取尺寸参数（带边界约束过滤）
   */
  public static readInputDimensions(defaultM = 3, defaultN = 3): InputDimensions {
    if (typeof document === 'undefined') {
      return { m: defaultM, n: defaultN };
    }

    const inputM = document.getElementById('input-m') as HTMLInputElement | null;
    const inputN = document.getElementById('input-n') as HTMLInputElement | null;

    let m = inputM ? parseInt(inputM.value, 10) : defaultM;
    let n = inputN ? parseInt(inputN.value, 10) : defaultN;

    if (isNaN(m) || m < 1) m = defaultM;
    if (isNaN(n) || n < 1) n = defaultN;

    // 约束在 [1, 10] 范围
    m = Math.min(Math.max(m, 1), 10);
    n = Math.min(Math.max(n, 1), 10);

    return { m, n };
  }

  /**
   * 同步参数到 DOM 输入框并自动控制 1D 线性动规输入框显隐
   */
  public static syncControlsToDom(dimensions: InputDimensions, is1DProblem: boolean): void {
    if (typeof document === 'undefined') return;

    const inputM = document.getElementById('input-m') as HTMLInputElement | null;
    const inputN = document.getElementById('input-n') as HTMLInputElement | null;

    if (inputM) {
      inputM.value = String(dimensions.m);
      if (is1DProblem) {
        inputM.style.display = 'none';
        if (inputM.previousElementSibling) (inputM.previousElementSibling as HTMLElement).style.display = 'none';
        if (inputM.nextElementSibling) (inputM.nextElementSibling as HTMLElement).style.display = 'none';
      } else {
        inputM.style.display = '';
        if (inputM.previousElementSibling) (inputM.previousElementSibling as HTMLElement).style.display = '';
        if (inputM.nextElementSibling) (inputM.nextElementSibling as HTMLElement).style.display = '';
      }
    }

    if (inputN) {
      inputN.value = String(dimensions.n);
    }
  }

  /**
   * 安全获取 LocalStorage 偏好值（支持沙箱 iframe 异常降级）
   */
  public static getPreference(key: string, fallback: string): string {
    if (typeof localStorage === 'undefined') return fallback;
    try {
      return localStorage.getItem(key) || fallback;
    } catch {
      return fallback;
    }
  }

  /**
   * 安全写入 LocalStorage 偏好值
   */
  public static setPreference(key: string, val: string): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(key, val);
    } catch {
      // 容忍沙箱受限环境
    }
  }

  private static getInitialStage(model: IYamlAlgorithmModel): string {
    const id = model.id;
    const savedModelStage = this.getPreference(`algo-stage-${id}`, '');
    if (savedModelStage && model.stages?.[savedModelStage]) {
      return savedModelStage;
    }
    const savedGlobalStage = this.getPreference('algo-preferred-stage', '');
    if (savedGlobalStage && model.stages?.[savedGlobalStage]) {
      return savedGlobalStage;
    }
    if (model.stages?.['stage-3']) return 'stage-3';
    return Object.keys(model.stages || {})[0] || 'stage-1';
  }

  private static getInitialDirection(model: IYamlAlgorithmModel): 'forward' | 'reverse' {
    const id = model.id;
    const savedModelDir = this.getPreference(`algo-dir-${id}`, '') as any;
    if ((savedModelDir === 'forward' || savedModelDir === 'reverse') && model.directions?.[savedModelDir]) {
      return savedModelDir;
    }
    const savedGlobalDir = this.getPreference('algo-preferred-dir', '') as any;
    if ((savedGlobalDir === 'forward' || savedGlobalDir === 'reverse') && model.directions?.[savedGlobalDir]) {
      return savedGlobalDir;
    }
    return 'forward';
  }
}
