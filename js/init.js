$(document).ready(function() {
  /*init2dViewport($('canvas#top-right').get()[0]);
  init2dViewport($('canvas#bottom-left').get()[0]);
  init2dViewport($('canvas#bottom-right').get()[0]);*/
  
  // This is a hacky way to initialize the model. But it'll do for version zero.
  Model.current = Model.current = new Model(6, 6, 6);
  
  init3dViewport();
  
  // This is a hacky way to initialize the model. But it'll do for version zero.
  var defaultModel = [
    // Layer 0
    [1, 1, 0, 1],
    [2, 1, 0, 1],
    [3, 1, 0, 1],
    [1, 2, 0, 1],
    [1, 3, 0, 1],
  
    // Layer 1
    [1, 1, 1, 1],
    [2, 1, 1, 1],
    [1, 2, 1, 1],
    
    // Layer 2
    [1, 1, 2, 1]
  ];
  _.each(defaultModel, function(block) {
    Model.current.setBlock(block[0], block[1], block[2], block[3], {skipListeners: true});
  });
  Model.current.doneLoading();
});