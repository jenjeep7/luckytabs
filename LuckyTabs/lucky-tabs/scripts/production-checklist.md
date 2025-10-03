# iOS Production Build Checklist

## Pre-Build Steps

### 1. Environment & Configuration
- [ ] Verify all Firebase API keys are production keys
- [ ] Check Google Maps API key is production key with proper restrictions
- [ ] Ensure `capacitor.config.ts` server settings are correct (no dev server URLs)
- [ ] Confirm version number in `package.json` is updated

### 2. Code Quality
- [ ] Run `npm run build` and ensure no errors
- [ ] Run ESLint: `npm run lint` (if configured)
- [ ] Remove or wrap all console.log statements (run `node scripts/remove-console-logs.js`)
- [ ] Check for TODO/FIXME comments that need addressing

### 3. iOS Specific
- [ ] Verify `Info.plist` has all required privacy descriptions
- [ ] Test on physical iOS device (not just simulator)
- [ ] Check SafeDialog components work correctly with notch/home indicator
- [ ] Test all orientations (Portrait, Landscape)

### 4. Features & Functionality
- [ ] Test user authentication (sign up, sign in, sign out)
- [ ] Test Firebase Analytics events are firing
- [ ] Verify all dialogs display correctly within safe zones
- [ ] Test prize claiming from bottom to top
- [ ] Test with poor network conditions
- [ ] Test app backgrounding/foregrounding
- [ ] Test push notifications (if applicable)

### 5. Content & Legal
- [ ] Gambling disclaimer shows on first launch
- [ ] Privacy Policy is accessible and up-to-date
- [ ] Terms of Service is accessible (if applicable)
- [ ] Copyright notices are current

## Build Process

### 1. Create Production Build
```bash
# Install dependencies
npm install

# Create production build
npm run build

# Sync with iOS
npx cap sync ios
```

### 2. Xcode Configuration
```bash
# Open Xcode workspace
open ios/App/App.xcworkspace
```

In Xcode:
- [ ] Select "Any iOS Device (arm64)" as target
- [ ] Set Build Configuration to **Release**
- [ ] Verify Bundle Identifier matches App Store Connect: `com.tabsywins.app`
- [ ] Check Version matches `package.json`: `1.2.3`
- [ ] Increment Build Number (CFBundleVersion)
- [ ] Verify Signing & Capabilities are correct
- [ ] Check that provisioning profile is valid

### 3. Build Archive
- [ ] Product > Archive
- [ ] Wait for archive to complete
- [ ] Validate App (check for warnings/errors)
- [ ] Distribute App > App Store Connect

## App Store Connect

### 1. App Information
- [ ] App Name: "Tabsy Wins"
- [ ] Subtitle (if applicable)
- [ ] Keywords for search
- [ ] Support URL
- [ ] Marketing URL (optional)

### 2. App Privacy
Declare data collection for:
- [ ] **User ID** - For account management
- [ ] **Email Address** - For authentication
- [ ] **Display Name** - User profile
- [ ] **Analytics Data** - Firebase Analytics
- [ ] **Crash Data** - Firebase Crashlytics (if used)
- [ ] **Location** - Store tracking (optional)
- [ ] **Photos** - Flare sheet uploads

### 3. Age Rating
Complete age rating questionnaire:
- [ ] Simulated Gambling: **YES** (tracking scratch-offs)
- [ ] Recommended: **12+** or **17+** depending on region

### 4. App Review Information
- [ ] Demo account credentials (if needed)
- [ ] Notes for reviewer explaining:
  - App does NOT sell lottery tickets
  - App is for tracking only
  - No in-app purchases for gambling
- [ ] Contact information

### 5. Screenshots & Media
- [ ] iPhone 6.7" screenshots (iPhone 14 Pro Max)
- [ ] iPhone 6.5" screenshots (iPhone 11 Pro Max)
- [ ] iPhone 5.5" screenshots (optional, older devices)
- [ ] iPad Pro (6th gen) screenshots (if supporting iPad)
- [ ] App Preview video (optional but recommended)

## Final Checks

### Testing on TestFlight (Recommended)
- [ ] Submit build to TestFlight
- [ ] Invite internal testers
- [ ] Test all critical user flows
- [ ] Check for crashes/bugs
- [ ] Verify analytics are working
- [ ] Test on multiple devices/iOS versions

### Before Final Submission
- [ ] Review App Store rejection reasons list
- [ ] Ensure compliance with App Store Review Guidelines
- [ ] Double-check gambling-related guidelines (Section 4.7)
- [ ] Verify all in-app text is appropriate
- [ ] Check for any offensive or inappropriate content

## Common Rejection Reasons to Avoid

1. **Missing Privacy Descriptions** - ✅ Fixed
2. **Console Logs in Production** - ✅ Fixed with wrapper
3. **Gambling Without Proper Disclaimers** - ✅ Added disclaimer
4. **Crashes on Launch** - Test thoroughly
5. **Poor UI on Notched Devices** - ✅ SafeDialog implemented
6. **Incomplete App Store Information** - Follow checklist above

## Post-Submission

- [ ] Monitor App Store Connect for review status
- [ ] Respond promptly to any rejection reasons
- [ ] Prepare for follow-up questions from App Review team
- [ ] Plan for marketing/launch announcements

## Version for Next Release
When this version is approved, prepare for next update:
- [ ] Update version in `package.json`
- [ ] Document changes in release notes
- [ ] Plan new features/fixes

---

**Good Luck! 🍀**
