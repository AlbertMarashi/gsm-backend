import { User } from '../models/user.js'
import jsonwebtoken from 'jsonwebtoken'

const { JsonWebTokenError } = jsonwebtoken

export async function sessionToken (ctx, next) {
    let token = null

    if(ctx.header.token) {
        token = ctx.header.token
    }
    if(ctx.cookie && ctx.cookie.token) {
        token = ctx.cookie.token
    }
    if(ctx.query && ctx.query.token) {
        token = ctx.query.token
    }

    if(token) {
        try {
            await User.authenticate(token, ctx)

            ctx.state.token = token
            ctx.state.authenticated = true
        } catch (error) {
            if(error instanceof JsonWebTokenError) return ctx.cookies.set('token', '')
            throw error
        }
    }
    await next()
}

export async function errorMiddleware (ctx, next) {
    try {
        await next()
    } catch (error) {
        console.error(error)
        ctx.status = error.status || 500
        ctx.body = error.message
    }
}

export async function stateContext (ctx, next) {
    if(!ctx.state) ctx.state = {}
    await next()
}
