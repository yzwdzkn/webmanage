'use strict';

const Service = require('egg').Service;
const moment = require('moment');// 时间取整

class registerMemberService extends Service {
  /**
     * 查询所有
     * @param {} params
     */
  async findList(params) {
    const username = this.app.config.defualtTouristPre;
    if (params.start_time == '') {
      params.start_time = moment(new Date()).format('YYYY-MM-DD');
    }
    if (params.end_time == '') {
      params.end_time = moment(new Date()).format('YYYY-MM-DD');
    }

    if (params.start_time != params.end_time && params.agents == 0) {
      const sql = `select (select  count(DISTINCT user_id)as userdepositpeople from orders as od LEFT JOIN (select username,id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and create_time BETWEEN '${params.start_time}' and '${params.end_time}' and ua.username not like '${username}%' )as userdepositpeople,(select  count(DISTINCT user_id)AS touristdepositpeople from orders as od LEFT JOIN (select username,id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and create_time BETWEEN '${params.start_time}' and '${params.end_time}' and ua.username like '${username}%')as touristdepositpeople,(select  sum(score) as userdepositmoney from orders as od LEFT JOIN (select username,id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and create_time BETWEEN '${params.start_time}' and '${params.end_time}' and ua.username not like '${username}%')as userdepositmoney,(select sum(score) as touristdepositmoney from orders as od LEFT JOIN (select username,id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and create_time BETWEEN '${params.start_time}' and '${params.end_time}' and ua.username like '${username}%') as touristdepositmoney ,sum(createdate BETWEEN '${params.start_time}' and '${params.end_time}' and username like '${username}%') as touristcount, sum(createdate BETWEEN '${params.start_time}' and '${params.end_time}' and username not like '${username}%') as usercount from user_account`;
      return await this.app.model.query(sql, {
        type: this.app.Sequelize.QueryTypes.SELECT,
      });
    } else if (params.start_time != params.end_time && params.agents != 0) {
      const sql = `select (select  count(DISTINCT user_id)as userdepositpeople from orders as od LEFT JOIN (select username,id,agent_id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and create_time BETWEEN '${params.start_time}' and '${params.end_time}' and ua.username not like '${username}%' and ua.agent_id='${params.agents}' )as userdepositpeople,(select  count(DISTINCT user_id)AS touristdepositpeople from orders as od LEFT JOIN (select username,id,agent_id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and create_time BETWEEN '${params.start_time}' and '${params.end_time}' and ua.username like '${username}%' and ua.agent_id='${params.agents}')as touristdepositpeople,(select  sum(score) as userdepositmoney from orders as od LEFT JOIN (select username,id,agent_id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and create_time BETWEEN '${params.start_time}' and '${params.end_time}' and ua.username not like '${username}%' and ua.agent_id='${params.agents}')as userdepositmoney,(select sum(score) as touristdepositmoney from orders as od LEFT JOIN (select username,id,agent_id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and create_time BETWEEN '${params.start_time}' and '${params.end_time}' and ua.username like '${username}%' and ua.agent_id='${params.agents}') as touristdepositmoney ,sum(createdate BETWEEN '${params.start_time}' and '${params.end_time}' and username like '${username}%' and agent_id='${params.agents}') as touristcount, sum(createdate BETWEEN '${params.start_time}' and '${params.end_time}' and username not like '${username}%' and agent_id='${params.agents}') as usercount from user_account`;
      return await this.app.model.query(sql, {
        type: this.app.Sequelize.QueryTypes.SELECT,
      });
    }
    if (params.agents == 0) {
      const sql1 = `select (select  count(DISTINCT user_id)as userdepositpeople from orders as od LEFT JOIN (select username,id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and to_days(create_time) =  to_days('${params.start_time}') and ua.username not like '${username}%' )as userdepositpeople,(select  count(DISTINCT user_id)AS touristdepositpeople from orders as od LEFT JOIN (select username,id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and to_days(create_time) =  to_days('${params.start_time}')and ua.username like '${username}%')as touristdepositpeople,(select  sum(score) as userdepositmoney from orders as od LEFT JOIN (select username,id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and to_days(create_time) =  to_days('${params.start_time}') and ua.username not like '${username}%')as userdepositmoney,(select sum(score) as touristdepositmoney from orders as od LEFT JOIN (select username,id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and to_days(create_time) =  to_days('${params.start_time}') and ua.username like '${username}%') as touristdepositmoney ,sum(to_days(createdate) =  to_days('${params.start_time}') and username like '${username}%') as touristcount, sum(to_days(createdate) =  to_days('${params.start_time}') and username not like '${username}%') as usercount from user_account`;
      const sql2 = `select (select  count(DISTINCT user_id)as userdepositpeople from orders as od LEFT JOIN (select username,id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and to_days('${params.start_time}') - to_days(create_time) = 1 and ua.username not like '${username}%' )as userdepositpeople,(select  count(DISTINCT user_id)AS touristdepositpeople from orders as od LEFT JOIN (select username,id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and to_days('${params.start_time}') - to_days(create_time) = 1 and ua.username like '${username}%')as touristdepositpeople,(select  sum(score) as userdepositmoney from orders as od LEFT JOIN (select username,id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and to_days('${params.start_time}') - to_days(create_time) = 1 and ua.username not like '${username}%')as userdepositmoney,(select sum(score) as touristdepositmoney from orders as od LEFT JOIN (select username,id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and to_days('${params.start_time}') - to_days(create_time) = 1 and ua.username like '${username}%') as touristdepositmoney ,sum(to_days('${params.start_time}') - to_days(createdate) = 1 and username like '${username}%') as touristcount, sum(to_days('${params.start_time}') - to_days(createdate) = 1 and username not like '${username}%') as usercount from user_account`;
      const sql3 = `select (select  count(DISTINCT user_id)as userdepositpeople from orders as od LEFT JOIN (select username,id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and yearweek((date_format(create_time, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY) and ua.username not like '${username}%' )as userdepositpeople,(select  count(DISTINCT user_id)AS touristdepositpeople from orders as od LEFT JOIN (select username,id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and yearweek((date_format(create_time, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY) and ua.username like '${username}%')as touristdepositpeople,(select  sum(score) as userdepositmoney from orders as od LEFT JOIN (select username,id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and yearweek((date_format(create_time, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY) and ua.username not like '${username}%')as userdepositmoney,(select sum(score) as touristdepositmoney from orders as od LEFT JOIN (select username,id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and yearweek((date_format(create_time, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY) and ua.username like '${username}%') as touristdepositmoney ,sum(yearweek((date_format(createdate, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY) and username like '${username}%') as touristcount, sum(yearweek((date_format(createdate, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY) and username not like '${username}%') as usercount from user_account`;
      const sql4 = `select (select  count(DISTINCT user_id)as userdepositpeople from orders as od LEFT JOIN (select username,id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and yearweek((date_format(create_time, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY)-1 and ua.username not like '${username}%' )as userdepositpeople,(select  count(DISTINCT user_id)AS touristdepositpeople from orders as od LEFT JOIN (select username,id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and yearweek((date_format(create_time, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY)-1 and ua.username like '${username}%')as touristdepositpeople,(select  sum(score) as userdepositmoney from orders as od LEFT JOIN (select username,id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and yearweek((date_format(create_time, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY)-1 and ua.username not like '${username}%')as userdepositmoney,(select sum(score) as touristdepositmoney from orders as od LEFT JOIN (select username,id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and yearweek((date_format(create_time, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY)-1 and ua.username like '${username}%') as touristdepositmoney ,sum(yearweek((date_format(createdate, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY)-1 and username like '${username}%') as touristcount, sum(yearweek((date_format(createdate, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY)-1 and username not like '${username}%') as usercount from user_account`;
      const today = await this.app.model.query(sql1, {
        type: this.app.Sequelize.QueryTypes.SELECT,
      });
      const yesterday = await this.app.model.query(sql2, {
        type: this.app.Sequelize.QueryTypes.SELECT,
      });
      const week = await this.app.model.query(sql3, {
        type: this.app.Sequelize.QueryTypes.SELECT,
      });
      const lastweek = await this.app.model.query(sql4, {
        type: this.app.Sequelize.QueryTypes.SELECT,
      });
      return [ ...today, ...yesterday, ...week, ...lastweek ];
    }
    const sql1 = `select (select  count(DISTINCT user_id)as userdepositpeople from orders as od LEFT JOIN (select username,id,agent_id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and to_days(create_time) =  to_days('${params.start_time}') and ua.username not like '${username}%' and ua.agent_id='${params.agents}' )as userdepositpeople,(select  count(DISTINCT user_id)AS touristdepositpeople from orders as od LEFT JOIN (select username,id,agent_id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and to_days(create_time) =  to_days('${params.start_time}')and ua.username like '${username}%' and ua.agent_id='${params.agents}')as touristdepositpeople,(select  sum(score) as userdepositmoney from orders as od LEFT JOIN (select username,id,agent_id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and to_days(create_time) =  to_days('${params.start_time}') and ua.username not like '${username}%' and ua.agent_id='${params.agents}')as userdepositmoney,(select sum(score) as touristdepositmoney from orders as od LEFT JOIN (select username,id,agent_id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and to_days(create_time) =  to_days('${params.start_time}') and ua.username like '${username}%' and ua.agent_id='${params.agents}') as touristdepositmoney ,sum(to_days(createdate) =  to_days('${params.start_time}') and username like '${username}%' and agent_id='${params.agents}') as touristcount, sum(to_days(createdate) =  to_days('${params.start_time}') and username not like '${username}%' and agent_id='${params.agents}') as usercount from user_account`;
    const sql2 = `select (select  count(DISTINCT user_id)as userdepositpeople from orders as od LEFT JOIN (select username,id,agent_id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and to_days('${params.start_time}') - to_days(create_time) = 1 and ua.username not like '${username}%' and ua.agent_id='${params.agents}')as userdepositpeople,(select  count(DISTINCT user_id)AS touristdepositpeople from orders as od LEFT JOIN (select username,id,agent_id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and to_days('${params.start_time}') - to_days(create_time) = 1 and ua.username like '${username}%' and ua.agent_id='${params.agents}')as touristdepositpeople,(select  sum(score) as userdepositmoney from orders as od LEFT JOIN (select username,id,agent_id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and to_days('${params.start_time}') - to_days(create_time) = 1 and ua.username not like '${username}%' and ua.agent_id='${params.agents}')as userdepositmoney,(select sum(score) as touristdepositmoney from orders as od LEFT JOIN (select username,id,agent_id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and to_days('${params.start_time}') - to_days(create_time) = 1 and ua.username like '${username}%' and ua.agent_id='${params.agents}') as touristdepositmoney ,sum(to_days('${params.start_time}') - to_days(createdate) = 1 and username like '${username}%'and agent_id='${params.agents}') as touristcount, sum(to_days('${params.start_time}') - to_days(createdate) = 1 and username not like '${username}%' and agent_id='${params.agents}') as usercount from user_account`;
    const sql3 = `select (select  count(DISTINCT user_id)as userdepositpeople from orders as od LEFT JOIN (select username,id,agent_id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and yearweek((date_format(create_time, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY) and ua.username not like '${username}%' and ua.agent_id='${params.agents}' )as userdepositpeople,(select  count(DISTINCT user_id)AS touristdepositpeople from orders as od LEFT JOIN (select username,id,agent_id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and yearweek((date_format(create_time, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY) and ua.username like '${username}%' and ua.agent_id='${params.agents}')as touristdepositpeople,(select  sum(score) as userdepositmoney from orders as od LEFT JOIN (select username,id,agent_id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and yearweek((date_format(create_time, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY) and ua.username not like '${username}%' and ua.agent_id='${params.agents}')as userdepositmoney,(select sum(score) as touristdepositmoney from orders as od LEFT JOIN (select username,id,agent_id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and yearweek((date_format(create_time, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY) and ua.username like '${username}%' and ua.agent_id='${params.agents}') as touristdepositmoney ,sum(yearweek((date_format(createdate, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY) and username like '${username}%' and agent_id='${params.agents}') as touristcount, sum(yearweek((date_format(createdate, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY) and username not like '${username}%' and agent_id='${params.agents}') as usercount from user_account`;
    const sql4 = `select (select  count(DISTINCT user_id)as userdepositpeople from orders as od LEFT JOIN (select username,id,agent_id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and yearweek((date_format(create_time, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY)-1 and ua.username not like '${username}%'and ua.agent_id='${params.agents}' )as userdepositpeople,(select  count(DISTINCT user_id)AS touristdepositpeople from orders as od LEFT JOIN (select username,id,agent_id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and yearweek((date_format(create_time, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY)-1 and ua.username like '${username}%' and ua.agent_id='${params.agents}')as touristdepositpeople,(select  sum(score) as userdepositmoney from orders as od LEFT JOIN (select username,id,agent_id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and yearweek((date_format(create_time, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY)-1 and ua.username not like '${username}%' and ua.agent_id='${params.agents}')as userdepositmoney,(select sum(score) as touristdepositmoney from orders as od LEFT JOIN (select username,id,agent_id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and yearweek((date_format(create_time, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY)-1 and ua.username like '${username}%' and ua.agent_id='${params.agents}') as touristdepositmoney ,sum(yearweek((date_format(createdate, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY)-1 and username like '${username}%' and agent_id='${params.agents}') as touristcount, sum(yearweek((date_format(createdate, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY)-1 and username not like '${username}%' and agent_id='${params.agents}') as usercount from user_account`;
    const today = await this.app.model.query(sql1, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });

