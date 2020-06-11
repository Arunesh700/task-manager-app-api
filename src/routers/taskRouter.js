const express = require('express')
const taskRouter = new express.Router()
const auth = require('../middleware/auth');
const User = require('../models/user')
const Task = require('../models/task')

taskRouter.patch('/tasks/:id', auth , async (req,res) => {
  // console.log(req.params.id);
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description','completed']
  const isValidOperation = updates.every(update => allowedUpdates.includes(update)
  )
  if(isValidOperation === false) {
     return res.status(400).send({error: 'Invalid updates!'})
  }
  const _id = req.params.id;
  try {
  //  const task = await Task.findById(req.params.id);
  const task =  await Task.findOne({_id,owner:req.user._id})


    if(!task) {
       return res.status(404).send()
    }
    updates.forEach( update => task[update] = req.body[update])

    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }

})
taskRouter.delete('/tasks/:id',auth, async (req,res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id:req.params.id,
      owner : req.user._id
    });
    if (!task) {
      return res.status(404).send('Document not found')
    }
    res.send(task);
  } catch (e) {
    res.status(500).send('There is an error');
  }
})
taskRouter.get('/tasks',auth,async (req,res) => {
  const match = {}
  const sort = {}
  if (req.query.completed) {
    match.completed = req.query.completed === 'true'
  }
   if(req.query.sortBy) {
     const parts = req.query.sortBy.split(':');
     if (parts[1]=== 'desc') {
       sort[parts[0]] = -1
     } else {
       sort[parts[0]] = 1
     }
   }
   try{
  await req.user.populate({
    path: 'tasks',
    match,
    options: {
      limit: parseInt(req.query.limit),
      skip: parseInt(req.query.skip),
      sort
    }
  }).execPopulate();
  res.status(200).send(req.user.tasks);
}catch (e) {
  res.status(404).send(e);
}
})
taskRouter.get('/tasks/:id', auth , async (req,res) => {
  const _id = req.params.id;
  try{
   const task = await Task.findOne({ _id, owner: req.user._id})
   if(!task) {
     return res.status(404).send()
   }
   res.status(200).send(task);
}catch (error){
  res.status(400).send(error);
}
})
taskRouter.post('/tasks', auth , async (req,res) => {

  const task = new Task({
    ...req.body,
    owner:req.user._id
  })
  try{
  await task.save();
  res.status(201).send(task)
}catch (e) {
  res.status(400).send(e);
}
})

module.exports = taskRouter;
