---
title: Adding Captcha to mandoBot
description: What bot protection cost and bought on a small site with one expensive endpoint.
date: 2026-08-29
author: Roberto Loja
keywords: bot protection, proof of work, CAPTCHA, rate limiting, Django, Next.js, Friendly Captcha
slug: friendly-captcha
draft: false
---

## The Cost of Segmentation

mandoBot translates, segments, and defines Mandarin sentences. Each submission puts the server through four steps:

1. Translate the full sentence into the target language.
2. Segment the sentence into constituent words.
3. Look up definitions for each word.
4. Look up definitions for each hanzi.

Due to several optimizations, parts of this process are effectively free. For example, words are foreign-keyed to their constituent hanzi, so finding them costs nothing. However, fetching dictionary definitions can be a database-heavy operation. As a rough estimate, 200 characters might contain 100 words and 125 distinct hanzi, all of which must be given dictionary definitions, triggering 225 database queries per request, and double that since instant language switching has been enabled. Further, sentence segmentation and translation can both be CPU-intensive, as both of these processes rely on locally-run machine learning models.

Anonymous users are capped at 200 characters, but this cap can be reached repeatedly, and by design; free tier users should be able to segment longer texts with multiple submissions. But automated abuse could quickly become costly and degrade service quality for all users.

So I looked at captchas, which introduced a different problem.

A traditional captcha (like Google's reCaptcha) makes the reader solve a challenge before they can use the tool at all. A modern one (like Cloudflare's Turnstile) removes the puzzle but still costs time. Either way, mandoBot's users would see an increase in the time between puzzling over a Mandarin sentence, and seeing it segmented/defined/translated.

That matters here more than it might elsewhere. mandoBot gets used mid-reading: you hit a sentence you can't parse, paste it in, and read the breakdown. Every second between those steps is a step further away from mandoBot's learning approach of [Extensive Reading](https://en.wikipedia.org/wiki/Extensive_reading) with comprehensible input.

## Why I turned to a proof-of-work captcha

Proof-of-work captchas present the user's *browser* with a cryptographic challenge, rather than presenting the *user* with a puzzle to solve. By itself, this can't distinguish automated users from humans, but that isn't *actually* my goal: the point is just to make it simple for users, and expensive for attackers to exploit mandoBot's (computationally) expensive features.

This matched Turnstile, but also an option I hadn't known before, Friendly Captcha. And while both of these still cost some time, [Friendly Captcha's data privacy approach](https://friendlycaptcha.com/privacy/) more closely matched [mandoBot's own](/about), with a focus on retaining no user information. This made the choice easy, and I've implemented Friendly Captcha across mandoBot's user input fields.

As a bonus, Friendly Captcha enabled mandoBot to resolve the captcha during page load, instead of after form submission, meaning that the captcha did not significantly add to a user's wait for a segmentation result.

## What this means for mandoBot's future

The 200 character cap for anonymous users had previously been performing two jobs, and poorly: First, it encouraged heavy users to pay for mandoBot, rather than having to break down their texts into 200 character chunks. Second, it limited how much a single anonymous request could cost, which protects the service's stability and increases the number of requests an automated attacker would need to submit to usefully abuse the app. 

Implementing Friendly Captcha has drastically decreased the weight of the second concern, since the cost of abuse is now increased by the proof-of-work gate. This means that service stability is now entirely an engineering concern, and can be addressed by further optimizing the segmentation/definition/translation pipeline. 

As for encouraging users to subscribe, that will have to happen the old-fashioned way: by providing enough value, with features exclusive to paid users, that the subscription seems like a natural and easy decision. Several of these are already planned, and I'm excited to announce them when they're ready. But until then, [學無止境，一起加油](https://mandobot.com/?share_id=n2exfSZxhM)！