import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::getSystemPersonalizations
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:34
* @route '/api/admin/system-personalizations'
*/
const getSystemPersonalizations7c68a2d9e1f7861bd89c4dabe4cfe62f = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getSystemPersonalizations7c68a2d9e1f7861bd89c4dabe4cfe62f.url(options),
    method: 'get',
})

getSystemPersonalizations7c68a2d9e1f7861bd89c4dabe4cfe62f.definition = {
    methods: ["get","head"],
    url: '/api/admin/system-personalizations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::getSystemPersonalizations
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:34
* @route '/api/admin/system-personalizations'
*/
getSystemPersonalizations7c68a2d9e1f7861bd89c4dabe4cfe62f.url = (options?: RouteQueryOptions) => {
    return getSystemPersonalizations7c68a2d9e1f7861bd89c4dabe4cfe62f.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::getSystemPersonalizations
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:34
* @route '/api/admin/system-personalizations'
*/
getSystemPersonalizations7c68a2d9e1f7861bd89c4dabe4cfe62f.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getSystemPersonalizations7c68a2d9e1f7861bd89c4dabe4cfe62f.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::getSystemPersonalizations
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:34
* @route '/api/admin/system-personalizations'
*/
getSystemPersonalizations7c68a2d9e1f7861bd89c4dabe4cfe62f.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getSystemPersonalizations7c68a2d9e1f7861bd89c4dabe4cfe62f.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::getSystemPersonalizations
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:34
* @route '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/list/x6z9a2s5'
*/
const getSystemPersonalizations2c53d7c00617630ae1e70dc99ec59c58 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getSystemPersonalizations2c53d7c00617630ae1e70dc99ec59c58.url(options),
    method: 'get',
})

getSystemPersonalizations2c53d7c00617630ae1e70dc99ec59c58.definition = {
    methods: ["get","head"],
    url: '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/list/x6z9a2s5',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::getSystemPersonalizations
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:34
* @route '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/list/x6z9a2s5'
*/
getSystemPersonalizations2c53d7c00617630ae1e70dc99ec59c58.url = (options?: RouteQueryOptions) => {
    return getSystemPersonalizations2c53d7c00617630ae1e70dc99ec59c58.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::getSystemPersonalizations
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:34
* @route '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/list/x6z9a2s5'
*/
getSystemPersonalizations2c53d7c00617630ae1e70dc99ec59c58.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getSystemPersonalizations2c53d7c00617630ae1e70dc99ec59c58.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::getSystemPersonalizations
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:34
* @route '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/list/x6z9a2s5'
*/
getSystemPersonalizations2c53d7c00617630ae1e70dc99ec59c58.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getSystemPersonalizations2c53d7c00617630ae1e70dc99ec59c58.url(options),
    method: 'head',
})

export const getSystemPersonalizations = {
    '/api/admin/system-personalizations': getSystemPersonalizations7c68a2d9e1f7861bd89c4dabe4cfe62f,
    '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/list/x6z9a2s5': getSystemPersonalizations2c53d7c00617630ae1e70dc99ec59c58,
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::createSystemPersonalization
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:76
* @route '/api/admin/system-personalizations'
*/
const createSystemPersonalization7c68a2d9e1f7861bd89c4dabe4cfe62f = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createSystemPersonalization7c68a2d9e1f7861bd89c4dabe4cfe62f.url(options),
    method: 'post',
})

createSystemPersonalization7c68a2d9e1f7861bd89c4dabe4cfe62f.definition = {
    methods: ["post"],
    url: '/api/admin/system-personalizations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::createSystemPersonalization
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:76
* @route '/api/admin/system-personalizations'
*/
createSystemPersonalization7c68a2d9e1f7861bd89c4dabe4cfe62f.url = (options?: RouteQueryOptions) => {
    return createSystemPersonalization7c68a2d9e1f7861bd89c4dabe4cfe62f.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::createSystemPersonalization
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:76
* @route '/api/admin/system-personalizations'
*/
createSystemPersonalization7c68a2d9e1f7861bd89c4dabe4cfe62f.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createSystemPersonalization7c68a2d9e1f7861bd89c4dabe4cfe62f.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::createSystemPersonalization
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:76
* @route '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/create/m8k1j4h7'
*/
const createSystemPersonalizationf1b6660ea1d4f01d4186e46b2f3fc89c = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createSystemPersonalizationf1b6660ea1d4f01d4186e46b2f3fc89c.url(options),
    method: 'post',
})

