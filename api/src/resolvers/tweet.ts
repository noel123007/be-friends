import { Types } from "mongoose"
import { AppError } from "../common/errors/AppError"
import { ITweet } from "../models/tweet"
import { createTweetSchema, tweetPaginationSchema, type TweetPaginationInput } from "../schema/validation/tweet"
import { Context } from "../types"
import { ActivityType } from "../types/enums"
import { logger } from "../util/logger"
import { validate } from "../util/validate"

interface TweetPopulated extends ITweet {
  author: {
    _id: Types.ObjectId
    name: string
    email: string
    avatar?: string
  }
}

export const tweetResolvers = {
  Query: {
    tweets: async (_: unknown, args: TweetPaginationInput, { models, user }: Context) => {
      try {
        const { cursor, limit = 10 } = await validate(tweetPaginationSchema, args)

        const query: any = {}
        if (cursor) {
          query._id = { $lt: new Types.ObjectId(cursor) }
        }

        const tweets = await models.Tweet
          .find(query)
          .sort({ createdAt: -1 })
          .limit(limit + 1)
          .populate({ 
            path: 'authorId',
            select: 'userId avatar',
            model: 'Profile',
            foreignField: 'userId',
            localField: 'authorId',
            populate: {
              path: 'userId',
              select: '-password',
              model: 'User',
              foreignField: '_id',
              localField: 'userId'
            },
            strictPopulate: false
          }) as any
          
        const hasNextPage = tweets.length > limit
        const edges = tweets.slice(0, limit).map((tweet: any) => ({
          node: {
            content: tweet.content,
            likes: tweet.likes,
            createdAt: tweet.createdAt,
            updatedAt: tweet.updatedAt,
            author: {
              id: tweet.authorId.userId._id.toString(),
              name: tweet.authorId.userId.name,
              email: tweet.authorId.userId.email,
              avatar: tweet.authorId.avatar
            },
            id: tweet._id.toString(),
            isLiked: user ? tweet.likedBy.some((id: any) => id.equals(new Types.ObjectId(user.id))) : false
          },
          cursor: tweet._id.toString()
        }))

        logger.info('Fetched tweets list', {
          count: edges.length,
          hasNextPage
        })

        return {
          edges,
          pageInfo: {
            hasNextPage,
            endCursor: edges[edges.length - 1]?.cursor
          }
        }
      } catch (error) {
        logger.error('Fetch tweets error:', error)
        throw error
      }
    },

    tweet: async (_: unknown, { id }: { id: string }, { models, user }: Context) => {
      try {
        const tweet = await models.Tweet
          .findById(id)
          .populate({ 
            path: 'authorId',
            select: 'userId avatar',
            model: 'Profile',
            foreignField: 'userId',
            localField: 'authorId',
            populate: {
              path: 'userId',
              select: '-password',
              model: 'User',
              foreignField: '_id',
              localField: 'userId'
            },
            strictPopulate: false
          }) as any

        if (!tweet) throw AppError.notFound('Tweet not found')

        return {
          content: tweet.content,
          likes: tweet.likes,
          createdAt: tweet.createdAt,
          updatedAt: tweet.updatedAt,
          author: {
            id: tweet.authorId.userId._id.toString(),
            name: tweet.authorId.userId.name,
            email: tweet.authorId.userId.email,
            avatar: tweet.authorId.avatar
          },
          id: tweet._id.toString(),
          isLiked: user ? tweet.likedBy.some((id: any) => id.equals(new Types.ObjectId(user.id))) : false
        }
      } catch (error) {
        logger.error('Fetch tweet error:', error)
        throw error
      }
    }
  },

  Mutation: {
    createTweet: async (
      _: unknown, 
      { input }: { input: { content: string } }, 
      { models, user, pubsub }: Context
    ) => {
      if (!user) throw AppError.unauthorized()

      try {
        const validatedInput = await validate(createTweetSchema, input)

        const tweet = await models.Tweet.create({
          content: validatedInput.content.trim(),
          authorId: new Types.ObjectId(user.id),
          likes: 0,
          likedBy: []
        })

        const populatedTweet = await models.Tweet
          .findById(tweet._id)
          .populate({ 
            path: 'authorId',
            select: 'userId avatar',
            model: 'Profile',
            foreignField: 'userId',
            localField: 'authorId',
            populate: {
              path: 'userId',
              select: '-password',
              model: 'User',
              foreignField: '_id',
              localField: 'userId'
            },
            strictPopulate: false
          }) as any
       

        if (!populatedTweet) {
          throw AppError.internal('Failed to create tweet')
        }

        await models.Activity.create({
          userId: new Types.ObjectId(user.id),
          type: ActivityType.TWEET_CREATED,
          message: 'created a new tweet',
          data: { tweetId: tweet._id }
        })

        pubsub.publish('ACTIVITY_CREATED', {
          activityCreated: {
            type: ActivityType.TWEET_CREATED,
            user,
            data: { tweetId: tweet._id },
            createdAt: new Date()
          }
        })

        logger.info('Tweet created:', {
          userId: user.id,
          tweetId: tweet._id.toString()
        })

        return {
          success: true,
          message: 'Tweet created successfully',
          tweet: {
            id: populatedTweet._id.toString(),
            content: populatedTweet.content,
            author: {
              id: user.id,
              name: user.name,
              email: user.email,
              avatar: populatedTweet.authorId.avatar
            },
            likes: populatedTweet.likes,
            isLiked: false,
            createdAt: populatedTweet.createdAt,
            updatedAt: populatedTweet.updatedAt
          }
        }
      } catch (error) {
        logger.error('Create tweet error:', error)
        throw error
      }
    },

    likeTweet: async (_: unknown, { id }: { id: string }, { models, user }: Context) => {
      if (!user) throw AppError.unauthorized()

      try {
        const tweet = await models.Tweet.findById(id)
        if (!tweet) throw AppError.notFound('Tweet not found')

        const userId = new Types.ObjectId(user.id)
        const alreadyLiked = tweet.likedBy.some(id => id.equals(userId))
        if (alreadyLiked) {
          throw AppError.badRequest('Tweet already liked')
        }

        tweet.likes += 1
        tweet.likedBy.push(userId)
        await tweet.save()

        logger.info('Tweet liked:', {
          userId: user.id,
          tweetId: id
        })

        return {
          success: true,
          message: 'Tweet liked successfully'
        }
      } catch (error) {
        logger.error('Like tweet error:', error)
        throw error
      }
    },

    unlikeTweet: async (_: unknown, { id }: { id: string }, { models, user }: Context) => {
      if (!user) throw AppError.unauthorized()

      try {
        const tweet = await models.Tweet.findById(id)
        if (!tweet) throw AppError.notFound('Tweet not found')

        const userId = new Types.ObjectId(user.id)
        const likedIndex = tweet.likedBy.findIndex(id => id.equals(userId))
        if (likedIndex === -1) {
          throw AppError.badRequest('Tweet not liked')
        }

        tweet.likes -= 1
        tweet.likedBy.splice(likedIndex, 1)
        await tweet.save()

        logger.info('Tweet unliked:', {
          userId: user.id,
          tweetId: id
        })

        return {
          success: true,
          message: 'Tweet unliked successfully'
        }
      } catch (error) {
        logger.error('Unlike tweet error:', error)
        throw error
      }
    }
  },

  Tweet: {
    author: async (tweet: TweetPopulated, _: unknown, { models }: Context) => {
      try {
        if (tweet.author) {
          return {
            id: tweet.author._id.toString(),
            name: tweet.author.name,
            email: tweet.author.email,
            avatar: tweet.author.avatar
          }
        }

        const author = await models.User.findById(tweet.authorId).select('-password')
        if (!author) throw AppError.notFound('Tweet author not found')

        return {
          id: author._id.toString(),
          name: author.name,
          email: author.email,
          avatar: author.avatar
        }
      } catch (error) {
        logger.error('Resolve tweet author error:', error)
        throw error
      }
    }
  }
} 