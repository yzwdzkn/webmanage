'use strict';
const egg = require('egg');

let workers = Number(process.argv[2] || require('os').cpus().length);
workers = workers === 1 ? 2 : workers;
console.log('workers: ', workers);
// const workers = 1;
egg.startCluster({
  workers,
  baseDir: __dirname,
});
