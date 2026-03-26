import { useMemo } from 'react';

export interface DocSection {
  id: string;
  title: string;
  summary: string;
  sourcePath: string;
  content: string;
  category: string;
  issueNumber?: number;
  assignees?: string[];
  status?: 'draft' | 'review' | 'published' | 'archived';
  icon?: string;
  date?: string;
}

interface CalendarDay {
  date: Date;
  dateString: string;
  issues: DocSection[];
  isCurrentMonth: boolean;
}

export function useCalendarView(issues: DocSection[]) {
  return useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Build date map
    const issuesByDate = new Map<string, DocSection[]>();
    issues.forEach((issue) => {
      // Parse date from issue or use current date
      const dateStr = issue.date || new Date().toISOString().split('T')[0];
      if (!issuesByDate.has(dateStr)) {
        issuesByDate.set(dateStr, []);
      }
      issuesByDate.get(dateStr)!.push(issue);
    });

    // Get calendar days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: CalendarDay[] = [];

    // Previous month's trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      const dateString = date.toISOString().split('T')[0];
      days.push({
        date,
        dateString,
        issues: issuesByDate.get(dateString) || [],
        isCurrentMonth: false
      });
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateString = date.toISOString().split('T')[0];
      days.push({
        date,
        dateString,
        issues: issuesByDate.get(dateString) || [],
        isCurrentMonth: true
      });
    }

    // Next month's leading days
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      const dateString = date.toISOString().split('T')[0];
      days.push({
        date,
        dateString,
        issues: issuesByDate.get(dateString) || [],
        isCurrentMonth: false
      });
    }

    return {
      days,
      month,
      year,
      monthName: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(firstDay),
      weeks: Array.from({ length: Math.ceil(days.length / 7) }, (_, i) =>
        days.slice(i * 7, i * 7 + 7)
      )
    };
  }, [issues]);
}

export function getIssuesByStatus(issues: DocSection[]): Record<string, DocSection[]> {
  const grouped: Record<string, DocSection[]> = {
    'Not Started': [],
    'In Progress': [],
    'In Review': [],
    'Done': []
  };

  issues.forEach((issue) => {
    switch (issue.status) {
      case 'draft':
        grouped['Not Started'].push(issue);
        break;
      case 'review':
        grouped['In Review'].push(issue);
        break;
      case 'published':
        grouped['Done'].push(issue);
        break;
      default:
        grouped['Not Started'].push(issue);
    }
  });

  return grouped;
}

export function getIssuesByCategory(issues: DocSection[]): Record<string, DocSection[]> {
  const grouped: Record<string, DocSection[]> = {};

  issues.forEach((issue) => {
    const category = issue.category || 'Other';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(issue);
  });

  return grouped;
}
