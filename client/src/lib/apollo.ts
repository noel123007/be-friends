import { ApolloClient, ApolloLink, InMemoryCache, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { removeTypenameFromVariables } from '@apollo/client/link/remove-typename';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createUploadLink } from 'apollo-upload-client';
import { createClient } from 'graphql-ws';

const uploadLink = createUploadLink({
  uri: import.meta.env.VITE_GRAPHQL_HTTP_URL,
  headers: {
    'apollo-require-preflight': 'true',
  },
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Create WS link only if token exists
const createWsLink = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  return new GraphQLWsLink(
    createClient({
      url: import.meta.env.VITE_GRAPHQL_WS_URL,
      connectionParams: {
        authorization: `Bearer ${token}`,
      },
    })
  );
};

// Create split link based on operation type
const createSplitLink = () => {
  const wsLink = createWsLink();

  const removeTypenameLink = removeTypenameFromVariables();
  // If no wsLink (no auth), just return http link
  if (!wsLink) return authLink.concat(uploadLink);

  return split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    },
    wsLink,
    ApolloLink.from([removeTypenameLink, authLink, uploadLink])
  );
};

export const apolloClient = new ApolloClient({
  link: createSplitLink(),
  cache: new InMemoryCache(),
});

// Recreate client when auth state changes
export const recreateApolloClient = () => {
  apolloClient.setLink(createSplitLink());
};
