import { defineDiagramDefinition, type SourceRecord } from '../../content/schema'
import meta from './agent-input.meta'
import sourcesData from './agent-input.sources.json'
import {
  AtAGlance,
  DiagramCard,
  DocArticle,
  EvidenceCallout,
  Limits,
  PageSection,
  SourceDisclosure,
} from '../../components/content'

export { meta }

const sources = sourcesData as readonly SourceRecord[]

const agentInputDiagram = defineDiagramDefinition({
  id: 'agent-input-stack',
  title: 'Separate inputs meet at assembly',
  caption: 'Structured input, files, rules, skills, and tools become a command at a runtime boundary.',
  evidenceMix: ['observed', 'inference'],
  sourceIds: ['prompt-schema', 'plugin-context', 'attachment-stage', 'instruction-order', 'runtime-command-fields'],
  code: `graph TD
  Prompt[PromptInput] --> Assembly[Runtime assembly]
  Context[Agent-only context] --> Assembly
  Files[Staged files] --> Assembly
  Rules[Instructions] --> Assembly
  Skills[SKILL.md roots] --> Assembly
  Tools[Dynamic tools] --> Assembly
  Assembly --> Command[Runtime command]`,
  textAlternative:
    'Read from top to bottom. The user-facing PromptInput is one input group. Plugin context marked agent-only is a separate group that the runtime can receive without being shown in the optimistic row. Attachments become confined staged files. The server also assembles instruction text, discovered skill sources, and dynamic tool schemas. These groups meet in the runtime assembly and are carried in a thread.start or turn.submit command. The grouping is an Inference from the individual observed command fields; it does not claim that every provider places each group into its prompt in the same way.',
})

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'PromptInput contains text, mentions, images, files, and visibility metadata.',
          'Agent-only context reaches runtime but stays out of the optimistic preview.',
          'Rules, skills, tools, options, and staged files are different inputs.',
        ]}
      />

      <p>
        “What the agent receives” is broader than the words a user types. The
        server accepts structured input, resolves context references, stages files,
        and assembles runtime configuration. Instructions are text, skills are
        readable resources, tools are callable schemas, and options control the
        execution contract. The host receives these groups through a command; the
        provider interpretation is a separate boundary.
      </p>

      <DiagramCard definition={agentInputDiagram} />

      <PageSection id="visible-input" title="The prompt is structured input">
        <p>
          <strong>Observed.</strong> <code>PromptInput</code> accepts text with
          mentions, web images, local images, and local files. An input can carry
          <code>visibility: "agent-only"</code>. Mention resources can identify a
          thread, project, section, workspace or thread-storage location, command,
          or plugin item.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="A visible composer preview is not guaranteed to show every input sent to the runtime."
          explanation="The optimistic user-row builder omits agent-only PromptInput text while the structured request keeps it available for dispatch."
          sourceIds={['prompt-schema', 'optimistic-preview']}
        />
        <p>
          This distinction is useful for reading the timeline. A mention pill or
          attachment label describes a draft reference. It does not, by itself,
          prove that the server resolved the reference or that a staged file reached
          a provider session.
        </p>
      </PageSection>

      <PageSection id="validation-staging" title="Context is resolved and files are staged">
        <p>
          <strong>Observed.</strong> Plugin mentions are resolved on the server at
          send time. The resolver deduplicates plugin items and appends their result
          as agent-only context. If resolution fails, the server returns a 422 and
          blocks the send before the accepted request transaction; it does not save
          an empty substitute.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="Attachment references are checked before dispatch and staged in a confined per-thread directory."
          explanation="The host passes the staged input to the runtime from thread storage; the storage root can be configured but remains thread-scoped."
          sourceIds={['plugin-context', 'attachment-validation', 'attachment-stage', 'thread-storage']}
        />
        <p>
          The ordering matters. The server validates the reference it understands;
          the daemon performs host-side staging near command execution. A successful
          UI draft is therefore earlier than both validation and staging. The path
          is an input handoff, not a promise that the provider can read every file
          or that an attachment becomes part of durable prompt history.
        </p>
      </PageSection>

      <PageSection id="instruction-order" title="Instructions have a defined order">
        <p>
          <strong>Observed.</strong> The server builds one instruction string at a
          session or turn boundary. In order, it appends:
        </p>
        <ol>
          <li>standard BB append instructions;</li>
          <li>built-in and plugin dynamic-tool snippets;</li>
          <li>legacy plugin instruction contributions, capped per contribution;</li>
          <li>conditional plugin dynamic instructions;</li>
          <li>data-directory <code>AGENTS.md</code>, when present; and</li>
          <li>workspace <code>.bb/AGENTS.md</code>, when present.</li>
        </ol>
        <EvidenceCallout
          kind="observed"
          claim="The command carries instructions, dynamic tools, injected skill sources, instruction mode, and thread storage together."
          explanation="The server’s command builder exposes these as named fields instead of collapsing them into the visible prompt."
          sourceIds={['instruction-order', 'runtime-command-fields', 'workspace-instructions']}
        />
        <p>
          A missing data-directory instruction file is treated as absent; workspace
          reads use the host file boundary and propagate other read failures. This
          is policy text assembly, not a recursive claim about every file in a
          checkout.
        </p>
      </PageSection>

      <PageSection id="skills-tools-options" title="Skills, tools, and options stay distinct">
        <p>
          <strong>Observed.</strong> A skill is a discoverable
          <code>SKILL.md</code> resource with project, user, plugin, or built-in
          provenance. A tool is a callable schema dispatched through a server path.
          Plugin CLI commands and SDK operations are separate administrative or
          command surfaces; a generated command skill can teach a provider how to
          call a CLI without turning that command into a native tool.
        </p>
        <EvidenceCallout
          kind="inference"
          claim="“Tool access” is not one universal channel."
          explanation="Callable server tools, plugin CLI commands, and SDK or CLI administration have different dispatch and lifetime boundaries."
          basedOn={['tool-dispatch', 'skill-catalog']}
        />
        <p>
          <strong>Observed.</strong> Dynamic tools are resolved for
          <code>thread.start</code> and <code>turn.submit</code>. The scoped host
          calls that start or resume a runtime with the tool set, while an already
          live run or steer call receives input, options, and instructions rather
          than a hot tool-set mutation. This is the safe distinction: recomputed
          configuration can be ready for the next runtime boundary without changing
          a live provider session in the middle of a turn.
        </p>
        <EvidenceCallout
          kind="observed"
          claim="Dynamic tools are recomputed at runtime boundaries, not hot-mutated through the scoped live-turn calls."
          explanation="The server documents the start and submit boundary, while the host’s run and steer calls carry input, options, and instructions."
          sourceIds={['dynamic-boundary']}
        />
        <EvidenceCallout
          kind="unknown"
          claim="The source does not establish how a provider turns these groups into its internal prompt or tool context."
          explanation="The inspected code ends at command fields and host calls; provider adapter and model-loop internals are outside scope."
          sourceIds={['provider-interpretation']}
        />
      </PageSection>

      <Limits>
        <li>Source proof of command fields is not provider proof of prompt placement.</li>
        <li>A mention pill does not prove successful resolution, and an attachment label does not prove provider access.</li>
        <li>Dynamic tool resolution is not evidence that a live session hot-mutates its tool set.</li>
      </Limits>
      <SourceDisclosure sources={sources} />
    </DocArticle>
  )
}
