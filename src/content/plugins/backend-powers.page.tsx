import meta from './backend-powers.meta'
import sources from './backend-powers.sources.json'
import { defineDiagramDefinition } from '../schema'
import type { SourceRecord } from '../schema'
import {
  AtAGlance,
  DataTable,
  DiagramCard,
  DocArticle,
  EvidenceBadge,
  EvidenceCallout,
  Limits,
  PageSection,
  SourceDisclosure,
} from '../../components/content'

export { meta }

const typedSources = sources as readonly SourceRecord[]

const backendDiagram = defineDiagramDefinition({
  id: 'plugin-backend-capabilities',
  title: 'Plugin powers converge on a host-owned server boundary',
  caption:
    'Observed: plugin server APIs cover persistence, transport, jobs, commands, and agent configuration while BB keeps the surrounding authority.',
  evidenceMix: ['observed'],
  sourceIds: [
    'settings',
    'storage',
    'http',
    'rpc',
    'realtime',
    'service',
    'schedules',
    'cli',
    'agent-config',
    'ui-interaction',
    'host-declarations',
  ],
  code: `flowchart LR
  plugin["Plugin server"] --> data["Settings + storage"]
  plugin --> transport["HTTP / RPC / realtime"]
  plugin --> jobs["Services + cron + CLI"]
  plugin --> agent["Agent config + tools"]
  plugin --> ui["Input + mentions"]
  data --> host["BB host authority"]
  transport --> host
  jobs --> host
  agent --> host
  ui --> host`,
  textAlternative:
    'Observed: the plugin server sits at the left of the boundary. It can define settings and use plugin-owned storage, register namespaced HTTP and RPC routes, publish realtime signals, run background services and schedules, expose a collision-checked CLI command, contribute agent configuration and tools, and request host-rendered input or mention resolution. Each path converges on BB host authority. The host validates the route or schema, owns lifecycle and persistence boundaries, and mediates agent and UI behavior. The diagram does not show a direct arrow from the plugin to a model provider or to an arbitrary host database because those are not plugin powers.',
})

const authorityDiagram = defineDiagramDefinition({
  id: 'plugin-host-authority',
  title: 'The host remains between a plugin and execution state',
  caption:
    'Observed: plugins contribute configuration, requests, and observations; BB retains provider/model selection and thread transitions.',
  evidenceMix: ['observed'],
  sourceIds: ['agent-config', 'agent-tools', 'thread-events', 'host-declarations', 'thread-spawn'],
  code: `flowchart TD
  plugin["Plugin"] -->|requests| host["BB host authority"]
  host -->|validates| session["Agent session"]
  host -->|selects| provider["Provider + model"]
  host -->|owns| thread["Thread lifecycle"]
  thread -->|observes| events["Thread events"]
  events -->|callback| plugin`,
  textAlternative:
    'Observed: a plugin sends requests or configuration to the BB host authority. The host validates agent configuration and tool registration, then owns the agent session, provider and model selection, and thread lifecycle. A plugin can receive observe-only thread callbacks, but those callbacks cannot veto or replace a transition. Thread spawn and fork calls may carry plugin attribution as data and context; that attribution is not a new UI slot or a private execution lane. The flow therefore describes mediation and observation, not direct provider access.',
})

function status(text: string, sourceId: string) {
  return (
    <>
      <EvidenceBadge label="observed" /> {text} · <code>{sourceId}</code>
    </>
  )
}

