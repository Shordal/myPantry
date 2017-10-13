'use strict'
const promise = require('bluebird')
const pgp = require('pg-promise')({promiseLib: promise})
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/pantry'
const client = pgp(connectionString)

const userTable = "users"
const foodTable = "foods"
const listTable = "lists"

module.exports = class DbCommands {

    /**
     * Connects to the database from the client variable above. if error, log it.
     * Will need to return error when implemented.
     */
    connectDB() {
        client.connect((err) => {
            if (err) {
                console.error('connection error', err.stack)
            } else {
                console.log('Connected to Postgres')
            }
        })
    }

    /**
     * Disconnect from postgres database.
     */
    disconnectDB() {
        client.end((err) => {
            if (err) {
                console.error('disconnection error', err.stack)
            } else {
                console.log('disconnected from Postgres')
            }
        })
    }

    listUsers() {
        console.log("listing in command")
        return new Promise((resolve, reject) => {
            console.log("promising")
            client
                .any(`SELECT * FROM ${userTable}`)
                .then(data => {
                    resolve(data)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * Search to see if one tuple exists
     * @param {object} val // val contains a username and password. We have allowed for more inputs if required.
     * @returns {Promise} Resolves to the tuple from the username.
     */
    getLogin(val) {
        console.log("getting login")
        return new Promise((resolve, reject) => {
            if (val.username && val.password) {
                client
                    .any(`SELECT * FROM users where username='${val.username}' and password='${val.password}'`)
                    .then(data => {
                        if (data.length > 0) {
                            resolve(data)
                        } else {
                            reject('Invalid Username or Password')
                        }
                    })
                    .catch(err => {
                        reject(err)
                    })
            } else {
                reject('Invalid Username or Password')
            }
        })
    }

    getList(val) {
        return new Promise((resolve, reject) => {
            client
                .any(`SELECT * FROM ${listTable} WHERE username = '${val.username}';`)
                .then(data => {
                    if (data.length > 0) {
                        resolve(data)
                    } else {
                        reject('Error Could Not Find List')
                    }
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    /**
     * Deletes the row at the database dbName from id
     * otherwise log error.stack
     * @param {string} id //the username of the row where it is deleted
     * @returns {Promise} Resolves confirm a successful delete
     * TODO: user ternary operator for whether username or whatever id goes there
     */
    delete(id) {
        return new Promise((resolve, reject) => {
            client
                .any(`DELETE FROM "public".${userTable} WHERE "username"='${id}'`)
                .then(data => {
                    resolve("successful Delete", data)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }
    /**
     * Inserts into the dabase from the object
     * @param {object} val //val contains username, password, command, and newItem
     * @returns {Promise} Resolves confirm the successful insert with the username
     */
    insert(val) {
        return new Promise((resolve, reject) => {
            let command = val.command
            let username = val.username
            let password = val.password
            let newItem = val.newItem

            if (command == 'register') {
                client
                    .any(`INSERT INTO "public"."${userTable}"("username","password") VALUES('${username}', '${password}') returning username`)
                    .then(data => {
                        resolve("successful insert", data)
                    })
                    .catch(error => {
                        reject(error)
                    })
            } else if (command == 'newItem') {
                console.log("creating new item: ", newItem)
                client
                    .any(`INSERT INTO "public"."${listTable}" ("username", "foodName") VALUES('${username}','${newItem}') RETURNING ('username','foodName','qty/weight');`)
                    .then(data => {
                        resolve(data)
                    })
                    .catch(error => {
                        console.error(error)
                        reject(error)
                    })
            }
        })
    }

}