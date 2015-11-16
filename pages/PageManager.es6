"use strict";

import Config from "@anonymous-paris/core-js/Config";
import Router from "@anonymous-paris/core-js//router/Router";
import RouterEvent from "@anonymous-paris/core-js//router/RouterEvent";
import PageEvent from "@anonymous-paris/core-js/pages/events/PageEvent";
import Emitter from "Emitter";

/**
 * PageManager
 * @constructor
 */
export default class PageManager
{
	constructor()
	{
		Emitter(this);

		this._router = new Router();

		this.init();
	}

	init()
	{
		this._$content = $("#container");

		PageManager.currentId = this._$content.children(".container-class").attr("id");

		this._router.on(RouterEvent.CHANGE, this._onStateChange.bind(this));

		this._ajaxify();
	}

	update()
	{
		if(this._page && this._page.complete)
			this._page.update();
	}

	resize()
	{
		if(this._page && this._page.complete)
			this._page.resize();
			

	}

	scroll()
	{
		if(this._page && this._page.scroll && this._page.complete)
			this._page.scroll();

	}

	//-----------------------------------------------------o private

	_ajaxify()
	{
		if (window.sitemap.pages[PageManager.currentId])
		{
			var PageClass = window.sitemap.pages[PageManager.currentId].class;

			this._page = new PageClass(PageManager.currentId, window.sitemap);
			this._page
				.on(PageEvent.SHOWN, this._onPageShown.bind(this))
				.on(PageEvent.HIDDEN, this._onPageHidden.bind(this));
			this._page.preload();
		}
		else // nothing to ajaxify
			return false;
	}

	_setContent(data)
	{
		var $data = $(data),
			$content = $data.filter('#container');

		PageManager.currentId = $content.children('.container').attr("id");

		Router.setTitle($data.filter('title').text());

		this._$content.html($content.contents());

		this._ajaxify();
	}

	//-----------------------------------------------------o Handlers

	_onStateChange()
	{
		var State = History.getState();

		if(!State.data.silent)
		{
			if(this._page)
				this._page.hide();

			if(this._xhr)
				this._xhr.abort();

			this._xhr = $.ajax
			({
				url: State.url,
				type: 'GET',
				xhrFields: 
				{
					withCredentials: true
				},
				success: $.proxy(function(data) 
				{
					this._setContent(data);
					this._xhr = null;
				
				}, this),
				error: function(xhr, type) 
				{
					if(Config.DEBUG)
						console.log("PageManager xhr error", type, xhr);
				}
			});
		}
	}

	_onPageShown()
	{
		//
	}

	_onPageHidden()
	{
		//
	}
}