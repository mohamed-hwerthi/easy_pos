import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { API_UPLOADS_URL } from "@/lib/api.config";
import { ClientProduct } from "@/models/client/client-product-detail-model";
import { ClientStore } from "@/models/client/client-store-model";
import { UserDTO } from "@/models/user.model";
import {
  selectCartItems,
  selectCartTotal,
} from "@/redux/selectors/cart-selector";
import {
  addToCart as addToCartAction,
  removeFromCart as removeFromCartAction,
  updateQuantity,
} from "@/redux/slices/cartSlice";
import { setCurrency } from "@/redux/slices/storeCurrencySlice";
import { clientProductService } from "@/services/client/client-product-service";
import { clientStoreService } from "@/services/client/client-store-service";
import {
  Clock,
  DollarSign,
  History,
  Home,
  Minus,
  Search,
  ShoppingCart,
  Trash2,
  X,
  Grid3x3,
  Keyboard,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { shortcuts } from "@/utils/constants/constants";
import PaymentModal from "./Payment-modal";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  inStock: boolean;
  imageUrl?: string;
  barcode?: string;
}

const convertClientProductToProduct = (
  clientProduct: ClientProduct
): Product => {
  return {
    id: clientProduct.id,
    name: clientProduct.title,
    price: clientProduct.discountedPrice || clientProduct.basePrice,
    stock: clientProduct.quantity,
    inStock: clientProduct.inStock,
    imageUrl: clientProduct.mediasUrls?.[0],
  };
};

