import { buildTreeTemplate } from './tree-template';
export default buildTreeTemplate({
  prefix: 'bg-',
  title: 'BST 转累加树',
  subtitle: 'LeetCode 538',
  accentA: 'rgb(249,226,175)',
  accentB: 'rgb(166,227,161)',
  tip: '💡 右→根→左遍历，累加和作为新值',
  icon: '💰',
  exampleButtons: '<button class="bg-ex-btn" data-id="1">[4,1,6,0,2,5,7,null,null,null,3,null,null,null,8]</button><button class="bg-ex-btn" data-id="2">[0,null,1]</button><button class="bg-ex-btn" data-id="3">[1,0,2]</button>',
});
