# Monte Carlo Simulation App

A React-based web application for analyzing soil sampling data variability using Monte Carlo simulation techniques.

## Features

- **CSV Data Input**: Upload files or paste data directly
- **Statistical Analysis**: Automatic calculation of mean, standard deviation, median, min/max
- **Monte Carlo Simulation**: Configurable simulations with normal or uniform distributions
- **Data Visualization**: Interactive charts showing distribution histograms
- **Sample Generation**: Create and download multiple realistic datasets
- **Constraint Support**: Set minimum value constraints for realistic soil measurements

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

```bash
npm start
```

The app will open in your browser at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

## Usage

1. **Input Data**: Upload a CSV file or paste comma/newline-separated values
2. **Review Statistics**: View calculated statistics from your input data
3. **Configure Simulation**: Set number of simulations, distribution type, and constraints
4. **Run Simulation**: Generate Monte Carlo simulation results
5. **Analyze Results**: View histogram and statistical summaries
6. **Download Samples**: Export generated datasets as CSV files

## Technical Details

- Built with React 18 and functional components
- Uses Recharts for data visualization
- Implements Box-Muller transform for normal distribution generation
- Supports up to 100 input data points
- Generates configurable sample datasets

## Deployment

This app is optimized for deployment on Vercel, Netlify, or similar static hosting platforms.