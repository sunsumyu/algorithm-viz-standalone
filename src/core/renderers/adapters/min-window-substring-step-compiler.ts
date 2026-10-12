import { StepBase, HighlightTarget } from '../../step-visualizer';

export interface MinWindowStep extends StepBase {
  s: string;
  t: string;
  l: number;
  r: number;
  debtMap: { char: string; count: number }[];
  allDebt: number;
  bestStart: number;
  bestLen: number;
  bestSubstr: string;
  decision: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
  ans?: string;
}

export const MIN_WINDOW_CODES = {
  java: `public class MinWindowSubstring {
    public String minWindow(String s, String t) {
        if (s.length() < t.length()) return "";
        int[] map = new int[256];
        for (char c : t.toCharArray()) map[c]++;
        int allDebt = t.length();
        int l = 0, r = 0, minLen = Integer.MAX_VALUE, start = 0;

        while (r < s.length()) {
            // 1. 右指针还款
            if (map[s.charAt(r)] > 0) allDebt--;
            map[s.charAt(r)]--;

            // 2. 欠款还清，左指针催账收缩
            if (allDebt == 0) {
                while (map[s.charAt(l)] < 0) {
                    map[s.charAt(l)]++;
                    l++;
                }
                if (r - l + 1 < minLen) {
                    minLen = r - l + 1;
                    start = l;
                }
                // 弹出左边界必需字符，重新进入欠款状态
                map[s.charAt(l)]++;
                allDebt++;
                l++;
            }
            r++;
        }
        return minLen == Integer.MAX_VALUE ? "" : s.substring(start, start + minLen);
    }
}`,
  cpp: `class Solution {
public:
    string minWindow(string s, string t) {
        if (s.size() < t.size()) return "";
        vector<int> map(256, 0);
        for (char c : t) map[c]++;
        int allDebt = t.size(), l = 0, r = 0, minLen = INT_MAX, start = 0;

        while (r < s.size()) {
            if (map[s[r]] > 0) allDebt--;
            map[s[r]]--;
            if (allDebt == 0) {
                while (map[s[l]] < 0) {
                    map[s[l]]++;
                    l++;
                }
                if (r - l + 1 < minLen) {
                    minLen = r - l + 1;
                    start = l;
                }
                map[s[l]]++;
                allDebt++;
                l++;
            }
            r++;
        }
        return minLen == INT_MAX ? "" : s.substr(start, minLen);
    }
};`,
  python: `class Solution:
    def minWindow(self, s: str, t: str) -> str:
        if len(s) < len(t): return ""
        debt_map = collections.Counter(t)
        all_debt = len(t)
        l = 0
        min_len = float('inf')
        best_start = 0

        for r, c in enumerate(s):
            if debt_map[c] > 0:
                all_debt -= 1
            debt_map[c] -= 1

            if all_debt == 0:
                while debt_map[s[l]] < 0:
                    debt_map[s[l]] += 1
                    l += 1
                if r - l + 1 < min_len:
                    min_len = r - l + 1
                    best_start = l
                debt_map[s[l]] += 1
                all_debt += 1
                l += 1
        return "" if min_len == float('inf') else s[best_start:best_start + min_len]`,
  typescript: `export function minWindow(s: string, t: string): string {
  if (s.length < t.length) return '';
  const map: number[] = new Array(256).fill(0);
  for (let i = 0; i < t.length; i++) map[t.charCodeAt(i)]++;
  let allDebt = t.length;
  let l = 0, r = 0, minLen = Infinity, start = 0;

  while (r < s.length) {
    const rc = s.charCodeAt(r);
    if (map[rc] > 0) allDebt--;
    map[rc]--;

    if (allDebt === 0) {
      while (map[s.charCodeAt(l)] < 0) {
        map[s.charCodeAt(l)]++;
        l++;
      }
      if (r - l + 1 < minLen) {
        minLen = r - l + 1;
        start = l;
      }
      map[s.charCodeAt(l)]++;
      allDebt++;
      l++;
    }
    r++;
  }
  return minLen === Infinity ? '' : s.substring(start, start + minLen);
}`
};

export const MIN_WINDOW_CODE_LINES = {
  init: { java: 6, cpp: 7, python: 6, typescript: 6 },
  expand: { java: 11, cpp: 11, python: 13, typescript: 11 },
  shrink: { java: 21, cpp: 18, python: 20, typescript: 17 },
  finish: { java: 31, cpp: 27, python: 25, typescript: 28 },
};

