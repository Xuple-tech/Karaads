import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\PersonalizationController::indexPersonalizations
* @see app/Http/Controllers/Admin/PersonalizationController.php:24
* @route '/admin/personalizations'
*/
export const indexPersonalizations = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexPersonalizations.url(options),
    method: 'get',
})

indexPersonalizations.definition = {
    methods: ["get","head"],
    url: '/admin/personalizations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::indexPersonalizations
* @see app/Http/Controllers/Admin/PersonalizationController.php:24
* @route '/admin/personalizations'
*/
indexPersonalizations.url = (options?: RouteQueryOptions) => {
    return indexPersonalizations.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::indexPersonalizations
* @see app/Http/Controllers/Admin/PersonalizationController.php:24
* @route '/admin/personalizations'
*/
indexPersonalizations.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexPersonalizations.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::indexPersonalizations
* @see app/Http/Controllers/Admin/PersonalizationController.php:24
* @route '/admin/personalizations'
*/
indexPersonalizations.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexPersonalizations.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::createPersonalization
* @see app/Http/Controllers/Admin/PersonalizationController.php:58
* @route '/admin/personalizations/create'
*/
export const createPersonalization = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: createPersonalization.url(options),
    method: 'get',
})

createPersonalization.definition = {
    methods: ["get","head"],
    url: '/admin/personalizations/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::createPersonalization
* @see app/Http/Controllers/Admin/PersonalizationController.php:58
* @route '/admin/personalizations/create'
*/
createPersonalization.url = (options?: RouteQueryOptions) => {
    return createPersonalization.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::createPersonalization
* @see app/Http/Controllers/Admin/PersonalizationController.php:58
* @route '/admin/personalizations/create'
*/
createPersonalization.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: createPersonalization.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::createPersonalization
* @see app/Http/Controllers/Admin/PersonalizationController.php:58
* @route '/admin/personalizations/create'
*/
createPersonalization.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: createPersonalization.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::storePersonalization
* @see app/Http/Controllers/Admin/PersonalizationController.php:66
* @route '/admin/personalizations'
*/
export const storePersonalization = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storePersonalization.url(options),
    method: 'post',
})

