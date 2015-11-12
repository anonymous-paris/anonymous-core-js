var Stage = module.exports = function() {};

Stage.$window = $(window);
Stage.$document = $(document);
Stage.$body = $("body");
Stage.device = $("html").attr("data-device");
Stage.dpr = window.devicePixelRatio !== undefined ? window.devicePixelRatio : 1;

Stage.resize = function()
{
	Stage.width = Stage.$window.width();
	Stage.height = Stage.$window.height();
};