const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    photoUrls: [{ type: String }],
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    email: { type: String, required: true }, // user email for ownership
    username: { type: String }, // optional: for display/ownership
});

module.exports = mongoose.model('Campaign', campaignSchema);
