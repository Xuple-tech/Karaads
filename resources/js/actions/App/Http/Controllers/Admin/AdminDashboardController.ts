import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::index
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:26
 * @route '/admin/management/dashboard'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/management/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::index
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:26
 * @route '/admin/management/dashboard'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::index
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:26
 * @route '/admin/management/dashboard'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::index
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:26
 * @route '/admin/management/dashboard'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::alerts
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:51
 * @route '/admin/management/alerts'
 */
export const alerts = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: alerts.url(options),
    method: 'get',
})

alerts.definition = {
    methods: ["get","head"],
    url: '/admin/management/alerts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::alerts
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:51
 * @route '/admin/management/alerts'
 */
alerts.url = (options?: RouteQueryOptions) => {
    return alerts.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::alerts
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:51
 * @route '/admin/management/alerts'
 */
alerts.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: alerts.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::alerts
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:51
 * @route '/admin/management/alerts'
 */
alerts.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: alerts.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::resolveAlert
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:63
 * @route '/admin/management/alerts/{id}/resolve'
 */
export const resolveAlert = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resolveAlert.url(args, options),
    method: 'post',
})

resolveAlert.definition = {
    methods: ["post"],
    url: '/admin/management/alerts/{id}/resolve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::resolveAlert
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:63
 * @route '/admin/management/alerts/{id}/resolve'
 */
resolveAlert.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return resolveAlert.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::resolveAlert
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:63
 * @route '/admin/management/alerts/{id}/resolve'
 */
resolveAlert.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resolveAlert.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::auditLogs
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:76
 * @route '/admin/management/audit-logs'
 */
export const auditLogs = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: auditLogs.url(options),
    method: 'get',
})

auditLogs.definition = {
    methods: ["get","head"],
    url: '/admin/management/audit-logs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::auditLogs
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:76
 * @route '/admin/management/audit-logs'
 */
auditLogs.url = (options?: RouteQueryOptions) => {
    return auditLogs.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::auditLogs
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:76
 * @route '/admin/management/audit-logs'
 */
auditLogs.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: auditLogs.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::auditLogs
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:76
 * @route '/admin/management/audit-logs'
 */
auditLogs.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: auditLogs.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::configuration
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:175
 * @route '/admin/management/configuration'
 */
export const configuration = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: configuration.url(options),
    method: 'get',
})

configuration.definition = {
    methods: ["get","head"],
    url: '/admin/management/configuration',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::configuration
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:175
 * @route '/admin/management/configuration'
 */
configuration.url = (options?: RouteQueryOptions) => {
    return configuration.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::configuration
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:175
 * @route '/admin/management/configuration'
 */
configuration.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: configuration.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::configuration
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:175
 * @route '/admin/management/configuration'
 */
configuration.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: configuration.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::updateConfiguration
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:185
 * @route '/admin/management/configuration/{config}'
 */
export const updateConfiguration = (args: { config: string | number | { id: string | number } } | [config: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateConfiguration.url(args, options),
    method: 'put',
})

updateConfiguration.definition = {
    methods: ["put"],
    url: '/admin/management/configuration/{config}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::updateConfiguration
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:185
 * @route '/admin/management/configuration/{config}'
 */
updateConfiguration.url = (args: { config: string | number | { id: string | number } } | [config: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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

    return updateConfiguration.definition.url
            .replace('{config}', parsedArgs.config.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::updateConfiguration
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:185
 * @route '/admin/management/configuration/{config}'
 */
updateConfiguration.put = (args: { config: string | number | { id: string | number } } | [config: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateConfiguration.url(args, options),
    method: 'put',
})
const AdminDashboardController = { index, alerts, resolveAlert, auditLogs, configuration, updateConfiguration }

export default AdminDashboardController