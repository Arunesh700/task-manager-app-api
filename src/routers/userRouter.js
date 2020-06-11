const express = require('express')
const router = new express.Router();
const multer = require('multer');
const sharp = require('sharp');
const auth = require('../middleware/auth');
const removeTask = require('../middleware/removeTask');
const User = require('../models/user')
const Task = require('../models/task')
const {sendWelcomeEmail,sendCancelEmail} = require('../emails/account')
router.post('/users', async (req,res) => {
  const user = new User(req.body)
  try{
  // await user.save();
  sendWelcomeEmail(user.email,user.name);
  const token = await user.generateAuthToken()
  res.status(201).send({user,token})
}catch (e) {
  res.status(400).send(e);
}
})

router.post('/users/login',async (req,res) => {
  try {
    const user = await User.findByCredentials(req.body.email,req.body.password)
    const token = await user.generateAuthToken();

    res.send({user,token});
  } catch (e) {
      res.status(400).send();
  }
})
router.post('/users/logout',auth, async (req,res) => {
  // res.send(req.user);
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return req.token !== token.token
    })
    await req.user.save();
    res.status(200).send(req.user);
  }catch (e) {
    res.status(500).send();
  }
})
router.post('/users/logoutfromall', auth , async (req,res) => {
  try {
    const lengthToken = req.user.tokens.length;
    console.log(lengthToken);
    req.user.tokens.splice(0,lengthToken);
    await req.user.save();
    res.status(200).send(req.user);
  }
  catch (e) {
    res.status(500).send(e);
  }
})
router.get('/users/me', auth , async (req,res) => {
 res.send(req.user);
})

router.patch('/users/me', auth, async (req,res) => {

  console.log(req.body);
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name','email','password','age']
  const isValidOperation = updates.every(update => allowedUpdates.includes(update)
  )
  if(!isValidOperation) {
     return res.status(400).send({error: 'Invalid updates!'})
  }
  try {
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    })

    await req.user.save();
    //const user =  await User.findByIdAndUpdate(_id,req.body,{new: true, runValidators:true});

    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
})

router.delete('/users/me',auth, removeTask , async (req,res) => {
  try {
    sendCancelEmail(req.user.email,req.user.name)
    const user = await User.findByIdAndDelete(req.user._id);
    res.send(user);
  } catch (e) {
    res.status(500).send('There is an error');
  }
})

const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req,file,cb) {
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
      return cb(new Error('Please upload a image in jpg or jpeg or png format'))
    }
    cb(undefined,true);
  }
})
router.post('/users/me/avatar', auth, upload.single('avatar'),async (req,res) => {
  const buffer = await sharp(req.file.buffer).resize({ width:250 , height: 250 }).png().toBuffer()
  req.user.avatar = buffer;
  await req.user.save();
  res.send();
},(error,req,res,next) => {
  res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth , async (req,res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
})

router.get('/users/:id/avatar', async (req,res) => {
  try {
    const user = await User.findById(req.params.id);

    if(!user || !user.avatar) {
      throw new Error('No image found')
    }
    res.set('Content-Type', 'image/png')
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send(e)
  }
})
module.exports = router;
