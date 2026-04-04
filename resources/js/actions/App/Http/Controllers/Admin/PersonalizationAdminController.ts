import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::getSystemPersonalizations
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:34
 * @route '/api/admin/system-personalizations'
 */
export const getSystemPersonalizations = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getSystemPersonalizations.url(options),
    method: 'get',
})

getSystemPersonalizations.definition = {
    methods: ["get","head"],
    url: '/api/admin/system-personalizations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::getSystemPersonalizations
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:34
 * @route '/api/admin/system-personalizations'
 */
getSystemPersonalizations.url = (options?: RouteQueryOptions) => {
    return getSystemPersonalizations.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::getSystemPersonalizations
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:34
 * @route '/api/admin/system-personalizations'
 */
getSystemPersonalizations.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getSystemPersonalizations.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::getSystemPersonalizations
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:34
 * @route '/api/admin/system-personalizations'
 */
getSystemPersonalizations.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getSystemPersonalizations.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::createSystemPersonalization
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:76
 * @route '/api/admin/system-personalizations'
 */
export const createSystemPersonalization = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createSystemPersonalization.url(options),
    method: 'post',
})

createSystemPersonalization.definition = {
    methods: ["post"],
    url: '/api/admin/system-personalizations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::createSystemPersonalization
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:76
 * @route '/api/admin/system-personalizations'
 */
createSystemPersonalization.url = (options?: RouteQueryOptions) => {
    return createSystemPersonalization.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::createSystemPersonalization
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:76
 * @route '/api/admin/system-personalizations'
 */
createSystemPersonalization.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createSystemPersonalization.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::updateSystemPersonalization
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:151
 * @route '/api/admin/system-personalizations/{id}'
 */
export const updateSystemPersonalization = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateSystemPersonalization.url(args, options),
    method: 'put',
})

updateSystemPersonalization.definition = {
    methods: ["put"],
    url: '/api/admin/system-personalizations/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::updateSystemPersonalization
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:151
 * @route '/api/admin/system-personalizations/{id}'
 */
updateSystemPersonalization.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateSystemPersonalization.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::updateSystemPersonalization
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:151
 * @route '/api/admin/system-personalizations/{id}'
 */
updateSystemPersonalization.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateSystemPersonalization.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::getTemplates
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:215
 * @route '/api/admin/personalization-templates'
 */
export const getTemplates = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getTemplates.url(options),
    method: 'get',
})

getTemplates.definition = {
    methods: ["get","head"],
    url: '/api/admin/personalization-templates',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::getTemplates
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:215
 * @route '/api/admin/personalization-templates'
 */
getTemplates.url = (options?: RouteQueryOptions) => {
    return getTemplates.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::getTemplates
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:215
 * @route '/api/admin/personalization-templates'
 */
getTemplates.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getTemplates.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::getTemplates
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:215
 * @route '/api/admin/personalization-templates'
 */
getTemplates.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getTemplates.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::createTemplate
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:258
 * @route '/api/admin/personalization-templates'
 */
export const createTemplate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createTemplate.url(options),
    method: 'post',
})

createTemplate.definition = {
    methods: ["post"],
    url: '/api/admin/personalization-templates',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::createTemplate
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:258
 * @route '/api/admin/personalization-templates'
 */
createTemplate.url = (options?: RouteQueryOptions) => {
    return createTemplate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::createTemplate
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:258
 * @route '/api/admin/personalization-templates'
 */
createTemplate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createTemplate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::updateTemplate
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:329
 * @route '/api/admin/personalization-templates/{id}'
 */
export const updateTemplate = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateTemplate.url(args, options),
    method: 'put',
})

updateTemplate.definition = {
    methods: ["put"],
    url: '/api/admin/personalization-templates/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::updateTemplate
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:329
 * @route '/api/admin/personalization-templates/{id}'
 */
updateTemplate.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateTemplate.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::updateTemplate
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:329
 * @route '/api/admin/personalization-templates/{id}'
 */
updateTemplate.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateTemplate.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::deleteTemplate
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:368
 * @route '/api/admin/personalization-templates/{id}'
 */
export const deleteTemplate = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteTemplate.url(args, options),
    method: 'delete',
})

deleteTemplate.definition = {
    methods: ["delete"],
    url: '/api/admin/personalization-templates/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::deleteTemplate
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:368
 * @route '/api/admin/personalization-templates/{id}'
 */
deleteTemplate.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return deleteTemplate.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::deleteTemplate
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:368
 * @route '/api/admin/personalization-templates/{id}'
 */
deleteTemplate.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteTemplate.url(args, options),
    method: 'delete',
})
const PersonalizationAdminController = { getSystemPersonalizations, createSystemPersonalization, updateSystemPersonalization, getTemplates, createTemplate, updateTemplate, deleteTemplate }

export default PersonalizationAdminController