const RestApi = require("./restapi");
const { where } = require("./util/query");
const ref = require("./util/ref");

const createClient = (options) => new RestApi(options);

const restapi = createClient;
restapi.createClient = createClient;
restapi.debug = process.env.NODE_DEBUG && /rally/.test(process.env.NODE_DEBUG);
restapi.util = {
  query: { where },
  ref,
};

module.exports = restapi;
