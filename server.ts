import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Product, Order, OrderStatus, EmailLog, OrderItem } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json());

// Multi-attribute premium product collection
const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod_1",
    name: "Apex Mechanical Keyboard",
    description: "Hot-swappable tactile switches embedded in an oil-rubbed American walnut housing with silent keycaps.",
    price: 189.00,
    category: "Workspace",
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600&auto=format&fit=crop",
    stock: 14,
    rating: 4.8,
    featured: true
  },
  {
    id: "prod_2",
    name: "Horizon Merino Desk Mat",
    description: "Premium double-faced felt pad stitched with non-slip natural cork padding. Protects work surfaces with luxurious touch.",
    price: 45.00,
    category: "Workspace",
    image: "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?q=80&w=600&auto=format&fit=crop",
    stock: 42,
    rating: 4.6
  },
  {
    id: "prod_3",
    name: "Orbit Magnetic LED Task Lamp",
    description: "Spun-aluminum articulating light bar utilizing localized magnetic spherical joints and integrated touch dimmer.",
    price: 120.00,
    category: "Workspace",
    image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=600&auto=format&fit=crop",
    stock: 8,
    rating: 4.7,
    featured: true
  },
  {
    id: "prod_4",
    name: "Era Matte Charcoal Fountain Pen",
    description: "Elegant modern writer featuring titanium alloy feed components and an aerospace aluminum barrel with internal ink siphon.",
    price: 75.00,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=600&auto=format&fit=crop",
    stock: 25,
    rating: 4.5
  },
  {
    id: "prod_5",
    name: "Modus Full-Grain Leather Bi-Fold",
    description: "Ultra-slim front pocket accessory tanned with natural oak barks, featuring six precision card pockets and integrated RFID blocking.",
    price: 59.00,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=600&auto=format&fit=crop",
    stock: 19,
    rating: 4.4
  },
  {
    id: "prod_6",
    name: "Tensor Active Noise-Cancelling Headphones",
    description: "Hybrid acoustic chamber pairing high-density mahogany housings with 45mm beryllium drivers for pristine studio playbacks.",
    price: 299.00,
    category: "Audio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop",
    stock: 7,
    rating: 4.9,
    featured: true
  },
  {
    id: "prod_7",
    name: "Chronos Mesh Minimalist Watch",
    description: "Ultra-thin Swiss quartz movement set in a marine-grade matte nickel case with surgical steel Milanese bracelet wrap.",
    price: 210.00,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop",
    stock: 12,
    rating: 4.7
  },
  {
    id: "prod_8",
    name: "Lumen Fabric-Wrapped Smart Speaker",
    description: "Double-woven visual acoustic cloth hosting a custom multi-directional sub-woofer and localized ambient room cast.",
    price: 145.00,
    category: "Audio",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=600&auto=format&fit=crop",
    stock: 0, // Out of stock to test filter
    rating: 4.3
  }
];

// In-Memory Database
let products: Product[] = [...INITIAL_PRODUCTS];

// Seed initial orders to provide immediately loaded historical data for the personal dashboard
let orders: Order[] = [
  {
    id: "ORD-94819",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    status: "delivered",
    items: [
      {
        id: "item_seed_1",
        productId: "prod_4",
        name: "Era Matte Charcoal Fountain Pen",
        price: 75.00,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "item_seed_2",
        productId: "prod_2",
        name: "Horizon Merino Desk Mat",
        price: 45.00,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?q=80&w=600&auto=format&fit=crop"
      }
    ],
    subtotal: 165.00,
    tax: 13.20,
    shipping: 0.00, // free over $100
    total: 178.20,
    billingDetails: {
      name: "Wasil Philip",
      email: "wasilph12@gmail.com",
      address: "182 Baker Street",
      city: "London",
      postalCode: "NW1 5AL",
      country: "United Kingdom"
    },
    paymentMethod: {
      brand: "Visa",
      last4: "4242"
    }
  },
  {
    id: "ORD-38140",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: "processing",
    items: [
      {
        id: "item_seed_3",
        productId: "prod_1",
        name: "Apex Mechanical Keyboard",
        price: 189.00,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600&auto=format&fit=crop"
      }
    ],
    subtotal: 189.00,
    tax: 15.12,
    shipping: 0.00,
    total: 204.12,
    billingDetails: {
      name: "Wasil Philip",
      email: "wasilph12@gmail.com",
      address: "182 Baker Street",
      city: "London",
      postalCode: "NW1 5AL",
      country: "United Kingdom"
    },
    paymentMethod: {
      brand: "Mastercard",
      last4: "8821"
    }
  }
];

