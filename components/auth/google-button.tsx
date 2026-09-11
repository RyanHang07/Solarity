const GoogleG = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden focusable="false">
    <path
      fill="#4285F4"
      d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
    />
    <path
      fill="#34A853"
      d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
    />
    <path
      fill="#FBBC05"
      d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
    />
    <path
      fill="#EA4335"
      d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
    />
  </svg>
)

/**
 * Continue with Google.
 *
 * **The one control in the app that deliberately ignores the design system.**
 * Google's branding guidelines fix the colours, the border, the type and the
 * mark, and a restyled version is both a guideline violation and a worse
 * button: this is the single control on the screen people recognise by shape
 * before they read it, and the recognition is the point.
 *
 * So the values are hardcoded rather than tokenised — `#747775`, `#1F1F1F`, the
 * 14px/20px type — precisely so nobody later "fixes" them into tokens and
 * quietly breaks the one thing here that is not ours to decide.
 *
 * `type="submit"`, because it lives inside a `<form action={signInWithGoogle}>`
 * and the redirect is a server action rather than a client call.
 */
export const GoogleButton = ({
  label = "Continue with Google",
}: {
  label?: string
}) => (
  <button
    type="submit"
    className="flex w-full items-center justify-center gap-3 rounded-[3px] px-4 py-2.5"
    style={{
      backgroundColor: "#FFFFFF",
      border: "1px solid #747775",
      color: "#1F1F1F",
      fontFamily: "var(--font-ds-body)",
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: "1.25rem",
    }}
  >
    <GoogleG />
    {label}
  </button>
)
