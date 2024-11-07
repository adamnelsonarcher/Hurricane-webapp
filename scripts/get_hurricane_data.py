import tropycal.tracks as tracks
import pandas as pd
import json
from datetime import datetime
import numpy as np

def get_hurricane_data():
    # Initialize basin
    basin = tracks.TrackDataset(basin='north_atlantic', source='hurdat')
    
    # First, get all storms that intersect our region
    gulf_storms = basin.filter_storms(
        year_range=(1990,2025),  # Updated to include 2024
        domain={
            "south_lat": 16.40,
            "north_lat": 31.66,
            "west_lon": -101.25,
            "east_lon": -72.13
        },
        return_keys=True  # Changed to True to get storm IDs
    )
    
    # Now get complete tracks for these storms
    hurricanes = []
    for storm_id in gulf_storms:
        try:
            storm = basin.get_storm(storm_id)
            
            # Create storm info
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
            
            # Get complete path (not just points in the Gulf)
            path = []
            for i in range(len(storm.time)):
                path.append({
                    'lat': float(storm.lat[i]),
                    'lon': float(storm.lon[i]),
                    'time': storm.time[i].strftime('%Y-%m-%d %H:%M:%S'),
                    'type': str(storm.type[i]),
                    'wind': int(storm.vmax[i]),
                    'pressure': int(storm.mslp[i])
                })
            
            hurricanes.append({
                **storm_info,
                'path': path
            })
            
        except Exception as e:
            print(f"Error processing storm {storm_id}: {e}")
            continue
    
    print(json.dumps(hurricanes))

if __name__ == "__main__":
    get_hurricane_data() 