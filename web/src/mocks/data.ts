import { type rawApiSymbol } from '../types/api';

// Mock symbol data generated with Gemini
export const symbols: rawApiSymbol[] = [
  { "Name": "AirFlowVelocity", "Type": "INS", "Description": "Primary intake air flow speed" },
  { "Name": "AmbientHumidity", "Type": "INS", "Description": "Enclosure relative humidity percentage" },
  { "Name": "AnalogDeadband", "Type": "INT", "Description": "Analog input deadband threshold" },
  { "Name": "BearingVibrationA", "Type": "INS", "Description": "Motor drive bearing axial vibration" },
  { "Name": "BearingVibrationB", "Type": "INS", "Description": "Motor non-drive bearing vibration" },
  { "Name": "BinaryDebounce", "Type": "INS", "Description": "Binary input debounce delay" },
  { "Name": "BoilerWaterLevel", "Type": "INT", "Description": "Steam generator reservoir water level" },
  { "Name": "BrakePadWearIndicator", "Type": "INS", "Description": "Mechanical braking system wear level" },
  { "Name": "BusVoltagePhaseA", "Type": "INS", "Description": "Main electrical bus Phase A voltage" },
  { "Name": "BusVoltagePhaseB", "Type": "INS", "Description": "Main electrical bus Phase B voltage" },
  { "Name": "BusVoltagePhaseC", "Type": "INS", "Description": "Main electrical bus Phase C voltage" },
  { "Name": "CabinInternalTemp", "Type": "INS", "Description": "Operator cabin temperature monitor" },
  { "Name": "ChilledWaterFlow", "Type": "INS", "Description": "Cooling loop chilled water flow volumetric rate" },
  { "Name": "CircuitBreakerStatus", "Type": "INS", "Description": "Main feed circuit breaker auxiliary state" },
  { "Name": "CommTimeout", "Type": "INT", "Description": "Communication monitoring timeout status" },
  { "Name": "CompressorDischargePres", "Type": "INS", "Description": "Gas compressor outlet head pressure" },
  { "Name": "CondenserFanSpeed", "Type": "INS", "Description": "Cooling tower condensing fan tachometer" },
  { "Name": "ConveyorBeltSpeed", "Type": "INS", "Description": "Material handling main conveyor line speed" },
  { "Name": "CoolantFluidLevel", "Type": "INS", "Description": "Hydraulic reservoir coolant fluid level" },
  { "Name": "CrankcaseOilTemp", "Type": "INS", "Description": "Internal combustion engine oil sump temp" },
  { "Name": "DiffPressureFilter", "Type": "INT", "Description": "Differential pressure across intake filters" },
  { "Name": "EmergencyStopLoop", "Type": "INS", "Description": "Safety system E-stop continuous hardware loop" },
  { "Name": "ExhaustGasOxygen", "Type": "INS", "Description": "Flue gas exhaust residual oxygen percentage" },
  { "Name": "ExhaustTemp", "Type": "INT", "Description": "Turbine exhaust temperature monitor" },
  { "Name": "FeederCurrentPhaseA", "Type": "INS", "Description": "Distribution feeder Phase A current draw" },
  { "Name": "FeederCurrentPhaseB", "Type": "INS", "Description": "Distribution feeder Phase B current draw" },
  { "Name": "FeederCurrentPhaseC", "Type": "INS", "Description": "Distribution feeder Phase C current draw" },
  { "Name": "FuelControlValvePos", "Type": "INS", "Description": "Governor fuel throttle valve position" },
  { "Name": "GearboxOilPressure", "Type": "INT", "Description": "Main reduction gear lubrication oil pressure" },
  { "Name": "GeneratorFrequency", "Type": "INS", "Description": "Alternator electrical output grid frequency" },
  { "Name": "HydraulicFluidTemp", "Type": "INS", "Description": "Actuator hydraulic system fluid temperature" },
  { "Name": "InverterCoreTemp", "Type": "INS", "Description": "Static power inverter IGBT junction temp" },
  { "Name": "IsolationValveState", "Type": "INS", "Description": "Process line emergency isolation valve state" },
  { "Name": "LeakDetectionSensor", "Type": "INS", "Description": "Containment bund electronic fluid leak sensor" },
  { "Name": "LubeOilSumpLevel", "Type": "INS", "Description": "Prime mover lubricating oil reservoir level" },
  { "Name": "MainPumpPressure", "Type": "INT", "Description": "Hydraulic pressure sensor" },
  { "Name": "MotorStatorTempA", "Type": "INS", "Description": "Drive motor Phase A winding temperature" },
  { "Name": "MotorStatorTempB", "Type": "INS", "Description": "Drive motor Phase B winding temperature" },
  { "Name": "MotorStatorTempC", "Type": "INS", "Description": "Drive motor Phase C winding temperature" },
  { "Name": "OilWaterSeparator", "Type": "INS", "Description": "Discharge path oil concentration index" },
  { "Name": "OverloadTripCounter", "Type": "INS", "Description": "Thermal overload relay total fault trip count" },
  { "Name": "PanelDoorInterlock", "Type": "INS", "Description": "High voltage switchgear cabinet door switch" },
  { "Name": "PneumaticSupplyPres", "Type": "INT", "Description": "Instrument air distribution header pressure" },
  { "Name": "PowerFactorTotal", "Type": "INS", "Description": "Plant aggregate displacement power factor" },
  { "Name": "ProcessFluidDensity", "Type": "INS", "Description": "Coriolis flowmeter process fluid density" },
  { "Name": "PumpDischargeValve", "Type": "INS", "Description": "Main transfer pump manual discharge valve state" },
  { "Name": "ReactivePowerKVAR", "Type": "INS", "Description": "Total net reactive power flow vector" },
  { "Name": "RefrigerantSuctionPres", "Type": "INS", "Description": "Chiller loop evaporator suction gas pressure" },
  { "Name": "RotorShaftSpeedRPM", "Type": "INS", "Description": "High speed rotor mechanical shaft tachometer" },
  { "Name": "SafetyValveRelief", "Type": "INS", "Description": "Overpressure safety release valve lift counter" },
  { "Name": "SilicaAnalyzerValue", "Type": "INS", "Description": "Demineralized water chemistry loop silica reading" },
  { "Name": "SteamHeaderTemp", "Type": "INT", "Description": "High pressure superheated steam manifold temp" },
  { "Name": "SurgeArresterLeakage", "Type": "INS", "Description": "Lightning arrester grounding path microamp leak" },
  { "Name": "SystemTimer", "Type": "INT", "Description": "Internal system operating clock" },
  { "Name": "TankLevelVolume", "Type": "INT", "Description": "Chemical storage tank volumetric liquid inventory" },
  { "Name": "TransformerGasLevel", "Type": "INS", "Description": "Dissolved gas analysis hydrogen concentration" },
  { "Name": "TurbineVibrationX", "Type": "INS", "Description": "Turbine rotor radial displacement X-axis" },
  { "Name": "TurbineVibrationY", "Type": "INS", "Description": "Turbine rotor radial displacement Y-axis" },
  { "Name": "UpsBatteryCapacity", "Type": "INS", "Description": "Backup critical power UPS battery state-of-charge" },
  { "Name": "VacuumSuctionLevel", "Type": "INS", "Description": "Condenser vacuum system mercury column displacement" },
  { "Name": "WaterTurbidityValue", "Type": "INS", "Description": "Influent intake filtration optical turbidity" },
]

