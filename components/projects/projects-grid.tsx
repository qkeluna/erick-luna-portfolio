import { useState, useCallback, useMemo } from "react";

import { ProjectCard } from "@/components/project-card";
import { ProjectModal } from "@/components/project-modal";
import { MotionEffect } from "@/components/motion-effect";
import { ProjectsGridProps, Project } from "@/components/projects/types";

export const ProjectsGrid = ({
  projects,
  className = "",
}: ProjectsGridProps) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleOpenModal = useCallback(
    (project: Project) => setSelectedProject(project),
    [],
  );
  const handleCloseModal = useCallback(() => setSelectedProject(null), []);

  // Memoize a stable identifier for animation transitions
  const gridKey = useMemo(() => {
    return projects.map(p => p.id).join('-');
  }, [projects]);

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4 text-foreground">No Projects Found</h2>
        <p className="text-foreground-600">Check back soon for new projects!</p>
      </div>
    );
  }

  return (
    <MotionEffect
      key={gridKey}
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6 ${className}`}
      fade={{ initialOpacity: 0, opacity: 1 }}
      slide={{ direction: "up", offset: 20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {projects.map((project, index) => (
        <MotionEffect
          key={project.id}
          className="w-full md:max-w-none"
          fade={{ initialOpacity: 0, opacity: 1 }}
          slide={{ direction: "up", offset: 30 }}
          transition={{ 
            duration: 0.5, 
            ease: "easeOut",
            delay: index * 0.1
          }}
        >
          <ProjectCard
            project={project}
            onViewDetails={() => handleOpenModal(project)}
          />
        </MotionEffect>
      ))}
      <ProjectModal
        isOpen={!!selectedProject}
        project={selectedProject}
        onClose={handleCloseModal}
      />
    </MotionEffect>
  );
};
