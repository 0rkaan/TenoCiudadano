import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ComplaintForm from "@/components/complaints/complaint-form";
import ComplaintList from "@/components/complaints/complaint-list";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-3xl font-bold mb-8 text-primary">Portal Ciudadano Teno</h1>

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="transition-all duration-200 hover:bg-primary/5">
          <TabsTrigger value="new" className="transition-colors data-[state=active]:bg-primary data-[state=active]:text-white">
            Nueva Solicitud
          </TabsTrigger>
          <TabsTrigger value="list" className="transition-colors data-[state=active]:bg-primary data-[state=active]:text-white">
            Mis Solicitudes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="animate-in fade-in-50 duration-500">
          <div className="max-w-2xl mx-auto">
            <ComplaintForm />
          </div>
        </TabsContent>

        <TabsContent value="list" className="animate-in fade-in-50 duration-500">
          <ComplaintList />
        </TabsContent>
      </Tabs>
    </div>
  );
}