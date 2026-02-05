"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/mutations.ts
var mutations_exports = {};
__export(mutations_exports, {
  ExternalAuthenticationURL: () => ExternalAuthenticationURL,
  ExternalObtainAccessTokens: () => ExternalObtainAccessTokens,
  PASSWORD_RESET: () => PASSWORD_RESET,
  TOKEN_CREATE: () => TOKEN_CREATE,
  TOKEN_REFRESH: () => TOKEN_REFRESH,
  accountErrorFragment: () => accountErrorFragment
});
module.exports = __toCommonJS(mutations_exports);

// src/graphql.ts
var TypedDocumentString = class extends String {
  constructor(value, __meta__) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }
  __apiType;
  toString() {
    return this.value;
  }
};

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ExternalAuthenticationURL,
  ExternalObtainAccessTokens,
  PASSWORD_RESET,
  TOKEN_CREATE,
  TOKEN_REFRESH,
  accountErrorFragment
});
