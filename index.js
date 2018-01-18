const mysql = require('mysql2/promise');
const collection = require('varal-collection');
const QueryBuilder = require('./lib/queryBuilder');

class Mysql {

    constructor(options, pooling) {
        this.options = options;
        if (pooling === true)
            this.pool = mysql.createPool(this.options);
    }

    async end() {
        if (this.pool !== undefined)
            await this.pool.end();
    }

    async query(sqlString, values) {
        let res = undefined;
        if (this.pool !== undefined) {
            const connection = await this.pool.getConnection();
            [res] = await connection.query(sqlString, values);
            connection.release();
        }
        else {
            const connection = await mysql.createConnection(this.options);
            [res] = await connection.query(sqlString, values);
            connection.destroy();
        }
        if (Array.isArray(res))
            return new collection(res);
        return res;
    }

    async beginTransaction() {
        let connection = undefined;
        let pooling = false;
        if (this.pool !== undefined) {
            pooling = true;
            connection = await this.pool.getConnection();
        }
        else
            connection = await mysql.createConnection(this.options);
        return new Transaction(connection, pooling);
    }

    table(name) {
        return new QueryBuilder(this, name);
    }

    static varal(options) {
        const mysql = new Mysql(options);
        return server => server.bind('varal.mysql', mysql);
    }

}

class Transaction {

    constructor(connection, pooling) {
        this.connection = connection;
        this.pooling = pooling;
        this.connection.beginTransaction();
    }

    async query(sqlString, values) {
        if (!this.connection)
            return;
        let res = undefined;
        if (this.pooling)
            [res] = await this.connection.query(sqlString, values);
        else
            [res] = await this.connection.query(sqlString, values);
        if (Array.isArray(res))
            return new collection(res);
        return res;
    }

    table(name) {
        return new QueryBuilder(this, name);
    }

    async rollback() {
        await this.connection.rollback();
        this.destroy();
    }

    async commit() {
        await this.connection.commit();
        this.destroy();
    }

    destroy() {
        if (this.pooling)
            this.connection.release();
        else
            this.connection.destroy();
        delete this.connection;
    }


}

exports = module.exports = Mysql;