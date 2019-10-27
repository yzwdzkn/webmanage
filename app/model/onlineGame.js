'use strict';
module.exports = app => {
  const { STRING, INTEGER, DATE, BIGINT } = app.Sequelize;
  const OnlineGame = app.model.define('online_game',
    {
      id: {
        type: BIGINT,
        autoIncrement: true, // 自增
        primaryKey: true,
      },
      game_id: {
        type: INTEGER,
      },
      value: {
        type: INTEGER,
      },
      ip: {
        type: STRING(50),
      },
      create_time: {
        type: DATE,
      },
    },
    {
      freezeTableName: true, // Model 对应的表名将与model名相同
      timestamps: false,
    }
  );
  OnlineGame.associate = function() {
    app.model.OnlineGame.belongsTo(app.model.GameInfo, { foreignKey: 'game_id' });
  };
  return OnlineGame;
};
