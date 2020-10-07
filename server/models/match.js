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
    },
    awayTeam: {
        type: String,
        required: [true, 'Away team is necessary']
    },
    awayScore: {
        type: String,
        required: [true, 'Away score is necessary']
    },
    fullString: {
        type: String,
    }
});

module.exports = mongoose.model( 'Match', matchSchema);