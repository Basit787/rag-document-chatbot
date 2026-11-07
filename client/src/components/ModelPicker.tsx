import { Check, ChevronDown } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useModels } from '@/api/hook';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useChatStore } from '@/lib/chat-store';

export function ModelPicker() {
  const { data } = useModels();
  const { model, setModel } = useChatStore(
    useShallow((s) => ({
      model: s.model,
      setModel: s.setModel,
    })),
  );
  const models = data?.models ?? [];
  const selected = model || data?.default;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-1 px-3 text-lg font-medium">
          {selected || 'No model'}
          <ChevronDown className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 rounded-2xl p-1.5">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Model
        </DropdownMenuLabel>
        {models.length === 0 && (
          <p className="px-2 py-1.5 text-sm text-muted-foreground">
            No models found. Is Ollama running?
          </p>
        )}
        {models.map((m) => (
          <DropdownMenuItem
            key={m}
            className="justify-between rounded-lg py-2"
            onSelect={() => setModel(m)}
          >
            {m}
            {m === selected && <Check />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
