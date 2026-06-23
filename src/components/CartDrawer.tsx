import React from "react";
import { CartItem } from "../types";
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface CartDrawerProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  onClose: () => void;
}

export default function CartDrawer({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onClose,
}: CartDrawerProps) {
  const subtotal = cartItems.reduce((acc, current) => acc + current.product.price * current.quantity, 0);
  const tax = subtotal * 0.08;
  const shippingFreeThreshold = 100;
  const shipping = subtotal >= shippingFreeThreshold || subtotal === 0 ? 0.00 : 9.99;
  const total = subtotal + tax + shipping;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer-overlay">
      {/* Drawer backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10" id="cart-drawer-container">
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="w-screen max-w-md bg-white flex flex-col shadow-2xl h-full border-l border-slate-100"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-slate-100 text-slate-800 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </span>
              <div>
                <h2 className="font-bold text-slate-900 text-sm md:text-base leading-none">Your Cart</h2>
                <span className="text-[10px] text-slate-500 font-medium">
                  {cartItems.length} product specification{cartItems.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              id="close-cart-btn"
              className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart item listing list */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                <div className="p-4 bg-slate-50 border border-slate-100 text-slate-300 rounded-full">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-md">Shopping cart empty</h3>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Explore our curated collection of workspace upgrades and ambient tools to fill your checkout space.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {cartItems.map((item) => {
                  const itemSubtotal = item.product.price * item.quantity;
                  return (
                    <div
                      key={item.product.id}
                      id={`cart-item-row-${item.product.id}`}
                      className="flex gap-3.5 p-3 border border-slate-100 rounded-xl hover:border-slate-200 hover:shadow-xs transition"
                    >
                      {/* Product Preview img */}
                      <div className="w-20 h-20 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Info & micro-actions */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="font-semibold text-xs text-slate-900 line-clamp-1 leading-snug">
                              {item.product.name}
                            </h4>
                            <button
                              id={`remove-item-${item.product.id}`}
                              onClick={() => onRemoveItem(item.product.id)}
                              className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                            {item.product.category}
                          </span>
                        </div>

                        {/* Adjust qty trigger */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                            <button
                              id={`dec-qty-${item.product.id}`}
                              onClick={() => {
                                if (item.quantity > 1) {
                                  onUpdateQuantity(item.product.id, item.quantity - 1);
                                } else {
                                  onRemoveItem(item.product.id);
                                }
                              }}
                              className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition rounded-l-lg cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center font-mono text-xs font-semibold text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              id={`inc-qty-${item.product.id}`}
                              onClick={() => {
                                if (item.quantity < item.product.stock) {
                                  onUpdateQuantity(item.product.id, item.quantity + 1);
                                }
                              }}
                              disabled={item.quantity >= item.product.stock}
                              className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 disabled:opacity-40 transition rounded-r-lg cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-mono text-xs font-bold text-slate-900">
                            ${itemSubtotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Checkout Totals Summary Panel */}
          {cartItems.length > 0 && (
            <div className="bg-slate-50 border-t border-slate-100 p-5 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Cart Subtotal</span>
                  <span className="font-mono font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Sales Tax (8% VAT)</span>
                  <span className="font-mono font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 items-center">
                  <span>Shipping & Handling</span>
                  <span className="font-mono font-semibold">
                    {shipping === 0 ? (
                      <span className="text-emerald-600 uppercase font-bold">Free</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <div className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 p-2 rounded-lg leading-relaxed">
                    Spend <strong>${(shippingFreeThreshold - subtotal).toFixed(2)}</strong> more to unlock <strong>Free Standard Shipping</strong>.
                  </div>
                )}
                <div className="h-px bg-slate-200" />
                <div className="flex justify-between items-center pt-1 font-bold text-slate-900 text-sm md:text-base">
                  <span>Secure Total Due</span>
                  <span className="font-mono">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Begin checkout button */}
              <button
                id="drawer-checkout-btn"
                onClick={onCheckout}
                className="w-full bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 px-4 py-3 rounded-xl font-semibold text-xs tracking-wider uppercase transition flex items-center justify-center gap-1.5 shadow-sm group cursor-pointer"
              >
                <span>Continue to Secure Checkout</span>
                <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
              </button>

              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  🔒 SSL Secure Checkout Authorized
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
