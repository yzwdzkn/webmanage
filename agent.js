'use strict';
module.exports = function(agent) {
  const flagStatistic = agent.config.statisticMQ;
  const flagMQ = agent.config.MQ;
  // console.log('isOpen: ', flag);
  // 等待项目启动之后发送消息
  agent.messenger.on('egg-ready', () => {
    // 随机给个app 发送消息
    // agent.messenger.sendRandom('toAppMsg', flag);
    let statistic;
    let general = []; // 普通队列
    let all = agent.messenger.opids.concat();
    console.log('agent.messenger: ', agent.messenger.opids);
    const opids = agent.messenger.opids;
    const len = opids.length;
    /**
     * 初始化发送
     */
    if (len === 1) {
      statistic = opids[0];
      general.push(opids[0]);
      agent.messenger.sendTo(opids[0], 'startDataMQ', flagMQ);
      agent.messenger.sendTo(opids[0], 'startStatisticMQ', flagStatistic);
    } else {
      for (let i = 0; i < len; i++) {
        if (i === 0) {
          statistic = opids[i];
          console.log('startStatisticMQ: pid: ', opids[i]);
          agent.messenger.sendTo(opids[i], 'startStatisticMQ', flagStatistic);
        } else {
          general.push(opids[i]);
          console.log('startDataMQ: pid: ', opids[i]);
          agent.messenger.sendTo(opids[i], 'startDataMQ', flagMQ);
        }
      }
    }

    console.log('statistic: ', statistic); // 统计队列
    console.log('general: ', general); // 统计队列

    /**
     * 心跳
     */

    const t = setInterval(function() {
      agent.messenger.sendToApp('hb', 'isOk?');
    }, 10000);


    agent.messenger.on('hb_receive', data => {
      // console.log('################: ', data);
      if (!data.flag) {
        console.log('等待重启的进程pid: ', data.pid);
        const restartPid = agent.messenger.opids.filter(key => !all.includes(key)); // 找出重启的pid
        // const prePid = all.filter(key => !agent.messenger.opids.includes(key)); // 找出之前的pid

        const statisticFlag = agent.messenger.opids.includes(statistic); // 统计的pid 是否在更新队列中,若在则直接发送给不同的进程
        if (statisticFlag) {
          for (let i = 0; i < restartPid.length; i++) {
            agent.messenger.sendTo(restartPid[i], 'startDataMQ', flagMQ);
          }
          all = agent.messenger.opids.concat();
        } else {
          for (let i = 0; i < restartPid.length; i++) {
            if (i === 0) {
              statistic = restartPid[i];
              console.log('startStatisticMQ: pid: ', restartPid[i]);
              agent.messenger.sendTo(restartPid[i], 'startStatisticMQ', flagStatistic);
            } else {
              console.log('startDataMQ: pid: ', opids[i]);
              agent.messenger.sendTo(restartPid[i], 'startDataMQ', flagMQ);
            }
          }
          const n = agent.messenger.opids.indexOf(statistic);
          general = agent.messenger.opids.concat();
          general.splice(n, 1);
          all = agent.messenger.opids.concat();
        }


        // const trPid = temp[0];
        // const prePid = preTemp[0];
        // if (statistic.includes(prePid)) {
        //   agent.messenger.sendTo(trPid, 'startStatisticMQ', flagStatistic);
        //   const n = statistic.indexOf(prePid);
        //   statistic.splice(n, 1);
        //   statistic.push(trPid);
        // }
        // if (general.includes(prePid)) {
        //   agent.messenger.sendTo(trPid, 'startDataMQ', flagMQ);
        //   const n = general.indexOf(prePid);
        //   general.splice(n, 1);
        //   general.push(trPid);
        // }
      }
    });


    // 断线重连
    agent.messenger.on('restartStatistic', pid => {
      agent.messenger.sendTo(pid, 'startStatisticMQ');
    });

    agent.messenger.on('restartMQ', pid => {
      agent.messenger.sendTo(pid, 'startDataMQ');
    });
  });
};
