import { buildTreeTemplate } from './tree-template';
export default buildTreeTemplate({
  prefix: 'blc-',
  title: 'BST 最近公共祖先',
  subtitle: 'LeetCode 235',
  accentA: 'rgb(250,179,135)',
  accentB: 'rgb(166,227,161)',
  tip: '💡 利用 BST 性质，在 p 和 q 之间找到第一个节点',
  icon: '🔗',
  exampleButtons: '<button class="blc-ex-btn" data-id="1">[6,2,8,0,4,7,9], p=2,q=8</button><button class="blc-ex-btn" data-id="2">[6,2,8,0,4,7,9], p=2,q=4</button><button class="blc-ex-btn" data-id="3">[5,3,6,2,4,null,8], p=2,q=8</button>',
});
