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
        if (this.pool !== undefined)
            [res] = await this.pool.query(sqlString, values);
        else {
            const connection = await mysql.createConnection(this.options);
            [res] = await connection.query(sqlString, values);
            connection.destroy();
        }
        if (Array.isArray(res))
            return new collection(res);
        return res;
    }

    table(name) {
        return new QueryBuilder(this, name);
    }

    static varal(options) {
        const mysql = new Mysql(options);
        return server => server.bind('varal.mysql', mysql);
    }

}

exports = module.exports = Mysql;