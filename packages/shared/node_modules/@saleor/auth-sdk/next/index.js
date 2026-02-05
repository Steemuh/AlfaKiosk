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

// src/next/index.ts
var next_exports = {};
__export(next_exports, {
  createSaleorExternalAuthHandler: () => createSaleorExternalAuthHandler
});
module.exports = __toCommonJS(next_exports);

// src/next/handler.ts
var import_cookie = require("cookie");
var createSaleorExternalAuthHandler = (auth) => async (req, res) => {
  const { state, code } = req.query;
  const { token } = await auth.obtainAccessToken({ state, code });
  res.setHeader("Set-Cookie", (0, import_cookie.serialize)("token", token, { path: "/" }));
  res.redirect("/");
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createSaleorExternalAuthHandler
});
