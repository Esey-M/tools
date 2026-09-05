---
title: Why iPhone Photos Won't Open on Windows
slug: heic-photos-wont-open
description: HEIC is half the size of JPEG at the same quality, which is why Apple uses it and why nothing else opens it. Three ways to fix it, including one setting.
date: 2026-09-10
tags: [Guides]
tools: [heic-to-jpg, image-compressor, image-resizer, photo-cropper]
---

You send photos from an iPhone to a Windows PC and get files ending in `.HEIC` that will not open. Or you upload them to a website and it rejects them. Or a colleague replies asking what format this is.

The format is not broken and Apple is not being obstructive. It is a genuinely better format that the rest of the software world has been slow to support.

## What HEIC is

**HEIC** is High Efficiency Image Container — a file wrapper, part of the HEIF standard, holding images compressed with HEVC (also called H.265), the same codec used for 4K video.

Apple made it the default on iPhone in iOS 11, released in 2017. The advantage is straightforward: **roughly half the file size of JPEG at comparable visual quality.** On a phone holding 5,000 photos, that is the difference between 15 GB and 30 GB.

It also does several things JPEG cannot:

- **16-bit colour** instead of JPEG's 8-bit, which means far less banding in skies and gradients
- **Transparency**, like PNG
- **Multiple images in one file** — this is how Live Photos and burst sequences are stored
- **Depth maps**, which is what Portrait mode uses to blur backgrounds after the fact
- **Non-destructive edits** stored alongside the original

JPEG dates from 1992. It is remarkable that it lasted this long.

## Why nothing opens it

HEVC is patent-encumbered. Decoding it requires licences from several patent pools, and that licensing cost is why support did not simply appear everywhere the way JPEG support did.

- **Windows 10 and 11** need the *HEIF Image Extensions* from the Microsoft Store. On many machines HEVC decoding is included via the manufacturer, but on others a separate *HEVC Video Extensions* package is required, and it has at times carried a small charge.
- **Android** has supported HEIC since Android 10, though individual apps vary.
- **Browsers** are inconsistent. Safari handles it; Chrome and Firefox largely do not display HEIC natively.
- **Older software** — anything predating about 2018 — generally will not.

This is why AVIF and WebP have gained ground faster in browsers: they are royalty-free.

## Three fixes, in order of how much hassle they are

### 1. Change one setting and stop creating the problem

**Settings → Camera → Formats → Most Compatible.**

This makes the iPhone shoot JPEG instead. Files roughly double in size and you lose the depth and colour advantages, but every device on earth opens them.

Worth doing if you routinely move photos to Windows, upload to older systems, or share with people who then complain. Not worth doing if you mostly stay in Apple's ecosystem, where HEIC works invisibly.

### 2. Let the phone convert on transfer

**Settings → Photos → Transfer to Mac or PC → Automatic.**

This keeps HEIC on the phone — preserving the storage saving — but converts to JPEG when you plug into a computer. "Keep Originals" is the setting that sends the HEIC files through untouched, and is usually what people have set when they hit this problem.

This is the best option for most people: efficient storage, compatible transfers.

### 3. Convert files you already have

For photos already sitting on a drive, converting is the only route. The [HEIC to JPG converter](/heic-to-jpg/) handles this in the browser — the decoding happens on your own machine, so the photos are not uploaded anywhere, which matters more for personal photos than for most file types.

A practical note when converting: **you are going from a 16-bit to an 8-bit format.** For ordinary photographs this is invisible. For images with smooth gradients — sunsets, studio backdrops — you may see slight banding that was not there before. That is inherent to JPEG, not a fault of the conversion.

## Sharing without converting anything

Often the fastest fix is to avoid the file entirely.

- **Share as a link** from iCloud Photos, Google Photos or similar. The recipient's browser gets a format it understands.
- **Send through most messaging apps.** WhatsApp, Messenger, Signal, Telegram and Slack all convert to JPEG on upload as a side effect of their own compression.
- **Email from the Photos app** rather than attaching files directly — iOS often converts on send.

Emailing the raw file from the Files app is the path that reliably delivers an unopenable `.HEIC`.

## What to keep

If a photo matters, keep the HEIC original and convert copies as needed. Converting HEIC to JPEG discards colour depth and any depth map permanently, and converting back does not restore them — the JPEG is the ceiling from then on.

For photos that are simply going into a document or an email, none of this matters and the converted copy is fine.
