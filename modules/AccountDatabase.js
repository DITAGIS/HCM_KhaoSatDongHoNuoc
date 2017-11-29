const config = {
    user: 'khaosatdonghonuoc',
    password: 'khaosatdonghonuoc',
    server: 'ditagis.com',
    database: 'BINHDUONG_KHAOSATDONGHONUOC',
    options: {
        encrypt: false // Use this if you're on Windows Azure 
    }
}
const sql = require('mssql')
function isUser(username, password) {
    return new Promise((resolve, reject) => {
        sql.connect(config).then(() => {
            return sql.query`SELECT * FROM SYS_ACCOUNT WHERE USERNAME = ${username} AND PASSWORD = ${password}`;
        }).then(result => {
            if (result.recordset.length > 0)
                resolve(result.recordset[0])
            else resolve(null);
            sql.close();
        }).catch(err => {
            console.log(err);
            sql.close();
        })
    });
}
module.exports.isUser = isUser;