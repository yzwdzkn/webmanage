'use strict';
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;
  const AdminWhitelist = app.model.define('admin_whitelist', // 表名
    {
      id: {
        type: INTEGER, // 字段类型
        autoIncrement: true, // 自增
        primaryKey: true, // 主键
      },
      ip: {
        type: STRING(50), // 字段类型
      },
      description: {
        type: STRING(500),
      },
      create_operator: {
        type: STRING(100),
      },
      create_time: {
        type: DATE,
      },
      is_delete: {
        type: INTEGER,
      },
    },
    {
      freezeTableName: true, // Model 对应的表名将与model名相同
      timestamps: false,
    }
  );

  // 创建表关联
  // AdminWhitelist.associate = function () {
  //     app.model.AdminWhitelist.belongsTo(app.model.Role, {foreignKey:'role_id' });
  // };

  return AdminWhitelist;
};