createSystemPersonalizationf1b6660ea1d4f01d4186e46b2f3fc89c.definition = {
    methods: ["post"],
    url: '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/create/m8k1j4h7',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::createSystemPersonalization
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:76
* @route '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/create/m8k1j4h7'
*/
createSystemPersonalizationf1b6660ea1d4f01d4186e46b2f3fc89c.url = (options?: RouteQueryOptions) => {
    return createSystemPersonalizationf1b6660ea1d4f01d4186e46b2f3fc89c.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::createSystemPersonalization
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:76
* @route '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/create/m8k1j4h7'
*/
createSystemPersonalizationf1b6660ea1d4f01d4186e46b2f3fc89c.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createSystemPersonalizationf1b6660ea1d4f01d4186e46b2f3fc89c.url(options),
    method: 'post',
})

export const createSystemPersonalization = {
    '/api/admin/system-personalizations': createSystemPersonalization7c68a2d9e1f7861bd89c4dabe4cfe62f,
    '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/create/m8k1j4h7': createSystemPersonalizationf1b6660ea1d4f01d4186e46b2f3fc89c,
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::updateSystemPersonalization
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:151
* @route '/api/admin/system-personalizations/{id}'
*/
const updateSystemPersonalization3aea192bb0f425a1c4d831f8e12fd06d = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateSystemPersonalization3aea192bb0f425a1c4d831f8e12fd06d.url(args, options),
    method: 'put',
})

updateSystemPersonalization3aea192bb0f425a1c4d831f8e12fd06d.definition = {
    methods: ["put"],
    url: '/api/admin/system-personalizations/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::updateSystemPersonalization
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:151
* @route '/api/admin/system-personalizations/{id}'
*/
updateSystemPersonalization3aea192bb0f425a1c4d831f8e12fd06d.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateSystemPersonalization3aea192bb0f425a1c4d831f8e12fd06d.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::updateSystemPersonalization
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:151
* @route '/api/admin/system-personalizations/{id}'
*/
updateSystemPersonalization3aea192bb0f425a1c4d831f8e12fd06d.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateSystemPersonalization3aea192bb0f425a1c4d831f8e12fd06d.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::updateSystemPersonalization
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:151
* @route '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/update/{uuid}/g0f3d6s9'
*/
const updateSystemPersonalizationf6716480db6ebee2ffc89c4132cdbcb7 = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateSystemPersonalizationf6716480db6ebee2ffc89c4132cdbcb7.url(args, options),
    method: 'put',
})

updateSystemPersonalizationf6716480db6ebee2ffc89c4132cdbcb7.definition = {
    methods: ["put"],
    url: '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/update/{uuid}/g0f3d6s9',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::updateSystemPersonalization
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:151
* @route '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/update/{uuid}/g0f3d6s9'
*/
updateSystemPersonalizationf6716480db6ebee2ffc89c4132cdbcb7.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { uuid: args }
    }

    if (Array.isArray(args)) {
        args = {
            uuid: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        uuid: args.uuid,
    }

    return updateSystemPersonalizationf6716480db6ebee2ffc89c4132cdbcb7.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::updateSystemPersonalization
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:151
* @route '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/update/{uuid}/g0f3d6s9'
*/
updateSystemPersonalizationf6716480db6ebee2ffc89c4132cdbcb7.put = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateSystemPersonalizationf6716480db6ebee2ffc89c4132cdbcb7.url(args, options),
    method: 'put',
})

export const updateSystemPersonalization = {
    '/api/admin/system-personalizations/{id}': updateSystemPersonalization3aea192bb0f425a1c4d831f8e12fd06d,
    '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/update/{uuid}/g0f3d6s9': updateSystemPersonalizationf6716480db6ebee2ffc89c4132cdbcb7,
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::getTemplates
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:215
* @route '/api/admin/personalization-templates'
*/
const getTemplates24020a5c99fdf1f60e8402b88ad17206 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getTemplates24020a5c99fdf1f60e8402b88ad17206.url(options),
    method: 'get',
})

