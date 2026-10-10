# ResQ Development Prompts History

This document records the complete prompt history used in creating and iterating on the **ResQ** offline disaster communication application.

---

### Prompt 1

**Timestamp:** 2026-10-09T14:44:44Z

```text
I have an existing ResQ-Mesh frontend generated in Google AI Studio. I like its current UI and want to preserve it.

For this task, ONLY inspect the existing project.

1. Identify the framework, build system, dependencies, and project structure.
2. Find the main application entry point and all major page and component files.
3. Identify the existing navigation, styling system, assets, and current functionality.
4. Check whether the project already runs and identify any build errors.
5. Explain how the current frontend is structured and where new features should be integrated.

Do not modify, delete, overwrite, reformat, or regenerate any files. Do not initialize another project. Do not redesign the interface.

At the end, provide a concise implementation plan for adding the ResQ-Mesh features while preserving the existing UI. 
I have added the zip file to the folder
```

---

### Prompt 2

**Timestamp:** 2026-10-09T14:49:33Z

```text
run this for me I want to see how it looks like
```

---

### Prompt 3

**Timestamp:** 2026-10-09T14:55:17Z

```text
Give me a list of features you noticed in the frontend of the app.
```

---

### Prompt 4

**Timestamp:** 2026-10-09T15:34:53Z

```text
# ResQ-Mesh: Build a Real Offline Emergency Map

I am building ResQ-Mesh, a disaster-response application. I already have:

1. A Geofabrik OpenStreetMap data file: `northern-zone-latest.osm.pbf`
2. Planetiler downloaded.
3. An existing React frontend created in Google AI Studio that I want to preserve.

## OBJECTIVE

Build a working offline map for an Android phone, initially covering ONE city or district in India.

The application must display roads and map features offline and show nearby:
- Hospitals
- Police stations
- Fire stations
- Community shelters
- Officially verified safe zones

Use free, open-source tools only. Do not use paid APIs or require API keys.

## STEP 1 — INSPECT BEFORE CHANGING ANYTHING

Inspect my existing project and computer environment.

- Identify the frontend framework and package manager.
- Check whether Capacitor or another Android integration is already configured.
- Locate my Geofabrik `.osm.pbf` file and the downloaded Planetiler JAR.
- Check Java availability and available disk space.
- Determine how the existing frontend can load an offline map on Android.
- Check whether MapLibre is already installed.

Do not replace my frontend, rewrite unrelated components, or delete existing files.

If you cannot locate a required file, ask me for its path.

If I have not specified the target city or district, ask me which one to use before starting a lengthy map-generation task. Do not process the entire Northern Zone unnecessarily.

## STEP 2 — GENERATE THE OFFLINE MAP

Use Planetiler to convert the Geofabrik data into a PMTiles archive or another format demonstrably compatible with the selected MapLibre integration.

- Use the existing PBF file rather than downloading another regional extract.
- Limit the generated map to the selected city or district where practical.
- Check Planetiler's actual version, supported arguments and documentation before running it.
- Estimate storage and processing requirements before starting.
- Do not overwrite the original PBF or any ex
<truncated 1756 bytes>
r the existing Android architecture, preferably SQLite if supported without unnecessary complications.

The facilities must remain searchable when internet access is unavailable. Do not make nearby search depend on Overpass or another online API.

For community shelters and safe zones:
- Do not assume that every park, open space or public building is safe.
- Do not invent missing facilities.
- Mark locations as unverified unless supported by an authoritative source.
- Make the source and last-updated time visible where available.

Government data can be added later. Do not block the initial implementation waiting for a dataset that we do not yet have.

## STEP 5 — OFFLINE ACCEPTANCE TEST

Do not claim success just because the application builds.

Verify that:
1. The map renders using locally stored resources.
2. Map labels and relevant map features remain available offline.
3. GPS-based nearby search works without internet, subject to location permission and device GPS availability.
4. Facility filters and detail panels work offline.
5. Saved facility records survive closing and reopening the application.
6. The application does not silently fall back to an online map.

If a physical Android device is unavailable, explain which tests remain unverified.

Include appropriate OpenStreetMap attribution and comply with the applicable data and software licences.

## WORKING METHOD

Work in small, testable stages.

First inspect the project and report the architecture, paths, target-district requirement and proposed implementation steps.

Then implement the smallest working map integration, build it and fix errors. Continue with facility extraction and local storage after the map integration works.

Preserve the current frontend throughout. Do not add paid APIs, unnecessary dependencies or unrelated features.

At each stage, tell me exactly what was completed, what I need to do manually, and what remains.
```

