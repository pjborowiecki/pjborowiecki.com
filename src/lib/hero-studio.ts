import { imageSource } from "~/src/data/images"

const VERTEX_SHADER = `
attribute vec2 p;
varying vec2 vUv;
void main() {
  vUv = vec2(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5);
  gl_Position = vec4(p, 0.0, 1.0);
}`

const FRAGMENT_SHADER = `
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;
varying vec2 vUv;
uniform vec2 uRes;
uniform vec4 uRect;
uniform vec2 uLight;
uniform vec2 uFade;
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

  float dist = length((uv - uLight) * vec2(aspect, 1.0));
  vec3 color = mix(uLit, uMid, smoothstep(0.0, 0.62, dist));
  color = mix(color, uDeep, smoothstep(0.34, 1.16, dist));
  color *= 0.985 + 0.03 * noise(uv * vec2(aspect, 1.0) * 4.0);

  #ifdef GL_OES_standard_derivatives
  vec2 rosette = (uv - (uRect.xy + uRect.zw * vec2(0.44, 0.27))) * vec2(aspect, 1.0);
  float radius = length(rosette);
  float angle = atan(rosette.y, rosette.x);
  float rings = radius * uRes.y / (11.0 * uPixel);
  float lines = (engraved(rings + 2.6 * sin(angle * 36.0)) + engraved(rings - 2.6 * sin(angle * 36.0))) * 0.6;
  float reach = smoothstep(0.2, 0.36, radius) * (1.0 - smoothstep(0.5, 1.05, radius));
  color += vec3(0.96, 0.86, 0.62) * lines * reach * (0.3 + 0.7 * exp(-dist * dist * 4.0)) * 0.1;
  #endif

  vec2 focus = vec2(0.44, 0.27);
  vec2 st = (uv - uRect.xy) / uRect.zw;
  st = focus + (st - focus) / uZoom;
  float inside = step(0.0, st.x) * step(st.x, 1.0) * step(0.0, st.y) * step(st.y, 1.0);

  vec2 center = uRect.xy + uRect.zw * focus;
  vec2 toLight = (uLight - center) * vec2(aspect, 1.0);
  vec2 stClamped = clamp(st, 0.0, 1.0);
  vec3 maps = texture2D(uMaps, stClamped).rgb;

  vec2 shadowSt = st + toLight * vec2(0.34, 0.2);
  vec2 shadowEdge = smoothstep(vec2(0.0), vec2(0.1), shadowSt) * smoothstep(vec2(0.0), vec2(0.1), 1.0 - shadowSt);
  float shadow = texture2D(uMaps, clamp(shadowSt, 0.0, 1.0)).g * shadowEdge.x * shadowEdge.y;
  color = mix(color, color * vec3(0.42, 0.5, 0.48), shadow * 0.8);

  vec4 subject = texture2D(uSubject, clamp(st + toLight * maps.b * 0.0085, 0.0, 1.0)) * inside;

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

  color = mix(color, uDeep, smoothstep(uFade.x, uFade.y, uv.y));

  color += (hash(gl_FragCoord.xy) - 0.5) * 0.022;

  gl_FragColor = vec4(color, 1.0);
}`

const BACKDROP = { deep: "#032c20", lit: "#22a87c", mid: "#0a6247" } as const

const HEX_CHANNEL = { blueStart: 5, greenStart: 3, length: 2, max: 255, redStart: 1 } as const
const HEX_RADIX = 16

const SUBJECT_IMAGE = "hero-subject"
const MAPS_IMAGE = "hero-maps"

const TEXTURE_UNIT = { maps: 1, subject: 0 } as const

const CONTEXT_ATTRIBUTES: WebGLContextAttributes = { alpha: false, antialias: false, powerPreference: "high-performance" }

const TRIANGLE_NEAR = -1
const TRIANGLE_FAR = 3
const FULLSCREEN_TRIANGLE = [TRIANGLE_NEAR, TRIANGLE_NEAR, TRIANGLE_FAR, TRIANGLE_NEAR, TRIANGLE_NEAR, TRIANGLE_FAR] as const
const TRIANGLE_VERTICES = 3
const COORDINATES_PER_VERTEX = 2

