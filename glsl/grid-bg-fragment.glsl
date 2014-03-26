precision mediump float;

/*uniform float uPanI;
uniform float uPanJ;
uniform float uZoom;
uniform int uViewportW;
uniform int uViewportH;*/
uniform float uZoom;

// In world coords
varying vec2 vPosition;

void main() {
  // Don't display gridlines in the invalid negative coordinates.
  if (vPosition.x >= 0.0 && vPosition.y >= 0.0) {
    // Calculate distance to nearest grid line.
    float distI = mod(vPosition.x, 1.0);
    if (distI > 0.5) {
      distI = 1.0 - distI;
    }
    float distJ = mod(vPosition.y, 1.0);
    if (distJ > 0.5) {
      distJ = 1.0 - distJ;
    }
    float minDist = min(distI, distJ);  
    gl_FragColor = mix( 
      vec4(0.85, 0.85, 0.85, 1.0), // Line color
      vec4(1.0, 1.0, 1.0, 1.0), // Background color
      smoothstep(0.0, 0.003 / uZoom, minDist)
    );
  } else {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
}