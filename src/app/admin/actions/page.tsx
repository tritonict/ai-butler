"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Layout from '@/components/layout/Layout'
import { useTranslations } from 'next-intl'
import { Button, Input } from '@/components/ui';
import ActionContextUploader from '@/components/ActionContextUploader'

type Action = {
  id: string
  name: string
  slug: string
  description?: string
  prompt_template: string
  parameters?: Record<string, string>
  is_active: boolean
  action_type?: string
  system_prompt?: string
  // voeg hier velden toe die je nog gebruikt
}


export default function AdminActionsPage() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('actionmanagement')
  const [formData, setFormData] = useState<Action>({
    id: '',
    name: '',
    slug: '',
    description: '',
    prompt_template: '',
    parameters: {},
    is_active: true,
    action_type: '',
    system_prompt: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    const { data, error } = await supabase.from('actions').select('*').order('created_at');
    if (error) console.error('Error fetching actions:', error);
    else setActions(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('actions').delete().eq('id', id);
    fetchActions();
  };
  
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("in de submit")
    
    const payload = {
      slug: formData.slug,
      name: formData.name,
      description: formData.description,
      prompt_template: formData.prompt_template,
      parameters: typeof formData.parameters === 'string' ? JSON.parse(formData.parameters) : formData.parameters,
      is_active: formData.is_active,
      action_type: formData.action_type,
      system_prompt: formData.system_prompt,
      
      
    };
    
    
    
    if (editMode) {
     
      await supabase.from('actions').update({ ...payload, id: formData.id }).eq('id', formData.id);
    } else {
     
      await supabase.from('actions').insert([payload]);
    }
    
    setFormData({
      id: '', 
      slug: '', 
      name: '', 
      description: '', 
      prompt_template: '', 
      parameters: {}, 
      is_active: true,
      action_type: 'free_prompt', 
      system_prompt: '',
    });
    setEditMode(false);
    setShowForm(false);
    fetchActions();
  };

  const handleEdit = (action: Action) => {
   
    if (action)
    {
    	setFormData(action);
    	setEditMode(true);
    }
    else
    {
    	setFormData({
      id: '', slug: '', name: '', description: '', prompt_template: '', parameters: {}, is_active: true,
      action_type: 'free_prompt', system_prompt: '',
    });
    	setEditMode(false);
    }
    
    setShowForm(true);
  };
  
  const handleAdd = () => {
   
    	setFormData({
      	id: '', slug: '', 
      	name: '', 
      	description: '', 
      	prompt_template: '', 
      	parameters: {}, 
      	is_active: true,
      	action_type: 'free_prompt', 
      	system_prompt: '',
    		});
    	setEditMode(false);
    
    
    setShowForm(true);
  };
  
  

  return (
    <Layout>
    <div className="p-4">
      <Button variant="green"
        onClick={() => handleAdd()}
      >
        {t("addaction")}
      </Button>

      {showForm && formData && (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow mb-6">
          <label className="block mb-1 font-medium">{t('slug')}</label>
          <Input placeholder="Slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required />
          <label className="block mb-1 font-medium">{t('name')}</label>
          <Input placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <label className="block mb-1 font-medium">{t('description')}</label>
          <Input placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
          <label className="block mb-1 font-medium">{t('prompttemplate')}</label>
          <textarea className="w-full p-2 border rounded" placeholder="Prompt Template" value={formData.prompt_template || ''} onChange={(e) => setFormData({ ...formData, prompt_template: e.target.value })} />
          <label className="block mb-1 font-medium">{t('systemprompt')}</label>
          <textarea className="w-full p-2 border rounded" placeholder="System Prompt" value={formData.system_prompt || ''} onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })} />
          <label className="block mb-1 font-medium">{t('parameters')}</label>
          <Input 
          		 
          		placeholder="Parameters (JSON)" 
          		value={formData.parameters ? JSON.stringify(formData.parameters) : ''} 
          		
          		onChange={(e) => {
    						try {
      							const parsed = JSON.parse(e.target.value)
      							setFormData({ ...formData, parameters: parsed })
    								} catch {
      				// eventueel foutafhandeling tonen
    							}
 							 }}
          		
          />
          <select className="w-full p-2 border rounded" value={formData.action_type} onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}>
            <option value="free_prompt">{t("freeprompt")}</option>
            <option value="defined_prompt">{t("definedprompt")}</option>
          </select>
          
          {editMode && (
          		<ActionContextUploader actionId={formData.id} />
          	)
          }
          
          
          <div className="flex gap-2">
            <Button variant="blue" type="submit" >{editMode ? t('update') : t('create')} {t("action")}</Button>
            <Button variant="red" type="button" onClick={() => { setShowForm(false); setEditMode(false); }} >{t("cancel")}</Button>
          </div>
        </form>
      )}

      {loading ? (
        <p>{t("loadingactions")}</p>
      ) : (
        <div className="space-y-4">
          {actions.map((action) => (
            <div key={action.id} className="bg-white p-4 rounded shadow">
              <h3 className="text-xl font-bold text-gray-800">{action.name} <span className="text-sm text-gray-600">({action.slug})</span></h3>
              <p className="text-gray-700 mb-2">{action.description}</p>
              <div className="flex gap-2">
                <Button variant="yellow" onClick={() => handleEdit(action)} >{t("edit")}</Button>
                <Button variant="red" onClick={() => handleDelete(action.id)} >{t("delete")}</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </Layout>
  );
}
