const FS_CODE = `
    #define TWO_PI 6.2831853072
    #define PI 3.14159265359

    precision highp float;

    uniform float globaltime;
    uniform vec2 resolution;
    uniform float aspect;
    uniform float scroll;
    uniform float velocity;
    uniform sampler2D gradient;

    // アニメーションの速さ
    const float timescale = 0.04;

    float nsin(float value) {
        return sin(value * TWO_PI) * 0.9 + 0.2;
    }

    vec2 rotate(vec2 v, float angle) {
        float c = cos(angle);
        float s = sin(angle);
        return v * mat2(c, -s, s, c);
    }

    vec3 coordToHex(vec2 coord, float scale, float angle) {
        vec2 c = rotate(coord, angle);
        float q = (1.0 / 3.0 * sqrt(3.0) * c.x - 1.0 / 3.0 * c.y) * scale;
        float r = 2.0 / 3.0 * c.y * scale;
        return vec3(q, r, -q - r);
    }

    vec3 hexToCell(vec3 hex, float m) {
        return fract(hex / m) * 2.0 - 1.0;
    }

    float absMax(vec3 v) {
        return max(max(abs(v.x), abs(v.y)), abs(v.z));
    }

    float hexToFloat(vec3 hex, float amt) {
        return mix(absMax(hex), 1.0 - length(hex) / sqrt(9.0), amt);
    }

    int getHexDir(vec3 hex) {
        if (mod(floor(hex.x) - floor(hex.y) - floor(hex.z), 2.0) == 0.0) {
            return 0;
        } else {
            return 1;
        }
    }

    int getHexType(vec3 hex) {
        if (mod(floor(hex.x) - floor(hex.y) - floor(hex.z), 3.0) == 0.0) {
            return 0;
        } else if (mod(floor(hex.x) - floor(hex.y) - floor(hex.z) - 1.0, 3.0) == 0.0) {
            return 1;
        } else {
            return 2;
        }
    }

    vec3 divideHex(vec3 hex, inout int age, float time) {
        vec3 cell;
        int dir = 0, type = 0;
        float scale = 0.0;

        for (int i = 0; i < 4; i++) {
            scale = 1.0 + float(type) * nsin(time);
            cell = hexToCell(hex * scale, 1.0);
            dir = getHexDir(hex);
            type = getHexType(hex);
            hex = cell;
            if (dir == 1 && type == 1) {
                age = i;
                break;
            }
        }
        return cell;
    }

    void main(void) {
        float time = globaltime * timescale;
        vec2 center = vec2(sin(TWO_PI * time * 0.5), cos(TWO_PI * time * 0.5)) * nsin(time * 0.3) * 0.3;
        vec2 tx = (gl_FragCoord.xy / resolution.xy - 0.5 + center) * vec2(aspect, 1.0) * 2.0;
        float len = 1.0 - length(tx - center * 2.0) * 0.3;
        float zoom = 1.0 + scroll * 1.0;
        float angle = PI * scroll;
        float value = 0.0;
        int age = 0;
        vec3 hex = coordToHex(tx, zoom, angle);
        vec3 cell = divideHex(hex, age, time * 0.1);
        float shift = float(age) / 3.0;

        value = nsin(
            hexToFloat(cell, nsin(time + shift)) * 0.1 * nsin(time * 0.5 + shift)
            + shift
            + time
        ) * len;

        gl_FragColor = texture2D(gradient, vec2(0.0, value));
    }
`;

