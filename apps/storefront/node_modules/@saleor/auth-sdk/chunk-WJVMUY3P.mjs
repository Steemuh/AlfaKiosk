import {
  getStorageAuthEventKey
} from "./chunk-263DHBMK.mjs";

// src/react/useAuthChange.ts
import { useEffect } from "react";
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
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.addEventListener(getStorageAuthEventKey(saleorApiUrl), handleAuthChange);
    return () => {
      window.removeEventListener(getStorageAuthEventKey(saleorApiUrl), handleAuthChange);
    };
  }, []);
};

export {
  useAuthChange
};
