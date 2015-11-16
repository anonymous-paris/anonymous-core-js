"use strict";

var MouseEvent = require('@anonymous-paris/core-js/lib/anonymous/events/MouseEvent');

/**
 * SocialShare
 * @constructor
 */
var SocialShare = module.exports = function() {};

SocialShare.popup = function($dom, type, url, text)
{
	if(typeof type === undefined) { throw new Error('Type not defined'); }
	var typeExists = ['facebook', 'twitter'].indexOf(type);
	if(typeExists < 0){ throw new Error('This type does not exist'); }

	url = encodeURIComponent(url);
	text = encodeURIComponent(text);
	
	var finalURI;
	var width, height;	

	switch(type)
	{
		case 'facebook':
			width = 650;
			height = 450;
			finalURI = 'http://www.facebook.com/sharer.php?u='+url+'&t='+text;
			break;

		case 'twitter':
			width = 650;
			height = 256;
			finalURI = 'http://twitter.com/share?url='+url+'&text='+text;
			break;
	}

	var top      = (window.screen.height * 0.5) - ((height * 0.5) + 50);
	var left     = (window.screen.width * 0.5) - ((width * 0.5) + 10);

	var windowFeatures = "status=no,height=" + height + ",width=" + width + ",resizable=yes,left=" + left + ",top=" + top + ",screenX=" + left + ",screenY=" + top + ",toolbar=no,menubar=no,scrollbars=no,location=no,directories=no";

	$dom.on(MouseEvent.CLICK, function(e)
	{
		console.log("ok");
		e.preventDefault();
		window.open(finalURI, 'sharer', windowFeatures);
		return false;
	});

	return false;
};