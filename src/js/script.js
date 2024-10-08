import $ from 'jquery'
import AOS from 'aos'
import createREGL from 'regl'
import { createClient } from 'microcms-js-sdk'
import { config } from '../../config'

const makeAnime = function() {
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
  `

  const canvas = document.querySelector('#webgl')
  let scroll = 0.0, velocity = 0.0, lastScroll = 0.0

  const regl = createREGL({
    canvas: canvas,
    onDone: function(error, regl) {
      if (error) { alert('申し訳ございません。只今メンテナンス中です。') }
    }
  })

  // Loading a texture
  const img = new Image()
  img.src = require('../img/gradient_map3.png')
  img.onload = function() {
    setTimeout(function() { document.body.classList.remove('loading');}, 1000)

    // Create a REGL draw command
    const draw = regl({
      frag: FS_CODE,
      vert: 'attribute vec2 position; void main() { gl_Position = vec4(3.0 * position, 0.0, 1.0); }',
      attributes: { position: [-1, 0, 1, -1, 0, 1] },
      count: 3,
      uniforms: {
        globaltime: regl.prop('globaltime'),
        resolution: regl.prop('resolution'),
        aspect: regl.prop('aspect'),
        scroll: regl.prop('scroll'),
        velocity: regl.prop('velocity'),
        gradient: regl.texture(img)
      }
    })

    // Hook a callback to execute each frame
    regl.frame(function(ctx) {

      // Resize a canvas element with the aspect ratio (100vw, 100vh)
      var aspect = canvas.scrollWidth / canvas.scrollHeight
      canvas.width = 768 * aspect
      canvas.height = 768

      // Scroll amount (0.0 to 1.0)
      scroll = window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)

      // Scroll Velocity
      // Inertia example:
      // velocity = velocity * 0.99 + (scroll - lastScroll);
      // lastScroll = scroll;

      // Clear the draw buffer
      regl.clear({ color: [0, 0, 0, 0] })

      // Execute a REGL draw command
      draw({
        globaltime: ctx.time,
        resolution: [ctx.viewportWidth, ctx.viewportHeight],
        aspect: aspect,
        scroll: scroll,
        velocity: velocity
      })
    })
  }
}

const showWorkTags = function(workCard, content) {
  console.log(workCard)
  workCard.find('.work-card__projectName').text(content.projectName)

  const ulBusinessType = workCard.find('.work-card__businessType')
  ulBusinessType.append(`<li><span class="tag tagcolor-design">#${content.businessType}</span></li>`)

  const ulProcesses = workCard.find('.work-card__processes')
  content.processes.forEach(function(process) {
    ulProcesses.append(`<li><span class="tag tagcolor-category">#${process}</span></li>`)
  })
  const ulLanguages = workCard.find('.work-card__languages')
  content.languages.forEach(function(lang) {
    ulLanguages.append(`<li><span class="tag tagcolor-wordpress">#${lang}</span></li>`)
  })
  const ulFrameworks = workCard.find('.work-card__frameworks')
  content.frameworks.forEach(function(fw) {
    ulFrameworks.append(`<li><span class="tag tagcolor-quality">#${fw}</span></li>`)
  })
}
const embedContents = function() {
  const client = createClient({
    serviceDomain: config.serviceDomain,
    apiKey: config.apiKey,
  });
  client
    .get({
      endpoint: 'works',
      queries: { filters: 'createdAt[greater_than]2021' },
    })
    .then((res) => {
      if (res.totalCount < 0) {
        return
      }
      res.contents.forEach((content, i) => {
        const clonedElem = $('#work-li').clone()
        clonedElem.attr('id', `#work-li${i}`)
        const workCard = clonedElem.find('#work-card')
        workCard.attr('id', `#work-card${i}`)
        showWorkTags(workCard, content)
        $('#works-list').append(clonedElem)
      })
    })
    .catch((err) => console.error(err));
}

!function() {
  'use strict'

  const windowHeight = $(window).height()
  $('.content').css({
    'height': windowHeight,
    'padding-top': windowHeight * 0.05,
    'padding-bottom': windowHeight * 0.05,
  });
  $('.main-visual').css({'height': $(window).height()});

  // SP版サブタイトル文字数変更
  $(window).on('load resize', function(){
    const subtitle = 'Fleelance Software Developer'
    const winW = $(window).width()
    const devW = 415
    if (winW <= devW) {
      $('.main-subtitle').html(subtitle);
    } else {
      const devicesEmoji = '&#128421; &#128187; &#128241;'
      $('.main-subtitle').html(`${subtitle} ${devicesEmoji}`)
    }
  })

  // フェードインライブラリ初期化
  AOS.init({
    // Settings that can be overridden on per-element basis, by `data-aos-*` attributes:
    //offset: 400, // offset (in px) from the original trigger point
    duration: 1000, // values from 0 to 3000, with step 50ms
    once: true, // whether animation should happen only once - while scrolling down
  })

  // ハンバーガーメニュー
  $('.hamb-button').on('click', function() {
    $('.hamb-button').toggleClass('close-button')
    $('.nav').toggleClass('hamb-nav display-none')
  })
  $('.nav-link').on('click', function() {
    $('.hamb-button').toggleClass('close-button')
    $('.nav').toggleClass('hamb-nav display-none')
  })

  // モーダルライブラリ初期化
  $("#dummy1").modaal({
    content_source: '#dummy1-modal'
})

  // スクロールボタン押下時処理　トップに戻る
  $(window).scroll(function () {
    const now = $(window).scrollTop()
    if (now > 200) {
      $('.pagetop').fadeIn("slow")
    } else {
      $('.pagetop').fadeOut('slow')
    }
  })

  makeAnime()

  embedContents()
}()
