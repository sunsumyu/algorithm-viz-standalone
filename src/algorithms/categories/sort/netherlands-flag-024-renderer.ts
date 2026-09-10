/**
 * Class 024: 荷兰国旗问题与三向切分 (Netherlands Flag Problem)
 * 左程云算法通关课入门篇 Class 024
 * 随机快速排序核心 Partition 原理
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface NetherlandsStep extends StepBase {
  nums: number[];
  target: number;
  less: number;
  more: number;
  cur: number;
  swappedIndices?: [number, number];
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const NETHERLANDS_FLAG_024_CODES = {
  java: `public class NetherlandsFlag {
    // 荷兰国旗三向切分：小于区、等于区、大于区
    public static int[] partition(int[] arr, int l, int r, int target) {
        int less = l - 1;
        int more = r + 1;
        int cur = l;
        while (cur < more) {
            if (arr[cur] < target) {
                swap(arr, ++less, cur++);
            } else if (arr[cur] > target) {
                swap(arr, --more, cur);
            } else {
                cur++;
            }
        }
        return new int[] { less + 1, more - 1 };
    }
    static void swap(int[] arr, int i, int j) {
        int tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
}`,
  cpp: `pair<int, int> partition(vector<int>& arr, int l, int r, int target) {
    int less = l - 1, more = r + 1, cur = l;
    while (cur < more) {
        if (arr[cur] < target) swap(arr, ++less, cur++);
        else if (arr[cur] > target) swap(arr, --more, cur);
        else cur++;
    }
    return {less + 1, more - 1};
}`,
  python: `def partition(arr, l, r, target):
    less, more, cur = l - 1, r + 1, l
    while cur < more:
        if arr[cur] < target:
            less += 1
            arr[less], arr[cur] = arr[cur], arr[less]
            cur += 1
        elif arr[cur] > target:
            more -= 1
            arr[more], arr[cur] = arr[cur], arr[more]
        else:
            cur += 1
    return less + 1, more - 1`,
  typescript: `export function partition(arr: number[], l: number, r: number, target: number): [number, number] {
  let less = l - 1;
  let more = r + 1;
  let cur = l;
  while (cur < more) {
    if (arr[cur] < target) {
      less++;
      [arr[less], arr[cur]] = [arr[cur], arr[less]];
      cur++;
    } else if (arr[cur] > target) {
      more--;
      [arr[more], arr[cur]] = [arr[cur], arr[more]];
    } else {
      cur++;
    }
  }
  return [less + 1, more - 1];
}`
};

export function buildNetherlands024Steps(
  rawNums: number[] = [3, 5, 2, 6, 3, 1, 7, 3, 4],
  target: number = 3
): NetherlandsStep[] {
  const steps: NetherlandsStep[] = [];
  const a = [...rawNums];
  const n = a.length;

  let less = -1;
  let more = n;
  let cur = 0;

  steps.push({
    nums: [...a],
    target,
    less,
    more,
    cur,
    decision: `主函数入口：开始进行荷兰国旗三向切分，基准目标 target = ${target}`,
    message: `初始数组: [${a.join(', ')}]。小于区在 -1，大于区在 ${n}，cur 从 0 开始扫描。`,
    log: `Init partition: target=${target}, less=-1, more=${n}`,
    codeLine: 4,
    statusBadge: { text: '准备切分', type: 'info' }
  });

  while (cur < more) {
    if (a[cur] < target) {
      const targetLess = less + 1;
      const swapPair: [number, number] = [targetLess, cur];
      const tmp = a[targetLess];
      a[targetLess] = a[cur];
      a[cur] = tmp;
      less++;

      steps.push({
        nums: [...a],
        target,
        less,
        more,
        cur,
        swappedIndices: swapPair,
        decision: `a[cur=${cur}]=${a[targetLess]} < target(${target})：与小于区下一个位置 #${targetLess} 交换，小于区右扩至 #${less}`,
        message: `元素 ${a[targetLess]} 划入小于区，cur 和 less 同步递增。`,
        log: `swap(arr[${targetLess}], arr[${cur}]), less=${less}`,
        codeLine: 9,
        statusBadge: { text: '扩大小于区', type: 'success' }
      });
      cur++;
    } else if (a[cur] > target) {
      const targetMore = more - 1;
      const swapPair: [number, number] = [targetMore, cur];
      const tmp = a[targetMore];
      a[targetMore] = a[cur];
      a[cur] = tmp;
      more--;

      steps.push({
        nums: [...a],
        target,
        less,
        more,
        cur,
        swappedIndices: swapPair,
        decision: `a[cur=${cur}]=${a[targetMore]} > target(${target})：与大于区前一个位置 #${targetMore} 交换，大于区左扩至 #${more}`,
        message: `元素 ${a[targetMore]} 划入大于区。注意：换过来的元素未经考察，cur 指针不自增！`,
        log: `swap(arr[${targetMore}], arr[${cur}]), more=${more}`,
        codeLine: 11,
        statusBadge: { text: '扩大大于区', type: 'warning' }
      });
    } else {
      steps.push({
        nums: [...a],
        target,
        less,
        more,
        cur,
        decision: `a[cur=${cur}]=${a[cur]} == target(${target})：命中等于区，直接前进`,
        message: `属于等于区元素，留在中间无需交换，cur++。`,
        log: `cur++ (${cur} -> ${cur + 1})`,
        codeLine: 13,
        statusBadge: { text: '等于区通过', type: 'info' }
      });
      cur++;
    }
  }

  steps.push({
    nums: [...a],
    target,
    less,
    more,
    cur,
    decision: `三向切分完成！小于区 [0 .. ${less}]，等于区 [${less + 1} .. ${more - 1}]，大于区 [${more} .. ${n - 1}]`,
    message: `等于区所有元素值均为 ${target}，在随机快速排序中可直接归位，无需继续递归！`,
    log: `Finished. equals range = [${less + 1}, ${more - 1}]`,
    codeLine: 16,
    statusBadge: { text: '切分完成', type: 'success' }
  });

  return steps;
}

export function renderNetherlandsSandbox(step: NetherlandsStep): string {
  const maxVal = Math.max(...step.nums, step.target, 1);
  const barsHtml = step.nums.map((v, i) => {
    const isCur = i === step.cur;
    const inLess = i <= step.less;
    const inMore = i >= step.more;
    const inEqual = i > step.less && i < step.more;

    let bg = '#cbd5e1';
    let border = '#94a3b8';
    let textColor = '#475569';

    if (inLess) {
      bg = '#dcfce7';
      border = '#22c55e';
      textColor = '#15803d';
    } else if (inMore) {
      bg = '#fee2e2';
      border = '#ef4444';
      textColor = '#b91c1c';
    } else if (inEqual) {
      bg = '#e0f2fe';
      border = '#0284c7';
      textColor = '#0369a1';
    }

    if (isCur) {
      border = '3px solid #f59e0b';
    }

    const heightPct = Math.max(15, (v / maxVal) * 100);

    return `
      <div style="display:inline-flex; flex-direction:column; align-items:center; width:34px; margin:0 3px;">
        <div style="width:100%; height:110px; display:flex; align-items:flex-end; justify-content:center;">
          <div style="width:28px; height:${heightPct}%; background:${bg}; border:2px solid ${border}; border-radius:6px 6px 0 0; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:13px; color:${textColor};">
            ${v}
          </div>
        </div>
        <div style="font-size:10px; color:#64748b; margin-top:4px;">#${i}</div>
        <div style="font-size:9px; height:14px; margin-top:2px;">
          ${isCur ? '<b style="color:#d97706;">▲cur</b>' : i === step.less ? '<span style="color:#16a34a;">less</span>' : i === step.more ? '<span style="color:#dc2626;">more</span>' : ''}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div style="display:flex; flex-direction:column; gap:12px; font-family:inherit;">
      <!-- 三向区间柱状图看板 -->
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-weight:700; font-size:13px; color:#0f172a;">
            🇳🇱 荷兰国旗三向分区柱状图 (基准 Target = ${step.target})
          </span>
          <div style="display:flex; gap:10px; font-size:11px;">
            <span style="color:#15803d; font-weight:700;">■ 小于区 (&lt;${step.target})</span>
            <span style="color:#0284c7; font-weight:700;">■ 等于区 (==${step.target})</span>
            <span style="color:#b91c1c; font-weight:700;">■ 大于区 (&gt;${step.target})</span>
          </div>
        </div>
        <div style="display:flex; justify-content:center; align-items:flex-end; overflow-x:auto; padding:10px 0;">
          ${barsHtml}
        </div>
      </div>

      <!-- 指针状态与区间看板 -->
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px;">
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">小于区边界 [0 .. less]</div>
          <div style="font-size:15px; font-weight:800; color:#15803d;">less = #${step.less}</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">当前扫描游标 cur</div>
          <div style="font-size:16px; font-weight:800; color:#d97706;">cur = #${step.cur}</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">大于区边界 [more .. n-1]</div>
          <div style="font-size:15px; font-weight:800; color:#b91c1c;">more = #${step.more}</div>
        </div>
      </div>

      ${renderFormulaCard(
        '荷兰国旗切分原则',
        '遇到小于放左边 (less右扩且cur++)；遇到大于放右边 (more左扩但cur不前进，因换来元素未知)；遇到等于直接推进 cur++。',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const netherlandsFlagVisualizer = registerDeclarativeAlgorithm<NetherlandsStep>({
  id: 'netherlands-flag-024',
  name: '荷兰国旗问题与三向切分 (Class 024)',
  category: 'sort',
  icon: '🇳🇱',
  difficulty: 1,
  levelOrder: 24,
  learningGoal: '深刻掌握荷兰国旗小于/等于/大于三向划分算法，理解随机快速排序 Partition 核心',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程内容 (Class 024)</h3>
      <p>荷兰国旗问题由著名计算机科学家 Dijkstra 提出。给定数组和一个目标值 <code>target</code>，请在 $O(N)$ 时间复杂度与 $O(1)$ 额外空间内将数组重排为三部分：</p>
      <ul>
        <li>左部：所有 <code>&lt; target</code> 的元素</li>
        <li>中部：所有 <code>== target</code> 的元素</li>
        <li>右部：所有 <code>&gt; target</code> 的元素</li>
      </ul>
      <p>本算法是改进经典快速排序、从 $O(N^2)$ 最差退化到 $O(N \log N)$ 期望时间复杂度的核心地基。</p>
    </div>
  `,
  codeLanguages: NETHERLANDS_FLAG_024_CODES,
  inputs: [
    {
      id: 'target',
      label: '划分基准值 (Target)',
      type: 'number',
      defaultValue: 3,
    },
  ],
  generateSteps: (input) => {
    const t = Number(input.target) || 3;
    return buildNetherlands024Steps([3, 5, 2, 6, 3, 1, 7, 3, 4], t);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderNetherlandsSandbox(step)}
      </div>
    `;
  },
});
