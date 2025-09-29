// models/paymentModel.js
import mongoose from 'mongoose'
const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    method: { type: String, enum: ['card', 'upi'], required: true },
    // Only non-sensitive data:
    details: {
      nameOnCard: String,
      last4: String,
      brandGuess: String,
      expMonth: String,
      expYear: String,
      upiId: String,
      reference: String,
    },
    meta: mongoose.Schema.Types.Mixed,
    status: { type: String, default: 'captured' },
  },
  { timestamps: true }
)
export default mongoose.model('Payment', paymentSchema)
