import React, { useState } from "react";
import { Order, OrderStatus } from "../types";
import { 
  Package, Calendar, Truck, CheckCircle2, ChevronRight, ShoppingBag, 
  MapPin, Clock, ArrowRight, ClipboardList, RefreshCcw, Activity, ShieldAlert
} from "lucide-react";
import { motion } from "motion/react";

interface UserDashboardProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  onSelectOrderEmailHook?: (orderId: string, status: OrderStatus) => void;
}

export default function UserDashboard({ orders, onUpdateOrderStatus, onSelectOrderEmailHook }: UserDashboardProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    orders.length > 0 ? orders[0].id : null
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    setIsUpdating(true);
    try {
      await onUpdateOrderStatus(orderId, status);
      if (onSelectOrderEmailHook) {
        onSelectOrderEmailHook(orderId, status);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <span className="bg-slate-100 text-slate-800 border border-slate-200 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Secured</span>;
      case "processing":
        return <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">In Assembly</span>;
      case "shipped":
        return <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Dispatched</span>;
      case "delivered":
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Delivered</span>;
    }
  };

  const getTimelineStepStyle = (currentStatus: OrderStatus, stepStatus: OrderStatus, stepOrder: number) => {
    const statusSequence: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];
    const currentIndex = statusSequence.indexOf(currentStatus);
    const targetIndex = statusSequence.indexOf(stepStatus);

    if (currentIndex >= targetIndex) {
      return {
        dotClass: "bg-slate-900 text-white ring-4 ring-slate-100",
        textClass: "text-slate-900 font-bold",
        lineClass: "bg-slate-900",
        completed: true
      };
    } else {
      return {
        dotClass: "bg-slate-100 border-2 border-slate-200 text-slate-400",
        textClass: "text-slate-400 font-semibold",
        lineClass: "bg-slate-200",
        completed: false
      };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard_panel_container">
      {/* LEFT COLUMN: Past Order Selections - Width 5 */}
      <div className="lg:col-span-4 space-y-4">
        <div>
          <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">Your Tracking Hub</h3>
          <p className="text-[11px] text-slate-500 font-medium leading-none">Select an e-commerce receipt index to track live status.</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center space-y-2">
            <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="font-semibold text-slate-700 text-xs">No orders logged</h4>
            <p className="text-[10px] text-slate-400">Checkout products to start tracking order status.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {orders.map((o) => {
              const isSelected = o.id === selectedOrderId;
              const dateStr = new Date(o.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "2-digit"
              });
              return (
                <button
                  key={o.id}
                  id={`order-select-card-${o.id}`}
                  onClick={() => setSelectedOrderId(o.id)}
                  className={`w-full text-left p-3.5 border rounded-2xl transition flex items-center justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10"
                      : "bg-white border-slate-100 text-slate-800 hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Package className={`w-3.5 h-3.5 ${isSelected ? "text-slate-200" : "text-slate-500"}`} />
                      <span className="font-mono text-xs font-bold">{o.id}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] opacity-80">
                      <Calendar className="w-3 h-3" />
                      <span>{dateStr}</span>
                      <span>&bull;</span>
                      <span className="font-mono font-medium">${o.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Hide state text on too small labels */}
                    {getStatusBadge(o.status)}
                    <ChevronRight className={`w-4 h-4 opacity-40 shrink-0 ${isSelected ? "text-white" : "text-slate-800"}`} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Order Timeline details Tracker & ERP simulated system - Width 8 */}
      <div className="lg:col-span-8">
        {selectedOrder ? (
          <div className="space-y-6" id={`order-tracker-pane-${selectedOrder.id}`}>
            {/* Visual Header */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono text-base md:text-lg font-bold text-slate-900">{selectedOrder.id}</h3>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString()} &bull; Authorized Encrypted SSL
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Total Charged</span>
                  <span className="font-mono text-lg md:text-xl font-black text-slate-900">${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Progress Tracker Timeline */}
              <div className="py-2.5">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2 mb-6">Delivery Timeline Progression</h4>
                
                <div className="grid grid-cols-4 relative" id="timeline-bar-wrapper">
                  {/* Backdrop track bar */}
                  <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-100 z-0" />
                  
                  {/* Process indicators stages */}
                  {[
                    { status: "pending", name: "Secured", desc: "Order Logged" },
                    { status: "processing", name: "Assembly", desc: "QC & Craft" },
                    { status: "shipped", name: "Dispatched", desc: "In Transit" },
                    { status: "delivered", name: "Arrived", desc: "Package Left" }
                  ].map((step, idx) => {
                    const style = getTimelineStepStyle(selectedOrder.status, step.status as OrderStatus, idx);
                    return (
                      <div key={step.status} className="flex flex-col items-center text-center relative z-10">
                        {/* Dot visual marker */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all duration-300 ${style.dotClass}`}>
                          {style.completed ? (
                            <CheckCircle2 className="w-4.5 h-4.5" />
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <span className={`text-[11px] mt-2.5 tracking-tight ${style.textClass} block`}>{step.name}</span>
                        <span className="text-[9px] text-slate-400 leading-none hidden sm:block mt-0.5">{step.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* AUTOMATED ERP EMAIL SIMULATOR TRIGGERS (Merchant System) */}
            <div className="bg-slate-50 border-2 border-slate-900 rounded-3xl p-5 md:p-6 space-y-4">
              <div className="flex items-center gap-2 text-slate-900">
                <Activity className="w-4.5 h-4.5 shrink-0" />
                <h4 className="font-bold text-xs uppercase tracking-wider">ERP Automated Notification Test Controller</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed md:max-w-xl">
                Simulate warehouse backend interactions or shipping network updates. Advancing the status below triggers the 
                <strong> automated email system</strong> to send gorgeous HTML notification receipts matching the new state.
              </p>

              {/* Status advancement buttons panel */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  id="erp-status-pending"
                  onClick={() => handleUpdateStatus(selectedOrder.id, "pending")}
                  disabled={isUpdating || selectedOrder.status === "pending"}
                  className="bg-white hover:bg-slate-100 disabled:bg-slate-100 text-slate-800 disabled:text-slate-400 text-xs font-semibold py-2.5 px-3 border border-slate-200 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed text-center"
                >
                  <RefreshCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Log Secured</span>
                </button>

                <button
                  id="erp-status-processing"
                  onClick={() => handleUpdateStatus(selectedOrder.id, "processing")}
                  disabled={isUpdating || selectedOrder.status === "processing"}
                  className="bg-white hover:bg-slate-100 disabled:bg-slate-100 text-slate-800 disabled:text-slate-400 text-xs font-semibold py-2.5 px-3 border border-slate-200 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed text-center"
                >
                  <ClipboardList className="w-3.5 h-3.5 text-blue-500" />
                  <span>Start Assembly</span>
                </button>

                <button
                  id="erp-status-shipped"
                  onClick={() => handleUpdateStatus(selectedOrder.id, "shipped")}
                  disabled={isUpdating || selectedOrder.status === "shipped"}
                  className="bg-white hover:bg-slate-100 disabled:bg-slate-100 text-slate-800 disabled:text-slate-400 text-xs font-semibold py-2.5 px-3 border border-slate-200 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed text-center"
                >
                  <Truck className="w-3.5 h-3.5 text-amber-500" />
                  <span>Dispatch Freight</span>
                </button>

                <button
                  id="erp-status-delivered"
                  onClick={() => handleUpdateStatus(selectedOrder.id, "delivered")}
                  disabled={isUpdating || selectedOrder.status === "delivered"}
                  className="bg-white hover:bg-slate-100 disabled:bg-slate-100 text-slate-800 disabled:text-slate-400 text-xs font-semibold py-2.5 px-3 border border-slate-200 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed text-center"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Arrive Package</span>
                </button>
              </div>
            </div>

            {/* Bottom detailed columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Box 1: Elements summary */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4 text-left">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Order Manifest</h4>
                <div className="space-y-3.5">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex gap-2.5 items-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded-lg border border-slate-100 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs text-slate-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Quantity {item.quantity} &bull; ${item.price.toFixed(2)}</p>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-800">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 2: Delivery coordinates & Payment specs */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4 text-left">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Dispatch Specifications</h4>
                
                <div className="space-y-3.5 text-xs text-slate-700">
                  <div className="flex gap-2.5">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">Recipients Address:</p>
                      <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5">
                        {selectedOrder.billingDetails.name}<br />
                        {selectedOrder.billingDetails.address}<br />
                        {selectedOrder.billingDetails.city}, {selectedOrder.billingDetails.postalCode}<br />
                        {selectedOrder.billingDetails.country}
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <div className="flex gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">Secure Billing Source:</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Simulated card brand: <strong>{selectedOrder.paymentMethod.brand}</strong> (Ending in **** {selectedOrder.paymentMethod.last4})
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-3xl py-24 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-semibold text-slate-800">No tracked items selected</h4>
            <p className="text-xs text-slate-500">Log order items from checkout to start. Historical records will automatically load.</p>
          </div>
        )}
      </div>
    </div>
  );
}
