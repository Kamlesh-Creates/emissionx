import { NextRequest, NextResponse } from 'next/server';

interface CarbonFormData {
  transport: {
    carKm: number;
    busKm: number;
    flightsHours: number;
  };
  electricity: {
    unitsPerMonth: number;
  };
  lpg: {
    cylindersPerMonth: number;
  };
  diet: 'veg' | 'non-veg';
  purchases: {
    monthlySpend: number;
  };
}

interface CarbonResult {
  totalEmissions: number;
  breakdown: {
    transport: number;
    electricity: number;
    lpg: number;
    diet: number;
    purchases: number;
  };
  message: string;
}

// Carbon emission factors (kg CO2 per unit)
const EMISSION_FACTORS = {
  // Transport (kg CO2 per km)
  car: 0.192, // Average car emission factor
  bus: 0.089, // Average bus emission factor
  flight: 0.255, // kg CO2 per km (average flight)
  
  // Electricity (kg CO2 per kWh) - India's grid average
  electricity: 0.82,
  
  // LPG (kg CO2 per cylinder) - 14.2kg cylinder
  lpg: 21.1,
  
  // Diet (kg CO2 per month)
  vegetarian: 15,
  nonVegetarian: 25,
  
  // Purchases (kg CO2 per ₹1000 spent)
  purchases: 0.5,
};

export async function POST(request: NextRequest) {
  try {
    const formData: CarbonFormData = await request.json();

    // Calculate transport emissions
    const carEmissions = formData.transport.carKm * 30 * EMISSION_FACTORS.car; // 30 days
    const busEmissions = formData.transport.busKm * 30 * EMISSION_FACTORS.bus; // 30 days
    const flightEmissions = formData.transport.flightsHours * 800 * EMISSION_FACTORS.flight; // Assuming 800 km/h average speed
    const transportEmissions = carEmissions + busEmissions + flightEmissions;

    // Calculate electricity emissions
    const electricityEmissions = formData.electricity.unitsPerMonth * EMISSION_FACTORS.electricity;

    // Calculate LPG emissions
    const lpgEmissions = formData.lpg.cylindersPerMonth * EMISSION_FACTORS.lpg;

    // Calculate diet emissions
    const dietEmissions = formData.diet === 'veg' ? EMISSION_FACTORS.vegetarian : EMISSION_FACTORS.nonVegetarian;

    // Calculate purchase emissions
    const purchaseEmissions = (formData.purchases.monthlySpend / 1000) * EMISSION_FACTORS.purchases;

    // Calculate total emissions
    const totalEmissions = transportEmissions + electricityEmissions + lpgEmissions + dietEmissions + purchaseEmissions;

    const result: CarbonResult = {
      totalEmissions,
      breakdown: {
        transport: transportEmissions,
        electricity: electricityEmissions,
        lpg: lpgEmissions,
        diet: dietEmissions,
        purchases: purchaseEmissions,
      },
      message: `Your estimated monthly carbon footprint is ${totalEmissions.toFixed(2)} kg CO₂.`,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error calculating carbon footprint:', error);
    return NextResponse.json(
      { error: 'Failed to calculate carbon footprint' },
      { status: 500 }
    );
  }
}
