import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { calculateTableStatus, RestaurantTable } from "@/lib/table";
import { TableStats } from "@/components/tableStats";
import { mockTables } from "@/utils/constants/mockTables";
import { TableHeader } from "@/components/tableHeader";
import { TableGrid } from "@/components/ui/table-grid";
import { TableDetailSheet } from "@/components/table-detail-sheets";
import { Button } from "@/components/ui/button"; // Ajoutez cette importation
import { ArrowLeft } from "lucide-react"; // Ajoutez cette importation
import { useNavigate } from "react-router-dom"; // Ajoutez cette importation

const Tables = () => {
  const navigate = useNavigate(); // Ajoutez cette ligne
  const [tables, setTables] = useState<RestaurantTable[]>(mockTables);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(
    null
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [animatingTableId, setAnimatingTableId] = useState<string | null>(null);

  const handleTableClick = (table: RestaurantTable) => {
    setSelectedTable(table);
    setSheetOpen(true);
  };

  const handleAddTable = (name: string, number: number) => {
    const newTable: RestaurantTable = {
      id: `table-${Date.now()}`,
      name,
      number,
      status: "empty",
      guests: [],
      qrCode: `${name.toUpperCase().replace(/\s+/g, "-")}-${number
        .toString()
        .padStart(3, "0")}`,
      lastUpdated: new Date(),
    };
    setTables((prev) => [...prev, newTable]);
    toast({
      title: "Table créée",
      description: `${name} ${number} ajoutée avec succès`,
    });
  };

  const handleReorder = (newTables: RestaurantTable[]) => {
    setTables(newTables);
  };

  const handleGuestPaymentChange = (
    tableId: string,
    guestId: string,
    paid: boolean
  ) => {
    setTables((prev) =>
      prev.map((table) => {
        if (table.id === tableId) {
          const updatedGuests = table.guests.map((guest) =>
            guest.id === guestId ? { ...guest, paid } : guest
          );
          const updatedTable = {
            ...table,
            guests: updatedGuests,
            status: calculateTableStatus(updatedGuests),
            lastUpdated: new Date(),
          };
          setSelectedTable(updatedTable);
          return updatedTable;
        }
        return table;
      })
    );

    setAnimatingTableId(tableId);
    setTimeout(() => setAnimatingTableId(null), 500);

    toast({
      title: paid ? "Paiement enregistré" : "Paiement annulé",
      description: `${selectedTable?.name} ${selectedTable?.number} mise à jour`,
    });
  };

  const handleMarkAllPaid = (tableId: string) => {
    setTables((prev) =>
      prev.map((table) => {
        if (table.id === tableId) {
          const updatedGuests = table.guests.map((guest) => ({
            ...guest,
            paid: true,
          }));
          const updatedTable = {
            ...table,
            guests: updatedGuests,
            status: "paid" as const,
            lastUpdated: new Date(),
          };
          setSelectedTable(updatedTable);
          return updatedTable;
        }
        return table;
      })
    );

    setAnimatingTableId(tableId);
    setTimeout(() => setAnimatingTableId(null), 500);

    toast({
      title: "Table payée",
      description: `${selectedTable?.name} ${selectedTable?.number} - tous les clients ont payé`,
    });

    setTimeout(() => setSheetOpen(false), 300);
  };

  const handleClearTable = (tableId: string) => {
    setTables((prev) =>
      prev.map((table) => {
        if (table.id === tableId) {
          const updatedTable = {
            ...table,
            guests: [],
            status: "empty" as const,
            lastUpdated: new Date(),
          };
          setSelectedTable(updatedTable);
          return updatedTable;
        }
        return table;
      })
    );

    setAnimatingTableId(tableId);
    setTimeout(() => setAnimatingTableId(null), 500);

    toast({
      title: "Table libérée",
      description: `${selectedTable?.name} ${selectedTable?.number} est maintenant disponible`,
    });

    setTimeout(() => setSheetOpen(false), 300);
  };

  const handleAddGuest = (tableId: string) => {
    setTables((prev) =>
      prev.map((table) => {
        if (table.id === tableId) {
          const newGuest = {
            id: `guest-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            name: `Client ${table.guests.length + 1}`,
            amountDue: 25,
            paid: false,
          };
          const updatedGuests = [...table.guests, newGuest];
          const paidCount = updatedGuests.filter((g) => g.paid).length;
          const newStatus =
            updatedGuests.length === 0
              ? ("empty" as const)
              : paidCount === updatedGuests.length
              ? ("paid" as const)
              : paidCount === 0
              ? ("unpaid" as const)
              : ("partial" as const);

          const updatedTable = {
            ...table,
            guests: updatedGuests,
            status: newStatus,
            lastUpdated: new Date(),
          };
          setSelectedTable(updatedTable);
          return updatedTable;
        }
        return table;
      })
    );

    setAnimatingTableId(tableId);
    setTimeout(() => setAnimatingTableId(null), 500);

    toast({
      title: "Client ajouté",
      description: `Nouveau client ajouté à la table`,
    });
  };

  const handleTableFound = (table: RestaurantTable) => {
    setSelectedTable(table);
    setSheetOpen(true);
  };

  // Fonction pour naviguer vers le POS
  const handleGoToPOS = () => {
    navigate("/pos");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Ajout du bouton de retour au POS */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={handleGoToPOS}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au POS
          </Button>
        </div>

        <TableHeader onAddTable={handleAddTable} />

        <div className="space-y-6">
          <TableStats tables={tables} />

          <div className="pt-2">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Toutes les tables
            </h2>
            <TableGrid
              tables={tables}
              onTableClick={handleTableClick}
              onReorder={handleReorder}
              animatingTableId={animatingTableId}
            />
          </div>
        </div>

        <TableDetailSheet
          table={selectedTable}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          onGuestPaymentChange={handleGuestPaymentChange}
          onMarkAllPaid={handleMarkAllPaid}
          onClearTable={handleClearTable}
          onAddGuest={handleAddGuest}
        />
      </div>
    </div>
  );
};

export default Tables;
