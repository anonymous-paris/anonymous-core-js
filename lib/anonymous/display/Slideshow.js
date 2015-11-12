/**
 * @constructor
 * 
 */
"use strict";

var Css = require("lib/anonymous/utils/Css");
var MouseEvent = require("lib/anonymous/events/MouseEvent.js");

var SlideShow = module.exports = function(dom,options)
{
	this.DRAG_EASE = 0.4;
	this.SWITCH_VMIN = 10;
	this.SWITCH_XMIN = 10;
	this.RELEASE_EASE = 0.15;
	this.FRICTION = 0.96;
	this.DRAG_EASE_CONSTRAINS = 0.3;
	this.FRICTION_CONSTRAINS = 0.83;
	this.MAX_DELTA_Y = 25;
	this.MAX_DELTA_X = 25;

	this.$ = $(this);

	if (!options) options = {};

	this.dom = $(dom);
	this.allowHorizontal = options.allowHorizontal;
	if (typeof this.allowHorizontal !== "boolean")
		this.allowHorizontal = true;
	this.allowVertical = options.allowVertical;
	if (typeof this.allowVertical !== "boolean")
		this.allowVertical = false;
	this.mobile = options.mobile || false;

	this.isIE = navigator.userAgent.match("MSIE");

	// events
	this.windowwidth = this.dom.width();
	this.windowheight = this.dom.height();

	this.timer = null;

	// content
	this.container = this.dom.find(".slideshow-container").first();
	var blocs = $('.block--slideshow',this.container);
	// this._blocWidth = blocs.outerWidth(); // Jquery
	this._blocWidth = blocs.width(); // Zepto
	this.width = this._blocWidth*blocs.length;
	this.height = this.container.height();
	this._running = false;

	// scrolly
	this.locky = false;
	this.lockx = false;

	// physics
	this.ox = 0;
	this.x = 0;
	this.initx = 0;
	this.vx = 0;
	this.oy = 0;
	this.y = 0;
	this.inity = 0;
	this.vy = 0;
	this.initmx = 0;
	this.initmy = 0;
	this.mx = 0;
	this.my = 0;
	this._releaseDest = {x:0,y:0};
	this.currentIndex = {x:0,y:0};

	this.$prev = options.$prev || $(this.dom).find(".button-prev");
	this.$next = options.$next || $(this.dom).find(".button-next");

	if (!this.isIE)
		Css.transform(this.container[0],'translate3d('+-this.x+'px,0,0)');
	else
		this.container.css("margin-left", -Math.round(this.x));

	this.length = this.width / this.windowwidth - 1;

	this._init();
};

SlideShow.CHANGE = "CHANGE";
SlideShow.RELEASE = "RELEASE";

SlideShow.ENDX = "ENDX";
SlideShow.ENDY = "ENDY";

SlideShow.prototype.indexX = function (index)
{
	return Math.round(this.currentIndex.x);
};
SlideShow.prototype.indexY = function (index)
{
	return Math.round(this.currentIndex.y);
};

SlideShow.prototype.setIndexX = function (index)
{
	this.currentIndex.x = index;
	this._releaseDest.x = this.currentIndex.x * this.windowwidth;
	this._constrainIndexX();
};

SlideShow.prototype.setIndexY = function (index)
{
	this.currentIndex.y = index;
	this._releaseDest.y = this.currentIndex.y * this.windowheight;
	this._constrainIndexY();
};

SlideShow.prototype.resetIndexX = function (x)
{
	this.setIndexX(x);
	this.x = this._releaseDest.x;

	if (!this.isIE)
		Css.transform(this.container[0],'translate3d('+-this.x+'px,0,0)');
	else
		this.container.css("margin-left", -this.x);
};

SlideShow.prototype.resetIndexY = function (y)
{
	this.setIndexY(y);
	this.y = this._releaseDest.y;
	Css.transform(this.container[0],'translate3d(0,'+-this.y+'px,0)');
};

SlideShow.prototype.getRatioX = function ()
{
	return this.x / this.width;
};

SlideShow.prototype.getRatioY = function ()
{
	return this.y / this.height;
};

SlideShow.prototype.gotoItem = function (index, silent)
{
	this._releaseDest.x = index * this._blocWidth;
	this.currentIndex.x = ((index ) / (this.windowwidth / this._blocWidth)) >> 0;

	this._constrainIndexX();

	if (silent === true) {
		this.x = this._releaseDest.x;
	}
};

