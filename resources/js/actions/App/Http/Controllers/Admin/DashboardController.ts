import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\DashboardController::index
* @see app/Http/Controllers/Admin/DashboardController.php:20
* @route '/admin'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\DashboardController::index
* @see app/Http/Controllers/Admin/DashboardController.php:20
* @route '/admin'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\DashboardController::index
* @see app/Http/Controllers/Admin/DashboardController.php:20
* @route '/admin'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\DashboardController::index
* @see app/Http/Controllers/Admin/DashboardController.php:20
* @route '/admin'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\DashboardController::imageUploads
* @see app/Http/Controllers/Admin/DashboardController.php:187
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
* @see app/Http/Controllers/Admin/DashboardController.php:187
* @route '/admin/image-uploads'
*/
imageUploads.url = (options?: RouteQueryOptions) => {
    return imageUploads.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\DashboardController::imageUploads
* @see app/Http/Controllers/Admin/DashboardController.php:187
* @route '/admin/image-uploads'
*/
imageUploads.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: imageUploads.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\DashboardController::imageUploads
* @see app/Http/Controllers/Admin/DashboardController.php:187
* @route '/admin/image-uploads'
*/
imageUploads.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: imageUploads.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\DashboardController::deleteImage
* @see app/Http/Controllers/Admin/DashboardController.php:262
* @route '/admin/image-uploads/{id}'
*/
export const deleteImage = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteImage.url(args, options),
    method: 'delete',
})

deleteImage.definition = {
    methods: ["delete"],
    url: '/admin/image-uploads/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\DashboardController::deleteImage
* @see app/Http/Controllers/Admin/DashboardController.php:262
* @route '/admin/image-uploads/{id}'
*/
deleteImage.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return deleteImage.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\DashboardController::deleteImage
* @see app/Http/Controllers/Admin/DashboardController.php:262
* @route '/admin/image-uploads/{id}'
*/
deleteImage.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteImage.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\DashboardController::userStats
* @see app/Http/Controllers/Admin/DashboardController.php:243
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
* @see app/Http/Controllers/Admin/DashboardController.php:243
* @route '/admin/user-stats'
*/
userStats.url = (options?: RouteQueryOptions) => {
    return userStats.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\DashboardController::userStats
* @see app/Http/Controllers/Admin/DashboardController.php:243
* @route '/admin/user-stats'
*/
userStats.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: userStats.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\DashboardController::userStats
* @see app/Http/Controllers/Admin/DashboardController.php:243
* @route '/admin/user-stats'
*/
userStats.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: userStats.url(options),
    method: 'head',
})

const DashboardController = { index, imageUploads, deleteImage, userStats }

export default DashboardController