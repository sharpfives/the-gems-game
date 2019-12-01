'use strict';

export const RGBSeparatePipeline = new Phaser.Class({

    Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,

    initialize:

    function RGBSeparatePipeline (game)
    {
        Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
            game: game,
            renderer: game.renderer,
            fragShader: [
            "precision mediump float;",

            "uniform vec2       offset;",
            "uniform int      separate;",
            "uniform vec2       resolution;",
            "uniform sampler2D  uMainSampler;",
            "varying vec2       outTexCoord;",

            "#define PI 0.01",

            "float random (vec2 st) {",
                "return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);",
            "}",

            "void main( void ) {",

                "vec2 st = gl_FragCoord.xy/resolution.xy;",

                "float rnd = (random( st ) + 1.0) / 2.0;",
                //this will be our RGBA sum
                "vec4 sum = vec4(0.0);",
                //our original texcoord for this fragment
                "vec2 tc = outTexCoord;",

                "vec4 left = texture2D(uMainSampler, vec2(tc.x + offset.x + rnd, tc.y));",
                "vec4 right = texture2D(uMainSampler, vec2(tc.x + offset.y , tc.y));",
                "vec4 blue = texture2D(uMainSampler, vec2(tc.x + offset.x/2.0 + rnd, tc.y));",
                "vec4 center = texture2D(uMainSampler, vec2(tc.x, tc.y));",

                // "sum += mix(vec4(left.r, 0.0, 0.0, left.a), center, 0.5);",
                "sum += vec4(left.r, 0.0, 0.0, left.a);",
                "sum += vec4(0.0, right.g, 0.0, right.a);",
                "sum += vec4(0.0, 0.0, blue.b, blue.a);",

								"if (separate == 1) {",
                  "gl_FragColor = sum;",
                "} else { ",
                  "gl_FragColor = center;",
                "}",

            "}"
            ].join('\n')
        });
    }

});
