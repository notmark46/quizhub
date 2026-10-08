# QuizHub – Setup & Free Vercel Hosting Guide

## 1. Folder layout

```
quizhub/
├─ public/
│  ├─ index.html            ← the app (no edits needed)
│  └─ files/
│     ├─ index.json         ← auto-generated list of subjects (don't edit)
│     ├─ rajasthan-gk.json  ← ONE FILE PER SUBJECT
│     ├─ science.json
│     ├─ maths.json
│     └─ tests/             ← optional: big test files, referenced from subject files
├─ build-index.js           ← builds files/index.json on every deploy
├─ vercel.json              ← tells Vercel how to build and what to serve
└─ package.json
```

To add a subject, drop a new `.json` file into `public/files/`. That's all.

## 2. Subject file format

Each subject file is nested JSON. Every key is a section or sub-section, as deep as you like.
The last key (the test topic) holds the test itself: an object with a `test` key, plus an `answers` key.

```json
{
  "_name": "Rajasthan GK",
  "_icon": "📜",

  "कला एवं संस्कृति": {
    "मंदिर": {
      "राजोरगढ़": {
        "answers": { "1": 1, "2": 3, "3": 4 },
        "test": { ...your exported test JSON, unchanged... }
      }
    },
    "वेशभूषा एवं भाषा": {
      "कसूमल व हीयाली": "tests/kasumal.json"
    }
  },

  "इतिहास": {
    "मध्यकालीन": { "राव चूण्डा": { "answers": {...}, "test": {...} } }
  }
}
```

How the app reads it:

- **Subjects** appear on the home page, one per file in `public/files/`.
- **Keys with children** show as folders. Keep opening them until you reach a key with a `test`, which shows the **Start test** button.
- **`_name` and `_icon`** (optional) set the subject's display name and emoji. Any key starting with `_` is ignored as content. Without `_name`, the file name is used (`rajasthan-gk.json` → "Rajasthan Gk").
- **Separate test file:** instead of pasting a huge test inline, set the key's value to a path relative to `public/files/`, like `"tests/kasumal.json"`. That file contains `{ "answers": {...}, "test": {...} }`. Put these in a sub-folder such as `tests/` so they aren't mistaken for subjects.
- **Flat test format:** a key can also hold `{ "name": "...", "duration": 3780000, "ques": [ ... ] }` directly. Each question has `name`, `options`, `solution` (explanation HTML), and the correct option is the one with `"isCorrect": true`. No `answers` key is needed. `duration` is in milliseconds and drives the countdown timer. If a question's `marks.positive` is 0 or missing, it counts as +1 mark with no negative marking. If every option of a question is flagged correct, any attempted answer scores.
- **Answer key (other format):** if your test has no correct-answer flags, add `answers` next to `test` as `"question number": correct option order`, e.g. `"3": 2`. You can also use the question's `_id` as the key.
- **Key order:** keys appear in file order, except keys that are only digits (e.g. `"2024"`), which JavaScript always sorts first. Use `"Chapter 1"` or `"2024 Papers"` instead. Subject order follows file names, so prefix with `01-`, `02-` if needed (and set `_name`).

## 3. Preview on your computer

Browsers block `fetch` from `file://`, so don't double-click `index.html`. Instead (needs Node.js):

```
cd quizhub
node build-index.js
npx serve public
```

Open the URL it prints (usually http://localhost:3000).

## 4. Deploy to Vercel (free)

**Option A: GitHub + Vercel (recommended; updates are automatic)**

1. Create a free account at github.com and make a new repository (e.g. `quizhub`).
2. Upload the contents of the `quizhub` folder, keeping the structure (`public/`, `build-index.js`, `vercel.json`, `package.json` at the repo root). On GitHub: **Add file → Upload files**.
3. Go to vercel.com and sign up with your GitHub account (choose the free **Hobby** plan).
4. Click **Add New… → Project** and import your `quizhub` repository.
5. Leave **Framework Preset** as **Other**. Don't change the build settings; `vercel.json` already sets them.
6. Click **Deploy**. After about a minute you get a link like `https://quizhub-xxxx.vercel.app`.

**Updating:** add or edit a JSON file in GitHub (upload it, then **Commit changes**). Vercel redeploys on its own, and `build-index.js` refreshes the subject list.

**Option B: Vercel CLI (no GitHub)**

```
npm i -g vercel
cd quizhub
vercel        # follow the prompts, accept the defaults
vercel --prod # publish to your live URL
```

Run `vercel --prod` again after any change.

## 5. Troubleshooting

| Problem | Fix |
|---|---|
| "files/index.json not found" | The build didn't run. Check that `vercel.json` is at the repo root and `public/` holds `index.html`. Locally, run `node build-index.js`. |
| A subject is missing | Its JSON is invalid. The Vercel build log says `Skipping <file>`. Check it at jsonlint.com. |
| "Could not load tests/…" | The path is wrong. It is relative to `public/files/`, and is case-sensitive on Vercel. |
| Test starts but score is 0 | No `answers` key (or wrong question numbers). |

## 6. Good to know

- **Answers are visible.** The JSON files are public, so a student who opens the browser's dev tools can read the answer key. That's fine for practice tests. For real exams, grading has to happen on a server.
- **Rank and percentile** only compare attempts saved in the same browser. There is no shared leaderboard, because that needs a database. Attempt history is stored in the browser's local storage, so clearing browser data clears it.
- **Hosting terms:** Vercel's free Hobby plan is meant for personal, non-commercial use. If you charge students, check Vercel's current terms.
- **File size:** exported tests carry a lot of styling markup. If a subject file gets very large (several MB), move tests into `tests/` files so each loads only when a student starts it.
