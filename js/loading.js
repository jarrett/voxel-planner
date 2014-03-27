function initLoading() {
  $('input#load').click(function() {
    $('div#load-dialog').show();
  });
  
  $('div#load-dialog a.close').click(function() {
    $('div#load-dialog').hide();
  });
  
  $('div#load-dialog input[type=file]').change(function() {
    var reader = new FileReader();
    reader.onload = function() {
      var view = new DataView(reader.result);
      var width = view.getUint16(0);
      var depth = view.getUint16(2);
      var height = view.getUint16(4);
      console.log(width);
      console.log(depth);
      console.log(height);
    }
    reader.readAsArrayBuffer(this.files[0]);    
  });
}