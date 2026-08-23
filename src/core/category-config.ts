/**
 * 算法分类与展示元数据配置
 */

export interface CategoryConfig {
  name: string;
  icon: string;
  color: string;
  colorRgb: string;
  order: number;
  theme?: string;
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  array: { name: '数组', icon: '📐', color: '#89b4fa', colorRgb: '137, 180, 250', order: 1, theme: '#1e2a3a' },
  'linked-list': { name: '链表', icon: '🔗', color: '#94e2d5', colorRgb: '148, 226, 213', order: 2, theme: '#1e2a28' },
  'hash-table': { name: '哈希表', icon: '🗂️', color: '#f5c2e7', colorRgb: '245, 194, 231', order: 3, theme: '#2a1e2e' },
  string: { name: '字符串', icon: '🔤', color: '#fab387', colorRgb: '250, 179, 135', order: 4, theme: '#2a251e' },
  'two-pointers': { name: '双指针法', icon: '👆👇', color: '#89dceb', colorRgb: '137, 220, 235', order: 5, theme: '#1e2a2c' },
  stack: { name: '栈与队列', icon: '📚', color: '#cba6f7', colorRgb: '203, 166, 247', order: 6, theme: '#261e2e' },
  'monotonic-stack': { name: '单调栈', icon: '📈', color: '#b4befe', colorRgb: '180, 190, 254', order: 7, theme: '#1e2530' },
  tree: { name: '二叉树', icon: '🌳', color: '#a6e3a1', colorRgb: '166, 227, 161', order: 8, theme: '#1e2a20' },
  backtracking: { name: '回溯算法', icon: '🔄', color: '#b4befe', colorRgb: '180, 190, 254', order: 9, theme: '#221e2e' },
  greedy: { name: '贪心算法', icon: '💎', color: '#fab387', colorRgb: '250, 179, 135', order: 10, theme: '#2a241e' },
  'dynamic-programming': { name: '动态规划', icon: '🎯', color: '#89b4fa', colorRgb: '137, 180, 250', order: 11, theme: '#1e2438' },
  graph: { name: '图论', icon: '🕸️', color: '#a6e3a1', colorRgb: '166, 227, 161', order: 12, theme: '#1e2a20' },
  sort: { name: '排序', icon: '📊', color: '#f9e2af', colorRgb: '249, 226, 175', order: 13, theme: '#2a2720' },
  search: { name: '搜索', icon: '🔍', color: '#cba6f7', colorRgb: '203, 166, 247', order: 14, theme: '#241e2a' },
};

export const DIFFICULTY_CONFIG: Record<number, { label: string; color: string; bg: string; dot: string }> = {
  1: { label: '入门', color: '#a6e3a1', bg: 'rgba(166, 227, 161, 0.15)', dot: '●' },
  2: { label: '进阶', color: '#f9e2af', bg: 'rgba(249, 226, 175, 0.15)', dot: '●' },
  3: { label: '挑战', color: '#f38ba8', bg: 'rgba(243, 139, 168, 0.15)', dot: '●' },
};

export function getDifficultyConfig(d: number | undefined): { label: string; color: string; bg: string; dot: string } {
  return DIFFICULTY_CONFIG[d ?? 2] ?? DIFFICULTY_CONFIG[2];
}
