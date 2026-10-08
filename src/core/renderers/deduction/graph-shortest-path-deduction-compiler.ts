/**
 * 图论最短路径与松弛族全景推演树编译器深模块 (GraphShortestPathDeductionCompiler)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 统一抽象单源最短路径（Dijkstra、Bellman-Ford、SPFA、负环判定）与全源最短路（Floyd）的推演树编译流程。
 */

import { DeductionBoardPrimitives } from './deduction-board-primitives';

export interface GraphStepDef {
  connector: string;
  label: string;
  badgeHtml: string;
  detailLines: string[];
  fillLine?: string;
}

export interface GraphRoundDef {
  title: string;
  subtitle: string;
  steps: GraphStepDef[];
}

export interface GraphBaseCaseDef {
  prefix: string;
  label: string;
  valuesStr: string;
}

export interface GraphDeductionConfig {
  title: string;
  badge: string;
  descriptionHtml: string;
  initialStateText: string;
  baseCases: GraphBaseCaseDef[];
  rounds: GraphRoundDef[];
  finalReturn: {
    returnCode: string;
    answerDescription: string;
  };
}

export class GraphShortestPathDeductionCompiler {
  public static compile(config: GraphDeductionConfig): string {
    const headerHtml = DeductionBoardPrimitives.renderHeader({
      title: config.title,
      badge: config.badge,
      descriptionHtml: config.descriptionHtml,
      initialStateText: config.initialStateText,
    });

    const baseCaseHtml = DeductionBoardPrimitives.renderBaseCases(config.baseCases);

    const roundsHtml = config.rounds.map((round) =>
      DeductionBoardPrimitives.renderOuterRound({
        title: round.title,
        subtitle: round.subtitle,
        stepLinesHtml: round.steps.map((st) =>
          DeductionBoardPrimitives.renderInnerStep({
            connector: st.connector,
            label: st.label,
            badgeHtml: st.badgeHtml,
            detailLines: st.detailLines,
            fillLine: st.fillLine || '',
          })
        ).join(''),
      })
    );

    const finalHtml = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: config.finalReturn.returnCode,
      answerDescription: config.finalReturn.answerDescription,
    });

    return DeductionBoardPrimitives.wrapBoard([
      headerHtml,
      baseCaseHtml,
      ...roundsHtml,
      finalHtml,
    ].join('\n'));
  }
}
