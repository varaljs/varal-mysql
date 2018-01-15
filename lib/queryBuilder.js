const opAccept = ['=', '<>', '>', '>=', '<', '<=', 'like'];

class QueryBuilder {

    constructor(server, table) {
        this.server = server;
        this._table = table;
        this._query = '';
        this._values = [];
        this._method = 'select';
        this._fields = ['*'];
        this._insertPlaceholder = [];
        this._wherePlaceholder = [];
        this._whereValues = [];
    }

    async get(num) {
        this.buildQuery();
        let collection = await this.server.query(this._query, this._values);
        if (typeof num === 'number')
            return collection.get(num);
        return collection;
    }

    async first() {
        return await this.get(1);
    }

    async insert(values) {
        this._method = 'insert';
        this.values(values);
        this.buildQuery();
        return await this.server.query(this._query, this._values);
    }

    async update(values) {
        this._method = 'update';
        this.values(values);
        this.buildQuery();
        console.log(this._query);
        console.log(this._values);
        return await this.server.query(this._query, this._values);
    }

    async delete() {
        this._method = 'delete';
        this.buildQuery();
        return await this.server.query(this._query, this._values);
    }

    select(fields) {
        if (typeof fields === 'string' && fields !== '*')
            this._fields = ['`' + fields + '`'];
        else if (Array.isArray(fields))
            this._fields = fields;
        return this;
    }

    where(key, op, value) {
        if (value === undefined) {
            value = op;
            op = '=';
        }
        if (opAccept.indexOf(op) < 0)
            op = '=';
        this._wherePlaceholder.push('`' + key + '` ' + op + ' ?');
        this._whereValues.push(value);
        return this;
    }

    values(values) {
        for (let key in values)
            if (values.hasOwnProperty(key)) {
                let value = values[key];
                this._insertPlaceholder.push('`' + key + '` = ?');
                this._values.push(value);
            }
    }

    buildQuery() {
        this._method = this._method.toUpperCase();
        if (!this._table || typeof this._table !== 'string')
            throw new Error('Build query with invalid table name');
        let query = this._method + ' ';
        switch (this._method) {
            case 'SELECT':
                query += this._fields.join() + ' FROM `' + this._table + '`';
                if (this._wherePlaceholder.length > 0)
                    query += ' WHERE ' + this._wherePlaceholder.join(' AND ');
                query += ';';
                break;
            case 'INSERT':
                query += 'INTO `' + this._table + '` SET ';
                query += this._insertPlaceholder.join(', ');
                query += ';';
                break;
            case 'UPDATE':
                query += '`' + this._table + '` SET ';
                query += this._insertPlaceholder.join(', ');
                if (this._wherePlaceholder.length > 0)
                    query += ' WHERE ' + this._wherePlaceholder.join(' AND ');
                query += ';';
                break;
            case 'DELETE':
                query += 'FROM `' + this._table + '`';
                if (this._wherePlaceholder.length > 0)
                    query += ' WHERE ' + this._wherePlaceholder.join(' AND ');
                query += ';';
                break;
            default:
                break;
        }
        this._query = query;
        this._values = this._values.concat(this._whereValues);
    }

}

exports = module.exports = QueryBuilder;