/**
 * 根据字符出现频率排序 — 步进推演编译器
 * 桶排序 (Bucket Sort) + 哈希词频统计
 */

import { StepBase } from '../../../core/step-visualizer';

export interface FrequencySortStep extends StepBase {
  s: string;
  charCounts: Record<string, number>;
  buckets: string[][];
  currentBucketFreq: number;
  resultStr: string;
  decision: string;
  metrics?: Record<string, string>;
  message: string;
  log: string;
  codeLine: Record<string, number>;
}

export const FREQ_SORT_CODES = {
  java: `public class Solution {
    public String frequencySort(String s) {
        Map<Character, Integer> counts = new HashMap<>();
        for (char c : s.toCharArray()) counts.put(c, counts.getOrDefault(c, 0) + 1);
        List<Character>[] buckets = new List[s.length() + 1];
        for (char c : counts.keySet()) {
            int f = counts.get(c);
            if (buckets[f] == null) buckets[f] = new ArrayList<>();
            buckets[f].add(c);
        }
        StringBuilder sb = new StringBuilder();
        for (int f = buckets.length - 1; f > 0; f--) {
            if (buckets[f] != null) {
                for (char c : buckets[f]) {
                    for (int i = 0; i < f; i++) sb.append(c);
                }
            }
        }
        return sb.toString();
    }
}`,
  cpp: `class Solution {
public:
    string frequencySort(string s) {
        unordered_map<char, int> counts;
        for (char c : s) counts[c]++;
        vector<vector<char>> buckets(s.size() + 1);
        for (auto& [c, f] : counts) buckets[f].push_back(c);
        string res = "";
        for (int f = s.size(); f > 0; --f) {
            for (char c : buckets[f]) {
                res.append(f, c);
            }
        }
        return res;
    }
};`,
  python: `class Solution:
    def frequencySort(self, s: str) -> str:
        counts = collections.Counter(s)
        buckets = [[] for _ in range(len(s) + 1)]
        for char, freq in counts.items():
            buckets[freq].append(char)
        res = []
        for freq in range(len(s), 0, -1):
            for char in buckets[freq]:
                res.append(char * freq)
        return "".join(res)`,
  javascript: `function frequencySort(s) {
    const counts = {};
    for (const c of s) counts[c] = (counts[c] || 0) + 1;
    const buckets = Array.from({ length: s.length + 1 }, () => []);
    for (const c in counts) buckets[counts[c]].push(c);
    let res = "";
    for (let f = s.length; f > 0; f--) {
        for (const c of buckets[f]) {
            res += c.repeat(f);
        }
    }
    return res;
}`
};

const CODE_LINES = {
  entry: { java: 2, cpp: 4, python: 2, javascript: 1 },
  count: { java: 4, cpp: 6, python: 3, javascript: 3 },
  buildBuckets: { java: 6, cpp: 8, python: 5, javascript: 5 },
  loopBuckets: { java: 13, cpp: 10, python: 8, javascript: 7 },
  appendChars: { java: 16, cpp: 12, python: 10, javascript: 9 },
  returnAns: { java: 20, cpp: 15, python: 11, javascript: 12 }
};

export function buildFrequencySortSteps(s: string): FrequencySortStep[] {
  const steps: FrequencySortStep[] = [];
  const n = s.length;

  // Step 0: 入口
  steps.push({
    s,
    charCounts: {},
    buckets: [],
    currentBucketFreq: -1,
    resultStr: '',
    decision: `主函数入口：输入字符串 "${s}" (长度 ${n})`,
    message: '准备统计词频并使用桶排序（Bucket Sort）在 O(N) 线性时间内完成频次降序重构',
    log: `enter frequencySort("${s}")`,
    codeLine: CODE_LINES.entry,
    metrics: { '字符串长度': `${n}`, '当前状态': '准备词频统计' }
  });

  // Step 1: 统计词频
  const counts: Record<string, number> = {};
  for (const c of s) {
    counts[c] = (counts[c] || 0) + 1;
  }
  const countDesc = Object.entries(counts).map(([k, v]) => `'${k}':${v}`).join(', ');

  steps.push({
    s,
    charCounts: { ...counts },
    buckets: [],
    currentBucketFreq: -1,
    resultStr: '',
    decision: `词频统计完成: { ${countDesc} }`,
    message: '统计出每个字符出现的精确次数，频次最高不超过字符串总长度 N',
    log: `counted frequencies: ${countDesc}`,
    codeLine: CODE_LINES.count,
    metrics: { '字符种数': `${Object.keys(counts).length}`, '最高理论频次': `${n}` }
  });

  // Step 2: 建立频次桶
  const buckets: string[][] = Array.from({ length: n + 1 }, () => []);
  for (const [c, freq] of Object.entries(counts)) {
    buckets[freq].push(c);
  }

  steps.push({
    s,
    charCounts: { ...counts },
    buckets: buckets.map(b => [...b]),
    currentBucketFreq: -1,
    resultStr: '',
    decision: `建立大小为 ${n + 1} 的频次桶，各字符按出现次数归入对应桶中`,
    message: '桶下标直接对应频次，无需依赖堆排序或快速排序即可实现 O(N) 极速分流',
    log: 'buckets populated',
    codeLine: CODE_LINES.buildBuckets,
    metrics: { '桶数量': `${n + 1}`, '分桶耗时': 'O(N)' }
  });

  // Step 3: 从高到低遍历桶重构字符串
  let res = '';
  for (let f = n; f > 0; f--) {
    if (buckets[f].length > 0) {
      steps.push({
        s,
        charCounts: { ...counts },
        buckets: buckets.map(b => [...b]),
        currentBucketFreq: f,
        resultStr: res,
        decision: `考察频次 f = ${f} 的桶，包含字符: [${buckets[f].map(c => `'${c}'`).join(', ')}]`,
        message: `将该桶内所有字符各重复拼接 ${f} 次追加至结果字符串`,
        log: `process bucket f=${f}, chars: ${buckets[f].join(',')}`,
        codeLine: CODE_LINES.loopBuckets,
        metrics: { '当前提取频次': `${f}`, '当前结果长度': `${res.length}` }
      });

      for (const c of buckets[f]) {
        res += c.repeat(f);
      }

      steps.push({
        s,
        charCounts: { ...counts },
        buckets: buckets.map(b => [...b]),
        currentBucketFreq: f,
        resultStr: res,
        decision: `完成频次 ${f} 字符追加 ➔ 当前拼接结果: "${res}"`,
        message: `追加完成，继续向更低频次桶推进`,
        log: `appended chars from freq ${f}, current res="${res}"`,
        codeLine: CODE_LINES.appendChars,
        metrics: { '当前拼接串': `"${res}"`, '已收拢字符': `${res.length}/${n}` }
      });
    }
  }

  // 终态
  steps.push({
    s,
    charCounts: { ...counts },
    buckets: buckets.map(b => [...b]),
    currentBucketFreq: -1,
    resultStr: res,
    decision: `🎉 重构完成！频次降序排列结果: "${res}"`,
    message: '桶排序算法成功避免了 O(N log N) 比较排序开销，以 O(N) 完美达成',
    log: `frequencySort finished, result="${res}"`,
    codeLine: CODE_LINES.returnAns,
    metrics: { '最终结果': `"${res}"`, '时间复杂度': 'O(N)', '空间复杂度': 'O(N)' }
  });

  return steps;
}
