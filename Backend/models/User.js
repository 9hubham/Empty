const mongoose = require("mongoose");
const { Schema } = mongoose;
const UserSchema = new Schema({
  
});
const user = mongoose.model('user',UserSchema);
module.exports = user
