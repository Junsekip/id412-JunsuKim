// Minimal WebGL2 setup for one full-screen triangle and a fragment shader,
// copied from hello-fragment-shader, plus one texture for the webcam
// (the same way face-voronoi uploads its portrait atlas, but every frame).

export type Renderer = {
  resize: (width: number, height: number, pixelRatio: number) => void;
  render: (time: number, mouse: { x: number; y: number }, camera: HTMLVideoElement | null) => void;
  destroy: () => void;
};

function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("WebGL could not create a shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "Unknown shader error.";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

export function createRenderer(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string): Renderer {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) throw new Error("WebGL could not create a program.");
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? "Unknown link error.";
    gl.deleteProgram(program);
    throw new Error(message);
  }

  // One triangle that covers the whole screen. The fragment shader runs once per pixel inside it.
  const positionBuffer = gl.createBuffer();
  if (!positionBuffer) throw new Error("WebGL could not create a vertex buffer.");
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  // The webcam texture. Until the camera is on, it is one grey pixel.
  const cameraTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, cameraTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([128, 128, 128, 255]));
  // Video rows start at the top, WebGL's at the bottom: flip, so the face is upright.
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  const positionLocation = gl.getAttribLocation(program, "a_position");
  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  const mouseLocation = gl.getUniformLocation(program, "u_mouse");
  const timeLocation = gl.getUniformLocation(program, "u_time");
  const cameraLocation = gl.getUniformLocation(program, "u_camera");
  const cameraAspectLocation = gl.getUniformLocation(program, "u_cameraAspect");

  return {
    resize(width, height, pixelRatio) {
      gl.canvas.width = Math.round(width * pixelRatio);
      gl.canvas.height = Math.round(height * pixelRatio);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    },
    render(time, mouse, camera) {
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
      gl.uniform2f(mouseLocation, mouse.x, mouse.y);
      gl.uniform1f(timeLocation, time);

      // Copy the current webcam frame into the texture (once it has a frame to give).
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, cameraTexture);
      if (camera && camera.readyState >= camera.HAVE_CURRENT_DATA) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, camera);
        gl.uniform1f(cameraAspectLocation, camera.videoWidth / camera.videoHeight);
      } else {
        gl.uniform1f(cameraAspectLocation, 1);
      }
      gl.uniform1i(cameraLocation, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    destroy() {
      gl.deleteTexture(cameraTexture);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
    },
  };
}
