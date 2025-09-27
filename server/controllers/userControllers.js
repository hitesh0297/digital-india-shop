import asyncHandle from 'express-async-handler';
import User from '../models/userModel.js'
import generateToken from '../Utils/GenerateToken.js'
//@dec auth user & get token
//@route POST /api/users/login
//@access Public
const authUsers = asyncHandle(async(req,res)=>{
  const {email , password} = req.body
  const user = await User.findOne({ email})
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    })
  }else{
    res.status(401)
    throw new Error("Invaild email and password")
  }
})
//@dec Register User a new
//@route POST /api/users
//@access Public
const registerUser = asyncHandle(async(req,res)=>{
  const { name ,email , password} = req.body
  const userExists = await User.findOne({ email})
  if (userExists){
    res.status(400)
    throw new Error("User Already exists")
  }
  const user = await User.create({ name, email, password})
  if (user){
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    })
  } else{
    res.status(400)
    throw new Error("Invaild user Data")
  }
})
//@dec GET user & profile
//@route GET /api/users/profile
//@access Private
const getUserProfile = asyncHandle(async(req,res)=>{
  const user = await User.findById(req.params.userId)

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
  }else{
    res.status(404)
    throw new Error("User Not Found")
  }
})
//@dec Update user & profile
//@route Put /api/users/profile
//@access Private
const updateUserProfile = asyncHandle(async(req,res)=>{
  const user = await User.findById(req.body._id)
  if (user) {
    user.name =req.body.name || user.name
    user.email = req.body.email || user.email
    if (req.body.password) {
      user.password = req.body.password
    }
    const updatedUser = await user.save()
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(user._id)
    })
  }else{
    res.status(404)
    throw new Error("User Not Found")
  }
})
//@dec GET All Users
//@route GET /api/users
//@access Private/admin
const getUsers = asyncHandle(async(req,res)=>{
  const users = await User.find({})
  res.status(201).json(users);
})

//@dec Delete User
//@route Delete /api/users/:userId
//@access Private/admin
const deleteUser = asyncHandle(async(req,res)=>{
  try {
    const user = await User.findById(req.params.userId)
    if (user) {
      await user.deleteOne()
      res.send({message:"User deleted successfully"})
    }else{
      res.status(404)
      throw new Error("User Not Found")
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' }) // 500 for unexpected issues
  }
})
//@dec GET Users by id
//@route GET /api/users/:userId
//@access Private/admin
const getUserById = asyncHandle(async(req,res)=>{
  const user = await User.findById(req.params.id).select('-password')
  if(user) {
    res.json(user)
  }else{
    res.status(404)
    throw new Error("User Not Found")
  }
})
//@dec Update user
//@route Put /api/users/:id
//@access Private/admin
const updateUser = asyncHandle(async(req,res)=>{
  const user = await User.findById(req.params.userId)
  if (user) {
    user.name =req.body.name || user.name
    user.email = req.body.email || user.email
    user.role=req.body.role || user.role
    const updatedUser = await user.save()
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    })
  }else{
    res.status(404)
    throw new Error("User Not Found")
  }
})
export {authUsers , registerUser ,getUserProfile, updateUserProfile , getUsers , deleteUser ,getUserById ,updateUser}
