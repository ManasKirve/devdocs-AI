# DevDocs AI — Frontend UX Architecture

> **Status:** v1.0 · Frontend reference document
> **Scope:** Complete user journey and UX architecture — landing, repository connection, codebase exploration, semantic search, AI Q&A, source citations, hierarchy, states, navigation, responsive behavior
> **Audience:** Product designers, frontend engineers
> **Companion docs:** `brand-kit.md` (design system, tokens §6–§8) · `visual-direction.md` (screen-level visual reference)
> **Constraint:** Defines the frontend experience only. No backend, API, RAG, ingestion, embeddings, search, or GitHub behavior changes.

---

## 0. Product Workflow — The One Sentence

> **Connect a GitHub repo → explore its files → search its code by intent → ask questions with sourced answers.**

The entire product is one coherent workflow with a single mental model. A user arrives,
connects a repository, and then operates inside a **codebase workspace** where every
view (tree, search, Q&A, file) is a different lens on the *same* indexed repository.
Nothing in the UX ever asks the user to understand the machinery (chunks, embeddings,
vectors). Those are implementation details the UI surfaces as *counts and progress* —
never as concepts the user must learn.

```
connect ──► explore ──► search ──► ask ──► verify
   │           │          │         │         │
 owner/repo    tree     intent    sources   github
               files    results   + answer   (inspect)
```

This section defines the four verbs as the user experiences them:

| Verb | User says | Product does |
|---|---|---|
| **Connect** | "Here is my repo" | Fetch, chunk, embed, index → repo is ready |
| **Explore** | "What's in here?" | Tree, file browser, stats, language breakdown |
| **Search** | "Where is X handled?" | Semantic search → ranked files, snippets, line ranges |
| **Ask** | "How does X work?" | Grounded answer + source citations |

---

## 1. Landing Experience

### 1.1 Goal

The landing page must do one job: get a developer to paste a repository URL and press
**Analyze**. It is a working product front door, not a brochure. Every section of the
page answers a question the developer actually has, and every CTA points at the same
next action — connecting a repository.

### 1.2 Page anatomy (top to bottom)

```
┌───────────────────────────────────────────────────────────────┐
│ Navbar — logo · links · backend status · GitHub               │
├───────────────────────────────────────────────────────────────┤
│ HERO                                                          │
│   eyebrow     AI-powered codebase intelligence                │
│   headline    Understand any codebase — with sources.         │
│   subcopy     product promise (one paragraph)                 │
│   [ github.com/owner/repository ] [Analyze]   ← primary action│
│   workspace mock (tree / code / analysis)                     │
├───────────────────────────────────────────────────────────────┤
│ HOW IT WORKS — connect → index → search → ask (4 steps)        │
├───────────────────────────────────────────────────────────────┤
│ REPOSITORY ANALYSIS — what "analyze" actually does, with real │
│   step names (fetch, chunk, embed, index) + honest detail      │
├───────────────────────────────────────────────────────────────┤
│ AI CAPABILITIES — search + Q&A, both grounded, both cited     │
├───────────────────────────────────────────────────────────────┤
│ FOR DEVELOPERS — benefits list (fast, traceable, no lock-in)  │
├───────────────────────────────────────────────────────────────┤
│ CTA BAND — the hero input again, one more chance to connect   │
├───────────────────────────────────────────────────────────────┤
│ Footer                                                        │
└───────────────────────────────────────────────────────────────┘
```

The landing page is the **only** marketing surface. Once a user connects a repository,
they leave marketing entirely and enter the workspace (Section 9).

### 1.3 Hero

Per `visual-direction.md §1`:

| Element | Spec |
|---|---|
| **Eyebrow** | Overline, mono, uppercase, 6px accent dot, `--text-muted`. "AI-powered codebase intelligence" |
| **Headline** | Display 700, `--text-primary`. Mono highlight on "sources" in `--accent-text` — *no gradient* |
| **Subcopy** | Body 18px, `--text-secondary`, max 620px. The promise: connect a repo, get searchable queryable documentation grounded in the actual source |
| **Input** | Command-line treatment: GitHub prefix icon, placeholder `github.com/owner/repository`, one primary "Analyze" button |
| **Workspace mock** | Real three-pane UI surface (tree / code / analysis), not a screenshot texture. Framed, `--shadow-lg`, no glow |

**Behavior contract for the hero input:**
- It is the page's single primary CTA (brand kit: *one primary per view*).
- Submitting scrolls to / opens the connect surface (Section 2) or, in the single-page
  variant, focuses the analyzer form. On submit the URL carries forward — never re-type.
- Keyboard: `/` focuses the hero input (matches search convention, Section 4).
- The mock always implies a real next screen — a click on the mock scrolls to the
  analyzer, or opens a demo/example repo.

