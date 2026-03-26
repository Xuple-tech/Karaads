import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\User::language
 * @see app/Http/Controllers/User.php:11
 * @route '/user/setting/language'
 */
export const language = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: language.url(options),
    method: 'post',
})

language.definition = {
    methods: ["post"],
    url: '/user/setting/language',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User::language
 * @see app/Http/Controllers/User.php:11
 * @route '/user/setting/language'
 */
language.url = (options?: RouteQueryOptions) => {
    return language.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\User::language
 * @see app/Http/Controllers/User.php:11
 * @route '/user/setting/language'
 */
language.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: language.url(options),
    method: 'post',
})
const setting = {
    language: Object.assign(language, language),
}

export default setting