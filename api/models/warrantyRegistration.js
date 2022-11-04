import { Model } from './model.js'
import { gql } from '@promatia/prograph'
import { connection } from '../bootstrap/db.js'

/**
 * @extends Model
 */
export class WarrantyRegistration extends Model {
    static collection = connection.db('gsm').collection('customer')

    static types = gql`

    type WarrantyRegistration {
        _id: ObjectID
        email: String
        firstName: String
        lastName: String
        phoneNumber: String
        brandPurchased: String
        #productCategory: String
        datePurchased: Date
        state: String
        postCode: String
        agreeToMarketing: Boolean
        wherePurchased: String
        dateRegistered: Date
    }

    message getWarrantyRegistrations(brand: String): String #@authenticated @cost(cost: 300)
    message createWarrantyRegistration (
        email: String! @lowercase
        firstName: String!
        lastName: String!
        phoneNumber: String!
        brandPurchased: String!
        #productCategory: String!
        datePurchased: Date!
        state: String!
        postCode: String!
        agreeToMarketing: Boolean!
        wherePurchased: String!
    ): Void @cost(cost: 500)
    `

    static async createIndexes () {
        await this.collection.createIndex({ joined: 1 })
        await this.collection.createIndex({ joined: -1 })
        await this.collection.createIndex({ brandPurchased: 1 })
    }

    static get resolvers () {
        return resolvers 
    }
}

export const resolvers = {
    async getWarrantyRegistrations () {
        
    },
    async createWarrantyRegistration (inputs) {
        const {
            email,
            firstName,
            lastName,
            phoneNumber,
            brandPurchased,
            //productCategory,
            datePurchased,
            state,
            postCode,
            agreeToMarketing,
            wherePurchased,
        } = inputs

        if(!email) throw new Error('You must enter an email address')
        if(!firstName) throw new Error('You must enter a first name')
        if(!lastName) throw new Error('You must enter a last name')
        if(!phoneNumber) throw new Error('You must enter a phone number')
        if(!brandPurchased) throw new Error('You must enter a phone number')
        //if(!productCategory) throw new Error('You must enter')
        if(!datePurchased) throw new Error('You must enter the date of purchase')
        if(!state) throw new Error('You must enter a state')
        if(!postCode) throw new Error('You must enter a post code')
        if(!wherePurchased) throw new Error('You must enter where you purchased your product')

        let warrantyRegistration = new WarrantyRegistration({
            email,
            firstName,
            lastName,
            phoneNumber,
            brandPurchased,
            datePurchased,
            state,
            postCode,
            agreeToMarketing,
            wherePurchased,
            dateRegistered: new Date()
        })

        try {
            await warrantyRegistration.save()
        } catch (error) {
            throw error
        }

        return null
    }
}