**What the hero never does:** no robot avatar, no chat bubble, no "type a question"
placeholder, no purple glow, no gradient text, no floating particles.

### 1.4 How It Works

A 4-step strip, each step a **verb + one-line result**. No marketing fluff; the steps are
the real pipeline, expressed in user language:

| Step | Title | Copy (result, not machinery) |
|---|---|---|
| 1 | Connect | Paste a public GitHub repo URL |
| 2 | Index | Files are fetched, chunked, and embedded |
| 3 | Search | Find code by intent, not keywords |
| 4 | Ask | Get answers with file + line citations |

Visual: 4 numbered steps in a horizontal row, connected by hairlines, with a mono
detail line under each (e.g. `1,284 files`, `512 chunks`, `0.87 score`). Steps are
**content**, not icons-and-cards decoration.

### 1.5 Repository Analysis Explanation

This section demystifies the word "analyze" — the exact moment that separates this
product from a generic chatbot. It must show the pipeline honestly and with real
counts (this is also the trust model of the whole product):

- **Fetch** — clone `github.com/owner/repository`, public repos only.
- **Chunk** — source files split into indexed units (files shown, chunks created).
- **Embed** — each chunk vectorized for semantic search.
- **Index** — search + retrieval prepared; repo status turns green.

Present as a vertical step list (matching the live indexing UI in Section 2.4 — the
landing explanation and the real progress UI are *the same component language*). This
consistency is deliberate: what the user reads about is exactly what they'll see happen.

### 1.6 AI Capabilities

Two capabilities, both framed as "grounded" — never as free-form AI:

| Capability | One-liner | Evidence shown |
|---|---|---|
| **Code search** | "Ask where authentication is handled — get the file and the line." | Snippet with match highlight, file path, score |
| **Codebase Q&A** | "Ask how the payment flow works — get an answer with sources." | Answer + "Sources · N" block |

Each gets a small live preview: a search result row and an answer-with-citations row,
built from the same components used in the workspace. **Show the citation card on the
landing page.** It is the single strongest differentiator the product has.

### 1.7 Developer-Focused Benefits

A short, dense benefit list — the things a working developer actually cares about. Keep
it to four, stated as outcomes with a traceable detail:

- **Fast to first answer.** Connect a repo and search it in minutes, not days.
- **Grounded, not guessed.** Every answer and result links back to file + lines.
- **Traceable.** Open any citation directly in GitHub.
- **Nothing to install.** Runs in the browser against the DevDocs AI backend.

Render as a bordered **data-style table / stat rows**, not three identical gradient
insight cards. No metrics that we can't display truthfully (avoid fake "10x faster").

### 1.8 CTA

Two CTAs total on the page, both the same action ("Analyze a repository"), placed at
hero and as a closing band. One primary button per view (brand kit §6.6). The closing
band reuses the hero input component — identical placeholder, identical primary button,
so the action is never re-learned.

---

## 2. Repository Connection

### 2.1 The surface

In the workspace, connecting a repository is the **empty state of the whole product**,
not a marketing form. When no repository is connected, the workspace shows one calm,
focused screen: the URL input, honest constraints, and the reason the product exists
("no repository connected" empty state per `visual-direction.md §7.1`).

```
┌──────────────────────────────────────────────────────┐
│  Connect a GitHub repository                         │
│  Paste a public repo URL to index its code.          │
│                                                      │
│  [github.com/owner/repository          ]  [Analyze]  │
│  · Public repositories only                          │
│  · Analysis runs on the DevDocs AI backend           │
│                                                      │
│  Example repos (chips):                              │
│  [fastapi/fastapi] [pallets/flask] [golang/go]       │
└──────────────────────────────────────────────────────┘
```

### 2.2 URL input

| Property | Spec |
|---|---|
| Field | Single-line input, `--bg-inset`, `--border-strong`, `--radius-md`, GitHub prefix icon |
| Placeholder | `github.com/owner/repository` (never used as the label) |
| Label | "GitHub repository URL", UI-label size, `--text-muted` |
| Auto | `autocomplete=off`, `autocapitalize=none`, `spellcheck=false`, `inputmode=url` |
| Example chips | 2–3 real, indexable public repos as quick starts (mono, `--bg-surface`, accent border on hover) |
| Submit | One primary button, 44px (large variant). Enter submits. |

### 2.3 Validation

Validation is **progressive and honest**, never blocking.

| Stage | Rule | Feedback |
|---|---|---|
| Empty | Cannot submit | Button disabled (opacity 0.5), no message |
| Syntax | Client-side format check: matches `github.com/owner/repo` / `owner/repo` patterns | Live inline hint under field: mono correction, e.g. "Format: `github.com/owner/repository`" — shown only while invalid but non-empty |
| Accessibility | Repo is public and reachable | **Server-time** — surfaced as an inline error after submit (Section 2.7). Never claim success before the server says so |

