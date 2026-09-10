/**
 * 转化字符串的最少操作次数 (LeetCode 1153) - 声明式教学级沙盘渲染器
 * 核心贪心：映射单值一致性校验 + 26 字符满射死锁判定
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_093_PROBLEMS } from './greedy-093-problem-content';
import {
  STRING_TRANSFORMS_CODES,
  STRING_TRANSFORMS_LINES,
} from './greedy-093-stage-codes';
import {
  Greedy093Step,
  renderDecisionBalance,
} from './greedy-093-shared';

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
      codeLine: lines.checkCycle,
    });
  }

  return steps;
}

export const stringTransformsVisualizer = registerDeclarativeAlgorithm<StringTransformsStep>({
  id: 'string-transforms-into-another-string',
  name: '转化字符串的最少操作次数',
  category: 'greedy',
  icon: '🔤',
  difficulty: 3,
  levelOrder: 933,
  learningGoal: '掌握字符集一对多单值映射检测与26全字母满射置换死锁的拓扑判断',
  problemHtml: GREEDY_093_PROBLEMS.stringTransforms.html,
  analysisHtml: GREEDY_093_PROBLEMS.stringTransforms.html,
  inputs: [
    {
      id: 'input-str1',
      label: '源字符串 str1',
      type: 'text',
      defaultValue: 'aabcc',
      placeholder: 'aabcc',
    },
    {
      id: 'input-str2',
      label: '目标字符串 str2',
      type: 'text',
      defaultValue: 'ccdee',
      placeholder: 'ccdee',
    },
  ],
  codeLanguages: STRING_TRANSFORMS_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const str1 = String(inputs?.['input-str1'] ?? 'aabcc').trim();
    const str2 = String(inputs?.['input-str2'] ?? 'ccdee').trim();
    return buildStringTransformsSteps(str1, str2);
  },
  renderCanvas: (stageContainer: HTMLElement, step: StringTransformsStep) => {
    stageContainer.innerHTML = '';

    const mainCard = document.createElement('div');
    mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 顶部状态栏
    mainCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">目标字符集大小: <b>${step.distinctTargetChars.length}</b> / 26</span>
          <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; font-weight: 600;">映射边数: ${Object.keys(step.mapping).length} 条</span>
        </div>
        <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
          <span style="color: #64748b;">能否转换:</span>
          <span style="color: ${step.canTransform ? '#059669' : '#dc2626'}; font-weight: 800; font-size: 15px;">${step.canTransform ? 'TRUE (可以)' : 'FALSE (不可)'}</span>
        </div>
      </div>
    `;

    // 中部映射有向边看板
    const mapBox = document.createElement('div');
    mapBox.style.cssText = 'flex: 1; display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 8px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 12px; overflow-y: auto;';

    const entries = Object.entries(step.mapping);
    if (entries.length === 0) {
      mapBox.innerHTML = '<div style="color: #94a3b8; font-size: 12px; font-style: italic; display: flex; align-items: center; justify-content: center; width: 100%;">等待提取映射关系...</div>';
    } else {
      entries.forEach(([from, to]) => {
        const card = document.createElement('div');
        card.style.cssText = 'display: flex; align-items: center; justify-content: center; gap: 6px; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 6px 10px; font-family: "JetBrains Mono", monospace; font-size: 13px; font-weight: 700;';
        card.innerHTML = `
          <span style="color: #2563eb;">'${from}'</span>
          <span style="color: #94a3b8; font-size: 11px;">➔</span>
          <span style="color: #059669;">'${to}'</span>
        `;
        mapBox.appendChild(card);
      });
    }
    mainCard.appendChild(mapBox);

    // 底部天平分析
    const balanceBox = document.createElement('div');
    renderDecisionBalance(balanceBox, {
      leftTitle: '一对多冲突校验',
      leftVal: step.conflictInfo ? '存在冲突 ❌' : '无冲突 ✓',
      rightTitle: '空闲字符破环校验',
      rightVal: step.isDeadlock ? '26字满射死锁 ❌' : `有空闲字符 (${26 - step.distinctTargetChars.length}个) ✓`,
      winner: step.canTransform ? 'right' : 'left',
      reason: step.canTransform ? '无冲突且具备空闲中转字符' : (step.conflictInfo ? '一对多无法分化' : '字符集满射死锁'),
    });
    mainCard.appendChild(balanceBox);

    stageContainer.appendChild(mainCard);
  },
});

export function registerStringTransforms(): void {
  // 保持向前兼容导出
}