    const yesterday = await this.app.model.query(sql2, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    const week = await this.app.model.query(sql3, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    const lastweek = await this.app.model.query(sql4, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
    return [ ...today, ...yesterday, ...week, ...lastweek ];

  }
  /**
             * 会员查询
             * @param {*} params
             */
  async findVipList(params) {
    if (params.start_time == '') {
      params.start_time = moment(new Date()).format('YYYY-MM-DD');
    }
    if (params.end_time == '') {
      params.end_time = moment(new Date()).format('YYYY-MM-DD');
    }
    let sql = '';
    const username = this.app.config.defualtTouristPre;
    let a = '';
    let b = '';
    if (params.lay_index == 1) {
      a = `to_days(createdate) =  to_days('${params.start_time}')`;
      b = `to_days(create_time) =  to_days('${params.start_time}')`;
    } else if (params.lay_index == 2) {
      a = `to_days('${params.start_time}') - to_days(createdate) = 1`;
      b = `to_days('${params.start_time}') - to_days(create_time) = 1`;
    } else if (params.lay_index == 3) {
      a = `yearweek((date_format(createdate, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY)`;
      b = `yearweek((date_format(create_time, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY)`;
    } else if (params.lay_index == 4) {
      a = `yearweek((date_format(createdate, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY)-1`;
      b = `yearweek((date_format(create_time, '%Y-%m-%d')) - INTERVAL 1 DAY) =yearweek('${params.start_time}' - INTERVAL 1 DAY)-1`;
    }
    if (params.value == 1) {
      sql = `select *,IFNULL(dlcs,0) as logincount, IFNULL(ckje,0) as score  from (select*from user_account as ua left join (select user_id, count(1) as dlcs from user_login_hall group by user_id) as ulh on ua.id=ulh.user_id where  ${a} and username not like '${username}%') as b LEFT JOIN (select user_id,sum(score)as ckje from orders where type in (2,4,6,7,8,9,11,12) and  ${b} GROUP BY user_id) as a on a.user_id = b.id ${params.agents != 0 ? 'where agent_id = ' + params.agents : ''} limit ${(params.page - 1) * params.limit},${params.limit}`;
    } else if (params.value == 2) {
      sql = `select * from (select*from user_account as ua left join (select user_id, count(1) as logincount from user_login_hall group by user_id) as ulh on ua.id=ulh.user_id where ${a} and username like '${username}%') as b LEFT JOIN (select user_id,sum(score)as score from orders where type in (2,4,6,7,8,9,11,12) and ${b} GROUP BY user_id) as a on a.user_id = b.id ${params.agents != 0 ? 'where agent_id = ' + params.agents : ''} limit ${(params.page - 1) * params.limit},${params.limit}`;
    } else if (params.value == 3) {
      sql = `select * from (SELECT * from (select DISTINCT user_id AS touristdepositpeople,  user_id,sum(score)as score from orders as od LEFT JOIN (select username,id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and ${b} and ua.username not like '${username}%' GROUP BY user_id) as t LEFT JOIN user_account ua on ua.id = t.touristdepositpeople) as a LEFT JOIN(select user_id, count(1) as logincount from user_login_hall group by user_id) as b on a.user_id=b.user_id ${params.agents != 0 ? 'where agent_id = ' + params.agents : ''} limit ${(params.page - 1) * params.limit},${params.limit}`;
    } else if (params.value == 4) {
      sql = `select * from (SELECT * from (select DISTINCT user_id AS touristdepositpeople,  user_id,sum(score)as score from orders as od LEFT JOIN (select username,id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and ${b} and ua.username  like '${username}%' GROUP BY user_id) as t LEFT JOIN user_account ua on ua.id = t.touristdepositpeople) as a LEFT JOIN(select user_id, count(1) as logincount from user_login_hall group by user_id) as b on a.user_id=b.user_id ${params.agents != 0 ? 'where agent_id = ' + params.agents : ''} limit ${(params.page - 1) * params.limit},${params.limit}`;
    }
    if (params.start_time != params.end_time) {
      if (params.value == 1) {
        sql = `select * from (select * from user_account where username not like '${username}%' and createdate BETWEEN '${params.start_time}' and '${params.end_time}') as a LEFT JOIN (select user_id, count(1) as logincount from user_login_hall group by user_id )as b on a.id=b.user_id LEFT JOIN(select user_id,sum(score)as score from orders where type in (2,4,6,7,8,9,11,12) and create_time BETWEEN '${params.start_time}' and '${params.end_time}'  GROUP BY user_id)as c on a.id=c.user_id ${params.agents != 0 ? 'where agent_id = ' + params.agents : ''} limit ${(params.page - 1) * params.limit},${params.limit}`;
      } else if (params.value == 2) {
        sql = `select * from (select * from user_account where username  like '${username}%' and createdate BETWEEN '${params.start_time}' and '${params.end_time}') as a LEFT JOIN (select user_id, count(1) as logincount from user_login_hall group by user_id )as b on a.id=b.user_id LEFT JOIN(select user_id,sum(score)as score from orders where type in (2,4,6,7,8,9,11,12) and create_time BETWEEN '${params.start_time}' and '${params.end_time}'  GROUP BY user_id)as c on a.id=c.user_id ${params.agents != 0 ? 'where agent_id = ' + params.agents : ''} limit ${(params.page - 1) * params.limit},${params.limit}`;
      } else if (params.value == 3) {
        sql = `select * from (SELECT * from (select DISTINCT user_id AS touristdepositpeople,  user_id,sum(score)as score from orders as od LEFT JOIN (select username,id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and create_time BETWEEN '${params.start_time}' and '${params.end_time}' and ua.username not like '${username}%' GROUP BY user_id) as t LEFT JOIN user_account ua on ua.id = t.touristdepositpeople) as a LEFT JOIN(select user_id, count(1) as logincount from user_login_hall group by user_id) as b on a.user_id=b.user_id ${params.agents != 0 ? 'where agent_id = ' + params.agents : ''} limit ${(params.page - 1) * params.limit},${params.limit}`;
      } else if (params.value == 4) {
        sql = `select * from (SELECT * from (select DISTINCT user_id AS touristdepositpeople,  user_id,sum(score)as score from orders as od LEFT JOIN (select username,id from user_account ) as ua on od.user_id=ua.id where type in (2,4,6,7,8,9,11,12) and create_time BETWEEN '${params.start_time}' and '${params.end_time}' and ua.username  like '${username}%' GROUP BY user_id) as t LEFT JOIN user_account ua on ua.id = t.touristdepositpeople) as a LEFT JOIN(select user_id, count(1) as logincount from user_login_hall group by user_id) as b on a.user_id=b.user_id ${params.agents != 0 ? 'where agent_id = ' + params.agents : ''} limit ${(params.page - 1) * params.limit},${params.limit}`;
      }
    }

    return await this.app.model.query(sql, {
      type: this.app.Sequelize.QueryTypes.SELECT,
    });
  }
}
module.exports = registerMemberService;