Client-side validation only normalizes shape (trim, strip trailing `/`, allow `https://`
or bare). Existence/access checks are the backend's job; the UI just reports them well.

### 2.4 Loading / Indexing

On submit the input is disabled, the button swaps its label to "Analyzing…" with a 15px
accent spinner (label persistence per `visual-direction.md §8.2`), and the progress
surface appears **below the form** — the form stays visible and editable.

Progress UI — the vertical step list (`visual-direction.md §8.1`), which mirrors the
landing explanation:

| Step | Label | Mono detail line (real values) |
|---|---|---|
| 1 | Fetching repository | `clone github.com/owner/repository` |
| 2 | Analyzing source | `1,284 files · 42% TypeScript` |
| 3 | Chunking | `chunk 512/1,284` |
| 4 | Embedding | `embedding chunk 512/1,284` |
| 5 | Indexing | `writing to vector index` |

Step visuals: done = green check; active = accent ring, subtle pulse (1.8s); pending =
faint dot. Rail = 1px `--border-strong` between steps. All detail lines are mono,
`tabular-nums`, `--text-muted`.

**State rules during indexing:**
- Previous content stays on screen; nothing is blocked or modal.
- The URL field remains editable but submit is disabled; "Cancel" is available (ghost,
  stops the client-side flow and returns to idle).
- If the backend exposes per-step counts, render them live; otherwise render the last
  known step as active with an honest "preparing…" detail line — never fabricate counts.
- A skeleton of the post-index results area sits behind the progress (shimmer 1.5s).

### 2.5 Success

Per `visual-direction.md §2.2` and brand kit §9.7:

- Repo identity block appears: `owner/repo` mono 600 `--text-primary`, with a stat row
  (files · lines · languages · indexed size) as mono `tabular-nums` data, not cards.
- Status flips to green dot + "Indexed".
- A single primary next action: **"Start exploring"** (→ tree) plus secondary ghost
  **"Ask a question"** (→ Q&A). Exactly one primary.
- The result is **quiet**. No confetti, no celebratory copy — "Index ready" is the
  reward (brand kit §2.1, never checklist).
- The repo becomes the active context for the entire workspace (Section 9).

### 2.6 Failure

Per `visual-direction.md §9` — the three-question contract (what happened, what to do,
can I retry):

```
   [⚠]  Failed to index owner/repo (GitHub rate limit)
        Re-authenticate or wait a few minutes, then retry.
        [ Retry ]  [ Open docs ]
```

| Rule | Spec |
|---|---|
| Placement | Inline, stacked directly under the failing control |
| Anatomy | `--red-soft` fill, `--red-border`, `--radius-md`, 15px red icon |
| Copy | Specific + honest: "Failed to index `owner/repo` (rate limit)" — never "Oops!" |
| Retry | First-class ghost-primary action, always present unless impossible (then say why) |
| Input state | Error border on the field; the URL the user typed is preserved so retry is one click |

Common failure classes to name specifically in copy: repo not found, private repo,
rate limit, clone failure, timeout, backend offline. Each maps to a distinct message +
action.

---

## 3. Codebase Exploration

### 3.1 Purpose

Exploration is how the user develops a *map* of the repository before they search or
ask. The UI has to make a large unfamiliar codebase feel navigable in seconds. It is
the IDE-equivalent "project tree" — **orientation, not marketing**.

### 3.2 Files — repository tree

Per `visual-direction.md §2.3`:

| Property | Spec |
|---|---|
| Placement | Left pane, 240–280px, `--bg` base, one shared scrollbar |
| Rows | Mono paths, indent guides (1px `--border-faint`), folder/file icons 14px `--text-muted` |
| Colors | Directories `--text-secondary`, files `--text-primary` |
| Active row | `--bg-hover` fill + accent file icon — never a full accent background |
| Expand/collapse | Chevron rotate 90° over `--duration-fast` |

Interactions:
- Click a file → opens it in the code viewer (Section 3.5).
- `[` / `]` or `←`/`→` collapse/expand focused node (keyboard-first).
- Search-as-you-type filter box above the tree to jump to a file by name (`⌘P`-style
  command palette optional but recommended).

### 3.3 Languages

A quiet **language breakdown** in the repo stats block: count per language + relative
proportion, rendered as mono `tabular-nums` rows with `--text-muted` labels. Used for
two things only — orientation ("this is a TypeScript repo") and as a **filter** for
search and Q&A ("search only within `*.py`"). Never an animated donut chart; a data
table reads faster (brand kit §2.1).

