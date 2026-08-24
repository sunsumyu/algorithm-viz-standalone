import { describe, it, expect } from 'vitest';
import { YamlModelLoader } from './yaml-model-loader';
import uniquePathsYaml from '../algorithms/specs/models/unique-paths.yaml?raw';

describe('YamlModelLoader', () => {
  it('should successfully parse unique-paths.yaml into a valid model', () => {
    const model = YamlModelLoader.load(uniquePathsYaml);
    expect(model.id).toBe('unique-paths');
    expect(model.name).toBe('不同路径');
    expect(model.directions.forward).toBeDefined();
    expect(model.directions.reverse).toBeDefined();
    expect(model.stages['stage-1']).toBeDefined();
    expect(model.stages['stage-4']).toBeDefined();
  });

  it('should compile code snippets with @step anchors correctly', () => {
    const model = YamlModelLoader.load(uniquePathsYaml);
    const stage1Config = YamlModelLoader.getCompiledStageConfig(model, 'stage-1', 'forward');
    expect(stage1Config.name).toContain('阶段 1');
    expect(stage1Config.codeTitle).toBe('NaiveRecursiveForward.java');
    expect(stage1Config.codeHtml).toContain('data-line="1"');
    expect(stage1Config.anchorMap?.entry).toBeDefined();
    expect(stage1Config.anchorMap?.boundary).toBeDefined();
    expect(stage1Config.anchorMap?.branch_down).toBeDefined();
    expect(stage1Config.anchorMap?.branch_right).toBeDefined();
    expect(stage1Config.anchorMap?.combine).toBeDefined();
  });

  it('should compile stage-4 variants correctly for both forward and reverse', () => {
    const model = YamlModelLoader.load(uniquePathsYaml);
    const stage4Forward = YamlModelLoader.getCompiledStageConfig(model, 'stage-4', 'forward');
    expect(stage4Forward.variants?.if).toBeDefined();
    expect(stage4Forward.variants?.for).toBeDefined();
    expect(stage4Forward.variants?.if.title).toContain('内嵌 if 版');

    const stage4Reverse = YamlModelLoader.getCompiledStageConfig(model, 'stage-4', 'reverse');
    expect(stage4Reverse.variants?.if.title).toContain('内嵌 if 版');
    expect(stage4Reverse.variants?.for.title).toContain('外层 for 版');
  });
});
