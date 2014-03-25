function addPaletteColor(palette, r, g, b) {
  var li = $('<li><div></div></li>');
  li.attr('data-r', r);
  li.attr('data-g', g);
  li.attr('data-b', b);
  li.find('div').css('background', 'rgb(' + (r * 255) + ',' + (g * 255) + ',' + (b * 255) + ')');
  $('ul#palette').append(li);
  li.click(function() {
    palette.material = li.index();
  });
}

function deleteSelectedPaletteColor() {
  
}

function initPalette() {
  var palette = {material: 0};
  
  $('#add-color').click(function() {
    
  });
  
  $('#delete-color').click(function() {
    deleteSelectedPaletteColor();
  });
  
  var defaultColors = [
    [0, 0, 0],
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ];
  
  _.each(defaultColors, function(color) {
    addPaletteColor(palette, color[0], color[1], color[2]);
  });
}

$(document).ready(initPalette);