Language filter behavior: chips above search results (`TypeScript · Python · Go …`),
multi-select, mono labels. Active chips use `--accent-soft` fill + `--accent-border`.

### 3.4 Chunks

Chunks are **never exposed as a first-class concept**. The user never sees a "chunk";
they see *files, snippets, and line ranges*. Chunk data (index, size, count) appears
only as:
- Metadata inside a citation row (`Chunk 12`), which is a debugging-grade detail.
- The indexing progress detail lines ("chunk 512/1,284").

This is a deliberate information-architecture decision: the product's promise is *code
understanding*, and chunks are machinery.

### 3.5 Search results & source code as exploration

The code viewer (opened from the tree, a search result, or a citation) is the product's
read surface:

| Property | Spec |
|---|---|
| Header | Breadcrumb path (` › ` separators, `--text-faint`), language chip, line count, copy file button |
| Body | Mono 13px, line numbers gutter (4ch, `--text-faint`, `tabular-nums`), syntax-highlighted per `brand-kit §10.2` |
| Active line | `--bg-hover` row fill + 2px accent left bar + brightened line number |
| Scroll | Styled thin scrollbar; horizontal scroll only when a line is genuinely too long |
| Links | In-viewer jump markers: `⌘G` go to line; clicking a highlighted range scrolls to it |

---

## 4. Semantic Search

### 4.1 The experience

The search bar sits at the top of the main column, always visible in the workspace.
It is a **command line for the codebase**: type intent, get files. A user asks "where is
authentication handled?" and receives ranked results grounded in the actual source.

```
Search owner/repo                        [ / ]
┌──────────────────────────────────────────────────────────────────┐
│  how is authentication handled                         0.87      │
│  src/services/auth.py · :12–58 · Python                            │
│  def authenticate(request): ... matches ▲ ...                       │
├──────────────────────────────────────────────────────────────────┤
│  ... (next result row)                                            │
└──────────────────────────────────────────────────────────────────┘
```

### 4.2 Search bar

| Property | Spec |
|---|---|
| Treatment | `--bg-inset`, `--border-strong`, `--radius-md`, prefix search icon, mono kbd chip `/` on the right |
| Context | Active repo as a mono chip beside the bar (`owner/repo`) |
| Shortcut | `/` focuses the bar from anywhere in the workspace; `Esc` clears/blurs |
| Submission | Enter searches; the button swaps icon for spinner but keeps the "Search" label (§8.2) |

### 4.3 Result rows

Per `visual-direction.md §2.4` and brand kit §9.8 — **dense list rows, not cards**:

| Element | Spec |
|---|---|
| Header | File icon (accent) + mono path + language chip + score badge |
| Body | Mono 12.5px snippet, `pre-wrap`, max-height ~220px, context lines around the match |
| Match highlight | `--accent-soft` background + 2px `--accent-underline` — **one marker style everywhere** |
| Score | Small mono badge, success-green, `tabular-nums` (`0.87`) |
| Rows | 8px gaps, 12px padding; hover brightens border only |

### 4.4 Relevance & similarity

- Score is shown **always** (trust), never hidden. Rendered as a success-green mono
  badge — quantitative, not decorative.
- A short relevance rationale is surfaced only on hover/expand: `"matched symbol
  authenticate (0.87)"` in a tooltip — it explains *why* without adding row noise.
- Sorting default is relevance; the user can switch to "Most recent" or filter by
  language. The ranking never pretends to be exact — results are *ranked evidence*, and
  the citation/line-range lets the user verify instantly.

### 4.5 Empty results

Per `visual-direction.md §7.2`: icon, `No results for "query"`, one `--text-muted`
line, and a "Clear filters" ghost action. Never confetti, never a suggestion to "try a
similar question" in a marketing tone — suggest a broader term or a symbol name.

---

## 5. AI Codebase Q&A

### 5.1 The experience

The Q&A surface is where DevDocs AI shows its full value: **an answer with the evidence
it was built from, one step away from the source**. It is the product's core demo, the
reason a senior engineer keeps the tab open.

Representative questions the UI must handle gracefully:

| Question | What the answer must include |
|---|---|
| "How does authentication work?" | Flow description + entry point file/line + the auth function citation |
| "Where is the database connection created?" | The exact file + line, the client setup snippet |
| "Explain the payment flow." | Step sequence + the files/lines implementing each step |
| "Where is this API endpoint implemented?" | Route registration file/line + handler file/line |

### 5.2 Panel anatomy

Per `visual-direction.md §2.5`. The Q&A lives in the **inspector panel** (380–420px,
`--bg-elevated`, left hairline) or, on narrow screens, as a full-width section below the
main column.

