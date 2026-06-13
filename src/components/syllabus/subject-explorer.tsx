"use client";

import { useState } from "react";

interface Topic {
  topicId: string;
  topicName: string;
  difficulty: number;
}

interface Subject {
  subjectId: string;
  subjectName: string;
  topics: Topic[];
}

interface SubjectExplorerProps {
  subjects?: Subject[];
}

export function SubjectExplorer({ subjects = [] }: SubjectExplorerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (subjectId: string) => {
    setExpandedId((current) => (current === subjectId ? null : subjectId));
  };

  if (subjects.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Subjects & Topics</h2>
        <div className="rounded-xl border border-dashed border-border/60 p-12 text-center">
          <p className="text-sm text-muted-foreground">No subjects to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Subjects & Topics</h2>
      <div className="space-y-3">
        {subjects.map((subject) => (
          <div
            key={subject.subjectId}
            className="overflow-hidden rounded-xl border border-border/60 bg-card"
          >
            <button
              type="button"
              onClick={() => toggleExpand(subject.subjectId)}
              className="w-full p-4 text-left transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{subject.subjectName}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    📖 {subject.topics.length} topics
                  </p>
                </div>
                <span className="text-muted-foreground">
                  {expandedId === subject.subjectId ? "▲" : "▼"}
                </span>
              </div>
            </button>
            {expandedId === subject.subjectId && (
              <div className="border-t border-border/60 p-4">
                <p className="text-sm text-muted-foreground">
                  Topics will be displayed here
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
