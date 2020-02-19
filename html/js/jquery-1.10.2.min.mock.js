// jQuery Mock - a very simplified implementation of some basic jQuery methods
// made by IliaSky

(function(){
	var classList = function (el) {
		return {
			add: function(className) {
				if (!this.contains(className)) {
					el.className += ' ' + className;
				}
			},
			remove: function(className) {
				if (this.contains(className)) {
					el.className = (' ' + el.className + ' ').replace(' ' + className + ' ', ' ').trim();
				}
			},
			contains: function(className) {
				return el.className.split(' ').indexOf(className) !== -1;
			},
			toggle: function(className, flag) {
				flag = (arguments.length > 1) ? flag : this.contains(className);
				this[flag ? 'remove' : 'add'](className);
			}
		}
	};
	var CustomEvent;
	if (typeof window.CustomEvent !== "function") {
		CustomEvent = function CustomEvent (event, params) {
			params = params || { bubbles: false, cancelable: false, detail: undefined };
			var evt = document.createEvent( 'CustomEvent' );
			evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
			return evt;
		}

		CustomEvent.prototype = window.Event.prototype;
	} else {
		CustomEvent = window.CustomEvent;
	}

	var el = function(html) {
		var wrapper = document.createElement('div');
		wrapper.innerHTML = html;
		return wrapper.removeChild(wrapper.children[0]);
	};
	var defaultDisplay = {
		li: 'list-item',
		td: 'table-cell',
		th: 'table-cell',
		tr: 'table-row',
		table: 'table'
	};
	'span b i em code sub sup'.split(' ').forEach(function(key) {
		defaultDisplay[key] = 'inline';
	});
	var extend = Object.assign || function(dest) {
		[].slice.call(arguments, 1).forEach(function(src){
			Object.keys(src).forEach(function(key){
				dest[key] = src[key];
			});
		});
		return dest;
	};

	window.$ = window.jQuery = function (selector) {
		if (typeof selector === 'function') {
			return document.addEventListener('DOMContentLoaded', selector);
		}
		var elements;
		if (typeof selector === 'string') {
			elements = document.querySelectorAll(selector);
		} else if (!selector) {
			elements = [];
		} else {
			elements = (selector.length !== undefined && selector !== window) ? selector : [selector];
		}
		var data = [].slice.call(elements);
		return extend({}, data, {

			// General
			each: function (f) {
				data.forEach(function(e, i) {
					f.call(e, i, e);
				});
				return this;
			},
			map: function (f) {
				var newData = data.map(function(e, i) {
					return f.call(e, i, e);
				});
				return $(newData);
			},
			filter: function(f) {
				return $(data.filter(f));
			},
			toArray: function(){
				return [].concat(data);
			},
			eq: function(id) {
				return $(data[(data.length + id) % data.length])
			},
			first: function() {
				return this.eq(0);
			},
			last: function() {
				return this.eq(-1);
			},
			length: data.length,
			size: function() {
				return data.length;
			},
			parent: function() {
				return this.map(function() {
					return this.parentNode;
				});
			},
			children: function() { // simplified
				return $(data[0] ? data[0].children : []);
			},
			prevAll: function() {		// probably simplified
				var siblings = [].slice.call(data[0].parentNode.children);
				var index = siblings.indexOf(data[0]);
				return $(siblings.slice(0, index));
			},
			find: function(selector) {
				return $(data.map(function(e) {
					return [].slice.call(e.querySelectorAll(selector));
				}).reduce(function(a, b) {
					return a.concat(b);
				}, []));
			},

			// Events
			on: function(event, handler) { // simplified
				var $handler = function(e) {
					return handler.call(this, e, e.data);
				};
				return this.each(function() {
					console.log(event, this);
					$handler = $handler.bind(this)
					this._listeners = this._listeners || {};
					this._listeners[event] = this._listeners[event] || {};
					this._listeners[event][handler] = $handler;
					this.addEventListener(event, $handler);
				});
			},
			bind: function (event, handler) {
				return this.on(event, handler);
			},
			click: function(handler) {
				return this.on('click', handler);
			},
			load: function(handler) {
				return this.on('load', handler);
			},
			off: function(event, handler) { // simplified
				return this.each(function() {
					var $handler = ((this._listeners || {})[event] || {})[handler];
					if ($handler) {
						this.removeEventListener(event, $handler);
						delete this._listeners[handler];
					}
				});
			},
			trigger: function(event, data) {
				var event = extend(new CustomEvent(event, {bubbles: true}), {data: data});
				return this.each(function(){
					var self = this;
					setTimeout(function() {
						self.dispatchEvent(event);
					}, 0);
				});
			},

			// DOM
			html: function(value) {
				if (arguments.length == 0) {
					return data[0] && data[0].innerHTML;
				}
				return this.each(function() {
					this.innerHTML = value;
				});
			},
			css: function(key, value) {
				if (typeof key === 'string') {
					if (arguments.length == 1) {
						return window.getComputedStyle(data[0]).getPropertyValue(key);
					}
					return this.each(function(){
						this.style[key] = value;
					});
				}
				var obj = key;

				return this.each(function(i, el){
					Object.keys(obj).forEach(function(key){
						el.style[key] = obj[key];
					});
				});
			},
			attr: function(key, value) {
				console.log('attr', key, value);
				if (typeof key === 'string') {
					if (arguments.length == 1) {
						return data[0].getAttribute(key);
					}
					console.log('attr1', this.tagname, this.size());
					return this.each(function(){
						this.setAttribute(key, value);
						console.log('attr2', key, this.getAttribute(key));
					});
				}
				var obj = key;
				console.log('attr3');


				return this.each(function(i, el){
					Object.keys(obj).forEach(function(key){
				console.log('attr4');

						this.setAttribute(key, obj[key]);
					});
				});
			},
			append: function(html) {
				return this.each(function(){
					this.appendChild(typeof html === 'string' ? el(html) : html);
				});
			},
			prepend: function(html) {
				return this.each(function(){
					this.insertBefore(typeof html === 'string' ? el(html) : html, this.childNodes[0]);
				});
			},
			addClass: function (className) {
				return this.each(function(i, e) {
					(this.classList || classList(this)).add(className);
				});
			},
			removeClass: function (className) {
				return this.each(function(i, e) {
					(this.classList || classList(this)).remove(className);
				});
			},
			hasClass: function (className) {
				return data.some(function(e) {
					return classList(e).contains(className);
				});
			},
			toggleClass: function (className, flag) {
				if (flag === true || flag === false) {
					return this[(flag ? 'add' : 'remove') + 'Class'](className);
				}
				return this.each(function() {
					classList(this).toggle(className);
				});
			},
			replaceWith: function(value) {
				this.each(function(){
					var next = this.nextSibling,
						parent = this.parentNode,
						html = typeof value == 'function' ? value.call(this) : value,
						elem = typeof html == 'string' ? el(html) : value;

					if (parent) {
						parent.removeChild(this);
						parent.insertBefore(elem, next);
					}
				})
			},

			// Animations
			fadeIn: function(duration) { // simplified
				var raf = window.requestAnimationFrame || (function(cb) {
					setTimeout(function() { cb(new Date().getTime()); }, 1000 / 60);
				});
				this.each(function(){
					this.style.display = defaultDisplay[this.tagName.toLowerCase()] || 'block';
					this.style.opacity = 0;
				});
				var self = this;
				var startTime = new Date().getTime();
				var animate = function(time) {
					var value = Math.min(1, (new Date().getTime() - startTime) / duration);
					self.css('opacity', value);
					if (value < 1) {
						raf(animate);
					}
				};
				raf(animate);
				return this;
			}
		});
	};

	$.proxy = function (a, b) { // simplified
		return (typeof a === "function") ? a.bind(b) : a[b].bind(a);
	};

	$.extend = extend;

})();
