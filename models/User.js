const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {type: String, required: true, lowercase: true},
    email: {type: String, unique: true, required: true, lowercase: true},
    password: {type: String, required: true, min: 4}
});

module.exports = mongoose.model('user', UserSchema);