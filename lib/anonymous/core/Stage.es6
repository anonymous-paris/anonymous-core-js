export class Stage
{
	resize()
	{
		Stage.width = Stage.$window.width();
		Stage.height = Stage.$window.height();
	}
}

Stage.$window = $(window);
Stage.$document = $(document);
Stage.$body = $("body");
Stage.device = $("html").attr("data-device");
Stage.dpr = window.devicePixelRatio !== undefined ? window.devicePixelRatio : 1;