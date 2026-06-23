import React, { useState } from "react";
import { CartItem, BillingDetails } from "../types";
import { X, Lock, CheckCircle2, ChevronRight, CreditCard, Shield, Landmark, RefreshCw } from "lucide-react";

interface CheckoutModalProps {
  cartItems: CartItem[];
  onSubmitOrder: (billing: BillingDetails, cardBrand: string, last4: string) => Promise<any>;
  onClose: () => void;
}

export default function CheckoutModal({ cartItems, onSubmitOrder, onClose }: CheckoutModalProps) {
  const [step, setStep] = useState<"shipping" | "payment" | "processing" | "success">("shipping");
  const [billingDetails, setBillingDetails] = useState<BillingDetails>({
    name: "Wasil Philip",
    email: "wasilph12@gmail.com",
    address: "182 Baker Street",
    city: "London",
    postalCode: "NW1 5AL",
    country: "United Kingdom",
  });

  const [cardDetails, setCardDetails] = useState({
    number: "4242 •••• •••• 4242",
    expiry: "12/28",
    cvc: "382",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  const subtotal = cartItems.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingDetails.name || !billingDetails.email || !billingDetails.address || !billingDetails.city || !billingDetails.postalCode) {
      setErrorMessage("Please fulfill all specified shipping addresses.");
      return;
    }
    setErrorMessage("");
    setStep("payment");
  };

  const handleCardInputChange = (field: string, val: string) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleSecurePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc) {
      setErrorMessage("Please provide valid payment credentials.");
      return;
    }

    setErrorMessage("");
    setStep("processing");

    // Secure SSL payment gateway latency simulator
    try {
      // Decode card brand based on starting number
      let cardBrand = "Visa";
      if (cardDetails.number.startsWith("5") || cardDetails.number.startsWith("2")) {
        cardBrand = "Mastercard";
      } else if (cardDetails.number.startsWith("3")) {
        cardBrand = "American Express";
      }

      const rawLast4 = cardDetails.number.replace(/\s+/g, '').slice(-4) || "4242";
      const last4 = isNaN(Number(rawLast4)) ? "4242" : rawLast4;

      const orderResult = await onSubmitOrder(billingDetails, cardBrand, last4);
      
      setPlacedOrder(orderResult.order);
      setStep("success");
    } catch (err: any) {
      setErrorMessage(err.message || "SSL Gateway Payment Authorization timed out. Please retry.");
      setStep("payment");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" id="checkout-modal-overlay">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={step !== "processing" ? onClose : undefined} />

      {/* Main Container */}
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row z-10" id="checkout-modal-wrapper">
        
        {/* Left Side: Receipt Invoice overview (hidden on success step for space) */}
        {step !== "success" && (
          <div className="w-full md:w-5/12 bg-slate-50 p-6 md:border-r border-b md:border-b-0 border-slate-100 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-4">Invoice Specs</h3>
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex gap-2 text-xs">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-10 h-10 object-cover rounded-md border border-slate-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{item.product.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Qty: {item.quantity} &bull; ${item.product.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200/60 pt-4 mt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span className="font-mono text-slate-800 font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>V.A.T Tax (8%):</span>
                <span className="font-mono text-slate-800 font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Standard Delivery:</span>
                <span className="font-mono text-slate-800 font-medium">
                  {shipping === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="h-px bg-slate-200/60 my-1" />
              <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                <span>Secured Total:</span>
                <span className="font-mono">${total.toFixed(2)}</span>
              </div>

              <div className="bg-slate-200/50 p-2.5 rounded-lg flex items-center gap-2 mt-4 text-[10px] text-slate-600 border border-slate-200">
                <Shield className="w-4 h-4 text-slate-700 shrink-0" />
                <span>All transactions encrypted via client SSL secure gateway keys.</span>
              </div>
            </div>
          </div>
        )}

        {/* Right Side: Step Handler Forms */}
        <div className={`flex-1 p-6 ${step === "success" ? "w-full md:w-full" : ""}`}>
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-1.5 text-slate-800 font-bold text-sm">
              <Lock className="w-3.5 h-3.5 text-slate-900" />
              <span>Aura Payment Systems</span>
            </div>
            {step !== "processing" && step !== "success" && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl mb-4 leading-relaxed font-semibold">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* STEP 1: SHIPPING & BILLING ADDRESS */}
          {step === "shipping" && (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">1. Shipping & Bill Details</h4>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">Step 1 of 2</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-4 font-normal">Please specify where your e-commerce package should be delivered.</p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={billingDetails.name}
                      onChange={(e) => setBillingDetails(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 bg-white"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Email (Receive Automated Real-Time Updates)</label>
                    <input
                      type="email"
                      required
                      value={billingDetails.email}
                      onChange={(e) => setBillingDetails(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={billingDetails.address}
                    onChange={(e) => setBillingDetails(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={billingDetails.city}
                      onChange={(e) => setBillingDetails(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={billingDetails.postalCode}
                      onChange={(e) => setBillingDetails(prev => ({ ...prev, postalCode: e.target.value }))}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={billingDetails.country}
                    onChange={(e) => setBillingDetails(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 bg-white"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  id="checkout-shipping-btn"
                  className="w-full bg-slate-900 text-white hover:bg-slate-800 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Verify Billing & Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: CARD PAYMENTS INJECTION GATE */}
          {step === "payment" && (
            <form onSubmit={handleSecurePay} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">2. Secure Card Payment</h4>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">Step 2 of 2</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                  Powered by simulated payment gateway. Safely use mock card sequences (e.g. visa numbers 4242 4242...).
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4">
                {/* Simulated Stripe elements block */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-2">
                  <CreditCard className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-800">Card Payment Gateway (Encrypted)</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      value={cardDetails.number}
                      onChange={(e) => handleCardInputChange("number", e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Expiry Date</label>
                      <input
                        type="text"
                        required
                        value={cardDetails.expiry}
                        onChange={(e) => handleCardInputChange("expiry", e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Secure CVC (CVV)</label>
                      <input
                        type="text"
                        required
                        value={cardDetails.cvc}
                        onChange={(e) => handleCardInputChange("cvc", e.target.value)}
                        placeholder="123"
                        maxLength={4}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Secure network trust visualizer badges */}
                <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    AES-256 Bit SSL Session
                  </span>
                  <div className="flex gap-2">
                    <span className="font-bold tracking-wider text-slate-500">VISA</span>
                    <span className="font-bold tracking-wider text-slate-500">MC</span>
                    <span className="font-bold tracking-wider text-slate-500">AMEX</span>
                  </div>
                </div>
              </div>

              {/* Action layout */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  type="button"
                  id="checkout-back-btn"
                  onClick={() => setStep("shipping")}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition text-center cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  id="checkout-pay-btn"
                  className="col-span-2 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-300" />
                  <span>Pay Securely ${total.toFixed(2)}</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: LATENCY LOADING / SECURING PAYMENT SESSION */}
          {step === "processing" && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-slate-800 animate-spin" />
              <div>
                <h4 className="font-bold text-slate-800 text-sm md:text-base leading-none">Authorizing Secure Session...</h4>
                <p className="text-xs text-slate-500 mt-2 max-w-sm">
                  Encrypting payloads with secure gateway keys and registering the transaction in our automated ERP inventory database.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: TRANSACTION CONCLUDED WITH CLEAR RECEIPT INFO */}
          {step === "success" && placedOrder && (
            <div className="py-6 flex flex-col items-center text-center space-y-5" id="checkout-concluded-pane">
              <div className="p-3.5 bg-emerald-100 text-emerald-700 rounded-full">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base md:text-lg">Secure Payment Authorized!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Your order code is <strong className="font-mono text-slate-800">{placedOrder.id}</strong>. A customized invoice update email was automatically sent to <span className="text-slate-800 font-medium underline">{placedOrder.billingDetails.email}</span>.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 max-w-sm w-full text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Order ID:</span>
                  <span className="font-mono font-bold text-slate-800">{placedOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date Logged:</span>
                  <span className="font-mono font-medium text-slate-800">{new Date(placedOrder.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payer Spec:</span>
                  <span className="font-medium text-slate-800">{placedOrder.billingDetails.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Charged Amount:</span>
                  <span className="font-mono font-bold text-emerald-600">${placedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center bg-blue-50 border border-blue-100 text-[11px] text-blue-700 p-3 rounded-lg max-w-sm flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="leading-normal text-left">
                  Track the order status live on your <strong>Customer Dashboard</strong>. Use the status levers to advance delivery stages and see simulated updates.
                </span>
              </div>

              <button
                onClick={onClose}
                id="checkout-close-success-btn"
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
              >
                Return to Store
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
