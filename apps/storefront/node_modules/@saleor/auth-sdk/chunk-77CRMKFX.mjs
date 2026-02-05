// src/next/handler.ts
import { serialize } from "cookie";
var createSaleorExternalAuthHandler = (auth) => async (req, res) => {
  const { state, code } = req.query;
  const { token } = await auth.obtainAccessToken({ state, code });
  res.setHeader("Set-Cookie", serialize("token", token, { path: "/" }));
  res.redirect("/");
};

export {
  createSaleorExternalAuthHandler
};
