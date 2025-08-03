const mongoose = require("mongoose")

const CatagoriesSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
});

const Catagories = mongoose.model("catagories", CatagoriesSchema);
module.exports = Catagories;

