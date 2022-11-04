import Stripe from 'stripe'
import { gql } from '@promatia/prograph'
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.sendGridKey)
const stripe = Stripe(process.env.stripeSecretKey)

export class Payment {
    static types = gql`
    message createPaymentIntent (
        amount: Number!
        invoiceNumber: String!
    ): String @cost(cost: 500)

    message finalisePayment (
        paymentMethodID: String!
    ): String @cost(cost: 500)
    `

    static get resolvers () {
        return resolvers
    }
}

const resolvers = {
    async createPaymentIntent({invoiceNumber, amount}){
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'aud',
            metadata: {
                invoiceNumber
            },
            description: `Payment to GSM Retail: INV-${invoiceNumber}`
        })

        return paymentIntent.client_secret
    },

    async finalisePayment({paymentMethodID}){
        let intent = await stripe.paymentIntents.retrieve(paymentMethodID)
        let paymentMethod = await stripe.paymentMethods.retrieve(intent.payment_method)
        
        let data = {
            invoiceNumber: intent.metadata.invoiceNumber,
            amount: intent.amount,
            name: paymentMethod.billing_details.name,
            date: new Date().toLocaleString('en-au', { timeZone: 'Australia/Adelaide' }),
            id: intent.id,
            last4: paymentMethod.card.last4
        }

        let amountFormatted = (data.amount / 100).toFixed(2)

        const msg = {
            to: process.env.paymentAdminEmail,
            from: process.env.paymentAdminEmail,
            subject: `Parts Payment: INV-${data.invoiceNumber} paid $${amountFormatted}`,
            text: `
Invoice paid via parts payment system

Stripe Payment ID: pi_1IGXkHEYt2eC5Crdo6cWwxE7
Invoice Number: ${data.invoiceNumber}
Amount: $${amountFormatted}
Name: ${data.name}
Date: ${data.date}
Last 4 Card Numbers: ${data.last4}
`
        }

        try {
            await sgMail.send(msg)
        } catch (error) {
            throw new Error(error.response.body.errors[0].message)
        }
    }
}

