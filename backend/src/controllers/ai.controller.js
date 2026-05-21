import { get } from '../database/sqlite.js';
import { predictRepair, serviceRecommendations } from '../services/ai.service.js';

export async function predict(req, res) {
  res.json(predictRepair(req.body));
}

export async function recommendations(req, res) {
  const vehicle = get('SELECT * FROM vehicles WHERE id = ?', [req.params.vehicleId]);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  const mapped = { odometerKm: vehicle.odometer_km, year: vehicle.year, fuelType: vehicle.fuel_type };
  res.json({ recommendations: serviceRecommendations(mapped), healthScore: predictRepair(mapped).healthScore });
}
