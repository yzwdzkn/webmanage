'use strict';
module.exports = app => {
  const { INTEGER } = app.Sequelize;
  const RoomLimitBets = app.model.define('room_limit_bets',
    {
      room_id: {
        type: INTEGER,
        primaryKey: true,
      },
      betting_point: { // 下注点
        type: INTEGER,
      },
      bottom_injection: { // 底注
        type: INTEGER,
      },
      admittance: { // 准入
        type: INTEGER,
      },
      limit_injection: { // 限注
        type: INTEGER,
      },
      limit_win: { // 限红
        type: INTEGER,
      },
    },
    {
      freezeTableName: true, // Model 对应的表名将与model名相同
      timestamps: false,
    }
  );

  RoomLimitBets.associate = function() {
    app.model.RoomLimitBets.belongsTo(app.model.RoomInfo, { foreignKey: 'room_id', targetKey: 'room_id' });// 一对一
  };

  return RoomLimitBets;
};
