import { useState } from 'react';
import { DocSection, useCalendarView } from '../hooks/useProjectView';

interface CalendarViewProps {
  issues: DocSection[];
  onIssueSelect: (issue: DocSection) => void;
}

export function CalendarView({ issues, onIssueSelect }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarData = useCalendarView(issues);

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between rounded-lg border border-app-accent/20 bg-app-panelAlt p-4">
        <button
          onClick={goToPreviousMonth}
          className="rounded-lg border border-app-accent/30 bg-app-accent/10 px-3 py-2 text-app-text transition hover:border-app-accent hover:bg-app-accent/20"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-app-text">
          {calendarData.monthName} {calendarData.year}
        </h2>
        <button
          onClick={goToNextMonth}
          className="rounded-lg border border-app-accent/30 bg-app-accent/10 px-3 py-2 text-app-text transition hover:border-app-accent hover:bg-app-accent/20"
        >
          →
        </button>
      </div>

      {/* Day of Week Headers */}
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="rounded-lg bg-app-panelAlt p-3 text-center font-semibold text-app-text text-sm"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1 auto-rows-fr">
        {calendarData.days.map((day) => (
          <div
            key={day.dateString}
            className={`min-h-24 rounded-lg border-2 p-2 transition ${
              day.isCurrentMonth
                ? 'border-app-accent/20 bg-app-panelAlt hover:border-app-accent/50'
                : 'border-app-accent/10 bg-app-bg/50'
            }`}
          >
            {/* Date number */}
            <div
              className={`text-xs font-bold mb-1 ${
                day.isCurrentMonth ? 'text-app-text' : 'text-app-subtle opacity-50'
              }`}
            >
              {day.date.getDate()}
            </div>

            {/* Issues for this day */}
            <div className="space-y-1">
              {day.issues.slice(0, 3).map((issue) => (
                <button
                  key={issue.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onIssueSelect(issue);
                  }}
                  className="block w-full truncate rounded px-1.5 py-1 text-left text-xs font-semibold bg-app-accent/20 text-app-accent hover:bg-app-accent/40 transition"
                  title={issue.title}
                >
                  #{issue.issueNumber}
                </button>
              ))}
              {day.issues.length > 3 && (
                <div className="text-xs text-app-subtle font-semibold px-1.5">
                  +{day.issues.length - 3} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="rounded-lg border border-app-accent/20 bg-app-panelAlt p-4">
        <p className="text-xs font-semibold text-app-text mb-2">Legend</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-app-accent/20"></div>
            <span className="text-app-subtle">Active Issues</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-app-accent/10"></div>
            <span className="text-app-subtle">Other Months</span>
          </div>
        </div>
      </div>
    </div>
  );
}
