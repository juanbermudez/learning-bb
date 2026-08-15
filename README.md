# Learning BB

Learning BB is an independent, unofficial documentation site for understanding
BB from a dated source snapshot. It is a learning aid, not BB documentation, a
BB distribution, or an affiliated project.

The site uses source-grounded explanations and clearly marked **Observed**,
**Inference**, **Proposed**, and **Unknown** evidence. It does not claim that
proposed blueprints are implemented.

This repository does not copy BB or getbb.app code, assets, screenshots, logo,
marketing text, or page composition. The interface is an original implementation
that borrows only broad visual principles such as restrained surfaces and
technical framing.

## Development

```sh
npm ci
npm run dev
```

The production site is a static Vite build intended for GitHub Pages under
`/learning-bb/`. Hash routing keeps leaf links reloadable on Pages.

## License and attribution

The original Learning BB source is MIT licensed. Third-party dependency notices
are recorded in [NOTICE.md](NOTICE.md). Source-snapshot references identify the
observed branch, commit, and bounded repository-relative windows; a local-only
label is used when an identical public source window cannot be verified.
