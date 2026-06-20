---
description: Run the security-auditor subagent over the current feature's access control
argument-hint: [optional: file or feature to focus on]
---

Use the Agent tool with `subagent_type: "security-auditor"` to review access control for: $ARGUMENTS (if empty, review the files changed in the current diff / most recently edited server actions, route handlers, and middleware).

Brief the subagent with: which files/feature to look at, that this project's data is real clients' legal PDFs so every gap matters, and that it should check the rules in the `access-control-rules` skill (session check first, role check, status check, session-derived `clientId` only, fresh ownership check per document access, short-lived presigned URLs, server-side file validation).

Report the subagent's findings back as-is — do not soften or summarize away specific issues it flags. If it reports clean, say so plainly.