const COARSE_POINTER = "(pointer: coarse)"
const PIXEL_RATIO = { coarse: 1.5, fallback: 1, fine: 1.75 } as const
const MIN_CANVAS_SIZE = 1

const FADE_SPAN = { above: 0.3, into: 0.3 } as const

const REST_LIGHT = { x: 0.5, y: 0.3 } as const
const LIGHT_FOLLOW = 0.055
const LIGHT_SETTLED = 0.0004
const LIGHT_DRIFT = { amplitudeX: 0.13, amplitudeY: 0.06, speedX: 0.00023, speedY: 0.00031 } as const
const POINTER_REACH = { x: 0.62, y: 0.34 } as const
const SCREEN_CENTER = 0.5

type UniformLocation = ReturnType<WebGLRenderingContext["getUniformLocation"]>

interface StudioUniforms {
  readonly fade: UniformLocation
  readonly light: UniformLocation
  readonly pixel: UniformLocation
  readonly rect: UniformLocation
  readonly res: UniformLocation
  readonly zoom: UniformLocation
}

interface StudioScene {
  readonly fragment: WebGLShader
  readonly gl: WebGLRenderingContext
  readonly program: WebGLProgram
  readonly quad: WebGLBuffer
  readonly textures: WebGLTexture[]
  readonly uniforms: StudioUniforms
  readonly vertex: WebGLShader
}

interface StudioState {
  frame: number
  isDestroyed: boolean
  isDirty: boolean
  isReady: boolean
  isVisible: boolean
  lightX: number
  lightY: number
  targetX: number
  targetY: number
  zoom: number
}

interface HeroStudioOptions {
  readonly box: HTMLElement
  readonly canvas: HTMLCanvasElement
  readonly fadeAnchor: HTMLElement
  readonly onFail: () => void
  readonly onReady: () => void
  readonly stage: HTMLElement
}

interface Studio {
  readonly isCoarse: boolean
  readonly options: HeroStudioOptions
  readonly scene: StudioScene
  readonly state: StudioState
}

export interface HeroStudio {
  readonly destroy: () => void
  readonly setVisible: (isVisible: boolean) => void
  readonly setZoom: (value: number) => void
}

const readHexChannel = (hex: string, start: number): number =>
  Number.parseInt(hex.slice(start, start + HEX_CHANNEL.length), HEX_RADIX) / HEX_CHANNEL.max

const parseHexColor = (hex: string): number[] => [
  readHexChannel(hex, HEX_CHANNEL.redStart),
  readHexChannel(hex, HEX_CHANNEL.greenStart),
  readHexChannel(hex, HEX_CHANNEL.blueStart),
]

const compileShader = (gl: WebGLRenderingContext, type: GLenum, source: string): WebGLShader | undefined => {
  const shader = gl.createShader(type)

  if (!shader) {
    return undefined
  }

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) !== true) {
    return undefined
  }

  return shader
}

const createQuad = (gl: WebGLRenderingContext, program: WebGLProgram): WebGLBuffer => {
  const quad = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, quad)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(FULLSCREEN_TRIANGLE), gl.STATIC_DRAW)

  const position = gl.getAttribLocation(program, "p")
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, COORDINATES_PER_VERTEX, gl.FLOAT, false, 0, 0)

  return quad
}

const locateUniforms = (gl: WebGLRenderingContext, program: WebGLProgram): StudioUniforms => ({
  fade: gl.getUniformLocation(program, "uFade"),
  light: gl.getUniformLocation(program, "uLight"),
  pixel: gl.getUniformLocation(program, "uPixel"),
  rect: gl.getUniformLocation(program, "uRect"),
  res: gl.getUniformLocation(program, "uRes"),
  zoom: gl.getUniformLocation(program, "uZoom"),
})

const applyPalette = (gl: WebGLRenderingContext, program: WebGLProgram): void => {
  gl.uniform3fv(gl.getUniformLocation(program, "uLit"), parseHexColor(BACKDROP.lit))
  gl.uniform3fv(gl.getUniformLocation(program, "uMid"), parseHexColor(BACKDROP.mid))
  gl.uniform3fv(gl.getUniformLocation(program, "uDeep"), parseHexColor(BACKDROP.deep))
  gl.uniform1i(gl.getUniformLocation(program, "uSubject"), TEXTURE_UNIT.subject)
  gl.uniform1i(gl.getUniformLocation(program, "uMaps"), TEXTURE_UNIT.maps)
}

