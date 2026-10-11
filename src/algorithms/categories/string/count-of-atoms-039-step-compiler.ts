/**
 * Class 039: 嵌套结构递归解法母题之三：原子的数量 (Count of Atoms)
 * Step Compiler
 */

import { StepBase, HighlightTarget } from '../../../core/step-visualizer';

export interface AtomStep extends StepBase {
  formula: string;
  cursor: number;
  currentChar: string;
  depth: number;
  callStackDesc: string[];
  currentMap: Record<string, number>;
  lastAtomParsed?: string;
  lastMultiplier?: number;
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  codeLine?: HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const COUNT_OF_ATOMS_CODES = {
  java: `import java.util.*;

public class CountOfAtoms {
    // 递归返回值：当前括号层级内的原子计数表 + 结束下标
    public static class Info {
        public TreeMap<String, Integer> map;
        public int stop;
        public Info(TreeMap<String, Integer> m, int s) { map = m; stop = s; }
    }

    public static String countOfAtoms(String formula) {
        Info info = process(formula.toCharArray(), 0);
        StringBuilder sb = new StringBuilder();
        for (String atom : info.map.keySet()) {
            sb.append(atom);
            int count = info.map.get(atom);
            if (count > 1) sb.append(count);
        }
        return sb.toString();
    }

    private static Info process(char[] s, int i) {
        TreeMap<String, Integer> map = new TreeMap<>();
        while (i < s.length && s[i] != ')') {
            if (s[i] == '(') {
                // 遇到 '(' 深入下一层子括号处理
                Info next = process(s, i + 1);
                i = next.stop + 1;
                // 读取括号右侧的倍数系数
                int count = 0;
                while (i < s.length && Character.isDigit(s[i])) {
                    count = count * 10 + (s[i++] - '0');
                }
                count = (count == 0) ? 1 : count;
                // 倍数合并至当前层
                for (String atom : next.map.keySet()) {
                    map.put(atom, map.getOrDefault(atom, 0) + next.map.get(atom) * count);
                }
            } else {
                // 解析单一原子名称与频次
                StringBuilder atom = new StringBuilder().append(s[i++]);
                while (i < s.length && Character.isLowerCase(s[i])) atom.append(s[i++]);
                int count = 0;
                while (i < s.length && Character.isDigit(s[i])) {
                    count = count * 10 + (s[i++] - '0');
                }
                count = (count == 0) ? 1 : count;
                map.put(atom.toString(), map.getOrDefault(atom.toString(), 0) + count);
            }
        }
        return new Info(map, i);
    }
}`,
  cpp: `#include <string>
#include <map>
#include <cctype>
using namespace std;

class Solution {
    struct Info {
        map<string, int> countMap;
        int stop;
    };

    Info process(const string& s, int i) {
        map<string, int> countMap;
        while (i < s.size() && s[i] != ')') {
            if (s[i] == '(') {
                auto next = process(s, i + 1);
                i = next.stop + 1;
                int count = 0;
                while (i < s.size() && isdigit(s[i])) count = count * 10 + (s[i++] - '0');
                count = (count == 0) ? 1 : count;
                for (auto& p : next.countMap) countMap[p.first] += p.second * count;
            } else {
                string atom = "";
                atom += s[i++];
                while (i < s.size() && islower(s[i])) atom += s[i++];
                int count = 0;
                while (i < s.size() && isdigit(s[i])) count = count * 10 + (s[i++] - '0');
                count = (count == 0) ? 1 : count;
                countMap[atom] += count;
            }
        }
        return {countMap, i};
    }
public:
    string countOfAtoms(string formula) {
        auto info = process(formula, 0);
        string res = "";
        for (auto& p : info.countMap) {
            res += p.first;
            if (p.second > 1) res += to_string(p.second);
        }
        return res;
    }
};`,
  python: `class Solution:
    def countOfAtoms(self, formula: str) -> str:
        def process(i: int):
            ans = {}
            while i < len(formula) and formula[i] != ')':
                if formula[i] == '(':
                    sub, i = process(i + 1)
                    i += 1
                    cnt = 0
                    while i < len(formula) and formula[i].isdigit():
                        cnt = cnt * 10 + int(formula[i])
                        i += 1
                    cnt = 1 if cnt == 0 else cnt
                    for atom, v in sub.items():
                        ans[atom] = ans.get(atom, 0) + v * cnt
                else:
                    atom = formula[i]
                    i += 1
                    while i < len(formula) and formula[i].islower():
                        atom += formula[i]
                        i += 1
                    cnt = 0
                    while i < len(formula) and formula[i].isdigit():
                        cnt = cnt * 10 + int(formula[i])
                        i += 1
                    cnt = 1 if cnt == 0 else cnt
                    ans[atom] = ans.get(atom, 0) + cnt
            return ans, i

        final_map, _ = process(0)
        res = []
        for atom in sorted(final_map.keys()):
            res.append(atom)
            if final_map[atom] > 1:
                res.append(str(final_map[atom]))
        return "".join(res)`,
  typescript: `function countOfAtoms(formula: string): string {
    function process(i: number): [{ [k: string]: number }, number] {
        const map: { [k: string]: number } = {};
        while (i < formula.length && formula[i] !== ')') {
            if (formula[i] === '(') {
                const [sub, stop] = process(i + 1);
                i = stop + 1;
                let count = 0;
                while (i < formula.length && /[0-9]/.test(formula[i])) {
                    count = count * 10 + Number(formula[i++]);
                }
                count = count === 0 ? 1 : count;
                for (const atom of Object.keys(sub)) {
                    map[atom] = (map[atom] || 0) + sub[atom] * count;
                }
            } else {
                let atom = formula[i++];
                while (i < formula.length && /[a-z]/.test(formula[i])) atom += formula[i++];
                let count = 0;
                while (i < formula.length && /[0-9]/.test(formula[i])) {
                    count = count * 10 + Number(formula[i++]);
                }
                count = count === 0 ? 1 : count;
                map[atom] = (map[atom] || 0) + count;
            }
        }
        return [map, i];
    }
    const [finalMap] = process(0);
    return Object.keys(finalMap).sort().map(k => k + (finalMap[k] > 1 ? finalMap[k] : '')).join('');
}`
};

export const COUNT_OF_ATOMS_CODE_LINES = {
  entry: { java: 12, cpp: 41, python: 33, typescript: 28 },
  processEntry: { java: 21, cpp: 14, python: 4, typescript: 3 },
  whileLoop: { java: 23, cpp: 16, python: 6, typescript: 5 },
  openBracket: { java: 25, cpp: 17, python: 7, typescript: 6 },
  multiplierMerge: { java: 33, cpp: 23, python: 15, typescript: 14 },
  parseAtom: { java: 38, cpp: 25, python: 18, typescript: 18 },
  returnInfo: { java: 47, cpp: 35, python: 30, typescript: 26 },
};

export function generateCountOfAtomsSteps(formula: string = 'K4(ON(SO3)2)2'): AtomStep[] {
  const steps: AtomStep[] = [];
  const lines = COUNT_OF_ATOMS_CODE_LINES;

  steps.push({
    formula,
    cursor: 0,
    currentChar: formula[0] || '',
    depth: 0,
    callStackDesc: ['Main -> process(0)'],
    currentMap: {},
    decision: '开始执行嵌套递归原子解析',
    message: `准备解析化学分子式 "${formula}"。左程云嵌套递归模板：遇 '(' 递归深入，遇 ')' 返回当前统计字典与下标，主过程乘算合并。`,
    log: `enter countOfAtoms: formula=${formula}`,
    codeLine: lines.entry,
    metrics: { '公式长度': formula.length, '调用栈': 'process(0)' },
  });

  function simProcess(startIdx: number, depth: number, stackHistory: string[]): [{ [k: string]: number }, number] {
    const curMap: { [k: string]: number } = {};
    let i = startIdx;

    steps.push({
      formula,
      cursor: i,
      currentChar: i < formula.length ? formula[i] : 'EOF',
      depth,
      callStackDesc: [...stackHistory],
      currentMap: { ...curMap },
      decision: `进入第 ${depth} 层嵌套过程 process(${i})`,
      message: `在当前深度初始化局部频次映射字典 TreeMap<String, Integer>`,
      log: `depth ${depth}: start at index ${i}`,
      codeLine: lines.processEntry,
      metrics: { '当前下标': i, '层级': depth },
    });

    while (i < formula.length && formula[i] !== ')') {
      if (formula[i] === '(') {
        steps.push({
          formula,
          cursor: i,
          currentChar: '(',
          depth,
          callStackDesc: [...stackHistory, `遇 '(' 递归深入`],
          currentMap: { ...curMap },
          decision: `遇 '(' 深入子过程 process(${i + 1})`,
          message: `括号开始，嵌套结构递归调用：遇到嵌套符号就交给子递归，绝不在当前层纠缠匹配！`,
          log: `depth ${depth}: encounter '(', recurse to ${i + 1}`,
          codeLine: lines.openBracket,
          statusBadge: { text: `深入层级 ${depth + 1}`, type: 'info' },
        });

        const [subMap, nextI] = simProcess(i + 1, depth + 1, [...stackHistory, `process(${i + 1})`]);
        i = nextI + 1; // 跳过 ')'

        let count = 0;
        while (i < formula.length && /[0-9]/.test(formula[i])) {
          count = count * 10 + Number(formula[i++]);
        }
        count = count === 0 ? 1 : count;

        for (const atom of Object.keys(subMap)) {
          curMap[atom] = (curMap[atom] || 0) + subMap[atom] * count;
        }

        steps.push({
          formula,
          cursor: i,
          currentChar: i < formula.length ? formula[i] : 'EOF',
          depth,
          callStackDesc: [...stackHistory],
          currentMap: { ...curMap },
          lastMultiplier: count,
          decision: `子过程返回！括号倍数为 ×${count}，批量合并原子`,
          message: `子过程返回字典 ${JSON.stringify(subMap)}，外部系数为 ${count}，合并后当前层累计：${JSON.stringify(curMap)}`,
          log: `depth ${depth}: merge subMap with mult ${count} -> ${JSON.stringify(curMap)}`,
          codeLine: lines.multiplierMerge,
          statusBadge: { text: `倍数合并 ×${count}`, type: 'success' },
          metrics: { '最新下标': i, '已统计原子数': Object.keys(curMap).length },
        });
      } else {
        let atom = formula[i++];
        while (i < formula.length && /[a-z]/.test(formula[i])) {
          atom += formula[i++];
        }
        let count = 0;
        while (i < formula.length && /[0-9]/.test(formula[i])) {
          count = count * 10 + Number(formula[i++]);
        }
        count = count === 0 ? 1 : count;
        curMap[atom] = (curMap[atom] || 0) + count;

        steps.push({
          formula,
          cursor: i,
          currentChar: i < formula.length ? formula[i] : 'EOF',
          depth,
          callStackDesc: [...stackHistory],
          currentMap: { ...curMap },
          lastAtomParsed: `${atom}${count > 1 ? count : ''}`,
          decision: `识别到原子 [${atom}]，计数值 +${count}`,
          message: `解析出基础原子名 "${atom}"，独立数量 ${count}，当前层字典原子数更新为 ${curMap[atom]}`,
          log: `depth ${depth}: parsed atom ${atom} x ${count}`,
          codeLine: lines.parseAtom,
          metrics: { '当前原子': atom, '数量': count },
        });
      }
    }

    steps.push({
      formula,
      cursor: i,
      currentChar: i < formula.length ? formula[i] : 'EOF',
      depth,
      callStackDesc: [...stackHistory],
      currentMap: { ...curMap },
      decision: `层级 ${depth} 扫描遇到 '${i < formula.length ? formula[i] : 'EOF'}'，准备弹栈返回`,
      message: `打包当前层的 TreeMap 与结束位置 ${i} 返回给调用方`,
      log: `depth ${depth}: return info with map ${JSON.stringify(curMap)}, stop at ${i}`,
      codeLine: lines.returnInfo,
      statusBadge: { text: depth === 0 ? '全局完成' : '子层弹栈', type: 'info' },
    });

    return [curMap, i];
  }

  const [finalMap] = simProcess(0, 0, ['process(0)']);

  const finalFormatted = Object.keys(finalMap)
    .sort()
    .map(k => k + (finalMap[k] > 1 ? finalMap[k] : ''))
    .join('');

  steps.push({
    formula,
    cursor: formula.length,
    currentChar: 'EOF',
    depth: 0,
    callStackDesc: ['Main -> Done'],
    currentMap: { ...finalMap },
    decision: `完成全部解析，按字典序输出最终化学分子式: ${finalFormatted}`,
    message: `TreeMap 键值自动升序排列，生成符合化学规范的标准化紧凑表达式: ${finalFormatted}`,
    log: `final formatted atoms: ${finalFormatted}`,
    codeLine: lines.entry,
    statusBadge: { text: '解析完毕', type: 'success' },
    metrics: { '最终结果': finalFormatted, '独立元素数': Object.keys(finalMap).length },
  });

  return steps;
}
