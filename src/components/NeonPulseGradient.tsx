import { useEffect, useRef } from 'react';

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform float u_time;
uniform vec2 u_res;
uniform float u_speed;
uniform vec2 u_redCenter;
uniform vec2 u_greenCenter;
uniform vec2 u_blueCenter;

float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float hash2(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash2(i);
  float b = hash2(i + vec2(1.0, 0.0));
  float c = hash2(i + vec2(0.0, 1.0));
  float d = hash2(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 6; i++) {
    sum += noise(p * freq) * amp;
    freq *= 2.03;
    amp *= 0.49;
    p += vec2(1.7, 9.2);
  }
  return sum;
}

float warpedNoise(vec2 p, float t) {
  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.0) + t * 0.12),
    fbm(p + vec2(5.2, 1.3) + t * 0.09)
  );
  vec2 r = vec2(
    fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 0.07),
    fbm(p + 3.0 * q + vec2(8.3, 2.8) + t * 0.1)
  );
  return fbm(p + 2.5 * r);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 aspect = vec2(u_res.x / u_res.y, 1.0);
  float t = u_speed * u_time;

  vec3 greenColor = vec3(0.77, 1.0, 0.0);
  vec3 blackColor = vec3(0.01, 0.01, 0.01);
  vec3 redColor = vec3(0.85, 0.02, 0.02);

  vec3 bg = mix(vec3(0.01, 0.02, 0.0), vec3(0.03, 0.01, 0.01), uv.x + 0.3 * sin(t * 0.15 + uv.y * 2.0));

  vec2 r1 = u_redCenter + vec2(sin(t * 0.25) * 0.15, cos(t * 0.2) * 0.1) * aspect;
  vec2 g1 = u_greenCenter + vec2(cos(t * 0.3) * 0.12, sin(t * 0.15) * 0.08) * aspect;
  vec2 b1 = u_blueCenter + vec2(sin(t * 0.15) * 0.1, cos(t * 0.25) * 0.12) * aspect;

  float d_r = length((uv - r1) * aspect);
  float d_g = length((uv - g1) * aspect);
  float d_b = length((uv - b1) * aspect);

  float rFalloff = smoothstep(0.9, 0.0, d_r);
  float gFalloff = smoothstep(0.8, 0.0, d_g);
  float bFalloff = smoothstep(1.0, 0.0, d_b);

  float animNoise = warpedNoise(uv * 3.0, t * u_speed);

  vec2 g2 = vec2(0.4 + sin(t * 0.13) * 0.08, 0.2 + cos(t * 0.17) * 0.06) * aspect;
  float d_g2 = length((uv - g2) * aspect);
  float gFalloff2 = smoothstep(0.5, 0.0, d_g2);

  vec3 col = bg;
  col += redColor * rFalloff * 0.8;
  col += greenColor * gFalloff * 0.9;
  col += vec3(0.1, 0.05, 0.5) * bFalloff * 0.5;
  col += greenColor * gFalloff2 * 0.5;

  col *= (0.6 + 0.4 * animNoise);

  float orgWarp = warpedNoise(uv * 2.0 + t * 0.05, t * 0.3);
  col += vec3(0.3, 0.05, 0.05) * orgWarp * 0.15;

  col += vec3(0.4, 0.4, 0.2) * (0.08 * sin(t * 0.3) + 0.04);

  float vig = 1.0 - 0.5 * dot(uv - 0.5, uv - 0.5);
  col *= max(vig, 0.0);

  float grain = (hash(gl_FragCoord.x * 7.31 + gl_FragCoord.y * 13.7 + fract(u_time * 0.1) * 100.0) - 0.5) * 0.04;
  col += grain;

  float caStrength = smoothstep(0.3, 1.0, max(abs(uv.x - 0.5), abs(uv.y - 0.5))) * 0.015;
  uv += (uv - 0.5) * caStrength;

  col = pow(col / (col + 0.6), vec3(0.85));

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

export default function NeonPulseGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) return;

    function compileShader(src: string, type: number) {
      const shader = gl!.createShader(type)!;
      gl!.shaderSource(shader, src);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.error('Shader error:', gl!.getShaderInfoLog(shader));
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = compileShader(VERTEX_SHADER, gl.VERTEX_SHADER);
    const fs = compileShader(FRAGMENT_SHADER, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const posAttr = gl.getAttribLocation(program, 'a_position');
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'u_time');
    const uRes = gl.getUniformLocation(program, 'u_res');
    const uSpeed = gl.getUniformLocation(program, 'u_speed');
    const uRed = gl.getUniformLocation(program, 'u_redCenter');
    const uGreen = gl.getUniformLocation(program, 'u_greenCenter');
    const uBlue = gl.getUniformLocation(program, 'u_blueCenter');

    gl.uniform1f(uSpeed, 0.05);
    gl.uniform2f(uRed, 0.3, 0.7);
    gl.uniform2f(uGreen, 0.5, 0.5);
    gl.uniform2f(uBlue, 0.7, 0.3);

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
    }

    resize();
    window.addEventListener('resize', resize);

    function render(time: number) {
      gl!.uniform1f(uTime, time * 0.001);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}
