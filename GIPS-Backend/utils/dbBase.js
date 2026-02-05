const PocketBase = require('pocketbase/cjs');
const { BASE_URL } = require('./base');

const pb = new PocketBase(BASE_URL);
pb.autoCancellation(false);

module.exports = pb;
