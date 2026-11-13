MARUYA VIDEOKE OFFLINE PACKAGE

EXPECTED FOLDER STRUCTURE (case-sensitive on many web servers):
  MaruyaVideoke/
    index.html
    sound/
      soundfont.sf2
    idx/
      shubidx
      shubblob
    vendor/
      spessasynth_lib.mjs
      spessasynth_processor.min.js

IMPORTANT IDX FIX:
- Startup now checks ./idx/shubidx and ./idx/shubblob even when the device is offline.
- When online, it can fall back to the hosted IDX copies if a local file is missing.
- The files must be named exactly "shubidx" and "shubblob" (no .txt extension).
- Keep both files directly inside the idx folder, not nested in another folder.
- The index file and blob file must come from the same matching library set.

SOUNDFONT:
- Local path: ./sound/soundfont.sf2

FULL OFFLINE PLAYBACK:
- Include the two SpessaSynth files in ./vendor.
- The IDX files and vendor files were not attached in this conversation, so this ZIP
  contains an empty idx/vendor directory structure for you to populate.
- Use localhost or HTTPS; do not open index.html directly with file://.

Local test:
  Open a terminal in the MaruyaVideoke folder and run:
    python -m http.server 8000
  Then visit:
    http://localhost:8000/
