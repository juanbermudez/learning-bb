import meta from './rules-skills-tools.meta'
import sources from './rules-skills-tools.sources.json'
import { defineDiagramDefinition } from '../schema'
import type { SourceRecord } from '../schema'
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

const sourceRecords = sources as unknown as readonly SourceRecord[]

const rulesAndSurfaces = defineDiagramDefinition({
  id: 'rules-skills-tools-map',
  title: 'Different inputs reach one provider turn',
  caption: 'Rules, skills, tools, CLI commands, and SDK operations meet the system through separate paths.',
  evidenceMix: ['observed', 'inference'],
  sourceIds: [
    'runtime-assembly',
    'runtime-order',
    'skill-adapters',
    'tool-dispatch',
    'plugin-cli-skill',
    'sdk-admin',
  ],
  code: `flowchart LR
  rules["Rules text"] --> assembly["Runtime assembly"]
  skills["Readable skills"] --> assembly
  tools["Callable tools"] --> dispatch["Server dispatch"]
  cli["Plugin CLI"] --> proxy["Command proxy"]
  sdk["Admin SDK"] --> admin["BB administration"]
  assembly --> provider["Provider turn"]
  dispatch --> provider
  proxy --> server["BB server"]
  admin --> server`,
  textAlternative:
    'Observed items enter from separate lanes. Rules are text from the data-directory and workspace AGENTS.md layers, then the server assembles instruction context. Skills are readable resources that the server resolves and a provider adapter presents in its own shape. Callable tools go to server dispatch. Plugin CLI commands use a generated teaching skill and a command proxy. SDK operations reach BB administration over its server transport. Inference: these lanes can affect one provider turn, but sharing a destination does not make their ownership or behavior interchangeable.',
})

