---
title: How to Make a QR Code That Actually Scans
slug: qr-codes-that-actually-scan
description: Why printed QR codes fail, how large they need to be, and the difference between a free code that lasts forever and one that expires when a subscription lapses.
date: 2026-08-05
tags: [Guides]
tools: [qr-code-generator, wifi-qr-code-generator]
---

Most QR code failures come down to four causes, and all four are avoidable before anything goes to print.

## The single most important thing: static versus dynamic

Search for a QR generator and most results will offer you a free code, then ask for a card. The distinction that matters is what actually gets encoded in the pattern.

A **static** code encodes your real destination — the actual URL, the actual WiFi credentials. Nothing sits between the scanner and the destination. It works offline, forever, with no account.

A **dynamic** code encodes a short redirect link owned by the generator company. Scanning it hits their server, which forwards you on. This lets them offer editable destinations and scan analytics — genuinely useful features. It also means your printed code stops working the day the subscription lapses or the company shuts down.

Restaurants have discovered this the hard way, with menus that stopped resolving after a trial expired. If you are printing something permanent — a sign, a card, a label, a product — use a static code.

## Size it for the scan distance

The most common physical failure is printing too small. A widely used rule of thumb:

> Minimum code width = scanning distance ÷ 10

| Scanned from | Minimum width | Typical use |
|---|---|---|
| 20 cm | 2 cm | Business card, product label |
| 50 cm | 5 cm | Table menu, flyer |
| 1.5 m | 15 cm | Shop window, poster |
| 5 m | 50 cm | Billboard, wall sign |

Err generous. A code that is slightly too large costs nothing; one that is slightly too small fails for everyone with an older phone.

## Leave the quiet zone alone

Every QR code needs a blank margin at least **four modules** wide on all sides — a module being one of the small squares. The scanner uses that emptiness to find the code's boundary.

Designers crop it constantly, because the white space looks like wasted room. Text or graphics pushed against the edge of a code is one of the most common reasons a technically perfect QR fails to scan.

## Keep it dark on light

Scanners expect dark modules on a light background. Inverting it — light modules on dark — fails on a meaningful share of readers, even though some modern phones cope.

Colour is fine if the contrast is strong: dark navy on white scans reliably. Mid-grey on beige does not. Never place a code over a photograph or a gradient.

## Shorten the link before you generate

Fewer characters means a lower QR version, which means fewer, larger modules at the same physical size — and larger modules are dramatically easier to scan.

A 30-character URL produces a version 2 code with 25×25 modules. A 200-character URL with tracking parameters produces version 9 at 53×53. Printed at the same size, the second has modules less than half as wide.

Strip unnecessary tracking parameters, and use your site's shortest canonical path.

## Error correction, and the logo question

QR codes carry redundant data so they survive damage. Four levels exist:

| Level | Damage tolerated | Use for |
|---|---|---|
| L | ~7% | Long URLs, screen-only use |
| M | ~15% | The default for most purposes |
| Q | ~25% | Codes with a logo in the centre |
| H | ~30% | Outdoor signs, labels likely to scuff |

If you want a logo in the middle, that is what the redundancy buys you. Use level Q or H, keep the logo under about 25% of the code's width, centre it, and test the result — the error correction is protecting real data, and covering too much will break it.

## Test before you commit

Print one at final size, on the actual material, and scan it with an iPhone and an Android phone in the lighting where it will live. Glossy laminate under a spotlight behaves very differently from matte paper on a table.

Then scan it once more after the full print run arrives. Print shops rescale artwork more often than you would like.

## Making one

The [QR code generator](/qr-code-generator/) here produces static codes with no watermark, no account and no expiry, and runs entirely in your browser — useful when the code contains something like a WiFi password you would rather not upload. Download SVG for print, since it stays sharp at any size.
