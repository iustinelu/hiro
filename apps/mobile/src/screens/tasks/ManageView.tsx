import React from "react";
import { View } from "react-native";
import type { RecurringTask } from "@hiro/domain";
import { MobileButton, MobileEmptyStatePanel, MobileTaskRow, useTheme } from "@hiro/ui-primitives/mobile";
import { cadenceLabel } from "../../lib/taskService";

/** The "Manage" segment: every non-archived recurring task with cadence + admin
 * actions. Replaces the old read-only "All Tasks" list. */
export function ManageView({ tasks, onEdit, onArchive, onCreate }: {
  tasks: RecurringTask[];
  onEdit: (task: RecurringTask) => void;
  onArchive: (id: string) => void;
  onCreate: () => void;
}) {
  const t = useTheme();

  if (tasks.length === 0) {
    return (
      <MobileEmptyStatePanel
        variant="inline"
        icon="tasks"
        title="No recurring tasks yet"
        description="Create a repeating chore so it shows up on the board each day it's due."
        actionLabel="New task"
        onAction={onCreate}
      />
    );
  }

  return (
    <View style={{ gap: t.spacing.sm }}>
      {tasks.map((task) => (
        <MobileTaskRow
          key={task.id}
          title={task.name}
          meta={cadenceLabel(task.cadence, task.cadenceMeta)}
          points={task.points}
          leading={{ kind: "glyph", icon: "tasks" }}
          actions={
            <>
              <MobileButton label="Edit" variant="secondary" size="sm" onPress={() => onEdit(task)} />
              <MobileButton label="Archive" variant="ghost" size="sm" onPress={() => onArchive(task.id)} />
            </>
          }
        />
      ))}
    </View>
  );
}
