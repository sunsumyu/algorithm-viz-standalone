/**
 * 统一暗色代码终端 — 高亮目标归一化 (DarkCodeTerminalHighlight)
 * 从 dark-code-terminal-presenter 拆出的纯函数：多态高亮目标 → 物理行号数组。
 */

import type { CodePresentationModel } from '../code-presentation-model';
import type { HighlightTarget, NormalizedHighlight } from './dark-code-terminal-types';

/**
 * 纯函数：将多态高亮目标（数字、字符串、数组、区间、多语言字典）统一归一化为物理行号数组
 */
export function normalizeHighlightTarget(
  target: HighlightTarget | null | undefined,
  currentLang: string = 'java',
  codeModel?: CodePresentationModel
): NormalizedHighlight {
  if (target == null) return { lines: [] };

  if (typeof target === 'number') {
    return { lines: [target], focusLine: target };
  }
  if (typeof target === 'string') {
    const parsed = parseInt(target, 10);
    if (!isNaN(parsed)) {
      return { lines: [parsed], focusLine: parsed };
    }
    if (codeModel) {
      const anchorLine = codeModel.resolveAnchorLine(target, currentLang);
      if (anchorLine != null) {
        return normalizeHighlightTarget(anchorLine, currentLang, codeModel);
      }
    }
    return { lines: [] };
  }
  if (Array.isArray(target)) {
    const valid = target
      .map((t) => (typeof t === 'number' ? t : parseInt(t, 10)))
      .filter((n) => !isNaN(n));
    return { lines: valid, focusLine: valid[0] };
  }
  if (typeof target === 'object') {
    if ('anchor' in target && typeof (target as any).anchor === 'string') {
      if (codeModel) {
        const anchorLine = codeModel.resolveAnchorLine((target as any).anchor, currentLang);
        if (anchorLine != null) {
          return normalizeHighlightTarget(anchorLine, currentLang, codeModel);
        }
      }
    }
    if ('from' in target && 'to' in target && typeof target.from === 'number' && typeof target.to === 'number') {
      const range: number[] = [];
      for (let i = target.from; i <= target.to; i++) range.push(i);
      return { lines: range, focusLine: target.from };
    }
    if ('primary' in target) {
      const p = (target as any).primary;
      return normalizeHighlightTarget(p, currentLang, codeModel);
    }
    // 多语言字典解包
    const dict = target as Record<string, any>;
    let resolved = dict[currentLang];
    if (resolved == null && (currentLang === 'js' || currentLang === 'javascript')) {
      resolved = dict['javascript'] ?? dict['js'];
    }
    if (resolved == null && (currentLang === 'python' || currentLang === 'py')) {
      resolved = dict['python'] ?? dict['py'];
    }
    if (resolved == null && currentLang.includes('cpp')) {
      resolved = dict['cpp'] ?? dict['c++'];
    }
    if (resolved == null) {
      resolved = dict['java'] ?? Object.values(dict)[0];
    }
    return normalizeHighlightTarget(resolved, currentLang, codeModel);
  }
  return { lines: [] };
}

/**
 * 将暗色终端挂载到指定容器并绑定所有交互行为
 */
