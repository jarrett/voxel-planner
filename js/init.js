$(document).ready(function() {
  // This is a hacky way to initialize the model. But it'll do for version zero.
  Model.current = Model.current = new Model(3, 3, 3);
  
  init2dViewport($('canvas#top-right').get()[0]);
  init2dViewport($('canvas#bottom-left').get()[0]);
  init2dViewport($('canvas#bottom-right').get()[0]);
  
  init3dViewport();
  
  // This is a hacky way to initialize the model. But it'll do for version zero.
  var defaultModel = [
    // Layer 0
    [0, 0, 0, 1],
    [1, 0, 0, 1],
    [2, 0, 0, 1],
    [0, 1, 0, 1],
    [0, 2, 0, 1],
  
    // Layer 1
    [0, 0, 1, 1],
    [1, 0, 1, 1],
    [0, 1, 1, 1],
    
    // Layer 2
    [0, 0, 2, 1]
  ];
  _.each(defaultModel, function(block) {
    Model.current.setBlock(block[0], block[1], block[2], block[3], {skipListeners: true});
  });
  Model.current.doneLoading();
});