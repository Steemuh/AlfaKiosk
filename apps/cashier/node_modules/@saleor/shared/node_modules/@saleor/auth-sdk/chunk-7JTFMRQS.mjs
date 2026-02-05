import {
  TypedDocumentString
} from "./chunk-K5MTKW5C.mjs";

// src/mutations.ts
var accountErrorFragment = (
  /* graphql */
  `
  fragment AccountErrorFragment on AccountError {
    code
    field
    message
  }
`
);
var TOKEN_REFRESH = new TypedDocumentString(
  /* graphql */
  `
  ${accountErrorFragment}
  mutation refreshToken($refreshToken: String!) {
    tokenRefresh(refreshToken: $refreshToken) {
      token
      errors {
        ...AccountErrorFragment
      }
    }
  }
`
);
var TOKEN_CREATE = new TypedDocumentString(
  /* graphql */
  `
  mutation tokenCreate($email: String!, $password: String!) {
    tokenCreate(email: $email, password: $password) {
      token
      refreshToken
      errors {
        message
        field
        code
      }
    }
  }
`
);
var PASSWORD_RESET = new TypedDocumentString(
  /* graphql */
  `
  mutation passwordReset($email: String!, $password: String!, $token: String!) {
    setPassword(email: $email, password: $password, token: $token) {
      token
      refreshToken
      errors {
        message
        field
        code
      }
    }
  }
`
);
var ExternalAuthenticationURL = new TypedDocumentString(
  /* graphql */
  `
  mutation externalAuthenticationUrl($pluginId: String!, $input: JSONString!) {
    externalAuthenticationUrl(pluginId: $pluginId, input: $input) {
      authenticationData
      errors {
        code
        field
        message
      }
    }
  }
`
);
var ExternalObtainAccessTokens = new TypedDocumentString(
  /* graphql */
  `
  mutation AuthObtainAccessToken($pluginId: String!, $input: JSONString!) {
    externalObtainAccessTokens(pluginId: $pluginId, input: $input) {
      token
      refreshToken
      user {
        id
        email
      }
      errors {
        field
        code
        message
      }
    }
  }
`
);

export {
  accountErrorFragment,
  TOKEN_REFRESH,
  TOKEN_CREATE,
  PASSWORD_RESET,
  ExternalAuthenticationURL,
  ExternalObtainAccessTokens
};
