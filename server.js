var http = require("http");
var { createLeveledTreeFromWords, randomString } = require("./index");

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.httpStatusCode = statusCode;
  }
}

const defaultHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json"
};
function withErrorHandledJsonRes(serverHandler) {
  function handleResponse(res, result) {
    if (result == null) {
      res.writeHead(204, defaultHeaders);
      res.end();
    }
    res.writeHead(200, defaultHeaders);
    res.end(JSON.stringify(result));
  }

  function handleErr(res, err) {
    console.error(err);
    res.writeHead(err.httpStatusCode || 500, err.message, { defaultHeaders });
    res.end(JSON.stringify({ errorMessage: err.message }));
  }
  return function jsonErrorHandler(req, res) {
    Promise.resolve()
      .then(() => serverHandler(req))
      .then(result => handleResponse(res, result))
      .catch(err => handleErr(res, err));
  };
}

function formatResultFromNode(host, treeKey, node) {
  return node.value != null
    ? node.value
    : node.children.map(child => `${host}/${treeKey}/${child}`);
}

const port = process.env.PORT || 8080;

const trees = new Map();

http
  .createServer(
    withErrorHandledJsonRes(function(req) {
      if (req.url === "/favicon") {
        //Get out of our logs.
        return;
      }
      if (req.method !== "GET") {
        throw new HttpError(415, "Only GET is supported");
      }
      if (!req.url.length || req.url === "/") {
        const newUrlTree = createLeveledTreeFromWords();
        const flattenedUrlTree = [].concat(...newUrlTree);
        const treeKey = randomString();
        trees.set(treeKey, flattenedUrlTree);
        setTimeout(() => trees.delete(treeKey), 1000 * newUrlTree.length);
        return formatResultFromNode(
          req.headers.host,
          treeKey,
          newUrlTree[0][0]
        );
      }
      const urlParams = req.url.substring(1).split("/");
      if (urlParams.length !== 2) {
        throw new HttpError(404, "No resources on this url pattern");
      }
      const [treeKey, nodeKey] = urlParams.map(param => param.replace("/", ""));
      const tree = trees.get(treeKey);
      if (tree == null) {
        throw new HttpError(404, "Nothing here. Too late?");
      }
      const node = tree.find(node => {
        return node.id === nodeKey;
      });
      if (node == null) {
        throw new HttpError(404, "How did you end up here?");
      }
      return formatResultFromNode(req.headers.host, treeKey, node);
    })
  )
  .listen(port);

console.log(`Site is running at :${port}`);
