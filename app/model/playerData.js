'use strict';
module.exports = app => {
  const { STRING, INTEGER, DATE, BIGINT } = app.Sequelize;
  const PlayerData = app.model.define('player_data',
    {
      create_time: {
        type: DATE,
        primaryKey: true,
      },
      username: {
        type: STRING(200),
        primaryKey: true,
      },
      platform_id: {
        type: INTEGER,
        primaryKey: true,
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
      dive_gold: {
        type: INTEGER,
      },
      kill_gold: {
        type: INTEGER,
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

  return PlayerData;
};
