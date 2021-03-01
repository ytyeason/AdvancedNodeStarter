const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");
const keys = require("../config/keys");

const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  // set a new property on this specific Query.
  // useCache will be set if we call .cache() on the query
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key ?? "default");

  // to make sure .cache() is chainable in query options
  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return await exec.apply(this, arguments);
  }

  // 'this' should refer to the current Query that we're trying to execute
  const key = JSON.stringify({
    ...this.getQuery(),
    collection: this.mongooseCollection.name,
  });

  // See if we have a value for 'key' in redis
  const cacheValue = await client.hget(this.hashKey, key);

  // If we do, return that
  if (cacheValue) {
    const doc = JSON.parse(cacheValue);

    // Hydrate arrays and returns mongoose document
    return Array.isArray(doc)
      ? doc.map((d) => new this.model(d))
      : new this.model(doc);
  }

  // Run the original exec function
  // We use apply function to pass in automatically any arguments that been passed in to exec as well
  // exec.apply will return type: Mongoose document / Model instance

  // The apply() method calls a function with a given this value, and arguments provided as an array
  // arguments is an Array-like object accessible inside functions that contains the values of the arguments passed to that function.
  const result = await exec.apply(this, arguments);

  // Convert mongoose document type to string, expire after 10 sec
  client.hset(this.hashKey, key, JSON.stringify(result), "EX", 10);

  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  },
};
