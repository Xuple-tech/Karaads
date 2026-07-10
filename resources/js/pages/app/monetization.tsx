import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, BarChart3, CreditCard, Heart, Loader2, MessageCircle, Eye } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MonetizationDashboard {
  status: {
    is_monetized: boolean;
    activated_at?: string | null;
    fee_amount_formatted: string;
    payment_provider?: string | null;
    payment_reference?: string | null;
    payment_status?: string | null;
  };
  summary: {
    views: number;
    likes: number;
    comments: number;
    posts_count: number;
    total_monetization_earned: number;
    total_monetization_earned_formatted: string;
  };
  daily: Array<{
    date: string;
    views: number;
    likes: number;
    comments: number;
    posts_count: number;
  }>;
  posts: Array<{
    post_id: string;
    content: string;
    created_at?: string | null;
    views: number;
    likes: number;
    comments: number;
  }>;
}

const formatCount = (value: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value || 0);

export default function MonetizationPage() {
  const [dashboard, setDashboard] = useState<MonetizationDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<"paystack" | "verify" | null>(null);
  const [searchParams] = useSearchParams();

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/users/monetization-dashboard", {
        params: { days: 30 },
      });
      setDashboard(response.data);
    } catch (error) {
      console.error("Failed to load monetization dashboard:", error);
      toast.error("Unable to load monetization dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (searchParams.get("monetization_payment") !== "paystack") return;

    const reference = searchParams.get("reference") || undefined;
    setPaying("verify");
    axiosInstance
      .post("/api/users/monetization-dashboard/paystack/verify", { reference })
      .then((response) => {
        setDashboard(response.data.data);
        toast.success(response.data.message || "Paystack payment checked");
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || "Unable to verify Paystack payment yet");
      })
      .finally(() => setPaying(null));
  }, [searchParams]);

  const payWithPaystack = async () => {
    setPaying("paystack");
    try {
      const response = await axiosInstance.post("/api/users/monetization-dashboard/paystack/init");
      const authorizationUrl = response.data?.authorization_url;
      if (authorizationUrl) {
        window.location.assign(authorizationUrl);
        return;
      }

      toast.error("Unable to open Paystack payment page");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to initialize Paystack payment");
      setPaying(null);
    }
  };

  const verifyPaystack = async () => {
    setPaying("verify");
    try {
      const response = await axiosInstance.post("/api/users/monetization-dashboard/paystack/verify", {
        reference: dashboard?.status.payment_reference,
      });
      setDashboard(response.data.data);
      toast.success(response.data.message || "Paystack payment checked");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to verify Paystack payment");
    } finally {
      setPaying(null);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 pb-28 pt-5 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Button asChild variant="ghost" className="rounded-full text-foreground hover:bg-muted">
            <Link to="/profile">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </Button>
          <Button onClick={loadDashboard} disabled={loading} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            Refresh
          </Button>
        </div>

        <section className="overflow-hidden rounded-[34px] border border-border bg-card p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-amber-100">
                Monetization
              </div>
              <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">
                Your creator earning dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                See total monetization earnings and only the views, likes, and comments from posts created after monetization is activated.
              </p>
            </div>

            <div className="rounded-[28px] border border-border bg-muted p-5 lg:min-w-[310px]">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Total made</p>
              <div className="mt-2 text-4xl font-black text-[#93f7b6]">
                {loading ? "..." : dashboard?.summary.total_monetization_earned_formatted ?? "N0"}
              </div>
              <p className="mt-2 text-xs font-semibold text-muted-foreground">
                Monetization balance added automatically from eligible post activity.
              </p>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="mt-8 flex items-center justify-center rounded-[28px] border border-border bg-muted/30 py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading dashboard...
          </div>
        ) : dashboard ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              {!dashboard.status.is_monetized ? (
                <div className="rounded-[28px] border border-amber-300/20 bg-amber-300/10 p-5">
                  <h2 className="text-xl font-black">Activate monetization</h2>
                  <p className="mt-2 text-sm leading-6 text-amber-50/78">
                    Pay {dashboard.status.fee_amount_formatted} with Paystack to start earning from new posts after your eligible posts reach 1,000 views.
                  </p>
                  <Button
                    onClick={payWithPaystack}
                    disabled={paying !== null}
                    variant="outline"
                    className="mt-4 rounded-full border-border bg-muted font-black text-foreground hover:bg-muted"
                  >
                    {paying === "paystack" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                    Pay with Paystack
                  </Button>
                  {dashboard.status.payment_provider === "paystack" &&
                  dashboard.status.payment_status === "pending" ? (
                    <Button
                      onClick={verifyPaystack}
                      disabled={paying !== null}
                      variant="ghost"
                      className="ml-2 mt-4 rounded-full text-foreground hover:bg-muted"
                    >
                      {paying === "verify" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Verify Paystack payment
                    </Button>
                  ) : null}
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Views", value: dashboard.summary.views, icon: Eye },
                  { label: "Likes", value: dashboard.summary.likes, icon: Heart },
                  { label: "Comments", value: dashboard.summary.comments, icon: MessageCircle },
                ].map((item) => (
                  <div key={item.label} className="rounded-[24px] border border-border bg-muted/50 p-5">
                    <item.icon className="h-5 w-5 text-[#08d2ff]" />
                    <div className="mt-4 text-3xl font-black">{formatCount(item.value)}</div>
                    <div className="mt-1 text-sm font-semibold text-muted-foreground">{item.label}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-[28px] border border-border bg-muted/30 p-5">
                <h2 className="text-xl font-black">Recent post activity</h2>
                <div className="mt-4 space-y-3">
                  {dashboard.posts.length > 0 ? dashboard.posts.map((post) => (
                    <div key={post.post_id} className="rounded-2xl border border-border bg-card p-4">
                      <p className="line-clamp-2 text-sm font-semibold text-foreground">{post.content || "Media post"}</p>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-muted-foreground">
                        <span>{formatCount(post.views)} views</span>
                        <span>{formatCount(post.likes)} likes</span>
                        <span>{formatCount(post.comments)} comments</span>
                      </div>
                    </div>
                  )) : (
                    <p className="rounded-2xl bg-card p-4 text-sm text-muted-foreground">No posts to track yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-border bg-muted/30 p-5">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#ffc55b]" />
                <h2 className="text-xl font-black">Daily report</h2>
              </div>
              <div className="mt-4 space-y-3">
                {dashboard.daily.slice(0, 10).map((day) => (
                  <div key={day.date} className="rounded-2xl border border-border bg-card p-4">
                    <div className="text-sm font-black">{day.date}</div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <span>{formatCount(day.views)} views</span>
                      <span>{formatCount(day.likes)} likes</span>
                      <span>{formatCount(day.comments)} comments</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
