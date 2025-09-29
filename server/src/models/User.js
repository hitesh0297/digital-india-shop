// 📦 Import mongoose for schema & model creation
import mongoose from 'mongoose'

// 🔐 Import bcryptjs for password hashing
import bcrypt from 'bcryptjs'


const userSchema = mongoose.Schema(
  {
    // 🧍 User's full name
    name: { type: String, required: true },

    // 📧 User's email (must be unique)
    email: { type: String, required: true, unique: true },

    // 🔑 Hashed password (not plain text)
    password: { type: String, required: true },

    // 👑 Whether user is admin, customer, seller
    role: { type: String, required: true, default: 'customer' },
  },

  // 🕒 Automatically add createdAt and updatedAt fields
  { timestamps: true }
)

userSchema.methods.matchPassword = async function (enteredPassword) {
  // Compare entered password with the hashed password in DB
  // ✅ Returns true if passwords match, false if not
  return await bcrypt.compare(enteredPassword, this.password)
}



userSchema.pre('save', async function (next) {
  // 🛑 If password is not modified (like updating profile), skip hashing
  if (!this.isModified('password')) return next()     // only hash when changed
  
  this.password = await bcrypt.hash(this.password, 10)
  next()

  // 🧂 Generate a salt (extra random string for security)
  const salt = await bcrypt.genSalt(10)

  // 🔐 Hash the password using bcrypt and salt
  this.password = await bcrypt.hash(this.password, salt)

  // ✅ Move to the next step (saving user)
  next()
})

// This creates a User collection in MongoDB with the defined schema.
const User = mongoose.model('User', userSchema)
export default User
