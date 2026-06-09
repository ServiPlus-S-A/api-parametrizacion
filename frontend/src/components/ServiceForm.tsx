'use client';
import React, { useState } from 'react';

export function ServiceForm() {
  const [name, setName] = useState('');
  const [basePrice, setBasePrice] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Use BFF client to create service
    console.log('Submitting', { name, basePrice });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded shadow-md max-w-md">
      <h3 className="text-xl font-bold mb-4">Crear Nuevo Servicio</h3>
      <div className="mb-4">
        <label className="block mb-2">Nombre del Servicio</label>
        <input 
          className="border p-2 w-full text-black" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Precio Base</label>
        <input 
          type="number" 
          className="border p-2 w-full text-black" 
          value={basePrice} 
          onChange={(e) => setBasePrice(Number(e.target.value))} 
          required 
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Crear Servicio
      </button>
    </form>
  );
}
