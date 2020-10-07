const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let matchSchema = new Schema({
    localTeam: {
        type: String,
        required: [true, 'Local team is necessary']
    },
    localScore: {
        type: String,
        required: [true, 'Local score is necessary']
    }
});

module.exports = mongoose.model( 'Match', matchSchema);