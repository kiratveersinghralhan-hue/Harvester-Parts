Harvester Parts v73 - GitHub upload package

What is fixed:
1) Mobile install/language modal checkbox layout fixed.
2) Language mixing fixed: app now renders clean English first, then language-ux-patch.js safely translates visible UI without partial word replacement.
3) Cache version bumped to v73 so old browser/service-worker files are refreshed.
4) Package has one main root folder only: harvester-parts-github-v73. There are no nested project folders.

How to upload to GitHub without deleting old files:
1) Unzip this package.
2) Open the harvester-parts-github-v73 folder.
3) Select all files inside that folder.
4) Drag/upload them into your existing GitHub repository root.
5) Choose Commit changes.

Do not upload the folder itself if GitHub asks for files. Upload the files inside it to the repo root so they overwrite the old files.

After deploy:
- Open the website in Safari/Chrome.
- Refresh once.
- If old text still appears, clear browser cache or remove/re-add the app icon from Home Screen, because PWA cache can keep old files.
