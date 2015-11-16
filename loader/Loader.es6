import createjs from "@anonymous-paris/core-js/lib/preloadjs/preloadjs-0.6.1.min.js";
import Emitter from "Emitter";

/**
 * Loader
 * @constructor
 */
export default class Loader 
{
	constructor(data, paths)
	{
		Emitter(this);

		this._init(data, paths);		
	}

	_init(data, paths)
	{
		this.loaded = false;

		Loader.loader = new createjs.LoadQueue(true);
		Loader.loader.addEventListener("progress", $.proxy(this._onProgress, this));
		Loader.loader.addEventListener("error", $.proxy(this._onError, this));
		Loader.loader.addEventListener("complete", $.proxy(this._onComplete, this));

		this.data = [];
		for (var i = 0; i < data.length; i++)
			this.data[i] = { id: data[i].filepath, src: paths[data[i].type] + data[i].filepath };

		Loader.loader.loadManifest(this.data);	
	}

	setPaused(bool)
	{
		if(Loader.loader)
			Loader.loader.setPaused(bool);
	}

	load()
	{
		Loader.loader.load();
	}

	//-----------------------------------------------------o Handlers

	_onProgress(e) 
	{
		this.emit(Loader.PROGRESS, Loader.loader.progress);
	}

	_onError(e) 
	{
		console.log("Loading error", e);
	}

	_onComplete(e) 
	{
		this.loaded = true;
		this.emit(Loader.COMPLETE);
	}
}

Loader.PROGRESS = "progress";
Loader.COMPLETE = "complete";