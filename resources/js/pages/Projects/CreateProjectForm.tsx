// resources/js/Pages/Projects/CreateProjectForm.tsx
import { useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CreateProjectForm() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        project_type: '',
        description: '',
        settings: {},
        _METHOD: 'POST',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('p.s'), {
            onSuccess: () => {
                // Close the dialog/drawer by reloading the page or using a state manager
                window.location.reload();
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                    id="title"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    placeholder="Name of your project"
                    required
                />
                {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* <div className="space-y-2">
                <Label htmlFor="project_type">Project Type</Label>
                <Select
                    value={data.project_type}
                    onValueChange={(value) => setData('project_type', value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                    </SelectContent>
                </Select>
                {errors.project_type && <p className="text-sm text-red-600">{errors.project_type}</p>}
            </div> */}

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Describe your project. goals , subjects etc..."
                    rows={4}
                />
                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="sm:order-1"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={processing}
                    className="sm:order-2"
                >
                    {processing ? 'Creating...' : 'Create Project'}
                </Button>
            </div>
        </form>
    );
}
