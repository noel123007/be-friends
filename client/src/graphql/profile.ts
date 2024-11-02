import { gql } from '@apollo/client';

export const GET_PROFILE = gql`
  query GetProfile($userId: ID) {
    profile(userId: $userId) {
      id
      userId
      name
      bio
      location
      website
      avatar
      coverImage
      socialLinks {
        twitter
        github
        linkedin
      }
      stats {
        friendsCount
        postsCount
        activitiesCount
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      name
      bio
      location
      website
      socialLinks {
        twitter
        github
        linkedin
      }
      updatedAt
    }
  }
`;

export const UPLOAD_PROFILE_IMAGE = gql`
  mutation UploadProfileImage($input: UploadImageInput!) {
    uploadProfileImage(input: $input) {
      id
      avatar
      coverImage
    }
  }
`;

export const PROFILE_UPDATED = gql`
  subscription OnProfileUpdated($userId: ID!) {
    profileUpdated(userId: $userId) {
      id
      name
      avatar
      coverImage
      updatedAt
    }
  }
`;
