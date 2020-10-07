const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let userSchema = new Schema({
    email: {
        type: String,
        required: [true, 'Email is require']
    },
    password: {
        type: String,
        required: [true, 'Password is require']
    }
});

module.exports = mongoose.model('User', userSchema);