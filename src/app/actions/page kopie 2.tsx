'use client'

import { useState, useEffect } from 'react'
import { useDisableActions } from '@/components/layout/Header'
import { supabase } from '@/lib/supabaseClient'
import Layout from '@/components/layout/Layout'
import { Button, Input, Card, CardContent } from '@/components/ui';
import { useRouter } from "next/navigation";

type Action = {
  id: string
  name: string
  description?: string
  slug: string
  action_type?: string
  prompt_template: string
  parameters?: Record<string, string>
  is_active: boolean
  system_prompt?: string
  // voeg hier velden toe die je nog gebruikt
}

export default function ActionsPage() {
  const [actions, setActions] = useState<Action[]>([])
  const [selected, setSelected] = useState<Action | null>(null)
  const [input, setInput] = useState('')
  const [parameterValues, setParameterValues] = useState<Record<string, string>>({});
  const router = useRouter();
  

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
      .from('actions')
      .select('*')
      .eq('action_type', 'defined_prompt')
      .order('name');
      
      if (error) console.error(error);
      else setActions(data);
    }
    fetch()
  }, [])
  
  
  const handleParamChange = (name: string, value: string) => {
    setParameterValues((prev) => ({ ...prev, [name]: value }));
  };
  
  const renderPrompt = (template: string, values: Record<string, string>) => {
    return template.replace(/{{(.*?)}}/g, (_, key) => values[key.trim()] || "");
  };
  
  
const executeAction = (action: Action, values: Record<string, string>) => {
    const finalPrompt = renderPrompt(action.prompt_template, values);
    const system = action.system_prompt || "";
    router.push(`/home?prompt=${encodeURIComponent(finalPrompt)}&system=${encodeURIComponent(system)}`);
  };

const renderParameters = () => {
    if (!selected) return null;
    const parameters = selected.parameters ? JSON.parse(selected.parameters) : [];

}



 
  return (
  <Layout>
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">Acties</h1>

    {!selected ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action) => (
          <Button variant="blue"
          		key={action.id} onClick={() => setSelected(action)} >
            
              {action.name}
            
          </Button>
        ))}
      
        
      </div>
    ) : (
      <div className="space-y-4">
        {selected.parameters && selected.parameters.length > 0 && (
          <div className="space-y-2">
            {selected.parameters.map((param: any) => (
              <Input
                key={param.name}
                placeholder={param.label}
                onChange={(e) => handleParamChange(param.name, e.target.value)}
              />
            ))}
          </div>
        )}

        <Button variant="blue"
          onClick={() => executeAction(selected, parameterValues)}
          
        >
          Uitvoeren
        </Button>
      </div>
    )}
  </div>
  </Layout>
);
}
