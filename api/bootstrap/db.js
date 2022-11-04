import mongodb from 'mongodb'

const { MongoClient } = mongodb

let url = 'mongodb://db.gsm'
export let connection = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })