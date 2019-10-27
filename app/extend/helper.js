'use strict';
const sd = require('silly-datetime');
module.exports = {

  // parmas  时间戳          13位的时间戳
  // 在页面使用 	<%-helper.formatTime(time)%>
  formatTime(parmas) {
    return sd.format(new Date(parmas), 'YYYY-MM-DD HH:mm');
  },
};
