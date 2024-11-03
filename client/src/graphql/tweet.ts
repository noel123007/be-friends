import { gql } from '@apollo/client';

export const CREATE_TWEET = gql`
  mutation CreateTweet($input: CreateTweetInput!) {
    createTweet(input: $input) {
      success
      message
      tweet {
        id
        content
        createdAt
      }
    }
  }
`;

export const GET_TWEETS = gql`
  query GetTweets($cursor: String, $limit: Int) {
    tweets(cursor: $cursor, limit: $limit) {
      edges {
        node {
          id
          content
          author {
            id
            name
            avatar
          }
          likes
          isLiked
          createdAt
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const LIKE_TWEET = gql`
  mutation LikeTweet($id: ID!) {
    likeTweet(id: $id) {
      success
      message
    }
  }
`;

export const UNLIKE_TWEET = gql`
  mutation UnlikeTweet($id: ID!) {
    unlikeTweet(id: $id) {
      success
      message
    }
  }
`;
