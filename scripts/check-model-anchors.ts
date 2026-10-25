import { AlgorithmModelRepository } from './src/core/model-repository';

const model = AlgorithmModelRepository.getModel('coins-from-piles');
const s3 = (model.stages as any)['stage-3'];
console.log('s3 anchorMap:', s3?.anchorMap);
console.log('s3 variants standard anchorMap:', s3?.variants?.standard?.anchorMap);
console.log('s3 variants standard code:', Object.keys(s3?.variants?.standard?.code || {}));
