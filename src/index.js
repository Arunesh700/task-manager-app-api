const express = require('express')
require('./db/mongoose')
const app = express();
const port = process.env.PORT
const userRouter = require('./routers/userRouter')
const taskRouter = require('./routers/taskRouter')
app.use(express.json())


app.use(userRouter,taskRouter);
app.listen(port,() => {
  console.log('Server is up on port ' + port);
})
