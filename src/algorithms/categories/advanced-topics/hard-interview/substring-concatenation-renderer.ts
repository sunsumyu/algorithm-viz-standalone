/**
 * Hard 15: 串联所有单词的子串 (Substring with Concatenation of All Words)
 * LeetCode 30 经典大厂高频双指针滑动窗口难题
 * 步长分组滑动窗口：枚举 0..wordLen-1 偏移量，利用单词频次哈希表实现 O(N) 线性窗口匹配
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../../core/step-visualizer';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

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
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
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
    message: '算法初始化',
    log: '初始化 SubstringConcatenation',
    codeLine: 5,
    statusBadge: { text: '初始化', type: 'info' }
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
          decision: `截取单词 "${sub}" (区间 [${right - wordLen}..${right}])：命中目标单词！当前窗口内有效单词数 count = ${count} / ${numWords}。${isFullMatch ? `【完全匹配！】成功捕获串联起始下标 ${left}！` : ''}`,
          message: `单词 "${sub}" 命中`,
          log: `Offset ${offset}: 词 "${sub}" -> count=${count}`,
          codeLine: 18,
          statusBadge: isFullMatch ? { text: `命中下标 ${left}`, type: 'success' } : { text: `单词 "${sub}"`, type: 'info' }
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
          message: `未命中词 "${sub}"`,
          log: `Offset ${offset}: 词 "${sub}" 无效，窗口重置`,
          codeLine: 24,
          statusBadge: { text: '重置窗口', type: 'warning' }
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
    message: `匹配完成，共 ${matchedIndices.length} 处`,
    log: `检索完毕: ${JSON.stringify(matchedIndices)}`,
    codeLine: 30,
    statusBadge: { text: `完成: ${matchedIndices.length} 处`, type: 'success' }
  });

  return steps;
}

export function renderSubstringCanvas(container: HTMLElement, step: SubstringStep) {
  const { s, wordLen, left, right, currentWord, windowMap, targetMap, matchCount, wordsCount, matchedIndices } = step;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
      <!-- 状态看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前截取单词</div>
          <div style="font-size: 14px; font-weight: bold; color: #38bdf8;">
            ${currentWord ? `"${currentWord}"` : '未开始'}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">窗口有效单词数</div>
          <div style="font-size: 14px; font-weight: bold; color: ${matchCount === wordsCount ? '#10b981' : '#f59e0b'};">
            ${matchCount} / ${wordsCount}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前窗口区间</div>
          <div style="font-size: 14px; font-weight: bold; color: #ec4899;">
            [${left}, ${right}]
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">已命中起始下标</div>
          <div style="font-size: 14px; font-weight: bold; color: #10b981;">
            [${matchedIndices.join(', ')}]
          </div>
        </div>
      </div>

      <!-- 字符串与当前窗口条带 -->
      <div style="background: rgba(15, 23, 42, 0.5); padding: 20px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto;">
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 8px; text-align: center;">主串字符窗口覆盖：</div>
        <div style="display: flex; gap: 4px; justify-content: center; align-items: flex-end; min-width: 450px;">
          ${s.split('').map((char, idx) => {
            const inWindow = idx >= left && idx < right;
            const isMatchStart = matchedIndices.includes(idx);

            let bg = 'rgba(51, 65, 85, 0.3)';
            let border = '1px solid rgba(255, 255, 255, 0.1)';

            if (isMatchStart) {
              bg = 'rgba(16, 185, 129, 0.4)';
              border = '2px solid #10b981';
            } else if (inWindow) {
              bg = 'rgba(56, 189, 248, 0.25)';
              border = '1px solid #38bdf8';
            }

            return `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                <div style="
                  width: 26px;
                  height: 36px;
                  background: ${bg};
                  border: ${border};
                  border-radius: 4px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 14px;
                  font-weight: bold;
                  color: #f8fafc;
                ">
                  ${char}
                </div>
                <div style="font-size: 9px; color: #64748b;">
                  ${idx}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 核心原理卡片 -->
      ${renderFormulaCard(
        '步长定长分组滑动窗口降维精髓',
        '所有单词长度相等时，仅需按 0..wordLen-1 的偏移量划分出独立的跳跃滑动窗口，每个窗口内以 wordLen 为步长跳进，将复杂度严格约束在 O(N) 线性水平',
        step.decision,
        step.statusBadge
      )}
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
