import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::update
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:185
 * @route '/admin/management/configuration/{config}'
 */
export const update = (args: { config: string | { id: string } } | [config: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/management/configuration/{config}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::update
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:185
 * @route '/admin/management/configuration/{config}'
 */
update.url = (args: { config: string | { id: string } } | [config: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { config: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { config: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    config: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        config: typeof args.config === 'object'
                ? args.config.id
                : args.config,
                }

    return update.definition.url
            .replace('{config}', parsedArgs.config.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::update
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:185
 * @route '/admin/management/configuration/{config}'
 */
update.put = (args: { config: string | { id: string } } | [config: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
const configuration = {
    update: Object.assign(update, update),
}

export default configuration