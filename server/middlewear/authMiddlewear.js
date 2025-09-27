import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js';

const protect = asyncHandler (async (req, res, next)=>{
  let token
  if(req.headers.authorization && req.headers.authorization.startsWith("Bearer ")){
    try {
      token=req.headers.authorization.split(" ")[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.sub).select("-password")
      if (!req.user) {
        res.status(401)
        throw new Error('User not found')
      }
      next()
    } catch (error) {
      console.error(error)
      res.status(401)
      throw new Error("Not authorized , token failed")
    }
  }
  if (!token) {
    res.status(401)
    throw new Error("Not Authorized Token")
  }
})

export function getUserInfoFromAuthHeader(req) {
  const auth = req.headers.authorization || ''
  if (!auth.startsWith('Bearer ')) return null
  const token = auth.split(' ')[1]
  // verify to ensure it’s legit — do NOT use decode() alone for auth
  const payload = jwt.verify(token, process.env.JWT_SECRET)
  return payload // e.g., { id, name, email, isAdmin, iat, exp }
}

const admin = (req, res, next)=>{
  if (req.user && req.user.role == 'admin') {
    next()
  }else{
    res.status(401)
    throw new Error("Not Authorized as an Admin")
  }
}

export {protect, admin}
