'use strict';
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;
  const UserKillRecord = app.model.define('user_kill_record',
    {
      user_id: {
        type: INTEGER,
        primaryKey: true,
      },
      status: {
        type: INTEGER,
      },
      kill_money: {
        type: INTEGER,
      },
      rest_kill_number: {
        type: INTEGER,
      },
      kill_remark: {
        type: STRING(500),
      },
      operator: {
        type: STRING(50),
      },
      update_time: {
        type: DATE,
      },
    },
    {
      freezeTableName: true, // Model 对应的表名将与model名相同
      timestamps: false,
    }
  );

  UserKillRecord.associate = function() {
    app.model.UserKillRecord.belongsTo(app.model.UserAccount, { foreignKey: 'user_id', targetKey: 'id' });
  };

  return UserKillRecord;
};