const POS = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const currencySymbol = useSelector(
    (state: any) => state.storeCurrency.currencySymbol
  );
  const params = useParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const subtotal = cartTotal;
  const total = subtotal;

  const [cashier, setCashier] = useState<UserDTO | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [session, setSession] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  }, []);

  useEffect(() => {
    const storedCashier = localStorage.getItem("cashier");
    const currentSession = localStorage.getItem("currentSession");

    if (!storedCashier) {
      navigate("/login");
      return;
    }

    if (!currentSession) {
      navigate("/cash-register-opening");
      return;
    }

    setCashier(JSON.parse(storedCashier));
    setSession(JSON.parse(currentSession));
  }, [navigate]);

  useEffect(() => {
    const fetchStoreAndCurrency = async () => {
      const getSlugFromUrl = (): string | null => {
        const currentUrl = window.location.hostname;
        if (currentUrl.includes(".localhost")) {
          const parts = currentUrl.split(".");
          return parts[0];
        }
        if (currentUrl.includes(".goodshop.fr")) {
          const parts = currentUrl.split(".");
          return parts[0];
        }
        return params.slug as string;
      };

      try {
        const slug = getSlugFromUrl();
        if (!slug) {
          console.error("No slug found in URL");
          return;
        }

        const storeData: ClientStore = await clientStoreService.getBySlug(slug);
        if (storeData.currencySymbol) {
          dispatch(setCurrency(storeData.currencySymbol));
        }
      } catch (err: any) {
        console.error("Failed to fetch store or currency:", err);
      }
    };

    fetchStoreAndCurrency();
  }, [dispatch, params.slug]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const response = await clientProductService.getAll({
          limit: 200,
        });
        const convertedProducts = response.items.map(
          convertClientProductToProduct
        );
        setProducts(convertedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les produits",
          variant: "destructive",
        });
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [toast]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showShortcuts && e.key !== "F12" && e.key !== "Escape") {
        return;
      }
      if (e.key === "Escape") {
        if (showShortcuts) {
          setShowShortcuts(false);
        } else {
          setSearchQuery("");
          searchInputRef.current?.focus();
        }
        return;
      }

      if (e.key === "F1" && cartItems.length > 0) {
        e.preventDefault();
        navigate("/payment", {
          state: { cart: cartItems, total, subtotal },
        });
        return;
      }
      if (e.key === "F2") {
        e.preventDefault();
        navigate("/sales-history");
        return;
      }

      if (e.key === "F3") {
        e.preventDefault();
        navigate("/cash-register-closing");
        return;
      }

      if (e.key === "F4") {
        e.preventDefault();
        navigate("/tables");
        return;
      }

      if (e.key === "F5" && cartItems.length > 0) {
        e.preventDefault();
        clearCart();
        return;
      }

      if (e.key === "F6") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      if (e.key === "F7" && filteredProducts.length > 0) {
        e.preventDefault();
        addToCart(filteredProducts[0]);
        return;
      }

      if (e.key === "F8") {
        e.preventDefault();
        window.location.reload();
        return;
      }

      if (e.key === "F9" && cartItems.length > 0) {
        e.preventDefault();
        const lastItem = cartItems[cartItems.length - 1];
        removeFromCart(lastItem.itemId);
        return;
      }

      if (e.key === "F10") {
        e.preventDefault();
        navigate("/");
        return;
      }

      if (e.key === "F12") {
        e.preventDefault();
        setShowShortcuts(!showShortcuts);
        return;
      }

      if (e.key === "Delete" && cartItems.length > 0) {
        e.preventDefault();
        const lastItem = cartItems[cartItems.length - 1];
        removeFromCart(lastItem.itemId);
        return;
      }

      if (
        e.ctrlKey &&
        e.key === "a" &&
        document.activeElement === searchInputRef.current
      ) {
        return;
      }

      if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        clearCart();
        setSearchQuery("");
        searchInputRef.current?.focus();
        return;
      }

      if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        toast({
          title: "Impression",
          description: "Utilisez F1 pour aller au paiement et imprimer",
        });
        return;
      }

      if (e.ctrlKey && e.key === "h") {
        e.preventDefault();
        navigate("/sales-history");
        return;
      }

      if (e.key === "+" && cartItems.length > 0) {
        e.preventDefault();
        const lastItem = cartItems[cartItems.length - 1];
        handleUpdateQuantity(lastItem.itemId, lastItem.itemQuantity + 1);
        return;
      }

      if (e.key === "-" && cartItems.length > 0) {
        e.preventDefault();
        const lastItem = cartItems[cartItems.length - 1];
        handleUpdateQuantity(lastItem.itemId, lastItem.itemQuantity - 1);
        return;
      }

      if (e.key === "Enter" && searchQuery && filteredProducts.length > 0) {
        e.preventDefault();
        addToCart(filteredProducts[0]);
        setSearchQuery("");
        return;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    cartItems,
    total,
    navigate,
    subtotal,
    showShortcuts,
    searchQuery,
    filteredProducts,
  ]);

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      dispatch(removeFromCartAction(id));
      return;
    }

    const product = products.find((p) => p.id === id);
    if (product && quantity > product.stock) {
      toast({
        title: "Stock insuffisant",
        description: `Max: ${product.stock}`,
        variant: "destructive",
      });
      return;
    }

    dispatch(updateQuantity({ itemId: id, quantity: quantity }));
  };

  const addToCart = (product: Product) => {
    if (!product.inStock || product.stock <= 0) {
      toast({
        title: "Indisponible",
        variant: "destructive",
      });
      return;
    }

    const clientProduct: ClientProduct = {
      id: product.id,
      title: product.name,
      description: "",
      basePrice: product.price,
      quantity: product.stock,
      inStock: product.inStock,
      mediasUrls: product.imageUrl ? [product.imageUrl] : [],
    };

    const existingItem = cartItems.find((item) => item.itemId === product.id);
    if (existingItem) {
      if (existingItem.itemQuantity + 1 > product.stock) {
        toast({
          title: "Stock insuffisant",
          variant: "destructive",
        });
        return;
      }
      dispatch(
        updateQuantity({
          itemId: product.id,
          quantity: existingItem.itemQuantity + 1,
        })
      );
    } else {
      dispatch(addToCartAction({ product: clientProduct, quantity: 1 }));
    }
  };

  const removeFromCart = (id: string) => {
    dispatch(removeFromCartAction(id));
  };

  const clearCart = () => {
    cartItems.forEach((item) => {
      dispatch(removeFromCartAction(item.itemId));
    });
    toast({
      title: "Panier vidé",
    });
  };

  const formatPrice = (price: number) => {
    const symbol = currencySymbol || "€";
    return `${price.toFixed(2)} ${symbol}`;
  };

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof shortcuts>);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header compact */}
      <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-1"
          >
            <Home className="w-4 h-4" />
            Accueil
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/tables")}
            className="gap-1"
          >
            <Grid3x3 className="w-4 h-4" />
            Tables
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/sales-history")}
            className="gap-1"
          >
            <History className="w-4 h-4" />
            Historique
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/cash-register-closing")}
            className="gap-1"
          >
            <DollarSign className="w-4 h-4" />
            Clôture
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShortcuts(true)}
            className="gap-1"
          >
            <Keyboard className="w-4 h-4" />
            Raccourcis (F12)
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="text-gray-600">
            {cashier?.firstName} {cashier?.lastName}
          </div>
          <div className="font-medium">
            {formatPrice(session?.totalCash || 0)}
          </div>
          <div className="text-gray-500">
            {new Date().toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Zone produits */}
        <div className="flex-1 flex flex-col p-4">
          {/* Recherche */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Rechercher un produit... (F6)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Grille de produits */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingProducts ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Chargement...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Aucun produit</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square mb-2 relative">
                      {product.imageUrl ? (
                        <img
                          src={`${API_UPLOADS_URL}${product.imageUrl}`}
                          alt={product.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                          <ShoppingCart className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                      {(!product.inStock || product.stock <= 0) && (
                        <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                          <Badge variant="destructive">ÉPUISÉ</Badge>
                        </div>
                      )}
                      {product.inStock && product.stock > 0 && (
                        <Badge className="absolute top-1 right-1 bg-blue-500">
                          {product.stock}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-medium text-sm mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold">
                      {formatPrice(product.price)}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panier */}
        <div className="w-96 bg-white border-l flex flex-col">
          {/* Header panier */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-semibold">Panier ({cartItems.length})</span>
            </div>
            {cartItems.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Liste des articles */}
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                Panier vide
              </div>
            ) : (
              <div className="space-y-2">
                {cartItems.map((item) => {
                  const product = products.find((p) => p.id === item.itemId);
                  return (
                    <Card key={item.itemId} className="p-3">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-sm">
                          {item.itemTitle}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.itemId)}
                          className="h-6 w-6 p-0 text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateQuantity(
                                item.itemId,
                                item.itemQuantity - 1
                              )
                            }
                            className="h-7 w-7 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.itemQuantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateQuantity(
                                item.itemId,
                                item.itemQuantity + 1
                              )
                            }
                            disabled={
                              product && item.itemQuantity >= product.stock
                            }
                            className="h-7 w-7 p-0"
                          >
                            +
                          </Button>
                        </div>
                        <span className="font-bold">
                          {formatPrice(item.itemPrice * item.itemQuantity)}
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Résumé et paiement */}
          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between text-xl font-bold">
              <span>TOTAL:</span>
              <span>{formatPrice(total)}</span>
            </div>

            <Button
              onClick={() => setShowPaymentModal(true)}
              disabled={cartItems.length === 0}
              className="w-full h-14 text-lg"
            >
              PAYER (F1)
            </Button>
          </div>
        </div>
      </div>
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          cartItems={cartItems}
          total={total}
          subtotal={subtotal}
        />
      )}

      {/* Modal Raccourcis */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Keyboard className="w-6 h-6" />
              Raccourcis Clavier
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
              <div key={category}>
                <h3 className="font-semibold text-lg mb-3 text-blue-600">
                  {category}
                </h3>
                <div className="grid gap-2">
                  {shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
                    >
                      <span className="text-gray-700">
                        {shortcut.description}
                      </span>
                      <Badge variant="outline" className="font-mono">
                        {shortcut.key}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t text-sm text-gray-500 text-center">
            Appuyez sur F12 ou ESC pour fermer cette fenêtre
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POS;
