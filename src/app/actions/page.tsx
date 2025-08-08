'use client'

import { useState, useMemo, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Layout from '@/components/layout/Layout'
import { Button, Input } from '@/components/ui';
import { useRouter } from "next/navigation";


// ---- Types ---------------------------------------------------------------
export type ParameterSpec = {
  name: string;
  type: "text" | "number" | "select" | "date";
  label: string;
  required?: boolean;
  options?: string[];
};

export type ActionRow = {
  id: string;
  name: string;
  description?: string | null;
  prompt_template: string;
  system_prompt?: string | null;
  /** In DB kan dit JSON (string) of reeds geparsed array zijn */
  parameters?: string | ParameterSpec[] | null;
};

// ---- Helpers -------------------------------------------------------------
function renderPrompt(template: string, values: Record<string, string>) {
  return template.replace(/{{(.*?)}}/g, (_, key: string) => values[key.trim()] ?? "");
}

function useParsedParams(action: ActionRow | null) {
  return useMemo<ParameterSpec[]>(() => {
    if (!action?.parameters) return [];
    if (Array.isArray(action.parameters)) return action.parameters as ParameterSpec[];
    try {
      return JSON.parse(action.parameters) as ParameterSpec[];
    } catch {
      return [];
    }
  }, [action]);
}

// ---- Page ------------------------------------------------------------------
export default function ActionsPage() {
  const router = useRouter();
  const [actions, setActions] = useState<ActionRow[]>([]);
  const [selected, setSelected] = useState<ActionRow | null>(null);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  
  const parameters = useParsedParams(selected);  
  
   // Fetch actions met een prompt_template
  useEffect(() => {
    const fetchActions = async () => {
      const { data, error } = await supabase
        .from("actions")
        .select("id, name, description, prompt_template, system_prompt, parameters")
        .eq("action_type", "defined_prompt");

      if (error) {
        console.error("Failed to load actions", error);
        return;
      }
      setActions((data ?? []) as ActionRow[]);
    };
    fetchActions();
  }, [supabase]);
  
  const onParamChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setParamValues((prev) => ({ ...prev, [name]: e.target.value }));
  };
  
  const executeAction = (action: ActionRow) => {
    const filledPrompt = renderPrompt(action.prompt_template, paramValues);
    const system = action.system_prompt ?? "";

    const qp = new URLSearchParams({ prompt: filledPrompt, system });
    router.push(`/home?${qp.toString()}`);
  };
  
  

 
  return (
    <Layout>
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Acties</h1>

      {/* Lijst met acties */}
      {!selected && (
        <div className="space-y-3">
          {actions
            .filter((a) => a.prompt_template && a.prompt_template.length > 0)
            .map((a) => (
              <Button
                key={a.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => setSelected(a)}
              >
                <div className="text-left">
                  <div className="font-semibold">{a.name}</div>
                  {a.description && (
                    <div className="text-sm text-muted-foreground">{a.description}</div>
                  )}
                </div>
              </Button>
            ))}
        </div>
      )}

      {/* Parameter formulier + uitvoeren */}
      {selected && (
        <div className="space-y-4">
          {parameters.length > 0 && (
            <div className="space-y-2">
            {selected.description}
              {parameters.map((p) => (
                <Input
                  key={p.name}
                  placeholder={p.label}
                  type={p.type === "number" ? "number" : "text"}
                  required={p.required}
                  value={paramValues[p.name] ?? ""}
                  onChange={onParamChange(p.name)}
                />
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="blue" onClick={() => executeAction(selected)}>Uitvoeren</Button>
            <Button variant="blue" onClick={() => { setSelected(null); setParamValues({}); }}>
              Terug
            </Button>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
}
