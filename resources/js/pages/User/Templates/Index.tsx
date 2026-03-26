import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Layout from '@/layouts/UserLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Cpu,
  Search,
  Filter,
  Star,
  Zap,
  ShoppingCart,
  Headphones,
  BookOpen,
  Globe,
  Rocket,
  Crown,
} from 'lucide-react';

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  is_premium: boolean;
  icon: string | null;
  estimated_setup_time: number;
  features: string[];
  preview_image: string | null;
}

interface TemplatesIndexProps {
  templates: Template[];
  categories: string[];
}

export default function TemplatesIndex() {
  const { props } = usePage<{ props: TemplatesIndexProps }>();
  const { templates, categories } = props;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'all' | 'free' | 'premium'>('all');

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ecommerce':
        return ShoppingCart;
      case 'support':
        return Headphones;
      case 'education':
        return BookOpen;
      case 'travel':
        return Globe;
      case 'productivity':
        return Zap;
      case 'starter':
        return Rocket;
      default:
        return Cpu;
    }
  };

  const filteredTemplates = templates.filter(template => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    // View mode filter
    const matchesViewMode = viewMode === 'all' || 
      (viewMode === 'free' && !template.is_premium) ||
      (viewMode === 'premium' && template.is_premium);
    
    return matchesSearch && matchesCategory && matchesViewMode;
  });

  return (
    <Layout>
      <Head title="AI Agent Templates" />

      <div className="space-y-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight">AI Agent Templates</h1>
          <p className="text-xl text-muted-foreground mt-4">
            Jumpstart your AI agent with pre-built templates for any use case
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All Templates</TabsTrigger>
                  <TabsTrigger value="free">Free</TabsTrigger>
                  <TabsTrigger value="premium">Premium</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Templates
                  </p>
                  <h3 className="text-2xl font-bold mt-2">
                    {templates.length}
                  </h3>
                </div>
                <Cpu className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Free Templates
                  </p>
                  <h3 className="text-2xl font-bold mt-2">
                    {templates.filter(t => !t.is_premium).length}
                  </h3>
                </div>
                <Star className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Premium Templates
                  </p>
                  <h3 className="text-2xl font-bold mt-2">
                    {templates.filter(t => t.is_premium).length}
                  </h3>
                </div>
                <Crown className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Categories
                  </p>
                  <h3 className="text-2xl font-bold mt-2">
                    {categories.length}
                  </h3>
                </div>
                <Filter className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => {
              const CategoryIcon = getCategoryIcon(template.category);
              return (
                <Link key={template.id} href={`/ai-agents/templates/${template.id}`}>
                  <Card className="h-full transition-all hover:shadow-lg cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <CategoryIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <CardDescription>{template.category}</CardDescription>
                          </div>
                        </div>
                        {template.is_premium ? (
                          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        ) : (
                          <Badge variant="outline">Free</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Setup Time</span>
                          <span className="font-medium">{template.estimated_setup_time} mins</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Features:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.features.slice(0, 3).map((feature, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {template.features.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{template.features.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                          View Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Cpu className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No templates found</h3>
              <p className="text-muted-foreground mt-2">
                Try adjusting your search or filter criteria
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setViewMode('all');
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How Templates Work</CardTitle>
            <CardDescription>
              Get started quickly with pre-configured AI agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-bold text-blue-600">1</span>
                </div>
                <h4 className="font-medium mb-2">Choose Template</h4>
                <p className="text-sm text-muted-foreground">
                  Select a template that matches your use case
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-bold text-blue-600">2</span>
                </div>
                <h4 className="font-medium mb-2">Customize</h4>
                <p className="text-sm text-muted-foreground">
                  Customize the agent to match your brand and needs
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-bold text-blue-600">3</span>
                </div>
                <h4 className="font-medium mb-2">Deploy</h4>
                <p className="text-sm text-muted-foreground">
                  Deploy to your website and start conversations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}