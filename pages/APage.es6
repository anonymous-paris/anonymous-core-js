import Loader from "core/loader/Loader";
import PageEvent from "pages/events/PageEvent";
import Config from "Config";
import Emitter from "Emitter";

export default class APage 
{
	constructor(id, sitemap)
	{
		Emitter(this);

		this.id = id;
		this.sitemap = sitemap;
		this.complete = false;
		
		this.$dom = $("#" + id);
	}

	init()
	{
		console.log("init page", this.id);
	}

	preload()
	{
		if(this.sitemap.pages[this.id].assets)
		{
			this._loader = new Loader(this.sitemap.pages[this.id].assets, this.sitemap.paths);
			this._loader.on(Loader.PROGRESS, $.proxy(this._onProgress, this));
			this._loader.on(Loader.COMPLETE, $.proxy(this._onComplete, this));
		}
		else
			this._onComplete();
	}

	resize()
	{
		// to implement
	}

	update()
	{
		// to implement
	}

	destroy()
	{
		// to implement with super

		this.$dom.off();
		this.off();
	}

	//-----------------------------------------------------o show / hide logic

	show()
	{
		if (Config.DEBUG)
			console.log("show page", this.id);
		
		this.emit(PageEvent.SHOW);

		this._show();
	}

	/**
	 * @protected
	 */
	_show()
	{
		// to be overridden for transition
		this._shown();
	}

	/**
	 * Call this method on _show() transition end
	 */
	_shown()
	{
		this.emit(PageEvent.SHOWN);
	}

	hide()
	{
		if (Config.DEBUG)
			console.log("hide page", this.id);
		
		this.emit(PageEvent.HIDE);

		this._hide();
	}

	/**
	 * @protected
	 */
	_hide()
	{
		// to be overridden for transition
		this._hidden();
	}

	/**
	 * Call this method on _hide() transition end
	 */
	_hidden()
	{
		// clean memory
		this.destroy();

		// clean DOM
		this.$dom.remove();

		this.emit(PageEvent.HIDDEN);
	}

	//-----------------------------------------------------o Handlers

	_onProgress()
	{
		if (Config.DEBUG)
			console.log("load progress", this.id);
	}

	_onComplete()
	{
		if (Config.DEBUG)
			console.log("load complete", this.id);

		this.complete = true;

		this.init();

		this.resize();

		this.show();
	}
}