import { PageHeader, EmptyState } from "../../components/shared/UI";
import { FiAward } from "react-icons/fi";

export default function StudentExams() {
  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <PageHeader
        title="Assessment Schedules"
        subtitle="View upcoming examinations and continuous assessment timelines"
      />
      <EmptyState
        icon={FiAward}
        title="No Upcoming Assessments"
        subtitle="Your assessment schedules will be published here once finalized by the academic registry."
      />
    </div>
  );
}
