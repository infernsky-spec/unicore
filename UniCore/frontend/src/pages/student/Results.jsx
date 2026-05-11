import { PageHeader, EmptyState } from "../../components/shared/UI";
import { FiAward } from "react-icons/fi";

export default function StudentResults() {
  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <PageHeader
        title="Performance Metrics"
        subtitle="View your academic results, GPA calculations, and historical transcripts"
      />
      <EmptyState
        icon={FiAward}
        title="No Results Published"
        subtitle="Your academic results have not yet been verified and published by the registry."
      />
    </div>
  );
}