SlideShow.prototype._init = function ()
{
	var self = this;

	// mouse handling
	this.drag = {x:0,y:0};
	this.delta = {x:0,y:0};
	this.deltax = 0;
	this.deltay = 0;

	// touch event handling
	if (this.mobile)
	{
		this.dom.on('touchstart', touchstart);
	} else
	{
		this.dom.on("mousedown", touchstart);
	}

	this.$prev.on(MouseEvent.CLICK, $.proxy(this.prev, this))
				.addClass('hidden'); //don't display it at the first time
	this.$next.on(MouseEvent.CLICK, $.proxy(this.next, this));
	
// console.log(this.width, this.windowwidth);

	if (this.width <= this.windowwidth) {
		this.$next.addClass('hidden');
		this.disableNav = true;
	}

	// this.dom.on(MouseEvent.CLICK, 'a', $.proxy( self.preventDefault, this ), false, false, true);
	this.dom.on(MouseEvent.CLICK, 'a', $.proxy( self.preventDefault, this ));
	// this.dom.on(MouseEvent.CLICK, 'a', false, $.proxy( self.preventDefault, this ), false, true);

	// $('a',this.dom).on(MouseEvent.CLICK,$.proxy(self.preventDefault, this));

	function touchstart(event)
	{
		var mx, my;

		self.dom.addClass('dragging');

		if(self.mobile)
		{
			self.dom.on('touchend', touchup);
			self.dom.on('touchmove', touchmove);
			var e = event;
			if (event.originalEvent) e = event.originalEvent;
			var touch = e.touches[0] || e.changedTouches[0] || e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			mx = touch.pageX;
			my = touch.pageY;
		}
		else
		{
			event.preventDefault();

			$(document).on("mouseup", touchup);
			$(document).on("mousemove", touchmove);

			mx = event.pageX;
			my = event.pageY;

		}

		self.mx = mx;
		self.my = my;
		self.omx = self.mx;
		self.omy = self.my;
		self.initmx = self.mx;
		self.initmy = self.my;
		self.initx = self.initmx + self.x;
		self.inity = self.initmy + self.y;

		self.delta.x = self.vx < 0 ? self.vx * -1 : self.vx;
		self.delta.y = self.vy < 0 ? self.vy * -1 : self.vy;
		self.ovx = self.vx;
		self.ovy = self.vy;
		self.vx = 0;
		self.vy = 0;

		if (self.allowVertical)
			self.drag.y = true;
		if (self.allowHorizontal)
			self.drag.x = true;
		self.dragg = true;

		self.touchstart = true;

		if(!self._running)
		{
			self._running = true;
			self.update();
		}
	}

	function touchup(event)
	{
		var mx, my;
		
		self.dom.removeClass('dragging');

		if(self.mobile)
		{
			self.dom.off('touchend', touchup);
			self.dom.off('touchmove', touchmove);
			var e = event;
			if (event.originalEvent) e = event.originalEvent;

			var touch = e.touches[0] || e.changedTouches[0] || e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			mx = touch.pageX;
			my = touch.pageY;
		}
		else
		{
			$(document).off("mouseup", touchup);
			$(document).off("mousemove", touchmove);
			mx = event.pageX;
			my = event.pageY;
		}

		var oldIndexX = self.currentIndex.x;
		var oldIndexY = self.currentIndex.y;

		if(self.vx > self.SWITCH_VMIN)
			self.currentIndex.x = self.x / self.windowwidth + 1 | 0;
		else if(self.vx < -self.SWITCH_VMIN)
			self.currentIndex.x = self.x / self.windowwidth | 0;
		else
			self.currentIndex.x = Math.round(self.x / self.windowwidth);

		if(self.vy > self.SWITCH_XMIN)
			self.currentIndex.y = self.y / self.windowheight + 1 | 0;
		else if(self.vy < -self.SWITCH_XMIN)
			self.currentIndex.y = self.y / self.windowheight | 0;
		else
			self.currentIndex.y = Math.round(self.y / self.windowheight);

		if (self.currentIndex.x != Math.round(oldIndexX) || self.currentIndex.y != Math.round(oldIndexY) ) {
			if (self.currentIndex.x != oldIndexX) {
				self._changedX = true;
				var next = false;
				if (self.currentIndex.x > oldIndexX)
					next = true;
			} else {
				self._changedY = true;
			}

			$(self).trigger(SlideShow.CHANGE,[self.currentIndex.x, next]);
		}

		if (Math.abs(self.omx - mx) > self.MAX_DELTA_X) {

			if (self.allowHorizontal)
				self._constrainIndexX();
			if (self.allowVertical)
				self._constrainIndexY();

			if (!self.lockx && self.allowHorizontal) {
				self._releaseDest.x = self.currentIndex.x * self.windowwidth;
			}
			if (!self.locky && self.allowVertical)
				self._releaseDest.y = self.currentIndex.y * self.windowheight;

		}

		$(self).trigger(SlideShow.RELEASE,[self._releaseDest,self._blocWidth]);

		self.drag.y = false;
		self.drag.x = false;
		setTimeout(function() {
			self.locky = false;
			self.lockx = false;
			// fix handle prevent default
		},1);
	}

	function touchmove(event)
	{
		if (!self.mobile) {
			event.preventDefault();
		}

		if((self.deltay <= -self.MAX_DELTA_Y || self.deltay >= self.MAX_DELTA_Y) && !self.locky)
		{
			// vertical move
			if (!self.allowVertical) {
				if(self.mobile)
				{
					self.dom.off('touchend', touchup);
					self.dom.off('touchmove', touchmove);
				}
				else
				{
					$(document).off("mouseup", touchup);
					$(document).off("mousemove", touchmove);
				}
			}
			if (!self.lockx) {
				if (self.mobile) {
					event.preventDefault();
				}
				// disable horizontal move and reset x position
				self.lockx = true;
				self.drag.x = false;
			}
		}
		if((self.deltax <= -self.MAX_DELTA_X || self.deltax >= self.MAX_DELTA_X) && !self.lockx)
		{
			// horizontal move
			if (!self.allowHorizontal) {
				if(self.mobile)
				{
					self.dom.off('touchend', touchup);
					self.dom.off('touchmove', touchmove);
				}
				else
				{
					$(document).off("mouseup", touchup);
					$(document).off("mousemove", touchmove);
				}
			}
			if (!self.locky) {
				if (self.mobile) {
					event.preventDefault();
				}
				// disable vertical move and reset y position
				self.locky = true;
				self.drag.y = false;
			}
		}	

		if(self.mobile)
		{
			// if(!event.originalEvent)
				// return;
			var e = event;
			if (event.originalEvent) e = event.originalEvent;

			var touch = e.touches[0] || e.changedTouches[0] || e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			self.mx = touch.pageX;
			self.my = touch.pageY;
		}
		else
		{
			self.mx = event.pageX;
			self.my = event.pageY;

		}
	}
};