export default function Page() {
  return (
    <DocArticle meta={meta}>
      <AtAGlance
        items={[
          'The backend API is broad, but each route remains namespaced and host-validated.',
          'Services, schedules, CLI commands, tools, and storage live inside BB’s lifecycle.',
          'Plugins contribute requests and configuration; BB retains providers, threads, and host data.',
        ]}
      />

      <p>
        “Backend power” means a documented server API, not unrestricted access to the
        application. BB gives a plugin useful ways to store state, expose routes, run
        work, and contribute agent behavior. The host still validates those calls and
        owns the provider, thread, authentication, and host-database boundaries.
      </p>

      <DiagramCard definition={backendDiagram} />
      <DiagramCard definition={authorityDiagram} />

      <PageSection id="namespaced-backend" title="Server APIs stay namespaced">
        <p>
          The first group is data and transport. Settings are declared through the host;
          secret values are stored server-side with mode <code>0600</code> and are
          never returned to the frontend. Key-value rows and the plugin-owned SQLite
          database are namespaced, with explicit limits and migrations. HTTP routes live
          under the plugin prefix, RPC uses a strict JSON envelope and Standard Schema,
          and realtime signals are JSON notifications rather than a durable private bus.
        </p>
        <DataTable
          caption="Stable data and transport capabilities, with the boundary BB keeps."
          headers={['Capability', 'Plugin can do', 'BB retains / cannot do', 'Evidence']}
          rows={[
            ['Settings', 'Define string, boolean, select, or project-scoped descriptors; read/save through BB; react to changes.', 'The frontend cannot read secret values; settings do not generally reload a healthy plugin.', status('Stable', 'settings')],
            ['Namespaced storage', 'Use KV rows and a plugin-owned SQLite database with WAL, busy timeout, and ordered migrations.', 'No arbitrary host-database access; KV values have a 256 KiB limit.', status('Stable', 'storage')],
            ['HTTP', 'Register routes under `/api/v1/plugins/<id>/http/<path>` with local, token, or webhook-oriented none auth.', 'The route cannot escape its plugin prefix or replace arbitrary host routes.', status('Stable', 'http')],
            ['RPC', 'Register a Standard Schema method under the plugin RPC prefix; call it from the frontend through `useRpc`.', 'BB validates the envelope; this is not a direct model-provider call.', status('Stable', 'rpc')],
            ['Realtime', 'Publish JSON plugin signals to connected clients and consume connection/state hooks in the app.', 'V1 has no per-channel subscriptions and persists nothing as an event bus.', status('Stable', 'realtime')],
          ]}
        />
        <EvidenceCallout
          kind="observed"
          claim="The storage and transport surface is useful precisely because it is bounded."
          explanation="The API gives a plugin a durable namespace and host-routed communication without granting arbitrary database or route replacement."
          sourceIds={['settings', 'storage', 'http', 'rpc', 'realtime']}
        />
        <p>
          The details matter when designing a plugin. A secret is a server-side setting,
          not a value that a React component can fetch. An HTTP route remains under the
          plugin prefix, and its auth mode is part of the declaration. An RPC method is
          validated at the host route rather than treated as an untyped tunnel. A
          realtime signal can refresh a mounted view, but it cannot substitute for a
          durable event record or a private channel. These limits are part of the API’s
          meaning, not incidental implementation notes.
        </p>
      </PageSection>

      <PageSection id="background-authority" title="Background work has a host lifecycle">
        <p>
          A service starts after the server factory and receives an abort signal. Crash
          restart uses a capped backoff; a configuration error pauses that restart until
          the plugin is configured or reloaded. Cron schedules use five fields and
          server-local time, are durable by plugin and name, and run only while the
          plugin is loaded. The CLI is also a host surface: its lower-case name is
          collision-checked against core commands, its context includes the invoking
          thread and project when available, and combined output is capped at 1 MiB.
        </p>
        <DataTable
          caption="Work-oriented capabilities and the lifecycle boundary around each one."
          headers={['Capability', 'Plugin can do', 'BB retains / cannot do', 'Evidence']}
          rows={[
            ['Background service', 'Start a service after the factory; receive abort; restart after a crash with capped backoff.', 'A service cannot outlive its generation or silently create a second lifecycle.', status('Stable', 'service')],
            ['Schedules', 'Declare five-field cron work with durable plugin/name rows and compare-and-set scheduling.', 'Schedules do not run while disabled or unloaded; server-local time is not distributed-time proof.', status('Stable', 'schedules')],
            ['CLI', 'Expose `bb <plugin-name> ...` with cwd, thread, project, and abort context.', 'Core command names win and output is capped at 1 MiB.', status('Stable', 'cli')],
          ]}
        />
        <EvidenceCallout
          kind="inference"
          claim="A plugin’s long-running work is subordinate to the same generation lifecycle as its request handlers."
          explanation="This inference combines service abort/restart behavior, schedule load requirements, and CLI abort context; it is not a claim that a task is durable after shutdown."
          basedOn={['service', 'schedules', 'cli']}
        />
        <p>
          The CLI boundary is similarly deliberate. A plugin command can receive useful
          execution context, but it does not outrank a core command and it cannot stream
          unlimited output through the host. A schedule can be durable as a declaration
          while still being inactive when its plugin is unloaded. In other words,
          persistence of configuration is not proof of a running worker, and a running
          service is not a replacement for the host’s scheduler or shutdown path.
        </p>
      </PageSection>

      <PageSection id="agent-mediated-ui" title="Agent and UI requests stay host-mediated">
        <p>
          The agent API lets a plugin contribute per-session or per-turn tools, skills,
          provider context, and dynamic instructions. BB rejects malformed, duplicate,
          cross-plugin, unknown, or over-limit entries, and applies accepted changes at
          the next provider session rather than mutating a live session in place. A tool
          has a name, instructions, and a Zod or raw JSON schema; its result is text or
          an image. The plugin still does not call the model provider directly.
        </p>
        <p>
          Host-rendered UI is similarly mediated. `requestInput` creates a pending
          interaction addressed to the plugin, and a mention provider searches and
          resolves `@`, `#`, `$`, `!`, or `~` references. Search is bounded and a resolve
          error blocks send because the host cannot safely build the hidden agent context.
          Thread events are observe-only callbacks. Spawn and fork attribution records
          where a call came from; it does not create a private thread control plane.
        </p>
        <DataTable
          caption="Agent, interaction, event, and host-declaration capabilities."
          headers={['Capability', 'Plugin can do', 'BB retains / cannot do', 'Evidence']}
          rows={[
            ['Agent configuration', 'Add per-session/turn tools, skills, provider context, and dynamic instructions.', 'BB validates entries and applies them at the next provider session; the plugin cannot call a provider directly.', status('Stable', 'agent-config')],
            ['Agent tools', 'Register a name, instructions, and schema; return text or image results.', 'Execution is host-agent mediated and scoped to plugin context; collisions are rejected or reported.', status('Stable', 'agent-tools')],
            ['Host-rendered agent UI', 'Request input and provide bounded mention search/resolve.', 'BB owns the composer; resolve errors block send and the plugin cannot read frontend secrets.', status('Stable', 'ui-interaction')],
            ['Thread events', 'Observe created, active, idle, failed, archived, and deleted transitions.', 'Callbacks cannot veto or replace transitions and are not a durable command queue.', status('Stable', 'thread-events')],
            ['Server / host declarations', 'Declare loopback server, shared-port tunnel, status, and host metadata needs.', 'BB gates exposure and configuration; no unrestricted public listener is implied.', status('Stable', 'host-declarations')],
            ['Thread spawn / fork attribution', 'Spawn or fork with origin metadata identifying the plugin.', 'Attribution is data/context, not a UI extension or fork-only authority.', status('Stable', 'thread-spawn')],
          ]}
        />
        <EvidenceCallout
          kind="observed"
          claim="Plugin agent and UI capabilities add host-mediated behavior, not direct provider or thread ownership."
          explanation="The host validates configuration and tools, renders pending interactions, resolves mentions, and retains transition authority."
          sourceIds={['agent-config', 'agent-tools', 'ui-interaction', 'thread-events', 'thread-spawn']}
        />
        <p>
          This boundary also explains why a plugin can influence a future provider
          session without steering a live provider call. Dynamic instructions and tools
          are checked, then applied at the next session boundary. Mention resolution can
          add hidden context to a send, but a failed resolution blocks that send rather
          than silently inventing text. Observe-only events help a plugin synchronize its
          own view; they do not turn callbacks into a command queue.
        </p>
      </PageSection>

      <Limits>
        <ul>
          <li>“Full backend inventory” does not mean direct provider/model access, arbitrary host-database access, or a second control plane.</li>
          <li>Realtime publish is not durable event storage or a private per-channel bus.</li>
          <li>These are source contracts, not authenticated provider, rendered, deployed, or production-availability proof.</li>
        </ul>
      </Limits>

      <EvidenceCallout
        kind="unknown"
        claim="The behavior of a particular installed plugin under a particular host configuration is Unknown here."
        explanation="The inventory records API contracts; it does not establish live configuration, provider availability, or end-user usability."
        sourceIds={['render-proof-limit']}
      />

      <SourceDisclosure sources={typedSources} />
    </DocArticle>
  )
}
