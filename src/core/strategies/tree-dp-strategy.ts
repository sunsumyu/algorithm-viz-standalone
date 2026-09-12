/**
 * 树形 DP 策略门面 (TreeDpStrategy Facade)
 * 拆分自 2703 行的 tree-dp-strategy.ts（SRP 分离）
 * 保留原类的对外接口，内部委托至各算法独立模块
 */

import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { parseTreeArray } from './tree-dp-shared';
import { compileMaxDistance } from './tree-maxdistance';
import { compileLargestBST } from './tree-largestbst';
import { compileMaxPathSum } from './tree-maxpathsum';
import { compileTreeDiameter } from './tree-treediameter';
import { compileBinaryTreeCameras } from './tree-binarytreecameras';
import { compileCourseSelection } from './tree-courseselection';
import { compileMinimumFuelCost } from './tree-minimumfuelcost';
import { compileLongestPathDifferentCharacters } from './tree-longestpathdifferentcharacters';
import { compilePartyWithoutBoss } from './tree-partywithoutboss';
import { compileHeightRemovalQueries } from './tree-heightremovalqueries';
import { compileMinimumScoreAfterRemovals } from './tree-minimumscoreafterremovals';

export type TreeDpModelId =
  | 'max-distance-in-tree'
  | 'largest-bst-subtree'
  | 'max-path-sum'
  | 'tree-diameter'
  | 'binary-tree-cameras'
  | 'course-selection'
  | 'minimum-fuel-cost'
  | 'longest-path-different-characters'
  | 'party-without-boss'
  | 'height-removal-queries'
  | 'minimum-score-after-removals';

export class TreeDpStrategy implements IAlgorithmStrategy {
  public readonly modelId: TreeDpModelId | string;

  constructor(modelId: TreeDpModelId | string) {
    this.modelId = modelId;
  }

  public canHandle(modelId: string): boolean {
    return modelId === this.modelId;
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, anchorMap } = params;
    const rawRoot = (model.defaultParams as any)?.root;

    switch (model.id) {
      case 'max-distance-in-tree':
        return compileMaxDistance(model, parseTreeArray(rawRoot || '1,2,3,4,5'), stage, anchorMap);
      case 'largest-bst-subtree':
        return compileLargestBST(model, parseTreeArray(rawRoot || '10,5,15,1,8,null,7'), stage, anchorMap);
      case 'max-path-sum':
        return compileMaxPathSum(model, parseTreeArray(rawRoot || '-10,9,20,null,null,15,7'), stage, anchorMap);
      case 'tree-diameter':
        return compileTreeDiameter(model, parseTreeArray(rawRoot || '1,2,3,4,5'), stage, anchorMap);
      case 'binary-tree-cameras':
        return compileBinaryTreeCameras(model, parseTreeArray(rawRoot || '0,0,null,0,0'), stage, anchorMap);
      case 'course-selection':
        return compileCourseSelection(model, stage, anchorMap);
      case 'minimum-fuel-cost':
        return compileMinimumFuelCost(model, stage, anchorMap);
      case 'longest-path-different-characters':
        return compileLongestPathDifferentCharacters(model, stage, anchorMap);
      case 'party-without-boss':
        return compilePartyWithoutBoss(model, stage, anchorMap);
      case 'height-removal-queries':
        return compileHeightRemovalQueries(model, stage, anchorMap);
      case 'minimum-score-after-removals':
        return compileMinimumScoreAfterRemovals(model, stage, anchorMap);
      default:
        return compileMaxDistance(model, parseTreeArray(rawRoot || '1,2,3,4,5'), stage, anchorMap);
    }
  }
}
