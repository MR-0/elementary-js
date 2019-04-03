/*!
---------------------------
Elementary JS
---------------------------
Version: 1.1.0
Author: MR0
Author URL: http://mr0.cl
---------------------------
MR0 © 2019 | MIT license
---------------------------
*/

(function(){
	
	var El = Array;
	var el = window.el = new El();

	// REQUEST ANIMATION FRAME METHOD: PUBLIC

	var raf = 
		window.requestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.msRequestAnimationFrame;

	// ANIMATE METHOD: PUBLIC

	var animate = (function() {
		var all = [];

		function step() {
			all.map(function(anim, i){
				if (anim.state === 'play') {
					if (!anim.fun()) all.splice(i,1);
				}
			});
			
			raf(step);
		}

		step();
		
		return function(fun) {
			var anim = {
				fun: fun,
				state: 'play',
				pause: function() {
					this.state = 'pause';
				},
				play: function() {
					this.state = 'play';
				}
			}
			all.push(anim);
		}
	})();

	
	// REGISTER COMPONENT METHOD: PUBLIC
	
	function component(selector, fun) {
		selector = selector.split('.');
		var tag = selector[1] ? selector[0] : null;
		var name = selector[1] ? selector[1] : selector[0];
		var elements = document.getElementsByClassName(name);
			elements = Array.prototype.slice.call(elements, 0);
			elements = tag ? elements.filter(function(d){
				return d.tagName === tag.toUpperCase();
			}) : elements;
		var listener = fun(elements);
		elements.map(function(that){
			var events = {};
			var options = that.dataset[name] || '{}';
			var component = {
				name: 			name,
				options: 		parse(options),
				original: 	that.outerHTML,
				element: 		that,
				elements:		elements,
				on: 				function(name, fun) {
					events[name] = events[name] || [];
					events[name].push(fun);
				}
			};
			that.el = { component: component };
			listener.call(that, component, events);
		});
	};

	// CREATE METHOD: PUBLIC

	function create(tag, attrs) {
		var elem = null;
		if (tag === 'svg') {
			elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
			for (var key in attrs) {
				elem.setAttributeNS(null, key, attrs[key]);
			}
		}
		else {
			elem = document.createElement(tag);
			for (var key in attrs) {
				elem.setAttribute(key, attrs[key]);
			}
		}
		return elem;
	};

	// EXTEND METHOD: PUBLIC

	function extend(obj, o) {
		Object.keys(obj).map(function(k){
			o[k] = obj[k];
		});
		return o;
	};

	// POST METHOD: PUBLIC

	function get(url, fun) {
		var xhr = new XMLHttpRequest();
		xhr.open('get', url);
		xhr.onreadystatechange = function() {
			if(xhr.readyState == 4 && xhr.status == 200) {
				fun.call(xhr, xhr.response);
			}
		}
		xhr.send(null);
	}

	// INTERPOLATE METHOD: PUBLIC

	var interpolate = (function() {
		var all = [];

		function step() {
			all.map(function(d, i){
				var lapse = ((Date.now() - d.start) / d.time).toFixed(4) * 1;
				lapse = lapse > 1 ? 1 : lapse;
				d.fun(lapse);
				if (lapse === 1) all.splice(i,1);
			});
			if (all.length) raf(step);
		}
		
		return function(time, fun) {
			all.push({
				start: Date.now(),
				time: time,
				fun: fun
			});
			step();
		}
	})();

	// IN-REQUIRE METHOD: PUBLIC

	var inrequire = (function(){
		var scripts = [];
		window.__temp_inrequire_data = null;
		window.__temp_inrequire_return = null;
		return function(src, callback, data){
			var script = create('script');
			get(src, function(str){
				script.text = 'window.__temp_inrequire_return = (function(data){'+str+'})(window.__temp_inrequire_data);';
				scripts.push(script);
				window.__temp_inrequire_data = data;
				document.body.appendChild(script);
				callback.call(this, window.__temp_inrequire_return);
				window.__temp_inrequire_data = null;
				window.__temp_inrequire_return = null;
			});
		};
	})();

	// OFFSET METHOD: PUBLIC

	function offset(that) {
		that = that || this[0];
		var x = that.offsetLeft;
		var y = that.offsetTop;
		while (that = that.offsetParent) {
			x += that.offsetLeft;
			y += that.offsetTop;
		}
		return { x: x, y: y };
	};

	// ON METHOD: PUBLIC

	function on(name, fun) {
		this.map(function(that){
			if (that.el.component && that.el.component.on) that.el.component.on(name, fun);
		});
	};

	// PARSE METHOD: PUBLIC

	function parse(str) {
		str = str.replace(/([^,\s\{\}]+:)/g, function(str){
			return '"'+str.slice(0,-1)+'":';
		});

		return JSON.parse(str);
	};

	// POST METHOD: PUBLIC

	function post(url, data, fun) {
		var xhr = new XMLHttpRequest();
		if (typeof data === 'function') {
			fun = data;
			data = null;
		}
		if (data) {
			Object.keys(data).map(function(k){
				data[k] = encodeURIComponent(data[k]+'');
			});
			data = JSON.stringify(data)
				.replace(/:/g, '=')
				.replace(/,/g, '&')
				.replace(/"|{|}/g, '');
		}
		xhr.open('post', url);
		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		xhr.onreadystatechange = function() {
			if(xhr.readyState == 4 && xhr.status == 200) {
				fun.call(xhr, xhr.response);
			}
		}
		xhr.send(data);
	}

	// REQUIRE METHOD: PUBLIC

	var require = (function(){
		var scripts = [];
		return function(src, callback){
			var ind = scripts.map(function(d){ return d.src; }).indexOf(src);
			if (ind < 0) {
				var script = create('script', { src: src });
				scripts.push(script);
				document.head.appendChild(script);
			}
			var current = script || scripts[ind];
			
			if (current.loaded) callback && callback.call(current, null);
			else current.addEventListener('load', function(e){
				this.loaded = true;
				callback && callback.call(this, e);
			});
		};
	})();

	// SCROLL METHOD: PUBLIC

	var scroll = (function(){
		var funs = [];
		var doc = document.documentElement;
		var now = Date.now();
		
		window.addEventListener('scroll',function(e){
			funs.map(function(d){
				var x = left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
				var y = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
				if (now + d.throttle < Date.now()) {
					d.fun(x, y);
				}
			});
			now = Date.now();
		});
		
		return function(fun, throttle) {
			throttle = throttle || 12;
			funs.push({ fun: fun, throttle: throttle });
		}
	})();

	// SELECT: PUBLIC

	function select(selector){
		if (typeof selector === 'string') {
			if (this.length && this.length > 1) {
				selector = this.reduce(function(o, e){
					return o.concat(el.select(e).select(selector))
				}, []);
			}
			else selector = (this[0] || document).querySelectorAll(selector);
		}
		selector = selector.length ? selector : [selector];
		return this.slice.call(selector, 0);
	}

	// STYLE METHOD: PUBLIC

	function style(str){
		if (str) {
			str = document.createTextNode(str);
			var elem = el.create('style', { type: 'text/css' });

			elem.appendChild(str);
			document.head.appendChild(elem);
			return elem;
		}
		return null;
	};
	
	// WAIT FOR | PSUDO LISTENER MEHTOD: PUBLIC

	function waitfor(fun, lapse) {
		if (!fun()) setTimeout(function () {
			waitfor(fun, lapse);
		}, lapse || 33);
	};

	// ABOUT

	El.prototype.version      = '1.0.0';

	// REGISTER METHODS

	El.prototype.animate      = animate;
	El.prototype.component    = component;
	El.prototype.create       = create;
	El.prototype.extend       = extend;
	El.prototype.get          = get;
	El.prototype.interpolate  = interpolate;
	El.prototype.inrequire    = inrequire;
	El.prototype.offset       = offset;
	El.prototype.on           = on;
	El.prototype.parse        = parse;
	El.prototype.post         = post;
	El.prototype.raf          = raf;
	El.prototype.require      = require;
	El.prototype.scroll       = scroll;
	El.prototype.select       = select;
	El.prototype.style        = style;
	El.prototype.waitfor      = waitfor;

	return null;
})();


// —————————————————————————————————————————
// CHANGE LETTERS | 1.0.0
// —————————————————————————————————————————

el.component('.change-letters', function(elements){
	var spans = [];
	var old = Date.now();
	
	el.animate(function(){
		var now = Date.now();
		if (now - old > 66) {
			old = now;
			spans.map(function(span){
				if (span.delay < now - span.old) {
					span.old = now;
					
					span.letters.map(function(d){
						d.state = 0.25 > Math.random();
						if (d.state) d.current = rand_letter(d.current);
						else d.current = d.original;
					});
				}
				var letters = span.letters.map(function(d){
					if (d.state) d.current = rand_letter(d.current) || d.original;
					else d.current = d.original;
					d.state = d.current !== d.original;
					return String.fromCharCode(d.current);
				});	
				span.node.innerText = letters.join('');		
			});
		}
		return true;
	});

	function rand_letter(n, i) {
		i = (i || 0) + 1;
		n += Math.round(Math.random() * 128) - 64;
		if (i < 10) {
			// if (n < 33 || (n > 126 && n < 160)) return rand_letter(n, i);
			// http://www.asciitable.com/
			if (n < 33 || n > 126) return rand_letter(n, i);
			return n;
		}
		return null;
	}
	
	return function(behavior) {

		el.select(this)
			.select('span')
			.map(function(e){
				var delay = behavior.options && behavior.options.delay;
				var letters = (e.innerText || '')
					.split('')
					.map(function(d){
						var n = d.charCodeAt(0);
						return {
							original: n,
							current: n,
							state: false
						};
					});
				spans.push({
					node: e,
					old: Date.now(),
					delay: delay || 1200,
					letters: letters
				});
			});
	};
});

// —————————————————————————————————————————
// SCROLL TO | 1.0.0
// —————————————————————————————————————————

el.component('a.scroll-to', function(elements){
	return function(behavior) {
		var hash = el.select(this.hash);
		this.addEventListener('click', function(e){
			var y = el.offset(hash[0]).y;
			var ini = window.scrollY;
			var elapse = Math.abs(ini - y) * 0.3;
			el.interpolate(elapse, function(t){
				var tt = Math.sin(0.5 * t * Math.PI);
				var dy = ini * (1 - tt) + y * tt;
				window.scrollTo(0, dy);
			});
		});
	}
});

// —————————————————————————————————————————
// SCROLL SPY | 1.0.0
// —————————————————————————————————————————

el.component('a.scroll-spy', function(elements){
	var all = [];

	el.scroll(function(x,y){
		all.map(function(d){
			var that = d.hash[0];
			var is = that.classList.contains('scroll-spy-current');
			var dy = el.offset(that).y - window.innerHeight * 0.5;
			if (!is && dy - y < 0 && that.offsetHeight + dy - y > 0) {
				d.anchor.classList.add('scroll-spy-current');
			}
			else {
				d.anchor.classList.remove('scroll-spy-current');
			}
		});
	});

	return function(behavior) {
		var that = el.select(this.hash);
		all.push({
			anchor : this,
			hash : that
		});
	}
});

// —————————————————————————————————————————
// SCROLL SLIDES | 1.0.0
// —————————————————————————————————————————

el.component('.scroll-slides', function(elements){
	var all = [];
	var wh = window.innerHeight;
	var ww = window.innerWidth;
	var scroll = window.scrollY;
	var dscroll = 0;

	el.style("\
		.scroll-slides .scroll-slide {\
			position: relative;\
			top: 0;\
			left: 0;\
			width: 100%;\
		}\
		.scroll-slides.scroll-slides-on .scroll-slide {\
			position: fixed;\
		}\
	");

	el.scroll(function(x,y){
		dscroll = scroll - y;
		scroll = y;
	}, 0);

	el.animate(function(){
		var fit = scroll;
		
		all.map(function(that){
			var is = that.node.classList.contains('scroll-slides-on');
			var is_fit = false;
			var of = el.offset(that.node).y;
			var hp = wh / (that.elements.length + 1);
			var height = 0;

			that.elements.map(function(element, i){
				var h = element.node.clientHeight;
				var hh = h - hp;
				var dh = height + of - scroll - hp * i;
				var is_current = element.node.classList.contains('current');
				
				height += h;

				element.childs.map(function(child){
					var dat = child.data;
					var pow = dat.pow || 3;
					var dd = dh * Math.pow(Math.abs(dh), pow - 1);

					var x = dd * (dat.x || 0) * ww / Math.pow(hh, pow);
					var y = dd * (dat.y || 0) * wh / Math.pow(hh, pow);
					var z = dd * (dat.z || 0) / Math.pow(hh, pow);

					is_fit = is_fit || dat.fit || false;

					x = x > ww * 3 ? ww * 3 :
							x < ww * -3 ? ww * -3 :
							x;
					
					y = y > wh * 3 ? wh * 3 :
							y < wh * -3 ? wh * -3 :
							y;

					child.trans({ x: x, y: y, z: z });
				});

				if (is_fit) {
					if (dh / hh < 0.5 && dh / hh > -0.5) fit = height + of - wh - hp * i;
				}


				if (dh < hh * 0.5 && dh + hh * 0.5 > 0) {
					if (!is_current) {
						element.node.classList.add('current');
						if (that.events.change) that.events.change.map(function(fun){
							fun.call(element.node);
						});
					}
				}
				else {
					element.node.classList.remove('current');
				}

				if (dh < 0) {
					element.node.classList.add('backwrds');
				}
				else {
					element.node.classList.remove('backwrds');
				}

			});

			if (that.height !== height) {
				that.height = height;
				that.node.style.height = height + 'px';
			}

			if (of < scroll && of + height > scroll + wh) {
				if (!is) that.node.classList.add('scroll-slides-on');
			}
			else {
				if (is) that.node.classList.remove('scroll-slides-on');
			}
		});

		if (fit !== scroll) {
			dscroll = Math.abs(dscroll) < 2 ? 0 : dscroll;
			scroll += ((fit - scroll - dscroll * 20) * 0.05).toFixed(0) * 1;
			window.scrollTo(0, scroll);
		}
		
		return true;
	});

	window.addEventListener('resize', function(e){
		wh = window.innerHeight;
		ww = window.innerWidth;
	});

	function translate(that) {
		var x = 0;
		var y = 0;
		var z = 0;
		var a = 0.25;
		var old = window.getComputedStyle(that).transform;

		old = old !== 'none' ? old : '';
		
		return function(d) {

			d.x = d.x || 0;
			d.y = d.y || 0;
			d.z = d.z || 0;
			x += (d.x - x) * a;
			y += (d.y - y) * a;
			z += (d.z - z) * a;
			x = x.toFixed(0) * 1;
			y = y.toFixed(0) * 1;
			z = z.toFixed(0) * 1;

			if (d.x !== x || d.y !== y || d.z !== z) {
				that.style.transform = old + ' \
					translateX('+ x +'px) \
					translateY('+ y +'px) \
					translateZ('+ z +'px)';
				return true;
			}
		};
	}

	return function(behavior, events) {

		var elements = el
			.select(this)
			.select('.scroll-slide')
			.filter(function(node){ return node.nodeType === 1; })
			.map(function(that){

				var childs = el
					.select(that)
					.select('[data-scroll-slides]')
					.concat([that])
					.filter(function(e){ return e.dataset && e.dataset.scrollSlides; })
					.map(function(e){ 
						var data = e.dataset.scrollSlides;
						return {
							node: e,
							data: el.parse(data), 
							trans: translate(e)
						};
					});
				
				return {
					node: that,
					childs: childs
				};
			});
		
		all.push({
			node: this,
			height: 0,
			elements: elements,
			events: events
		});
	};
});

// —————————————————————————————————————————
// SCROLL TRANSFORM | 1.1.0
// —————————————————————————————————————————

el.component('.scroll-transform', function(elements){
	var all = [];
	var wh = window.innerHeight;
	var ww = window.innerWidth;
	var scroll = window.scrollY;

	el.scroll(function(x,y){
		scroll = y;
	}, 0);

	el.animate(function(){

		all.map(function(that){
			var h = that.node.clientHeight;
			var of = el.offset(that.node).y;
			var dh = h + of - scroll - wh * 0.5;
			var dat = that.data;
			var pow = dat.pow || 1;
			var dd = dh * Math.pow(Math.abs(dh), pow - 1);
			var hh = Math.pow(wh, pow);

			if (dh + wh > 0 && dh - wh * 2 < 0) {
				that.trans({
					x: dd * (dat.x || 0) * ww / hh,
					y: dd * (dat.y || 0) * wh / hh,
					z: dd * (dat.z || 0) / hh,
					r: dd * (dat.r || 0) * 180 / hh,
					s: 1 + dd * (dat.s || 0) / hh
				});
			}
		});
		
		return true;
	});

	window.addEventListener('resize', function(e){
		wh = window.innerHeight;
		ww = window.innerWidth;
	});

	function translate(that) {
		var a = 0.5;
		var old = window.getComputedStyle(that).transform;
		var vl = {};
		var tr = {
			x: 'translateX',
			y: 'translateY',
			z: 'translateZ',
			r: 'rotate',
			s: 'scale'
		};

		old = old !== 'none' ? old : '';
		
		return function(d) {
			var str = old;
			var is = false;
			
			for (var k in tr) {
				d[k] = d[k] || 0;
				vl[k] = vl[k] || 0;
				vl[k] += (d[k] - vl[k]) * a;
				vl[k] = vl[k].toFixed(3) * 1;
				if (k === 'x' || k === 'y' || k === 'z') {
					str += ' '+ tr[k] +'('+ vl[k] +'px)';
				}
				else if (k === 's') {
					str += ' '+ tr[k] +'('+ vl[k] +')';
				}
				else {
					str += ' '+ tr[k] +'('+ vl[k] +'deg)';
				}
				is = is || vl[k] !== d[k];
			}

			console.log(str);

			if (is) that.style.transform = str;

			return is;
		};
	}

	return function(behavior, events) {
		var data = this.dataset.scrollTransform;
		
		all.push({
			node: this,
			data: el.parse(data),
			trans: translate(this)
		});
	};
});

// —————————————————————————————————————————
// SNAP | 1.0.0
// —————————————————————————————————————————

el.component('.snap', function(elements){
	var all = [];

	el.style("\
		.snap {\
			position: absolute;\
			margin-top: 0;\
			margin-bottom: 0;\
		}\
		.snap.snap-on {\
			position: fixed;\
		}\
	");

	el.scroll(function(x,y){
		var wh = window.innerHeight;
		all.map(function(d){
			var is = d.elem.classList.contains('snap-on');
			var dy = is ? d.y : el.offset(d.elem).y - d.top;
			var h = d.elem.parentNode.clientHeight;
			var end = y > dy + h - wh;
			
			if ( dy - y > 0 || end ) {
				if (is) {
					d.elem.classList.remove('snap-on');
					if (end) {
						d.top = h + d.elem.offsetTop - wh;
						d.elem.style.top = d.top + 'px';
					}
				}
			}
			else {
				d.y = dy;
				if (!is) {
					d.elem.classList.add('snap-on');
					d.elem.style.top = '';
					d.top = d.elem.offsetTop;
				}
			}
		});
	}, 0);

	return function(behavior) {
		all.push({
			elem : this,
			top : this.offsetTop,
			y : null
		});
	}
});

// —————————————————————————————————————————
// TO SVG | 1.0.0
// —————————————————————————————————————————

el.component('img.to-svg', function(elements){
	return function(behavior) {
		var that = this;
		var div = el.create('div');
		var classes = this.classList.value
			.replace('to-svg', '')
			.replace(/ {2,}/g, ' ')
			.trim();

		el.get(this.src, function(d){
			div.innerHTML = d;
			var svg = div.getElementsByTagName('svg')[0];
			svg.setAttributeNS(null, 'class', classes);
			that.outerHTML = svg.outerHTML;
		});
	}
});

// —————————————————————————————————————————
// VIDEO | 1.0.0
// —————————————————————————————————————————

el.component('a.video', function(elements){

	el.style("\
		a.video {\
			display: block;\
			overflow: hidden;\
			padding-bottom: 56.25%;\
			color: transparent;\
			font-size: 0;\
			line-height: 0;\
		}\
		a.video iframe {\
			position: absolute;\
			width: 100%;\
			height: calc(100% + 600px);\
			top: -300px;\
			left: 0;\
			z-index: 0;\
		}\
		a.video .cover {\
			z-index: 10;\
		}\
		a.video button.play {\
			position: absolute;\
			top: 50%;\
			left: 50%;\
			transform: translate(-45%,-50%) scale(1);\
			transition: transform ease 0.3s;\
			background: transparent;\
			z-index: 20;\
		}\
		a.video svg.loader {\
			position: absolute;\
			top: 50%;\
			left: 50%;\
			width: 140px;\
			height: 140px;\
			transform: translate(-50%,-50%) scale(1);\
			transition: transform ease 0.3s;\
			z-index: 15;\
		}\
		a.video svg.loader circle {\
			fill: transparent;\
			stroke: #FFF;\
			stroke-width: 4px;\
		}\
		a.video svg.loader circle.ind {\
			stroke-dasharray: 0 262%;\
			transform: rotate(0deg) translate(-50%,-50%);\
			transition: stroke-dasharray ease 0.3s 0.2s;\
			animation: none;\
		}\
		a.video.loading svg.loader circle.ind {\
			stroke-dasharray: 30% 262%;\
			animation: video-loader-rotate linear 1s infinite, video-loader-long linear 1s 0.5s infinite;\
		}\
		@keyframes video-loader-rotate {\
			0%   { transform: rotate(0deg) translate(-50%,-50%); }\
			100% { transform: rotate(360deg) translate(-50%,-50%); }\
		}\
		@keyframes video-loader-long {\
			0%, 100% { stroke-dasharray: 30% 262%; }\
			50%      { stroke-dasharray: 120% 262%; }\
		}\
		a.video svg.loader circle.bgd {\
			opacity: 0;\
			transition: opacity 0.3s;\
		}\
		a.video.loading svg.loader circle.bgd {\
			opacity: 0.3;\
		}\
		a.video.loading {\
			pointer-events: none;\
		}\
		a.video.loading:before {\
			content: \"\";\
			position: absolute;\
			top: 0;\
			left: 0;\
			width: 100%;\
			height: 100%;\
			background: #000;\
			opacity: 0.3;\
			z-index: 13;\
		}\
		a.video.loading button.play {\
			transform: translate(-45%,-50%) scale(0.82);\
		}\
		a.video button.play:before {\
			content: \"\";\
			display: block;\
			border: 25px solid transparent;\
			border-left: 40px solid #FFF;\
			border-right-width: 0;\
		}\
		a.video.in iframe {\
			z-index: 30;\
		}\
	");

	function _player(component, fun){
		var href = this.href;
		var youtube = href.match(/(?:watch\?v=|youtu\.be\/)([^&#?]+)/);
		var vimeo = href.match(/vimeo\.com\/([^&#?]+)/);
		var id = youtube ? youtube[1] : vimeo ? vimeo[1] : null;
		var options = component.options = el.extend(component.options, {
			autoplay: 0,
			mute: 0
		});
		var iframe = el.create('iframe', {
			frameborder: 0,
			allowfullscreen: 1
		});
		var player = {
			id: id,
			api: null,
			type: youtube ? 'youtube' : 'vimeo',
			anchor: this,
			iframe: iframe
		};
		
		if (youtube) {
			iframe = el.create('div');
			player.iframe = iframe;
			el.require('https://www.youtube.com/iframe_api');
			el.waitfor(function(){
				var has_api = window.YT && YT.Player;
				if (has_api) {
					player.api = new YT.Player(iframe, {
						'videoId': id,
						'playerVars': {
							'autoplay': options.autoplay,
							'controls': 0,
							//'showinfo': 0, // <- deprecated
							'listType': 'playlist',
							'modestbranding': 1,
							'iv_load_policy': 3,
							'cc_load_policy': 0,
							'playsinline': 1,
							'rel': 0
						}
					});
					
					player.api.addEventListener('onStateChange', function(e){
						if (e.data === 0) { // <-- End video
							player.anchor.classList.remove('in');
						}
					});
					
					fun && fun.call(player);
				}
				return has_api;
			});
		}
		
		if(vimeo) {
			iframe.src = ''+
				'https://player.vimeo.com/video/'+
				id+
				'?autoplay=1'+
				'&title=0'+
				'&byline=0'+
				'&portrait=0';
			fun && fun(player);
		}

		return player;
	}

	function _appear() {
		var that = this;
		this.anchor.classList.add('loading');
		if (this.api) {
			if (this.type === 'youtube') {
				el.waitfor(function(){
					if (that.api.playVideo) {
						that.api.playVideo();
						that.api.addEventListener('onStateChange', function(e){
							if (e.data === 1) { // <-- Play video
								that.anchor.classList.remove('loading');
								that.anchor.classList.add('in');
							}
						});
					}
					return that.api.playVideo;
				});
			}
		}
		else {
			this.iframe.addEventListener('load', function(){
				that.anchor.classList.remove('loading');
				that.anchor.classList.add('in');
			});
		}
	}

	return function(component){		
		if (this.href) {
			var that = this;
			var button = el.create('button', { class: 'play' });
			var loader = el.create('svg', { class: 'loader', viewBox: '0 0 140 140' });
			var cover = this.getElementsByClassName('cover')[0];
			var _get_player = [];
			var player = _player.call(this, component, function(){
				var that = this;
				if (_get_player.length) _get_player.map(function(fun){
					fun.call(that);
				});
				if (this.type === 'youtube' && component.options.mute) {
					this.api.addEventListener('onStateChange', function(e){
						if (e.data === 1) that.api.mute(); // <-- Play video
					});
				}
			});
			
			component.player = player;
			component.getPlayer = function(fun) {
				_get_player.push(fun);
			}

			this.appendChild(player.iframe);

			loader.innerHTML = '\
				<g transform="translate(70 70)">\
					<circle class="ind" cx="70" cy="70" r="60" />\
				</g>\
				<circle class="bgd" cx="70" cy="70" r="60" />';

			if (!component.options.autoplay) {
				this.appendChild(button);
				this.appendChild(loader);
				
				if (!cover) {
					cover = el.create('img', {
						class: 'cover',
						src: 'https://i.ytimg.com/vi/'+player.id+'/maxresdefault.jpg'
					});
					this.appendChild(cover);
				}
			}
			
			this.addEventListener('click', function(e){
				e.preventDefault();
				if(!component.options.autoplay) _appear.call(player);
			});
		}
	};
});