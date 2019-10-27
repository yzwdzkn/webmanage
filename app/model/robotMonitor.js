'use strict';
module.exports = app => {
  const { INTEGER, BIGINT } = app.Sequelize;
  const RobotMonitor = app.model.define('robot_monitor',
    {
      id: {
        type: INTEGER,
        autoIncrement: true, // 自增
        primaryKey: true,
      },
      valid_bet: {
        type: BIGINT,
      },
      count: {
        type: INTEGER,
      },
      win_lost: {
        type: BIGINT,
      },
      win_gold: {
        type: BIGINT,
      },
      lost_gold: {
        type: BIGINT,
      },
    },
    {
      freezeTableName: true, // Model 对应的表名将与model名相同
      timestamps: false,
    }
  );

  return RobotMonitor;
};
