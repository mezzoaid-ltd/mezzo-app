import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

import { getAnalytics } from "@/actions/get-analytics";
import { DataCard } from "./_components/data-card";
import { Chart } from "./_components/chart";

const AnalyticsPage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data, totalRevenue, totalSales } = await getAnalytics(user.id);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
        <DataCard label="Total Revenue" value={totalRevenue} shouldFormat />
        <DataCard label="Total Sales" value={totalSales} shouldFormat={false} />
      </div>
      <Chart data={data} />
    </div>
  );
};

export default AnalyticsPage;