SlideShow.prototype.resize = function()
{
	var blocs = $('.block--slideshow',this.container);
// might be bugged
	// this._blocWidth = blocs.outerWidth(); // Jquery
	this._blocWidth = blocs.width(); // Zepto
	this.width = this._blocWidth*blocs.length;
	this.windowwidth = $(this.dom).width();

	this.windowheight = $(this.dom).height();
	this.height = this.container.height();

	this.resetIndexX(this.currentIndex.x);
	this.resetIndexY(this.currentIndex.y);

};

SlideShow.prototype.prev = function (silent)
{
	var oX = this.currentIndex.x;

	this.currentIndex.x--;
	this._constrainIndexX();
	
	if (oX != this.currentIndex.x)
	{
		this._releaseDest.x = this.currentIndex.x * this.windowwidth;

		if (silent === true) {
			this.x = this._releaseDest.x;
		};
		// this._releaseDest.y = this.currentIndex * this.windowheight; // NEED fn up and down 
		$(this).trigger(SlideShow.CHANGE, [this.currentIndex.x, false]);
		$(this).trigger(SlideShow.RELEASE,[null,null,this.currentIndex.x]);
	}
};

SlideShow.prototype.next = function (silent)
{
	var oX = this.currentIndex.x;

	this.currentIndex.x++;
	this._constrainIndexX();

	if (oX != this.currentIndex.x)
	{
		this._releaseDest.x = this.currentIndex.x * this.windowwidth;

		if (silent === true) {
			this.x = this._releaseDest.x;
		}
		// this._releaseDest.y = this.currentIndex * this.windowheight; // NEED fn up and down 

		$(this).trigger(SlideShow.CHANGE, [this.currentIndex.x, true]);
		$(this).trigger(SlideShow.RELEASE,[null,null,this.currentIndex.x]);
	}
};

SlideShow.prototype._constrainIndexX = function ()
{
	if(this.currentIndex.x <= 0)
	{
		this.currentIndex.x = 0;
		if (!this.disableNav) {
			this.$prev.addClass('hidden');
			this.$next.removeClass('hidden');
		}
	}
	else if(this.currentIndex.x >= this.width / this.windowwidth - 1)
	{
		this.currentIndex.x = this.width / this.windowwidth - 1;
		if (!this.disableNav) {
			this.$next.addClass('hidden');
			this.$prev.removeClass('hidden');
		}
	}else
	{
		if (!this.disableNav) {
			this.$prev.removeClass('hidden');
			this.$next.removeClass('hidden');
		}
	}
	// this.indexX(this.currentIndex.x);
};

SlideShow.prototype._constrainIndexY = function ()
{
	if(this.currentIndex.y <= 0)
	{
		this.currentIndex.y = 0;
		this.$prev.addClass('hidden');
	}
	else if(this.currentIndex.y >= this.height / this.windowheight - 1)
	{
		this.currentIndex.y = this.height / this.windowheight - 1;
		this.$next.addClass('hidden');
	}else
	{
		this.$prev.removeClass('hidden');
		this.$next.removeClass('hidden');
	}
	// this.indexY(this.currentIndex.y);
};

