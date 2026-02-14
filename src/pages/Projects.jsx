"use client";
import { useState, useEffect } from "react";
// Fixed: Import base44 client instead of non-existent @/entities/all
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Search,
  Grid,
  List,
  Eye,
  Settings,
  Code,
  Smartphone,
  Globe,
  ShoppingCart,
  FileText,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import AIProjectAssistant from "../components/projects/AIProjectAssistant";

const projectTypeIcons = {
  web: Globe,
  mobile: Smartphone,
  desktop: Code,
  ecommerce: ShoppingCart,
  content: FileText,
};

const statusColors = {
  draft: "bg-gray-500/20 text-gray-400",
  generating: "bg-yellow-500/20 text-yellow-400",
  ready: "bg-green-500/20 text-green-400",
  deployed: "bg-blue-500/20 text-blue-400",
  failed: "bg-red-500/20 text-red-400",
};

const ProjectCard = ({ project, onAction }) => {
  const Icon = projectTypeIcons[project.type] || Code;

  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Icon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <p className="text-sm text-gray-400 mt-1">{project.framework}</p>
            </div>
          </div>
          <Badge className={`${statusColors[project.status]} border`}>
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-300 line-clamp-2">
          {project.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Updated {new Date(project.updated_date).toLocaleDateString()}
          </div>

          <div className="flex gap-2">
            {project.preview_url && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(project.preview_url, "_blank")}
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAction("edit", project)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const data = await base44.entities.Project.list("-updated_date");
        setProjects(data);
        setFilteredProjects(data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
      setIsLoading(false);
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((project) => project.type === typeFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((project) => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, typeFilter, statusFilter]);

  const handleProjectAction = (action, project) => {
    switch (action) {
      case "edit":
        // Navigate to project editor
        window.location.href = createPageUrl(`ProjectEditor?id=${project.id}`);
        break;
      case "duplicate":
        // Duplicate project logic
        break;
      case "delete":
        // Delete project logic
        break;
    }
  };

  const projectTypes = [...new Set(projects.map((p) => p.type))];
  const projectStatuses = [...new Set(projects.map((p) => p.status))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-gray-400">
            Manage your AI-generated applications and content
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAIAssistant(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>
          <Link to={createPageUrl("UniversalGenerator")}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-900 border-gray-600 pl-10"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="bg-gray-900 border-gray-600">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {projectTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-gray-900 border-gray-600">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {projectStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-sm text-gray-400">
            {filteredProjects.length} project
            {filteredProjects.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Project Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 bg-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <Code className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            No projects found
          </h3>
          <p className="text-gray-500 mb-6">
            {projects.length === 0
              ? "Start by creating your first AI-powered project"
              : "Try adjusting your search or filters"}
          </p>
          <Link to={createPageUrl("UniversalGenerator")}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </Link>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onAction={handleProjectAction}
            />
          ))}
        </div>
      )}

      <AIProjectAssistant
        open={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        onProjectCreated={(project) => {
          setProjects([project, ...projects]);
          setShowAIAssistant(false);
        }}
      />
    </div>
  );
}