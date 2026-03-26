import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
import alerts080c72 from './alerts'
import configurationD0b94a from './configuration'
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

const management = {
    alerts: Object.assign(alerts, alerts080c72),
    auditLogs: Object.assign(auditLogs, auditLogs),
    configuration: Object.assign(configuration, configurationD0b94a),
}

export default management