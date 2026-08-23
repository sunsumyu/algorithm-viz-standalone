import { buildTreeTemplate } from './tree-template';
export default buildTreeTemplate({
  prefix: 'mg-',
  title: '合并二叉树',
  subtitle: 'LeetCode 617',
  accentA: 'rgb(166,227,161)',
  accentB: 'rgb(249,226,175)',
  tip: '💡 两棵二叉树节点合并，对应位置相加',
  icon: '🤝',
  extraStats: [
    { id: 'val1', label: '树1值' },
    { id: 'val2', label: '树2值' },
  ],
  exampleButtons: '<button class="mg-ex-btn" data-id="1">示例 1</button><button class="mg-ex-btn" data-id="2">示例 2</button><button class="mg-ex-btn" data-id="3">示例 3</button>',
  examplePanel: '<div style="padding:.8rem;display:flex;gap:.5rem;flex-direction:column"><div style="display:flex;gap:.5rem"><input class="mg-inp" id="mg-inp1" placeholder="树1数组" value="1,3,2,5"><input class="mg-inp" id="mg-inp2" placeholder="树2数组" value="2,1,3,null,4,null,7"></div><button class="mg-ex-btn" id="mg-run">运行</button></div>',
});
