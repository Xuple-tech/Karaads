import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ProjectController::show
* @see app/Http/Controllers/ProjectController.php:116
* @route '/projects/{project}'
*/
export const show = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/projects/{project}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectController::show
* @see app/Http/Controllers/ProjectController.php:116
* @route '/projects/{project}'
*/
show.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { project: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            project: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: typeof args.project === 'object'
        ? args.project.id
        : args.project,
    }

    return show.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::show
* @see app/Http/Controllers/ProjectController.php:116
* @route '/projects/{project}'
*/
show.get = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProjectController::show
* @see app/Http/Controllers/ProjectController.php:116
* @route '/projects/{project}'
*/
show.head = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectController::edit
* @see app/Http/Controllers/ProjectController.php:133
* @route '/projects/{project}/edit'
*/
export const edit = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectController::edit
* @see app/Http/Controllers/ProjectController.php:133
* @route '/projects/{project}/edit'
*/
edit.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { project: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            project: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: typeof args.project === 'object'
        ? args.project.id
        : args.project,
    }

    return edit.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::edit
* @see app/Http/Controllers/ProjectController.php:133
* @route '/projects/{project}/edit'
*/
edit.get = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProjectController::edit
* @see app/Http/Controllers/ProjectController.php:133
* @route '/projects/{project}/edit'
*/
edit.head = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectController::update
* @see app/Http/Controllers/ProjectController.php:148
* @route '/projects/{project}'
*/
export const update = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/projects/{project}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ProjectController::update
* @see app/Http/Controllers/ProjectController.php:148
* @route '/projects/{project}'
*/
update.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { project: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            project: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: typeof args.project === 'object'
        ? args.project.id
        : args.project,
    }

    return update.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::update
* @see app/Http/Controllers/ProjectController.php:148
* @route '/projects/{project}'
*/
update.put = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ProjectController::destroy
* @see app/Http/Controllers/ProjectController.php:175
* @route '/projects/{project}'
*/
export const destroy = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/projects/{project}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ProjectController::destroy
* @see app/Http/Controllers/ProjectController.php:175
* @route '/projects/{project}'
*/
destroy.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { project: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            project: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: typeof args.project === 'object'
        ? args.project.id
        : args.project,
    }

    return destroy.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::destroy
* @see app/Http/Controllers/ProjectController.php:175
* @route '/projects/{project}'
*/
destroy.delete = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ProjectController::dashboard
* @see app/Http/Controllers/ProjectController.php:78
* @route '/projects/{project}/dashboard'
*/
export const dashboard = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(args, options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectController::dashboard
* @see app/Http/Controllers/ProjectController.php:78
* @route '/projects/{project}/dashboard'
*/
dashboard.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { project: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            project: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: typeof args.project === 'object'
        ? args.project.id
        : args.project,
    }

    return dashboard.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::dashboard
* @see app/Http/Controllers/ProjectController.php:78
* @route '/projects/{project}/dashboard'
*/
dashboard.get = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProjectController::dashboard
* @see app/Http/Controllers/ProjectController.php:78
* @route '/projects/{project}/dashboard'
*/
dashboard.head = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectController::updateSettings
* @see app/Http/Controllers/ProjectController.php:208
* @route '/projects/{project}/settings'
*/
export const updateSettings = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateSettings.url(args, options),
    method: 'put',
})

updateSettings.definition = {
    methods: ["put"],
    url: '/projects/{project}/settings',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ProjectController::updateSettings
* @see app/Http/Controllers/ProjectController.php:208
* @route '/projects/{project}/settings'
*/
updateSettings.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { project: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            project: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: typeof args.project === 'object'
        ? args.project.id
        : args.project,
    }

    return updateSettings.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::updateSettings
* @see app/Http/Controllers/ProjectController.php:208
* @route '/projects/{project}/settings'
*/
updateSettings.put = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateSettings.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ProjectController::files
* @see app/Http/Controllers/ProjectController.php:577
* @route '/projects/{project}/files'
*/
export const files = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: files.url(args, options),
    method: 'get',
})

files.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/files',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectController::files
* @see app/Http/Controllers/ProjectController.php:577
* @route '/projects/{project}/files'
*/
files.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { project: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            project: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: typeof args.project === 'object'
        ? args.project.id
        : args.project,
    }

    return files.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::files
