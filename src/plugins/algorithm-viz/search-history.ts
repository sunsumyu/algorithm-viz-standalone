/**
 * 算法搜索历史记录持久化管理器
 */

export const SEARCH_HISTORY_KEY = 'algo_search_history';
export const MAX_SEARCH_HISTORY = 8;

/** 获取已保存的搜索历史列表（按最新顺序排列） */
export function getSearchHistory(): string[] {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
      }
    }
  } catch {}
  return [];
}

/** 添加或置顶某条搜索关键词 */
export function addSearchHistory(query: string): void {
  const trimmed = query.trim();
  if (!trimmed) return;
  const history = getSearchHistory().filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
  history.unshift(trimmed);
  if (history.length > MAX_SEARCH_HISTORY) {
    history.length = MAX_SEARCH_HISTORY;
  }
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  } catch {}
}

/** 删除指定的一条搜索历史 */
export function removeSearchHistory(query: string): void {
  const trimmed = query.trim();
  const history = getSearchHistory().filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  } catch {}
}

/** 清空所有搜索历史 */
export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch {}
}
