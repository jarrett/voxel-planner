function modelToDataUri(model) {
  // TODO: Prepend width, depth, and height. Will require constructing a new ArrayBuffer.
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