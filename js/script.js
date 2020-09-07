!function() {
	'use strict';

	// フェードインライブラリ初期化
	AOS.init({
		// Settings that can be overridden on per-element basis, by `data-aos-*` attributes:
		offset: 400, // offset (in px) from the original trigger point
		duration: 1000, // values from 0 to 3000, with step 50ms
		once: true, // whether animation should happen only once - while scrolling down
	});

	var canvas = document.querySelector('#webgl');

	// スクロール用変数
	var scroll = 0.0, velocity = 0.0, lastScroll = 0.0;

	var regl = createREGL({
		canvas: canvas,
		onDone: function(error, regl) {
			if (error) { alert(error); }
		}
	});

	// Loading a texture
	var img = new Image();
	img.src = 'img/gradient_map3.png';
	img.onload = function() {
		setTimeout(function() { document.body.classList.remove('loading');}, 1000);

		// Create a REGL draw command
		var draw = regl({
			frag: document.querySelector('#fragmentShader').textContent,
			vert: 'attribute vec2 position; void main() { gl_Position = vec4(3.0 * position, 0.0, 1.0); }',
			attributes: { position: [-1, 0, 0, -1, 1, 1] },
			count: 3,
			uniforms: {
				globaltime: regl.prop('globaltime'),
				resolution: regl.prop('resolution'),
				aspect: regl.prop('aspect'),
				scroll: regl.prop('scroll'),
				velocity: regl.prop('velocity'),
				gradient: regl.texture(img)
			}
		});

		// Hook a callback to execute each frame
		regl.frame(function(ctx) {

			// Resize a canvas element with the aspect ratio (100vw, 100vh)
			var aspect = canvas.scrollWidth / canvas.scrollHeight;
			canvas.width = 768 * aspect;
			canvas.height = 768;

			// Scroll amount (0.0 to 1.0)
			scroll = window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight) - 1;

			// Scroll Velocity
			// Inertia example:
			velocity = velocity * 0.99 + (scroll - lastScroll);
			lastScroll = scroll;

			// Clear the draw buffer
			regl.clear({ color: [0, 0, 0, 0] });

			// Execute a REGL draw command
			draw({
				globaltime: ctx.time,
				resolution: [ctx.viewportWidth, ctx.viewportHeight],
				aspect: aspect,
				scroll: scroll,
				velocity: velocity
			});
		});
	};

}();
