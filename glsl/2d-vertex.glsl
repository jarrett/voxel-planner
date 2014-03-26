uniform float uPanI;
uniform float uPanJ;
uniform float uZoom;
uniform int uViewportW;
uniform int uViewportH;

// In world space
attribute vec2 aPosition;

// In world space
varying vec2 vPosition;

void main() {
  vPosition = aPosition;
  
  // Convert world space to clip space. The inverse of the clip-to-world transform.
  // In addition to the clip-to-world inverse, we also have to apply one more translation.
  // That's because in world space, integral coordinates are aligned with the center of
  // blocks. To make the blocks line up with the grid, they must be shifted by 0.5.
  float aspect = float(uViewportW) / float(uViewportH);
  gl_Position = vec4(
    ((aPosition.x - 0.5) / aspect) * uZoom - uPanI,
    (aPosition.y - 0.5) * uZoom - uPanJ,
    0.0, 1.0
  );
}