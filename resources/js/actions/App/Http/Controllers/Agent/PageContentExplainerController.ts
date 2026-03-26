import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Agent\PageContentExplainerController::explainPageContent
 * @see app/Http/Controllers/Agent/PageContentExplainerController.php:14
 * @route '/api/agent/explain-page-content'
 */
export const explainPageContent = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: explainPageContent.url(options),
    method: 'post',
})

explainPageContent.definition = {
    methods: ["post"],
    url: '/api/agent/explain-page-content',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Agent\PageContentExplainerController::explainPageContent
 * @see app/Http/Controllers/Agent/PageContentExplainerController.php:14
 * @route '/api/agent/explain-page-content'
 */
explainPageContent.url = (options?: RouteQueryOptions) => {
    return explainPageContent.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Agent\PageContentExplainerController::explainPageContent
 * @see app/Http/Controllers/Agent/PageContentExplainerController.php:14
 * @route '/api/agent/explain-page-content'
 */
explainPageContent.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: explainPageContent.url(options),
    method: 'post',
})
const PageContentExplainerController = { explainPageContent }

export default PageContentExplainerController