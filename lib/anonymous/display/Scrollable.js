"use strict";

var Css = require("core-js/lib/anonymous/utils/Css");

/**
 * Scrollable
 * @constructor
 */
var Scrollable = module.exports = function()
{
	this.init();
};

Scrollable.prototype =
{
	init: function()
	{
		this._$body = $("body");

		if(!MouseEvent.touch)
		{
			this._$scrollContainer = $("#container");
			this._$scrollContainer.css("position", "fixed");
			this._scrollContainer = this._$scrollContainer[0];

			this._scrollSubstitute = document.createElement("div");
			this._$scrollContainer.parent().append(this._scrollSubstitute);
		}

		this.x = 0;
		this.y = this._y = -$(window).scrollTop();

		$(document).on("DOMMouseScroll mousewheel scroll", $.proxy(this._onScroll, this));
	},

	resize: function()
	{
		$(this._scrollSubstitute).height(this._$scrollContainer.height());
		this.y = this._y = -$(window).scrollTop();
	},

	destroy: function()
	{
		$(document).off("DOMMouseScroll mousewheel scroll", $.proxy(this._onScroll, this));
	},

	update: function()
	{
		this.y += (this._y - this.y) * 0.25;
		var d = this.y - this._y;
		if(d < 0) d *= -1;
		if(d < 0.01) this.y = this._y;

		if(this._oy !== this.y)
			Css.transform(this._scrollContainer, "translate(0," + this.y + "px)");

		this._oy = this.y;
	},

	_onScroll: function(e) 
	{
		if(!MouseEvent.touch)
			this._y = -this._$body.scrollTop();
	}
};