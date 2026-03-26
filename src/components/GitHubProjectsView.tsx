import { DocSection, getIssuesByStatus } from '../hooks/useProjectView';

interface GitHubProjectsViewProps {
  issues: DocSection[];
  onIssueSelect: (issue: DocSection) => void;
}

const statusColors = {
  'Not Started': 'bg-gray-500/20 border-gray-500/30 text-gray-400',
  'In Progress': 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  'In Review': 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
  'Done': 'bg-green-500/20 border-green-500/30 text-green-400'
};

export function GitHubProjectsView({ issues, onIssueSelect }: GitHubProjectsViewProps) {
  const issuesByStatus = getIssuesByStatus(issues);
  const statuses = ['Not Started', 'In Progress', 'In Review', 'Done'] as const;

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {statuses.map((status) => (
          <div
            key={status}
            className="rounded-lg border border-app-accent/20 bg-app-panelAlt p-3 text-center"
          >
            <div className="text-2xl font-bold text-app-accent">
              {issuesByStatus[status].length}
            </div>
            <div className="text-xs text-app-subtle mt-1">{status}</div>
          </div>
        ))}
      </div>

      {/* Projects View */}
      <div className="grid grid-cols-4 gap-4 auto-rows-max">
        {statuses.map((status) => (
          <div
            key={status}
            className="flex flex-col rounded-lg border border-app-accent/20 bg-app-panelAlt/50 overflow-hidden"
          >
            {/* Column Header */}
            <div className="border-b border-app-accent/20 bg-app-panelAlt px-4 py-3 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-app-text text-sm">{status}</h3>
                <span className="inline-block px-2 py-1 rounded text-xs font-bold bg-app-accent/20 text-app-accent">
                  {issuesByStatus[status].length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[70vh]">
              {issuesByStatus[status].length === 0 ? (
                <div className="rounded-lg border border-dashed border-app-accent/20 p-4 text-center text-sm text-app-subtle">
                  No issues
                </div>
              ) : (
                issuesByStatus[status].map((issue) => (
                  <button
                    key={issue.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onIssueSelect(issue);
                    }}
                    className="w-full text-left rounded-lg border border-app-accent/20 bg-app-bg/70 p-3 transition hover:border-app-accent/40 hover:bg-app-accent/5 group"
                  >
                    {/* Issue Number and Icon */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-6 h-6 rounded-md border border-app-accent/30 bg-app-panelAlt p-1 flex items-center justify-center text-app-accent flex-shrink-0 group-hover:border-app-accent/50 text-xs">
                          {issue.icon ? (
                            <div dangerouslySetInnerHTML={{ __html: issue.icon }} className="w-full h-full" />
                          ) : (
                            <span>📄</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs text-app-accent font-mono font-bold">#{issue.issueNumber}</div>
                          <div className="text-xs text-app-text font-semibold truncate">{issue.title}</div>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${statusColors[status as keyof typeof statusColors]}`}>
                        {status}
                      </span>
                      {issue.category && (
                        <span className="px-2 py-1 rounded text-xs bg-app-accent/20 text-app-accent">
                          {issue.category}
                        </span>
                      )}
                    </div>

                    {/* Assignees */}
                    {issue.assignees && issue.assignees.length > 0 && (
                      <div className="flex gap-1 pt-2 border-t border-app-accent/10">
                        {issue.assignees.slice(0, 2).map((assignee) => (
                          <span
                            key={assignee}
                            title={assignee}
                            className="w-5 h-5 rounded-full bg-app-accent/30 text-app-accent text-xs font-bold flex items-center justify-center"
                          >
                            {assignee.charAt(1).toUpperCase()}
                          </span>
                        ))}
                        {issue.assignees.length > 2 && (
                          <span className="w-5 h-5 rounded-full bg-app-accent/20 text-app-accent text-xs font-bold flex items-center justify-center">
                            +{issue.assignees.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
