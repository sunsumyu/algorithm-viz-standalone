import { describe, it, expect } from 'vitest';
import { ALL_ALGORITHM_METADATA } from '../algorithm-manifests-meta';
import { AlgorithmModelRepository } from '../model-repository';
import { AlgorithmStrategyRegistry } from './algorithm-strategy-registry';
import { registerBuiltinStrategies } from './index';

describe('全面动规演示算法重构完成度审计 (Comprehensive DP Visualizer Audit)', () => {
  registerBuiltinStrategies();

  const dpManifests = ALL_ALGORITHM_METADATA.filter(
    m => m.category === 'dynamic-programming'
  );

  console.log(`\n================== 开始审计动规演示算法 (共 ${dpManifests.length} 个) ==================`);

  const results: { id: string; name: string; hasModel: boolean; stages: Record<number, number>; error?: string }[] = [];

  for (const manifest of dpManifests) {
    it(`DP 算法审计: [${manifest.id}] ${manifest.name}`, () => {
      let model = null;
      try {
        model = AlgorithmModelRepository.getModel(manifest.id);
      } catch (err: any) {
        // Model might not exist
      }

      if (!model) {
        console.warn(`⚠️ 模型未装载或属于纯文章/总结页: ${manifest.id} (${manifest.name})`);
        return;
      }

      const stageCounts: Record<number, number> = {};
      let hasAnySuccess = false;

      for (const stage of [1, 2, 3, 4]) {
        try {
          const steps = AlgorithmStrategyRegistry.tryGenerate(model, {
            stage,
            m: 3,
            n: 4,
            isMemo: stage === 2,
          });
          if (steps && steps.length > 0) {
            stageCounts[stage] = steps.length;
            hasAnySuccess = true;
          } else {
            stageCounts[stage] = 0;
          }
        } catch (e: any) {
          stageCounts[stage] = -1; // error
        }
      }

      results.push({
        id: manifest.id,
        name: manifest.name,
        hasModel: Boolean(model),
        stages: stageCounts,
      });

      console.log(`算法 [${manifest.id}] ${manifest.name}: 阶段1=${stageCounts[1]}, 阶段2=${stageCounts[2]}, 阶段3=${stageCounts[3]}, 阶段4=${stageCounts[4]}`);
    });
  }
});
