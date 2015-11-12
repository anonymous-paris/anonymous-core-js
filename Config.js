"use strict";

/**
 * Config
 * @constructor
 */
var Config = module.exports = function() {};

Config.DEBUG = window.location.port === "8888" || window.location.port === "3000" || /\.dev$/.test(window.location.host);
Config.LOG = Config.DEBUG && true;

Config.TITLE = "Wordpress bootstrap";

Config.SKIP_INTRO = Config.DEBUG && false;