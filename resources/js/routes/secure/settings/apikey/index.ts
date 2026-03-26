import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\SettingsController::status
 * @see app/Http/Controllers/Api/SettingsController.php:162
 * @route '/api/settings/mgmt/r4t7y0u3/apikeys/status/{type}/{uuid}/l8z1x4c7'
 */
export const status = (args: { type: string | number, uuid: string | number } | [type: string | number, uuid: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: status.url(args, options),
    method: 'put',
})

status.definition = {
    methods: ["put"],
    url: '/api/settings/mgmt/r4t7y0u3/apikeys/status/{type}/{uuid}/l8z1x4c7',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\SettingsController::status
 * @see app/Http/Controllers/Api/SettingsController.php:162
 * @route '/api/settings/mgmt/r4t7y0u3/apikeys/status/{type}/{uuid}/l8z1x4c7'
 */
status.url = (args: { type: string | number, uuid: string | number } | [type: string | number, uuid: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    type: args[0],
                    uuid: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        type: args.type,
                                uuid: args.uuid,
                }

    return status.definition.url
            .replace('{type}', parsedArgs.type.toString())
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SettingsController::status
 * @see app/Http/Controllers/Api/SettingsController.php:162
 * @route '/api/settings/mgmt/r4t7y0u3/apikeys/status/{type}/{uuid}/l8z1x4c7'
 */
status.put = (args: { type: string | number, uuid: string | number } | [type: string | number, uuid: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: status.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\SettingsController::deleteMethod
 * @see app/Http/Controllers/Api/SettingsController.php:191
 * @route '/api/settings/mgmt/r4t7y0u3/apikeys/delete/{type}/{uuid}/v0b3n6m9'
 */
export const deleteMethod = (args: { type: string | number, uuid: string | number } | [type: string | number, uuid: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/api/settings/mgmt/r4t7y0u3/apikeys/delete/{type}/{uuid}/v0b3n6m9',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\SettingsController::deleteMethod
 * @see app/Http/Controllers/Api/SettingsController.php:191
 * @route '/api/settings/mgmt/r4t7y0u3/apikeys/delete/{type}/{uuid}/v0b3n6m9'
 */
deleteMethod.url = (args: { type: string | number, uuid: string | number } | [type: string | number, uuid: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    type: args[0],
                    uuid: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        type: args.type,
                                uuid: args.uuid,
                }

    return deleteMethod.definition.url
            .replace('{type}', parsedArgs.type.toString())
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SettingsController::deleteMethod
 * @see app/Http/Controllers/Api/SettingsController.php:191
 * @route '/api/settings/mgmt/r4t7y0u3/apikeys/delete/{type}/{uuid}/v0b3n6m9'
 */
deleteMethod.delete = (args: { type: string | number, uuid: string | number } | [type: string | number, uuid: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})
const apikey = {
    status: Object.assign(status, status),
delete: Object.assign(deleteMethod, deleteMethod),
}

export default apikey