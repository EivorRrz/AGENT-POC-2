const MYSQL_TYPE_MAP = {
    /**
     * The variations of the mapping here..!
     */
    'INTEGER': 'INT',
    'INT': 'INT',
    'BIGINT': 'BIGINT',
    'SMALLINT': 'SMALLINT',
    'VARCHAR': 'VARCHAR(255)',
    'TEXT': 'TEXT',
    'CHAR': 'CHAR',
    'BOOLEAN': 'BOOLEAN',
    'BOOL': 'BOOLEAN',
    'DATE': 'DATE',
    'TIMESTAMP': 'TIMESTAMP',
    'DATETIME': 'DATETIME',
    'DECIMAL': 'DECIMAL(18,2)',
    'NUMERIC': 'DECIMAL(18,2)',
    'FLOAT': 'FLOAT',
    'DOUBLE': 'DOUBLE',
    'JSON': 'JSON'
};

//this function means that we are going to map the generic type to the mysql type..!
//this generic type is parameter we will pass from metadata and take it and make it upperCase..!
//if not there then we will return the VARCHAR(255)
export function mapToMySQLType(genericType) {
    return MYSQL_TYPE_MAP[genericType.toUpperCase()] || 'VARCHAR(255)';//if the generic type is not found in the MYSQL_TYPE_MAP then we will return the VARCHAR(255)
}