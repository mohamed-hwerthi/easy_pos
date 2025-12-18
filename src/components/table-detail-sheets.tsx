import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ClientOrder } from "@/models/client/client-order.model";
import { ClientProduct } from "@/models/client/client-product-detail-model";
import { OrderSource } from "@/models/Order-source.model";
import { RestaurantTable } from "@/models/restaurant-table.model";
import { TableClient } from "@/models/table-client.model";
import { TableStatus } from "@/models/table-status";
import { UserDTO } from "@/models/user.model";
import {
  addToCart,
  clearCart,
  removeFromCart,
  updateQuantity,
} from "@/redux/slices/cartSlice";
import { RootState } from "@/redux/store";
import { clientOrderService } from "@/services/client/client-order.service";
import { clientProductService } from "@/services/client/client-product-service";
import { paymentService } from "@/services/payment-service";
import { restaurantTableService } from "@/services/restaurant-table.service";
import {
  AlertTriangle,
  Check,
  CreditCard,
  Minus,
  MoreVertical,
  Package,
  Plus,
  Receipt,
  ShoppingCart,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TableProcessPaymentDialog } from "./TableProcessPaymentDialog";

interface TableDetailSheetProps {
  table: RestaurantTable | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGuestPaymentChange: (
    tableId: string,
    clientId: string,
    amount: number,
    method: string
  ) => void;
  onMarkAllPaid: (tableId: string) => void;
  onClearTable: (tableId: string) => void;
  onAddGuest: (tableId: string) => void;
  onOccupyTable: (table: RestaurantTable) => void;
  onAddOrderToTable: (tableId: string, order: ClientOrder) => void;
}

interface AddGuestFormData {
  numberOfGuests: number;
  customNames?: string[];
}

