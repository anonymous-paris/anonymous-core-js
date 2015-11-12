export default class ColorUtils
{
	constructor()
	{

	}

	/**
	 * Interpolate a color from a value to another
	 */
	static interpolateColor(fromColor, toColor, progress, alpha = false)
	{
		var q = 1 - progress;
		var fromA = (fromColor >> 24) & 0xFF;
		var fromR = (fromColor >> 16) & 0xFF;
		var fromG = (fromColor >> 8) & 0xFF;
		var fromB = fromColor & 0xFF;
		
		var toR = (toColor >> 16) & 0xFF;
		var toG = (toColor >> 8) & 0xFF;
		var toB = toColor & 0xFF;
		
		var resultR = fromR * q + toR * progress;
		var resultG = fromG * q + toG * progress;
		var resultB = fromB * q + toB * progress;
		
		var resultColor;
		if(alpha)
		{
			var toA = (toColor >> 24) & 0xFF;
			var resultA = fromA * q + toA * progress;
			resultColor = resultA << 24 | resultR << 16 | resultG << 8 | resultB;
		}
		else
			resultColor = resultR << 16 | resultG << 8 | resultB;
		
		return resultColor;
	}
}