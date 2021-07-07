const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  email: String, // String is shorthand for {type: String}
  password: String,
});

userSchema.methods.validPassword = function (inputPassword) {
  return this.password === inputPassword;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
