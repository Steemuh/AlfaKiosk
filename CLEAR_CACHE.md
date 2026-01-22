# How to Clear All Caches

I've already cleaned the build cache. Now do these steps in your browser:

## Chrome/Chromium DevTools:
1. Open DevTools: **F12** or **Ctrl+Shift+I**
2. Go to **Application** tab
3. Click **Cookies** → Select `localhost:3000` → **Delete all**
4. Click **Local Storage** → Select `http://localhost:3000` → **Delete all**
5. Click **Session Storage** → Select `http://localhost:3000` → **Delete all**
6. Hard refresh the page: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)

## Firefox DevTools:
1. Open DevTools: **F12**
2. Go to **Storage** tab
3. Under **Cookies** → Select `http://localhost:3000` → **Delete all**
4. Under **Local Storage** → Select `http://localhost:3000` → **Delete all**
5. Hard refresh: **Ctrl+Shift+R**

## Then in Terminal:
```bash
pnpm run dev
```

Now test the app again:
1. Add multiple items to cart
2. Click the cart icon
3. Go to checkout
4. Items should load properly

If still having issues, try:
- Check the browser console (F12) for errors
- Look at the Network tab to see API calls
- Make sure your Saleor API is responding
