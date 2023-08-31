const mysql = require('../mysqlhelper');

class Model {
    static fields = []
    static table = null;
    // EXAMPLE
    // const account = await Account.find(pginstance, {
    //   select : "*",
    //   join: [
    //       {
    //           type: 'left join',
    //           table: 'table',
    //           on: `maintable.id = table.id and table.is_deleted = 'N'`
    //       }
    //   ],
    //   where : {
    //     id: '12',    
    //     phone : {expression : " like '123%'"},
    //     _custom: [
    //          {
    //              sql: `and (:value:) = any(announcement.client_types)`,
    //              value: client_type
    //          },
    //          {
    //              sql: `and table.column between (:value0:) and (:value1:)`,
    //              value_arr: [ item0 , item1 ]
    //          }
    //          {
    //              sql: `and 1=1`,
    //              no_value: true
    //          }
    //     ]
    //   }
    //   order: 'order by id desc nulls last',
    //   limit: 100,
    //   offset: 0
    //   for_update: 'for update nowait';
    // });
    static async find(pginstance, {
        table = null,
        select = '*',
        joins = [],
        where = {},
        order = null,
        group = null,
        limit = null,
        offset = null,
        for_update = null,
    }) {
        if (limit > 1000) throw new Error('max limit is 1000');
        const sqlJoins = this.stringifyJoins(joins);
        const clearedWhere = this.clear(where);
        const statement = this.generateFindStatement({table: table || this.table, select, where : clearedWhere, joins: sqlJoins, order, limit, offset, for_update, group});
        console.log(statement);
        const result = await pginstance.query(statement.sql, statement.params);
        return result.rows; 
    }

    // EXAMPLE
    // const account = await Account.update(pginstance, {
    //   values : {
    //     phone : '1234',
    //     updated_on_tz : {expression : "now()"},
    //     old_phone : null,
    //     created_on_tz : undefined
    //   },
    //   where : {
    //     id: '12',    
    //     phone : {expression : " like '123%'"},
    //     _custom: [
    //          {
    //              sql: `and (:value:) = any(announcement.client_types)`,
    //              value: client_type
    //          },
    //          {
    //              sql: `and table.column between (:value0:) and (:value1:)`,
    //              value_arr: [ item0 , item1 ]
    //          }
    //          {
    //              sql: `and 1=1`,
    //              no_value: true
    //          }
    //     ]
    //   }
    // });
    static async update(pginstance, {
        values,
        where,
        returning = null
    }) {
        let clearedValues = this.clear(values);
        let clearedWhere = this.clear(where);
        const statement = this.generateUpdateStatement({values : clearedValues, where : clearedWhere, returning});
        console.log(statement);
        const result = await pginstance.query(statement.sql, statement.params);
        return result.rows; 
    }

    // EXAMPLE
    // const account = await Account.create(pginstance,{values : {
    //   // account_id : 1,
    //   phone : '1232',
    //   created_on_tz : {expression : "now()"},
    //   updated_on_tz : undefined,
    //   email : null,
    //   old_phone : "",
    //   is_deleted : 'Y'
    // }});

    static async create(pginstance, {
        values,
        returning = null,
        on_conflict = null
    }) {
        let clearedValues = this.clear(values);
        const statement = this.generateCreateStatement({values : clearedValues, returning, on_conflict});
        console.log(statement);
        const result = await pginstance.query(statement.sql, statement.params);
        return result.rows;
    }

    static async delete(pginstance, {
        where
    }) {
        let clearedWhere = this.clear(where);
        const statement = this.generateDeleteStatement({ where : clearedWhere });
        console.log(statement);
        const result = await pginstance.query(statement.sql, statement.params);
        return result.rows; 
    }

    static validate(fields) {
        const errors = [];
        for ( const field of Object.keys(fields) ) {
            if (!this.fields.includes(field)) {
                errors.push("not valid field list");
            } 
        }
        return errors;
    }

    static clear(fields) {
        const clearedFields = {};
        for ( const field of Object.keys(fields) ) {
            if (fields[field] !== undefined) {
                clearedFields[field] = fields[field];
            } 
        }
        return clearedFields;
    }

    static clearCustom(array) {
        const clearedFields = [];
        for ( const field of array ) {
            if ((Array.isArray(field.value_arr) && !field.value_arr.includes(undefined)) ||
                field.value !== undefined ||
                field.no_value){
                clearedFields.push(field);
            } 
        }
        return clearedFields;
    }

    static stringifyJoins(joins) {
        let sql = '';
        for (let join of joins){
            sql+= ` ${join.type || 'inner join'} ${join.table} on ${join.on} `;
        }
        return sql;
    }

