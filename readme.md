 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/README.md b/README.md
index bf71883a78e02dbad883deb9e767efaea1e01682..f5397fc360abae5bdc2540e7422742639ff78a62 100644
--- a/README.md
+++ b/README.md
@@ -1,12 +1,29 @@
----
-title: 13-passion
-emoji: 🐳
-colorFrom: green
-colorTo: pink
-sdk: static
-pinned: false
-tags:
-  - deepsite
----
-
-Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference
\ No newline at end of file
+# LinguaTrack Pro
+
+Production-oriented static frontend for an English tutor platform.
+
+## Features
+- Lesson schedule with booking form
+- Billing/tariffs section with payment entry point
+- Lesson template generator
+- AI lesson planner (OpenAI-compatible endpoint)
+- Student account dashboard UI
+- Homework submission + offline worksheet generator
+
+## Quick start
+```bash
+python3 -m http.server 4173
+```
+Open: `http://localhost:4173`
+
+## Production checklist
+1. Replace demo payment action in `app.js` (`TODO_PRODUCTION_CHECKOUT_URL`) with your real payment checkout URL.
+2. Move AI requests to a backend proxy (recommended) so API keys are not exposed in browser.
+3. Add real authentication backend for student cabinet (JWT/session).
+4. Connect database for schedule, students, homework, and payment logs.
+5. Configure domain + HTTPS (GitHub Pages / Vercel / Netlify).
+
+## Files
+- `index.html` — semantic page structure and sections
+- `style.css` — design system and responsive styles
+- `app.js` — interaction logic and AI integration
 
EOF
)
