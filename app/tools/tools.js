/* eslint-disable jsdoc/require-param */
/* eslint-disable eqeqeq */
'use strict';
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const createTableSql = fs.readFileSync(path.resolve(__dirname, './game_record.sql'), 'utf-8');// 初始化创建表sql
/**
     * 获取昨天的开始结束时间
     */

const getYesterday = async () => {
  const date = [];
  date.push(moment().subtract('days', 1).format('YYYY-MM-DD'));
  date.push(moment().subtract('days', 1).format('YYYY-MM-DD'));
  return date;
};

/**
   * 获取上一周的开始结束时间
   */
const getLastWeekDays = async time => {
  const date = [];
  const weekOfday = parseInt(moment(new Date(time)).format('d')); // 计算今天是这周第几天  周日为一周中的第一天
  const start = moment(new Date(time)).subtract(weekOfday + 7, 'days').format('YYYY-MM-DD'); // 周一日期
  const end = moment(new Date(time)).subtract(weekOfday + 1, 'days').format('YYYY-MM-DD'); // 周日日期
  date.push(start);
  date.push(end);
  return date;
};

/**
   * 获取上一个月的开始结束时间
   */
const getLastMonthDays = async time => {
  const date = [];
  const start = moment(new Date(time)).subtract('month', 1).format('YYYY-MM') + '-01';
  const end = moment(start).subtract('month', -1).add('days', -1)
    .format('YYYY-MM-DD');
  date.push(start);
  date.push(end);
  return date;
};

/**
   * 获取当前周的开始结束时间
   */

const getCurrWeekDays = async time => {
  const date = [];
  const weekOfday = parseInt(moment(new Date(time)).format('d')); // 计算今天是这周第几天 周日为一周中的第一天
  const start = moment(new Date(time)).subtract(weekOfday, 'days').format('YYYY-MM-DD'); // 周一日期
  const end = moment(new Date(time)).add(7 - weekOfday - 1, 'days').format('YYYY-MM-DD'); // 周日日期
  date.push(start);
  date.push(end);
  return date;
};

/**
   * 获取当前月的开始结束时间
   */
const getCurrMonthDays = async time => {
  const date = [];
  const start = moment(new Date(time)).add('month', 0).format('YYYY-MM') + '-01';
  const end = moment(start).add('month', 1).add('days', -1)
    .format('YYYY-MM-DD');
  date.push(start);
  date.push(end);
  return date;
};

/**
   * 拼接game_data 表的sql
   * @param {*} timeKey  20190624 时间字符串key
   * @param {*} obj
   */
const splitGameDataSql = async (timeKey, obj) => {
  let sql = '';
  const itemTime = timeKey.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3');
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] != 'timestamp') {
      const data = obj[keys[i]];
      sql += `("${itemTime}","${keys[i]}",${(data.totalGames || 0)},${(data.validBet || 0)},${(data.betNumber || 0)},
              ${(data.winGames || 0)},${(data.winGold || 0)},${(data.lostGames || 0)},${(data.lostGold || 0)},
              ${(data.deductGold || 0)},${data.duration || 0},now()),`;
    }
  }
  return sql;
};

/**
   * 拼接game_data 表的sql
   * @param {*} timeKey  20190624 时间字符串key
   * @param {*} obj
   */
const splitAgentDataSql = async (timeKey, obj) => {
  let sql = '';
  const itemTime = timeKey.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3');
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] != 'timestamp') {
      const [ platform_id, agent_id ] = keys[i].split('-');
      const data = obj[keys[i]];
      sql += `("${itemTime}",${platform_id},"${agent_id}",${(data.totalGames || 0)},${(data.validBet || 0)},${(data.betNumber || 0)},
                ${(data.winGames || 0)},${(data.winGold || 0)},${(data.lostGames || 0)},${(data.lostGold || 0)},
                ${(data.deductGold || 0)},${data.duration || 0},now()),`;
    }
  }
  return sql;
};

/**
   * 拼接room_data 表的sql
   * @param {*} timeKey  20190624 时间字符串key
   * @param {*} obj
   */
const splitRoomDataSql = async (timeKey, obj) => {
  let sql = '';
  const itemTime = timeKey.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3');
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] != 'timestamp') {
      const data = obj[keys[i]];
      const [ room_id, agent_id ] = keys[i].split('-');
      sql += `("${itemTime}",${room_id},${agent_id},${(data.totalGames || 0)},${(data.validBet || 0)},${(data.betNumber || 0)},
                ${(data.winGames || 0)},${(data.winGold || 0)},${(data.lostGames || 0)},${(data.lostGold || 0)},
                ${(data.deductGold || 0)},${(data.diveGames || 0)},${(data.diveGold || 0)},${(data.diveWinGames || 0)},${(data.diveWinGold || 0)},${(data.diveLostGames || 0)},
                ${data.diveLostGold || 0},${(data.killGames || 0)},${(data.killGold || 0)},${(data.killWinGames || 0)},${(data.killWinGold || 0)},
                ${(data.killLostGames || 0)},${data.killLostGold || 0},${data.duration || 0},now()),`;
    }
  }
  return sql;
};

/**
   * 拼接player_data 表的sql
   * @param {*} timeKey  20190624 时间字符串key
   * @param {*} obj
   */
const splitPlayerDataSql = async (timeKey, obj) => {
  let sql = '';
  const itemTime = timeKey.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3');
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] != 'timestamp') {
      const [ username, platform_id ] = keys[i].split('-');
      const playerDate = obj[keys[i]];
      sql += `("${itemTime}","${username}",${platform_id},${(playerDate.totalGames || 0)},${(playerDate.validBet || 0)},
            ${(playerDate.winGames || 0)},${(playerDate.winGold || 0)},${(playerDate.lostGames || 0)},${(playerDate.lostGold || 0)},
            ${(playerDate.deductGold || 0)},${(playerDate.diveGold || 0)},${(playerDate.killGold || 0)},${playerDate.duration || 0},now()),`;
    }
  }
  return sql;
};

/**
   * 拼接robot_data 表的sql
   * @param {*} timeKey  20190624 时间字符串key
   * @param {*} obj
   */
const splitRobotDataSql = async (timeKey, obj) => {
  let sql = '';
  const itemTime = timeKey.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3');
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] != 'timestamp') {
      const robotDate = obj[keys[i]];
      sql += `("${itemTime}","${keys[i]}",${(robotDate.totalGames || 0)},${(robotDate.validBet || 0)},
              ${(robotDate.winGames || 0)},${(robotDate.winGold || 0)},${(robotDate.lostGames || 0)},${(robotDate.lostGold || 0)},
              ${(robotDate.deductGold || 0)},${robotDate.duration || 0},now()),`;
    }
  }
  return sql;
};


const createRecordTableSql = tableName => {
  return createTableSql.replace('tableName', tableName);
};


module.exports = {
  getYesterday,
  getLastWeekDays,
  getLastMonthDays,
  getCurrWeekDays,
  getCurrMonthDays,
  splitGameDataSql,
  splitRoomDataSql,
  splitPlayerDataSql,
  splitRobotDataSql,
  splitAgentDataSql,
  createRecordTableSql,
};
