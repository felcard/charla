const mongoose = require('mongoose');
require('dotenv').config({
    path: `${__dirname}/mongo.env`
});
const mongoPath = process.env.ATLAS_URI;
mongoose.connect(mongoPath, {
    useNewUrlParser: true, useUnifiedTopology: true,
});


module.exports = mongoose.model('code', {
    id: { type: String, default: "codigo" },
    session: { type: String },
    duration: { type: String, default: "1h" }
});

//if using the following method to retrieve collections where we dont specified schema: const Code = mongoose.model('code', {});
//we then need to use the  method lean() as in: 
//Code.find().then(data => console.log(data[0].id));
//above turns mongoose document into a javascript object. at first sight they look the same but they dont work the same way