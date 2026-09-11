/**
 * Class 039: 嵌套结构递归解法母题 (Nested Recursion Decode String)
 * 左程云算法通关课入门篇 Class 039 / LeetCode 394 (解码字符串)
 * 核心原语：嵌套递归通用模板——遇到 '[' 深入子过程，遇到 ']' 弹栈返回展开串与最新游标
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface DecodeStep extends StepBase {
  stepIndex?: number;
  inputStr: string;
  charIndex: number;
  currentChar: string;
  depth: number;
  multiplier: number;
  currentSegment: string;
  decodedResult: string;
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const DECODE_039_CODES = {
  java: `public class DecodeStringNested {
    // 嵌套递归通用返回值：解析结果 + 最新下标
    public static class Info {
        public String ans;
        public int stop;
        public Info(String a, int s) { ans = a; stop = s; }
    }

    public static String decodeString(String s) {
        return process(s.toCharArray(), 0).ans;
    }

    private static Info process(char[] str, int i) {
        StringBuilder sb = new StringBuilder();
        int count = 0;

        while (i < str.length && str[i] != ']') {
            if (Character.isDigit(str[i])) {
                count = count * 10 + (str[i] - '0');
                i++;
            } else if (str[i] == '[') {
                // 遇到 '[' 深入下一层子过程
                Info next = process(str, i + 1);
                for (int k = 0; k < count; k++) sb.append(next.ans);
                count = 0;
                i = next.stop + 1;
            } else {
                sb.append(str[i++]); // 普通字符直接累加
            }
        }
        return new Info(sb.toString(), i);
    }
}`,
  cpp: `class Solution {
    pair<string, int> process(const string& s, int i) {
        string res = "";
        int count = 0;
        while (i < s.size() && s[i] != ']') {
            if (isdigit(s[i])) {
                count = count * 10 + (s[i++] - '0');
            } else if (s[i] == '[') {
                auto next = process(s, i + 1);
                while (count--) res += next.first;
                count = 0;
                i = next.second + 1;
            } else {
                res += s[i++];
            }
        }
        return {res, i};
    }
public:
    string decodeString(string s) {
        return process(s, 0).first;
    }
};`,
  python: `class Solution:
    def decodeString(self, s: str) -> str:
        def process(i: int):
            res = ""
            count = 0
            while i < len(s) and s[i] != ']':
                if s[i].isdigit():
                    count = count * 10 + int(s[i])
                    i += 1
                elif s[i] == '[':
                    sub, i = process(i + 1)
                    res += sub * count
                    count = 0
                    i += 1
                else:
                    res += s[i]
                    i += 1
            return res, i
        return process(0)[0]`,
  typescript: `function decodeString(s: string): string {
    function process(i: number): [string, number] {
        let res = "";
        let count = 0;
        while (i < s.length && s[i] !== ']') {
            if (/[0-9]/.test(s[i])) {
                count = count * 10 + Number(s[i++]);
            } else if (s[i] === '[') {
                const [sub, nextI] = process(i + 1);
                for (let k = 0; k < count; k++) res += sub;
                count = 0;
                i = nextI + 1;
            } else {
                res += s[i++];
            }
        }
        return [res, i];
    }
    return process(0)[0];
}`
};

export function generateDecodeSteps(s: string = '3[a2[c]]'): DecodeStep[] {
  const steps: DecodeStep[] = [];
  const lines = {
    entry: 10,
    processEntry: 14,
    whileLoop: 18,
    isDigit: 19,
    openBracket: 23,
    appendSub: 25,
    isChar: 29,
    returnInfo: 32,
  };

  steps.push({
    inputStr: s,
    charIndex: 0,
    currentChar: s[0],
    depth: 0,
    multiplier: 0,
    currentSegment: '',
    decodedResult: '',
    decision: `启动嵌套递归字符串解码：输入串 "${s}"`,
    message: '核心范式：每个子过程只负责自己那一对括号内的内容，遇 [ 深入，遇 ] 弹栈',
    log: `Init decode string: "${s}"`,
    codeLine: lines.entry,
    statusBadge: { text: '算法就绪', type: 'info' },
  });

  function processSub(i: number, depth: number): [string, number] {
    let sb = '';
    let count = 0;

    steps.push({
      inputStr: s,
      charIndex: i,
      currentChar: s[i] || 'EOF',
      depth,
      multiplier: count,
      currentSegment: sb,
      decodedResult: sb,
      decision: `进入第 ${depth} 层递归子过程：process(i=${i})`,
      message: `开始解析当前层级括号内容`,
      log: `Enter process(i=${i}) depth=${depth}`,
      codeLine: lines.processEntry,
      statusBadge: { text: `深度 ${depth}`, type: 'info' },
    });

    while (i < s.length && s[i] !== ']') {
      const ch = s[i];
      if (/[0-9]/.test(ch)) {
        count = count * 10 + Number(ch);
        steps.push({
          inputStr: s,
          charIndex: i,
          currentChar: ch,
          depth,
          multiplier: count,
          currentSegment: sb,
          decodedResult: sb,
          decision: `读取数字 '${ch}' ➔ 累积倍数 count 更新为 ${count}`,
          message: '记录后续括号内部字串的重复翻倍系数',
          log: `Digit '${ch}' -> count=${count}`,
          codeLine: lines.isDigit,
          statusBadge: { text: `倍数: ${count}`, type: 'warning' },
        });
        i++;
      } else if (ch === '[') {
        steps.push({
          inputStr: s,
          charIndex: i,
          currentChar: ch,
          depth,
          multiplier: count,
          currentSegment: sb,
          decodedResult: sb,
          decision: `遇到 '[' ➔ 开启下一层嵌套子过程：process(i=${i + 1})`,
          message: `当前层现场暂存：count = ${count}，进入更深层级括号`,
          log: `Encounter '[' at ${i} -> dive into depth ${depth + 1}`,
          codeLine: lines.openBracket,
          statusBadge: { text: '深入嵌套', type: 'info' },
        });

        const [sub, nextI] = processSub(i + 1, depth + 1);
        let expanded = '';
        for (let k = 0; k < count; k++) expanded += sub;
        sb += expanded;

        steps.push({
          inputStr: s,
          charIndex: nextI,
          currentChar: s[nextI] || ']',
          depth,
          multiplier: 0,
          currentSegment: sb,
          decodedResult: sb,
          decision: `子过程返回子串 "${sub}" ➔ 乘以倍数 ${count} 倍 ➔ 展开得到 "${expanded}"`,
          message: `将展开字串拼入当前层，全局游标推至 ${nextI + 1}`,
          log: `Expand sub "${sub}" * ${count} -> "${expanded}", total="${sb}"`,
          codeLine: lines.appendSub,
          statusBadge: { text: `拼接展开`, type: 'success' },
        });

        count = 0;
        i = nextI + 1;
      } else {
        sb += ch;
        steps.push({
          inputStr: s,
          charIndex: i,
          currentChar: ch,
          depth,
          multiplier: count,
          currentSegment: sb,
          decodedResult: sb,
          decision: `普通字符 '${ch}' ➔ 直接追加至当前层结果串 "${sb}"`,
          message: '无需展开，原地字符合并',
          log: `Char '${ch}' appended -> "${sb}"`,
          codeLine: lines.isChar,
          statusBadge: { text: `追加 '${ch}'`, type: 'info' },
        });
        i++;
      }
    }

    steps.push({
      inputStr: s,
      charIndex: i,
      currentChar: s[i] || 'EOF',
      depth,
      multiplier: count,
      currentSegment: sb,
      decodedResult: sb,
      decision: `遇到 ']' 或串尾 (i=${i}) ➔ 当前层闭合，返回局部字串 "${sb}" 与最新游标 ${i}`,
      message: `第 ${depth} 层递归执行完毕，向上一层弹栈返回`,
      log: `Exit process depth ${depth} -> return ("${sb}", ${i})`,
      codeLine: lines.returnInfo,
      statusBadge: { text: `闭合返回`, type: 'success' },
    });

    return [sb, i];
  }

  const [finalAns] = processSub(0, 0);

  steps.push({
    inputStr: s,
    charIndex: s.length,
    currentChar: 'EOF',
    depth: 0,
    multiplier: 0,
    currentSegment: finalAns,
    decodedResult: finalAns,
    decision: `🎉 整个字符串解码圆满完成！最终展开结果: "${finalAns}"`,
    message: '嵌套递归消除显式栈的复杂状态管理，天然利用系统调用栈处理任意多层嵌套',
    log: `Final decoded result = "${finalAns}"`,
    codeLine: lines.entry,
    statusBadge: { text: '解码成功', type: 'success' },
  });

  return steps;
}

export function renderDecodeCanvas(container: HTMLElement, step: DecodeStep): void {
  container.innerHTML = `
    <div style="padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 核心指标看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">当前递归嵌套深度 (Depth)</div>
          <div style="font-size: 22px; font-weight: bold; color: #38bdf8; margin-top: 4px;">
            第 ${step.depth} 层递归
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">当前累积倍数 (Count)</div>
          <div style="font-size: 22px; font-weight: bold; color: #fbbf24; margin-top: 4px;">
            ${step.multiplier > 0 ? `${step.multiplier} 倍` : '待定'}
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">当前展开结果 (Decoded)</div>
          <div style="font-size: 18px; font-family: monospace; font-weight: bold; color: #34d399; margin-top: 6px;">
            "${step.decodedResult}"
          </div>
        </div>
      </div>

      <!-- 字符串扫描标尺沙盘 -->
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px;">
          字符序列扫描卡尺 (游标 i 指向当前正在解析的字符)
        </div>

        <div style="display: flex; gap: 6px; overflow-x: auto; padding: 6px 0;">
          ${step.inputStr.split('').map((char, idx) => {
            const isCurrent = idx === step.charIndex;
            const isPassed = idx < step.charIndex;
            return `
              <div style="
                min-width: 36px;
                height: 44px;
                background: ${isCurrent ? '#0284c7' : isPassed ? '#1e293b' : 'rgba(30,41,59,0.5)'};
                border: ${isCurrent ? '2px solid #38bdf8' : '1px solid #475569'};
                border-radius: 6px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                box-shadow: ${isCurrent ? '0 0 10px rgba(56,189,248,0.5)' : 'none'};
              ">
                <div style="font-size: 15px; font-weight: bold; color: ${isCurrent ? '#fff' : isPassed ? '#94a3b8' : '#cbd5e1'};">${char}</div>
                <div style="font-size: 9px; color: #64748b;">${idx}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 原理卡片 -->
      ${renderFormulaCard(
        '嵌套结构递归大一统模型',
        '任何包含括号或层级嵌套的问题（字符串解码、带括号四则运算、化学分子式展开、嵌套 JSON 语法解析），均可使用统一套路：递归函数从当前位置出发，遇到左嵌套符号递归深入下一层，遇到右嵌套符号连同最新游标一同返回，主过程将子串乘以倍数后接续扫描！',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const nestedRecursionDecode039Visualizer = registerDeclarativeAlgorithm<DecodeStep>({
  id: 'nested-recursion-decode-039',
  name: 'Class 039: 嵌套结构递归解法母题 (Decode String)',
  category: 'string',
  icon: '🪆',
  difficulty: 2,
  levelOrder: 39,
  learningGoal: '掌握处理所有嵌套括号/倍数结构的统一递归解法模板，理解系统调用栈天然处理任意多层嵌套的机制',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 039 / LeetCode 394)</h3>
      <p>给定一个经过编码的字符串，返回它解码后的字符串。编码规则为: <code>k[encoded_string]</code>，表示其中方括号内部的 <code>encoded_string</code> 正好重复 <code>k</code> 次：</p>
      <ul>
        <li><strong>嵌套递归思想</strong>：
          <br/>1. 遇到数字：累加计算重复系数 <code>count</code>。
          <br/>2. 遇到 <code>[</code>：发起子递归 <code>process(i + 1)</code> 深入下一层。
          <br/>3. 遇到 <code>]</code> 或串尾：子过程返回 <code>{ ans, stopIndex }</code>，主过程将 <code>ans</code> 乘以 <code>count</code> 拼入自身，游标推至 <code>stopIndex + 1</code>。</li>
        <li><strong>通用价值</strong>：这套递归模板可以毫无修改地迁移至复杂表达式计算器（LeetCode 772）与分子式原子统计（LeetCode 726）。</li>
      </ul>
    </div>
  `,
  codeLanguages: DECODE_039_CODES,
  inputs: [
    {
      id: 'inputStr',
      label: '待解码字符串',
      type: 'select',
      defaultValue: '3[a2[c]]',
      options: [
        { label: '多层深度嵌套: 3[a2[c]] ➔ accaccacc', value: '3[a2[c]]' },
        { label: '并列嵌套组合: 3[a]2[bc] ➔ aaabcbc', value: '3[a]2[bc]' },
      ],
    },
  ],
  generateSteps: (input) => {
    const s = String(input.inputStr || '3[a2[c]]');
    return generateDecodeSteps(s);
  },
  renderCanvas: (container, step) => {
    renderDecodeCanvas(container, step);
  },
});
