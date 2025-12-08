export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground mt-2">Welcome to the admin administration area.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8">
        <div className="p-6 bg-card rounded-xl border shadow-sm">
          <h3 className="font-semibold text-sm text-muted-foreground">Total Revenue</h3>
          <div className="text-2xl font-bold mt-2">$0.00</div>
        </div>
        <div className="p-6 bg-card rounded-xl border shadow-sm">
          <h3 className="font-semibold text-sm text-muted-foreground">Orders</h3>
          <div className="text-2xl font-bold mt-2">0</div>
        </div>
        <div className="p-6 bg-card rounded-xl border shadow-sm">
          <h3 className="font-semibold text-sm text-muted-foreground">Products</h3>
          <div className="text-2xl font-bold mt-2">--</div>
        </div>
        <div className="p-6 bg-card rounded-xl border shadow-sm">
          <h3 className="font-semibold text-sm text-muted-foreground">Active Users</h3>
          <div className="text-2xl font-bold mt-2">--</div>
        </div>
      </div>
    </div>
  );
}
