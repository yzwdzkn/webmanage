'use strict';
module.exports = app => {
  const { INTEGER, FLOAT } = app.Sequelize;
  const UserMonitor = app.model.define('user_monitor',
    {
      id: {
        type: INTEGER,
        autoIncrement: true, // 自增
        primaryKey: true,
      },
      kill_number_gt: {
        type: FLOAT,
      },
      kill_number_lt: {
        type: FLOAT,
      },
      bet_count: {
        type: INTEGER,
      },
      today_kill_number_gt: {
        type: FLOAT,
      },
      today_kill_number_lt: {
        type: FLOAT,
      },
      today_bet_count: {
        type: INTEGER,
      },
      h_kill_number_gt: {
        type: FLOAT,
      },
      h_kill_number_lt: {
        type: FLOAT,
      },
      h_bet_count: {
        type: INTEGER,
      },
      h_today_kill_number_gt: {
        type: FLOAT,
      },
      h_today_kill_number_lt: {
        type: FLOAT,
      },
      h_today_bet_count: {
        type: INTEGER,
      },
    },
    {
      freezeTableName: true, // Model 对应的表名将与model名相同
      timestamps: false,
    }
  );

  return UserMonitor;
};
