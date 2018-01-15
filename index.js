const mysql = require('mysql2/promise');
const collection = require('varal-collection');
const QueryBuilder = require('./lib/queryBuilder');

class Mysql {

    constructor(options) {
        this.options = options;
    }

    async query(sqlString, values) {
        let connection = await mysql.createConnection(this.options);
        let [res] = await connection.query(sqlString, values);
        connection.destroy();
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