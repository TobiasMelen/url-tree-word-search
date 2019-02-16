const wordCollections = [
  ["These", "are", "the", "words", "you", "are", "looking", "for!"],
  ["Code", "pussels", "are", "pretty", "dumb"],
  ["Another", "random", "sentence"]
];

function randomString() {
  const random = Math.random()
    .toString(36)
    .substring(2);
  //This might be empty if number is 0.
  //Theoretical possibility of endless recursion.
  return random.length > 0 ? random : randomString();
}

function createNode(id, childCount, value) {
  return {
    id,
    value,
    children: Array(childCount)
      .fill(null)
      .map(() => randomString())
  };
}

function randomNrOf(nr) {
  return Math.floor(Math.random() * nr);
}

function randomItemFromArray(array) {
  return array.length > 0 ? array[randomNrOf(array.length)] : null;
}

function createLeveledTreeFromWords(
  wordCollection = wordCollections[randomNrOf(wordCollections.length - 1)],
  childNodeCounts = [2, 3]
) {
  return wordCollection.reduce(
    (levels, word, wordIndex) => {
      const parentLevel = levels[levels.length - 1];
      const flattenedNodeIds = parentLevel.reduce((result, node) => {
        result.push(...node.children);
        return result;
      }, []);
      const wordPosition = randomNrOf(flattenedNodeIds.length - 1);
      levels.push(
        flattenedNodeIds.map((nodeId, index) => {
          const isValueNode = index === wordPosition;
          const numberOfChildren =
            !isValueNode && wordIndex < wordCollection.length - 1
              ? randomItemFromArray(childNodeCounts)
              : 0;
          return createNode(
            nodeId,
            numberOfChildren,
            isValueNode ? word : null
          );
        })
      );
      return levels;
    },
    [[createNode("root", randomItemFromArray(childNodeCounts), null)]]
  );
}

module.exports = {
  createLeveledTreeFromWords,
  wordCollections,
  randomString
};
