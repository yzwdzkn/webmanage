'use strict';

const Controller = require('egg').Controller;
const moment = require('moment');
// const tools = require('../../../tools/tools');

class gameOverviewController extends Controller {
  async index() {
    await this.ctx.render('gameDataManage/game_overview', {
      title: '统计图表',
    });
  }

  async initData() {
    const { ctx } = this;
    const { date } = ctx.query;
    try {
      const res = await this.service.gameOverview.initData(date);
      let gameList = await this.ctx.model.GameInfo.findAll({
        where: {
          is_delete: 0,
        },
        attributes: [ 'game_name' ],
      });
      gameList = gameList.map(key => { return key.game_name; });
      const time = [];
      const dates = [];
      for (let i = 24 * 60; i > 0; i -= 1) {
        time.push(moment().subtract(i, 'minutes').format('MM/DD HH:mm'));
      }
      for (let i = 30; i > 0; i -= 1) {
        dates.push(moment(date || new Date()).subtract(i, 'days').format('YYYY-MM-DD'));
      }
      const pump = {};
      const betCount = {};
      const betNum = {};
      const gold = {};
      for (const gameName of gameList) {
        // 日抽水
        // pump[gameName] = this.chartFormat(res.pump, dates, gameName);
        for (const date of dates) {
          let i = 0;
          for (const games of res.pump) {
            if (!pump[gameName]) {
              pump[gameName] = [];
            }
            // if (moment(date).isSame(games.create_time, 'day')) {
            if (date === games.create_time) {
              if (gameName === games.game_name) {
                pump[gameName].push(parseInt(games.total) || 0);
                i = 1;
                break;
              }
            }
          }
          if (i === 0) pump[gameName].push(0);
        }

        // // 投注次数
        // betCount[gameName] = this.chartFormat(res.pump, dates, gameName);
        for (const date of dates) {
          let i = 0;
          for (const games of res.betCount) {
            if (!betCount[gameName]) {
              betCount[gameName] = [];
            }
            // if (moment(date).isSame(games.create_time, 'day')) {
            if (date === games.create_time) {
              if (gameName === games.game_name) {
                betCount[gameName].push(games.count || 0);
                i = 1;
                break;
              }
            }
          }
          if (i === 0) betCount[gameName].push(0);
        }

        // // 投注分数
        // betNum[gameName] = this.chartFormat(res.pump, dates, gameName);
        for (const date of dates) {
          let i = 0;
          for (const games of res.betCount) {
            if (!betNum[gameName]) {
              betNum[gameName] = [];
            }
            // if (moment(date).isSame(games.create_time, 'day')) {
            if (date === games.create_time) {

              if (gameName === games.game_name) {
                betNum[gameName].push(games.num || 0);
                i = 1;
                break;
              }
            }
          }
          if (i === 0) betNum[gameName].push(0);
        }

        // // 输赢统计
        // gold[gameName] = this.chartFormat(res.pump, dates, gameName);
        for (const date of dates) {
          let i = 0;
          for (const games of res.betCount) {
            if (!gold[gameName]) {
              gold[gameName] = [];
            }
            // if (moment(date).isSame(games.create_time, 'day')) {
            if (date === games.create_time) {

              if (gameName === games.game_name) {
                gold[gameName].push(games.gold || 0);
                i = 1;
                break;
              }
            }
          }
          if (i === 0) gold[gameName].push(0);
        }
      }


      ctx.body = {
        code: 0,
        data: {
          time,
          dates,
          pump,
          betCount,
          betNum,
          gold,
          gameList,
        },
      };
    } catch (error) {
      ctx.body = {
        code: 1,
      };
    }
  }

  // 游戏24小时在线
  async get24HoursNum() {
    const { ctx } = this;
    const { date = new Date() } = ctx.query;
    try {
      const res = await this.service.gameOverview.onlineUsers(date);
      let gameList = [ '全部' ];
      const gameNames = await this.ctx.model.GameInfo.findAll({
        where: {
          is_delete: 0,
        },
        attributes: [ 'game_name' ],
      });
      gameList = gameList.concat(gameNames.map(key => { return key.game_name; }));
      const minutes = [];
      const time = [];
      const now = new Date(date);
      for (let i = 24 * 60; i > 0; i -= 1) {
        const a = now.getTime() - i * 60 * 1000;
        const b = new Date(a);
        const minute = `${b.getMinutes()}`.padStart(2, 0);
        const hours = `${b.getHours()}`.padStart(2, 0);
        minutes.push(`${b.getFullYear()}-${b.getMonth() + 1}-${b.getDate()} ${b.getUTCHours()}:${b.getUTCMinutes()}`);
        time.push(`${b.getMonth() + 1}/${b.getDate()} ${hours}:${minute}`);
      }
      const online = {};
      const total = [];
      for (const gameName of gameList) {
        // 24小时在线
        for (let index = 0; index < time.length; index++) {
          const t = time[index];
          let i = 0;
          if (!online[gameName]) online[gameName] = [];
          if (!total[index]) total[index] = 0;
          for (const games of res) {
            if (t === games.create_time) {
              if (gameName === games.game_name) {
                online[gameName].push(parseInt(games.total));
                total[index] += parseInt(games.total);
                i = 1;
                break;
              }
            }
          }
          if (i === 0) online[gameName].push(0);
        }
      }
      online['全部'] = total;
      ctx.body = {
        code: 0,
        data: {
          online,
          time,
          gameList,
        },
      };
    } catch (error) {
      ctx.body = {
        code: 1,
      };
    }
  }
  // chartFormat(data, dates, gameName) {
  //   const arr = [];
  //   for (const date of dates) {
  //     let i = 0;
  //     for (const games of data) {
  //       if (!arr[gameName]) {
  //         arr[gameName] = [];
  //       }
  //       // if (moment(date).isSame(games.create_time, 'day')) {
  //       if (date === games.create_time) {

  //         if (gameName === games.game_name) {
  //           arr.push(games.gold || 0);
  //           i = 1;
  //           break;
  //         }
  //       }
  //     }
  //     if (i === 0) arr.push(0);
  //   }
  //   return arr;
  // }
}

module.exports = gameOverviewController;
