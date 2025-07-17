import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Search,
  Clock,
  DollarSign,
  Edit,
  Trash,
  Scissors,
  Star,
  StarOff,
} from "lucide-react";
import {
  useServices,
  useCreateService,
  useDeleteService,
  useToggleServicePopular,
  useServiceCategories,
} from "@/hooks/services/useServiceHooks";
import { EditServiceDialog } from "@/components/EditServiceDialog";
import { Service } from "@/services/types";
import { toast } from "@/hooks/use-toast";

const Services: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showInactive, setShowInactive] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [newService, setNewService] = useState({
    name: "",
    category: "",
    duration: "",
    price: "",
    description: "",
    is_active: true,
    popular: false,
  });

  // Fetch data
  const {
    data: servicesData,
    isLoading,
    error,
  } = useServices(
    searchTerm || undefined,
    selectedCategory !== "all" ? selectedCategory : undefined,
    showInactive ? undefined : true
  );
  const { data: categories = [] } = useServiceCategories();
  const createServiceMutation = useCreateService();
  const deleteServiceMutation = useDeleteService();
  const togglePopularMutation = useToggleServicePopular();

  const services = servicesData?.data || [];
  const totalServices = servicesData?.count || 0;

  const handleAddService = async () => {
    if (
      !newService.name ||
      !newService.category ||
      !newService.duration ||
      !newService.price
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createServiceMutation.mutateAsync({
        name: newService.name,
        category: newService.category,
        duration: parseInt(newService.duration, 10),
        price: parseFloat(newService.price),
        description: newService.description,
        is_active: newService.is_active,
        popular: newService.popular,
      });
      setNewService({
        name: "",
        category: "",
        duration: "",
        price: "",
        description: "",
        is_active: true,
        popular: false,
      });
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error("Error creating service:", err);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await deleteServiceMutation.mutateAsync(id);
      } catch (err) {
        console.error("Error deleting service:", err);
      }
    }
  };

  const handleTogglePopular = async (service: Service) => {
    try {
      await togglePopularMutation.mutateAsync({
        id: service.id,
        popular: !service.popular,
      });
    } catch (err) {
      console.error("Error toggling popular status:", err);
    }
  };

  // Calculate stats
  const activeServices = services.filter((s) => s.is_active);
  const popularServices = services.filter((s) => s.popular);
  const avgDuration =
    services.length > 0
      ? Math.round(
          services.reduce((sum, s) => sum + s.duration, 0) / services.length
        )
      : 0;
  const avgPrice =
    services.length > 0
      ? Math.round(
          services.reduce((sum, s) => sum + s.price, 0) / services.length
        )
      : 0;

  const availableCategories = ["all", ...categories];

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600">
              Error loading services: {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
            Services
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your salon's service catalog and pricing.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="serviceName">Service Name *</Label>
                <Input
                  id="serviceName"
                  value={newService.name}
                  onChange={(e) =>
                    setNewService({ ...newService, name: e.target.value })
                  }
                  placeholder="Enter service name"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={newService.category}
                  onValueChange={(value) =>
                    setNewService({ ...newService, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories
                      .filter((c) => c !== "all")
                      .map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (min) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newService.duration}
                    onChange={(e) =>
                      setNewService({ ...newService, duration: e.target.value })
                    }
                    placeholder="60"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newService.price}
                    onChange={(e) =>
                      setNewService({ ...newService, price: e.target.value })
                    }
                    placeholder="85.00"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newService.description}
                  onChange={(e) =>
                    setNewService({ ...newService, description: e.target.value })
                  }
                  placeholder="Describe this service..."
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={newService.is_active}
                    onCheckedChange={(checked) =>
                      setNewService({ ...newService, is_active: checked })
                    }
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="popular"
                    checked={newService.popular}
                    onCheckedChange={(checked) =>
                      setNewService({ ...newService, popular: checked })
                    }
                  />
                  <Label htmlFor="popular">Popular</Label>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleAddService}
                  className="flex-1"
                  disabled={createServiceMutation.isPending}
                >
                  {createServiceMutation.isPending ? "Adding..." : "Add Service"}
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-700">
              Total Services
            </CardTitle>
            <Scissors className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-900">{totalServices}</div>
            <p className="text-xs text-teal-600 mt-1">
              {activeServices.length} active
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">
              Popular Services
            </CardTitle>
            <Star className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {popularServices.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Avg. Duration
            </CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {avgDuration} min
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Avg. Price
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">${avgPrice}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-inactive"
                checked={showInactive}
                onCheckedChange={setShowInactive}
              />
              <Label htmlFor="show-inactive">Show Inactive</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-0 shadow-lg animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Scissors className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">No Services Found</h2>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filters."
                : "Get started by adding your first service."}
            </p>
            {!searchTerm && selectedCategory === "all" && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Service
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card
              key={service.id}
              className={`border-0 shadow-lg hover:shadow-xl transition-shadow ${
                !service.is_active ? "opacity-60" : ""
              }`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary">{service.category}</Badge>
                      {service.popular && (
                        <Badge className="bg-amber-100 text-amber-800">
                          Popular
                        </Badge>
                      )}
                      {!service.is_active && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTogglePopular(service)}
                    disabled={togglePopularMutation.isPending}
                  >
                    {service.popular ? (
                      <StarOff className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Star className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {service.duration} min
                  </div>
                  <div className="text-lg font-semibold text-teal-600">
                    ${service.price}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => setEditingService(service)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteService(service.id)}
                    className="text-red-600 hover:text-red-700"
                    disabled={deleteServiceMutation.isPending}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Service Dialog */}
      <EditServiceDialog
        service={editingService}
        open={!!editingService}
        onOpenChange={(open) => !open && setEditingService(null)}
      />
    </div>
  );
};

export default Services;
