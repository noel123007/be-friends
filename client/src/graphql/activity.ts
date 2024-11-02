import { gql } from '@apollo/client';

export const GET_ACTIVITIES = gql`
  query GetActivities($cursor: String, $limit: Int, $type: [ActivityType]) {
    activities(cursor: $cursor, limit: $limit, type: $type) {
      edges {
        node {
          id
          type
          message
          createdAt
          user {
            id
            name
            email
            avatar
          }
          data
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

export const ACTIVITY_CREATED = gql`
  subscription OnActivityCreated {
    activityCreated {
      id
      type
      message
      createdAt
      user {
        id
        name
        email
        avatar
      }
      data
    }
  }
`;

export const GET_USER_ACTIVITIES = gql`
  query GetUserActivities($userId: ID!, $type: [ActivityType], $cursor: String, $limit: Int) {
    userActivities(userId: $userId, type: $type, cursor: $cursor, limit: $limit) {
      edges {
        node {
          id
          type
          message
          createdAt
          user {
            id
            name
            email
            avatar
          }
          data
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

export const USER_ACTIVITY_CREATED = gql`
  subscription OnUserActivityCreated($userId: ID!) {
    userActivityCreated(userId: $userId) {
      id
      type
      message
      createdAt
      user {
        id
        name
        email
        avatar
      }
      data
    }
  }
`;
