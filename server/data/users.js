import bcrypt from 'bcryptjs'
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'admin'
  },
  {
    name: 'ALi Ahmad',
    email: 'ali@example.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'user'
  },
  {
    name: 'joshua lazar',
    email: 'josh@example.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'user'
  },
]
export default users
