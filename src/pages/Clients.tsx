
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Filter, Users, Mail, Phone, Edit, Trash, Loader2 } from "lucide-react";
import { useClients, useCreateClient, useDeleteClient } from "@/hooks/useCrmData";
import { Client } from "@/services/types";
import PaginationControls from "@/components/PaginationControls";

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState<Omit<Client, 'id'>>({
    name: "",
    email: "",
    phone: "",
    status: "New",
    assignedStaff: "",
    notes: "",
    visits: 0,
    totalSpent: 0,
    salonId: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Use React Query hooks - now expecting PaginatedResult
  const { data: clientsResult, isLoading, error } = useClients(searchTerm, currentPage);
  const createClientMutation = useCreateClient();
  const deleteClientMutation = useDeleteClient();

  // Extract data from paginated result
  const clients = clientsResult?.data || [];
  const totalCount = clientsResult?.count || 0;
  const hasMore = clientsResult?.hasMore || false;

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.email) {
      return;
    }

    try {
      const clientToCreate: Omit<Client, 'id'> = {
        ...newClient,
        visits: 0,
        totalSpent: 0,
        salonId: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await createClientMutation.mutateAsync(clientToCreate as Client);
      setNewClient({
        name: "",
        email: "",
        phone: "",
        status: "New",
        assignedStaff: "",
        notes: "",
        visits: 0,
        totalSpent: 0,
        salonId: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!id) return;
    
    try {
      await deleteClientMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const getStatusCounts = () => {
    return {
      total: clients.length,
      vip: clients.filter(c => c.status === 'VIP').length,
      regular: clients.filter(c => c.status === 'Regular').length,
      new: clients.filter(c => c.status === 'New').length,
    };
  };

  const statusCounts = getStatusCounts();

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading clients</p>
          <p className="text-sm text-gray-500">Please check your API configuration</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
            Clients
          </h1>
          <p className="text-muted-foreground mt-1">Manage your salon's client relationships and information.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newClient.phone || ""}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newClient.status} onValueChange={(value) => setNewClient({...newClient, status: value as Client['status']})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Regular">Regular</SelectItem>
                      <SelectItem value="VIP">VIP</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="assignedStaff">Assigned Staff</Label>
                  <Select value={newClient.assignedStaff || ""} onValueChange={(value) => setNewClient({...newClient, assignedStaff: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                      <SelectItem value="Michael Chen">Michael Chen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newClient.notes || ""}
                    onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                    placeholder="Add any additional notes..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleAddClient} 
                    className="flex-1"
                    disabled={createClientMutation.isPending}
                  >
                    {createClientMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Add Client
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-700">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-900">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : totalCount}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">VIP Clients</CardTitle>
            <Users className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : statusCounts.vip}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Regular Clients</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : statusCounts.regular}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">New This Month</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : statusCounts.new}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search clients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Client List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned Staff</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3" />
                            {client.email}
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3" />
                              {client.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={client.status === 'VIP' ? 'default' : 
                                  client.status === 'Regular' ? 'secondary' : 'outline'}
                          className={client.status === 'VIP' ? 'bg-amber-100 text-amber-800' : ''}
                        >
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{client.assignedStaff || '-'}</TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {client.notes ? (client.notes.length > 50 ? client.notes.substring(0, 50) + '...' : client.notes) : '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => client.id && handleDeleteClient(client.id)}
                            className="text-red-600 hover:text-red-700"
                            disabled={deleteClientMutation.isPending}
                          >
                            {deleteClientMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {clients.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No clients found. Add your first client to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalCount > 0 && (
                <PaginationControls
                  page={currentPage}
                  pageSize={50}
                  total={totalCount}
                  hasMore={hasMore}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Clients;
