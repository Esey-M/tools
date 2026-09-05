---
title: Why Your PDF Is 40 MB and How to Fix It
slug: why-your-pdf-is-enormous
description: Scanner defaults, embedded fonts and full-resolution images are the usual causes. What actually takes up the space, and how much you can remove safely.
date: 2026-09-10
tags: [Guides]
tools: [pdf-compressor, pdf-merger, image-to-pdf, image-compressor]
---

A three-page document should not be 40 megabytes. When it is, the cause is almost always one of four things, and knowing which one you have determines whether you can fix it losslessly or have to trade quality for size.

## The four causes

**1. It is a scan, not a document.**

This is by far the most common. A scanned page is not text — it is a photograph of text. The PDF is a container holding one large image per page, and the file size is the size of those images.

Scanner defaults make this much worse than it needs to be. A colour scan at 600 DPI produces roughly four times the data of 300 DPI, and around three times the data of greyscale. A page of black text scanned in 600 DPI colour can easily be 8–12 MB on its own.

For a text document, **300 DPI greyscale** is the sensible default and is what most archival guidance recommends. 600 DPI colour is for photographs and artwork.

**2. Images are embedded at their original resolution.**

When you insert a photo into a document, the application scales it *for display* but usually embeds it at full size. A 12-megapixel phone photo shrunk to a 5 cm square on the page is still a 12-megapixel photo inside the file.

Ten photos from a modern phone is 30–50 MB before anything else is added.

**3. Fonts are embedded in full.**

PDFs embed fonts so the document renders identically everywhere. A well-made PDF embeds only the characters actually used — a *subset* — typically a few tens of kilobytes.

Some export paths embed the entire font instead. A full CJK font can be 15–20 MB, and a document using four weights of it carries four copies.

**4. Invisible leftovers.**

Deleted-but-retained objects, previous revisions kept for incremental save, embedded thumbnails, unused form fields, colour profiles, and full-page vector maps hidden under a crop. None of these are visible, and all of them are in the file.

## How much can you actually remove?

It depends on which cause you have, and this is where most compression advice is vague.

| Cause | Realistic reduction | Lossy? |
|---|---|---|
| 600 DPI colour scan → 300 DPI greyscale | 80–90% | Yes |
| Full-resolution photos → downsampled | 70–95% | Yes |
| Full fonts → subsetted | Varies, can be large | No |
| Leftover objects removed | 5–30% | No |
| Already-optimised text PDF | 0–10% | — |

The last row matters. A PDF exported properly from a word processor, containing only text and vector graphics, is already close to minimal. Running it through a compressor will do almost nothing, and any tool claiming a large reduction on such a file is degrading something.

## Choosing a target resolution

The right resolution depends entirely on destination:

- **Screen / email / web** — 150 DPI is comfortably readable and roughly quarters the data versus 300.
- **Office printing** — 300 DPI. This is the standard for a reason; beyond it, most printers cannot resolve the difference.
- **Professional print** — 300 DPI minimum, sometimes 600 for line art.
- **Archival** — keep the original. Compress a copy.

That last point is worth stating plainly: **compression is irreversible.** Downsampling throws away pixels and they do not come back. Always keep the original of anything you might need at full quality later.

## The order to do things in

If you are combining several files, the sequence affects the result:

1. **Fix the source first.** Re-scan at sensible settings if you still can. Nothing downstream recovers as much as not creating the problem.
2. **Compress images before assembling**, if you are building the PDF from photos — [compress the images](/image-compressor/) first, then convert.
3. **Merge, then compress.** Merging first lets the compressor deduplicate fonts and resources shared between documents, which a per-file pass cannot do.

## When the file must be under a specific limit

Email attachment limits are commonly 20–25 MB, and the encoding used for attachments adds roughly 33% overhead — so a 20 MB limit means a file of about 15 MB in practice. This catches people out regularly.

If you cannot get under the limit without destroying the document:

- **Split it.** A 60-page report sent as three files is usually more useful than one unreadable compressed file. The [PDF splitter](/pdf-splitter/) does this by page range.
- **Send a link instead.** Any cloud storage will do, and it avoids the problem entirely.
- **Check whether colour is needed at all.** Converting a colour scan to greyscale is often the single largest saving available and, for a text document, costs nothing that matters.

## A note on where your file goes

Most online PDF tools upload your document to a server, process it there, and delete it later — the retention period varies and is usually in the privacy policy rather than on the page. For a restaurant menu that is fine. For a signed contract, a payslip, a medical letter or anything with an account number on it, it is worth knowing.

The [PDF compressor](/pdf-compressor/) here runs entirely in your browser: the file is read by JavaScript on your own machine and never leaves it. The same is true of the [merger](/pdf-merger/), [splitter](/pdf-splitter/) and [image-to-PDF](/image-to-pdf/) tools. You can verify this by opening them, disconnecting from the internet, and confirming they still work.
