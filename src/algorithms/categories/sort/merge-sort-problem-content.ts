/**
 * 归并排序 (Merge Sort)
 * 领域知识与题解精讲配置声明
 */

export const MERGE_SORT_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">Sort</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">归并排序 (Merge Sort)</h2>
    </div>
    <p style="margin: 0;"><strong>归并排序（Merge Sort）</strong> 是建立在归并操作上的一种有效、稳定的排序算法，采用经典的<strong>分治策略（Divide and Conquer）</strong>。将已有序的子序列合并，得到完全有序的序列；即先使每个子序列有序，再使子序列段间有序。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例:</div>
      <div>输入: nums = [38, 27, 43, 3, 9, 82, 10]</div>
      <div>输出: [3, 9, 10, 27, 38, 43, 82]</div>
      <div style="color: #94a3b8;">解释: 递归二分拆分为单元素后，两两双指针双向比对合并回填。</div>
    </div>
  </div>
`;

export const MERGE_SORT_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 分治拆解（Divide）与双指针有序归并（Merge）
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 分治两步法</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>Divide (分)：</strong> 找到中点 <code style="color: #38bdf8; font-family: monospace;">mid = (left + right) / 2</code>，递归对左半区 <code style="color: #fbbf24; font-family: monospace;">[left, mid]</code> 和右半区 <code style="color: #fbbf24; font-family: monospace;">[mid + 1, right]</code> 进行排序；<br/>
        2. <strong>Conquer (治/并)：</strong> 使用双指针 <code style="color: #38bdf8; font-family: monospace;">p1</code> 和 <code style="color: #a855f7; font-family: monospace;">p2</code> 分别指向两个有序子区间起点，依次比较挑选较小者填入辅助数组 <code style="color: #fde047; font-family: monospace;">temp</code>，最后将 <code style="color: #fde047; font-family: monospace;">temp</code> 拷贝回原数组对应区间。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度与稳定性</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：最好、最坏、平均时间复杂度均严格为 <code style="color: #34d399; font-family: monospace;">O(n log n)</code>（递归树深度 log n，每层归并耗时 O(n)）。<br/>
        • 空间复杂度：<code style="color: #f87171; font-family: monospace;">O(n)</code>（辅助合并数组与递归调用栈）。<br/>
        • 稳定性：<strong>稳定</strong>（在遇到相等元素时优先取左侧子区间的元素）。
        </p>
      </div>
    </div>
  </div>
`;

export const MERGE_SORT_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public void mergeSort(int[] arr, int left, int right, int[] temp) {',
    '    if (left >= right) return;',
    '    int mid = left + (right - left) / 2;',
    '    mergeSort(arr, left, mid, temp);',
    '    mergeSort(arr, mid + 1, right, temp);',
    '    merge(arr, left, mid, right, temp);',
    '}',
    '',
    'private void merge(int[] arr, int left, int mid, int right, int[] temp) {',
    '    int p1 = left, p2 = mid + 1, t = left;',
    '    while (p1 <= mid && p2 <= right) {',
    '        if (arr[p1] <= arr[p2]) temp[t++] = arr[p1++];',
    '        else temp[t++] = arr[p2++];',
    '    }',
    '    while (p1 <= mid) temp[t++] = arr[p1++];',
    '    while (p2 <= right) temp[t++] = arr[p2++];',
    '    for (int i = left; i <= right; i++) arr[i] = temp[i];',
    '}',
  ],
  cpp: [
    'void mergeSort(vector<int>& arr, int left, int right, vector<int>& temp) {',
    '    if (left >= right) return;',
    '    int mid = left + (right - left) / 2;',
    '    mergeSort(arr, left, mid, temp);',
    '    mergeSort(arr, mid + 1, right, temp);',
    '    merge(arr, left, mid, right, temp);',
    '}',
    'void merge(vector<int>& arr, int left, int mid, int right, vector<int>& temp) {',
    '    int p1 = left, p2 = mid + 1, t = left;',
    '    while (p1 <= mid && p2 <= right) {',
    '        if (arr[p1] <= arr[p2]) temp[t++] = arr[p1++];',
    '        else temp[t++] = arr[p2++];',
    '    }',
    '    while (p1 <= mid) temp[t++] = arr[p1++];',
    '    while (p2 <= right) temp[t++] = arr[p2++];',
    '    for (int i = left; i <= right; i++) arr[i] = temp[i];',
    '}',
  ],
  python: [
    'def merge_sort(arr: list[int], left: int, right: int, temp: list[int]) -> None:',
    '    if left >= right: return',
    '    mid = (left + right) // 2',
    '    merge_sort(arr, left, mid, temp)',
    '    merge_sort(arr, mid + 1, right, temp)',
    '    p1, p2, t = left, mid + 1, left',
    '    while p1 <= mid and p2 <= right:',
    '        if arr[p1] <= arr[p2]:',
    '            temp[t] = arr[p1]; p1 += 1',
    '        else:',
    '            temp[t] = arr[p2]; p2 += 1',
    '        t += 1',
    '    while p1 <= mid: temp[t] = arr[p1]; p1 += 1; t += 1',
    '    while p2 <= right: temp[t] = arr[p2]; p2 += 1; t += 1',
    '    for i in range(left, right + 1): arr[i] = temp[i]',
  ],
  javascript: [
    'function mergeSort(arr, left, right, temp) {',
    '    if (left >= right) return;',
    '    const mid = Math.floor((left + right) / 2);',
    '    mergeSort(arr, left, mid, temp);',
    '    mergeSort(arr, mid + 1, right, temp);',
    '    let p1 = left, p2 = mid + 1, t = left;',
    '    while (p1 <= mid && p2 <= right) {',
    '        if (arr[p1] <= arr[p2]) temp[t++] = arr[p1++];',
    '        else temp[t++] = arr[p2++];',
    '    }',
    '    while (p1 <= mid) temp[t++] = arr[p1++];',
    '    while (p2 <= right) temp[t++] = arr[p2++];',
    '    for (let i = left; i <= right; i++) arr[i] = temp[i];',
    '}',
  ],
};
