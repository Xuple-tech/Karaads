import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::dashboard
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:22
* @route '/staff'
*/
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/staff',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::dashboard
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:22
* @route '/staff'
*/
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::dashboard
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:22
* @route '/staff'
*/
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::dashboard
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:22
* @route '/staff'
*/
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::monitoring
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:22
* @route '/staff/monitoring'
*/
export const monitoring = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: monitoring.url(options),
    method: 'get',
})

monitoring.definition = {
    methods: ["get","head"],
    url: '/staff/monitoring',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::monitoring
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:22
* @route '/staff/monitoring'
*/
monitoring.url = (options?: RouteQueryOptions) => {
    return monitoring.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::monitoring
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:22
* @route '/staff/monitoring'
*/
monitoring.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: monitoring.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::monitoring
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:22
* @route '/staff/monitoring'
*/
monitoring.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: monitoring.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::apiPerformance
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:56
* @route '/staff/api-performance'
*/
export const apiPerformance = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: apiPerformance.url(options),
    method: 'get',
})

apiPerformance.definition = {
    methods: ["get","head"],
    url: '/staff/api-performance',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::apiPerformance
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:56
* @route '/staff/api-performance'
*/
apiPerformance.url = (options?: RouteQueryOptions) => {
    return apiPerformance.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::apiPerformance
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:56
* @route '/staff/api-performance'
*/
apiPerformance.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: apiPerformance.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::apiPerformance
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:56
* @route '/staff/api-performance'
*/
apiPerformance.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: apiPerformance.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::health
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:95
* @route '/staff/health'
*/
export const health = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: health.url(options),
    method: 'get',
})

health.definition = {
    methods: ["get","head"],
    url: '/staff/health',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::health
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:95
* @route '/staff/health'
*/
health.url = (options?: RouteQueryOptions) => {
    return health.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::health
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:95
* @route '/staff/health'
*/
health.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: health.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::health
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:95
* @route '/staff/health'
*/
health.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: health.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::systemHealth
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:95
* @route '/staff/system-health'
*/
export const systemHealth = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: systemHealth.url(options),
    method: 'get',
})

systemHealth.definition = {
    methods: ["get","head"],
    url: '/staff/system-health',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::systemHealth
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:95
* @route '/staff/system-health'
*/
systemHealth.url = (options?: RouteQueryOptions) => {
    return systemHealth.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::systemHealth
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:95
* @route '/staff/system-health'
*/
systemHealth.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: systemHealth.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::systemHealth
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:95
* @route '/staff/system-health'
*/
systemHealth.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: systemHealth.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::logs
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:146
* @route '/staff/logs'
*/
export const logs = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: logs.url(options),
    method: 'get',
})

logs.definition = {
    methods: ["get","head"],
    url: '/staff/logs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::logs
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:146
* @route '/staff/logs'
*/
logs.url = (options?: RouteQueryOptions) => {
    return logs.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::logs
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:146
* @route '/staff/logs'
*/
logs.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: logs.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::logs
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:146
* @route '/staff/logs'
*/
logs.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: logs.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::securityLogs
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:127
* @route '/staff/security-logs'
*/
export const securityLogs = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: securityLogs.url(options),
    method: 'get',
})

securityLogs.definition = {
    methods: ["get","head"],
    url: '/staff/security-logs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::securityLogs
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:127
* @route '/staff/security-logs'
*/
securityLogs.url = (options?: RouteQueryOptions) => {
    return securityLogs.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::securityLogs
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:127
* @route '/staff/security-logs'
*/
securityLogs.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: securityLogs.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::securityLogs
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:127
* @route '/staff/security-logs'
*/
securityLogs.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: securityLogs.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::resolveIssue
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:186
* @route '/staff/resolve-issue/{alertId}'
*/
export const resolveIssue = (args: { alertId: string | number } | [alertId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resolveIssue.url(args, options),
    method: 'post',
})

resolveIssue.definition = {
    methods: ["post"],
    url: '/staff/resolve-issue/{alertId}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::resolveIssue
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:186
* @route '/staff/resolve-issue/{alertId}'
*/
resolveIssue.url = (args: { alertId: string | number } | [alertId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { alertId: args }
    }

    if (Array.isArray(args)) {
        args = {
            alertId: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        alertId: args.alertId,
    }

    return resolveIssue.definition.url
            .replace('{alertId}', parsedArgs.alertId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::resolveIssue
* @see app/Http/Controllers/Staff/StaffMonitoringController.php:186
* @route '/staff/resolve-issue/{alertId}'
*/
resolveIssue.post = (args: { alertId: string | number } | [alertId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resolveIssue.url(args, options),
    method: 'post',
})

const staff = {
    dashboard: Object.assign(dashboard, dashboard),
    monitoring: Object.assign(monitoring, monitoring),
    apiPerformance: Object.assign(apiPerformance, apiPerformance),
    health: Object.assign(health, health),
    systemHealth: Object.assign(systemHealth, systemHealth),
    logs: Object.assign(logs, logs),
    securityLogs: Object.assign(securityLogs, securityLogs),
    resolveIssue: Object.assign(resolveIssue, resolveIssue),
}

export default staff