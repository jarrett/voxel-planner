precision mediump float;

uniform float uPanI;
uniform float uPanJ;
uniform float uZoom;
uniform int uViewportW;
uniform int uViewportH;

varying vec2 vPosition;

void main() {
  float aspect = float(uViewportW) / float(uViewportH);
  // At zoom 1.0, the viewport is two squares tall.
  float gridSize = uZoom * 1.0;
  
  // Calculate adjusted I and J coordinates for this fragment, taking into account
  // pan and aspect ratio.
  float adjI = (vPosition.x * aspect) - uPanI;
  float adjJ = vPosition.y - uPanJ;
  
  // Calculate distance to nearest grid line.
  float distI = mod(adjI, gridSize);
  if (distI > gridSize / 2.0) {
    distI = gridSize - distI;
  }
  float distJ = mod(adjJ, gridSize);
  if (distJ > gridSize / 2.0) {
    distJ = gridSize - distJ;
  }
  float minDist = min(distI, distJ);
  
  gl_FragColor = mix( 
    vec4(0.85, 0.85, 0.85, 1.0), // Line color
    vec4(1.0, 1.0, 1.0, 1.0), // Background color
    smoothstep(0.0, 0.005, minDist)
  );
}