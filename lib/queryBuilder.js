const opAccept = ['=', '<>', '>', '>=', '<', '<=', 'like'];

class QueryBuilder {

    constructor(server) {
        this.server = server;
        this._method = 'select';
        this._table = null;
        this._fields = ['*'];
        this._values = [];
        this._where = [];
        this._whereValues = [];
    }

    async query(query, values) {
        return await this.server.query(query, values);
    }

    async get() {
        this.initQuery();
        return await this.server.query(this._query, this.values);
    }

    async first() {
        let collection = await this.get();
        return collection.get(1);
    }

    initQuery() {
        this.values = [];
        this._method = this._method.toUpperCase();
        if (!this._table || typeof this._table !== 'string')
            throw new Error('Build query with invalid table name');
        let query = this._method + ' ';
        switch (this._method) {
            case 'SELECT':
                query += this._fields.join() + ' FROM `' + this._table + '`';
                if (this._where.length > 0)
                    query += ' WHERE ' + this._where.join(' AND ');
                query += ';';
                break;
            case 'INSERT':
                query += 'INTO `' + this._table + '` SET ';
                query += this._values.join(', ');
                query += ';';
                break;
            case 'UPDATE':
                query += '`' + this._table + '` SET ';
                query += this._values.join(', ');
                if (this._where.length > 0)
                    query += ' WHERE ' + this._where.join(' AND ');
                query += ';';
                break;
            case 'DELETE':
                query += 'FROM `' + this._table + '`';
                if (this._where.length > 0)
                    query += ' WHERE ' + this._where.join(' AND ');
                query += ';';
                break;
            default:
                break;
        }
        this._query = query;
        this.values = this.values.concat(this._whereValues);
        this._method = 'select';
        this._table = null;
        this._fields = ['*'];
        this._values = [];
        this._where = [];
        this._whereValues = [];
    }

    table(table) {
        this._table = table;
        return this;
    }

    select(fields) {
        if (typeof fields === "string" && fields !== '*')
            this._fields = ['`' + fields + '`'];
        else if (Array.isArray(fields))
            this._fields = fields;
        return this;
    }

    async insert(values) {
        this._method = 'insert';
        this.setValues(values);
        this.initQuery();
        return await this.server.query(this._query, this.values);
    }

    async update(values) {
        this._method = 'update';
        this.setValues(values);
        this.initQuery();
        return await this.server.query(this._query, this.values);
    }

    async delete() {
        this._method = 'delete';
        this.initQuery();
        return await this.server.query(this._query, this.values);
    }

    setValues(values) {
        for (let key in values)
            if (values.hasOwnProperty(key)) {
                let value = values[key];
                this._values.push('`' + key + '` = ?');
                this.values.push(value);
            }
    }

    where(key, op, value) {
        if (value === undefined) {
            value = op;
            op = '=';
        }
        if (opAccept.indexOf(op) < 0)
            op = '=';
        this._where.push('`' + key + '` ' + op + ' ?');
        this._whereValues.push(value);
        return this;
    }

}

exports = module.exports = QueryBuilder;