const createScene = (canvas: HTMLCanvasElement): StudioScene | undefined => {
  const gl = canvas.getContext("webgl", CONTEXT_ATTRIBUTES)

  if (!gl) {
    return undefined
  }

  gl.getExtension("OES_standard_derivatives")

  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)

  if (!vertex || !fragment) {
    return undefined
  }

  const program = gl.createProgram()
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)

  if (gl.getProgramParameter(program, gl.LINK_STATUS) !== true) {
    return undefined
  }

  gl.useProgram(program)
  applyPalette(gl, program)

  return { fragment, gl, program, quad: createQuad(gl, program), textures: [], uniforms: locateUniforms(gl, program), vertex }
}

const disposeScene = ({ fragment, gl, program, quad, textures, vertex }: StudioScene): void => {
  for (const texture of textures) {
    gl.deleteTexture(texture)
  }

  gl.deleteBuffer(quad)
  gl.deleteProgram(program)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)
}

const uploadTexture = (scene: StudioScene, image: HTMLImageElement, unit: number): void => {
  const { gl } = scene
  const texture = gl.createTexture()
  scene.textures.push(texture)

  gl.activeTexture(gl.TEXTURE0 + unit)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
}

const measureSubject = ({ options, scene }: Studio, stageRect: DOMRect): void => {
  const boxRect = options.box.getBoundingClientRect()

  scene.gl.uniform4f(
    scene.uniforms.rect,
    (boxRect.left - stageRect.left) / stageRect.width,
    (boxRect.top - stageRect.top) / stageRect.height,
    boxRect.width / stageRect.width,
    boxRect.height / stageRect.height,
  )
}

const measureFade = ({ options, scene }: Studio, stageRect: DOMRect): void => {
  const anchor = options.fadeAnchor.getBoundingClientRect()
  const anchorTop = (anchor.top - stageRect.top) / stageRect.height
  const anchorHeight = anchor.height / stageRect.height

  scene.gl.uniform2f(scene.uniforms.fade, anchorTop - FADE_SPAN.above, anchorTop + anchorHeight * FADE_SPAN.into)
}

const measureStudio = (studio: Studio): void => {
  const { isCoarse, options, scene, state } = studio
  const { canvas } = options
  const { gl, uniforms } = scene
  const scale = Math.min(globalThis.devicePixelRatio || PIXEL_RATIO.fallback, isCoarse ? PIXEL_RATIO.coarse : PIXEL_RATIO.fine)
  const stageRect = options.stage.getBoundingClientRect()
  const width = Math.max(MIN_CANVAS_SIZE, Math.round(stageRect.width * scale))
  const height = Math.max(MIN_CANVAS_SIZE, Math.round(stageRect.height * scale))

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
  }

  gl.viewport(0, 0, width, height)
  gl.uniform2f(uniforms.res, width, height)
  gl.uniform1f(uniforms.pixel, scale)
  measureSubject(studio, stageRect)
  measureFade(studio, stageRect)
  state.isDirty = true
}

const drawStudio = ({ scene, state }: Studio): void => {
  const { gl, uniforms } = scene

  gl.uniform1f(uniforms.zoom, state.zoom)
  gl.uniform2f(uniforms.light, state.lightX, state.lightY)
  gl.drawArrays(gl.TRIANGLES, 0, TRIANGLE_VERTICES)
}

const driftLight = (state: StudioState, time: number): void => {
  state.targetX = REST_LIGHT.x + Math.sin(time * LIGHT_DRIFT.speedX) * LIGHT_DRIFT.amplitudeX
  state.targetY = REST_LIGHT.y + Math.cos(time * LIGHT_DRIFT.speedY) * LIGHT_DRIFT.amplitudeY
}

