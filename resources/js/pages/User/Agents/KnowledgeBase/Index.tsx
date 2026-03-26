import React from 'react';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import Layout from '@/layouts/UserLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import {
  BookOpen,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  Eye,
  EyeOff,
} from 'lucide-react';
import user from '@/routes/user';

interface KnowledgeBaseItem {
  id: number;
  title: string;
  content: string;
  content_type: 'faq' | 'product_info' | 'policy' | 'custom' | 'website_content';
  source_url?: string;
  is_active: boolean;
  order: number;
  created_at: string;
}

interface AIAgent {
  id: number;
  name: string;
}

interface KnowledgeBaseIndexProps {
  agent: AIAgent;
  knowledgeBase: {
    data: KnowledgeBaseItem[];
    current_page: number;
    last_page: number;
    total: number;
  };
}

export default function KnowledgeBaseIndex() {
  const { props } = usePage<{ props: KnowledgeBaseIndexProps }>();
  const { agent, knowledgeBase } = props;
  const { delete: destroy } = useForm();

  const getContentTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      faq: 'bg-blue-100 text-blue-800',
      product_info: 'bg-green-100 text-green-800',
      policy: 'bg-orange-100 text-orange-800',
      custom: 'bg-purple-100 text-purple-800',
      website_content: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      destroy(
        user.agents.knowledgeBase.destroy.url({ agent: agent.id, knowledge: id }),{ method: 'delete' }
      );
    }
  };

  const handleToggleActive = (id: number) => {
    useForm().post(
      user.agents.knowledgeBase.toggleActive.url({ agent: agent.id, knowledge: id })
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Layout>
      <Head title={`${agent.name} - Knowledge Base`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
            <p className="text-muted-foreground">
              Manage knowledge base items for {agent.name}
            </p>
          </div>
          <Link href={user.agents.knowledgeBase.create.url(agent.id)}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </Link>
        </div>

        {/* Knowledge Base Items */}
        <Card>
          <CardHeader>
            <CardTitle>Knowledge Base Items</CardTitle>
            <CardDescription>
              {knowledgeBase.total} total items
            </CardDescription>
          </CardHeader>
          <CardContent>
            {knowledgeBase.data.length === 0 ? (
              <div className="text-center py-10">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No knowledge base items yet
                </p>
                <Link href={user.agents.knowledgeBase.create.url(agent.id)}>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Item
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {knowledgeBase.data.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium max-w-xs truncate">
                            {item.title}
                          </TableCell>
                          <TableCell>
                            <Badge className={getContentTypeBadgeColor(item.content_type)}>
                              {item.content_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.is_active ? (
                              <Badge variant="outline" className="bg-green-50">
                                <Eye className="mr-1 h-3 w-3" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50">
                                <EyeOff className="mr-1 h-3 w-3" />
                                Inactive
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(item.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleToggleActive(item.id)
                                  }
                                >
                                  {item.is_active ? (
                                    <>
                                      <EyeOff className="mr-2 h-4 w-4" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="mr-2 h-4 w-4" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={
                                      user.agents.knowledgeBase.edit.url(
                                      { agent: agent.id, knowledge: item.id }
                                    )}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(item.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {knowledgeBase.last_page > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination
                      currentPage={knowledgeBase.current_page}
                      lastPage={knowledgeBase.last_page}
                      links={[]}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