* @see app/Http/Controllers/ProjectController.php:577
* @route '/projects/{project}/files'
*/
files.get = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: files.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProjectController::files
* @see app/Http/Controllers/ProjectController.php:577
* @route '/projects/{project}/files'
*/
files.head = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: files.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectController::uploadFiles
* @see app/Http/Controllers/ProjectController.php:604
* @route '/projects/{project}/files/upload'
*/
export const uploadFiles = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uploadFiles.url(args, options),
    method: 'post',
})

uploadFiles.definition = {
    methods: ["post"],
    url: '/projects/{project}/files/upload',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectController::uploadFiles
* @see app/Http/Controllers/ProjectController.php:604
* @route '/projects/{project}/files/upload'
*/
uploadFiles.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { project: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            project: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: typeof args.project === 'object'
        ? args.project.id
        : args.project,
    }

    return uploadFiles.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::uploadFiles
* @see app/Http/Controllers/ProjectController.php:604
* @route '/projects/{project}/files/upload'
*/
uploadFiles.post = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uploadFiles.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectController::deleteFile
* @see app/Http/Controllers/ProjectController.php:653
* @route '/projects/{project}/files/{file}'
*/
export const deleteFile = (args: { project: string | { id: string }, file: string | { id: string } } | [project: string | { id: string }, file: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteFile.url(args, options),
    method: 'delete',
})

deleteFile.definition = {
    methods: ["delete"],
    url: '/projects/{project}/files/{file}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ProjectController::deleteFile
* @see app/Http/Controllers/ProjectController.php:653
* @route '/projects/{project}/files/{file}'
*/
deleteFile.url = (args: { project: string | { id: string }, file: string | { id: string } } | [project: string | { id: string }, file: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            project: args[0],
            file: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: typeof args.project === 'object'
        ? args.project.id
        : args.project,
        file: typeof args.file === 'object'
        ? args.file.id
        : args.file,
    }

    return deleteFile.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{file}', parsedArgs.file.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::deleteFile
* @see app/Http/Controllers/ProjectController.php:653
* @route '/projects/{project}/files/{file}'
*/
deleteFile.delete = (args: { project: string | { id: string }, file: string | { id: string } } | [project: string | { id: string }, file: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteFile.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ProjectController::settings
* @see app/Http/Controllers/ProjectController.php:196
* @route '/projects/{project}/settings'
*/
export const settings = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: settings.url(args, options),
    method: 'get',
})

settings.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectController::settings
* @see app/Http/Controllers/ProjectController.php:196
* @route '/projects/{project}/settings'
*/
settings.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { project: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            project: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: typeof args.project === 'object'
        ? args.project.id
        : args.project,
    }

    return settings.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::settings
* @see app/Http/Controllers/ProjectController.php:196
* @route '/projects/{project}/settings'
*/
settings.get = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: settings.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProjectController::settings
* @see app/Http/Controllers/ProjectController.php:196
* @route '/projects/{project}/settings'
*/
settings.head = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: settings.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectController::collaboration
* @see app/Http/Controllers/ProjectController.php:242
* @route '/projects/{project}/collaboration'
*/
export const collaboration = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: collaboration.url(args, options),
    method: 'get',
})

collaboration.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/collaboration',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectController::collaboration
* @see app/Http/Controllers/ProjectController.php:242
* @route '/projects/{project}/collaboration'
*/
collaboration.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { project: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            project: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: typeof args.project === 'object'
        ? args.project.id
        : args.project,
    }

    return collaboration.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::collaboration
* @see app/Http/Controllers/ProjectController.php:242
* @route '/projects/{project}/collaboration'
*/
collaboration.get = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: collaboration.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProjectController::collaboration
* @see app/Http/Controllers/ProjectController.php:242
* @route '/projects/{project}/collaboration'
*/
collaboration.head = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: collaboration.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectController::addMember
* @see app/Http/Controllers/ProjectController.php:270
* @route '/projects/{project}/members'
*/
export const addMember = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addMember.url(args, options),
    method: 'post',
})