// Seed Email log to go along with the initial orders
let emailLogs: EmailLog[] = [
  {
    id: "EML-101",
    to: "wasilph12@gmail.com",
    subject: "Order Delivered: Confirmation #ORD-94819",
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    orderId: "ORD-94819",
    status: "delivered",
    bodyHtml: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #f0f0f0; border-radius: 12px; background: #ffffff; color: #1e293b;">
        <div style="text-align: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 24px; margin-bottom: 24px;">
          <div style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">AURA MINIMALIST LIVING</div>
          <h1 style="font-size: 24px; font-weight: 700; margin: 12px 0 4px 0; color: #0f172a;">Order Delivered!</h1>
          <p style="font-size: 14px; color: #64748b; margin: 0;">Your package has arrived at its final destination.</p>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">Hello Wasil Philip,</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">Great news! Your order <strong>#ORD-94819</strong> has been successfully delivered to your shipping address. We hope you love your new workspace additions.</p>
        
        <div style="background: #f8fafc; border-radius: 8px; padding: 20px; border: 1px solid #f1f5f9; margin-top: 24px;">
          <h3 style="font-size: 14px; text-transform: uppercase; margin-top: 0; color: #475569; letter-spacing: 0.05em;">DELIVERY SUMMARY</h3>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Address:</strong> 182 Baker Street, London, NW1 5AL, United Kingdom</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Carrier:</strong> Aurora Priority Courier</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Status:</strong> Delivered & Signed</p>
        </div>

        <div style="margin-top: 24px;">
          <h3 style="font-size: 13px; text-transform: uppercase; color: #64748b; margin-bottom: 12px;">Delivered Items</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 500; text-align: left;">
              <th style="padding: 8px 0;">Item</th>
              <th style="padding: 8px 0; text-align: center;">Qty</th>
              <th style="padding: 8px 0; text-align: right;">Price</th>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #0f172a;">Era Matte Charcoal Fountain Pen</td>
              <td style="padding: 10px 0; text-align: center; color: #334155;">1</td>
              <td style="padding: 10px 0; text-align: right; color: #0f172a;">$75.00</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #0f172a;">Horizon Merino Desk Mat</td>
              <td style="padding: 10px 0; text-align: center; color: #334155;">2</td>
              <td style="padding: 10px 0; text-align: right; color: #0f172a;">$90.00</td>
            </tr>
          </table>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 24px; text-align: center; font-size: 12px; color: #94a3b8;">
          <p style="margin: 0 0 4px 0;">Thank you for choosing Aura. If you have questions, reply directly to this mail.</p>
          <p style="margin: 0;">AURA Inc. &bull; London Office &bull; Support ID: #94819</p>
        </div>
      </div>
    `
  },
  {
    id: "EML-102",
    to: "wasilph12@gmail.com",
    subject: "Order Processing: Confirmation #ORD-38140",
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    orderId: "ORD-38140",
    status: "processing",
    bodyHtml: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #f0f0f0; border-radius: 12px; background: #ffffff; color: #1e293b;">
        <div style="text-align: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 24px; margin-bottom: 24px;">
          <div style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">AURA MINIMALIST LIVING</div>
          <h1 style="font-size: 24px; font-weight: 700; margin: 12px 0 4px 0; color: #0f172a;">Order is Processing</h1>
          <p style="font-size: 14px; color: #64748b; margin: 0;">We are preparing your handcrafted package.</p>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">Hello Wasil Philip,</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">Your payment has been successfully secured and your order <strong>#ORD-38140</strong> is currently undergoing quality inspection and custom packaging at our distribution center.</p>

        <div style="background: #f8fafc; border-radius: 8px; padding: 15px; border-left: 4px solid #3b82f6; margin-top: 24px;">
          <p style="margin: 0; font-size: 14px; color: #1d4ed8; font-weight: 600;">System Update:</p>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #334155;">You will receive an automated email verification with carrier details as soon as this leaves our facility.</p>
        </div>

        <div style="margin-top: 24px;">
          <h3 style="font-size: 13px; text-transform: uppercase; color: #64748b; margin-bottom: 11px;">Current Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 500; text-align: left;">
              <th style="padding: 8px 0;">Item</th>
              <th style="padding: 8px 0; text-align: center;">Qty</th>
              <th style="padding: 8px 0; text-align: right;">Price</th>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #0f172a;">Apex Mechanical Keyboard</td>
              <td style="padding: 10px 0; text-align: center; color: #334155;">1</td>
              <td style="padding: 10px 0; text-align: right; color: #0f172a;">$189.00</td>
            </tr>
          </table>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 24px; text-align: center; font-size: 12px; color: #94a3b8;">
          <p style="margin: 0 0 4px 0;">Thank you for choosing Aura. If you have questions, reply directly to this mail.</p>
          <p style="margin: 0;">AURA Inc. &bull; London Office &bull; Support ID: #38140</p>
        </div>
      </div>
    `
  }
];

