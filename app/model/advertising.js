'use strict';
module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;
  const advertising = app.model.define('advertising',
    {
      id: {
        type: INTEGER,
        autoIncrement: true, // 自增
        primaryKey: true,
      },
      title: {
        type: STRING(50),
      },
      content: {
        type: STRING(300),
      },
      img_url: {
        type: STRING(255),
      },
      skip_url: {
        type: STRING(255),
      },
      show_count: {
        type: INTEGER,
      },
      type: {
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
  return advertising;
};
