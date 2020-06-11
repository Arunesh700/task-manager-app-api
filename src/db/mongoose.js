const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URL,{
  useNewUrlParser:true,
  useCreateIndex:true,
  useFindAndModify: false
})












//
// task1.save().then(() => {
//   console.log(task1);
// }).catch((err) => {
//   console.log(error);
// })
