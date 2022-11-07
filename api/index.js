console.log("starting api");

import Koa from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import koaCookie from 'koa-cookie'
import compress from 'koa-compress'
import { createServer } from 'http'
import cors from '@koa/cors'
import { graphMiddleware } from './models/grapher.js'
import { WarrantyRegistration } from './models/warrantyRegistration.js'
import { AsyncParser } from 'json2csv'
import moment from 'moment'
//import { downloadFile, uploadFile } from '../models/cmsFiles.js'

import {
    errorMiddleware,
    sessionToken,
    stateContext,
} from './middleware/index.js'
import { Readable } from 'stream'

const router = new Router()
    .use(compress())
    .use(stateContext)
    .use(errorMiddleware)
    .use(async (ctx, next) => {
        ctx.set('Access-Control-Allow-Origin', '*')
        ctx.set('Access-Control-Allow-Headers', '*')
        ctx.set('Access-Control-Allow-Methods', '*')
        await next()
    })
    .use(koaCookie.default())
    .use(bodyParser())
    .use(sessionToken)
    .post('/api/graph/', graphMiddleware)
    .get('/api/csv', async ctx => {
        if(ctx.state.authenticated !== true) throw new Error('You are not authenticated')
        let stream = new Readable({
            read(){}
        })
        ctx.response.set('Content-Type', 'text/csv')
        ctx.response.set('Content-Disposition', 'attachment; filename=warranty-registrations.csv')

        ctx.body = stream

        let opts = {
            fields: [
                '_id',
                'email',
                'firstName',
                'lastName',
                'phoneNumber',
                'brandPurchased',
                'datePurchased',
                'state',
                'postCode',
                'agreeToMarketing',
                'wherePurchased',
                'dateRegistered'
            ]
        }

        let csvParser = new AsyncParser(opts)

        csvParser.processor
            .on('data', chunk => stream.push(chunk))
            .on('end', () => stream.push(null))

        let cursor = WarrantyRegistration.collection.find({})

        while(await cursor.hasNext()){
            let doc = await cursor.next()
            doc.dateRegistered = moment(new Date(doc.dateRegistered)).format('DD/MM/YYYY')
            doc.datePurchased = moment(new Date(doc.datePurchased)).format('DD/MM/YYYY')
            csvParser.input.push(JSON.stringify(doc))
        }

        csvParser.input.push(null)
    })
    .get('(.*)', async ctx => {
        ctx.body = '404'
    })

let app = new Koa()

app.use(cors())
app.use(router.routes())
app.use(router.allowedMethods())

let httpServer = createServer(app.callback())

export default httpServer