"use strict";
var FacebookEvent = require("lib/anonymous/events/FacebookEvent");
var Emitter = require("Emitter");

/**
 * FacebookConnect
 * @constructor
 */
var FacebookConnect = module.exports = function(options, callback)
{
	Emitter(this);

	this.options = $.extend({
		appId         : '',
		locale        : 'fr_FR',
		async         : true,
		target        : '/me',
		authorization : '',
		xfbml         : true,
		status        : true,
		version       : 'v2.3',
		debug         : false,
		cookie        : true
	}, options);

	this._onFBReady    = callback;
	this._status       = null;
	this._authResponse = null;
	this._datas        = null;

	this.init();
};

FacebookConnect.prototype =
{
	init: function()
	{
		var self = this;

		//On Facebook ready
		window.fbAsyncInit = $.proxy(this._onFBAPIReady, this);

		this.loadSDK();
	},

	destroy: function()
	{
	},

	loadSDK: function()
	{
		var self = this;
		var urlSDK = null;

		var script = $('#facebook-jssdk');
		var fBroot = $('#fb-root');

		if(script.length && fBroot.length)
		{
			//window.fbAsyncInit();
			this._onFBReady();
			return;
		}

		//Choose SDK with debug or not
		if (this.options.debug) {
			urlSDK = '//connect.facebook.net/' + self.options.locale + '/sdk/debug.js';
		} else {
			urlSDK = '//connect.facebook.net/' + self.options.locale + '/sdk.js'
		}

		//Load the Facebook SDK JS and add the tag "fb-root"
		(function(d, s, id) {
			var js, tag = document.createElement('div');
			if (d.getElementById(id)) return;
			tag.id = 'fb-root';
			js = d.createElement(s);
			js.id = id;
			js.async = self.options.async;
			js.src = urlSDK;
			d.getElementsByTagName('body')[0].appendChild(tag);
			d.getElementsByTagName('body')[0].appendChild(js);
		}(document, 'script', 'facebook-jssdk'));
	},

	connect: function()
	{
		var self = this;

		//Check status of Facebook connection
		FB.getLoginStatus(function(response)
		{
			//Status of the connection
			self._status = response.status;
			self._authResponse = response.authResponse;

			if (response._status === 'connected') {
				self.getDatas();
			} else if (response._status === 'not_authorized') {
				self.login();
			} else {
				self.login();
			}

		});
	},

	login: function()
	{
		var self = this;

		//Facebook login function
		FB.login(function(response)
		{
			self._status = response.status;

			if (response.authResponse)
			{
				self.getDatas();
			}
			else
			{
				if (response.status === 'not_authorized') {
					self.emit(FacebookEvent.NOT_AUTHORIZED, [self._status]);
				}
			}

		}, { scope: this.options.authorization });

	},

	getDatas: function()
	{
		var self = this;

		//Call Open Grap API
		FB.api(this.options.target, function(response)
		{
			//Save user datas and status
			self._datas = response;

			//Trigger success event
			self.emit(FacebookEvent.CONNECTED, [self._datas, self._status, self._authResponse]);
		});
	},

	//-----------------------------------------------------o Handlers

	_onFBAPIReady: function()
	{
		var self = this;

		//Parse the DOM to instanciate Facebook plugins (Like)
		if (this.options.xfbml) {
			FB.XFBML.parse();
		}

		//AddClass in html tag when Facebook is ready
		$('html').addClass('fb-ready');

		FB.init(this.options);

		//OK everything is ready go on !
		this._onFBReady();

		//If status and user already granted, get data immediately
		if (!this.options.status) return;

		//Prevent Facebook API not ready
		setTimeout(function()
		{
			if (FB.getAuthResponse()) {
				self._status = 'connected';
				self.getDatas();
			}
		}, 500);
	},
};