/**
 * Hard 17: 柱状图中最大的矩形 (Largest Rectangle in Histogram)
 * LeetCode 84 (Hard) / 单调递增栈最经典母题
 * 核心原语：首尾哨兵优化单调栈，出栈即确定左右首个更小边界，一次遍历 O(N) 破解
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase, HighlightTarget } from '../../../../core/step-visualizer';

export interface HistogramStep extends StepBase {
  stepIndex?: number;
  heights: number[];
  currentIndex: number;
  stack: number[]; // 存储下标
  poppedIndex: number | null;
  rectHighlight?: { left: number; right: number; height: number; area: number };
  maxArea: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: number | HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
  ans?: string;
}

export const HISTOGRAM_CODES = {
  java: `public class LargestRectangle {
    public int largestRectangleArea(int[] heights) {
        int n = heights.length;
        // 首尾添加高度为 0 的哨兵
        int[] h = new int[n + 2];
        System.arraycopy(heights, 0, h, 1, n);

        int[] stack = new int[n + 2];
        int top = 0; // stack[0] = 0 (左哨兵)
        int maxArea = 0;

        for (int i = 1; i < h.length; i++) {
            while (top > 0 && h[i] < h[stack[top]]) {
                int height = h[stack[top--]]; // 弹出栈顶作为高
                int width = i - stack[top] - 1; // 左右更小柱子界定宽
                maxArea = Math.max(maxArea, height * width);
            }
            stack[++top] = i; // 当前柱子压栈
        }
        return maxArea;
    }
}`,
  cpp: `class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        vector<int> h = {0};
        h.insert(h.end(), heights.begin(), heights.end());
        h.push_back(0); // 首尾哨兵

        vector<int> st = {0};
        int maxArea = 0;
        for (int i = 1; i < h.size(); ++i) {
            while (h[i] < h[st.back()]) {
                int height = h[st.back()];
                st.pop_back();
                int width = i - st.back() - 1;
                maxArea = max(maxArea, height * width);
            }
            st.push_back(i);
        }
        return maxArea;
    }
};`,
  python: `class Solution:
    def largestRectangleArea(self, heights: list[int]) -> int:
        h = [0] + heights + [0] # 首尾哨兵
        stack = [0]
        max_area = 0

        for i in range(1, len(h)):
            while h[i] < h[stack[-1]]:
                height = h[stack.pop()]
                width = i - stack[-1] - 1
                max_area = max(max_area, height * width)
            stack.append(i)

        return max_area`,
  typescript: `function largestRectangleArea(heights: number[]): number {
    const h = [0, ...heights, 0]; // 首尾哨兵
    const stack: number[] = [0];
    let maxArea = 0;

    for (let i = 1; i < h.length; i++) {
        while (h[i] < h[stack[stack.length - 1]]) {
            const height = h[stack.pop()!];
            const width = i - stack[stack.length - 1] - 1;
            maxArea = Math.max(maxArea, height * width);
        }
        stack.push(i);
    }
    return maxArea;
}`
};

export const HISTOGRAM_CODE_LINES = {
  entry: { java: 3, cpp: 4, python: 2, typescript: 1 },
  initSentinels: { java: 5, cpp: 6, python: 3, typescript: 2 },
  loop: { java: 11, cpp: 11, python: 7, typescript: 6 },
  whilePop: { java: 12, cpp: 12, python: 8, typescript: 7 },
  calcArea: { java: 14, cpp: 14, python: 11, typescript: 10 },
  push: { java: 17, cpp: 17, python: 12, typescript: 12 },
  returnAns: { java: 19, cpp: 19, python: 14, typescript: 14 },
};

export function generateHistogramSteps(inputHeights: number[]): HistogramStep[] {
  const steps: HistogramStep[] = [];
  const h = [0, ...inputHeights, 0];
  const stack: number[] = [0];
  let maxArea = 0;

  const lines = HISTOGRAM_CODE_LINES;

  // Step 0: 入口
  steps.push({
    heights: h,
    currentIndex: 0,
    stack: [0],
    poppedIndex: null,
    maxArea: 0,
    decision: '启动单调栈母题：首尾拼接高度为 0 的哨兵柱子',
    message: '首尾哨兵技巧：左哨兵防栈空越界，右哨兵在循环终结时强制弹空所有残留元素',
    log: `Init histogram with sentinels: [${h.join(', ')}]`,
    codeLine: lines.initSentinels,
    statusBadge: { text: '哨兵就绪', type: 'info' },
    metrics: {
      scanIdx: '#0 (h=0 哨兵)',
      popped: '无出栈',
      curRect: '等待结算',
      maxArea: 0,
    },
    ans: '0',
  });

  for (let i = 1; i < h.length; i++) {
    steps.push({
      heights: h,
      currentIndex: i,
      stack: [...stack],
      poppedIndex: null,
      maxArea: maxArea,
      decision: `扫描柱子 [${i}] (高度 = ${h[i]})，检验单调递增性`,
      message: `若当前高度 ${h[i]} < 栈顶高度 ${h[stack[stack.length - 1]]}，触发连续出栈结算`,
      log: `Examining i=${i}, h=${h[i]}, top=${stack[stack.length - 1]}`,
      codeLine: lines.loop,
      statusBadge: { text: '单调性比对', type: 'info' },
      metrics: {
        scanIdx: `#${i} (h=${h[i]})`,
        popped: '无出栈',
        curRect: '等待结算',
        maxArea: maxArea,
      },
      ans: String(maxArea),
    });

    while (stack.length > 1 && h[i] < h[stack[stack.length - 1]]) {
      const popped = stack.pop()!;
      const height = h[popped];
      const leftBound = stack[stack.length - 1];
      const width = i - leftBound - 1;
      const area = height * width;
      maxArea = Math.max(maxArea, area);

      steps.push({
        heights: h,
        currentIndex: i,
        stack: [...stack],
        poppedIndex: popped,
        rectHighlight: { left: leftBound + 1, right: i - 1, height, area },
        maxArea: maxArea,
        decision: `弹出栈顶柱 [${popped}] (高=${height})：左边界=[${leftBound}], 右边界=[${i}] ➔ 矩形宽=${width}, 面积=${area}`,
        message: `此柱子作为矩形高度的最大扩张区间已锁定！当前更新最大面积: ${maxArea}`,
        log: `Popped ${popped}: h=${height}, w=${width}, area=${area}, maxArea=${maxArea}`,
        codeLine: lines.calcArea,
        statusBadge: { text: `面积: ${area}`, type: 'success' },
        metrics: {
          scanIdx: `#${i} (h=${h[i]})`,
          popped: `#${popped} (h=${height})`,
          curRect: `${height}×${width}=${area}`,
          maxArea: maxArea,
        },
        ans: String(maxArea),
      });
    }

    stack.push(i);
    steps.push({
      heights: h,
      currentIndex: i,
      stack: [...stack],
      poppedIndex: null,
      maxArea: maxArea,
      decision: `柱子 [${i}] 压入单调栈，保持栈内高度严格单调递增`,
      message: `当前栈内柱子序列: [${stack.map(idx => `${idx}(h=${h[idx]})`).join(', ')}]`,
      log: `Push stack: index ${i}`,
      codeLine: lines.push,
      statusBadge: { text: '压入单调栈', type: 'info' },
      metrics: {
        scanIdx: `#${i} (h=${h[i]})`,
        popped: '无出栈',
        curRect: '等待结算',
        maxArea: maxArea,
      },
      ans: String(maxArea),
    });
  }

  // 终结
  steps.push({
    heights: h,
    currentIndex: h.length - 1,
    stack: [...stack],
    poppedIndex: null,
    maxArea: maxArea,
    decision: `🎉 算法执行完毕！全局最大矩形面积 = ${maxArea}`,
    message: '单调栈仅需单次 O(N) 扫描，每个柱子仅进栈出栈各一次',
    log: `Done. Final max area = ${maxArea}`,
    codeLine: lines.returnAns,
    statusBadge: { text: '求解成功', type: 'success' },
    metrics: {
      scanIdx: '扫描完成',
      popped: '出栈完成',
      curRect: `最终最大面积: ${maxArea}`,
      maxArea: maxArea,
    },
    ans: String(maxArea),
  });

  return steps;
}

export function renderHistogramCanvas(container: HTMLElement, step: HistogramStep): void {
  const maxH = Math.max(...step.heights, 7);
  const barWidth = 40;
  const gap = 10;
  const svgWidth = step.heights.length * (barWidth + gap) + 40;
  const svgHeight = 220;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px; width: 100%; height: 100%;">
      <!-- 柱状图主画布 -->
      <div style="
        background: rgba(15, 23, 42, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 20px 16px;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow-x: auto;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 13px; font-weight: 700; color: var(--text-color, #f1f5f9);">
            📊 直方图沙盘与单调栈矩形最大扩展投影
          </span>
          <div style="display: flex; gap: 12px; font-size: 11px;">
            <span style="color: #fbbf24; font-weight: 600;">■ 栈内递增柱</span>
            <span style="color: #38bdf8; font-weight: 600;">■ 当前扫描柱</span>
            <span style="color: #ef4444; font-weight: 600;">■ 出栈结算柱</span>
            <span style="color: #34d399; font-weight: 600;">▢ 结算最大矩形</span>
          </div>
        </div>

        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="min-width: 100%; height: 210px;">
          <!-- 底部基线 -->
          <line x1="20" y1="170" x2="${svgWidth - 20}" y2="170" stroke="rgba(255, 255, 255, 0.15)" stroke-width="2" />

          <!-- 高亮结算矩形半透明遮罩 -->
          ${
            step.rectHighlight
              ? `
              <rect
                x="${20 + step.rectHighlight.left * (barWidth + gap)}"
                y="${170 - (step.rectHighlight.height / maxH) * 140}"
                width="${(step.rectHighlight.right - step.rectHighlight.left + 1) * (barWidth + gap) - gap}"
                height="${(step.rectHighlight.height / maxH) * 140}"
                fill="rgba(52, 211, 153, 0.22)"
                stroke="#34d399"
                stroke-width="2.5"
                stroke-dasharray="6 3"
                rx="6"
              />
            `
              : ''
          }

          <!-- 各柱子绘制 -->
          ${step.heights.map((h, idx) => {
            const x = 20 + idx * (barWidth + gap);
            const barH = (h / maxH) * 140;
            const y = 170 - barH;
            const inStack = step.stack.includes(idx);
            const isCurrent = idx === step.currentIndex;
            const isPopped = idx === step.poppedIndex;

            let fillColor = 'rgba(51, 65, 85, 0.5)';
            let strokeColor = 'rgba(255, 255, 255, 0.1)';

            if (isPopped) {
              fillColor = 'rgba(239, 68, 68, 0.6)';
              strokeColor = '#ef4444';
            } else if (isCurrent) {
              fillColor = 'rgba(2, 132, 199, 0.6)';
              strokeColor = '#38bdf8';
            } else if (inStack) {
              fillColor = 'rgba(217, 119, 6, 0.6)';
              strokeColor = '#f59e0b';
            }

            return `
              <g>
                <rect
                  x="${x}"
                  y="${y}"
                  width="${barWidth}"
                  height="${barH}"
                  fill="${fillColor}"
                  stroke="${strokeColor}"
                  stroke-width="${isCurrent || isPopped ? '2' : '1'}"
                  rx="4"
                />
                <text x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="bold">${h}</text>
                <text x="${x + barWidth / 2}" y="190" text-anchor="middle" fill="${isCurrent ? '#38bdf8' : 'var(--text-muted, #94a3b8)'}" font-size="11" font-weight="600">#${idx}</text>
              </g>
            `;
          }).join('')}
        </svg>

        <!-- 单调递增栈内索引序列带 -->
        <div style="
          margin-top: 12px;
          padding: 8px 14px;
          background: rgba(15, 23, 42, 0.6);
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          gap: 10px;
        ">
          <span style="font-size: 11px; color: var(--text-muted, #94a3b8); font-weight: 600;">单调递增栈索引:</span>
          <span style="font-family: monospace; font-size: 13px; color: #fbbf24; font-weight: 700;">
            [ ${step.stack.map(idx => `${idx}(h=${step.heights[idx]})`).join(', ')} ]
          </span>
        </div>
      </div>
    </div>
  `;
}

export const hardLargestRectangleHistogramVisualizer = registerDeclarativeAlgorithm<HistogramStep>({
  id: 'hard-largest-rectangle-histogram',
  name: 'Hard 17: 柱状图中最大的矩形 (Largest Rectangle in Histogram)',
  category: 'monotonic-stack',
  icon: '📊',
  difficulty: 3,
  levelOrder: 17,
  learningGoal: '彻底掌握单调递增栈的母题模型与首尾哨兵技巧，体会左右边界 O(1) 同时确定的精妙逻辑',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 84 - Hard)</h3>
      <p>给定 $n$ 个非负整数，用来表示柱状图中各个柱子的高度。每个柱子彼此相邻，且宽度为 1。</p>
      <p>求在该柱状图中，能够勾勒出来的<strong>最大矩形面积</strong>。</p>
      <ul>
        <li><strong>暴力解法</strong>：枚举所有柱子作为高度向左右寻找首个小于它的边界，时间复杂度 $O(N^2)$。</li>
        <li><strong>单调栈最优解</strong>：维护单调递增栈，首尾添加高度为 0 的哨兵，每个柱子仅进栈出栈各一次，时间复杂度降至 $O(N)$。</li>
      </ul>
    </div>
  `,
  codeLanguages: HISTOGRAM_CODES,
  metrics: [
    { id: 'scanIdx', label: '当前扫描柱', color: '#38bdf8' },
    { id: 'popped', label: '出栈结算柱', color: '#ef4444' },
    { id: 'curRect', label: '结算矩形 (高×宽)', color: '#f59e0b' },
    { id: 'maxArea', label: '最大矩形面积', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'heights',
      label: '柱子高度数组 (逗号分隔)',
      type: 'text',
      defaultValue: '2, 1, 5, 6, 2, 3',
    },
  ],
  generateSteps: (input) => {
    const raw = String(input.heights || '2, 1, 5, 6, 2, 3');
    const nums = raw.split(',').map(s => parseInt(s.trim(), 10)).filter(v => !isNaN(v));
    return generateHistogramSteps(nums.length > 0 ? nums : [2, 1, 5, 6, 2, 3]);
  },
  renderCanvas: (container, step) => {
    renderHistogramCanvas(container, step);
  },
});
