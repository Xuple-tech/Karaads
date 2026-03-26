import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\AuthController::login
* @see app/Http/Controllers/Api/AuthController.php:15
* @route '/api/auth/login'
*/
const login5896f8980de89c6267eebea1c6ada80b = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login5896f8980de89c6267eebea1c6ada80b.url(options),
    method: 'post',
})

login5896f8980de89c6267eebea1c6ada80b.definition = {
    methods: ["post"],
    url: '/api/auth/login',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::login
* @see app/Http/Controllers/Api/AuthController.php:15
* @route '/api/auth/login'
*/
login5896f8980de89c6267eebea1c6ada80b.url = (options?: RouteQueryOptions) => {
    return login5896f8980de89c6267eebea1c6ada80b.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::login
* @see app/Http/Controllers/Api/AuthController.php:15
* @route '/api/auth/login'
*/
login5896f8980de89c6267eebea1c6ada80b.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login5896f8980de89c6267eebea1c6ada80b.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\AuthController::login
* @see app/Http/Controllers/Api/AuthController.php:15
* @route '/api/auth/x7k9m2p4/login'
*/
const login959a2166ddb7c6449157da4db63f671c = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login959a2166ddb7c6449157da4db63f671c.url(options),
    method: 'post',
})

login959a2166ddb7c6449157da4db63f671c.definition = {
    methods: ["post"],
    url: '/api/auth/x7k9m2p4/login',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::login
* @see app/Http/Controllers/Api/AuthController.php:15
* @route '/api/auth/x7k9m2p4/login'
*/
login959a2166ddb7c6449157da4db63f671c.url = (options?: RouteQueryOptions) => {
    return login959a2166ddb7c6449157da4db63f671c.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::login
* @see app/Http/Controllers/Api/AuthController.php:15
* @route '/api/auth/x7k9m2p4/login'
*/
login959a2166ddb7c6449157da4db63f671c.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login959a2166ddb7c6449157da4db63f671c.url(options),
    method: 'post',
})

export const login = {
    '/api/auth/login': login5896f8980de89c6267eebea1c6ada80b,
    '/api/auth/x7k9m2p4/login': login959a2166ddb7c6449157da4db63f671c,
}

/**
* @see \App\Http\Controllers\Api\AuthController::register
* @see app/Http/Controllers/Api/AuthController.php:47
* @route '/api/auth/register'
*/
const register0a96eaed59352c615f22baea987c8293 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register0a96eaed59352c615f22baea987c8293.url(options),
    method: 'post',
})

register0a96eaed59352c615f22baea987c8293.definition = {
    methods: ["post"],
    url: '/api/auth/register',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::register
* @see app/Http/Controllers/Api/AuthController.php:47
* @route '/api/auth/register'
*/
register0a96eaed59352c615f22baea987c8293.url = (options?: RouteQueryOptions) => {
    return register0a96eaed59352c615f22baea987c8293.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::register
* @see app/Http/Controllers/Api/AuthController.php:47
* @route '/api/auth/register'
*/
register0a96eaed59352c615f22baea987c8293.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register0a96eaed59352c615f22baea987c8293.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\AuthController::register
* @see app/Http/Controllers/Api/AuthController.php:47
* @route '/api/auth/q3w8r5t1/register'
*/
const register1f7bea1553350389194f7c291d756a9b = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register1f7bea1553350389194f7c291d756a9b.url(options),
    method: 'post',
})

register1f7bea1553350389194f7c291d756a9b.definition = {
    methods: ["post"],
    url: '/api/auth/q3w8r5t1/register',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::register
* @see app/Http/Controllers/Api/AuthController.php:47
* @route '/api/auth/q3w8r5t1/register'
*/
register1f7bea1553350389194f7c291d756a9b.url = (options?: RouteQueryOptions) => {
    return register1f7bea1553350389194f7c291d756a9b.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::register
* @see app/Http/Controllers/Api/AuthController.php:47
* @route '/api/auth/q3w8r5t1/register'
*/
register1f7bea1553350389194f7c291d756a9b.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register1f7bea1553350389194f7c291d756a9b.url(options),
    method: 'post',
})