```
┌────────────────────────────────────────────────┐
│ Ask DevDocs      owner/repo       RAG · 0.87   │  ← panel header
├────────────────────────────────────────────────┤
│  What is the database connection?              │
│                                                │
│  [ textarea (min 92px, resize vertical) ]      │
│  Grounded in owner/repo          [ Ask ]       │
│  (suggested questions as mono chips)           │
├────────────────────────────────────────────────┤
│  ── answer ────────────────────────────────    │
│  The app connects via `create_engine` in       │
│  `src/db.py`. The engine is created once and   │
│  shared through `get_session`. [1]             │
│                                                │
│  Sources · 3                                   │
│  ┌─ src/db.py · Python · :12–58 · 0.87         │
│  └─ src/main.py · Python · :102–110 · 0.72     │
└────────────────────────────────────────────────┘
```

### 5.3 Input & suggestions

| Property | Spec |
|---|---|
| Placeholder | A **concrete example**, never a chat greeting: "Ask about this repo — e.g. how is auth handled?" |
| Textarea | Min 92px, `resize: vertical`, mono-context meta row beneath (repo, format badge) |
| Suggestions | 3–4 repo-aware question chips, mono, `--bg-surface`, accent border on hover. Disabled state swaps copy to "Connect a repository to ask questions" |
| Submit | "Ask" primary; disabled until a repo is connected and text exists |

### 5.4 Generating state

Per `visual-direction.md §8.3`:

- The question stays visible above the input.
- A quiet status row replaces the button: mono text `Analyzing src/services/auth.py …`
  with a three-dot pulse at `--accent`. Show the real artifact being retrieved when the
  backend exposes it.
- **The answer panel reserves layout** so the answer's appearance never shifts the page.
- No shimmering avatar, no typing bubbles, no "thinking…" chat theatrics.

### 5.5 Answer rendering

| Rule | Spec |
|---|---|
| Format | Rendered markdown (headings ≤ H3, lists, inline code, blockquotes) |
| Color | Body `--text-secondary`, emphasis `--text-primary`, inline code accent-tinted mono. Never the whole answer in accent |
| Tone | Specific + dense: file paths, function names, line references in mono |
| Inline source markers | Superscript `[1]` `[2]` markers in the answer body map to the Sources list — clickable both ways (marker → scrolls to source row; row → highlights the marker context) |
| Veracity | Answers are *sourced*, never presented as authority. Where the model is uncertain the answer says so ("This repo has no explicit auth layer — nearest match is `middleware.py`"). Honest failure is a brand value (§4.2) |

### 5.6 Failure

- Q&A errors render **inline in the panel**, between input and answer area
  (`visual-direction.md §9.3`).
- Empty/no-evidence result: the answer may legitimately be "no relevant code found" —
  this is a **valid, honest outcome**, rendered as a calm empty result with the closest
  files offered as evidence (never a fabricated answer).
- Global failures (backend offline): slim dismissible banner under the nav — not a
  blocking modal.

---

## 6. Source Citations

### 6.1 Purpose

Citations are **the product's trust contract** (brand kit §9.10). An answer without
citations is a bug; a citation that can't be inspected is a lie. The UI treats them as
first-class interactive objects, not a footnote list.

### 6.2 Citation anatomy

Per `visual-direction.md §2.6`:

```
┌────────────────────────────────────────────────────────────┐
│  [📄]  src/db.py                         0.87   ↗ GitHub   │
│        src/services · Python · :12–58 · Chunk 4             │
└────────────────────────────────────────────────────────────┘
  32px bordered icon square   mono primary   meta line mono   link
```

| Element | Content | Treatment |
|---|---|---|
| **File** | `file.ts` | Mono, `--text-primary`, weight 600 |
| **Line range** | `:42–58` | Mono, `--text-muted`. Degraded range (no numbers) renders `—`, never hidden |
| **Language** | `TypeScript` | Mono caption chip |
| **Relevance** | `0.87` | Mono success-green badge, `tabular-nums` |
| **Chunk index** | `Chunk 4` | Mono caption, `--text-muted` (debugging-grade detail) |
| **Open in GitHub** | external link | Accent-tinted — the only accent in the row |
| **Block label** | "Sources · N" | Overline, `--text-muted`, above the list |

### 6.3 Interaction contract

Every citation supports four actions:

1. **Inspect inline** — click expands an in-panel code preview of the cited range
   (syntax-highlighted, line-numbered), so the user verifies without leaving.
2. **Open full file** — click the path opens the code viewer at that range.
3. **Open in GitHub** — external link, `target="_blank" rel="noreferrer"`, jumps to the
   exact file and line range on github.com.
4. **Jump from answer** — the `[1]` marker in the answer scrolls to and highlights the
   matching source row (accent left bar + `--bg-hover`), and vice-versa.

