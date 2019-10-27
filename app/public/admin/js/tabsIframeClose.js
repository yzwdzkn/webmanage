
(function($) {
  $(function() {
    $('html')
    // 关闭右键菜单
      .on('click', function() {
        window.parent.hideMenu();
      });
  });

})(jQuery);


function vilidParamLength(value, length, msg) {
  if (value.length > length) {
    layer.msg(msg);
    return false;
  }
  return true;
}