// Helper to generate beautifully styled, rich HTML e-commerce emails based on status
function createOrderStatusEmailHtml(order: Order, targetStatus: OrderStatus): string {
  const brandName = "AURA DESIGN CO.";
  const customerName = order.billingDetails.name;
  const deliveryAddress = `${order.billingDetails.address}, ${order.billingDetails.city}, ${order.billingDetails.postalCode}, ${order.billingDetails.country}`;

  let title = "";
  let description = "";
  let customContent = "";

  switch (targetStatus) {
    case "pending":
      title = "Order Received & Secured";
      description = "Thank you for your request. Your secure payment has been verified.";
      customContent = `
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">Hello ${customerName},</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">We have successfully processed your secure transaction for payment ending in <strong>${order.paymentMethod.last4}</strong>. Your order is safely logged inside our ERP vault with tracking handle <strong>${order.id}</strong>.</p>
        
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; color: #166534; font-size: 14px; font-weight: 600;">🛡️ Payment Verified Securely</p>
          <p style="margin: 4px 0 0 0; color: #1e3a1e; font-size: 13px;">Authorized via Stripe-SSL simulator. No sensitive card credentials have been logged or retained on our systems.</p>
        </div>
      `;
      break;
    case "processing":
      title = "Order Now Processing";
      description = "Your handcrafted objects are being curated and validated.";
      customContent = `
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">Hello ${customerName},</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">Your order <strong>${order.id}</strong> has passed our warehouse system checks! Our design team is currently handcrafting your parcel, confirming raw finish qualities, and packing it safely within zero-waste recycled stock containers.</p>
      `;
      break;
    case "shipped":
      title = "Parcel Dispatched";
      description = "Your luxury goods have officially left our center.";
      customContent = `
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">Hello ${customerName},</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">The dispatch carrier has collected your parcel from our port. Your tracking token is enabled and is heading toward your address soon.</p>
        
        <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1d4ed8;">Shipping & Tracking Specs:</p>
          <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Service:</strong> Aura Express Ground Air</p>
          <p style="margin: 0; font-size: 13px; color: #334155;"><strong>Timeline Estimate:</strong> 2 to 3 Business Days</p>
        </div>
      `;
      break;
    case "delivered":
      title = "Delivered successfully";
      description = "Enjoy your new sustainable design enhancements.";
      customContent = `
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">Hello ${customerName},</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">Our automated routing records indicate your order <strong>${order.id}</strong> has been successfully placed at your door step!</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; font-size: 13px; font-weight: 500; color: #475569;">Delivery Location Details:</p>
          <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 600; color: #0f172a;">${deliveryAddress}</p>
        </div>
      `;
      break;
  }

  // Generate detailed table rows for goods list
  const invoiceRows = order.items.map(item => `
    <tr style="border-bottom: 1px solid #f1f5f9;">
      <td style="padding: 12px 0; color: #0f172a; font-weight: 500;">
        ${item.name}
        <div style="font-size: 12px; color: #64748b; font-weight: 400;">SKU: ${item.productId}-${item.quantity}</div>
      </td>
      <td style="padding: 12px 0; text-align: center; color: #334155;">${item.quantity}</td>
      <td style="padding: 12px 0; text-align: right; color: #0f172a;">$${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 20px auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; color: #1e293b; box-shadow: 0 4px 6px -1px rgb(0,0,0,0.05);">
      <!-- Header banner -->
      <div style="text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 24px;">
        <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 8px;">${brandName}</div>
        <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 8px 0; color: #0f172a; tracking: -0.02em;">${title}</h1>
        <p style="font-size: 14px; color: #64748b; margin: 0;">${description}</p>
      </div>

      <!-- Core notification text -->
      <div style="font-size: 15px; color: #334155; margin-bottom: 24px;">
        ${customContent}
      </div>

      <!-- Detailed Receipt Section -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 24px;">
        <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 0 0 16px 0;">Receipt Invoice #${order.id}</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600; text-align: left;">
              <th style="padding: 8px 0;">Item Specification</th>
              <th style="padding: 8px 0; text-align: center; width: 60px;">Qty</th>
              <th style="padding: 8px 0; text-align: right; width: 90px;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceRows}
          </tbody>
        </table>

        <!-- Totals calculation block -->
        <table style="width: 100%; margin-top: 16px; font-size: 14px; text-align: right; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Subtotal:</td>
            <td style="padding: 4px 0; font-weight: 500; color: #0f172a; width: 100px;">$${order.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">V.A.T / Sales Tax (8%):</td>
            <td style="padding: 4px 0; font-weight: 500; color: #0f172a;">$${order.tax.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Shipping Standard:</td>
            <td style="padding: 4px 0; font-weight: 500; color: #0f172a;">
              ${order.shipping === 0 ? '<span style="color: #166534; font-weight: 600;">FREE</span>' : `$${order.shipping.toFixed(2)}`}
            </td>
          </tr>
          <tr style="border-top: 2px solid #e2e8f0; font-weight: 700; font-size: 16px;">
            <td style="padding: 12px 0; color: #0f172a;">Charged Total:</td>
            <td style="padding: 12px 0; color: #0f172a;">$${order.total.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <!-- Footer & Signature -->
      <div style="border-top: 1px solid #f1f5f9; padding-top: 24px; margin-top: 32px; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.5;">
        <p style="margin: 0 0 6px 0;">This is an automated order update from the AURA ERP dispatch module.</p>
        <p style="margin: 0;">Authorized digitally by order gateway SECURE-PAY SSL &bull; London Office Warehouse 2</p>
      </div>
    </div>
  `;
}

// REST GET Products
app.get("/api/products", (req, res) => {
  res.json(products);
});

// REST GET Orders
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

// REST GET Emails
app.get("/api/emails", (req, res) => {
  res.json(emailLogs);
});

// REST POST Clean Emails
app.post("/api/emails/clear", (req, res) => {
  emailLogs = [];
  res.json({ success: true, message: "Email logs cleared" });
});

// REST POST Secure Order Processing via custom gateway simulation
app.post("/api/orders", (req, res) => {
  const { cartItems, billingDetails, paymentMethod } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: "Cannot process empty shopping cart" });
  }

  if (!billingDetails || !billingDetails.name || !billingDetails.email || !billingDetails.address) {
    return res.status(400).json({ error: "Billing & Shipping specifications are required" });
  }

  // 1. Double check / validate pricing and stock dynamically server side to keep transactions completely secure!
  let subtotal = 0;
  const orderItems: OrderItem[] = [];

  for (const item of cartItems) {
    const freshProduct = products.find(p => p.id === item.product.id);
    if (!freshProduct) {
      return res.status(404).json({ error: `Product ${item.product.name} no longer available` });
    }
    
    // Check stock issues
    if (freshProduct.stock < item.quantity) {
      return res.status(400).json({ error: `Insufficient stock for ${freshProduct.name}. Only ${freshProduct.stock} left in vault.` });
    }

    // Deduct stock
    freshProduct.stock -= item.quantity;
    
    const itemSubtotal = freshProduct.price * item.quantity;
    subtotal += itemSubtotal;

    orderItems.push({
      id: `item_${Math.random().toString(36).substr(2, 9)}`,
      productId: freshProduct.id,
      name: freshProduct.name,
      price: freshProduct.price,
      quantity: item.quantity,
      image: freshProduct.image
    });
  }

  // Simple automated shipping fee: free on total > $100, else $10 standard
  const shipping = subtotal >= 100 ? 0.00 : 9.99;
  const tax = parseFloat((subtotal * 0.08).toFixed(2));
  const total = parseFloat((subtotal + tax + shipping).toFixed(2));

  // Generate randomized Order Tracking ID
  const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

  const newOrder: Order = {
    id: orderId,
    createdAt: new Date().toISOString(),
    status: "pending", // Start cycle at Pending
    items: orderItems,
    subtotal,
    tax,
    shipping,
    total,
    billingDetails,
    paymentMethod: {
      brand: paymentMethod.brand || "Visa",
      last4: paymentMethod.last4 || "4242"
    }
  };

  // Prepend to order database
  orders.unshift(newOrder);

  // 2. TRIGGER AUTOMATED EMAIL NOTIFICATION SYSTEM FOR ORDER UPDATES
  // Formulate receipt email log
  const emailHtmlBody = createOrderStatusEmailHtml(newOrder, "pending");
  const newEmailLog: EmailLog = {
    id: `EML-${Math.floor(10000 + Math.random() * 90000)}`,
    to: billingDetails.email,
    subject: `Order Received: Confirmation #${orderId}`,
    sentAt: new Date().toISOString(),
    orderId: orderId,
    status: "pending",
    bodyHtml: emailHtmlBody
  };

  emailLogs.unshift(newEmailLog);

  res.status(201).json({
    success: true,
    order: newOrder,
    emailLog: newEmailLog
  });
});

