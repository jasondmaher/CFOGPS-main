"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ExternalLink,
  TrendingUp,
  Building2,
  Users,
  BarChart3,
  MapPin,
  Calculator,
  ChevronDown,
  ChevronUp,
  Play,
  X,
} from "lucide-react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const userTypes = [
  "Homeless",
  "No Income",
  "Paycheck to Paycheck",
  "Fixed Income",
  "Middle Class",
  "Wealthy",
  "Startup",
  "Corporation",
]

const comingSoonTools = [
  {
    name: "Advanced Modeling",
    description: "Build financial models with scenario planning",
    icon: TrendingUp,
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    name: "Cap Table & Equity Planning",
    description: "Cap table and equity management tools",
    icon: Users,
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  {
    name: "Advanced Dashboard",
    description: "Advanced burn rate analytics and forecasting",
    icon: BarChart3,
    color: "bg-green-500/10 text-green-400 border-green-500/20",
  },
  {
    name: "Fundraising Tracker",
    description: "Fundraising pipeline and investor management",
    icon: Building2,
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
]

export default function CFOGPSLanding() {
  const [selectedUserType, setSelectedUserType] = useState<string>("")
  const [showRunwayCalculator, setShowRunwayCalculator] = useState<boolean>(false)
  const [showFuelCalculator, setShowFuelCalculator] = useState<boolean>(false)
  const [showPaulGrahamEssay, setShowPaulGrahamEssay] = useState<boolean>(false)
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false)

  const [cashOnHand, setCashOnHand] = useState<string>("")
  const [monthlyBurn, setMonthlyBurn] = useState<string>("")
  const [monthlyIncome, setMonthlyIncome] = useState<string>("")
  const [growthType, setGrowthType] = useState<"percentage" | "fixed">("fixed")
  const [revenueGrowthRate, setRevenueGrowthRate] = useState<string>("")
  const [fixedGrowthAmount, setFixedGrowthAmount] = useState<string>("")
  const [monthsToShow, setMonthsToShow] = useState<string>("24")
  const [result, setResult] = useState<{
    runway: number
    status: "alive" | "dead"
    explanation: string
    monthlyProjections: Array<{
      month: number
      cashOnHand: number
      monthlyBurn: number
      monthlyIncome: number
      netBurn: number
    }>
    chartData: Array<{
      month: number
      cash: number
      income: number
      burn: number
    }>
  } | null>(null)

  const [vehicleMpg, setVehicleMpg] = useState<string>("")
  const [plannedSpend, setPlannedSpend] = useState<string>("")
  const [useAddresses, setUseAddresses] = useState<boolean>(false)
  const [currentAddress, setCurrentAddress] = useState<string>("")
  const [station1Name, setStation1Name] = useState<string>("")
  const [station1Address, setStation1Address] = useState<string>("")
  const [station2Name, setStation2Name] = useState<string>("")
  const [station2Address, setStation2Address] = useState<string>("")
  const [distanceStation1, setDistanceStation1] = useState<string>("")
  const [distanceStation2, setDistanceStation2] = useState<string>("")
  const [priceStation1, setPriceStation1] = useState<string>("")
  const [priceStation2, setPriceStation2] = useState<string>("")
  const [fuelResult, setFuelResult] = useState<{
    station1TrueCostPerGallon: number
    station1NetGallons: number
    station1Details: {
      gallonsPurchased: number
      roundTripDistance: number
      gallonsUsedDriving: number
      drivingCost: number
      netFuelAdded: number
    }
    station2TrueCostPerGallon: number
    station2NetGallons: number
    station2Details: {
      gallonsPurchased: number
      roundTripDistance: number
      gallonsUsedDriving: number
      drivingCost: number
      netFuelAdded: number
    }
    cheaperStation: 1 | 2
    savings: number
    comparisonTable: Array<{
      amount: number
      station1TrueCost: number
      station2TrueCost: number
      savings: number
      netSavings: number
    }>
    chartData: Array<{
      amount: number
      station1: number
      station2: number
      savings: number
    }>
    crossoverPoint: number | null
    station1Name: string
    station2Name: string
    netFuelSavings: number
    gallonsSavings: number
    co2Savings: number
  } | null>(null)

  const calculateRunway = () => {
    const cash = Number.parseFloat(cashOnHand) || 0
    const burn = Number.parseFloat(monthlyBurn) || 0
    const income = Number.parseFloat(monthlyIncome) || 0
    const growthRate = growthType === "percentage" ? Number.parseFloat(revenueGrowthRate) || 0 : 0
    const fixedGrowth = growthType === "fixed" ? Number.parseFloat(fixedGrowthAmount) || 0 : 0
    // Calculate max months to show - always show at least 1 month more than out of cash or 6 months more than profitable
    let maxMonths = Number.parseInt(monthsToShow) || 24
    const initialNetBurn = burn - income
    if (initialNetBurn > 0) {
      const monthsToZero = Math.ceil(cash / initialNetBurn)
      maxMonths = Math.max(maxMonths, monthsToZero + 1)
    } else {
      maxMonths = Math.max(maxMonths, 6) // Show at least 6 months if profitable
    }

    let currentCash = cash
    let currentIncome = income
    let monthsToBreakeven = 0
    let monthsToRunOut = 0
    let foundBreakeven = false
    let foundRunOut = false
    const monthlyProjections = []
    const chartData = []

    // Simulate up to specified months
    for (let month = 1; month <= maxMonths; month++) {
      // Calculate net burn BEFORE applying growth for this month
      const netBurn = burn - currentIncome

      // Check for profitability
      if (netBurn <= 0 && !foundBreakeven) {
        monthsToBreakeven = month
        foundBreakeven = true
      }

      // Update cash based on current net burn
      if (netBurn > 0) {
        currentCash -= netBurn
      } else {
        // If profitable, cash keeps growing
        currentCash += Math.abs(netBurn)
      }

      // Check if cash runs out
      if (currentCash <= 0 && !foundRunOut) {
        monthsToRunOut = month
        foundRunOut = true
      }

      // Store projections for display
      monthlyProjections.push({
        month,
        cashOnHand: Math.max(0, currentCash),
        monthlyBurn: burn,
        monthlyIncome: currentIncome,
        netBurn: Math.max(0, netBurn),
      })

      chartData.push({
        month,
        cash: Math.max(0, currentCash),
        income: currentIncome,
        burn: burn,
      })

      // Apply growth for NEXT month
      if (growthType === "percentage") {
        const monthlyGrowth = currentIncome * (growthRate / 100)
        currentIncome += monthlyGrowth
      } else {
        currentIncome += fixedGrowth
      }
    }

    // Determine status and explanation
    let status: "alive" | "dead" = "dead"
    let explanation = ""
    let runway = 0

    if (foundRunOut) {
      runway = monthsToRunOut
    } else {
      // If we never run out of cash in specified months, calculate theoretical runway
      const initialNetBurn = burn - income
      runway = initialNetBurn > 0 ? cash / initialNetBurn : Number.POSITIVE_INFINITY
    }

    if (foundBreakeven && (!foundRunOut || monthsToBreakeven < monthsToRunOut)) {
      status = "alive"
      const growthText =
        growthType === "percentage"
          ? `${growthRate}% monthly growth`
          : `$${fixedGrowth.toLocaleString()} monthly growth`
      explanation = `With ${growthText}, you'll reach profitability in ${monthsToBreakeven} months. ${foundRunOut ? `Your cash will last ${monthsToRunOut} months.` : "You have sufficient runway."} You're default alive!`
    } else if (foundRunOut) {
      const growthText =
        growthType === "percentage"
          ? `${growthRate}% monthly growth`
          : `$${fixedGrowth.toLocaleString()} monthly growth`
      explanation = foundBreakeven
        ? `With ${growthText}, you'll reach profitability in ${monthsToBreakeven} months, but you'll run out of cash in ${monthsToRunOut} months. You're default dead - you need to reduce burn or increase growth.`
        : `With ${growthText}, you'll run out of cash in ${monthsToRunOut} months before reaching profitability. You're default dead - you need to dramatically reduce expenses or increase growth rate.`
    } else {
      const growthText =
        growthType === "percentage"
          ? `${growthRate}% monthly growth`
          : `$${fixedGrowth.toLocaleString()} monthly growth`
      explanation = `With ${growthText}, you have a long runway but growth may be insufficient. Consider accelerating growth to reach profitability faster.`
      status = "alive" // Long runway, even if slow growth
    }

    setResult({
      runway,
      status,
      explanation,
      monthlyProjections,
      chartData,
    })
  }

  const calculateDistanceFromAddresses = async () => {
    // This would require Google Maps API integration
    // For now, we'll show a placeholder message
    alert("Google Maps integration coming soon! Please use manual distance entry for now.")
    return
  }

  const calculateFuelCosts = () => {
    const mpg = Number.parseFloat(vehicleMpg) || 0
    const spendAmount = Number.parseFloat(plannedSpend) || 0
    const dist1 = Number.parseFloat(distanceStation1) || 0
    const dist2 = Number.parseFloat(distanceStation2) || 0
    const price1 = Number.parseFloat(priceStation1) || 0
    const price2 = Number.parseFloat(priceStation2) || 0

    if (mpg === 0 || spendAmount === 0 || price1 === 0 || price2 === 0) {
      return
    }

    // Get station names or use defaults
    const name1 = station1Name.trim() || "Station 1"
    const name2 = station2Name.trim() || "Station 2"

    // Calculate round trip distances
    const roundTripDist1 = dist1 * 2
    const roundTripDist2 = dist2 * 2

    // Calculate gallons used for driving to each station
    const gallonsUsedDriving1 = roundTripDist1 / mpg
    const gallonsUsedDriving2 = roundTripDist2 / mpg

    // Calculate cost of gas used for driving
    const drivingCost1 = gallonsUsedDriving1 * price1
    const drivingCost2 = gallonsUsedDriving2 * price2

    // Calculate gallons purchased with planned spend
    const gallonsPurchased1 = spendAmount / price1
    const gallonsPurchased2 = spendAmount / price2

    // Calculate net gallons (purchased - used for driving)
    const netGallons1 = gallonsPurchased1 - gallonsUsedDriving1
    const netGallons2 = gallonsPurchased2 - gallonsUsedDriving2

    // Calculate net fuel added (planned spend - cost of gas used for driving)
    const netFuelAdded1 = spendAmount - drivingCost1
    const netFuelAdded2 = spendAmount - drivingCost2

    // Calculate true cost per gallon (planned spend / net gallons obtained)
    const trueCostPerGallon1 = netGallons1 > 0 ? spendAmount / netGallons1 : 0
    const trueCostPerGallon2 = netGallons2 > 0 ? spendAmount / netGallons2 : 0

    // Calculate comparison table for different spending amounts
    const spendingAmounts = [5, 10, 20, 50, 100]

    // Calculate additional savings metrics
    const isStation1Cheaper = trueCostPerGallon1 < trueCostPerGallon2
    const cheaperNetFuel = isStation1Cheaper ? netFuelAdded1 : netFuelAdded2
    const expensiveNetFuel = isStation1Cheaper ? netFuelAdded2 : netFuelAdded1
    // Ensure netFuelSavings is always positive
    const netFuelSavings = Math.abs(cheaperNetFuel - expensiveNetFuel)

    const cheaperNetGallons = isStation1Cheaper ? netGallons1 : netGallons2
    const expensiveNetGallons = isStation1Cheaper ? netGallons2 : netGallons1
    // Ensure gallonsSavings is always positive
    const gallonsSavings = Math.abs(cheaperNetGallons - expensiveNetGallons)

    // CO2 emissions: approximately 19.6 lbs CO2 per gallon of gasoline
    const co2Savings = gallonsSavings * 19.6

    // Update comparison table to include proper net savings calculation
    const comparisonTable = spendingAmounts.map((amount) => {
      const gallonsPurch1 = amount / price1
      const gallonsPurch2 = amount / price2
      const netGal1 = gallonsPurch1 - gallonsUsedDriving1
      const netGal2 = gallonsPurch2 - gallonsUsedDriving2
      const trueCost1 = netGal1 > 0 ? amount / netGal1 : 0
      const trueCost2 = netGal2 > 0 ? amount / netGal2 : 0

      // Calculate net fuel added for each station at this spending amount
      const netFuelAdded1ForAmount = Math.max(0, amount - drivingCost1)
      const netFuelAdded2ForAmount = Math.max(0, amount - drivingCost2)
      // Calculate which station is cheaper for this amount
      const gallonsPurch1 = amount / price1
      const gallonsPurch2 = amount / price2
      const netGal1 = gallonsPurch1 - gallonsUsedDriving1
      const netGal2 = gallonsPurch2 - gallonsUsedDriving2
      const isStation1Cheaper = (netGal1 > 0 && netGal2 > 0) ? 
        (amount / netGal1) < (amount / netGal2) : 
        (netGal1 > netGal2)
      // Calculate net savings as the difference in net fuel added
      const netSavings = Math.abs(netFuelAdded1ForAmount - netFuelAdded2ForAmount)

      return {
        amount,
        station1TrueCost: trueCost1,
        station2TrueCost: trueCost2,
        savings: Math.abs(trueCost1 - trueCost2),
        netSavings: netSavings,
      }
    })

    // Update chart data to include savings
    const chartData = []
    let crossoverPointLocal = null
    let previousDiff = null

    for (let amount = 5; amount <= 100; amount += 2.5) {
      const gallonsPurch1 = amount / price1
      const gallonsPurch2 = amount / price2
      const netGal1 = gallonsPurch1 - gallonsUsedDriving1
      const netGal2 = gallonsPurch2 - gallonsUsedDriving2
      const trueCost1 = netGal1 > 0 ? amount / netGal1 : 0
      const trueCost2 = netGal2 > 0 ? amount / netGal2 : 0
      const savings = Math.max(0, Math.abs(trueCost1 - trueCost2))

      chartData.push({
        amount,
        station1: trueCost1,
        station2: trueCost2,
        savings: savings,
      })

      // Find crossover point
      const currentDiff = trueCost1 - trueCost2
      if (previousDiff !== null && Math.sign(currentDiff) !== Math.sign(previousDiff) && crossoverPointLocal === null) {
        crossoverPointLocal = amount
      }
      previousDiff = currentDiff
    }

    setFuelResult({
      station1TrueCostPerGallon: trueCostPerGallon1,
      station1NetGallons: Math.max(0, netGallons1),
      station1Details: {
        gallonsPurchased: gallonsPurchased1,
        roundTripDistance: roundTripDist1,
        gallonsUsedDriving: gallonsUsedDriving1,
        drivingCost: drivingCost1,
        netFuelAdded: Math.max(0, netFuelAdded1),
      },
      station2TrueCostPerGallon: trueCostPerGallon2,
      station2NetGallons: Math.max(0, netGallons2),
      station2Details: {
        gallonsPurchased: gallonsPurchased2,
        roundTripDistance: roundTripDist2,
        gallonsUsedDriving: gallonsUsedDriving2,
        drivingCost: drivingCost2,
        netFuelAdded: Math.max(0, netFuelAdded2),
      },
      cheaperStation: trueCostPerGallon1 < trueCostPerGallon2 ? 1 : 2,
      savings: Math.abs(trueCostPerGallon1 - trueCostPerGallon2),
      comparisonTable,
      chartData,
      crossoverPoint: crossoverPointLocal,
      station1Name: name1,
      station2Name: name2,
      netFuelSavings,
      gallonsSavings,
      co2Savings,
    })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">🧭 CFO GPS</h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-4xl mx-auto">
              Your Financial GPS - Built for Everyone, From The Streets To The C-Suite
            </p>
            <div className="space-y-2">
              <p className="text-base text-gray-500 max-w-4xl mx-auto leading-relaxed">
                Whether you're broke, bootstrapped, or building a billion-dollar company — this is your path to financial clarity
              </p>
              <p className="text-base text-gray-500 max-w-4xl mx-auto leading-relaxed">
                Make smarter financial decisions at every turn
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Buttons */}
      <div className="container mx-auto px-4 pb-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Fuel Calculator Button */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-0">
              <Button
                onClick={() => setShowFuelCalculator(!showFuelCalculator)}
                className="w-full h-16 bg-transparent hover:bg-gray-800 border-0 text-left flex items-center justify-between px-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-600/20 border border-green-500/50 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Find The Best Gas Station Near You</h3>
                    <p className="text-gray-400 text-sm">
                      True Cost Per Gallon adjusted for distance, mpg of your vehicle, amount you plan to spend, and
                      price at each station.
                    </p>
                  </div>
                </div>
                {showFuelCalculator ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Fuel Calculator */}
          {showFuelCalculator && (
            <div className="pb-8">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-xl">
                    Find The Best Gas Station Near You
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Vehicle MPG</label>
                        <Input
                          type="number"
                          placeholder="25"
                          value={vehicleMpg}
                          onChange={(e) => setVehicleMpg(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">How Much You Plan to Spend ($)</label>
                        <Input
                          type="number"
                          placeholder="50"
                          value={plannedSpend}
                          onChange={(e) => setPlannedSpend(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                        />
                      </div>
                    </div>

                    {/* Distance Input Method Toggle */}
                    <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <Button
                        variant={!useAddresses ? "default" : "outline"}
                        onClick={() => setUseAddresses(false)}
                        className="flex items-center gap-2"
                      >
                        <Calculator className="h-4 w-4" />
                        Manual Distance
                      </Button>
                      <Button
                        variant={useAddresses ? "default" : "outline"}
                        onClick={() => setUseAddresses(true)}
                        className="flex items-center gap-2"
                      >
                        <MapPin className="h-4 w-4" />
                        Use Addresses
                      </Button>
                      {useAddresses && (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                          Coming Soon
                        </Badge>
                      )}
                    </div>

                    {useAddresses ? (
                      /* Address Input Mode */
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">Your Current Address</label>
                          <Input
                            type="text"
                            placeholder="123 Main St, City, State"
                            value={currentAddress}
                            onChange={(e) => setCurrentAddress(e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                            <h3 className="font-medium text-white">Gas Station 1</h3>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-300">Station Name</label>
                              <Input
                                type="text"
                                placeholder="Shell"
                                value={station1Name}
                                onChange={(e) => setStation1Name(e.target.value)}
                                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-300">Station Address</label>
                              <Input
                                type="text"
                                placeholder="456 Oak Ave, City, State"
                                value={station1Address}
                                onChange={(e) => setStation1Address(e.target.value)}
                                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-300">Price per Gallon ($)</label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="3.45"
                                value={priceStation1}
                                onChange={(e) => setPriceStation1(e.target.value)}
                                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                            <h3 className="font-medium text-white">Gas Station 2</h3>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-300">Station Name</label>
                              <Input
                                type="text"
                                placeholder="Chevron"
                                value={station2Name}
                                onChange={(e) => setStation2Name(e.target.value)}
                                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-300">Station Address</label>
                              <Input
                                type="text"
                                placeholder="789 Pine St, City, State"
                                value={station2Address}
                                onChange={(e) => setStation2Address(e.target.value)}
                                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-300">Price per Gallon ($)</label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="3.25"
                                value={priceStation2}
                                onChange={(e) => setPriceStation2(e.target.value)}
                                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={calculateDistanceFromAddresses}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                          size="lg"
                        >
                          Calculate Distances from Google Maps
                        </Button>
                      </div>
                    ) : (
                      /* Manual Distance Input Mode */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                          <h3 className="font-medium text-white">Gas Station 1</h3>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Station Name</label>
                            <Input
                              type="text"
                              placeholder="Shell"
                              value={station1Name}
                              onChange={(e) => setStation1Name(e.target.value)}
                              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Distance (miles)</label>
                            <Input
                              type="number"
                              placeholder="2"
                              value={distanceStation1}
                              onChange={(e) => setDistanceStation1(e.target.value)}
                              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Price per Gallon ($)</label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="3.45"
                              value={priceStation1}
                              onChange={(e) => setPriceStation1(e.target.value)}
                              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                          <h3 className="font-medium text-white">Gas Station 2</h3>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Station Name</label>
                            <Input
                              type="text"
                              placeholder="Chevron"
                              value={station2Name}
                              onChange={(e) => setStation2Name(e.target.value)}
                              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Distance (miles)</label>
                            <Input
                              type="number"
                              placeholder="5"
                              value={distanceStation2}
                              onChange={(e) => setDistanceStation2(e.target.value)}
                              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Price per Gallon ($)</label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="3.25"
                              value={priceStation2}
                              onChange={(e) => setPriceStation2(e.target.value)}
                              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {!useAddresses && (
                    <Button
                      onClick={calculateFuelCosts}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
                      size="lg"
                    >
                      Calculate Cheapest Option
                    </Button>
                  )}

                  {fuelResult && (
                    <div className="space-y-6">
                      {/* Summary Results */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div
                          className={`p-4 rounded-lg border ${
                            fuelResult.cheaperStation === 1
                              ? "bg-green-600/20 border-green-500/50"
                              : "bg-gray-700 border-gray-600"
                          }`}
                        >
                          <div className="text-sm text-gray-300">{fuelResult.station1Name} True Cost Per Gallon</div>
                          <div className="text-lg font-semibold text-white">
                            ${fuelResult.station1TrueCostPerGallon.toFixed(2)}/gal
                            {fuelResult.cheaperStation === 1 && <Badge className="ml-2 bg-green-600">Cheapest</Badge>}
                          </div>
                          <div className="text-sm text-gray-400">
                            Net Fuel Added: ${fuelResult.station1Details.netFuelAdded.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-400">
                            Net Gallons: {fuelResult.station1NetGallons.toFixed(2)} gal
                          </div>
                          {fuelResult.cheaperStation === 1 && (
                            <div className="text-sm text-green-400 font-medium mt-1">
                              Net Savings: ${fuelResult.netFuelSavings.toFixed(2)}
                            </div>
                          )}
                        </div>
                        <div
                          className={`p-4 rounded-lg border ${
                            fuelResult.cheaperStation === 2
                              ? "bg-green-600/20 border-green-500/50"
                              : "bg-gray-700 border-gray-600"
                          }`}
                        >
                          <div className="text-sm text-gray-300">{fuelResult.station2Name} True Cost Per Gallon</div>
                          <div className="text-lg font-semibold text-white">
                            ${fuelResult.station2TrueCostPerGallon.toFixed(2)}/gal
                            {fuelResult.cheaperStation === 2 && <Badge className="ml-2 bg-green-600">Cheapest</Badge>}
                          </div>
                          <div className="text-sm text-gray-400">
                            Net Fuel Added: ${fuelResult.station2Details.netFuelAdded.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-400">
                            Net Gallons: {fuelResult.station2NetGallons.toFixed(2)} gal
                          </div>
                          {fuelResult.cheaperStation === 2 && (
                            <div className="text-sm text-green-400 font-medium mt-1">
                              Net Savings: ${fuelResult.netFuelSavings.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Enhanced Savings Information */}
                      <div className="text-center space-y-3">
                        <p className="text-green-400 font-medium">
                          {fuelResult.cheaperStation === 1 ? fuelResult.station1Name : fuelResult.station2Name} saves
                          you ${fuelResult.savings.toFixed(2)} per gallon
                        </p>
                        <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                          <div className="text-white font-medium">Additional Savings with Cheapest Option:</div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div className="text-center">
                              <div className="text-blue-400 font-semibold">${fuelResult.netFuelSavings.toFixed(2)}</div>
                              <div className="text-gray-400">Net Savings</div>
                            </div>
                            <div className="text-center">
                              <div className="text-green-400 font-semibold">
                                {fuelResult.gallonsSavings.toFixed(2)} gal
                              </div>
                              <div className="text-gray-400">Extra Gallons</div>
                            </div>
                            <div className="text-center">
                              <div className="text-purple-400 font-semibold">
                                {fuelResult.co2Savings.toFixed(1)} lbs
                              </div>
                              <div className="text-gray-400">CO₂ Saved</div>
                            </div>
                          </div>
                        </div>
                        {fuelResult.crossoverPoint && (
                          <p className="text-blue-400 text-sm mt-2">
                            Crossover point: ${fuelResult.crossoverPoint.toFixed(0)} spending amount
                          </p>
                        )}
                      </div>

                      {/* Detailed Calculations */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="bg-gray-800 border-gray-700">
                          <CardHeader>
                            <CardTitle className="text-white text-lg">
                              {fuelResult.station1Name} - Calculation Details
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-300">Gallons purchased:</span>
                              <span className="text-white">
                                {fuelResult.station1Details.gallonsPurchased.toFixed(2)} gal
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Round trip distance:</span>
                              <span className="text-white">
                                {fuelResult.station1Details.roundTripDistance.toFixed(1)} mi
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Gallons used driving:</span>
                              <span className="text-white">
                                {fuelResult.station1Details.gallonsUsedDriving.toFixed(2)} gal
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Cost of gas for driving:</span>
                              <span className="text-white">${fuelResult.station1Details.drivingCost.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-600 pt-2">
                              <div className="flex justify-between font-medium">
                                <span className="text-gray-300">Net gallons obtained:</span>
                                <span className="text-white">{fuelResult.station1NetGallons.toFixed(2)} gal</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span className="text-gray-300">Net fuel added:</span>
                                <span className="text-white">
                                  ${fuelResult.station1Details.netFuelAdded.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between font-bold text-lg">
                                <span className="text-gray-300">True cost per gallon:</span>
                                <span className="text-white">${fuelResult.station1TrueCostPerGallon.toFixed(2)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gray-800 border-gray-700">
                          <CardHeader>
                            <CardTitle className="text-white text-lg">
                              {fuelResult.station2Name} - Calculation Details
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-300">Gallons purchased:</span>
                              <span className="text-white">
                                {fuelResult.station2Details.gallonsPurchased.toFixed(2)} gal
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Round trip distance:</span>
                              <span className="text-white">
                                {fuelResult.station2Details.roundTripDistance.toFixed(1)} mi
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Gallons used driving:</span>
                              <span className="text-white">
                                {fuelResult.station2Details.gallonsUsedDriving.toFixed(2)} gal
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Cost of gas for driving:</span>
                              <span className="text-white">${fuelResult.station2Details.drivingCost.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-600 pt-2">
                              <div className="flex justify-between font-medium">
                                <span className="text-gray-300">Net gallons obtained:</span>
                                <span className="text-white">{fuelResult.station2NetGallons.toFixed(2)} gal</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span className="text-gray-300">Net fuel added:</span>
                                <span className="text-white">
                                  ${fuelResult.station2Details.netFuelAdded.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between font-bold text-lg">
                                <span className="text-gray-300">True cost per gallon:</span>
                                <span className="text-white">${fuelResult.station2TrueCostPerGallon.toFixed(2)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Comparison Table */}
                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-white text-lg">True Cost Comparison by Spending Amount</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-gray-600">
                                  <th className="text-left text-gray-300 py-2">Spend Amount</th>
                                  <th className="text-right text-gray-300 py-2">
                                    {fuelResult.station1Name} True Cost/Gal
                                  </th>
                                  <th className="text-right text-gray-300 py-2">
                                    {fuelResult.station2Name} True Cost/Gal
                                  </th>
                                  <th className="text-right text-gray-300 py-2">Savings/Gal</th>
                                  <th className="text-right text-gray-300 py-2">Net Savings</th>
                                  <th className="text-center text-gray-300 py-2">Better Choice</th>
                                </tr>
                              </thead>
                              <tbody>
                                {fuelResult.comparisonTable.map((row) => (
                                  <tr
                                    key={row.amount}
                                    className={`border-b border-gray-700 ${
                                      fuelResult.crossoverPoint &&
                                      Math.abs(row.amount - fuelResult.crossoverPoint) < 0.1
                                        ? "bg-red-500/10 border-red-500/30"
                                        : ""
                                    }`}
                                  >
                                    <td className="py-2 text-white font-medium">
                                      ${row.amount.toFixed(0)}
                                      {fuelResult.crossoverPoint &&
                                        Math.abs(row.amount - fuelResult.crossoverPoint) < 0.1 && (
                                          <Badge className="ml-2 bg-red-600 text-xs">Crossover</Badge>
                                        )}
                                    </td>
                                    <td className="text-right py-2 text-white">${row.station1TrueCost.toFixed(2)}</td>
                                    <td className="text-right py-2 text-white">${row.station2TrueCost.toFixed(2)}</td>
                                    <td className="text-right py-2 text-white">
                                      {fuelResult.crossoverPoint &&
                                      Math.abs(row.amount - fuelResult.crossoverPoint) < 0.1 ? (
                                        <span className="text-yellow-400">$0.00</span>
                                      ) : (
                                        <span className="text-green-400">${row.savings.toFixed(2)}</span>
                                      )}
                                    </td>
                                    <td className="text-right py-2 text-white">
                                      {fuelResult.crossoverPoint &&
                                      Math.abs(row.amount - fuelResult.crossoverPoint) < 0.1 ? (
                                        <span className="text-yellow-400">$0.00</span>
                                      ) : (
                                        <span className="text-green-400">${row.netSavings.toFixed(2)}</span>
                                      )}
                                    </td>
                                    <td className="text-center py-2">
                                      {fuelResult.crossoverPoint &&
                                      Math.abs(row.amount - fuelResult.crossoverPoint) < 0.1 ? (
                                        <Badge className="bg-yellow-600">Equal</Badge>
                                      ) : (
                                        <Badge
                                          className={
                                            row.station1TrueCost < row.station2TrueCost ? "bg-blue-500" : "bg-green-500"
                                          }
                                        >
                                          {row.station1TrueCost < row.station2TrueCost
                                            ? fuelResult.station1Name
                                            : fuelResult.station2Name}
                                        </Badge>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>

                      {/* True Cost Chart */}
                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-white text-lg">True Cost Per Gallon vs Spending Amount</CardTitle>
                          <div className="flex items-center gap-6 mt-2">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-0.5 bg-blue-500"></div>
                              <span className="text-sm text-gray-300">{fuelResult.station1Name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-0.5 bg-green-500"></div>
                              <span className="text-sm text-gray-300">{fuelResult.station2Name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-0.5 bg-orange-500"></div>
                              <span className="text-sm text-gray-300">Savings per Gallon</span>
                            </div>
                            {fuelResult.crossoverPoint && (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-0.5 bg-red-500 border-dashed border-t"></div>
                                <span className="text-sm text-red-400">Crossover Point</span>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ChartContainer
                            config={{
                              station1: {
                                label: fuelResult.station1Name,
                                color: "#3B82F6", // Blue
                              },
                              station2: {
                                label: fuelResult.station2Name,
                                color: "#10B981", // Green
                              },
                              savings: {
                                label: "Savings per Gallon",
                                color: "#F97316", // Orange
                              },
                            }}
                            className="h-[400px]"
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={fuelResult.chartData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis
                                  dataKey="amount"
                                  stroke="#9CA3AF"
                                  label={{
                                    value: "Spending Amount ($)",
                                    position: "insideBottom",
                                    offset: -5,
                                    fill: "#9CA3AF",
                                  }}
                                />
                                <YAxis
                                  stroke="#9CA3AF"
                                  label={{
                                    value: "True Cost per Gallon ($)",
                                    angle: -90,
                                    position: "insideLeft",
                                    fill: "#9CA3AF",
                                  }}
                                  domain={["dataMin - 0.1", "dataMax + 0.1"]}
                                  tickFormatter={(value) => `$${Math.round(value)}`}
                                />
                                <ChartTooltip
                                  content={<ChartTooltipContent />}
                                  labelFormatter={(value) => `Spend: $${value}`}
                                  formatter={(value, name) => {
                                    if (name === "savings") {
                                      return [`$${Number(value).toFixed(2)}/gal`, "Savings per Gallon"]
                                    }
                                    return [
                                      `$${Number(value).toFixed(2)}/gal`,
                                      name === "station1" ? fuelResult.station1Name : fuelResult.station2Name,
                                    ]
                                  }}
                                />
                                {fuelResult.crossoverPoint && (
                                  <ReferenceLine
                                    x={fuelResult.crossoverPoint}
                                    stroke="#EF4444"
                                    strokeDasharray="5 5"
                                    label={{
                                      value: `Crossover: $${fuelResult.crossoverPoint.toFixed(0)}`,
                                      position: "topRight",
                                      fill: "#EF4444",
                                      fontSize: 12,
                                      fontWeight: "bold",
                                    }}
                                  />
                                )}
                                <Line
                                  type="monotone"
                                  dataKey="station1"
                                  stroke="var(--color-station1)"
                                  strokeWidth={3}
                                  dot={false}
                                  name="station1"
                                />
                                <Line
                                  type="monotone"
                                  dataKey="station2"
                                  stroke="var(--color-station2)"
                                  strokeWidth={3}
                                  dot={false}
                                  name="station2"
                                />
                                <Line
                                  type="monotone"
                                  dataKey="savings"
                                  stroke="var(--color-savings)"
                                  strokeWidth={2}
                                  strokeDasharray="5 5"
                                  dot={false}
                                  name="savings"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Default Alive/Dead Calculator Button */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-0">
              <Button
                onClick={() => setShowRunwayCalculator(!showRunwayCalculator)}
                className="w-full h-16 bg-transparent hover:bg-gray-800 border-0 text-left flex items-center justify-between px-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-600/20 border border-blue-500/50 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Are You Default Dead or Default Alive?</h3>
                    <p className="text-gray-400 text-sm">
                      Understand your runway, whether you are default alive or dead.
                    </p>
                  </div>
                </div>
                {showRunwayCalculator ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Financial Calculator */}
          {showRunwayCalculator && (
            <div className="pb-8 space-y-6">
              {/* Paul Graham Essay Toggle */}
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-0">
                  <Button
                    onClick={() => setShowPaulGrahamEssay(!showPaulGrahamEssay)}
                    className="w-full h-12 bg-transparent hover:bg-gray-800 border-0 text-left flex items-center justify-between px-6"
                  >
                    <div className="flex items-center gap-4">
                      <ExternalLink className="h-5 w-5 text-blue-400" />
                      <span className="text-white font-medium">
                        Read Paul Graham's "Default Alive or Default Dead?" Essay
                      </span>
                    </div>
                    {showPaulGrahamEssay ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Paul Graham Essay Content */}
              {showPaulGrahamEssay && (
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl">Default Alive or Default Dead?</CardTitle>
                    <p className="text-gray-400">
                      By Paul Graham •{" "}
                      <a
                        href="http://www.paulgraham.com/defaultalive.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline transition-colors"
                      >
                        Read the full essay
                      </a>
                    </p>
                  </CardHeader>
                  <CardContent className="prose prose-invert max-w-none space-y-6">
                    <div className="text-gray-300 space-y-4 leading-relaxed">
                      <p>
                        When I talk to a startup that's been operating for more than 8 or 9 months, the first thing I
                        want to know is almost always the same. Assuming their expenses remain constant and their
                        revenue growth is what it has been over the last several months, do they make it to
                        profitability on the money they have left? Or to put it more dramatically, by default do they
                        live or die?
                      </p>
                      <p>
                        The startups that are default alive are the ones that are actually growing. The ones that are
                        default dead have usually stopped growing, or are growing so slowly that they'll run out of
                        money before they reach profitability.
                      </p>
                      <p>
                        <strong>Default alive</strong> means that if you do nothing more than you're already doing,
                        you'll survive. You don't need to raise money. You don't need to find new customers. You just
                        need to keep doing what you're doing.
                      </p>
                      <p>
                        <strong>Default dead</strong> means the opposite. If you do nothing more than you're already
                        doing, you'll run out of money and die. To survive you need to either raise more money or
                        increase your growth rate.
                      </p>
                      <p>
                        Why do so many founders not know whether they're default alive or default dead? Mainly, I think,
                        because they're not used to asking that question. It's not a question that occurs to most
                        people. But it's the most important question for any company.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* YC Video Card */}
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-red-600/20 border border-red-500/50 flex-shrink-0 flex items-center justify-center">
                      <Play className="h-6 w-6 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">YC: Save Your Startup</h3>
                      <p className="text-sm text-gray-400">Watch the essential guide to startup survival</p>
                    </div>
                    <Button
                      onClick={() => setShowVideoModal(true)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Watch Video
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-xl">
                    Are You Default Dead or Default Alive?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Cash on Hand ($)</label>
                        <Input
                          type="number"
                          placeholder="50000"
                          value={cashOnHand}
                          onChange={(e) => setCashOnHand(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Monthly Burn Rate ($)</label>
                        <Input
                          type="number"
                          placeholder="5000"
                          value={monthlyBurn}
                          onChange={(e) => setMonthlyBurn(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Monthly Income ($)</label>
                        <Input
                          type="number"
                          placeholder="3000"
                          value={monthlyIncome}
                          onChange={(e) => setMonthlyIncome(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Max months to show</label>
                        <Input
                          type="number"
                          placeholder="24"
                          value={monthsToShow}
                          onChange={(e) => setMonthsToShow(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Growth Type</label>
                        <div className="flex gap-2">
                          <Button
                            variant={growthType === "percentage" ? "default" : "outline"}
                            onClick={() => setGrowthType("percentage")}
                            className="flex-1"
                          >
                            % Growth
                          </Button>
                          <Button
                            variant={growthType === "fixed" ? "default" : "outline"}
                            onClick={() => setGrowthType("fixed")}
                            className="flex-1"
                          >
                            Fixed Amount
                          </Button>
                        </div>
                      </div>
                    </div>

                    {growthType === "percentage" ? (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Monthly Revenue Growth Rate (%)</label>
                        <Input
                          type="number"
                          placeholder="10"
                          value={revenueGrowthRate}
                          onChange={(e) => setRevenueGrowthRate(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Fixed Monthly Growth Amount ($)</label>
                        <Input
                          type="number"
                          placeholder="500"
                          value={fixedGrowthAmount}
                          onChange={(e) => setFixedGrowthAmount(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={calculateRunway}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    size="lg"
                  >
                    Calculate Runway
                  </Button>

                  {result && (
                    <div className="space-y-6">
                      <div className="space-y-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-white">
                            Runway: {result.runway === Number.POSITIVE_INFINITY ? "∞" : `${Math.round(result.runway)}`}{" "}
                            Months
                          </span>
                          <Badge
                            variant={result.status === "alive" ? "default" : "destructive"}
                            className={
                              result.status === "alive"
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-red-600 hover:bg-red-700"
                            }
                          >
                            {result.status === "alive" ? "✅ Default Alive" : "⚠️ Default Dead"}
                          </Badge>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{result.explanation}</p>
                      </div>

                      {/* Monthly Projections Table */}
                      {result.monthlyProjections.length > 0 && (
                        <Card className="bg-gray-800 border-gray-700">
                          <CardHeader>
                            <CardTitle className="text-white text-lg">Monthly Financial Projections</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-600">
                                    <th className="text-left text-gray-300 py-2">Month</th>
                                    <th className="text-right text-gray-300 py-2">Cash on Hand</th>
                                    <th className="text-right text-gray-300 py-2">Monthly Income</th>
                                    <th className="text-right text-gray-300 py-2">Monthly Burn</th>
                                    <th className="text-right text-gray-300 py-2">Net Burn</th>
                                    <th className="text-center text-gray-300 py-2">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {result.monthlyProjections.map((projection) => (
                                    <tr
                                      key={projection.month}
                                      className={`border-b border-gray-700 ${
                                        projection.cashOnHand <= 0 ? "bg-red-500/10 border-red-500/30" : ""
                                      } ${projection.netBurn <= 0 ? "bg-green-500/10 border-green-500/30" : ""}`}
                                    >
                                      <td className="py-2 text-white font-medium">
                                        {projection.month}
                                        {projection.cashOnHand <= 0 && (
                                          <Badge className="ml-2 bg-red-600 text-xs">Out of Cash</Badge>
                                        )}
                                        {projection.netBurn <= 0 && projection.cashOnHand > 0 && (
                                          <Badge className="ml-2 bg-green-600 text-xs">Profitable</Badge>
                                        )}
                                      </td>
                                      <td className="text-right py-2 text-white">
                                        ${Math.round(projection.cashOnHand).toLocaleString()}
                                      </td>
                                      <td className="text-right py-2 text-white">
                                        ${Math.round(projection.monthlyIncome).toLocaleString()}
                                      </td>
                                      <td className="text-right py-2 text-white">
                                        ${Math.round(projection.monthlyBurn).toLocaleString()}
                                      </td>
                                      <td className="text-right py-2 text-white">
                                        ${Math.round(projection.netBurn).toLocaleString()}
                                      </td>
                                      <td className="text-center py-2">
                                        {projection.cashOnHand <= 0 ? (
                                          <Badge className="bg-red-600">Dead</Badge>
                                        ) : projection.netBurn <= 0 ? (
                                          <Badge className="bg-green-600">Alive</Badge>
                                        ) : (
                                          <Badge className="bg-yellow-600">Burning</Badge>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Monthly Projections Chart */}
                      {result.chartData.length > 0 && (
                        <Card className="bg-gray-800 border-gray-700">
                          <CardHeader>
                            <CardTitle className="text-white text-lg">Financial Runway Projection</CardTitle>
                            <div className="flex items-center gap-6 mt-2">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-0.5 bg-blue-500"></div>
                                <span className="text-sm text-gray-300">Cash on Hand</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-0.5 bg-green-500"></div>
                                <span className="text-sm text-gray-300">Monthly Income</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-0.5 bg-red-500"></div>
                                <span className="text-sm text-gray-300">Monthly Burn</span>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <ChartContainer
                              config={{
                                cash: {
                                  label: "Cash on Hand",
                                  color: "#3B82F6", // Blue
                                },
                                income: {
                                  label: "Monthly Income",
                                  color: "#10B981", // Green
                                },
                                burn: {
                                  label: "Monthly Burn",
                                  color: "#EF4444", // Red
                                },
                              }}
                              className="h-[400px]"
                            >
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={result.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                  <XAxis
                                    dataKey="month"
                                    stroke="#9CA3AF"
                                    label={{
                                      value: "Month",
                                      position: "insideBottom",
                                      offset: -5,
                                      fill: "#9CA3AF",
                                    }}
                                  />
                                  <YAxis
                                    stroke="#9CA3AF"
                                    label={{
                                      value: "Amount ($)",
                                      angle: -90,
                                      position: "insideLeft",
                                      fill: "#9CA3AF",
                                    }}
                                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                  />
                                  <ChartTooltip
                                    content={<ChartTooltipContent />}
                                    labelFormatter={(value) => `Month ${value}`}
                                    formatter={(value, name) => [
                                      `$${Number(value).toLocaleString()}`,
                                      name === "cash"
                                        ? "Cash on Hand"
                                        : name === "income"
                                          ? "Monthly Income"
                                          : "Monthly Burn",
                                    ]}
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="cash"
                                    stroke="var(--color-cash)"
                                    strokeWidth={3}
                                    dot={false}
                                    name="cash"
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="income"
                                    stroke="var(--color-income)"
                                    strokeWidth={3}
                                    dot={false}
                                    name="income"
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="burn"
                                    stroke="var(--color-burn)"
                                    strokeWidth={3}
                                    dot={false}
                                    name="burn"
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </ChartContainer>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* User Type Selection - Moved below calculators */}
      <div className="container mx-auto px-4 pb-8">
        <div className="text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Tools For Any Financial Situation
          </h2>
          <p className="text-gray-500 text-sm max-w-4xl mx-auto leading-relaxed">
            A CFO, or Chief Financial Officer, is the person responsible for managing the finances of a company — forecasting runway, planning budgets, weighing risks, and deciding how to allocate limited resources. But here's the truth: every one of us is a CFO, whether we're living paycheck to paycheck, running a startup, retired on fixed income, or leading a global company. CFO GPS gives you the tools to make smart, strategic financial decisions — no matter where you are in life. Because whether you're managing $20 or $20 million, your job is the same: make it last, make it work, and make it grow. Be default alive. NOT default dead.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {userTypes.map((type) => (
              <Card
                key={type}
                className={`cursor-pointer transition-all hover:border-gray-600 ${
                  selectedUserType === type ? "bg-blue-600/20 border-blue-500/50" : "bg-gray-900 border-gray-800"
                }`}
                onClick={() => setSelectedUserType(type)}
              >
                <CardContent className="p-6 text-center">
                  <h3 className={`font-medium ${selectedUserType === type ? "text-blue-300" : "text-gray-300"}`}>
                    {type}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Coming Soon Tools */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Advanced Tool Road Map</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Building the complete financial toolkit for startups and individuals
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {comingSoonTools.map((tool) => (
              <Card key={tool.name} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className={`w-12 h-12 rounded-lg border flex items-center justify-center ${tool.color}`}>
                    <tool.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white">{tool.name}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{tool.description}</p>
                  </div>
                  <Badge variant="outline" className="border-gray-700 text-gray-400">
                    Coming Soon
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold">YC: Save Your Startup</h3>
              <Button
                onClick={() => setShowVideoModal(false)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/0OVSTWozvfY"
                title="YC: Save Your Startup"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm">From broke to paycheck to paycheck to IPO</p>
            <p className="text-gray-500 text-sm mt-2">Copyright © 2025 CFO GPS</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
