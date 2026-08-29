// Ported from app/src/main/resources/data/fragment.glsl, with the WebGL/ES
// portability fixes required for three.js's default GLSL ES 1.00 target
// (desktop GL2, which the Processing app ran under, is lenient about all of
// these in ways WebGL is not):
//   - precision mediump -> highp (mediump visibly bands the coordinate math)
//   - bare int literals in float-typed expressions -> explicit floats
//   - u_aa-bounded for-loops -> MAX_AA-bounded with `if (i >= u_aa) break;`
//     (a uniform can't be a loop bound under strict ES validation)
//   - `col / (u_aa * u_aa)` -> `col / float(u_aa * u_aa)` (no vec3/int op)
//   - u_args declared as `vec3[ARGS_POOL_SIZE]`, not a flat `float[]`: GLSL
//     ES/ANGLE uniform arrays don't pack scalars across the vec4 boundary --
//     each array element (even a single float) costs one full vector slot
//     in MAX_FRAGMENT_UNIFORM_VECTORS accounting. A flat `float
//     u_args[ARGS_POOL_SIZE*3]` therefore cost 3x the vector slots of the
//     equivalent `vec3 u_args[ARGS_POOL_SIZE]` for the same data, and
//     empirically exceeded real hardware's budget (measured 1024 vectors on
//     an Apple M1 via ANGLE Metal -- "ERROR: too many uniforms" with 1536
//     float elements alone). three.js's WebGLUniforms.flatten() passes a
//     flat Float32Array straight to gl.uniform3fv() unchanged when it's
//     already flat, so render/buildMaterial.ts's Float32Array(ARGS_POOL_SIZE
//     * 3) and render/Artwork.tsx's flat x/y/z writes need no changes for
//     this -- only the GLSL type changes.
//   - No dynamic array indexing anywhere: GLSL ES 1.00 (WebGL1) only allows
//     an array index to be a constant expression or a for-loop's own control
//     variable ("Index expression can only contain const or loop symbols" --
//     confirmed by direct gl.compileShader() against a real WebGL1 context,
//     not just static reading). Two places violated this:
//       - the original `g_arg(int n) { return ...u_args[n]...; }` indexed a
//         uniform array with a function PARAMETER -- illegal even though
//         every actual call site passes a compile-time-constant literal
//         (Gene.get() emits e.g. `g_arg(3)`), because GLSL ES 1.00's
//         constant-index check is syntactic per-function, not
//         interprocedural. Fixed by having Gene.get() emit the indexing
//         expression directly (`u_args[3]`) instead of a function call --
//         the literal index is then always a true constant expression in
//         the final source, and the g_arg() function is removed entirely.
//       - `precol[iter] = col;` in main() indexed a plain array with `iter`,
//         a counter shared across two nested for-loops -- not itself either
//         loop's own control variable, so it doesn't qualify as a "loop
//         symbol" either. Fixed by removing the `precol[256]` array and
//         `iter` entirely: instead of storing each AA sample then summing
//         them in a second pass, accumulate directly into a running `sum`
//         vec3 inside the sampling loop (mathematically identical -- sum of
//         all samples / count -- and removes the array altogether).
// g_xor's existing bug (the .y branch's `else` writes temp.z instead of
// temp.y, leaving temp.y undefined on that path) is preserved verbatim.
//
// __DNA_CODE__ is replaced with the DNA's full "vec3 col = <expr>;"
// statement at material-build time (see render/buildMaterial.ts). Its
// position is load-bearing: it must stay inside the inner AA-sampling loop,
// after iterX/iterY are set for that sample and before `sum += col;`
// -- moving it out of the loop would silently turn multi-sample AA into a
// no-op (looks fine at u_aa=1, quietly wrong above).
export const FRAGMENT_SHADER_TEMPLATE = `
precision highp float;
precision highp int;

#define M_PI 3.1415926535897932384626433832795
#define MAX_AA 16

uniform vec2 u_g_off;
uniform float u_g_scale;
uniform vec2 u_off;
uniform float u_scale;
uniform float u_hoff;
uniform vec3 u_args[128];

uniform int u_aa;
int iterX = 0;
int iterY = 0;

// VALUES

vec3 g_x() {
	float scale = (u_g_scale * u_scale);
	float off = (u_g_off.x + u_off.x) * u_scale;
	float temp = off + gl_FragCoord.x * scale;
	temp = temp + (float(iterX)/float(u_aa)) * scale;
	return vec3(temp,temp,temp);
}

vec3 g_y() {
	float scale = u_g_scale * u_scale;
	float off = (u_g_off.y + u_off.y) * u_scale;
	float temp = off + (gl_FragCoord.y) * scale;
	temp = temp + (float(iterY)/float(u_aa)) * scale;
	return vec3(temp,temp,temp);
}

// BASIC MATH

vec3 g_add(vec3 a, vec3 b) {
	vec3 temp;
	temp.x = a.x + b.x;
	temp.y = a.y + b.y;
	temp.z = a.z + b.z;
	return temp;
}

vec3 g_sub(vec3 a, vec3 b) {
	vec3 temp;
	temp.x = a.x - b.x;
	temp.y = a.y - b.y;
	temp.z = a.z - b.z;
	return temp;
}

vec3 g_mult(vec3 a, vec3 b) {
	vec3 temp;
	temp.x = a.x * b.x;
	temp.y = a.y * b.y;
	temp.z = a.z * b.z;
	return temp;
}

float g_safeDiv(float a, float b) {
	float sb = b >= 0.0 ? 1.0 : -1.0;
	float bd = abs(b) < 0.05 ? sb * 0.05 : b;
	return clamp(a / bd, -8.0, 8.0);
}

vec3 g_div(vec3 a, vec3 b) {
	vec3 temp;
	temp.x = g_safeDiv(a.x, b.x);
	temp.y = g_safeDiv(a.y, b.y);
	temp.z = g_safeDiv(a.z, b.z);
	return temp;
}

// EXPONENTIAL

vec3 g_pow2(vec3 a) {
	vec3 temp;
	temp.x = pow(a.x, 2.0);
	temp.y = pow(a.y, 2.0);
	temp.z = pow(a.z, 2.0);
	return temp;
}

vec3 g_sqrt(vec3 a) {
	vec3 temp;
	temp.x = sqrt(abs(a.x));
	temp.y = sqrt(abs(a.y));
	temp.z = sqrt(abs(a.z));
	return temp;
}

vec3 g_powOf(vec3 a, vec3 b) {
	vec3 temp;
	temp.x = clamp(pow(abs(a.x), clamp(abs(b.x), 0.0, 8.0)), -1000.0, 1000.0);
	temp.y = clamp(pow(abs(a.y), clamp(abs(b.y), 0.0, 8.0)), -1000.0, 1000.0);
	temp.z = clamp(pow(abs(a.z), clamp(abs(b.z), 0.0, 8.0)), -1000.0, 1000.0);
	return temp;
}

vec3 g_logOf(vec3 a, vec3 b) {
	vec3 temp;
	temp.x = g_safeDiv(log(a.x), log(b.x));
	temp.y = g_safeDiv(log(a.y), log(b.y));
	temp.z = g_safeDiv(log(a.z), log(b.z));
	return temp;
}

vec3 g_2pow(vec3 a) {
	vec3 temp;
	temp.x = pow(2.0, clamp(a.x, -8.0, 8.0));
	temp.y = pow(2.0, clamp(a.y, -8.0, 8.0));
	temp.z = pow(2.0, clamp(a.z, -8.0, 8.0));
	return temp;
}

vec3 g_2log(vec3 a) {
	vec3 temp;
	temp.x = g_safeDiv(log(2.0), log(a.x));
	temp.y = g_safeDiv(log(2.0), log(a.y));
	temp.z = g_safeDiv(log(2.0), log(a.z));
	return temp;
}

// ROUND

vec3 g_mod(vec3 a, vec3 b) {
	vec3 temp;
	temp.x = mod(a.x,b.x);
	temp.y = mod(a.y,b.y);
	temp.z = mod(a.z,b.z);
	return temp;
}

vec3 g_fract(vec3 a) {
	vec3 temp;
	temp.x = fract(a.x);
	temp.y = fract(a.y);
	temp.z = fract(a.z);
	return temp;
}

vec3 g_floor(vec3 a) {
	vec3 temp;
	temp.x = floor(a.x);
	temp.y = floor(a.y);
	temp.z = floor(a.z);
	return temp;
}

vec3 g_ceil(vec3 a) {
	vec3 temp;
	temp.x = ceil(a.x);
	temp.y = ceil(a.y);
	temp.z = ceil(a.z);
	return temp;
}

vec3 g_round(vec3 a) {
	vec3 temp;
	temp.x = floor(a.x+0.5);
	temp.y = floor(a.y+0.5);
	temp.z = floor(a.z+0.5);
	return temp;
}

// TRIG

vec3 g_sin(vec3 a) {
	vec3 temp;
	temp.x = sin(a.x*M_PI)/2.0+0.5;
	temp.y = sin(a.y*M_PI)/2.0+0.5;
	temp.z = sin(a.z*M_PI)/2.0+0.5;
	return temp;
}

vec3 g_cos(vec3 a) {
	vec3 temp;
	temp.x = cos(a.x*M_PI)/2.0+0.5;
	temp.y = cos(a.y*M_PI)/2.0+0.5;
	temp.z = cos(a.z*M_PI)/2.0+0.5;
	return temp;
}

vec3 g_tan(vec3 a) {
	vec3 temp;
	temp.x = clamp(tan(a.x*M_PI), -8.0, 8.0);
	temp.y = clamp(tan(a.y*M_PI), -8.0, 8.0);
	temp.z = clamp(tan(a.z*M_PI), -8.0, 8.0);
	return temp;
}

vec3 g_asin(vec3 a) {
	vec3 temp;
	temp.x = asin(clamp(a.x,-1.0,1.0))/M_PI+0.5;
	temp.y = asin(clamp(a.y,-1.0,1.0))/M_PI+0.5;
	temp.z = asin(clamp(a.z,-1.0,1.0))/M_PI+0.5;
	return temp;
}

vec3 g_acos(vec3 a) {
	vec3 temp;
	temp.x = acos(clamp(a.x,-1.0,1.0))/M_PI;
	temp.y = acos(clamp(a.y,-1.0,1.0))/M_PI;
	temp.z = acos(clamp(a.z,-1.0,1.0))/M_PI;
	return temp;
}

vec3 g_atan(vec3 a, vec3 b) {
	vec3 temp;
	temp.x = atan(clamp(a.x,-1.0,1.0), clamp(b.x,-1.0,1.0))/M_PI;
	temp.y = atan(clamp(a.y,-1.0,1.0), clamp(b.y,-1.0,1.0))/M_PI;
	temp.z = atan(clamp(a.z,-1.0,1.0), clamp(b.z,-1.0,1.0))/M_PI;
	return temp;
}

// CONSTRAIN

vec3 g_max(vec3 a, vec3 b) {
	vec3 temp;
	temp.x = max(a.x,b.x);
	temp.y = max(a.y,b.y);
	temp.z = max(a.z,b.z);
	return temp;
}

vec3 g_min(vec3 a, vec3 b) {
	vec3 temp;
	temp.x = min(a.x,b.x);
	temp.y = min(a.y,b.y);
	temp.z = min(a.z,b.z);
	return temp;
}

vec3 g_clamp(vec3 a, vec3 b, vec3 c) {
	vec3 temp;
	temp.x = clamp(a.x,b.x,c.x);
	temp.y = clamp(a.y,b.y,c.y);
	temp.z = clamp(a.z,b.z,c.z);
	return temp;
}

vec3 g_abs(vec3 a) {
	vec3 temp;
	temp.x = abs(a.x);
	temp.y = abs(a.y);
	temp.z = abs(a.z);
	return temp;
}

// MIX

vec3 g_mix(vec3 a, vec3 b, vec3 c) {
	vec3 temp;
	temp.x = mix(a.x,b.x,c.x);
	temp.y = mix(a.y,b.y,c.y);
	temp.z = mix(a.z,b.z,c.z);
	return temp;
}

// LOGIC

vec3 g_if(vec3 a, vec3 b, vec3 c, vec3 d) {
	vec3 temp;

	if (a.x > b.x) {
		temp.x = c.x;
	} else {
		temp.x = d.x;
	}

	if (a.y > b.y) {
		temp.y = c.y;
	} else {
		temp.y = d.y;
	}

	if (a.z > b.z) {
		temp.z = c.z;
	} else {
		temp.z = d.z;
	}

	return temp;
}

vec3 g_or(vec3 a, vec3 b, vec3 a2, vec3 b2, vec3 c, vec3 d) {
	vec3 temp;

	if (a.x > b.x || a2.x > b2.x) {
		temp.x = c.x;
	} else {
		temp.x = d.x;
	}

	if (a.y > b.y || a2.y > b2.y) {
		temp.y = c.y;
	} else {
		temp.y = d.y;
	}

	if (a.z > b.z || a2.z > b2.z) {
		temp.z = c.z;
	} else {
		temp.z = d.z;
	}

	return temp;
}

vec3 g_and(vec3 a, vec3 b, vec3 a2, vec3 b2, vec3 c, vec3 d) {
	vec3 temp;

	if (a.x > b.x && a2.x > b2.x) {
		temp.x = c.x;
	} else {
		temp.x = d.x;
	}

	if (a.y > b.y && a2.y > b2.y) {
		temp.y = c.y;
	} else {
		temp.y = d.y;
	}

	if (a.z > b.z && a2.z > b2.z) {
		temp.z = c.z;
	} else {
		temp.z = d.z;
	}

	return temp;
}

// g_xor's .y branch has a pre-existing bug ported VERBATIM for parity: the
// else writes temp.z instead of temp.y, leaving temp.y undefined on that
// path. Do not "fix" this -- see fragment.glsl.ts's file header comment.
vec3 g_xor(vec3 a, vec3 b, vec3 a2, vec3 b2, vec3 c, vec3 d) {
	vec3 temp;

	if (((a.x > b.x) && !(a2.x > b2.x)) || (!(a.x > b.x) && (a2.x > b2.x))) {
		temp.x = c.x;
	} else {
		temp.x = d.x;
	}
	if (((a.y > b.y) && !(a2.y > b2.y)) || (!(a.y > b.y) && (a2.y > b2.y))) {
		temp.y = c.y;
	} else {
		temp.z = d.z;
	}
	if (((a.z > b.z) && !(a2.z > b2.z)) || (!(a.z > b.z) && (a2.z > b2.z))) {
		temp.z = c.z;
	} else {
		temp.z = d.z;
	}

	return temp;
}

// ELSE
vec3 g_rgb2hsb( in vec3 c ){
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz),
                 vec4(c.gb, K.xy),
                 step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r),
                 vec4(c.r, p.yzx),
                 step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)),
                d / (q.x + e),
                q.x);
}

vec3 g_hsb2rgb( in vec3 c ){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                     0.0,
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

// HMM

vec3 g_combine(vec3 a, vec3 b, vec3 c) {
	float a_ = (a.x + a.y + a.z)/3.0;
	float b_ = (b.x + b.y + b.z)/3.0;
	float c_ = (c.x + c.y + c.z)/3.0;
	return vec3(a_,b_,c_);
}

vec3 g_setH(vec3 a, vec3 b) {
	float b_ = (b.x + b.y + b.z)/3.0;
	a = g_rgb2hsb(a);
	a.x = b_;
	a = g_hsb2rgb(a);
	return a;
}

vec3 g_offsetH(vec3 a, vec3 b) {
	float b_ = (b.x + b.y + b.z)/3.0;
	a = g_rgb2hsb(a);
	a.x += b_;
	a = g_hsb2rgb(a);
	return a;
}

vec3 g_setS(vec3 a, vec3 b) {
	float b_ = (b.x + b.y + b.z)/3.0;
	a = g_rgb2hsb(a);
	a.y = b_;
	a = g_hsb2rgb(a);
	return a;
}
vec3 g_setV(vec3 a, vec3 b) {
	float b_ = (b.x + b.y + b.z)/3.0;
	a = g_rgb2hsb(a);
	a.z = b_;
	a = g_hsb2rgb(a);
	return a;
}

// NOISE ---------

float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f*f*(3.0-2.0*f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

vec3 g_noise2(vec3 a, vec3 b) {
	vec3 temp;
	temp.x = noise(vec2(a.x,b.x));
	temp.y = noise(vec2(a.x,b.x));
	temp.z = noise(vec2(a.x,b.x));
	return temp;
}

// ---------------

// TONE MAPPING

vec3 g_tonemap(vec3 c) {
	return c / max(vec3(1.0), abs(c));
}

// PROCESSING

vec3 process(vec3 c) {
	c = g_offsetH(c, vec3(u_hoff,u_hoff,u_hoff));
	c = g_tonemap(c);
	return c;
}

void main() {
	vec3 col;
	vec3 sum = vec3(0.0, 0.0, 0.0);
	for (int y_ = 0; y_ < MAX_AA; y_++) {
		if (y_ >= u_aa) break;
		iterY = y_;
		for (int x_ = 0; x_ < MAX_AA; x_++) {
			if (x_ >= u_aa) break;
			iterX = x_;
			__DNA_CODE__
			sum += col;
		}
	}
	col = sum / float(u_aa * u_aa);
	col = process(col);
	gl_FragColor = vec4(col,1.0);
}
`;
