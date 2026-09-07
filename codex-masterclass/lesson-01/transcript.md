# Lesson 1: Getting started: model selection and your first verified output

Narrated by Clara Moretti, the AI assistant at Orbix Automation Solutions. Written by Hector Diaz. Northstar Workshops is fictional; all examples are synthetic.

## 00 · A Word From Clara

Hello. This is Clara Moretti, the AI assistant at Orbix Automation Solutions, and I will be narrating this class.

Hector Diaz wrote it. He runs AI Auto Base, the AI Automations by Hector community on Skool, and the site aiautobase.com. Every lesson, every brief, every check in this course comes from his own notes and his own work with Codex. My job was to help him polish the wording and organize the ten lessons so they flow in order. Think of me as the editor who also reads the book out loud.

While you take this class, Hector is doing what he does most days: sitting with business owners, looking at how their companies actually run, and designing the automations that take the repetitive work off their desks. Thirty years in technology, from mainframes to the AI agents in this course, and hundreds of automations running in production. If you finish this class and think, "I want this built for my business, not just explained," that is what Orbix does. Book a call at getorbix.com, or talk to me there. Your data stays yours, and if automation is the wrong answer for your case, Hector will tell you.

Now, the class.

## 01 · Welcome to your first verified output

Welcome to a practical course about working with GPT-6 Astra in Codex. Our recurring business, Northstar Workshops, is fictional. Its members, schedules, messages, and results are synthetic teaching examples. Nothing presented as an example is evidence of an actual customer outcome.

Imagine you run a small Skool community that teaches creators how to deliver useful workshops. You need a welcome message, a session outline, and a way to check that both match your real offer. Those are concrete jobs an agent can help complete when you provide the necessary context and boundaries.

We will use slide walkthroughs rather than pretend that a live application is running on screen. Your controls and available models may differ. Follow the decisions behind each step, then apply them in your own environment. By the end of this lesson, you will have a small draft you can inspect, correct, and confidently describe as checked against its source brief.

## 02 · Understand the working relationship

Start by separating three parts of the workflow. The model interprets your request and decides how to approach it. Tools provide actions such as reading a file, searching a source, or writing an output, when those capabilities are available. You supply the business goal and decide whether the finished work deserves acceptance.

For Northstar Workshops, the model might suggest a welcome message. A file tool might save that message in your project. A connected service might support an external action, but selecting a model does not automatically connect that service or authorize posting.

This distinction explains many confusing failures. A capable model can still lack the file, connection, or permission needed to finish a task. Repeating the request with stronger language will not create missing access. Ask what information or capability is missing, then provide the smallest useful next step. For this lesson, a draft returned directly in chat is enough. We can evaluate its quality without connecting a community account.

## 03 · Choose an available model deliberately

Look at the model choices available in your own Codex surface. The official manual describes Astra as suited to demanding workflows involving multiple steps and tools. It also states that availability varies with rollout, sign-in method, and client. Do not assume every learner will see Astra, or that everyone will see identical controls.

If Astra is available, select it for this course. If it is absent, use an available model to practice the same briefing and verification habits, while recording that your model differs. That keeps your exercise honest and still useful.

Start with the default reasoning effort. A short welcome message usually does not require the deepest setting. Increase effort when a task involves difficult tradeoffs, many sources, or complex checks. Judge the result against your criteria rather than treating a larger setting as proof of quality. For Northstar, checking whether a draft invented a refund promise matters more than the label beside the composer during this first exercise.

## 04 · Define a small first job

Our first job is intentionally narrow: write a welcome message for new Northstar members. Here is the synthetic brief. The community serves first-time workshop creators. A weekly planning session takes place on Tuesday. Members should introduce themselves and draft a one-sentence workshop idea. No price, time zone, exact meeting time, or outcome guarantee has been provided.

Those omissions matter. A helpful draft can mention Tuesday without inventing a start time. It can invite participation without promising increased income. It can give the next step without pretending that a link exists.

A small assignment creates a short verification loop. You can compare every factual statement against four or five source facts, instead of trying to review an entire launch campaign at once. Once this first output passes, you can reuse the approved facts in a larger task. The goal is to establish a dependable habit: define a bounded deliverable, provide its evidence, and decide how you will recognize an acceptable result.

## 05 · Give the agent a copyable brief

The prompt on this slide combines the task, the source facts, and the check. Copy it into a new task or adapt the fictional business name. Keep the word limit because it gives you a simple measurement. Keep the instruction about unsupported details because it protects the meaning of your offer.

Notice that we ask for a draft, not publication. We also ask the agent to identify assumptions. An assumption might be a friendly tone, which is usually easy to change. An invented session time is different because it creates a factual commitment.

Before running the prompt, read it once as if you were assigning the work to a colleague. Could they tell what to produce? Would they know which details are missing? Could they check their own work? You do not need elaborate wording. You need enough information to support the output and enough acceptance criteria to make review concrete. That is the foundation of a useful first interaction.

## 06 · Read an illustrative outcome

Here is an illustrative outcome, not a live model response: the draft welcomes new creators, mentions Tuesday planning, and asks each member to share an introduction and one workshop idea. It avoids a meeting time, price, link, and guarantee. These are the features we want to inspect before we worry about style.

