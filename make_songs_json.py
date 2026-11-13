#!/usr/bin/env python3
"""Gumagawa ng songs.json mula sa laman ng songs/ folder.
Takbo:  python3 make_songs_json.py        (sa folder kung nasaan ang index.html)
"""
import json, os, sys
folder = sys.argv[1] if len(sys.argv) > 1 else "songs"
names = sorted(f for f in os.listdir(folder) if f.lower().endswith((".mid", ".midi", ".kar")))
with open("songs.json", "w", encoding="utf-8") as fh:
    json.dump(names, fh, ensure_ascii=False)
print(f"songs.json: {len(names)} kanta")
