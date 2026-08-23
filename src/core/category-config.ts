/**
 * 算法分类与展示元数据配置（统一 LeetCode 明亮高对比度设计系统）
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
  array: { name: '数组', icon: '📐', color: '#1d4ed8', colorRgb: '29, 78, 216', order: 1, theme: '#eff6ff' },
  'linked-list': { name: '链表', icon: '🔗', color: '#0f766e', colorRgb: '15, 118, 110', order: 2, theme: '#f0fdfa' },
  'hash-table': { name: '哈希表', icon: '🗂️', color: '#be185d', colorRgb: '190, 24, 93', order: 3, theme: '#fdf2f8' },
  string: { name: '字符串', icon: '🔤', color: '#c2410c', colorRgb: '194, 65, 12', order: 4, theme: '#fff7ed' },
  'two-pointers': { name: '双指针法', icon: '👆👇', color: '#0e7490', colorRgb: '14, 116, 144', order: 5, theme: '#ecfeff' },
  stack: { name: '栈与队列', icon: '📚', color: '#6d28d9', colorRgb: '109, 40, 217', order: 6, theme: '#f5f3ff' },
  'monotonic-stack': { name: '单调栈', icon: '📈', color: '#4338ca', colorRgb: '67, 56, 202', order: 7, theme: '#eef2ff' },
  tree: { name: '二叉树', icon: '🌳', color: '#15803d', colorRgb: '21, 128, 61', order: 8, theme: '#f0fdf4' },
  backtracking: { name: '回溯算法', icon: '🔄', color: '#7e22ce', colorRgb: '126, 34, 206', order: 9, theme: '#faf5ff' },
  greedy: { name: '贪心算法', icon: '💎', color: '#c2410c', colorRgb: '194, 65, 12', order: 10, theme: '#fff7ed' },
  'dynamic-programming': { name: '动态规划', icon: '🎯', color: '#1d4ed8', colorRgb: '29, 78, 216', order: 11, theme: '#eff6ff' },
  graph: { name: '图论', icon: '🕸️', color: '#15803d', colorRgb: '21, 128, 61', order: 12, theme: '#f0fdf4' },
  sort: { name: '排序', icon: '📊', color: '#a16207', colorRgb: '161, 98, 7', order: 13, theme: '#fefce8' },
  search: { name: '搜索', icon: '🔍', color: '#6d28d9', colorRgb: '109, 40, 217', order: 14, theme: '#f5f3ff' },
};

export const DIFFICULTY_CONFIG: Record<number, { label: string; color: string; bg: string; dot: string }> = {
  1: { label: '入门', color: '#059669', bg: '#ecfdf5', dot: '●' },
  2: { label: '进阶', color: '#b45309', bg: '#fef3c7', dot: '●' },
  3: { label: '挑战', color: '#dc2626', bg: '#fee2e2', dot: '●' },
};

export function getDifficultyConfig(d: number | undefined): { label: string; color: string; bg: string; dot: string } {
  return DIFFICULTY_CONFIG[d ?? 2] ?? DIFFICULTY_CONFIG[2];
}
