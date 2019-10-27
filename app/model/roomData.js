'use strict';
module.exports = app => {
  const { INTEGER, DATE, BIGINT } = app.Sequelize;
  const RoomData = app.model.define('room_data',
    {
      create_time: {
        type: DATE,
        primaryKey: true,
      },
      room_id: {
        type: INTEGER,
        primaryKey: true,
      },
      agent_id: {
        type: INTEGER,
        primaryKey: true,
      },
      total_games: {
        type: INTEGER,
      },
      bet_number: {
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
      dive_games: {
        type: INTEGER,
      },
      dive_gold: {
        type: BIGINT,
      },
      dive_win_games: {
        type: INTEGER,
      },
      dive_win_gold: {
        type: BIGINT,
      },
      dive_lost_games: {
        type: INTEGER,
      },
      dive_lost_gold: {
        type: BIGINT,
      },
      kill_games: {
        type: INTEGER,
      },
      kill_gold: {
        type: BIGINT,
      },
      kill_win_games: {
        type: INTEGER,
      },
      kill_win_gold: {
        type: BIGINT,
      },
      kill_lost_games: {
        type: INTEGER,
      },
      kill_lost_gold: {
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


  RoomData.associate = function() {
    app.model.RoomData.belongsTo(app.model.RoomInfo, { foreignKey: 'room_id' });
  };

  return RoomData;
};
