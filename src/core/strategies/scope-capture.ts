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
