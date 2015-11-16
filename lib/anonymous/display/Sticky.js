/* globals module, Config, require */
"use strict"; // jshint ignore: line

var Css = require("@anonymous-paris/core-js/lib/anonymous/utils/Css");

/**
 * Sticky
 *
 * Stick an element while scrolling.
 * Stops when the element's bottom line cross its parent's.
 * Parent defined by .sticky-container
 *
 * @constructor
 * (jQuery or Zepto element) $dom: Element
 * (int) fixedTop: Min top gap when to stick (in px)
 * (bool) translate: Use css translate instead of position fixed
 */
var Sticky = module.exports = function($dom, fixedTop, translate)
{
	this._$dom = $dom;
	this._$parent = this._$dom.parents('.sticky-container');

	this._fTop = fixedTop;
	this._translate = translate;

	this.stick = false;

	if (!this._$parent.length && Config.LOG)
		console.warn('no .sticky-container found');
	if (this._$parent.css('position') === 'static' && Config.LOG)
		console.warn('.sticky-container not positionned');

	this._initVars();
};

Sticky.prototype =
{
	_initVars: function()
	{
		this._iniOffsetTop = this._$dom.offset().top;
		this._domHeight = this._$dom.height();

		this._parentOffsetTop = this._$parent.offset().top;
		this._parentHeight = this._$parent.height();

		this.scroll();
	},
	
	destroy: function()
	{

	},

	//-----------------------------------------------------o Public

	scroll: function()
	{
		var y = window.pageYOffset;

		if (y + this._fTop + this._domHeight > this._parentOffsetTop + this._parentHeight )
			this._stickBottom(this._$parent.height());
		else 
		if (this._iniOffsetTop - y <= this._fTop)
			this._stick();
		else
			this._unstick();
	},

	resize: function()
	{
		this._unstick();
		this._initVars();
	},

	//-----------------------------------------------------o "Private"

	_stick: function()
	{
		if (this._translate)
			Css.transform(this._$dom[0], 'translate3d(0, ' + (this._fTop + window.pageYOffset - this._iniOffsetTop) + 'px, 0)');
		else if (!this.stick)
				this._$dom.css({position: 'fixed', top: this._fTop});

		this.stick = true;
	},

	_stickBottom: function()
	{
		if (this._translate)
			Css.transform(this._$dom[0], 'translate3d(0, ' + (this._parentHeight - this._domHeight) + 'px, 0)');
		else
			this._$dom.css({position: 'absolute', top: '', bottom: 0});

		this.stick = false;
	},

	_unstick: function()
	{
		if (this._translate)
			Css.transform(this._$dom[0], 'translate3d(0,0,0)');
		else
			this._$dom.css({position:'', top:''});

		this.stick = false;
	},
};