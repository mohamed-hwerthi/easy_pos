import { RestaurantTable } from "@/lib/table";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { TableCard } from "../tableCard";

interface TableGridProps {
  tables: RestaurantTable[];
  onTableClick: (table: RestaurantTable) => void;
  onReorder: (tables: RestaurantTable[]) => void;
  animatingTableId?: string | null;
}

export function TableGrid({
  tables,
  onTableClick,
  onReorder,
  animatingTableId,
}: TableGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tables.findIndex((t) => t.id === active.id);
      const newIndex = tables.findIndex((t) => t.id === over.id);
      onReorder(arrayMove(tables, oldIndex, newIndex));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tables.map((t) => t.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onClick={onTableClick}
              isAnimating={animatingTableId === table.id}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
