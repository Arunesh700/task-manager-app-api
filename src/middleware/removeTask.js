
const Task = require('../models/task');

const removeTask = async (req,res,next) => {
  try {
    await Task.deleteMany({owner:req.user._id});

    next()
  }catch (e) {
    res.status(500).send(e);
  }
}

module.exports = removeTask;