In a combined workspace view, activating a citation **scrolls and highlights the
corresponding source context** in the code viewer (`visual-direction.md §2.6`).

### 6.4 Rules

- Never render an answer without its Sources block — a "no sources" answer is an error
  state, not an accepted output.
- Citations are rows (they flow and scroll), not cards sitting in a grid.
- Reuse across surfaces: search results, Q&A answers, and the code viewer all use the
  same citation component so the "evidence language" is learned once.

---

## 7. Information Hierarchy

### 7.1 Priority order

Every workspace view answers this question in the same order of visual importance:

```
 1. AI ANSWER        The user's question, answered. Primary text, full width.
 2. SOURCE EVIDENCE  Files + lines that ground the answer. Accent only for links.
 3. REPO CONTEXT     owner/repo, language filters, active scope. Always visible, quiet.
 4. ACTIONS          Ask, Search, Analyze, Copy, Open in GitHub. One primary per view.
 5. METADATA         scores, chunk index, timestamps. Smallest, muted, tabular.
```

### 7.2 How priority is expressed

Priority is achieved with the **type scale, luminance, and the one accent** — never by
adding color layers.

| Layer | Typography | Color | What it is |
|---|---|---|---|
| **1 · Answer** | Body 15–16px, headings ≤ H3 | `--text-primary` emphasis / `--text-secondary` body | The deliverable |
| **2 · Sources** | File path mono 13px primary | Row borders `--border`; GitHub link `--accent` | The evidence |
| **3 · Context** | Mono chips, caption | `--text-muted`, active = `--accent-text` | Where you are |
| **4 · Actions** | UI label 13px/550 | One accent primary; ghosts otherwise | What you can do |
| **5 · Metadata** | Caption 12.5px mono `tabular-nums` | `--text-muted` → `--text-faint` | Precision, not noise |

### 7.3 Rules

- The accent appears **only** where it means something: active nav, primary action,
  links, active step, match highlight, selected file. If a view has no such state, it
  has no accent.
- Headlines are near-white; never accent-colored, never gradient.
- Mono is reserved for code, paths, identifiers, and numeric data — body prose is never
  mono.
- Answers get the space; metadata gets the corners. If two elements fight for the eye,
  the answer wins and the metadata gets smaller.

---

## 8. User States

The complete state machine of the product. Each state has a defined visual, copy, and
transition — states, not surprises (brand kit §9.1).

### 8.1 State table

| # | State | Trigger | UI (reference) |
|---|---|---|---|
| 1 | **First visit** | No repo, no history, fresh session | Landing hero + full marketing page (Section 1) |
| 2 | **No repository** | Workspace opened with no connected repo | Connect empty state (§2.1 / `visual-direction §7.1`) |
| 3 | **Indexing** | Analyze submitted | Step list with live counts (§2.4 / §8.1) |
| 4 | **Repository ready** | Indexing complete | Green dot + `Indexed` + repo stat block + "Start exploring" (§2.5) |
| 5 | **Searching** | Search submitted | Query + repo visible; skeleton rows; button label persists (§4.4 / §8.2) |
| 6 | **Generating** | Question asked | Question visible; `Analyzing <file> …` status row; reserved answer layout (§5.4 / §8.3) |
| 7 | **Success** | Answer/result delivered | Answer + Sources block; citations interactive (Section 5–6) |
| 8 | **Error** | Any async failure | Three-question error contract; inline; retry first-class (§2.6 / §9) |
| 9 | **Empty results** | Search/Q&A found nothing | Distinct invitation-to-act empty states (§4.5 / §7.2, §7.4) |

### 8.2 Transition rules

- **Nothing ever blocks the page.** Loading overlays the *new content region* only;
  previous content stays visible. No full-screen spinners, no modals.
- **Every transition is explainable.** "Indexing stopped at 512/1,284 files" — partial
  state is shown honestly, never hidden or glossed.
- **Identity is preserved across states.** The repo chip and context never flicker
  between loading and ready; they render once and only update on a real change.
- **Reduced motion honored globally** (`prefers-reduced-motion`): entrances, pulses,
  and shimmer collapse to opacity-only indicators (`brand-kit §11.4`).

### 8.3 Skeleton / loading patterns (tokenized)

| Pattern | Spec |
|---|---|
| Search skeletons | 3–5 rows matching real row shape (header 40% + body 90/70%), shimmer `--bg-hover` 1.5s |
| Answer reservation | The answer panel is laid out to full content height *before* streaming starts — no page shift |
| Button loading | Keep label, swap icon for 15px accent spinner |
| Progress steps | done = green check / active = accent ring pulse 1.8s / pending = faint dot |

---

## 9. Navigation

### 9.1 Model

The workspace is a **five-surface shell**; navigation moves between *lenses on the same
repository*, never between unrelated pages. This is what makes the product feel like a
tool rather than a set of marketing pages.

