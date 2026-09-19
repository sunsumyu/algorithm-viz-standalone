import { describe, it, expect } from 'vitest';
import { ALL_ALGORITHM_METADATA } from './algorithm-catalog.generated';
import { algorithmRegistry } from './algorithm-registry';
import { loadAllAlgorithmBatches } from './algorithm-loader';
import { AlgorithmModelRepository } from './model-repository';
describe('Full Catalog Algorithm Audit', () => {
  it('every algorithm in catalog should resolve and satisfy repository contracts if using UniversalStageVisualizer', async () => {
    await loadAllAlgorithmBatches();

    const missingInRepo: string[] = [];
    const cannotResolve: string[] = [];
    let universalCount = 0;

    for (const meta of ALL_ALGORITHM_METADATA) {
      const entry = await algorithmRegistry.resolve(meta.id);
      if (!entry) {
        cannotResolve.push(meta.id);
        continue;
      }

      const isUniversal = entry.Visualizer?.name === 'UniquePathsVisualizer';
      if (isUniversal) {
        universalCount++;
        const has = AlgorithmModelRepository.hasModel(meta.id);
        if (!has) {
          missingInRepo.push(meta.id);
        } else {
          try {
            const model = AlgorithmModelRepository.getModel(meta.id);
            if (!model || !model.stages) {
              missingInRepo.push(`${meta.id} (invalid model structure)`);
            }
          } catch (err: any) {
            missingInRepo.push(`${meta.id} (threw: ${err.message})`);
          }
        }
      }
    }

    console.log(`[Audit] Total catalog algorithms: ${ALL_ALGORITHM_METADATA.length}`);
    console.log(`[Audit] UniversalStageVisualizer algorithms: ${universalCount}`);
    console.log(`[Audit] Missing in repo count: ${missingInRepo.length}`);
    if (missingInRepo.length > 0) {
      console.log(`[Audit] Missing IDs:`, JSON.stringify(missingInRepo, null, 2));
    }

    expect(cannotResolve).toEqual([]);
    expect(missingInRepo).toEqual([]);
  }, 180000);
});
