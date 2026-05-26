import React from 'react';
import { bffClient } from '../../services/bff.client';
import { ServiceForm } from '../../components/ServiceForm';

export default async function ServiciosPage() {
  // SSR data fetching through BFF
  const response = await bffClient.get('/api/services').catch(() => ({ data: [] }));
  const services = response.data;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Gestión de Servicios</h1>
      <ServiceForm />
      <div className="grid gap-4 mt-8">
        {services.map((svc: any) => (
          <div key={svc.id} className="p-4 border rounded shadow-sm">
            <h2 className="text-lg font-semibold">{svc.name}</h2>
            <p>Precio Base: ${svc.basePrice}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
