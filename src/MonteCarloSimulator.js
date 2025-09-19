import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function MonteCarloSimulator() {
  const [csvData, setCsvData] = useState('');
  const [dataPoints, setDataPoints] = useState([]);
  const [stats, setStats] = useState(null);
  const [numSimulations, setNumSimulations] = useState(10000);
  const [simulationResults, setSimulationResults] = useState(null);
  const [distributionType, setDistributionType] = useState('normal');
  const [minValueConstraint, setMinValueConstraint] = useState(0);
  const [useMinConstraint, setUseMinConstraint] = useState(true);

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const values = [];
    
    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      for (const part of parts) {
        const num = parseFloat(part);
        if (!isNaN(num)) {
          values.push(num);
        }
      }
    }
    
    return values.slice(0, 100); // Limit to 100 points
  };

  const calculateStats = (data) => {
    if (data.length === 0) return null;
    
    const n = data.length;
    const mean = data.reduce((a, b) => a + b, 0) / n;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    const sorted = [...data].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const median = n % 2 === 0 
      ? (sorted[n/2 - 1] + sorted[n/2]) / 2 
      : sorted[Math.floor(n/2)];
    
    return { mean, stdDev, variance, min, max, median, count: n };
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        setCsvData(text);
        const parsed = parseCSV(text);
        setDataPoints(parsed);
        const calculatedStats = calculateStats(parsed);
        setStats(calculatedStats);
        setSimulationResults(null);
      };
      reader.readAsText(file);
    }
  };

  const handleManualInput = () => {
    const parsed = parseCSV(csvData);
    setDataPoints(parsed);
    const calculatedStats = calculateStats(parsed);
    setStats(calculatedStats);
    setSimulationResults(null);
  };

  // Box-Muller transform for normal distribution
  const generateNormal = (mean, stdDev) => {
    let u1 = Math.random();
    let u2 = Math.random();
    let z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  };

  const generateUniform = (min, max) => {
    return Math.random() * (max - min) + min;
  };

  const runSimulation = () => {
    if (!stats) return;

    const results = [];
    const { mean, stdDev, min, max } = stats;
    const inputDataLength = dataPoints.length;

    // Generate all simulations
    for (let i = 0; i < numSimulations; i++) {
      let value;
      if (distributionType === 'normal') {
        value = generateNormal(mean, stdDev);
      } else {
        value = generateUniform(min, max);
      }
      
      // Apply minimum constraint if enabled
      if (useMinConstraint && value < minValueConstraint) {
        value = minValueConstraint;
      }
      
      results.push(value);
    }

    // Generate 10 complete sample datasets
    // Each point maintains its position relationship with the original data
    const sampleDatasets = [];
    for (let i = 0; i < 10; i++) {
      const dataset = [];
      
      // For each original point position, generate a variation
      for (let j = 0; j < inputDataLength; j++) {
        const originalValue = dataPoints[j];  // KEY: Get the original point value
        
        let value;
        if (distributionType === 'normal') {
          // Generate variation around the ORIGINAL POINT VALUE
          value = generateNormal(originalValue, stdDev);
        } else {
          // Vary around the original value within a local range
          const pointRange = max - min;
          const halfRange = pointRange / 4;
          let localMin = originalValue - halfRange;
          let localMax = originalValue + halfRange;
          
          // Ensure local range stays within global bounds
          localMin = Math.max(localMin, min);
          localMax = Math.min(localMax, max);
          
          value = generateUniform(localMin, localMax);
        }
        
        // Apply minimum constraint if enabled
        if (useMinConstraint && value < minValueConstraint) {
          value = minValueConstraint;
        }
        
        dataset.push(value);
      }
      sampleDatasets.push({
        id: i + 1,
        data: dataset,
        stats: calculateStats(dataset)
      });
    }

    // Calculate histogram bins
    const simStats = calculateStats(results);
    const numBins = 50;
    const binSize = (simStats.max - simStats.min) / numBins;
    const bins = Array(numBins).fill(0);
    
    results.forEach(val => {
      const binIndex = Math.min(
        Math.floor((val - simStats.min) / binSize),
        numBins - 1
      );
      bins[binIndex]++;
    });

    const histogramData = bins.map((count, i) => ({
      value: (simStats.min + (i * binSize) + (i + 1) * binSize) / 2,
      count: count,
      frequency: (count / numSimulations * 100).toFixed(2)
    }));

    setSimulationResults({
      raw: results,
      stats: simStats,
      histogram: histogramData,
      sampleDatasets: sampleDatasets,
      percentiles: {
        p5: results.sort((a, b) => a - b)[Math.floor(numSimulations * 0.05)],
        p25: results.sort((a, b) => a - b)[Math.floor(numSimulations * 0.25)],
        p50: results.sort((a, b) => a - b)[Math.floor(numSimulations * 0.50)],
        p75: results.sort((a, b) => a - b)[Math.floor(numSimulations * 0.75)],
        p95: results.sort((a, b) => a - b)[Math.floor(numSimulations * 0.95)]
      }
    });
  };

  const downloadDataset = (dataset, id) => {
    const csv = dataset.data.join(',\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monte_carlo_sample_${id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Monte Carlo Simulation - Data Variability Analysis</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">1. Input Data</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Upload CSV File</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Or Paste CSV Data (comma or newline separated, max 100 points)</label>
          <textarea
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            className="w-full p-2 border rounded h-24"
            placeholder="1.5, 2.3, 1.8, 2.1&#10;or one value per line"
          />
          <button
            onClick={handleManualInput}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Parse Data
          </button>
        </div>

        {dataPoints.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="font-semibold">Parsed {dataPoints.length} data points</p>
            <p className="text-sm text-gray-600 mt-1">
              First 5 values: {dataPoints.slice(0, 5).join(', ')}{dataPoints.length > 5 ? '...' : ''}
            </p>
          </div>
        )}
      </div>

      {stats && (
        <>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">2. Data Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Mean</p>
                <p className="text-lg font-semibold">{stats.mean.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Std Deviation</p>
                <p className="text-lg font-semibold">{stats.stdDev.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Median</p>
                <p className="text-lg font-semibold">{stats.median.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Minimum</p>
                <p className="text-lg font-semibold">{stats.min.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Maximum</p>
                <p className="text-lg font-semibold">{stats.max.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Count</p>
                <p className="text-lg font-semibold">{stats.count}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">3. Simulation Parameters</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Number of Simulations</label>
                <input
                  type="number"
                  value={numSimulations}
                  onChange={(e) => setNumSimulations(parseInt(e.target.value) || 1000)}
                  min="100"
                  max="1000000"
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Distribution Type</label>
                <select
                  value={distributionType}
                  onChange={(e) => setDistributionType(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="normal">Normal (Gaussian)</option>
                  <option value="uniform">Uniform</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="useMinConstraint"
                  checked={useMinConstraint}
                  onChange={(e) => setUseMinConstraint(e.target.checked)}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="useMinConstraint" className="text-sm font-medium">
                  Set Minimum Value Constraint
                </label>
              </div>
              
              {useMinConstraint && (
                <div>
                  <label className="block text-sm font-medium mb-2">Minimum Value (floor)</label>
                  <input
                    type="number"
                    value={minValueConstraint}
                    onChange={(e) => setMinValueConstraint(parseFloat(e.target.value) || 0)}
                    step="0.01"
                    className="w-full p-2 border rounded"
                  />
                </div>
              )}
            </div>

            <button
              onClick={runSimulation}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              Run Monte Carlo Simulation
            </button>
          </div>
        </>
      )}

      {simulationResults && (
        <>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">4. Simulation Results</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Simulated Mean</p>
                <p className="text-lg font-semibold">{simulationResults.stats.mean.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Simulated Std Dev</p>
                <p className="text-lg font-semibold">{simulationResults.stats.stdDev.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Simulated Median</p>
                <p className="text-lg font-semibold">{simulationResults.stats.median.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">5th Percentile</p>
                <p className="text-lg font-semibold">{simulationResults.percentiles.p5.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">95th Percentile</p>
                <p className="text-lg font-semibold">{simulationResults.percentiles.p95.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Range</p>
                <p className="text-lg font-semibold">
                  {(simulationResults.stats.max - simulationResults.stats.min).toFixed(4)}
                </p>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-3">Distribution Histogram</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={simulationResults.histogram}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="value" 
                  tickFormatter={(value) => value.toFixed(2)}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'count' ? value : `${value}%`,
                    name === 'count' ? 'Count' : 'Frequency'
                  ]}
                  labelFormatter={(value) => `Value: ${parseFloat(value).toFixed(2)}`}
                />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">5. Sample Output Datasets</h2>
            <p className="text-sm text-gray-600 mb-4">
              10 complete datasets, each with {dataPoints.length} points (matching your input):
            </p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Dataset #</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Mean</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Std Dev</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Min</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Max</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Preview</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Download</th>
                  </tr>
                </thead>
                <tbody>
                  {simulationResults.sampleDatasets.map((dataset, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-2">Dataset {dataset.id}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                        {dataset.stats.mean.toFixed(4)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                        {dataset.stats.stdDev.toFixed(4)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                        {dataset.stats.min.toFixed(4)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-mono">
                        {dataset.stats.max.toFixed(4)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center text-xs">
                        {dataset.data.slice(0, 3).map(v => v.toFixed(2)).join(', ')}...
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <button
                          onClick={() => downloadDataset(dataset, dataset.id)}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          Download CSV
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}