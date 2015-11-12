Localization = module.exports = function() {};


Localization.getLocale = function(lang)
{
	switch(lang)
	{
		case 'fr' : return 'fr_FR'; break;
		case 'en' :
		default   : return 'en_US';
	}
}