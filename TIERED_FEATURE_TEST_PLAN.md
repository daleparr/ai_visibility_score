# Tiered Feature Test Plan

This document outlines the test plan for verifying features across different subscription tiers in the staging environment.

## Testing Phases

1.  **Tier Simulation:** For each tier, a test user will be created and assigned the corresponding subscription.
2.  **Feature Validation:** Access to features that *should* be available to that tier will be verified.
3.  **Restriction Validation:** Access to features that *should not* be available to that tier will be verified to ensure they are properly restricted.
4.  **Result Documentation:** Each test case will be marked with "Pass" or "Fail".

---

## Free Tier

**Available Features:**
- Limited access to core features.

**Test Cases:**
- [ ] **User Creation:** A new user can be created and is automatically assigned to the 'free' tier.
- [ ] **Feature Access (Allowed):**
    - [ ] Can view the main dashboard.
    - [ ] Can perform a limited number of searches (e.g., up to 5 per day).
    - [ ] Can see up to 3 AI-powered recommendations.
    - [ ] Can see up to 2 similar companies in benchmarks.
- [ ] **Feature Access (Restricted):**
    - [ ] Cannot access the "Predictions" tab in AI-Powered Insights.
    - [ ] Cannot access the Brand Playbook feature. An upgrade prompt is displayed.
    - [ ] Cannot see more than 3 AI-powered recommendations. An upgrade prompt is displayed.
    - [ ] Cannot see more than 2 similar companies in benchmarks. An upgrade prompt is displayed.

---

## Index-Pro Tier

**Available Features:**
- All 'Free' tier features.
- Advanced search and analytics.

**Test Cases:**
- [ ] **User Subscription:** An existing 'free' tier user can upgrade to the 'Index-Pro' tier.
- [ ] **Feature Access (Allowed):**
    - [ ] Can perform unlimited searches.
    - [ ] Can see up to 8 AI-powered recommendations.
    - [ ] Can see up to 5 similar companies in benchmarks.
    - [ ] Can access the "Predictions" tab in AI-Powered Insights.
- [ ] **Feature Access (Restricted):**
    - [ ] Cannot access the Brand Playbook feature. An upgrade prompt is displayed.
    - [ ] Cannot access 'Enterprise' level administrative tools. An upgrade prompt is displayed.
    - [ ] Cannot see all AI-powered recommendations. An upgrade prompt is displayed.
    - [ ] Cannot see all similar companies in benchmarks. An upgrade prompt is displayed.

---

## Enterprise Tier

**Available Features:**
- All 'Index-Pro' features.
- Administrative tools and dedicated support.

**Test Cases:**
- [ ] **User Subscription:** An existing 'Index-Pro' tier user can be upgraded to the 'Enterprise' tier.
- [ ] **Feature Access (Allowed):**
    - [ ] Can access all 'Index-Pro' features.
    - [ ] Can access the Brand Playbook feature.
    - [ ] Can see all AI-powered recommendations.
    - [ ] Can see all similar companies in benchmarks.
    - [ ] Can access advanced predictive analytics with custom forecasting.
    - [ ] Can access the administrative dashboard to manage team members.
    - [ ] Can access dedicated support options.
- [ ] **Feature Access (No Restrictions):**
    - [ ] All features are available. No further restrictions apply.