export function generateMinWindowSteps(s: string = 'ADOBECODEBANC', t: string = 'ABC'): MinWindowStep[] {
  const steps: MinWindowStep[] = [];
  const map = new Map<string, number>();
  for (const c of t) {
    map.set(c, (map.get(c) || 0) + 1);
  }
  let allDebt = t.length;
  let l = 0, r = 0;
  let minLen = Infinity;
  let start = 0;

  const snapshotDebt = () => {
    return Array.from(map.entries()).map(([char, count]) => ({ char, count }));
  };

  steps.push({
    s,
    t,
    l: 0,
    r: -1,
    debtMap: snapshotDebt(),
    allDebt,
    bestStart: 0,
    bestLen: 0,
    bestSubstr: '',
    decision: '初始化欠账表模型',
    message: `目标串 t = "${t}"，构建初始欠款总账: ${allDebt} 个字符。`,
    log: `Init minWindow: allDebt=${allDebt}`,
    codeLine: MIN_WINDOW_CODE_LINES.init,
    statusBadge: { text: '欠账初始化', type: 'info' },
    metrics: {
      windowLen: '0',
      allDebt: `${allDebt}`,
      bestLen: '—',
      bestSubstr: '无',
    },
    ans: '""',
  });

  while (r < s.length) {
    const rc = s[r];
    const curDebt = map.get(rc) || 0;
    if (curDebt > 0) {
      allDebt--;
    }
    map.set(rc, curDebt - 1);

    steps.push({
      s,
      t,
      l,
      r,
      debtMap: snapshotDebt(),
      allDebt,
      bestStart: start,
      bestLen: minLen === Infinity ? 0 : minLen,
      bestSubstr: minLen === Infinity ? '' : s.substring(start, start + minLen),
      decision: `右指针移至 #${r} ('${rc}')：${curDebt > 0 ? '有效还款！总欠款减 1' : '借入富余字符'}`,
      message: `字符 '${rc}' 存量更新为 ${curDebt - 1}，当前全网剩余欠款: ${allDebt}。`,
      log: `r=${r} char='${rc}' allDebt=${allDebt}`,
      codeLine: MIN_WINDOW_CODE_LINES.expand,
      statusBadge: curDebt > 0 ? { text: `有效还款 '${rc}'`, type: 'success' } : { text: '滑窗吸收', type: 'info' },
      metrics: {
        windowLen: `${r - l + 1}`,
        allDebt: `${allDebt}`,
        bestLen: minLen === Infinity ? '—' : `${minLen}`,
        bestSubstr: minLen === Infinity ? '无' : `"${s.substring(start, start + minLen)}"`,
      },
      ans: minLen === Infinity ? '""' : `"${s.substring(start, start + minLen)}"`,
    });

    if (allDebt === 0) {
      // 欠款全还清，收缩左边界
      while ((map.get(s[l]) || 0) < 0) {
        const lc = s[l];
        map.set(lc, (map.get(lc) || 0) + 1);
        l++;
      }

      const curWinLen = r - l + 1;
      const isBest = curWinLen < minLen;
      if (isBest) {
        minLen = curWinLen;
        start = l;
      }

      steps.push({
        s,
        t,
        l,
        r,
        debtMap: snapshotDebt(),
        allDebt,
        bestStart: start,
        bestLen: minLen,
        bestSubstr: s.substring(start, start + minLen),
        decision: `欠款全部还清！左边界压缩至极限 #${l}，当前有效窗口 [${l}..${r}] 长度 = ${curWinLen}`,
        message: `截获覆盖子串 "${s.substring(l, r + 1)}"! ${isBest ? '🎉 刷新全局最短子串纪录！' : ''}`,
        log: `Cover window [${l}..${r}] len=${curWinLen}`,
        codeLine: MIN_WINDOW_CODE_LINES.shrink,
        statusBadge: isBest ? { text: `刷新最短: ${curWinLen}`, type: 'success' } : { text: `有效覆盖: ${curWinLen}`, type: 'warning' },
        metrics: {
          windowLen: `${curWinLen}`,
          allDebt: `${allDebt}`,
          bestLen: `${minLen}`,
          bestSubstr: `"${s.substring(start, start + minLen)}"`,
        },
        ans: `"${s.substring(start, start + minLen)}"`,
      });

      // 弹出必需字符
      const popChar = s[l];
      map.set(popChar, (map.get(popChar) || 0) + 1);
      allDebt++;
      l++;
    }

    r++;
  }

  const finalAns = minLen === Infinity ? '' : s.substring(start, start + minLen);
  steps.push({
    s,
    t,
    l,
    r: s.length - 1,
    debtMap: snapshotDebt(),
    allDebt,
    bestStart: start,
    bestLen: minLen === Infinity ? 0 : minLen,
    bestSubstr: finalAns,
    decision: `滑窗全流程结束！最终最小覆盖子串 = "${finalAns}"`,
    message: `遍历完毕，在 O(N) 线性时间内找到最短覆盖子串: "${finalAns}" (长度: ${finalAns.length})。`,
    log: `Finished. ans="${finalAns}"`,
    codeLine: MIN_WINDOW_CODE_LINES.finish,
    statusBadge: { text: `答案: "${finalAns}"`, type: 'success' },
    metrics: {
      windowLen: finalAns ? `${finalAns.length}` : '0',
      allDebt: `${allDebt}`,
      bestLen: finalAns ? `${finalAns.length}` : '—',
      bestSubstr: finalAns ? `"${finalAns}"` : '无',
    },
    ans: `"${finalAns}"`,
  });

  return steps;
}
