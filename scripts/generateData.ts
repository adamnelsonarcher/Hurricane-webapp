const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Run this script locally to generate the data file
async function generateData() {
  try {
    const dataDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const output = execSync('python scripts/get_hurricane_data.py');
    const data = output.toString();

    fs.writeFileSync(
      path.join(process.cwd(), 'public', 'data', 'hurricanes.json'),
      data
    );
    console.log('Hurricane data generated successfully');
  } catch (error) {
    console.error('Error generating hurricane data:', error);
  }
}

generateData();