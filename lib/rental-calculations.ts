/**
 * Business logic for rental calculations
 * 
 * Rules:
 * - Daily rental fee: GHS 100
 * - Pickup before 12pm: that day counts for charging
 * - Pickup after 12pm: charging starts next day
 * - Return before 12pm: that day is NOT charged
 * - Return after 12pm: that day IS charged
 * - Sundays are NOT counted/charged
 */

export interface RentalCalculation {
  daysUsed: number;
  totalCharge: number;
  refundAmount: number;
  additionalPayment: number;
}

const DAILY_RATE = 100;
const DEPOSIT_AMOUNT = 1000;

/**
 * Check if a date is Sunday
 */
function isSunday(date: Date): boolean {
  return date.getDay() === 0;
}

/**
 * Check if time is before 12pm (noon)
 */
function isBeforeNoon(date: Date): boolean {
  return date.getHours() < 12;
}

/**
 * Calculate billable days between pickup and return dates
 * excluding Sundays and following the time-based rules
 */
export function calculateBillableDays(
  pickupDateTime: Date,
  returnDateTime: Date
): number {
  let billableDays = 0;
  
  // Start from pickup date
  const currentDate = new Date(pickupDateTime);
  currentDate.setHours(0, 0, 0, 0);
  
  // Determine if pickup day should be counted
  const pickupDay = new Date(pickupDateTime);
  const shouldCountPickupDay = isBeforeNoon(pickupDay) && !isSunday(pickupDay);
  
  // Determine if return day should be counted
  const returnDay = new Date(returnDateTime);
  const shouldCountReturnDay = !isBeforeNoon(returnDay) && !isSunday(returnDay);
  
  // Get date components for comparison
  const pickupDateOnly = new Date(pickupDateTime);
  pickupDateOnly.setHours(0, 0, 0, 0);
  
  const returnDateOnly = new Date(returnDateTime);
  returnDateOnly.setHours(0, 0, 0, 0);
  
  // If same day rental
  if (pickupDateOnly.getTime() === returnDateOnly.getTime()) {
    // If picked up before noon and returned after noon, count the day
    if (shouldCountPickupDay && shouldCountReturnDay) {
      return 1;
    }
    return 0;
  }
  
  // Count pickup day if applicable
  if (shouldCountPickupDay) {
    billableDays++;
  }
  
  // Count all days between pickup and return (excluding Sundays)
  const nextDay = new Date(pickupDateOnly);
  nextDay.setDate(nextDay.getDate() + 1);
  
  while (nextDay < returnDateOnly) {
    if (!isSunday(nextDay)) {
      billableDays++;
    }
    nextDay.setDate(nextDay.getDate() + 1);
  }
  
  // Count return day if applicable
  if (shouldCountReturnDay && pickupDateOnly.getTime() !== returnDateOnly.getTime()) {
    billableDays++;
  }
  
  return billableDays;
}

/**
 * Calculate rental charges and refund
 */
export function calculateRentalCharges(
  pickupDateTime: Date,
  returnDateTime: Date,
  depositAmount: number = DEPOSIT_AMOUNT,
  dailyRate: number = DAILY_RATE
): RentalCalculation {
  const daysUsed = calculateBillableDays(pickupDateTime, returnDateTime);
  const totalCharge = daysUsed * dailyRate;
  
  let refundAmount = 0;
  let additionalPayment = 0;
  
  if (totalCharge <= depositAmount) {
    refundAmount = depositAmount - totalCharge;
  } else {
    additionalPayment = totalCharge - depositAmount;
  }
  
  return {
    daysUsed,
    totalCharge,
    refundAmount,
    additionalPayment,
  };
}

/**
 * Check if a rental is overdue (more than 10 days)
 */
export function isRentalOverdue(pickupDateTime: Date, currentDate: Date = new Date()): boolean {
  const daysUsed = calculateBillableDays(pickupDateTime, currentDate);
  return daysUsed > 10;
}

/**
 * Get days until overdue (returns negative if already overdue)
 */
export function getDaysUntilOverdue(pickupDateTime: Date, currentDate: Date = new Date()): number {
  const daysUsed = calculateBillableDays(pickupDateTime, currentDate);
  return 10 - daysUsed;
}

