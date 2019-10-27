'use strict';
module.exports = app => {
  const { INTEGER } = app.Sequelize;
  const PlatformGame = app.model.define('platform_game',
    {
      game_id: {
        type: INTEGER,
        primaryKey: true,
      },
      platform_id: {
        type: INTEGER,
      },
      status: {
        type: INTEGER,
      },
      game_sort: {
        type: INTEGER,
      },
      game_tag: {
        type: INTEGER,
      },
    },
    {
      freezeTableName: true, // Model 对应的表名将与model名相同
      timestamps: false,
    }
  );
  PlatformGame.associate = function() {
    app.model.PlatformGame.belongsTo(app.model.GameInfo, { foreignKey: 'game_id' });
  };
  return PlatformGame;
};
