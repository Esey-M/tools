---
title: The Password Rules That Made Passwords Worse
slug: password-rules-that-backfired
description: Forced complexity and 90-day expiry were bad advice, and the man who wrote them said so. What the current standards actually recommend.
date: 2026-09-07
tags: [Guides]
tools: [password-generator, password-strength-checker]
---

In 2003, Bill Burr wrote an eight-page document for the US National Institute of Standards and Technology called NIST Special Publication 800-63 Appendix A. It recommended passwords with mixed character types and regular expiry.

That document shaped password policy at essentially every large organisation for the next fifteen years. In 2017, Burr told the *Wall Street Journal*: "Much of what I did I now regret."

NIST had already rewritten the guidance by then. Most websites have not caught up.

## Why complexity rules backfired

The theory was that requiring an uppercase letter, a number and a symbol would produce unpredictable passwords.

What it produced was predictable transformations of predictable words. Told to add a capital, people capitalise the first letter. Told to add a number, they append `1`, or a year. Told to add a symbol, they append `!`. The result is `Password1!` — which satisfies every complexity rule and appears near the top of every cracking dictionary.

Attackers know the rules too. Password-cracking tools apply exactly these transformations by default: substitute `a`→`@`, `e`→`3`, `o`→`0`, `s`→`$`, capitalise the first character, append digits and punctuation. A rule that everyone follows in the same way adds almost nothing to the search space.

## Why expiry backfired

Forced 90-day rotation was meant to limit the damage from an undetected breach.

In practice it produced `Summer2024!` becoming `Autumn2024!`, or `Password1` becoming `Password2`. Studies at the University of North Carolina found that given one old password, researchers could guess the new one in under five attempts for a substantial share of accounts.

It also pushed people to write passwords down and to reuse a single formula everywhere, because remembering twelve genuinely distinct passwords that all change quarterly is not something humans do.

NIST's current position (SP 800-63B) is explicit: **do not require arbitrary periodic changes.** Force a change when there is evidence of compromise, and not otherwise.

## What the guidance says now

The current recommendations are close to the opposite of the old ones:

- **Length is the primary factor.** Allow at least 64 characters; require at least 8, and preferably more.
- **Do not impose composition rules.** No mandatory character classes.
- **Do not require periodic rotation** without evidence of compromise.
- **Check new passwords against lists of known-breached passwords** and reject matches.
- **Allow all characters, including spaces and Unicode.** Do not truncate.
- **Allow paste.** Blocking it breaks password managers, which is a security loss, not a gain.
- **Drop security questions.** Mother's maiden name is public information.

## The arithmetic behind "length wins"

Every character added multiplies the search space by the alphabet size. Every character class added multiplies it once, in total.

A 10-character password from the full 95-character printable ASCII set has about 95¹⁰ ≈ 6×10¹⁹ combinations — around 66 bits.

A 16-character password of lowercase letters only has 26¹⁶ ≈ 4×10²² — around 75 bits. Nine hundred times larger, with a much smaller alphabet, purely from length.

This is why passphrases work. Four random words from a 7,776-word list — the Diceware method — give 7,776⁴ ≈ 3.7×10¹⁵, or about 51 bits. Six words give about 77 bits, which is beyond brute force for any realistic attacker, and is genuinely memorable.

The critical word is **random**. Four words you chose yourself are not four random words; human word choice is heavily clustered and the effective entropy collapses. The security comes from the dice, not the dictionary.

## What to actually do

**Use a password manager.** This is the single change that matters most. It makes every password unique and long without requiring you to remember any of them, which solves reuse — and reuse is what turns one company's breach into your problem everywhere.

**Have one strong memorised passphrase** for the manager itself. Six random words, generated rather than chosen.

**Turn on two-factor authentication** everywhere it is offered, particularly email. An app-based code or a hardware key is meaningfully stronger than SMS, which is vulnerable to SIM-swapping — but SMS is still far better than nothing.

**Prioritise your email account.** It is the reset mechanism for everything else. Whoever controls it controls all of it.

**Do not rotate passwords on a schedule.** Change them when a service is breached, and check exposure at a breach-notification service.

The [password generator](/password-generator/) produces both random-character passwords and Diceware-style passphrases in the browser, and the [strength checker](/password-strength-checker/) estimates entropy — including the penalty for the predictable substitutions above, which is the part most strength meters get wrong.
