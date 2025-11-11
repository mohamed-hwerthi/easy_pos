import CashMovementDialog from "@/components/CashMovementDialog";
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
  Plus,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  inStock: boolean;
  imageUrl?: string;
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

  const [cashier, setCashier] = useState<UserDTO | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [discount, setDiscount] = useState(0);
  const [session, setSession] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const response = await clientProductService.getAll({
          limit: 100,
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

  const handleLogout = () => {
    localStorage.removeItem("cashier");
    navigate("/login");
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      dispatch(removeFromCartAction(id));
      return;
    }

    // Vérifier le stock avant de mettre à jour la quantité
    const cartItem = cartItems.find((item) => item.itemId === id);
    const product = products.find((p) => p.id === id);

    if (product && quantity > product.stock) {
      toast({
        title: "Stock insuffisant",
        description: `Stock disponible: ${product.stock}`,
        variant: "destructive",
      });
      return;
    }

    dispatch(updateQuantity({ itemId: id, quantity: quantity }));
  };

  const addToCart = (product: Product) => {
    if (!product.inStock) {
      toast({
        title: "Produit indisponible",
        description: "Ce produit n'est pas en stock",
        variant: "destructive",
      });
      return;
    }

    if (product.stock <= 0) {
      toast({
        title: "Stock épuisé",
        description: "Ce produit n'est plus disponible",
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
      // Vérifier si on ne dépasse pas le stock
      if (existingItem.itemQuantity + 1 > product.stock) {
        toast({
          title: "Stock insuffisant",
          description: `Quantité maximale: ${product.stock}`,
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

  const subtotal = cartTotal;
  const discountAmount = (subtotal * discount) / 100;
  const tax = (subtotal - discountAmount) * 0;
  const total = subtotal - discountAmount + tax;

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCashMovement = (createdMovement: any) => {
    const updatedSession = { ...session };

    if (!updatedSession.cashMovements) {
      updatedSession.cashMovements = [];
    }
    updatedSession.cashMovements.push(createdMovement);

    if (createdMovement.type === "IN") {
      updatedSession.totalCash += createdMovement.amount;
    } else {
      updatedSession.totalCash -= createdMovement.amount;
    }

    localStorage.setItem("currentSession", JSON.stringify(updatedSession));
    setSession(updatedSession);

    toast({
      title: "Mouvement enregistré",
      description: `Montant: ${createdMovement.amount} ${
        currencySymbol || "€"
      }`,
    });
  };

  // Fonction pour formater les prix avec la devise
  const formatPrice = (price: number) => {
    const symbol = currencySymbol || "€";
    return `${price.toFixed(2)} ${symbol}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Retour
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/sales-history")}
                className="gap-2"
              >
                <History className="h-4 w-4" />
                Historique
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/cash-register-closing")}
                className="gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Clôture
              </Button>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Point de Vente</h1>
              <p className="text-sm text-muted-foreground">
                Session: {session?.id} | Caisse:{" "}
                {formatPrice(session?.totalCash || 0)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold">
              {cashier?.firstName} {cashier?.lastName}
            </p>
            <p className="text-sm text-muted-foreground">
              <Clock className="inline h-3 w-3 mr-1" />
              {new Date().toLocaleString("fr-FR")}
            </p>
          </div>
        </div>
      </header>

      <div className="flex gap-6 p-6">
        <div className="flex-1">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un produit ou scanner un code-barres..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isLoadingProducts ? (
              <div className="col-span-full py-12 text-center">
                <p className="text-muted-foreground">
                  Chargement des produits...
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Aucun produit trouvé"
                    : "Aucun produit disponible"}
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className={`overflow-hidden transition-shadow hover:shadow-lg ${
                    !product.inStock ? "opacity-60" : ""
                  }`}
                >
                  <div className="aspect-square bg-secondary/50 relative overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={API_UPLOADS_URL + product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <Search className="h-12 w-12" />
                      </div>
                    )}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge
                          variant="destructive"
                          className="text-lg py-2 px-4"
                        >
                          Rupture de stock
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="mt-2 text-2xl font-bold text-success">
                      {formatPrice(product.price)}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge
                        variant={product.inStock ? "secondary" : "destructive"}
                      >
                        {product.inStock
                          ? `Stock: ${product.stock}`
                          : "Hors stock"}
                      </Badge>
                      <Button
                        size="icon"
                        onClick={() => addToCart(product)}
                        className="h-8 w-8"
                        disabled={!product.inStock || product.stock <= 0}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="w-96">
          <Card className="sticky top-6">
            <div className="border-b p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Panier</h2>
                <Badge variant="secondary">{cartItems.length}</Badge>
              </div>
              <div className="flex gap-2">
                <CashMovementDialog
                  type="IN"
                  onMovementCreated={handleCashMovement}
                  sessionId={session?.id}
                  cashierId={cashier?.id}
                />
                <CashMovementDialog
                  type="OUT"
                  onMovementCreated={handleCashMovement}
                  sessionId={session?.id}
                  cashierId={cashier?.id}
                />
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  Panier vide
                </p>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => {
                    const product = products.find((p) => p.id === item.itemId);
                    const isOutOfStock =
                      product &&
                      (!product.inStock || item.itemQuantity > product.stock);

                    return (
                      <div
                        key={item.itemId}
                        className={`flex items-center gap-3 rounded-lg border p-3 ${
                          isOutOfStock
                            ? "border-destructive/50 bg-destructive/10"
                            : ""
                        }`}
                      >
                        <div className="flex-1">
                          <p className="font-semibold">{item.itemTitle}</p>
                          <p className="text-success">
                            {formatPrice(item.itemPrice)}
                          </p>
                          {isOutOfStock && (
                            <Badge
                              variant="destructive"
                              className="mt-1 text-xs"
                            >
                              Stock insuffisant
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() =>
                              handleUpdateQuantity(
                                item.itemId,
                                item.itemQuantity - 1
                              )
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-semibold">
                            {item.itemQuantity}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() =>
                              handleUpdateQuantity(
                                item.itemId,
                                item.itemQuantity + 1
                              )
                            }
                            disabled={
                              product && item.itemQuantity >= product.stock
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => removeFromCart(item.itemId)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-4 border-t p-4">
              <div className="flex items-center justify-between text-sm">
                <span>Sous-total:</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm">Remise (%):</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="h-8"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span>TVA (0%):</span>
                <span>{formatPrice(tax)}</span>
              </div>

              <div className="flex items-center justify-between border-t pt-4 text-lg font-bold">
                <span>Total:</span>
                <span className="text-success">{formatPrice(total)}</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={cartItems.length === 0}
                onClick={() =>
                  navigate("/payment", {
                    state: { cart: cartItems, total, subtotal, tax },
                  })
                }
              >
                Paiement
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default POS;
