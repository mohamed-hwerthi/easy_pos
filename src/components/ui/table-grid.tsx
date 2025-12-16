// src/components/ui/table-grid.tsx
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
import { RestaurantTable } from "@/models/restaurant-table.model";
import { restaurantTableService } from "@/services/restaurant-table.service";
import SortableTableCard from "../sortable-table-card";

interface TableGridProps {
  tables: RestaurantTable[];
  onTableClick: (table: RestaurantTable) => void;
  onTablesUpdate: (tables: RestaurantTable[]) => void;
  animatingTableId?: string | null;
}

export function TableGrid({
  tables,
  onTableClick,
  onTablesUpdate,
  animatingTableId,
}: TableGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Distance minimale avant de commencer le drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tables.findIndex((t) => t.id === active.id);
      const newIndex = tables.findIndex((t) => t.id === over.id);
      const newTables = arrayMove(tables, oldIndex, newIndex);

      onTablesUpdate(newTables);

      // Synchroniser avec le serveur
      try {
        //  await restaurantTableService.reorderTables(newTables);
      } catch (error) {
        console.error("Erreur lors du réordonnancement:", error);
        // Optionnel: annuler le changement local en cas d'erreur
      }
    }
  };

  if (tables.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px] border border-dashed border-muted rounded-lg">
        <div className="text-center">
          <p className="text-muted-foreground font-medium">
            Il n'y a pas encore de table
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Ajoutez votre première table pour commencer
          </p>
        </div>
      </div>
    );
  }

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
            <SortableTableCard
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
