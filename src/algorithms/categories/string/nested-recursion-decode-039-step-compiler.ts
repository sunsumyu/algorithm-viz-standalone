/**
 * Class 039: 嵌套结构递归解法母题 (Nested Recursion Decode String)
 * Step Compiler
 */

import { StepBase, HighlightTarget } from '../../../core/step-visualizer';

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
  codeLine?: HighlightTarget;
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

export const DECODE_039_CODE_LINES = {
  entry: { java: 10, cpp: 21, python: 19, typescript: 19 },
  processEntry: { java: 14, cpp: 3, python: 4, typescript: 3 },
  whileLoop: { java: 17, cpp: 5, python: 6, typescript: 5 },
  isDigit: { java: 19, cpp: 7, python: 8, typescript: 7 },
  openBracket: { java: 23, cpp: 9, python: 11, typescript: 9 },
  appendSub: { java: 24, cpp: 10, python: 12, typescript: 10 },
  isChar: { java: 28, cpp: 14, python: 16, typescript: 14 },
  returnInfo: { java: 31, cpp: 17, python: 18, typescript: 17 },
};

export function generateDecodeSteps(s: string = '3[a2[c]]'): DecodeStep[] {
  const steps: DecodeStep[] = [];
  const lines = DECODE_039_CODE_LINES;

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
