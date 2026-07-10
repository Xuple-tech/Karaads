import axiosInstance from "@/lib/axios";
import { Loader2, MapPin } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const COUNTRY_OPTIONS = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "United Kingdom",
  "United States",
  "Canada",
  "Other",
] as const;

interface LocationUser {
  id?: string | number;
  country?: string | null;
  state?: string | null;
  location?: string | null;
}

interface LocationSetupDialogProps {
  open: boolean;
  user?: LocationUser | null;
  onDismiss: () => void;
  onSaved: (user: Record<string, unknown>) => void;
}

function getBrowserPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Auto location is not supported on this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 12_000,
      maximumAge: 5 * 60 * 1000,
    });
  });
}

function getAutoLocationErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? Number((error as { code?: unknown }).code)
      : null;

  if (code === 1) {
    return "Location permission was denied. Allow location access or enter it manually.";
  }

  if (code === 2) {
    return "Your browser could not find your location. Enter it manually.";
  }

  if (code === 3) {
    return "Location detection timed out. Try again or enter it manually.";
  }

  return error instanceof Error
    ? error.message
    : "Unable to detect your location. Enter it manually.";
}

function getAddressValue(address: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = address[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

async function reverseGeocodeLocation(latitude: number, longitude: number) {
  const fallbackLocation = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("zoom", "10");
  url.searchParams.set("addressdetails", "1");

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Unable to match your location name.");
  }

  const payload = await response.json();
  const address =
    payload && typeof payload.address === "object" && payload.address !== null
      ? (payload.address as Record<string, unknown>)
      : {};
  const country = getAddressValue(address, ["country"]);
  const state = getAddressValue(address, ["state", "region", "county"]);
  const city = getAddressValue(address, [
    "city",
    "town",
    "village",
    "municipality",
    "suburb",
    "neighbourhood",
  ]);
  const displayName =
    typeof payload?.display_name === "string" ? payload.display_name : "";
  const location =
    [city, state].filter(Boolean).join(", ") ||
    displayName.split(",").slice(0, 3).join(",").trim() ||
    fallbackLocation;

  return {
    country: country || "Other",
    state,
    location,
  };
}

export function LocationSetupDialog({
  open,
  user,
  onDismiss,
  onSaved,
}: LocationSetupDialogProps) {
  const [saving, setSaving] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (!open) return;

    setCountry((user?.country ?? "").trim());
    setState((user?.state ?? "").trim());
    setLocation((user?.location ?? "").trim());
    setError(null);
  }, [open, user?.country, user?.location, user?.state]);

  const autoSelectLocation = useCallback(async () => {
    setDetecting(true);
    setError(null);

    try {
      const position = await getBrowserPosition();
      const { latitude, longitude } = position.coords;
      const fallbackLocation = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      let detectedLocation = {
        country: "Other",
        state: "",
        location: fallbackLocation,
      };

      try {
        detectedLocation = await reverseGeocodeLocation(latitude, longitude);
      } catch {
        // Coordinates still give the user something useful to save if lookup is unavailable.
      }

      setCountry(detectedLocation.country || "Other");
      setState(detectedLocation.state);
      setLocation(detectedLocation.location || fallbackLocation);
      toast.success("Location detected. Review and save.");
    } catch (caughtError) {
      setError(getAutoLocationErrorMessage(caughtError));
    } finally {
      setDetecting(false);
    }
  }, []);

  const saveLocation = useCallback(async () => {
    const nextCountry = country.trim();
    const nextState = state.trim();
    const nextLocation = location.trim();

    if (!nextCountry || !nextLocation) {
      setError("Select your country and enter your location.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await axiosInstance.patch("/api/users/profile", {
        country: nextCountry,
        state: nextState || null,
        location: nextLocation,
      });
      const nextUser = response.data?.user?.data ?? response.data?.user;

      if (nextUser) {
        onSaved(nextUser);
      }

      toast.success("Location saved.");
    } catch (caughtError: any) {
      setError(caughtError?.response?.data?.message || "Unable to save location.");
    } finally {
      setSaving(false);
    }
  }, [country, location, onSaved, state]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#020617]/78 px-4 backdrop-blur-xl">
      <div className="w-full max-w-[420px] overflow-hidden rounded-[30px] border border-white/12 bg-[linear-gradient(145deg,#101827_0%,#07111f_58%,#062437_100%)] text-white shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
        <div className="relative p-5">
          <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-[#ffc55b]/16 blur-3xl" />
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <MapPin className="h-5 w-5" />
            </div>
            <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-[#8eeaff]">
              Location setup
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight">
              Select your country and location
            </h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-white/62">
              This helps Karaads show better local content, ads, and creator recommendations around you.
            </p>

            <button
              type="button"
              onClick={autoSelectLocation}
              disabled={detecting || saving}
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-muted px-4 text-sm font-black text-foreground transition hover:bg-muted/80 disabled:opacity-60"
            >
              {detecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              {detecting ? "Detecting location..." : "Use my current location"}
            </button>
            <p className="mt-2 text-center text-[11px] font-semibold text-white/42">
              Your browser will ask permission before Karaads detects your location.
            </p>

            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/50">
                  Country
                </span>
                <select
                  value={country}
                  onChange={(event) => {
                    setCountry(event.target.value);
                    setError(null);
                  }}
                  className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/8 px-4 text-sm font-bold text-white outline-none transition focus:border-primary/60"
                >
                  <option value="" className="bg-slate-950 text-white">
                    Select country
                  </option>
                  {country && !COUNTRY_OPTIONS.some((option) => option === country) ? (
                    <option value={country} className="bg-slate-950 text-white">
                      {country}
                    </option>
                  ) : null}
                  {COUNTRY_OPTIONS.map((option) => (
                    <option key={option} value={option} className="bg-slate-950 text-white">
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/50">
                  State / region
                </span>
                <input
                  value={state}
                  onChange={(event) => {
                    setState(event.target.value);
                    setError(null);
                  }}
                  placeholder="Example: Lagos"
                  className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/8 px-4 text-sm font-bold text-white outline-none transition placeholder:text-white/28 focus:border-primary/60"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/50">
                  City / location
                </span>
                <input
                  value={location}
                  onChange={(event) => {
                    setLocation(event.target.value);
                    setError(null);
                  }}
                  placeholder="Example: Ikeja, Lagos"
                  className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/8 px-4 text-sm font-bold text-white outline-none transition placeholder:text-white/28 focus:border-primary/60"
                />
              </label>
            </div>

            {error ? (
              <p className="mt-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">
                {error}
              </p>
            ) : null}

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
              <button
                type="button"
                onClick={saveLocation}
                disabled={saving || detecting}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-black text-[#07111f] transition hover:bg-[#dff9ff] disabled:opacity-60"
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save location
              </button>
              <button
                type="button"
                onClick={onDismiss}
                disabled={saving || detecting}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 px-5 text-sm font-black text-white/72 transition hover:bg-white/8 disabled:opacity-60"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
