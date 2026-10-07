/**
 * 转化字符串的最少操作次数 (String Transforms) StepCompiler
 * 核心贪心：映射单值一致性校验 + 26 字符满射死锁判定
 */

import { STRING_TRANSFORMS_LINES } from '../../../algorithms/categories/greedy/greedy-093/greedy-093-stage-codes';
import { Greedy093Step } from '../../../algorithms/categories/greedy/greedy-093/greedy-093-shared';

export interface CharMapPair {
  from: string;
  to: string;
  idx: number;
}

export interface StringTransformsStep extends Greedy093Step {
  str1: string;
  str2: string;
  mapping: Record<string, string>;
  distinctTargetChars: string[];
  canTransform: boolean;
  conflictInfo?: string;
  isDeadlock?: boolean;
}

export function buildStringTransformsSteps(str1: string, str2: string): StringTransformsStep[] {
  const steps: StringTransformsStep[] = [];
  const lines = STRING_TRANSFORMS_LINES;

  // Step 0: 入口
  steps.push({
    str1,
    str2,
    mapping: {},
    distinctTargetChars: [],
    canTransform: false,
    decision: `主函数入口：源字符串 str1="${str1}" ➔ 目标字符串 str2="${str2}"，长度为 ${str1.length}`,
    message: '每次可将 str1 中所有的某个字母统一替换为另一个字母，需检验是否存在一对多冲突与全满射死锁',
    log: `enter canConvert(str1="${str1}", str2="${str2}")`,
    line: lines.entry.javascript,
    codeLine: lines.entry,
  });

  if (str1 === str2) {
    steps.push({
      str1,
      str2,
      mapping: {},
      distinctTargetChars: [...new Set(str2)],
      canTransform: true,
      decision: `🎉 字符串本身完全一致 (str1 == str2)，无需任何转换操作，返回 true`,
      message: '特判分支结束',
      log: 'equal guard -> true',
      line: lines.equalGuard.javascript,
      codeLine: lines.equalGuard,
    });
    return steps;
  }

  // 映射检测
  const mapping: Record<string, string> = {};
  for (let i = 0; i < str1.length; i++) {
    const a = str1[i];
    const b = str2[i];

    if (mapping[a] && mapping[a] !== b) {
      steps.push({
        str1,
        str2,
        mapping: { ...mapping },
        distinctTargetChars: [...new Set(str2.slice(0, i + 1))],
        canTransform: false,
        conflictInfo: `字符 '${a}' 既要映射为 '${mapping[a]}'，又要映射为 '${b}'`,
        decision: `❌ 发生「一对多」映射冲突！字符 '${a}' 之前映射至 '${mapping[a]}', 此处要求映射至 '${b}'。由于相同字符必须同时变动，无法满足分化转换，返回 false`,
        message: '有向图分叉冲突，无解',
        log: `conflict: '${a}' -> '${mapping[a]}' and '${b}', return false`,
        line: lines.checkMap.javascript,
        codeLine: lines.checkMap,
      });
      return steps;
    }

    mapping[a] = b;

    steps.push({
      str1,
      str2,
      mapping: { ...mapping },
      distinctTargetChars: [...new Set(str2.slice(0, i + 1))],
      canTransform: false,
      decision: `比对索引 ${i}: str1[${i}]='${a}' ➔ str2[${i}]='${b}'，记录映射关系 '${a}' ➔ '${b}'`,
      message: `当前已确认 ${Object.keys(mapping).length} 个字符的有向边`,
      log: `mapped '${a}' -> '${b}'`,
      line: lines.checkMap.javascript,
      codeLine: lines.checkMap,
    });
  }

  // 满射环死锁检验
  const set2 = [...new Set(str2)];
  const isDeadlock = set2.length === 26;

  if (isDeadlock) {
    steps.push({
      str1,
      str2,
      mapping: { ...mapping },
      distinctTargetChars: set2,
      canTransform: false,
      isDeadlock: true,
      decision: `❌ 发生「26 字符全满射死锁」！目标串 str2 占满了全部 26 个小写英文字母。在有向图存在置换环时，没有任何一个闲置字母可作为桥梁临时中转破环，必定死锁，返回 false`,
      message: '无空闲字符中转，无法破环',
      log: 'deadlock: set2 size == 26 and str1 != str2, return false',
      line: lines.checkCycle.javascript,
      codeLine: lines.checkCycle,
    });
  } else {
    steps.push({
      str1,
      str2,
      mapping: { ...mapping },
      distinctTargetChars: set2,
      canTransform: true,
      decision: `🎉 判定成功！str2 中仅包含 ${set2.length} 个不同字符（< 26），至少存在 ${26 - set2.length} 个闲置字母可作为破环临时跳板，可以成功转换，返回 true`,
      message: '贪心拓扑与临时桥接破环可行',
      log: 'success: set2 size < 26 and no conflict, return true',
      line: lines.checkCycle.javascript,
      codeLine: lines.checkCycle,
    });
  }

  return steps;
}
