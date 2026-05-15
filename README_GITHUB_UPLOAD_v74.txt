Harvester Parts v74 - final mobile/auth package

What is fixed:
1) Stronger iPhone/mobile responsiveness so content does not stay narrow or leave blank space.
2) Login/signup messages are clearer for Confirm Email ON/OFF.
3) Phone OTP UI now reveals the OTP input and Verify button after OTP is sent.
4) Phone input sanitizes spaces/brackets and expects +91 format.
5) Cache version bumped to v74 so old browser/service-worker files refresh.
6) Package has one main root folder only: harvester-parts-github-v74. There are no nested project folders.

How to upload to GitHub without deleting old files:
1) Unzip this package.
2) Open the harvester-parts-github-v74 folder.
3) Select all files inside that folder.
4) Drag/upload them into your existing GitHub repository root.
5) Choose Commit changes.

Do not upload the folder itself if GitHub asks for files. Upload the files inside it to the repo root so they overwrite the old files.

Supabase Auth launch checklist:
- For fast testing, you may temporarily turn Confirm Email OFF.
- For a proper live marketplace, turn Confirm Email ON and configure Site URL + Redirect URLs to https://harvesterparts.in.
- Phone OTP will not work until Supabase Auth Phone provider is enabled and an SMS provider such as Twilio/MessageBird/Vonage/Textlocal is configured.
- If email confirmations or password reset emails fail for public users, configure custom SMTP.

After deploy:
- Open https://harvesterparts.in in Safari/Chrome.
- Refresh twice.
- If old layout still appears, clear browser cache or remove/re-add the PWA from Home Screen, because old service worker cache can keep old files.