const surfaceSequence = defineDiagramDefinition({
  id: 'surface-choice-sequence',
  title: 'A request chooses a surface',
  caption: 'The action path depends on whether the agent must read, call, or administer.',
  evidenceMix: ['observed', 'inference'],
  sourceIds: ['tool-dispatch', 'plugin-cli-skill', 'cli-proxy', 'sdk-admin'],
  code: `sequenceDiagram
  participant Agent
  participant Server
  participant CLI
  Agent->>Server: Call tool
  Server-->>Agent: Tool result
  Agent->>CLI: Read command skill
  CLI->>Server: Run command
  Server-->>CLI: Exit and output
  Agent->>Server: Request admin operation
  Server-->>Agent: Administrative result`,
  textAlternative:
    'The sequence has three distinct actions. For a callable tool, the agent produces a tool call and the server authenticates, selects, and invokes the handler before returning a result. For a plugin CLI command, a generated skill teaches the command shape; the CLI proxy forwards arguments and context to the server and returns output and exit status. For administrative work, such as compacting a thread or clearing a goal, the CLI or SDK uses an administrative operation. Inference: a teaching skill explains a command but does not itself dispatch a native tool.',
})

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'Observed — AGENTS.md files provide instruction text; they are not skills or tools.',
          'Observed — skills are files selected by tier and adapted for each provider.',
          'Inference — tools dispatch actions; CLI teaches commands; SDK administers BB.',
        ]}
      />

      <EvidenceCallout
        kind="observed"
        claim="The server assembles instruction text, skill inputs, dynamic tools, and provider options before a runtime command."
        explanation="That assembly gives one provider turn several inputs, but the inputs keep different owners and lifetimes. Read the lanes in the diagram as separate contracts, not as one large prompt resource."
        sourceIds={['runtime-assembly', 'runtime-order', 'skill-adapters', 'tool-dispatch']}
      />

      <DiagramCard definition={rulesAndSurfaces} />

      <PageSection id="rules-text" title="Rules are instruction text">
        <EvidenceCallout
          kind="observed"
          claim="BB has two named AGENTS layers: one under the BB data directory and one under the workspace at .bb/AGENTS.md."
          explanation="The data-directory reader and workspace reader are separate. The workspace read uses a host operation rooted at the workspace, so this is not an invitation to search arbitrary checkout files."
          sourceIds={['agents-paths']}
        />
        <EvidenceCallout
          kind="observed"
          claim="The runtime instruction string places standard text, tool and plugin contributions, then the data-directory and workspace AGENTS layers."
          explanation="AGENTS.md is policy or instruction text. It can tell a provider how to behave, but it does not expose a JSON callable schema and does not become an action by being present."
          sourceIds={['runtime-order']}
        />
        <EvidenceCallout
          kind="inference"
          claim="Inference — changing an AGENTS file belongs to a runtime boundary, not to a mid-turn tool call."
          explanation="The server resolves runtime inputs at session or turn boundaries, while the live provider call receives the already assembled context. The exact provider reaction to a file changing during an active session is not established here."
          basedOn={['runtime-assembly', 'runtime-order']}
        />
      </PageSection>

      <PageSection id="skills-files" title="Skills are readable resources">
        <EvidenceCallout
          kind="observed"
          claim="A skill is a discoverable SKILL.md resource, not a sentence in AGENTS.md."
          explanation="Workspace skills are found through .bb/skills. BB also resolves project, inherited user, plugin, and built-in sources and keeps provenance for the selected resource."
          sourceIds={['skill-discovery', 'skill-precedence']}
        />
        <EvidenceCallout
          kind="observed"
          claim="Skill precedence and provider adapters affect whether a selected resource is usable."
          explanation="Earlier inherited roots win, and project names can shadow global names. The runtime then shapes roots for a provider; ACP, for example, presents a textual menu and asks the provider to read the chosen path."
          sourceIds={['skill-precedence', 'skill-adapters', 'acp-skill-adapter']}
        />
        <EvidenceCallout
          kind="inference"
          claim="Inference — putting a file in one provider’s native skill directory does not make it a BB-global skill."
          explanation="Discovery, precedence, staging or reference, and provider interpretation all have to line up. The same logical skill may therefore be delivered differently across Codex, Claude, Pi, and ACP adapters."
          basedOn={['skill-discovery', 'skill-precedence', 'skill-adapters', 'acp-skill-adapter']}
        />
      </PageSection>

      <DiagramCard definition={surfaceSequence} />

      <PageSection id="tools-cli-sdk" title="Tools, CLI, and SDK have different jobs">
        <EvidenceCallout
          kind="observed"
          claim="A callable agent tool has a registered name, a JSON schema, configuration, and a server dispatch path."
          explanation="The dispatch route authenticates the daemon and thread, gives the built-in environment-directory tool precedence, and then invokes the selected plugin handler. A malformed request or handler failure returns an error rather than silently switching surfaces."
          sourceIds={['tool-registration', 'tool-dispatch']}
        />
        <EvidenceCallout
          kind="observed"
          claim="A plugin CLI command is taught by a generated plugin-commands skill and executed through a CLI proxy."
          explanation="The proxy forwards command metadata, arguments, working directory, and BB thread or project context. The teaching file helps a provider know the command; the proxy is the path that actually runs it."
          sourceIds={['plugin-cli-skill', 'cli-proxy']}
        />
        <EvidenceCallout
          kind="observed"
          claim="The SDK and administrative CLI expose operations such as skills, thread timeline access, compaction, and goal control."
          explanation="These are management surfaces over BB’s server transport. They are not a second provider runtime, and an SDK method is not the same thing as a tool schema offered inside an agent turn."
          sourceIds={['sdk-admin', 'cli-admin']}
        />
        <EvidenceCallout
          kind="inference"
          claim="Inference — ask the agent to read a skill, call a tool, run a CLI command, or administer BB according to the action required."
          explanation="The labels in the sequence are operational boundaries: readable instructions change understanding, tools perform server-dispatched actions, CLI commands run through the command path, and SDK or administrative CLI calls manage BB state."
          basedOn={['tool-dispatch', 'plugin-cli-skill', 'cli-proxy', 'sdk-admin', 'cli-admin']}
        />
        <EvidenceCallout
          kind="inference"
          claim="Inference — a successful command result does not prove that the same capability was available as a callable tool."
          explanation="The server can expose both a tool registry and a CLI proxy while preserving separate schemas, permissions, dispatch paths, and failure handling."
          basedOn={['tool-registration', 'tool-dispatch', 'cli-proxy']}
        />
      </PageSection>

      <Limits>
        <li><strong>Unknown.</strong> Provider adapters differ in how much skill content they read eagerly; the inspected source does not establish one cross-provider loading rule. Sources: skill-adapters, acp-skill-adapter.</li>
        <li><strong>Unknown.</strong> The server resolves dynamic tools at runtime boundaries, but the exact behavior of an already live provider session after a configuration change is not established. Sources: runtime-assembly, runtime-order.</li>
        <li><strong>Inference.</strong> These definitions do not prove that a skill is callable, that a CLI command is a native tool, or that the SDK owns provider execution. Sources: tool-registration, plugin-cli-skill, sdk-admin.</li>
      </Limits>

      <SourceDisclosure sources={sourceRecords} />
    </DocArticle>
  )
}