// defining custom ranges
const METRIC_PROFILES: Record<string, { units: string; min: number; max: number }> = {
  Velocity: { units: "m/s", min: 10, max: 95 },
  Humidity: { units: "%", min: 30, max: 85 },
  Vibration: { units: "mm/s", min: 1, max: 15 },
  Voltage: { units: "V", min: 220, max: 245 },
  Temp: { units: "°C", min: 45, max: 110 },
  Pressure: { units: "kPa", min: 100, max: 600 },
  Frequency: { units: "Hz", min: 49, max: 51 },
  Level: { units: "m", min: 2, max: 12 },
  Capacity: { units: "%", min: 80, max: 100 },
};

const SYMBOL_NAMES = [
  "AirFlowVelocity", "AmbientHumidity", "AnalogDeadband", "BearingVibrationA", "BearingVibrationB",
  "BinaryDebounce", "BoilerWaterLevel", "BrakePadWearIndicator", "BusVoltagePhaseA", "BusVoltagePhaseB",
  "BusVoltagePhaseC", "CabinInternalTemp", "ChilledWaterFlow", "CircuitBreakerStatus", "CommTimeout",
  "CompressorDischargePres", "CondenserFanSpeed", "ConveyorBeltSpeed", "CoolantFluidLevel", "CrankcaseOilTemp",
  "DiffPressureFilter", "EmergencyStopLoop", "ExhaustGasOxygen", "ExhaustTemp", "FeederCurrentPhaseA",
  "FeederCurrentPhaseB", "FeederCurrentPhaseC", "FuelControlValvePos", "GearboxOilPressure", "GeneratorFrequency",
  "HydraulicFluidTemp", "InverterCoreTemp", "IsolationValveState", "LeakDetectionSensor", "LubeOilSumpLevel",
  "MainPumpPressure", "MotorStatorTempA", "MotorStatorTempB", "MotorStatorTempC", "OilWaterSeparator",
  "OverloadTripCounter", "PanelDoorInterlock", "PneumaticSupplyPres", "PowerFactorTotal", "ProcessFluidDensity",
  "PumpDischargeValve", "ReactivePowerKVAR", "RefrigerantSuctionPres", "RotorShaftSpeedRPM", "SafetyValveRelief",
  "SilicaAnalyzerValue", "SteamHeaderTemp", "SurgeArresterLeakage", "SystemTimer", "TankLevelVolume",
  "TransformerGasLevel", "TurbineVibrationX", "TurbineVibrationY", "UpsBatteryCapacity", "VacuumSuctionLevel",
  "WaterTurbidityValue"
];

