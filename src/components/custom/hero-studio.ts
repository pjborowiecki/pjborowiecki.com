// The hero as a live photo studio. One fullscreen fragment shader, no scene graph: a Three.js dependency would be
// ~150KB for a single quad. The key light follows the pointer, his cast shadow moves on the backdrop in response, and
// the wall's colour wraps around his silhouette, which is what stops a cut-out looking pasted on.

const VERTEX = `
attribute vec2 p;
varying vec2 vUv;
void main() {
  vUv = vec2(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5);
  gl_Position = vec4(p, 0.0, 1.0);
}`

const FRAGMENT = `
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;
varying vec2 vUv;
uniform vec2 uRes;
uniform vec4 uRect;
uniform vec2 uLight;
uniform vec2 uFade;
uniform float uIntro;
uniform float uZoom;
uniform float uPixel;
uniform vec3 uLit;
uniform vec3 uMid;
uniform vec3 uDeep;
uniform sampler2D uSubject;
uniform sampler2D uMaps;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

#ifdef GL_OES_standard_derivatives
float engraved(float f) {
  return 1.0 - smoothstep(0.0, 0.9, abs(fract(f) - 0.5) / max(fwidth(f), 0.0001));
}
#endif

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 uv = vUv;

  // Seamless paper: a pool of light falling off to the corners, with the slight mottling of a real backdrop.
  float dist = length((uv - uLight) * vec2(aspect, 1.0));
  vec3 color = mix(uLit, uMid, smoothstep(0.0, 0.62, dist));
  color = mix(color, uDeep, smoothstep(0.34, 1.16, dist));
  color *= 0.985 + 0.03 * noise(uv * vec2(aspect, 1.0) * 4.0);

  // Engine-turned line work, as on a banknote or a watch dial, radiating from behind his head. It catches the light.
  #ifdef GL_OES_standard_derivatives
  vec2 rosette = (uv - (uRect.xy + uRect.zw * vec2(0.44, 0.27))) * vec2(aspect, 1.0);
  float radius = length(rosette);
  float angle = atan(rosette.y, rosette.x);
  float rings = radius * uRes.y / (11.0 * uPixel);
  float lines = (engraved(rings + 2.6 * sin(angle * 36.0)) + engraved(rings - 2.6 * sin(angle * 36.0))) * 0.6;
  float reach = smoothstep(0.2, 0.36, radius) * (1.0 - smoothstep(0.5, 1.05, radius));
  color += vec3(0.96, 0.86, 0.62) * lines * reach * (0.3 + 0.7 * exp(-dist * dist * 4.0)) * 0.1;
  #endif

  // The camera pushes in on his face.
  vec2 focus = vec2(0.44, 0.27);
  vec2 st = (uv - uRect.xy) / uRect.zw;
  st = focus + (st - focus) / uZoom;
  float inside = step(0.0, st.x) * step(st.x, 1.0) * step(0.0, st.y) * step(st.y, 1.0);

  vec2 center = uRect.xy + uRect.zw * focus;
  vec2 toLight = (uLight - center) * vec2(aspect, 1.0);
  vec2 stClamped = clamp(st, 0.0, 1.0);
  vec3 maps = texture2D(uMaps, stClamped).rgb;

  // Cast shadow, thrown away from the light onto the wall.
  vec2 shadowSt = st + toLight * vec2(0.34, 0.2);
  vec2 shadowEdge = smoothstep(vec2(0.0), vec2(0.1), shadowSt) * smoothstep(vec2(0.0), vec2(0.1), 1.0 - shadowSt);
  float shadow = texture2D(uMaps, clamp(shadowSt, 0.0, 1.0)).g * shadowEdge.x * shadowEdge.y;
  color = mix(color, color * vec3(0.42, 0.5, 0.48), shadow * 0.8);

  // A little 2.5D: closer parts of him slide further as the light (and the eye) moves.
  vec4 subject = texture2D(uSubject, clamp(st + toLight * maps.b * 0.0085, 0.0, 1.0)) * inside;

  // Wall colour wraps around the silhouette, stronger on the side facing the light.
  vec2 texel = vec2(1.5 / 360.0, 1.5 / 488.0);
  vec2 gradient = vec2(
    texture2D(uMaps, stClamped + vec2(texel.x, 0.0)).r - texture2D(uMaps, stClamped - vec2(texel.x, 0.0)).r,
    texture2D(uMaps, stClamped + vec2(0.0, texel.y)).r - texture2D(uMaps, stClamped - vec2(0.0, texel.y)).r
  );
  vec2 outward = -gradient / max(length(gradient), 0.0001);
  float facing = clamp(dot(outward, normalize(toLight + vec2(0.0001))), 0.0, 1.0);
  float edge = 1.0 - smoothstep(0.52, 0.97, maps.r);
  float dark = 1.0 - dot(subject.rgb, vec3(0.33));
  vec3 lit = subject.rgb + uLit * edge * edge * dark * (0.04 + 0.2 * facing);
  lit = mix(lit, lit * (uMid * 1.1 + 0.68), edge * dark * 0.45);

  color = mix(color, lit, subject.a);

  // Everything settles into the deep of the backdrop behind the name.
  color = mix(color, uDeep, smoothstep(uFade.x, uFade.y, uv.y));

  // Lights up.
  color *= mix(0.06, 1.0, uIntro);

  // Grain, and dither so the long gradient never bands.
  color += (hash(gl_FragCoord.xy) - 0.5) * 0.022;

  gl_FragColor = vec4(color, 1.0);
}`