const followLight = (state: StudioState): void => {
  const dx = state.targetX - state.lightX
  const dy = state.targetY - state.lightY

  if (Math.abs(dx) + Math.abs(dy) > LIGHT_SETTLED) {
    state.lightX += dx * LIGHT_FOLLOW
    state.lightY += dy * LIGHT_FOLLOW
    state.isDirty = true
  }
}

const aimLight = (state: StudioState, event: PointerEvent): void => {
  state.targetX = REST_LIGHT.x + (event.clientX / globalThis.innerWidth - SCREEN_CENTER) * POINTER_REACH.x
  state.targetY = REST_LIGHT.y + (event.clientY / globalThis.innerHeight - SCREEN_CENTER) * POINTER_REACH.y
}

const restLight = (state: StudioState): void => {
  state.targetX = REST_LIGHT.x
  state.targetY = REST_LIGHT.y
}

const stepStudio = (studio: Studio, time: number): void => {
  const { isCoarse, state } = studio

  if (!state.isReady || !state.isVisible || document.hidden) {
    return
  }

  if (isCoarse) {
    driftLight(state, time)
  }

  followLight(state)

  if (!state.isDirty) {
    return
  }

  state.isDirty = false
  drawStudio(studio)
}

const loadImage = async (src: string): Promise<HTMLImageElement> => {
  const image = new Image()
  image.decoding = "async"
  image.src = src
  await image.decode()

  return image
}

const loadTextures = (studio: Studio): void => {
  const { options, scene, state } = studio

  Promise.all([loadImage(imageSource(SUBJECT_IMAGE).src), loadImage(imageSource(MAPS_IMAGE).src)])
    .then(([subject, maps]) => {
      if (state.isDestroyed) {
        return
      }

      uploadTexture(scene, subject, TEXTURE_UNIT.subject)
      uploadTexture(scene, maps, TEXTURE_UNIT.maps)
      measureStudio(studio)
      state.isReady = true
      drawStudio(studio)
      options.onReady()
    })
    .catch(() => {
      options.onFail()
    })
}

const createState = (): StudioState => ({
  frame: 0,
  isDestroyed: false,
  isDirty: true,
  isReady: false,
  isVisible: true,
  lightX: REST_LIGHT.x,
  lightY: REST_LIGHT.y,
  targetX: REST_LIGHT.x,
  targetY: REST_LIGHT.y,
  zoom: 1,
})

export const createHeroStudio = (options: HeroStudioOptions): HeroStudio | undefined => {
  const scene = createScene(options.canvas)

  if (!scene) {
    return undefined
  }

  const studio: Studio = { isCoarse: globalThis.matchMedia(COARSE_POINTER).matches, options, scene, state: createState() }
  const { state } = studio

  const tick = (time: number): void => {
    state.frame = requestAnimationFrame(tick)
    stepStudio(studio, time)
  }

  const onPointerMove = (event: PointerEvent): void => {
    aimLight(state, event)
  }

  const onPointerLeave = (): void => {
    restLight(state)
  }

  const onContextLost = (event: Event): void => {
    event.preventDefault()
    cancelAnimationFrame(state.frame)
    options.onFail()
  }

  const observer = new ResizeObserver(() => {
    measureStudio(studio)
  })
  observer.observe(options.stage)

  if (!studio.isCoarse) {
    globalThis.addEventListener("pointermove", onPointerMove, { passive: true })
    globalThis.addEventListener("blur", onPointerLeave)
    document.addEventListener("pointerleave", onPointerLeave)
  }

  options.canvas.addEventListener("webglcontextlost", onContextLost)
  loadTextures(studio)
  state.frame = requestAnimationFrame(tick)

  return {
    destroy: () => {
      state.isDestroyed = true
      cancelAnimationFrame(state.frame)
      observer.disconnect()
      globalThis.removeEventListener("pointermove", onPointerMove)
      globalThis.removeEventListener("blur", onPointerLeave)
      document.removeEventListener("pointerleave", onPointerLeave)
      options.canvas.removeEventListener("webglcontextlost", onContextLost)
      disposeScene(scene)
    },
    setVisible: (isVisible) => {
      state.isVisible = isVisible
      state.isDirty = true
    },
    setZoom: (value) => {
      state.zoom = value
      state.isDirty = true
    },
  }
}
