import bcrypt from 'bcryptjs'
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'admin'
  },
  {
    name: 'Suresh M',
    email: 'suresh@example.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'seller'
  },
  {
    name: 'joshua lazar',
    email: 'josh@example.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'customer'
  },
]
export default users
