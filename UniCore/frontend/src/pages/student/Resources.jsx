import { PageHeader, EmptyState } from "../../components/shared/UI";
import { FiFolder } from "react-icons/fi";

export default function StudentResources() {
  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <PageHeader
        title="Data Archives"
        subtitle="Access course materials, syllabi, and supplementary resources"
      />
      <EmptyState
        icon={FiFolder}
        title="No Archives Available"
        subtitle="Your instructors have not uploaded any supplementary data archives for your current modules."
      />
    </div>
  );
}
