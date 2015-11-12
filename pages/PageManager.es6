"use strict";

import Config from "Config";
import Router from "core/router/Router";
import RouterEvent from "core/router/RouterEvent";
import PageEvent from "pages/events/PageEvent";
import Emitter from "Emitter";
import BicolorNav from "components/bicolornav/BicolorNav.es6";

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

		this._bicolorNav = new BicolorNav($('.nav.container'));

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
			
		this._bicolorNav.resize();

	}

	scroll()
	{
		if(this._page && this._page.scroll && this._page.complete)
			this._page.scroll();

		this._bicolorNav.scroll();
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
		this._bicolorNav.init();
	}

	_onPageHidden()
	{
		//
	}
}