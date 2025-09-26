const {Sequelize} = require('sequelize')

module.exports = new Sequelize(
    'telega_bot',
    'isobel',
    '9876789',
    {
        host: '185.31.165.91',
        port: '5432',
        dialect: 'postgres'
    }
)