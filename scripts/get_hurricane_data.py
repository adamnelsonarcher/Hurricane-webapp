import tropycal.tracks as tracks
import pandas as pd
import json
from datetime import datetime
import numpy as np

def get_hurricane_data():
    # Initialize basin
    basin = tracks.TrackDataset(basin='north_atlantic', source='hurdat')
    
    # Filter for Gulf region
    gulf = basin.filter_storms(
        year_range=(1990,2025),
        domain={
            "south_lat": 16.40,
            "north_lat": 31.66,
            "west_lon": -101.25,
            "east_lon": -72.13
        },
        return_keys=False
    )
    
    hurricanes = []
    for storm_id in gulf['stormid'].unique():
        storm_data = gulf[gulf['stormid'] == storm_id]
        
        try:
            storm = basin.get_storm(storm_id)
            storm_info = {
                'id': storm.id,
                'name': storm.name,
                'year': int(storm.year),
                'ace': float(storm.ace),
                'max_wind': int(max(storm.vmax)),
                'min_pressure': int(min(storm.mslp)),
                'start_time': storm.time[0].strftime('%Y-%m-%d %H:%M:%S'),
                'end_time': storm.time[-1].strftime('%Y-%m-%d %H:%M:%S'),
            }
        except Exception as e:
            print(f"Error processing storm {storm_id}: {e}")
            continue
        
        path = []
        for _, point in storm_data.iterrows():
            path.append({
                'lat': float(point['lat']),
                'lon': float(point['lon']),
                'time': point['time'].strftime('%Y-%m-%d %H:%M:%S'),
                'type': str(point['type']),
                'wind': int(point['vmax']),
                'pressure': int(point['mslp'])
            })
            
        hurricanes.append({
            **storm_info,
            'path': path
        })
    
    print(json.dumps(hurricanes))

if __name__ == "__main__":
    get_hurricane_data() 