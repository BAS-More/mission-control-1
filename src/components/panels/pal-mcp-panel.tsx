'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

interface PalMcpStatus {
  version: string
  transport: string
  serverPath: string
  status: 'running' | 'stopped' | 'unknown'
  providers: ProviderInfo[]
  modelCount: number
  tools: string[]
  defaultModel: string
  thinkingMode: string
  disabledTools: string[]
  conversationTimeout: string
}

interface ProviderInfo {
  id: string
  name: string
  status: 'active' | 'inactive'
}

const STATIC_DATA: PalMcpStatus = {
  version: 'v9.8.2',
  transport: 'stdio',
  serverPath: 'C:\\Dev\\tools\\pal-mcp-server\\server.py',
  status: 'running',
  providers: [
    { id: 'google', name: 'Google Gemini', status: 'active' },
    { id: 'openai', name: 'OpenAI', status: 'active' },
    { id: 'openrouter', name: 'OpenRouter', status: 'active' },
  ],
  modelCount: 86,
  tools: [
    'consensus', 'thinkdeep', 'secaudit', 'codereview',
    'analyze', 'refactor', 'testgen', 'docgen',
    'tracer', 'chat', 'listmodels', 'listprofiles',
    'clearcontext', 'clearallcontext', 'getconfig', 'setdefaultmodel',
    'switchmodel', 'clink',
  ],
  defaultModel: 'auto',
  thinkingMode: 'high',
  disabledTools: [],
  conversationTimeout: '24h',
}

export function PalMcpPanel() {
  const t = useTranslations('nav')
  const [status] = useState<PalMcpStatus>(STATIC_DATA)
  const [loading, setLoading] = useState(true)

  const fetchStatus = useCallback(async () => {
    // Static data for now — future: fetch from MCP endpoint
    setLoading(false)
  }, [])

  useEffect(() => { fetchStatus() }, [fetchStatus])

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Loading PAL MCP...</span>
      </div>
    )
  }

  const statusColors = {
    running: 'bg-green-500',
    stopped: 'bg-red-500',
    unknown: 'bg-muted-foreground/30',
  }

  const statusLabels = {
    running: 'Running',
    stopped: 'Stopped',
    unknown: 'Unknown',
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">PAL MCP</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Provider Abstraction Layer — Multi-Model AI Orchestration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-2xs px-2 py-1 rounded flex items-center gap-1.5 ${
            status.status === 'running'
              ? 'bg-green-500/10 text-green-400'
              : status.status === 'stopped'
                ? 'bg-red-500/10 text-red-400'
                : 'bg-muted-foreground/10 text-muted-foreground'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusColors[status.status]}`} />
            {statusLabels[status.status]}
          </span>
        </div>
      </div>

      {/* Server info card */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium text-foreground mb-3">Server</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoRow label="Version" value={status.version} />
          <InfoRow label="Transport" value={status.transport} />
          <InfoRow label="Path" value={status.serverPath} mono />
          <InfoRow label="Status" value={statusLabels[status.status]} />
        </div>
      </div>

      {/* Providers section */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">
          Active Providers
          <span className="ml-1.5 text-2xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {status.providers.filter(p => p.status === 'active').length} active
          </span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {status.providers.map(provider => (
            <div
              key={provider.id}
              className="bg-card border border-border rounded-lg p-3 flex items-center gap-2.5"
            >
              <span className="w-2 h-2 rounded-full shrink-0 bg-green-500" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{provider.name}</div>
                <div className="text-2xs text-muted-foreground capitalize">{provider.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Models section */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground">Models</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className="font-medium text-foreground">{status.modelCount}</span> available models across all providers
            </p>
          </div>
          <div className="text-2xs px-2 py-1 rounded bg-primary/10 text-primary">
            Auto model selection
          </div>
        </div>
      </div>

      {/* Tools section */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">
          Tools
          <span className="ml-1.5 text-2xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {status.tools.length} available
          </span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {status.tools.map(tool => (
            <div
              key={tool}
              className="bg-card border border-border rounded-md px-2.5 py-2 text-xs font-mono text-foreground hover:border-primary/30 transition-colors"
            >
              {tool}
            </div>
          ))}
        </div>
      </div>

      {/* Configuration section */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium text-foreground mb-3">Configuration</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoRow label="Default Model" value={status.defaultModel} />
          <InfoRow label="Thinking Mode" value={status.thinkingMode} />
          <InfoRow
            label="Disabled Tools"
            value={status.disabledTools.length > 0 ? status.disabledTools.join(', ') : 'None'}
          />
          <InfoRow label="Conversation Timeout" value={status.conversationTimeout} />
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-2xs text-muted-foreground/70 uppercase tracking-wider">{label}</span>
      <span className={`text-xs text-foreground ${mono ? 'font-mono break-all' : ''}`}>
        {value}
      </span>
    </div>
  )
}