    static generateFindStatement({ table, select, where, joins, order, limit, offset, for_update, group} ) {
        let params = [];
        let sql = ` select ${select} from ${table} ${joins}`;

        sql += ` where 1=1 `;
        for (const keyWhere of Object.keys(where) ) {
            if (keyWhere === '_custom') {
                const customs = this.clearCustom(where[keyWhere]);
                for (let custom_where of customs){
                    if (custom_where.no_value){
                        sql += ` ${custom_where.sql} `;
                    } else if (custom_where.value_arr){
                        let tempSql = ` ${custom_where.sql} `;
                        for (let i = 0; i < custom_where.value_arr.length; i++){
                            params.push(custom_where.value_arr[i]);
                            tempSql = tempSql.replace(new RegExp(`\\(:value${i}:\\)`, 'g'), `$${params.length}`);
                        }
                        sql += tempSql;
                    } else {
                        params.push(custom_where.value);
                        sql += ` ${custom_where.sql.replace(/\(:value:\)/g, `$${params.length}`)} `;
                    }
                }
            } else if (typeof where[keyWhere] === "object" && where[keyWhere] !== null) {
                sql += ` and ${keyWhere} ${where[keyWhere].expression} `
            } else {
                params.push(where[keyWhere]);
                sql += ` and ${keyWhere} = $${params.length} `
            }
        }

        if (group) sql += ` group by ${group} `;
        if (order) sql += ` order by ${order} `;

        if (limit != null){
            params.push(limit)
            sql += ` limit $${params.length} `;
        }
        if (offset != null){
            params.push(offset)
            sql += ` offset $${params.length} `;
        } 
        
        if (for_update) sql += ` for update ${for_update} `;
        return {
            sql : sql,
            params : params
        };
    }

    static generateCreateStatement({values, returning, on_conflict}) {

        const params = [];
        let sql = ` insert into ${this.table}( `;
        let sqlValues = ` values( `;
        for (const keyValue of Object.keys(values) ) {
            console.log(keyValue, typeof values[keyValue])
            if ( typeof values[keyValue] === "object" 
                 && values[keyValue] !== null
                 && !Array.isArray(values[keyValue]) ) {
                sql += ` ${keyValue}, `;
                sqlValues += ` ${values[keyValue].expression}, `;
            } else {
                params.push(values[keyValue]);
                sql += ` ${keyValue}, `;
                sqlValues += ` $${params.length}, `;
            }
        }
        sql = sql.slice(0,-2);
        sql += ` ) `;
        sql += sqlValues;
        sql = sql.slice(0,-2);
        sql += ` ) `; 

        if (on_conflict) sql += ` on conflict ${on_conflict} `;

        sql += ` returning ${returning || '*'} `

        return {
            sql : sql,
            params : params
        };
    }

    static generateUpdateStatement({values,where, returning}) {
        const params = [];
        let sql = ` update ${this.table} set `;
        for (const keyValue of Object.keys(values) ) {
            if ( typeof values[keyValue] === "object" 
                 && values[keyValue] !== null
                 && !Array.isArray(values[keyValue])) {
                sql += ` ${keyValue} = ${values[keyValue].expression}, `
            } else {
                params.push(values[keyValue]);
                sql += ` ${keyValue} = $${params.length}, `
            }
        }
        sql = sql.slice(0,-2);
        sql += ` where 1=1 `;
        for (const keyWhere of Object.keys(where) ) {
            if (keyWhere === '_custom') {
                const customs = this.clearCustom(where[keyWhere]);
                for (let custom_where of customs){
                    if (custom_where.no_value){
                        sql += ` ${custom_where.sql} `;
                    } else if (custom_where.value_arr){
                        let tempSql = ` ${custom_where.sql} `;
                        for (let i = 0; i < custom_where.value_arr.length; i++){
                            params.push(custom_where.value_arr[i]);
                            tempSql = tempSql.replace(new RegExp(`\\(:value${i}:\\)`, 'g'), `$${params.length}`);
                        }
                        sql += tempSql;
                    } else {
                        params.push(custom_where.value);
                        sql += ` ${custom_where.sql.replace(/\(:value:\)/g, `$${params.length}`)} `;
                    }
                }
            } else if (typeof where[keyWhere] === "object" && where[keyWhere] !== null) {
                sql += ` and ${keyWhere} ${where[keyWhere].expression} `
            } else {
                params.push(where[keyWhere]);
                sql += ` and ${keyWhere} = $${params.length} `
            }
        }

        if (returning) sql += ` returning ${returning} `;

        return {
            sql : sql,
            params : params
        };
    }

    static generateDeleteStatement({where}) {
        const params = [];
        let sql = ` delete from ${this.table} `;
        sql += ` where 1=1 `;
        for (const keyWhere of Object.keys(where) ) {
            if (keyWhere === '_custom') {
                const customs = this.clearCustom(where[keyWhere]);
                for (let custom_where of customs){
                    if (custom_where.no_value){
                        sql += ` ${custom_where.sql} `;
                    } else if (custom_where.value_arr){
                        let tempSql = ` ${custom_where.sql} `;
                        for (let i = 0; i < custom_where.value_arr.length; i++){
                            params.push(custom_where.value_arr[i]);
                            tempSql = tempSql.replace(new RegExp(`\\(:value${i}:\\)`, 'g'), `$${params.length}`);
                        }
                        sql += tempSql;
                    } else {
                        params.push(custom_where.value);
                        sql += ` ${custom_where.sql.replace(/\(:value:\)/g, `$${params.length}`)} `;
                    }
                }
            } else if (typeof where[keyWhere] === "object" && where[keyWhere] !== null) {
                sql += ` and ${keyWhere} ${where[keyWhere].expression} `
            } else {
                params.push(where[keyWhere]);
                sql += ` and ${keyWhere} = $${params.length} `
            }
        }
        return {
            sql : sql,
            params : params
        };
    }

}

module.exports = Model;