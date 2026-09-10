/**
 * 冒泡排序 (Bubble Sort)
 * 领域知识与题解精讲配置声明
 */

export const BUBBLE_SORT_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">Sort</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Elementary</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">冒泡排序 (Bubble Sort)</h2>
    </div>
    <p style="margin: 0;"><strong>冒泡排序（Bubble Sort）</strong> 是一种基础交换排序算法。它重复地走访过要排序的元素列，依次比较相邻的两个元素，如果它们的顺序错误就交换它们，直到没有相邻元素需要交换为止。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例:</div>
      <div>输入: nums = [5, 2, 9, 1, 5, 6]</div>
      <div>输出: [1, 2, 5, 5, 6, 9]</div>
      <div style="color: #94a3b8;">解释: 每轮把当前未排序部分的最大值像气泡一样浮动到最右端。</div>
    </div>
  </div>
`;

export const BUBBLE_SORT_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 相邻两两比较交换与早停优化（Early-Exit Flag）
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 核心算法流程</div>
        <p style="margin: 0; color: #94a3b8;">
        1. 外层循环 <code style="color: #38bdf8; font-family: monospace;">i</code> 控制轮数，共执行 <code style="color: #38bdf8; font-family: monospace;">n - 1</code> 轮；<br/>
        2. 内层循环 <code style="color: #fbbf24; font-family: monospace;">j</code> 从 0 到 <code style="color: #fbbf24; font-family: monospace;">n - 1 - i</code> 遍历，比较相邻元素 <code style="color: #fbbf24; font-family: monospace;">arr[j]</code> 与 <code style="color: #fbbf24; font-family: monospace;">arr[j + 1]</code>；<br/>
        3. 若 <code style="color: #f87171; font-family: monospace;">arr[j] > arr[j + 1]</code>，则交换二者；<br/>
        4. <strong>早停优化：</strong> 若某一轮内循环没有发生任何交换，说明数组已经完全有序，可直接提前终止。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度与稳定性</div>
        <p style="margin: 0; color: #94a3b8;">
        • 最好时间复杂度：<code style="color: #34d399; font-family: monospace;">O(n)</code>（已完全有序，一轮扫描早停）。<br/>
        • 最坏与平均时间复杂度：<code style="color: #f87171; font-family: monospace;">O(n²)</code>。<br/>
        • 空间复杂度：<code style="color: #34d399; font-family: monospace;">O(1)</code>（原地排序）。<br/>
        • 稳定性：<strong>稳定</strong>（相同大小元素不发生交换）。
        </p>
      </div>
    </div>
  </div>
`;

export const BUBBLE_SORT_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public void bubbleSort(int[] arr) {',
    '    int n = arr.length;',
    '    for (int i = 0; i < n - 1; i++) {',
    '        boolean swapped = false;',
    '        for (int j = 0; j < n - 1 - i; j++) {',
    '            if (arr[j] > arr[j + 1]) {',
    '                int temp = arr[j];',
    '                arr[j] = arr[j + 1];',
    '                arr[j + 1] = temp;',
    '                swapped = true;',
    '            }',
    '        }',
    '        if (!swapped) break; // 早停优化',
    '    }',
    '}',
  ],
  cpp: [
    'void bubbleSort(vector<int>& arr) {',
    '    int n = arr.size();',
    '    for (int i = 0; i < n - 1; i++) {',
    '        bool swapped = false;',
    '        for (int j = 0; j < n - 1 - i; j++) {',
    '            if (arr[j] > arr[j + 1]) {',
    '                swap(arr[j], arr[j + 1]);',
    '                swapped = true;',
    '            }',
    '        }',
    '        if (!swapped) break;',
    '    }',
    '}',
  ],
  python: [
    'def bubble_sort(arr: list[int]) -> None:',
    '    n = len(arr)',
    '    for i in range(n - 1):',
    '        swapped = False',
    '        for j in range(n - 1 - i):',
    '            if arr[j] > arr[j + 1]:',
    '                arr[j], arr[j + 1] = arr[j + 1], arr[j]',
    '                swapped = True',
    '        if not swapped:',
    '            break',
  ],
  javascript: [
    'function bubbleSort(arr) {',
    '    const n = arr.length;',
    '    for (let i = 0; i < n - 1; i++) {',
    '        let swapped = false;',
    '        for (let j = 0; j < n - 1 - i; j++) {',
    '            if (arr[j] > arr[j + 1]) {',
    '                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];',
    '                swapped = true;',
    '            }',
    '        }',
    '        if (!swapped) break;',
    '    }',
    '}',
  ],
};
