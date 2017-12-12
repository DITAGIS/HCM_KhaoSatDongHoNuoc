let input = $('input[name="remember"]');
$('#remember').click(function () {
  let val = input.val() === "true" ? false : true;
  let span = $('#remember').find('span');
  if (val) {
    span.removeClass('glyphicon-unchecked');
    span.addClass('glyphicon-ok')
  } else {
    span.addClass('glyphicon-unchecked');
    span.removeClass('glyphicon-ok')
  }
  input.val(val);
})