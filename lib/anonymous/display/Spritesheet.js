"use strict";

/**
 * Spritesheet
 * @constructor
 */
var Spritesheet = module.exports = function(dom, className, frameRate, length, digits)
{
	if(!dom)
		throw new Error('Spritesheet : dom element does not exist');

	this.$               = $(this);
	this._className      = className;
	this._dom            = dom;
	this._$dom           = $(dom);
	this._frameRateRatio = 60 / frameRate | 0;

	this._length         = length;
	this._digits         = digits;
	this._ticker         = 0;
	this._locked         = false;

	var classes = dom.className.split(" ");
	classes.pop();
	this._defaultClassname = classes.join(" ");

	this.init();
};

Spritesheet.SHOW_COMPLETE = 'showComplete';
Spritesheet.HIDE_COMPLETE = 'hideComplete';

Spritesheet.prototype =
{
	init: function()
	{
		this._index = 0;
	},

	update: function()
	{
		if(!this._locked && !(++this._ticker % this._frameRateRatio))
		{
			this._ticker = 0;
			this._tick();
		}
	},

	destroy: function()
	{
		this._locked = true;
	},

	show: function(delay)
	{
		this.play();
		
		if(typeof delay === 'undefined')
		{
			var t = this;

			this._$dom.animate({'visibility': 'visible', 'opacity': 1}, 300, function()
			{
				t.$.trigger(Spritesheet.SHOW_COMPLETE);
			});
		}
		else if(delay === 'now')
		{
			this._$dom.css({'visibility': 'visible', 'opacity': 1});
			t.$.trigger(Spritesheet.SHOW_COMPLETE);
		}
	},

	hide: function(delay)
	{
		if(typeof delay === 'undefined')
		{
			var t = this;

			this._$dom.animate({'opacity':0, 'visibility': 'hidden'}, 300, function()
			{
				t.stop();
				t.$.trigger(Spritesheet.HIDE_COMPLETE);
			});
		}
		else if(delay === 'now')
		{
			this._$dom.css({'visibility': 'hidden', 'opacity': 0});
			t.$.trigger(Spritesheet.HIDE_COMPLETE);
		}
	},

	play: function()
	{
		this._locked = false;
	},

	pause: function()
	{
		this._locked = true;
	},

	stop: function()
	{
		this.pause();
		this._index = 0;
		this._tick();
	},

	//-----------------------------------------------------o Private

	_tick: function()
	{
		if(++this._index == this._length)
			this._index = 0;

		var index = this._index + "";
		while(index.length < this._digits)
			index = "0" + index;

		this._dom.className = this._defaultClassname + " " + this._className + index;
	},
};