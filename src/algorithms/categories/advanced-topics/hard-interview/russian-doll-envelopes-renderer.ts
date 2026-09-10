/**
 * Hard 11: 俄罗斯套娃信封问题 (Russian Doll Envelopes)
 * LeetCode 354 大厂高频顶级压轴题
 * 关键解题破局点：宽度升序 + 高度降序排序，降维至高度序列的 O(N log N) LIS 贪心二分
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../../core/step-visualizer';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface EnvelopeStep extends StepBase {
  stepIndex?: number;
  envelopes: [number, number][];
  currentEnvIndex: number;
  ends: number[]; // LIS ends 数组
  maxEnvelopes: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
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

export function generateRussianDollSteps(rawEnvelopes: [number, number][]): EnvelopeStep[] {
  const steps: EnvelopeStep[] = [];
  const envs = [...rawEnvelopes].map(e => [e[0], e[1]] as [number, number]);
  const n = envs.length;

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
      codeLine: 4,
      statusBadge: { text: '空输入', type: 'danger' }
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
    codeLine: 5,
    statusBadge: { text: '排序就绪', type: 'info' }
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
        codeLine: 20,
        statusBadge: { text: `套娃+1 (层数:${ends.length})`, type: 'success' }
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
        codeLine: 22,
        statusBadge: { text: `贪心更新 [${find}]`, type: 'warning' }
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
    codeLine: 25,
    statusBadge: { text: `最大套娃数: ${ends.length}`, type: 'success' }
  });

  return steps;
}

export function renderRussianDollCanvas(container: HTMLElement, step: EnvelopeStep) {
  const { envelopes, currentEnvIndex, ends, maxEnvelopes } = step;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
      <!-- 状态看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前处理信封</div>
          <div style="font-size: 14px; font-weight: bold; color: #38bdf8;">
            ${currentEnvIndex >= 0 ? `[${envelopes[currentEnvIndex][0]}, ${envelopes[currentEnvIndex][1]}]` : '排序完成'}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前最大套娃层数</div>
          <div style="font-size: 14px; font-weight: bold; color: #10b981;">
            ${maxEnvelopes}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">二分贪心 ends 长度</div>
          <div style="font-size: 14px; font-weight: bold; color: #ec4899;">
            ${ends.length}
          </div>
        </div>
      </div>

      <!-- 信封卡片排布视图 -->
      <div style="background: rgba(15, 23, 42, 0.5); padding: 20px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto;">
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 12px; text-align: center;">
          已排序信封列表（宽升序 ⇗ ，同宽时高降序 ⇘）：
        </div>
        <div style="display: flex; gap: 8px; justify-content: center; align-items: flex-end; min-width: 450px;">
          ${envelopes.map(([w, h], idx) => {
            const isCur = idx === currentEnvIndex;
            return `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <div style="font-size: 10px; height: 14px; color: ${isCur ? '#38bdf8' : '#64748b'}; font-weight: bold;">
                  ${isCur ? 'CUR' : ''}
                </div>
                <div style="
                  width: ${36 + w * 4}px;
                  height: ${36 + h * 4}px;
                  background: ${isCur ? 'rgba(56, 189, 248, 0.35)' : 'rgba(51, 65, 85, 0.4)'};
                  border: 2px solid ${isCur ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'};
                  border-radius: 6px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  font-size: 11px;
                  font-weight: bold;
                  color: #f8fafc;
                  box-shadow: ${isCur ? '0 0 12px rgba(56, 189, 248, 0.4)' : 'none'};
                  transition: all 0.2s ease;
                ">
                  <div>w:${w}</div>
                  <div>h:${h}</div>
                </div>
                <div style="font-size: 10px; color: #64748b;">
                  [${idx}]
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- ends 数组展示 -->
      <div style="background: rgba(30, 41, 59, 0.4); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 12px; color: #94a3b8; font-weight: bold;">LIS 贪心 ends 数组 (各长度递增子序列最小末尾高度):</div>
        <div style="display: flex; gap: 8px;">
          ${ends.map((hVal, i) => `
            <div style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; border-radius: 4px; padding: 4px 8px; font-size: 12px; color: #f8fafc;">
              长度 ${i + 1}: 高度 ${hVal}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 核心数学思维原理卡片 -->
      ${renderFormulaCard(
        '二维降维至一维 LIS 破局精髓',
        '宽度升序排，宽度相同时高度严格降序。这保证了在相同宽度下，高度递减必然不可能形成递增序列，消解同宽冲突后直接套用 O(N log N) 二分 LIS',
        step.decision,
        step.statusBadge
      )}
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
