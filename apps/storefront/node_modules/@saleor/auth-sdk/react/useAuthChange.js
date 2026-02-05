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

// src/react/useAuthChange.ts
var useAuthChange_exports = {};
__export(useAuthChange_exports, {
  useAuthChange: () => useAuthChange
});
module.exports = __toCommonJS(useAuthChange_exports);
var import_react = require("react");

// src/SaleorRefreshTokenStorageHandler.ts
var getStorageAuthEventKey = (prefix) => [prefix, "saleor_storage_auth_change"].filter(Boolean).join("+");

// src/react/useAuthChange.ts
var useAuthChange = ({ saleorApiUrl, onSignedOut, onSignedIn }) => {
  const handleAuthChange = (event) => {
    const isCustomAuthEvent = event?.type === getStorageAuthEventKey(saleorApiUrl);
    if (!isCustomAuthEvent) {
      return;
    }
    const { authState } = event.detail;
    if (authState === "signedIn") {
      onSignedIn?.();
    } else if (authState === "signedOut") {
      onSignedOut?.();
    }
  };
  (0, import_react.useEffect)(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.addEventListener(getStorageAuthEventKey(saleorApiUrl), handleAuthChange);
    return () => {
      window.removeEventListener(getStorageAuthEventKey(saleorApiUrl), handleAuthChange);
    };
  }, []);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useAuthChange
});
