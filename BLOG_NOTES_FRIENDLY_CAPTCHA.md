# Blog notes: adding Friendly Captcha to mandoBot

Running notes for a post about integrating Friendly Captcha v2 into a Django +
Next.js app. Kept in the repo so the notes and the code drift together rather
than apart.

**Thesis.** Captcha integration guidance assumes a form submission. mandoBot's
expensive endpoint fires once per sentence, not once per form, and everything
interesting followed from that mismatch.

**Working titles**

- One solve, many requests: a captcha for an API that isn't a form
- The third state, and the second leg
- Two legs, one outage: where fail-open quietly stops working

---

## The arc

1. **The problem in costs.** `/segment` does Chinese word segmentation plus
   machine translation. It is the expensive endpoint and it is open to anonymous
   users. Existing protection was a `2/s` per-IP throttle, which stops a hammer
   and not a patient scraper.
2. **Why proof-of-work.** Users are mid-sentence language learners; interruption
   is the entire cost. No cookies, no image grids, nothing to see.
3. **The wall.** Every integration path — script tag, hidden
   `frc-captcha-response` input, Django form field — assumes one solve per
   submitted form. A solution is single-use and takes seconds to produce.
4. **The design.** Solve once, exchange the solution for a signed 30-minute
   *pass*, send the pass as a header on each segmentation. Account forms keep the
   conventional one-solve-per-submission model, because they really are forms.
5. **Statelessness on purpose.** `TimestampSigner`, no server-side record. The
   rejected alternative is the interesting half: a session flag would have
   written a row per anonymous visitor into an 83 MB SQLite file that a deploy
   script copies around.
6. **Three outcomes, not two.** Accept / reject / *couldn't tell*.
7. **The second leg.** Fail-open only covers the failure the server witnessed.
8. **Adopting the official SDK**, and what survived the swap.
9. **Verifying against the real service**, not just against mocks.

---

## What we built, then replaced

We first hand-rolled server-side verification: a `requests.post` to
`siteverify`, plus a table of the four client-fault error codes
(`response_missing`, `response_invalid`, `response_timeout`,
`response_duplicate`) separating "the solution is bad" from "we couldn't
check". Then we adopted the official `friendly-captcha-client`, deleted the HTTP
call and the error table, and kept the rest.

**Independent convergence.** Before finding their SDK we had built a three-way
`Verdict`: `ACCEPTED` / `REJECTED` / `UNAVAILABLE`. The SDK expresses the same
idea as two booleans, `should_accept` and `was_able_to_verify`, and their CTO
wrote a whole post — *When captchas break: handling the unhappy path* — arguing
for exactly this: *"there is a third case: the one in which you were unable to
verify the captcha response."* Two independent designs landing in the same place
is a decent sign the shape is right. Worth writing with credit, not as a claim
of priority.

**Why the enum survived the SDK.** Their non-strict default folds "couldn't
verify" into `should_accept = True`. That is the correct default for a form, but
it discards the distinction, and this app needs it: an unverifiable solution
should still be logged as an outage rather than silently counted as a pass. So
the two booleans get widened back into the three-way verdict at the boundary,
and the fail-open decision stays in one function where it can be read.

### The finding worth publishing

`verify_captcha_response` does not wrap its own `requests.post`. A connection
error or timeout therefore escapes the SDK as an exception. In Django, uncaught,
that is a 500 — which means the naive adoption of a library whose documented
default is *fail open* actually **fails closed** in exactly the outage it is
meant to survive. Non-2xx responses are handled correctly
(`was_able_to_verify = status_code == 200`); it is only transport errors that
escape.

So the single piece of our own verification code that survived is a
`try/except requests.RequestException` around their call. That is a good, small,
concrete thing to report upstream — and a nice illustration that "use the
official SDK" is advice with an asterisk.

Also worth a line: the SDK's default timeout is 10 seconds, which is a long time
to hold a request thread on a small host. It is overridable per call
(`timeout=`), just not at construction.

---

## The ecosystem gap (checked, not assumed)

Of the three packages that looked like they'd replace our code, only one did.

| Package | Verdict | Why |
| --- | --- | --- |
| `friendly-captcha-client` (PyPI) | **Adopted** | Official, v2, actively matches the API. |
| `friendly-captcha-react` (their GitHub org) | **Not usable** | Actually `@aacn.eu/use-friendly-captcha`, a third-party package mirrored into the org. Peer-depends on `friendly-challenge ^0.9.11` — the **v1** widget — and on Tailwind. |
| `django-friendly-captcha` | **Not usable** | A Django *forms* field bundling friendly-captcha **0.9.15** JS, i.e. v1 again. Also assumes `forms.Form`, while this API is django-ninja. |

Two consequences for the post:

- A v2 React integration means mounting `@friendlycaptcha/sdk` by hand in a
  `useEffect` and listening for `frc:widget.complete`. That is not hard, but it
  is undocumented territory relative to the polish of the rest.
- Anyone searching "friendly captcha react" or "friendly captcha django" today
  lands on v1-era packages sitting in the official org, with no version warning.

Keep this constructive. The v2 SDK, docs and API are good; the community
integrations around them simply haven't followed to v2 yet.

---

## Things that only appear once it works

- **The test-suite leak.** Turning the feature on via `.env` silently enabled it
  inside the Django test suite, and unrelated tests started getting `428`. Fix:
  force the flag off under `test`, so tests opt in through `override_settings`
  rather than inheriting whatever the developer has configured. Good general
  lesson about environment-driven feature flags.
- **Mocks prove logic, not assumptions.** The unit tests were green long before
  anything real had been contacted. Two checks changed that: a live call with a
  deliberately bogus solution (real reply: `{"success": false, "error":
  {"error_code": "response_invalid"}}`), and a browser test doing a genuine
  proof of work — `ping`, `activate`, `quote`, `redeem` — through pass exchange
  to an accepted `/segment`, plus a passless request confirming `428`.
- **The stale page object.** The end-to-end test failed first on
  `input[name="sentence-input"]` when the field had become a `<textarea>` in a
  redesign. Nothing to do with captchas; everything to do with why you run the
  real thing.

---

## The open question to end on

Fail-open has two legs, and only one of them is covered:

- **Backend → siteverify unreachable.** The widget still solves, verification
  reports "couldn't tell", a pass is issued. Fails open, as intended.
- **Browser → widget unreachable.** No solution is ever produced, so no
  verification is attempted, so the server never learns anything is wrong. The
  request arrives bare and is refused. **Fails closed.**

The asymmetry is structural: a server can only fail open about failures it
witnessed. And the client cannot be trusted to report the outage, because a bot
would simply always claim it.

Candidate answers, none free:

1. Fast-fail the client so users get a clear error instead of two stacked
   20-second solve timeouts. Improves the symptom, not the cause.
2. Manual degraded mode — an env flag flipped during an outage. Honest, and only
   as fast as you notice.
3. A cached server-side health probe: on a passless anonymous request, check
   whether Friendly Captcha is reachable, cache for a few minutes, open the gate
   while it isn't. Automatic, but it adds an outbound call on precisely the path
   a scraper hits.

Ending on the unresolved version is better than pretending there's a clean
answer.

---

## Loose ends to check before publishing

- Acknowledge the official SDK and the framework packages explicitly, or the
  first comment writes itself.
- Re-read their unhappy-path post and quote it accurately.
- Confirm the SDK's exception behaviour against the latest release before
  claiming it in public (checked here against `friendly-captcha-client==0.2.1`).
- Decide whether to report the transport-exception issue upstream first. Filing
  it before publishing is the better look.
