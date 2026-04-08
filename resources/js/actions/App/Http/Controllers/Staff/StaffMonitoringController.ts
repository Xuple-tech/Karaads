import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::index
 * @see app/Http/Controllers/Staff/StaffMonitoringController.php:22
 * @route '/staff'
 */
const index329fd943836cf306ed5281162dce3109 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index329fd943836cf306ed5281162dce3109.url(options),
    method: 'get',
})

index329fd943836cf306ed5281162dce3109.definition = {
    methods: ["get","head"],
    url: '/staff',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::index
 * @see app/Http/Controllers/Staff/StaffMonitoringController.php:22
 * @route '/staff'
 */
index329fd943836cf306ed5281162dce3109.url = (options?: RouteQueryOptions) => {
    return index329fd943836cf306ed5281162dce3109.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::index
 * @see app/Http/Controllers/Staff/StaffMonitoringController.php:22
 * @route '/staff'
 */
index329fd943836cf306ed5281162dce3109.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index329fd943836cf306ed5281162dce3109.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::index
 * @see app/Http/Controllers/Staff/StaffMonitoringController.php:22
 * @route '/staff'
 */
index329fd943836cf306ed5281162dce3109.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index329fd943836cf306ed5281162dce3109.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::index
 * @see app/Http/Controllers/Staff/StaffMonitoringController.php:22
 * @route '/staff/monitoring'
 */
const indexbbf780961e03d6027892d3e9c6b2b773 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexbbf780961e03d6027892d3e9c6b2b773.url(options),
    method: 'get',
})

indexbbf780961e03d6027892d3e9c6b2b773.definition = {
    methods: ["get","head"],
    url: '/staff/monitoring',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::index
 * @see app/Http/Controllers/Staff/StaffMonitoringController.php:22
 * @route '/staff/monitoring'
 */
indexbbf780961e03d6027892d3e9c6b2b773.url = (options?: RouteQueryOptions) => {
    return indexbbf780961e03d6027892d3e9c6b2b773.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::index
 * @see app/Http/Controllers/Staff/StaffMonitoringController.php:22
 * @route '/staff/monitoring'
 */
indexbbf780961e03d6027892d3e9c6b2b773.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexbbf780961e03d6027892d3e9c6b2b773.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::index
 * @see app/Http/Controllers/Staff/StaffMonitoringController.php:22
 * @route '/staff/monitoring'
 */
indexbbf780961e03d6027892d3e9c6b2b773.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexbbf780961e03d6027892d3e9c6b2b773.url(options),
    method: 'head',
})

export const index = {
    '/staff': index329fd943836cf306ed5281162dce3109,
    '/staff/monitoring': indexbbf780961e03d6027892d3e9c6b2b773,
}

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
* @see \App\Http\Controllers\Staff\StaffMonitoringController::systemHealth
 * @see app/Http/Controllers/Staff/StaffMonitoringController.php:95
 * @route '/staff/health'
 */
const systemHealthc41b3ceffe1f259592533bfa0798db05 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: systemHealthc41b3ceffe1f259592533bfa0798db05.url(options),
    method: 'get',
})

systemHealthc41b3ceffe1f259592533bfa0798db05.definition = {
    methods: ["get","head"],
    url: '/staff/health',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::systemHealth
 * @see app/Http/Controllers/Staff/StaffMonitoringController.php:95
 * @route '/staff/health'
 */
systemHealthc41b3ceffe1f259592533bfa0798db05.url = (options?: RouteQueryOptions) => {
    return systemHealthc41b3ceffe1f259592533bfa0798db05.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::systemHealth
 * @see app/Http/Controllers/Staff/StaffMonitoringController.php:95
 * @route '/staff/health'
 */
systemHealthc41b3ceffe1f259592533bfa0798db05.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: systemHealthc41b3ceffe1f259592533bfa0798db05.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::systemHealth
 * @see app/Http/Controllers/Staff/StaffMonitoringController.php:95
 * @route '/staff/health'
 */
systemHealthc41b3ceffe1f259592533bfa0798db05.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: systemHealthc41b3ceffe1f259592533bfa0798db05.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::systemHealth
 * @see app/Http/Controllers/Staff/StaffMonitoringController.php:95
 * @route '/staff/system-health'
 */
const systemHealthc40e8f16cfe5bb4db47768509fccfb7e = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: systemHealthc40e8f16cfe5bb4db47768509fccfb7e.url(options),
    method: 'get',
})

systemHealthc40e8f16cfe5bb4db47768509fccfb7e.definition = {
    methods: ["get","head"],
    url: '/staff/system-health',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::systemHealth
 * @see app/Http/Controllers/Staff/StaffMonitoringController.php:95
 * @route '/staff/system-health'
 */
systemHealthc40e8f16cfe5bb4db47768509fccfb7e.url = (options?: RouteQueryOptions) => {
    return systemHealthc40e8f16cfe5bb4db47768509fccfb7e.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::systemHealth
 * @see app/Http/Controllers/Staff/StaffMonitoringController.php:95
 * @route '/staff/system-health'
 */
systemHealthc40e8f16cfe5bb4db47768509fccfb7e.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: systemHealthc40e8f16cfe5bb4db47768509fccfb7e.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Staff\StaffMonitoringController::systemHealth
 * @see app/Http/Controllers/Staff/StaffMonitoringController.php:95
 * @route '/staff/system-health'
 */
systemHealthc40e8f16cfe5bb4db47768509fccfb7e.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: systemHealthc40e8f16cfe5bb4db47768509fccfb7e.url(options),
    method: 'head',
})

export const systemHealth = {
    '/staff/health': systemHealthc41b3ceffe1f259592533bfa0798db05,
    '/staff/system-health': systemHealthc40e8f16cfe5bb4db47768509fccfb7e,
}

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
const StaffMonitoringController = { index, apiPerformance, systemHealth, logs, securityLogs, resolveIssue }

export default StaffMonitoringController