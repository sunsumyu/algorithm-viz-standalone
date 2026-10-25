/**
 * 通用运行时变量作用域捕获工具 (Universal Scope Capture Utility)
 * 
 * 职责：
 * 1. 为任意算法步骤提供一键式局部变量快照生成；
 * 2. 深度深浅拷贝隔离，防止引用污染；
 * 3. 常见数据结构（二维数组、大对象）体积修剪与安全快照。
 */

export interface ScopeCaptureOptions {
  /** 深度拷贝对象的最大嵌套深度，默认 2 */
  maxDepth?: number;
  /** 数组最大保留项数，超长截断，默认 30 */
  maxArrayLength?: number;
}

/**
 * 捕获并规范化局部作用域变量字典
 * @param locals 局部变量键值对，例如 captureScope({ n, l, r, len, dp, s })
 * @param options 可选配置
 */
export function captureScope(
  locals: Record<string, any>,
  options: ScopeCaptureOptions = {}
): Record<string, any> {
  if (!locals || typeof locals !== 'object') {
    return {};
  }

  const maxDepth = options.maxDepth ?? 2;
  const maxArrayLen = options.maxArrayLength ?? 30;

  const cloneVal = (val: any, depth: number): any => {
    if (val === null || val === undefined) return val;
    if (typeof val === 'number' || typeof val === 'string' || typeof val === 'boolean') {
      return val;
    }
    if (typeof val === 'function') {
      return undefined;
    }

    if (depth > maxDepth) {
      if (Array.isArray(val)) return `[Array(${val.length})]`;
      if (typeof val === 'object') return '{...}';
      return String(val);
    }

    if (Array.isArray(val)) {
      const slice = val.slice(0, maxArrayLen);
      return slice.map((item) => cloneVal(item, depth + 1));
    }

    if (typeof val === 'object') {
      const copy: Record<string, any> = {};
      for (const [k, v] of Object.entries(val)) {
        // 排除大型内部控制属性
        if (
          k.startsWith('_') ||
          k === 'renderer' ||
          k === 'container' ||
          k === 'element' ||
          k === 'canvas' ||
          k === 'scene'
        ) {
          continue;
        }
        const cloned = cloneVal(v, depth + 1);
        if (cloned !== undefined) {
          copy[k] = cloned;
        }
      }
      return copy;
    }

    return String(val);
  };

  const cleanScope: Record<string, any> = {};
  for (const [key, val] of Object.entries(locals)) {
    if (val === undefined || typeof val === 'function') continue;
    cleanScope[key] = cloneVal(val, 0);
  }

  return cleanScope;
}

/**
 * 统一通用作用域会话追踪器 (Universal Scope Session)
 * 
 * 为所有 StepCompiler 提供一劳永逸的作用域状态管理模板：
 * 1. 自动合并与累积前序步骤定义的变量（m, n, teams 等）；
 * 2. 局部变量覆盖更新（i, j, k, start, end 等）；
 * 3. 产生标准化的 scope 与 variables 键，彻底杜绝单步变量丢失。
 */
export class UniversalScopeSession {
  private activeScope: Record<string, any> = {};

  constructor(initialVars: Record<string, any> = {}) {
    this.activeScope = captureScope(initialVars);
  }

  /**
   * 声明或更新当前执行栈存活的局部变量
   */
  public set(vars: Record<string, any>): this {
    Object.assign(this.activeScope, captureScope(vars));
    return this;
  }

  /**
   * 移除出栈或已失效的临时变量
   */
  public delete(...keys: string[]): this {
    for (const k of keys) {
      delete this.activeScope[k];
    }
    return this;
  }

  /**
   * 获取当前作用域的深拷贝镜像
   */
  public getSnapshot(): Record<string, any> {
    return { ...this.activeScope };
  }

  /**
   * 生成携带标准作用域快照的单步数据对象
   */
  public emitStep<T extends Record<string, any>>(stepData: T): T & { scope: Record<string, any>; variables: Record<string, any> } {
    const snap = this.getSnapshot();
    return {
      ...stepData,
      scope: snap,
      variables: snap,
    };
  }
}

