/*!
---------------------------
Elementary JS
---------------------------
Version: 1.10.1
Author: MR0
Author URL: http://mr0.cl
---------------------------
MR0 • 2019 | MIT license
---------------------------
*/

/*****************************************************
------------------------------------------------------
LOG
------------------------------------------------------
1.1.1 - 2019.04.04
- Add alt atribute to to-svg
------------------------------------------------------
1.2.0 - 2019.04.15
- Transform method
------------------------------------------------------
1.2.1 - 2019.04.15
- Fix transform method acc bug
------------------------------------------------------
1.3.0 - 2019.04.16
- Modal component
- HTML Element support to select method
------------------------------------------------------
1.3.2 - 2019.05.16
- Add list of components
- Recall component if no has constructor
- Exclude elements with 'el' property
- Add camel_case utility
------------------------------------------------------
1.4.0 - 2019.06.07
- Add init private method
- Refactor inicialization, move to init method
------------------------------------------------------
1.5.0 - 2019.06.09
- Id attribute is keeped in to-svg component behavior
------------------------------------------------------
1.5.1 - 2019.06.10
- Fix select over DOM node element behavior
------------------------------------------------------
1.5.2 - 2019.06.12
- Add cahce for to-svg behavior
------------------------------------------------------
1.6.0 - 2019.06.16
- Burger Nav behavior
------------------------------------------------------
1.6.1 - 2019.06.17
- Burger Nav behavior improve
- Add content argument to create method
- Fragment new private method
- Improve on and init methods, include dispatch
- Add Trigger method
- Style is now private and check for intances by id
- Add Childs public method
- Fix to-svg issues in concurrents requests
------------------------------------------------------
1.7.0 - 2019.06.24
- Add isarr util
- Add isbool util
- Add isfun util
- Add isnum util
- Add isobj util
- Add isset util
- Add isstr util
- Improve inrequire method
- Add append method
- Add version to each component via comment
- Improve scroll-transform component
- Fix init method: refer to options dataset right
- Improve parse method: add try / catch
- Add input validate method
------------------------------------------------------
1.8.0 - 2019.06.25
- Add proto private method
- Rename reinit to init
- Load full image method
- Add min and max to input validate component
- Input validate component evaluate numbers
------------------------------------------------------
1.8.1 - 2019.06.26
- Add internal refresh method to components
- Add dependents property to components
- Refactory components methos and functions
- Register and follow change in components childs
elements
- With change method, trigger update in components
childs elementes
- Add parent property to elements registered in a
component
- Add getDependents private method for components
- Add getElements private method for components
- Add makeParticularsComponents private method for
components
- Add refreshDependents private method for components
- Add setListenerComponent private method for
components
------------------------------------------------------
1.9.0 - 2019.06.28
- Thousand format method
- Random method
- Improve fragment method
- Improve append
- Add replace method
------------------------------------------------------
1.9.1 - 2019.07.05
- fix input validate method: bug in email detection
------------------------------------------------------
1.9.2 - 2019.07.10
- Improve interpolate method: add 20 ms of throttle
- Improve animation method: add 20 ms of throttle
- Improve animation method: return animation object
- Improve animation method: reduce store anim sotored
object
- Improve scroll to component: pow animation
------------------------------------------------------
1.9.2 - 2019.07.17
- Improve scroll slides: support mobi and desk sub
values - breakpoint 600
- Imprope isset: true for null
- Improve transform: support null as no transform
------------------------------------------------------
1.9.3 - 2019.07.19
- Improve transform: add translate3d to performance
- Fix parse function try catch error
------------------------------------------------------
1.10.0 - 2019.07.22
- Improve parse: add support to literal string via ''
- Change in parse maybe incompatible with previous
implementations
- Improve and mayor changes in custom select
component
- Add once method for components: set a function only
once, no matter many times init the component
------------------------------------------------------
1.10.1 - 2019.07.23
- Remove elements in component inicialization
- Remove once: now the listener creation is unique
- Remove setListenerComponent: now the definition is
explicit
- The component inicialization is restricted to
instaces of it (auto init)
------------------------------------------------------
*****************************************************/

