// Facets.js
// ---------
// AKA Item List.
// This is the index, routes in the router are assigned here
define(
	'Facets'
,	['Facets.Translator', 'Facets.Helper', 'Facets.Model', 'Facets.Router', 'Facets.Views', 'Categories']
,	function (Translator, Helper, Model, Router, Views, Categories)
{
	'use strict';

	function prepareRouter(application, router)
	{
		// we are constructing this regexp like:
		// /^\b(toplevelcategory1|toplevelcategory2|facetname1|facetname2|defaulturl)\b\/(.*?)$/
		// and adding it as a route

		// Get the facets that are in the sitesettings but not in the config.
		// These facets will get a default config (max, behavior, etc.) - Facets.Translator
		// Include facet aliases to be conisdered as a possible route
		var facets_data = application.getConfig('siteSettings.facetfield')
		,	facets_to_include = [];

		_.each(facets_data, function(facet) {
			facets_to_include.push(facet.facetfieldid);

			// Include URL Component Aliases...
			_.each(facet.urlcomponentaliases, function(facet_alias) {
				facets_to_include.push(facet_alias.urlcomponent);
			});
		});
		
		facets_to_include = _.union(facets_to_include, _.pluck(application.getConfig('facets'), 'id'));
		facets_to_include = _.uniq(facets_to_include);		

		// Here we generate an array with:
		// * The default url
		// * The Names of the facets that are in the siteSettings.facetfield config
		// * the url of the configured facets
		// * And the url of the top level categories
		var components = _.compact(_.union(
			[application.translatorConfig.fallbackUrl]
		,	facets_to_include || []
		,	_.pluck(application.translatorConfig.facets, 'url') || []
		,	Categories.getTopLevelCategoriesUrlComponent() || []
		));
		
		// Generate the regexp and adds it to the instance of the router
		var facet_regex = '^\\b(' + components.join('|') + ')\\b(.*?)$';	

		router.route(new RegExp(facet_regex), 'facetLoading');
	}

	function setTranslatorConfig(application)
	{
		// Formats a configuration object in the way the translator is expecting it
		application.translatorConfig = {
			fallbackUrl: application.getConfig('defaultSearchUrl')
		,	defaultShow: _.find(application.getConfig('resultsPerPage'), function (show) { return show.isDefault; }).items || application.getConfig('resultsPerPage')[0].items
		,	defaultOrder: _.find(application.getConfig('sortOptions'), function (sort) { return sort.isDefault; }).id || application.getConfig('sortOptions')[0].id
		,	defaultDisplay: _.find(application.getConfig('itemsDisplayOptions'), function (display) { return display.isDefault; }).id || application.getConfig('itemsDisplayOptions')[0].id
		,	facets: application.getConfig('facets')
		,	facetDelimiters: application.getConfig('facetDelimiters')
		,	facetsSeoLimits: application.getConfig('facetsSeoLimits')
		};
	}

	return {
		Translator: Translator
	,	Helper: Helper
	,	Model:  Model
	,	Router: Router
	,	Views: Views
	,	setTranslatorConfig: setTranslatorConfig
	,	prepareRouter: prepareRouter
	,	mountToApp: function (application)
		{
			setTranslatorConfig(application);
			
			var routerInstance = new Router(application);
			
			prepareRouter(application, routerInstance);
			
			// Wires some config to the model
			Model.mountToApp(application);
			return routerInstance;
		}
	};
});
