import { gql } from '@apollo/client';

export const LOGIN_USER = gql`
  mutation LoginUser($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        name
        email
        avatar
        lastLoginAt
        createdAt
        updatedAt
      }
    }
  }
`;

export const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        name
        email
        avatar
        lastLoginAt
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      id
      name
      email
      avatar
      lastLoginAt
      createdAt
      updatedAt
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      user {
        id
        email
        name
      }
    }
  }
`;

export const VALIDATE_RESET_TOKEN = gql`
  query ValidateResetToken($token: String!) {
    validateResetToken(token: $token) {
      valid
      message
    }
  }
`;

export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($input: ForgotPasswordInput!) {
    requestPasswordReset(input: $input) {
      success
      message
    }
  }
`;
