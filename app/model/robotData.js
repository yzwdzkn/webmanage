'use strict';
module.exports = app => {
  const { STRING, INTEGER, DATE, BIGINT } = app.Sequelize;
  const RobotData = app.model.define('robot_data',
    {
      create_time: {
        type: DATE,
      },
      username: {
        type: STRING(200),
      },
      total_games: {
        type: INTEGER,
      },
      valid_bet: {
        type: BIGINT,
      },
      win_games: {
        type: INTEGER,
      },
      win_gold: {
        type: BIGINT,
      },
      lost_games: {
        type: INTEGER,
      },
      lost_gold: {
        type: BIGINT,
      },
      deduct_gold: {
        type: BIGINT,
      },
      duration: {
        type: BIGINT,
      },
      insert_time: {
        type: DATE,
      },
    },
    {
      freezeTableName: true, // Model 对应的表名将与model名相同
      timestamps: false,
    }
  );

  return RobotData;
};
