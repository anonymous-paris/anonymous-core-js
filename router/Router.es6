/* globals History, ga */
import Config from "Config";
import Stage from "lib/anonymous/core/Stage";
import MouseEvent from "lib/anonymous/events/MouseEvent";
import RouterEvent from "./RouterEvent";
import Emitter from "Emitter";

/**
 * Router
 * @static
 */
export default class Router
{
	constructor()
	{
		Emitter(this);

		$('body').on(MouseEvent.CLICK + ".router", 'a:not([target])', $.proxy(this._onClickLink, this));

		// History.Adapter.bind(window, 'statechange', $.proxy(this._onStateChange, this));
		Stage.$window.on('statechange', $.proxy(this._onStateChange, this));
	}

	//-----------------------------------------------------o public

	static setTitle(title)
	{
		document.title = title;
	}

	//-----------------------------------------------------o handlers

	_onClickLink(e)
	{
		if(e.button !== 1)
		{
			e.preventDefault();
            
			let href = e.currentTarget.getAttribute('href');
				
			if (/:3000/.test(href))
				href = href.substring(href.indexOf(':3000') + 5);

			History.pushState(null, Config.TITLE, href);

			if(window.ga)
				ga('send', 'pageview');
		}
	}

	_onStateChange()
	{
		var state = History.getState();

		var url = state.url;
		this.emit(RouterEvent.CHANGE, url);
	}
}