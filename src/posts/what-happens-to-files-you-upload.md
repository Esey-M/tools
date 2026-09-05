---
title: What Happens to Files You Upload to Online Converters
slug: what-happens-to-files-you-upload
description: Most web tools send your document to a server; some do everything in the browser. How to tell which is which in thirty seconds, and when it matters.
date: 2026-09-13
tags: [Guides]
tools: [pdf-merger, image-compressor, heic-to-jpg, image-to-text, pdf-splitter]
---

You have a payslip to compress, a contract to merge, or a passport scan to convert. You search, find a free tool, upload the file, download the result. It takes twenty seconds.

Where did the file go?

For most tools, the answer is: to a server you know nothing about, in a country you did not choose, where it sat for some period before being deleted. That is not necessarily a problem. But it is worth knowing, because there is an alternative and most people do not know it exists.

## Two ways a web tool can work

**Server-side.** Your browser uploads the file. A machine somewhere processes it and sends back a result. This is how most online converters work, because it is far easier to build — the processing runs in a normal server environment with mature libraries available.

**Client-side.** The page loads code into your browser, and that code processes the file on your own computer. The file never leaves the machine. Modern browsers can do a great deal of this: reading files, decoding and re-encoding images, manipulating PDFs, even running optical character recognition.

From the outside these look identical. You pick a file, you get a result.

## How to tell, in thirty seconds

**The reliable test: disconnect and try it.**

Load the tool's page, then turn off your Wi-Fi or unplug the network. Now use it.

If it works, the processing was happening on your machine. If it fails or hangs, your file was going somewhere.

This is worth doing once with any tool you plan to use regularly. It cannot be faked.

**The faster test: watch the network.**

Open your browser's developer tools (F12, or Cmd-Option-I on a Mac), select the **Network** tab, then use the tool. Look for a request with a size roughly matching your file — that is an upload.

A client-side tool downloads its code and then goes quiet.

**The weak signals** — worth noting, but not proof:

- A progress bar that says "uploading" is a strong hint.
- A tool that gives you a *link* to the result rather than a direct download is server-side, necessarily.
- File size limits like "max 50 MB" usually indicate a server, though not always.
- Marketing claims of privacy prove nothing on their own. Test instead.

## When it actually matters

For most files, it does not. A meme, a screenshot, a holiday photo, a restaurant menu — upload them anywhere.

It matters when the file contains something you would not post publicly:

- Payslips, bank statements, tax documents
- Contracts, NDAs, anything commercially sensitive
- Medical letters and test results
- Passports, driving licences, identity documents
- Photographs of children
- Anything covered by a professional confidentiality duty — legal, medical, financial

It matters more for **businesses**. Under GDPR and similar regimes, sending personal data about customers or staff to a third-party processor is a processing activity that requires a legal basis and, generally, an agreement with that processor. An employee running a client list through a free converter has quite possibly created a compliance problem, and nobody involved intended to.

## The honest limits of "we delete it"

Reputable server-side services publish a retention policy — commonly one to twenty-four hours — and most of them honour it.

But you are relying on: their code being correct, their staff not accessing files, their servers not being breached, their backups also expiring, and the policy not changing. These are all reasonable things to trust a well-run company with. They are still assumptions, and a client-side tool does not require any of them, because there is nothing to delete.

## What this site does

Every tool here processes files in your browser. There is no upload endpoint. You can verify it with the offline test above — pick any of the [PDF merger](/pdf-merger/), [image compressor](/image-compressor/), [HEIC converter](/heic-to-jpg/) or [image-to-text](/image-to-text/) tools, disconnect, and use them.

Three honest exceptions, because "no data leaves your browser" is a claim that deserves precision:

- **A few tools download a processing library from a public CDN** the first time you use them — PDF parsing, HEIC decoding and OCR are genuinely hard problems and use established open-source libraries. Code comes *down*; your file does not go *up*. Once loaded, they work offline.
- **The currency converter fetches exchange rates.** It has to; rates change. It sends no data about you, only a request for today's rates.
- **Text-to-speech and voice-to-text use the browser's own speech APIs**, which on some browsers process audio on the vendor's servers. This is noted on those two pages, because it is a real exception rather than a theoretical one.

Everything else is arithmetic and file handling done locally.

## The general principle

Client-side is not automatically better — server-side tools can do things browsers cannot, and a well-run service is a perfectly reasonable thing to use.

But it is a choice you should be making knowingly rather than by default, and the thirty-second offline test tells you which kind of tool you are dealing with. For a holiday photo, use whatever is quickest. For a signed contract with your address and salary on it, spend the thirty seconds.
