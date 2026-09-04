/**
 * 模板加载器
 * 用于动态加载和注入 HTML 模板
 */

import { algorithmRegistry } from './algorithm-registry';

class TemplateLoader {
  /**
   * 注册模板（委托给 AlgorithmRegistry 深模块）
   */
  register(id: string, content: string): void {
    algorithmRegistry.registerTemplate(id, content);
    console.log(`[TemplateLoader] Registered template: ${id}`);
  }

  /**
   * 获取模板内容
   */
  get(id: string): string | undefined {
    return algorithmRegistry.getTemplate(id);
  }

  /**
   * 注入模板到指定容器
   */
  injectContent(containerId: string, content: string): void {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`[TemplateLoader] Container ${containerId} not found`);
      return;
    }

    // 清空容器并注入新内容
    container.innerHTML = content;
    console.log(`[TemplateLoader] Injected content into ${containerId}`);
  }

  /**
   * 从注册的模板中加载并注入
   */
  loadAndInject(templateId: string, containerId: string): void {
    const content = this.get(templateId);
    if (!content) {
      console.warn(`[TemplateLoader] Template ${templateId} not found`);
      return;
    }
    this.injectContent(containerId, content);
  }

  /**
   * 清除所有注册的模板
   */
  clear(): void {}
}

export const templateLoader = new TemplateLoader();