---

### Prompt 5

**Timestamp:** 2026-10-09T16:08:12Z

```text
can't see the map, also I want to be able to search pincode or area and also automatically detect my location if services are on
```

---

### Prompt 6

**Timestamp:** 2026-10-09T16:15:52Z

```text
I want to give another llm to edit this, write me context for whatever you have done.
```

---

### Prompt 7

**Timestamp:** 2026-10-09T16:23:10Z

```text
can't see the map, also I want to be able to search pincode or area and also automatically detect my location if services are on
```

---

### Prompt 8

**Timestamp:** 2026-10-09T16:27:34Z

```text
still can't see map, what do you need if you're missing anything
```

---

### Prompt 9

**Timestamp:** 2026-10-09T16:34:30Z

```text
Fix the missing base map in ResQ-Mesh. The map screen shows a black background and emergency markers but no roads, buildings, or labels.

1. Inspect MapLibre initialization, style JSON, PMTiles registration, archive path, and runtime logs.
2. Verify the PMTiles file exists, is valid, and contains tiles covering the map's current location and zoom.
3. Check that the style uses correct source-layer names and visibly renders roads, land, water, and labels.
4. Fix Android local-file access or protocol issues if present.
5. Preserve the existing UI, markers, filters, and GPS functionality. Do not use paid APIs or remote fallbacks.
6. Rebuild and test; confirm the base map renders offline.

Make minimal changes. Report the root cause and files changed. Do not claim success unless verified.
```

---

### Prompt 10

**Timestamp:** 2026-10-09T17:02:30Z

```text
Fix the development server port conflict in my existing project.

npm run dev runs tsx server.ts, and the server hardcodes or defaults to port 3000. Passing --port 3001 does not change it.

Inspect server.ts and package.json. Make the server read its port from an environment variable such as PORT, defaulting to 3000. Ensure the development server can be started on port 3001 without changing unrelated functionality. Preserve the existing project and report the exact command to run it.
```

---

### Prompt 11

**Timestamp:** 2026-10-09T17:04:39Z

```text

```

---

### Prompt 12

**Timestamp:** 2026-10-09T18:11:24Z

```text
Integrate my downloaded Qwen model into the EXISTING ResQ-Mesh LLM chat page.

CRITICAL REQUIREMENTS:
- Absolutely do not use Gemini, Google AI Studio inference, cloud LLM APIs, or external inference servers.
- All chat inference must use my local model: `qwen2.5-0.5b-instruct-q4_k_m.gguf` (491 MB).
- Preserve my existing LLM page and its design.
- Do not rebuild the application or modify unrelated features.
- No paid services or API keys.

IMPLEMENTATION:
1. Inspect the existing project and determine its actual runtime: browser, React, Capacitor, or native Android.
2. Locate the downloaded GGUF file. If necessary, ask me for its Windows file path. Do not copy the 491 MB model into the frontend bundle.
3. Integrate a compatible local inference runtime, preferably llama.cpp for GGUF, using the least disruptive architecture compatible with this project.
4. On Android, store or import the model into app-accessible storage and load it locally. Do not assume a browser can access an arbitrary Windows or Android file path.
5. Connect the existing chat input and send button to local inference. Display generated responses, loading state, errors and cancellation.
6. Ensure inference still works in airplane mode after the model has been imported.
7. Do not silently fall back to Gemini or another online model if local inference fails. Show an explicit local-model error instead.
8. Keep prompts and chat history on-device. Do not transmit them to external servers.
9. Configure a concise system prompt for basic survival guidance, and clearly acknowledge uncertainty for potentially dangerous medical or emergency questions.
10. Test the model on the actual target device before claiming it works.

FIRST:
Inspect the project and report the simplest compatible integration plan. Identify exactly where the model file should be placed and what runtime or Android bridge is required. Then implement incrementally, preserving the existing page.

Acceptance test: disconnect internet, open the existing LLM page, ask a question, and verify that Qwen generates a response locally. Confirm that no Gemini or external inference requests occur.
```

