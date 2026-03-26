import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ProjectController::upload
 * @see app/Http/Controllers/ProjectController.php:604
 * @route '/projects/{project}/files/upload'
 */
export const upload = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upload.url(args, options),
    method: 'post',
})

upload.definition = {
    methods: ["post"],
    url: '/projects/{project}/files/upload',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectController::upload
 * @see app/Http/Controllers/ProjectController.php:604
 * @route '/projects/{project}/files/upload'
 */
upload.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return upload.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::upload
 * @see app/Http/Controllers/ProjectController.php:604
 * @route '/projects/{project}/files/upload'
 */
upload.post = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upload.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectController::deleteMethod
 * @see app/Http/Controllers/ProjectController.php:653
 * @route '/projects/{project}/files/{file}'
 */
export const deleteMethod = (args: { project: string | { id: string }, file: string | { id: string } } | [project: string | { id: string }, file: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/projects/{project}/files/{file}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ProjectController::deleteMethod
 * @see app/Http/Controllers/ProjectController.php:653
 * @route '/projects/{project}/files/{file}'
 */
deleteMethod.url = (args: { project: string | { id: string }, file: string | { id: string } } | [project: string | { id: string }, file: string | { id: string } ], options?: RouteQueryOptions) => {
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

    return deleteMethod.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{file}', parsedArgs.file.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectController::deleteMethod
 * @see app/Http/Controllers/ProjectController.php:653
 * @route '/projects/{project}/files/{file}'
 */
deleteMethod.delete = (args: { project: string | { id: string }, file: string | { id: string } } | [project: string | { id: string }, file: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})
const files = {
    upload: Object.assign(upload, upload),
delete: Object.assign(deleteMethod, deleteMethod),
}

export default files