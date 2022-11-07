import mongodb from 'mongodb'

const { MongoClient } = mongodb

export let connection = await MongoClient.connect(`mongodb+srv://${process.env.db_username}:${process.env.db_password}@${process.env.db_host}/?retryWrites=true&w=majority`)