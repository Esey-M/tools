---
title: How to Schedule Meetings Across Time Zones
slug: scheduling-across-time-zones
description: UTC offsets change, half-hour zones exist, and daylight saving does not switch on the same date everywhere. The failure modes, and how to avoid all of them.
date: 2026-09-08
tags: [Guides]
tools: [time-zone-converter, countdown-timer, date-difference-calculator]
---

Almost every cross-timezone scheduling error comes from one of four causes. Each has a straightforward fix, and knowing them removes nearly all of the risk.

## 1. Daylight saving does not change on the same date everywhere

This is the biggest single cause of missed meetings, and it happens twice a year.

- **The EU and UK** switch on the last Sunday of March and the last Sunday of October.
- **The US and Canada** switch on the second Sunday of March and the first Sunday of November.

That leaves a **three-week window in March** and a **one-week window in October/November** where the gap between London and New York is four hours instead of the usual five.

A recurring call set for "3 pm London / 10 am New York" quietly becomes 3 pm / 11 am for those weeks, unless the calendar was set up with proper time zones on both ends.

- **The southern hemisphere runs in reverse.** Australia and New Zealand start daylight saving in October and end it in April, so the gap between London and Sydney swings between 8, 9, 10 and 11 hours through the year.
- **Much of the world does not observe it at all** — most of Asia, Africa and South America, plus Arizona and Hawaii within the US, and Queensland within Australia.

## 2. Zone abbreviations are ambiguous

"CST" means Central Standard Time (UTC−6), China Standard Time (UTC+8), and Cuba Standard Time (UTC−5). "IST" means Indian Standard Time (UTC+5:30), Irish Standard Time (UTC+1), and Israel Standard Time (UTC+2). "BST" means British Summer Time (UTC+1) and Bangladesh Standard Time (UTC+6).

There is no registry that makes these unique, and no reliable way to disambiguate them from context alone.

**Use IANA zone names instead**: `Europe/London`, `America/New_York`, `Asia/Kolkata`, `Australia/Sydney`. These are unambiguous, they encode the daylight-saving rules, and they are what every calendar system uses internally.

Where you must write something human-readable, write the UTC offset explicitly: "14:00 UTC" or "15:00 London (UTC+1)".

## 3. Not every zone is a whole hour

Half-hour and quarter-hour offsets are common enough to catch people out:

| Zone | Offset |
|---|---|
| India, Sri Lanka | UTC+5:30 |
| Iran | UTC+3:30 |
| Afghanistan | UTC+4:30 |
| Myanmar | UTC+6:30 |
| Nepal | UTC+5:45 |
| Chatham Islands, NZ | UTC+12:45 |
| Newfoundland, Canada | UTC−3:30 |
| Central Australia | UTC+9:30 |

Nepal's 45-minute offset means that when it is 12:00 UTC it is 17:45 in Kathmandu. Assuming whole hours puts you a quarter of an hour out, which is exactly enough to seem rude without being obviously wrong.

## 4. Rules change, and they change with little notice

Time zone rules are political decisions and they are revised regularly. Some recent examples:

- **Morocco** moved to permanent UTC+1 in 2018, with an exception during Ramadan.
- **Egypt** reintroduced daylight saving in 2023 after nearly a decade without it.
- **Mexico** abolished most daylight saving in 2022.
- **Chile, Fiji, Jordan, Syria and Iran** have all changed their rules in recent years.
- **Samoa** skipped 30 December 2011 entirely, moving across the date line.

The IANA time zone database is updated several times a year to track this. Devices that have not been updated in a long time can genuinely have the wrong rules.

## How to schedule without error

**Send calendar invitations, not times in a message.** An invitation carries the zone with it and every participant's client renders it correctly. A message saying "3 pm Tuesday" carries nothing.

**When you must write a time in prose, anchor it to UTC** and give one or two local equivalents: "14:00 UTC — 15:00 London, 10:00 New York, 19:30 Delhi."

**Check the dates around the switchovers.** If a recurring meeting spans mid-March, late March, late October or early November, verify what happens in those specific weeks rather than assuming.

**Set recurring meetings from the participants' anchor zone.** If the team is mostly in London, define it in `Europe/London` and let everyone else's calendar follow. Someone will be inconvenienced twice a year regardless; this at least makes it predictable.

**Use 24-hour time.** "7:00" versus "19:00" is unambiguous in a way that "7 o'clock" is not, and midnight and noon in 12-hour notation are genuinely ambiguous — 12:00 am and 12:00 pm are a common source of one-day errors.

**For deadlines, say the zone and be generous.** "End of day Friday" means different things twelve hours apart. "23:59 UTC on Friday 12 September" means one thing.

The [time zone converter](/time-zone-converter/) shows the same moment across several zones at once, using the current IANA rules, so the daylight-saving edge cases resolve correctly rather than being assumed away. For anything with a fixed deadline, the [countdown timer](/countdown-timer/) counts from the actual instant regardless of where you are reading it.