export const register = {
    '/api/auth/register': register0a96eaed59352c615f22baea987c8293,
    '/api/auth/q3w8r5t1/register': register1f7bea1553350389194f7c291d756a9b,
}

/**
* @see \App\Http\Controllers\Api\AuthController::logout
* @see app/Http/Controllers/Api/AuthController.php:78
* @route '/api/auth/logout'
*/
const logout028457b752b2e7db1fe4736d8c51831d = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout028457b752b2e7db1fe4736d8c51831d.url(options),
    method: 'post',
})

logout028457b752b2e7db1fe4736d8c51831d.definition = {
    methods: ["post"],
    url: '/api/auth/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::logout
* @see app/Http/Controllers/Api/AuthController.php:78
* @route '/api/auth/logout'
*/
logout028457b752b2e7db1fe4736d8c51831d.url = (options?: RouteQueryOptions) => {
    return logout028457b752b2e7db1fe4736d8c51831d.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::logout
* @see app/Http/Controllers/Api/AuthController.php:78
* @route '/api/auth/logout'
*/
logout028457b752b2e7db1fe4736d8c51831d.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout028457b752b2e7db1fe4736d8c51831d.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\AuthController::logout
* @see app/Http/Controllers/Api/AuthController.php:78
* @route '/api/auth/secure/n8m4k7j2/logout'
*/
const logout0da058f4d5bb847dda7b798d0d99df01 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout0da058f4d5bb847dda7b798d0d99df01.url(options),
    method: 'post',
})

logout0da058f4d5bb847dda7b798d0d99df01.definition = {
    methods: ["post"],
    url: '/api/auth/secure/n8m4k7j2/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::logout
* @see app/Http/Controllers/Api/AuthController.php:78
* @route '/api/auth/secure/n8m4k7j2/logout'
*/
logout0da058f4d5bb847dda7b798d0d99df01.url = (options?: RouteQueryOptions) => {
    return logout0da058f4d5bb847dda7b798d0d99df01.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::logout
* @see app/Http/Controllers/Api/AuthController.php:78
* @route '/api/auth/secure/n8m4k7j2/logout'
*/
logout0da058f4d5bb847dda7b798d0d99df01.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout0da058f4d5bb847dda7b798d0d99df01.url(options),
    method: 'post',
})

export const logout = {
    '/api/auth/logout': logout028457b752b2e7db1fe4736d8c51831d,
    '/api/auth/secure/n8m4k7j2/logout': logout0da058f4d5bb847dda7b798d0d99df01,
}

/**
* @see \App\Http\Controllers\Api\AuthController::user
* @see app/Http/Controllers/Api/AuthController.php:88
* @route '/api/auth/user'
*/
const user497c869e96901cc7c77b32a51df907ce = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: user497c869e96901cc7c77b32a51df907ce.url(options),
    method: 'get',
})

user497c869e96901cc7c77b32a51df907ce.definition = {
    methods: ["get","head"],
    url: '/api/auth/user',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\AuthController::user
* @see app/Http/Controllers/Api/AuthController.php:88
* @route '/api/auth/user'
*/
user497c869e96901cc7c77b32a51df907ce.url = (options?: RouteQueryOptions) => {
    return user497c869e96901cc7c77b32a51df907ce.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::user
* @see app/Http/Controllers/Api/AuthController.php:88
* @route '/api/auth/user'
*/
user497c869e96901cc7c77b32a51df907ce.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: user497c869e96901cc7c77b32a51df907ce.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\AuthController::user
* @see app/Http/Controllers/Api/AuthController.php:88
* @route '/api/auth/user'
*/
user497c869e96901cc7c77b32a51df907ce.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: user497c869e96901cc7c77b32a51df907ce.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\AuthController::user
* @see app/Http/Controllers/Api/AuthController.php:88
* @route '/api/auth/secure/p9l6h3v5/user'
*/
const user863beb6c46142a1dfcb3e26e5d8a0add = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: user863beb6c46142a1dfcb3e26e5d8a0add.url(options),
    method: 'get',
})

