import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
import imageUploadsEc75d9 from './image-uploads'
import users from './users'
import staff from './staff'
import saasOwners from './saas-owners'
import management from './management'
import grokApi from './grok-api'
import prompts from './prompts'
import aiModes from './ai-modes'
import personalizations from './personalizations'
import personalizationTemplates from './personalization-templates'
import subscriptions from './subscriptions'
/**
* @see \App\Http\Controllers\Admin\DashboardController::dashboard
 * @see app/Http/Controllers/Admin/DashboardController.php:20
 * @route '/admin'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/admin',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\DashboardController::dashboard
 * @see app/Http/Controllers/Admin/DashboardController.php:20
 * @route '/admin'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\DashboardController::dashboard
 * @see app/Http/Controllers/Admin/DashboardController.php:20
 * @route '/admin'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\DashboardController::dashboard
 * @see app/Http/Controllers/Admin/DashboardController.php:20
 * @route '/admin'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\DashboardController::imageUploads
 * @see app/Http/Controllers/Admin/DashboardController.php:183
 * @route '/admin/image-uploads'
 */
export const imageUploads = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: imageUploads.url(options),
    method: 'get',
})

imageUploads.definition = {
    methods: ["get","head"],
    url: '/admin/image-uploads',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\DashboardController::imageUploads
 * @see app/Http/Controllers/Admin/DashboardController.php:183
 * @route '/admin/image-uploads'
 */
imageUploads.url = (options?: RouteQueryOptions) => {
    return imageUploads.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\DashboardController::imageUploads
 * @see app/Http/Controllers/Admin/DashboardController.php:183
 * @route '/admin/image-uploads'
 */
imageUploads.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: imageUploads.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\DashboardController::imageUploads
 * @see app/Http/Controllers/Admin/DashboardController.php:183
 * @route '/admin/image-uploads'
 */
imageUploads.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: imageUploads.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\DashboardController::userStats
 * @see app/Http/Controllers/Admin/DashboardController.php:239
 * @route '/admin/user-stats'
 */
export const userStats = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: userStats.url(options),
    method: 'get',
})

userStats.definition = {
    methods: ["get","head"],
    url: '/admin/user-stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\DashboardController::userStats
 * @see app/Http/Controllers/Admin/DashboardController.php:239
 * @route '/admin/user-stats'
 */
userStats.url = (options?: RouteQueryOptions) => {
    return userStats.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\DashboardController::userStats
 * @see app/Http/Controllers/Admin/DashboardController.php:239
 * @route '/admin/user-stats'
 */
userStats.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: userStats.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\DashboardController::userStats
 * @see app/Http/Controllers/Admin/DashboardController.php:239
 * @route '/admin/user-stats'
 */
userStats.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: userStats.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::managementDashboard
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:26
 * @route '/admin/management/dashboard'
 */
export const managementDashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: managementDashboard.url(options),
    method: 'get',
})

managementDashboard.definition = {
    methods: ["get","head"],
    url: '/admin/management/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::managementDashboard
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:26
 * @route '/admin/management/dashboard'
 */
managementDashboard.url = (options?: RouteQueryOptions) => {
    return managementDashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::managementDashboard
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:26
 * @route '/admin/management/dashboard'
 */
managementDashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: managementDashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminDashboardController::managementDashboard
 * @see app/Http/Controllers/Admin/AdminDashboardController.php:26
 * @route '/admin/management/dashboard'
 */
managementDashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: managementDashboard.url(options),
    method: 'head',
})
const admin = {
    dashboard: Object.assign(dashboard, dashboard),
imageUploads: Object.assign(imageUploads, imageUploadsEc75d9),
userStats: Object.assign(userStats, userStats),
users: Object.assign(users, users),
staff: Object.assign(staff, staff),
saasOwners: Object.assign(saasOwners, saasOwners),
managementDashboard: Object.assign(managementDashboard, managementDashboard),
management: Object.assign(management, management),
grokApi: Object.assign(grokApi, grokApi),
prompts: Object.assign(prompts, prompts),
aiModes: Object.assign(aiModes, aiModes),
personalizations: Object.assign(personalizations, personalizations),
personalizationTemplates: Object.assign(personalizationTemplates, personalizationTemplates),
subscriptions: Object.assign(subscriptions, subscriptions),
}

export default admin