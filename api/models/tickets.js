const mongoose = require("mongoose");

const ticketSchema = mongoose.Schema({
  title: { type: String, required: true },
  ticket_price: { type: Number },
  from_location: { type: String },
  to_location: { type: String },
  to_location_photo_url: { type: String },
  id: { type: String, required: false },
});

module.exports = mongoose.model("Tickets", ticketSchema);