```
┌──────────────────────────────────────────────────────────────────┐
│ NAV  logo   [Repository · Search · Ask · Code]   ·  status │ GitHub │
├──────────────────────────────────────────────────────────────────┤
│  [tree]   │   active surface (search / ask / code)   │  inspector │
├──────────────────────────────────────────────────────────────────┤
│  status bar · breadcrumb · indexing state · errors                │
└──────────────────────────────────────────────────────────────────┘
```

### 9.2 Surfaces and transitions

| Surface | What the user does | Access |
|---|---|---|
| **Repository** | Overview: stats, languages, connected state | Nav item "Repository", brand logo |
| **Search** | Intent search across the repo | Nav item "Search", `/` shortcut, "Search" from repo overview |
| **Ask** | Grounded Q&A | Nav item "Ask", "Ask a question" CTA |
| **Code** | Browse file tree + view source | Nav item "Code", click file/citation, "Start exploring" |
| **Docs** (future) | Generated per-repo documentation | Nav item "Documentation" (reserved surface; empty state if not yet built) |

**Transition rules:**

- Moving between surfaces keeps the repo context (chip, filters, current file) —
  navigation never resets state; it re-frames it.
- Every navigation transition is a cross-fade (200ms, optional 8px drift), one per
  route, never scroll-triggered.
- The **status bar** (32px, `--bg-elevated`, top hairline) shows the live breadcrumb
  (repo → surface → file), indexing state dot, and error toasts — persistent, quiet,
  always current.
- Deep-linking: `#/owner/repo/search?q=...`, `#/owner/repo/ask`, `#/owner/repo/code/src/file.ts:12`
  are shareable URLs so a developer can paste a search or a citation into a PR/issue.

### 9.3 Nav bar

Per `visual-direction.md §5`: sticky 60px (56px mobile), `--bg-elevated`, hairline
bottom border. Brand left (flat mark, `</>` accent glyph + "DevDocs **AI**"), links
center, right side = backend status dot + GitHub action + (only when globally sensible)
one primary CTA. Active surface = `--accent-text`; hover = `--bg-hover` + primary text.
No animated pills, no underlines.

---

## 10. Responsive UX

The workspace degrades from a three-pane IDE to a clean single-column reading flow.
Per `visual-direction.md §10`.

### 10.1 Breakpoint behavior

| Breakpoint | Layout |
|---|---|
| **≥1024px (desktop)** | Full three-pane: tree (240–280px) · main · inspector (380–420px). Nav shows all links + GitHub |
| **768–1024px (tablet)** | Two-pane: tree hides behind a "Files" toggle; main + inspector side by side (inspector ~340px). Nav swaps to hamburger if links don't fit |
| **≤768px (mobile)** | Single column, panes stack: tree as expandable section → main → inspector below. Nav = hamburger + flat panel (§5.6) |
| **≤560px** | 16px gutters; forms full-width; Q&A meta moves above the button row; stat rows reflow to stacked label/value pairs |

### 10.2 Mobile specifics

| Surface | Mobile treatment |
|---|---|
| Tree | Full-width expandable section ("Files" toggle); rows remain 44px touch targets |
| Search results | Mono strings ellipsize rather than scroll horizontally; tap = open file |
| Q&A | Textarea full-width; Ask button full-width; answer + sources stack cleanly |
| Citations | Tap a citation → expand inline code preview; GitHub link stays a tap target ≥44px |
| Landing | Hero mock becomes a single code pane with a compact status strip — never a cramped 3-column miniature; input + Analyze stack full-width |
| Nav | Hamburger → flat elevated panel, stacked links, then GitHub, then CTA. No drawer animation, no overlay dim |

### 10.3 Shared rules

- Content never touches screen edges (gutters ≥16px).
- No hover-dependent controls — everything reachable by tap.
- Long paths and URLs ellipsize predictably (`text-overflow: ellipsis` + `title`),
  never cause horizontal page scroll.
- Test breakpoints with real data (long paths, dense results, many sources) — the
  layout must degrade gracefully, not break.

---

## 11. UX Principle — A Real Developer Tool

DevDocs AI must feel like software a professional already knows how to use — an IDE,
a code-search engine, CI. It must **never** feel like a marketing template, a generic
chatbot, an AI demo, or a template-generated dashboard.

### 11.1 The developer-tool test

> **If a senior engineer opened this app and couldn't place it next to GitHub, VS Code,
> and Sourcegraph in their workflow, it fails.**

The standard is enforced the same way `visual-direction.md §11` applies the "$10k
developer SaaS" test — but for *behavior*, not just pixels.

