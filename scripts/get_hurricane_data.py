import tropycal.tracks as tracks
import pandas as pd
import json
from datetime import datetime

def get_hurricane_data():
    # Initialize basin
    basin = tracks.TrackDataset(basin='north_atlantic', source='hurdat')
    
    # Filter for Gulf region
    gulf = basin.filter_storms(
        year_range=(1999,2024),
        domain={
            "south_lat": 15.40,
            "north_lat": 31.46,
            "west_lon": -100.05,
            "east_lon": -63.43
        },
        return_keys=False
    )
    
    # Convert to format needed for visualization
    hurricanes = []
    for storm_id in gulf['stormid'].unique():
        storm_data = gulf[gulf['stormid'] == storm_id]
        
        path = []
        for _, point in storm_data.iterrows():
            path.append({
                'lat': float(point['lat']),
                'lon': float(point['lon']),
                'time': point['time'].strftime('%Y-%m-%d %H:%M:%S'),
                'type': point['type'],
                'wind': int(point['vmax']),
                'pressure': int(point['mslp'])
            })
            
        hurricanes.append({
            'id': storm_id,
            'name': storm_id,
            'year': int(storm_id[4:8]),
            'path': path
        })
    
    print(json.dumps(hurricanes))

if __name__ == "__main__":
    get_hurricane_data() 