getTemplates24020a5c99fdf1f60e8402b88ad17206.definition = {
    methods: ["get","head"],
    url: '/api/admin/personalization-templates',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::getTemplates
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:215
* @route '/api/admin/personalization-templates'
*/
getTemplates24020a5c99fdf1f60e8402b88ad17206.url = (options?: RouteQueryOptions) => {
    return getTemplates24020a5c99fdf1f60e8402b88ad17206.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::getTemplates
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:215
* @route '/api/admin/personalization-templates'
*/
getTemplates24020a5c99fdf1f60e8402b88ad17206.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getTemplates24020a5c99fdf1f60e8402b88ad17206.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::getTemplates
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:215
* @route '/api/admin/personalization-templates'
*/
getTemplates24020a5c99fdf1f60e8402b88ad17206.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getTemplates24020a5c99fdf1f60e8402b88ad17206.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::getTemplates
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:215
* @route '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/list/t4y7u0i3'
*/
const getTemplates24b15585a36d47821cf1084d10c8b204 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getTemplates24b15585a36d47821cf1084d10c8b204.url(options),
    method: 'get',
})

getTemplates24b15585a36d47821cf1084d10c8b204.definition = {
    methods: ["get","head"],
    url: '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/list/t4y7u0i3',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::getTemplates
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:215
* @route '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/list/t4y7u0i3'
*/
getTemplates24b15585a36d47821cf1084d10c8b204.url = (options?: RouteQueryOptions) => {
    return getTemplates24b15585a36d47821cf1084d10c8b204.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::getTemplates
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:215
* @route '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/list/t4y7u0i3'
*/
getTemplates24b15585a36d47821cf1084d10c8b204.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getTemplates24b15585a36d47821cf1084d10c8b204.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::getTemplates
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:215
* @route '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/list/t4y7u0i3'
*/
getTemplates24b15585a36d47821cf1084d10c8b204.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getTemplates24b15585a36d47821cf1084d10c8b204.url(options),
    method: 'head',
})

export const getTemplates = {
    '/api/admin/personalization-templates': getTemplates24020a5c99fdf1f60e8402b88ad17206,
    '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/list/t4y7u0i3': getTemplates24b15585a36d47821cf1084d10c8b204,
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::createTemplate
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:258
* @route '/api/admin/personalization-templates'
*/
const createTemplate24020a5c99fdf1f60e8402b88ad17206 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createTemplate24020a5c99fdf1f60e8402b88ad17206.url(options),
    method: 'post',
})

createTemplate24020a5c99fdf1f60e8402b88ad17206.definition = {
    methods: ["post"],
    url: '/api/admin/personalization-templates',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::createTemplate
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:258
* @route '/api/admin/personalization-templates'
*/
createTemplate24020a5c99fdf1f60e8402b88ad17206.url = (options?: RouteQueryOptions) => {
    return createTemplate24020a5c99fdf1f60e8402b88ad17206.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::createTemplate
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:258
* @route '/api/admin/personalization-templates'
*/
createTemplate24020a5c99fdf1f60e8402b88ad17206.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createTemplate24020a5c99fdf1f60e8402b88ad17206.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::createTemplate
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:258
* @route '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/create/p6a9s2d5'
*/
const createTemplatec3224002fb9dd72b29c7a9471e94f96b = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createTemplatec3224002fb9dd72b29c7a9471e94f96b.url(options),
    method: 'post',
})

createTemplatec3224002fb9dd72b29c7a9471e94f96b.definition = {
    methods: ["post"],
    url: '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/create/p6a9s2d5',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::createTemplate
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:258
* @route '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/create/p6a9s2d5'
*/
createTemplatec3224002fb9dd72b29c7a9471e94f96b.url = (options?: RouteQueryOptions) => {
    return createTemplatec3224002fb9dd72b29c7a9471e94f96b.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::createTemplate
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:258
* @route '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/create/p6a9s2d5'
*/
createTemplatec3224002fb9dd72b29c7a9471e94f96b.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createTemplatec3224002fb9dd72b29c7a9471e94f96b.url(options),
    method: 'post',
})

export const createTemplate = {
    '/api/admin/personalization-templates': createTemplate24020a5c99fdf1f60e8402b88ad17206,
    '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/create/p6a9s2d5': createTemplatec3224002fb9dd72b29c7a9471e94f96b,
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::updateTemplate
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:329
* @route '/api/admin/personalization-templates/{id}'
*/
const updateTemplate5f1493536ca3ff2c7d07326f0ca2f039 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateTemplate5f1493536ca3ff2c7d07326f0ca2f039.url(args, options),
    method: 'put',
})

