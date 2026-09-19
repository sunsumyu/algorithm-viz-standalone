/**
 * Hard 11: 俄罗斯套娃信封问题 (Russian Doll Envelopes)
 * LeetCode 354 大厂高频顶级压轴题
 * 关键解题破局点：宽度升序 + 高度降序排序，降维至高度序列的 O(N log N) LIS 贪心二分
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase, HighlightTarget } from '../../../../core/step-visualizer';

export interface EnvelopeStep extends StepBase {
  stepIndex?: number;
  envelopes: [number, number][];
  currentEnvIndex: number;
  ends: number[]; // LIS ends 数组
  maxEnvelopes: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: number | HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
  ans?: string;
}

export const RUSSIAN_DOLL_CODES = {
  java: `public class RussianDollEnvelopes {
    public static int maxEnvelopes(int[][] envelopes) {
        if (envelopes == null || envelopes.length == 0) return 0;
        // 核心排序：宽度升序，若宽度相同则高度降序（防止同宽套娃）
        Arrays.sort(envelopes, (a, b) -> a[0] != b[0] ? a[0] - b[0] : b[1] - a[1]);

        // 对高度序列求 O(N log N) 的 LIS
        int[] ends = new int[envelopes.length];
        int len = 0;
        for (int[] env : envelopes) {
            int h = env[1];
            int l = 0, r = len - 1, find = -1;
            while (l <= r) {
                int mid = l + ((r - l) >> 1);
                if (ends[mid] >= h) {
                    find = mid;
                    r = mid - 1;
                } else {
                    l = mid + 1;
                }
            }
            if (find == -1) {
                ends[len++] = h;
            } else {
                ends[find] = h;
            }
        }
        return len;
    }
}`,
  cpp: `class RussianDollEnvelopes {
public:
    static int maxEnvelopes(vector<vector<int>>& envelopes) {
        if (envelopes.empty()) return 0;
        sort(envelopes.begin(), envelopes.end(), [](const vector<int>& a, const vector<int>& b) {
            return a[0] != b[0] ? a[0] < b[0] : a[1] > b[1];
        });

        vector<int> ends;
        for (const auto& env : envelopes) {
            int h = env[1];
            auto it = lower_bound(ends.begin(), ends.end(), h);
            if (it == ends.end()) {
                ends.push_back(h);
            } else {
                *it = h;
            }
        }
        return (int)ends.size();
    }
};`,
  python: `class RussianDollEnvelopes:
    @staticmethod
    def max_envelopes(envelopes: list[list[int]]) -> int:
        if not envelopes: return 0
        # 宽升序，高降序
        envelopes.sort(key=lambda x: (x[0], -x[1]))
        ends = []
        for _, h in envelopes:
            import bisect
            idx = bisect.bisect_left(ends, h)
            if idx == len(ends):
                ends.append(h)
            else:
                ends[idx] = h
        return len(ends)`,
  typescript: `export class RussianDollEnvelopes {
  static maxEnvelopes(envelopes: [number, number][]): number {
    if (envelopes.length === 0) return 0;
    envelopes.sort((a, b) => a[0] !== b[0] ? a[0] - b[0] : b[1] - a[1]);

    const ends: number[] = [];
    for (const [, h] of envelopes) {
      let l = 0, r = ends.length - 1, find = -1;
      while (l <= r) {
        const mid = l + ((r - l) >> 1);
        if (ends[mid] >= h) {
          find = mid;
          r = mid - 1;
        } else {
          l = mid + 1;
        }
      }
      if (find === -1) {
        ends.push(h);
      } else {
        ends[find] = h;
      }
    }
    return ends.length;
  }
}`
};

export const RUSSIAN_DOLL_CODE_LINES = {
  empty: { java: 4, cpp: 4, python: 2, typescript: 3 },
  sort: { java: 5, cpp: 5, python: 3, typescript: 4 },
  append: { java: 20, cpp: 17, python: 8, typescript: 19 },
  replace: { java: 22, cpp: 19, python: 10, typescript: 21 },
  finish: { java: 25, cpp: 21, python: 11, typescript: 24 },
};

export function generateRussianDollSteps(rawEnvelopes: [number, number][]): EnvelopeStep[] {
  const steps: EnvelopeStep[] = [];
  const envs = [...rawEnvelopes].map(e => [e[0], e[1]] as [number, number]);
  const n = envs.length;

  const makeMetrics = (curEnv: [number, number] | null, maxEnv: number, endsLen: number, action: string) => ({
    curEnvelope: curEnv ? `[${curEnv[0]}, ${curEnv[1]}]` : '排序就绪',
    maxEnvelopes: `${maxEnv} 层`,
    lisTailsLen: `${endsLen}`,
    replacedIndex: action,
  });
  const currentAns = (maxEnv: number) => `${maxEnv} 层嵌套套娃`;

  if (n === 0) {
    steps.push({
      stepIndex: 0,
      envelopes: [],
      currentEnvIndex: -1,
      ends: [],
      maxEnvelopes: 0,
      decision: '信封集合为空，最大套娃数量为 0',
      message: '无信封',
      log: '空集合',
      codeLine: RUSSIAN_DOLL_CODE_LINES.empty,
      statusBadge: { text: '空输入', type: 'danger' },
      metrics: makeMetrics(null, 0, 0, '无信封输入'),
      ans: currentAns(0),
    });
    return steps;
  }

  // 排序
  envs.sort((a, b) => (a[0] !== b[0] ? a[0] - b[0] : b[1] - a[1]));
  let stepIdx = 0;

  steps.push({
    stepIndex: stepIdx++,
    envelopes: envs.map(e => [...e] as [number, number]),
    currentEnvIndex: -1,
    ends: [],
    maxEnvelopes: 0,
    decision: '核心第一步：按 [宽升序, 高降序] 排序完成！同宽度的信封高度逆序，保证在后续 LIS 中绝不可能选出宽度相同的两个信封',
    message: '信封精妙排序完毕',
    log: '排序完成 (宽升序，高降序)',
    codeLine: RUSSIAN_DOLL_CODE_LINES.sort,
    statusBadge: { text: '排序就绪', type: 'info' },
    metrics: makeMetrics(null, 0, 0, '宽升序,同宽高降序'),
    ans: currentAns(0),
  });

  const ends: number[] = [];

  for (let i = 0; i < n; i++) {
    const [w, h] = envs[i];
    let l = 0;
    let r = ends.length - 1;
    let find = -1;

    while (l <= r) {
      const mid = l + ((r - l) >> 1);
      if (ends[mid] >= h) {
        find = mid;
        r = mid - 1;
      } else {
        l = mid + 1;
      }
    }

    if (find === -1) {
      ends.push(h);
      steps.push({
        stepIndex: stepIdx++,
        envelopes: envs.map(e => [...e] as [number, number]),
        currentEnvIndex: i,
        ends: [...ends],
        maxEnvelopes: ends.length,
        decision: `处理信封 [${w}, ${h}]：高度 ${h} 大于 ends 中所有元素，直接追加！有效套娃层数拓展至 ${ends.length}`,
        message: `套娃层数拓展至 ${ends.length}`,
        log: `Env [${w},${h}] -> 拓展 LIS (${ends.length})`,
        codeLine: RUSSIAN_DOLL_CODE_LINES.append,
        statusBadge: { text: `套娃+1 (层数:${ends.length})`, type: 'success' },
        metrics: makeMetrics([w, h], ends.length, ends.length, `末尾追加 (长度拓展至 ${ends.length})`),
        ans: currentAns(ends.length),
      });
    } else {
      const oldVal = ends[find];
      ends[find] = h;
      steps.push({
        stepIndex: stepIdx++,
        envelopes: envs.map(e => [...e] as [number, number]),
        currentEnvIndex: i,
        ends: [...ends],
        maxEnvelopes: ends.length,
        decision: `处理信封 [${w}, ${h}]：二分找到 ends 中首个 >= ${h} 的位置 ${find} (原值 ${oldVal})，更新 ends[${find}] = ${h}，获得更具潜力的贪心较小尾数`,
        message: `贪心更新 ends[${find}] = ${h}`,
        log: `Env [${w},${h}] -> 优化 ends[${find}]`,
        codeLine: RUSSIAN_DOLL_CODE_LINES.replace,
        statusBadge: { text: `贪心更新 [${find}]`, type: 'warning' },
        metrics: makeMetrics([w, h], ends.length, ends.length, `二分更新 ends[${find}]: ${oldVal}➔${h}`),
        ans: currentAns(ends.length),
      });
    }
  }

  steps.push({
    stepIndex: stepIdx++,
    envelopes: envs.map(e => [...e] as [number, number]),
    currentEnvIndex: n - 1,
    ends: [...ends],
    maxEnvelopes: ends.length,
    decision: `全量信封处理完毕！最大可嵌套套娃信封数量 = ends.length = ${ends.length}`,
    message: `最终结果: ${ends.length} 层套娃`,
    log: `LIS 结束，最大嵌套层数 ${ends.length}`,
    codeLine: RUSSIAN_DOLL_CODE_LINES.finish,
    statusBadge: { text: `最大套娃数: ${ends.length}`, type: 'success' },
    metrics: makeMetrics(envs[n - 1], ends.length, ends.length, '处理完成'),
    ans: currentAns(ends.length),
  });

  return steps;
}

export function renderRussianDollCanvas(container: HTMLElement, step: EnvelopeStep) {
  const { envelopes, currentEnvIndex, ends } = step;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%; height: 100%; padding: 4px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 信封卡片排布视图 -->
      <div style="background: rgba(15, 23, 42, 0.4); padding: 16px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08); flex: 1; display: flex; flex-direction: column; min-height: 0; overflow-y: auto;">
        <div style="font-size: 13px; font-weight: 600; color: var(--text-color, #cbd5e1); margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
          <span>已排序信封序列 (宽升序 ⇗，同宽时高严格降序 ⇘)</span>
          <span style="font-size: 11px; color: #94a3b8;">共 ${envelopes.length} 个信封</span>
        </div>
        <div style="display: flex; gap: 10px; justify-content: center; align-items: flex-end; flex: 1; min-height: 120px; overflow-x: auto; padding: 10px 4px;">
          ${envelopes.map(([w, h], idx) => {
            const isCur = idx === currentEnvIndex;
            return `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <div style="font-size: 10px; height: 14px; color: ${isCur ? '#38bdf8' : 'transparent'}; font-weight: bold;">
                  ${isCur ? 'CUR' : ''}
                </div>
                <div style="
                  width: ${40 + Math.min(w * 4, 60)}px;
                  height: ${40 + Math.min(h * 5, 80)}px;
                  background: ${isCur ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.5)'};
                  border: 2px solid ${isCur ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'};
                  border-radius: 6px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  font-size: 11px;
                  font-weight: bold;
                  color: #f8fafc;
                  box-shadow: ${isCur ? '0 0 12px rgba(56, 189, 248, 0.35)' : 'none'};
                  transition: all 0.2s ease;
                ">
                  <div style="color: #94a3b8; font-size: 10px;">w:${w}</div>
                  <div style="color: #38bdf8; font-size: 12px;">h:${h}</div>
                </div>
                <div style="font-size: 10px; color: #64748b; font-family: monospace;">
                  [${idx}]
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- ends 数组展示 -->
      <div style="background: rgba(15, 23, 42, 0.4); padding: 12px 14px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08); display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: #34d399; font-weight: 600;">LIS 贪心 ends 尾数数组 (各长度递增子序列最小末尾高度):</span>
          <span style="font-size: 11px; color: #94a3b8;">二分定位 O(log N)</span>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${ends.length === 0 ? '<span style="color: #64748b; font-size: 11px;">(待推入首个信封)</span>' : ''}
          ${ends.map((hVal, i) => `
            <div style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; border-radius: 4px; padding: 4px 10px; font-size: 12px; color: #f8fafc; display: flex; align-items: center; gap: 4px;">
              <span style="color: #94a3b8; font-size: 10px;">长度 ${i + 1}:</span> <strong style="color: #34d399;">h=${hVal}</strong>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

export const russianDollVisualizer = registerDeclarativeAlgorithm<EnvelopeStep>({
  id: 'hard-russian-doll-envelopes',
  name: '大厂高频真题: 俄罗斯套娃信封问题 (Russian Doll Envelopes)',
  category: 'dynamic-programming',
  icon: '🪆',
  difficulty: 3,
  levelOrder: 354,
  learningGoal: '掌握二维偏序问题通过[宽升序+高降序]巧妙消解冲突并降维至一维 O(N log N) LIS 贪心二分的顶级算法思维',
  metrics: [
    { id: 'curEnvelope', label: '当前信封 (Envelope)', color: 'blue' },
    { id: 'maxEnvelopes', label: '最大套娃数 (Max LIS)', color: 'emerald' },
    { id: 'lisTailsLen', label: 'ends 数组长度 (Tails)', color: 'amber' },
    { id: 'replacedIndex', label: '二分贪心动作 (Action)', color: 'purple' },
  ],
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 354)</h3>
      <p>给你一个二维整数数组 <code>envelopes</code>，其中 <code>envelopes[i] = [wi, hi]</code>，表示第 <code>i</code> 个信封的宽度和高度：</p>
      <ul>
        <li>当另一个信封的宽度和高度都<strong>严格大于</strong>当前信封时，这个信封才可以放进另一个信封里。</li>
        <li><strong>破局思考</strong>：如果按宽度升序、高度也升序，那么 <code>[3, 3]</code> 和 <code>[3, 4]</code> 就会在高度上递增，导致错误套入同宽信封。</li>
        <li><strong>神级转化</strong>：同宽时高度<strong>严格逆序</strong>！这样 <code>[3, 4]</code> 走在 <code>[3, 3]</code> 前面，求 LIS 时两者永远不会共存。</li>
      </ul>
    </div>
  `,
  codeLanguages: RUSSIAN_DOLL_CODES,
  inputs: [
    {
      id: 'envelopes',
      label: '信封数据 [w, h] 序列 (格式: 5,4; 6,4; 6,7; 2,3)',
      type: 'text',
      defaultValue: '5,4; 6,4; 6,7; 2,3',
    },
  ],
  generateSteps: (input) => {
    const raw = String(input.envelopes || '5,4; 6,4; 6,7; 2,3');
    const pairs: [number, number][] = raw
      .split(';')
      .map(part => {
        const [w, h] = part.split(',').map(s => Number(s.trim()));
        return (isNaN(w) || isNaN(h)) ? null : [w, h] as [number, number];
      })
      .filter((p): p is [number, number] => p !== null);
    return generateRussianDollSteps(pairs.length > 0 ? pairs : [[5, 4], [6, 4], [6, 7], [2, 3]]);
  },
  renderCanvas: (container, step) => {
    renderRussianDollCanvas(container, step);
  },
});
