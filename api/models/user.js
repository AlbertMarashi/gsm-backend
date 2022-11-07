import { gql } from '@promatia/prograph'
import jwt from 'jsonwebtoken'

export class User {

    static types = gql`
    message loginUser (
        token: String!
    ): String @cost(cost: 500)
    `

    static async authenticate (token) {
        const { secret } = process.env
        const decodedToken = jwt.verify(token, secret)

        let now = new Date().getTime()
        return now < decodedToken.expiry
    }

    /**
     * Create a session and return the JWT API token
     */
    static async createToken () {
        let dateOffset = (24 * 60 * 60 * 1000) * 20
        let expiry = new Date().getTime() + dateOffset
        let secret = process.env.secret
        let token = jwt.sign({expiry}, secret)
        return token
    }

    static get resolvers () {
        return resolvers
    }
}

export const resolvers = {
    /**
     * This function generates a JSON Web Token (JWT) for the given user, which can be used for API Requests.
     */
    async loginUser ({token}, { context }) {
        if(token === process.env.loginCode){
            let token = await User.createToken()
            context.cookies("token", token)
            return token
        }
        context.cookies.set('token', '')
        throw new Error('Incorrect Login Code')
    }
}