import { AlgorithmModelRepository } from './src/core/model-repository';
import { YamlModelLoader } from './src/core/yaml-model-loader';

const model = AlgorithmModelRepository.getModel('coins-from-piles');
const rawCode = (model.stages as any)['stage-3']?.variants?.standard?.code?.forward?.source;
const compiled = YamlModelLoader.compileSource(rawCode);

console.log('--- Compiled Lines with line numbers ---');
compiled.cleanSource.split('\n').forEach((l, idx) => {
  console.log(`Line ${idx + 1}: ${l}`);
});
console.log('--- Anchors ---', compiled.anchorMap);
