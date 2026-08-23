/**
 * 最近访问算法历史记录持久化管理器
 */

export const RECENT_ALGORITHMS_KEY = 'algo_recent_algorithms';
export const MAX_RECENT_ALGORITHMS = 12;

/**
 * 获取已保存的最近访问算法 ID 列表（按访问时间倒序排列，最新访问在最前）
 */
export function getRecentAlgorithmIds(): string[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_ALGORITHMS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((id): id is string => typeof id === 'string' && id.trim().length > 0);
      }
    }
  } catch {}
  return [];
}

/**
 * 记录一次算法访问（去重并置顶到最前）
 */
export function addRecentAlgorithm(algorithmId: string): void {
  const trimmed = algorithmId.trim();
  if (!trimmed || typeof localStorage === 'undefined') return;

  const list = getRecentAlgorithmIds().filter((id) => id !== trimmed);
  list.unshift(trimmed);

  if (list.length > MAX_RECENT_ALGORITHMS) {
    list.length = MAX_RECENT_ALGORITHMS;
  }

  try {
    localStorage.setItem(RECENT_ALGORITHMS_KEY, JSON.stringify(list));
  } catch {}
}

/**
 * 移除某一条最近访问记录
 */
export function removeRecentAlgorithm(algorithmId: string): void {
  const trimmed = algorithmId.trim();
  if (!trimmed || typeof localStorage === 'undefined') return;

  const list = getRecentAlgorithmIds().filter((id) => id !== trimmed);
  try {
    localStorage.setItem(RECENT_ALGORITHMS_KEY, JSON.stringify(list));
  } catch {}
}

/**
 * 清空所有最近访问记录
 */
export function clearRecentAlgorithms(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(RECENT_ALGORITHMS_KEY);
  } catch {}
}
