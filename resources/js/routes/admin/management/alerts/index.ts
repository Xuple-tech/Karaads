import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::resolve
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:63
 * @route '/admin/management/alerts/{id}/resolve'
 */
export const resolve = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resolve.url(args, options),
    method: 'post',
})

resolve.definition = {
    methods: ["post"],
    url: '/admin/management/alerts/{id}/resolve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::resolve
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:63
 * @route '/admin/management/alerts/{id}/resolve'
 */
resolve.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return resolve.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::resolve
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:63
 * @route '/admin/management/alerts/{id}/resolve'
 */
resolve.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resolve.url(args, options),
    method: 'post',
})
const alerts = {
    resolve: Object.assign(resolve, resolve),
}

export default alerts