const hex = (value: string): [number, number, number] => [
  Number.parseInt(value.slice(1, 3), 16) / 255,
  Number.parseInt(value.slice(3, 5), 16) / 255,
  Number.parseInt(value.slice(5, 7), 16) / 255,
]

const REST_LIGHT = { x: 0.5, y: 0.3 }
const FOLLOW = 0.055

export interface HeroStudio {
  destroy: () => void
  setIntro: (value: number) => void
  setVisible: (visible: boolean) => void
  setZoom: (value: number) => void
}

interface HeroStudioOptions {
  box: HTMLElement
  canvas: HTMLCanvasElement
  fadeAnchor: HTMLElement
  /** The context is gone and will not be back; the DOM poster must take over. */
  onFail: () => void
  onReady: () => void
  stage: HTMLElement
}

function loadImage(src: string): Promise<HTMLImageElement> {
  const image = new Image()
  image.decoding = "async"
  image.src = src
  return image.decode().then(() => image)
}

export function createHeroStudio({ box, canvas, fadeAnchor, onFail, onReady, stage }: HeroStudioOptions): HeroStudio | null {
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "high-performance" })
  if (!gl) return null

  gl.getExtension("OES_standard_derivatives")

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)
    if (!shader) return null
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null
  }

  const vertex = compile(gl.VERTEX_SHADER, VERTEX)
  const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT)
  const program = gl.createProgram()
  if (!vertex || !fragment || !program) return null
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  // biome-ignore lint/correctness/useHookAtTopLevel: this is WebGL's useProgram, not a React hook.
  gl.useProgram(program)

  const quad = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, quad)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const position = gl.getAttribLocation(program, "p")
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

  const uniform = (name: string) => gl.getUniformLocation(program, name)
  const u = {
    res: uniform("uRes"),
    rect: uniform("uRect"),
    light: uniform("uLight"),
    fade: uniform("uFade"),
    intro: uniform("uIntro"),
    zoom: uniform("uZoom"),
    pixel: uniform("uPixel"),
  }
  gl.uniform3fv(uniform("uLit"), hex("#22a87c"))
  gl.uniform3fv(uniform("uMid"), hex("#0a6247"))
  gl.uniform3fv(uniform("uDeep"), hex("#032c20"))
  gl.uniform1i(uniform("uSubject"), 0)
  gl.uniform1i(uniform("uMaps"), 1)

  const textures: WebGLTexture[] = []
  const upload = (image: HTMLImageElement, unit: number) => {
    const texture = gl.createTexture()
    if (!texture) return
    textures.push(texture)
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
  }

  const coarse = globalThis.matchMedia("(pointer: coarse)").matches
  const state = { intro: 0, zoom: 1, lightX: REST_LIGHT.x, lightY: REST_LIGHT.y, targetX: REST_LIGHT.x, targetY: REST_LIGHT.y }
  let ready = false
  let visible = true
  let dirty = true
  let frame = 0
  let destroyed = false

  const measure = () => {
    const scale = Math.min(globalThis.devicePixelRatio || 1, coarse ? 1.5 : 1.75)
    const stageRect = stage.getBoundingClientRect()
    const width = Math.max(1, Math.round(stageRect.width * scale))
    const height = Math.max(1, Math.round(stageRect.height * scale))
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }
    gl.viewport(0, 0, width, height)
    gl.uniform2f(u.res, width, height)
    gl.uniform1f(u.pixel, scale)

    const boxRect = box.getBoundingClientRect()
    gl.uniform4f(
      u.rect,
      (boxRect.left - stageRect.left) / stageRect.width,
      (boxRect.top - stageRect.top) / stageRect.height,
      boxRect.width / stageRect.width,
      boxRect.height / stageRect.height,
    )

    const anchor = fadeAnchor.getBoundingClientRect()
    const anchorTop = (anchor.top - stageRect.top) / stageRect.height
    const anchorHeight = anchor.height / stageRect.height
    gl.uniform2f(u.fade, anchorTop - 0.3, anchorTop + anchorHeight * 0.3)
    dirty = true
  }

  const draw = () => {
    gl.uniform1f(u.intro, state.intro)
    gl.uniform1f(u.zoom, state.zoom)
    gl.uniform2f(u.light, state.lightX, state.lightY)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  const tick = (time: number) => {
    frame = requestAnimationFrame(tick)
    if (!ready || !visible || document.hidden) return

    if (coarse) {
      // No pointer to follow: the light drifts on its own, slowly.
      state.targetX = REST_LIGHT.x + Math.sin(time * 0.00023) * 0.13
      state.targetY = REST_LIGHT.y + Math.cos(time * 0.00031) * 0.06
    }
    const dx = state.targetX - state.lightX
    const dy = state.targetY - state.lightY
    if (Math.abs(dx) + Math.abs(dy) > 0.0004) {
      state.lightX += dx * FOLLOW
      state.lightY += dy * FOLLOW
      dirty = true
    }
    if (!dirty) return
    dirty = false
    draw()
  }

  const onPointerMove = (event: PointerEvent) => {
    state.targetX = REST_LIGHT.x + (event.clientX / globalThis.innerWidth - 0.5) * 0.62
    state.targetY = REST_LIGHT.y + (event.clientY / globalThis.innerHeight - 0.5) * 0.34
  }
  const onPointerLeave = () => {
    state.targetX = REST_LIGHT.x
    state.targetY = REST_LIGHT.y
  }
  const onContextLost = (event: Event) => {
    event.preventDefault()
    cancelAnimationFrame(frame)
    onFail()
  }

  const observer = new ResizeObserver(measure)
  observer.observe(stage)
  if (!coarse) {
    globalThis.addEventListener("pointermove", onPointerMove, { passive: true })
    globalThis.addEventListener("blur", onPointerLeave)
    document.addEventListener("pointerleave", onPointerLeave)
  }
  canvas.addEventListener("webglcontextlost", onContextLost)

  void Promise.all([loadImage("/images/site/hero-subject.webp"), loadImage("/images/site/hero-maps.webp")])
    .then(([subject, maps]) => {
      if (destroyed) return
      upload(subject, 0)
      upload(maps, 1)
      measure()
      ready = true
      draw()
      onReady()
    })
    .catch(onFail)

  frame = requestAnimationFrame(tick)

  return {
    setIntro(value) {
      state.intro = value
      dirty = true
    },
    setZoom(value) {
      state.zoom = value
      dirty = true
    },
    setVisible(value) {
      visible = value
      dirty = true
    },
    destroy() {
      destroyed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      globalThis.removeEventListener("pointermove", onPointerMove)
      globalThis.removeEventListener("blur", onPointerLeave)
      document.removeEventListener("pointerleave", onPointerLeave)
      canvas.removeEventListener("webglcontextlost", onContextLost)
      for (const texture of textures) gl.deleteTexture(texture)
      gl.deleteBuffer(quad)
      gl.deleteProgram(program)
      gl.deleteShader(vertex)
      gl.deleteShader(fragment)
    },
  }
}
