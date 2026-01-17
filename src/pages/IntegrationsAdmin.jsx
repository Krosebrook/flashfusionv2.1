import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IntegrationsAdmin from '../components/admin/IntegrationsAdmin';
import DispatchOutboxMonitor from '../components/admin/DispatchOutboxMonitor';
import { Settings, Zap } from 'lucide-react';

export default function IntegrationsAdminPage() {
  return (
    <Tabs defaultValue="integrations" className="w-full space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="integrations" className="gap-2">
          <Settings className="w-4 h-4" />
          Integrations
        </TabsTrigger>
        <TabsTrigger value="outbox" className="gap-2">
          <Zap className="w-4 h-4" />
          Outbox Dispatch
        </TabsTrigger>
      </TabsList>

      <TabsContent value="integrations">
        <IntegrationsAdmin />
      </TabsContent>

      <TabsContent value="outbox">
        <DispatchOutboxMonitor />
      </TabsContent>
    </Tabs>
  );
}