addMember.definition = {
    methods: ["post"],
    url: '/projects/{project}/members',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectController::addMember
* @see app/Http/Controllers/ProjectController.php:270
* @route '/projects/{project}/members'
*/
addMember.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { project: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            project: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: typeof args.project === 'object'
        ? args.project.id
        : args.project,
    }

    return addMember.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::addMember
* @see app/Http/Controllers/ProjectController.php:270
* @route '/projects/{project}/members'
*/
addMember.post = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addMember.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectController::updateMember
* @see app/Http/Controllers/ProjectController.php:298
* @route '/projects/{project}/members/{member}'
*/
export const updateMember = (args: { project: string | { id: string }, member: string | { id: string } } | [project: string | { id: string }, member: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateMember.url(args, options),
    method: 'put',
})

updateMember.definition = {
    methods: ["put"],
    url: '/projects/{project}/members/{member}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ProjectController::updateMember
* @see app/Http/Controllers/ProjectController.php:298
* @route '/projects/{project}/members/{member}'
*/
updateMember.url = (args: { project: string | { id: string }, member: string | { id: string } } | [project: string | { id: string }, member: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            project: args[0],
            member: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: typeof args.project === 'object'
        ? args.project.id
        : args.project,
        member: typeof args.member === 'object'
        ? args.member.id
        : args.member,
    }

    return updateMember.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{member}', parsedArgs.member.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::updateMember
* @see app/Http/Controllers/ProjectController.php:298
* @route '/projects/{project}/members/{member}'
*/
updateMember.put = (args: { project: string | { id: string }, member: string | { id: string } } | [project: string | { id: string }, member: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateMember.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ProjectController::removeMember
* @see app/Http/Controllers/ProjectController.php:329
* @route '/projects/{project}/members/{member}'
*/
export const removeMember = (args: { project: string | { id: string }, member: string | { id: string } } | [project: string | { id: string }, member: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeMember.url(args, options),
    method: 'delete',
})

removeMember.definition = {
    methods: ["delete"],
    url: '/projects/{project}/members/{member}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ProjectController::removeMember
* @see app/Http/Controllers/ProjectController.php:329
* @route '/projects/{project}/members/{member}'
*/
removeMember.url = (args: { project: string | { id: string }, member: string | { id: string } } | [project: string | { id: string }, member: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            project: args[0],
            member: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: typeof args.project === 'object'
        ? args.project.id
        : args.project,
        member: typeof args.member === 'object'
        ? args.member.id
        : args.member,
    }

    return removeMember.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{member}', parsedArgs.member.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::removeMember
* @see app/Http/Controllers/ProjectController.php:329
* @route '/projects/{project}/members/{member}'
*/
removeMember.delete = (args: { project: string | { id: string }, member: string | { id: string } } | [project: string | { id: string }, member: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeMember.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ProjectController::analytics
* @see app/Http/Controllers/ProjectController.php:356
* @route '/projects/{project}/analytics'
*/
export const analytics = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: analytics.url(args, options),
    method: 'get',
})

analytics.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/analytics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectController::analytics
* @see app/Http/Controllers/ProjectController.php:356
* @route '/projects/{project}/analytics'
*/
analytics.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { project: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            project: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: typeof args.project === 'object'
        ? args.project.id
        : args.project,
    }

    return analytics.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::analytics
* @see app/Http/Controllers/ProjectController.php:356
* @route '/projects/{project}/analytics'
*/
analytics.get = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: analytics.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProjectController::analytics
* @see app/Http/Controllers/ProjectController.php:356
* @route '/projects/{project}/analytics'
*/
analytics.head = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: analytics.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectController::activity
* @see app/Http/Controllers/ProjectController.php:513
* @route '/projects/{project}/activity'
*/
export const activity = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activity.url(args, options),
    method: 'get',
})

activity.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/activity',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectController::activity
* @see app/Http/Controllers/ProjectController.php:513
* @route '/projects/{project}/activity'
*/
activity.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { project: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            project: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: typeof args.project === 'object'
        ? args.project.id
        : args.project,
    }

    return activity.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::activity
* @see app/Http/Controllers/ProjectController.php:513
* @route '/projects/{project}/activity'
*/
activity.get = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activity.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProjectController::activity
* @see app/Http/Controllers/ProjectController.php:513
* @route '/projects/{project}/activity'
*/
activity.head = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: activity.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectController::versions
* @see app/Http/Controllers/ProjectController.php:390
* @route '/projects/{project}/versions'
*/
export const versions = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: versions.url(args, options),
    method: 'get',
})

versions.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/versions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectController::versions
* @see app/Http/Controllers/ProjectController.php:390
* @route '/projects/{project}/versions'
*/
versions.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { project: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            project: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: typeof args.project === 'object'
        ? args.project.id
        : args.project,
    }

    return versions.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::versions
* @see app/Http/Controllers/ProjectController.php:390
* @route '/projects/{project}/versions'
*/
versions.get = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: versions.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProjectController::versions
* @see app/Http/Controllers/ProjectController.php:390
* @route '/projects/{project}/versions'
*/
versions.head = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: versions.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectController::createVersion
* @see app/Http/Controllers/ProjectController.php:408
* @route '/projects/{project}/versions'
*/
export const createVersion = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createVersion.url(args, options),
    method: 'post',
})

createVersion.definition = {
    methods: ["post"],
    url: '/projects/{project}/versions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectController::createVersion
* @see app/Http/Controllers/ProjectController.php:408
* @route '/projects/{project}/versions'
*/
createVersion.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { project: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            project: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: typeof args.project === 'object'
        ? args.project.id
        : args.project,
    }

    return createVersion.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::createVersion
* @see app/Http/Controllers/ProjectController.php:408
* @route '/projects/{project}/versions'
*/
createVersion.post = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createVersion.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectController::templates
* @see app/Http/Controllers/ProjectController.php:439
* @route '/projects/templates'
*/
export const templates = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: templates.url(options),
    method: 'get',
})

