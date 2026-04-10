"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAllBookings,
  getBlockedDates,
  adminUpdateBooking,
  blockDate,
} from "@/actions/bookings";
import type { Booking, BlockedDate } from "@/lib/supabase";

type BookingSummary = Booking & { nights: number };

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"bookings" | "blocked">(
    "bookings"
  );
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);

  // Load data on mount
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bookingsRes, blockedRes] = await Promise.all([
        getAllBookings(),
        getBlockedDates(),
      ]);

      if (bookingsRes.success && bookingsRes.bookings) {
        const withNights = bookingsRes.bookings.map((b) => {
          // Extract YYYY-MM-DD format dates
          const startStr = b.start_date.split("T")[0];
          const endStr = b.end_date.split("T")[0];
          
          const [startYear, startMonth, startDay] = startStr.split("-").map(Number);
          const [endYear, endMonth, endDay] = endStr.split("-").map(Number);
          
          // Create UTC dates from components
          const start = new Date(Date.UTC(startYear, startMonth - 1, startDay));
          const end = new Date(Date.UTC(endYear, endMonth - 1, endDay));
          
          const nights = Math.ceil(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
          );
          return { ...b, nights };
        });
        setBookings(withNights);
      }

      if (blockedRes.success && blockedRes.blockedDates) {
        setBlockedDates(blockedRes.blockedDates);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setUpdateLoading(bookingId);
    try {
      const result = await adminUpdateBooking({
        bookingId,
        status: newStatus as "pending" | "confirmed" | "cancelled",
      });

      if (result.success) {
        // Update local state
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: newStatus as any } : b
          )
        );
      } else {
        alert(result.error || "Failed to update booking");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Failed to update booking");
    } finally {
      setUpdateLoading(null);
    }
  };

  const handleBlockDates = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const startDate = formData.get("blockStartDate") as string;
    const endDate = formData.get("blockEndDate") as string;
    const reason = (formData.get("blockReason") as string) || null;

    try {
      const result = await blockDate({
        start_date: startDate,
        end_date: endDate,
        reason,
      });

      if (result.success) {
        alert("Dates blocked successfully");
        (e.target as HTMLFormElement).reset();
        loadData(); // Refresh blocked dates
      } else {
        alert(result.error || "Failed to block dates");
      }
    } catch (error) {
      console.error("Error blocking dates:", error);
      alert("Failed to block dates");
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    // Extract just the YYYY-MM-DD portion
    const datePart = dateStr.split("T")[0];
    const [year, month, day] = datePart.split("-").map(Number);
    
    // Create UTC date from components
    const date = new Date(Date.UTC(year, month - 1, day));
    
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage bookings and availability</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "bookings"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("blocked")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "blocked"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Blocked Dates ({blockedDates.length})
          </button>
        </div>

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            {bookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600">No bookings yet</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {booking.name}
                        </h3>
                        <p className="text-gray-600">{booking.email}</p>
                        {booking.phone && (
                          <p className="text-gray-600">{booking.phone}</p>
                        )}

                        <div className="mt-4 space-y-2">
                          <p className="text-sm">
                            <span className="font-semibold">Check-in:</span>{" "}
                            {formatDate(booking.start_date)}
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">Check-out:</span>{" "}
                            {formatDate(booking.end_date)}
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">Duration:</span>{" "}
                            {booking.nights} nights
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">Guests:</span>{" "}
                            {booking.guests}
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">Submitted:</span>{" "}
                            {new Date(booking.created_at).toLocaleString()}
                          </p>
                        </div>

                        {booking.notes && (
                          <div className="mt-4">
                            <p className="text-sm font-semibold">
                              Special Requests:
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {booking.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right Column */}
                      <div className="flex flex-col justify-between">
                        {/* Status Badge */}
                        <div>
                          <p className="text-sm font-semibold mb-2">Status:</p>
                          <span
                            className={`inline-block px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusColor(booking.status)}`}
                          >
                            {booking.status}
                          </span>
                        </div>

                        {/* Status Update Buttons */}
                        <div className="mt-6 space-y-2">
                          <button
                            onClick={() =>
                              handleStatusUpdate(booking.id, "confirmed")
                            }
                            disabled={
                              updateLoading === booking.id ||
                              booking.status === "confirmed"
                            }
                            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 transition-colors text-sm font-medium"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(booking.id, "cancelled")
                            }
                            disabled={
                              updateLoading === booking.id ||
                              booking.status === "cancelled"
                            }
                            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300 transition-colors text-sm font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(booking.id, "pending")
                            }
                            disabled={
                              updateLoading === booking.id ||
                              booking.status === "pending"
                            }
                            className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-300 transition-colors text-sm font-medium"
                          >
                            Pending
                          </button>
                        </div>

                        {/* Booking ID */}
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs text-gray-500 break-all">
                            ID: {booking.id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Blocked Dates Tab */}
        {activeTab === "blocked" && (
          <div className="space-y-8">
            {/* Block Dates Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Add Blocked Dates
              </h2>
              <form onSubmit={handleBlockDates} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="blockStartDate"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="blockEndDate"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason (Optional)
                    </label>
                    <input
                      type="text"
                      name="blockReason"
                      placeholder="e.g., Maintenance"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Block Dates
                </button>
              </form>
            </div>

            {/* Current Blocked Dates */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Current Blocked Dates
              </h2>
              {blockedDates.length === 0 ? (
                <p className="text-gray-600">No dates are currently blocked</p>
              ) : (
                <div className="space-y-3">
                  {blockedDates.map((blocked, index) => (
                    <div
                      key={blocked.id || index}
                      className="border border-gray-200 rounded-md p-4"
                    >
                      <p className="font-medium">
                        {formatDate(blocked.date_start)} to{" "}
                        {formatDate(blocked.date_end)}
                      </p>
                      {blocked.reason && (
                        <p className="text-sm text-gray-600 mt-1">
                          {blocked.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
