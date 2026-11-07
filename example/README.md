# Example documents

Three made-up documents for testing upload, retrieval and citations. All
companies, people and numbers are fictional.

| File | Format | About |
| --- | --- | --- |
| `brightleaf-employee-handbook.md` | Markdown | HR policies: leave, remote work, expenses |
| `sunsprout-s2-manual.txt` | Plain text | A smart planter: specs, status lights, troubleshooting |
| `halcyon-q3-report.pdf` | PDF (2 pages) | A project status report: results, risks, Q4 plan |

## How to test

1. Run `make up`, open <http://localhost:3000> and sign up.
2. Click the **+** button left of the message box and add each file.
3. Ask the questions below. Each reply lists the files it used under the
   answer.

## Questions and expected answers

| Question | Expected answer | Source |
| --- | --- | --- |
| How many days of annual leave do Brightleaf employees get? | 27 working days, up to 5 carry over until 31 March | handbook |
| Can I book a meeting on a Friday at Brightleaf? | No, Friday is a focus day without internal meetings | handbook |
| What is the hotel limit for a trip to Zurich? | EUR 210 per night | handbook |
| How long is parental leave? | 20 weeks fully paid, within 18 months | handbook |
| What does a red blinking ring on the SunSprout mean? | Pump error: fill the tank, hold the leaf button 2 s, else unplug 30 s | manual |
| Why won't my planter pair with Wi-Fi? | It only supports 2.4 GHz networks | manual |
| How often should I add nutrients, and how much? | 10 ml every 14 days | manual |
| What was Project Halcyon's Q3 spend versus budget? | EUR 418,000 of EUR 450,000 | report |
| Which traffic data vendor does the team recommend, and why? | Vendor B, better coverage (EUR 9,500/month) | report |
| When will version 1.0 be released to all drivers? | 30 November 2026, to 5,000 drivers | report |
| Who is the tech lead on Halcyon? | Ravi Anand | report |

## Checks beyond answers

- **Not in the documents:** ask "What is Brightleaf's stock price?" The bot
  should say it could not find it in the documents.
- **Across files:** ask "Summarise the risks in the Halcyon report and the
  security rules at Brightleaf." Both files should be listed as sources.
- **Delete:** delete the handbook with `DELETE /api/documents/:id` (see
  `/api/docs`), then ask about annual leave again. The handbook should no
  longer be cited.
- **Isolation:** sign up as a second user. Their answers cite none of the
  first user's files.
- **Rejected type:** upload any other file type (for example a `.docx`); a
  toast says only PDF, TXT and Markdown are supported.

Use `llama3.2` (the default) for these. The tiny `smollm2` model streams fast
but often gets the facts wrong.
