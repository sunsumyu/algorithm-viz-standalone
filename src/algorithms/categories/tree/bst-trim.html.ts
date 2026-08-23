import { buildTreeTemplate } from './tree-template';
export default buildTreeTemplate({
  prefix: 'bt-',
  title: '修剪二叉搜索树',
  subtitle: 'LeetCode 669',
  accentA: 'rgb(166,227,161)',
  accentB: 'rgb(137,180,250)',
  tip: '💡 递归修剪，节点值<low去左子树，>high去右子树',
  icon: '✂️',
  exampleButtons: '<button class="bt-ex-btn" data-id="1">[1,0,2], low=1,high=2</button><button class="bt-ex-btn" data-id="2">[3,0,4,null,2,null,null,1], low=1,high=3</button><button class="bt-ex-btn" data-id="3">[1,0,2], low=2,high=2</button>',
});