user863beb6c46142a1dfcb3e26e5d8a0add.definition = {
    methods: ["get","head"],
    url: '/api/auth/secure/p9l6h3v5/user',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\AuthController::user
* @see app/Http/Controllers/Api/AuthController.php:88
* @route '/api/auth/secure/p9l6h3v5/user'
*/
user863beb6c46142a1dfcb3e26e5d8a0add.url = (options?: RouteQueryOptions) => {
    return user863beb6c46142a1dfcb3e26e5d8a0add.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::user
* @see app/Http/Controllers/Api/AuthController.php:88
* @route '/api/auth/secure/p9l6h3v5/user'
*/
user863beb6c46142a1dfcb3e26e5d8a0add.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: user863beb6c46142a1dfcb3e26e5d8a0add.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\AuthController::user
* @see app/Http/Controllers/Api/AuthController.php:88
* @route '/api/auth/secure/p9l6h3v5/user'
*/
user863beb6c46142a1dfcb3e26e5d8a0add.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: user863beb6c46142a1dfcb3e26e5d8a0add.url(options),
    method: 'head',
})

export const user = {
    '/api/auth/user': user497c869e96901cc7c77b32a51df907ce,
    '/api/auth/secure/p9l6h3v5/user': user863beb6c46142a1dfcb3e26e5d8a0add,
}

/**
* @see \App\Http\Controllers\Api\AuthController::refreshToken
* @see app/Http/Controllers/Api/AuthController.php:96
* @route '/api/auth/refresh'
*/
const refreshTokenf9843ed3fc8116c933b3d3bdc1c287da = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refreshTokenf9843ed3fc8116c933b3d3bdc1c287da.url(options),
    method: 'post',
})

refreshTokenf9843ed3fc8116c933b3d3bdc1c287da.definition = {
    methods: ["post"],
    url: '/api/auth/refresh',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::refreshToken
* @see app/Http/Controllers/Api/AuthController.php:96
* @route '/api/auth/refresh'
*/
refreshTokenf9843ed3fc8116c933b3d3bdc1c287da.url = (options?: RouteQueryOptions) => {
    return refreshTokenf9843ed3fc8116c933b3d3bdc1c287da.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::refreshToken
* @see app/Http/Controllers/Api/AuthController.php:96
* @route '/api/auth/refresh'
*/
refreshTokenf9843ed3fc8116c933b3d3bdc1c287da.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refreshTokenf9843ed3fc8116c933b3d3bdc1c287da.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\AuthController::refreshToken
* @see app/Http/Controllers/Api/AuthController.php:96
* @route '/api/auth/secure/r2t8y4u1/refresh'
*/
const refreshToken82e6f021345db7b7eecf3fbcd283d929 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refreshToken82e6f021345db7b7eecf3fbcd283d929.url(options),
    method: 'post',
})

refreshToken82e6f021345db7b7eecf3fbcd283d929.definition = {
    methods: ["post"],
    url: '/api/auth/secure/r2t8y4u1/refresh',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::refreshToken
* @see app/Http/Controllers/Api/AuthController.php:96
* @route '/api/auth/secure/r2t8y4u1/refresh'
*/
refreshToken82e6f021345db7b7eecf3fbcd283d929.url = (options?: RouteQueryOptions) => {
    return refreshToken82e6f021345db7b7eecf3fbcd283d929.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::refreshToken
* @see app/Http/Controllers/Api/AuthController.php:96
* @route '/api/auth/secure/r2t8y4u1/refresh'
*/
refreshToken82e6f021345db7b7eecf3fbcd283d929.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refreshToken82e6f021345db7b7eecf3fbcd283d929.url(options),
    method: 'post',
})

export const refreshToken = {
    '/api/auth/refresh': refreshTokenf9843ed3fc8116c933b3d3bdc1c287da,
    '/api/auth/secure/r2t8y4u1/refresh': refreshToken82e6f021345db7b7eecf3fbcd283d929,
}

const AuthController = { login, register, logout, user, refreshToken }

export default AuthController