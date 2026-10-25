import { AlgorithmModelRepository } from './src/core/model-repository';
import { KnapsackFamilyStrategy } from './src/core/strategies/knapsack-family-strategy';
import { YamlModelLoader } from './src/core/yaml-model-loader';

const model = AlgorithmModelRepository.getModel('coins-from-piles');
const rawCode = (model.stages as any)['stage-3']?.code?.forward?.source;
const compiled = YamlModelLoader.compileSource(rawCode);

console.log('--- Compiled Stage 3 Code Lines ---');
compiled.cleanSource.split('\n').forEach((l, idx) => {
  console.log(`${idx + 1}: ${l}`);
});

console.log('--- Anchor Mapping ---');
console.log(compiled.anchorMap);

const strategy = new KnapsackFamilyStrategy('coins-from-piles');
const steps = strategy.generateSteps(model, { stage: 3, params: { piles: [[100,1,3],[7,8,9]], k: 2 } });
console.log('--- Steps ---');
steps.forEach((s, idx) => {
  const lineContent = compiled.cleanSource.split('\n')[(s.line || 1) - 1]?.trim();
  console.log(`Step #${idx + 1}: line=${s.line} (${lineContent}), type=${s.type}, tag="${s.tag}"`);
});
