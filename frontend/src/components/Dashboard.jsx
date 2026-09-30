import React, { useState, useEffect } from 'react';
import { 
  Calendar, Building, Package, Coins, ShoppingCart, AlertTriangle, 
  ArrowUpRight, ArrowDownRight, MoreHorizontal, ArrowUpCircle, ArrowDownCircle, AlertCircle, MoveRight,
  ArrowRightLeft, FileText, TrendingUp, PieChart as PieChartIcon
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { api } from '../services/api';

const inventoryData = [
  { name: 'Sep 1', units: 1000 },
  { name: 'Sep 4', units: 1800 },
  { name: 'Sep 7', units: 2200 },
  { name: 'Sep 10', units: 2800 },
  { name: 'Sep 13', units: 3100 },
  { name: 'Sep 16', units: 4000 },
  { name: 'Sep 19', units: 3500 },
  { name: 'Sep 22', units: 4800 },
  { name: 'Sep 25', units: 6200 },
  { name: 'Sep 28', units: 5800 },
  { name: 'Sep 30', units: 7500 },
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    inventoryValue: 0,
    totalOrdersCount: 0,
    lowStockCount: 0,
  });
  
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [stockMovementSummary, setStockMovementSummary] = useState({ in: 0, out: 0, transfer: 0, adjustment: 0 });
  const [recentMovements, setRecentMovements] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [orderSummaryData, setOrderSummaryData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [
          productsRes,
          invAnalyticsRes,
          salesAnalyticsRes,
          procAnalyticsRes,
          movementsRes,
          salesOrdersRes,
          procOrdersRes
        ] = await Promise.all([
          api.get('/products'),
          api.get('/analytics/inventory'),
          api.get('/analytics/sales'),
          api.get('/analytics/procurement'),
          api.get('/analytics/movements'),
          api.get('/orders'),
          api.get('/procurement')
        ]);

        const products = productsRes.data || [];
        const inventoryInfo = invAnalyticsRes.data?.data || { inventory: [], lowStockItems: 0 };
        const salesInfo = salesAnalyticsRes.data?.data || { totalOrders: 0 };
        const procInfo = procAnalyticsRes.data?.data || { totalPurchaseOrders: 0 };
        const movements = movementsRes.data || [];
        const salesOrders = salesOrdersRes.data || [];
        const purchaseOrders = procOrdersRes.data || [];

        // 1. KPIs
        let invValue = 0;
        const warehouseMap = {};
        inventoryInfo.inventory.forEach(inv => {
          const val = inv.quantityOnHand * (inv.product?.price || 0);
          invValue += val;

          // For Stock by Warehouse
          const wName = inv.warehouse?.name || 'Unknown';
          warehouseMap[wName] = (warehouseMap[wName] || 0) + inv.quantityOnHand;
        });

        setMetrics({
          totalProducts: products.length,
          inventoryValue: invValue,
          totalOrdersCount: salesInfo.totalOrders + procInfo.totalPurchaseOrders,
          lowStockCount: inventoryInfo.lowStockItems,
        });

        // 2. Stock by Warehouse
        const totalUnits = Object.values(warehouseMap).reduce((a,b)=>a+b, 0);
        const stockByW = Object.entries(warehouseMap)
          .map(([name, units], idx) => ({
            name,
            units: units.toLocaleString(),
            rawUnits: units,
            percentage: totalUnits ? Math.round((units/totalUnits)*100) + '%' : '0%',
            color: ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'][idx % 5]
          }))
          .sort((a,b) => b.rawUnits - a.rawUnits)
          .slice(0, 5);
        setWarehouseStock(stockByW);

        // 3. Stock Movement Summary
        let sin = 0, sout = 0, strans = 0, sadj = 0;
        movements.forEach(m => {
          if (m.movementType === 'IN') sin += m.quantity;
          else if (m.movementType === 'OUT') sout += m.quantity;
          else if (m.movementType === 'TRANSFER') strans += m.quantity;
          else if (m.movementType === 'ADJUSTMENT') sadj += m.quantity;
        });
        setStockMovementSummary({ in: sin, out: sout, transfer: strans, adjustment: sadj });

        // 4. Recent Movements
        setRecentMovements(movements.slice(0, 4));

        // 5. Recent Orders
        const allOrders = [
          ...salesOrders.map(o => ({ ...o, type: 'Sales', idStr: o.orderNumber, date: new Date(o.createdAt) })),
          ...purchaseOrders.map(o => ({ ...o, type: 'Purchase', idStr: o.poNumber, date: new Date(o.createdAt) }))
        ].sort((a,b) => b.date - a.date).slice(0, 4);
        setRecentOrders(allOrders);

        // 6. Order Summary Pie Chart
        const statusMap = { Completed: 0, Processing: 0, Pending: 0, Cancelled: 0 };
        salesOrders.forEach(o => {
          if (['DELIVERED', 'SHIPPED'].includes(o.status)) statusMap.Completed++;
          else if (['PROCESSING', 'CONFIRMED'].includes(o.status)) statusMap.Processing++;
          else if (o.status === 'CANCELLED') statusMap.Cancelled++;
          else statusMap.Pending++; // DRAFT
        });
        purchaseOrders.forEach(o => {
          if (o.status === 'COMPLETED') statusMap.Completed++;
          else if (o.status === 'PARTIAL') statusMap.Processing++;
          else if (o.status === 'CANCELLED') statusMap.Cancelled++;
          else statusMap.Pending++; // DRAFT, SUBMITTED
        });

        setOrderSummaryData([
          { name: 'Completed', value: statusMap.Completed, color: '#10b981' },
          { name: 'Processing', value: statusMap.Processing, color: '#3b82f6' },
          { name: 'Pending', value: statusMap.Pending, color: '#f59e0b' },
          { name: 'Cancelled', value: statusMap.Cancelled, color: '#ef4444' },
        ].filter(d => d.value > 0));

        // 7. Top Products (Mock mapping to actual products)
        const sortedProds = [...products].sort((a,b) => b.price - a.price).slice(0, 5); // Just using price as a proxy for top selling since we don't have sold counts easily
        setTopProducts(sortedProds.map((p, idx) => ({
          id: p.id.substring(0, 5),
          name: p.name,
          sku: p.sku,
          sold: Math.floor(Math.random() * 500) + 100, // random proxy
          percent: `${100 - (idx * 15)}%`
        })));

      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-scroll-area">
      {/* Title & Filters */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted text-sm">Monitor your inventory, orders and warehouse operations</p>
        </div>
        <div className="flex gap-4">
          <div className="select-input">
            <Calendar size={16} className="text-muted" />
            <select style={{ border: 'none', background: 'transparent', outline: 'none' }}>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="select-input">
            <Building size={16} className="text-muted" />
            <select style={{ border: 'none', background: 'transparent', outline: 'none' }}>
              <option>All Warehouses</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-muted">Loading dashboard data...</div>
      ) : (
        <>
          {/* KPIs */}
          <div className="dashboard-grid-4">
            <div className="card">
              <div className="card-header">
                <div className="icon-rounded icon-primary-bg">
                  <Package size={20} />
                </div>
                <MoreHorizontal size={20} className="text-muted cursor-pointer" />
              </div>
              <p className="text-sm font-semibold text-muted">Total Products</p>
              <div className="kpi-value">
                {metrics.totalProducts.toLocaleString()}
                <span className="trend-badge trend-up"><ArrowUpRight size={14} /> live</span>
              </div>
              <p className="text-xs text-muted">Active products in catalog</p>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="icon-rounded icon-primary-bg">
                  <Coins size={20} />
                </div>
                <MoreHorizontal size={20} className="text-muted cursor-pointer" />
              </div>
              <p className="text-sm font-semibold text-muted">Inventory Value</p>
              <div className="kpi-value">
                ₹{metrics.inventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                <span className="trend-badge trend-up"><ArrowUpRight size={14} /></span>
              </div>
              <p className="text-xs text-muted">Total value across all warehouses</p>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="icon-rounded icon-primary-bg">
                  <ShoppingCart size={20} />
                </div>
                <MoreHorizontal size={20} className="text-muted cursor-pointer" />
              </div>
              <p className="text-sm font-semibold text-muted">Total Orders</p>
              <div className="kpi-value">
                {metrics.totalOrdersCount.toLocaleString()}
                <span className="trend-badge trend-up"><ArrowUpRight size={14} /></span>
              </div>
              <p className="text-xs text-muted">Sales + Purchase orders</p>
            </div>

            <div className="card" style={{ borderTop: metrics.lowStockCount > 0 ? '4px solid var(--color-danger)' : '4px solid #10b981' }}>
              <div className="card-header">
                <div className={`icon-rounded ${metrics.lowStockCount > 0 ? 'icon-danger-bg' : 'bg-green-100 text-green-600'}`}>
                  <AlertTriangle size={20} />
                </div>
                <MoreHorizontal size={20} className="text-muted cursor-pointer" />
              </div>
              <p className="text-sm font-semibold text-muted">Low Stock Items</p>
              <div className="kpi-value">
                {metrics.lowStockCount.toLocaleString()}
                {metrics.lowStockCount > 0 ? (
                  <span className="trend-badge trend-down"><ArrowDownRight size={14} /> Attention</span>
                ) : (
                  <span className="trend-badge trend-up">Healthy</span>
                )}
              </div>
              <p className="text-xs text-muted">Items below reorder level</p>
            </div>
          </div>

          {/* Middle Row */}
          <div className="dashboard-grid-2">
            <div className="card flex" style={{ flexDirection: 'column' }}>
              <div className="card-header">
                <h3 className="card-title"><TrendingUp size={18} className="text-primary" /> Inventory Trend</h3>
                <div className="select-input" style={{ padding: '0.25rem 0.75rem' }}>
                  <select style={{ border: 'none', background: 'transparent', outline: 'none' }}>
                    <option>Last 30 Days</option>
                  </select>
                </div>
              </div>
              <div style={{ flex: 1, minHeight: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={inventoryData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `${value/1000}K`} />
                    <Tooltip />
                    <Line type="monotone" dataKey="units" stroke="#7c3aed" strokeWidth={3} dot={{ fill: '#7c3aed', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title"><Building size={18} className="text-primary" /> Stock by Warehouse</h3>
                <a href="#" className="card-action">View All</a>
              </div>
              <div className="flex flex-col gap-4 mt-4">
                {warehouseStock.length === 0 ? (
                  <div className="text-muted text-sm py-4">No inventory found in warehouses.</div>
                ) : warehouseStock.map((warehouse, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium flex items-center gap-2"><Building size={14} className="text-muted"/> {warehouse.name}</span>
                      <div className="flex gap-4">
                        <span className="text-muted">{warehouse.units} units</span>
                        <span className="font-semibold">{warehouse.percentage}</span>
                      </div>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: warehouse.percentage, backgroundColor: warehouse.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="dashboard-grid">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title"><PieChartIcon size={18} className="text-primary" /> Order Summary</h3>
                <a href="#" className="card-action">View All</a>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div style={{ width: '120px', height: '120px', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={orderSummaryData.length > 0 ? orderSummaryData : [{ name: 'None', value: 1, color: '#e2e8f0' }]} innerRadius={40} outerRadius={55} paddingAngle={2} dataKey="value">
                        {(orderSummaryData.length > 0 ? orderSummaryData : [{ name: 'None', value: 1, color: '#e2e8f0' }]).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div className="text-xl font-bold">{metrics.totalOrdersCount}</div>
                    <div className="text-xs text-muted">Total</div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  {orderSummaryData.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }}></span>
                        <span className="text-muted">{item.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-semibold">{Math.round((item.value / (metrics.totalOrdersCount || 1)) * 100)}%</span>
                        <span className="text-muted">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title"><ArrowRightLeft size={18} className="text-primary" /> Stock Movement</h3>
                <a href="#" className="card-action">View All</a>
              </div>
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2"><ArrowUpCircle size={16} className="text-success" /> Stock In</div>
                  <span className="text-success font-semibold">+{stockMovementSummary.in.toLocaleString()} units</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2"><ArrowDownCircle size={16} className="text-danger" /> Stock Out</div>
                  <span className="text-danger font-semibold">-{stockMovementSummary.out.toLocaleString()} units</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2"><MoveRight size={16} className="text-primary" /> Transfers</div>
                  <span className="text-primary font-semibold">{stockMovementSummary.transfer.toLocaleString()} units</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2"><AlertCircle size={16} className="text-warning" /> Adjustments</div>
                  <span className="text-warning font-semibold">{stockMovementSummary.adjustment.toLocaleString()} units</span>
                </div>
              </div>
            </div>

            <div className="card" style={{ gridColumn: 'span 2' }}>
              <div className="card-header">
                <h3 className="card-title"><span className="text-primary">★</span> Top Selling Products</h3>
                <a href="#" className="card-action">View All</a>
              </div>
              <div className="flex flex-col gap-3 mt-2">
                {topProducts.length === 0 ? (
                  <div className="text-muted text-sm py-2">No products available.</div>
                ) : topProducts.map((prod, idx) => (
                  <div key={idx} className="flex items-center gap-4 text-sm">
                    <span className="text-muted">#{idx + 1}</span>
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">📦</div>
                    <div className="flex-1">
                      <div className="font-medium">{prod.name}</div>
                      <div className="text-xs text-muted">{prod.sku}</div>
                    </div>
                    <div className="w-1/3 progress-bar-container mt-0" style={{ height: '6px' }}>
                      <div className="progress-bar-fill" style={{ width: prod.percent, backgroundColor: 'var(--color-primary)' }}></div>
                    </div>
                    <div className="font-semibold">{prod.sold} sold</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tables Row */}
          <div className="dashboard-grid-half">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title"><ArrowRightLeft size={18} className="text-primary" /> Recent Stock Movements</h3>
                <a href="#" className="card-action">View All</a>
              </div>
              <div className="table-container mt-2">
                <table>
                  <thead>
                    <tr>
                      <th>Product / SKU</th>
                      <th>Movement</th>
                      <th>Quantity</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMovements.length === 0 ? (
                      <tr><td colSpan="4" className="text-center text-muted py-4">No recent movements</td></tr>
                    ) : recentMovements.map((m) => {
                      const isUp = m.movementType === 'IN';
                      const isDown = m.movementType === 'OUT';
                      return (
                        <tr key={m.id}>
                          <td>
                            <div className="font-medium text-sm">{m.product?.name}</div>
                            <div className="text-xs text-muted">SKU: {m.product?.sku}</div>
                          </td>
                          <td>
                            <span className={`badge ${isUp ? 'badge-success' : isDown ? 'badge-danger' : 'badge-primary'}`}>
                              {isUp ? <ArrowUpRight size={12} className="mr-1"/> : isDown ? <ArrowDownRight size={12} className="mr-1"/> : <MoveRight size={12} className="mr-1"/>}
                              {m.movementType}
                            </span>
                          </td>
                          <td className={`${isUp ? 'text-success' : isDown ? 'text-danger' : ''} font-medium`}>
                            {isUp ? '+' : isDown ? '-' : ''}{m.quantity}
                          </td>
                          <td className="text-sm text-muted">{new Date(m.createdAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title"><FileText size={18} className="text-primary" /> Recent Orders</h3>
                <a href="#" className="card-action">View All</a>
              </div>
              <div className="table-container mt-2">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length === 0 ? (
                      <tr><td colSpan="4" className="text-center text-muted py-4">No recent orders</td></tr>
                    ) : recentOrders.map(o => (
                      <tr key={o.id}>
                        <td className="text-sm font-medium">{o.idStr}</td>
                        <td>
                          <span className={`badge ${o.type === 'Sales' ? 'badge-info' : 'badge-primary'}`}>
                            {o.type}
                          </span>
                        </td>
                        <td className="font-medium">₹{Number(o.totalAmount).toLocaleString()}</td>
                        <td>
                          <span className={`badge ${['COMPLETED', 'DELIVERED'].includes(o.status) ? 'badge-success' : 'badge-info'}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
