// callback is a function of type function(err, shader)
// type is gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
function compileShader(gl, name, type) {
  var shader;
  $.ajax('/glsl/' + name + '.glsl', {
    async: false,
    type: 'GET',
    success: function(src) {
      shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw(
          'Error compiling ' + '/glsl/' + name + '.glsl: ' +
          gl.getShaderInfoLog(shader)
        );
      }
    },
    error: function() {
      throw('Could not retrieve /shaders/' + name + '.glsl');
    }
  });
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw('Error linking program:' + gl.getProgramInfoLog(program));
  }
  return program;
}

function safeGetLocation(gl, program, name, fn) {
  var index = gl[fn](program, name)
  if (index != -1) {
    return index;
  } else {
    throw('Attribute not found in program: ' + name);
  }
}

function safeGetUniformLocation(gl, program, name) {
  return safeGetLocation(gl, program, name, 'getUniformLocation');
}

function safeGetAttribLocation(gl, program, name) {
  return safeGetLocation(gl, program, name, 'getAttribLocation');
}