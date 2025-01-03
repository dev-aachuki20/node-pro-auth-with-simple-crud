const mongoose = require('mongoose');
const dburi = 'mongodb://127.0.0.1:27017/node_collection';

const connectDB = async () => {
    try {
        await mongoose.connect(dburi);
        console.log('Connected to MongoDB successfully!');
    } catch (error) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    }

}

module.exports = connectDB;





// ###### Connect mysql db
// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     dbname: 'node_db'
// });

// connection.connect(function (err) {
//     if (err) {
//         console.log('Error occured while conecting database.');
//     } else {
//         console.log('connected successfully with mysql db');
//     }
// });