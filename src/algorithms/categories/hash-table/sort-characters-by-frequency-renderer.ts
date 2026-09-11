import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
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

export function renderFrequencySortCanvas(container: HTMLElement, step: FrequencySortStep): void {
  const { s, charCounts, buckets, currentBucketFreq, resultStr } = step;

  const freqCards = Object.entries(charCounts).map(([c, cnt]) => `
    <div style="
      padding: 6px 12px;
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    ">
      <span style="font-weight: 700; color: #38bdf8; font-size: 1.1rem;">'${c}'</span>
      <span style="color: #94a3b8; font-size: 0.8rem;">:</span>
      <span style="font-weight: 700; color: #f8fafc;">${cnt} 次</span>
    </div>
  `).join('');

  const bucketCols = buckets.map((chars, f) => {
    if (f === 0) return '';
    const isActive = f === currentBucketFreq;
    const hasItems = chars.length > 0;
    return `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        min-width: 48px;
      ">
        <div style="
          width: 46px;
          min-height: 70px;
          border-radius: 8px;
          background: ${isActive ? 'rgba(56, 189, 248, 0.25)' : (hasItems ? 'rgba(52, 211, 153, 0.15)' : 'rgba(30, 41, 59, 0.3)')};
          border: ${isActive ? '2px solid #38bdf8' : (hasItems ? '1px solid #34d399' : '1px dashed rgba(255, 255, 255, 0.1)')};
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 6px;
          box-shadow: ${isActive ? '0 0 12px rgba(56, 189, 248, 0.4)' : 'none'};
        ">
          ${chars.length ? chars.map(c => `<span style="font-weight:800; color:${isActive ? '#38bdf8' : '#34d399'}; font-size:1.1rem;">'${c}'</span>`).join('') : '<span style="color:#64748b; font-size:0.75rem;">空</span>'}
        </div>
        <span style="font-size: 0.72rem; color: ${isActive ? '#38bdf8' : '#94a3b8'}; font-weight: ${isActive ? '700' : 'normal'};">频次 ${f}</span>
      </div>
    `;
  }).reverse().join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 16px; padding: 16px; box-sizing: border-box;">
      <!-- 词频统计栏 -->
      <div style="
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.95rem; font-weight: 600; color: #f1f5f9;">📊 字符出现频次统计</span>
          <span style="font-size: 0.82rem; color: #94a3b8;">原字符串: <code style="color: #cbd5e1;">"${s}"</code></span>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          ${freqCards.length ? freqCards : '<span style="color:#64748b; font-size:0.85rem;">等待统计...</span>'}
        </div>
      </div>

      <!-- 桶矩阵与降序扫描 -->
      <div style="
        flex: 1;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.95rem; font-weight: 600; color: #f1f5f9;">🪣 频次桶阵列 (从最大频次向 1 倒序扫描)</span>
          ${currentBucketFreq > 0 ? `<span style="font-size: 0.82rem; background: #38bdf822; color: #38bdf8; padding: 2px 8px; border-radius: 6px;">当前提取: 频次 ${currentBucketFreq}</span>` : ''}
        </div>

        <div style="
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding: 12px;
          background: rgba(2, 6, 23, 0.4);
          border-radius: 8px;
          align-items: flex-end;
          min-height: 100px;
        ">
          ${bucketCols.length ? bucketCols : '<div style="color:#64748b; margin:auto; font-size:0.85rem;">等待分桶...</div>'}
        </div>

        <!-- 拼接结果展示卡片 -->
        <div style="
          padding: 14px 18px;
          background: rgba(52, 211, 153, 0.12);
          border: 1px solid rgba(52, 211, 153, 0.3);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <div style="font-size: 0.88rem; color: #94a3b8;">重构字符串 (Res):</div>
          <div style="font-size: 1.35rem; font-weight: 800; color: #34d399; font-family: monospace; letter-spacing: 0.05em;">
            ${resultStr ? `"${resultStr}"` : '<span style="color:#64748b; font-size:0.9rem;">(空)</span>'}
          </div>
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'sort-characters-by-frequency',
  name: '大厂高频真题: 根据字符出现频率排序 (Frequency Sort)',
  category: 'hash-table',
  learningGoal: '掌握哈希词频统计与基于频次的桶排序技巧，在 O(N) 线性时间内完成字符重排',
  inputs: [
    {
      id: 's',
      label: '输入字符串',
      type: 'text',
      defaultValue: 'tree',
      placeholder: '如 tree 或 ccatbb'
    }
  ],
  codeLanguages: FREQ_SORT_CODES,
  generateSteps: (inputs) => {
    const s = String(inputs.s || 'tree');
    return buildFrequencySortSteps(s.length ? s : 'tree');
  },
  renderCanvas: (container, step) => {
    renderFrequencySortCanvas(container, step as FrequencySortStep);
  }
});
