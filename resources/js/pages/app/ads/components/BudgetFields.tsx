import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Calendar, Eye, Target } from 'lucide-react'
import { useEffect, useState } from 'react'

type Props = {
  dailyTargetViews: number
  durationDays: number
  startDate: string
  budgetCaps: { min: number; max: number }
  onDailyTargetViewsChange: (value: number) => void
  onDurationChange: (value: number) => void
  onStartDateChange: (value: string) => void
  pricingPerView: number
  layout?: 'default' | 'mobile' | 'desktop'
}

export function BudgetFields({
  dailyTargetViews,
  durationDays,
  startDate,
  budgetCaps,
  onDailyTargetViewsChange,
  onDurationChange,
  onStartDateChange,
  pricingPerView,
  layout = 'default',
}: Props) {
  const isMobile = layout === 'mobile'
  const [durationInput, setDurationInput] = useState(String(Math.max(1, durationDays || 0)))
  const [dailyReachInput, setDailyReachInput] = useState(String(Math.max(1, dailyTargetViews || 0)))

  const safeDailyViews = Math.max(1, dailyTargetViews || 0)
  const safeDurationDays = Math.max(1, durationDays || 0)
  const dailyBudget = safeDailyViews * pricingPerView
  const totalBudget = dailyBudget * safeDurationDays
  const totalReach = safeDailyViews * safeDurationDays
  const minDailyReach = Math.ceil(budgetCaps.min / Math.max(0.0001, pricingPerView * safeDurationDays))
  const maxDailyReach = Math.floor(budgetCaps.max / Math.max(0.0001, pricingPerView * safeDurationDays))

  useEffect(() => {
    setDurationInput(String(Math.max(1, durationDays || 0)))
  }, [durationDays])

  useEffect(() => {
    setDailyReachInput(String(Math.max(1, dailyTargetViews || 0)))
  }, [dailyTargetViews])

  const sanitizeNumberInput = (value: string) => value.replace(/[^\d]/g, '')

  const clampInt = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

  return (
    <div className={cn('space-y-6', isMobile && 'space-y-5')}>
      <div className={cn('grid gap-4', isMobile ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2')}>
        <div className="space-y-2">
          <Label className={cn(isMobile && 'text-xs uppercase tracking-[0.14em] text-white/65')}>
            Start Date
          </Label>
          <div className="relative">
            <Calendar className={cn('absolute left-3 top-3 h-4 w-4', isMobile ? 'text-white/50' : 'text-muted-foreground')} />
            <Input
              type="date"
              className={cn('pl-9', isMobile && 'h-11 rounded-xl border-white/10 bg-white/5 text-white')}
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className={cn(isMobile && 'text-xs uppercase tracking-[0.14em] text-white/65')}>
            Duration (Days)
          </Label>
          <Input
            type="number"
            min={1}
            max={365}
            value={durationInput}
            onChange={(e) => {
              const nextValue = sanitizeNumberInput(e.target.value)
              setDurationInput(nextValue)
              if (nextValue === '') return
              const parsed = Number.parseInt(nextValue, 10)
              if (Number.isNaN(parsed)) return
              onDurationChange(clampInt(parsed, 1, 365))
            }}
            onBlur={() => {
              const parsed = Number.parseInt(durationInput, 10)
              const normalized = Number.isNaN(parsed) ? Math.max(1, durationDays || 0) : clampInt(parsed, 1, 365)
              setDurationInput(String(normalized))
              onDurationChange(normalized)
            }}
            className={cn(isMobile && 'h-11 rounded-xl border-white/10 bg-white/5 text-white')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className={cn(isMobile && 'text-xs uppercase tracking-[0.14em] text-white/65')}>
          People to reach per day
        </Label>
        <div className="relative">
          <Eye className={cn('absolute left-3 top-3 h-4 w-4', isMobile ? 'text-white/50' : 'text-muted-foreground')} />
          <Input
            type="number"
            min={1}
            max={100000000}
            className={cn(
              'pl-9 text-lg font-semibold',
              isMobile && 'h-12 rounded-xl border-white/10 bg-white/5 text-white'
            )}
            value={dailyReachInput}
            onChange={(e) => {
              const nextValue = sanitizeNumberInput(e.target.value)
              setDailyReachInput(nextValue)
              if (nextValue === '') return
              const parsed = Number.parseInt(nextValue, 10)
              if (Number.isNaN(parsed)) return
              onDailyTargetViewsChange(clampInt(parsed, 1, 100000000))
            }}
            onBlur={() => {
              const parsed = Number.parseInt(dailyReachInput, 10)
              const normalized = Number.isNaN(parsed)
                ? Math.max(1, dailyTargetViews || 0)
                : clampInt(parsed, 1, 100000000)
              setDailyReachInput(String(normalized))
              onDailyTargetViewsChange(normalized)
            }}
          />
        </div>
        <p className={cn('text-sm', isMobile ? 'text-white/60' : 'text-muted-foreground')}>
          Choose how many people should see this ad each day. Estimated daily budget: NGN{' '}
          {dailyBudget.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          and total budget: NGN{' '}
          {totalBudget.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          over {safeDurationDays} day(s). Allowed total range NGN {budgetCaps.min.toLocaleString()} - NGN{' '}
          {budgetCaps.max.toLocaleString()}.
        </p>
        <p className={cn('text-xs', isMobile ? 'text-white/50' : 'text-muted-foreground')}>
          Suggested daily reach range for current duration: {Math.max(1, minDailyReach).toLocaleString()} -{' '}
          {Math.max(1, maxDailyReach).toLocaleString()} people per day.
        </p>
      </div>

      <div
        className={cn(
          'space-y-2 rounded-xl p-4',
          isMobile ? 'border border-white/10 bg-white/[0.04]' : 'bg-primary/5'
        )}
      >
        <h3 className={cn('flex items-center gap-2 font-semibold', isMobile && 'text-white')}>
          <Target className="h-4 w-4" />
          Estimated Results
        </h3>
        <div className={cn('grid gap-4 text-sm', isMobile ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2')}>
          <div>
            <p className={cn(isMobile ? 'text-white/60' : 'text-muted-foreground')}>Estimated Total Reach</p>
            <p className={cn('text-lg font-bold', isMobile && 'text-white')}>
              {totalReach.toLocaleString()} people
            </p>
          </div>
          <div>
            <p className={cn(isMobile ? 'text-white/60' : 'text-muted-foreground')}>Rate Per Person</p>
            <p className={cn('text-lg font-bold', isMobile && 'text-white')}>
              NGN {pricingPerView.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
