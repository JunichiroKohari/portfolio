!function() {
	'use strict';

	// フェードインライブラリ初期化
	AOS.init({
		// Settings that can be overridden on per-element basis, by `data-aos-*` attributes:
		//offset: 400, // offset (in px) from the original trigger point
		duration: 1000, // values from 0 to 3000, with step 50ms
		once: true, // whether animation should happen only once - while scrolling down
	});

	// ハンバーガーメニュー
    $('.hamb-button').on('click', function() {
        if ($('.hamb-nav').length) {
			$('.hamb-button').removeClass('close-button');
            $('.nav').removeClass('hamb-nav');
            $('.nav').addClass('display-none');
        } else {
            $('.hamb-button').addClass('close-button');
            $('.nav').addClass('hamb-nav');
            $('.nav').removeClass('display-none');
        }
    });
    $('.nav-link').on('click', function() {
        if ($('.hamb-nav').length) {
            $('.hamb-button').removeClass('close-button');
            $('.nav').removeClass('hamb-nav');
            $('.nav').addClass('display-none');
        }
    });

	// Works モーダル
	$('#dummy1').on('click', function() {
		$('#modaal-window-wrapper1').html('');
		$('#modaal-window-wrapper1').html('<div class="dummy-modal-left"><img src="img/works/dummy1.png" class="media-item__img" alt="株式会社テスト様公式HPのトップ画"><h3 class="media-item__title">株式会社テスト様公式HP</h3><div class="tags modal-tags"><span class="tag tagcolor-coding">#コーディング</span><span class="tag tagcolor-category">#コーポレートサイト</span><span class="tag tagcolor-design">#ビジネス</span><span class="tag tagcolor-design">#シンプル</span><span class="tag tagcolor-quality">#納品一週間以内</span></div></div>');
		$('#modaal-window-wrapper1').append('<p class="dummy-modal-right">dummy1の紹介文</p>');
	})
	$('#dummy2').on('click', function() {
		$('#modaal-window-wrapper2').html('');
		$('#modaal-window-wrapper2').html('<div class="dummy-modal-left"><img src="img/works/dummy2.png" class="media-item__img" alt="テスト太郎様個人ブログ"><h3 class="media-item__title">テスト太郎様個人ブログ</h3><div class="tags modal-tags"><span class="tag tagcolor-wordpress">#WordPress</span><span class="tag tagcolor-category">#個人ブログ</span><span class="tag tagcolor-design">#アフィリエイト</span><span class="tag tagcolor-quality">#SEO</span></div></div>');
		$('#modaal-window-wrapper2').append('<p class="dummy-modal-right">dummy2の紹介文</p>');
	})
	$('#dummy3').on('click', function() {
		$('#modaal-window-wrapper3').html('');
		$('#modaal-window-wrapper3').html('<div class="dummy-modal-left"><img src="img/works/dummy3.png" class="media-item__img" alt="テスト花子様個人ブログ"><h3 class="media-item__title">テスト花子様個人ブログ</h3><div class="tags modal-tags"><span class="tag tagcolor-wordpress">#WordPress</span><span class="tag tagcolor-category">#個人ブログ</span><span class="tag tagcolor-design">#おしゃれ</span><span class="tag tagcolor-quality">#納品一週間以内</span></div></div>');
		$('#modaal-window-wrapper3').append('<p class="dummy-modal-right">dummy3の紹介文</p>');
	})

	// モーダルライブラリ初期化
	$('.modaal').modaal();

	// スクロールボタン押下時処理　トップに戻る
	$(window).scroll(function () {
		var now = $(window).scrollTop();
		if (now > 200) {
		  $('.pagetop').fadeIn("slow");
		} else {
		  $('.pagetop').fadeOut('slow');
		}
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
		});

		// Hook a callback to execute each frame
		regl.frame(function(ctx) {

			// Resize a canvas element with the aspect ratio (100vw, 100vh)
			var aspect = canvas.scrollWidth / canvas.scrollHeight;
			canvas.width = 768 * aspect;
			canvas.height = 768;

			// Scroll amount (0.0 to 1.0)
			scroll = window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight);

			// Scroll Velocity
			// Inertia example:
			// velocity = velocity * 0.99 + (scroll - lastScroll);
			// lastScroll = scroll;

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
