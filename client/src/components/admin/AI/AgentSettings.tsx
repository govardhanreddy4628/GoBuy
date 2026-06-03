import { useState, useEffect } from 'react';
import { Settings, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../ui/dialog';
import { Agent, AgentSettings as AgentSettingsType } from '../types/Agent';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { Textarea } from '../../../ui/textarea';
import { Switch } from '../../../ui/switch';
import { Slider } from '../../../ui/slider';

interface AgentSettingsProps {
  agent: Agent | null;
  onSettingsUpdate: (settings: AgentSettingsType) => void;
}

export function AgentSettings({ agent, onSettingsUpdate }: AgentSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultSettings: AgentSettingsType = {
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: '',
    enableFileUpload: true,
    enableHistory: true
  };

  const [settings, setSettings] = useState<AgentSettingsType>(defaultSettings);

  useEffect(() => {
  if (agent?.settings) {
    setSettings(agent.settings);
  }
}, [agent?.id, agent?.settings]);

  const handleSave = () => {
    onSettingsUpdate(settings);
    setIsOpen(false);
  };

  const handleReset = () => {
    if (agent?.settings) {
      setSettings(agent.settings);
    }
  };


  if (!agent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-admin-sidebar-fg/70 hover:text-admin-sidebar-fg hover:bg-admin-sidebar-hover"
        >
          <Settings size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" aria-describedby="agent-settings-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">{agent.icon}</span>
            {agent.name} Settings
          </DialogTitle>
        </DialogHeader>
        <p id="agent-settings-description" className="sr-only">
          Configure settings for {agent.name} including temperature, max tokens, system prompt, and feature toggles.
        </p>

        <div className="space-y-6 py-4">
          {/* Temperature */}
          <div className="space-y-2">
            <Label htmlFor="temperature" className="text-sm font-medium">
              Temperature: {settings.temperature}
            </Label>
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.1}
              value={[settings.temperature]}
              onValueChange={(value) => setSettings(prev => ({ ...prev, temperature: value[0] }))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Lower values = more focused, Higher values = more creative
            </p>
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <Label htmlFor="maxTokens" className="text-sm font-medium">Max Tokens</Label>
            <Input
              id="maxTokens"
              type="number"
              min={100}
              max={4000}
              value={settings.maxTokens}
              onChange={(e) => setSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
            />
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <Label htmlFor="systemPrompt" className="text-sm font-medium">System Prompt</Label>
            <Textarea
              id="systemPrompt"
              placeholder="Enter system prompt for the agent..."
              value={settings.systemPrompt}
              onChange={(e) => setSettings(prev => ({ ...prev, systemPrompt: e.target.value }))}
              className="min-h-[80px]"
            />
          </div>

          {/* Feature Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">File Upload</Label>
                <p className="text-xs text-muted-foreground">Allow users to upload files</p>
              </div>
              <Switch
                checked={settings.enableFileUpload}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableFileUpload: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Chat History</Label>
                <p className="text-xs text-muted-foreground">Save conversation history</p>
              </div>
              <Switch
                checked={settings.enableHistory}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableHistory: checked }))}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            Reset
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}