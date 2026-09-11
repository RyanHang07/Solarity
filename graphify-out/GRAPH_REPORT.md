# Graph Report - solarity  (2026-09-10)

## Corpus Check
- 427 files · ~342,559 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2320 nodes · 5115 edges · 253 communities (188 shown, 65 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 102 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `da9cbc4f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Planet.ts
- push-client.ts
- SkyAmbience.ts
- server.ts
- photo-upload.ts
- Galaxy
- storageStateFor
- enforce
- Galaxy.ts
- legal.ts
- db.ts
- SolarSystem
- toMessage
- GalaxySnapshot
- createClient
- photos.spec.ts
- compilerOptions
- circles.ts
- dependencies
- admin.ts
- circle-activity.spec.ts
- galaxy/onboarding.ts
- devDependencies
- data.ts
- planSnapshotFx.test.ts
- errors.ts
- digest-days.ts
- invites.ts
- moderation.ts
- design-audit.mjs
- requireEnv
- snapshots.ts
- supabase/proxy.ts
- .applySystemPlan
- SkyBridges.ts
- nebulaClusters.ts
- csp-report/route.ts
- userIdByEmail
- galaxyPalette.test.ts
- OrbitRefitCoordinator
- 20260811045639_51_close_unwritten_state_gaps.sql
- 20260810202140_34_live_daily_completion_triggers.sql
- graph-freshness.mjs
- session.ts
- OrbitSystem.ts
- public.build_daily_digests
- scripts
- 20260810042820_13_stats_and_streak_tables.sql
- onboarding-form.tsx
- buildSnapshot.ts
- FxQueue
- public.export_user_data
- dashboard/page.tsx
- circles/[id]/page.tsx
- StarConfig
- 20260901180618_103_circle_activity_notifications.sql
- galaxy-card.tsx
- mountGalaxy
- deadlineLabel
- cameraControls.ts
- send-digest-push/index.ts
- 20260810055111_31_circle_rpcs.sql
- public.export_user_data
- public.circle_roster
- design-tokens.ts
- database.types.ts
- clusterLayout.ts
- port-landing.mjs
- 20260810200600_32_onboarding_and_gap_fixes.sql
- public.join_circle
- 20260810045521_18_rls_helper_functions.sql
- public.circle_roster
- public.circle_roster
- public.circle_roster
- skeleton.tsx
- auth-shell.tsx
- SolarSystem.ts
- 20260810044029_16_constraints_and_caps.sql
- public.build_daily_digests
- public.circle_roster
- public.circle_roster
- public.circle_roster
- public.build_daily_digests
- skyAmbienceProfile.ts
- dashboard/notifications/page.tsx
- marks.tsx
- .applyBackdropSpin
- public.run_daily_rollover
- public.circle_roster
- public.trg_goal_achievement_is_final
- private.rollover_user_day
- public.circle_roster
- public.circle_roster
- 20260810035022_02_users_and_username_history.sql
- app-nav.tsx
- 20260810041855_08_normalize_ownership_deadline_and_hardening.sql
- public.join_circle
- 20260813045733_60_hint_codes_on_user_facing_raises.sql
- public.circle_roster
- data.boundary.test.ts
- public.progress_entries
- 20260810053407_27_group_helpers_and_owner_settings_guard.sql
- public.invite_user_to_circle
- public.groups
- 20260810043149_14_notifications_push_and_digest.sql
- 20260810043744_15_trust_and_safety_tables.sql
- private.circle_checkin_date
- 20260828012127_93_admin_moderation_functions.sql
- public.circle_preview_members
- public.circle_preview_members
- private.group_day_closed
- goal-record.ts
- public.invite_user_to_circle
- public.profile_by_username
- public.job_list_orphan_photos
- purge-expired-photos/index.ts
- 20260810052121_24_rls_helpers_checkin_date_and_goal_owner.sql
- 20260811045000_50_move_job_helpers_to_public_for_service_role.sql
- public.complete_onboarding
- playwright
- public.users
- public.goals
- public.goal_group_visibility
- private.is_cycle_member
- public.run_retention_sweep
- public.handle_membership_removal
- public.handle_membership_removal
- public.set_circle_deadline
- public.archive_circle
- public.blocked_accounts
- public.complete_onboarding
- reset-ratelimit.mjs
- test-email.mjs
- public.progress_entries
- private.owns_active_goal
- public.create_invite_link
- private.can_view_checkin_photo
- private.invoke_edge_function
- public.set_circle_deadline
- public.my_pending_checkin_timezone
- private.is_admin
- public.admin_set_role
- .build
- eslint.config.mjs
- lab.tsx
- viewhole.tsx
- solar-hero.tsx
- diffSnapshot.ts
- postcss.config.mjs
- 20260903082420_107_a_goal_remembers_whether_its_planet_has_a_belt.sql
- vitest.config.mts
- public.audit_log
- public.group_daily_completion
- public.group_member_category_stats
- app/page.tsx
- public.goal_categories
- public.goals
- public.group_members
- public.groups
- public.users
- public.users
- public.push_subscriptions
- public.content_reports
- public.notifications
- public.notifications
- public.content_reports
- public.daily_completion
- public.digest_snapshots
- public.goal_categories
- public.goal_group_visibility
- public.goals
- public.group_cycle_stats
- public.group_cycles
- public.group_members
- public.groups
- public.invite_links
- public.notifications
- public.progress_entries
- public.push_subscriptions
- public.user_blocks
- public.user_lifetime_stats
- public.username_history
- public.users
- public.users
- public.users
- public.progress_entries
- public.progress_entries
- public.goals
- public.users
- avatar.spec.ts
- backfill-sun-presets.ts
- sitemap.ts
- public.users
- public.goals
- package.json
- jsdom
- nodemailer
- @testing-library/react
- @types/node
- @types/three
- goals/[id]/page.tsx
- digests.spec.ts

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 129 edges
2. `Galaxy` - 67 edges
3. `requireEnv()` - 59 edges
4. `toMessage()` - 56 edges
5. `SolarSystem` - 53 edges
6. `ActionResult` - 38 edges
7. `enforce()` - 32 edges
8. `storageStateFor()` - 30 edges
9. `userIdByEmail()` - 26 edges
10. `Database` - 25 edges

## Surprising Connections (you probably didn't know these)
- `CircleSettingsPage()` --calls--> `createClient()`  [EXTRACTED]
  app/(app)/circles/[id]/settings/page.tsx → lib/supabase/server.ts
- `CheckEmailPage()` --calls--> `createClient()`  [EXTRACTED]
  app/auth/check-email/page.tsx → lib/supabase/server.ts
- `ForgotPasswordPage()` --calls--> `createClient()`  [EXTRACTED]
  app/auth/forgot-password/page.tsx → lib/supabase/server.ts
- `ResetPasswordPage()` --calls--> `createClient()`  [EXTRACTED]
  app/auth/reset-password/page.tsx → lib/supabase/server.ts
- `SignUpPage()` --calls--> `createClient()`  [EXTRACTED]
  app/auth/sign-up/page.tsx → lib/supabase/server.ts

## Import Cycles
- None detected.

## Communities (253 total, 65 thin omitted)

### Community 0 - "Planet.ts"
Cohesion: 0.07
Nodes (60): channel(), darkenColor(), hslToRgb(), hueToRgb(), lightenColor(), mixColor(), relativeLuminance(), rgbToHsl() (+52 more)

### Community 1 - "push-client.ts"
Cohesion: 0.06
Nodes (57): dismissPushNudgeAction(), pushSubscribed(), PushSubscriptionInput, subscribePush(), unsubscribePush(), fraunces, geistMono, geistSans (+49 more)

### Community 2 - "SkyAmbience.ts"
Cohesion: 0.06
Nodes (16): AsteroidDriftLayer, AsteroidFieldLayer, clusterOffset(), DriftRock, FieldPebble, paintDriftRock(), paintFieldPebble(), paintStreak() (+8 more)

### Community 3 - "server.ts"
Cohesion: 0.14
Nodes (18): resendConfirmation(), signInWithGoogle(), signOut(), acceptTerms(), GET(), CheckEmailPage(), metadata, ResendForm() (+10 more)

### Community 4 - "photo-upload.ts"
Cohesion: 0.09
Nodes (38): AvatarForm(), upload(), SAYS, PhotoButton(), remove(), upload(), SAYS, AVATAR_BUCKET (+30 more)

### Community 5 - "Galaxy"
Cohesion: 0.13
Nodes (4): Galaxy, SystemHost, clampTilt(), ViewRotation

### Community 6 - "storageStateFor"
Cohesion: 0.14
Nodes (10): ownerPage(), parkCompletionHistory(), seedCompletedDays(), freshPage(), GATED, ownerPage(), ownerPage(), Window (+2 more)

### Community 7 - "enforce"
Cohesion: 0.09
Nodes (28): requestPasswordReset(), signInWithPassword(), signUpWithPassword(), DEAD_LINK, joinCircle(), ForgotForm(), ForgotPasswordPage(), metadata (+20 more)

### Community 8 - "Galaxy.ts"
Cohesion: 0.13
Nodes (24): CAMERA_AUTOFIT_PAN_THRESHOLD, CAMERA_AUTOFIT_ZOOM_EPSILON, CAMERA_FIT_MS, COMPACT_MAX_HEIGHT, COMPACT_MAX_WIDTH, COMPACT_ORBIT_LEGIBILITY, COMPACT_STAR_SCALE, DEFAULT_COMPACT_TILT (+16 more)

### Community 9 - "legal.ts"
Cohesion: 0.13
Nodes (19): AcceptForm(), metadata, TermsGatePage(), metadata, metadata, metadata, PolicyPage(), PolicySection() (+11 more)

### Community 10 - "db.ts"
Cohesion: 0.15
Nodes (22): checkinTimezone(), deleteE2EGoals(), deleteNotifications(), E2E_PREFIX, ensureUnfinishedDay(), forgetParked(), insertNotification(), markUnread() (+14 more)

### Community 11 - "SolarSystem"
Cohesion: 0.17
Nodes (6): paintBeltLook(), SolarSystem, effectiveOrbitRadius(), flattenFromTilt(), OrbitBody, snapOrbitRadii()

### Community 12 - "toMessage"
Cohesion: 0.16
Nodes (17): attachCheckinPhoto(), checkIn(), removeCheckinPhoto(), setNoteSharing(), undoCheckIn(), achieveGoal(), archiveGoal(), setCircleVisibility() (+9 more)

### Community 13 - "GalaxySnapshot"
Cohesion: 0.10
Nodes (15): planetNodes(), snapshot(), sunOf(), sunOwnTextures(), systemOf(), SELF_SYSTEM_ID, singleSystemSnapshot(), sky() (+7 more)

### Community 14 - "createClient"
Cohesion: 0.10
Nodes (35): blockedAccounts(), Profile, profileByUsername(), deleteAccount(), exportUserData(), MODES, pendingTimezone(), setAvatar() (+27 more)

### Community 15 - "photos.spec.ts"
Cohesion: 0.14
Nodes (15): circleWithLink(), clientFor(), withTempGoal(), assertOk(), circleName(), freeGoalSlots(), mintSession(), sessionFor() (+7 more)

### Community 16 - "compilerOptions"
Cohesion: 0.07
Nodes (29): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+21 more)

### Community 17 - "circles.ts"
Cohesion: 0.23
Nodes (7): archiveCircle(), createCircle(), ArchivePanel(), metadata, CircleRow, CirclesPanel(), CreateCircleForm()

### Community 18 - "dependencies"
Cohesion: 0.07
Nodes (29): next, obscenity, dependencies, browser-image-compression, next, obscenity, pixi.js, react (+21 more)

### Community 19 - "admin.ts"
Cohesion: 0.13
Nodes (17): amIAdmin(), listAdmins(), reportDetail(), reportQueue(), ReportStatus, resolveReport(), setRole(), AdminLayout() (+9 more)

### Community 20 - "circle-activity.spec.ts"
Cohesion: 0.13
Nodes (20): circleOfTwo(), clearIntraday(), INTRADAY, JOINER(), OWNER(), clearRateLimits(), createCircleViaApi(), deleteByPattern() (+12 more)

### Community 21 - "galaxy/onboarding.ts"
Cohesion: 0.23
Nodes (17): categoryBySlug(), CategorySlug, applyOnboardingPrefs(), createOnboardingSnapshot(), DEFAULT_NEBULA_CATEGORY, nebulaColorsFromCategories(), nebulaConfigFromPrefs(), resolveNebulaColors() (+9 more)

### Community 22 - "devDependencies"
Cohesion: 0.07
Nodes (27): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, @playwright/test, supabase, tailwindcss (+19 more)

### Community 23 - "data.ts"
Cohesion: 0.19
Nodes (17): GoalCategory, SURFACE_KINDS, OnboardingColorPrefs, createGoalCosmeticsRoll(), defaultBeltFor(), PLANET_BELT_CHANCE, resolveBeltVisible(), rollPlanetHasBelt() (+9 more)

### Community 24 - "planSnapshotFx.test.ts"
Cohesion: 0.15
Nodes (20): SnapshotDiff, appearKind(), burstKind(), CAMERA_FIT_KIND, dayClosedKind(), NEBULA_BIRTH_KIND, orbitRefitKind(), planetFxKinds() (+12 more)

### Community 25 - "errors.ts"
Cohesion: 0.09
Nodes (24): updatePassword(), resolveStreakDecision(), StreakDecision(), metadata, ResetPasswordPage(), ResetForm(), PasswordFields(), Turnstile() (+16 more)

### Community 26 - "digest-days.ts"
Cohesion: 0.20
Nodes (15): DigestPanel(), EXAMPLE, ExampleDigest(), addDays(), DAYS_SHOWN, DigestDay, DigestSnapshot, formatDay() (+7 more)

### Community 27 - "invites.ts"
Cohesion: 0.16
Nodes (16): FoundUser, generateInviteLink(), inviteUser(), revokeInviteLink(), searchUsers(), formatExpiry(), InvitePanel(), noSubscribe() (+8 more)

### Community 28 - "moderation.ts"
Cohesion: 0.20
Nodes (12): blockUser(), referenceIsValid(), REPORTABLE, reportContent(), ReportType, revalidateAfterBlockChange(), unblockUser(), ReportCheckin() (+4 more)

### Community 29 - "design-audit.mjs"
Cohesion: 0.11
Nodes (14): backlog, css, defined, EXEMPT, files, FULL, ROOT, total (+6 more)

### Community 30 - "requireEnv"
Cohesion: 0.10
Nodes (16): ADMIN(), JOINER(), OWNER(), admin, requireEnv(), EMAIL(), OWNER(), PROD (+8 more)

### Community 31 - "snapshots.ts"
Cohesion: 0.14
Nodes (22): FirstGoalForm(), GOAL_CATEGORIES, sunColorForMember(), sunPresetIdForMember(), ColorPreset, isSunPresetId(), SUN_COLOR_PRESETS, SunPresetId (+14 more)

### Community 32 - "supabase/proxy.ts"
Cohesion: 0.19
Nodes (13): contentSecurityPolicy(), CSP_REPORT_GROUP, CSP_REPORT_PATH, FIXED_HEADERS, originOf(), reportingEndpoints(), policy(), PUBLIC_PREFIXES (+5 more)

### Community 33 - ".applySystemPlan"
Cohesion: 0.25
Nodes (4): poseSunCorona(), poseSunCoronaAt(), setGlowLayer(), SystemFxPlan

### Community 34 - "SkyBridges.ts"
Cohesion: 0.21
Nodes (8): BRIDGE_LAYERS, BridgeAnchor, clearSkyBridges(), CONVERGENCE_MAX, convergenceAt(), createSkyBridges(), paintSkyBridges(), whiten()

### Community 35 - "nebulaClusters.ts"
Cohesion: 0.16
Nodes (28): NEBULA_STAMP_COUNT, createNebulaCloudTextures(), fadeEdge(), fbm(), hash2(), paintCloud(), valueNoise(), mulberry32() (+20 more)

### Community 36 - "csp-report/route.ts"
Cohesion: 0.20
Nodes (10): noContent(), POST(), runtime, CspViolation, isRecord(), normalise(), num(), parseCspReport() (+2 more)

### Community 37 - "userIdByEmail"
Cohesion: 0.22
Nodes (9): userIdByEmail(), globalTeardown(), signedIn(), Window, clearSavedModes(), modesPath(), readSavedModes(), saveModes() (+1 more)

### Community 38 - "galaxyPalette.test.ts"
Cohesion: 0.20
Nodes (12): circleAxisPosition(), GALAXY_PALETTES, galaxyPaletteFor(), GalaxyPaletteId, hueOf(), sunAxisPosition(), AMBER, AZURE (+4 more)

### Community 40 - "20260811045639_51_close_unwritten_state_gaps.sql"
Cohesion: 0.17
Nodes (12): public.trg_audit_invite_toggle, public.trg_audit_role_change, group_members_audit_role_change, invite_links_audit_toggle, public.handle_membership_removal(), public.join_circle(), public.resolve_streak_decision(), public.group_members (+4 more)

### Community 41 - "20260810202140_34_live_daily_completion_triggers.sql"
Cohesion: 0.13
Nodes (11): public.trg_goal_achieved_counter, public.trg_goal_completion_recount, public.trg_progress_entry_completion, goals_count_achievement, goals_maintain_completion, private.checkin_date_for(), private.recompute_daily_completion(), progress_entries_maintain_completion (+3 more)

### Community 42 - "graph-freshness.mjs"
Cohesion: 0.14
Nodes (12): candidates(), ext(), INDEXED, manifest, missingTracked, missingUntracked, modified, NEVER_INDEXED (+4 more)

### Community 43 - "session.ts"
Cohesion: 0.23
Nodes (11): ACCOUNTS, sessionCookiesFor(), AUTH_DIR, E2EAccount, statePath(), TodayMode, accountFor(), cache (+3 more)

### Community 44 - "OrbitSystem.ts"
Cohesion: 0.31
Nodes (5): ORBIT_SPIN_UP_MS, createOrbitBody(), lerpOrbitRadii(), orbitSpeedScale(), PlanetConfig

### Community 45 - "public.build_daily_digests"
Cohesion: 0.24
Nodes (9): public.build_daily_digests(), public.digest_pushes, public.daily_completion, public.digest_snapshots, public.group_cycle_stats, public.group_cycles, public.group_members, public.groups (+1 more)

### Community 46 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, dev, dev:lan, lint, preview, start, test (+6 more)

### Community 47 - "20260810042820_13_stats_and_streak_tables.sql"
Cohesion: 0.20
Nodes (12): gmcs_set_updated_at, group_cycle_stats_set_updated_at, public.group_cycle_stats, public.group_daily_completion, public.group_member_category_stats, public.user_lifetime_stats, public.goal_categories, public.group_cycles (+4 more)

### Community 48 - "onboarding-form.tsx"
Cohesion: 0.31
Nodes (7): completeOnboarding(), noSubscribe(), OnboardingForm(), readTimezone(), serverTimezone(), metadata, OnboardingPage()

### Community 49 - "buildSnapshot.ts"
Cohesion: 0.15
Nodes (22): buildGalaxySnapshot(), BuildGalaxySnapshotInput, defaultOrbitSpeed(), defaultPhase(), defaultRadius(), seedFromId(), SnapshotAchievement, SnapshotGoal (+14 more)

### Community 51 - "public.export_user_data"
Cohesion: 0.17
Nodes (10): private.list_expired_photos(), public.export_user_data(), public.daily_completion, public.goal_categories, public.goals, public.group_members, public.groups, public.progress_entries (+2 more)

### Community 52 - "dashboard/page.tsx"
Cohesion: 0.11
Nodes (30): createGoal(), saveFirstGoal(), leaveToday(), markTodaySeen(), CirclesSectionPage(), GoalsPage(), metadata, readMemberships() (+22 more)

### Community 53 - "circles/[id]/page.tsx"
Cohesion: 0.16
Nodes (12): CircleGalaxyPanel(), CirclePage(), DigestSummary, formatDeadline(), metadata, MIN_GAP_MS, RefreshOnReturn(), TodayRoster() (+4 more)

### Community 54 - "StarConfig"
Cohesion: 0.29
Nodes (3): Starfield, TwinkleStar, StarConfig

### Community 55 - "20260901180618_103_circle_activity_notifications.sql"
Cohesion: 0.18
Nodes (9): public.trg_first_checkin_notify, private.eligible_peers(), progress_entries_notify_first, public.trg_goal_achieved_notify(), public.group_members, public.groups, public.progress_entries, public.user_blocks (+1 more)

### Community 56 - "galaxy-card.tsx"
Cohesion: 0.31
Nodes (9): GalaxyPanel(), GalaxyCard(), GalaxyCardProps, motionOnServer(), probeSafeArea(), probeWebgl(), readMotion(), subscribeToMotion() (+1 more)

### Community 57 - "mountGalaxy"
Cohesion: 0.13
Nodes (9): GalaxyView, GalaxyPreview(), GalaxyView, GalaxyView(), GalaxyViewProps, skyColorFrom(), DEFAULT_BACKGROUND, isSelectableLabel() (+1 more)

### Community 58 - "deadlineLabel"
Cohesion: 0.67
Nodes (4): Deadline(), deadlineLabel(), format(), isOverdue()

### Community 59 - "cameraControls.ts"
Cohesion: 0.27
Nodes (7): attachCameraControls(), CameraControlsOptions, controlButton(), nextTilt(), TILT_STOPS, MAX_TILT, MIN_TILT

### Community 60 - "send-digest-push/index.ts"
Cohesion: 0.21
Nodes (9): digest, CRON_SECRET, DigestTarget, Sub, VAPID_PRIVATE, VAPID_PUBLIC, personFrom(), pick() (+1 more)

### Community 61 - "20260810055111_31_circle_rpcs.sql"
Cohesion: 0.27
Nodes (9): public.circle_preview(), public.cycle_continue(), public.cycle_reset(), public.join_circle(), public.transfer_ownership(), public.group_members, public.groups, public.invite_links (+1 more)

### Community 62 - "public.export_user_data"
Cohesion: 0.18
Nodes (9): public.export_user_data(), public.daily_completion, public.goal_categories, public.goals, public.group_members, public.groups, public.progress_entries, public.user_lifetime_stats (+1 more)

### Community 63 - "public.circle_roster"
Cohesion: 0.20
Nodes (9): private.checkin_date_at(), public.circle_roster(), public.goal_group_visibility, public.goals, public.group_cycles, public.group_members, public.groups, public.progress_entries (+1 more)

### Community 64 - "design-tokens.ts"
Cohesion: 0.40
Nodes (3): DESIGN_TOKEN_IDS, DESIGN_TOKENS, DesignToken

### Community 65 - "database.types.ts"
Cohesion: 0.20
Nodes (9): CompositeTypes, Constants, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables, TablesInsert (+1 more)

### Community 66 - "clusterLayout.ts"
Cohesion: 0.18
Nodes (9): CLUSTER_MIN_SYSTEM_SCALE, CLUSTER_RING_FLOOR, clusterReach(), clusterRingLegibility(), ClusterSlot, clusterSlots(), clusterSystemScale(), GOLDEN_ANGLE (+1 more)

### Community 67 - "port-landing.mjs"
Cohesion: 0.40
Nodes (4): FILES, HERE, REWRITES, UI

### Community 68 - "20260810200600_32_onboarding_and_gap_fixes.sql"
Cohesion: 0.22
Nodes (8): public.handle_membership_removal, group_members_on_removal, public.complete_onboarding(), public.create_invite_link(), public.sync_checkin_timezone(), pg_catalog.pg_timezone_names, public.group_members, public.username_history

### Community 69 - "public.join_circle"
Cohesion: 0.27
Nodes (8): public.trg_disable_links_on_status_change, groups_disable_links_on_status_change, public.circle_preview(), public.join_circle(), public.group_members, public.groups, public.invite_links, public.user_blocks

### Community 70 - "20260810045521_18_rls_helper_functions.sql"
Cohesion: 0.27
Nodes (9): private.is_blocked_by(), private.is_goal_hidden_in_group(), private.is_group_admin(), private.is_group_member(), private.is_group_owner(), private.shares_group_with(), public.goal_group_visibility, public.group_members (+1 more)

### Community 71 - "public.circle_roster"
Cohesion: 0.22
Nodes (9): private.is_goal_hidden_in_group(), public.circle_roster(), public.goal_group_visibility, public.goals, public.group_cycles, public.group_members, public.groups, public.progress_entries (+1 more)

### Community 72 - "public.circle_roster"
Cohesion: 0.20
Nodes (9): public.circle_roster(), public.daily_completion, public.goal_categories, public.goals, public.group_cycles, public.group_members, public.groups, public.progress_entries (+1 more)

### Community 73 - "public.circle_roster"
Cohesion: 0.20
Nodes (9): public.circle_roster(), public.daily_completion, public.goal_categories, public.goals, public.group_cycles, public.group_members, public.groups, public.progress_entries (+1 more)

### Community 75 - "auth-shell.tsx"
Cohesion: 0.14
Nodes (11): KNOWN, metadata, metadata, AuthShell(), LegalFooter(), ALL, CornerPosition, Corners() (+3 more)

### Community 76 - "SolarSystem.ts"
Cohesion: 0.20
Nodes (13): FX_APPEAR_MS, FX_SHINE_MS, ORBIT_REFIT_MS, SUN_DISPLAY_SCALE, createOrbitPaths(), ORBIT_IDLE_COLOR, OrbitRing, orbitStroke() (+5 more)

### Community 77 - "20260810044029_16_constraints_and_caps.sql"
Cohesion: 0.22
Nodes (8): public.enforce_active_goal_cap, public.enforce_group_member_cap, goals_enforce_active_cap, group_members_enforce_cap, public.enforce_active_goal_cap(), public.enforce_group_member_cap(), public.goals, public.group_members

### Community 78 - "public.build_daily_digests"
Cohesion: 0.22
Nodes (8): public.build_daily_digests(), public.daily_completion, public.digest_snapshots, public.group_cycle_stats, public.group_cycles, public.group_members, public.groups, public.users

### Community 79 - "public.circle_roster"
Cohesion: 0.22
Nodes (8): public.circle_roster(), public.goal_group_visibility, public.goals, public.group_cycles, public.group_members, public.groups, public.progress_entries, public.users

### Community 80 - "public.circle_roster"
Cohesion: 0.22
Nodes (8): public.circle_roster(), public.goal_group_visibility, public.goals, public.group_cycles, public.group_members, public.groups, public.progress_entries, public.users

### Community 81 - "public.circle_roster"
Cohesion: 0.25
Nodes (8): private.can_view_checkin_photo(), public.circle_roster(), public.goals, public.group_cycles, public.group_members, public.groups, public.progress_entries, public.users

### Community 82 - "public.build_daily_digests"
Cohesion: 0.22
Nodes (8): public.build_daily_digests(), public.daily_completion, public.digest_snapshots, public.group_cycle_stats, public.group_cycles, public.group_members, public.groups, public.users

### Community 83 - "skyAmbienceProfile.ts"
Cohesion: 0.20
Nodes (12): ACHIEVEMENT_MILESTONE_STEP, STARS_PER_ACHIEVEMENT_MAX, STARS_PER_ACHIEVEMENT_MIN, easeOut(), nextSkyAmbienceUnlockAt(), SKY_AMBIENCE_TIER_LABELS, skyAmbienceProfileForTier(), skyAmbienceTierFromCount() (+4 more)

### Community 84 - "dashboard/notifications/page.tsx"
Cohesion: 0.22
Nodes (12): markNotificationsRead(), metadata, NotificationsSectionPage(), circleLabel(), describe(), hrefFor(), MarkRead(), NotificationRow (+4 more)

### Community 85 - "marks.tsx"
Cohesion: 0.16
Nodes (17): CIRCLE, RHYTHM, BracketedRule(), ClusterMark(), MarkProps, motionOnServer(), OrbitCorner(), OrbitMark() (+9 more)

### Community 86 - ".applyBackdropSpin"
Cohesion: 0.44
Nodes (6): CORE_SPIN_RATIO, coreSpinFor(), MAX_STARFIELD_SPIN, NEBULA_SPIN_RATIO, nebulaSpinFor(), starfieldSpinFor()

### Community 87 - "public.run_daily_rollover"
Cohesion: 0.25
Nodes (7): locked, public.run_daily_rollover(), public.set_checkin_timezone(), pg_catalog.pg_timezone_names, public.group_cycles, public.group_members, public.users

### Community 88 - "public.circle_roster"
Cohesion: 0.25
Nodes (7): public.circle_roster(), public.goals, public.group_cycles, public.group_members, public.groups, public.progress_entries, public.users

### Community 89 - "public.trg_goal_achievement_is_final"
Cohesion: 0.25
Nodes (7): public.trg_goal_achievement_is_final, goals_achievement_is_final, public.trg_goal_achievement_is_final(), public.goal_categories, public.goals, public.user_lifetime_stats, public.users

### Community 90 - "private.rollover_user_day"
Cohesion: 0.29
Nodes (6): private.rollover_user_day(), public.run_daily_rollover(), public.daily_completion, public.group_cycles, public.group_members, public.users

### Community 91 - "public.circle_roster"
Cohesion: 0.29
Nodes (7): private.current_checkin_date(), public.circle_roster(), public.goal_group_visibility, public.goals, public.group_members, public.progress_entries, public.users

### Community 92 - "public.circle_roster"
Cohesion: 0.25
Nodes (7): public.circle_roster(), public.goals, public.group_cycles, public.group_members, public.groups, public.progress_entries, public.users

### Community 93 - "20260810035022_02_users_and_username_history.sql"
Cohesion: 0.33
Nodes (5): auth.users, public.handle_new_user, on_auth_user_created, public.username_history, public.users

### Community 94 - "app-nav.tsx"
Cohesion: 0.20
Nodes (14): activeSection(), BadgeKey, Section, SECTIONS, BellIcon(), CirclesIcon(), GoalsIcon(), OverviewIcon() (+6 more)

### Community 95 - "20260810041855_08_normalize_ownership_deadline_and_hardening.sql"
Cohesion: 0.43
Nodes (5): goals_set_updated_at, group_members_set_updated_at, groups_set_updated_at, public.set_updated_at, users_set_updated_at

### Community 96 - "public.join_circle"
Cohesion: 0.38
Nodes (6): public.circle_preview(), public.join_circle(), public.group_members, public.groups, public.invite_links, public.user_blocks

### Community 97 - "20260813045733_60_hint_codes_on_user_facing_raises.sql"
Cohesion: 0.33
Nodes (5): public.create_invite_link(), public.enforce_active_goal_cap(), public.enforce_group_member_cap(), public.goals, public.group_members

### Community 98 - "public.circle_roster"
Cohesion: 0.29
Nodes (6): public.circle_roster(), public.goal_group_visibility, public.goals, public.group_members, public.progress_entries, public.users

### Community 99 - "data.boundary.test.ts"
Cohesion: 0.47
Nodes (5): GALAXY_DIR, readModule(), REPO_ROOT, runtimeImports(), walk()

### Community 100 - "public.progress_entries"
Cohesion: 0.40
Nodes (5): public, public.daily_completion, public.progress_entries, public.goals, public.users

### Community 101 - "20260810053407_27_group_helpers_and_owner_settings_guard.sql"
Cohesion: 0.33
Nodes (4): public.guard_group_owner_only_settings, groups_guard_owner_only_settings, private.member_role(), public.group_members

### Community 102 - "public.invite_user_to_circle"
Cohesion: 0.33
Nodes (5): public.invite_user_to_circle(), public.group_members, public.notifications, public.user_blocks, public.users

### Community 103 - "public.groups"
Cohesion: 0.67
Nodes (5): public.group_cycles, public.group_members, public.groups, public.invite_links, public.users

### Community 104 - "20260810043149_14_notifications_push_and_digest.sql"
Cohesion: 0.40
Nodes (5): public.digest_snapshots, public.notifications, public.push_subscriptions, public.groups, public.users

### Community 105 - "20260810043744_15_trust_and_safety_tables.sql"
Cohesion: 0.47
Nodes (5): public.audit_log, public.content_reports, public.user_blocks, public.groups, public.users

### Community 106 - "private.circle_checkin_date"
Cohesion: 0.40
Nodes (5): private.circle_checkin_date(), public.run_daily_rollover(), public.group_cycles, public.group_members, public.users

### Community 108 - "public.circle_preview_members"
Cohesion: 0.33
Nodes (5): public.circle_preview_members(), public.group_members, public.groups, public.invite_links, public.users

### Community 109 - "public.circle_preview_members"
Cohesion: 0.33
Nodes (5): public.circle_preview_members(), public.group_members, public.groups, public.invite_links, public.users

### Community 110 - "private.group_day_closed"
Cohesion: 0.33
Nodes (5): private.group_day_closed(), private.rollover_group_day(), public.daily_completion, public.group_cycles, public.group_members

### Community 111 - "goal-record.ts"
Cohesion: 0.17
Nodes (10): ArchivedGoalsPage(), metadata, on(), getRetiredGoals(), RECORD_PAGE_SIZE, RecordDay, RetiredGoal, PHOTO_URL_TTL_SECONDS (+2 more)

### Community 112 - "public.invite_user_to_circle"
Cohesion: 0.40
Nodes (4): public.invite_user_to_circle(), public.group_members, public.user_blocks, public.users

### Community 113 - "public.profile_by_username"
Cohesion: 0.40
Nodes (4): public.profile_by_username(), public.user_blocks, public.user_lifetime_stats, public.users

### Community 114 - "public.job_list_orphan_photos"
Cohesion: 0.60
Nodes (4): storage.objects, public.job_list_orphan_photos(), public.job_null_missing_photos(), public.progress_entries

### Community 116 - "20260810052121_24_rls_helpers_checkin_date_and_goal_owner.sql"
Cohesion: 0.40
Nodes (4): private.current_checkin_date(), private.owns_goal(), public.goals, public.users

### Community 118 - "public.complete_onboarding"
Cohesion: 0.40
Nodes (3): public.complete_onboarding(), pg_catalog.pg_timezone_names, public.username_history

### Community 120 - "playwright"
Cohesion: 0.50
Nodes (3): npx, playwright, @playwright/mcp

### Community 122 - "public.goals"
Cohesion: 0.67
Nodes (3): public.goal_categories, public.goals, public.users

### Community 123 - "public.goal_group_visibility"
Cohesion: 0.50
Nodes (3): public.goal_group_visibility, public.goals, public.groups

### Community 124 - "private.is_cycle_member"
Cohesion: 0.50
Nodes (3): private.is_cycle_member(), public.group_cycles, public.group_members

### Community 125 - "public.run_retention_sweep"
Cohesion: 0.50
Nodes (3): public.run_retention_sweep(), public.digest_snapshots, public.notifications

### Community 126 - "public.handle_membership_removal"
Cohesion: 0.50
Nodes (3): public.handle_membership_removal(), public.group_members, public.users

### Community 127 - "public.handle_membership_removal"
Cohesion: 0.50
Nodes (3): public.handle_membership_removal(), public.group_members, public.users

### Community 128 - "public.set_circle_deadline"
Cohesion: 0.50
Nodes (3): public.set_circle_deadline(), public.group_members, public.groups

### Community 129 - "public.archive_circle"
Cohesion: 0.50
Nodes (3): public.archive_circle(), public.group_members, public.groups

### Community 130 - "public.blocked_accounts"
Cohesion: 0.50
Nodes (3): public.blocked_accounts(), public.user_blocks, public.users

### Community 131 - "public.complete_onboarding"
Cohesion: 0.50
Nodes (3): public.complete_onboarding(), pg_catalog.pg_timezone_names, public.username_history

### Community 134 - "public.progress_entries"
Cohesion: 0.67
Nodes (3): public.goals, public.progress_entries, public.users

### Community 145 - ".build"
Cohesion: 0.21
Nodes (3): nebulaReach(), poseOrbits(), tickOrbits()

### Community 147 - "lab.tsx"
Cohesion: 0.33
Nodes (6): fakeGoals(), fakeId(), fakeMembers(), GalaxyLab(), useFrameRate(), metadata

### Community 148 - "viewhole.tsx"
Cohesion: 0.25
Nodes (10): CLOSED, PageBlocks(), transition(), useViewhole(), Viewhole(), ViewholeContext, ViewholeProps, ViewholeProvider() (+2 more)

### Community 149 - "solar-hero.tsx"
Cohesion: 0.25
Nodes (8): SolarHero, clamp(), COMPACT_SCENE, PALETTE, SCENE, SceneConfig, SolarHero(), SolarHeroProps

### Community 150 - "diffSnapshot.ts"
Cohesion: 0.39
Nodes (8): diffSnapshot(), diffSystem(), planetCoreEqual(), planetOrbitOnlyChange(), sameStar(), sunHasChanged(), systemChanged(), SystemDiff

### Community 169 - "app/page.tsx"
Cohesion: 0.33
Nodes (5): Home(), metadata, LandingContent(), MESSAGES, Notice()

### Community 232 - "avatar.spec.ts"
Cohesion: 0.29
Nodes (4): clearAvatar(), EMAIL(), FIXTURE, WIDE_FIXTURE

### Community 234 - "backfill-sun-presets.ts"
Cohesion: 0.38
Nodes (3): loadEnvLocal(), admin, main()

### Community 235 - "sitemap.ts"
Cohesion: 0.60
Nodes (3): robots(), sitemap(), siteUrl()

### Community 244 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 251 - "goals/[id]/page.tsx"
Cohesion: 0.53
Nodes (4): GoalRecordPage(), on(), CheckinPhoto(), getGoalRecord()

### Community 252 - "digests.spec.ts"
Cohesion: 0.33
Nodes (7): checkIn(), checkinDateFor(), daysBack(), deleteDigests(), seedDigests(), OWNER(), seededCircle()

## Knowledge Gaps
- **297 isolated node(s):** `npx`, `@playwright/mcp`, `metadata`, `Category`, `Circle` (+292 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **65 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `createClient` to `push-client.ts`, `server.ts`, `enforce`, `legal.ts`, `app/page.tsx`, `toMessage`, `goal-record.ts`, `onboarding-form.tsx`, `circles.ts`, `goals/[id]/page.tsx`, `admin.ts`, `dashboard/page.tsx`, `dashboard/notifications/page.tsx`, `circles/[id]/page.tsx`, `errors.ts`, `invites.ts`, `moderation.ts`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `Database` connect `dashboard/page.tsx` to `supabase/proxy.ts`, `database.types.ts`, `server.ts`, `photo-upload.ts`, `userIdByEmail`, `enforce`, `db.ts`, `backfill-sun-presets.ts`, `GalaxySnapshot`, `photos.spec.ts`, `goal-record.ts`, `admin.ts`, `dashboard/notifications/page.tsx`, `circles/[id]/page.tsx`, `digest-days.ts`, `moderation.ts`, `requireEnv`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `GalaxySnapshot` connect `GalaxySnapshot` to `Galaxy`, `Galaxy.ts`, `buildSnapshot.ts`, `galaxy/onboarding.ts`, `diffSnapshot.ts`, `data.ts`, `galaxy-card.tsx`, `mountGalaxy`, `planSnapshotFx.test.ts`, `snapshots.ts`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `npx`, `@playwright/mcp`, `metadata` to the rest of the system?**
  _297 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Planet.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06774774774774775 - nodes in this community are weakly interconnected._
- **Should `push-client.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05516431924882629 - nodes in this community are weakly interconnected._
- **Should `SkyAmbience.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.060451977401129946 - nodes in this community are weakly interconnected._