---

### Prompt 13

**Timestamp:** 2026-10-09T18:26:38Z

```text
is this llm completely working locally?
```

---

### Prompt 14

**Timestamp:** 2026-10-09T18:30:12Z

```text
I need to fix this map, I can't see anything. Please let me know if you require a file or anything
```

---

### Prompt 15

**Timestamp:** 2026-10-09T18:50:59Z

```text
Fix the ResQ-Mesh map so I can use it in my browser preview.

Currently, emergency markers render on a black background, but no roads, buildings, labels or geographic features are visible.

1. Inspect whether the map uses a native Android component or a browser-compatible MapLibre GL JS implementation.
2. Since I am testing in a browser, ensure the map uses a browser-compatible renderer. Do not assume native Android map code works in the browser.
3. Verify that the local PMTiles archive is accessible from the browser and that its protocol is registered correctly.
4. Inspect the archive's geographic bounds, zoom levels, source-layer names and the map style.
5. Fix the root cause so the actual streets, land, water and labels render beneath the existing markers.
6. Preserve all existing UI, marker categories, facility cards and filters.
7. Do not use Google Maps, paid APIs, or an online fallback that hides the problem.
8. Test in the browser and report the exact cause and files changed.

Do not claim success until the map visibly renders.
```

---

### Prompt 16

**Timestamp:** 2026-10-09T19:00:46Z

```text
What if I give you google maps api, can you use it?
```

---

### Prompt 17

**Timestamp:** 2026-10-09T19:01:32Z

```text
AIzaSyCXZe_THu3krpyEiGtkWg6R0zCrpw_GHdo

google maps api
```

---

### Prompt 18

**Timestamp:** 2026-10-09T19:15:54Z

```text
I also need to make a preview of my location through google maps in the main screen right here, remove all lines but give these people random coordinates in delhi ncr to show on map both on the preview and main screen.
```

---

### Prompt 19

**Timestamp:** 2026-10-09T20:13:25Z

```text
Add hotkeys above the sos bar slider to call the police, ambulance or fire brigade
```

---

### Prompt 20

**Timestamp:** 2026-10-09T20:16:17Z

```text
Add hotkeys above the sos bar slider to call the police, ambulance or fire brigade
also the sos slider does not work in the homescreen or on the sos tab
```

---

### Prompt 21

**Timestamp:** 2026-10-09T20:21:11Z

```text
make the police ambulande and fire buttons cleaner, keep the background solid but subtle, Also the slider looks so weird, keep the red circle a circle
```

---

### Prompt 22

**Timestamp:** 2026-10-10T00:26:01Z

```text
run this
```

---

### Prompt 23

**Timestamp:** 2026-10-10T00:28:55Z

```text
Apps name is ResQ and not SafeZ
```

---

### Prompt 24

**Timestamp:** 2026-10-10T00:33:27Z

```text
On top tight, make a my account button where my pfp (keep it blank) is there and when I click on it, I can change my name, age, blood group, emergency contact, medical conditions.
```

---

### Prompt 25

**Timestamp:** 2026-10-10T00:38:06Z

```text
Keep a public channel on top pinned with the local mesh network and Family members chat right bellow
```

---

### Prompt 26

**Timestamp:** 2026-10-10T00:46:51Z

```text
I have to scroll down to the text box, keep it fixed at the bottom of the screen
Also Declutter the ai bar on top, just keep the name Guardian AI, and mention it can run 100% offline
```

---

### Prompt 27

**Timestamp:** 2026-10-10T01:17:46Z

```text
nitialize Git, create a .gitignore file for this stack, commit all project files, and push them to a new GitHub repository named ResQ under my account. Also add a .md file with all prompts I used to make this projects
```

---

### Prompt 28

**Timestamp:** 2026-10-10T01:22:00Z

```text
add a .md file in project folder with all prompts I used to make this project
```

---