templates.definition = {
    methods: ["get","head"],
    url: '/projects/templates',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectController::templates
* @see app/Http/Controllers/ProjectController.php:439
* @route '/projects/templates'
*/
templates.url = (options?: RouteQueryOptions) => {
    return templates.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::templates
* @see app/Http/Controllers/ProjectController.php:439
* @route '/projects/templates'
*/
templates.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: templates.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProjectController::templates
* @see app/Http/Controllers/ProjectController.php:439
* @route '/projects/templates'
*/
templates.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: templates.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectController::createFromTemplate
* @see app/Http/Controllers/ProjectController.php:458
* @route '/projects/from-template'
*/
export const createFromTemplate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createFromTemplate.url(options),
    method: 'post',
})

createFromTemplate.definition = {
    methods: ["post"],
    url: '/projects/from-template',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectController::createFromTemplate
* @see app/Http/Controllers/ProjectController.php:458
* @route '/projects/from-template'
*/
createFromTemplate.url = (options?: RouteQueryOptions) => {
    return createFromTemplate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::createFromTemplate
* @see app/Http/Controllers/ProjectController.php:458
* @route '/projects/from-template'
*/
createFromTemplate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createFromTemplate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectController::saveAsTemplate
* @see app/Http/Controllers/ProjectController.php:482
* @route '/projects/{project}/save-as-template'
*/
export const saveAsTemplate = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: saveAsTemplate.url(args, options),
    method: 'post',
})

saveAsTemplate.definition = {
    methods: ["post"],
    url: '/projects/{project}/save-as-template',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectController::saveAsTemplate
* @see app/Http/Controllers/ProjectController.php:482
* @route '/projects/{project}/save-as-template'
*/
saveAsTemplate.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { project: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            project: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: typeof args.project === 'object'
        ? args.project.id
        : args.project,
    }

    return saveAsTemplate.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::saveAsTemplate
* @see app/Http/Controllers/ProjectController.php:482
* @route '/projects/{project}/save-as-template'
*/
saveAsTemplate.post = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: saveAsTemplate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectController::archive
* @see app/Http/Controllers/ProjectController.php:531
* @route '/projects/{project}/archive'
*/
export const archive = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: archive.url(args, options),
    method: 'post',
})

archive.definition = {
    methods: ["post"],
    url: '/projects/{project}/archive',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectController::archive
* @see app/Http/Controllers/ProjectController.php:531
* @route '/projects/{project}/archive'
*/
archive.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { project: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            project: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: typeof args.project === 'object'
        ? args.project.id
        : args.project,
    }

    return archive.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::archive
* @see app/Http/Controllers/ProjectController.php:531
* @route '/projects/{project}/archive'
*/
archive.post = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: archive.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectController::restore
* @see app/Http/Controllers/ProjectController.php:554
* @route '/projects/{project}/restore'
*/
export const restore = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restore.url(args, options),
    method: 'post',
})

restore.definition = {
    methods: ["post"],
    url: '/projects/{project}/restore',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectController::restore
* @see app/Http/Controllers/ProjectController.php:554
* @route '/projects/{project}/restore'
*/
restore.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { project: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            project: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: typeof args.project === 'object'
        ? args.project.id
        : args.project,
    }

    return restore.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::restore
* @see app/Http/Controllers/ProjectController.php:554
* @route '/projects/{project}/restore'
*/
restore.post = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restore.url(args, options),
    method: 'post',
})

const ProjectController = { show, edit, update, destroy, dashboard, updateSettings, files, uploadFiles, deleteFile, settings, collaboration, addMember, updateMember, removeMember, analytics, activity, versions, createVersion, templates, createFromTemplate, saveAsTemplate, archive, restore }

export default ProjectController