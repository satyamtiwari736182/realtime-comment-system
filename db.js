
function dbConnect() {
    //Db connection
    const mongoose = require('mongoose');
    const url = 'mongodb://127.0.0.1:27017/comments';
    mongoose.connect(url);

    const connection = mongoose.connection;

    connection.once('error', function () {
        console.error.bind(console, 'Database connection failure...');
    })

    connection.once('open', function () {
        console.log('Database connected...');
    })

}

module.exports = dbConnect;