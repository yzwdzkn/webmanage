'use strict';
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;
  const GameInfo = app.model.define('game_info',
    {
      game_id: {
        type: INTEGER,
        primaryKey: true,
      },
      game_name: {
        type: STRING(50),
      },
      game_code: {
        type: STRING(50),
      },
      status: {
        type: INTEGER,
      },

      is_delete: {
        type: INTEGER,
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

  GameInfo.associate = function() {
    app.model.GameInfo.hasMany(app.model.RoomInfo, { foreignKey: 'game_id', sourceKey: 'game_id' });// 一对多
    app.model.GameInfo.hasMany(app.model.Horselight, { foreignKey: 'game_id', sourceKey: 'game_id' });// 一对多
    app.model.GameInfo.belongsTo(app.model.OnlineGame, { foreignKey: 'game_id', sourceKey: 'game_id' });
    app.model.GameInfo.hasMany(app.model.Orders, { foreignKey: 'game_id', sourceKey: 'game_id' });// 一对多

  };

  return GameInfo;
};