export function TableDetailSheet({
  table,
  open,
  onOpenChange,
  onGuestPaymentChange,
  onMarkAllPaid,
  onClearTable,
  onOccupyTable,
  onAddOrderToTable,
}: TableDetailSheetProps) {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartTotal = useSelector((state: RootState) =>
    state.cart.items.reduce((total, item) => total + item.itemTotalPrice, 0)
  );
  const currencySymbol = useSelector(
    (state: RootState) => state.storeCurrency.currencySymbol
  );

  const [clients, setClients] = useState<TableClient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [addGuestDialogOpen, setAddGuestDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<TableClient | null>(
    null
  );
  const [selectedClient, setSelectedClient] = useState<TableClient | null>(
    null
  );
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [addGuestForm, setAddGuestForm] = useState<AddGuestFormData>({
    numberOfGuests: 1,
    customNames: [],
  });
  const [useCustomNames, setUseCustomNames] = useState(false);

  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [products, setProducts] = useState<ClientProduct[]>([]);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [activeOrderClientId, setActiveOrderClientId] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("clients");

  const [cashier, setCashier] = useState<UserDTO | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    if (table?.id && table.status !== TableStatus.FREE) {
      loadClients();
      loadOrders();
    }
  }, [table?.id, table?.status]);

  useEffect(() => {
    loadPaymentMethods();
    loadProducts();
    loadSessionData();
  }, []);

  const loadSessionData = () => {
    const storedCashier = localStorage.getItem("cashier");
    const currentSession = localStorage.getItem("currentSession");

    if (storedCashier) {
      setCashier(JSON.parse(storedCashier));
    }

    if (currentSession) {
      setSession(JSON.parse(currentSession));
    }
  };

  const loadClients = async () => {
    if (!table?.id) return;
    try {
      setIsLoading(true);
      const clientsData = await restaurantTableService.getClientsByTable(
        table.id
      );
      setClients(clientsData);
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async () => {
    if (!table?.id) return;
    try {
      const ordersData = await clientOrderService.getOrdersByTableAndSession(
        table.id,
        session.id
      );
      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  const loadProducts = async () => {
    try {
      const productsData = await clientProductService.getAll({
        limit: 100,
      });
      setProducts(productsData.items || []);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const methods = await paymentService.getAllPaymentMethods();
      setPaymentMethods(methods);
      if (methods.length > 0) setPaymentMethod(methods[0]);
    } catch (error) {
      console.error("Error loading payment methods:", error);
    }
  };

  const handleOccupyTable = async (tableId: string) => {
    try {
      setIsLoading(true);
      const updatedTable = await restaurantTableService.occupyTable(tableId);
      onOccupyTable(updatedTable);
    } catch (error) {
      console.error("Erreur lors de l'occupation de la table:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPaymentDialog = (client: TableClient) => {
    setSelectedClient(client);
    setPaymentAmount(client.remainingAmount?.toString() || "0");
    setPaymentDialogOpen(true);
  };

  const handlePaymentSubmit = () => {
    if (!selectedClient || !table || !paymentMethod) return;

    onGuestPaymentChange(
      table.id,
      selectedClient.id,
      parseFloat(paymentAmount),
      paymentMethod
    );

    setPaymentDialogOpen(false);
    setSelectedClient(null);
    loadClients();
  };

  const calculateTableTotal = () => {
    return orders.reduce((total, order) => {
      return total + (order.total || 0);
    }, 0);
  };

  const calculateTableRemaining = () => {
    return orders.reduce((total, order) => {
      const orderPaid = order.cashReceived || 0;
      const orderTotal = order.total || 0;
      return total + Math.max(orderTotal - orderPaid, 0);
    }, 0);
  };

  const calculateClientTotal = (clientId: string) => {
    const clientOrders = orders.filter((order) => order.clientId === clientId);

    return clientOrders.reduce((total, order) => {
      return total + (order.total || 0);
    }, 0);
  };

  const calculateClientRemaining = (clientId: string) => {
    const clientOrders = orders.filter((order) => order.clientId === clientId);

    return clientOrders.reduce((total, order) => {
      const orderPaid = order.cashReceived || 0;
      const orderTotal = order.total || 0;
      return total + Math.max(orderTotal - orderPaid, 0);
    }, 0);
  };

  const handleAddGuests = async () => {
    if (!table?.id || addGuestForm.numberOfGuests < 1) return;

    try {
      setIsLoading(true);
      const guestNames: string[] = [];
      const existingClientCount = clients.length;

      if (useCustomNames && addGuestForm.customNames) {
        for (let i = 0; i < addGuestForm.numberOfGuests; i++) {
          const customName = addGuestForm.customNames[i]?.trim();
          if (customName) {
            guestNames.push(customName);
          } else {
            guestNames.push(`Client ${existingClientCount + i + 1}`);
          }
        }
      } else {
        for (let i = 0; i < addGuestForm.numberOfGuests; i++) {
          guestNames.push(`Client ${existingClientCount + i + 1}`);
        }
      }

      for (const name of guestNames) {
        await restaurantTableService.addClientToTable(table.id, {
          name,
          amountDue: 0,
          remainingAmount: 0,
          tableId: table.id,
          hasOrders: false,
        });
      }

      await loadClients();
      setAddGuestDialogOpen(false);

      setAddGuestForm({
        numberOfGuests: 1,
        customNames: [],
      });
      setUseCustomNames(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout des clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getClientStatus = (client: TableClient) => {
    const clientOrders = getOrdersForClient(client.id);
    const clientTotal = calculateClientTotal(client.id);

    if (clientOrders.length === 0 && clientTotal === 0) {
      return "NO_ORDERS";
    } else if (client.remainingAmount === 0 && clientTotal > 0) {
      return "PAID";
    } else if (client.remainingAmount > 0) {
      return "PENDING";
    }
    return "NO_ORDERS";
  };

  const handleQuickAddGuest = async () => {
    if (!table?.id) return;

    try {
      setIsLoading(true);
      const nextNumber = clients.length + 1;
      await restaurantTableService.addClientToTable(table.id, {
        name: `Client ${nextNumber}`,
        amountDue: 0,
        remainingAmount: 0,
        tableId: table.id,
        hasOrders: false,
      });
      await loadClients();
    } catch (error) {
      console.error("Erreur lors de l'ajout rapide:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!table?.id) return;

    try {
      setIsLoading(true);
      await restaurantTableService.removeClientFromTable(table.id, clientId);
      await loadClients();
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression du client:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteClient = (client: TableClient) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleUpdateCustomName = (index: number, value: string) => {
    const newCustomNames = [...(addGuestForm.customNames || [])];
    newCustomNames[index] = value;
    setAddGuestForm((prev) => ({
      ...prev,
      customNames: newCustomNames,
    }));
  };

  const getPaidCount = () => {
    return clients.filter((c) => c.remainingAmount === 0).length;
  };

  // Fonctions pour les commandes avec Redux
  const handleOpenOrderDialog = (client?: TableClient) => {
    if (client) {
      setActiveOrderClientId(client.id);
    } else {
      setActiveOrderClientId(null);
    }
    dispatch(clearCart());
    setShowOrderDialog(true);
  };

  const handleAddProductToOrder = (product: ClientProduct) => {
    dispatch(
      addToCart({
        product,
        quantity: 1,
      })
    );
  };

  const handleRemoveProductFromOrder = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  const handleUpdateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      dispatch(removeFromCart(itemId));
      return;
    }

    dispatch(updateQuantity({ itemId, quantity }));
  };
  const handlePlaceOrder = async () => {
    if (!table?.id || cartItems.length === 0) return;

    try {
      setOrderLoading(true);

      // Préparer la commande
      const orderItems = cartItems.map((item) => ({
        productId: item.itemId,
        productName: item.itemTitle,
        unitPrice: item.itemPrice,
        quantity: item.itemQuantity,
        notes: "",
        totalPrice: item.itemTotalPrice,
      }));

      const order: ClientOrder = {
        tableId: table.id,
        clientId: activeOrderClientId || undefined,
        orderItems,
        status: "PENDING",
        source: OrderSource.POS,
        createdAt: new Date().toISOString(),
        total: cartTotal,
        subTotal: cartTotal,
        cashierSessionId: session?.id,
        cashReceived: 0,
        changeGiven: 0,
      };

      const createdOrder = await clientOrderService.placeOrder(order);

      setOrders((prev) => [...prev, createdOrder]);
      onAddOrderToTable(table.id, createdOrder);
      dispatch(clearCart());

      setShowOrderDialog(false);

      if (activeOrderClientId) {
        const client = clients.find((c) => c.id === activeOrderClientId);
        if (client) {
          setSelectedClient(client);
          setShowPaymentModal(true);
        }
      }

      setActiveOrderClientId(null);

      setTimeout(() => {
        loadClients();
        loadOrders();
      }, 100);
    } catch (error) {
      console.error("Erreur lors de la commande:", error);
    } finally {
      setOrderLoading(false);
    }
  };
  const handleOpenPaymentModal = (client?: TableClient) => {
    if (client) {
      setSelectedClient(client);
      setActiveOrderClientId(client.id);
    } else {
      setSelectedClient(null);
      setActiveOrderClientId(null);
    }
    setShowPaymentModal(true);
  };

  const handleProcessPayment = async (paymentData: {
    method: string;
    amount: number;
    cashReceived?: number;
    changeGiven?: number;
  }) => {
    if (!table?.id) return;

    try {
      setIsLoading(true);

      let updatedOrders = [...orders];

      if (selectedClient && activeOrderClientId) {
        // Trouver les commandes du client
        const clientOrders = getOrdersForClient(activeOrderClientId);
        const clientTotal = calculateClientTotal(activeOrderClientId);
        const clientRemaining = calculateClientRemaining(activeOrderClientId);
        const amountToPay = paymentData.amount;

        // Marquer les commandes comme payées
        const updatedClientOrders = clientOrders.map((order) => ({
          ...order,
          cashReceived: (order.cashReceived || 0) + amountToPay,
          status: amountToPay >= clientRemaining ? "PAID" : "PARTIAL_PAID",
        }));

        // Mettre à jour la liste des commandes
        updatedOrders = orders.map((order) =>
          clientOrders.some((co) => co.id === order.id)
            ? updatedClientOrders.find((uco) => uco.id === order.id) || order
            : order
        );

        // Mettre à jour le client dans la base de données
        const newRemaining = Math.max(clientRemaining - amountToPay, 0);
        await restaurantTableService.updateClient(activeOrderClientId, {
          remainingAmount: newRemaining,
        });

        setClients((prev) =>
          prev.map((client) =>
            client.id === activeOrderClientId
              ? { ...client, remainingAmount: newRemaining }
              : client
          )
        );
      } else {
        const tableTotal = calculateTableTotal();
        const tableRemaining = calculateTableRemaining();
        const amountToPay = paymentData.amount;

        updatedOrders = orders.map((order) => ({
          ...order,
          cashReceived:
            (order.cashReceived || 0) +
            (amountToPay * (order.total || 0)) / tableTotal,
          status: amountToPay >= tableRemaining ? "PAID" : "PARTIAL_PAID",
        }));
      }

      setOrders(updatedOrders);

      if (selectedClient) {
        onGuestPaymentChange(
          table.id,
          selectedClient.id,
          paymentData.amount,
          paymentData.method
        );
      }

      await loadClients();
      await loadOrders();

      setShowPaymentModal(false);
      setSelectedClient(null);
      setActiveOrderClientId(null);
    } catch (error) {
      console.error("Erreur lors du paiement:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getOrdersForClient = (clientId: string) => {
    return orders.filter((order) => order.clientId === clientId);
  };

  const getTableOrders = () => {
    return orders.filter((order) => !order.clientId);
  };

  const getProductsByCategory = () => {
    const categories: Record<string, ClientProduct[]> = {};

    products.forEach((product) => {
      const category = product.categoryName || "Non classé";
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(product);
    });

    return categories;
  };

  const formatPrice = (price: number) => {
    const symbol = currencySymbol || "€";
    return `${price.toFixed(2)} ${symbol}`;
  };

  const renderClientItem = (client: TableClient, index: number) => {
    const clientOrders = getOrdersForClient(client.id);
    const clientTotal = calculateClientTotal(client.id);
    const clientStatus = getClientStatus(client);
    const hasOrders = clientOrders.length > 0;

    return (
      <div
        key={client.id}
        className={cn(
          "group flex flex-col p-3 rounded-lg border transition-colors hover:bg-accent/50",
          clientStatus === "PAID"
            ? "bg-status-paid-bg/50 border-status-paid/30"
            : clientStatus === "PENDING"
            ? "bg-status-partial-bg/50 border-status-partial/30"
            : "bg-card border-border"
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 flex-1">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                clientStatus === "PAID"
                  ? "bg-status-paid/20"
                  : clientStatus === "PENDING"
                  ? "bg-status-partial/20"
                  : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "text-sm font-medium",
                  clientStatus === "PAID"
                    ? "text-status-paid"
                    : clientStatus === "PENDING"
                    ? "text-status-partial"
                    : "text-muted-foreground"
                )}
              >
                {index + 1}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm text-foreground truncate">
                  {client.name}
                </p>
                <div className="flex items-center gap-2">
                  {clientStatus === "PENDING" && (
                    <Badge
                      variant="outline"
                      className="text-xs whitespace-nowrap"
                    >
                      Reste: {formatPrice(client.remainingAmount || 0)}
                    </Badge>
                  )}
                  {clientStatus === "NO_ORDERS" && (
                    <Badge
                      variant="outline"
                      className="text-xs whitespace-nowrap bg-muted"
                    >
                      Aucune commande
                    </Badge>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenOrderDialog(client);
                        }}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Ajouter commande
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPaymentModal(client);
                        }}
                        disabled={clientStatus !== "PENDING"}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Payer
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDeleteClient(client);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <p
                className={cn(
                  "text-sm mt-1",
                  clientStatus === "PAID"
                    ? "text-status-paid"
                    : clientStatus === "PENDING"
                    ? "text-status-partial"
                    : "text-muted-foreground"
                )}
              >
                {hasOrders ? (
                  <>
                    Total commandes: {formatPrice(clientTotal)}
                    {clientStatus === "PENDING" && (
                      <span className="ml-2">
                        • Reste: {formatPrice(client.remainingAmount || 0)}
                      </span>
                    )}
                  </>
                ) : (
                  "Aucune commande"
                )}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant={
              clientStatus === "PAID"
                ? "outline"
                : clientStatus === "PENDING"
                ? "default"
                : "outline"
            }
            onClick={(e) => {
              e.stopPropagation();
              if (clientStatus === "PENDING") {
                handleOpenPaymentModal(client);
              } else if (clientStatus === "NO_ORDERS") {
                handleOpenOrderDialog(client);
              }
            }}
            disabled={clientStatus === "PAID"}
            className="ml-2 flex-shrink-0"
          >
            {clientStatus === "PAID" ? (
              <>
                <Check className="w-4 h-4 mr-1" /> Payé
              </>
            ) : clientStatus === "PENDING" ? (
              <>
                <CreditCard className="w-4 h-4 mr-1" /> Payer
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-1" /> Commander
              </>
            )}
          </Button>
        </div>

        {/* Commandes du client */}
        {hasOrders && (
          <div className="mt-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Commandes</span>
              <Badge variant="outline" className="text-xs">
                {clientOrders.length} commande
                {clientOrders.length > 1 ? "s" : ""}
              </Badge>
            </div>
            <div className="space-y-1">
              {clientOrders.slice(0, 2).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="truncate">
                    {order.orderItems
                      ?.map((item) => item.productName)
                      .join(", ")}
                  </span>
                  <span className="font-medium">
                    {formatPrice(order.total || 0)}
                  </span>
                </div>
              ))}
              {clientOrders.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  +{clientOrders.length - 2} autre
                  {clientOrders.length - 2 > 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!table) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="pb-4 border-b border-border">
            <SheetTitle>Table {table.tableNumber}</SheetTitle>
          </SheetHeader>

          <div className="py-6 space-y-6">
            {/* Table status action */}
            <div className="flex gap-2">
              {table.status === TableStatus.FREE ? (
                <Button
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOccupyTable(table.id);
                  }}
                  disabled={isLoading}
                >
                  Occuper la table
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearTable(table.id);
                  }}
                >
                  Libérer la table
                </Button>
              )}
            </div>

            {table.status !== TableStatus.FREE && (
              <>
                {/* Informations de session */}
                {cashier && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Caissier: {cashier.firstName} {cashier.lastName}
                      </span>
                      <span className="font-medium">
                        Caisse: {formatPrice(session?.totalCash || 0)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Résumé des commandes */}
                {/* Résumé des commandes */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Résumé</span>
                    </div>
                    <Badge variant="secondary">
                      {orders.length} commande{orders.length > 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Total table
                      </p>
                      <p className="text-lg font-bold">
                        {formatPrice(calculateTableTotal())}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Reste à payer
                      </p>
                      <p className="text-lg font-bold text-status-partial">
                        {formatPrice(calculateTableRemaining())}
                      </p>
                    </div>
                  </div>
                  {/* Affichage du montant total déjà payé */}
                  <div className="mt-2 pt-2 border-t border-primary/10">
                    <p className="text-xs text-muted-foreground">Déjà payé</p>
                    <p className="text-sm font-medium text-status-paid">
                      {formatPrice(
                        calculateTableTotal() - calculateTableRemaining()
                      )}
                    </p>
                  </div>
                </div>
                {/* Tabs pour clients et commandes */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="clients">
                      <Users className="w-4 h-4 mr-2" />
                      Clients ({clients.length})
                    </TabsTrigger>
                    <TabsTrigger value="orders">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Commandes ({orders.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="clients" className="space-y-4">
                    {/* Header clients */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Clients</span>
                        <span className="font-semibold">
                          {clients.length} personnes ({getPaidCount()} payé)
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleQuickAddGuest}
                          disabled={isLoading}
                          className="h-8 px-3"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Client
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleOpenOrderDialog()}
                          className="h-8 px-3"
                        >
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          Commande
                        </Button>
                      </div>
                    </div>

                    {/* Liste des clients */}
                    <div className="space-y-2">
                      {isLoading ? (
                        <div className="text-center py-4 text-muted-foreground">
                          Chargement...
                        </div>
                      ) : clients.length > 0 ? (
                        clients.map((client, index) =>
                          renderClientItem(client, index)
                        )
                      ) : (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500">Aucun client</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Ajoutez des clients pour commencer
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="orders" className="space-y-4">
                    {/* Commandes de la table */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">
                          Commandes de la table
                        </h3>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenOrderDialog()}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Nouvelle
                        </Button>
                      </div>

                      {getTableOrders().length > 0 ? (
                        <div className="space-y-2">
                          {getTableOrders().map((order) => (
                            <div
                              key={order.id}
                              className="p-3 border rounded-lg bg-card"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Package className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">
                                    Commande #{order.id?.slice(-6) || "N/A"}
                                  </span>
                                </div>
                                <Badge variant="outline">
                                  {formatPrice(order.total || 0)}
                                </Badge>
                              </div>
                              <div className="space-y-1">
                                {order.orderItems?.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between text-sm"
                                  >
                                    <span>
                                      {item.quantity}x {item.productName}
                                    </span>
                                    <span>
                                      {formatPrice(
                                        item.unitPrice * item.quantity
                                      )}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                                {order.createdAt
                                  ? new Date(
                                      order.createdAt
                                    ).toLocaleTimeString()
                                  : "N/A"}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                          <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500">Aucune commande</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Ajoutez une commande pour la table
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Ajout rapide de clients */}
                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 mb-3">
                        <UserPlus className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Ajout rapide de clients
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <Button
                            key={num}
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              if (!table.id) return;
                              try {
                                setIsLoading(true);
                                for (let i = 0; i < num; i++) {
                                  const nextNumber = clients.length + i + 1;
                                  await restaurantTableService.addClientToTable(
                                    table.id,
                                    {
                                      name: `Client ${nextNumber}`,
                                      amountDue: 0,
                                      remainingAmount: 0,
                                      tableId: table.id,
                                      hasOrders: false,
                                    }
                                  );
                                }
                                await loadClients();
                              } catch (error) {
                                console.error(
                                  "Erreur lors de l'ajout multiple:",
                                  error
                                );
                              } finally {
                                setIsLoading(false);
                              }
                            }}
                            className="h-12"
                            disabled={isLoading}
                          >
                            <div className="flex flex-col items-center">
                              <span className="text-lg font-bold">{num}</span>
                              <span className="text-xs text-muted-foreground">
                                client{num > 1 ? "s" : ""}
                              </span>
                            </div>
                          </Button>
                        ))}
                      </div>

                      <Button
                        onClick={() => setAddGuestDialogOpen(true)}
                        className="w-full mt-3"
                        variant="ghost"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter plusieurs clients
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Quick actions */}
                <div className="space-y-2 pt-4 border-t">
                  <h3 className="text-sm font-medium mb-3">Actions rapides</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPaymentModal();
                      }}
                      variant="default"
                      disabled={table.remainingAmount === 0}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Payer table
                    </Button>
                    <Button
                      onClick={() => handleOpenOrderDialog()}
                      variant="outline"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Commande
                    </Button>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      table && onMarkAllPaid(table.id);
                    }}
                    variant="secondary"
                    className="w-full"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Tout marquer comme payé
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialog d'ajout de clients */}
      <Dialog open={addGuestDialogOpen} onOpenChange={setAddGuestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter des clients</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Sélection du nombre de clients */}
            <div>
              <Label>Nombre de clients à ajouter</Label>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (addGuestForm.numberOfGuests > 1) {
                      setAddGuestForm((prev) => ({
                        ...prev,
                        numberOfGuests: prev.numberOfGuests - 1,
                      }));
                    }
                  }}
                  disabled={addGuestForm.numberOfGuests <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>

                <div className="flex-1 text-center">
                  <span className="text-2xl font-bold">
                    {addGuestForm.numberOfGuests}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setAddGuestForm((prev) => ({
                      ...prev,
                      numberOfGuests: prev.numberOfGuests + 1,
                    }));
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Option pour les noms personnalisés */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="customNames"
                checked={useCustomNames}
                onChange={(e) => {
                  setUseCustomNames(e.target.checked);
                  if (!e.target.checked) {
                    setAddGuestForm((prev) => ({ ...prev, customNames: [] }));
                  }
                }}
                className="rounded border-gray-300"
              />
              <Label htmlFor="customNames" className="cursor-pointer">
                Saisir les noms des clients
              </Label>
            </div>

            {/* Champs pour les noms personnalisés */}
            {useCustomNames && (
              <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-lg">
                {Array.from({ length: addGuestForm.numberOfGuests }).map(
                  (_, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                        {index + 1}
                      </div>
                      <Input
                        placeholder={`Nom du client ${index + 1}`}
                        value={addGuestForm.customNames?.[index] || ""}
                        onChange={(e) =>
                          handleUpdateCustomName(index, e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>
                  )
                )}
              </div>
            )}

            {/* Aperçu des noms */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Clients à ajouter :</p>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: addGuestForm.numberOfGuests }).map(
                  (_, index) => {
                    const existingCount = clients.length;
                    const customName = addGuestForm.customNames?.[index];
                    const displayName =
                      useCustomNames && customName
                        ? customName || `Client ${existingCount + index + 1}`
                        : `Client ${existingCount + index + 1}`;

                    return (
                      <Badge
                        key={index}
                        variant="outline"
                        className="px-3 py-1"
                      >
                        {displayName}
                      </Badge>
                    );
                  }
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setAddGuestDialogOpen(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleAddGuests}
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading
                  ? "Ajout..."
                  : `Ajouter ${addGuestForm.numberOfGuests} client(s)`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de commande */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {activeOrderClientId
                ? `Nouvelle commande pour ${
                    clients.find((c) => c.id === activeOrderClientId)?.name ||
                    "le client"
                  }`
                : "Nouvelle commande pour la table"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* Liste des produits */}
            <div className="w-2/3 pr-4 overflow-y-auto">
              <div className="space-y-4">
                {Object.entries(getProductsByCategory()).map(
                  ([category, categoryProducts]) => (
                    <div key={category}>
                      <h3 className="text-sm font-medium mb-2">{category}</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {categoryProducts.map((product) => {
                          const cartItem = cartItems.find(
                            (item) => item.itemId === product.id
                          );
                          const currentQuantity = cartItem?.itemQuantity || 0;

                          return (
                            <Button
                              key={product.id}
                              variant="outline"
                              className="h-auto py-3 flex flex-col items-center justify-center"
                              onClick={() => handleAddProductToOrder(product)}
                            >
                              <div className="text-center">
                                <p className="font-medium text-sm">
                                  {product.title}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatPrice(product.basePrice)}
                                </p>
                                {currentQuantity > 0 && (
                                  <Badge className="mt-1" variant="secondary">
                                    {currentQuantity}
                                  </Badge>
                                )}
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Panier */}
            <div className="w-1/3 border-l pl-4 flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <h3 className="text-sm font-medium mb-3">Panier</h3>
                {cartItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Panier vide</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div
                        key={item.itemId}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {item.itemTitle}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(item.itemPrice)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() =>
                              handleUpdateCartQuantity(
                                item.itemId,
                                item.itemQuantity - 1
                              )
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center">
                            {item.itemQuantity}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() =>
                              handleUpdateCartQuantity(
                                item.itemId,
                                item.itemQuantity + 1
                              )
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-destructive"
                            onClick={() =>
                              handleRemoveProductFromOrder(item.itemId)
                            }
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total et bouton commander */}
              <div className="pt-4 border-t mt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium">Total</span>
                  <span className="text-lg font-bold">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                <Button
                  onClick={handlePlaceOrder}
                  className="w-full"
                  disabled={cartItems.length === 0 || orderLoading}
                >
                  {orderLoading ? (
                    <>Enregistrement...</>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Commander ({formatPrice(cartTotal)})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de paiement */}
      {showPaymentModal && (
        <TableProcessPaymentDialog
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedClient(null);
            setActiveOrderClientId(null);
          }}
          onConfirm={handleProcessPayment}
          amount={
            selectedClient
              ? selectedClient.remainingAmount || 0
              : table?.remainingAmount || 0
          }
          title={
            selectedClient
              ? `Paiement pour ${selectedClient.name}`
              : `Paiement table ${table?.tableNumber}`
          }
          clientName={selectedClient?.name}
          tableNumber={table?.tableNumber?.toString()}
          sessionId={session?.id}
        />
      )}

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Supprimer le client
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le client{" "}
              <span className="font-semibold">{clientToDelete?.name}</span> ?
              {clientToDelete?.remainingAmount !== 0 && (
                <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-destructive text-sm font-medium">
                    ⚠️ Attention : Ce client a encore{" "}
                    {formatPrice(clientToDelete?.remainingAmount || 0)} à payer.
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setClientToDelete(null);
              }}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                clientToDelete && handleDeleteClient(clientToDelete.id)
              }
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                "Suppression..."
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog (ancien - gardé pour compatibilité) */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Effectuer un paiement</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Client</Label>
              <Input value={selectedClient?.name || ""} readOnly disabled />
            </div>

            <div>
              <Label>Montant à payer</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                min="0.01"
                step="0.01"
              />
            </div>

            <div>
              <Label>Méthode de paiement</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une méthode" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setPaymentDialogOpen(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handlePaymentSubmit}
                className="flex-1"
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
              >
                Confirmer le paiement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