storePersonalization.definition = {
    methods: ["post"],
    url: '/admin/personalizations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::storePersonalization
* @see app/Http/Controllers/Admin/PersonalizationController.php:66
* @route '/admin/personalizations'
*/
storePersonalization.url = (options?: RouteQueryOptions) => {
    return storePersonalization.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::storePersonalization
* @see app/Http/Controllers/Admin/PersonalizationController.php:66
* @route '/admin/personalizations'
*/
storePersonalization.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storePersonalization.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::editPersonalization
* @see app/Http/Controllers/Admin/PersonalizationController.php:97
* @route '/admin/personalizations/{personalization}'
*/
export const editPersonalization = (args: { personalization: string | { id: string } } | [personalization: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: editPersonalization.url(args, options),
    method: 'get',
})

editPersonalization.definition = {
    methods: ["get","head"],
    url: '/admin/personalizations/{personalization}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::editPersonalization
* @see app/Http/Controllers/Admin/PersonalizationController.php:97
* @route '/admin/personalizations/{personalization}'
*/
editPersonalization.url = (args: { personalization: string | { id: string } } | [personalization: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { personalization: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { personalization: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            personalization: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        personalization: typeof args.personalization === 'object'
        ? args.personalization.id
        : args.personalization,
    }

    return editPersonalization.definition.url
            .replace('{personalization}', parsedArgs.personalization.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::editPersonalization
* @see app/Http/Controllers/Admin/PersonalizationController.php:97
* @route '/admin/personalizations/{personalization}'
*/
editPersonalization.get = (args: { personalization: string | { id: string } } | [personalization: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: editPersonalization.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::editPersonalization
* @see app/Http/Controllers/Admin/PersonalizationController.php:97
* @route '/admin/personalizations/{personalization}'
*/
editPersonalization.head = (args: { personalization: string | { id: string } } | [personalization: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: editPersonalization.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::updatePersonalization
* @see app/Http/Controllers/Admin/PersonalizationController.php:107
* @route '/admin/personalizations/{personalization}'
*/
export const updatePersonalization = (args: { personalization: string | { id: string } } | [personalization: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePersonalization.url(args, options),
    method: 'put',
})

updatePersonalization.definition = {
    methods: ["put"],
    url: '/admin/personalizations/{personalization}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::updatePersonalization
* @see app/Http/Controllers/Admin/PersonalizationController.php:107
* @route '/admin/personalizations/{personalization}'
*/
updatePersonalization.url = (args: { personalization: string | { id: string } } | [personalization: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { personalization: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { personalization: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            personalization: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        personalization: typeof args.personalization === 'object'
        ? args.personalization.id
        : args.personalization,
    }

    return updatePersonalization.definition.url
            .replace('{personalization}', parsedArgs.personalization.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::updatePersonalization
* @see app/Http/Controllers/Admin/PersonalizationController.php:107
* @route '/admin/personalizations/{personalization}'
*/
updatePersonalization.put = (args: { personalization: string | { id: string } } | [personalization: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePersonalization.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::destroyPersonalization
* @see app/Http/Controllers/Admin/PersonalizationController.php:158
* @route '/admin/personalizations/{personalization}'
*/
export const destroyPersonalization = (args: { personalization: string | { id: string } } | [personalization: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyPersonalization.url(args, options),
    method: 'delete',
})

destroyPersonalization.definition = {
    methods: ["delete"],
    url: '/admin/personalizations/{personalization}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::destroyPersonalization
* @see app/Http/Controllers/Admin/PersonalizationController.php:158
* @route '/admin/personalizations/{personalization}'
*/
destroyPersonalization.url = (args: { personalization: string | { id: string } } | [personalization: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { personalization: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { personalization: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            personalization: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        personalization: typeof args.personalization === 'object'
        ? args.personalization.id
        : args.personalization,
    }

    return destroyPersonalization.definition.url
            .replace('{personalization}', parsedArgs.personalization.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::destroyPersonalization
* @see app/Http/Controllers/Admin/PersonalizationController.php:158
* @route '/admin/personalizations/{personalization}'
*/
destroyPersonalization.delete = (args: { personalization: string | { id: string } } | [personalization: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyPersonalization.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::indexTemplates
* @see app/Http/Controllers/Admin/PersonalizationController.php:179
* @route '/admin/personalization-templates'
*/
export const indexTemplates = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexTemplates.url(options),
    method: 'get',
})

indexTemplates.definition = {
    methods: ["get","head"],
    url: '/admin/personalization-templates',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::indexTemplates
* @see app/Http/Controllers/Admin/PersonalizationController.php:179
* @route '/admin/personalization-templates'
*/
indexTemplates.url = (options?: RouteQueryOptions) => {
    return indexTemplates.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::indexTemplates
* @see app/Http/Controllers/Admin/PersonalizationController.php:179
* @route '/admin/personalization-templates'
*/
indexTemplates.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexTemplates.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::indexTemplates
* @see app/Http/Controllers/Admin/PersonalizationController.php:179
* @route '/admin/personalization-templates'
*/
indexTemplates.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexTemplates.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::createTemplate
* @see app/Http/Controllers/Admin/PersonalizationController.php:224
* @route '/admin/personalization-templates/create'
*/
export const createTemplate = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: createTemplate.url(options),
    method: 'get',
})

createTemplate.definition = {
    methods: ["get","head"],
    url: '/admin/personalization-templates/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::createTemplate
* @see app/Http/Controllers/Admin/PersonalizationController.php:224
* @route '/admin/personalization-templates/create'
*/
createTemplate.url = (options?: RouteQueryOptions) => {
    return createTemplate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::createTemplate
* @see app/Http/Controllers/Admin/PersonalizationController.php:224
* @route '/admin/personalization-templates/create'
*/
createTemplate.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: createTemplate.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::createTemplate
* @see app/Http/Controllers/Admin/PersonalizationController.php:224
* @route '/admin/personalization-templates/create'
*/
createTemplate.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: createTemplate.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::storeTemplate
* @see app/Http/Controllers/Admin/PersonalizationController.php:238
* @route '/admin/personalization-templates'
*/
export const storeTemplate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeTemplate.url(options),
    method: 'post',
})

storeTemplate.definition = {
    methods: ["post"],
    url: '/admin/personalization-templates',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::storeTemplate
* @see app/Http/Controllers/Admin/PersonalizationController.php:238
* @route '/admin/personalization-templates'
*/
storeTemplate.url = (options?: RouteQueryOptions) => {
    return storeTemplate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::storeTemplate
* @see app/Http/Controllers/Admin/PersonalizationController.php:238
* @route '/admin/personalization-templates'
*/
storeTemplate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeTemplate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::editTemplate
* @see app/Http/Controllers/Admin/PersonalizationController.php:293
* @route '/admin/personalization-templates/{template}'
*/
export const editTemplate = (args: { template: string | { id: string } } | [template: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: editTemplate.url(args, options),
    method: 'get',
})

editTemplate.definition = {
    methods: ["get","head"],
    url: '/admin/personalization-templates/{template}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::editTemplate
* @see app/Http/Controllers/Admin/PersonalizationController.php:293
* @route '/admin/personalization-templates/{template}'
*/
editTemplate.url = (args: { template: string | { id: string } } | [template: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { template: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { template: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            template: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        template: typeof args.template === 'object'
        ? args.template.id
        : args.template,
    }

    return editTemplate.definition.url
            .replace('{template}', parsedArgs.template.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::editTemplate
* @see app/Http/Controllers/Admin/PersonalizationController.php:293
* @route '/admin/personalization-templates/{template}'
*/
editTemplate.get = (args: { template: string | { id: string } } | [template: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: editTemplate.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::editTemplate
* @see app/Http/Controllers/Admin/PersonalizationController.php:293
* @route '/admin/personalization-templates/{template}'
*/
editTemplate.head = (args: { template: string | { id: string } } | [template: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: editTemplate.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::updateTemplate
* @see app/Http/Controllers/Admin/PersonalizationController.php:308
* @route '/admin/personalization-templates/{template}'
*/
export const updateTemplate = (args: { template: string | { id: string } } | [template: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateTemplate.url(args, options),
    method: 'put',
})

updateTemplate.definition = {
    methods: ["put"],
    url: '/admin/personalization-templates/{template}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::updateTemplate
* @see app/Http/Controllers/Admin/PersonalizationController.php:308
* @route '/admin/personalization-templates/{template}'
*/
updateTemplate.url = (args: { template: string | { id: string } } | [template: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { template: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { template: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            template: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        template: typeof args.template === 'object'
        ? args.template.id
        : args.template,
    }

    return updateTemplate.definition.url
            .replace('{template}', parsedArgs.template.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::updateTemplate
* @see app/Http/Controllers/Admin/PersonalizationController.php:308
* @route '/admin/personalization-templates/{template}'
*/
updateTemplate.put = (args: { template: string | { id: string } } | [template: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateTemplate.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::destroyTemplate
* @see app/Http/Controllers/Admin/PersonalizationController.php:362
* @route '/admin/personalization-templates/{template}'
*/
export const destroyTemplate = (args: { template: string | { id: string } } | [template: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyTemplate.url(args, options),
    method: 'delete',
})

destroyTemplate.definition = {
    methods: ["delete"],
    url: '/admin/personalization-templates/{template}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::destroyTemplate
* @see app/Http/Controllers/Admin/PersonalizationController.php:362
* @route '/admin/personalization-templates/{template}'
*/
destroyTemplate.url = (args: { template: string | { id: string } } | [template: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { template: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { template: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            template: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        template: typeof args.template === 'object'
        ? args.template.id
        : args.template,
    }

    return destroyTemplate.definition.url
            .replace('{template}', parsedArgs.template.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::destroyTemplate
* @see app/Http/Controllers/Admin/PersonalizationController.php:362
* @route '/admin/personalization-templates/{template}'
*/
destroyTemplate.delete = (args: { template: string | { id: string } } | [template: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyTemplate.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::statistics
* @see app/Http/Controllers/Admin/PersonalizationController.php:373
* @route '/admin/personalization-templates/statistics'
*/
export const statistics = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: statistics.url(options),
    method: 'get',
})

statistics.definition = {
    methods: ["get","head"],
    url: '/admin/personalization-templates/statistics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::statistics
* @see app/Http/Controllers/Admin/PersonalizationController.php:373
* @route '/admin/personalization-templates/statistics'
*/
statistics.url = (options?: RouteQueryOptions) => {
    return statistics.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::statistics
* @see app/Http/Controllers/Admin/PersonalizationController.php:373
* @route '/admin/personalization-templates/statistics'
*/
statistics.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: statistics.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::statistics
* @see app/Http/Controllers/Admin/PersonalizationController.php:373
* @route '/admin/personalization-templates/statistics'
*/
statistics.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: statistics.url(options),
    method: 'head',
})

const PersonalizationController = { indexPersonalizations, createPersonalization, storePersonalization, editPersonalization, updatePersonalization, destroyPersonalization, indexTemplates, createTemplate, storeTemplate, editTemplate, updateTemplate, destroyTemplate, statistics }

export default PersonalizationController