SlideShow.prototype._destroyPlayer = function ()
{
	if (this.overlay)
		this.overlay.unbind("mouseup");
};

SlideShow.prototype.update = function ()
{
	var self = this;
	this.deltay = this.initmy - this.my;
	this.deltax = this.initmx - this.mx;
	var delta = 0.3;

	if (this.allowHorizontal)
	{
		// movement horizontal
		if (this.windowwidth > this.width)
		{
			// this.x -= (((this.windowwidth - this.width) * 0.5) + this.x) * this.DRAG_EASE; // CENTER
		} else
		{
			if (this.drag.x) // dragging
			{
				this.x -= (this.mx - this.initx + this.x) * this.DRAG_EASE;

				this.vx = this.x - this.ox;
				var dxabs = this.vx;
				if (dxabs < 0) dxabs *= -1;
				this.delta.x += dxabs;

				// constrains
				if (this.x < 0)
				{
					this.vx *= this.FRICTION_CONSTRAINS;
					this.x -= this.x * this.DRAG_EASE_CONSTRAINS;
				}
				else if (this.x > this.width - this.windowwidth)
				{
					this.vx *= this.FRICTION_CONSTRAINS;
					this.x += (this.width - this.windowwidth - this.x) * this.DRAG_EASE_CONSTRAINS;
				}
			} else // released
			{
				// frictions
				/*this.vx *= this.FRICTION;
				this.x += this.vx;*/
				// snapping
				this.x += (this._releaseDest.x - this.x) * this.RELEASE_EASE;
				if(this.x > this.windowwidth * this.currentIndex.x - delta && this.x < this.windowwidth * this.currentIndex.x + delta)
				{
					this.x = this.windowwidth * this.currentIndex.x;
					if (this._running) {
						this._running = false;
						$(this).trigger(SlideShow.ENDX,[this.x,this.x/this._blocWidth]);
					}
				}
			}
		}
	}

	if (this.allowVertical) {
		// movement vertical
		if (this.windowheight > this.height)
		{
			this.y -= (((this.windowheight - this.height) * 0.5) + this.y) * this.DRAG_EASE;
		} else
		{
			if (this.drag.y) // dragging
			{
				this.y -= (this.my - this.inity + this.y) * this.DRAG_EASE;

				this.vy = this.y - this.oy;
				var dyabs = this.vy;
				if (dyabs < 0) dyabs *= -1;
				this.delta.y += dyabs;

				// constrains
				if (this.y < 0)
				{
					this.vy *= this.FRICTION_CONSTRAINS;
					this.y -= this.y * this.DRAG_EASE_CONSTRAINS;
				}
				else if (this.y > this.height - this.windowheight)
				{
					this.vy *= this.FRICTION_CONSTRAINS;
					this.y += (this.height - this.windowheight - this.y) * this.DRAG_EASE_CONSTRAINS;
				}
			} else // released
			{
				// frictions
				/*this.vy *= this.FRICTION;
				this.y += this.vy;*/

				// snapping
				this.y += (this._releaseDest.y - this.y) * this.RELEASE_EASE;
				if(this.y > this.windowheight * this.currentIndex.y  - delta && this.y < this.windowheight * this.currentIndex.y + delta)
				{
					this.y = this.windowheight * this.currentIndex.y;
					if (this._running) {
						this._running = false;
						$(this).trigger(SlideShow.ENDY,this.y);
					}
				}
			}
		}
	}

	if (this.allowHorizontal)
	{
		if (this.ox != this.x) 
			Css.transform(this.container[0],'translate3d('+-this.x+'px,0,0)');
		self.lockx = false;
	}

	if (this.allowVertical)
	{
		if (this.oy != this.y)
			Css.transform(this.container[0],'translate3d(0,'+-this.y+'px,0)');
		self.locky = false;
	}

	this.ox = this.x;
	this.oy = this.y;
};

SlideShow.prototype.preventDefault = function (e)
{
	if (this.lockx || this.locky) {

		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
	}
};

SlideShow.prototype.refresh = function ()
{
	this.windowwidth = this.dom.width();
	this.windowheight = this.dom.height();

	// content
	var blocs = $('.block--slideshow',this.container);

	this._blocWidth = blocs.width();
	this._containerWidth = this._blocWidth*blocs.length;
	// this.container.attr('data-width',this._containerWidth);

	this.width = this._containerWidth;
	this.height = this.container.height();

	this._constrainIndexX();
};

SlideShow.prototype.destroy = function ()
{
	this.timer = null;

	if (this.container)
		this.container.off();

	this._destroyPlayer();

	$(".overlay").unbind("mouseup");

	this.$.off();

	$(document).unbind("mouseup");
	$(document).unbind("mousemove");
};