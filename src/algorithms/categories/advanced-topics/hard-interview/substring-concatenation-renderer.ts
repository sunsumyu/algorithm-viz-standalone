/**
 * Hard 15: 串联所有单词的子串 (Substring with Concatenation of All Words)
 * LeetCode 30 经典大厂高频双指针滑动窗口难题
 * 步长分组滑动窗口：枚举 0..wordLen-1 偏移量，利用单词频次哈希表实现 O(N) 线性窗口匹配
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase, HighlightTarget } from '../../../../core/step-visualizer';

export interface SubstringStep extends StepBase {
  stepIndex?: number;
  s: string;
  words: string[];
  wordLen: number;
  wordsCount: number;
  offset: number;
  left: number;
  right: number;
  currentWord: string;
  windowMap: Record<string, number>;
  targetMap: Record<string, number>;
  matchCount: number;
  matchedIndices: number[];
  decision: string;
  message: string;
  log: string;
  codeLine?: number | HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
  ans?: string;
}

export const SUBSTRING_CONCATENATION_CODES = {
  java: `public class SubstringConcatenation {
    public static List<Integer> findSubstring(String s, String[] words) {
        List<Integer> res = new ArrayList<>();
        if (s == null || words == null || words.length == 0) return res;

        int wordLen = words[0].length(), numWords = words.length;
        int totalLen = wordLen * numWords;
        Map<String, Integer> target = new HashMap<>();
        for (String w : words) target.put(w, target.getOrDefault(w, 0) + 1);

        // 仅需遍历 wordLen 种起点偏移量
        for (int i = 0; i < wordLen; i++) {
            int left = i, right = i, count = 0;
            Map<String, Integer> window = new HashMap<>();

            while (right + wordLen <= s.length()) {
                String sub = s.substring(right, right + wordLen);
                right += wordLen;

                if (target.containsKey(sub)) {
                    window.put(sub, window.getOrDefault(sub, 0) + 1);
                    count++;
                    while (window.get(sub) > target.get(sub)) {
                        String leftSub = s.substring(left, left + wordLen);
                        window.put(leftSub, window.get(leftSub) - 1);
                        count--;
                        left += wordLen;
                    }
                    if (count == numWords) res.add(left);
                } else {
                    window.clear();
                    count = 0;
                    left = right;
                }
            }
        }
        return res;
    }
}`,
  cpp: `class SubstringConcatenation {
public:
    static vector<int> findSubstring(string s, vector<string>& words) {
        vector<int> res;
        if (words.empty()) return res;
        int wordLen = words[0].size(), numWords = words.size();
        unordered_map<string, int> target;
        for (const auto& w : words) target[w]++;

        for (int i = 0; i < wordLen; ++i) {
            int left = i, right = i, count = 0;
            unordered_map<string, int> window;
            while (right + wordLen <= (int)s.size()) {
                string sub = s.substr(right, wordLen);
                right += wordLen;
                if (target.count(sub)) {
                    window[sub]++;
                    count++;
                    while (window[sub] > target[sub]) {
                        string leftSub = s.substr(left, wordLen);
                        window[leftSub]--;
                        count--;
                        left += wordLen;
                    }
                    if (count == numWords) res.push_back(left);
                } else {
                    window.clear(); count = 0; left = right;
                }
            }
        }
        return res;
    }
};`,
  python: `class SubstringConcatenation:
    @staticmethod
    def find_substring(s: str, words: list[str]) -> list[int]:
        if not s or not words: return []
        word_len, num_words = len(words[0]), len(words)
        import collections
        target = collections.Counter(words)
        res = []

        for i in range(word_len):
            left, right, count = i, i, 0
            window = collections.defaultdict(int)
            while right + word_len <= len(s):
                sub = s[right:right + word_len]
                right += word_len
                if sub in target:
                    window[sub] += 1
                    count += 1
                    while window[sub] > target[sub]:
                        left_sub = s[left:left + word_len]
                        window[left_sub] -= 1
                        count -= 1
                        left += word_len
                    if count == num_words:
                        res.append(left)
                else:
                    window.clear()
                    count = 0
                    left = right
        return res`,
  typescript: `export class SubstringConcatenation {
  static findSubstring(s: string, words: string[]): number[] {
    const res: number[] = [];
    if (!s || words.length === 0) return res;
    const wordLen = words[0].length, numWords = words.length;
    const target: Map<string, number> = new Map();
    for (const w of words) target.set(w, (target.get(w) || 0) + 1);

    for (let i = 0; i < wordLen; i++) {
      let left = i, right = i, count = 0;
      const window: Map<string, number> = new Map();

      while (right + wordLen <= s.length) {
        const sub = s.slice(right, right + wordLen);
        right += wordLen;
        if (target.has(sub)) {
          window.set(sub, (window.get(sub) || 0) + 1);
          count++;
          while (window.get(sub)! > target.get(sub)!) {
            const leftSub = s.slice(left, left + wordLen);
            window.set(leftSub, window.get(leftSub)! - 1);
            count--;
            left += wordLen;
          }
          if (count === numWords) res.push(left);
        } else {
          window.clear();
          count = 0;
          left = right;
        }
      }
    }
    return res;
  }
}`
};

export function generateSubstringSteps(s: string, words: string[]): SubstringStep[] {
  const steps: SubstringStep[] = [];
  const wordLen = words[0]?.length || 3;
  const numWords = words.length;

  const targetMap: Record<string, number> = {};
  for (const w of words) targetMap[w] = (targetMap[w] || 0) + 1;

  const matchedIndices: number[] = [];
  let stepIdx = 0;

  steps.push({
    stepIndex: stepIdx++,
    s,
    words,
    wordLen,
    wordsCount: numWords,
    offset: 0,
    left: 0,
    right: 0,
    currentWord: '',
    windowMap: {},
    targetMap,
    matchCount: 0,
    matchedIndices: [],
    decision: `初始化分组滑动窗口：单词长度 = ${wordLen}，单词总数 = ${numWords}，目标字典: ${JSON.stringify(targetMap)}`,
    message: '算法初始化完成，准备从偏移量 0 开始滑动窗口推导',
    log: '初始化 SubstringConcatenation',
    codeLine: 5,
    statusBadge: { text: '初始化', type: 'info' },
    metrics: {
      currentWord: '未开始',
      matchCount: `0 / ${numWords}`,
      windowRange: '[0, 0]',
      matchedIndices: '[]',
    },
    ans: '[]',
  });

  for (let offset = 0; offset < wordLen; offset++) {
    let left = offset;
    let right = offset;
    let count = 0;
    const windowMap: Record<string, number> = {};

    while (right + wordLen <= s.length) {
      const sub = s.slice(right, right + wordLen);
      right += wordLen;

      if (targetMap[sub]) {
        windowMap[sub] = (windowMap[sub] || 0) + 1;
        count++;

        while (windowMap[sub] > targetMap[sub]) {
          const leftSub = s.slice(left, left + wordLen);
          windowMap[leftSub] = (windowMap[leftSub] || 1) - 1;
          count--;
          left += wordLen;
        }

        const isFullMatch = count === numWords;
        if (isFullMatch) {
          matchedIndices.push(left);
        }

        steps.push({
          stepIndex: stepIdx++,
          s,
          words,
          wordLen,
          wordsCount: numWords,
          offset,
          left,
          right,
          currentWord: sub,
          windowMap: { ...windowMap },
          targetMap,
          matchCount: count,
          matchedIndices: [...matchedIndices],
          decision: `截取单词 "${sub}" (区间 [${right - wordLen}..${right}])：命中目标词表！窗口内有效单词数 count = ${count}/${numWords}。${isFullMatch ? `【全匹配成功！】捕获串联起始下标 ${left}！` : ''}`,
          message: `截取 "${sub}" 命中，当前有效词数 ${count}/${numWords}`,
          log: `Offset ${offset}: 词 "${sub}" -> count=${count}`,
          codeLine: 18,
          statusBadge: isFullMatch ? { text: `命中下标 ${left}`, type: 'success' } : { text: `单词 "${sub}"`, type: 'info' },
          metrics: {
            currentWord: `"${sub}"`,
            matchCount: `${count} / ${numWords}`,
            windowRange: `[${left}, ${right}]`,
            matchedIndices: `[${matchedIndices.join(', ')}]`,
          },
          ans: `[${matchedIndices.join(', ')}]`,
        });
      } else {
        for (const k in windowMap) delete windowMap[k];
        count = 0;
        left = right;

        steps.push({
          stepIndex: stepIdx++,
          s,
          words,
          wordLen,
          wordsCount: numWords,
          offset,
          left,
          right,
          currentWord: sub,
          windowMap: {},
          targetMap,
          matchCount: 0,
          matchedIndices: [...matchedIndices],
          decision: `截取单词 "${sub}"：不在目标词表中，重置当前窗口，左界直接跃迁至 ${right}`,
          message: `截取 "${sub}" 非目标词，窗口快速重置并跳跃`,
          log: `Offset ${offset}: 词 "${sub}" 无效，窗口重置`,
          codeLine: 24,
          statusBadge: { text: '重置窗口', type: 'warning' },
          metrics: {
            currentWord: `"${sub}" (无效)`,
            matchCount: `0 / ${numWords}`,
            windowRange: `[${left}, ${right}]`,
            matchedIndices: `[${matchedIndices.join(', ')}]`,
          },
          ans: `[${matchedIndices.join(', ')}]`,
        });
      }
    }
  }

  steps.push({
    stepIndex: stepIdx++,
    s,
    words,
    wordLen,
    wordsCount: numWords,
    offset: wordLen - 1,
    left: s.length,
    right: s.length,
    currentWord: '',
    windowMap: {},
    targetMap,
    matchCount: 0,
    matchedIndices: [...matchedIndices],
    decision: `全量步长窗口扫描完毕！所有完全串联的子串起始下标为：[${matchedIndices.join(', ')}]`,
    message: `扫描结束，累计找到 ${matchedIndices.length} 处完全串联子串`,
    log: `检索完毕: ${JSON.stringify(matchedIndices)}`,
    codeLine: 30,
    statusBadge: { text: `完成: ${matchedIndices.length} 处`, type: 'success' },
    metrics: {
      currentWord: '扫描完毕',
      matchCount: `${numWords} / ${numWords}`,
      windowRange: `[${s.length}, ${s.length}]`,
      matchedIndices: `[${matchedIndices.join(', ')}]`,
    },
    ans: `[${matchedIndices.join(', ')}]`,
  });

  return steps;
}

export function renderSubstringCanvas(container: HTMLElement, step: SubstringStep) {
  const { s, wordLen, left, right, currentWord, windowMap, targetMap, matchedIndices, offset } = step;

  // 1. 目标词汇状态芯片条 (Target Words Ledger)
  const wordsStatusHtml = Object.entries(targetMap).map(([word, targetFreq]) => {
    const curFreq = windowMap[word] || 0;
    const isSatisfied = curFreq === targetFreq;
    const isOverflow = curFreq > targetFreq;

    let chipBg = 'background: #f8fafc; border-color: #e2e8f0; color: #64748b;';
    let badge = `<span style="background: #e2e8f0; color: #475569; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;">${curFreq}/${targetFreq}</span>`;

    if (isSatisfied) {
      chipBg = 'background: #f0fdf4; border-color: #86efac; color: #166534;';
      badge = `<span style="background: #22c55e; color: #ffffff; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 800;">✓ ${curFreq}/${targetFreq}</span>`;
    } else if (isOverflow) {
      chipBg = 'background: #fef2f2; border-color: #fca5a5; color: #991b1b;';
      badge = `<span style="background: #ef4444; color: #ffffff; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 800;">超额 ${curFreq}/${targetFreq}</span>`;
    } else if (curFreq > 0) {
      chipBg = 'background: #eff6ff; border-color: #93c5fd; color: #1e40af;';
      badge = `<span style="background: #3b82f6; color: #ffffff; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;">${curFreq}/${targetFreq}</span>`;
    }

    return `
      <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 8px; border: 1px solid transparent; font-size: 12px; font-family: 'JetBrains Mono', monospace; font-weight: 600; ${chipBg}">
        <span>"${word}"</span>
        ${badge}
      </div>
    `;
  }).join('');

  // 2. 主串字符轨道 (Canvas Dominance 主角)
  const chars = s.split('');
  const charsHtml = chars.map((char, idx) => {
    const inWindow = idx >= left && idx < right;
    const isCurrentWordChunk = idx >= right - wordLen && idx < right;
    const isMatchStart = matchedIndices.includes(idx);
    const isLeftBoundary = idx === left;
    const isRightBoundary = idx === right - 1;

    let cellBg = '#f8fafc';
    let cellBorder = '1px solid #e2e8f0';
    let cellColor = '#475569';
    let shadow = 'none';

    if (isMatchStart) {
      cellBg = '#ecfdf5';
      cellBorder = '2px solid #10b981';
      cellColor = '#065f46';
      shadow = '0 2px 8px rgba(16, 185, 129, 0.15)';
    } else if (isCurrentWordChunk) {
      cellBg = '#eff6ff';
      cellBorder = '2px solid #3b82f6';
      cellColor = '#1d4ed8';
      shadow = '0 2px 8px rgba(59, 130, 246, 0.15)';
    } else if (inWindow) {
      cellBg = '#f0f9ff';
      cellBorder = '1px solid #7dd3fc';
      cellColor = '#0369a1';
    }

    return `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0;">
        <!-- 下标索引 -->
        <span style="font-size: 10px; font-family: 'JetBrains Mono', monospace; color: #94a3b8; font-weight: 600;">${idx}</span>

        <!-- 字符卡片 -->
        <div style="
          width: 38px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: ${cellBg};
          border: ${cellBorder};
          box-shadow: ${shadow};
          font-size: 18px;
          font-weight: 800;
          font-family: 'JetBrains Mono', monospace;
          color: ${cellColor};
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        ">
          ${char}
        </div>

        <!-- 边界与指示标记 -->
        <div style="height: 16px; display: flex; align-items: center; justify-content: center;">
          ${isLeftBoundary ? '<span style="font-size: 9px; background: #3b82f6; color: #ffffff; padding: 1px 4px; border-radius: 3px; font-weight: 800;">L</span>' : ''}
          ${isRightBoundary && !isLeftBoundary ? '<span style="font-size: 9px; background: #6366f1; color: #ffffff; padding: 1px 4px; border-radius: 3px; font-weight: 800;">R</span>' : ''}
          ${isMatchStart ? '<span style="font-size: 9px; background: #10b981; color: #ffffff; padding: 1px 4px; border-radius: 3px; font-weight: 800;">★</span>' : ''}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px; width: 100%; height: 100%; justify-content: center; padding: 12px 6px; box-sizing: border-box;">
      <!-- 顶部控制上下文与词汇账本 -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding: 0 4px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 12px; font-weight: 700; color: #0f172a;">🎯 目标单词频次账本:</span>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${wordsStatusHtml}
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: #64748b; background: #f1f5f9; padding: 4px 10px; border-radius: 6px;">
          <span>当前偏移组: <strong style="color: #2563eb;">#${offset}</strong></span>
          <span>·</span>
          <span>单词步长: <strong style="color: #0f172a;">${wordLen}</strong></span>
        </div>
      </div>

      <!-- 字符轨道滚动视口 (纯粹主画布，占据主导地位) -->
      <div style="
        display: flex;
        gap: 6px;
        align-items: center;
        overflow-x: auto;
        padding: 18px 12px;
        background: #ffffff;
        border: 1px solid #f1f5f9;
        border-radius: 12px;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
      ">
        ${charsHtml}
      </div>

      <!-- 底部滑动窗口跨度图示 -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 8px; font-size: 11px; color: #64748b;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="display: inline-flex; align-items: center; gap: 4px;">
            <span style="width: 10px; height: 10px; border-radius: 2px; background: #ecfdf5; border: 1.5px solid #10b981;"></span>
            已命中完全串联
          </span>
          <span style="display: inline-flex; align-items: center; gap: 4px;">
            <span style="width: 10px; height: 10px; border-radius: 2px; background: #eff6ff; border: 1.5px solid #3b82f6;"></span>
            当前截取单词
          </span>
          <span style="display: inline-flex; align-items: center; gap: 4px;">
            <span style="width: 10px; height: 10px; border-radius: 2px; background: #f0f9ff; border: 1px solid #7dd3fc;"></span>
            当前滑动窗口
          </span>
        </div>
        <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #94a3b8;">
          当前截取: ${currentWord ? `"${currentWord}"` : '—'}
        </span>
      </div>
    </div>
  `;
}

export const substringConcatenationVisualizer = registerDeclarativeAlgorithm<SubstringStep>({
  id: 'substring-concatenation-words',
  name: '大厂高频真题: 串联所有单词的子串 (Substring with Concatenation of All Words)',
  category: 'two-pointers',
  icon: '🔍',
  difficulty: 3,
  levelOrder: 30,
  learningGoal: '透彻掌握按定长单词步长分组滑动窗口优化技巧，将指数级回溯匹配降维至严格 O(N) 线性哈希欠账模型',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 30)</h3>
      <p>给定一个字符串 <code>s</code> 和一个字符串数组 <code>words</code>。<code>words</code> 中所有字符串 <strong>长度相同</strong>：</p>
      <ul>
        <li><code>s</code> 中的 <strong>串联子串</strong> 是指一个包含 <code>words</code> 中所有字符串以任意顺序排列连接起来的子串。</li>
        <li>返回所有串联子串在 <code>s</code> 中的开始索引。你可以按 <strong>任意顺序</strong> 返回答案。</li>
        <li><strong>破局思考</strong>：无需枚举每个字符为起点，只需按 <code>0..wordLen - 1</code> 为起点，每次前进一个 <code>wordLen</code>，完美转化为单序列滑动窗口！</li>
      </ul>
    </div>
  `,
  metrics: [
    { id: 'currentWord', label: '当前截取单词', color: '#0284c7' },
    { id: 'matchCount', label: '有效单词数', color: '#16a34a' },
    { id: 'windowRange', label: '当前窗口区间', color: '#d97706' },
    { id: 'matchedIndices', label: '已命中起始下标', color: '#9333ea' },
  ],
  codeLanguages: SUBSTRING_CONCATENATION_CODES,
  inputs: [
    {
      id: 's',
      label: '主字符串 (s)',
      type: 'text',
      defaultValue: 'barfoothefoobarman',
    },
    {
      id: 'words',
      label: '目标单词 (以逗号分隔)',
      type: 'text',
      defaultValue: 'foo, bar',
    },
  ],
  generateSteps: (input) => {
    const s = String(input.s || 'barfoothefoobarman');
    const rawWords = String(input.words || 'foo, bar');
    const words = rawWords.split(',').map(w => w.trim()).filter(Boolean);
    return generateSubstringSteps(s, words.length > 0 ? words : ['foo', 'bar']);
  },
  renderCanvas: (container, step) => {
    renderSubstringCanvas(container, step);
  },
});

