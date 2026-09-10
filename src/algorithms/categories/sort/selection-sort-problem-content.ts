/**
 * 选择排序 (Selection Sort)
 * 领域知识与题解精讲配置声明
 */

export const SELECTION_SORT_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">Sort</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Elementary</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">选择排序 (Selection Sort)</h2>
    </div>
    <p style="margin: 0;"><strong>选择排序（Selection Sort）</strong> 是一种直观简单的排序算法。它的工作原理是：首先在未排序序列中找到最小（大）元素，存放到排序序列的起始位置，然后，再从剩余未排序元素中继续寻找最小（大）元素，然后放到已排序序列的末尾。以此类推，直到所有元素均排序完毕。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例:</div>
      <div>输入: nums = [29, 10, 14, 37, 13]</div>
      <div>输出: [10, 13, 14, 29, 37]</div>
      <div style="color: #94a3b8;">解释: 第 1 轮在 [29..13] 中选出最小的 10 放到下标 0；第 2 轮在 [29..13] 中选出 13 放到下标 1...</div>
    </div>
  </div>
`;

export const SELECTION_SORT_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 极值锁定与最少数据交换（最多 n-1 次交换）
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 核心算法流程</div>
        <p style="margin: 0; color: #94a3b8;">
        1. 外层循环 <code style="color: #38bdf8; font-family: monospace;">i</code> 从 0 到 <code style="color: #38bdf8; font-family: monospace;">n - 2</code>，假设当前未排序起始项为最小值 <code style="color: #fde047; font-family: monospace;">minIndex = i</code>；<br/>
        2. 内层循环 <code style="color: #fbbf24; font-family: monospace;">j</code> 从 <code style="color: #fbbf24; font-family: monospace;">i + 1</code> 到 <code style="color: #fbbf24; font-family: monospace;">n - 1</code> 遍历，若 <code style="color: #f87171; font-family: monospace;">arr[j] < arr[minIndex]</code> 则更新 <code style="color: #fde047; font-family: monospace;">minIndex = j</code>；<br/>
        3. 一轮内循环结束后，若 <code style="color: #34d399; font-family: monospace;">minIndex != i</code>，仅执行 1 次交换 <code style="color: #34d399; font-family: monospace;">swap(arr[i], arr[minIndex])</code>；<br/>
        4. 重复上述过程，每次将当前最小元素归位到左侧已排序区。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度与稳定性</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：无论数据初始状态如何，比较次数均为固定的 <code style="color: #f87171; font-family: monospace;">n(n-1)/2</code> 次，严格为 <code style="color: #f87171; font-family: monospace;">O(n²)</code>。<br/>
        • 交换次数：最多 <code style="color: #34d399; font-family: monospace;">n - 1</code> 次交换（数据移动成本极低）。<br/>
        • 空间复杂度：<code style="color: #34d399; font-family: monospace;">O(1)</code>。<br/>
        • 稳定性：<strong>不稳定</strong>（长距离跨越交换可能破坏相同元素的相对顺序，如 [5, 5, 2] 首次交换后 2 与第一个 5 交换）。
        </p>
      </div>
    </div>
  </div>
`;

export const SELECTION_SORT_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public void selectionSort(int[] arr) {',
    '    int n = arr.length;',
    '    for (int i = 0; i < n - 1; i++) {',
    '        int minIdx = i;',
    '        for (int j = i + 1; j < n; j++) {',
    '            if (arr[j] < arr[minIdx]) {',
    '                minIdx = j;',
    '            }',
    '        }',
    '        if (minIdx != i) {',
    '            int temp = arr[i];',
    '            arr[i] = arr[minIdx];',
    '            arr[minIdx] = temp;',
    '        }',
    '    }',
    '}',
  ],
  cpp: [
    'void selectionSort(vector<int>& arr) {',
    '    int n = arr.size();',
    '    for (int i = 0; i < n - 1; i++) {',
    '        int minIdx = i;',
    '        for (int j = i + 1; j < n; j++) {',
    '            if (arr[j] < arr[minIdx]) minIdx = j;',
    '        }',
    '        if (minIdx != i) swap(arr[i], arr[minIdx]);',
    '    }',
    '}',
  ],
  python: [
    'def selection_sort(arr: list[int]) -> None:',
    '    n = len(arr)',
    '    for i in range(n - 1):',
    '        min_idx = i',
    '        for j in range(i + 1, n):',
    '            if arr[j] < arr[min_idx]:',
    '                min_idx = j',
    '        if min_idx != i:',
    '            arr[i], arr[min_idx] = arr[min_idx], arr[i]',
  ],
  javascript: [
    'function selectionSort(arr) {',
    '    const n = arr.length;',
    '    for (let i = 0; i < n - 1; i++) {',
    '        let minIdx = i;',
    '        for (let j = i + 1; j < n; j++) {',
    '            if (arr[j] < arr[minIdx]) minIdx = j;',
    '        }',
    '        if (minIdx !== i) {',
    '            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];',
    '        }',
    '    }',
    '}',
  ],
};
