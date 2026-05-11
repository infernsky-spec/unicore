# Fix Login/Signup Errors TODO

Status: 8/8 completed ✅

✅ 1. Fixed authController.js - added JWT fallback secrets
✅ 2. Fixed authController.js - register now sets university from X-University-Id header
✅ 3. Fixed login destructuring to ignore role field  
✅ 4. Added mongoose require for ObjectId.isValid
✅ 5. Fixed frontend api.js - verified encodeURIComponent is NOT used (already clean)
✅ 6. Fixed backend - removed double-hashing in register (User model handles it)
✅ 7. Fixed backend - implemented refreshToken logic in authController.js
✅ 8. Fixed frontend SignUpPage - added missing Index Number field for students

**Next:** Restart backend: `cd backend && node server.js` and test signup/login.
Run `curl http://localhost:5000/api/health` to check server.

**Console check:** JWT signing errors gone, new users have universityId and can login.

