---
title: Date Maths Is Harder Than It Looks
slug: date-calculations-that-trip-people-up
description: Leap years have a rule most people only half-know, "a month later" is ambiguous, and inclusive counting changes the answer by one. The edge cases that cause real errors.
date: 2026-09-13
tags: [Guides]
tools: [date-difference-calculator, age-calculator, countdown-timer, anniversary-calculator]
---

Dates look like the simplest kind of arithmetic and are among the most error-prone. Not because the sums are hard, but because several perfectly reasonable definitions disagree with each other, and nobody agrees on which one is intended.

## The leap year rule people only half-know

Most people know a leap year is every four years. Fewer know the rest of the rule.

A year is a leap year if it is **divisible by 4** — *except* years divisible by **100**, which are not — *except* years divisible by **400**, which are.

So 1900 was not a leap year. 2000 was. 2100 will not be.

This exists because the Earth's orbit takes about 365.2422 days. Adding a day every four years overcorrects slightly, so the century rule removes three leap days every 400 years, leaving an average year of 365.2425 days — accurate to about one day in 3,000 years.

The 1900 exception caused real, widespread bugs. Lotus 1-2-3 incorrectly treated 1900 as a leap year, and Excel deliberately copied the error for compatibility. To this day, Excel believes 29 February 1900 existed. Any date arithmetic in a spreadsheet spanning that date is off by one — a bug preserved for over forty years because too much depends on it.

## "One month later" has no single answer

What is one month after 31 January?

There is no correct answer, only conventions:

- **28 February** (or 29 in a leap year) — clamp to the end of the shorter month. This is what most software does.
- **3 March** — add the number of days in January. Rarely used, but internally consistent.
- **Undefined** — some systems refuse.

The consequences are visible in a common inconsistency: add one month to 31 January and you get 28 February; add another month and you get 28 March, not 31 March. **Adding months is not reversible, and not associative.** Adding one month twice can give a different result from adding two months at once.

This is why financial contracts specify their convention explicitly, and why "monthly" subscriptions starting on the 31st behave oddly.

## Inclusive versus exclusive counting

"How many days from Monday to Friday?"

- **Exclusive** (subtract the dates): 4.
- **Inclusive** (count both endpoints): 5.

Both are correct for different questions. A hotel stay from Monday to Friday is four nights. A festival running Monday to Friday is five days. A prescription for five days starting Monday ends Friday.

Legal deadlines are worse still, because jurisdictions differ on whether the triggering day counts, and on what happens when the deadline falls on a weekend or holiday. "Within 14 days" genuinely means different dates in different places.

When it matters, state the endpoints rather than the count: "ends on 15 March" is unambiguous in a way that "14 days" is not.

## Age is not a subtraction

Age in years is not the difference in dates divided by 365.25. It is a count of birthdays that have occurred.

Someone born on 1 March 2000 turns 25 on 1 March 2025, regardless of how many leap days fell in between. On 28 February 2025 they are still 24, even though 24.997 years have elapsed.

The awkward case is people born on 29 February. In non-leap years, most jurisdictions treat their birthday as 1 March for legal purposes, though some use 28 February. There is no universal answer, which is one reason 29 February birthdays cause so much trouble in software.

Two other systems worth knowing about: **East Asian age reckoning** traditionally counted a baby as one at birth, with everyone gaining a year at new year — so a person could be "two" days after being born. South Korea moved to international age reckoning in law in 2023. And **financial day-count conventions** — 30/360, actual/365, actual/actual — deliberately use fictional month lengths to make interest calculations tractable, which is why a loan's interest may not match a naive day count.

## Working days, and why nobody agrees

"Five working days" depends on which days are working days.

- The weekend is Saturday and Sunday in most of the world, Friday and Saturday in much of the Middle East, and Friday only in some countries.
- Public holidays vary by country, by region within a country, and by year. England, Scotland and Northern Ireland have different bank holidays.
- Easter moves, and it moves differently for Western and Orthodox churches, so any holiday anchored to it moves too.

Any tool giving a working-day count is applying assumptions. They are usually reasonable and they are usually not stated.

## Two more that cause real bugs

**Daylight saving means some days are not 24 hours.** Twice a year a day is 23 or 25 hours long. Adding "24 hours" to a timestamp and adding "one day" to a date give different answers on those days.

**Week numbering is not universal.** The ISO 8601 standard says a week starts on Monday and week 1 is the week containing the first Thursday of the year. The US convention starts weeks on Sunday and numbers differently. "Week 32" refers to different dates depending on which is meant, and both are in common use.

## The practical advice

Where a date calculation matters — a deadline, a contract, an eligibility date — state the actual date rather than an interval, and say which convention you mean if the count could be read either way.

The [date difference calculator](/date-difference-calculator/) shows both inclusive and exclusive counts side by side, along with working days, so the ambiguity is visible rather than silently resolved. The [age calculator](/age-calculator/) counts birthdays rather than dividing by 365.25, and handles the 29 February case explicitly.
