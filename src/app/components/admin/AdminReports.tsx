import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Download, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { getCurrentAdmin } from '../../../lib/supabase/auth';
import { exportOrdersToCSV, exportOrdersToExcel, generateCustomReport } from '../../../lib/services/reports';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { toast } from 'sonner';
import type { DateRange } from 'react-day-picker';

export const AdminReports: React.FC = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);

  // Calculate last week dates on mount
  const lastWeekDates = useMemo(() => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() - 1); // Yesterday
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6); // 7 days ago
    return { from: startDate, to: endDate };
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      const admin = await getCurrentAdmin();
      setIsAdmin(!!admin);
    };
    checkAdmin();
  }, []);

  // Set default to last week on mount
  useEffect(() => {
    if (!dateRange && lastWeekDates.from && lastWeekDates.to) {
      setDateRange({ from: lastWeekDates.from, to: lastWeekDates.to });
    }
  }, [dateRange, lastWeekDates]);

  // Load metrics when date range changes
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      loadMetrics();
    }
  }, [dateRange]);

  const loadMetrics = async () => {
    if (!dateRange?.from || !dateRange?.to) return;

    setIsLoadingMetrics(true);
    try {
      const reportData = await generateCustomReport(dateRange.from, dateRange.to);
      setMetrics(reportData);
    } catch (error) {
      console.error('Failed to load metrics:', error);
      toast.error('Failed to load report metrics');
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  const handleExportCSV = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Please select a date range');
      return;
    }

    setIsExporting(true);
    try {
      const blob = await exportOrdersToCSV(dateRange.from, dateRange.to);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_${format(dateRange.from, 'yyyy-MM-dd')}_to_${format(dateRange.to, 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Please select a date range');
      return;
    }

    setIsExporting(true);
    try {
      const blob = await exportOrdersToExcel(dateRange.from, dateRange.to);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_${format(dateRange.from, 'yyyy-MM-dd')}_to_${format(dateRange.to, 'yyyy-MM-dd')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Excel file exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export Excel file');
    } finally {
      setIsExporting(false);
    }
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => navigate('/admin/dashboard')}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-2xl">Reports</h1>
              <p className="text-sm text-gray-400">Export order data for selected date ranges</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Date Range Selector */}
        <Card className="p-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <label className="text-sm font-medium mb-2 block">Select Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'LLL dd, y')} -{' '}
                          {format(dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setDateRange(lastWeekDates)}
                variant="outline"
              >
                Last Week
              </Button>
              <Button
                onClick={handleExportCSV}
                disabled={!dateRange?.from || !dateRange?.to || isExporting}
                variant="outline"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export CSV
              </Button>
              <Button
                onClick={handleExportExcel}
                disabled={!dateRange?.from || !dateRange?.to || isExporting}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export Excel
              </Button>
            </div>
          </div>
        </Card>

        {/* Summary Metrics */}
        {isLoadingMetrics ? (
          <Card className="p-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          </Card>
        ) : metrics ? (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Summary for Selected Period</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Total Orders</div>
                <div className="text-2xl font-bold text-orange-600">{metrics.total_orders || 0}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Revenue</div>
                <div className="text-2xl font-bold text-green-600">
                  ৳{Number(metrics.total_revenue || 0).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Items Sold</div>
                <div className="text-2xl font-bold text-blue-600">{metrics.total_items_sold || 0}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Avg Order Value</div>
                <div className="text-2xl font-bold text-purple-600">
                  ৳{Number(metrics.avg_order_value || 0).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Pickup Orders</div>
                <div className="text-xl font-semibold">{metrics.pickup_orders || 0}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Delivery Orders</div>
                <div className="text-xl font-semibold">{metrics.delivery_orders || 0}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Cancelled Orders</div>
                <div className="text-xl font-semibold text-red-600">{metrics.cancelled_orders || 0}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Avg Prep Time</div>
                <div className="text-xl font-semibold">{Number(metrics.avg_prep_time || 0).toFixed(1)} min</div>
              </div>
            </div>
          </Card>
        ) : dateRange?.from && dateRange?.to ? (
          <Card className="p-6">
            <div className="text-center text-gray-500 py-8">
              No data available for the selected date range
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

