import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Meta\MetaPreferenceController::update
* @see app/Http/Controllers/Meta/MetaPreferenceController.php:130
* @route '/meta/preferences/global'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

update.definition = {
    methods: ["post"],
    url: '/meta/preferences/global',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Meta\MetaPreferenceController::update
* @see app/Http/Controllers/Meta/MetaPreferenceController.php:130
* @route '/meta/preferences/global'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaPreferenceController::update
* @see app/Http/Controllers/Meta/MetaPreferenceController.php:130
* @route '/meta/preferences/global'
*/
update.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

const global = {
    update: Object.assign(update, update),
}

export default global