| Behavior | Tool-grade ✅ | Demo-grade ❌ |
|---|---|---|
| Search | `/` focuses search, `Esc` clears, results are dense rows | Big search box that animates on hover |
| Answers | Reserved layout, streaming status shows the real file, sources always present | Chat bubbles with typing dots and an avatar |
| Citations | File + line range, copyable, opens in GitHub and inline | Pretty cards that go nowhere |
| Errors | Specific copy + retry first-class | "Oops!" |
| Progress | Real counts, honest steps | Spinner + "Analyzing…" only |
| Loading | Previous content stays; skeletons match final shape | Full-screen modal spinner |
| Density | Information-dense, fast scanning | Content stretched to fill space |
| State | Keyboard focus visible, reduced-motion honored, copy everywhere | Flashy entrances, hover transforms |

### 11.2 What it must feel like

- **Keyboard-first.** `/` for search, `Esc` to clear, `⌘P` file palette, visible
  `:focus-visible`, predictable tab order. A user should be able to run the whole
  connect → search → ask flow without touching the mouse.
- **Clipboard-first.** Every path, snippet, answer, and citation is copyable in one
  action.
- **Calm under load.** Indexing and generation are shown as infrastructure progress —
  counts, files, steps — not as a waiting-room animation.
- **Honest about confidence.** Scores are shown, degraded ranges show `—`, and answers
  that find no evidence say so. Trust is earned by traceability, never by conviction.
- **Boring next to Linear.** If a screen would look out of place beside GitHub,
  Sourcegraph, or CI tooling, it doesn't ship.

### 11.3 Final gate — reject if any of these appear

- A gradient glow, purple wash, or chat-robot avatar anywhere
- An AI answer without its Sources block
- A search result that isn't a dense, mono, line-referenced row
- A full-screen loading state, a confetti success, or a marquee
- A hover-dependent action unreachable by keyboard or tap
- An emoji used as a UI element
- A view with more than one accent color doing work

---

## 12. Implementation Mapping — Current → Target

Grounded in the current codebase so the architecture can be built without a blind
rewrite.

### 12.1 Surface inventory (current state)

| Current component | Current role | Target role (this doc) |
|---|---|---|
| `Hero.tsx` | Marketing hero + terminal mock | Hero per §1.3 (input carries to connect) |
| `Features.tsx` | Feature cards | §1.4–1.6 (How it works / analysis / AI capabilities) |
| `RepositoryAnalyzer.tsx` | Ingest form + simulated steps | §2 (real connect → indexing → ready, honest step counts) |
| `SearchSection.tsx` | Search section | §3–4 (workspace search, tree filter, dense rows) |
| `CodebaseQA.tsx` | RAG Q&A + sources | §5–6 (inspector panel, inline markers, interactive citations) |
| `AIPlayground.tsx` | General-purpose AI (Grok) | Deprecated as a product surface — general AI has no repo grounding; its value folds into Q&A only. Keep only as an explicit dev/demo surface if ever needed |
| `Navbar.tsx`, `Footer.tsx` | Marketing chrome | §9 nav shell + status bar |
| `BackendStatus.tsx` | Health status in nav | §9.3 status dot + banner for global failures (§8) |

### 12.2 Data contract the UX consumes (no backend changes)

| Surface | Data (already returned) | Used for |
|---|---|---|
| Connect | `IngestResponse` (`files_processed`, `chunks_created`, `embeddings_created`, `documents`) | Progress detail lines, repo stat block, success state |
| Search | RAG-style results with `file_path`, snippet, score, line range | Result rows, relevance badges, citations |
| Ask | `RAGResponse` (`answer`, `format`, `sources[]`) | Answer rendering, Sources block, markers |
| Citation | `file_path`, `start_line`, `end_line`, `language`, `chunk_index`, `score` | Citation anatomy (§6.2) |

### 12.3 Component decomposition (target)

```
workspace/
├── shell/            Nav, StatusBar, Pane layout
├── connect/          ConnectForm, ProgressSteps, IndexResult, ConnectError
├── tree/             FileTree, LanguageFilter, RepoStats
├── code/             CodeViewer, LineGutter, Breadcrumb
├── search/           SearchBar, ResultRow, MatchHighlight, ScoreBadge
├── ask/              AskPanel, AnswerContent, GeneratingStatus, AskError
└── citations/        SourcesBlock, CitationRow, InlineSourcePreview
```

Every component is pure presentation driven by typed props from the existing services
(`repositories.ts`, `rag.ts`, `ai.ts`, `health.ts`) and tokens from `brand-kit.md` —
no new dependencies, no backend changes.

---

*DevDocs AI · Frontend UX Architecture v1.0 · Experience design reference only. This
document changes no backend code, API routes, RAG, embeddings, GitHub ingestion, or
dependencies.*