// REST POST Update Order Status (Stimulate Admin/ERP automated status advance)
app.post("/api/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status: OrderStatus };

  const validStatuses: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid ERP order status state" });
  }

  const orderIndex = orders.findIndex(o => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: "Order not found" });
  }

  const targetedOrder = orders[orderIndex];
  targetedOrder.status = status;

  // Trigger automated notification update when the merchant/ERP triggers a status change
  let emailSubject = "";
  switch (status) {
    case "pending":
      emailSubject = `Order Received: Confirmation #${targetedOrder.id}`;
      break;
    case "processing":
      emailSubject = `Order Processing: Confirmation #${targetedOrder.id}`;
      break;
    case "shipped":
      emailSubject = `Order Shipped: Transit Update #${targetedOrder.id}`;
      break;
    case "delivered":
      emailSubject = `Order Delivered Summary #${targetedOrder.id}`;
      break;
  }

  const newEmailHtml = createOrderStatusEmailHtml(targetedOrder, status);
  const statusEmailLog: EmailLog = {
    id: `EML-${Math.floor(10000 + Math.random() * 90000)}`,
    to: targetedOrder.billingDetails.email,
    subject: emailSubject,
    sentAt: new Date().toISOString(),
    orderId: targetedOrder.id,
    status: status,
    bodyHtml: newEmailHtml
  };

  emailLogs.unshift(statusEmailLog);

  res.json({
    success: true,
    order: targetedOrder,
    emailLog: statusEmailLog
  });
});

// Start integration server
async function startServer() {
  // Vite developer configurations or static production server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Aura Server] Express Backend successfully initialized on port ${PORT}`);
  });
}

startServer();
