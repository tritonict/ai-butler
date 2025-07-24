"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Layout from '@/components/layout/Layout'

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
      console.log('Editing action');
      await supabase.from('actions').update({ ...payload, id: formData.id }).eq('id', formData.id);
    } else {
      console.log('Creating new action');
      await supabase.from('actions').insert([payload]);
    }
    
    setFormData({
      id: '', 
      slug: '', 
      name: '', 
      description: '', 
      prompt_template: '', 
      parameters: '{}', 
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
      id: '', slug: '', name: '', description: '', prompt_template: '', parameters: '{}', is_active: true,
      action_type: 'free_prompt', system_prompt: '',
    });
    	setEditMode(false);
    }
    
    setShowForm(true);
  };

  return (
    <Layout>
    <div className="p-4">
      <button
        onClick={() => handleEdit(null)}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Add Action
      </button>

      {showForm && formData && (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow mb-6">
          <input className="w-full p-2 border rounded" placeholder="Slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required />
          <input className="w-full p-2 border rounded" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <input className="w-full p-2 border rounded" placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
          <textarea className="w-full p-2 border rounded" placeholder="Prompt Template" value={formData.prompt_template || ''} onChange={(e) => setFormData({ ...formData, prompt_template: e.target.value })} />
          <textarea className="w-full p-2 border rounded" placeholder="System Prompt" value={formData.system_prompt || ''} onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })} />
          <input className="w-full p-2 border rounded" placeholder="Parameters (JSON)" value={formData.parameters} onChange={(e) => setFormData({ ...formData, parameters: e.target.value })} />
          <select className="w-full p-2 border rounded" value={formData.action_type} onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}>
            <option value="free_prompt">Free Prompt</option>
            <option value="defined_prompt">Defined Prompt</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">{editMode ? 'Update' : 'Create'} Action</button>
            <button type="button" onClick={() => { setShowForm(false); setEditMode(false); }} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading actions...</p>
      ) : (
        <div className="space-y-4">
          {actions.map((action) => (
            <div key={action.id} className="bg-white p-4 rounded shadow">
              <h3 className="text-xl font-bold text-gray-800">{action.name} <span className="text-sm text-gray-600">({action.slug})</span></h3>
              <p className="text-gray-700 mb-2">{action.description}</p>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(action)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">Edit</button>
                <button onClick={() => handleDelete(action.id)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </Layout>
  );
}
