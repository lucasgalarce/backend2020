const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

let Schema = mongoose.Schema;

let userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: [true, 'Email is require']
    },
    password: {
        type: String,
        required: [true, 'Password is require']
    }
});

userSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
}

userSchema.plugin( uniqueValidator, {message: '{PATH} is in use'})

module.exports = mongoose.model('User', userSchema);