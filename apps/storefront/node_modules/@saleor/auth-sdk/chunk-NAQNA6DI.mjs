// src/react/context.ts
import { createContext, useContext } from "react";
var createSafeContext = () => {
  const context = createContext(void 0);
  function useSafeContext() {
    const value = useContext(context);
    if (value === void 0) {
      throw new Error("useContext must be inside a Provider with a value");
    }
    return value;
  }
  return [useSafeContext, context.Provider];
};
var [useSaleorAuthContext, Provider] = createSafeContext();

export {
  createSafeContext,
  useSaleorAuthContext,
  Provider
};
