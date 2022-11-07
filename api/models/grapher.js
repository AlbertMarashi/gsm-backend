import { WarrantyRegistration } from './warrantyRegistration.js'
import { User } from './user.js'
import { Payment } from './payment.js'
import { Builder } from '@promatia/prograph'
import { directiveResolvers, scalarResolvers } from './utils.js'

const models = [WarrantyRegistration, User, Payment]

const schema = `
scalar ObjectID
scalar Date
scalar Void
type PaginationInput {
    limit: Number @max(amount: 50)
    after: ObjectID
    before: ObjectID
}
paginator CursorPaginator {
    startCursor: ObjectID
    endCursor: ObjectID
    nextPage: Boolean
    previousPage: Boolean
}
directive authenticated INPUT FIELD OBJECT
directive hasScope(scope: String!) INPUT FIELD OBJECT
directive lowercase INPUT
directive max INPUT
${models.map(model => model.types).join('\n')}
`

const messageResolvers = {
    ...models.reduce((obj, model) => Object.assign(obj, model.resolvers), {})
}

let graph = new Builder({schema, messageResolvers, directiveResolvers, scalarResolvers})

export async function graphMiddleware (ctx) {
    let query = ctx.request.body.query

    console.log(query)

    try {
        ctx.body = {
            data: await graph(query, { context: ctx })
        }
    } catch (error) {
        console.error(error)
        ctx.body = {
            data: null,
            error: {
                message: error.message,
                location: error.location
            }
        }
    }
}

export { graph, models }