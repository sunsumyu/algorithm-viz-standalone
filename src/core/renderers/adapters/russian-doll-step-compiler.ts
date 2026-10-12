/**
 * 俄罗斯套娃信封问题 (LeetCode 354 / 大厂高频 Hard)
 * Step Compiler: 宽升序+高降序排序规约，O(N log N) 贪心二分 LIS 步进编译器
 */

import { StepBase, HighlightTarget } from '../../step-visualizer';

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

  // 排序：宽升序，同宽高降序
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
