'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient'


type SupabaseUser = {
  id: string;
};

type DocumentRecord = {
  id: string;
  metadata: {
    action_id: string;
    user_id: string;
    file_path: string;
  };
};



export default function ActionContextUploader({ actionId }: { actionId: string }) {
  const [uploading, setUploading] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);

useEffect(() => {
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }
  getUser()
}, [])

useEffect(() => {
    const fetchDocuments = async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("id, metadata")
        .contains("metadata", { action_id: actionId });
        
        
    

      if (error) {
      	console.error("Error fetching documents:", error);
      }
      else {     	
			// Unieke documenten op basis van metadata.file_path
			const uniqueDocs = Array.from(
  		new Map(data.map(doc => [data.metadata?.file_path, doc])).values()
			);

			setDocuments(uniqueDocs);
        
      //	setDocuments(data);
      }
    };

    fetchDocuments();
  }, [actionId]);


  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)

    const filePath = `admin/${actionId}/${Date.now()}_${file.name}`

    const { error } = await supabase.storage.from('ragfiles').upload(filePath, file)

    if (error) {
      alert('Upload mislukt: ' + error.message)
    } else {
      
      // Je kunt hier eventueel n8n webhook triggeren of een API route callen voor chunking & embedding
    	await fetch('/api/uploadcontext', {
  			method: 'POST',
  			headers: { 'Content-Type': 'application/json' },
  			body: JSON.stringify({
    				action_id: actionId,
    				file_path: filePath,
    				uploaded_by: user?.id,
  			}),
			})
    
    }

    setUploading(false)
  }
  
  
  const handleDelete = async (doc: any) => {
    const path = doc.metadata?.file_path;
    if (!path) return;

		console.log("Verwijder pad:", path);

    const { error: storageError } = await supabase.storage
      .from("ragfiles")
      .remove([path]);

    if (storageError) {
      alert("Fout bij verwijderen bestand uit storage");
      console.error(storageError);
      return;
    }

    const { error: dbError } = await supabase
      .from("documents")
      .delete()
      .filter('metadata->>file_path', 'eq', [path]);
      

    if (dbError) {
      alert("Fout bij verwijderen uit database");
      console.error(dbError);
    } else {
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    }
  };

  
  

  return (
    <div className="space-y-4">
      <input
        type="file"
        onChange={handleFileUpload}
        disabled={uploading}
        className="block border border-gray-300 rounded px-2 py-1"
      />

      <div className="space-y-2">
        <h3 className="font-bold">Geüploade contextbestanden</h3>
        {documents.length === 0 && <p className="text-sm text-gray-500">Geen bestanden gevonden.</p>}
        <ul className="space-y-1">
          {documents.map((doc) => (
            <li key={doc.id} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
              <span className="text-sm">{doc.metadata?.file_path?.split("/").pop()}</span>
              
              <button
                onClick={() => handleDelete(doc)}
                className="text-red-500 text-sm hover:underline"
              >
                Verwijder
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

