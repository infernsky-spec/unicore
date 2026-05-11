import { PageHeader, EmptyState } from "../../components/shared/UI";
import { FiDollarSign } from "react-icons/fi";

export default function StudentFees() {
  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <PageHeader
        title="Fiscal Hub"
        subtitle="Manage your institutional liabilities and payment history"
      />
      <EmptyState
        icon={FiDollarSign}
        title="Fiscal Record Empty"
        subtitle="There are no active financial liabilities or records associated with your account for the current session."
      />
    </div>
  );
}
