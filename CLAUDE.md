# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a single-file React application that implements a Monte Carlo simulation tool for soil sampling data variability analysis. The application is designed for agricultural research, specifically for analyzing soil sampling protocols and understanding data variability through statistical simulation.

## Architecture

**Single Component Application**: The entire application is contained in one React component (`MonteCarloSimulator`) located in `import React, { useState } from 'react';.js` (unusual filename - likely needs renaming).

**Key Features**:
- CSV data input (file upload or manual paste)
- Statistical analysis of input data (mean, std dev, median, min/max)
- Monte Carlo simulation with configurable parameters
- Support for Normal (Gaussian) and Uniform distributions
- Minimum value constraints for realistic soil measurements
- Interactive visualization using Recharts library
- Sample dataset generation and CSV export functionality

**Dependencies**:
- React with hooks (useState)
- Recharts for data visualization (LineChart, BarChart, ResponsiveContainer)
- Tailwind CSS for styling (based on className usage)

## File Structure

The project contains only one JavaScript file with an unusual name that appears to be a React import statement. This suggests the file may need to be renamed to something more conventional like `MonteCarloSimulator.js` or `App.js`.

## Development Notes

**No Build Configuration Found**: This appears to be a standalone React component without standard build tools (no package.json, webpack config, etc.). The application likely requires integration into a larger React project or creation of a proper build setup.

**Simulation Logic**:
- Uses Box-Muller transform for normal distribution generation
- Implements uniform distribution using Math.random()
- Generates 10 complete sample datasets matching input data length
- Creates histogram visualization with 50 bins
- Calculates percentiles (5th, 25th, 50th, 75th, 95th)

**Data Constraints**:
- Limits input to 100 data points maximum
- Supports CSV parsing with comma or newline separation
- Optional minimum value constraint (useful for soil measurements that can't be negative)

## Usage Context

This tool is designed for agricultural researchers working on soil sampling protocols. It helps understand the natural variability in soil measurements and can generate realistic datasets for protocol testing and validation.