/**
 * 通用动态规划模型 · 全景推演树渲染策略 (UniversalDpDeductionRenderer)
 * 作为回退兜底策略，支持全库 YAML 驱动与动态规划策略模型的通用全景推导
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { AlgorithmModelRepository } from '../../model-repository';
import { UniversalStageEngine, type UniversalStep } from '../../universal-stage-engine';
import { ProblemDimensionResolver } from '../../resolvers/problem-dimension-resolver';

export class UniversalDpDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'universal-dp';

  public canHandle(_modelId: string): boolean {
    return true; // 作为兜底策略
  }

  public render(options: StaticDeductionRenderOptions): string {
    const modelId = options.modelId;
    const hasModel = AlgorithmModelRepository.hasModel(modelId);
    const model = hasModel ? AlgorithmModelRepository.getModel(modelId) : null;
    const modelName = model?.name || modelId;

    const resolved = ProblemDimensionResolver.resolve(modelId, model?.defaultParams);
    const m = options.m ?? resolved.m ?? 3;
    const n = options.n ?? resolved.n ?? 4;
    const is1D = resolved.is1D;

    let targetStage = 3;
    if (model?.stages) {
      if (model.stages['stage-3']) targetStage = 3;
      else if (model.stages['stage-4']) targetStage = 4;
      else if (model.stages['stage-2']) targetStage = 2;
      else if (model.stages['stage-1']) targetStage = 1;
    }

    let steps: UniversalStep[] = [];
    if (model) {
      try {
        steps = UniversalStageEngine.generateSteps(model, {
          stage: targetStage,
          m,
          n,
          direction: 'forward',
        });
      } catch {
        try {
          if (targetStage !== 4 && model.stages?.['stage-4']) {
            steps = UniversalStageEngine.generateSteps(model, {
              stage: 4,
              m,
              n,
              direction: 'forward',
            });
            targetStage = 4;
          }
        } catch {}
      }
    }

    // 分拣 Base Case 步骤与推演步骤
    const baseSteps: UniversalStep[] = [];
    const loopSteps: UniversalStep[] = [];

    steps.forEach((step, idx) => {
      const isBase = (step as any).tag === 'base'
        || (step.type && step.type.toLowerCase().includes('base'))
        || (step.log && (step.log.includes('Base') || step.log.includes('边界') || step.log.includes('初始化') || step.log.includes('base case')))
        || idx === 0;

      if (isBase && loopSteps.length === 0) {
        baseSteps.push(step);
      } else {
        loopSteps.push(step);
      }
    });

    if (baseSteps.length === 0 && loopSteps.length > 0) {
      baseSteps.push(loopSteps.shift()!);
    }

    // 将 loopSteps 分组 (若为 2D 按 step.i 分组，若为 1D 按 activeSlot 或每 4 步分组)
    const groupedRounds: Array<{ roundTitle: string; roundSub: string; steps: UniversalStep[] }> = [];
    if (!is1D && loopSteps.some(s => s.i !== undefined)) {
      const groupMap = new Map<number, UniversalStep[]>();
      loopSteps.forEach(s => {
        const row = s.i ?? 0;
        if (!groupMap.has(row)) groupMap.set(row, []);
        groupMap.get(row)!.push(s);
      });
      groupMap.forEach((rSteps, row) => {
        groupedRounds.push({
          roundTitle: `【外层循环 第 ${row} 阶段 / 行】`,
          roundSub: `行索引 i=${row} · 共 ${rSteps.length} 个状态更新`,
          steps: rSteps,
        });
      });
    } else {
      const chunkSize = 4;
      for (let i = 0; i < loopSteps.length; i += chunkSize) {
        const chunk = loopSteps.slice(i, i + chunkSize);
        const startIdx = i + 1;
        const endIdx = Math.min(i + chunkSize, loopSteps.length);
        groupedRounds.push({
          roundTitle: `【推演阶段 步骤 ${startIdx} ~ ${endIdx}】`,
          roundSub: `连续推进 ${chunk.length} 个计算点`,
          steps: chunk,
        });
      }
    }

    // 格式化 Base Case 展示
    const baseLinesHtml = baseSteps.map((bStep, idx) => {
      const isLast = idx === baseSteps.length - 1;
      const connector = isLast ? '└───' : '├───';
      const logText = bStep.log || bStep.msg || `初始化基底状态 (值: ${bStep.val ?? 0})`;
      return `
        <div>
          <div class="text-slate-600 font-bold flex items-center gap-1">
            <span class="text-emerald-600">${connector}</span>
            <span>基底状态 ${bStep.i !== undefined ? `(i=${bStep.i}${bStep.j !== undefined ? `, j=${bStep.j}` : ''})` : ''}</span>
          </div>
          <div class="pl-5 text-emerald-700 font-extrabold text-[10.5px]">
            └── ${logText} ✅
          </div>
        </div>
      `;
    }).join('');

    // 格式化循环推演展示
    const roundsHtml = groupedRounds.map(round => {
      const stepItems = round.steps.map((st, sIdx) => {
        const isLast = sIdx === round.steps.length - 1;
        const connector = isLast ? '└───' : '├───';
        const coordLabel = st.i !== undefined && st.j !== undefined
          ? `(i=${st.i}, j=${st.j})`
          : (st.activeSlot !== undefined ? `槽位 [${st.activeSlot}]` : `步骤 #${sIdx + 1}`);
        const logContent = st.log || st.msg || `计算状态 ${coordLabel}`;
        const valText = st.val !== undefined ? `${st.val}` : (st.sumVal !== undefined ? `${st.sumVal}` : '已转移');

        return `
          <div class="border-b border-slate-100 last:border-b-0 pb-1.5 last:pb-0">
            <div class="font-bold text-slate-700 flex items-center gap-1.5">
              <span class="text-slate-400">${connector}</span>
              <span>推演节点 ${coordLabel}</span>
              <span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">状态转移</span>
            </div>
            <div class="pl-6 space-y-0.5 text-[10.5px] mt-1 text-slate-600">
              <div class="text-slate-700">│  ① 推演推导：${logContent}</div>
              <div class="text-emerald-700 font-bold">└── 填入状态：${valText} ✅</div>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="border border-slate-200/90 rounded-lg overflow-hidden bg-slate-50/50">
          <div class="bg-slate-100/90 px-2.5 py-1.5 border-b border-slate-200 flex items-center justify-between">
            <span class="font-bold text-slate-800 text-[11px] font-mono">${round.roundTitle}</span>
            <span class="text-[10px] text-slate-500 font-mono">${round.roundSub}</span>
          </div>
          <div class="p-2 space-y-2 font-mono text-[11px]">
            ${stepItems}
          </div>
        </div>
      `;
    }).join('');

    // 最终答案
    const lastStep = steps.length > 0 ? steps[steps.length - 1] : null;
    const finalAnswer = lastStep?.val !== undefined
      ? lastStep.val
      : (lastStep?.sumVal !== undefined ? lastStep.sumVal : '计算完成');
    const finalLog = lastStep?.log || '动态规划状态推演完成，获得最优目标解。';

    const stageConfig = model?.stages?.[`stage-${targetStage}`];
    const stateDesc = stageConfig?.card2Desc || model?.learningGoal || model?.description || '动态规划状态转移推演空间';

    const dimBadge = is1D ? `dp[${n}] (一维)` : `dp[${m}][${n}] (二维)`;

    return `
      <div class="deduction-board flex flex-col gap-3 font-sans text-xs text-slate-700 select-text pb-6">
        <!-- 头部概述与状态定义 -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-3 shadow-2xs">
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-extrabold text-blue-900 flex items-center gap-1.5 text-xs">
              <i class="fa-solid fa-tree text-blue-600"></i>
              ${modelName} · 全景推演树
            </span>
            <span class="font-mono text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
              ${dimBadge}
            </span>
          </div>
          <p class="text-[11px] text-slate-600 mb-2 leading-relaxed">
            ${stateDesc}
          </p>
          <div class="font-mono text-[10px] bg-slate-900 text-slate-200 rounded-lg p-2 leading-relaxed">
            <span class="text-emerald-400">初始状态</span>：初始化 ${dimBadge} 状态空间，开始系统化填表推导。
          </div>
        </div>

        <!-- 第一阶段：Base Case -->
        <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div class="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs mb-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            第一阶段：填 Base Case（边界条件）
          </div>
          <div class="font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-2">
            ${baseLinesHtml || '<div class="text-slate-400 text-xs">（已按基底规范完成初始化）</div>'}
          </div>
        </div>

        <!-- 第二阶段：核心状态转移推演 -->
        <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div class="font-extrabold text-slate-800 flex items-center justify-between text-xs mb-2">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-blue-500"></span>
              第二阶段：核心状态转移推演树
            </span>
            <span class="text-[10px] text-slate-400 font-mono">共推导 ${loopSteps.length} 个关键状态</span>
          </div>
          <div class="space-y-3">
            ${roundsHtml || '<div class="text-slate-400 text-xs p-2">（单步基底求解，无需扩展多重循环）</div>'}
          </div>
        </div>

        <!-- 第三阶段：返回最终结果 -->
        <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div class="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs mb-2">
            <span class="w-2 h-2 rounded-full bg-purple-500"></span>
            第三阶段：返回最终结果
          </div>
          <div class="font-mono text-[11px] bg-slate-900 text-slate-200 rounded-lg p-3 space-y-1">
            <div class="text-slate-400">${finalLog}</div>
            <div class="text-emerald-400 font-bold text-xs pt-1">
              🏆 最终返回：${finalAnswer} ✅
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
