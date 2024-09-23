const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema({
  nome_pais: { type: String, required: true },
  description: { type: String, required: true },
  code: { type: String, required: true },
});

const Country = mongoose.model("Country", countrySchema);

module.exports = Country;
