import { gql } from '@apollo/client';

export const SEARCH_USERS = gql`
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      id
      name
      email
      avatar
      friendStatus
    }
  }
`;

export const GET_FRIENDS = gql`
  query GetFriends($cursor: String, $limit: Int) {
    friends(cursor: $cursor, limit: $limit) {
      edges {
        node {
          id
          senderId
          receiverId
          status
          createdAt
          sender {
            id
            name
            email
            avatar
          }
          receiver {
            id
            name
            email
            avatar
          }
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

export const GET_FRIEND_REQUESTS = gql`
  query GetFriendRequests($cursor: String, $limit: Int) {
    friendRequests(cursor: $cursor, limit: $limit) {
      edges {
        node {
          id
          senderId
          receiverId
          status
          createdAt
          sender {
            id
            name
            email
            avatar
          }
          receiver {
            id
            name
            email
            avatar
          }
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

export const SEND_FRIEND_REQUEST = gql`
  mutation SendFriendRequest($userId: ID!) {
    sendFriendRequest(userId: $userId) {
      id
      senderId
      receiverId
      status
      createdAt
      sender {
        id
        name
        email
        avatar
      }
      receiver {
        id
        name
        email
        avatar
      }
    }
  }
`;

export const ACCEPT_FRIEND_REQUEST = gql`
  mutation AcceptFriendRequest($requestId: ID!) {
    acceptFriendRequest(requestId: $requestId) {
      id
      status
      senderId
      receiverId
      createdAt
      sender {
        id
        name
        email
        avatar
      }
    }
  }
`;

export const REJECT_FRIEND_REQUEST = gql`
  mutation RejectFriendRequest($requestId: ID!) {
    rejectFriendRequest(requestId: $requestId) {
      success
      message
    }
  }
`;

export const BLOCK_USER = gql`
  mutation BlockUser($userId: ID!) {
    blockUser(userId: $userId) {
      id
      status
    }
  }
`;

export const UNBLOCK_USER = gql`
  mutation UnblockUser($userId: ID!) {
    unblockUser(userId: $userId) {
      id
      status
    }
  }
`;

export const FRIEND_UPDATED = gql`
  subscription OnFriendUpdated {
    friendUpdated {
      id
      senderId
      receiverId
      status
      createdAt
      sender {
        id
        name
        email
        avatar
      }
    }
  }
`;

export const REMOVE_FRIEND = gql`
  mutation RemoveFriend($friendId: ID!) {
    removeFriend(friendId: $friendId) {
      success
      message
    }
  }
`;

export const UNSEND_FRIEND_REQUEST = gql`
  mutation UnsendFriendRequest($requestId: ID!) {
    unsendFriendRequest(requestId: $requestId) {
      success
      message
    }
  }
`;

export const GET_SENT_REQUESTS = gql`
  query GetSentRequests {
    sentRequests {
      edges {
        node {
          id
          status
          receiver {
            id
            name
            email
            avatar
          }
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
