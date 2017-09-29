const {Client} = require('pg')
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/todo'
const client = new Client(connectionString)
// const pool = new Pool()

const dbName = "items"

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
    /**
     * List the items in the row of our database
     */
    listItems() {

        client.query(`SELECT * FROM ${dbName} ORDER BY id ASC;`, (err, res) => {
            console.log(res.rows)
            client.end()
            return (res.rows)
        })
    }
    /**
     * Deletes the row at the database dbName
     * otherwise log error.stack
     * @param {string} id
     */
    delete(id) {
        client.query(`DELETE FROM ${dbName} WHERE id=(${id})`, (err) => {
            console.log(err
                ? err.stack
                : 'Successful delete')
        })
    }
    /**
     * Inserts into the dabase from the object
     * TODO: setup the base items depending on our tables
     * @param {object} val
     */
    insert(val) {
        let bool = val.bool
        let name = val.name
        let id = val.id

        client.query(`INSERT INTO ${dbName}("id","text", "complete") VALUES(${id}, '${name}', ${bool});`, (err, res) => {
            console.log(err
                ? err.stack
                : 'Successful insert')
        })
    }
    /**
     * creates table from input
     * @param {string} tableName the name of the table
     * TODO: @param {object}   - the different pieces of the table. maybe hard code this? IDK
     */
    createTable(tableName) {

        client.query(`CREATE TABLE ${tableName}(
        ID INT PRIMARY KEY     NOT NULL,
        NAME           TEXT    NOT NULL,
        AGE            INT     NOT NULL,
        ADDRESS        CHAR(50),
        SALARY         REAL
     );`, (err, res) => {
            console.log(err
                ? err.stack
                : 'Successful insert')
        })
    }
    /**
     * Test the connection to the database (unnecessary because of connect, but still fun)
     */
    test() {
        client.query('SELECT $1::text as message', ['Hello world!'], (err, res) => {
            console.log(err
                ? err.stack
                : res.rows[0].message) // Hello World!
        })
    }

}