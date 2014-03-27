function modelToDataUri(model) {
  // 2 bytes per int * 3 ints (w, d, h) = 6.
  var newBuff = new ArrayBuffer(6 + model.blocks.buffer.byteLength);
  
  // Set the dimensions using a DataView, which ensures big endianness.
  var view = new DataView(newBuff);
  view.setUint16(0, model.width);
  view.setUint16(2, model.depth);
  view.setUint16(0, model.height);
  
  // Copy the original buffer into the new one by creating a Uint16 view of each.
  var src16 = new Uint16Array(model.blocks.buffer);
  var dst16 = new Uint16Array(newBuff, 6);
  dst16.set(src16);
  
  // Encode as a base64 data URI.
  return 'data:application/octet-stream;base64,' + arrayBufferToBase64(model.blocks.buffer);
}

function initSaving() {
  $('input#save').click(function() {
    $('div#save-dialog').show().find('a#download-link').attr('href', modelToDataUri(Model.current));
  });
  $('div#save-dialog a#close-save-dialog').click(function() {
    $('div#save-dialog').hide();
  });
}