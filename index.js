const mysql = require('mysql2/promise');
const collection = require('varal-collection');
const QueryBuilder = require('./lib/queryBuilder');

class Mysql {

    constructor(options) {
        this.options = options;
    }

    connect() {
        return mysql.createConnection(this.options);
    }

    async query(sqlString, values) {
        let connection = await this.connect();
        let [res] = await connection.query(sqlString, values);
        connection.destroy();
        if (Array.isArray(res))
            return new collection(res);
        return res;
    }

    middleware(server) {
        const mysql = new QueryBuilder(this);
        server.bind('varal.mysql', mysql);
    }

}

exports = module.exports = Mysql;