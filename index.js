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

    static varal(options) {
        const builder = Mysql.new(options);
        return server => server.bind('varal.mysql', builder);
    }

    static new(options) {
        const mysql = new Mysql(options);
        return new QueryBuilder(mysql);
    }

}

exports = module.exports = Mysql;