import { ALL_ALGORITHM_METADATA } from '../src/core/algorithm-catalog.generated';
import { AlgorithmModelRepository } from '../src/core/model-repository';
import '../src/core/strategies';
import { AlgorithmStrategyRegistry } from '../src/core/strategies/algorithm-strategy-registry';

async function main() {
  console.log(`Total algorithms in catalog: ${ALL_ALGORITHM_METADATA.length}`);
  
  const categoryCounts: Record<string, { total: number; hasModel: number; hasStrategy: number }> = {};
  const unmigratedByCategory: Record<string, string[]> = {};

  for (const item of ALL_ALGORITHM_METADATA) {
    const cat = item.category || 'unknown';
    if (!categoryCounts[cat]) {
      categoryCounts[cat] = { total: 0, hasModel: 0, hasStrategy: 0 };
      unmigratedByCategory[cat] = [];
    }
    categoryCounts[cat].total++;

    const hasM = AlgorithmModelRepository.hasModel(item.id);
    const hasS = AlgorithmStrategyRegistry.has(item.id);

    if (hasM) categoryCounts[cat].hasModel++;
    if (hasS) categoryCounts[cat].hasStrategy++;

    if (!hasM || !hasS) {
      unmigratedByCategory[cat].push(item.id);
    }
  }

  console.log('\n--- Category Overview ---');
  for (const [cat, stat] of Object.entries(categoryCounts)) {
    console.log(`${cat.padEnd(20)}: Total=${String(stat.total).padStart(3)}, HasModel=${String(stat.hasModel).padStart(3)}, HasStrategy=${String(stat.hasStrategy).padStart(3)}`);
  }

  console.log('\n--- Greedy Unmigrated (Missing Model or Strategy) ---');
  console.log(unmigratedByCategory['greedy']);

  console.log('\n--- Dynamic Programming Unmigrated (Missing Model or Strategy) ---');
  console.log(unmigratedByCategory['dynamic-programming']);
}

main().catch(console.error);
