import React, { useState, useMemo } from "react";
import { Product, CartItem } from "../types";
import { Search, SlidersHorizontal, Check, AlertTriangle, Star, CheckCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProductCatalogProps {
  products: Product[];
  onAddToCart: (p: Product) => void;
  cartItems: CartItem[];
}

export default function ProductCatalog({ products, onAddToCart, cartItems }: ProductCatalogProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(350);
  const [sortBy, setSortBy] = useState("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const list = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(list)];
  }, [products]);

  // Compute filtered & sorted items
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
        const matchesPrice = p.price <= maxPrice;
        const matchesStock = !inStockOnly || p.stock > 0;
        return matchesSearch && matchesCategory && matchesPrice && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        // Default to featured or popularity
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, search, selectedCategory, maxPrice, sortBy, inStockOnly]);

  const handleAddToCart = (product: Product) => {
    if (product.stock === 0) return;
    onAddToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId(null);
    }, 1200);
  };

  const getCartQuantity = (productId: string) => {
    return cartItems.find((item) => item.product.id === productId)?.quantity || 0;
  };

  return (
    <div className="space-y-6" id="product_catalog_container">
      {/* Search & Filter Header bar */}
      <div className="bg-slate-50 border border-slate-100 p-4 md:p-6 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Text Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              id="product-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by brand, wood, finishing..."
              className="w-full text-sm pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">Sort By</span>
            <select
              id="product-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-white border border-slate-200 px-3 py-2.5 rounded-xl font-medium text-slate-700 focus:outline-none focus:border-slate-800 cursor-pointer"
            >
              <option value="featured">Featured Collection &nbsp;✦</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
            </select>
          </div>
        </div>

        <div className="h-px bg-slate-200/50 my-2" />

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Category Chips - Width 8 */}
          <div className="md:col-span-8 flex flex-wrap gap-1.5 items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-2">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                id={`cat-chip-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3.5 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-slate-900 border-slate-900 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Price Range Slider - Width 4 */}
          <div className="md:col-span-4 flex flex-col space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="uppercase tracking-wider text-slate-400">Max Budget:</span>
              <span className="text-slate-800 font-mono">${maxPrice} USD</span>
            </div>
            <input
              type="range"
              id="price-range-slider"
              min="20"
              max="350"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-slate-800 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
            />
          </div>
        </div>

        {/* Stock status checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <label className="relative flex items-center gap-2 text-xs font-semibold text-slate-500 cursor-pointer select-none">
            <input
              type="checkbox"
              id="in-stock-checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="mr-1 accent-slate-900 rounded border-slate-300 w-4 h-4 cursor-pointer"
            />
            Show In-Stock Units Only
          </label>
        </div>
      </div>

      {/* Catalog Grid View */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Available Goods ({filteredProducts.length})
          </h2>
          {(search || selectedCategory !== "All" || maxPrice < 350 || inStockOnly) && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
                setMaxPrice(350);
                setInStockOnly(false);
              }}
              className="text-xs font-medium text-slate-800 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 animate-spin duration-1000" />
              Reset Filters
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-2xl py-16 px-4 text-center max-w-md mx-auto space-y-3">
            <SlidersHorizontal className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="font-semibold text-slate-800">No objects match filters</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your price range limit, toggling availability constraints, or correcting search terms.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((p) => {
                const quantityInCart = getCartQuantity(p.id);
                const isOutOfStock = p.stock === 0;

                return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="group flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-slate-200 transition-all text-left"
                    id={`product-card-${p.id}`}
                  >
                    {/* Visual Preview */}
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                      {p.featured && (
                        <span className="absolute top-2.5 left-2.5 bg-slate-900 text-[10px] uppercase tracking-wider font-bold text-white px-2 py-0.5 rounded-full z-10">
                          Featured
                        </span>
                      )}
                      
                      {isOutOfStock ? (
                        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white font-semibold text-xs tracking-wider uppercase z-10 backdrop-blur-[1px]">
                          Out of Stock
                        </div>
                      ) : p.stock <= 5 ? (
                        <span className="absolute top-2.5 right-2.5 bg-amber-500 text-[10px] uppercase tracking-wider font-bold text-white px-2 py-0.5 rounded-md z-10 flex items-center gap-1 shadow">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Low Stock: {p.stock} Left
                        </span>
                      ) : null}

                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Meta Specifications */}
                    <div className="p-4.5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {p.category}
                          </span>
                          <span className="flex items-center text-xs font-semibold text-amber-500 gap-0.5">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            {p.rating}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-900 text-sm md:text-base leading-snug group-hover:text-slate-700 transition">
                          {p.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>
                      </div>

                      {/* Pricing Specs and Add actions */}
                      <div className="pt-2 flex items-center justify-between border-t border-slate-50">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Price</span>
                          <span className="text-base font-bold text-slate-900 font-mono">
                            ${p.price.toFixed(2)}
                          </span>
                        </div>

                        {addedProductId === p.id ? (
                          <button
                            disabled
                            className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 select-none"
                            id={`add-btn-success-${p.id}`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Added
                          </button>
                        ) : (
                          <button
                            id={`add-btn-${p.id}`}
                            onClick={() => handleAddToCart(p)}
                            disabled={isOutOfStock}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                              isOutOfStock
                                ? "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-slate-900 text-white hover:bg-slate-700"
                            }`}
                          >
                            <span>Cart</span>
                            {quantityInCart > 0 && (
                              <span className="bg-white/20 px-1.5 py-0.2 rounded-md font-mono text-[10px]">
                                {quantityInCart}
                              </span>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
