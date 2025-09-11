# Firebase Analytics Setup

This application now includes comprehensive Firebase Analytics tracking to monitor user behavior and app performance.

## What's Being Tracked

### User Authentication
- **Login events** - tracks method (email/google)
- **Signup events** - tracks method (email/google)
- **User properties** - plan type, signup date, user ID

### Box Operations
- **Box created** - tracks box type, price, user plan, starting tickets
- **Box edited** - tracks changes made, box type, user plan
- **Box removed** - tracks box type, user plan
- **Flare sheet uploaded** - tracks when users add images

### Ticket Management
- **Tickets estimated** - tracks manual vs row-by-row estimation methods
- **Prize claimed/unclaimed** - tracks prize values and user interactions

### Feature Usage
- **Advanced Analytics viewed** - tracks when Pro users access premium features
- **Pro feature attempts by free users** - conversion opportunities

### Device & Context
- **Device type** - automatically detects mobile/tablet/desktop
- **User plan** - free vs pro for feature usage analysis
- **Timestamps** - when events occur

## How to View Analytics

### Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Analytics** > **Events**
4. View real-time and historical data

### Custom Events Available
- `box_created`
- `box_edited` 
- `box_removed`
- `tickets_estimated`
- `prize_claimed`
- `prize_unclaimed`
- `advanced_analytics_viewed`
- `flare_sheet_uploaded`
- `login`
- `sign_up`
- `pro_feature_attempted_by_free_user`

### User Properties
- `subscription_plan` - free/pro
- `user_id` - Firebase UID
- `user_since` - signup date
- `device_type` - mobile/tablet/desktop

## Key Metrics to Monitor

### Business Metrics
- **Conversion rate**: `pro_feature_attempted_by_free_user` → subscription upgrades
- **Feature adoption**: `advanced_analytics_viewed` usage by Pro users
- **User engagement**: Box creation and interaction rates

### Product Metrics
- **Most used features**: Event frequency analysis
- **Drop-off points**: Where users stop engaging
- **Device preferences**: Mobile vs desktop usage patterns

### User Journey
1. **Signup** → Login tracking
2. **First box creation** → Onboarding success
3. **Feature discovery** → Advanced analytics usage
4. **Upgrade triggers** → Free user attempting Pro features

## Data Privacy
- No personally identifiable information is tracked
- Only functional usage patterns and aggregated metrics
- Complies with Firebase's privacy standards

## Development Notes
- Analytics are automatically initialized in `firebase.ts`
- Tracking functions are centralized in `utils/analytics.ts`
- User properties are set when profile loads in `UserProfileContext`
- All tracking is non-blocking and won't affect app performance

## Future Enhancements
Consider adding:
- A/B testing capabilities
- Custom funnel analysis
- Cohort analysis for user retention
- Revenue tracking for subscription conversions
