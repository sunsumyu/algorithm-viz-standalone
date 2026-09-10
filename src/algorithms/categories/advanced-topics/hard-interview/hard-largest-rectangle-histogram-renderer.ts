/**
 * Hard 17: 柱状图中最大的矩形 (Largest Rectangle in Histogram)
 * LeetCode 84 (Hard) / 单调递增栈最经典母题
 * 核心原语：首尾哨兵优化单调栈，出栈即确定左右首个更小边界，一次遍历 O(N) 破解
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../../core/step-visualizer';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

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
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
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

export function generateHistogramSteps(inputHeights: number[]): HistogramStep[] {
  const steps: HistogramStep[] = [];
  const h = [0, ...inputHeights, 0];
  const stack: number[] = [0];
  let maxArea = 0;

  const lines = {
    entry: 3,
    initSentinels: 5,
    loop: 11,
    whilePop: 12,
    calcArea: 14,
    push: 17,
    returnAns: 19,
  };

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
  });

  return steps;
}

export function renderHistogramCanvas(container: HTMLElement, step: HistogramStep): void {
  const maxH = Math.max(...step.heights, 7);
  const barWidth = 36;
  const gap = 8;
  const svgWidth = step.heights.length * (barWidth + gap) + 40;
  const svgHeight = 180;

  container.innerHTML = `
    <div style="padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 核心指标看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">全局最大矩形面积 (Max Area)</div>
          <div style="font-size: 24px; font-weight: bold; color: #34d399; margin-top: 4px;">
            ${step.maxArea}
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">当前结算矩形 (Rect Calc)</div>
          <div style="font-size: 18px; font-weight: bold; color: #38bdf8; margin-top: 4px;">
            ${step.rectHighlight ? `高 ${step.rectHighlight.height} × 宽 ${step.rectHighlight.right - step.rectHighlight.left + 1} = ${step.rectHighlight.area}` : '等待触发'}
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">单调递增栈 (Monotonic Stack)</div>
          <div style="font-size: 14px; font-family: monospace; color: #fbbf24; margin-top: 6px;">
            [ ${step.stack.map(idx => `${idx}(h=${step.heights[idx]})`).join(', ')} ]
          </div>
        </div>
      </div>

      <!-- 柱状图主画布 -->
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px; margin-bottom: 16px; overflow-x: auto;">
        <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px;">
          直方图沙盘与当前最大延伸矩形投影
        </div>

        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="min-width: 100%; height: 160px;">
          <!-- 底部基线 -->
          <line x1="20" y1="140" x2="${svgWidth - 20}" y2="140" stroke="#475569" stroke-width="2" />

          <!-- 高亮结算矩形半透明遮罩 -->
          ${
            step.rectHighlight
              ? `
              <rect
                x="${20 + step.rectHighlight.left * (barWidth + gap)}"
                y="${140 - (step.rectHighlight.height / maxH) * 110}"
                width="${(step.rectHighlight.right - step.rectHighlight.left + 1) * (barWidth + gap) - gap}"
                height="${(step.rectHighlight.height / maxH) * 110}"
                fill="rgba(52, 211, 153, 0.25)"
                stroke="#34d399"
                stroke-width="2"
                stroke-dasharray="4 2"
                rx="4"
              />
            `
              : ''
          }

          <!-- 各柱子绘制 -->
          ${step.heights.map((h, idx) => {
            const x = 20 + idx * (barWidth + gap);
            const barH = (h / maxH) * 110;
            const y = 140 - barH;
            const inStack = step.stack.includes(idx);
            const isCurrent = idx === step.currentIndex;
            const isPopped = idx === step.poppedIndex;

            return `
              <g>
                <rect
                  x="${x}"
                  y="${y}"
                  width="${barWidth}"
                  height="${barH}"
                  fill="${isPopped ? '#ef4444' : isCurrent ? '#0284c7' : inStack ? '#d97706' : '#334155'}"
                  stroke="${isCurrent ? '#38bdf8' : '#64748b'}"
                  stroke-width="${isCurrent ? '2' : '1'}"
                  rx="3"
                />
                <text x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle" fill="#f8fafc" font-size="11" font-weight="bold">${h}</text>
                <text x="${x + barWidth / 2}" y="154" text-anchor="middle" fill="${isCurrent ? '#38bdf8' : '#94a3b8'}" font-size="10">#${idx}</text>
              </g>
            `;
          }).join('')}
        </svg>

        <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">
          图例：黄色=在单调栈内 · 蓝色=当前扫描柱 · 红色=正在出栈结算 · 绿色虚线框=当前结算最大矩形
        </div>
      </div>

      <!-- 原理卡片 -->
      ${renderFormulaCard(
        '单调栈左右边界确定定理',
        '当一根柱子被更矮的柱子强行弹出时：使其出栈的当前元素即为其右侧第一个严格小于它的柱子；而出栈后新暴露的栈顶，即为其左侧第一个严格小于它的柱子！左右第一个更小元素同时锁定，完美定义该高度下能横向扩张的最大矩形！',
        step.decision,
        step.statusBadge
      )}
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
