'use strict';
module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;
  const RoomInfo = app.model.define('room_info',
    {
      room_id: {
        type: INTEGER,
        primaryKey: true,
      },
      room_name: {
        type: STRING(50),
      },
      game_id: {
        type: INTEGER,
      },
      matching_status: {
        type: INTEGER,
      },
      admittance: {
        type: INTEGER,
      },
      status: {
        type: INTEGER,
      },
    },
    {
      freezeTableName: true, // Model 对应的表名将与model名相同
      timestamps: false,
    }
  );

  RoomInfo.associate = function() {
    app.model.RoomInfo.hasMany(app.model.RoomData, { foreignKey: 'room_id', sourceKey: 'room_id' });
    app.model.RoomInfo.hasOne(app.model.RoomLimitBets, { foreignKey: 'room_id' }); // 一对一 （一个房间对应一个房间下注点）

    app.model.RoomInfo.belongsTo(app.model.GameInfo, { foreignKey: 'game_id' });

    app.model.RoomInfo.belongsTo(app.model.KillNumber, { foreignKey: 'room_id', targetKey: 'room_id' }); // 一对一
  };

  return RoomInfo;
};
