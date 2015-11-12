import APage from "./APage";
import Stage from "lib/anonymous/core/Stage";

class AScrollablePage extends APage
{
	constructor(id, sitemap)
	{
		super(arguments);
	}

	init()
	{
		super.init();

		this.init();

		this.y = 0;
		Stage.$document.on("DOMMouseScroll.scrollable mousewheel.scrollable scroll.scrollable", $.proxy(this._onScroll, this));
	}

	resize()
	{
		super.resize();
	}

	update()
	{
		super.update();
	}

	destroy()
	{
		super.destroy();

		Stage.$document.off("DOMMouseScroll.scrollable mousewheel.scrollable scroll.scrollable");
	}

	show()
	{
		super.show();
	}

	hide()
	{
		super.hide();
	}

	//-----------------------------------------------------o handlers

	_onScroll(e)
	{
		this.y = -Stage.$window.scrollTop();
	}
}