updateTemplate5f1493536ca3ff2c7d07326f0ca2f039.definition = {
    methods: ["put"],
    url: '/api/admin/personalization-templates/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::updateTemplate
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:329
* @route '/api/admin/personalization-templates/{id}'
*/
updateTemplate5f1493536ca3ff2c7d07326f0ca2f039.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateTemplate5f1493536ca3ff2c7d07326f0ca2f039.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::updateTemplate
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:329
* @route '/api/admin/personalization-templates/{id}'
*/
updateTemplate5f1493536ca3ff2c7d07326f0ca2f039.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateTemplate5f1493536ca3ff2c7d07326f0ca2f039.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::updateTemplate
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:329
* @route '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/update/{uuid}/l8z1x4c7'
*/
const updateTemplate4beb01a1ce18b808a5071ec0da933803 = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateTemplate4beb01a1ce18b808a5071ec0da933803.url(args, options),
    method: 'put',
})

updateTemplate4beb01a1ce18b808a5071ec0da933803.definition = {
    methods: ["put"],
    url: '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/update/{uuid}/l8z1x4c7',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::updateTemplate
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:329
* @route '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/update/{uuid}/l8z1x4c7'
*/
updateTemplate4beb01a1ce18b808a5071ec0da933803.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { uuid: args }
    }

    if (Array.isArray(args)) {
        args = {
            uuid: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        uuid: args.uuid,
    }

    return updateTemplate4beb01a1ce18b808a5071ec0da933803.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::updateTemplate
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:329
* @route '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/update/{uuid}/l8z1x4c7'
*/
updateTemplate4beb01a1ce18b808a5071ec0da933803.put = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateTemplate4beb01a1ce18b808a5071ec0da933803.url(args, options),
    method: 'put',
})

export const updateTemplate = {
    '/api/admin/personalization-templates/{id}': updateTemplate5f1493536ca3ff2c7d07326f0ca2f039,
    '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/update/{uuid}/l8z1x4c7': updateTemplate4beb01a1ce18b808a5071ec0da933803,
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::deleteTemplate
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:368
* @route '/api/admin/personalization-templates/{id}'
*/
const deleteTemplate5f1493536ca3ff2c7d07326f0ca2f039 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteTemplate5f1493536ca3ff2c7d07326f0ca2f039.url(args, options),
    method: 'delete',
})

deleteTemplate5f1493536ca3ff2c7d07326f0ca2f039.definition = {
    methods: ["delete"],
    url: '/api/admin/personalization-templates/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::deleteTemplate
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:368
* @route '/api/admin/personalization-templates/{id}'
*/
deleteTemplate5f1493536ca3ff2c7d07326f0ca2f039.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return deleteTemplate5f1493536ca3ff2c7d07326f0ca2f039.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::deleteTemplate
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:368
* @route '/api/admin/personalization-templates/{id}'
*/
deleteTemplate5f1493536ca3ff2c7d07326f0ca2f039.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteTemplate5f1493536ca3ff2c7d07326f0ca2f039.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::deleteTemplate
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:368
* @route '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/delete/{uuid}/v0b3n6m9'
*/
const deleteTemplateb1c8ffa5132c557c69e72e9a0c883208 = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteTemplateb1c8ffa5132c557c69e72e9a0c883208.url(args, options),
    method: 'delete',
})

deleteTemplateb1c8ffa5132c557c69e72e9a0c883208.definition = {
    methods: ["delete"],
    url: '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/delete/{uuid}/v0b3n6m9',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::deleteTemplate
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:368
* @route '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/delete/{uuid}/v0b3n6m9'
*/
deleteTemplateb1c8ffa5132c557c69e72e9a0c883208.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { uuid: args }
    }

    if (Array.isArray(args)) {
        args = {
            uuid: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        uuid: args.uuid,
    }

    return deleteTemplateb1c8ffa5132c557c69e72e9a0c883208.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::deleteTemplate
* @see app/Http/Controllers/Admin/PersonalizationAdminController.php:368
* @route '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/delete/{uuid}/v0b3n6m9'
*/
deleteTemplateb1c8ffa5132c557c69e72e9a0c883208.delete = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteTemplateb1c8ffa5132c557c69e72e9a0c883208.url(args, options),
    method: 'delete',
})

export const deleteTemplate = {
    '/api/admin/personalization-templates/{id}': deleteTemplate5f1493536ca3ff2c7d07326f0ca2f039,
    '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/delete/{uuid}/v0b3n6m9': deleteTemplateb1c8ffa5132c557c69e72e9a0c883208,
}

const PersonalizationAdminController = { getSystemPersonalizations, createSystemPersonalization, updateSystemPersonalization, getTemplates, createTemplate, updateTemplate, deleteTemplate }

export default PersonalizationAdminController