The concise excerpt on the slide is only part of that imagined draft. In your actual exercise, check the complete text against the requested length. A short excerpt cannot prove that the whole message meets a word count.

Read the draft from a new member's perspective. Can you tell what to do next? Is the request small enough to act on? Then read it from the owner's perspective. Does any phrase commit the business to something the brief never promised? This second reading catches polished but inaccurate language. A useful response earns acceptance through those checks, not through confidence or the pleasant sound of its opening sentence.

## 07 · Verify before accepting

Verification starts with observable requirements. Count the words in the actual draft using a suitable tool or a manual check. Confirm that Tuesday appears correctly. Confirm that both member actions are present. Search for any price, exact time, working link, or promised result that the source brief did not contain.

The agent's self-check helps organize your review, but it is not independent proof. If it says the message contains one hundred words, the text still needs to support that number. If it says no details were invented, inspect the nouns and numbers yourself.

For a short message, this takes little time. For larger work, you will ask for stronger evidence, such as a validation script or references to source rows. Begin with a simple acceptance record: requirement, observed evidence, and pass or correction needed. Northstar's first verified output is successful when the record matches the draft. It does not need to sound extraordinary. It needs to be usable and accurate.

## 08 · Correct the common failure

Suppose the draft says, “Join us Tuesday at seven for a guaranteed successful launch.” That sentence introduces two unsupported claims: an exact time and a guaranteed outcome. A vague correction such as “make this better” leaves the underlying problem unclear. Name the problem and connect it to the brief.

A better follow-up asks the agent to remove the time and guarantee, preserve the supported Tuesday planning detail, and recheck the complete message. This is targeted steering. You are correcting the mistake while keeping the original task intact.

Also inspect the revised version for replacement inventions. An agent might remove seven o'clock but substitute “every Tuesday evening,” which still introduces an unsupported detail. Verification follows meaning, not just a forbidden word list. In Northstar's case, the safe revision mentions the planning session without adding a time of day. Once corrected, record the missing meeting time as something the owner must supply before a final member announcement is ready for publication.

## 09 · Keep permissions separate from quality

A model selection answers which reasoning system will handle your request. It does not answer which files are readable, which tools are connected, or which actions require approval. Those boundaries depend on the environment and its configuration. Keep that distinction visible whenever a task moves from writing to doing.

For Northstar, creating a welcome draft in chat is one action. Saving it to a local file is another. Posting it into the actual community would be an external action with a real audience. A good draft does not, by itself, establish permission for the next action.

In this exercise, explicitly keep the work as a draft. If a later task needs publication, define that scope and use whatever approved capability your environment provides. Do not change access settings just because a generated message looks finished. When something fails, ask whether the problem is content quality, missing information, unavailable tooling, or an action boundary. Each category needs a different correction and a different check.

## 10 · Make the output easy to review

A useful handoff separates the thing you will use from the explanation of how it was checked. Ask for the final welcome message first, followed by a short validation note. You should not have to remove commentary from the middle of a message before using it.

If your environment supports file creation and you want a reusable artifact, name the desired file and format. A plain Markdown file is enough for this small exercise. Ask the agent to report the actual saved path and checks performed. If file writing is unavailable, retain the draft in chat and save it yourself.

The official file guidance emphasizes source data, expected format, structure, and review criteria. That applies even to simple documents. Northstar's file could contain a heading, the approved draft, and a separate note listing unresolved meeting details. Before sharing it, open the actual file or read its contents. A statement that something was saved is weaker evidence than inspecting the saved result.

## 11 · Exercise: earn a first acceptance

Now complete the first practice task. Use the synthetic Northstar brief from this lesson. Run the copyable prompt, then inspect the resulting message against the facts and the requested word range. Record your model choice as it appears in your environment, including whether Astra was available.

Create a short verification record with four checks: length, supported facts, member actions, and unsupported commitments. If a check fails, issue one focused correction and review the revised draft. If everything passes immediately, explain the evidence instead of deliberately introducing an error.

Your submission is the final draft and the verification record. Include one sentence naming any missing business information, such as the meeting time. This makes the output useful without hiding uncertainty. You are not being graded on whether your prose matches the illustrative excerpt. Different wording can satisfy the same requirements. The important skill is demonstrating that you can turn a bounded request into an output whose accuracy and completeness you have actually inspected.

## 12 · Recap: a repeatable starting loop

You now have a starting loop you can reuse for many creator tasks. Choose an available model deliberately. Provide a small job with source facts and boundaries. Inspect the output against explicit criteria. Correct a specific failure when needed, then accept the version that actually passes.

Astra is relevant when the workflow grows into sustained work across multiple steps and tools. The habits you practiced still matter at that scale. More reasoning does not replace a missing meeting time, and access to tools does not replace permission to use them for an external action.

For Northstar Workshops, the result is a welcome draft with a visible factual basis. Next, we will expand the brief so a larger task can stay focused while you plan and steer it. Keep your verified facts and your acceptance record. They are useful context for the next assignment. The most important takeaway is practical: define success in terms you can inspect, and let that definition guide both the request and the review. This is Clara, narrating for Hector Diaz and AI Auto Base. See you in lesson 2.
