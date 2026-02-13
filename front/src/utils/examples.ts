const repeatChunk = (chunk: string, count: number) =>
  Array.from({ length: count }, (_, i) => `--- SECTION ${i + 1} / ${count} ---\n\n${chunk}`).join(
    '\n\n',
  )

const markdownDocChunk = `Collaborative Editor Stress Test Document
Generated: 2026-02-13

Purpose
This document exists to stress-test long-form editing, cursor tracking, selection handling, and
real-time updates. It intentionally includes headings, lists, long paragraphs, and repeated
structures. The goal is simple: make a file so long that “normal” edge cases become common.

Background
When many users edit simultaneously, edge cases show up in the boring parts: inserting a newline
near the end of a long file, deleting across paragraph boundaries, and pasting blocks of text that
contain punctuation, numbers, and symbols. The test is not “does it work once?”, but “does it keep
working as the document grows?”.

Checklist
- Keep typing latency acceptable.
- Ensure cursor positions remain stable after remote edits.
- Preserve newlines and spacing exactly.
- Handle large paste operations.
- Avoid duplicated characters.
- Keep selection ranges sane when text changes remotely.

Notes
1) Mix short and long lines.
2) Include some repeated motifs so diffs look noisy.
3) Sprinkle in structured data (lists, pseudo-tables, timestamps).
4) Include a few very long sentences to test wrapping.

Pseudo table
Feature | Expectation | Failure mode
------ | ----------- | -----------
Typing | Instant | delayed echo / duplicate chars
Paste | Stable | missing newlines / reordered text
Undo  | Local | undo “eats” remote changes

Sample paragraph
In a collaborative document, correctness is subtle: a single off-by-one in a position index can
shift every subsequent cursor. The interface might still look fine until two people type at the
same time, at which point the bug becomes obvious. This is why long documents are valuable: they
turn rare problems into frequent ones.`

const storyChunk = `The rain started as a polite tapping on the window and turned, over the course of
an hour, into a steady drumming that made the streetlights shimmer. Inside the office, the air
smelled faintly of coffee and warm electronics. Someone had left a draft open on a second monitor:
half notes, half narrative, a small universe being built line by line.

By midnight, the document had grown into a city. Headings became districts. Lists became the
transit map. Every edit, no matter how small, was a construction crew: a comma repaired here, a
sentence widened there to let meaning pass more freely. The cursor blinked like a lighthouse,
patiently marking where the next thought would land.

When the team finally pushed the save button, it wasn’t a dramatic moment. It was quiet, almost
ordinary. And yet the ordinary is where software lives: in repeated keystrokes, in careful
revisions, in the patience to make something long feel effortless.`

const transcriptChunk = `10:02 Alice: I pasted a large block—did the cursor jump for anyone?
10:03 Bob: Mine stayed put, but I saw the remote caret blink twice.
10:04 Chen: I’m testing selections across paragraphs. Deleting two lines at once.
10:05 Dana: Can we confirm newlines are preserved? I’m seeing a blank line collapse.
10:06 Alice: Reproduced. It happens when the paste includes trailing spaces.
10:07 Bob: I’ll try rapid typing at the end while you edit the middle.
10:08 Chen: Also testing undo/redo: undo should revert only my changes, not the entire document.
10:09 Dana: Logging timestamps. If we need to diff, we want deterministic steps.
10:10 Alice: OK, next: we’ll paste the same chunk multiple times to get a truly long document.`

const logChunk = `2026-02-13T10:22:14.113Z INFO  ws connected id=local
2026-02-13T10:22:14.207Z INFO  doc select docId=7
2026-02-13T10:22:14.354Z DEBUG apply op=insert pos=128 char="\\n"
2026-02-13T10:22:14.355Z DEBUG apply op=insert pos=129 char="A"
2026-02-13T10:22:14.356Z DEBUG apply op=insert pos=130 char="B"
2026-02-13T10:22:14.512Z DEBUG apply op=delete pos=87
2026-02-13T10:22:14.771Z INFO  cursor move pos=512
2026-02-13T10:22:15.004Z WARN  latency spike ms=83
2026-02-13T10:22:15.118Z INFO  cursor move pos=513
2026-02-13T10:22:15.119Z INFO  cursor move pos=514
2026-02-13T10:22:15.120Z INFO  cursor move pos=515`

const oneLineChunk =
  'This is a single-line stress paragraph designed to test wrapping, selection, and performance. ' +
  'It has no newlines; it just keeps going with commas, semicolons; and repeated phrases so that ' +
  'the editor must render an extremely long line without introducing horizontal scroll. '

const examples = [
  repeatChunk(markdownDocChunk, 12),
  repeatChunk(storyChunk, 10),
  repeatChunk(transcriptChunk, 18),
  repeatChunk(logChunk, 24),
  Array.from({ length: 400 }, (_, i) => `${i + 1}. ${oneLineChunk}`).join(' '),
]

export default examples
