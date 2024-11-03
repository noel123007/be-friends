import mongoose, { Document, Schema, Types } from 'mongoose'
import { IUser } from './User'

export interface ITweet extends Document {
  _id: Types.ObjectId
  content: string
  authorId: IUser['_id']
  likes: number
  likedBy: IUser['_id'][]
  createdAt: Date
  updatedAt: Date
}

const tweetSchema = new Schema<ITweet>(
  {
    content: {
      type: String,
      required: true,
      maxlength: 280
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    likes: {
      type: Number,
      default: 0
    },
    likedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  {
    timestamps: true
  }
)

// Add indexes
tweetSchema.index({ author: 1, createdAt: -1 })
tweetSchema.index({ createdAt: -1 })

export const Tweet = mongoose.model<ITweet>('Tweet', tweetSchema) 