import { ApolloError } from '@apollo/client';
import { TFunction } from 'i18next';

interface ErrorMessages {
  [key: string]: string;
}

export function handleGraphQLError(error: unknown, t: TFunction) {
  if (error instanceof ApolloError) {
    const graphQLError = error.graphQLErrors[0];
    if (graphQLError) {
      const code = graphQLError.extensions?.code as string;

      const errorMessages: ErrorMessages = {
        BAD_USER_INPUT: t('common:errors.invalidInput'),
        UNAUTHORIZED: t('common:errors.unauthorized'),
        FORBIDDEN: t('common:errors.forbidden'),
        NOT_FOUND: t('common:errors.notFound'),
      };

      return {
        title: t('common:errors.title'),
        description: errorMessages[code] || graphQLError.message,
      };
    }

    if (error.networkError) {
      return {
        title: t('common:errors.networkError'),
        description: t('common:errors.checkConnection'),
      };
    }
  }

  return {
    title: t('common:errors.title'),
    description: t('common:errors.generic'),
  };
}