(function(){
	
	var El = Array;
	var el = window.el = new El();
	var components = {};
	var components_list = [];

	// REQUEST ANIMATION FRAME METHOD: PUBLIC

	var raf = 
		window.requestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.msRequestAnimationFrame;

	function append (that, attrs, content) {
		return this.map(function(d){
			if (isstr(that)) that = create(that, attrs, content);
			if (isarr(that)) {
				that.map(function(dd){ d.appendChild(dd); });
			}
			else d.appendChild(that);
		});
	}

	// ANIMATE METHOD: PUBLIC

	var animate = (function() {
		var all = [];
		var old = Date.now();

		function step() {
			var now = Date.now();
			if (now - old > 20) {
				all.map(function(anim, i){
					if (anim.play) {
						if (!anim.fun()) all.splice(i,1);
					}
				});
				old = now;
			}
			
			raf(step);
		}

		step();
		
		return function(fun) {
			var anim = {
				fun: fun,
				play: true
			}
			
			all.push(anim);
			
			return {
				pause: function() {
					anim.play = false;
					return this;
				},
				play: function() {
					anim.play = true;
					return this;
				}
			};
		}
	})();

	// CAMEL CASE | UTILITY : PRIVATE

	function camel_case(str){
		return str.split('-').map(function(d,i){
			if(!i) return d.toLowerCase();
			else return d.charAt(0).toUpperCase() + d.slice(1).toLowerCase();
		}).join('');
	}

	// CHILDS METHOD: PUBLIC
	
	function childs () {
		var out = new El;
		this.map(function(d){
			out = out.concat(el.select(d.children));
		});
		return out;
	};
	
	// REGISTER COMPONENT METHOD: PUBLIC
	
	function component (selector, fun) {
		var sel = selector.split('.');
		var tag = sel[1] ? sel[0] : '';
		var name = sel[1] || sel[0];
		var camel_name = camel_case(name);

		if (fun) {
			components[camel_name] = fun;
			components_list.push({
				tag: tag,
				name: name,
				selector: selector,
				style: style,
				elements: [],
				listener: null,
				getElements: getElements,
				makeParticulars: makeParticularsComponents,
				fun: fun
			});
		}
		else fun = components[camel_name];
	};

	// CREATE METHOD: PUBLIC

	function create (tag, attrs, content) {
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
		if (content) elem.innerHTML = content;
		return el.select(elem);
	};

	// EXTEND METHOD: PUBLIC

	function extend (obj, o) {
		Object.keys(obj).map(function(k){
			o[k] = obj[k];
		});
		return o;
	};

	// FRAGMENT METHOD: PRIVATE

	function fragment (content) {
		var out = document.createDocumentFragment();
		
		if (content) {
			var parser = new DOMParser();
		
			content = parser.parseFromString(content, 'text/html');

			el.select(content.body.childNodes).map(function(d){
				out.appendChild(d);
			});
		}
		
		return el.select(out);
	};

	// GET METHOD: PUBLIC

	function get (url, fun) {
		var xhr = new XMLHttpRequest();
		xhr.open('get', url);
		xhr.onreadystatechange = function() {
			if(xhr.readyState == 4 && xhr.status == 200) {
				fun.call(xhr, xhr.response);
			}
		}
		xhr.send(null);
	}

	// GET DEPENDENTS METHOD: PRIVATE

	function getDependents (that) {
		var all = el.select(that);
		
		all = all ? all.select('*') : null;
		all = all ? all.filter(function(d){ return d && d.el; }) : [];
		all = all.map(function(d){ return d.el.component; });

		return all;
	};

	// GET ELEMENTS METHOD: PRIVATE

	function getElements (parent) {
		var that = this;
		var elements = (parent || document).getElementsByClassName(that.name);
		
		elements = Array.prototype.slice.call(elements, 0);
		elements = elements.filter(function(d){
			has_tag = that.tag ? d.tagName === that.tag.toUpperCase() : true;
			return has_tag && !d.el;
		});

		this.elements = this.elements
			.concat(elements)
			.filter(function(d){ return d; });

		return elements;
	};

	// INIT METHOD: PRIVATE

	function init () {
		components_list.map(function(comp){			
			comp.getElements();
			if ( comp.elements.length ) {
				comp.listener = comp.listener || comp.fun();
				comp.makeParticulars();
			}
		});

		return null;
	}

	// INTERPOLATE METHOD: PUBLIC

	var interpolate = (function() {
		var all = [];
		var old = Date.now();

		function step() {
			var now = Date.now();
			if (now - old > 20) {
				all.map(function(d, i){
					var lapse = ((now - d.start) / d.time).toFixed(4) * 1;
					lapse = lapse > 1 ? 1 : lapse;
					d.fun(lapse);
					if (lapse === 1) all.splice(i,1);
				});
				old = now;
			}
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
		var srcs = [];
		window.__inrequire = [];
		return function(src, callback, data){
			var i = srcs.indexOf(src);

			if (i < 0) {
				var script = create('script')[0];
				i = srcs.length;
				
				srcs.push(src);
				
				__inrequire.push({
					src: src,
					script: script,
					data: data,
					back: null
				});
				
				get(src, function(str){
					script.text = '__inrequire['+i+'].back = (function(data){'+str+'})(__inrequire['+i+'].data);';
					document.body.appendChild(script);
					isfun(callback) && callback.call(this, __inrequire[i].back);
					__inrequire.splice(i,1);
				});
			}
		};
	})();

	// IS ARRAY: PUBLIC
	
	function isarr (d) {
		return Array.isArray(d);
	}

	// IS BOOLEAN: PUBLIC
	
	function isbool (d) {
		return typeof d === 'boolean';
	}

	// IS FUNCTION: PUBLIC
	
	function isfun (d) {
		return typeof d === 'function';
	}

	// IS NUMERIC: PUBLIC
	
	function isnum (d) {
		return typeof !isNaN(d);
	}

	// IS OBJECT: PUBLIC
	
	function isobj (d) {
		return typeof d === 'object' && !isarr(d);
	}

	// IS SET: PUBLIC
	
	function isset (d) {
		return typeof d !== 'undefined';
	}

	// IS STRING: PUBLIC
	
	function isstr (d) {
		return typeof d === 'string';
	}

	// MAKE PARTICULARS COMPONENTS METHOD: PRIVATE

	function makeParticularsComponents () {
		var comp = this;
		
		comp.elements
		.filter(function(d){ return !d.el; })
		.map(function(that, ind){
			var options = that.dataset[camel_case(comp.name)] || '{}';
			var component = {
				ind:        ind,
				name: 			comp.name,
				parent:     comp,
				options: 		parse(options),
				original: 	that.outerHTML,
				element: 		that,
				dependents: getDependents(that),
				refresh:    refreshDependents,
				events: 		{
					dispatch: dispatch(that)
				}
			};
			
			that.el = { component: component };
			
			comp.listener.call(that, component);
		});

		function dispatch (that) {
			return function (name, data) {
				name = camel_case(comp.name+'-'+name);
				var event = this[name] || ( data ? new CustomEvent(name) : new Event(name) );
				this[name] = event;
				if (data) event.data = data;
				that.dispatchEvent(event);
			};
		}
	};

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

	function on (name, fun) {
		this.map(function(that){
			if (that.el && that.el.component) {
				var comp = that.el.component;
				var comp_name = camel_case(comp.name+'-'+name);
				that.addEventListener(comp_name, fun);
			}
			else that.addEventListener(name, fun);
		});
	};

	// PARSE METHOD: PUBLIC

	function parse (str) {
		var out = null;
		
		var json = str.replace(/([^,\s\{\}:]+)/g, function(str){
			return /'/.test(str) ? str.replace('\'', '"') : '"'+ str +'"';
		});

		try { out = JSON.parse(json); }
		catch (err) { out = str; }

		return out;
	};

	// POST METHOD: PUBLIC

	function post (url, data, fun) {
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
		//xhr.setRequestHeader('Origin', window.location.host);
		xhr.onreadystatechange = function() {
			if(xhr.readyState == 4 && xhr.status == 200) {
				fun.call(xhr, xhr.response);
			}
		}
		xhr.send(data);
	}

	// PROTO METHOD: PUBLIC

	function proto (name, fun) {
		this.prototype[name] = fun;
	}

	// RANDOM METHOD: PUBLIC
	
	function rand (low, high) {
		return Math.floor(Math.random() * (high - low) + low);
	}

	// REFRESH DEPENDENTS METHOD: PRIVATE

	function refreshDependents (that) {
		var comp = this;
		var changed = false;
		var comps = [];
		
		comp.dependents.map(function(d){
			var i = comps.map(function(d){ return d.name; }).indexOf(d.name);
			if (!document.contains(d.element)) {
				d.parent.elements[d.ind] = null;
				changed = true;
				if (i < 0) comps.push(d.parent);
			}
		});
		
		if (changed) {
			comps.map(function(dcomp){
				dcomp.getElements(that);
				dcomp.makeParticulars();
			});
		}
	};

	// REPLACE METHOD: PUBLIC

	function replace (that) {
		that = isstr(that) ? el.create(that) : that;
		if (isarr(that)) {
			if (that.length > 1) that = el.fragment().append(that)[0];
			else that = that[0];
		}
		return this.map(function(d){
			d.parentNode.replaceChild(that, d);
			return that;
		});
	};

	// REQUIRE METHOD: PUBLIC

	var require = (function(){
		var scripts = [];
		return function(src, callback){
			var ind = scripts.map(function(d){ return d.src; }).indexOf(src);
			if (ind < 0) {
				var script = create('script', { src: src })[0];
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

	function select (selector) {
		if (isstr(selector)) {
			if (this.length && this.length > 1) {
				selector = this.reduce(function(o, e){
					return o.concat(el.select(e).select(selector))
				}, []);
			}
			else selector = (this[0] || document).querySelectorAll(selector);
		}
		
		if (selector.length || selector.nodeType) {
			selector = selector.length && selector.nodeName !== 'SELECT' ? selector : [selector];
			return this.slice.call(selector, 0);
		}
		return null;
	}

	// SET LISTENER COMPONENT METHOD: PRIVATE

	function setListenerComponent (listener) {
		this.listener = listener;
		return listener;
	}

	// STYLE METHOD: PRIVATE

	function style (str) {
		var current = el.select('#style-'+this.name);
		if (str && this.elements.length && !current) {
			str = document.createTextNode(str);
			var elem = el.create('style', { id: 'style-'+this.name, type: 'text/css' })[0];

			elem.appendChild(str);
			document.head.appendChild(elem);
			return elem;
		}
		return null;
	};

	// THOUSAND FORMAT MEHTOD: PUBLIC

	function thousand_format(n, s, l){
		var rx = /(\d)(?=(\d{3})+(?!\d))/g;
		
		s = s || '.';
		n = l ? n.toFixed(l) : (n + '');
		n = n
			.replace('.', (s === '.' ? ',' : '.'))
			.replace(rx, '$1'+s);
		
		return n;
	}

	// TRANSFORM METHOD: PUBLIC

	var transform = (function(){
		var tr = {
			x: 'translateX',
			y: 'translateY',
			z: 'translateZ',
			r: 'rotate',
			s: 'scale'
		};
		
		function eval (prev, prox, acc) {
			var str = '';

			Object.keys(prox).map(function(k){
				if (tr[k]) {
					var suf = '';
					var prop = tr[k];
					if (k === 'x' || k === 'y' || k === 'z') suf = 'px';
					if (k === 'r') suf = 'deg';
					
					prev[k] += (prox[k] - prev[k]) * acc;
					prev[k] = prev[k].toFixed(2) * 1;
					
					if (prev[k] !== prox[k]) {
						str += prop +'('+ prev[k] + suf +')';
					}
				}
			});
			
			return str;
		}
		
		return function (that, acc) {
			var old = window.getComputedStyle(that).transform;
			var vl = { x: 0, y: 0, z: 0, r: 0, s: 1 };

			acc = acc || 1;
			old = old !== 'none' ? old + ' ' : '';
			
			return function (d) {
				var tran = eval(vl, d, acc);
				
				if (tran) that.style.transform = old + tran + ' translate3d(0px, 0px, 0px)';

				return d;
			};
		}
	})();

	// TRGGER METHOD: PUBLIC

	function trigger (name, data) {
		this.map(function(that){
			if (that.el && that.el.component) {
				that.el.component.events.dispatch(name, data);
			}
		});
	}
	
	// WAIT FOR | PSUDO LISTENER MEHTOD: PUBLIC

	function waitfor(fun, lapse) {
		if (!fun()) setTimeout(function () {
			waitfor(fun, lapse);
		}, lapse || 33);
	};

	// ABOUT

	El.prototype.version         = '1.10.1';

	// REGISTER METHODS

	El.prototype.animate         = animate;
	El.prototype.append          = append;
	El.prototype.childs          = childs;
	El.prototype.component       = component;
	El.prototype.create          = create;
	El.prototype.extend          = extend;
	El.prototype.fragment        = fragment;
	El.prototype.get             = get;
	El.prototype.interpolate     = interpolate;
	El.prototype.inrequire       = inrequire;
	El.prototype.isarr           = isarr;
	El.prototype.isbool          = isbool;
	El.prototype.isfun           = isfun;
	El.prototype.isnum           = isnum;
	El.prototype.isobj           = isobj;
	El.prototype.isset           = isset;
	El.prototype.isstr           = isstr;
	El.prototype.offset          = offset;
	El.prototype.on              = on;
	El.prototype.parse           = parse;
	El.prototype.post            = post;
	El.prototype.proto           = proto;
	El.prototype.raf             = raf;
	El.prototype.rand            = rand;
	El.prototype.init            = init;
	El.prototype.replace         = replace;
	El.prototype.require         = require;
	El.prototype.scroll          = scroll;
	El.prototype.select          = select;
	El.prototype.thousandFormat  = thousand_format;
	El.prototype.transform       = transform;
	El.prototype.trigger         = trigger;
	El.prototype.waitfor         = waitfor;

	return null;
})();


// —————————————————————————————————————————
// BURGER MENU | 1.6.0 | 1.0.0
// —————————————————————————————————————————

el.component('a.burger-menu', function(elements){
	this.style("\
		a.burger-menu {\
			font-size: 0;\
			line-height: 0;\
			color: transparent;\
			text-decoration: none;\
		}\
		a.burger-menu svg {\
			display: block;\
		}\
		a.burger-menu svg line {\
			transition: transform 0.3s;\
		}\
		.in-burger-nav a.burger-menu svg g:nth-child(1) line {\
			transform: translateY(30%) rotate(135deg);\
		}\
		.in-burger-nav a.burger-menu svg g:nth-child(2) line {\
			transform: scaleX(0);\
		}\
		.in-burger-nav a.burger-menu svg g:nth-child(3) line {\
			transform: translateY(-30%) rotate(-135deg);\
		}\
		.mobi-nav {\
			position: fixed;\
			top: 0;\
			left: 100%;\
			width: 100%;\
			height: 100vh;\
			background-color: #FFF;\
			transform: translateX(-100%);\
			transition: transform ease-in 0.3s;\
			z-index: 5000;\
		}\
		.mobi-nav.hidden {\
			visibility: visible;\
			transform: translateX(0);\
		}\
	");

	var body = document.body;
	
	return function(behavior) {
		var that = this;
		var hash = el.select(this.hash);
		var menu = el.create('div', { 'class': 'mobi-nav hidden' })[0];
		var icon = el.create('svg', { 'viewBox': '0 0 40 40' }, '\
			<g transform="translate(20, 8)"><line x1="-18" y1="0" x2="18" y2="0"/></g>\
			<g transform="translate(20, 20)"><line x1="-18" y1="0" x2="18" y2="0"/></g>\
			<g transform="translate(20, 32)"><line x1="-18" y1="0" x2="18" y2="0"/></g>\
		')[0];
		
		menu.innerHTML = '<div class="holder">'+hash[0].innerHTML+'</div>';
		body.appendChild(menu); // <-- check add first in body;

		this.appendChild(icon);

		this.addEventListener('click', function(e){
			e.preventDefault();
			toggle(that);
		});

		el.select(this).on('open', function(){
			body.classList.add('in-burger-nav');
			menu.classList.remove('hidden');
		});

		el.select(this).on('close', function(){
			body.classList.remove('in-burger-nav');
			menu.classList.add('hidden');
		});

		el.select(menu).select('a').on('click', function(){
			el.select(that).trigger('close');
		});
	}

	function toggle (that) {
		var is_hidden = body.classList.contains('in-burger-nav');
		
		if (is_hidden) el.select(that).trigger('close');
		else el.select(that).trigger('open');
	}
});

// —————————————————————————————————————————
// CHANGE LETTERS | 1.0.0 | 1.0.0
// —————————————————————————————————————————

el.component('.change-letters', function(elements){
	var spans = [];
	var old = Date.now();
	
	el.animate(function(){
		var now = Date.now();
		if (now - old > 66) {
			spans.map(function(span){
				var letters = span.letters.map(function(d){
					var same = d.current === d.original;
					
					d.current = !same ? rand_letter() : d.original;
					
					return String.fromCharCode(d.current);
				});

				if (span.delay < now - span.old) {
					span.old = now;
					
					span.letters.map(function(d){
						d.current = 0.25 > Math.random() ? rand_letter() : d.original;
					});
				}
				
				if (span.node.innerText !== letters.join('')) {
					span.node.innerText = letters.join('');
				}
			});
			old = now;
		}
		return true;
	});

	function rand_letter() {
		return Math.round(Math.random() * 93) + 33;
	}
	
	return function(behavior) {

		el.select(this)
			.select('span')
			.map(function(e){
				var delay = behavior.options && behavior.options.delay || 1200;
				var letters = (e.innerText || '')
					.split('')
					.map(function(d){
						var n = d.charCodeAt(0);
						return {
							original: n,
							current: n
						};
					});
				spans.push({
					node: e,
					top: el.offset(e).y,
					height: e.clientHeight,
					old: Date.now(),
					delay: delay,
					letters: letters
				});
			});
	};
});

// —————————————————————————————————————————
// CUSTOM SELECT | 1.8.0 | 1.0.0
// —————————————————————————————————————————

el.component('select.custom-select', function(elements){

	this.style(
		'.custom-select {'+
			'position: relative;'+
		'}'+
		'.custom-select select {'+
			'display: none;'+
		'}'+
		'.custom-select .custom-select-label {'+
			'margin: 0;'+
			'padding: 0;'+
			'cursor: pointer;'+
		'}'+
		'.custom-select .custom-select-holder {'+
			'display: none;'+
			'position: absolute;'+
			'top: 100%;'+
			'left: 0;'+
			'min-width: 100%;'+
			'padding: 0;'+
			'background-color: #FFF;'+
			'box-shadow: 0 7px 14px -7px rgba(0,0,0,0.3);'+
			'transform: translateY(-10px);'+
			'opacity: 0;'+
			'transition: opacity 0.3s, transform ease 0.3s;'+
		'}'+
		'.custom-select .custom-select-holder ul {'+
			'display: block;'+
			'margin: 0;'+
			'padding: 0 0 5px;'+
		'}'+
		'.custom-select .custom-select-holder ul li {'+
			'display: block;'+
			'margin: 0;'+
			'padding: 3px 15px;'+
			'cursor: pointer;'+
		'}'+
		'.custom-select .custom-select-holder ul li.current {'+
			'background-color: #EEE;'+
		'}'+
		'.custom-select.custom-select-open .custom-select-holder {'+
			'display: block;'+
		'}'+
		'.custom-select.custom-select-open .custom-select-holder.custom-select-on {'+
			'opacity: 1;'+
			'transform: translateY(0);'+
		'}'
	);

	var current = null;

	document.body.addEventListener('click', function(){
		if (current) current.close();
	});
	
	return function(component) {
		var options = component.options;
		var select = el.select(this);
		var change_event = new Event('change');
		var custom_select = el.create('div', { 'class': 'custom-select' }, (
			this.outerHTML+
			'<h4 class="custom-select-label"></h4>'+
			'<div class="custom-select-holder">'+
				'<ul></ul>'+
			'</div>'
		));
		var input_select = custom_select.select('select')[0];
		var label = custom_select.select('.custom-select-label');
		var holder = custom_select.select('.custom-select-holder');
		var ul = holder.select('ul');

		var obj = {
			timer: null,
			node: custom_select[0],
			holder: holder[0],
			toggle: function () {
				var is_open = this.node.classList.contains('custom-select-open');
				if (is_open) this.close();
				else this.open();
			},
			close: function () {
				var that = this;
				if (this.timer) clearTimeout(this.timer);
				this.holder.classList.remove('custom-select-on');
				this.timer = setTimeout(function(){
					that.node.classList.remove('custom-select-open');
				}, 300);
				current = null;
			},
			open: function () {
				if (this.timer) clearTimeout(this.timer);
				this.node.classList.add('custom-select-open');
				this.node.getBoundingClientRect();
				this.holder.classList.add('custom-select-on');
				if (current) current.close();
				current = this;
			}
		}

		input_select.classList.remove('custom-select');
		input_select.addEventListener('change', function(e){
			e.preventDefault();
		});
		
		label[0].addEventListener('click', function(e){
			e.stopPropagation();
			obj.toggle();
		});

		el.select(this.children).map(function(d, i){
			var li = el.create('li', {}, d.innerText)[0];
			if (!i) {
				label[0].innerHTML = (options.prefix || '') + d.innerText;
				li.classList.add('current');
			}
			li.addEventListener('click', function(e){
				input_select.selectedIndex = i;
				input_select.dispatchEvent(change_event);
				label[0].innerHTML = (options.prefix || '') + d.innerText;
				ul.select('li').map(function(l){
					l.classList.remove('current');
				});
				li.classList.add('current');
				obj.toggle();
			});
			ul.append(li);
		});

		select.replace(custom_select);

		component.refresh();
	};
});

// —————————————————————————————————————————
// LOAD FULL IMAGE | 1.8.0 | 1.0.0
// —————————————————————————————————————————

el.component('img.load-full-img', function(elements){
	var width = window.innerWidth;
	
	return function (component) {
		var that = this;
		var options = component.options;
		var img = el.create('img', { class: 'load-full-img-done' })[0];
		var src = this.src;
		
		if (el.isstr(options)) options = {
			mobi: options, // < 600
			tabl: options, // < 1200
			desk: options  // > 1200
		};

		if (width < 601) src = options.mobi;
		if (width < 1201) src = options.tabl;
		if (width > 1200) src = options.desk;

		img.src = src;

		img.addEventListener('load', function(){
			that.parentNode.replaceChild(img, that);
		});
	};
});

// —————————————————————————————————————————
// OPEN MODAL | 1.3.0 | 1.0.0
// —————————————————————————————————————————

el.component('a.open-modal', function(elements){
	var all = [];

	this.style("\
		.modal {\
			display: none;\
			position: fixed;\
			top: 50%;\
			left: 100%;\
			margin: 0 -50%;\
			transform: translate(-50%, -50%) translateY(12px);\
			opacity: 0;\
			z-index: 1000;\
			transition: opacity linear 0.3s, transform ease 0.3s;\
		}\
		.modal .container,\
		.modal .container-xs,\
		.modal .container-sm,\
		.modal .container-md,\
		.modal .container-lg,\
		.modal .container-xl {\
			background: #FFF;\
			width: auto;\
			margin: 0 2rem;\
			box-shadow: 0 6px 24px -6px rgba(0,0,0,0);\
			transition: box-shadow ease 0.3s;\
		}\
		.modal.modal-show {\
			display: block;\
		}\
		.modal.modal-on {\
			transition-delay: 0.3s, 0.3s;\
			transform: translate(-50%, -50%) translateY(0);\
			opacity: 1;\
		}\
		.modal.modal-on .container,\
		.modal.modal-on .container-xs,\
		.modal.modal-on .container-sm,\
		.modal.modal-on .container-md,\
		.modal.modal-on .container-lg,\
		.modal.modal-on .container-xl {\
			transition-delay: 0.3s;\
			box-shadow: 0 12px 36px -12px rgba(0,0,0,0.5);\
		}\
		.modal a.modal-close {\
			display: block;\
			position: absolute;\
			top: 0;\
			right: 0;\
			padding: 1rem;\
			width: 5rem;\
			color: #222;\
			opacity: 0.6;\
			text-align: center;\
			text-decoration: none;\
			line-height: 2.6rem;\
			font-size: 4rem;\
			font-weight: 300;\
			cursor: pointer;\
			transition: opacity linear 0.3s;\
			z-index: 30;\
		}\
		.modal a.modal-close:hover {\
			opacity: 1;\
		}\
		#modal-bgd {\
			display: none;\
			position: fixed;\
			background-color: #000;\
			top: 0;\
			left: 0;\
			bottom: 0;\
			right: 0;\
			opacity: 0;\
			z-index: 990;\
			transition: opacity linear 0.6s;\
		}\
		#modal-bgd.modal-show {\
			display: block;\
		}\
		#modal-bgd.modal-on {\
			opacity: 0.5;\
		}\
	");

	var show = false;
	var current = null;
	var bgd = el.create('div', { id: 'modal-bgd' })[0];
	var has_bgd = false;

	function open (modal) {
		current = modal;
		show = true;
		current.classList.add('modal-show');
		current.getClientRects(); // <- reflow
		current.classList.add('modal-on');
		bgd.classList.add('modal-show');
		bgd.getClientRects(); // <- reflow
		bgd.classList.add('modal-on');
	}

	function close () {
		show = false;
		current.classList.remove('modal-on');
		bgd.classList.remove('modal-on');
	}

	bgd.addEventListener('click', close);
	bgd.addEventListener('transitionend', function (e) {
		if (!show) bgd.classList.remove('modal-show');	
	}, false);

	return function (behavior) {
		var hash = this.hash;
		var modal = el.select(hash);

		if (!has_bgd) {
			has_bgd = true;
			document.body.appendChild(bgd);
		}
		
		if (modal) {
			var a_close = modal.select('a.modal-close')[0];

			modal = modal[0];

			modal.addEventListener('transitionend', function (e) {
				if (!show) {
					modal.classList.remove('modal-show');
					current = null;
				}
			}, false);
			
			this.addEventListener('click', function(){
				open(modal);
			});
			
			a_close.addEventListener('click', close);
		}
	}
});

// —————————————————————————————————————————
// PROMOTE LINK | 1.9.0 | 1.0.0
// —————————————————————————————————————————

el.component('.promote-link', function(elements){
	
	return function(component) {
		var link = el.select(this).select('a')[0];
		var className = this.className.replace(/ *promote-link */, '');
		var wrapper = el.create('a', {
			'class': className ? className +' promote-link-wrapper' : 'promote-link-wrapper',
			'href': link.href,
			'id': this.id
		}, this.innerHTML);

		el.select(this).replace(wrapper);
	
		component.refresh();
	};
});

// —————————————————————————————————————————
// TABLE RESPONSIVE | 1.7.0 | 1.0.0
// —————————————————————————————————————————

el.component('.table-responsive', function(elements){
	this.style(
		'@media (max-width: 600px) {'+
			'.table-responsive th {'+
				'display: none;'+
			'}'+
		'}'+
		'@media (min-width: 600px) {'+
			'.table-responsive tbody td .th {'+
				'display: none;'+
			'}'+
		'}'
	);
	return function(behavior) {
		var thead = el.select(this).select('thead th');
		var tbody = el.select(this).select('tbody tr');
		
		tbody.map(function(tr){
			el.select(tr).select('td').map(function(td, i){
				var th = thead[i] || null;
				if (th) el.select(td).append('span', { 'class': 'th' }, th.innerHTML);
			});
		});
	};
});

// —————————————————————————————————————————
// SCROLL TO | 1.0.0 | 1.0.3
// —————————————————————————————————————————

el.component('a.scroll-to', function(elements){
	var _y = window.scrollY;
	var _ini = _y;

	
	return function(behavior) {
		var hash = el.select(this.hash)[0];
		
		this.addEventListener('click', function(e){
			_ini = window.scrollY;
			_y = el.offset(hash).y;
			
			var elapse = Math.abs(_ini - _y) * 0.5;

			e.preventDefault();
			
			el.interpolate(elapse, interpolateScroll);
		});
	}

	function interpolateScroll (t) {
		var tt = Math.sin(t * t * Math.PI * 0.5);
		var pt = Math.pow(tt, 2);
		var dy = Math.floor(_ini * (1 - pt) + _y * pt);
		window.scrollTo(0, dy);
	}
});

// —————————————————————————————————————————
// SCROLL SPY | 1.0.0 | 1.0.0
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
// SCROLL SLIDES | 1.0.0 | 1.0.0
// —————————————————————————————————————————

el.component('.scroll-slides', function(elements){
	var all = [];
	var wh = window.innerHeight;
	var ww = window.innerWidth;
	var scroll = window.scrollY;
	var dscroll = 0;
	var old = Date.now();

	this.style("\
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
		var now = Date.now();
		
		if (now - old > 16) {
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
					var is_backwrds = element.node.classList.contains('backwrds');
					
					height += h;

					element.childs.map(function(child){
						var dat = child.data;
						if (dat) {
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
						}
					});

					if (is_fit) {
						if (dh / hh < 0.5 && dh / hh > -0.5) fit = height + of - wh - hp * i;
					}

					if (dh < hh * 0.5 && dh + hh * 0.5 > 0) {
						if (!is_current) {
							element.node.classList.add('current');
							that.events.dispatch('change', { current: element.node });
						}
					}
					else {
						if (is_current) element.node.classList.remove('current');
					}

					if (dh < 0) {
						if (!is_backwrds) element.node.classList.add('backwrds');
					}
					else {
						if (is_backwrds) element.node.classList.remove('backwrds');
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
			old = now;
		}
		
		return true;
	});

	window.addEventListener('resize', function(e){
		wh = window.innerHeight;
		ww = window.innerWidth;
	});

	return function(behavior) {

		var elements = el
			.select(this)
			.select('.scroll-slide')
			.map(function(that){

				var childs = el
					.select(that)
					.select('[data-scroll-slides]')
					.concat([that])
					.filter(function(e){ return e.dataset && e.dataset.scrollSlides; })
					.map(function(e){ 
						var data = e.dataset.scrollSlides;
						data = el.parse(data);
						if (data && el.isset(data.mobi) && 600 > ww) data = data.mobi;
						if (data && el.isset(data.desk) && ww > 600) data = data.desk;
						return {
							node: e,
							data: data, 
							trans: el.transform(e, 0.25)
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
			events: behavior.events
		});
	};
});

// —————————————————————————————————————————
// SCROLL TRANSFORM | 1.1.0 | 1.0.0
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

	return function(component) {
		all.push({
			node: this,
			data: component.options,
			trans: el.transform(this, 0.5)
		});
	};
});

// —————————————————————————————————————————
// SLIDESHOW | 1.0.0
// —————————————————————————————————————————

el.component('.slideshow', function(){
	var defaults = {
		'delay': 6666,
		'arrows': false,
		'autoplay': true
	};
	var options = {};

	return function (component) {

		this.innerHTML = '<div class="slides">'+this.innerHTML+'</div>';

		component.refresh();
		
		var ind = 0;
		var that = this;
		var timer = null;
		var slides = el.select(this).select('.slides').childs();
		var current = null;

		if (options.arrows) {
			var next_arrow = el.create('a', { 'class': 'slideshow-next' }, '&gt;')[0];
			var prev_arrow = el.create('a', { 'class': 'slideshow-prev' }, '&lt;')[0];

			next_arrow.on('click', next);
			prev_arrow.on('click', prev);

			this.appendChild(next_arrow);
			this.appendChild(prev_arrow);
		}

		if (options.pagination) {
			var pagination = el.create('nav', { 'class': 'slideshow-pagination' })[0];
			pagination.innerHTML = slides.map(function(i){
				return '<a href="#slide-'+i+'">'+ i + 1 +'</a>';
			}).join('\n');

			el.select(pagination).select('a').map(function(d, i){
				d.on('click', function(e){
					e.preventDefault();
					el.select(that).trigger('go', { ind: i });
				});
			});

			this.appendChild(pagination);
		}

		function next () {
			ind = (ind + 1) % slides.length;
			go();
		}

		function prev () {
			ind = (ind - 1) % slides.length;
			go();
		}

		function go (e) {
			var i = e && e.data && e.data.ind;
			if ( i || i === 0) ind = e.data.ind;
			
			current = slides[ind];

			slides.map(function(d){ d.classList.remove('current'); });

			current.classList.add('current');
			
			if (timer) clearTimeout(timer);

			el.select(that).trigger('change', {ind: ind});
			
			timer = setTimeout(next, defaults.delay);
		};

		el.select(this).on('go', go);
		el.select(this).on('next', next);
		el.select(this).on('prev', prev);

		if (slides.length > 1) el.select(this).trigger('go');	
	};
});

// —————————————————————————————————————————
// SNAP | 1.0.0 | 1.0.0
// —————————————————————————————————————————

el.component('.snap', function(elements){
	var all = [];

	this.style("\
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
// TO SVG | 1.0.0 | 1.0.0
// —————————————————————————————————————————

el.component('img.to-svg', function(elements){
	var srcs = [];
	var cache = [];
	var queue = [];

	function create_svg (that, str) {
		var div = el.create('div')[0];
		div.innerHTML = str;
		var svg = div.getElementsByTagName('svg')[0];
		svg.setAttributeNS(null, 'class', that.classList.value);
		svg.setAttributeNS(null, 'alt', that.alt);
		svg.setAttributeNS(null, 'id', that.id);
		return svg.outerHTML;
	}

	return function () {
		var that = this;
		var ind = srcs.indexOf(this.src);

		if (ind < 0) {
			el.get(this.src, function(d){
				that.classList.remove('to-svg');
				var str = create_svg(that, d);
				srcs.push(this.src);
				cache.push(str);
				that.outerHTML = str;
			});
		}
		else if (cache[ind]) {
			that.classList.remove('to-svg');
			if (that.parentNode) that.outerHTML = cache[ind];
		}
	};
});

// —————————————————————————————————————————
// VALIDATE | 1.7.0 | 1.0.0
// —————————————————————————————————————————

el.component('input.validate', function(elements){

	this.style(
		'input.validate.wrong {'+
			'color: #F00;'+
			'border-color: #F00;'+
		'}'
	);
	
	function digito_verificador (T) {
		var M = 0, S = 1;
		for (; T; T = Math.floor(T / 10)) {
			S = (S + T % 10 * (9 - M++ % 6)) % 11;
		}
		return S ? S - 1 : 'k';
	}
	
	return function (component) {
		var options = component.options;

		if (el.isstr(options)) {
			var k = options;
			options = {};
			options[k] = true;
		}
		
		this.addEventListener('blur', function(e) {
			var valid = true;

			var value = el.isnum(this.value) ? this.value * 1 : this.value;

			if (options.min) {
				if (el.isnum(value)) valid = valid && this.value > option.min;
				else valid = valid && value.length > option.min;
			}

			if (options.max) {
				if (el.isnum(value)) valid = valid && value < option.max;
				else valid = valid && value.length < option.max;
			}
			
			if (options.email) {
				valid = valid && /...+@...+\...+/.test(value);
			}

			if (options.regex) {
				var regex = new RegExp(options.regex);
				valid = valid && regex.test(value);
			}

			if (options.rut) {
				var rut_arr = value.replace(/\./g, '').split('-');
				valid = valid && digito_verificador(rut_arr[0]) === rut_arr[1];
			}

			if (valid || !value) this.classList.remove('wrong');
			else this.classList.add('wrong');
		});
	};
});

// —————————————————————————————————————————
// VIDEO | 1.0.0 | 1.0.0
// —————————————————————————————————————————

el.component('a.video', function(elements){

	this.style("\
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
		})[0];
		var player = {
			id: id,
			api: null,
			type: youtube ? 'youtube' : 'vimeo',
			anchor: this,
			iframe: iframe
		};
		
		if (youtube) {
			iframe = el.create('div')[0];
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
			var button = el.create('button', { class: 'play' })[0];
			var loader = el.create('svg', { class: 'loader', viewBox: '0 0 140 140' })[0];
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
					})[0];
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

// —————————————————————————————————————————

el.init();