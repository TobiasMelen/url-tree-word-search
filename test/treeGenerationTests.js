import test from "ava";
import { createLeveledTreeFromWords, wordCollections } from "../index";

//This was kind of not the correct way to use ava.
test.before(t => {
  t.context = {
    treeData: wordCollections.map(collection => ({
      input: collection,
      tree: createLeveledTreeFromWords(collection)
    }))
  };
});

test("Tree should be the depth of word count + 1", t => {
  t.context.treeData.forEach(data => {
    t.is(data.tree.length, data.input.length + 1);
  });
});

test("Bottom nodes should have no children", t => {
  t.context.treeData.forEach(data => {
    const bottomChildCount = data.tree[data.tree.length - 1].reduce(
      (aggr, node) => aggr + node.children.length,
      0
    );
    t.is(bottomChildCount, 0);
  });
});

test("Every word should exist in tree, in order", t => {
  t.context.treeData.forEach(data => {
    const wordsInTree = [].concat(...data.tree).reduce((acc, node) => {
      if (node.value != null) {
        acc.push(node.value);
      }
      return acc;
    }, []);
    t.deepEqual(wordsInTree, data.input);
  });
});

test("All listed childnodes exists in tree", t => {
  t.context.treeData.forEach(data => {
    const listedChildNodes = [].concat(
      ...[].concat(...data.tree.map(level => level.map(node => node.children)))
    );
    const nodes = [].concat(...data.tree).map(node => node.id);
    listedChildNodes.forEach(childNode => {
      t.truthy(nodes.indexOf(childNode));
    });
  });
});

test("Root level of tree should only contain one node", t => {
  t.context.treeData.forEach(data => {
    t.is(data.tree[0].length, 1);
  });
});

test("All nodes should have an assigned string id", t => {
  t.context.treeData.forEach(data => {
    []
      .concat(...data.tree)
      .map(node => node.id)
      .forEach(nodeId =>
        t.is(typeof nodeId, "string", `Node has id of type ${typeof nodeId}.`)
      );
  });
});
