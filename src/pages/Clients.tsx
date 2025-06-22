import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ScrollArea } from "@/components/ui/scroll-area"
import { useClients, useDeleteClient } from '@/hooks/useCrmData';
import { useToast } from '@/hooks/use-toast';
import { MoreVertical, Edit, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddClientDialog } from '@/components/AddClientDialog';
import { ClientImportDialog } from '@/components/ClientImportDialog';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status?: string;
  isPortalEnabled?: boolean;
}

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data: clientsData, isLoading, error } = useClients(searchTerm, page, pageSize, statusFilter);
  const { toast } = useToast();
  const deleteClient = useDeleteClient();

  const clients = clientsData?.data || [];
  const totalCount = clientsData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    setPage(1); // Reset to first page when search term or status filter changes
  }, [searchTerm, statusFilter]);

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    try {
      await deleteClient.mutateAsync(clientId);
      toast({
        title: 'Success',
        description: `${clientName} has been deleted successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete client',
        variant: 'destructive',
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const statusOptions = ['all', 'New', 'Active', 'Inactive'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Client Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage your salon clients and their information.</p>
        </div>
        <div className="flex gap-2">
          <ClientImportDialog />
          <AddClientDialog />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3 items-center">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === 'all' ? 'All' : status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                Total Clients: {totalCount}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-4">Loading clients...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">Error: {error.message}</div>
          ) : (
            <div className="relative w-full overflow-auto">
              <ScrollArea className="w-full h-[400px] mt-4">
                <table className="w-full text-sm">
                  <thead className="[&_th]:px-4 [&_th]:py-2 [&_th:first-child]:text-left border-b">
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} className="border-b">
                        <td className="px-4 py-2">{client.name}</td>
                        <td className="px-4 py-2">{client.email}</td>
                        <td className="px-4 py-2">{client.phone || 'N/A'}</td>
                        <td className="px-4 py-2">{client.status || 'N/A'}</td>
                        <td className="px-4 py-2 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteClient(client.id, client.name)} >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                    {clients.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-4">No clients found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </ScrollArea>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 py-4">
              <Button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                variant="outline"
              >
                Previous
              </Button>
              <span>Page {page} of {totalPages}</span>
              <Button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Clients;
