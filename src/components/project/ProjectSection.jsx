import { getListOfUrlRepositoriesUrl } from "../../lib/api-url";
import { SectionWrapper } from "../atom/SectionWrapper";
import { Project } from "./Project";
import { useFetch } from "../../hooks/useFetch";
import { GITHUB_USERNAME } from "../../lib/config";

export const ProjectSection = () => {
  const {
    isLoaded,
    status,
    error,
    data: projects,
  } = useFetch(getListOfUrlRepositoriesUrl(GITHUB_USERNAME));

  console.log("response:", projects ?? "-", "status:", status);

  if (error) {
    return (
      <SectionWrapper title="Error loading  projects">
        <div className="flex flex-wrap justify-center gap-8">
          <p>Error: {error.message}</p>
        </div>
      </SectionWrapper>
    );
  }
  if (!isLoaded) {
    return (
      <SectionWrapper title="Loading Projects">
        <div className="flex flex-wrap justify-center gap-8">
          <p>Loading...</p>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper title="Projects">
      <div className="flex flex-wrap justify-center gap-8">
        {projects?.map((project) => (
          <Project key={project.name} {...project} />
        ))}
      </div>
    </SectionWrapper>
  );
};
