import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\User::saveLanguage
 * @see app/Http/Controllers/User.php:11
 * @route '/user/setting/language'
 */
export const saveLanguage = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: saveLanguage.url(options),
    method: 'post',
})

saveLanguage.definition = {
    methods: ["post"],
    url: '/user/setting/language',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User::saveLanguage
 * @see app/Http/Controllers/User.php:11
 * @route '/user/setting/language'
 */
saveLanguage.url = (options?: RouteQueryOptions) => {
    return saveLanguage.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\User::saveLanguage
 * @see app/Http/Controllers/User.php:11
 * @route '/user/setting/language'
 */
saveLanguage.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: saveLanguage.url(options),
    method: 'post',
})
const User = { saveLanguage }

export default User