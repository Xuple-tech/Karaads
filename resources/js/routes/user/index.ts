import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
import setting from './setting'
import conversations from './conversations'
import developerApi from './developer-api'
import sites from './sites'
import agents from './agents'
import subscriptions from './subscriptions'
import templates from './templates'
import analytics from './analytics'
/**
* @see \App\Http\Controllers\MailController::library
 * @see app/Http/Controllers/MailController.php:33
 * @route '/mails'
 */
export const library = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: library.url(options),
    method: 'get',
})

library.definition = {
    methods: ["get","head"],
    url: '/mails',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MailController::library
 * @see app/Http/Controllers/MailController.php:33
 * @route '/mails'
 */
library.url = (options?: RouteQueryOptions) => {
    return library.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::library
 * @see app/Http/Controllers/MailController.php:33
 * @route '/mails'
 */
library.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: library.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MailController::library
 * @see app/Http/Controllers/MailController.php:33
 * @route '/mails'
 */
library.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: library.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\UserSettingsController::settings
 * @see app/Http/Controllers/User/UserSettingsController.php:18
 * @route '/user/settings'
 */
export const settings = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: settings.url(options),
    method: 'get',
})

settings.definition = {
    methods: ["get","head"],
    url: '/user/settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\UserSettingsController::settings
 * @see app/Http/Controllers/User/UserSettingsController.php:18
 * @route '/user/settings'
 */
settings.url = (options?: RouteQueryOptions) => {
    return settings.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\UserSettingsController::settings
 * @see app/Http/Controllers/User/UserSettingsController.php:18
 * @route '/user/settings'
 */
settings.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: settings.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\UserSettingsController::settings
 * @see app/Http/Controllers/User/UserSettingsController.php:18
 * @route '/user/settings'
 */
settings.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: settings.url(options),
    method: 'head',
})

/**
 * @see routes/user.php:25
 * @route '/user/help'
 */
export const help = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: help.url(options),
    method: 'get',
})

help.definition = {
    methods: ["get","head"],
    url: '/user/help',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/user.php:25
 * @route '/user/help'
 */
help.url = (options?: RouteQueryOptions) => {
    return help.definition.url + queryParams(options)
}

/**
 * @see routes/user.php:25
 * @route '/user/help'
 */
help.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: help.url(options),
    method: 'get',
})
/**
 * @see routes/user.php:25
 * @route '/user/help'
 */
help.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: help.url(options),
    method: 'head',
})

/**
 * @see routes/user.php:30
 * @route '/user/subscription'
 */
export const subscription = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: subscription.url(options),
    method: 'get',
})

subscription.definition = {
    methods: ["get","head"],
    url: '/user/subscription',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/user.php:30
 * @route '/user/subscription'
 */
subscription.url = (options?: RouteQueryOptions) => {
    return subscription.definition.url + queryParams(options)
}

/**
 * @see routes/user.php:30
 * @route '/user/subscription'
 */
subscription.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: subscription.url(options),
    method: 'get',
})
/**
 * @see routes/user.php:30
 * @route '/user/subscription'
 */
subscription.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: subscription.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\DashboardController::dashboard
 * @see app/Http/Controllers/User/DashboardController.php:16
 * @route '/ai-agents/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/ai-agents/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\DashboardController::dashboard
 * @see app/Http/Controllers/User/DashboardController.php:16
 * @route '/ai-agents/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\DashboardController::dashboard
 * @see app/Http/Controllers/User/DashboardController.php:16
 * @route '/ai-agents/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\DashboardController::dashboard
 * @see app/Http/Controllers/User/DashboardController.php:16
 * @route '/ai-agents/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})
const user = {
    setting: Object.assign(setting, setting),
library: Object.assign(library, library),
conversations: Object.assign(conversations, conversations),
settings: Object.assign(settings, settings),
help: Object.assign(help, help),
subscription: Object.assign(subscription, subscription),
developerApi: Object.assign(developerApi, developerApi),
dashboard: Object.assign(dashboard, dashboard),
sites: Object.assign(sites, sites),
agents: Object.assign(agents, agents),
subscriptions: Object.assign(subscriptions, subscriptions),
templates: Object.assign(templates, templates),
analytics: Object.assign(analytics, analytics),
}

export default user