const getProfile = (name: string) => {
  const match = Object.keys(METRIC_PROFILES).find((key) => name.includes(key));
  return match ? METRIC_PROFILES[match] : { units: "mV", min: 10, max: 150 };
};
export const generateLiveMetricsDictionary = (): Record<string, any> => {
  const dictionary: Record<string, any> = {};

  SYMBOL_NAMES.forEach((name) => {
    const profile = getProfile(name);

    const randomValue = Math.floor(Math.random() * (profile.max - profile.min + 1)) + profile.min;

    let systemRange = "normal";
    if (randomValue > profile.max - (profile.max * 0.1)) systemRange = "high";
    if (randomValue < profile.min + (profile.min * 0.1)) systemRange = "low";

    dictionary[name] = {
      stVal: randomValue,
      q: {
        validity: Math.random() > 0.95 ? "questionable" : "good", 
        source: "process",
        test: false,
        operatorBlocked: false,
        detailQual: {
          overflow: false,
          outOfRange: systemRange !== "normal",
          badReference: false,
          oscillatory: false,
          failure: false,
          oldData: false,
          inconsistent: false,
          inaccurate: false
        }
      },
      t: {
        value: new Date().toISOString(), 
        leapSecondsKnown: true,
        clockFailure: false,
        clockNotSynchronized: false,
        timeAccuracy: 10,
        source: "ntp"
      },
      range: systemRange,
      units: profile.units,
      multiplier: 1.0,
      d: `${name} runtime telemetry variable monitor.`
    };
  });

  return dictionary;
};